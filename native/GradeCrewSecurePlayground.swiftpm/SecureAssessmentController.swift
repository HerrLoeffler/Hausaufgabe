import Foundation
import AutomaticAssessmentConfiguration

/// Build-time safety gates for GradeCrew Secure.
///
/// Keep BOTH switches false in distributed builds until their prerequisites are
/// fulfilled. The backend can be piloted before AAC, but production lockdown may
/// only be enabled after Apple approved the entitlement and signing contains it.
enum GradeCrewSecureBuild {
    static let secureBackendEnabled = false
    static let automaticAssessmentConfigurationEnabled = false
}

/// Owns the complete AAC lifecycle. The assessment content must only become
/// visible after `assessmentSessionDidBegin`, and the app must wait for
/// `assessmentSessionDidEnd` before considering the device unlocked again.
final class SecureAssessmentController: NSObject, ObservableObject, AEAssessmentSessionDelegate {
    enum Phase: Equatable {
        case idle
        case starting
        case active
        case ending
        case finished
        case failed
    }

    @Published private(set) var phase: Phase = .idle
    @Published private(set) var status = "Prüfungsmodus ist noch nicht aktiv."
    @Published private(set) var failureMessage: String?

    private var session: AEAssessmentSession?
    private var interrupted = false
    private var didActivate: (() -> Void)?
    private var didFinish: (() -> Void)?
    private var didFail: ((String) -> Void)?

    var lockdownEnabled: Bool {
        GradeCrewSecureBuild.automaticAssessmentConfigurationEnabled
    }

    var mayLeaveExam: Bool {
        !lockdownEnabled || session == nil || phase == .finished || phase == .failed
    }

    /// Starts the Apple assessment session. In development builds where AAC is
    /// intentionally disabled, the callback fires immediately so backend flow
    /// can be tested without pretending that a real device lock is active.
    func begin(onActivated: @escaping () -> Void, onFailed: @escaping (String) -> Void) {
        failureMessage = nil
        interrupted = false
        didActivate = onActivated
        didFail = onFailed
        didFinish = nil

        guard lockdownEnabled else {
            phase = .active
            status = "Entwicklungsmodus: AAC ist vorbereitet, aber noch deaktiviert."
            onActivated()
            return
        }

        guard session == nil else { return }
        phase = .starting
        status = "Apple aktiviert den Prüfungsmodus …"

        let next = AEAssessmentSession(configuration: AEAssessmentConfiguration())
        session = next // Retain for the complete asynchronous lifecycle.
        next.delegate = self
        next.begin()
    }

    /// Called only after GradeCrew has independently verified a successful
    /// server receipt. A WebView-only success signal must never call this directly.
    func endAfterConfirmedSubmission(onEnded: @escaping () -> Void) {
        didFinish = onEnded

        guard lockdownEnabled else {
            phase = .finished
            status = "Abgabe gespeichert."
            onEnded()
            return
        }

        guard let session else {
            phase = .finished
            status = "Abgabe gespeichert. Prüfungsmodus war bereits beendet."
            onEnded()
            return
        }

        guard phase == .active || phase == .starting else { return }
        phase = .ending
        status = "Abgabe gespeichert. Apple beendet den Prüfungsmodus …"
        session.end()
    }

    /// Safety path for an unavailable/invalid test after AAC has begun.
    func abort(reason: String, onEnded: @escaping () -> Void) {
        didFinish = onEnded

        guard lockdownEnabled else {
            phase = .failed
            status = reason
            failureMessage = reason
            onEnded()
            return
        }

        guard let session else {
            phase = .failed
            status = reason
            failureMessage = reason
            onEnded()
            return
        }

        phase = .ending
        status = "Prüfung konnte nicht geöffnet werden. Prüfungsmodus wird beendet …"
        failureMessage = reason
        session.end()
    }

    func assessmentSessionDidBegin(_ session: AEAssessmentSession) {
        guard self.session === session else { return }
        guard phase == .starting else {
            session.end()
            return
        }

        phase = .active
        status = "Prüfungsmodus aktiv."
        let callback = didActivate
        didActivate = nil
        callback?()
    }

    func assessmentSession(_ session: AEAssessmentSession, failedToBeginWithError error: Error) {
        guard self.session === session else { return }
        self.session = nil
        phase = .failed

        let code = (error as NSError).code
        let message = "Prüfungsmodus konnte nicht gestartet werden. AAC-Freigabe, Signing und Gerät prüfen. Apple-Code: \(code)."
        status = message
        failureMessage = message

        let callback = didFail
        didFail = nil
        didActivate = nil
        didFinish = nil
        callback?(message)
    }

    func assessmentSession(_ session: AEAssessmentSession, wasInterruptedWithError error: Error) {
        guard self.session === session else { return }
        interrupted = true
        phase = .ending
        status = "Prüfungsmodus wurde unterbrochen. Die Prüfung wird sofort verborgen und der Modus beendet."
        failureMessage = "Der Prüfungsmodus wurde vom System unterbrochen. Bitte die Lehrkraft informieren."
        session.end() // Apple's interruption lifecycle requires an explicit end().
    }

    func assessmentSessionDidEnd(_ session: AEAssessmentSession) {
        guard self.session === session else { return }
        self.session = nil
        didActivate = nil

        if interrupted {
            phase = .failed
            let message = failureMessage ?? "Prüfungsmodus wurde unterbrochen."
            status = message
            let callback = didFail
            didFail = nil
            didFinish = nil
            callback?(message)
            return
        }

        if failureMessage != nil {
            phase = .failed
            status = failureMessage ?? "Prüfungsmodus beendet."
        } else {
            phase = .finished
            status = "Apple hat den Prüfungsmodus beendet."
        }

        let callback = didFinish
        didFinish = nil
        didFail = nil
        callback?()
    }
}
