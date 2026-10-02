'use strict';

const API_VERSION = '2023-06-01';

function extractText(message) {
  if (!message || !Array.isArray(message.content)) return '';
  return message.content
    .filter((block) => block && block.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text)
    .join('\n')
    .trim();
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('messages must be a non-empty array');
  }
  return messages.map((message) => {
    if (!message || !['user', 'assistant'].includes(message.role)) {
      throw new Error('Each message role must be user or assistant');
    }
    if (typeof message.content !== 'string' && !Array.isArray(message.content)) {
      throw new Error('Each message content must be a string or content-block array');
    }
    return { role: message.role, content: message.content };
  });
}

function createAnthropicProvider({ fetchImpl = fetch, tokenProvider, config }) {
  if (!tokenProvider || typeof tokenProvider.getAccessToken !== 'function') {
    throw new Error('Anthropic token provider is required');
  }
  if (!config) throw new Error('Anthropic config is required');

  async function generate(request, { signal } = {}) {
    const maxTokens = request.max_tokens === undefined ? 512 : request.max_tokens;
    if (!Number.isSafeInteger(maxTokens) || maxTokens < 1 || maxTokens > 16000) throw new Error('OUTPUT_LIMIT');
    if (request.temperature !== undefined && (!Number.isFinite(request.temperature) || request.temperature < 0 || request.temperature > 1)) throw new Error('INVALID_TEMPERATURE');
    const messages = normalizeMessages(request.messages);
    if (signal?.aborted) throw new Error('CANCELLED');
    const accessToken = await tokenProvider.getAccessToken();
    const body = {
      model: request.model || config.defaultModel,
      max_tokens: maxTokens,
      messages,
    };
    if (typeof request.system === 'string' && request.system.trim()) {
      body.system = request.system.trim();
    }
    if (request.temperature !== undefined) {
      body.temperature = Number(request.temperature);
    }

    const response = await fetchImpl(`${config.baseUrl}/v1/messages`, {
      method: 'POST',
      signal,
      headers: {
        authorization: `Bearer ${accessToken}`,
        'anthropic-version': API_VERSION,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error('PROVIDER_HTTP_ERROR'); error.status = response.status; throw error;
    }
    if (!payload || typeof payload !== 'object' || !Array.isArray(payload.content)) throw new Error('INVALID_PROVIDER_RESPONSE');

    return {
      provider: 'anthropic',
      model: payload.model || body.model,
      id: payload.id || null,
      text: extractText(payload),
      stop_reason: payload.stop_reason || null,
      usage: payload.usage || null,
    };
  }

  return {
    id: 'anthropic',
    capabilities: ['text', 'vision'],
    generate,
  };
}

module.exports = {
  API_VERSION,
  createAnthropicProvider,
  extractText,
  normalizeMessages,
};
