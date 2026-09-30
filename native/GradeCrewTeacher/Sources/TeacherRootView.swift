import SwiftUI

struct TeacherRootView: View {
    @AppStorage(GradeCrewBetaEnvironment.preferenceKey) private var previewPreference = ""
    @State private var isLoading = true
    @State private var loadError: String?
    @State private var reloadID = 0
    @State private var showBetaSettings = false
    @State private var pendingPreview = ""
    @State private var settingsError: String?

    private var homeURL: URL {
        GradeCrewBetaEnvironment.homeURL(preference: previewPreference, version: GradeCrewAppEnvironment.version)
    }

    var body: some View {
        ZStack(alignment: .top) {
            GradeCrewWebView(
                url: homeURL,
                reloadID: reloadID,
                isLoading: $isLoading,
                errorMessage: $loadError
            )

            if isLoading {
                ProgressView()
                    .progressViewStyle(.linear)
                    .tint(GradeCrewDesignTokens.Colors.primary)
                    .frame(maxWidth: .infinity)
                    .accessibilityLabel("GradeCrew wird geladen")
            }

            if let loadError {
                VStack(spacing: GradeCrewDesignTokens.Spacing.md) {
                    Image(systemName: "wifi.exclamationmark")
                        .font(.system(size: 34, weight: .semibold))
                        .foregroundStyle(GradeCrewDesignTokens.Colors.primary)
                    Text("GradeCrew konnte nicht geladen werden").font(.headline)
                    Text(loadError).font(.subheadline).multilineTextAlignment(.center)
                    Button("Erneut versuchen") {
                        self.loadError = nil
                        self.isLoading = true
                        reloadID += 1
                    }
                    .buttonStyle(.borderedProminent)
                }
                .padding(GradeCrewDesignTokens.Spacing.xl)
                .frame(maxWidth: 420)
                .background(.regularMaterial)
                .clipShape(RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.card, style: .continuous))
                .shadow(radius: 18, y: 8)
                .padding(GradeCrewDesignTokens.Spacing.xl)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .background(GradeCrewDesignTokens.Colors.background)
        .safeAreaInset(edge: .bottom, spacing: 0) {
            HStack(spacing: 12) {
                Text("Beta \(GradeCrewAppEnvironment.version) · \(previewPreference.isEmpty ? "Staging" : "Preview")")
                    .font(.caption).foregroundStyle(.secondary)
                Spacer()
                Button {
                    pendingPreview = previewPreference
                    settingsError = nil
                    showBetaSettings = true
                } label: { Label("Beta-Einstellungen", systemImage: "gearshape") }
                    .font(.caption).frame(minHeight: 44)
            }.padding(.horizontal, 16).background(.regularMaterial)
        }
        .sheet(isPresented: $showBetaSettings) {
            NavigationStack {
                Form {
                    Section("Aktuell geöffnet") {
                        Text(homeURL.host ?? "Staging").textSelection(.enabled)
                        Text("GradeCrew \(GradeCrewAppEnvironment.version)").foregroundStyle(.secondary)
                    }
                    Section("Staging-Preview") {
                        Text("Füge die Preview-Adresse aus dem Deploy ein. Du testest dann diese Version direkt in der App. Ein anderer Server benötigt eine eigene Anmeldung.")
                        TextField("https://hausaufgabe-staging--….web.app", text: $pendingPreview)
                            .keyboardType(.URL).textInputAutocapitalization(.never).autocorrectionDisabled()
                        if let settingsError { Text(settingsError).foregroundStyle(.red) }
                        Button("Preview öffnen") {
                            guard let url = GradeCrewBetaEnvironment.previewURL(from: pendingPreview) else {
                                settingsError = "Bitte eine HTTPS-Preview-Adresse von hausaufgabe-staging verwenden."
                                return
                            }
                            previewPreference = url.absoluteString
                            loadError = nil
                            isLoading = true
                            reloadID += 1
                            showBetaSettings = false
                        }
                        Button("Normales Staging öffnen") {
                            previewPreference = ""
                            loadError = nil
                            isLoading = true
                            reloadID += 1
                            showBetaSettings = false
                        }
                    }
                    Section {
                        Text("Beim Wechsel wird die Seite neu geladen. Speichere vorher offene Änderungen.")
                    }
                }
                .navigationTitle("GradeCrew Beta")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Schließen") { showBetaSettings = false } } }
            }
        }
    }
}
