"use strict";

const {
  normalizePrepareRequest,
  normalizePrepareResult,
  normalizeSubmitRequest,
  normalizeRecoveryRequest
} = require("./quick-remy-contract");

function safeDefaults(profile = {}) {
  const settings = profile.settings && typeof profile.settings === "object" ? profile.settings : {};
  const defaults = {};
  for (const [key, maximum] of [["defaultSubject", 120], ["defaultGrade", 60]]) {
    const value = settings[key];
    if (typeof value === "string" && value.trim() && value.trim().length <= maximum) {
      defaults[key === "defaultSubject" ? "subject" : "grade"] = value.trim();
    }
  }
  const count = settings.defaultQuestionCount;
  if (Number.isInteger(count) && count >= 1 && count <= 100) defaults.count = count;
  return defaults;
}

function createQuickRemyService({ requireUser, consumeQuota, interpret, recordUsage, startJob, findSubmission, ensureDispatch, model = "gpt-5.6-luna", promptVersion = "quick-remy-v1" }) {
  async function prepare(request) {
    const { uid, profile } = await requireUser(request);
    const input = normalizePrepareRequest(request.data || {});
    await consumeQuota(uid, "quickRemy");
    let response;
    try {
      response = await interpret({ uid, ...input, defaults: safeDefaults(profile) });
    } catch (error) {
      await recordUsage(uid, "quickRemy", error?.usage || {}, { model, promptVersion, failed: true, code: String(error?.code || error?.name || "provider-error").slice(0, 60) });
      throw error;
    }
    const result = normalizePrepareResult(response?.data || {});
    await recordUsage(uid, "quickRemy", response?.usage || {}, { model, promptVersion, failed: false });
    return result;
  }

  async function submit(request) {
    const { uid } = await requireUser(request);
    const input = normalizeSubmitRequest(request.data || {});
    const result = await startJob(uid, {
      ...input.preparedRequest,
      clientRequestId: input.requestId,
      allowedTypes: ["single", "multi", "text", "dropdown", "truefalse", "gapfill", "matching", "ordering", "grouping", "markwords", "number"],
      points: input.preparedRequest.count,
      imageMode: "none"
    });
    if (typeof result?.jobId !== "string" || !/^[a-zA-Z0-9_-]{10,80}$/.test(result.jobId)) {
      const error = new Error("Der Auftrag wurde nicht bestätigt. Bitte erneut versuchen.");
      error.code = "unavailable";
      throw error;
    }
    return { status: "accepted", jobId: result.jobId };
  }

  async function recover(request) {
    const { uid } = await requireUser(request);
    const input = normalizeRecoveryRequest(request.data || {});
    const job = await findSubmission(uid, input.requestId);
    if (!job || job.ownerId !== uid) return { status: "notFound" };
    if (ensureDispatch && job.status === "queued" && job.dispatchState === "pending") {
      await ensureDispatch(uid, job);
      const refreshed = await findSubmission(uid, input.requestId);
      if (["queued", "running", "ready"].includes(refreshed?.status) && refreshed?.dispatchState !== "failed") return { status: "accepted", jobId: job.id };
    }
    if (["queued", "running", "ready"].includes(job.status) && job.dispatchState !== "failed") return { status: "accepted", jobId: job.id };
    return { status: "failed" };
  }

  return { prepare, submit, recover };
}

module.exports = { createQuickRemyService, safeDefaults };
