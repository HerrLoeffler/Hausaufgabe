import Foundation
import AutomaticAssessmentConfiguration

/// Build-time safety gate for the real iPad lockdown.
///
/// Keep `automaticAssessmentConfigurationEnabled` false until Apple has approved
/// the AAC entitlement AND the matching signing/provisioning profile is active.
enum GradeCrewSecureBuild {
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
    /// intentionally disabled, the callback fires immediately so the normal
    /// TestFlight/Staging flow stays fully usable.
    func begin(onActivated: @escaping () -> Void, onFailed: @escaping (String) -> Void) {
        failureMessage = nil
        interrupted = false
        didActivate = onActivated
        didFail = onFailed

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

    /// Called only after GradeCrew has confirmed a successful submission.
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

        if interrupted {
            phase = .failed
            status = failureMessage ?? "Prüfungsmodus wurde unterbrochen."
        } else if failureMessage != nil {
            phase = .failed
            status = failureMessage ?? "Prüfungsmodus beendet."
        } else {
            phase = .finished
            status = "Apple hat den Prüfungsmodus beendet."
        }

        let callback = didFinish
        didFinish = nil
        didActivate = nil
        callback?()
    }
}
