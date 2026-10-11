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

    private var signInURL: URL {
        GradeCrewBetaEnvironment.signInURL(preference: previewPreference, version: GradeCrewAppEnvironment.version)
    }

    private var webURL: URL { route == .signIn ? signInURL : homeURL }

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
                url: webURL,
                reloadID: reloadID,
                isLoading: $isLoading,
                errorMessage: $loadError,
                onShowDiagnostics: openDiagnostics,
                onLoadedURLChanged: { loadedHost = $0?.host },
                onWebManifestCommitChanged: { webManifestCommit = $0 },
                onAuthStateChanged: receiveAuthState,
                onQuickRemyBridgeReady: { quickRemyCall = $0 }
            )
            .opacity(route == .workspace || route == .signIn ? 1 : 0)
            .allowsHitTesting(route == .workspace || route == .signIn)
            .safeAreaInset(edge: .top, spacing: 0) {
                if route == .workspace || route == .signIn {
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

    @ViewBuilder
    private var homeScreen: some View {
        switch authState {
        case .checking:
            authRestoringScreen
        case .signedOut:
            GradeCrewSignInScreen(
                loadError: loadError,
                onSignIn: { homeNavigation.openSignIn() },
                onRetry: retryWorkspace
            )
        case .signedIn(_, _):
            homeMenuScreen
        }
    }

    private var homeMenuScreen: some View {
        ScrollView {
            VStack(spacing: GradeCrewDesignTokens.Spacing.xxl) {
                VStack(spacing: GradeCrewDesignTokens.Spacing.md) {
                    Image(GradeCrewAssets.NativeImage.brandIcon)
                        .resizable()
                        .scaledToFit()
                        .frame(maxWidth: 260, maxHeight: 72)
                        .clipShape(Circle())
                        .accessibilityLabel("GradeCrew")
                    Text("Was möchtest du tun?")
                        .font(.system(size: GradeCrewDesignTokens.Typography.pageTitle, weight: .semibold, design: .rounded))
                        .foregroundStyle(GradeCrewDesignTokens.Colors.text)
                    accountStatus
                }
                .padding(.top, GradeCrewDesignTokens.Spacing.xxl)

                HStack(spacing: GradeCrewDesignTokens.Spacing.lg) {
                    actionCard(
                        title: "Remy fragen",
                        subtitle: "Testwunsch kurz einsprechen",
                        symbol: "mic.fill",
                        illustration: GradeCrewAssets.NativeImage.remyWelcome,
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

                if let loadError { connectionError(loadError) }
            }
            .frame(maxWidth: .infinity)
            .padding(.bottom, GradeCrewDesignTokens.Spacing.xxl)
        }
        .background(GradeCrewDesignTokens.Colors.background.ignoresSafeArea())
    }

    private var authRestoringScreen: some View {
        VStack(spacing: GradeCrewDesignTokens.Spacing.lg) {
            Image(GradeCrewAssets.NativeImage.brandIcon)
                .resizable()
                .scaledToFit()
                .frame(maxWidth: 260, maxHeight: 72)
                .clipShape(Circle())
                .accessibilityLabel("GradeCrew")
            ProgressView("Anmeldung wird wiederhergestellt …")
                .tint(GradeCrewDesignTokens.Colors.primary)
                .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                .accessibilityLabel("Gespeicherte GradeCrew-Anmeldung wird geprüft")
            if let loadError { connectionError(loadError) }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(GradeCrewDesignTokens.Spacing.xl)
        .background(GradeCrewDesignTokens.Colors.background.ignoresSafeArea())
    }

    private func connectionError(_ message: String) -> some View {
        VStack(spacing: GradeCrewDesignTokens.Spacing.sm) {
            Text("GradeCrew ist gerade nicht erreichbar.")
                .font(.subheadline.weight(.semibold))
            Text(message)
                .font(.footnote)
                .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                .multilineTextAlignment(.center)
            Button("Erneut versuchen", action: retryWorkspace)
                .buttonStyle(.bordered)
        }
        .padding(GradeCrewDesignTokens.Spacing.lg)
        .frame(maxWidth: 520)
        .background(GradeCrewDesignTokens.Colors.surface, in: RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.card))
        .padding(.horizontal, GradeCrewDesignTokens.Spacing.lg)
    }

    @ViewBuilder
    private var accountStatus: some View {
        switch authState {
        case let .signedIn(accountLabel, _):
            Label(accountLabel, systemImage: "person.crop.circle.fill")
                .lineLimit(1)
                .truncationMode(.middle)
                .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                .accessibilityLabel("Angemeldet als \(accountLabel)")
        case .checking, .signedOut:
            EmptyView()
        }
    }

    private func actionCard(title: String, subtitle: String, symbol: String, illustration: String? = nil, tint: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: GradeCrewDesignTokens.Spacing.md) {
                if let illustration {
                    ZStack(alignment: .bottomTrailing) {
                        Image(illustration)
                            .resizable()
                            .scaledToFit()
                            .frame(width: 104, height: 78)
                            .accessibilityHidden(true)
                        Image(systemName: symbol)
                            .font(.system(size: 18, weight: .bold))
                            .foregroundStyle(tint)
                            .padding(6)
                            .background(GradeCrewDesignTokens.Colors.surface, in: Circle())
                    }
                    .frame(height: 78)
                } else {
                    Image(systemName: symbol)
                        .font(.system(size: 30, weight: .semibold))
                        .foregroundStyle(tint)
                        .frame(height: 78)
                }
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
            .frame(maxWidth: .infinity, minHeight: 196)
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

    private func retryWorkspace() {
        loadError = nil
        isLoading = true
        homeNavigation.beginAuthCheck()
        reloadID += 1
    }

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

private struct GradeCrewSignInScreen: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var isSignInVisible = false
    let loadError: String?
    let onSignIn: () -> Void
    let onRetry: () -> Void

    var body: some View {
        ScrollView {
            VStack(spacing: GradeCrewDesignTokens.Spacing.lg) {
                Image(GradeCrewAssets.NativeImage.brandIcon)
                    .resizable()
                    .scaledToFit()
                    .frame(width: 52, height: 52)
                    .clipShape(Circle())
                    .accessibilityLabel("GradeCrew")
                    .padding(.top, GradeCrewDesignTokens.Spacing.xl)

                Text("Willkommen bei GradeCrew")
                    .font(.system(size: 24, weight: .semibold, design: .rounded))
                    .foregroundStyle(GradeCrewDesignTokens.Colors.text)
                    .multilineTextAlignment(.center)

                VStack(spacing: GradeCrewDesignTokens.Spacing.md) {
                    Text("Melde dich mit deinem GradeCrew-Konto an.")
                        .font(.system(size: GradeCrewDesignTokens.Typography.body))
                        .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                        .multilineTextAlignment(.center)
                    Button(action: onSignIn) {
                        Label("Mit GradeCrew anmelden", systemImage: "person.crop.circle.fill")
                            .font(.system(size: 17, weight: .semibold))
                            .frame(maxWidth: .infinity, minHeight: 54)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(GradeCrewDesignTokens.Colors.primary)
                    Text("Nach der Anmeldung bleibt dein Konto in der App gespeichert.")
                        .font(.footnote)
                        .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                        .multilineTextAlignment(.center)
                    if let loadError {
                        VStack(spacing: GradeCrewDesignTokens.Spacing.sm) {
                            Text("GradeCrew ist gerade nicht erreichbar.")
                                .font(.subheadline.weight(.semibold))
                            Text(loadError)
                                .font(.footnote)
                                .foregroundStyle(GradeCrewDesignTokens.Colors.muted)
                                .multilineTextAlignment(.center)
                            Button("Erneut versuchen", action: onRetry).buttonStyle(.bordered)
                        }
                    }
                }
                .frame(maxWidth: 520)
                .padding(GradeCrewDesignTokens.Spacing.lg)
                .background(GradeCrewDesignTokens.Colors.surface, in: RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.card))
                .overlay {
                    RoundedRectangle(cornerRadius: GradeCrewDesignTokens.Radius.card)
                        .stroke(GradeCrewDesignTokens.Colors.border, lineWidth: 1)
                }
                .opacity(isSignInVisible ? 1 : 0)
                .offset(y: isSignInVisible ? 0 : 12)
                .accessibilityHidden(!isSignInVisible)
                .allowsHitTesting(isSignInVisible)
            }
            .frame(maxWidth: .infinity)
            .padding(.horizontal, GradeCrewDesignTokens.Spacing.lg)
            .padding(.bottom, GradeCrewDesignTokens.Spacing.xxl)
        }
        .background(GradeCrewDesignTokens.Colors.background.ignoresSafeArea())
        .task { isSignInVisible = true }
    }
}
