'use strict';

const DEFAULT_REASONING_EFFORTS = Object.freeze(['minimal', 'low', 'medium', 'high']);

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

function normalizeMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) throw new Error('messages must be a non-empty array');
  return messages.map((message) => {
    if (!message || !['user', 'assistant'].includes(message.role)) throw new Error('Each message role must be user or assistant');
    return { role: message.role, content: normalizeTextContent(message.content) };
  });
}

function extractText(response) {
  if (!response || !Array.isArray(response.output)) return '';
  const parts = [];
  for (const item of response.output) {
    if (!item || item.type !== 'message' || !Array.isArray(item.content)) continue;
    for (const block of item.content) {
      if (block && block.type === 'output_text' && typeof block.text === 'string') parts.push(block.text);
    }
  }
  return parts.join('\n').trim();
}

function normalizeStopReason(response) {
  if (response?.status === 'completed') return 'end_turn';
  if (response?.incomplete_details?.reason === 'max_output_tokens') return 'max_tokens';
  return response?.status || null;
}

function selectModel(request, config) {
  const model = String(request.model || config.defaultModel || '').trim();
  const allowed = Array.isArray(config.allowedModels) && config.allowedModels.length ? config.allowedModels : [config.defaultModel];
  if (!model || !allowed.includes(model)) throw new Error('MODEL_NOT_ALLOWED');
  return model;
}

function createOpenAIProvider({ fetchImpl = fetch, config }) {
  if (!config || !config.apiKey || !config.baseUrl || !config.defaultModel) throw new Error('OpenAI config is required');

  async function generate(request, { signal } = {}) {
    const maxTokens = request.max_tokens === undefined ? 512 : request.max_tokens;
    if (!Number.isSafeInteger(maxTokens) || maxTokens < 1 || maxTokens > 16000) throw new Error('OUTPUT_LIMIT');
    if (request.temperature !== undefined && (!Number.isFinite(request.temperature) || request.temperature < 0 || request.temperature > 2)) throw new Error('INVALID_TEMPERATURE');
    if (request.reasoning_effort !== undefined && !DEFAULT_REASONING_EFFORTS.includes(request.reasoning_effort)) throw new Error('INVALID_REASONING_EFFORT');
    if (signal?.aborted) throw new Error('CANCELLED');

    const model = selectModel(request, config);
    const input = normalizeMessages(request.messages);
    const body = {
      model,
      input,
      max_output_tokens: maxTokens,
      store: false,
    };
    if (typeof request.system === 'string' && request.system.trim()) body.instructions = request.system.trim();
    if (request.temperature !== undefined) body.temperature = Number(request.temperature);
    if (request.reasoning_effort !== undefined) body.reasoning = { effort: request.reasoning_effort };

    const headers = {
      authorization: `Bearer ${config.apiKey}`,
      'content-type': 'application/json',
    };
    if (config.projectId) headers['openai-project'] = config.projectId;
    if (config.organizationId) headers['openai-organization'] = config.organizationId;

    const response = await fetchImpl(`${config.baseUrl}/v1/responses`, {
      method: 'POST', signal, headers, body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error('PROVIDER_HTTP_ERROR');
      error.status = response.status;
      throw error;
    }
    if (!payload || typeof payload !== 'object' || !Array.isArray(payload.output)) throw new Error('INVALID_PROVIDER_RESPONSE');

    return {
      provider: 'openai',
      model: payload.model || model,
      id: payload.id || null,
      text: extractText(payload),
      stop_reason: normalizeStopReason(payload),
      usage: payload.usage || null,
    };
  }

  return { id: 'openai', capabilities: ['text'], generate };
}

module.exports = {
  DEFAULT_REASONING_EFFORTS,
  createOpenAIProvider,
  extractText,
  normalizeMessages,
  normalizeStopReason,
  normalizeTextContent,
  selectModel,
};
