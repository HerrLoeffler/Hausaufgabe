'use strict';

const DEFAULT_AUDIENCE = 'https://api.anthropic.com';
const DEFAULT_BASE_URL = 'https://api.anthropic.com';
const DEFAULT_MODEL = 'claude-haiku-4-5';

function readRequiredEnv(env, name) {
  const value = String(env[name] || '').trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function readAnthropicConfig(env = process.env) {
  return {
    audience: String(env.ANTHROPIC_AUDIENCE || DEFAULT_AUDIENCE).trim(),
    baseUrl: String(env.ANTHROPIC_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, ''),
    federationRuleId: readRequiredEnv(env, 'ANTHROPIC_FEDERATION_RULE_ID'),
    organizationId: readRequiredEnv(env, 'ANTHROPIC_ORGANIZATION_ID'),
    serviceAccountId: readRequiredEnv(env, 'ANTHROPIC_SERVICE_ACCOUNT_ID'),
    workspaceId: String(env.ANTHROPIC_WORKSPACE_ID || '').trim() || null,
    defaultModel: String(env.ANTHROPIC_DEFAULT_MODEL || DEFAULT_MODEL).trim(),
  };
}

function anthropicConfigured(env = process.env) {
  return [
    'ANTHROPIC_FEDERATION_RULE_ID',
    'ANTHROPIC_ORGANIZATION_ID',
    'ANTHROPIC_SERVICE_ACCOUNT_ID',
  ].every((name) => Boolean(String(env[name] || '').trim()));
}

module.exports = {
  DEFAULT_AUDIENCE,
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  readAnthropicConfig,
  anthropicConfigured,
};
