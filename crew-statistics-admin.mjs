import { getApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-functions.js";

let installed = false;
let loading = false;

const FIELD_LABELS = Object.freeze({
  subject: "Fach",
  grade: "Klasse",
  schoolType: "Schulart",
  region: "Bundesland",
  topic: "Thema",
  difficulty: "Schwierigkeit",
  count: "Aufgabenanzahl",
  points: "Punkte",
  durationMinutes: "Dauer",
  audioQuestionCount: "Höraufgaben",
  notes: "Eigene Wünsche",
  questionTypes: "Aufgabentypen"
});

function activeDays() {
  const period = document.querySelector(".adminPeriodBtn.active")?.dataset.period || "7d";
  if (period === "today") return 1;
  if (period === "30d") return 30;
  if (period === "all") return 90;
  return 7;
}

function pct(value) {
  return `${Math.round(Math.max(0, Number(value) || 0) * 100)} %`;
}

function ensureStyles() {
  if (document.querySelector("style[data-crew-statistics]")) return;
  const style = document.createElement("style");
  style.dataset.crewStatistics = "1";
  style.textContent = `
    .gcCrewStatsCard{grid-column:1/-1}.gcCrewStatsGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:10px;margin-top:14px}.gcCrewStat{padding:12px;border:1px solid #e1e7ef;border-radius:14px;background:#fbfcfe}.gcCrewStat strong{display:block;font-size:21px;line-height:1.15;color:#17233a}.gcCrewStat span{display:block;margin-top:4px;color:#667085;font-size:12px}.gcCrewQuality{margin-top:12px;padding-top:12px;border-top:1px solid #e7ebf1;color:#526277;font-size:12px;line-height:1.5}.gcCrewQuality b{color:#24334c}.gcCrewStatsState{color:#667085;font-size:13px}
  `;
  document.head.appendChild(style);
}

function ensureCard() {
  const panel = document.getElementById("adminPanelOverview");
  if (!panel) return null;
  let card = document.getElementById("gcCrewStatsCard");
  if (card) return card;
  ensureStyles();
  card = document.createElement("article");
  card.id = "gcCrewStatsCard";
  card.className = "card gcCrewStatsCard";
  card.innerHTML = `
    <div class="sectionHead"><div><span class="eyebrow">Crew-Nutzung</span><h2>Remy · Sprache, API-Sparen & Qualität</h2><p>Nur technische Nutzungs- und Korrektursignale. Keine Diktate oder Testinhalte.</p></div></div>
    <div id="gcCrewStatsBody" class="gcCrewStatsState">Noch keine Daten geladen.</div>`;
  const grid = panel.querySelector(".adminOverviewGrid");
  if (grid) grid.prepend(card);
  else panel.appendChild(card);
  return card;
}

function mostCorrected(summary) {
  const entries = Object.entries(summary?.correctionsByField || {}).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return "Noch keine Korrekturen erfasst";
  return entries.slice(0, 3).map(([field, count]) => `${FIELD_LABELS[field] || field}: ${count}`).join(" · ");
}

function render(summary) {
  const body = document.getElementById("gcCrewStatsBody");
  if (!body) return;
  const days = Number(summary.days) || activeDays();
  body.className = "";
  body.innerHTML = `
    <div class="gcCrewStatsGrid">
      <div class="gcCrewStat"><strong>${Number(summary.uniqueUsers || 0).toLocaleString("de-DE")}</strong><span>Nutzende Lehrkräfte · ${days} T.</span></div>
      <div class="gcCrewStat"><strong>${Number(summary.submissions || 0).toLocaleString("de-DE")}</strong><span>Remy-Aufträge</span></div>
      <div class="gcCrewStat"><strong>${pct(summary.voiceShare)}</strong><span>per Sprache</span></div>
      <div class="gcCrewStat"><strong>${Number(summary.localPatches || 0).toLocaleString("de-DE")}</strong><span>lokal gelöst · 0 API</span></div>
      <div class="gcCrewStat"><strong>${Number(summary.aiFallbacks || 0).toLocaleString("de-DE")}</strong><span>KI-Fallbacks</span></div>
      <div class="gcCrewStat"><strong>${pct(summary.fieldCorrectionRate)}</strong><span>Feld-Korrekturrate</span></div>
    </div>
    <div class="gcCrewQuality"><b>Geschätzt eingesparte KI-Aufrufe:</b> ${Number(summary.estimatedAiCallsSaved || 0).toLocaleString("de-DE")} · <b>Häufig korrigiert:</b> ${mostCorrected(summary)}</div>`;
}

async function loadCrewStats() {
  if (loading || document.getElementById("adminView")?.classList.contains("hidden")) return;
  const card = ensureCard();
  if (!card) return;
  loading = true;
  const body = document.getElementById("gcCrewStatsBody");
  if (body) {
    body.className = "gcCrewStatsState";
    body.textContent = "Crew-Statistik wird geladen …";
  }
  try {
    const functions = getFunctions(getApp(), "europe-west1");
    const callable = httpsCallable(functions, "getCrewTelemetrySummary", { timeout: 30000 });
    const result = await callable({ days: activeDays() });
    render(result.data || {});
  } catch (error) {
    if (body) {
      body.className = "gcCrewStatsState";
      body.textContent = "Crew-Statistik ist in dieser Umgebung noch nicht verfügbar.";
    }
    console.debug("Crew-Statistik nicht verfügbar:", error?.code || error?.message || error);
  } finally {
    loading = false;
  }
}

export function installCrewStatisticsAdmin() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  ensureCard();
  document.addEventListener("click", event => {
    if (event.target.closest("#adminTopBtn, #refreshAdminBtn")) window.setTimeout(() => void loadCrewStats(), 80);
    if (event.target.closest(".adminPeriodBtn")) window.setTimeout(() => void loadCrewStats(), 30);
  }, false);
  const adminView = document.getElementById("adminView");
  if (adminView) new MutationObserver(() => {
    if (!adminView.classList.contains("hidden")) void loadCrewStats();
  }).observe(adminView, { attributes: true, attributeFilter: ["class"] });
}

installCrewStatisticsAdmin();
