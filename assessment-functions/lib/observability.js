"use strict";
const { randomUUID } = require('node:crypto');
const { recordAssessmentServerOperation } = require('./telemetry-server-recorder');

async function safeRecord(record, request, entry, logger) {
  try {
    await record({ request, entry });
  } catch (error) {
    logger.warn('assessment.telemetry_write_failed', {
      schemaVersion: 1,
      component: 'assessment',
      action: entry.action,
      status: entry.status,
      code: String(error?.code || error?.name || 'unknown').slice(0, 60)
    });
  }
}

// One summary per relevant operation; never serialize request, answers or tokens.
function observeAssessment(action, handler, { logger, HttpsError, now = Date.now, reference = () => `ASM-${randomUUID()}`, record = recordAssessmentServerOperation }) {
  return async request => {
    const ref = reference(); const start = now();
    const base = { schemaVersion: 1, component: 'assessment', action, reference: ref, revision: String(process.env.K_REVISION || 'local').slice(0, 120) };
    try {
      const result = await handler(request);
      const durationMs = Math.max(0, now() - start);
      const entry = { ...base, status: 'ok', code: 'none', durationMs };
      if (action === 'startAssessmentAttempt' || action === 'submitAssessmentAttempt' || durationMs > 5000) {
        logger.info('assessment.operation', { ...base, status: 'ok', durationMs });
      }
      await safeRecord(record, request, entry, logger);
      return { ...result, diagnosticReference: ref };
    } catch (error) {
      const code = error instanceof HttpsError ? error.code : 'internal';
      const frames = String(error?.stack || '').split('\n').slice(1, 8).map(line => line.match(/([a-zA-Z0-9_.-]+\.(?:js|mjs|cjs)):(\d+):(\d+)/)?.slice(1).join(':')).filter(Boolean);
      const entry = { ...base, status: 'failed', code, frames, durationMs: Math.max(0, now() - start) };
      if (['internal', 'data-loss', 'unknown'].includes(code)) logger.error('assessment.operation', entry);
      else logger.warn('assessment.operation', entry);
      await safeRecord(record, request, entry, logger);
      // Unknown exceptions may contain private data; never pass their message/stack to pupils or logs.
      throw new HttpsError(code, error instanceof HttpsError ? error.message : 'Der Prüfungsserver konnte die Aktion nicht abschließen. Bitte teile deiner Lehrkraft die Fehlerkennung mit.', { reference: ref, phase: action });
    }
  };
}
module.exports = { observeAssessment };
