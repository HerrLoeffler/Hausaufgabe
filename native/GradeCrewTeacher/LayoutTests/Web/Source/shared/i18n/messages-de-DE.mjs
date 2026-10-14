// German remains the source UI locale. Semantic keys are used for
// bootstrap-critical and dynamically composed UI where source-text matching
// would be brittle across rerenders or cache transitions.
export const DE_DE_MESSAGES_VERSION = "de-DE@2";

export const deDEMessages = Object.freeze({
  "system.loading": "GradeCrew wird geladen …",
  "system.load_failed": "GradeCrew konnte nicht vollständig geladen werden. Bitte prüfe die Verbindung und lade die Seite erneut.",
  "system.secure_assessment_notice_failed": "Secure-Assessment-Hinweise konnten nicht geladen werden.",
  "system.extra_views_failed": "Zusätzliche Ansichten konnten nicht geladen werden.",
  "system.start_failed": "GradeCrew konnte nicht starten:",
  "common.retry": "Erneut versuchen",
  "common.cancel": "Abbrechen",
  "common.save": "Speichern",
  "nav.features": "Funktionen",
  "nav.crew": "Die Crew",
  "nav.teachers": "Für Lehrkräfte",
  "nav.help": "Hilfe",
});
