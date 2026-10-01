(() => {
  'use strict';

  const clone = value => JSON.parse(JSON.stringify(value));

  function answerSummary(question) {
    const mode = question.answerMode || 'choice';
    if (mode === 'text') return (question.acceptedAnswers || []).join(' / ');
    if (mode === 'number') {
      const tolerance = Number(question.tolerance) || 0;
      return `${question.numericAnswer}${question.unit ? ` ${question.unit}` : ''}${tolerance ? ` (±${tolerance})` : ''}`;
    }
    return question.options?.[question.correctIndex] || '';
  }

  function buildReview(profile, questions, world) {
    return {
      profile: { ...profile },
      summary: {
        rooms: world.rooms.length,
        questions: questions.length,
        puzzles: 4,
        estimatedMinutes: '10–15'
      },
      route: world.rooms.map(room => ({
        id: room.id,
        name: room.name,
        questionIds: [...(room.questionIds || [])]
      })),
      questions: questions.map((question, index) => ({
        slotId: question.id,
        slotNumber: index + 1,
        sourceType: question.source?.type || question.answerMode || 'choice',
        sourcePosition: question.source?.position ?? null,
        sourceId: question.source?.sourceId || '',
        learningGoal: question.learningGoal,
        prompt: question.prompt,
        answer: answerSummary(question),
        hint: question.hint,
        explanation: question.explanation,
        remediation: question.remediation?.explanation || '',
        activeTask: question.remediation?.activeTask?.text || '',
        transferPrompt: question.remediation?.transfer?.prompt || '',
        transferAnswers: [...(question.remediation?.transfer?.acceptedAnswers || [])]
      }))
    };
  }

  function prepare(sourceTest, options = {}) {
    const adapter = window.GradeCrewEscapeQuestionAdapter;
    const prototype = window.GradeCrewEscapePrototype;
    if (!adapter || !prototype) {
      return {
        ok: false,
        stage: 'runtime',
        errors: [{ code: 'runtime_missing', message: 'Escape-Adapter oder Weltdefinition ist nicht geladen.' }],
        warnings: []
      };
    }

    const adapted = adapter.adaptTest(sourceTest, options);
    if (!adapted.ok) return { ...adapted, stage: 'adapter' };

    const preflight = prototype.validateWorldDefinition(prototype.world, adapted.questions);
    if (!preflight.ok) {
      return {
        ok: false,
        stage: 'preflight',
        errors: preflight.errors.map(message => ({ code: 'escape_preflight', message })),
        warnings: [...adapted.warnings, ...preflight.warnings]
      };
    }

    const questions = clone(adapted.questions);
    return {
      ok: true,
      stage: 'ready',
      errors: [],
      warnings: [...adapted.warnings, ...preflight.warnings],
      profile: { ...adapted.profile },
      selectedPositions: [...adapted.selectedPositions],
      questions,
      teacherReview: buildReview(adapted.profile, questions, prototype.world),
      launchPayload: {
        worldId: prototype.world.id,
        worldVersion: prototype.world.version,
        profile: { ...adapted.profile },
        questions: clone(questions)
      }
    };
  }

  function apply(prepared) {
    if (!prepared?.ok || prepared.stage !== 'ready') {
      return { ok: false, errors: [{ code: 'not_ready', message: 'Das Escape-Paket ist noch nicht startbereit.' }] };
    }
    const integration = window.GradeCrewEscapeIntegration;
    if (!integration || typeof integration.replaceQuestionSet !== 'function') {
      return { ok: false, errors: [{ code: 'runtime_missing', message: 'Die Escape-Spielruntime ist noch nicht bereit.' }] };
    }
    return integration.replaceQuestionSet(clone(prepared.questions));
  }

  window.GradeCrewEscapeBuilder = Object.freeze({ prepare, apply, buildReview, answerSummary });
})();
