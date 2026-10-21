import SwiftUI

struct PreviewDestination: Identifiable {
    let id = UUID()
    let url: URL
}

struct StartView: View {
    @State private var code = ""
    @State private var error: String?
    @State private var destination: PreviewDestination?
    @State private var showLab = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    Image(systemName: "graduationcap.fill")
                        .font(.system(size: 48)).foregroundStyle(.teal)
                        .accessibilityHidden(true)
                    Text("Dein Test.\nIn aller Ruhe.")
                        .font(.largeTitle.bold())
                    Text("GradeCrew Secure · Entwicklungsprototyp")
                        .font(.headline).foregroundStyle(.secondary)
                    Text("Hier testen wir zuerst die Schüleransicht. Diese Vorschau sperrt das iPad noch nicht. Verwende einen Staging-Test mit Übungsdaten.")
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Testcode").font(.headline)
                        TextField("z. B. ABCD1234", text: $code)
                            .textInputAutocapitalization(.characters)
                            .autocorrectionDisabled()
                            .textFieldStyle(.roundedBorder)
                            .submitLabel(.go)
                            .onSubmit(openPreview)
                        if let error { Text(error).foregroundStyle(.red).accessibilityAddTraits(.isStaticText) }
                        Button(action: openPreview) {
                            Label("Staging-Test öffnen", systemImage: "arrow.right")
                                .frame(maxWidth: .infinity)
                        }.buttonStyle(.borderedProminent).controlSize(.large)
                    }
                    Divider()
                    Button { showLab = true } label: {
                        Label("Apple-Prüfungsmodus: Gerätetest", systemImage: "lock.shield")
                    }.buttonStyle(.bordered)
                    Text("Der Gerätetest enthält nur eine lokale Übungsaufgabe. Er benötigt Apples AAC-Genehmigung und die gesonderte AACLab-Konfiguration.")
                        .font(.footnote).foregroundStyle(.secondary)
                }.padding(28).frame(maxWidth: 600)
                    .frame(maxWidth: .infinity, alignment: .center)
            }
            .background(Color(red: 0.96, green: 0.98, blue: 0.97))
            .navigationTitle("GradeCrew")
            .sheet(item: $destination) { item in PreviewScreen(url: item.url) }
            .fullScreenCover(isPresented: $showLab) { AssessmentLabView() }
        }.tint(.teal)
    }

    private func openPreview() {
        guard let url = StagingPolicy.testURL(code: code) else {
            error = "Bitte 4 bis 16 Buchstaben oder Ziffern eingeben."
            return
        }
        error = nil
        destination = PreviewDestination(url: url)
    }
}
