const REQUEST_ID = /^[a-zA-Z0-9-]{1,40}$/;
const REQUIRED_FIELDS = new Set(["subject", "grade", "topic", "count"]);

function requestId(value) {
  if (typeof value !== "string" || !REQUEST_ID.test(value)) throw new Error("Die Remy-Anfrage ist ungültig.");
  return value;
}

function preparedRequest(value) {
  if (!value || typeof value.subject !== "string" || !value.subject.trim() || value.subject.trim().length > 120 ||
      typeof value.grade !== "string" || !value.grade.trim() || value.grade.trim().length > 60 ||
      typeof value.topic !== "string" || !value.topic.trim() || value.topic.trim().length > 500 ||
      !Number.isInteger(value.count) || value.count < 1 || value.count > 100) throw new Error("Remys vorbereitete Testangaben sind ungültig.");
  return { subject: value.subject.trim(), grade: value.grade.trim(), topic: value.topic.trim(), count: value.count };
}

function partialDraft(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Remys Entwurf ist ungültig.");
  const result = {};
  for (const [field, maximum] of [["subject", 120], ["grade", 60], ["topic", 500]]) {
    const item = value[field];
    if (item !== undefined && item !== null && (typeof item !== "string" || item.trim().length > maximum)) throw new Error(`Remys Entwurf für ${field} ist ungültig.`);
    if (item !== undefined && item !== null && item.trim()) result[field] = item.trim();
  }
  if (value.count !== undefined && value.count !== null) {
    if (!Number.isInteger(value.count) || value.count < 1 || value.count > 100) throw new Error("Remys Aufgabenzahl ist ungültig.");
    result.count = value.count;
  }
  return result;
}

function knownFields(value) {
  return partialDraft(value || {});
}

function validatePrepareResult(value) {
  if (value?.status === "ready") {
    const request = preparedRequest(value.preparedRequest);
    return { status: "ready", preparedRequest: request, draft: request };
  }
  if (value?.status !== "needsInfo" || !Array.isArray(value.missingFields) || value.missingFields.length < 1 || value.missingFields.length > REQUIRED_FIELDS.size ||
      new Set(value.missingFields).size !== value.missingFields.length || value.missingFields.some(field => !REQUIRED_FIELDS.has(field)) ||
      typeof value.question !== "string" || !value.question.trim() || value.question.length > 280) throw new Error("Remys Rückfrage ist ungültig.");
  return { status: "needsInfo", missingFields: [...value.missingFields], question: value.question.trim(), draft: partialDraft(value.draft) };
}

function createQuickRemyBridge({ auth, api, storage }) {
  const inFlight = new Map();
  let authGeneration = 0;
  let observedUid = auth.currentUser?.uid || null;
  const memory = new Map();
  const pendingStorage = storage || {
    getItem: key => memory.get(key) || null,
    setItem: (key, value) => memory.set(key, value),
    removeItem: key => memory.delete(key)
  };
  const dedupe = (key, run) => {
    if (inFlight.has(key)) return inFlight.get(key);
    const promise = Promise.resolve().then(run).finally(() => inFlight.delete(key));
    inFlight.set(key, promise);
    return promise;
  };
  function captureSession() {
    const user = auth.currentUser;
    if (!user?.uid) throw Object.assign(new Error("Bitte melde dich erneut an."), { code: "unauthenticated" });
    return { uid: user.uid, generation: authGeneration };
  }
  function assertCurrent(session) {
    if (session.generation !== authGeneration || auth.currentUser?.uid !== session.uid || observedUid !== session.uid) {
      throw Object.assign(new Error("Das GradeCrew-Konto wurde gewechselt. Bitte beginne die Anfrage erneut."), { code: "account-changed" });
    }
  }
  function pendingKey(session) {
    return `gradecrew.quickRemy.pending:${session.uid}`;
  }
  return Object.freeze({
    authChanged(user) {
      const uid = user?.uid || null;
      if (uid !== observedUid) authGeneration += 1;
      observedUid = uid;
    },
    prepare(payload) {
      const session = captureSession();
      const id = requestId(payload?.requestId);
      if (typeof payload.conversationText !== "string" || !payload.conversationText.trim() || payload.conversationText.length > 2500) throw new Error("Der Testwunsch muss zwischen 1 und 2500 Zeichen lang sein.");
      const fields = knownFields(payload.knownFields);
      return dedupe(`prepare:${session.uid}:${id}`, async () => {
        assertCurrent(session);
        const result = await api.prepareQuickRemy({ requestId: id, conversationText: payload.conversationText.trim(), knownFields: fields });
        assertCurrent(session);
        return validatePrepareResult(result);
      });
    },
    submit(payload) {
      const session = captureSession();
      const id = requestId(payload?.requestId);
      const request = preparedRequest(payload.preparedRequest);
      return dedupe(`submit:${session.uid}:${id}`, async () => {
        assertCurrent(session);
        const key = pendingKey(session);
        const existing = pendingStorage.getItem(key);
        if (existing && existing !== id) throw new Error("Ein vorheriger Remy-Auftrag wird noch abgeglichen. Bitte kurz warten.");
        pendingStorage.setItem(key, id);
        const result = await api.submitQuickRemy({ requestId: id, preparedRequest: request });
        assertCurrent(session);
        if (result?.status !== "accepted" || typeof result.jobId !== "string" || !/^[a-zA-Z0-9_-]{10,80}$/.test(result.jobId)) throw new Error("Der Auftrag wurde nicht bestätigt.");
        pendingStorage.removeItem(key);
        return { status: "accepted", jobId: result.jobId };
      });
    },
    recoverPending() {
      const session = captureSession();
      const key = pendingKey(session);
      const id = pendingStorage.getItem(key);
      if (!id) return Promise.resolve({ status: "none" });
      return dedupe(`recover:${session.uid}:${id}`, async () => {
        assertCurrent(session);
        const result = await api.getQuickRemySubmission({ requestId: requestId(id) });
        assertCurrent(session);
        if (result?.status === "accepted" && typeof result.jobId === "string" && /^[a-zA-Z0-9_-]{10,80}$/.test(result.jobId)) {
          pendingStorage.removeItem(key);
          return { status: "accepted", jobId: result.jobId };
        }
        if (result?.status === "notFound" || result?.status === "failed") {
          pendingStorage.removeItem(key);
          return { status: result.status };
        }
        throw new Error("Der offene Remy-Auftrag konnte nicht abgeglichen werden.");
      });
    }
  });
}

export { createQuickRemyBridge, validatePrepareResult, knownFields };
