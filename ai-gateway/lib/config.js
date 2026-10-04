'use strict';

const DEFAULT_AUDIENCE = 'https://api.anthropic.com';
const DEFAULT_BASE_URL = 'https://api.anthropic.com';
const DEFAULT_MODEL = 'claude-haiku-4-5';
const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com';
// Keep first gateway comparison aligned with GradeCrew's current text model.
const DEFAULT_OPENAI_MODEL = 'gpt-5.6-luna';
const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite';
const DEFAULT_MISTRAL_BASE_URL = 'https://api.mistral.ai';
const DEFAULT_MISTRAL_MODEL = 'mistral-small-2603';
const DEFAULT_GEMINI_LOCATION = 'eu';
const DEFAULT_GOOGLE_METADATA_TOKEN_URL = 'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token';

function readRequiredEnv(env, name) {
  const value = String(env[name] || '').trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function readAllowedModels(raw, defaultModel) {
  const values = String(raw || defaultModel)
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
  const unique = [...new Set(values)];
  if (!unique.length || unique.length > 32 || unique.some(value => value.length > 160)) throw new Error('INVALID_MODEL_ALLOWLIST');
  if (!unique.includes(defaultModel)) throw new Error('DEFAULT_MODEL_NOT_ALLOWED');
  return Object.freeze(unique);
}

function readAnthropicConfig(env = process.env) {
  const defaultModel = String(env.ANTHROPIC_DEFAULT_MODEL || DEFAULT_MODEL).trim();
  return {
    audience: String(env.ANTHROPIC_AUDIENCE || DEFAULT_AUDIENCE).trim(),
    baseUrl: String(env.ANTHROPIC_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, ''),
    federationRuleId: readRequiredEnv(env, 'ANTHROPIC_FEDERATION_RULE_ID'),
    organizationId: readRequiredEnv(env, 'ANTHROPIC_ORGANIZATION_ID'),
    serviceAccountId: readRequiredEnv(env, 'ANTHROPIC_SERVICE_ACCOUNT_ID'),
    workspaceId: String(env.ANTHROPIC_WORKSPACE_ID || '').trim() || null,
    defaultModel,
    allowedModels: readAllowedModels(env.ANTHROPIC_ALLOWED_MODELS, defaultModel),
  };
}

function anthropicConfigured(env = process.env) {
  return ['ANTHROPIC_FEDERATION_RULE_ID', 'ANTHROPIC_ORGANIZATION_ID', 'ANTHROPIC_SERVICE_ACCOUNT_ID']
    .every(name => Boolean(String(env[name] || '').trim()));
}

function readOpenAIConfig(env = process.env) {
  const defaultModel = String(env.OPENAI_DEFAULT_MODEL || DEFAULT_OPENAI_MODEL).trim();
  return {
    apiKey: readRequiredEnv(env, 'OPENAI_API_KEY'),
    baseUrl: String(env.OPENAI_BASE_URL || DEFAULT_OPENAI_BASE_URL).replace(/\/$/, ''),
    defaultModel,
    allowedModels: readAllowedModels(env.OPENAI_ALLOWED_MODELS, defaultModel),
    projectId: String(env.OPENAI_PROJECT_ID || '').trim() || null,
    organizationId: String(env.OPENAI_ORGANIZATION_ID || '').trim() || null,
  };
}

function openaiConfigured(env = process.env) {
  return Boolean(String(env.OPENAI_API_KEY || '').trim());
}

function googleVertexBaseUrl(location) {
  const value = String(location || '').trim().toLowerCase();
  if (!value || !/^[a-z0-9-]+$/.test(value)) throw new Error('INVALID_GEMINI_LOCATION');
  if (value === 'global') return 'https://aiplatform.googleapis.com';
  if (value === 'eu' || value === 'us') return `https://aiplatform.${value}.rep.googleapis.com`;
  return `https://${value}-aiplatform.googleapis.com`;
}

function readGeminiConfig(env = process.env) {
  const projectId = String(env.GEMINI_PROJECT_ID || env.GOOGLE_CLOUD_PROJECT || env.GCLOUD_PROJECT || '').trim();
  if (!projectId) throw new Error('Missing required environment variable: GEMINI_PROJECT_ID');
  const location = String(env.GEMINI_LOCATION || DEFAULT_GEMINI_LOCATION).trim().toLowerCase();
  const defaultModel = String(env.GEMINI_DEFAULT_MODEL || DEFAULT_GEMINI_MODEL).trim();
  return {
    projectId,
    location,
    baseUrl: String(env.GEMINI_BASE_URL || googleVertexBaseUrl(location)).replace(/\/$/, ''),
    defaultModel,
    allowedModels: readAllowedModels(env.GEMINI_ALLOWED_MODELS, defaultModel),
    metadataTokenUrl: String(env.GEMINI_METADATA_TOKEN_URL || DEFAULT_GOOGLE_METADATA_TOKEN_URL).trim(),
  };
}

function geminiConfigured(env = process.env) {
  const enabled = String(env.GEMINI_ENABLED || '').trim().toLowerCase() === 'true';
  const projectId = String(env.GEMINI_PROJECT_ID || env.GOOGLE_CLOUD_PROJECT || env.GCLOUD_PROJECT || '').trim();
  return enabled && Boolean(projectId);
}

function readMistralConfig(env = process.env) {
  const defaultModel = String(env.MISTRAL_DEFAULT_MODEL || DEFAULT_MISTRAL_MODEL).trim();
  return {
    apiKey: readRequiredEnv(env, 'MISTRAL_API_KEY'),
    baseUrl: String(env.MISTRAL_BASE_URL || DEFAULT_MISTRAL_BASE_URL).replace(/\/$/, ''),
    defaultModel,
    allowedModels: readAllowedModels(env.MISTRAL_ALLOWED_MODELS, defaultModel),
  };
}

function mistralConfigured(env = process.env) {
  return Boolean(String(env.MISTRAL_API_KEY || '').trim());
}

module.exports = {
  DEFAULT_AUDIENCE,
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  DEFAULT_OPENAI_BASE_URL,
  DEFAULT_OPENAI_MODEL,
  DEFAULT_GEMINI_MODEL,
  DEFAULT_MISTRAL_BASE_URL,
  DEFAULT_MISTRAL_MODEL,
  DEFAULT_GEMINI_LOCATION,
  DEFAULT_GOOGLE_METADATA_TOKEN_URL,
  readAllowedModels,
  readAnthropicConfig,
  anthropicConfigured,
  readOpenAIConfig,
  openaiConfigured,
  googleVertexBaseUrl,
  readGeminiConfig,
  geminiConfigured,
  readMistralConfig,
  mistralConfigured,
};
