'use strict';

const DEFAULT_AUDIENCE = 'https://api.anthropic.com';
const DEFAULT_BASE_URL = 'https://api.anthropic.com';
const DEFAULT_MODEL = 'claude-haiku-4-5';
const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com';
// Keep first gateway comparison aligned with GradeCrew's current text model.
const DEFAULT_OPENAI_MODEL = 'gpt-5.6-luna';

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

module.exports = {
  DEFAULT_AUDIENCE,
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  DEFAULT_OPENAI_BASE_URL,
  DEFAULT_OPENAI_MODEL,
  readAllowedModels,
  readAnthropicConfig,
  anthropicConfigured,
  readOpenAIConfig,
  openaiConfigured,
};
