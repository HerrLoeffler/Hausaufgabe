import Combine
import Foundation
#if os(iOS)
import AVFoundation
import Speech
#endif

/// Typed failures let the UI offer a text path without ever switching to remote transcription.
enum QuickRemySpeechFailure: Error, Equatable {
    case permissionDenied
    case recognizerUnavailable
    case onDeviceRecognitionUnavailable
    case recognitionFailed
}

@MainActor
protocol QuickRemySpeechService: AnyObject {
    func start(
        onTranscript: @escaping @MainActor (String, Bool) -> Void,
        onFailure: @escaping @MainActor (QuickRemySpeechFailure) -> Void
    ) async throws
    func stop()
    func cancel()
}

/// Keeps successive utterances without concatenating every partial hypothesis.
/// Timestamps refer to the current Apple recognition request; a new request
/// commits its words before those timestamps start from zero again.
struct QuickRemyTranscriptAccumulator {
    private struct Utterance {
        let text: String
        let start: TimeInterval?
        let end: TimeInterval?
    }
    private var committed = ""
    private var utterances: [Utterance] = []

    var text: String {
        ([committed] + utterances.map(\.text)).filter { !$0.isEmpty }.joined(separator: " ")
    }

    mutating func receive(_ value: String, start: TimeInterval?, end: TimeInterval?) {
        let value = value.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !value.isEmpty else { return }
        let timing: (TimeInterval, TimeInterval)?
        if let start, let end, start.isFinite, end.isFinite, end > start { timing = (start, end) }
        else { timing = nil }
        let incoming = tokens(value)
        let existing = tokens(utterances.map(\.text).joined(separator: " "))
        if let timing {
            // Unknown earlier timestamps must not disable corrections to a
            // later, timed hypothesis. Replace only its overlapping suffix.
            if let overlap = utterances.firstIndex(where: {
                guard let oldStart = $0.start, let oldEnd = $0.end else { return false }
                return abs(oldStart - timing.0) < 0.1 || oldEnd > timing.0 + 0.05
            }) {
                let prefix = tokens(utterances[..<overlap].map(\.text).joined(separator: " "))
                if !prefix.isEmpty && utterances[..<overlap].allSatisfy({ $0.start == nil }) && incoming.starts(with: prefix) {
                    utterances.removeAll() // Cumulative result includes the untimed prefix.
                } else {
                    utterances.removeSubrange(overlap...)
                }
            } else if !existing.isEmpty && utterances.allSatisfy({ $0.start == nil }) && incoming.starts(with: existing) {
                utterances.removeAll()
            } else if let last = utterances.last, last.start == nil, incoming.starts(with: tokens(last.text)) {
                utterances.removeLast()
            }
        } else {
            // Some local partial results have zero or missing timing. Preserve
            // disjoint words; only replace a hypothesis with textual evidence
            // that this is a cumulative result or a correction to its prefix.
            if !existing.isEmpty && incoming.starts(with: existing) {
                utterances.removeAll()
            } else if !incoming.isEmpty && existing.starts(with: incoming) {
                return // A shorter/late partial must not discard heard words.
            } else if strongSharedPrefix(existing, incoming) {
                utterances.removeAll()
            } else if let last = utterances.last, strongSharedPrefix(tokens(last.text), incoming) {
                utterances.removeLast()
            }
        }
        utterances.append(Utterance(text: value, start: timing?.0, end: timing?.1))
    }

    // Timing-free hypotheses are ambiguous. A substantial stable prefix is
    // evidence of a correction; a shared opening word alone is not.
    private func strongSharedPrefix(_ previous: [String], _ incoming: [String]) -> Bool {
        let shared = zip(previous, incoming).prefix(while: { $0.0 == $0.1 }).count
        return shared >= 2 && shared * 2 >= max(previous.count, incoming.count)
    }

    private func tokens(_ text: String) -> [String] {
        text.lowercased().split(whereSeparator: { $0.isWhitespace || $0.isPunctuation }).map(String.init)
    }

    mutating func completeTask() {
        committed = text
        utterances.removeAll()
    }
}

/// The engine stays active across OS task boundaries. Only a deliberate stop
/// finishes the recording. UUIDs isolate canceled task callbacks from new ones.
struct QuickRemyRecognitionSession {
    enum Event: Equatable {
        case ignored
        case progress(String)
        case restart(String)
        case finished(String)
        case failed(String)
    }
    private var words = QuickRemyTranscriptAccumulator()
    private var requestID: UUID?
    private var stopping = false
    private var recoveryAttempts = 0
    var transcript: String { words.text }

    mutating func beginRequest() -> UUID {
        let id = UUID()
        requestID = id
        return id
    }

    mutating func stop() { stopping = true }
    mutating func cancel() { self = QuickRemyRecognitionSession() }

    mutating func receive(task: UUID, text: String, start: TimeInterval?, end: TimeInterval?, final: Bool, failed: Bool) -> Event {
        guard requestID == task else { return .ignored }
        words.receive(text, start: start, end: end)
        guard final || failed else { return .progress(transcript) }
        requestID = nil
        if stopping { return .finished(transcript) }
        words.completeTask()
        if failed && !final {
            guard recoveryAttempts < 2 else { return .failed(transcript) }
            recoveryAttempts += 1
        }
        return .restart(transcript)
    }
}

struct QuickRemySpeechFlow {
    enum Status: Equatable {
        case idle
        case requestingPermission
        case permissionDenied
        case recognizerUnavailable
        case onDeviceRecognitionUnavailable
        case recording
        case transcribing
        case transcribed
        case emptyTranscript
        case failed
    }

    private(set) var status: Status = .idle
    private(set) var transcript = ""

    mutating func begin() {
        transcript = ""
        status = .requestingPermission
    }

    mutating func beginRecording() {
        guard status == .requestingPermission else { return }
        status = .recording
    }

    mutating func stopRecording() {
        guard status == .recording else { return }
        status = .transcribing
    }

    mutating func receiveTranscript(_ value: String, isFinal: Bool) {
        guard status == .requestingPermission || status == .recording || status == .transcribing else { return }
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        // Local recognition can deliver an empty final result after a pause.
        // A task boundary is not the end of the user's recording.
        if !trimmed.isEmpty { transcript = trimmed }
        guard isFinal, status == .transcribing else { return }
        status = transcript.isEmpty ? .emptyTranscript : .transcribed
    }

    mutating func fail(_ failure: QuickRemySpeechFailure) {
        guard status == .requestingPermission || status == .recording || status == .transcribing else { return }
        if failure == .recognitionFailed, !transcript.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            useText(transcript)
            return
        }
        switch failure {
        case .permissionDenied: status = .permissionDenied
        case .recognizerUnavailable: status = .recognizerUnavailable
        case .onDeviceRecognitionUnavailable: status = .onDeviceRecognitionUnavailable
        case .recognitionFailed: status = .failed
        }
    }

    mutating func useText(_ value: String) {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        transcript = trimmed
        status = trimmed.isEmpty ? .emptyTranscript : .transcribed
    }

    mutating func cancel() {
        transcript = ""
        status = .idle
    }
}

@MainActor
final class QuickRemySpeechCapture: ObservableObject {
    @Published private(set) var flow = QuickRemySpeechFlow()

    private let service: any QuickRemySpeechService
    private var startGeneration = 0

    init() {
        self.service = OnDeviceGermanSpeechService()
    }

    init(service: any QuickRemySpeechService) {
        self.service = service
    }

    func start() async {
        guard flow.status == .idle || flow.status == .permissionDenied || flow.status == .recognizerUnavailable ||
                flow.status == .onDeviceRecognitionUnavailable || flow.status == .emptyTranscript || flow.status == .failed ||
                flow.status == .transcribed else { return }
        startGeneration += 1
        let generation = startGeneration
        flow.begin()
        do {
            try await service.start(
                onTranscript: { [weak self] text, isFinal in
                    guard let self, self.startGeneration == generation else { return }
                    self.flow.receiveTranscript(text, isFinal: isFinal)
                },
                onFailure: { [weak self] failure in
                    guard let self, self.startGeneration == generation else { return }
                    self.flow.fail(failure)
                }
            )
            // The service owns cancellation of its startup. A late return must
            // never cancel a newer recording that uses the same service.
            guard startGeneration == generation else { return }
            flow.beginRecording()
        } catch let failure as QuickRemySpeechFailure {
            guard startGeneration == generation else { return }
            flow.fail(failure)
        } catch {
            guard startGeneration == generation else { return }
            flow.fail(.recognitionFailed)
        }
    }

    func stop() {
        guard flow.status == .recording else { return }
        flow.stopRecording()
        service.stop()
        let generation = startGeneration
        Task { @MainActor [weak self] in
            try? await Task.sleep(nanoseconds: 2_000_000_000)
            guard let self, self.startGeneration == generation, self.flow.status == .transcribing else { return }
            self.flow.receiveTranscript(self.flow.transcript, isFinal: true)
            self.service.cancel()
        }
    }

    func useText(_ value: String) {
        startGeneration += 1
        service.cancel()
        flow.useText(value)
    }

    /// Called when the native view disappears, the user logs out, or the account changes.
    func cancel() {
        startGeneration += 1
        service.cancel()
        flow.cancel()
    }
}

/// Uses iOS Speech and AVAudioEngine only. The request explicitly forbids network recognition.
#if os(iOS)
/// The tap runs on an audio thread. Swapping requests under a lock lets us
/// rotate recognition tasks without reinstalling the microphone tap.
private final class QuickRemyAudioRequestRelay: @unchecked Sendable {
    private let lock = NSLock()
    private var request: SFSpeechAudioBufferRecognitionRequest?
    func replace(with request: SFSpeechAudioBufferRecognitionRequest?) {
        lock.lock()
        self.request = request
        lock.unlock()
    }
    func append(_ buffer: AVAudioPCMBuffer) {
        lock.lock()
        request?.append(buffer)
        lock.unlock()
    }
}

@MainActor
final class OnDeviceGermanSpeechService: QuickRemySpeechService {
    private var recognizer: SFSpeechRecognizer?
    private var audioEngine: AVAudioEngine?
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let relay = QuickRemyAudioRequestRelay()
    private var session = QuickRemyRecognitionSession()
    private var inputTapInstalled = false
    private var operationGeneration = 0
    private var onTranscript: (@MainActor (String, Bool) -> Void)?
    private var onFailure: (@MainActor (QuickRemySpeechFailure) -> Void)?

    func start(
        onTranscript: @escaping @MainActor (String, Bool) -> Void,
        onFailure: @escaping @MainActor (QuickRemySpeechFailure) -> Void
    ) async throws {
        cancel()
        let generation = operationGeneration
        let speechAuthorization = await requestSpeechAuthorization()
        guard generation == operationGeneration else { throw CancellationError() }
        guard speechAuthorization == .authorized else { throw QuickRemySpeechFailure.permissionDenied }
        let microphoneAuthorized = await requestMicrophonePermission()
        guard generation == operationGeneration else { throw CancellationError() }
        guard microphoneAuthorized else { throw QuickRemySpeechFailure.permissionDenied }
        guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "de-DE")), recognizer.isAvailable else {
            throw QuickRemySpeechFailure.recognizerUnavailable
        }
        guard recognizer.supportsOnDeviceRecognition else {
            throw QuickRemySpeechFailure.onDeviceRecognitionUnavailable
        }
        self.recognizer = recognizer
        self.onTranscript = onTranscript
        self.onFailure = onFailure
        let audioEngine = AVAudioEngine()
        self.audioEngine = audioEngine
        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.record, mode: .measurement, options: [.duckOthers])
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
            let inputNode = audioEngine.inputNode
            let format = inputNode.outputFormat(forBus: 0)
            guard format.sampleRate > 0, format.channelCount > 0 else { throw QuickRemySpeechFailure.recognitionFailed }
            let relay = self.relay
            inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in relay.append(buffer) }
            inputTapInstalled = true
            beginRecognitionRequest()
            audioEngine.prepare()
            try audioEngine.start()
        } catch {
            cancel()
            throw QuickRemySpeechFailure.recognitionFailed
        }
    }

    private func beginRecognitionRequest() {
        guard let recognizer else { return }
        let id = session.beginRequest()
        recognitionTask?.cancel()
        let request = SFSpeechAudioBufferRecognitionRequest()
        request.shouldReportPartialResults = true
        request.taskHint = .dictation
        request.requiresOnDeviceRecognition = true
        request.contextualStrings = ["Englisch", "Deutsch", "Mathematik", "Klasse", "Aufgaben", "Höraufgaben", "Bilder", "Grundschule", "Mittelschule", "Realschule", "Gymnasium"]
        self.request = request
        relay.replace(with: request)
        recognitionTask = recognizer.recognitionTask(with: request) { [weak self] result, error in
            let text = result?.bestTranscription.formattedString ?? ""
            let segments = result?.bestTranscription.segments ?? []
            let start = segments.first?.timestamp
            let end = segments.last.map { $0.timestamp + $0.duration }
            let final = result?.isFinal ?? false
            let failed = error != nil
            Task { @MainActor [weak self] in
                self?.receive(task: id, text: text, start: start, end: end, final: final, failed: failed)
            }
        }
    }

    private func receive(task: UUID, text: String, start: TimeInterval?, end: TimeInterval?, final: Bool, failed: Bool) {
        switch session.receive(task: task, text: text, start: start, end: end, final: final, failed: failed) {
        case .ignored: return
        case .progress(let transcript): onTranscript?(transcript, false)
        case .restart(let transcript):
            onTranscript?(transcript, false)
            beginRecognitionRequest()
        case .finished(let transcript):
            stopAudioEngine()
            onTranscript?(transcript, true)
        case .failed(let transcript):
            stopAudioEngine()
            onTranscript?(transcript, false)
            onFailure?(.recognitionFailed)
        }
    }

    func stop() {
        session.stop()
        relay.replace(with: nil)
        request?.endAudio()
        stopAudioEngine()
        recognitionTask?.finish()
    }

    func cancel() {
        operationGeneration += 1
        session.cancel()
        relay.replace(with: nil)
        stopAudioEngine()
        recognitionTask?.cancel()
        recognitionTask = nil
        request = nil
        recognizer = nil
        onTranscript = nil
        onFailure = nil
    }

    private func stopAudioEngine() {
        relay.replace(with: nil)
        guard let audioEngine else { return }
        if inputTapInstalled {
            audioEngine.inputNode.removeTap(onBus: 0)
            inputTapInstalled = false
        }
        if audioEngine.isRunning { audioEngine.stop() }
        self.audioEngine = nil
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }

    private func requestSpeechAuthorization() async -> SFSpeechRecognizerAuthorizationStatus {
        await withCheckedContinuation { continuation in
            SFSpeechRecognizer.requestAuthorization { status in continuation.resume(returning: status) }
        }
    }

    private func requestMicrophonePermission() async -> Bool {
        await withCheckedContinuation { continuation in
            AVAudioSession.sharedInstance().requestRecordPermission { granted in continuation.resume(returning: granted) }
        }
    }
}
#else
/// Host-only fallback so state-machine tests can run on macOS without microphone APIs.
@MainActor
final class OnDeviceGermanSpeechService: QuickRemySpeechService {
    func start(
        onTranscript: @escaping @MainActor (String, Bool) -> Void,
        onFailure: @escaping @MainActor (QuickRemySpeechFailure) -> Void
    ) async throws {
        throw QuickRemySpeechFailure.recognitionFailed
    }
    func stop() {}
    func cancel() {}
}
#endif
