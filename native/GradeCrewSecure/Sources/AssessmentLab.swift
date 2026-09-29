import SwiftUI
import AutomaticAssessmentConfiguration

// Local hardware experiment only. Never authorizes or unlocks a real server attempt.
final class AssessmentLab: NSObject, ObservableObject, AEAssessmentSessionDelegate {
    enum Phase { case idle, starting, active, ending, finished, failed }
    @Published private(set) var phase: Phase = .idle
    @Published private(set) var status = "Noch kein Prüfungsmodus aktiv."
    @Published private(set) var remaining = 60
    private var session: AEAssessmentSession?
    private var timer: Timer?
    private var deadline: TimeInterval = 0
    private var interrupted = false

    var enabled: Bool {
        #if AAC_LAB && DEBUG && !targetEnvironment(simulator)
        return true
        #else
        return false
        #endif
    }
    var mayClose: Bool { session == nil }

    func begin() {
        guard enabled, session == nil else { return }
        phase = .starting
        status = "Apple aktiviert den Prüfungsmodus …"
        interrupted = false
        let next = AEAssessmentSession(configuration: AEAssessmentConfiguration())
        session = next // Retain through the complete asynchronous lifecycle.
        next.delegate = self
        next.begin()
    }
    func end() {
        guard let session, phase == .active || phase == .starting else { return }
        timer?.invalidate(); timer = nil
        phase = .ending
        status = "Apple beendet den Gerätetest …"
        session.end()
    }
    func assessmentSessionDidBegin(_ session: AEAssessmentSession) {
        guard self.session === session else { return }
        // A cancelled start may finish asynchronously; never reveal its question.
        guard phase == .starting else { session.end(); return }
        phase = .active
        status = "Apple hat den Prüfungsmodus bestätigt."
        remaining = 60
        deadline = ProcessInfo.processInfo.systemUptime + 60
        timer = Timer.scheduledTimer(withTimeInterval: 0.25, repeats: true) { [weak self] _ in
            guard let self else { return }
            self.remaining = max(0, Int(ceil(self.deadline - ProcessInfo.processInfo.systemUptime)))
            if self.remaining == 0 { self.end() }
        }
    }
    func assessmentSession(_ session: AEAssessmentSession, failedToBeginWithError error: Error) {
        guard self.session === session else { return }
        timer?.invalidate(); timer = nil
        self.session = nil
        phase = .failed
        status = "Prüfungsmodus nicht gestartet. AAC-Genehmigung, Signing und Gerät prüfen. Apple-Code: \((error as NSError).code)."
    }
    func assessmentSession(_ session: AEAssessmentSession, wasInterruptedWithError error: Error) {
        guard self.session === session else { return }
        interrupted = true
        timer?.invalidate(); timer = nil
        phase = .ending // Hides the question immediately.
        status = "Gerätetest unterbrochen. Der Prüfungsmodus wird beendet."
        session.end() // Apple's interruption contract requires explicit end().
    }
    func assessmentSessionDidEnd(_ session: AEAssessmentSession) {
        guard self.session === session else { return }
        timer?.invalidate(); timer = nil
        self.session = nil
        phase = interrupted ? .failed : .finished
        status = interrupted ? "Der Gerätetest wurde unterbrochen. Nicht als bestanden werten." : "Apple hat das Ende des Prüfungsmodus bestätigt."
    }
}

struct AssessmentLabView: View {
    @StateObject private var lab = AssessmentLab()
    @Environment(\.dismiss) private var dismiss
    @State private var confirm = false
    @State private var answer = ""
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    Label("Lokaler Gerätetest", systemImage: "lock.shield").font(.title.bold())
                    Text("Nur auf deinem eigenen Test-iPad starten. Dieser Versuch dauert höchstens 60 Sekunden bei laufender App und lässt sich hier vorzeitig beenden. Keine Schülerdaten, keine echte Abgabe.")
                    Text(lab.status).font(.headline).accessibilityAddTraits(.updatesFrequently)
                    if lab.phase == .active {
                        Text("Noch \(lab.remaining) Sekunden").monospacedDigit()
                        Text("Übungsfrage: Wie viel ist 7 × 8?").font(.title2)
                        TextField("Deine Antwort", text: $answer).keyboardType(.numberPad).textFieldStyle(.roundedBorder)
                    }
                    if lab.phase == .active || lab.phase == .starting {
                        Button("Gerätetest beenden") { lab.end() }.buttonStyle(.borderedProminent)
                    } else if lab.mayClose {
                        Button("60-Sekunden-Gerätetest starten") { confirm = true }
                            .buttonStyle(.borderedProminent).disabled(!lab.enabled)
                    }
                    if !lab.enabled {
                        Text("Noch deaktiviert: Ein echtes iPad, Apples AAC-Freigabe und das Xcode-Schema „GradeCrew AAC Lab“ sind erforderlich. Die normale Staging-Vorschau funktioniert ohne AAC.")
                            .foregroundStyle(.secondary)
                    }
                }.padding(28).frame(maxWidth: 620).frame(maxWidth: .infinity)
            }
            .toolbar { ToolbarItem(placement: .cancellationAction) {
                Button("Zurück") { dismiss() }.disabled(!lab.mayClose)
            }}
            .confirmationDialog("Das iPad wird vorübergehend auf GradeCrew beschränkt. Nur für deinen Gerätetest starten.", isPresented: $confirm, titleVisibility: .visible) {
                Button("Gerätetest starten") { lab.begin() }
            }
        }.interactiveDismissDisabled()
    }
}
