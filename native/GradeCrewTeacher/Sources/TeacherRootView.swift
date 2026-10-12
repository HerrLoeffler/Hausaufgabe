import SwiftUI

struct TeacherRootView: View {
    @Environment(\.scenePhase) private var scenePhase
    @AppStorage(GradeCrewBetaEnvironment.preferenceKey) private var previewPreference = ""
    @State private var isLoading = true
    @State private var workspaceOpening = false
    @State private var brandAnimationStartedAt = Date()
    @State private var loadError: String?
    @State private var reloadID = 0
    @State private var showBetaSettings = false
    @State private var pendingPreview = ""
    @State private var settingsError: String?
    @State private var loadedHost: String?
    @State private var webManifestCommit: String?
    @State private var homeNavigation = GradeCrewHomeNavigation()
    @State private var quickRemyCall: GradeCrewQuickRemyCall?
    @State private var auditMessage: String?
    @State private var auditNeedsReview = false
    @State private var auditGeneration = 0
    @State private var auditRefresh = 0

    private var auditKey: String {
        "\(route)-\(isAuthRestored)-\(quickRemyCall != nil)-\(auditGeneration)-\(auditRefresh)"
    }

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
                if route == .quickRemy {
                    QuickRemyView(onBack: { homeNavigation.showHome() }, call: quickRemyCall)
                        .transition(.move(edge: .top).combined(with: .opacity))
                }
            }
            .safeAreaInset(edge: .bottom, spacing: 0) {
                if route == .workspace || route == .signIn {
                    HStack {
                        Button {
                            homeNavigation.showHome()
                        } label: {
                            Image(systemName: "house.fill")
                                .font(.system(size: 18, weight: .semibold))
                                .frame(width: 44, height: 44)
                                .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                        .foregroundStyle(GradeCrewDesignTokens.Colors.primary)
                        .accessibilityLabel("Start")
                        .accessibilityHint("Zur nativen GradeCrew-Auswahl zurückkehren")
                        Spacer()
                    }
                    .padding(.horizontal, GradeCrewDesignTokens.Spacing.lg)
                    .background(.regularMaterial)
                }
            }

            if route == .home {
                homeScreen
                    .transition(.opacity)
            }
        }
        .background(GradeCrewDesignTokens.Colors.background)
        .animation(.easeInOut(duration: 0.18), value: route)
        .task(id: auditKey) { await monitorGenerationAudit() }
        .onChange(of: scenePhase) { phase in
            if phase == .active { auditRefresh += 1 }
        }
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
                animationStartedAt: brandAnimationStartedAt,
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
                    GradeCrewBrandSignature(animationStartedAt: brandAnimationStartedAt)
                    Text("Was möchtest du tun?")
                        .font(.system(size: GradeCrewDesignTokens.Typography.pageTitle, weight: .semibold, design: .rounded))
                        .foregroundStyle(GradeCrewDesignTokens.Colors.text)
                    accountStatus
                }
                .padding(.top, GradeCrewDesignTokens.Spacing.xxl)

                HStack(spacing: GradeCrewDesignTokens.Spacing.lg) {
                    actionCard(
                        title: "Remy fragen",
                        subtitle: "Test kurz einsprechen",
                        symbol: "mic.fill",
                        illustration: GradeCrewAssets.NativeImage.remyMicrophoneForward,
                        tint: GradeCrewDesignTokens.Colors.crewRust,
                        action: openRemy
                    )
                    actionCard(
                        title: "GradeCrew öffnen",
                        subtitle: "Tests ansehen und bearbeiten",
                        symbol: "graduationcap.fill",
                        illustration: GradeCrewAssets.NativeImage.brandIcon,
                        tint: GradeCrewDesignTokens.Colors.primary,
                        action: openWorkspace
                    )
                }
                .frame(maxWidth: 760)
                .padding(.horizontal, GradeCrewDesignTokens.Spacing.lg)

                if let auditMessage {
                    Text(auditMessage)
                        .font(.footnote)
                        .foregroundStyle(auditNeedsReview ? GradeCrewDesignTokens.Colors.danger : GradeCrewDesignTokens.Colors.muted)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: 480)
                        .padding(.horizontal, GradeCrewDesignTokens.Spacing.lg)
                }
                if workspaceOpening { ProgressView("Deine Tests werden geöffnet …").font(.footnote) }
                if let loadError { connectionError(loadError) }
            }
            .frame(maxWidth: .infinity)
            .padding(.bottom, GradeCrewDesignTokens.Spacing.xxl)
        }
        .background(GradeCrewDesignTokens.Colors.background.ignoresSafeArea())
    }

    private var authRestoringScreen: some View {
        VStack(spacing: GradeCrewDesignTokens.Spacing.lg) {
            GradeCrewBrandSignature(animationStartedAt: brandAnimationStartedAt)
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
                    Image(illustration)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 104, height: 78)
                        .accessibilityHidden(true)
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
        .disabled(!isAuthRestored || workspaceOpening)
        .opacity(isAuthRestored ? 1 : 0.55)
        .accessibilityHint(isAuthRestored ? subtitle : "Aktionen verfügbar, sobald die Anmeldung geprüft wurde.")
    }

    private func receiveAuthState(_ newState: GradeCrewNativeBridgePolicy.AuthState) {
        switch newState {
        case let .signedIn(_, changed):
            if changed { auditGeneration += 1; auditMessage = nil }
        case .signedOut, .checking:
            auditGeneration += 1
            auditMessage = nil
        }
        homeNavigation.receive(newState)
    }

    @MainActor
    private func monitorGenerationAudit() async {
        guard route == .home, case .signedIn = authState, let call = quickRemyCall else { return }
        let generation = auditGeneration
        for _ in 0..<30 {
            guard !Task.isCancelled, generation == auditGeneration, route == .home, scenePhase == .active else { return }
            do {
                let result: [String: Any] = try await withCheckedThrowingContinuation { continuation in
                    call("auditPendingTests", [:]) { continuation.resume(with: $0) }
                }
                guard !Task.isCancelled, generation == auditGeneration else { return }
                auditNeedsReview = result["status"] as? String == "needsReview"
                auditMessage = result["message"] as? String
                if result["status"] as? String != "pending" { return }
            } catch {
                guard generation == auditGeneration else { return }
                auditNeedsReview = true
                auditMessage = "Die spätere Medienprüfung ist gerade nicht erreichbar. Bitte den Test in GradeCrew prüfen."
                return
            }
            try? await Task.sleep(nanoseconds: 10_000_000_000)
        }
    }

    private func openRemy() { homeNavigation.openRemy() }

    private func openWorkspace() {
        guard case .signedIn = authState else { homeNavigation.openWorkspace(); return }
        guard !workspaceOpening else { return }
        workspaceOpening = true
        loadError = nil
        let generation = auditGeneration
        Task { @MainActor in
            defer { workspaceOpening = false }
            do {
                guard let call = quickRemyCall else {
                    throw NSError(domain: "GradeCrewWorkspace", code: 1, userInfo: [NSLocalizedDescriptionKey: "GradeCrew ist noch nicht bereit. Bitte erneut versuchen."])
                }
                let result: [String: Any] = try await withCheckedThrowingContinuation { continuation in
                    call("openWorkspace", [:]) { continuation.resume(with: $0) }
                }
                guard generation == auditGeneration, route == .home else { return }
                guard result["status"] as? String == "ready" else { return }
                homeNavigation.openWorkspace()
            } catch {
                guard generation == auditGeneration, route == .home else { return }
                loadError = error.localizedDescription
            }
        }
    }

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
    @State private var isSignInVisible = false
    let animationStartedAt: Date
    let loadError: String?
    let onSignIn: () -> Void
    let onRetry: () -> Void

    var body: some View {
        ScrollView {
            VStack(spacing: GradeCrewDesignTokens.Spacing.lg) {
                GradeCrewBrandSignature(animationStartedAt: animationStartedAt)
                    .padding(.top, GradeCrewDesignTokens.Spacing.lg)

                Text("Willkommen zurück in der Crew")
                    .font(.system(size: 24, weight: .semibold, design: .rounded))
                    .foregroundStyle(GradeCrewDesignTokens.Colors.text)
                    .multilineTextAlignment(.center)

                VStack(spacing: GradeCrewDesignTokens.Spacing.md) {
                    Text("Deine Tests. Deine Ideen. Deine Crew.")
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
