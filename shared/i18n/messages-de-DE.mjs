// German is the source and only active UI locale in the first migration stage.
// Keep semantic keys for system-level messages that are used before/during app bootstrap.
// Existing UI copy can continue to use its German source text until a second locale is enabled.
export const DE_DE_MESSAGES_VERSION = "de-DE@1";

export const deDEMessages = Object.freeze({
  "system.loading": "GradeCrew wird geladen …",
  "system.load_failed": "GradeCrew konnte nicht vollständig geladen werden. Bitte prüfe die Verbindung und lade die Seite erneut.",
  "system.secure_assessment_notice_failed": "Secure-Assessment-Hinweise konnten nicht geladen werden.",
  "system.extra_views_failed": "Zusätzliche Ansichten konnten nicht geladen werden.",
  "system.start_failed": "GradeCrew konnte nicht starten:",
  "common.retry": "Erneut versuchen",
  "common.cancel": "Abbrechen",
  "common.save": "Speichern",
});
