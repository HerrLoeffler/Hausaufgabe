'use strict';

const REASONING_EFFORTS = Object.freeze(['minimal', 'low', 'medium', 'high']);

function normalizeTextContent(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content) || !content.length) throw new Error('UNSUPPORTED_CAPABILITY');
  const parts = [];
  for (const block of content) {
    if (!block || block.type !== 'text' || typeof block.text !== 'string') throw new Error('UNSUPPORTED_CAPABILITY');
    parts.push(block.text);
  }
  return parts.join('\n');
}

function normalizeMessages(request) {
  if (!Array.isArray(request.messages) || request.messages.length === 0) throw new Error('messages must be a non-empty array');
  const messages = [];
  if (typeof request.system === 'string' && request.system.trim()) {
    messages.push({ role: 'system', content: request.system.trim() });
  }
  for (const message of request.messages) {
    if (!message || !['user', 'assistant'].includes(message.role)) throw new Error('Each message role must be user or assistant');
    messages.push({ role: message.role, content: normalizeTextContent(message.content) });
  }
  return messages;
}

function selectModel(request, config) {
  const model = String(request.model || config.defaultModel || '').trim();
  const allowed = Array.isArray(config.allowedModels) && config.allowedModels.length ? config.allowedModels : [config.defaultModel];
  if (!model || !allowed.includes(model)) throw new Error('MODEL_NOT_ALLOWED');
  return model;
}

function extractText(payload) {
  const choice = Array.isArray(payload?.choices) ? payload.choices[0] : null;
  const content = choice?.message?.content;
  if (typeof content === 'string') return content.trim();
  if (!Array.isArray(content)) return '';
  return content
    .filter(part => part && typeof part.text === 'string')
    .map(part => part.text)
    .join('\n')
    .trim();
}

function normalizeStopReason(payload) {
  const choice = Array.isArray(payload?.choices) ? payload.choices[0] : null;
  const reason = String(choice?.finish_reason || '').trim().toLowerCase();
  if (reason === 'stop') return 'end_turn';
  if (reason === 'length' || reason === 'max_tokens') return 'max_tokens';
  return reason || null;
}

function normalizeUsage(usage) {
  if (!usage || typeof usage !== 'object') return null;
  return {
    input_tokens: Number.isSafeInteger(usage.prompt_tokens) ? usage.prompt_tokens : null,
    output_tokens: Number.isSafeInteger(usage.completion_tokens) ? usage.completion_tokens : null,
    total_tokens: Number.isSafeInteger(usage.total_tokens) ? usage.total_tokens : null,
    input_tokens_details: {
      cached_tokens: Number.isSafeInteger(usage.prompt_tokens_details?.cached_tokens)
        ? usage.prompt_tokens_details.cached_tokens : 0,
    },
  };
}

function createMistralProvider({ fetchImpl = fetch, config }) {
  if (!config?.apiKey || !config?.baseUrl || !config?.defaultModel) throw new Error('Mistral config is required');

  async function generate(request, { signal } = {}) {
    const maxTokens = request.max_tokens === undefined ? 512 : request.max_tokens;
    if (!Number.isSafeInteger(maxTokens) || maxTokens < 1 || maxTokens > 16000) throw new Error('OUTPUT_LIMIT');
    if (request.temperature !== undefined && (!Number.isFinite(request.temperature) || request.temperature < 0 || request.temperature > 1)) throw new Error('INVALID_TEMPERATURE');
    if (request.reasoning_effort !== undefined && !REASONING_EFFORTS.includes(request.reasoning_effort)) throw new Error('INVALID_REASONING_EFFORT');
    if (signal?.aborted) throw new Error('CANCELLED');

    const model = selectModel(request, config);
    const body = {
      model,
      messages: normalizeMessages(request),
      max_tokens: maxTokens,
      stream: false,
      service_tier: 'standard_only',
    };
    if (request.temperature !== undefined) body.temperature = Number(request.temperature);
    if (request.reasoning_effort !== undefined) body.reasoning_effort = request.reasoning_effort;

    const response = await fetchImpl(`${config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      signal,
      headers: {
        authorization: `Bearer ${config.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error('PROVIDER_HTTP_ERROR');
      error.status = response.status;
      throw error;
    }
    if (!payload || typeof payload !== 'object' || !Array.isArray(payload.choices)) throw new Error('INVALID_PROVIDER_RESPONSE');

    return {
      provider: 'mistral',
      model: payload.model || model,
      id: payload.id || null,
      text: extractText(payload),
      stop_reason: normalizeStopReason(payload),
      usage: normalizeUsage(payload.usage),
    };
  }

  return { id: 'mistral', capabilities: ['text'], generate };
}

module.exports = {
  REASONING_EFFORTS,
  createMistralProvider,
  extractText,
  normalizeMessages,
  normalizeStopReason,
  normalizeTextContent,
  normalizeUsage,
  selectModel,
};
