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
    private enum SpeechTarget { case remy, wishes }
    @State private var speechTarget: SpeechTarget = .remy
    @State private var allowedTypes: Set<String> = ["single", "multi", "dropdown", "truefalse", "gapfill", "matching", "ordering", "grouping", "markwords"]
    private let questionTypes: [(String, String)] = [
        ("single", "Single Choice"), ("multi", "Multiple Choice"), ("text", "Freitext"),
        ("dropdown", "Dropdown"), ("truefalse", "Richtig / Falsch"), ("gapfill", "Lückentext"),
        ("matching", "Zuordnen"), ("ordering", "Sortieren"), ("grouping", "Gruppieren"), ("markwords", "Wörter markieren"), ("number", "Zahlenaufgaben")
    ]

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
                VStack(spacing: 14) {
                    remyVoiceCard
                    nativeTestForm
                    if status == .permissionDenied, let settingsURL = URL(string: UIApplication.openSettingsURLString) {
                        Link("App-Einstellungen öffnen", destination: settingsURL)
                            .font(.footnote)
                            .foregroundStyle(GradeCrewDesignTokens.Colors.primary)
                    }
                    if workStatus == .failed { retryButton }
                    if workStatus == .accepted {
                        Label("Testauftrag wurde übergeben.", systemImage: "checkmark.circle.fill")
                            .font(.footnote.weight(.semibold)).foregroundStyle(GradeCrewDesignTokens.Colors.positive)
                    }
                    Text("Sprache wird auf diesem Gerät erkannt.")
                        .font(.system(size: 12)).foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                }
                .padding(.horizontal, 14)
                .padding(.bottom, 24)
                .frame(maxWidth: 560)
                .frame(maxWidth: .infinity)
            }
            .scrollDismissesKeyboard(.interactively)
        }
        .background(GradeCrewDesignTokens.Colors.background)
        .onChange(of: capture.flow.status) { newStatus in
            guard newStatus == .transcribed else { return }
            let transcript = capture.flow.transcript.trimmingCharacters(in: .whitespacesAndNewlines)
            guard !transcript.isEmpty else { return }
            switch speechTarget {
            case .remy:
                pendingTranscript = transcript
                capture.cancel()
                Task { await prepareTranscript(transcript) }
            case .wishes:
                let current = draft.wishes.trimmingCharacters(in: .whitespacesAndNewlines)
                draft.wishes = current.isEmpty ? transcript : "\(current)\n\(transcript)"
                capture.cancel()
                Task { await syncDraftToWebForm() }
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
        .onDisappear { clearConversation() }
    }

    private var remyVoiceCard: some View {
        VStack(spacing: 3) {
            Button(action: toggleRemyRecording) {
                VStack(spacing: 0) {
                    Image(GradeCrewAssets.NativeImage.remyMicrophone)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 220, height: 220)
                        .contentShape(Rectangle())
                    Text(status == .recording ? "Ich höre zu …" : "Sprich mir schnell ein, was du willst.")
                        .font(.system(size: 16, weight: .medium, design: .rounded))
                        .foregroundStyle(GradeCrewDesignTokens.Colors.text)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 14)
                        .padding(.bottom, 14)
                }
                .frame(maxWidth: .infinity)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .disabled(recoveryChecking || unresolvedSubmission || workStatus == .preparing || workStatus == .accepted || status == .transcribing || status == .requestingPermission)
            .accessibilityLabel(status == .recording ? "Aufnahme beenden" : "Remy antippen und Testwunsch einsprechen")
            if status == .requestingPermission || status == .transcribing || workStatus == .recovering || workStatus == .preparing {
                ProgressView(workStatus == .preparing ? "Remy trägt deine Angaben ein …" : "")
                    .controlSize(.small).tint(GradeCrewDesignTokens.Colors.primary)
                    .padding(.bottom, 12)
            }
            if workStatus == .needsInfo {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Remy fragt kurz nach").font(.headline)
                    Text(workError ?? "Ergänze die fehlenden Angaben oben im Formular.")
                        .font(.subheadline).foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                    if countSuggestionChips {
                        HStack {
                            ForEach([5, 10, 15], id: \.self) { value in
                                Button("\(value) Aufgaben") { Task { await chooseTaskCount(value) } }
                                    .buttonStyle(.borderedProminent).tint(GradeCrewDesignTokens.Colors.soft)
                                    .foregroundStyle(GradeCrewDesignTokens.Colors.primary)
                            }
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(12)
                .background(GradeCrewDesignTokens.Colors.background, in: RoundedRectangle(cornerRadius: 12))
                .padding(.horizontal, 12).padding(.bottom, 12)
            }
        }
        .background(GradeCrewDesignTokens.Colors.surface, in: RoundedRectangle(cornerRadius: 22))
    }

    private var nativeTestForm: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Dein Test").font(.system(size: 19, weight: .bold, design: .rounded)).foregroundStyle(GradeCrewDesignTokens.Colors.text)
            HStack(spacing: 10) {
                nativeField("Fach", text: $draft.subject)
                nativeField("Klasse", text: $draft.grade)
            }
            HStack(spacing: 10) {
                nativeField("Schulart", text: $draft.schoolType)
                nativeField("Bundesland", text: $draft.region)
            }
            nativeField("Thema", text: $draft.topic)
            HStack(spacing: 10) {
                nativeField("Aufgaben", text: $draft.count, keyboard: .numberPad)
                nativeField("Gesamtpunkte", text: $draft.points, keyboard: .decimalPad)
            }
            HStack {
                Text("Schwierigkeit").font(.subheadline.weight(.medium)).foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                Spacer()
                Picker("Schwierigkeit", selection: $draft.difficulty) {
                    Text("Leicht").tag("leicht")
                    Text("Mittel").tag("mittel")
                    Text("Anspruchsvoll").tag("anspruchsvoll")
                    Text("Gemischt").tag("gemischt")
                }.pickerStyle(.menu)
            }
            nativeField("Aufgaben mit Bild (0–5)", text: $draft.imageQuestionCount, keyboard: .numberPad)
            DisclosureGroup("Aufgabentypen (\(allowedTypes.count))") {
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], alignment: .leading, spacing: 7) {
                    ForEach(questionTypes, id: \.0) { value, title in
                        Toggle(title, isOn: Binding(
                            get: { allowedTypes.contains(value) },
                            set: { enabled in if enabled { allowedTypes.insert(value) } else { allowedTypes.remove(value) } }
                        )).font(.caption)
                    }
                }.padding(.top, 8)
            }
            .font(.subheadline.weight(.medium)).foregroundStyle(GradeCrewDesignTokens.Colors.text)
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("Eigene Wünsche (optional)").font(.subheadline.weight(.medium)).foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                    Spacer()
                    Button(action: toggleWishesRecording) {
                        Image(systemName: status == .recording && speechTarget == .wishes ? "stop.circle.fill" : "mic.circle.fill")
                            .font(.system(size: 28)).foregroundStyle(GradeCrewDesignTokens.Colors.primary)
                    }
                    .buttonStyle(.plain)
                    .disabled(status == .recording && speechTarget != .wishes || status == .transcribing || status == .requestingPermission)
                    .accessibilityLabel("Eigene Wünsche einsprechen")
                }
                wishesEditor
            }
            if let visibleTranscript = pendingTranscript, !visibleTranscript.isEmpty {
                Text(visibleTranscript).font(.caption).foregroundStyle(GradeCrewDesignTokens.Colors.muted).lineLimit(2)
            }
            submitButton
            if workStatus == .failed, let workError { Text(workError).font(.footnote).foregroundStyle(GradeCrewDesignTokens.Colors.danger) }
        }
        .padding(14)
        .background(GradeCrewDesignTokens.Colors.surface, in: RoundedRectangle(cornerRadius: 18))
        .onChange(of: draftSyncKey) { _ in scheduleDraftSync() }
    }

    private var draftSyncKey: String {
        let fields = [draft.subject, draft.grade, draft.schoolType, draft.region, draft.topic,
                      draft.count, draft.points, draft.difficulty, draft.imageQuestionCount,
                      draft.wishes, allowedTypes.sorted().joined(separator: ",")]
        return fields.joined(separator: "\u{1F}")
    }

    private func scheduleDraftSync() {
        Task { await syncDraftToWebForm() }
    }

    private var wishesEditor: some View {
        TextEditor(text: $draft.wishes)
            .frame(minHeight: 72, maxHeight: 112)
            .padding(6)
            .scrollContentBackground(.hidden)
            .background(GradeCrewDesignTokens.Colors.background, in: RoundedRectangle(cornerRadius: 10))
    }

    private var submitButton: some View {
        Button {
            Task { await submitTest() }
        } label: {
            HStack(spacing: 8) {
                if workStatus == .preparing {
                    ProgressView().tint(.white)
                }
                Text(workStatus == .accepted ? "Testauftrag übergeben" : "Test erstellen")
            }
            .font(.system(size: 17, weight: .semibold))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(GradeCrewDesignTokens.Colors.primary, in: Capsule())
        }
        .buttonStyle(.plain)
        .disabled(
            draft.preparedRequest == nil || !aiFormReady || recoveryChecking ||
            unresolvedSubmission || workStatus == .preparing || workStatus == .accepted
        )
    }

    private func nativeField(_ title: String, text: Binding<String>, keyboard: UIKeyboardType = .default) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title).font(.caption.weight(.medium)).foregroundStyle(GradeCrewDesignTokens.Colors.muted)
            TextField(title, text: text)
                .keyboardType(keyboard)
                .textFieldStyle(.plain)
                .padding(.horizontal, 11).frame(height: 44)
                .background(GradeCrewDesignTokens.Colors.background, in: RoundedRectangle(cornerRadius: 10))
        }.frame(maxWidth: .infinity, alignment: .leading)
    }

    private var retryButton: some View {
        Button(recoveryNeedsRetry ? "Auftrag erneut abgleichen" : (conversationText.isEmpty ? "Erneut laden" : "Remy erneut fragen")) {
            Task {
                if recoveryNeedsRetry { await recoverPendingSubmission() }
                else if conversationText.isEmpty { await openAiForm() }
                else { await retryPreparation() }
            }
        }.buttonStyle(.bordered)
    }

    private var navigationHeader: some View {
        HStack {
            Button(action: onBack) {
                Label("Start", systemImage: "chevron.left")
                    .font(.system(size: 17, weight: .medium)).foregroundStyle(GradeCrewDesignTokens.Colors.primary)
                    .padding(.horizontal, 15).frame(height: 48)
                    .background(GradeCrewDesignTokens.Colors.soft, in: Capsule())
            }
            .buttonStyle(.plain)
            Spacer()
            Text("Remy fragen").font(.system(size: 19, weight: .bold, design: .rounded)).foregroundStyle(GradeCrewDesignTokens.Colors.text)
            Spacer()
            Color.clear.frame(width: 52, height: 52).accessibilityHidden(true)
        }
        .padding(.horizontal, GradeCrewDesignTokens.Spacing.lg).padding(.vertical, GradeCrewDesignTokens.Spacing.sm)
        .background(GradeCrewDesignTokens.Colors.background)
    }

    private func toggleRemyRecording() {
        if status == .recording { capture.stop(); return }
        speechTarget = .remy
        pendingTranscript = nil
        Task { await capture.start() }
    }

    private func toggleWishesRecording() {
        if status == .recording && speechTarget == .wishes { capture.stop(); return }
        guard canStartRecording else { return }
        speechTarget = .wishes
        Task { await capture.start() }
    }

    private var countSuggestionChips: Bool {
        workStatus == .needsInfo && missingFields.contains("count") && Int(draft.count) == nil
    }

    private func syncDraftToWebForm() async {
        guard aiFormReady else { return }
        do {
            _ = try await invoke("populateAiForm", payload: ["draft": draft.knownFieldsPayload, "allowedTypes": Array(allowedTypes)])
        } catch { /* The creation action reports a clear error if synchronization is unavailable. */ }
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
                let returned = QuickRemyDraft(payload: fields)
                if !returned.subject.isEmpty { draft.subject = returned.subject }
                if !returned.grade.isEmpty { draft.grade = returned.grade }
                if !returned.topic.isEmpty { draft.topic = returned.topic }
                if !returned.count.isEmpty { draft.count = returned.count }
                if !returned.wishes.isEmpty { draft.wishes = returned.wishes }
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
    private func submitTest() async {
        guard draft.preparedRequest != nil else { return }
        do {
            let fields = try await invoke("populateAiForm", payload: ["draft": draft.knownFieldsPayload, "allowedTypes": Array(allowedTypes)])
            guard fields["status"] as? String == "ready" else { throw quickRemyError("Deine Angaben konnten nicht übernommen werden.") }
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
