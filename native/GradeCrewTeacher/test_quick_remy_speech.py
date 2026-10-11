"""Run the Quick Remy speech state machine with an injected non-recording service."""
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).parent
speech_source = root / "Sources/QuickRemySpeechCapture.swift"
assert speech_source.is_file(), "Quick Remy local speech capture is not implemented yet."
checks = r'''
@MainActor
final class FakeSpeechService: QuickRemySpeechService {
    var failure: QuickRemySpeechFailure?
    var partial: (@MainActor (String, Bool) -> Void)?
    var failed: (@MainActor (QuickRemySpeechFailure) -> Void)?
    private(set) var stopCalls = 0
    private(set) var cancelCalls = 0
    var earlyTranscript: String?
    var earlyFailure: QuickRemySpeechFailure?
    var deferStart = false
    var deferredStart: CheckedContinuation<Void, Error>?

    init(failure: QuickRemySpeechFailure? = nil) { self.failure = failure }

    func start(onTranscript: @escaping @MainActor (String, Bool) -> Void,
               onFailure: @escaping @MainActor (QuickRemySpeechFailure) -> Void) async throws {
        if deferStart {
            try await withCheckedThrowingContinuation { continuation in deferredStart = continuation }
        }
        if let failure { throw failure }
        partial = onTranscript
        failed = onFailure
        if let earlyTranscript { onTranscript(earlyTranscript, false); await Task.yield() }
        if let earlyFailure { onFailure(earlyFailure); await Task.yield() }
    }
    func stop() { stopCalls += 1 }
    func cancel() { cancelCalls += 1 }
    func emit(_ text: String, final: Bool) { partial?(text, final) }
    func completeStart() { deferredStart?.resume(); deferredStart = nil }
}

@main
struct QuickRemySpeechTests {
    @MainActor
    static func main() async {
        // Real speech results replace the current hypothesis; after a pause,
        // iOS can instead return only the next utterance or an empty final.
        var words = QuickRemyTranscriptAccumulator()
        words.receive("Vierte Klasse", start: 0, end: 1)
        words.receive("Vierte Klasse Englisch", start: 0, end: 2)
        words.receive("", start: nil, end: nil)
        assert(words.text == "Vierte Klasse Englisch")
        words.receive("Farben und Schul Sachen", start: 5, end: 7)
        words.receive("Farben und Schulsachen", start: 5, end: 7)
        assert(words.text == "Vierte Klasse Englisch Farben und Schulsachen", "A pause must append the next utterance while allowing corrections within it")
        words.receive("Vierte Klasse Englisch Farben und Schulsachen", start: 0, end: 7)
        assert(words.text == "Vierte Klasse Englisch Farben und Schulsachen", "A cumulative result must not duplicate previously saved utterances")
        words.completeTask()
        words.receive("fünf Aufgaben", start: 0, end: 1)
        assert(words.text == "Vierte Klasse Englisch Farben und Schulsachen fünf Aufgaben", "A new recognition task resets timestamps, not the user's transcript")

        var missingTiming = QuickRemyTranscriptAccumulator()
        missingTiming.receive("Englisch Klasse vier", start: 0, end: 2)
        missingTiming.receive("fünf Aufgaben", start: nil, end: nil)
        assert(missingTiming.text == "Englisch Klasse vier fünf Aufgaben", "Missing timing alone must not erase earlier words")
        missingTiming.receive("Englisch Klasse vier fünf Aufgaben", start: 0, end: 0)
        assert(missingTiming.text == "Englisch Klasse vier fünf Aufgaben", "Untimed cumulative hypotheses must not duplicate prior speech")
        missingTiming.receive("zwei Bilder", start: 8, end: 9)
        assert(missingTiming.text == "Englisch Klasse vier fünf Aufgaben zwei Bilder")
        var untimed = QuickRemyTranscriptAccumulator()
        untimed.receive("Farben", start: nil, end: nil)
        untimed.receive("Farben und Schul Sachen", start: nil, end: nil)
        untimed.receive("Farben und Schulsachen", start: nil, end: nil)
        assert(untimed.text == "Farben und Schulsachen", "A corrected untimed partial must replace its hypothesis")

        var repeatedPrefix = QuickRemyTranscriptAccumulator()
        repeatedPrefix.receive("Ich brauche Englisch für Klasse vier", start: nil, end: nil)
        repeatedPrefix.receive("Ich brauche fünf Aufgaben", start: 5, end: 7)
        assert(repeatedPrefix.text == "Ich brauche Englisch für Klasse vier Ich brauche fünf Aufgaben", "A shared opening word is not proof of a correction")
        var cumulativeCorrection = QuickRemyTranscriptAccumulator()
        cumulativeCorrection.receive("Englisch Klasse vier", start: 0, end: 2)
        cumulativeCorrection.receive("fünf Aufgaben", start: 5, end: 7)
        cumulativeCorrection.receive("Englisch Klasse vier sechs Aufgaben", start: 0, end: 0)
        assert(cumulativeCorrection.text == "Englisch Klasse vier sechs Aufgaben", "A strong cumulative prefix must update the hypothesis instead of duplicating it")

        var mixedTiming = QuickRemyTranscriptAccumulator()
        mixedTiming.receive("Englisch Klasse vier", start: nil, end: nil)
        mixedTiming.receive("fünf", start: 5, end: 6)
        mixedTiming.receive("fünf Aufgaben", start: 5, end: 7)
        assert(mixedTiming.text == "Englisch Klasse vier fünf Aufgaben", "An untimed prefix must not disable correction of a timed suffix")
        mixedTiming.receive("Englisch Klasse vier fünf Aufgaben", start: 0, end: 7)
        assert(mixedTiming.text == "Englisch Klasse vier fünf Aufgaben", "Cumulative timing must also cover an untimed prefix without duplication")

        var timedRepetition = QuickRemyTranscriptAccumulator()
        timedRepetition.receive("Ich brauche Englisch", start: 0, end: 2)
        timedRepetition.receive("Ich", start: 5, end: 5.5)
        timedRepetition.receive("Ich brauche Englisch und fünf Aufgaben", start: 5, end: 7)
        assert(timedRepetition.text == "Ich brauche Englisch Ich brauche Englisch und fünf Aufgaben", "Timing takes precedence over a repeated sentence prefix")
        var timedNewSentence = QuickRemyTranscriptAccumulator()
        timedNewSentence.receive("Englisch", start: 0, end: 2)
        timedNewSentence.receive("Englisch für Klasse vier", start: 5, end: 7)
        assert(timedNewSentence.text == "Englisch Englisch für Klasse vier", "A new timed span is not a cumulative correction even if its text repeats the first span")

        var session = QuickRemyRecognitionSession()
        let first = session.beginRequest()
        assert(session.receive(task: first, text: "Englisch Klasse vier", start: 0, end: 2, final: false, failed: false) == .progress("Englisch Klasse vier"))
        assert(session.receive(task: first, text: "", start: nil, end: nil, final: true, failed: false) == .restart("Englisch Klasse vier"))
        let second = session.beginRequest()
        assert(session.receive(task: first, text: "stale", start: nil, end: nil, final: true, failed: true) == .ignored, "Old callbacks must not end the next audio task")
        assert(session.receive(task: second, text: "fünf Aufgaben", start: 0, end: 1, final: false, failed: false) == .progress("Englisch Klasse vier fünf Aufgaben"))
        session.stop()
        assert(session.receive(task: second, text: "", start: nil, end: nil, final: true, failed: false) == .finished("Englisch Klasse vier fünf Aufgaben"))
        assert(session.receive(task: second, text: "", start: nil, end: nil, final: false, failed: true) == .ignored)
        session.cancel()
        assert(session.transcript.isEmpty)

        var recover = QuickRemyRecognitionSession()
        for attempt in 0..<3 {
            let task = recover.beginRequest()
            let event = recover.receive(task: task, text: attempt == 0 ? "Mathe" : "", start: nil, end: nil, final: false, failed: true)
            assert(event == (attempt < 2 ? .restart("Mathe") : .failed("Mathe")), "Automatic recovery must be bounded and retain all words")
        }

        let cases: [(QuickRemySpeechFailure, QuickRemySpeechFlow.Status)] = [
            (.permissionDenied, .permissionDenied),
            (.recognizerUnavailable, .recognizerUnavailable),
            (.onDeviceRecognitionUnavailable, .onDeviceRecognitionUnavailable),
            (.recognitionFailed, .failed)
        ]
        for (failure, expected) in cases {
            let capture = QuickRemySpeechCapture(service: FakeSpeechService(failure: failure))
            await capture.start()
            assert(capture.flow.status == expected)
            assert(capture.flow.transcript.isEmpty)
        }

        let earlyService = FakeSpeechService()
        earlyService.earlyTranscript = "Vierte Klasse Englisch Farben"
        let earlyCapture = QuickRemySpeechCapture(service: earlyService)
        await earlyCapture.start()
        assert(earlyCapture.flow.transcript == "Vierte Klasse Englisch Farben", "Words delivered during startup must survive the first attempt")
        earlyCapture.cancel()
        earlyService.earlyFailure = .recognitionFailed
        await earlyCapture.start()
        assert(earlyCapture.flow.status == .transcribed, "Startup must not overwrite usable words followed by an early error")
        assert(earlyCapture.flow.transcript == "Vierte Klasse Englisch Farben")
        earlyCapture.cancel()

        let service = FakeSpeechService()
        let capture = QuickRemySpeechCapture(service: service)
        await capture.start()
        assert(capture.flow.status == .recording)
        service.emit("Mathematik", final: false)
        await Task.yield()
        assert(capture.flow.transcript == "Mathematik")
        service.emit("Mathematik", final: true)
        await Task.yield()
        assert(capture.flow.status == .recording, "An OS result boundary must not submit or end the user's recording")
        capture.stop()
        assert(capture.flow.status == .transcribing)
        assert(service.stopCalls == 1)
        service.emit("Mathematik Klasse 6: Brüche", final: true)
        await Task.yield()
        assert(capture.flow.status == .transcribed)
        assert(capture.flow.transcript == "Mathematik Klasse 6: Brüche")

        // iOS may end recognition with an error after already producing words.
        let recoveryService = FakeSpeechService()
        let recoveryCapture = QuickRemySpeechCapture(service: recoveryService)
        await recoveryCapture.start()
        recoveryService.emit("Vierte Klasse Englisch Farben und Schulsachen", final: false)
        await Task.yield()
        recoveryCapture.stop()
        recoveryService.failed?(.recognitionFailed)
        await Task.yield()
        assert(recoveryCapture.flow.status == .transcribed, "A final recognition error must preserve captured words")
        assert(recoveryCapture.flow.transcript == "Vierte Klasse Englisch Farben und Schulsachen")

        let blankFinalService = FakeSpeechService()
        let blankFinalCapture = QuickRemySpeechCapture(service: blankFinalService)
        await blankFinalCapture.start()
        blankFinalService.emit("Deutsch achte Klasse Wortarten fünf Aufgaben", final: false)
        await Task.yield()
        blankFinalCapture.stop()
        blankFinalService.emit("", final: true)
        await Task.yield()
        assert(blankFinalCapture.flow.status == .transcribed, "An empty final result after a pause must not erase already heard words")
        assert(blankFinalCapture.flow.transcript == "Deutsch achte Klasse Wortarten fünf Aufgaben")

        capture.cancel()
        assert(capture.flow.status == .idle)
        assert(capture.flow.transcript.isEmpty)
        assert(service.cancelCalls == 1)

        let emptyService = FakeSpeechService()
        let emptyCapture = QuickRemySpeechCapture(service: emptyService)
        await emptyCapture.start()
        emptyService.emit("   ", final: true)
        await Task.yield()
        assert(emptyCapture.flow.status == .recording)
        emptyCapture.stop()
        emptyService.emit("   ", final: true)
        await Task.yield()
        assert(emptyCapture.flow.status == .emptyTranscript)
        emptyCapture.useText("   Mathe, Klasse 6, Brüche   ")
        assert(emptyCapture.flow.status == .transcribed)
        assert(emptyCapture.flow.transcript == "Mathe, Klasse 6, Brüche")
        emptyCapture.cancel() // Same cleanup path used by view dismissal and account change.
        assert(emptyCapture.flow.transcript.isEmpty)

        let deferredService = FakeSpeechService()
        deferredService.deferStart = true
        let deferredCapture = QuickRemySpeechCapture(service: deferredService)
        let startTask = Task { await deferredCapture.start() }
        await Task.yield()
        deferredCapture.cancel()
        deferredService.completeStart()
        await startTask.value
        assert(deferredCapture.flow.status == .idle)
        assert(deferredCapture.flow.transcript.isEmpty)
        assert(deferredService.cancelCalls >= 1)

        let callbackService = FakeSpeechService()
        let callbackCapture = QuickRemySpeechCapture(service: callbackService)
        await callbackCapture.start()
        callbackCapture.cancel()
        callbackService.failed?(.recognitionFailed)
        await Task.yield()
        assert(callbackCapture.flow.status == .idle)
        let timeoutService = FakeSpeechService()
        let timeoutCapture = QuickRemySpeechCapture(service: timeoutService)
        await timeoutCapture.start()
        timeoutService.emit("Englisch Farben", final: false)
        timeoutCapture.stop()
        try? await Task.sleep(nanoseconds: 2_100_000_000)
        assert(timeoutCapture.flow.status == .transcribed, "Stopping must finish with heard words even if Apple never sends a final callback")
        assert(timeoutCapture.flow.transcript == "Englisch Farben")
        let lateTranscript = timeoutService.partial
        timeoutCapture.useText("Deutsch")
        lateTranscript?("stale English", true)
        assert(timeoutCapture.flow.transcript == "Deutsch", "A callback after typed input must not replace it")

        print("Quick Remy speech state: passed (first startup, pause segments, cumulative corrections, empty finals, bounded recovery, stale callbacks, stop fallback, cancellation)")
    }
}
'''
with tempfile.TemporaryDirectory() as work:
    script = Path(work) / "speech-tests.swift"
    script.write_text(speech_source.read_text() + "\n" + checks)
    binary = Path(work) / "speech-tests"
    subprocess.run(["swiftc", "-parse-as-library", "-module-cache-path", str(Path(work) / "module-cache"), str(script), "-o", str(binary)], check=True)
    subprocess.run([str(binary)], check=True)
