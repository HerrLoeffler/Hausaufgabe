(() => {
  'use strict';

  const COMPATIBLE_TYPES = Object.freeze(['single', 'dropdown', 'truefalse', 'text', 'number']);
  const PLANNED_TYPES = Object.freeze([]);
  const UNSUPPORTED_TYPES = Object.freeze(['multi', 'gapfill', 'matching', 'ordering', 'grouping', 'markwords']);

  const clone = value => JSON.parse(JSON.stringify(value));
  const nonempty = value => String(value || '').trim();

  function issue(code, message, sourceIndex = null) {
    return { code, message, sourceIndex };
  }

  function validateSupport(support, sourceIndex) {
    const errors = [];
    if (!support || typeof support !== 'object') {
      errors.push(issue('missing_support', 'Für jede Escape-Aufgabe werden Lernziel, Hilfe und Transferdaten benötigt.', sourceIndex));
      return errors;
    }
    if (!nonempty(support.learningGoal)) errors.push(issue('missing_learning_goal', 'Lernziel fehlt.', sourceIndex));
    if (!nonempty(support.hint)) errors.push(issue('missing_hint', 'Fachlicher Hinweis fehlt.', sourceIndex));
    if (!nonempty(support.explanation)) errors.push(issue('missing_explanation', 'Kurze Lösungserklärung fehlt.', sourceIndex));
    if (!nonempty(support.remediation?.explanation)) errors.push(issue('missing_remediation', 'Kurze Erklärung nach Fehlversuchen fehlt.', sourceIndex));
    if (!nonempty(support.remediation?.activeTask?.text)) errors.push(issue('missing_active_task', 'Aktiver Merksatz/Lernschritt fehlt.', sourceIndex));
    if (!nonempty(support.remediation?.transfer?.prompt)) errors.push(issue('missing_transfer', 'Neue Transferaufgabe fehlt.', sourceIndex));
    if (!Array.isArray(support.remediation?.transfer?.acceptedAnswers) || !support.remediation.transfer.acceptedAnswers.some(nonempty)) {
      errors.push(issue('missing_transfer_answers', 'Akzeptierte Antworten für die Transferaufgabe fehlen.', sourceIndex));
    }
    return errors;
  }

  function visualDependency(question) {
    return Boolean(
      question?.imageDataUrl ||
      question?.imageUrl ||
      question?.mediaIntent?.kind === 'ai_generated' ||
      question?.mediaIntent?.kind === 'image_choices' ||
      (Array.isArray(question?.options) && question.options.some(option => option?.imageDataUrl || option?.imageUrl))
    );
  }

  function adaptAnswer(source, sourceIndex) {
    const type = String(source?.type || '');
    const errors = [];
    const warnings = [];

    if (!COMPATIBLE_TYPES.includes(type)) {
      const known = UNSUPPORTED_TYPES.includes(type);
      errors.push(issue(
        'unsupported_type',
        known
          ? `Der Aufgabentyp „${type}“ wird im Escape Room noch nicht als Fortschrittsfrage unterstützt.`
          : `Unbekannter GradeCrew-Aufgabentyp „${type || '(leer)'}“.`,
        sourceIndex
      ));
      return { errors, warnings };
    }

    if (visualDependency(source)) {
      errors.push(issue('visual_dependency', 'Bildabhängige Aufgaben werden erst übernommen, wenn der Escape Room Bilder sicher im Lernslot anzeigen kann.', sourceIndex));
      return { errors, warnings };
    }

    if (type === 'text') {
      const acceptedAnswers = Array.isArray(source.acceptedAnswers) ? source.acceptedAnswers.map(nonempty).filter(Boolean) : [];
      if (source.manualReview !== false) {
        errors.push(issue('manual_review_required', 'Freitext mit manueller Nachkorrektur darf den Spielfortschritt nicht automatisch freischalten.', sourceIndex));
        return { errors, warnings };
      }
      if (!acceptedAnswers.length) {
        errors.push(issue('missing_accepted_answers', 'Freitext benötigt mindestens eine akzeptierte Antwortvariante.', sourceIndex));
        return { errors, warnings };
      }
      return { answer: { answerMode: 'text', acceptedAnswers }, errors, warnings };
    }

    if (type === 'number') {
      const numericAnswer = Number(source.numericAnswer);
      const tolerance = source.tolerance == null || source.tolerance === '' ? 0 : Number(source.tolerance);
      if (!['number', 'string'].includes(typeof source.numericAnswer) || String(source.numericAnswer).trim() === '' ||
          !Number.isFinite(numericAnswer) || !Number.isFinite(tolerance) || tolerance < 0) {
        errors.push(issue('invalid_numeric_answer', 'Zahlaufgaben benötigen eine numerische Lösung und eine Toleranz größer oder gleich 0.', sourceIndex));
        return { errors, warnings };
      }
      return { answer: { answerMode: 'number', numericAnswer, tolerance, unit: nonempty(source.unit) }, errors, warnings };
    }

    if (type === 'single' || type === 'dropdown') {
      const options = Array.isArray(source.options) ? source.options : [];
      const correct = options.map((option, index) => option?.correct === true ? index : -1).filter(index => index >= 0);
      if (options.length < 2 || correct.length !== 1 || options.some(option => typeof option?.correct !== 'boolean' || !nonempty(option?.text))) {
        errors.push(issue('invalid_choice', 'Single-/Dropdown-Aufgaben benötigen mindestens zwei Textantworten und genau eine richtige Antwort.', sourceIndex));
        return { errors, warnings };
      }
      return {
        answer: {
          answerMode: 'choice',
          options: options.map(option => nonempty(option.text)),
          correctIndex: correct[0]
        },
        errors,
        warnings
      };
    }

    if (typeof source.correctBoolean !== 'boolean') {
      return { errors: [issue('invalid_boolean_answer', 'Richtig/Falsch benötigt eine ausdrückliche boolesche Lösung.', sourceIndex)], warnings };
    }
    return {
      answer: {
        answerMode: 'choice',
        options: ['Richtig', 'Falsch'],
        correctIndex: source.correctBoolean === true ? 0 : 1
      },
      errors,
      warnings
    };
  }

  function adaptQuestion(source, support, slotId, sourceIndex) {
    const errors = [];
    const warnings = [];
    const prompt = nonempty(source?.text);
    if (!prompt) errors.push(issue('missing_prompt', 'Fragetext fehlt.', sourceIndex));
    errors.push(...validateSupport(support, sourceIndex));

    const adaptedAnswer = adaptAnswer(source, sourceIndex);
    errors.push(...adaptedAnswer.errors);
    warnings.push(...adaptedAnswer.warnings);
    if (errors.length) return { errors, warnings };

    const remediation = clone(support.remediation);
    remediation.activeTask.instruction = nonempty(remediation.activeTask.instruction) || 'Übertrage den zentralen Merksatz.';
    remediation.activeTask.text = nonempty(remediation.activeTask.text);
    remediation.transfer.acceptedAnswers = remediation.transfer.acceptedAnswers.map(nonempty).filter(Boolean);
    remediation.transfer.hint = nonempty(remediation.transfer.hint) || 'Nutze dieselbe Strategie noch einmal.';
    remediation.transfer.explanation = nonempty(remediation.transfer.explanation) || 'Die neue Aufgabe ist damit gelöst.';

    const tutorAnswers = Array.isArray(support.tutorAnswers)
      ? support.tutorAnswers
          .filter(entry => nonempty(entry?.answer) && Array.isArray(entry?.patterns) && entry.patterns.some(nonempty))
          .map(entry => ({ patterns: entry.patterns.map(nonempty).filter(Boolean), answer: nonempty(entry.answer) }))
      : [];

    return {
      question: {
        id: slotId,
        learningGoal: nonempty(support.learningGoal),
        prompt,
        ...adaptedAnswer.answer,
        hint: nonempty(support.hint),
        explanation: nonempty(support.explanation),
        remediation,
        tutorAnswers,
        source: {
          system: 'gradecrew',
          type: String(source.type),
          sourceId: nonempty(source.id || source.questionId),
          position: Number.isFinite(Number(source.position)) ? Number(source.position) : sourceIndex + 1,
          points: Number.isFinite(Number(source.points)) ? Number(source.points) : null
        }
      },
      errors,
      warnings
    };
  }

  function adaptTest(sourceTest, { supports = [], positions = null } = {}) {
    const errors = [];
    const warnings = [];
    const sourceQuestions = Array.isArray(sourceTest?.questions) ? sourceTest.questions : [];

    let selectedPositions;
    if (positions == null) {
      if (sourceQuestions.length !== 8) {
        errors.push(issue('select_eight', `Der Escape Room benötigt genau 8 ausgewählte Aufgaben; der Test enthält ${sourceQuestions.length}.`));
        return { ok: false, errors, warnings, questions: [] };
      }
      selectedPositions = sourceQuestions.map((_, index) => index);
    } else {
      if (!Array.isArray(positions) || positions.length !== 8 || positions.some(value => !Number.isInteger(value)) || new Set(positions).size !== 8) {
        errors.push(issue('select_eight', 'Es müssen genau 8 unterschiedliche Aufgabenpositionen ausgewählt werden.'));
        return { ok: false, errors, warnings, questions: [] };
      }
      selectedPositions = positions.map(Number);
    }

    if (!Array.isArray(supports) || supports.length !== 8) {
      errors.push(issue('support_count', 'Für die 8 ausgewählten Aufgaben werden genau 8 Lernhilfe-/Transferpakete benötigt.'));
      return { ok: false, errors, warnings, questions: [] };
    }

    const questions = [];
    selectedPositions.forEach((sourceIndex, slotIndex) => {
      if (!Number.isInteger(sourceIndex) || sourceIndex < 0 || sourceIndex >= sourceQuestions.length) {
        errors.push(issue('invalid_position', `Aufgabenposition ${sourceIndex} existiert nicht.`, sourceIndex));
        return;
      }
      const adapted = adaptQuestion(sourceQuestions[sourceIndex], supports[slotIndex], `q${slotIndex + 1}`, sourceIndex);
      errors.push(...adapted.errors);
      warnings.push(...adapted.warnings);
      if (adapted.question) questions.push(adapted.question);
    });

    const profile = {
      title: nonempty(sourceTest?.title),
      subject: nonempty(sourceTest?.subject),
      grade: nonempty(sourceTest?.grade),
      topic: nonempty(sourceTest?.topic || sourceTest?.description)
    };

    return {
      ok: errors.length === 0 && questions.length === 8,
      errors,
      warnings,
      questions,
      profile,
      selectedPositions
    };
  }

  window.GradeCrewEscapeQuestionAdapter = Object.freeze({
    compatibleTypes: COMPATIBLE_TYPES,
    plannedTypes: PLANNED_TYPES,
    unsupportedTypes: UNSUPPORTED_TYPES,
    adaptAnswer,
    adaptQuestion,
    adaptTest
  });
})();
