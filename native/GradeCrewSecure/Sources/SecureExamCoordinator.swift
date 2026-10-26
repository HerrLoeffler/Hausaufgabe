import SwiftUI
import WebKit

@MainActor
final class SecureExamCoordinator: ObservableObject {
    enum Phase { case code, identity, starting, waiting, active, submitting, verifying, recovery, interrupted, completed }
    @Published private(set) var phase: Phase = .code {
        didSet { if phase != .active { cancelSubmitConfirmation() } }
    }
    @Published private(set) var showingSubmitConfirmation=false
    @Published private(set) var resumeNotice:SecureResumeNotice?
    @Published private(set) var replacementReceipt:SecureReplacementReceipt?
    private var confirmationAttemptID:String?
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
    @Published private(set) var legacyTestWorkBlocked = false
    @Published private(set) var answeredCount:Int?
    let assessment = SecureAssessmentSession()
    weak var webView: WKWebView?
    private let api:SecureAssessmentAPI
    private let store:any SecureAttemptPersistence
    private var deviceControlTimer:Timer?
    private var deviceControlTask:Task<SecureDeviceControlState,Never>?
    private var receiptChecks=0
    private var endingDeviceControl=false
    var deviceExitPending:Bool {work.deviceExit != nil}
    private var identity: SecureAttemptIdentity?
    private var selectedClassroom: SecureClassroomLaunch?
    var personalSelection: Bool { selectedClassroom != nil }
    var canRenewPersonal:Bool {identity?.classroom != nil && replacementReceipt == nil && (phase == .recovery || phase == .interrupted)}
    func renewPersonalSession(_ launch:SecureClassroomLaunch) -> String? {
        guard !busy,canRenewPersonal,let old=identity?.classroom,SecurePupilSessionPolicy.canRenew(original:old,replacement:launch) else{return "Bitte mit dem ursprünglichen Schülercode anmelden und genau denselben Test wählen. Der gespeicherte Versuch bleibt erhalten."}
        let previous=identity;identity?.classroom=launch
        do {try persist();message="Die Schüleranmeldung wurde erneuert. Derselbe gespeicherte Versuch wird fortgesetzt.";return nil}
        catch {identity=previous;return error.localizedDescription}
    }
    func preparePersonal(_ launch: SecureClassroomLaunch) async -> Bool {
        guard identity == nil, !busy, phase == .code || phase == .identity else { return false }
        selectedClassroom=launch;code=launch.quizID;name=launch.displayName;phase = .code
        await preflight();let ready = phase == .identity;if !ready { selectedClassroom=nil };return ready
    }
    private var work = SecureSavedWork()
    private var clock: SecureExamClock?
    private var timer: Timer?
    private var retryTimer: Timer?
    private var serverPollGate = SecureServerPollGate()
    private var polling = false
    private var submitting = false
    private var ticks = 0
    private var retryAttempts = 0
    private var lastMetricAt:TimeInterval = -30
    private var latestCompletedIDs:[String]=[]
    private var operations = SecureOperationGate()
    private struct StaleOperation: Error {}
    private func ensureCurrent(_ generation: UUID, completing: Bool = false) throws {
        guard operations.isCurrent(generation), completing || !operations.completionClaimed else { throw StaleOperation() }
    }

    init(api:SecureAssessmentAPI = SecureAssessmentAPI(),store:any SecureAttemptPersistence = SecureAttemptStore()) {
        self.api=api;self.store=store
        assessment.interrupted = { [weak self] in
            guard let self else { return }
            self.metric("interrupted")
            self.operations.invalidate()
            self.polling = false
            self.submitting = false
            self.busy = false
            self.phase = .interrupted
            self.message = "Der Prüfungsmodus wurde unterbrochen. Bitte die Lehrkraft informieren. Deine gesicherten Antworten bleiben erhalten."
            self.timer?.invalidate()
        }
        do {
            if try store.legacyTestWorkExists() {
                legacyTestWorkBlocked=true;phase = .recovery
                message="Auf diesem Gerät ist noch eine Prüfung aus der Testumgebung 2026 gespeichert. Bitte in TestFlight den bisherigen 2026-Build öffnen und die Abgabe mit Internet abschließen. Danach kannst du diese Schulversion verwenden. Lösche die App nicht; die Antworten bleiben erhalten."
                return
            }
        } catch {
            legacyTestWorkBlocked=true;phase = .recovery
            message="Offene Abgaben aus der Testumgebung konnten nicht sicher geprüft werden. Bitte die Lehrkraft informieren und die App nicht löschen. Gespeicherte Antworten bleiben erhalten."
            return
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
        deviceControlTimer=AssessmentLabTimer.schedule(every:3) { [weak self] in
            Task { @MainActor in _ = await self?.pollDeviceControl() }
        }
    }
    var restoredPresentation:SecureExamPresentation? { work.presentation }
    var pendingSubmission:Bool { work.answers.frozen != nil }
    var savedRevision: Int { work.answers.revision }
    var attemptID: String { identity?.attemptID ?? "pending" }
    var canSubmit: Bool { phase == .active && !busy && !submitting && !storageFailed }
    var timeText: String {
        guard let remaining else { return "Ohne Zeitlimit" }
        return String(format: "%02d:%02d", remaining / 60, remaining % 60)
    }
    func requestSubmitConfirmation() {
        guard canSubmit else { return }
        confirmationAttemptID=attemptID;showingSubmitConfirmation=true
    }
    func hideSubmitConfirmation() { showingSubmitConfirmation=false }
    func cancelSubmitConfirmation() { showingSubmitConfirmation=false;confirmationAttemptID=nil }
    func submitConfirmed() async {
        guard confirmationAttemptID == attemptID,canSubmit else { return }
        cancelSubmitConfirmation();await submit(auto:false)
    }
#if SECURE_LAYOUT_TESTS
    // Test-host-only fixture. No AAC active flag or shipping assessment bypass exists.
    func installLifecycleFixture(expired:Bool,classroom:SecureClassroomLaunch?=nil) {
        operations.invalidate();work=SecureSavedWork()
        identity=SecureAttemptIdentity(code:"AB12CD",name:"Synthetic lifecycle")
        identity?.attemptID="a_"+String(repeating:"1",count:28)
        identity?.classroom=classroom
        paper=["paper":(0..<30).map{["id":"q\($0)","type":"text","text":"Aufgabe \($0+1)","points":1] as [String:Any]},"quiz":["contentLocale":"de-DE"]]
        clock=SecureExamClock(serverNowMillis:1000,deadlineMillis:expired ? 1000 : 999999,receivedUptime:SecureMonotonic.now)
        remaining=clock?.remaining(at:SecureMonotonic.now);phase = .active
    }
    func runLifecycleTick() async { await tick() }
#endif
    func cancelPersonalSelection() { guard identity == nil, !busy else { return };selectedClassroom=nil;phase = .code;code="";name="";message="" }
    func preflight() async {
        guard !legacyTestWorkBlocked else { return }
        guard !busy, let normalized = SecureInputPolicy.code(code) else { message = "Bitte einen gültigen Testcode eingeben."; return }
        let generation = operations.generation
        busy = true; message = ""
        defer { if operations.isCurrent(generation) { busy = false } }
        do {
            let result = try await api.invoke("getAssessmentInfo", data: ["quizId": normalized])
            try ensureCurrent(generation)
            guard ((result["capabilities"] as? [String:Any])?["offlineRecovery"] as? NSNumber)?.intValue == 1 else {
                throw SecureAssessmentAPI.Failure(code:"UPDATE_REQUIRED",message:"Der Prüfungsserver ist für diese Schulversion noch nicht bereit. Bitte die Lehrkraft informieren; es wurde kein Versuch gestartet.")
            }
            guard let quiz = result["quiz"] as? [String: Any] else { throw invalidResponse() }
            code = normalized
            title = quiz["title"] as? String ?? "Test"
            let minutes = quiz["timeLimitMinutes"] as? NSNumber
            details = [quiz["subject"] as? String, (quiz["grade"] as? String).map { "Klasse " + $0 }, minutes.map { "\($0.intValue) Minuten" }].compactMap { $0 }.filter { !$0.isEmpty }.joined(separator: " · ")
            phase = .identity
        } catch { guard operations.isCurrent(generation) else { return }; message = error.localizedDescription }
    }
    func startOrRecover() async {
        guard !legacyTestWorkBlocked else { return }
        // A queued recovery task can run after a receipt has already completed
        // this attempt. It must not recreate an identity or re-enter AAC.
        guard replacementReceipt == nil, !busy, phase == .identity || phase == .recovery || phase == .interrupted else { return }
        let generation = operations.generation
        busy = true; message = ""
        retryTimer?.invalidate(); retryTimer = nil
        defer { if operations.isCurrent(generation) { busy = false } }
        do {
            if identity == nil {
                if let personal=selectedClassroom {
                    let workspace=try await api.invoke("classroomAccess",data:["command":"activity","payload":["sessionToken":personal.sessionToken]])
                    try ensureCurrent(generation)
                    let assignments=workspace["assignments"] as? [[String:Any]] ?? []
                    guard assignments.contains(where:{ ($0["id"] as? String)==personal.assignmentID && ($0["quizId"] as? String)==personal.quizID && ($0["generation"] as? NSNumber)?.intValue==personal.generation && ($0["status"] as? String)=="available" }) else {
                        throw SecureAssessmentAPI.Failure(code:"FAILED_PRECONDITION",message:"Diese Zuweisung wurde geändert oder bereits begonnen. Bitte die Testübersicht aktualisieren.")
                    }
                }
                guard let code = SecureInputPolicy.code(code), !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty, name.count <= 120 else {
                    throw SecureAssessmentAPI.Failure(code: "INVALID_ARGUMENT", message: "Bitte Testcode und Name oder Kürzel prüfen.")
                }
                identity = SecureAttemptIdentity(code: code, name: name.trimmingCharacters(in: .whitespacesAndNewlines))
                identity?.classroom=selectedClassroom
                try persist()
            }
            // Resolve a lost submission response before requesting a new AAC session.
            if identity?.attemptID != nil, try await verifyIfSubmitted() { return }
            if identity?.attemptID != nil, identity?.classroom != nil {
                let control=await pollDeviceControl();try ensureCurrent(generation)
                if control == .held {return}
                if control == .unavailable {throw SecureAssessmentAPI.Failure(code:"DEVICE_CONTROL_UNAVAILABLE",message:"Der Gerätestatus konnte nicht sicher geprüft werden. Bitte die Verbindung herstellen und erneut versuchen. Das Gerät wird nicht erneut gesperrt.")}
            }

            try ensureCurrent(generation)
            if work.answers.frozen != nil {
                await sendFrozenSubmission()
                return
            }
            phase = .starting
            if !assessment.active { try await assessment.begin() }
            try ensureCurrent(generation)
            guard assessment.active else { throw invalidResponse() }
            if work.answers.frozen != nil {
                await sendFrozenSubmission()
            } else {
                let result = try await invokeAttempt()
                try ensureCurrent(generation)
                if try await receiveReplacement(result) { return }
                try await apply(result)
            }
            try ensureCurrent(generation)
            startTimer()
        } catch {
            guard !(error is StaleOperation), operations.isCurrent(generation), !operations.completionClaimed else { return }
            if identity?.attemptID == nil { await assessment.end() }
            guard operations.isCurrent(generation) else { return }
            if (identity?.classroom != nil || selectedClassroom != nil),
               SecurePupilSessionPolicy.discardUnstarted(attemptID:identity?.attemptID,frozen:work.answers.frozen != nil,serverCode:(error as? SecureAssessmentAPI.Failure)?.code ?? "",requestSent:identity?.startRequestSent == true) {
                do { try store.clear();identity=nil;selectedClassroom=nil;work=SecureSavedWork();phase = .code;message=error.localizedDescription;return }
                catch { message=error.localizedDescription;phase = .recovery;return }
            }
            phase = .recovery
            message = error.localizedDescription
            scheduleRetry(after: error)
        }
    }
    // Independent of the exam timer: recovery and interrupted screens need the
    // same authenticated escape route as an active paper.
    @discardableResult func pollDeviceControl() async -> SecureDeviceControlState {
        if let pending=deviceControlTask {return await pending.value}
        let pending=Task {await performDeviceControlPoll()};deviceControlTask=pending
        let result=await pending.value;deviceControlTask=nil;return result
    }
    private func performDeviceControlPoll() async -> SecureDeviceControlState {
        guard replacementReceipt == nil else{return .held}
        guard !operations.completionClaimed,receiptChecks==0,!submitting,phase != .submitting,phase != .verifying else{return .unavailable}
        guard let saved=identity,let id=saved.attemptID,let binding=saved.classroom else{return .clear}
        guard let student=binding.studentID,phase != .completed else{return .unavailable}
        do {
            let result=try await api.invoke("classroomAccess",data:["command":"deviceExitStatus","payload":["quizId":saved.code,"attemptId":id,"attemptToken":saved.token,"build":Bundle.main.object(forInfoDictionaryKey:"CFBundleVersion") as? String ?? "unknown"]])
            guard identity?.clientID==saved.clientID,identity?.attemptID==id else{return .unavailable}
            guard !operations.completionClaimed,receiptChecks==0,!submitting,phase != .submitting,phase != .verifying else{return .unavailable}
            if try await receiveReplacement(result) {work.deviceExit=nil;try persist();return .held}
            guard let value=result["action"] as? [String:Any] else {
                guard result["action"] is NSNull,result["capability"] as? String == "device_exit_v1" else{return .unavailable}
                return deviceExitPending ? .held : .clear
            }
            guard let action=SecureDeviceExitAction.parse(value,quizID:saved.code,attemptID:id,assignmentID:binding.assignmentID,studentID:student,generation:binding.generation) else{throw invalidResponse()}
            if action.state=="resume_allowed" {
                if deviceExitPending {message="Die Lehrkraft hat die Fortsetzung erlaubt. Tippe auf Fortsetzung prüfen; derselbe Versuch und deine Antworten bleiben erhalten."}
                return deviceExitPending ? .held : .clear
            }
            let alreadyHeld=work.deviceExit?.actionId==action.actionId
            work.deviceExit=action
            if !alreadyHeld {
                // Snapshots are continuously durable. Never wait for a hung
                // renderer or replace its last saved answers with an empty set.
                operations.invalidate();busy=false;submitting=false;polling=false
                timer?.invalidate();timer=nil;retryTimer?.invalidate();retryTimer=nil
                paper=nil;webView=nil;phase = .recovery
            }
            do {try persist()} catch {storageFailed=true;storageStatus=error.localizedDescription}
            if action.state=="ended" {message="Die Lehrkraft hat den Prüfungsmodus beendet. Deine bisherigen Antworten bleiben auf diesem Gerät. Warte auf die Freigabe zur Fortsetzung.";return .held}
            message="Die Lehrkraft hat die Gerätefreigabe angefordert. Apple beendet den Prüfungsmodus. Deine gesicherten Antworten bleiben erhalten."
            if !endingDeviceControl {
                endingDeviceControl=true
                Task { [weak self] in
                    guard let self else{return}
                    let appleConfirmed=await self.assessment.endForDeviceControl() // Only didEnd confirms true.
                    guard self.identity?.clientID==saved.clientID,self.work.deviceExit?.actionId==action.actionId else{self.endingDeviceControl=false;return}
                    do {
                        let ack=try await self.api.invoke("classroomAccess",data:["command":"acknowledgeDeviceExit","payload":["quizId":saved.code,"attemptId":id,"attemptToken":saved.token,"actionId":action.actionId,"outcome":appleConfirmed ? "ended":"failed"]])
                        guard self.identity?.clientID==saved.clientID,self.work.deviceExit?.actionId==action.actionId else{self.endingDeviceControl=false;return}
                        if let v=ack["action"] as? [String:Any],let confirmed=SecureDeviceExitAction.parse(v,quizID:saved.code,attemptID:id,assignmentID:binding.assignmentID,studentID:student,generation:binding.generation) {self.work.deviceExit=confirmed;try self.persist()}
                        self.message=appleConfirmed ? "Der Prüfungsmodus ist beendet. Deine Antworten bleiben auf diesem Gerät. Die Lehrkraft muss die Fortsetzung erlauben." : "Apple hat das Ende auf diesem App-Start noch nicht bestätigt. Bitte das Gerät vor Ort mit der Lehrkraft prüfen. Deine Antworten bleiben erhalten."
                    } catch {self.message=appleConfirmed ? "Das Gerät ist freigegeben; die Bestätigung an die Lehrkraft steht noch aus. Stelle die Verbindung wieder her. Deine Antworten bleiben erhalten." : "Apple hat das Ende nicht bestätigt; auch die Rückmeldung an die Lehrkraft ist noch ausstehend. Bitte Verbindung herstellen und das Gerät vor Ort prüfen. Deine Antworten bleiben erhalten."}
                    self.endingDeviceControl=false
                }
            }
            return .held
        } catch {
            if deviceExitPending {message="Die Freigabe zur Fortsetzung konnte nicht geprüft werden. Bitte Verbindung herstellen und die Lehrkraft informieren. Deine Antworten bleiben erhalten."}
            return .unavailable
        }
    }
    func resumeAfterDeviceExit() async {
        guard !busy,!endingDeviceControl,let saved=identity,let held=work.deviceExit,let binding=saved.classroom,let student=binding.studentID,let id=saved.attemptID else{return}
        busy=true;defer{busy=false}
        do {
            let result=try await api.invoke("classroomAccess",data:["command":"deviceExitStatus","payload":["quizId":saved.code,"attemptId":id,"attemptToken":saved.token,"build":Bundle.main.object(forInfoDictionaryKey:"CFBundleVersion") as? String ?? "unknown"]])
            guard identity?.clientID==saved.clientID,work.deviceExit?.actionId==held.actionId else{return}
            guard let v=result["action"] as? [String:Any],let action=SecureDeviceExitAction.parse(v,quizID:saved.code,attemptID:id,assignmentID:binding.assignmentID,studentID:student,generation:binding.generation),action.actionId==held.actionId,action.state=="resume_allowed" else{message="Die Lehrkraft hat die Fortsetzung noch nicht erlaubt.";return}
            work.deviceExit=nil
            do {try persist()} catch {work.deviceExit=held;throw error}
            busy=false;await startOrRecover()
        } catch {message=error.localizedDescription}
    }
    private func receiveNotice(_ result:[String:Any]) {
        guard let binding=identity?.classroom,let action=result["resumeAction"] as? [String:Any] else {resumeNotice=nil;return}
        resumeNotice=SecureResumeNotice.parse(action,generation:binding.generation,serverNow:(result["serverNowMillis"] as? NSNumber)?.doubleValue ?? Date().timeIntervalSince1970*1000)
    }
    func acknowledgeResumeNotice() async {
        guard let notice=resumeNotice,!busy else{return};let current=operations.generation
        do {var data=try authenticatedData();data["stateOnly"]=true;data["acknowledgeResume"]=notice.id
            let result=try await api.invoke("resumeAssessmentAttempt",data:data);try ensureCurrent(current)
            if try await receiveReplacement(result){return};receiveNotice(result)
        } catch {if operations.isCurrent(current){message=error.localizedDescription}}
    }
    private func receiveReplacement(_ result:[String:Any]) async throws -> Bool {
        guard result["status"] as? String == "replaced" else{return false}
        let current=operations.generation
        guard let saved=identity,let binding=saved.classroom,let id=result["attemptId"] as? String,saved.attemptID==nil||saved.attemptID==id,let value=result["replacementReceipt"] as? [String:Any],let receipt=SecureReplacementReceipt.parse(value,quizID:saved.code,attemptID:id,assignmentID:binding.assignmentID,generation:binding.generation) else {throw invalidResponse()}
        // Capture the last renderer state before hiding it. Failure keeps the
        // already durable snapshot; it never substitutes empty answers.
        if phase == .active,let webView,let value=try? await webView.evaluateJavaScript("window.gcFreezeAnswers()"),let snapshot=value as? [String:Any],let answers=snapshot["answers"] as? [String:Any],let revision=snapshot["revision"] as? Int {
            guard self.snapshot(revision:revision,answers:answers) else{throw invalidResponse()}
        }
        try ensureCurrent(current)
        identity?.attemptID=id;try persist();replacementReceipt=receipt;resumeNotice=nil
        timer?.invalidate();timer=nil;retryTimer?.invalidate();retryTimer=nil
        phase = .recovery;message="Die Lehrkraft hat einen neuen Versuch freigegeben. Dein bisheriger Stand bleibt geschützt erhalten. Übernimm den Ersatzversuch ausdrücklich und melde dich danach in deiner Testübersicht an. Die gemeinsame Prüfungszeit wird nicht verlängert."
        return true
    }
    func acceptReplacement() async {
        guard !busy,let receipt=replacementReceipt,let saved=identity else{return};busy=true
        defer{busy=false}
        do {
            try store.archiveReplaced(identity:saved,work:work,receipt:receipt)
            operations.invalidate();await assessment.end()
            identity=nil;selectedClassroom=nil;work=SecureSavedWork();paper=nil;webView=nil;clock=nil;remaining=nil;replacementReceipt=nil;resumeNotice=nil
            storageFailed=false;storageStatus="";code="";name="";title="";phase = .code
            message="Der bisherige Stand wurde geschützt gesichert. Öffne deinen persönlichen Schülerzugang und wähle den neu freigegebenen Versuch."
        } catch {message=error.localizedDescription}
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
        var data: [String:Any] = ["quizId": identity.code, "studentName": identity.name, "clientAttemptId": identity.clientID, "attemptToken": identity.token]
        identity.classroom?.startFields.forEach { data[$0.key]=$0.value }
        let previouslyUnconfirmed = identity.startRequestSent == true
        self.identity?.startRequestSent=true
        try persist()
        do { return try await api.invoke("startAssessmentAttempt", data: data) }
        catch let error as SecureAssessmentAPI.Failure {
            if !previouslyUnconfirmed, SecurePupilSessionPolicy.discardUnstarted(attemptID:nil,frozen:false,serverCode:error.code) { self.identity?.startRequestSent=false;try persist() }
            throw error
        }
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
        receiveNotice(result)
        work.response = try JSONSerialization.data(withJSONObject: result)
        try persist()
        if result["status"] as? String == "ready" {
            phase = .waiting
            message = "Warte auf die Lehrkraft. Der Test startet automatisch nach ihrer Freigabe."
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
        metric("started")
        message = ""
        storageStatus = "Antworten werden auf diesem Gerät gesichert."
        if remaining == 0 { await submit(auto: true) }
    }
    @discardableResult
    func snapshot(revision: Int, answers: [String: Any], presentation:SecureExamPresentation? = nil, completedQuestionIDs:[String]? = nil) -> Bool {
        guard phase == .active || phase == .submitting else { return false }
        do {
            let bytes = try JSONSerialization.data(withJSONObject: answers)
            guard bytes.count <= 850_000 else { throw invalidResponse() }
            if work.answers.accept(revision: revision, answers: bytes) {
                let ids=Set(((paper?["paper"] as? [[String:Any]]) ?? []).compactMap{$0["id"] as? String})
                work.updatePresentation(presentation,allowedIDs:ids)
                if let completedQuestionIDs, Set(completedQuestionIDs).count==completedQuestionIDs.count, Set(completedQuestionIDs).isSubset(of:ids) {
                    answeredCount=completedQuestionIDs.count
                    latestCompletedIDs=completedQuestionIDs
                }
                try persist()
                storageFailed = false
                storageStatus = "Auf diesem Gerät gesichert"
                if SecureMonotonic.now-lastMetricAt>=30 { lastMetricAt=SecureMonotonic.now;metric("progress") }
            }
            return !storageFailed
        } catch { if !storageFailed { metric("storage_error") };storageFailed = true; storageStatus = "Nicht gesichert · " + error.localizedDescription; return false }
    }
    var restoredAnswers: [String: Any] { (try? JSONSerialization.jsonObject(with: work.answers.answers)) as? [String: Any] ?? [:] }
    func submit(auto: Bool) async {
        guard !submitting, phase == .active else { return }
        let generation = operations.generation
        submitting = true
        metric("submit_requested",auto:auto)
        phase = .submitting
        message = auto ? "Zeit abgelaufen. Deine Antworten werden abgegeben …" : "Deine Antworten werden abgegeben …"
        defer { if operations.isCurrent(generation) { submitting = false } }
        do {
            if let webView {
                do {
                    let value = try await webView.evaluateJavaScript("window.gcFreezeAnswers()")
                    try ensureCurrent(generation)
                    guard let snapshot = value as? [String: Any], let answers = snapshot["answers"] as? [String: Any], let revision = snapshot["revision"] as? Int else { throw invalidResponse() }
                    guard self.snapshot(revision:revision,answers:answers,presentation:(snapshot["touchedQuestionIDs"] as? [String]).map{SecureExamPresentation(touchedQuestionIDs:$0)},completedQuestionIDs:snapshot["completedQuestionIDs"] as? [String]) else { throw invalidResponse() }
                } catch {
                    try ensureCurrent(generation)
                    // A dead renderer cannot replace durable answers with an empty snapshot.
                    let saved = try store.work()
                    guard saved.response != nil else { throw invalidResponse() }
                    work = saved
                    work.recoveryReason = "last_saved_snapshot"
                }
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
        var durable = false
        do {
            try ensureCurrent(generation)
            phase = .submitting
            guard let bytes = work.answers.frozen, let answers = try JSONSerialization.jsonObject(with: bytes) as? [String: Any] else { throw invalidResponse() }
            try persist()
            guard let savedIdentity = try store.identity(), savedIdentity.clientID == identity?.clientID,
                  try store.work().answers.frozen == bytes else { throw invalidResponse() }
            durable = true
            var data = try authenticatedData()
            data["recoverySubmission"] = true
            if let reason=work.recoveryReason { data["recoveryReason"]=reason }
            data["answers"] = answers
            data["autoSubmitted"] = work.autoSubmitted
            let result = try await api.invoke("submitAssessmentAttempt", data: data)
            try ensureCurrent(generation)
            if try await receiveReplacement(result) { return }
            phase = .verifying
            message = "Abgabe wird unabhängig beim Server bestätigt …"
            guard try await verifyIfSubmitted() else { throw invalidResponse() }
        } catch {
            guard !(error is StaleOperation), operations.isCurrent(generation), !operations.completionClaimed else { return }
            phase = .recovery
            if durable {
                paper = nil
                await assessment.end()
                guard operations.isCurrent(generation), !operations.completionClaimed else { return }
                message = "Antworten auf diesem Gerät gesichert · Übertragung ausstehend. Das Gerät ist freigegeben. Bitte die App bei bestehender Verbindung erneut öffnen. " + error.localizedDescription
            } else {
                message = "Die lokale Abgabe konnte nicht sicher gespeichert werden. Bitte die Lehrkraft informieren. " + error.localizedDescription
            }
            scheduleRetry(after: error)
        }
    }
    private func verifyIfSubmitted() async throws -> Bool {
        receiptChecks+=1;defer{receiptChecks-=1}
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
        metric("receipt_confirmed")
        paper = nil
        message = "Abgabe bestätigt. Apple gibt das Gerät frei …"
        timer?.invalidate(); timer = nil
        retryTimer?.invalidate(); retryTimer = nil
        await assessment.end()
        try ensureCurrent(generation, completing: true)
        guard identity?.attemptID == id, phase != .interrupted else { throw StaleOperation() }
        let completedClassroom=identity?.classroom
        var pupilLogoutProblem:String?
        do { try store.clear() }
        catch {
            operations.abandonCompletion(generation)
            phase = .recovery
            throw error
        }
        metric("released")
        operations.invalidate()
        busy = false; submitting = false; polling = false
        #if GRADECREW_STAGING
        if completedClassroom?.deviceMode == "shared" {
            do { try SecurePupilKeychain.clear() } catch { pupilLogoutProblem=error.localizedDescription }
            if let token=completedClassroom?.sessionToken { Task { _ = try? await api.invoke("classroomAccess",data:["command":"logout","payload":["sessionToken":token]]) } }
        }
        #endif
        identity = nil
        retryAttempts = 0
        work = SecureSavedWork()
        answeredCount=nil
        phase = .completed
        message = "Deine Abgabe ist gespeichert. Das Gerät ist wieder freigegeben."
        if let pupilLogoutProblem { message += " Der Schülerzugang ist auf diesem Gerät gesperrt; bitte den Code erneut eingeben. " + pupilLogoutProblem }
        return true
    }
    private func scheduleRetry(after error: Error) {
        guard work.answers.frozen != nil, (error as? SecureAssessmentAPI.Failure)?.retryable == true else { return }
        guard retryAttempts < 10 else { return }
        retryAttempts += 1
        retryTimer?.invalidate()
        let delay = min(60.0, 5.0 * pow(2.0, Double(min(retryAttempts - 1, 4))))
        retryTimer = AssessmentLabTimer.schedule(every: delay) { [weak self] in
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
        guard !polling, serverPollGate.shouldPoll(at: SecureMonotonic.now, waiting: phase == .waiting) else { return }
        let generation = operations.generation
        polling = true
        defer { if operations.isCurrent(generation) { polling = false } }
        do {
            if phase == .waiting {
                let result = try await invokeAttempt()
                try ensureCurrent(generation)
                if try await receiveReplacement(result) { return }
                try await apply(result)
            } else {
                var data = try authenticatedData()
                data["stateOnly"] = true
                let result = try await api.invoke("resumeAssessmentAttempt", data: data)
                try ensureCurrent(generation)
                if try await receiveReplacement(result) { return }
                receiveNotice(result)
                if result["status"] as? String == "submitted" { _ = try await verifyIfSubmitted() }
                else if (result["quiz"] as? [String: Any])?["ended"] as? Bool == true { await submit(auto: true) }
                else { message = "" }
            }
        } catch let error as SecureAssessmentAPI.Failure {
            guard operations.isCurrent(generation), !operations.completionClaimed else { return }
            if error.retryable { message = "Verbindung unterbrochen · Antworten bleiben auf diesem Gerät."; if ticks % 120 == 0 { metric("connection_error") } }
            else { await submit(auto: true) }
        } catch {
            guard !(error is StaleOperation), operations.isCurrent(generation), !operations.completionClaimed else { return }
            message = error.localizedDescription
        }
    }
    func rendererRestarted() { metric("recovered") }
    private func metric(_ kind:String,auto:Bool?=nil) {
#if !SECURE_LAYOUT_TESTS
        SecureTelemetry.shared.record(identity:identity,kind:kind,completed:latestCompletedIDs,touched:work.presentation?.touchedQuestionIDs,auto:auto,revision:work.answers.revision)
#endif
    }
    private func persist() throws {
        guard let identity else { throw invalidResponse() }
        try store.save(identity: identity, work: work)
    }
    func restart() {
        guard phase == .completed else { return }
        operations.invalidate()
        timer?.invalidate();timer=nil
        retryTimer?.invalidate();retryTimer=nil
        busy=false;submitting=false;polling=false
        webView=nil;paper=nil;clock=nil
        details="";storageStatus="";storageFailed=false;ticks=0
        latestCompletedIDs=[];lastMetricAt = -30
        selectedClassroom=nil;resumeNotice=nil;replacementReceipt=nil
        phase = .code; code = ""; name = ""; title = ""; message = ""; remaining = nil
    }
    func backToCode() { if phase == .identity { phase = .code; message = "" } }
    private func invalidResponse() -> SecureAssessmentAPI.Failure {
        .init(code: "INVALID_RESPONSE", message: "Der Prüfungsstand konnte nicht eindeutig bestätigt werden. Bitte die Lehrkraft informieren.")
    }
}
