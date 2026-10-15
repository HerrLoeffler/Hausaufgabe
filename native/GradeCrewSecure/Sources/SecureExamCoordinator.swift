import SwiftUI
import WebKit

@MainActor
final class SecureExamCoordinator: ObservableObject {
    enum Phase { case code, identity, starting, waiting, active, submitting, verifying, recovery, interrupted, completed }
    @Published private(set) var phase: Phase = .code
    @Published var code = ""
    @Published var name = ""
    @Published private(set) var title = ""
    @Published private(set) var details = ""
    @Published private(set) var message = ""
    @Published private(set) var storageStatus = ""
    @Published private(set) var remaining: Int?
    @Published private(set) var paper: [String: Any]?
    @Published private(set) var busy = false
    @Published private(set) var storageFailed = false
    let assessment = SecureAssessmentSession()
    weak var webView: WKWebView?
    private let api = SecureAssessmentAPI()
    private let store = SecureAttemptStore()
    private var identity: SecureAttemptIdentity?
    private var work = SecureSavedWork()
    private var clock: SecureExamClock?
    private var timer: Timer?
    private var retryTimer: Timer?
    private var polling = false
    private var submitting = false
    private var ticks = 0
    private var operations = SecureOperationGate()
    private struct StaleOperation: Error {}
    private func ensureCurrent(_ generation: UUID, completing: Bool = false) throws {
        guard operations.isCurrent(generation), completing || !operations.completionClaimed else { throw StaleOperation() }
    }

    init() {
        assessment.interrupted = { [weak self] in
            guard let self else { return }
            self.operations.invalidate()
            self.polling = false
            self.submitting = false
            self.busy = false
            self.phase = .interrupted
            self.message = "Der Prüfungsmodus wurde unterbrochen. Bitte die Lehrkraft informieren. Deine gesicherten Antworten bleiben erhalten."
            self.timer?.invalidate()
        }
        do {
            if let saved = try store.identity() {
                identity = saved
                work = try store.work()
                code = saved.code
                name = saved.name
                phase = .recovery
                message = "Ein gespeicherter Prüfungsversuch ist vorhanden. Stelle die Verbindung her und setze denselben Versuch fort."
            }
        } catch { phase = .recovery; message = error.localizedDescription }
    }
    var savedRevision: Int { work.answers.revision }
    var attemptID: String { identity?.attemptID ?? "pending" }
    var canSubmit: Bool { phase == .active && !busy && !submitting && !storageFailed }
    var timeText: String {
        guard let remaining else { return "Ohne Zeitlimit" }
        return String(format: "%02d:%02d", remaining / 60, remaining % 60)
    }
    func preflight() async {
        guard !busy, let normalized = SecureInputPolicy.code(code) else { message = "Bitte einen gültigen Testcode eingeben."; return }
        let generation = operations.generation
        busy = true; message = ""
        defer { if operations.isCurrent(generation) { busy = false } }
        do {
            let result = try await api.invoke("getAssessmentInfo", data: ["quizId": normalized])
            try ensureCurrent(generation)
            guard let quiz = result["quiz"] as? [String: Any] else { throw invalidResponse() }
            code = normalized
            title = quiz["title"] as? String ?? "Test"
            let minutes = quiz["timeLimitMinutes"] as? NSNumber
            details = [quiz["subject"] as? String, (quiz["grade"] as? String).map { "Klasse " + $0 }, minutes.map { "\($0.intValue) Minuten" }].compactMap { $0 }.filter { !$0.isEmpty }.joined(separator: " · ")
            phase = .identity
        } catch { guard operations.isCurrent(generation) else { return }; message = error.localizedDescription }
    }
    func startOrRecover() async {
        guard !busy else { return }
        let generation = operations.generation
        busy = true; message = ""
        retryTimer?.invalidate(); retryTimer = nil
        defer { if operations.isCurrent(generation) { busy = false } }
        do {
            if identity == nil {
                guard let code = SecureInputPolicy.code(code), !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty, name.count <= 120 else {
                    throw SecureAssessmentAPI.Failure(code: "INVALID_ARGUMENT", message: "Bitte Testcode und Name oder Kürzel prüfen.")
                }
                identity = SecureAttemptIdentity(code: code, name: name.trimmingCharacters(in: .whitespacesAndNewlines))
                try persist()
            }
            // Resolve a lost submission response before requesting a new AAC session.
            if identity?.attemptID != nil, try await verifyIfSubmitted() { return }
            try ensureCurrent(generation)
            phase = .starting
            if !assessment.active { try await assessment.begin() }
            try ensureCurrent(generation)
            guard assessment.active else { throw invalidResponse() }
            if work.answers.frozen != nil {
                await sendFrozenSubmission()
            } else {
                let result = try await invokeAttempt()
                try ensureCurrent(generation)
                try await apply(result)
            }
            try ensureCurrent(generation)
            startTimer()
        } catch {
            guard !(error is StaleOperation), operations.isCurrent(generation), !operations.completionClaimed else { return }
            if identity?.attemptID == nil { await assessment.end() }
            guard operations.isCurrent(generation) else { return }
            phase = .recovery
            message = error.localizedDescription
            scheduleRetry(after: error)
        }
    }
    private func authenticatedData() throws -> [String: Any] {
        guard let identity else { throw invalidResponse() }
        var data: [String: Any] = ["quizId": identity.code, "attemptToken": identity.token]
        if let id = identity.attemptID { data["attemptId"] = id }
        return data
    }
    private func invokeAttempt() async throws -> [String: Any] {
        guard let identity else { throw invalidResponse() }
        if identity.attemptID != nil { return try await api.invoke("resumeAssessmentAttempt", data: authenticatedData()) }
        return try await api.invoke("startAssessmentAttempt", data: ["quizId": identity.code, "studentName": identity.name, "clientAttemptId": identity.clientID, "attemptToken": identity.token])
    }
    private func apply(_ result: [String: Any]) async throws {
        guard assessment.active else { throw invalidResponse() }
        guard let id = result["attemptId"] as? String,
              identity?.attemptID == nil || identity?.attemptID == id else { throw invalidResponse() }
        identity?.attemptID = id
        if result["status"] as? String == "submitted" {
            guard try await verifyIfSubmitted() else { throw invalidResponse() }
            return
        }
        work.response = try JSONSerialization.data(withJSONObject: result)
        try persist()
        if result["status"] as? String == "ready" {
            phase = .waiting
            message = "Du bist bereit. Die Lehrkraft startet den Test."
            return
        }
        guard result["status"] as? String == "running",
              let questions = result["paper"] as? [[String: Any]], !questions.isEmpty,
              let serverNow = result["serverNowMillis"] as? NSNumber else { throw invalidResponse() }
        let quiz = result["quiz"] as? [String: Any] ?? [:]
        title = quiz["title"] as? String ?? "Test"
        clock = SecureExamClock(serverNowMillis: serverNow.doubleValue,
                                deadlineMillis: (result["deadlineAtMillis"] as? NSNumber)?.doubleValue,
                                receivedUptime: SecureMonotonic.now)
        remaining = clock?.remaining(at: SecureMonotonic.now)
        paper = result
        phase = .active
        message = ""
        storageStatus = "Antworten werden auf diesem iPad gesichert."
        if remaining == 0 { await submit(auto: true) }
    }
    @discardableResult
    func snapshot(revision: Int, answers: [String: Any]) -> Bool {
        guard phase == .active || phase == .submitting else { return false }
        do {
            let bytes = try JSONSerialization.data(withJSONObject: answers)
            guard bytes.count <= 850_000 else { throw invalidResponse() }
            if work.answers.accept(revision: revision, answers: bytes) {
                try persist()
                storageFailed = false
                storageStatus = "Auf diesem iPad gesichert"
            }
            return !storageFailed
        } catch { storageFailed = true; storageStatus = "Nicht gesichert · " + error.localizedDescription; return false }
    }
    var restoredAnswers: [String: Any] { (try? JSONSerialization.jsonObject(with: work.answers.answers)) as? [String: Any] ?? [:] }
    func submit(auto: Bool) async {
        guard !submitting, phase == .active else { return }
        let generation = operations.generation
        submitting = true
        phase = .submitting
        message = auto ? "Zeit abgelaufen. Deine Antworten werden abgegeben …" : "Deine Antworten werden abgegeben …"
        defer { if operations.isCurrent(generation) { submitting = false } }
        do {
            if let webView {
                let value = try await webView.evaluateJavaScript("window.gcFreezeAnswers()")
                try ensureCurrent(generation)
                guard let snapshot = value as? [String: Any], let answers = snapshot["answers"] as? [String: Any], let revision = snapshot["revision"] as? Int else { throw invalidResponse() }
                guard self.snapshot(revision: revision, answers: answers) else { throw invalidResponse() }
            }
            _ = work.answers.freeze()
            work.autoSubmitted = auto
            try persist()
            await sendFrozenSubmission()
        } catch {
            guard !(error is StaleOperation), operations.isCurrent(generation), !operations.completionClaimed else { return }
            phase = .recovery; message = error.localizedDescription
        }
    }
    private func sendFrozenSubmission() async {
        let generation = operations.generation
        do {
            try ensureCurrent(generation)
            phase = .submitting
            guard let bytes = work.answers.frozen, let answers = try JSONSerialization.jsonObject(with: bytes) as? [String: Any] else { throw invalidResponse() }
            var data = try authenticatedData()
            data["answers"] = answers
            data["autoSubmitted"] = work.autoSubmitted
            _ = try await api.invoke("submitAssessmentAttempt", data: data)
            try ensureCurrent(generation)
            phase = .verifying
            message = "Abgabe wird unabhängig beim Server bestätigt …"
            guard try await verifyIfSubmitted() else { throw invalidResponse() }
        } catch {
            guard !(error is StaleOperation), operations.isCurrent(generation), !operations.completionClaimed else { return }
            phase = .recovery
            message = error.localizedDescription + " Deine Antworten bleiben gesichert. Abgabe erneut prüfen."
            scheduleRetry(after: error)
        }
    }
    private func verifyIfSubmitted() async throws -> Bool {
        guard let id = identity?.attemptID else { return false }
        let generation = operations.generation
        if operations.completionClaimed { return true }
        let result: [String: Any]
        do { result = try await api.invoke("getAssessmentReceipt", data: authenticatedData()) }
        catch let error as SecureAssessmentAPI.Failure where error.code == "FAILED_PRECONDITION" {
            try ensureCurrent(generation)
            return false
        }
        guard operations.isCurrent(generation), identity?.attemptID == id else { throw StaleOperation() }
        if operations.completionClaimed { return true }
        guard let receipt = result["receipt"] as? [String: Any], SecureReceiptPolicy.accepts(receipt, attemptID: id) else { throw invalidResponse() }
        guard operations.claimCompletion(generation) else { throw StaleOperation() }
        phase = .verifying
        paper = nil
        message = "Abgabe bestätigt. Apple gibt das iPad frei …"
        timer?.invalidate(); timer = nil
        retryTimer?.invalidate(); retryTimer = nil
        await assessment.end()
        try ensureCurrent(generation, completing: true)
        guard identity?.attemptID == id, phase != .interrupted else { throw StaleOperation() }
        do { try store.clear() }
        catch {
            operations.abandonCompletion(generation)
            phase = .recovery
            throw error
        }
        operations.invalidate()
        busy = false; submitting = false; polling = false
        identity = nil
        work = SecureSavedWork()
        phase = .completed
        message = "Deine Abgabe ist gespeichert. Das iPad ist wieder freigegeben."
        return true
    }
    private func scheduleRetry(after error: Error) {
        guard work.answers.frozen != nil, (error as? SecureAssessmentAPI.Failure)?.retryable == true else { return }
        retryTimer?.invalidate()
        retryTimer = AssessmentLabTimer.schedule(every: 5) { [weak self] in
            Task { @MainActor in
                guard let self, self.phase == .recovery, !self.busy, !self.submitting else { return }
                await self.startOrRecover()
            }
        }
    }
    func foreground() async {
        if phase == .active { await tick() }
        else if phase == .recovery && work.answers.frozen != nil { await startOrRecover() }
    }
    private func startTimer() {
        guard phase == .active || phase == .waiting else { return }
        timer?.invalidate()
        timer = AssessmentLabTimer.schedule(every: 0.25) { [weak self] in
            Task { @MainActor in await self?.tick() }
        }
    }
    private func tick() async {
        guard phase == .active || phase == .waiting else { return }
        if phase == .active {
            remaining = clock?.remaining(at: SecureMonotonic.now)
            if remaining == 0 { await submit(auto: true); return }
        }
        ticks += 1
        guard ticks % 20 == 0, !polling else { return }
        let generation = operations.generation
        polling = true
        defer { if operations.isCurrent(generation) { polling = false } }
        do {
            if phase == .waiting {
                let result = try await invokeAttempt()
                try ensureCurrent(generation)
                try await apply(result)
            } else {
                var data = try authenticatedData()
                data["stateOnly"] = true
                let result = try await api.invoke("resumeAssessmentAttempt", data: data)
                try ensureCurrent(generation)
                if result["status"] as? String == "submitted" { _ = try await verifyIfSubmitted() }
                else if (result["quiz"] as? [String: Any])?["ended"] as? Bool == true { await submit(auto: true) }
                else { message = "" }
            }
        } catch let error as SecureAssessmentAPI.Failure {
            guard operations.isCurrent(generation), !operations.completionClaimed else { return }
            if error.retryable { message = "Verbindung unterbrochen · Antworten bleiben auf diesem iPad." }
            else { await submit(auto: true) }
        } catch {
            guard !(error is StaleOperation), operations.isCurrent(generation), !operations.completionClaimed else { return }
            message = error.localizedDescription
        }
    }
    private func persist() throws {
        guard let identity else { throw invalidResponse() }
        try store.save(identity: identity, work: work)
    }
    func restart() {
        guard phase == .completed else { return }
        operations.invalidate()
        phase = .code; code = ""; name = ""; title = ""; message = ""; remaining = nil
    }
    func backToCode() { if phase == .identity { phase = .code; message = "" } }
    private func invalidResponse() -> SecureAssessmentAPI.Failure {
        .init(code: "INVALID_RESPONSE", message: "Der Prüfungsstand konnte nicht eindeutig bestätigt werden. Bitte die Lehrkraft informieren.")
    }
}
