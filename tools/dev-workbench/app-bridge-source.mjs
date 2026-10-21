// App-module tail served only by the loopback Workbench for the GradeCrew homepage.
// It reads a small allowlist of state and never captures form values or answer text.
export const appBridgeSource = String.raw`
// Local development navigation bridge: loopback Workbench only.
if (appEnvironment === "staging" && ["127.0.0.1", "localhost"].includes(location.hostname)) {
  const installLocalDevBridge = () => {
    if (!window.GradeCrewDev?.registerAdapter) return;
    const currentView = () => currentViewId();
    window.GradeCrewDev.registerAdapter({
      version: 1,
      captureContext: () => ({ view: currentView(), entity: state.currentQuiz?.id || "" }),
      isDirty: () => {
        const view = currentView();
        const filledAuth = view === "authView" && [...($("authView")?.querySelectorAll("input:not([type='hidden'])") || [])]
          .some(input => !input.closest(".hidden") && input.value.length > 0);
        return Boolean(state.isDirty || crewTour?.active || filledAuth || ["studentView", "aiView", "settingsView"].includes(view));
      },
      captureCheckpoint: () => ({
        view: currentView(),
        quizId: currentView() === "resultsView" ? state.currentResultsQuiz?.id || "" : state.currentQuiz?.id || "",
      }),
      restoreCheckpoint: async checkpoint => {
        if (!checkpoint || !views.includes(checkpoint.view)) throw new Error("Unbekannte Ansicht.");
        if (checkpoint.view === "authView") return;
        const deadline = Date.now() + 20000;
        while ((!state.user || !state.profile || currentView() === "authView") && Date.now() < deadline) {
          await new Promise(resolve => setTimeout(resolve, 150));
        }
        if (!state.user) throw new Error("Bitte zuerst mit deinem Staging-Konto anmelden.");
        if (state.isDirty || crewTour?.active) throw new Error("Aktuelle Änderungen zuerst speichern.");
        const quizId = typeof checkpoint.quizId === "string" && /^[A-Za-z0-9_-]{1,100}$/.test(checkpoint.quizId) ? checkpoint.quizId : "";
        if (checkpoint.view === "editorView" && quizId) await openEditor(quizId);
        else if (checkpoint.view === "resultsView" && quizId) await openResults(quizId);
        else if (checkpoint.view === "publishView" && quizId) await showPublish(quizId);
        else if (checkpoint.view === "dashboardView") { await loadDashboard(); showView("dashboardView"); }
      },
    });
    document.dispatchEvent(new Event("gradecrew:dev-adapter-ready"));
  };
  if (window.GradeCrewDev) installLocalDevBridge();
  else document.addEventListener("gradecrew:dev-sdk-ready", installLocalDevBridge, { once: true });
}
`;

export function appendWorkbenchAppBridge(source, { homepage, dataMode, name }) {
  if (!homepage || dataMode !== 'staging' || name !== 'app.js') return source;
  return `${source}\n${appBridgeSource}\n`;
}
