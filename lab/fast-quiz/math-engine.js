(() => {
  'use strict';

  const gcd = (a, b) => {
    a = Math.abs(a); b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a || 1;
  };

  class Fraction {
    constructor(n, d = 1) {
      if (!Number.isInteger(n) || !Number.isInteger(d) || d === 0) throw new Error('Invalid fraction');
      if (d < 0) { n *= -1; d *= -1; }
      const g = gcd(n, d);
      this.n = n / g; this.d = d / g;
    }
    add(o) { return new Fraction(this.n * o.d + o.n * this.d, this.d * o.d); }
    sub(o) { return new Fraction(this.n * o.d - o.n * this.d, this.d * o.d); }
    mul(o) { return new Fraction(this.n * o.n, this.d * o.d); }
    div(o) { if (!o.n) throw new Error('Division by zero'); return new Fraction(this.n * o.d, this.d * o.n); }
    value() { return this.n / this.d; }
    key() { return `${this.n}/${this.d}`; }
  }

  const OP_SYMBOL = { add: '+', sub: '−', mul: '×', div: '÷' };
  const DOMAIN_LABEL = { natural: 'Natürliche Zahlen', integer: 'Ganze Zahlen', decimal: 'Dezimalzahlen', fraction: 'Brüche' };
  const LEVEL_LABEL = { basic: 'Basis', standard: 'Standard', advanced: 'Fortgeschritten', expert: 'Profi' };

  function createRng(seed) {
    let value = seed >>> 0;
    return function random() {
      value += 0x6D2B79F5;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const int = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min;
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  function shuffle(rng, list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function round(value, places = 4) {
    const factor = 10 ** places;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function fmtDecimal(value) {
    return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 4, useGrouping: false }).format(value);
  }

  function fmtInteger(value) { return String(value).replace('-', '−'); }

  function fmtFraction(frac, mixed = false) {
    if (frac.d === 1) return fmtInteger(frac.n);
    const sign = frac.n < 0 ? '−' : '';
    const n = Math.abs(frac.n);
    if (mixed && n > frac.d) {
      const whole = Math.floor(n / frac.d);
      const rest = n % frac.d;
      return rest ? `${sign}${whole} ${rest}/${frac.d}` : `${sign}${whole}`;
    }
    return `${sign}${n}/${frac.d}`;
  }

  function uniqueStrings(rng, correct, candidates, fallbackFactory) {
    const values = [correct];
    for (const candidate of candidates) {
      if (!candidate || values.includes(candidate)) continue;
      values.push(candidate);
      if (values.length === 4) break;
    }
    let i = 1;
    while (values.length < 4) {
      const candidate = fallbackFactory(i++);
      if (!values.includes(candidate)) values.push(candidate);
    }
    return shuffle(rng, values);
  }

  function numericOptions(rng, answer, domain, precision = 0) {
    const display = domain === 'decimal' ? fmtDecimal : fmtInteger;
    const correct = display(answer);
    const magnitude = Math.max(1, Math.abs(answer));
    const step = domain === 'decimal'
      ? (precision >= 2 ? 0.1 : magnitude < 10 ? 0.5 : 1)
      : Math.max(1, Math.round(Math.sqrt(magnitude) / 2));
    const raw = [answer + step, answer - step, answer + 2 * step, answer - 2 * step, -answer, answer * 10, answer / 10]
      .map(value => domain === 'decimal' ? round(value, 4) : Math.round(value));
    return uniqueStrings(rng, correct, raw.map(display), i => display(domain === 'decimal' ? round(answer + i * step, 4) : answer + i * step));
  }

  function makeNumericQuestion(rng, a, b, operation, answer, domain, precision = 0) {
    const display = domain === 'decimal' ? fmtDecimal : fmtInteger;
    const correct = display(answer);
    return {
      id: `${domain}:${operation}:${a}:${b}`,
      prompt: `${display(a)} ${OP_SYMBOL[operation]} ${display(b)} = ?`,
      options: numericOptions(rng, answer, domain, precision),
      correct,
      explanation: `${display(a)} ${OP_SYMBOL[operation]} ${display(b)} = ${correct}.`,
      domain, operation
    };
  }

  const NATURAL = {
    basic: { add: 50, mul: 10, divResult: 10 },
    standard: { add: 250, mul: 12, divResult: 20 },
    advanced: { add: 1200, mul: 25, divResult: 40 },
    expert: { add: 6000, mul: 99, divResult: 99 }
  };

  function naturalQuestion(rng, operation, level) {
    const p = NATURAL[level];
    let a, b, answer;
    if (operation === 'add') {
      a = int(rng, level === 'basic' ? 1 : 10, p.add); b = int(rng, 1, p.add); answer = a + b;
    } else if (operation === 'sub') {
      a = int(rng, 2, p.add * (level === 'expert' ? 2 : 1)); b = int(rng, 1, a); answer = a - b;
    } else if (operation === 'mul') {
      a = int(rng, 2, p.mul); b = int(rng, 2, level === 'expert' ? 40 : p.mul); answer = a * b;
    } else {
      b = int(rng, 2, p.mul); answer = int(rng, 2, p.divResult); a = b * answer;
    }
    return makeNumericQuestion(rng, a, b, operation, answer, 'natural');
  }

  const INTEGER_MAX = { basic: 20, standard: 50, advanced: 120, expert: 300 };
  function signed(rng, max) { return int(rng, -max, max); }
  function signedNonZero(rng, max) { let n = 0; while (!n) n = signed(rng, max); return n; }

  function integerQuestion(rng, operation, level) {
    const max = INTEGER_MAX[level];
    let a, b, answer;
    if (operation === 'div') {
      b = signedNonZero(rng, Math.max(5, Math.floor(max / 4)));
      answer = signedNonZero(rng, Math.max(6, Math.floor(max / 3)));
      a = b * answer;
    } else if (operation === 'mul') {
      const factorMax = level === 'expert' ? 30 : level === 'advanced' ? 20 : 12;
      a = signedNonZero(rng, factorMax); b = signedNonZero(rng, factorMax); answer = a * b;
    } else {
      a = signed(rng, max); b = signed(rng, max); answer = operation === 'add' ? a + b : a - b;
    }
    return makeNumericQuestion(rng, a, b, operation, answer, 'integer');
  }

  const DECIMAL = {
    basic: { places: [1], maxWhole: 20, divisorPlaces: 0 },
    standard: { places: [1, 2], maxWhole: 50, divisorPlaces: 0 },
    advanced: { places: [1, 2], maxWhole: 120, divisorPlaces: 1 },
    expert: { places: [2, 3], maxWhole: 300, divisorPlaces: 1 }
  };

  function randomDecimal(rng, maxWhole, places) {
    const scale = 10 ** places;
    return int(rng, 1, maxWhole * scale) / scale;
  }

  function decimalQuestion(rng, operation, level) {
    const p = DECIMAL[level];
    const places = pick(rng, p.places);
    let a, b, answer;
    if (operation === 'div') {
      const divisorScale = 10 ** p.divisorPlaces;
      b = int(rng, 2, 15 * divisorScale) / divisorScale;
      const targetPlaces = level === 'basic' ? 1 : level === 'standard' ? 1 : 2;
      answer = randomDecimal(rng, level === 'expert' ? 30 : 20, targetPlaces);
      a = round(b * answer, Math.min(4, p.divisorPlaces + targetPlaces));
    } else {
      a = randomDecimal(rng, p.maxWhole, places);
      b = randomDecimal(rng, p.maxWhole, places);
      if (operation === 'add') answer = a + b;
      else if (operation === 'sub') {
        if (level === 'basic' && a < b) [a, b] = [b, a];
        answer = a - b;
      } else answer = a * b;
      answer = round(answer, Math.min(4, operation === 'mul' ? places * 2 : places));
    }
    return makeNumericQuestion(rng, a, b, operation, answer, 'decimal', places);
  }

  const FRACTION_DENOMS = {
    basic: [2, 3, 4, 5, 6, 8, 10],
    standard: [2, 3, 4, 5, 6, 8, 9, 10, 12],
    advanced: [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 16],
    expert: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 20, 24]
  };

  function randomFraction(rng, level, denominator = null) {
    const d = denominator || pick(rng, FRACTION_DENOMS[level]);
    const factor = level === 'basic' ? 1 : level === 'standard' ? 1.25 : level === 'advanced' ? 2 : 3;
    const maxN = Math.max(1, Math.floor(d * factor));
    return new Fraction(int(rng, 1, maxN), d);
  }

  function fractionDistractors(operation, a, b, answer) {
    const candidates = [];
    if (operation === 'add') {
      candidates.push(new Fraction(a.n + b.n, a.d + b.d));
      candidates.push(new Fraction(a.n + b.n, a.d));
    } else if (operation === 'sub') {
      if (a.n !== b.n) candidates.push(new Fraction(a.n - b.n, Math.max(1, a.d + b.d)));
      if (a.d === b.d && a.n !== b.n) candidates.push(new Fraction(Math.abs(a.n - b.n), a.d + 1));
    } else if (operation === 'mul') {
      candidates.push(new Fraction(a.n * b.n, Math.max(1, a.d + b.d)));
      candidates.push(new Fraction(a.n + b.n, a.d * b.d));
    } else {
      candidates.push(a.mul(b));
      candidates.push(new Fraction(a.n * b.n, a.d * b.d));
    }
    candidates.push(new Fraction(answer.n + 1, answer.d));
    candidates.push(new Fraction(answer.n - 1 || answer.n + 2, answer.d));
    candidates.push(new Fraction(answer.n, answer.d + 1));
    return candidates;
  }

  function fractionQuestion(rng, operation, level) {
    let a, b;
    if (level === 'basic' && (operation === 'add' || operation === 'sub')) {
      const d = pick(rng, FRACTION_DENOMS.basic);
      a = randomFraction(rng, level, d); b = randomFraction(rng, level, d);
    } else {
      a = randomFraction(rng, level); b = randomFraction(rng, level);
    }
    if (operation === 'sub' && level === 'basic' && a.value() < b.value()) [a, b] = [b, a];
    const answer = operation === 'add' ? a.add(b) : operation === 'sub' ? a.sub(b) : operation === 'mul' ? a.mul(b) : a.div(b);
    const mixed = level === 'expert';
    const correct = fmtFraction(answer, mixed);
    const candidates = fractionDistractors(operation, a, b, answer).map(value => fmtFraction(value, mixed));
    const options = uniqueStrings(rng, correct, candidates, i => fmtFraction(new Fraction(answer.n + i, answer.d), mixed));
    return {
      id: `fraction:${operation}:${level}:${a.key()}:${b.key()}`,
      prompt: `${fmtFraction(a, mixed)} ${OP_SYMBOL[operation]} ${fmtFraction(b, mixed)} = ?`,
      options, correct,
      explanation: `Das vollständig gekürzte Ergebnis ist ${correct}.`,
      domain: 'fraction', operation
    };
  }

  function createEngine(config) {
    const rng = createRng(config.seed >>> 0);
    const operations = config.operations?.length ? [...config.operations] : ['add', 'sub', 'mul', 'div'];
    const domains = config.domains?.length ? [...config.domains] : ['natural'];
    const level = config.level || 'standard';
    const seen = new Set();
    const combinations = domains.flatMap(domain => operations.map(operation => ({ domain, operation })));
    let cycle = [];

    function nextPair() {
      if (!cycle.length) cycle = shuffle(rng, combinations);
      return cycle.shift();
    }

    function build(domain, operation) {
      return domain === 'natural' ? naturalQuestion(rng, operation, level)
        : domain === 'integer' ? integerQuestion(rng, operation, level)
        : domain === 'decimal' ? decimalQuestion(rng, operation, level)
        : fractionQuestion(rng, operation, level);
    }

    function next() {
      const pair = nextPair();
      let question = build(pair.domain, pair.operation);
      for (let attempt = 0; attempt < 20 && seen.has(question.id); attempt += 1) question = build(pair.domain, pair.operation);
      seen.add(question.id);
      return question;
    }

    return { next };
  }

  window.FastQuizMath = { createEngine, OP_SYMBOL, DOMAIN_LABEL, LEVEL_LABEL, Fraction };
})();
