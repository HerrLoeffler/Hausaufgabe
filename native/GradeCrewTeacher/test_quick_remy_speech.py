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
    var partial: ((String, Bool) -> Void)?
    var failed: ((QuickRemySpeechFailure) -> Void)?
    private(set) var stopCalls = 0
    private(set) var cancelCalls = 0
    var deferStart = false
    var deferredStart: CheckedContinuation<Void, Error>?

    init(failure: QuickRemySpeechFailure? = nil) { self.failure = failure }

    func start(onTranscript: @escaping (String, Bool) -> Void,
               onFailure: @escaping (QuickRemySpeechFailure) -> Void) async throws {
        if deferStart {
            try await withCheckedThrowingContinuation { continuation in deferredStart = continuation }
        }
        if let failure { throw failure }
        partial = onTranscript
        failed = onFailure
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

        let service = FakeSpeechService()
        let capture = QuickRemySpeechCapture(service: service)
        await capture.start()
        assert(capture.flow.status == .recording)
        service.emit("Mathematik", final: false)
        await Task.yield()
        assert(capture.flow.transcript == "Mathematik")
        capture.stop()
        assert(capture.flow.status == .transcribing)
        assert(service.stopCalls == 1)
        service.emit("Mathematik Klasse 6: Brüche", final: true)
        await Task.yield()
        assert(capture.flow.status == .transcribed)
        assert(capture.flow.transcript == "Mathematik Klasse 6: Brüche")

        capture.cancel()
        assert(capture.flow.status == .idle)
        assert(capture.flow.transcript.isEmpty)
        assert(service.cancelCalls == 1)

        let emptyService = FakeSpeechService()
        let emptyCapture = QuickRemySpeechCapture(service: emptyService)
        await emptyCapture.start()
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
        assert(deferredService.cancelCalls >= 2)

        let callbackService = FakeSpeechService()
        let callbackCapture = QuickRemySpeechCapture(service: callbackService)
        await callbackCapture.start()
        callbackCapture.cancel()
        callbackService.failed?(.recognitionFailed)
        await Task.yield()
        assert(callbackCapture.flow.status == .idle)
        print("Quick Remy speech state: passed (permissions, local availability, start/stop, empty result, fallback, cancellation)")
    }
}
'''
with tempfile.TemporaryDirectory() as work:
    script = Path(work) / "speech-tests.swift"
    script.write_text(speech_source.read_text() + "\n" + checks)
    binary = Path(work) / "speech-tests"
    subprocess.run(["swiftc", "-parse-as-library", "-module-cache-path", str(Path(work) / "module-cache"), str(script), "-o", str(binary)], check=True)
    subprocess.run([str(binary)], check=True)
