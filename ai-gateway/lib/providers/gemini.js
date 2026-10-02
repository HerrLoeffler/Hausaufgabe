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

function normalizeMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) throw new Error('messages must be a non-empty array');
  const contents = messages.map((message) => {
    if (!message || !['user', 'assistant'].includes(message.role)) throw new Error('Each message role must be user or assistant');
    return {
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: normalizeTextContent(message.content) }],
    };
  });
  if (contents.at(-1)?.role !== 'user') throw new Error('INVALID_MESSAGE_ORDER');
  return contents;
}

function selectModel(request, config) {
  const model = String(request.model || config.defaultModel || '').trim();
  const allowed = Array.isArray(config.allowedModels) && config.allowedModels.length ? config.allowedModels : [config.defaultModel];
  if (!model || !allowed.includes(model)) throw new Error('MODEL_NOT_ALLOWED');
  return model;
}

function buildGenerateContentUrl(config, model) {
  const project = encodeURIComponent(config.projectId);
  const location = encodeURIComponent(config.location);
  const modelId = encodeURIComponent(model);
  return `${config.baseUrl}/v1/projects/${project}/locations/${location}/publishers/google/models/${modelId}:generateContent`;
}

function extractText(payload) {
  const candidate = Array.isArray(payload?.candidates) ? payload.candidates[0] : null;
  const parts = Array.isArray(candidate?.content?.parts) ? candidate.content.parts : [];
  return parts
    .filter(part => part && typeof part.text === 'string' && !part.thought)
    .map(part => part.text)
    .join('\n')
    .trim();
}

function normalizeStopReason(payload) {
  const candidate = Array.isArray(payload?.candidates) ? payload.candidates[0] : null;
  const reason = String(candidate?.finishReason || '').trim().toUpperCase();
  if (reason === 'STOP' || reason === 'FINISH_REASON_STOP') return 'end_turn';
  if (reason === 'MAX_TOKENS' || reason === 'FINISH_REASON_MAX_TOKENS') return 'max_tokens';
  return reason ? reason.toLowerCase() : null;
}

function normalizeUsage(usageMetadata) {
  if (!usageMetadata || typeof usageMetadata !== 'object') return null;
  return {
    input_tokens: Number.isFinite(usageMetadata.promptTokenCount) ? usageMetadata.promptTokenCount : null,
    output_tokens: Number.isFinite(usageMetadata.candidatesTokenCount) ? usageMetadata.candidatesTokenCount : null,
    total_tokens: Number.isFinite(usageMetadata.totalTokenCount) ? usageMetadata.totalTokenCount : null,
    input_tokens_details: {
      cached_tokens: Number.isFinite(usageMetadata.cachedContentTokenCount) ? usageMetadata.cachedContentTokenCount : 0,
    },
    output_tokens_details: {
      reasoning_tokens: Number.isFinite(usageMetadata.thoughtsTokenCount) ? usageMetadata.thoughtsTokenCount : 0,
    },
  };
}

function assertNotBlocked(payload) {
  if (payload?.promptFeedback?.blockReason) throw new Error('PROVIDER_BLOCKED');
  const candidate = Array.isArray(payload?.candidates) ? payload.candidates[0] : null;
  const reason = String(candidate?.finishReason || '').trim().toUpperCase();
  if (['SAFETY', 'BLOCKLIST', 'PROHIBITED_CONTENT', 'SPII'].includes(reason)) throw new Error('PROVIDER_BLOCKED');
}

function createGeminiProvider({ fetchImpl = fetch, tokenProvider, config }) {
  if (!config?.projectId || !config?.location || !config?.baseUrl || !config?.defaultModel) throw new Error('Gemini config is required');
  if (!tokenProvider || typeof tokenProvider.getAccessToken !== 'function') throw new Error('Gemini token provider is required');

  async function generate(request, { signal } = {}) {
    const maxTokens = request.max_tokens === undefined ? 512 : request.max_tokens;
    if (!Number.isSafeInteger(maxTokens) || maxTokens < 1 || maxTokens > 16000) throw new Error('OUTPUT_LIMIT');
    if (request.temperature !== undefined && (!Number.isFinite(request.temperature) || request.temperature < 0 || request.temperature > 2)) throw new Error('INVALID_TEMPERATURE');
    if (request.reasoning_effort !== undefined && !REASONING_EFFORTS.includes(request.reasoning_effort)) throw new Error('INVALID_REASONING_EFFORT');
    if (signal?.aborted) throw new Error('CANCELLED');

    const model = selectModel(request, config);
    const body = {
      contents: normalizeMessages(request.messages),
      generationConfig: { maxOutputTokens: maxTokens },
    };
    if (typeof request.system === 'string' && request.system.trim()) {
      body.systemInstruction = { parts: [{ text: request.system.trim() }] };
    }
    // Gemini 3.x manages sampling automatically. We validate the shared contract's
    // temperature above but intentionally do not forward custom sampling values.
    if (request.reasoning_effort !== undefined) {
      body.generationConfig.thinkingConfig = { thinkingLevel: request.reasoning_effort.toUpperCase() };
    }

    const accessToken = await tokenProvider.getAccessToken({ signal });
    const response = await fetchImpl(buildGenerateContentUrl(config, model), {
      method: 'POST',
      signal,
      headers: {
        authorization: `Bearer ${accessToken}`,
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
    if (!payload || typeof payload !== 'object' || !Array.isArray(payload.candidates)) throw new Error('INVALID_PROVIDER_RESPONSE');
    assertNotBlocked(payload);

    return {
      provider: 'gemini',
      model: payload.modelVersion || model,
      id: null,
      text: extractText(payload),
      stop_reason: normalizeStopReason(payload),
      usage: normalizeUsage(payload.usageMetadata),
    };
  }

  return { id: 'gemini', capabilities: ['text'], generate };
}

module.exports = {
  REASONING_EFFORTS,
  buildGenerateContentUrl,
  createGeminiProvider,
  extractText,
  normalizeMessages,
  normalizeStopReason,
  normalizeTextContent,
  normalizeUsage,
  selectModel,
};
