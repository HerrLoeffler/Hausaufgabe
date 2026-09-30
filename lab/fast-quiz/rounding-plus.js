(() => {
  'use strict';

  const math = window.FastQuizMath;
  if (!math) throw new Error('FastQuizMath fehlt. rounding-plus.js muss nach math-engine-v4.js geladen werden.');

  const originalCreateEngine = math.createEngine;
  math.OP_SYMBOL.round = '≈';
  math.OP_LABEL.round = 'Runden';
  math.DOMAIN_LABEL.rounding = 'Runden · Dezimalzahlen';
  math.LEVEL_RULES.rounding = {
    n1: 'Auf ganze Zahlen und Zehntel runden · überschaubare Dezimalzahlen.',
    n2: 'Auf Zehntel und Hundertstel runden · Zahlen bis etwa 100.',
    n3: 'Auf Zehntel, Hundertstel und Tausendstel runden · Zahlen bis etwa 1.000.',
    n4: 'Gemischt bis zur Tausendstelstelle · größere Zahlen und knappere Rundungsfälle.'
  };

  function rng(seed) {
    let value = seed >>> 0;
    return () => {
      value += 0x6D2B79F5;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const int = (r, min, max) => Math.floor(r() * (max - min + 1)) + min;
  const pick = (r, values) => values[Math.floor(r() * values.length)];
  function shuffle(r, values) {
    const out = [...values];
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(r() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  const TARGETS = {
    n1: [0, 1],
    n2: [1, 2],
    n3: [1, 2, 3],
    n4: [0, 1, 2, 3]
  };
  const MAX_WHOLE = { n1: 20, n2: 100, n3: 1000, n4: 5000 };
  const PLACE_LABEL = ['ganze Zahl', 'Zehntel', 'Hundertstel', 'Tausendstel'];
  const NEXT_PLACE = ['Zehntelstelle', 'Hundertstelstelle', 'Tausendstelstelle', 'Zehntausendstelstelle'];

  function fmt(value, places) {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: places,
      maximumFractionDigits: places,
      useGrouping: false
    }).format(value);
  }

  function uniqueOptions(r, correct, values, places) {
    const out = [correct];
    for (const value of values) {
      const text = fmt(value, places);
      if (!out.includes(text)) out.push(text);
      if (out.length === 4) break;
    }
    let step = 1;
    const unit = 10 ** (-places);
    while (out.length < 4) {
      const text = fmt(Number(correct.replace(',', '.')) + step * unit, places);
      if (!out.includes(text)) out.push(text);
      step += 1;
    }
    return shuffle(r, out);
  }

  function decimalRoundingQuestion(r, level, index) {
    const targetPlaces = pick(r, TARGETS[level] || TARGETS.n2);
    const extra = level === 'n4' ? 2 : 1;
    const sourcePlaces = Math.min(5, Math.max(targetPlaces + extra, targetPlaces + 1));
    const scale = 10 ** sourcePlaces;
    const maxUnits = Math.max(10, MAX_WHOLE[level] * scale);
    let units = int(r, 1, maxUnits);
    const trailingFactor = 10 ** (sourcePlaces - targetPlaces);
    while (units % trailingFactor === 0) units = int(r, 1, maxUnits);
    const raw = units / scale;
    const factor = 10 ** targetPlaces;
    const answer = Math.round((raw + Number.EPSILON) * factor) / factor;
    const correct = fmt(answer, targetPlaces);
    const unit = 10 ** (-targetPlaces);
    const truncated = Math.floor(raw * factor) / factor;
    const wrongPlaceFactor = targetPlaces > 0 ? 10 ** (targetPlaces - 1) : 0.1;
    const wrongPlace = targetPlaces > 0
      ? Math.round((raw + Number.EPSILON) * wrongPlaceFactor) / wrongPlaceFactor
      : Math.round(raw * 10) / 10;
    const options = uniqueOptions(r, correct, [truncated, answer + unit, Math.max(0, answer - unit), wrongPlace], targetPlaces);
    const source = fmt(raw, sourcePlaces);
    return {
      id: `round:decimal:${level}:${index}:${units}:${targetPlaces}`,
      prompt: `Runde ${source} auf ${PLACE_LABEL[targetPlaces]}.`,
      options,
      correct,
      explanation: `${NEXT_PLACE[targetPlaces]} entscheidet: ${source} ≈ ${correct}.`,
      domain: 'decimal',
      operation: 'round'
    };
  }

  function createRoundingEngine(config) {
    const r = rng((config.seed ^ 0x51A7D3C9) >>> 0);
    let index = 0;
    return { next: () => decimalRoundingQuestion(r, config.level || 'n2', ++index) };
  }

  math.createEngine = function createEngineWithRounding(config) {
    const operations = config.operations?.length ? [...config.operations] : ['add', 'sub', 'mul', 'div'];
    if (!operations.includes('round')) return originalCreateEngine(config);

    const normalOps = operations.filter(op => op !== 'round');
    const engines = new Map();
    normalOps.forEach((op, i) => {
      engines.set(op, originalCreateEngine({ ...config, operations: [op], seed: ((config.seed >>> 0) + 9973 * (i + 1)) >>> 0 }));
    });
    const roundEngine = createRoundingEngine(config);
    const chooser = rng(((config.seed >>> 0) ^ 0xA11CE) >>> 0);
    let cycle = [];
    function nextOperation() {
      if (!cycle.length) cycle = shuffle(chooser, operations);
      return cycle.shift();
    }
    return {
      next() {
        const op = nextOperation();
        return op === 'round' ? roundEngine.next() : engines.get(op).next();
      }
    };
  };

  function addUi() {
    const operationGrid = document.querySelector('#setupForm .settingSection .choiceGrid.four');
    if (operationGrid && !operationGrid.querySelector('input[value="round"]')) {
      const label = document.createElement('label');
      label.className = 'checkTile';
      label.innerHTML = '<input type="checkbox" name="operation" value="round"><span><b>≈</b>Runden<small style="display:block;margin-top:4px;font-size:11px;font-weight:600;color:#64748b">Dezimalzahlen bis Tausendstel</small></span>';
      operationGrid.append(label);
      operationGrid.classList.remove('four');
      operationGrid.style.gridTemplateColumns = 'repeat(auto-fit,minmax(145px,1fr))';

      const quick = document.createElement('button');
      quick.type = 'button';
      quick.className = 'textButton';
      quick.id = 'roundOnlyBtn';
      quick.textContent = 'Schnellwahl: nur Runden bis Tausendstel';
      quick.style.marginTop = '10px';
      operationGrid.after(quick);
      quick.addEventListener('click', () => {
        document.querySelectorAll('input[name="operation"]').forEach(input => { input.checked = input.value === 'round'; });
        document.querySelectorAll('input[name="domain"]').forEach(input => { input.checked = input.value === 'decimal'; input.dispatchEvent(new Event('change', { bubbles: true })); });
        const n3 = document.querySelector('input[name="level"][value="n3"]');
        if (n3) { n3.checked = true; n3.dispatchEvent(new Event('change', { bubbles: true })); }
      });

      label.querySelector('input').addEventListener('change', event => {
        if (!event.target.checked) return;
        const decimal = document.querySelector('input[name="domain"][value="decimal"]');
        if (decimal && !decimal.checked) { decimal.checked = true; decimal.dispatchEvent(new Event('change', { bubbles: true })); }
      });
    }

    const highscoreDomain = document.getElementById('highscoreDomain');
    if (highscoreDomain && !highscoreDomain.querySelector('option[value="rounding"]')) {
      const option = document.createElement('option');
      option.value = 'rounding';
      option.textContent = 'Runden · Dezimalzahlen';
      highscoreDomain.insertBefore(option, highscoreDomain.querySelector('option[value="mixed"]'));
    }

    const form = document.getElementById('setupForm');
    if (form) form.addEventListener('submit', () => {
      const round = document.querySelector('input[name="operation"][value="round"]');
      if (!round?.checked) return;
      const decimal = document.querySelector('input[name="domain"][value="decimal"]');
      if (decimal && !decimal.checked) decimal.checked = true;
    }, true);
  }

  addUi();
})();
