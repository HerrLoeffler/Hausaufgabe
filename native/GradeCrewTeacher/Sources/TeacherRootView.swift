import SwiftUI

struct TeacherRootView: View {
    @AppStorage(GradeCrewBetaEnvironment.preferenceKey) private var previewPreference = ""
    @State private var isLoading = true
    @State private var loadError: String?
    @State private var reloadID = 0
    @State private var showBetaSettings = false
    @State private var pendingPreview = ""
    @State private var settingsError: String?
    @State private var loadedHost: String?
    @State private var webManifestCommit: String?

    private var homeURL: URL {
        GradeCrewBetaEnvironment.homeURL(preference: previewPreference, version: GradeCrewAppEnvironment.version)
    }

    private var environmentLabel: String {
        GradeCrewBetaEnvironment.environmentLabel(for: previewPreference)
    }

    private var buildNumber: String {
        Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String ?? "?"
    }

    var body: some View {
        ZStack(alignment: .top) {
            GradeCrewWebView(
                url: homeURL,
                reloadID: reloadID,
                isLoading: $isLoading,
                errorMessage: $loadError,
                onShowDiagnostics: openDiagnostics,
                onLoadedURLChanged: { loadedHost = $0?.host },
                onWebManifestCommitChanged: { webManifestCommit = $0 }
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
                    if environmentLabel != "Staging" {
                        Button("Normales Staging als Fallback öffnen") {
                            previewPreference = GradeCrewBetaEnvironment.stablePreference
                            self.loadError = nil
                            self.isLoading = true
                            reloadID += 1
                        }
                        .buttonStyle(.bordered)
                    }
                    Button("Diagnose") { openDiagnostics() }
                        .buttonStyle(.plain)
                        .font(.footnote)
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
        .sheet(isPresented: $showBetaSettings) {
            NavigationStack {
                Form {
                    Section("App") {
                        LabeledContent("Version", value: GradeCrewAppEnvironment.version)
                        LabeledContent("Build", value: buildNumber)
                        LabeledContent("Umgebung", value: environmentLabel)
                        LabeledContent("Native Schnittstelle", value: "1")
                    }
                    Section("Aktuell geöffnet") {
                        Text(loadedHost ?? "Noch keine Seite vollständig geladen").textSelection(.enabled)
                        Text("Web-Manifest: \(webManifestCommit ?? "noch nicht verifiziert")")
                            .font(.footnote).foregroundStyle(.secondary).textSelection(.enabled)
                        Text("Der Manifest-Commit beschreibt den ausgelieferten Webstand. Eine vollständige Prüfung aller geladenen Dateien und der Gerätetest sind separate Nachweise.")
                            .font(.footnote).foregroundStyle(.secondary)
                        Text("Die Diagnose ist im normalen App-Alltag unsichtbar. In der Webansicht mit zwei Fingern etwa eine Sekunde gedrückt halten, um sie erneut zu öffnen.")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                    Section("Automatischer Integrationsstand") {
                        Text("TestFlight öffnet standardmäßig den automatisch geprüften GradeCrew-Integrationskanal. Neue Webstände erscheinen dort nach grüner CI und verifiziertem Preview-Deploy, ohne neuen iOS-Build.")
                        Button("Aktuelle Integration öffnen") {
                            previewPreference = ""
                            reloadAndCloseDiagnostics()
                        }
                    }
                    Section("Andere Staging-Preview") {
                        Text("Nur für gezielte Tests: eine andere hausaufgabe-staging Preview-Adresse einsetzen. Production-Adressen werden abgewiesen.")
                        TextField("https://hausaufgabe-staging--….web.app", text: $pendingPreview)
                            .keyboardType(.URL)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                        if let settingsError { Text(settingsError).foregroundStyle(.red) }
                        Button("Andere Preview öffnen") {
                            guard let url = GradeCrewBetaEnvironment.previewURL(from: pendingPreview) else {
                                settingsError = "Bitte eine HTTPS-Preview-Adresse von hausaufgabe-staging verwenden."
                                return
                            }
                            previewPreference = url.absoluteString
                            reloadAndCloseDiagnostics()
                        }
                        Button("Normales Staging öffnen") {
                            previewPreference = GradeCrewBetaEnvironment.stablePreference
                            reloadAndCloseDiagnostics()
                        }
                    }
                    Section {
                        Text("Beim Wechsel wird die Seite neu geladen. Speichere vorher offene Änderungen.")
                    }
                }
                .navigationTitle("GradeCrew Diagnose")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Schließen") { showBetaSettings = false }
                    }
                }
            }
        }
    }

    private func openDiagnostics() {
        pendingPreview = previewPreference == GradeCrewBetaEnvironment.stablePreference ? "" : previewPreference
        settingsError = nil
        showBetaSettings = true
    }

    private func reloadAndCloseDiagnostics() {
        loadError = nil
        isLoading = true
        reloadID += 1
        showBetaSettings = false
    }
}
