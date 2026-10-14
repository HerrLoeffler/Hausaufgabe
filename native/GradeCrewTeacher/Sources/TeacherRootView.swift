import SwiftUI

struct TeacherRootView: View {
    @Environment(\.scenePhase) private var scenePhase
    @AppStorage(GradeCrewBetaEnvironment.preferenceKey) private var previewPreference = ""
    @State private var isLoading = true
    @State private var authFormPresented = false
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

    private var webURL: URL { homeURL }

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
            .opacity(route == .workspace ? 1 : 0)
            .allowsHitTesting(route == .workspace)
            .safeAreaInset(edge: .top, spacing: 0) {
                if route == .quickRemy {
                    QuickRemyView(onBack: { homeNavigation.showHome() }, call: quickRemyCall)
                        .transition(.move(edge: .top).combined(with: .opacity))
                }
            }
            .safeAreaInset(edge: .bottom, spacing: 0) {
                if route == .workspace {
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

            if route == .home || route == .signIn {
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
        // Firebase briefly publishes checking during login/profile loading. Keep
        // the native form and its pending result alive through that transition.
        if authFormPresented {
            GradeCrewAuthView(
                animationStartedAt: brandAnimationStartedAt,
                loadError: loadError,
                call: quickRemyCall,
                onRetry: retryWorkspace
            )
        } else {
            switch authState {
            case .checking, .signedOut:
                authRestoringScreen
            case .signedIn(_, _):
                homeMenuScreen
            }
        }
    }

    private var homeMenuScreen: some View {
        GradeCrewHomeMenuView(
            animationStartedAt: brandAnimationStartedAt,
            accountLabel: accountLabel,
            isAuthRestored: isAuthRestored,
            workspaceOpening: workspaceOpening,
            auditMessage: auditMessage,
            auditNeedsReview: auditNeedsReview,
            openRemy: openRemy,
            openWorkspace: openWorkspace
        ) {
            if let loadError { connectionError(loadError) }
        }
    }

    private var accountLabel: String {
        if case let .signedIn(label, _) = authState { return label }
        return ""
    }

    private var authRestoringScreen: some View {
        GradeCrewAuthRestoringView(animationStartedAt: brandAnimationStartedAt) {
            if let loadError { connectionError(loadError) }
        }
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

    private func receiveAuthState(_ newState: GradeCrewNativeBridgePolicy.AuthState) {
        switch newState {
        case let .signedIn(_, changed):
            authFormPresented = false
            if changed { auditGeneration += 1; auditMessage = nil }
        case .signedOut:
            authFormPresented = true
            auditGeneration += 1
            auditMessage = nil
        case .checking:
            auditGeneration += 1
            auditMessage = nil
        }
        homeNavigation.receive(newState)
        if case .signedOut = newState { homeNavigation.showHome() }
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
