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
        onTranscript: @escaping (String, Bool) -> Void,
        onFailure: @escaping (QuickRemySpeechFailure) -> Void
    ) async throws
    func stop()
    func cancel()
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
        status = .recording
    }

    mutating func stopRecording() {
        guard status == .recording else { return }
        status = .transcribing
    }

    mutating func receiveTranscript(_ value: String, isFinal: Bool) {
        guard status == .recording || status == .transcribing else { return }
        transcript = value
        guard isFinal else { return }
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        transcript = trimmed
        status = trimmed.isEmpty ? .emptyTranscript : .transcribed
    }

    mutating func fail(_ failure: QuickRemySpeechFailure) {
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
                    Task { @MainActor in
                        guard let self, self.startGeneration == generation else { return }
                        self.flow.receiveTranscript(text, isFinal: isFinal)
                    }
                },
                onFailure: { [weak self] failure in
                    Task { @MainActor in
                        guard let self, self.startGeneration == generation else { return }
                        self.flow.fail(failure)
                    }
                }
            )
            guard startGeneration == generation else {
                service.cancel()
                return
            }
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
    }

    func useText(_ value: String) {
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
@MainActor
final class OnDeviceGermanSpeechService: QuickRemySpeechService {
    private var recognizer: SFSpeechRecognizer?
    private var audioEngine: AVAudioEngine?
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private var inputTapInstalled = false
    private var operationGeneration = 0

    func start(
        onTranscript: @escaping (String, Bool) -> Void,
        onFailure: @escaping (QuickRemySpeechFailure) -> Void
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

        let audioSession = AVAudioSession.sharedInstance()
        try audioSession.setCategory(.record, mode: .measurement, options: [.duckOthers])
        try audioSession.setActive(true, options: .notifyOthersOnDeactivation)

        let audioEngine = AVAudioEngine()
        let request = SFSpeechAudioBufferRecognitionRequest()
        request.shouldReportPartialResults = true
        request.taskHint = .dictation
        request.requiresOnDeviceRecognition = true

        let inputNode = audioEngine.inputNode
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: inputNode.outputFormat(forBus: 0)) { buffer, _ in
            request.append(buffer)
        }
        inputTapInstalled = true
        self.recognizer = recognizer
        self.audioEngine = audioEngine
        self.request = request
        recognitionTask = recognizer.recognitionTask(with: request) { [weak self] result, error in
            if let result {
                onTranscript(result.bestTranscription.formattedString, result.isFinal)
                if result.isFinal {
                    Task { @MainActor [weak self] in self?.stopAudioEngine() }
                }
            }
            if error != nil && result?.isFinal != true {
                onFailure(.recognitionFailed)
                Task { @MainActor [weak self] in self?.stopAudioEngine() }
            }
        }

        audioEngine.prepare()
        do {
            try audioEngine.start()
        } catch {
            cancel()
            throw QuickRemySpeechFailure.recognitionFailed
        }
    }

    func stop() {
        request?.endAudio()
        stopAudioEngine()
        recognitionTask?.finish()
    }

    func cancel() {
        operationGeneration += 1
        stopAudioEngine()
        recognitionTask?.cancel()
        recognitionTask = nil
        request = nil
        recognizer = nil
    }

    private func stopAudioEngine() {
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
        onTranscript: @escaping (String, Bool) -> Void,
        onFailure: @escaping (QuickRemySpeechFailure) -> Void
    ) async throws {
        throw QuickRemySpeechFailure.recognitionFailed
    }
    func stop() {}
    func cancel() {}
}
#endif
