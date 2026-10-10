const MODELS = new Set(['gpt-6-luna', 'gpt-6.1-sol']);
const EFFORTS = new Set(['low', 'medium', 'high']);

export class ModelPolicyError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ModelPolicyError';
    this.code = code;
  }
}

function requireText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function stop(code, message) {
  throw new ModelPolicyError(code, message);
}

export function selectModelPolicy({
  taskId,
  phase,
  risk = 'routine',
  reason,
  authorization,
  model,
  effort,
  lowEvidence,
  acceptance,
  availableModels,
  history = [],
  failure,
  securityStepComplete = false,
}) {
  if (taskId != null && !requireText(taskId)) stop('INVALID_TASK', 'Task ID must be a non-empty string when supplied.');
  if (phase != null && !requireText(phase)) stop('INVALID_PHASE', 'Phase must be a non-empty string when supplied.');
  if (!['routine', 'complexity', 'authorized_high'].includes(risk)) stop('INVALID_RISK', 'Risk classification is not supported.');
  if (!Array.isArray(history)) stop('INVALID_HISTORY', 'Attempt history must be an array.');

  const previous = history.at(-1);
  if (previous && !['completed', 'semantic_failed'].includes(previous.status)) {
    stop('PRIOR_OUTCOME_UNKNOWN', 'Previous launch is pending or unknown; reconcile its receipt before another start.');
  }

  if (failure) {
    if (failure.kind !== 'semantic' || !requireText(failure.evidence)) {
      stop('NON_SEMANTIC_RETRY', 'Authentication, DNS, quota, infrastructure, and unknown outcomes cannot trigger retry or escalation.');
    }
    if (!previous || !requireText(acceptance) || failure.acceptance !== acceptance || previous.acceptance !== acceptance) {
      stop('ACCEPTANCE_CHANGED', 'Escalation requires the same recorded acceptance criteria.');
    }
  }

  const selectedModel = model || (risk === 'routine' ? 'gpt-6-luna' : 'gpt-6.1-sol');
  const selectedEffort = effort || (risk === 'authorized_high' ? 'high' : 'medium');
  if (!MODELS.has(selectedModel)) stop('MODEL_UNSUPPORTED', 'Requested model is outside this bounded policy.');
  if (!EFFORTS.has(selectedEffort)) stop('EFFORT_UNSUPPORTED', 'Requested reasoning effort is unsupported.');

  if (risk === 'complexity' && !requireText(reason)) stop('COMPLEXITY_REASON_REQUIRED', 'Sol medium requires a concrete complexity reason.');
  if (selectedModel === 'gpt-6.1-sol' && risk !== 'complexity' && !(risk === 'authorized_high' && selectedEffort === 'high')) {
    stop('SOL_REQUIRES_COMPLEXITY', 'Sol requires an explicitly justified complexity or authorized high-risk request.');
  }
  if (selectedEffort === 'low' && (!requireText(lowEvidence) || risk !== 'routine' || !requireText(acceptance))) {
    stop('LOW_EVIDENCE_REQUIRED', 'Low effort requires comparable successful routine evidence and fixed acceptance criteria.');
  }
  if (selectedEffort === 'high' && (risk !== 'authorized_high' || !requireText(reason) || !requireText(authorization))) {
    stop('HIGH_REQUIRES_AUTHORIZED_RISK', 'High effort requires a concrete authorized risk or engine requirement.');
  }
  if (availableModels && (!Array.isArray(availableModels) || !availableModels.includes(selectedModel))) {
    stop('MODEL_UNAVAILABLE', 'Selected model is not reported as available by the host; no fallback is allowed.');
  }

  if (previous) {
    const switches = history.slice(1).reduce((total, row, index) => total + Number(row.model !== history[index].model), 0);
    const changedModel = selectedModel !== previous.model;
    if (previous.risk === 'authorized_high' && risk !== 'authorized_high' && !securityStepComplete) {
      stop('HIGH_STEP_DOWNGRADE', 'An authorized high-risk step cannot be downgraded before its recorded completion.');
    }
    if ((changedModel || selectedEffort !== previous.effort) && !failure) {
      stop('CHANGE_REQUIRES_SEMANTIC_FAILURE', 'Changing model or effort requires a recorded semantic failure at a turn boundary.');
    }
    if (changedModel && switches >= 2) stop('SWITCH_LIMIT', 'Two model switches are already recorded for this subtask.');
    if (changedModel && !requireText(reason)) stop('SWITCH_REASON_REQUIRED', 'A model switch needs a concrete reason.');
  }

  return { model: selectedModel, effort: selectedEffort, requestedBy: model || effort ? 'human' : 'policy' };
}

export function buildModelArgs(selection) {
  if (!selection || !MODELS.has(selection.model) || !EFFORTS.has(selection.effort)) {
    stop('INVALID_SELECTION', 'A validated model and effort are required to build CLI arguments.');
  }
  return ['--model', selection.model, '-c', `model_reasoning_effort="${selection.effort}"`];
}
