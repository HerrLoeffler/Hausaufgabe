import SwiftUI

struct SecureStagingRootView: View {
    @StateObject private var model = SecureExamCoordinator()
    var body: some View { SecureStagingScreen(model: model, assessment: model.assessment) }
}
private struct SecureStagingScreen: View {
    @ObservedObject var model: SecureExamCoordinator
    @ObservedObject var assessment: SecureAssessmentSession
    @Environment(\.scenePhase) private var scenePhase
    @State private var confirmStart = false
    @State private var confirmSubmit = false
    private let blue = Color(red:0.17, green:0.35, blue:0.81)
    private let background = Color(red:0.96, green:0.97, blue:0.98)

    var body: some View {
        VStack(spacing:0) {
            if let payload = model.paper, assessment.active {
                examHeader
                ZStack {
                    SecureExamWebView(payload:payload, answers:model.restoredAnswers, revision:model.savedRevision, coordinator:model)
                        .id(model.attemptID)
                    if model.phase != .active {
                        background.ignoresSafeArea()
                        statusContent.padding(28).frame(maxWidth:560)
                    }
                }
                if model.phase == .active {
                    VStack(spacing:10) {
                        if !model.message.isEmpty { Text(model.message).font(.footnote).foregroundStyle(.orange) }
                        HStack {
                            Text(model.storageStatus).font(.footnote).foregroundStyle(.secondary)
                            Spacer()
                            Button("Abgeben") { confirmSubmit = true }
                                .buttonStyle(.borderedProminent).controlSize(.large).disabled(!model.canSubmit)
                        }
                    }.padding().background(.white)
                }
            } else {
                ScrollView {
                    VStack(spacing:24) {
                        Image("GradeCrewCrew").resizable().scaledToFit().frame(maxWidth:280, maxHeight:125).accessibilityHidden(true)
                        HStack(spacing:12) {
                            Image("GradeCrewLogo").resizable().scaledToFit().frame(width:54,height:54).accessibilityHidden(true)
                            Text("GradeCrew Secure").font(.title2.bold())
                        }
                        if model.phase == .code || model.phase == .identity {
                            entryForm
                        } else { statusContent }
                        Text("Staging · Nur Testdaten verwenden").font(.caption).foregroundStyle(.secondary)
                    }.padding(28).frame(maxWidth:540).frame(maxWidth:.infinity).padding(.top,32)
                }
            }
        }
        .background(background).tint(blue)
        .onChange(of:scenePhase) { _, phase in if phase == .active { Task { await model.foreground() } } }
        .confirmationDialog("\(model.title)\n\(model.details)\nDas iPad wird für diese Prüfung gesperrt.", isPresented:$confirmStart, titleVisibility:.visible) {
            Button("Prüfungsmodus starten") { Task { await model.startOrRecover() } }
            Button("Abbrechen",role:.cancel) {}
        }
        .confirmationDialog("Antworten verbindlich abgeben?", isPresented:$confirmSubmit, titleVisibility:.visible) {
            Button("Jetzt abgeben") { Task { await model.submit(auto:false) } }
            Button("Weiterarbeiten",role:.cancel) {}
        }
    }
    private var entryForm: some View {
        VStack(alignment:.leading,spacing:20) {
            Text("Deinen Test starten").font(.title.bold())
            VStack(alignment:.leading,spacing:8) {
                Text("Testcode").font(.headline)
                TextField("Code deiner Lehrkraft",text:$model.code)
                    .textInputAutocapitalization(.characters).autocorrectionDisabled()
                    .textFieldStyle(.roundedBorder).font(.title3).accessibilityIdentifier("secureCode")
                Text("Name oder Kürzel").font(.headline).padding(.top,8)
                TextField("z. B. dein vereinbartes Kürzel",text:$model.name)
                    .textContentType(.nickname).autocorrectionDisabled()
                    .textFieldStyle(.roundedBorder).font(.title3).accessibilityIdentifier("secureName")
            }
            if !model.message.isEmpty { Text(model.message).foregroundStyle(.red).font(.callout) }
            Button {
                Task {
                    await model.preflight()
                    if model.phase == .identity { confirmStart = true }
                }
            } label: {
                HStack { Spacer(); if model.busy { ProgressView().tint(.white) }; Text(model.busy ? "Test wird geprüft …" : "Test starten").font(.headline); Spacer() }.padding(.vertical,8)
            }.buttonStyle(.borderedProminent).controlSize(.large)
                .disabled(model.busy || model.name.trimmingCharacters(in:.whitespacesAndNewlines).isEmpty || SecureInputPolicy.code(model.code) == nil)
            Text("Das iPad wird erst gesperrt, wenn du den Prüfungsstart bestätigst.").font(.footnote).foregroundStyle(.secondary)
        }.padding(24).background(.white,in:RoundedRectangle(cornerRadius:24))
    }
    private var examHeader: some View {
        ViewThatFits(in:.horizontal) {
            HStack(spacing:18) { examTitle; Spacer(); clock }
            VStack(alignment:.leading,spacing:10) { examTitle; clock }
        }.padding(.horizontal,24).padding(.vertical,14).background(.white)
    }
    private var examTitle: some View {
        HStack(spacing:12) {
            Image("GradeCrewLogo").resizable().scaledToFit().frame(width:40,height:40).accessibilityHidden(true)
            VStack(alignment:.leading,spacing:3) { Text(model.title).font(.headline); Text(model.name).font(.caption).foregroundStyle(.secondary) }
        }
    }
    private var clock: some View {
        Label(model.timeText,systemImage:"clock").font(.title3.monospacedDigit().bold())
            .foregroundStyle((model.remaining ?? 61) <= 60 ? .red : blue).accessibilityLabel("Verbleibende Zeit: " + model.timeText)
    }
    private var statusContent: some View {
        VStack(spacing:20) {
            if model.phase == .completed { Image(systemName:"checkmark.circle.fill").font(.system(size:60)).foregroundStyle(.green) }
            else if model.busy || model.phase == .waiting || model.phase == .submitting || model.phase == .verifying { ProgressView().controlSize(.large) }
            Text(statusTitle).font(.title2.bold()).multilineTextAlignment(.center)
            Text(model.message.isEmpty ? "Apple bereitet die geschützte Prüfung vor …" : model.message).multilineTextAlignment(.center).foregroundStyle(.secondary)
            if model.phase == .recovery || model.phase == .interrupted {
                Button("Verbindung und Prüfungsstand erneut prüfen") { Task { await model.startOrRecover() } }
                    .buttonStyle(.borderedProminent).controlSize(.large).disabled(model.busy)
                Text("Bei abgelaufener Serverfrist oder anhaltender Störung bitte die Lehrkraft informieren. Ein Neustart ist keine bestätigte Abgabe.").font(.footnote).foregroundStyle(.secondary)
            }
            if model.phase == .completed {
                Button("Zurück zum Start") { model.restart() }.buttonStyle(.borderedProminent).controlSize(.large)
            }
        }
    }
    private var statusTitle: String {
        switch model.phase {
        case .waiting: return "Du bist bereit"
        case .completed: return "Sicher abgegeben"
        case .submitting: return "Abgabe wird gesendet"
        case .verifying: return "Abgabe wird bestätigt"
        case .recovery: return "Prüfung fortsetzen"
        case .interrupted: return "Prüfung unterbrochen"
        default: return "Prüfungsmodus wird gestartet"
        }
    }
}
