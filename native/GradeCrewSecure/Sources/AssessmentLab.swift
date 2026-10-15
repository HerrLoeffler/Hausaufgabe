import SwiftUI
import AutomaticAssessmentConfiguration

// Local hardware experiment only. Never authorizes or unlocks a real server attempt.
// Apple documents that all assessment delegate callbacks arrive on the main thread.
@MainActor
final class AssessmentLab: NSObject, ObservableObject, @preconcurrency AEAssessmentSessionDelegate {
    @Published private(set) var state = AssessmentLabState()
    @Published private(set) var status = "Noch kein Prüfungsmodus aktiv."
    @Published private(set) var events: [String] = []
    private var session: AEAssessmentSession?
    private var timer: Timer?

    var enabled: Bool {
        #if AAC_LAB && !targetEnvironment(simulator)
        return true
        #else
        return false
        #endif
    }
    var phase: AssessmentLabState.Phase { state.phase }
    var remaining: Int { state.remaining }
    var mayClose: Bool { session == nil && state.mayClose }

    private func record(_ message: String) {
        events.append(message)
        if events.count > 12 { events.removeFirst() }
        status = message
    }
    func begin() {
        guard enabled, session == nil else { return }
        guard state.start(now: ProcessInfo.processInfo.systemUptime) == .begin else { return }
        events = []
        record("Start angefordert – noch keine Sperre bestätigt.")
        let next = AEAssessmentSession(configuration: AEAssessmentConfiguration())
        session = next
        next.delegate = self
        timer = AssessmentLabTimer.schedule(every: 0.25) { [weak self] in
            Task { @MainActor in self?.tick() }
        }
        next.begin()
    }
    private func tick() {
        let starting = phase == .starting
        if state.tick(now: ProcessInfo.processInfo.systemUptime) == .end {
            record(starting ? "Apple-Start dauert zu lange. Gerätetest wird beendet …" : "60 Sekunden erreicht. Apple beendet den Gerätetest …")
            session?.end()
        }
    }
    func end() {
        guard state.requestEnd() == .end else { return }
        record("Ende angefordert – auf Apple-Bestätigung warten …")
        session?.end()
    }
    func assessmentSessionDidBegin(_ session: AEAssessmentSession) {
        guard self.session === session else { return }
        if state.didBegin(now: ProcessInfo.processInfo.systemUptime) == .end {
            session.end()
            return
        }
        record("Apple bestätigt: Prüfungsmodus aktiv.")
    }
    func assessmentSession(_ session: AEAssessmentSession, failedToBeginWithError error: Error) {
        guard self.session === session else { return }
        timer?.invalidate(); timer = nil
        state.failedToBegin()
        self.session = nil
        let error = error as NSError
        record("Start fehlgeschlagen (\(error.domain), Code \(error.code)). AAC-Profil, Team und Gerät prüfen.")
    }
    func assessmentSession(_ session: AEAssessmentSession, wasInterruptedWithError error: Error) {
        guard self.session === session else { return }
        _ = state.interrupt() // Hides the question synchronously.
        record("Apple meldet Unterbrechung. Aufgabe verborgen, Modus wird beendet …")
        session.end()
    }
    func assessmentSessionDidEnd(_ session: AEAssessmentSession) {
        guard self.session === session else { return }
        timer?.invalidate(); timer = nil
        state.didEnd()
        self.session = nil
        record(phase == .failed ? "Gerätetest fehlgeschlagen/unterbrochen. Modus beendet." : "Apple bestätigt: Prüfungsmodus beendet.")
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
                        Label("Echte AAC-Sitzung von Apple bestätigt", systemImage: "lock.shield.fill")
                            .foregroundStyle(.green)
                    }
                    #if targetEnvironment(simulator)
                    Text("Simulator: keine echte Gerätesperre möglich. Dieser Startknopf bleibt deaktiviert.").foregroundStyle(.orange)
                    #endif
                    if lab.state.showsQuestion {
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
                    if !lab.events.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Apple-Ereignisse · lokaler Test").font(.headline)
                            ForEach(Array(lab.events.enumerated()), id: \.offset) { item in
                                Text(item.element).font(.caption)
                            }
                        }
                    }
                    if !lab.enabled {
                        Text("Noch deaktiviert: Ein echtes iPad, Apples AAC-Freigabe und das Xcode-Schema „GradeCrew AAC Lab“ sind erforderlich. Die normale Staging-Vorschau funktioniert ohne AAC.")
                            .foregroundStyle(.secondary)
                    }
                }.padding(28).frame(maxWidth: 620).frame(maxWidth: .infinity)
            }
            #if !AAC_LAB
            .toolbar { ToolbarItem(placement: .cancellationAction) {
                Button("Zurück") { dismiss() }.disabled(!lab.mayClose)
            }}
            #endif
            .confirmationDialog("Das iPad wird vorübergehend auf GradeCrew beschränkt. Nur für deinen Gerätetest starten.", isPresented: $confirm, titleVisibility: .visible) {
                Button("Gerätetest starten") { lab.begin() }
            }
        }.interactiveDismissDisabled()
    }
}
