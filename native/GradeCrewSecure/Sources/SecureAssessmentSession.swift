import SwiftUI
import AutomaticAssessmentConfiguration

/// Apple documents main-thread delegate delivery. Retain each session through DidEnd.
@MainActor
final class SecureAssessmentSession: NSObject, ObservableObject, @preconcurrency AEAssessmentSessionDelegate {
    @Published private(set) var active = false
    @Published private(set) var ending = false
    var interrupted: (() -> Void)?
    private var session: AEAssessmentSession?
    private var startContinuation: CheckedContinuation<Void, Error>?
    private var endContinuations: [CheckedContinuation<Void, Never>] = []
    private var deviceEndContinuations:[CheckedContinuation<Bool,Never>]=[]
    private var appleEndConfirmed=false
    private var timeout: Timer?

    func begin() async throws {
        #if targetEnvironment(simulator)
        throw SecureAssessmentAPI.Failure(code: "SIMULATOR", message: "Echte Prüfungen benötigen ein echtes iPhone oder iPad. Im Simulator wird keine Sperre vorgetäuscht.")
        #else
        guard session == nil else { throw SecureAssessmentAPI.Failure(code: "AAC_BUSY", message: "Der vorherige Prüfungsmodus wird noch beendet.") }
        try await withCheckedThrowingContinuation { continuation in
            startContinuation = continuation
            ending = false
            appleEndConfirmed=false
            let next = AEAssessmentSession(configuration: AEAssessmentConfiguration())
            session = next
            next.delegate = self
            timeout = AssessmentLabTimer.schedule(every: 15) { [weak self] in
                Task { @MainActor in
                    guard let self, self.startContinuation != nil else { return }
                    self.failStart("Apple hat den Prüfungsstart nicht rechtzeitig bestätigt.")
                    self.ending = true
                    self.session?.end()
                }
            }
            next.begin()
        }
        #endif
    }
    func end() async {
        active = false
        guard let session else { return }
        await withCheckedContinuation { continuation in
            endContinuations.append(continuation)
            if !ending { ending = true; session.end() }
        }
    }
    func endForDeviceControl() async -> Bool {
        active=false
        guard let session else{return appleEndConfirmed}
        return await withCheckedContinuation { continuation in
            deviceEndContinuations.append(continuation)
            if !ending {ending=true;session.end()}
        }
    }
    private func failStart(_ message: String) {
        timeout?.invalidate(); timeout = nil
        let continuation = startContinuation
        startContinuation = nil
        continuation?.resume(throwing: SecureAssessmentAPI.Failure(code: "AAC_START", message: message))
    }
    func assessmentSessionDidBegin(_ session: AEAssessmentSession) {
        guard self.session === session else { return }
        guard !ending, let continuation = startContinuation else { session.end(); return }
        timeout?.invalidate(); timeout = nil
        startContinuation = nil
        active = true
        continuation.resume()
    }
    func assessmentSession(_ session: AEAssessmentSession, failedToBeginWithError error: Error) {
        guard self.session === session else { return }
        failStart("Prüfungsmodus nicht gestartet. Apple-Code: \((error as NSError).code). Bitte die Lehrkraft informieren.")
        self.session = nil
        active = false
        ending = false
        finishDeviceEnd(false)
        finishEnd()
    }
    func assessmentSession(_ session: AEAssessmentSession, wasInterruptedWithError error: Error) {
        guard self.session === session else { return }
        active = false
        ending = true
        interrupted?() // Native UI hides the paper before returning to Apple.
        failStart("Der Prüfungsmodus wurde unterbrochen.")
        session.end()
    }
    func assessmentSessionDidEnd(_ session: AEAssessmentSession) {
        guard self.session === session else { return }
        let unexpected = !ending
        active = false
        self.session = nil
        ending = false
        failStart("Prüfungsmodus wurde vor dem Start beendet.")
        if unexpected { interrupted?() }
        appleEndConfirmed=true
        finishDeviceEnd(true)
        finishEnd()
    }
    private func finishDeviceEnd(_ confirmed:Bool) {
        let waiting=deviceEndContinuations;deviceEndContinuations=[]
        waiting.forEach{$0.resume(returning:confirmed)}
    }
    private func finishEnd() {
        let continuations = endContinuations
        endContinuations = []
        continuations.forEach { $0.resume() }
    }
}
