"use strict";

function classifyAiFailure(err) {
  const status = Number(err?.status || 0);
  const code = String(err?.code || "").toLowerCase();
  if (status === 429) return { code: "resource-exhausted", message: "Der KI-Anbieter hat gerade zu viele Anfragen. Bitte später erneut versuchen." };
  if (status === 401 || status === 403) return { code: "unavailable", message: "Die KI-Verbindung ist derzeit nicht verfügbar. Bitte den Betreiber informieren." };
  if (status === 400 || status === 422) return { code: "failed-precondition", message: "Der KI-Anbieter hat die Anfrage abgewiesen. Bitte die Fehlernummer an den Betreiber weitergeben." };
  if (code.includes("timeout") || code.includes("deadline") || code.includes("abort")) return { code: "deadline-exceeded", message: "Die KI hat zu lange gebraucht. Bitte erneut versuchen." };
  return { code: "unavailable", message: "Die KI-Erstellung konnte wegen eines technischen Fehlers nicht abgeschlossen werden. Bitte erneut versuchen." };
}

module.exports = { classifyAiFailure };
