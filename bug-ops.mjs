function bugOpsMillis(value) {
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value?.seconds === "number") return value.seconds * 1000;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function occurrences(row) {
  return Math.max(1, Number(row?.technicalDetails?.occurrences) || 1);
}

const SENSITIVE_PATTERN = /(auth|login|permission|firestore|\brules?\b|security|payment|billing|grade|grading|submission|solution|assessment|attempt|rights|privacy|token|secret|\biam\b|restore|data[-_ ]?loss|delete|role|admin)/i;
const DATA_LOSS_PATTERN = /(data[-_ ]?loss|lost data|datenverlust|gelöscht|deleted unexpectedly|submission.*missing)/i;

export function bugOpsRisk(reportOrIncident = {}) {
  const text = [
    reportOrIncident.errorCode,
    reportOrIncident.action,
    reportOrIncident.message,
    reportOrIncident.technicalDetails?.stage,
    reportOrIncident.technicalDetails?.providerCode,
    reportOrIncident.technicalDetails?.rawMessage,
    ...(reportOrIncident.errorCodes || []),
    ...(reportOrIncident.actions || [])
  ].filter(Boolean).join(" ");
  if (SENSITIVE_PATTERN.test(text)) return "red";
  return "green_candidate";
}

export function bugOpsPriority(incident = {}) {
  const production = Boolean(incident.production);
  const users = Number(incident.uniqueReporters || 0);
  const hits = Number(incident.occurrences || 0);
  const text = [...(incident.errorCodes || []), ...(incident.actions || [])].join(" ");
  if (DATA_LOSS_PATTERN.test(text)) return "P0";
  if (production && (users >= 20 || hits >= 50)) return "P0";
  if (production && (users >= 3 || hits >= 10 || incident.severity === "error")) return "P1";
  if (users >= 5 || hits >= 15) return "P1";
  if (users >= 2 || hits >= 3 || incident.severity === "error") return "P2";
  return "P3";
}

export function bugOpsNotification(incident = {}) {
  if (incident.regressionAfterFix) return "immediate";
  if (incident.priority === "P0") return "immediate";
  if (incident.priority === "P1" && incident.production) return "immediate";
  if (incident.automationStage === "staging_verified") return "retest_ready";
  if (incident.risk === "red" && ["P0", "P1"].includes(incident.priority)) return "action_needed";
  return "digest";
}

export function buildBugIncidents(rows = []) {
  const groups = new Map();
  for (const row of rows.filter(item => item?.category === "app_error")) {
    const fingerprint = String(row.fingerprint || row.errorCode || "unknown").slice(0, 160);
    const key = fingerprint || "unknown";
    const at = bugOpsMillis(row.createdAt);
    const updatedAt = bugOpsMillis(row.updatedAt);
    const group = groups.get(key) || {
      fingerprint: key,
      reports: 0,
      occurrences: 0,
      reporterIds: new Set(),
      firstAt: at || Infinity,
      lastAt: 0,
      errorCodes: new Set(),
      actions: new Set(),
      versions: new Set(),
      releases: new Set(),
      environments: new Set(),
      openReports: 0,
      errorSeverityReports: 0,
      fixTimes: [],
      newestOpenAt: 0,
      automationStage: ""
    };
    group.reports += 1;
    group.occurrences += occurrences(row);
    if (row.userId) group.reporterIds.add(String(row.userId));
    if (at) {
      group.firstAt = Math.min(group.firstAt, at);
      group.lastAt = Math.max(group.lastAt, at);
      if (row.status !== "done") group.newestOpenAt = Math.max(group.newestOpenAt, at);
    }
    if (row.errorCode) group.errorCodes.add(String(row.errorCode));
    if (row.action) group.actions.add(String(row.action));
    if (row.appVersion) group.versions.add(String(row.appVersion));
    const release = row.technicalDetails?.diagnostics?.release?.commit;
    if (release) group.releases.add(String(release));
    group.environments.add(String(row.environment || "unknown"));
    if (row.status !== "done") group.openReports += 1;
    if ((row.severity || row.technicalDetails?.severity) === "error") group.errorSeverityReports += 1;
    if (row.resolution?.fixCommit) group.fixTimes.push(updatedAt || at || 0);
    if (row.bugOps?.automationStage) group.automationStage = String(row.bugOps.automationStage);
    groups.set(key, group);
  }

  return [...groups.values()].map(group => {
    const latestFixAt = Math.max(0, ...group.fixTimes);
    const incident = {
      fingerprint: group.fingerprint,
      reports: group.reports,
      occurrences: group.occurrences,
      uniqueReporters: group.reporterIds.size,
      firstAt: Number.isFinite(group.firstAt) ? group.firstAt : 0,
      lastAt: group.lastAt,
      errorCodes: [...group.errorCodes].sort(),
      actions: [...group.actions].sort(),
      versions: [...group.versions].sort(),
      releases: [...group.releases].sort(),
      environments: [...group.environments].sort(),
      production: group.environments.has("production"),
      openReports: group.openReports,
      severity: group.errorSeverityReports ? "error" : "warning",
      latestFixAt,
      regressionAfterFix: Boolean(latestFixAt && group.newestOpenAt > latestFixAt),
      automationStage: group.automationStage
    };
    incident.risk = bugOpsRisk(incident);
    incident.priority = bugOpsPriority(incident);
    incident.notification = bugOpsNotification(incident);
    incident.autopilot = incident.risk === "green_candidate" ? "candidate" : "blocked";
    return incident;
  }).sort((a, b) => {
    const rank = { P0: 0, P1: 1, P2: 2, P3: 3 };
    return rank[a.priority] - rank[b.priority] || Number(b.regressionAfterFix) - Number(a.regressionAfterFix) || b.lastAt - a.lastAt;
  });
}

export function bugOpsOverview(incidents = []) {
  const counts = { P0: 0, P1: 0, P2: 0, P3: 0, immediate: 0, action_needed: 0, retest_ready: 0, digest: 0 };
  for (const incident of incidents) {
    counts[incident.priority] = (counts[incident.priority] || 0) + 1;
    counts[incident.notification] = (counts[incident.notification] || 0) + 1;
  }
  return {
    ...counts,
    total: incidents.length,
    open: incidents.filter(i => i.openReports > 0).length,
    affectedUsers: incidents.reduce((sum, item) => sum + item.uniqueReporters, 0)
  };
}

export function guardianIncidentPayload(incident = {}) {
  return {
    schemaVersion: 1,
    source: "gradecrew-bugops",
    fingerprint: String(incident.fingerprint || "").slice(0, 160),
    priority: incident.priority || "P3",
    risk: incident.risk || "red",
    reports: Number(incident.reports || 0),
    occurrences: Number(incident.occurrences || 0),
    uniqueReporters: Number(incident.uniqueReporters || 0),
    production: Boolean(incident.production),
    errorCodes: (incident.errorCodes || []).map(String).slice(0, 10),
    actions: (incident.actions || []).map(String).slice(0, 10),
    versions: (incident.versions || []).map(String).slice(0, 10),
    releases: (incident.releases || []).filter(value => /^[a-f0-9]{40}$/i.test(value)).slice(0, 5),
    environments: (incident.environments || []).map(String).slice(0, 5),
    regressionAfterFix: Boolean(incident.regressionAfterFix),
    autopilot: incident.autopilot === "candidate" ? "candidate" : "blocked"
  };
}
