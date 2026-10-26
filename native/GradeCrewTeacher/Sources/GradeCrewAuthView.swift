import SwiftUI

@MainActor
struct GradeCrewAuthView: View {
    let animationStartedAt: Date
    let loadError: String?
    let call: GradeCrewQuickRemyCall?
    let onRetry: () -> Void
    var onBridgeReadyChanged: (Bool) -> Void = { _ in }

    @State private var mode: GradeCrewAuthInputPolicy.Mode = .login
    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var bridgeReady = false
    @State private var isPreparing = false
    @State private var isSubmitting = false
    @State private var workError: String?
    @State private var confirmation: String?
    @State private var requestGeneration = UUID()
    @FocusState private var focusedField: Field?

    private enum Field { case name, email, password }
    private var busy: Bool { isPreparing || isSubmitting }
    private var canSubmit: Bool { bridgeReady && call != nil && loadError == nil && !busy }
    private var bridgeKey: String { "\(call != nil)-\(loadError ?? "")" }

    private var heading: String {
        switch mode {
        case .login: return "Willkommen zurück in der Crew"
        case .register: return "Werde Teil der Crew"
        case .reset: return "Passwort zurücksetzen"
        }
    }

    private var submitLabel: String {
        switch mode {
        case .login: return "Anmelden"
        case .register: return "Konto erstellen"
        case .reset: return "Link anfordern"
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                GradeCrewBrandSignature(animationStartedAt: animationStartedAt)
                    .gcLayout("auth.brand", role: "center")
                Text(heading)
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .multilineTextAlignment(.center)
                    .foregroundStyle(GradeCrewDesignTokens.Colors.text)
                    .accessibilityAddTraits(.isHeader)
                    .gcLayout("auth.heading", role: "center", text: heading, fontSize: 28)
                formFields
                feedback
                Button(action: submit) {
                    HStack(spacing: 10) {
                        if isSubmitting { ProgressView().tint(.white) }
                        Text(submitLabel).font(.headline)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                }
                .buttonStyle(.plain)
                .foregroundStyle(.white)
                .background(GradeCrewDesignTokens.Colors.primary, in: RoundedRectangle(cornerRadius: 12))
                .opacity(canSubmit ? 1 : 0.55)
                .disabled(!canSubmit)
                .gcLayout("auth.submit", role: "tap")
                modeLinks
            }
            .padding(.horizontal, 24)
            .padding(.top, 16)
            .padding(.bottom, 32)
            .gcLayout("auth.content", role: "center")
            .frame(maxWidth: 460)
            .frame(maxWidth: .infinity)
        }
        .scrollDismissesKeyboard(.interactively)
        .background(GradeCrewDesignTokens.Colors.background)
        .task(id: bridgeKey) { prepareBridge() }
        .onDisappear {
            requestGeneration = UUID()
            password = ""
            focusedField = nil
            bridgeReady = false
            isPreparing = false
            isSubmitting = false
            onBridgeReadyChanged(false)
        }
    }

    private var formFields: some View {
        VStack(alignment: .leading, spacing: 16) {
            if mode == .register {
                field("Name") {
                    TextField("Dein Name", text: $name)
                        .textContentType(.name)
                        .textInputAutocapitalization(.words)
                        .focused($focusedField, equals: .name)
                        .submitLabel(.next)
                        .onSubmit { focusedField = .email }
                }
            }
            field("E-Mail") {
                TextField("name@schule.de", text: $email)
                    .keyboardType(.emailAddress)
                    .textContentType(mode == .login ? .username : .emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .focused($focusedField, equals: .email)
                    .submitLabel(mode == .reset ? .done : .next)
                    .onSubmit {
                        if mode == .reset { submit() }
                        else { focusedField = .password }
                    }
            }
            if mode != .reset {
                field("Passwort") {
                    SecureField(mode == .register ? "Mindestens 6 Zeichen" : "Dein Passwort", text: $password)
                        .textContentType(mode == .register ? .newPassword : .password)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .focused($focusedField, equals: .password)
                        .submitLabel(.done)
                        .onSubmit(submit)
                }
            }
        }
        .disabled(isSubmitting)
    }

    private func field<Content: View>(_ label: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 7) {
            Text(label).font(.subheadline.weight(.semibold))
            content()
                .font(.body)
                .padding(14)
                .frame(minHeight: 48)
                .background(GradeCrewDesignTokens.Colors.surface, in: RoundedRectangle(cornerRadius: 12))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(GradeCrewDesignTokens.Colors.border, lineWidth: 1))
                .accessibilityLabel(label)
                .gcLayout("auth.field.\(label)", role: "tap")
        }
        .foregroundStyle(GradeCrewDesignTokens.Colors.text)
    }

    @ViewBuilder private var feedback: some View {
        if let error = loadError ?? workError {
            VStack(spacing: 8) {
                Text(error)
                    .font(.subheadline)
                    .foregroundStyle(GradeCrewDesignTokens.Colors.danger)
                    .multilineTextAlignment(.center)
                if !bridgeReady || loadError != nil {
                    Button("Erneut verbinden") {
                        if loadError != nil || call == nil { onRetry() }
                        else { prepareBridge() }
                    }
                    .disabled(busy)
                    .frame(minHeight: 44)
                }
            }
        } else if let confirmation {
            Text(confirmation)
                .font(.subheadline)
                .foregroundStyle(GradeCrewDesignTokens.Colors.positive)
                .multilineTextAlignment(.center)
        } else if !bridgeReady {
            ProgressView("Anmeldung wird vorbereitet …")
                .font(.footnote)
                .tint(GradeCrewDesignTokens.Colors.primary)
        }
    }

    private var modeLinks: some View {
        VStack(spacing: 4) {
            if mode == .login {
                Button("Passwort vergessen?") { changeMode(.reset) }
                    .gcLayout("auth.link.reset", role: "tap")
                Button("Konto erstellen") { changeMode(.register) }
                    .gcLayout("auth.link.register", role: "tap")
            } else {
                Button("Zurück zur Anmeldung") { changeMode(.login) }
                    .gcLayout("auth.link.login", role: "tap")
            }
        }
        .font(.subheadline.weight(.medium))
        .foregroundStyle(GradeCrewDesignTokens.Colors.primary)
        .buttonStyle(AuthLinkStyle())
        .disabled(busy)
    }

    private func changeMode(_ next: GradeCrewAuthInputPolicy.Mode) {
        guard !busy else { return }
        password = ""
        mode = next
        workError = nil
        confirmation = nil
        focusedField = next == .register ? .name : .email
    }

    private func prepareBridge() {
        let generation = UUID()
        requestGeneration = generation
        bridgeReady = false
        onBridgeReadyChanged(false)
        isSubmitting = false
        isPreparing = false
        guard loadError == nil, let call else { return }
        isPreparing = true
        workError = nil
        call("authPrepare", [:]) { result in
            DispatchQueue.main.async {
                guard requestGeneration == generation else { return }
                isPreparing = false
                switch result {
                case .success(let response):
                    bridgeReady = response["status"] as? String == "ready"
                    onBridgeReadyChanged(bridgeReady)
                    if !bridgeReady { workError = "Die Anmeldung ist noch nicht bereit. Bitte erneut verbinden." }
                case .failure(let error): workError = error.localizedDescription
                }
            }
        }
    }

    private func submit() {
        guard canSubmit, let call else { return }
        let request: GradeCrewAuthInputPolicy.Request
        do { request = try GradeCrewAuthInputPolicy.request(mode: mode, name: name, email: email, password: password) }
        catch { workError = error.localizedDescription; confirmation = nil; return }
        focusedField = nil
        workError = nil
        confirmation = nil
        isSubmitting = true
        let generation = UUID()
        requestGeneration = generation
        let submittedMode = mode
        call(request.action, request.payload.mapValues { $0 as Any }) { result in
            DispatchQueue.main.async {
                guard requestGeneration == generation else { return }
                isSubmitting = false
                switch result {
                case .success(let response):
                    let expected = submittedMode == .reset ? "resetSent" : "signedIn"
                    guard response["status"] as? String == expected else {
                        workError = "Die Anfrage konnte noch nicht bestätigt werden. Bitte erneut versuchen."
                        return
                    }
                    password = ""
                    if submittedMode == .reset {
                        confirmation = response["message"] as? String ?? "Wenn ein Konto zu dieser E-Mail-Adresse besteht, erhältst du einen Link zum Zurücksetzen."
                    }
                    // Root changes the screen only after the existing auth-state event.
                case .failure(let error): workError = error.localizedDescription
                }
            }
        }
    }
}

private struct AuthLinkStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .frame(minHeight: 44)
            .frame(maxWidth: .infinity)
            .opacity(configuration.isPressed ? 0.65 : 1)
    }
}

#if GRADECREW_LAYOUT_TESTS
extension GradeCrewAuthView {
    init(layoutTestMode: GradeCrewAuthInputPolicy.Mode, error: String? = nil, call: GradeCrewQuickRemyCall? = nil) {
        self.init(animationStartedAt: .distantPast, loadError: error, call: call, onRetry: {})
        _mode = State(initialValue: layoutTestMode)
    }
}
#endif
