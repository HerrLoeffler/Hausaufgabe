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
    @State private var missingFields: [String] = []
    @State private var showingTextEntry = false
    @State private var aiFormReady = false
    @State private var workStatus: RemyWorkStatus = .idle
    @State private var conversationText = ""
    @State private var requestId = UUID().uuidString
    @State private var workError: String?
    @State private var workGeneration = UUID()
    @State private var recoveryChecking = true
    @State private var unresolvedSubmission = false
    @State private var recoveryNeedsRetry = false

    private enum RemyWorkStatus { case idle, recovering, preparing, needsInfo, readyForReview, accepted, failed }

    private var status: QuickRemySpeechFlow.Status { capture.flow.status }
    private var canStartRecording: Bool {
        switch status {
        case .requestingPermission, .recording, .transcribing: return false
        default: return true
        }
    }

    var body: some View {
        VStack(spacing: GradeCrewDesignTokens.Spacing.sm) {
            navigationHeader
            HStack(spacing: GradeCrewDesignTokens.Spacing.md) {
                remyMainArtwork
                    .frame(width: 84, height: 84)
                VStack(alignment: .leading, spacing: GradeCrewDesignTokens.Spacing.xs) {
                    Text("Was soll Remy vorbereiten?")
                        .font(.system(size: 20, weight: .bold, design: .rounded))
                        .foregroundStyle(GradeCrewDesignTokens.Colors.text)
                    Text(statusMessage)
                        .font(.system(size: 15))
                        .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                        .fixedSize(horizontal: false, vertical: true)
                        .accessibilityElement(children: .ignore)
                        .accessibilityLabel(statusMessage)
                        .accessibilityAddTraits(.updatesFrequently)
                }
                .layoutPriority(1)
            }
            .padding(.horizontal, GradeCrewDesignTokens.Spacing.lg)

            microphoneButton
                .padding(.horizontal, GradeCrewDesignTokens.Spacing.lg)

            if status == .requestingPermission || status == .transcribing || workStatus == .recovering || workStatus == .preparing {
                ProgressView()
                    .tint(GradeCrewDesignTokens.Colors.primary)
                    .accessibilityLabel(progressMessage)
            }

            followUpCard

            if workStatus == .readyForReview {
                Text("Deine Angaben stehen im Testeditor darunter. Ergänze dort Aufgaben, Bilder und weitere Wünsche und erstelle den Test.")
                    .font(.footnote)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                    .padding(.horizontal, GradeCrewDesignTokens.Spacing.lg)
            }

            if workStatus == .accepted {
                Label("Der vorherige Remy-Auftrag wurde bestätigt.", systemImage: "checkmark.circle.fill")
                    .font(.footnote.weight(.semibold))
                    .foregroundStyle(GradeCrewDesignTokens.Colors.positive)
            }

            if workStatus == .failed {
                Button(recoveryNeedsRetry ? "Auftrag erneut abgleichen" : (conversationText.isEmpty ? "Testeditor erneut öffnen" : "Remy erneut fragen")) {
                    Task {
                        if recoveryNeedsRetry { await recoverPendingSubmission() }
                        else if conversationText.isEmpty { await openAiForm() }
                        else { await retryPreparation() }
                    }
                }
                .buttonStyle(.bordered)
            }

            textEntrySection

            if status == .permissionDenied, let settingsURL = URL(string: UIApplication.openSettingsURLString) {
                Link("App-Einstellungen öffnen", destination: settingsURL)
                    .font(.footnote)
                    .foregroundStyle(GradeCrewDesignTokens.Colors.primary)
            }

            Text("Die Sprache wird auf diesem Gerät erkannt. Audio wird nicht an GradeCrew hochgeladen.")
                .font(.system(size: 12))
                .multilineTextAlignment(.center)
                .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                .padding(.horizontal, GradeCrewDesignTokens.Spacing.lg)
        }
        .frame(maxWidth: .infinity)
        .padding(.bottom, GradeCrewDesignTokens.Spacing.sm)
        .background(GradeCrewDesignTokens.Colors.background)
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
        .task {
            await recoverPendingSubmission()
            await openAiForm()
        }
        .onDisappear {
            clearConversation()
        }
    }

    private var remyMainArtwork: some View {
        Image(GradeCrewAssets.NativeImage.remyMicrophone)
            .resizable()
            .scaledToFit()
            .frame(width: 84, height: 84)
            .accessibilityLabel("Remy mit Mikrofon")
    }

    private var microphoneButton: some View {
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
                .font(.system(size: 20, weight: .semibold))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 58)
                .background(status == .recording ? GradeCrewDesignTokens.Colors.crewRust : GradeCrewDesignTokens.Colors.primary, in: Capsule())
        }
        .buttonStyle(.plain)
        .frame(maxWidth: 560)
        .disabled(recoveryChecking || unresolvedSubmission || (!canStartRecording && status != .recording) || workStatus == .preparing || workStatus == .accepted)
    }

    private var recognizedTranscriptCard: some View {
        Group {
            if let visibleTranscript = pendingTranscript ?? (capture.flow.transcript.isEmpty ? nil : capture.flow.transcript) {
                VStack(alignment: .leading, spacing: GradeCrewDesignTokens.Spacing.sm) {
                    Text("Erkannter Text")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                    Text(visibleTranscript)
                        .font(.system(size: 20))
                        .foregroundStyle(GradeCrewDesignTokens.Colors.text)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .textSelection(.enabled)
                    if status == .transcribed {
                        Text("Prüfe den Text und tippe oben auf „Testwunsch an Remy senden“.")
                            .font(.footnote)
                            .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                    }
                }
                .padding(GradeCrewDesignTokens.Spacing.lg)
                .frame(maxWidth: 560, alignment: .leading)
                .background(GradeCrewDesignTokens.Colors.surface, in: RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.card))
            }
        }
    }

    @ViewBuilder
    private var textEntrySection: some View {
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
                    .background(GradeCrewDesignTokens.Colors.background, in: RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.control))
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
            .padding(GradeCrewDesignTokens.Spacing.lg)
            .background(GradeCrewDesignTokens.Colors.surface, in: RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.card))
        } else {
            Button("Stattdessen tippen") { showingTextEntry = true }
                .buttonStyle(.plain)
                .foregroundStyle(GradeCrewDesignTokens.Colors.primary)
                .accessibilityHint("Öffnet eine Texteingabe, wenn du das Mikrofon nicht verwenden möchtest.")
        }
    }

    private var navigationHeader: some View {
        HStack {
            Button(action: onBack) {
                Label("Start", systemImage: "chevron.left")
                    .font(.system(size: 17, weight: .medium))
                    .foregroundStyle(GradeCrewDesignTokens.Colors.primary)
                    .padding(.horizontal, 15)
                    .frame(height: 48)
                    .background(GradeCrewDesignTokens.Colors.soft, in: Capsule())
            }
            .buttonStyle(.plain)
            Spacer()
            Image(GradeCrewAssets.NativeImage.remyMicrophone)
                .resizable()
                .scaledToFit()
                .frame(width: 52, height: 52)
                .accessibilityHidden(true)
        }
        .overlay {
            Text("Remy fragen")
                .font(.system(size: 19, weight: .bold, design: .rounded))
                .foregroundStyle(GradeCrewDesignTokens.Colors.text)
                .allowsHitTesting(false)
        }
        .padding(.horizontal, GradeCrewDesignTokens.Spacing.lg)
        .padding(.vertical, GradeCrewDesignTokens.Spacing.sm)
        .background(GradeCrewDesignTokens.Colors.background)
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
    private var followUpCard: some View {
        if workStatus == .needsInfo {
            VStack(alignment: .leading, spacing: GradeCrewDesignTokens.Spacing.sm) {
                Text("Remy fragt kurz nach")
                    .font(.headline)
                    .foregroundStyle(GradeCrewDesignTokens.Colors.text)
                Text(workError ?? "Ergänze bitte noch die fehlenden Angaben.")
                    .font(.body)
                    .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                if countSuggestionChips {
                    HStack(spacing: GradeCrewDesignTokens.Spacing.sm) {
                        ForEach([5, 10, 15], id: \.self) { value in
                            Button("\(value) Aufgaben") {
                                Task { await chooseTaskCount(value) }
                            }
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(GradeCrewDesignTokens.Colors.primary)
                            .padding(.horizontal, 13)
                            .padding(.vertical, 11)
                            .background(GradeCrewDesignTokens.Colors.soft, in: Capsule())
                            .accessibilityHint("Setzt die Aufgabenzahl auf \(value) und fragt Remy nach weiteren fehlenden Angaben.")
                        }
                    }
                    .frame(maxWidth: .infinity)
                }
            }
            .padding(GradeCrewDesignTokens.Spacing.lg)
            .frame(maxWidth: 560, alignment: .leading)
            .background(GradeCrewDesignTokens.Colors.surface, in: RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.card))
        }
    }

    private var countSuggestionChips: Bool {
        workStatus == .needsInfo && missingFields.contains("count") && Int(draft.count) == nil
    }

    private var progressMessage: String {
        if status == .requestingPermission { return "Mikrofon wird vorbereitet" }
        if status == .transcribing { return "Sprache wird lokal erkannt" }
        if workStatus == .recovering { return "Vorheriger Auftrag wird abgeglichen" }
        return "Remy prüft die Angaben"
    }

    private var statusMessage: String {
        if workStatus == .recovering { return "Ein offener Remy-Auftrag wird abgeglichen." }
        if workStatus == .preparing { return "Remy prüft den Wunsch und fragt nur bei fehlenden Pflichtangaben nach." }
        if workStatus == .readyForReview { return "Deine Angaben stehen im Testeditor darunter. Ergänze dort die Auswahl und erstelle den Test." }
        if workStatus == .accepted { return "" }
        if workStatus == .failed { return workError ?? "Remy konnte die Anfrage nicht senden. Bitte versuche es erneut." }
        if workStatus == .needsInfo { return "Ergänze die Angaben im Testentwurf oder sprich deine Antwort ein." }
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
    private func openAiForm() async {
        do {
            let result = try await invoke("openAiForm", payload: [:])
            guard result["status"] as? String == "ready" else {
                throw quickRemyError("Der Testeditor konnte nicht geöffnet werden. Bitte erneut versuchen.")
            }
            aiFormReady = true
            if workStatus == .failed && conversationText.isEmpty { workStatus = .idle }
            workError = nil
        } catch {
            aiFormReady = false
            workError = error.localizedDescription
            workStatus = .failed
        }
    }

    @MainActor
    private func prepareTranscript(_ transcript: String) async {
        guard !transcript.isEmpty, workStatus != .preparing, workStatus != .accepted else { return }
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
    private func chooseTaskCount(_ value: Int) async {
        guard (1...100).contains(value), workStatus == .needsInfo, missingFields.contains("count") else { return }
        draft.count = String(value)
        await runPreparation()
    }

    @MainActor
    private func runPreparation() async {
        if !aiFormReady {
            await openAiForm()
            guard aiFormReady else { return }
        }
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
            let synced = try await invoke("populateAiForm", payload: ["draft": draft.knownFieldsPayload])
            guard synced["status"] as? String == "ready" else {
                throw quickRemyError("Remys Angaben konnten nicht in den Testeditor übernommen werden.")
            }
            let responseMissingFields = result["missingFields"] as? [String]
            if let question = QuickRemyFollowUpPolicy.question(
                status: result["status"] as? String,
                missingFields: responseMissingFields,
                question: result["question"] as? String
            ) {
                missingFields = responseMissingFields ?? []
                workError = question
                workStatus = .needsInfo
                return
            }
            guard result["status"] as? String == "ready", let request = result["preparedRequest"] as? [String: Any] else {
                throw quickRemyError("Remy hat eine ungültige Antwort zurückgegeben.")
            }
            missingFields = []
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
        guard workStatus != .recovering && workStatus != .preparing else { return }
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
        draft = QuickRemyDraft()
        missingFields = []
        workError = nil
        pendingTranscript = nil
        workStatus = .idle
    }

    private func quickRemyError(_ message: String) -> NSError {
        NSError(domain: "GradeCrewQuickRemy", code: 1, userInfo: [NSLocalizedDescriptionKey: message])
    }
}
