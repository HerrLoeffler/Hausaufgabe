import SwiftUI

struct SecureStagingRootView: View {
    @StateObject private var model = SecureExamCoordinator()
    var body: some View { SecureStagingScreen(model: model, assessment: model.assessment) }
}
struct SecureStagingScreen: View {
    @ObservedObject var model: SecureExamCoordinator
    @ObservedObject var assessment: SecureAssessmentSession
    @Environment(\.scenePhase) private var scenePhase
    @State private var confirmStart = false
    @State private var showPupilAccess = false
    private let blue = SecureTheme.brand
    private let background = SecureTheme.canvas

    var body: some View {
        VStack(spacing:0) {
            if let payload = model.paper, assessment.active {
                SecureExamFrame(header:SecureExamHeader(title:model.title,participant:model.name,remaining:model.remaining),
                                footer:model.phase == .active ? SecureExamFooter(storageStatus:model.storageStatus,warning:model.message.isEmpty ? nil : model.message,canSubmit:model.canSubmit,onSubmit:{ model.requestSubmitConfirmation() }) : nil) {
                    ZStack {
                        SecureExamWebView(payload:payload,answers:model.restoredAnswers,revision:model.savedRevision,coordinator:model).id(model.attemptID)
                        if model.phase != .active {
                            background.ignoresSafeArea()
                            ScrollView { statusContent.padding(16).frame(maxWidth:560) }
                        }
                    }
                }
            } else {
                SecureWelcomeFrame(entry:model.phase == .code || model.phase == .identity) {
                    #if GRADECREW_STAGING
                    Text("TESTUMGEBUNG 2026").font(.caption.bold()).foregroundStyle(SecureTheme.secondaryText)
                    #endif
                    if model.phase == .code || model.phase == .identity {
                        #if GRADECREW_STAGING
                        Button("Persönlicher Schülerzugang – Meine Tests") { model.cancelPersonalSelection();showPupilAccess=true }.buttonStyle(.borderedProminent)
                        #endif
                        if model.personalSelection {
                            VStack(spacing:16) {
                                Text(model.name).font(.headline)
                                Text(model.title).font(.title2.bold())
                                Text("Du bist mit deinem persönlichen Schülerzugang angemeldet.")
                                Button("Diesen Test starten") { confirmStart=true }.buttonStyle(.borderedProminent)
                                Button("Andere zugewiesene Tests") { model.cancelPersonalSelection();showPupilAccess=true }
                            }
                        } else {
                        SecureEntryView(code:$model.code,name:$model.name,busy:model.busy,message:model.message) {
                            Task { await model.preflight(); if model.phase == .identity { confirmStart = true } }
                        }
                        }
                    } else { statusContent }
                }
            }
        }
        .background(background.ignoresSafeArea()).foregroundStyle(SecureTheme.text).tint(blue).preferredColorScheme(.light)
        #if GRADECREW_STAGING
        .sheet(isPresented:$showPupilAccess) { SecurePupilAccessView(renewing:model.canRenewPersonal) { launch in
            if model.canRenewPersonal {
                let problem=model.renewPersonalSession(launch)
                if problem == nil {showPupilAccess=false;Task {await model.startOrRecover()}}
                return problem
            }
            if await model.preparePersonal(launch) { showPupilAccess=false;confirmStart=true;return nil }
            return model.message.isEmpty ? "Bitte zuerst den gespeicherten Versuch fortsetzen." : model.message
        } }
        .onOpenURL { url in if url.scheme=="gradecrew-secure",url.host=="student",model.phase == .code { showPupilAccess=true } }
        #endif
        .alert("Hinweis der Lehrkraft",isPresented:Binding(get:{model.resumeNotice != nil},set:{_ in})) {
            Button("Hinweis gelesen") {Task {await model.acknowledgeResumeNotice()}}
        } message: {Text("Bitte prüfe deinen Prüfungsstand. Deine Antworten bleiben erhalten; die gemeinsame Prüfungszeit läuft weiter.")}
        .onChange(of:scenePhase) { _, phase in if phase == .active { Task { await model.foreground() } } }
        .confirmationDialog("\(model.title)\n\(model.details)\nDas Gerät wird für diese Prüfung gesperrt.", isPresented:$confirmStart, titleVisibility:.visible) {
            Button("Prüfungsmodus starten") { Task { await model.startOrRecover() } }
            Button("Abbrechen",role:.cancel) {}
        }
        .confirmationDialog(SecureSubmissionSummary.title(total:(model.paper?["paper"] as? [[String:Any]])?.count ?? 0,completed:model.answeredCount), isPresented:Binding(get:{model.showingSubmitConfirmation},set:{if !$0 {model.hideSubmitConfirmation()}}), titleVisibility:.visible) {
            Button("Jetzt abgeben") {
                Task { await model.submitConfirmed() }
            }
            Button("Weiterarbeiten",role:.cancel) { model.cancelSubmitConfirmation() }
        }
    }
    private var statusContent:some View {
        VStack(spacing:16) {
        if model.replacementReceipt != nil {
            Text(model.message).fixedSize(horizontal:false,vertical:true)
            Button("Ersatzversuch übernehmen") {Task {await model.acceptReplacement()}}.buttonStyle(.borderedProminent).disabled(model.busy)
        } else {
        SecureStatusView(presentation:.init(phase:model.phase,message:model.message,busy:model.busy,pendingSubmission:model.pendingSubmission)) {
            if model.phase == .completed { model.restart() }
            else if model.phase == .recovery || model.phase == .interrupted { Task { await model.startOrRecover() } }
        }
        .id(model.phase)
        #if GRADECREW_STAGING
        if model.canRenewPersonal {Button("Persönlichen Schülerzugang erneuern") {showPupilAccess=true}.buttonStyle(.bordered)}
        #endif
        }
        }
    }
}
