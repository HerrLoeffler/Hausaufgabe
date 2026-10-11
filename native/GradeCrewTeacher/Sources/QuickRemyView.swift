import SwiftUI
import UIKit

struct QuickRemyView: View {
    @Environment(\.scenePhase) private var scenePhase
    @FocusState private var textEntryFocused: Bool
    let onBack: () -> Void
    let call: GradeCrewQuickRemyCall?

    @StateObject private var capture = QuickRemySpeechCapture()
    @State private var typedText = ""
    @State private var pendingTranscript: String?
    @State private var draft = QuickRemyDraft()
    @State private var showingTextEntry = false
    @State private var workStatus: RemyWorkStatus = .idle
    @State private var conversationText = ""
    @State private var requestId = UUID().uuidString
    @State private var preparedRequest: [String: Any]?
    @State private var workError: String?
    @State private var workGeneration = UUID()
    @State private var recoveryChecking = true
    @State private var unresolvedSubmission = false
    @State private var recoveryNeedsRetry = false

    private enum RemyWorkStatus { case idle, recovering, preparing, needsInfo, readyForReview, submitting, accepted, failed }

    private var status: QuickRemySpeechFlow.Status { capture.flow.status }
    private var canStartRecording: Bool {
        switch status {
        case .requestingPermission, .recording, .transcribing: return false
        default: return true
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            navigationHeader
            ScrollView {
                VStack(spacing: GradeCrewDesignTokens.Spacing.xl) {

            Image(GradeCrewAssets.NativeImage.remyMicrophone)
                .resizable()
                .scaledToFit()
                .frame(width: 104, height: 104)
                .accessibilityLabel("Remy mit Mikrofon")

            Text("Was soll Remy für dich vorbereiten?")
                .font(.system(size: 25, weight: .semibold, design: .rounded))
                .multilineTextAlignment(.center)
                .foregroundStyle(GradeCrewDesignTokens.Colors.text)
                .padding(.horizontal, GradeCrewDesignTokens.Spacing.lg)

            Text(workStatus == .needsInfo && draft.preparedRequest == nil ? (workError ?? "Ergänze bitte noch die fehlenden Angaben.") : statusMessage)
                .font(.system(size: GradeCrewDesignTokens.Typography.body))
                .multilineTextAlignment(.center)
                .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                .padding(.horizontal, GradeCrewDesignTokens.Spacing.xl)
                .accessibilityElement(children: .ignore)
                .accessibilityLabel(workStatus == .needsInfo && draft.preparedRequest == nil ? (workError ?? "Ergänze bitte noch die fehlenden Angaben.") : statusMessage)
                .accessibilityAddTraits(.updatesFrequently)

            if status == .requestingPermission || status == .transcribing {
                ProgressView()
                    .tint(GradeCrewDesignTokens.Colors.primary)
                    .accessibilityLabel(status == .requestingPermission ? "Mikrofon wird vorbereitet" : "Sprache wird lokal erkannt")
            }

            draftReviewCard

            if workStatus == .recovering || workStatus == .preparing || workStatus == .submitting {
                ProgressView()
                    .tint(GradeCrewDesignTokens.Colors.primary)
                    .accessibilityLabel(workStatus == .recovering ? "Vorheriger Auftrag wird abgeglichen" : (workStatus == .preparing ? "Remy prüft die Angaben" : "Remy startet den Testauftrag"))
            }

            Button {
                if status == .recording {
                    capture.stop()
                } else if status == .transcribed {
                    sendCapturedTranscript()
                } else {
                    pendingTranscript = nil
                    Task { await capture.start() }
                }
            } label: {
                Label(microphoneActionTitle, systemImage: status == .recording ? "stop.fill" : "mic.fill")
                    .font(.system(size: 17, weight: .semibold))
                    .frame(minWidth: 230, minHeight: 54)
            }
            .buttonStyle(.borderedProminent)
            .tint(status == .recording ? GradeCrewDesignTokens.Colors.crewRust : GradeCrewDesignTokens.Colors.primary)
            .disabled(recoveryChecking || unresolvedSubmission || (!canStartRecording && status != .recording) || workStatus == .preparing || workStatus == .submitting || workStatus == .accepted)

            if workStatus == .readyForReview || (workStatus == .needsInfo && draft.preparedRequest != nil) {
                Button("Test erstellen") {
                    Task { await submitPreparedRequest() }
                }
                .buttonStyle(.borderedProminent)
                .tint(GradeCrewDesignTokens.Colors.primary)
                .frame(maxWidth: 560)
                .disabled(draft.preparedRequest == nil)
            }

            if workStatus == .accepted {
                VStack(spacing: GradeCrewDesignTokens.Spacing.sm) {
                    Label("Remy hat den Auftrag erhalten", systemImage: "checkmark.circle.fill")
                        .font(.headline)
                        .foregroundStyle(GradeCrewDesignTokens.Colors.positive)
                    Text("Die Erstellung läuft im Hintergrund weiter. Den Entwurf findest du später unter „Meine Tests“.")
                        .font(.footnote)
                        .multilineTextAlignment(.center)
                        .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                    Button("Fertig") { onBack() }.buttonStyle(.bordered)
                }
                .frame(maxWidth: 560)
            }

            if workStatus == .failed {
                Button(recoveryNeedsRetry ? "Auftrag erneut abgleichen" : (preparedRequest == nil ? "Remy erneut fragen" : "Auftrag erneut senden")) {
                    Task {
                        if recoveryNeedsRetry { await recoverPendingSubmission() }
                        else if preparedRequest == nil {
                            if conversationText.isEmpty { clearConversation() }
                            else { await retryPreparation() }
                        }
                        else { await submitPreparedRequest() }
                    }
                }
                    .buttonStyle(.bordered)
            }

            if let visibleTranscript = pendingTranscript ?? (capture.flow.transcript.isEmpty ? nil : capture.flow.transcript) {
                VStack(alignment: .leading, spacing: GradeCrewDesignTokens.Spacing.sm) {
                    Text("Erkannter Text")
                        .font(.footnote.weight(.semibold))
                        .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                    Text(visibleTranscript)
                        .font(.body)
                        .foregroundStyle(GradeCrewDesignTokens.Colors.text)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .textSelection(.enabled)
                    if status == .transcribed {
                        Text("Prüfe den Text und sende ihn anschließend an Remy.")
                            .font(.footnote).foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                        Button(transcriptActionTitle, action: sendCapturedTranscript)
                            .buttonStyle(.borderedProminent)
                            .tint(GradeCrewDesignTokens.Colors.primary)
                            .frame(maxWidth: .infinity)
                            .disabled(workStatus == .preparing || workStatus == .submitting || workStatus == .accepted)
                    }
                }
                .padding(GradeCrewDesignTokens.Spacing.lg)
                .frame(maxWidth: 560)
                .background(GradeCrewDesignTokens.Colors.surface, in: RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.card))
            }

            if showingTextEntry {
                VStack(alignment: .leading, spacing: GradeCrewDesignTokens.Spacing.sm) {
                    HStack {
                        Text("Stattdessen tippen")
                            .font(.footnote.weight(.semibold))
                        Spacer()
                        Button("Eingabe schließen") {
                            textEntryFocused = false
                            showingTextEntry = false
                        }
                        .font(.footnote)
                    }
                    TextEditor(text: $typedText)
                        .frame(minHeight: 120, maxHeight: 180)
                        .padding(GradeCrewDesignTokens.Spacing.xs)
                        .background(GradeCrewDesignTokens.Colors.surface, in: RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.control))
                        .accessibilityLabel("Testwunsch als Text")
                        .focused($textEntryFocused)
                    Button(transcriptActionTitle) {
                        capture.useText(typedText)
                        typedText = ""
                        textEntryFocused = false
                        showingTextEntry = false
                        sendCapturedTranscript()
                    }
                    .buttonStyle(.bordered)
                    .disabled(typedText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
                .frame(maxWidth: 560)
                .padding(.horizontal, GradeCrewDesignTokens.Spacing.lg)
            } else {
                Button("Stattdessen tippen") { showingTextEntry = true }
                    .buttonStyle(.plain)
                    .foregroundStyle(GradeCrewDesignTokens.Colors.primary)
                    .accessibilityHint("Öffnet eine Texteingabe, wenn du das Mikrofon nicht verwenden möchtest.")
            }

            if status == .permissionDenied, let settingsURL = URL(string: UIApplication.openSettingsURLString) {
                Link("App-Einstellungen öffnen", destination: settingsURL)
                    .font(.footnote)
                    .foregroundStyle(GradeCrewDesignTokens.Colors.primary)
            }

            Text("Die Sprache wird auf diesem Gerät erkannt. Audio wird nicht an GradeCrew hochgeladen.")
                .font(.footnote)
                .multilineTextAlignment(.center)
                .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                .padding(.horizontal, GradeCrewDesignTokens.Spacing.xl)
                .padding(.bottom, GradeCrewDesignTokens.Spacing.xl)
                }
                .frame(maxWidth: .infinity)
                .padding(.top, GradeCrewDesignTokens.Spacing.lg)
                .padding(.bottom, GradeCrewDesignTokens.Spacing.xl)
            }
            .scrollDismissesKeyboard(.interactively)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(GradeCrewDesignTokens.Colors.background.ignoresSafeArea())
        .onChange(of: status) { newStatus in
            switch newStatus {
            case .permissionDenied, .recognizerUnavailable, .onDeviceRecognitionUnavailable, .emptyTranscript, .failed:
                showingTextEntry = true
            case .transcribed:
                break
            default:
                break
            }
        }
        .onChange(of: scenePhase) { phase in
            if phase != .active {
                recoveryChecking = true
                clearConversation()
            } else {
                Task { await recoverPendingSubmission() }
            }
        }
        .task { await recoverPendingSubmission() }
        .onDisappear {
            clearConversation()
        }
    }

    private var navigationHeader: some View {
        HStack {
            Button(action: onBack) {
                Label("Start", systemImage: "chevron.left")
                    .frame(minHeight: GradeCrewDesignTokens.Layout.minimumTouchTarget)
            }
            .buttonStyle(.bordered)
            Spacer(minLength: GradeCrewDesignTokens.Spacing.sm)
            HStack(spacing: GradeCrewDesignTokens.Spacing.sm) {
                Image(GradeCrewAssets.NativeImage.remyMicrophone)
                    .resizable()
                    .scaledToFit()
                    .frame(width: 56, height: 56)
                    .layoutPriority(1)
                    .accessibilityHidden(true)
                Text("Remy fragen")
                    .font(.headline)
                    .foregroundStyle(GradeCrewDesignTokens.Colors.text)
            }
            Spacer(minLength: GradeCrewDesignTokens.Spacing.sm)
            Color.clear.frame(width: 72, height: 1).accessibilityHidden(true)
        }
        .padding(.horizontal, GradeCrewDesignTokens.Spacing.lg)
        .padding(.vertical, GradeCrewDesignTokens.Spacing.sm)
        .background(.regularMaterial)
    }

    private var microphoneActionTitle: String {
        if status == .recording { return "Aufnahme beenden" }
        if status == .transcribed { return transcriptActionTitle }
        if workStatus == .needsInfo { return "Antwort sprechen" }
        return "Mikrofon drücken"
    }

    private var transcriptActionTitle: String {
        workStatus == .needsInfo ? "Antwort an Remy senden" : "Testwunsch an Remy senden"
    }

    private func sendCapturedTranscript() {
        let transcript = capture.flow.transcript.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !transcript.isEmpty else { return }
        pendingTranscript = transcript
        capture.cancel()
        Task { await prepareTranscript(transcript) }
    }

    @ViewBuilder
    private var draftReviewCard: some View {
        if workStatus == .needsInfo || workStatus == .readyForReview || workStatus == .accepted || (workStatus == .failed && draft.hasValues) {
            VStack(alignment: .leading, spacing: GradeCrewDesignTokens.Spacing.sm) {
                Text("Das hat Remy verstanden")
                    .font(.headline)
                    .foregroundStyle(GradeCrewDesignTokens.Colors.text)
                TextField("Fach", text: $draft.subject)
                    .textContentType(.none)
                    .textInputAutocapitalization(.sentences)
                    .accessibilityLabel("Fach")
                TextField("Klasse", text: $draft.grade)
                    .textContentType(.none)
                    .accessibilityLabel("Klasse")
                TextField("Thema", text: $draft.topic, axis: .vertical)
                    .lineLimit(1...3)
                    .textInputAutocapitalization(.sentences)
                    .accessibilityLabel("Thema")
                TextField("Aufgaben", text: $draft.count)
                    .keyboardType(.numberPad)
                    .accessibilityLabel("Anzahl der Aufgaben")
                Text(workStatus == .needsInfo ? "Du kannst Angaben hier direkt ergänzen oder korrigieren." : "Du kannst jede Angabe vor der Erstellung noch ändern.")
                    .font(.footnote)
                    .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
            }
            .textFieldStyle(.roundedBorder)
            .padding(GradeCrewDesignTokens.Spacing.lg)
            .frame(maxWidth: 560)
            .background(GradeCrewDesignTokens.Colors.surface, in: RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.card))
            .disabled(workStatus == .accepted)
        }
    }

    private var statusMessage: String {
        if workStatus == .recovering { return "Ein offener Remy-Auftrag wird abgeglichen." }
        if workStatus == .preparing { return "Remy prüft den Wunsch und fragt nur bei fehlenden Pflichtangaben nach." }
        if workStatus == .submitting { return "Der Testauftrag wird sicher an GradeCrew übergeben." }
        if workStatus == .readyForReview || (workStatus == .needsInfo && draft.preparedRequest != nil) { return "Prüfe die Angaben und tippe auf Test erstellen, wenn alles stimmt." }
        if workStatus == .accepted { return "" }
        if workStatus == .failed { return workError ?? "Remy konnte die Anfrage nicht senden. Bitte versuche es erneut." }
        if workStatus == .needsInfo { return "Sprich die fehlenden Angaben ein oder tippe sie." }
        switch status {
        case .idle: return "Tippe auf das Mikrofon und sprich deinen Testwunsch."
        case .requestingPermission: return "Bitte erlaube Mikrofon und Spracheingabe."
        case .permissionDenied: return "Mikrofon oder Spracheingabe ist nicht freigegeben. Du kannst deinen Wunsch eintippen."
        case .recognizerUnavailable: return "Die deutsche Spracherkennung ist gerade nicht verfügbar. Du kannst deinen Wunsch eintippen."
        case .onDeviceRecognitionUnavailable: return "Dieses Gerät unterstützt gerade keine lokale deutsche Erkennung. Du kannst deinen Wunsch eintippen."
        case .recording: return "Remy hört zu. Tippe erneut, wenn du fertig bist."
        case .transcribing: return "Remy wandelt deine Spracheingabe auf diesem Gerät in Text um."
        case .transcribed: return "Prüfe kurz, ob der erkannte Testwunsch stimmt."
        case .emptyTranscript: return "Es wurde kein Text erkannt. Sprich erneut oder tippe deinen Wunsch ein."
        case .failed: return "Die lokale Erkennung ist fehlgeschlagen. Du kannst es erneut versuchen oder Text eingeben."
        }
    }

    @MainActor
    private func prepareTranscript(_ transcript: String) async {
        guard !transcript.isEmpty, workStatus != .preparing, workStatus != .submitting, workStatus != .accepted else { return }
        let segment = transcript.trimmingCharacters(in: .whitespacesAndNewlines)
        let updatedConversation = conversationText.isEmpty ? segment : "\(conversationText)\nErgänzung: \(segment)"
        guard updatedConversation.utf16.count <= 2500 else {
            workError = "Der zusammengefasste Wunsch ist zu lang. Bitte beginne eine neue Remy-Anfrage."
            workStatus = .failed
            return
        }
        conversationText = updatedConversation
        await runPreparation()
    }

    @MainActor
    private func retryPreparation() async {
        guard !conversationText.isEmpty, workStatus == .failed else { return }
        await runPreparation()
    }

    @MainActor
    private func runPreparation() async {
        let token = UUID()
        workGeneration = token
        workError = nil
        workStatus = .preparing
        do {
            let result = try await invoke("prepare", payload: [
                "requestId": requestId,
                "conversationText": conversationText,
                "knownFields": draft.knownFieldsPayload
            ])
            guard workGeneration == token else { return }
            if let fields = result["draft"] as? [String: Any] {
                draft = QuickRemyDraft(payload: fields)
            }
            if let question = QuickRemyFollowUpPolicy.question(
                status: result["status"] as? String,
                missingFields: result["missingFields"] as? [String],
                question: result["question"] as? String
            ) {
                workError = question
                workStatus = .needsInfo
                return
            }
            guard result["status"] as? String == "ready", let request = result["preparedRequest"] as? [String: Any] else {
                throw quickRemyError("Remy hat eine ungültige Antwort zurückgegeben.")
            }
            preparedRequest = request
            if result["draft"] == nil { draft = QuickRemyDraft(payload: request) }
            workStatus = .readyForReview
        } catch {
            guard workGeneration == token else { return }
            workError = error.localizedDescription
            workStatus = .failed
        }
    }

    @MainActor
    private func recoverPendingSubmission() async {
        guard workStatus != .recovering && workStatus != .preparing && workStatus != .submitting else { return }
        recoveryChecking = true
        workStatus = .recovering
        let token = UUID()
        workGeneration = token
        do {
            let result = try await invoke("recoverPending", payload: [:])
            guard workGeneration == token else { return }
            recoveryNeedsRetry = false
            unresolvedSubmission = false
            recoveryChecking = false
            if result["status"] as? String == "accepted",
               let jobId = result["jobId"] as? String,
               (10...80).contains(jobId.count), jobId.range(of: "^[a-zA-Z0-9_-]+$", options: .regularExpression) != nil {
                workStatus = .accepted
            } else if result["status"] as? String == "failed" {
                workError = "Der vorherige Auftrag wurde nicht gestartet. Bitte beginne eine neue Remy-Anfrage."
                workStatus = .failed
            } else if result["status"] as? String == "none" || result["status"] as? String == "notFound" {
                workStatus = .idle
            } else {
                throw quickRemyError("Der offene Auftrag konnte nicht abgeglichen werden.")
            }
        } catch {
            guard workGeneration == token else { return }
            recoveryNeedsRetry = true
            unresolvedSubmission = true
            recoveryChecking = false
            workError = "Der vorherige Auftrag wird noch abgeglichen. Bitte versuche den Abgleich erneut."
            workStatus = .failed
        }
    }

    @MainActor
    private func submitPreparedRequest() async {
        guard let currentRequest = draft.preparedRequest else { return }
        preparedRequest = currentRequest
        let token = UUID()
        workGeneration = token
        workStatus = .submitting
        workError = nil
        do {
            let result = try await invoke("submit", payload: ["requestId": requestId, "preparedRequest": currentRequest])
            guard workGeneration == token else { return }
            guard result["status"] as? String == "accepted",
                  let jobId = result["jobId"] as? String,
                  (10...80).contains(jobId.count), jobId.range(of: "^[a-zA-Z0-9_-]+$", options: .regularExpression) != nil else {
                throw quickRemyError("GradeCrew hat den Auftrag nicht bestätigt. Bitte erneut versuchen.")
            }
            workStatus = .accepted
        } catch {
            guard workGeneration == token else { return }
            workError = error.localizedDescription
            workStatus = .failed
        }
    }

    private func invoke(_ action: String, payload: [String: Any]) async throws -> [String: Any] {
        guard let call else { throw quickRemyError("Die GradeCrew-Verbindung ist noch nicht bereit. Bitte erneut versuchen.") }
        return try await withCheckedThrowingContinuation { continuation in
            call(action, payload) { result in continuation.resume(with: result) }
        }
    }

    private func clearConversation() {
        workGeneration = UUID()
        capture.cancel()
        typedText = ""
        conversationText = ""
        requestId = UUID().uuidString
        preparedRequest = nil
        draft = QuickRemyDraft()
        workError = nil
        pendingTranscript = nil
        workStatus = .idle
    }

    private func quickRemyError(_ message: String) -> NSError {
        NSError(domain: "GradeCrewQuickRemy", code: 1, userInfo: [NSLocalizedDescriptionKey: message])
    }
}
