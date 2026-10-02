'use strict';

const JOB_KINDS = Object.freeze([
  'test_generation',
  'multiple_choice_generation',
  'distractor_generation',
  'solution_verification',
  'free_text_grading',
  'curriculum_matching',
  'student_tutoring',
  'question_rewriting',
  'quality_control',
  'image_generation',
  'speech_recognition',
  'text_to_speech',
  'game_content_generation',
  'game_hint',
  'crew_intent',
]);

function createProviderRouter({ providers, defaultProvider = null }) {
  const registry = new Map();
  for (const provider of providers || []) {
    if (!provider || !provider.id || typeof provider.generate !== 'function') {
      throw new Error('Each provider must expose id and generate()');
    }
    registry.set(provider.id, provider);
  }

  function listProviders() {
    return Array.from(registry.values()).map((provider) => ({
      id: provider.id,
      capabilities: Array.isArray(provider.capabilities) ? provider.capabilities : [],
    }));
  }

  function selectProvider(request) {
    const requested = String(request.provider || defaultProvider || '').trim();
    if (!requested) {
      throw new Error('provider is required until GradeCrew routing policy is enabled');
    }
    const provider = registry.get(requested);
    if (!provider) throw new Error(`Unknown provider: ${requested}`);
    return provider;
  }

  async function generate(request, options) {
    if (request.job && !JOB_KINDS.includes(request.job)) {
      throw new Error(`Unknown job kind: ${request.job}`);
    }
    const provider = selectProvider(request);
    const required = ({ image_generation: 'image_generation', speech_recognition: 'speech_recognition', text_to_speech: 'text_to_speech' })[request.job] || 'text';
    if (!provider.capabilities?.includes(required)) throw new Error('UNSUPPORTED_CAPABILITY');
    return provider.generate(request, options);
  }

  return { generate, listProviders, selectProvider };
}

module.exports = { JOB_KINDS, createProviderRouter };
