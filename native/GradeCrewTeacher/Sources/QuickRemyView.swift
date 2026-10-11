import SwiftUI

struct QuickRemyView: View {
    @Environment(\.scenePhase) private var scenePhase
    let onBack: () -> Void
    let call: GradeCrewQuickRemyCall?

    @StateObject private var capture = QuickRemySpeechCapture()
    @State private var pendingTranscript: String?
    @State private var draft = QuickRemyDraft()
    @State private var missingFields: [String] = []
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
        VStack(spacing: 4) {
            navigationHeader
            VStack(spacing: 8) {
                remyMainArtwork
                microphoneButton

                if !statusMessage.isEmpty {
                    Text(statusMessage)
                        .font(.footnote.weight(.medium))
                        .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                        .lineLimit(2)
                        .multilineTextAlignment(.center)
                        .accessibilityAddTraits(.updatesFrequently)
                }

                if status == .requestingPermission || status == .transcribing || workStatus == .recovering || workStatus == .preparing {
                    ProgressView()
                        .controlSize(.small)
                        .tint(GradeCrewDesignTokens.Colors.primary)
                        .accessibilityLabel(progressMessage)
                }
                followUpCard
                quickReviewCard

                if workStatus == .failed {
                    Button(recoveryNeedsRetry ? "Erneut versuchen" : (conversationText.isEmpty ? "Testeditor öffnen" : "Remy erneut fragen")) {
                        Task {
                            if recoveryNeedsRetry { await recoverPendingSubmission() }
                            else if conversationText.isEmpty { await openAiForm() }
                            else { await retryPreparation() }
                        }
                    }
                    .buttonStyle(.bordered)
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .frame(maxWidth: 560)
            .background(GradeCrewDesignTokens.Colors.surface, in: RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.card))

            if status == .permissionDenied, let settingsURL = URL(string: UIApplication.openSettingsURLString) {
                Link("App-Einstellungen öffnen", destination: settingsURL)
                    .font(.footnote)
                    .foregroundStyle(GradeCrewDesignTokens.Colors.primary)
            }

        }
        .frame(maxWidth: .infinity)
        .padding(.bottom, 4)
        .background(GradeCrewDesignTokens.Colors.background)
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
            .frame(width: 156, height: 156)
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
                        Text("Prüfe den Text und tippe oben auf „An Remy senden“.")
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
            Color.clear.frame(width: 52, height: 52).accessibilityHidden(true)
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
        if status == .transcribed { return "An Remy senden" }
        if workStatus == .needsInfo { return "Antwort sprechen" }
        if workStatus == .readyForReview { return "Wunsch ergänzen" }
        return "Mikrofon"
    }


    private func sendCapturedTranscript() {
        let transcript = capture.flow.transcript.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !transcript.isEmpty else { return }
        let addToWishes = workStatus == .readyForReview
        pendingTranscript = transcript
        capture.cancel()
        Task { await prepareTranscript(transcript, addToWishes: addToWishes) }
    }

    @ViewBuilder
    private var followUpCard: some View {
        if workStatus == .needsInfo {
            VStack(alignment: .leading, spacing: 8) {
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
            .padding(12)
            .frame(maxWidth: 560, alignment: .leading)
            .background(GradeCrewDesignTokens.Colors.surface, in: RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.card))
        }
    }

    private var countSuggestionChips: Bool {
        workStatus == .needsInfo && missingFields.contains("count") && Int(draft.count) == nil
    }

    @ViewBuilder
    private var quickReviewCard: some View {
        if workStatus == .readyForReview {
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 8) {
                    TextField("Fach", text: $draft.subject)
                        .textFieldStyle(.roundedBorder)
                    TextField("Klasse", text: $draft.grade)
                        .textFieldStyle(.roundedBorder)
                }
                TextField("Thema", text: $draft.topic)
                    .textFieldStyle(.roundedBorder)
                HStack(spacing: 8) {
                    TextField("Aufgaben", text: $draft.count)
                        .textFieldStyle(.roundedBorder)
                    TextField("Wünsche (optional)", text: $draft.wishes)
                        .textFieldStyle(.roundedBorder)
                }
                Button("Test erstellen") { Task { await submitTest() } }
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
                    .background(GradeCrewDesignTokens.Colors.primary, in: Capsule())
                    .disabled(draft.preparedRequest == nil)
                Button("Weitere Einstellungen") { Task { await showMoreOptions() } }
                    .font(.footnote.weight(.medium))
                    .frame(maxWidth: .infinity)
            }
            .padding(12)
            .background(GradeCrewDesignTokens.Colors.surface, in: RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.card))
        }
    }

    private var progressMessage: String {
        if status == .requestingPermission { return "Mikrofon wird vorbereitet" }
        if status == .transcribing { return "Sprache wird lokal erkannt" }
        if workStatus == .recovering { return "Vorheriger Auftrag wird abgeglichen" }
        return "Remy prüft die Angaben"
    }

    private var statusMessage: String {
        if workStatus == .recovering { return "Prüfe offenen Auftrag …" }
        if workStatus == .preparing { return "Remy füllt den Test aus …" }
        if workStatus == .readyForReview { return "Entwurf bereit · prüfen oder ergänzen" }
        if workStatus == .accepted { return "Test wird erstellt …" }
        if workStatus == .failed { return workError ?? "Senden fehlgeschlagen · erneut versuchen" }
        if workStatus == .needsInfo { return "Rückfrage · sprich deine Ergänzung" }
        switch status {
        case .idle: return ""
        case .requestingPermission: return "Mikrofon freigeben"
        case .permissionDenied: return "Mikrofonzugriff fehlt"
        case .recognizerUnavailable: return "Spracherkennung nicht verfügbar"
        case .onDeviceRecognitionUnavailable: return "Lokale Spracherkennung nicht verfügbar"
        case .recording: return "Remy hört zu · tippen zum Beenden"
        case .transcribing: return "Aufnahme wird erkannt …"
        case .transcribed: return "Wunsch erkannt · senden"
        case .emptyTranscript: return "Nichts erkannt · erneut sprechen"
        case .failed: return "Erkennung fehlgeschlagen · erneut versuchen"
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
    private func prepareTranscript(_ transcript: String, addToWishes: Bool = false) async {
        guard !transcript.isEmpty, workStatus != .preparing, workStatus != .accepted else { return }
        let segment = transcript.trimmingCharacters(in: .whitespacesAndNewlines)
        let updatedConversation = conversationText.isEmpty ? segment : "\(conversationText)\nErgänzung: \(segment)"
        guard updatedConversation.utf16.count <= 2500 else {
            workError = "Der zusammengefasste Wunsch ist zu lang. Bitte beginne eine neue Remy-Anfrage."
            workStatus = .failed
            return
        }
        conversationText = updatedConversation
        if addToWishes {
            let prior = draft.wishes.trimmingCharacters(in: .whitespacesAndNewlines)
            draft.wishes = prior.isEmpty ? segment : "\(prior)\n\(segment)"
        }
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
                let responseDraft = QuickRemyDraft(payload: fields)
                if !responseDraft.subject.isEmpty { draft.subject = responseDraft.subject }
                if !responseDraft.grade.isEmpty { draft.grade = responseDraft.grade }
                if !responseDraft.topic.isEmpty { draft.topic = responseDraft.topic }
                if !responseDraft.count.isEmpty { draft.count = responseDraft.count }
                if !responseDraft.wishes.isEmpty { draft.wishes = responseDraft.wishes }
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

    @MainActor
    private func submitTest() async {
        guard draft.preparedRequest != nil else { return }
        do {
            let fields = try await invoke("populateAiForm", payload: ["draft": draft.knownFieldsPayload])
            guard fields["status"] as? String == "ready" else { throw quickRemyError("Die Angaben konnten nicht übernommen werden.") }
            let result = try await invoke("createAiTest", payload: [:])
            guard result["status"] as? String == "started" else { throw quickRemyError("Der Test konnte nicht gestartet werden.") }
            workStatus = .accepted
            workError = nil
        } catch {
            workError = error.localizedDescription
            workStatus = .failed
        }
    }

    @MainActor
    private func showMoreOptions() async {
        do {
            let result = try await invoke("showAiOptions", payload: [:])
            guard result["status"] as? String == "ready" else { throw quickRemyError("Die weiteren Einstellungen konnten nicht geöffnet werden.") }
        } catch {
            workError = error.localizedDescription
            workStatus = .failed
        }
    }

    private func clearConversation() {
        workGeneration = UUID()
        capture.cancel()
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
