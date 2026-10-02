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
    const accessToken = await tokenProvider.getAccessToken();
    const body = {
      model: request.model || config.defaultModel,
      max_tokens: Number(request.max_tokens || 512),
      messages: normalizeMessages(request.messages),
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
      const requestId = payload && payload.request_id ? ` request_id=${payload.request_id}` : '';
      const detail = payload && payload.error && payload.error.message
        ? payload.error.message
        : response.statusText;
      throw new Error(`Anthropic Messages API failed: HTTP ${response.status}${requestId}${detail ? ` - ${detail}` : ''}`);
    }

    return {
      provider: 'anthropic',
      model: payload.model || body.model,
      id: payload.id || null,
      text: extractText(payload),
      stop_reason: payload.stop_reason || null,
      usage: payload.usage || null,
      raw: payload,
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
