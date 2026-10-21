"use strict";

function normalizeRightsReport(data = {}) {
  if (!data || typeof data !== "object" || ["target", "work", "email", "explanation"].some(key => typeof data[key] !== "string")) {
    throw new Error("Bitte Testcode oder Link, Werk, erreichbare E-Mail-Adresse und eine kurze Begründung angeben.");
  }
  const target = String(data.target || "").trim().slice(0, 500);
  const work = String(data.work || "").trim().slice(0, 300);
  const email = String(data.email || "").trim().toLowerCase().slice(0, 254);
  const explanation = String(data.explanation || "").trim().slice(0, 2000);
  if (target.length < 4 || work.length < 3 || explanation.length < 20 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new Error("Bitte Testcode oder Link, Werk, erreichbare E-Mail-Adresse und eine kurze Begründung angeben.");
  }
  const match = target.match(/(?:[?&]test=|^)([A-Z0-9_-]{4,16})(?:$|[&#])/i);
  return { target, work, email, explanation, testCode: match ? match[1].toUpperCase() : "" };
}

module.exports = { normalizeRightsReport };
