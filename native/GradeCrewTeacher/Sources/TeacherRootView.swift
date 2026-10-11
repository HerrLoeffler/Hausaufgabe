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
    @State private var homeNavigation = GradeCrewHomeNavigation()
    @State private var quickRemyCall: GradeCrewQuickRemyCall?

    private var authState: GradeCrewNativeBridgePolicy.AuthState { homeNavigation.authState }
    private var route: GradeCrewHomeNavigation.Route { homeNavigation.route }

    private var homeURL: URL {
        GradeCrewBetaEnvironment.homeURL(preference: previewPreference, version: GradeCrewAppEnvironment.version)
    }

    private var environmentLabel: String {
        GradeCrewBetaEnvironment.environmentLabel(for: previewPreference)
    }

    private var buildNumber: String {
        Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String ?? "?"
    }

    private var isAuthRestored: Bool { homeNavigation.isAuthRestored }

    var body: some View {
        ZStack {
            GradeCrewWebView(
                url: homeURL,
                reloadID: reloadID,
                isLoading: $isLoading,
                errorMessage: $loadError,
                onShowDiagnostics: openDiagnostics,
                onLoadedURLChanged: { loadedHost = $0?.host },
                onWebManifestCommitChanged: { webManifestCommit = $0 },
                onAuthStateChanged: receiveAuthState,
                onQuickRemyBridgeReady: { quickRemyCall = $0 }
            )
            .opacity(route == .workspace ? 1 : 0)
            .allowsHitTesting(route == .workspace)
            .safeAreaInset(edge: .top, spacing: 0) {
                if route == .workspace {
                    HStack {
                        Button {
                            homeNavigation.showHome()
                        } label: {
                            Label("Start", systemImage: "house.fill")
                        }
                        .buttonStyle(.bordered)
                        Spacer()
                        Text("GradeCrew")
                            .font(.headline)
                            .foregroundStyle(GradeCrewDesignTokens.Colors.text)
                    }
                    .padding(.horizontal, GradeCrewDesignTokens.Spacing.lg)
                    .padding(.vertical, GradeCrewDesignTokens.Spacing.sm)
                    .background(.regularMaterial)
                }
            }

            if route == .home {
                homeScreen
                    .transition(.opacity)
            } else if route == .quickRemy {
                QuickRemyView(onBack: { homeNavigation.showHome() }, call: quickRemyCall)
                    .transition(.opacity)
            }
        }
        .background(GradeCrewDesignTokens.Colors.background)
        .animation(.easeInOut(duration: 0.18), value: route)
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

    private var homeScreen: some View {
        VStack(spacing: GradeCrewDesignTokens.Spacing.xxl) {
            VStack(spacing: GradeCrewDesignTokens.Spacing.sm) {
                Image(systemName: "sparkles")
                    .font(.system(size: 44, weight: .semibold))
                    .foregroundStyle(GradeCrewDesignTokens.Colors.primary)
                    .frame(width: 76, height: 76)
                    .accessibilityHidden(true)
                Text("GradeCrew")
                    .font(.system(size: GradeCrewDesignTokens.Typography.brand, weight: .bold, design: .rounded))
                    .foregroundStyle(GradeCrewDesignTokens.Colors.text)
                accountStatus
            }
            .padding(.top, GradeCrewDesignTokens.Spacing.xxxl)

            HStack(spacing: GradeCrewDesignTokens.Spacing.lg) {
                actionCard(
                    title: "Remy fragen",
                    subtitle: "Testwunsch kurz einsprechen",
                    symbol: "mic.fill",
                    tint: GradeCrewDesignTokens.Colors.crewRust,
                    action: openRemy
                )
                actionCard(
                    title: "GradeCrew öffnen",
                    subtitle: "Tests ansehen und bearbeiten",
                    symbol: "rectangle.grid.2x2.fill",
                    tint: GradeCrewDesignTokens.Colors.primary,
                    action: openWorkspace
                )
            }
            .frame(maxWidth: 760)
            .padding(.horizontal, GradeCrewDesignTokens.Spacing.lg)

            if case .checking = authState {
                Label("Anmeldung wird geprüft …", systemImage: "arrow.triangle.2.circlepath")
                    .font(.footnote)
                    .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                    .accessibilityLabel("Gespeicherte Anmeldung wird geprüft. Aktionen sind noch gesperrt.")
            }

            if let loadError {
                VStack(spacing: GradeCrewDesignTokens.Spacing.sm) {
                    Text("GradeCrew ist gerade nicht erreichbar.")
                        .font(.subheadline.weight(.semibold))
                    Text(loadError)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                    Button("Erneut versuchen") {
                        self.loadError = nil
                        self.isLoading = true
                        homeNavigation.beginAuthCheck()
                        reloadID += 1
                    }
                    .buttonStyle(.bordered)
                }
                .padding(GradeCrewDesignTokens.Spacing.lg)
                .frame(maxWidth: 520)
                .background(GradeCrewDesignTokens.Colors.surface, in: RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.card))
                .padding(.horizontal, GradeCrewDesignTokens.Spacing.lg)
            }
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(GradeCrewDesignTokens.Colors.background.ignoresSafeArea())
    }

    @ViewBuilder
    private var accountStatus: some View {
        switch authState {
        case .checking:
            Text("Anmeldung wird wiederhergestellt")
                .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
        case let .signedIn(accountLabel, _):
            Label(accountLabel, systemImage: "person.crop.circle.fill")
                .lineLimit(1)
                .truncationMode(.middle)
                .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                .accessibilityLabel("Angemeldet als \(accountLabel)")
        case .signedOut:
            Text("Bitte anmelden, um GradeCrew zu verwenden")
                .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
        }
    }

    private func actionCard(title: String, subtitle: String, symbol: String, tint: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: GradeCrewDesignTokens.Spacing.md) {
                Image(systemName: symbol)
                    .font(.system(size: 30, weight: .semibold))
                    .foregroundStyle(tint)
                    .frame(height: 38)
                Text(title)
                    .font(.system(size: GradeCrewDesignTokens.Typography.cardTitle, weight: .semibold))
                    .foregroundStyle(GradeCrewDesignTokens.Colors.text)
                    .multilineTextAlignment(.center)
                Text(subtitle)
                    .font(.system(size: GradeCrewDesignTokens.Typography.body))
                    .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .frame(maxWidth: .infinity, minHeight: 176)
            .padding(GradeCrewDesignTokens.Spacing.lg)
            .background(GradeCrewDesignTokens.Colors.surface, in: RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.largeCard))
            .overlay {
                RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.largeCard)
                    .stroke(GradeCrewDesignTokens.Colors.border, lineWidth: 1)
            }
        }
        .buttonStyle(.plain)
        .disabled(!isAuthRestored)
        .opacity(isAuthRestored ? 1 : 0.55)
        .accessibilityHint(isAuthRestored ? subtitle : "Aktionen verfügbar, sobald die Anmeldung geprüft wurde.")
    }

    private func receiveAuthState(_ newState: GradeCrewNativeBridgePolicy.AuthState) {
        homeNavigation.receive(newState)
    }

    private func openRemy() { homeNavigation.openRemy() }

    private func openWorkspace() { homeNavigation.openWorkspace() }

    private func openDiagnostics() {
        pendingPreview = previewPreference == GradeCrewBetaEnvironment.stablePreference ? "" : previewPreference
        settingsError = nil
        showBetaSettings = true
    }

    private func reloadAndCloseDiagnostics() {
        loadError = nil
        isLoading = true
        homeNavigation.beginAuthCheck()
        reloadID += 1
        showBetaSettings = false
    }
}
