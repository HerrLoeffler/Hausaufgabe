import SwiftUI
import UniformTypeIdentifiers

struct QuickRemyView: View {
    @Environment(\.scenePhase) private var scenePhase
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @State private var showMedia = false
    @State private var showTypes = false
    @State private var showMaterials = false
    @State private var showPreferences = false
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

    private enum RemyWorkStatus { case idle, recovering, preparing, submitting, needsInfo, readyForReview, accepted, failed }
    private enum SpeechTarget { case remy, wishes }
    @State private var speechTarget: SpeechTarget = .remy
    @State private var allowedTypes: Set<String> = ["single", "multi", "dropdown", "truefalse", "gapfill", "matching", "ordering", "grouping", "markwords"]
    @State private var expectedMedia: [String: Int] = [:]
    @State private var formSession: String?
    @State private var materialNames: [String] = []
    @State private var materialConfirmed = false
    @State private var isUploadingMaterial = false
    @State private var materialError: String?
    @State private var personalPreferences = ""
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
                .gcLayout("remy.content", role: "center")
                .frame(maxWidth: GradeCrewLayoutGuides.formMaxWidth)
                .frame(maxWidth: .infinity)
            }
            .gcLayout("remy.scroll.viewport", role: "viewport")
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
            // Permission sheets briefly make the app inactive. Preserve the request and draft.
            if phase == .background {
                if status == .recording { capture.stop() }
                else if status == .requestingPermission { capture.cancel() }
            }
        }
        .task {
            await recoverPendingSubmission()
            await openAiForm()
        }
        .onDisappear { workGeneration = UUID(); capture.cancel() }

    }

    private var remyVoiceCard: some View {
        VStack(spacing: 3) {
            Button(action: toggleRemyRecording) {
                VStack(spacing: 0) {
                    Image(GradeCrewAssets.NativeImage.remyMicrophone)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 220, height: 220)
                        .gcLayout("remy.portrait", role: "center")
                        .contentShape(Rectangle())
                    Text(status == .recording ? "Ich höre zu … Zum Beenden antippen." : "Sprich mir schnell ein, was du willst.")
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
            .disabled(recoveryChecking || unresolvedSubmission || isUploadingMaterial || workStatus == .preparing || workStatus == .submitting || workStatus == .accepted || status == .transcribing || status == .requestingPermission)
            .accessibilityLabel(status == .recording ? "Aufnahme beenden" : "Remy antippen und Testwunsch einsprechen")
            speechFeedback
            if status == .requestingPermission || status == .transcribing || workStatus == .recovering || workStatus == .preparing {
                ProgressView(workStatus == .preparing ? "Remy prüft deine Angaben …" : "")
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

    private func optionSection<Content: View>(_ title: String, expanded: Binding<Bool>, @ViewBuilder content: @escaping () -> Content) -> some View {
        DisclosureGroup(isExpanded: expanded, content: content) {
            Text(title)
                .fixedSize(horizontal: false, vertical: true)
                .frame(maxWidth: .infinity, minHeight: GradeCrewLayoutGuides.minimumTapSize, alignment: .leading)
                .contentShape(Rectangle())
                .gcLayout("remy.disclosure.\(title)", role: "control")
        }
    }

    private var nativeTestForm: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Dein Test").font(.system(size: 19, weight: .bold, design: .rounded)).foregroundStyle(GradeCrewDesignTokens.Colors.text)
            coreFields
            mediaOptions
            questionTypePicker
            wishesSection
            materialsSection
            optionSection("Persönliche KI-Vorgaben", expanded: $showPreferences) {
                TextEditor(text: $personalPreferences).frame(height: 70)
            }
            submitButton
            if workStatus == .failed, let workError { Text(workError).font(.footnote).foregroundStyle(GradeCrewDesignTokens.Colors.danger) }
        }
        .padding(14)
        .background(GradeCrewDesignTokens.Colors.surface, in: RoundedRectangle(cornerRadius: 18))
        .onChange(of: draftSyncKey) { _ in scheduleDraftSync() }
    }

    private var fieldPairLayout: AnyLayout {
        dynamicTypeSize.isAccessibilitySize
            ? AnyLayout(VStackLayout(alignment: .leading, spacing: 10))
            : AnyLayout(HStackLayout(spacing: 10))
    }

    private var coreFields: some View {
        Group {
            fieldPairLayout {
                nativeField("Fach", text: $draft.subject)
                nativeField("Klasse", text: $draft.grade)
            }
            fieldPairLayout {
                nativeField("Schulart", text: $draft.schoolType)
                nativeField("Bundesland", text: $draft.region)
            }
            nativeField("Thema", text: $draft.topic)
            fieldPairLayout {
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
        }
    }

    private var questionTypePicker: some View {
            optionSection("Aufgabentypen (\(allowedTypes.count))", expanded: $showTypes) {
                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: dynamicTypeSize.isAccessibilitySize ? 1 : 2), alignment: .leading, spacing: 7) {
                    ForEach(questionTypes, id: \.0) { value, title in
                        Toggle(title, isOn: Binding(
                            get: { allowedTypes.contains(value) },
                            set: { enabled in if enabled { allowedTypes.insert(value) } else { allowedTypes.remove(value) } }
                        )).font(.caption)
                            .frame(minHeight: GradeCrewLayoutGuides.minimumTapSize)
                            .gcLayout("remy.type.\(value)", role: "control")
                    }
                }.padding(.top, 8)
            }
            .font(.subheadline.weight(.medium)).foregroundStyle(GradeCrewDesignTokens.Colors.text)
    }

    private var wishesSection: some View {
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("Eigene Wünsche (optional)").font(.subheadline.weight(.medium)).foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                    Spacer()
                    Button(action: toggleWishesRecording) {
                        Image(systemName: status == .recording && speechTarget == .wishes ? "stop.circle.fill" : "mic.circle.fill")
                            .font(.system(size: 28)).foregroundStyle(GradeCrewDesignTokens.Colors.primary)
                            .frame(minWidth: 44, minHeight: 44)
                    }
                    .buttonStyle(.plain)
                    .disabled(status == .recording && speechTarget != .wishes || status == .transcribing || status == .requestingPermission)
                    .accessibilityLabel("Eigene Wünsche einsprechen")
                    .gcLayout("remy.wishes.microphone", role: "tap", parent: "remy.scroll.viewport")
                }
                wishesEditor
            }
    }

    private var draftSyncKey: String {
        let fields = [draft.subject, draft.grade, draft.schoolType, draft.region, draft.topic,
                      draft.count, draft.points, draft.difficulty, draft.imageQuestionCount,
                      draft.wishes, draft.audioQuestionCount, draft.audioAnswerQuestionCount, draft.materialMode,
                      personalPreferences, allowedTypes.sorted().joined(separator: ",")]
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

    @ViewBuilder
    private var speechFeedback: some View {
        if let text = heardText {
            Text(text).font(.footnote).foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 14).padding(.bottom, 10)
                .accessibilityLabel("Erkannter Text: \(text)")
        }
        if let message = speechFailureMessage {
            Text(message).font(.footnote).foregroundStyle(GradeCrewDesignTokens.Colors.danger)
                .padding(.horizontal, 14).padding(.bottom, 10)
        }
    }

    private var heardText: String? {
        if !capture.flow.transcript.isEmpty { return capture.flow.transcript }
        return pendingTranscript
    }

    private var speechFailureMessage: String? {
        switch status {
        case .permissionDenied: return "Bitte Mikrofon und Spracherkennung in den App-Einstellungen erlauben."
        case .recognizerUnavailable, .onDeviceRecognitionUnavailable: return "Deutsche Spracherkennung ist auf diesem Gerät gerade nicht verfügbar."
        case .emptyTranscript: return "Ich habe keine Wörter gehört. Tippe mich an und versuche es noch einmal."
        case .failed: return "Die Aufnahme konnte nicht erkannt werden. Bitte noch einmal versuchen."
        default: return nil
        }
    }

    private var mediaOptions: some View {
        optionSection(mediaSummary, expanded: $showMedia) {
            VStack(spacing: 10) {
                nativeField("Aufgaben mit Bild (0–5)", text: $draft.imageQuestionCount, keyboard: .numberPad)
                nativeField("Höraufgaben (0–5)", text: $draft.audioQuestionCount, keyboard: .numberPad)
                nativeField("Vorgelesene Antworten (0–5)", text: $draft.audioAnswerQuestionCount, keyboard: .numberPad)
            }.padding(.top, 8)
        }
    }

    private var materialsSection: some View {
        optionSection("Material hinzufügen\(materialNames.isEmpty ? "" : " (\(materialNames.count))")", expanded: $showMaterials) {
            VStack(alignment: .leading, spacing: 10) {
                Toggle("Ich darf das Material an OpenAI übermitteln; es enthält keine personenbezogenen Daten.", isOn: $materialConfirmed).font(.caption)
                    .frame(minHeight: GradeCrewLayoutGuides.minimumTapSize)
                    .gcLayout("remy.material.permission", role: "control")
                QuickRemyMaterialPicker(
                    enabled: materialConfirmed && aiFormReady && workStatus != .submitting && workStatus != .preparing,
                    remainingSlots: 5 - materialNames.count,
                    uploading: isUploadingMaterial,
                    onFiles: uploadMaterials,
                    onImage: uploadImage,
                    onError: { materialError = $0 }
                )
                Text("PDF, Bild, Text, Word, PowerPoint oder Tabelle · bis zu 5 Dateien, je 15 MB")
                    .font(.caption).foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                ForEach(Array(materialNames.enumerated()), id: \.offset) { index, name in
                    HStack {
                        Text(name).font(.caption).lineLimit(1)
                        Spacer()
                        Button { Task { await removeMaterial(index) } } label: { Image(systemName: "xmark.circle") }
                            .disabled(isUploadingMaterial || workStatus == .submitting)
                            .accessibilityLabel("\(name) entfernen")
                    }
                }
                if !materialNames.isEmpty {
                    Picker("Material verwenden", selection: $draft.materialMode) {
                        Text("Als Anregung").tag("inspiration")
                        Text("Nur Inhalte aus dem Material").tag("only")
                    }.pickerStyle(.menu)
                }
                if let materialError { Text(materialError).font(.caption).foregroundStyle(GradeCrewDesignTokens.Colors.danger) }
            }.padding(.top, 8)
        }
    }

    private var mediaSummary: String {
        var parts: [String] = []
        if let n = Int(draft.imageQuestionCount), n > 0 { parts.append("\(n) Bilder") }
        if let n = Int(draft.audioQuestionCount), n > 0 { parts.append("\(n) Höraufgaben") }
        if let n = Int(draft.audioAnswerQuestionCount), n > 0 { parts.append("\(n) Audioantworten") }
        return parts.isEmpty ? "Bilder & Audio" : "Bilder & Audio · " + parts.joined(separator: " · ")
    }

    @MainActor
    private func uploadImage(_ data: Data, _ name: String) async {
        guard !isUploadingMaterial, materialConfirmed else { return }
        isUploadingMaterial = true
        materialError = nil
        defer { isUploadingMaterial = false }
        do {
            guard materialNames.count < 5, !data.isEmpty, data.count <= 15 * 1024 * 1024 else {
                throw quickRemyError("Bitte höchstens fünf Materialien mit jeweils bis zu 15 MB auswählen.")
            }
            let result = try await invoke("uploadMaterial", payload: ["name": name, "mimeType": "image/jpeg", "base64": data.base64EncodedString(), "confirmed": true])
            guard result["status"] as? String == "ready" else { throw quickRemyError("Das Foto wurde nicht bestätigt.") }
            materialNames = result["materialNames"] as? [String] ?? materialNames
        } catch { materialError = error.localizedDescription }
    }

    private var formPayload: [String: Any] {
        var fields = draft.knownFieldsPayload
        fields["subject"] = draft.subject
        fields["grade"] = draft.grade
        fields["topic"] = draft.topic
        fields["customNotes"] = draft.wishes
        fields["personalPreferences"] = personalPreferences
        return ["draft": fields, "allowedTypes": Array(allowedTypes), "materialConfirmed": materialConfirmed]
    }

    @MainActor
    private func uploadMaterials(_ urls: [URL]) async {
        guard !isUploadingMaterial, materialConfirmed else { return }
        isUploadingMaterial = true
        materialError = nil
        defer { isUploadingMaterial = false }
        do {
            for url in urls {
                guard materialNames.count < 5 else { throw quickRemyError("Maximal fünf Materialien pro Test.") }
                let access = url.startAccessingSecurityScopedResource()
                defer { if access { url.stopAccessingSecurityScopedResource() } }
                let size = try url.resourceValues(forKeys: [.fileSizeKey]).fileSize ?? 0
                guard size > 0, size <= 15 * 1024 * 1024 else { throw quickRemyError("\(url.lastPathComponent): Bitte eine Datei bis 15 MB wählen.") }
                let bytes = try Data(contentsOf: url)
                let mime = UTType(filenameExtension: url.pathExtension)?.preferredMIMEType ?? "application/octet-stream"
                let result = try await invoke("uploadMaterial", payload: ["name": url.lastPathComponent, "mimeType": mime, "base64": bytes.base64EncodedString(), "confirmed": true])
                guard result["status"] as? String == "ready" else { throw quickRemyError("Das Material wurde nicht bestätigt.") }
                materialNames = result["materialNames"] as? [String] ?? materialNames
            }
        } catch { materialError = error.localizedDescription }
    }

    @MainActor
    private func removeMaterial(_ index: Int) async {
        guard !isUploadingMaterial else { return }
        isUploadingMaterial = true
        defer { isUploadingMaterial = false }
        do {
            let result = try await invoke("removeMaterial", payload: ["index": index])
            materialNames = result["materialNames"] as? [String] ?? materialNames
            materialError = nil
        } catch { materialError = error.localizedDescription }
    }

    private var submitButton: some View {
        Button {
            Task { await submitTest() }
        } label: {
            HStack(spacing: 8) {
                if workStatus == .submitting {
                    ProgressView().tint(.white)
                }
                Text(workStatus == .submitting ? "Wird übergeben …" : "Test erstellen")
            }
            .font(.system(size: 17, weight: .semibold))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(GradeCrewDesignTokens.Colors.primary, in: Capsule())
        }
        .buttonStyle(.plain)
        .gcLayout("remy.submit", role: "tap", parent: "remy.scroll.viewport")
        .disabled(
            draft.preparedRequest == nil || !aiFormReady || recoveryChecking ||
            unresolvedSubmission || workStatus == .preparing || workStatus == .submitting || workStatus == .accepted || isUploadingMaterial
        )
    }

    private func nativeField(_ title: String, text: Binding<String>, keyboard: UIKeyboardType = .default) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title).font(.caption.weight(.medium)).foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                .fixedSize(horizontal: false, vertical: true)
                .gcLayout("remy.label.\(title)")
            TextField(title, text: text)
                .keyboardType(keyboard)
                .textFieldStyle(.plain)
                .padding(.horizontal, 11).padding(.vertical, 10).frame(minHeight: GradeCrewLayoutGuides.minimumTapSize)
                .background(GradeCrewDesignTokens.Colors.background, in: RoundedRectangle(cornerRadius: 10))
                .gcLayout("remy.input.\(title)", role: "textInput")
        }.frame(maxWidth: .infinity, alignment: .leading)
            .gcLayout("remy.field.\(title)", role: "field")
    }

    private var retryButton: some View {
        Button(recoveryNeedsRetry ? "Auftrag erneut abgleichen" : (conversationText.isEmpty ? "Erneut laden" : "Remy erneut fragen")) {
            Task {
                if recoveryNeedsRetry { await recoverPendingSubmission() }
                else if conversationText.isEmpty { await openAiForm() }
                else { await retryPreparation() }
            }
        }.buttonStyle(.bordered)
            .frame(minHeight: GradeCrewLayoutGuides.minimumTapSize)
            .gcLayout("remy.retry", role: "tap", parent: "remy.scroll.viewport")
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
            .disabled(workStatus == .submitting)
            .frame(width: 92)
            .gcLayout("remy.back", role: "tap")
            Text("Remy fragen").font(.system(size: 19, weight: .bold, design: .rounded)).foregroundStyle(GradeCrewDesignTokens.Colors.text)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
                .frame(maxWidth: .infinity)
                .gcLayout("remy.nav.title", role: "center", text: "Remy fragen", fontSize: 19)
            Color.clear.frame(width: 92, height: 52).accessibilityHidden(true)
        }
        .padding(.horizontal, GradeCrewDesignTokens.Spacing.lg).padding(.vertical, GradeCrewDesignTokens.Spacing.sm)
        .background(GradeCrewDesignTokens.Colors.background)
    }

    private func toggleRemyRecording() {
        if status == .recording { capture.stop(); return }
        speechTarget = .remy
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
        guard aiFormReady, workStatus != .submitting else { return }
        do {
            _ = try await invoke("populateAiForm", payload: formPayload)
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
            formSession = result["formSession"] as? String
            if personalPreferences.isEmpty { personalPreferences = result["personalPreferences"] as? String ?? "" }
            materialNames = result["materialNames"] as? [String] ?? []
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
        expectedMedia.merge(draft.applySpeechHints(segment, expectingCount: missingFields.contains("count"))) { _, latest in latest }
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
            let verification = try await invoke("verifyDraft", payload: ["conversationText": conversationText, "draft": draft.knownFieldsPayload])
            guard workGeneration == token else { return }
            guard verification["status"] as? String == "checked", let patch = verification["patch"] as? [String: Any] else {
                throw quickRemyError("Remy konnte die Angaben noch nicht gegenprüfen. Bitte erneut versuchen.")
            }
            let mismatches = try draft.applyAssistantPatch(patch, expectedMedia: expectedMedia)
            let validTypes = Set(questionTypes.map { $0.0 })
            if let types = patch["allowedTypes"] as? [String], !types.isEmpty { allowedTypes = Set(types).intersection(validTypes) }
            if let exclude = patch["excludeTypes"] as? [String] { allowedTypes.subtract(exclude) }
            let synced = try await invoke("populateAiForm", payload: formPayload)
            guard synced["status"] as? String == "ready" else {
                throw quickRemyError("Remys Angaben konnten nicht in den Testeditor übernommen werden.")
            }
            if !mismatches.isEmpty {
                missingFields = []
                workError = "Bei der Bild- oder Audiozahl unterscheiden sich die Prüfungen. Bitte die sichtbaren Zahlen kurz prüfen und gegebenenfalls korrigieren."
                workStatus = .needsInfo
                return
            }
            if draft.preparedRequest != nil {
                missingFields = []
                workStatus = .readyForReview
                return
            }
            missingFields = ["subject", "grade", "topic", "count"].filter { field in
                switch field {
                case "subject": return draft.subject.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                case "grade": return draft.grade.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                case "topic": return draft.topic.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                default: return !(1...100).contains(Int(draft.count) ?? 0)
                }
            }
            let prompts = ["subject": "welches Fach", "grade": "welche Klasse", "topic": "welches Thema", "count": "wie viele Aufgaben"]
            workError = missingFields == ["count"] ? "Wie viele Aufgaben soll ich erstellen?" :
                "Bitte ergänze: " + missingFields.compactMap { prompts[$0] }.joined(separator: ", ") + "?"
            workStatus = .needsInfo

        } catch {
            guard workGeneration == token else { return }
            workError = error.localizedDescription
            workStatus = .failed
        }
    }

    @MainActor
    private func submitTest() async {
        guard workStatus != .submitting, !isUploadingMaterial else { return }
        if !materialNames.isEmpty && !materialConfirmed {
            workError = "Bitte die Prüfung der hochgeladenen Materialien bestätigen."
            workStatus = .failed
            return
        }
        if let error = draft.validationError(allowedTypes: allowedTypes) {
            workError = error
            workStatus = .failed
            return
        }
        workStatus = .submitting
        do {
            let fields = try await invoke("populateAiForm", payload: formPayload)
            guard fields["status"] as? String == "ready" else { throw quickRemyError("Deine Angaben konnten nicht übernommen werden.") }
            let verified = try await invoke("verifyAiForm", payload: formPayload)
            guard verified["status"] as? String == "checked" else { throw quickRemyError("Die Testangaben wurden noch nicht bestätigt.") }
            let result = try await invoke("createAiTest", payload: formPayload)
            guard result["status"] as? String == "accepted" else { throw quickRemyError("Der Testauftrag wurde noch nicht bestätigt.") }
            workStatus = .accepted
            workError = nil
            UINotificationFeedbackGenerator().notificationOccurred(.success)
            onBack()
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
            var scopedPayload = payload
            if let formSession { scopedPayload["formSession"] = formSession }
            call(action, scopedPayload) { result in continuation.resume(with: result) }
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

#if GRADECREW_LAYOUT_TESTS
extension QuickRemyView {
    init(layoutTestExpanded: Bool, call: GradeCrewQuickRemyCall? = nil) {
        self.init(onBack: {}, call: call)
        _showMedia = State(initialValue: layoutTestExpanded)
        _showTypes = State(initialValue: layoutTestExpanded)
        _showMaterials = State(initialValue: layoutTestExpanded)
        _showPreferences = State(initialValue: layoutTestExpanded)
        _materialConfirmed = State(initialValue: false)
        _draft = State(initialValue: QuickRemyDraft(payload: ["subject": "Deutsch", "grade": "8. Klasse", "topic": "Wortarten und Satzglieder", "count": 15, "customNotes": "Lustige Sätze und Beispiele aus dem Schulalltag.", "imageQuestionCount": 2, "audioQuestionCount": 2]))
    }
}
#endif
