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
                    if model.phase == .code || model.phase == .identity {
                        SecureEntryView(code:$model.code,name:$model.name,busy:model.busy,message:model.message) {
                            Task { await model.preflight(); if model.phase == .identity { confirmStart = true } }
                        }
                    } else { statusContent }
                }
            }
        }
        .background(background.ignoresSafeArea()).foregroundStyle(SecureTheme.text).tint(blue).preferredColorScheme(.light)
        .onChange(of:scenePhase) { _, phase in if phase == .active { Task { await model.foreground() } } }
        .confirmationDialog("\(model.title)\n\(model.details)\nDas iPad wird für diese Prüfung gesperrt.", isPresented:$confirmStart, titleVisibility:.visible) {
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
        SecureStatusView(presentation:.init(phase:model.phase,message:model.message,busy:model.busy,pendingSubmission:model.pendingSubmission)) {
            if model.phase == .completed { model.restart() }
            else if model.phase == .recovery || model.phase == .interrupted { Task { await model.startOrRecover() } }
        }
    }
}
