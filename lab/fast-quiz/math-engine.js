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
      this.n = n / g;
      this.d = d / g;
    }
    add(other) { return new Fraction(this.n * other.d + other.n * this.d, this.d * other.d); }
    sub(other) { return new Fraction(this.n * other.d - other.n * this.d, this.d * other.d); }
    mul(other) { return new Fraction(this.n * other.n, this.d * other.d); }
    div(other) { if (!other.n) throw new Error('Division by zero'); return new Fraction(this.n * other.d, this.d * other.n); }
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
    const result = [...list];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function decimalPlaces(level) {
    return level === 'basic' ? 1 : level === 'standard' ? pick(Math.random, [1, 2]) : 2;
  }

  function round(value, places = 2) {
    const factor = 10 ** places;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function fmtDecimal(value) {
    return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 4, useGrouping: false }).format(value);
  }

  function fmtFraction(frac, mixed = false) {
    if (frac.d === 1) return String(frac.n);
    const sign = frac.n < 0 ? '−' : '';
    const n = Math.abs(frac.n);
    if (mixed && n > frac.d) {
      const whole = Math.floor(n / frac.d);
      const rest = n % frac.d;
      return rest ? `${sign}${whole} ${rest}/${frac.d}` : `${sign}${whole}`;
    }
    return `${sign}${n}/${frac.d}`;
  }

  function levelBounds(level, domain) {
    const table = {
      natural: {
        basic: { addMax: 50, mulMax: 10 }, standard: { addMax: 200, mulMax: 12 },
        advanced: { addMax: 1000, mulMax: 25 }, expert: { addMax: 5000, mulMax: 99 }
      },
      integer: {
        basic: { max: 20 }, standard: { max: 50 }, advanced: { max: 100 }, expert: { max: 250 }
      }
    };
    return table[domain]?.[level] || {};
  }

  function naturalQuestion(rng, operation, level) {
    const { addMax, mulMax } = levelBounds(level, 'natural');
    let a, b, answer;
    if (operation === 'add') {
      a = int(rng, level === 'basic' ? 1 : 10, addMax); b = int(rng, 1, addMax); answer = a + b;
    } else if (operation === 'sub') {
      a = int(rng, 2, addMax * (level === 'expert' ? 2 : 1)); b = int(rng, 1, a); answer = a - b;
    } else if (operation === 'mul') {
      a = int(rng, 2, mulMax); b = int(rng, 2, level === 'expert' ? 30 : mulMax); answer = a * b;
    } else {
      b = int(rng, 2, mulMax); answer = int(rng, 2, level === 'basic' ? 10 : level === 'standard' ? 15 : 25); a = b * answer;
    }
    return numericQuestion(rng, a, b, operation, answer, 0, 'natural');
  }

  function integerQuestion(rng, operation, level) {
    const max = levelBounds(level, 'integer').max;
    let a, b, answer;
    if (operation === 'div') {
      b = signedNonZero(rng, Math.max(4, Math.floor(max / 4)));
      answer = signedNonZero(rng, Math.max(5, Math.floor(max / 3)));
      a = b * answer;
    } else {
      a = signed(rng, max); b = signed(rng, max);
      answer = operation === 'add' ? a + b : operation === 'sub' ? a - b : a * b;
      if (operation === 'mul' && level !== 'expert') {
        a = signed(rng, Math.min(15, max)); b = signed(rng, Math.min(15, max)); answer = a * b;
      }
    }
    return numericQuestion(rng, a, b, operation, answer, 0, 'integer');
  }

  function signed(rng, max) { return int(rng, -max, max); }
  function signedNonZero(rng, max) { let v = 0; while (!v) v = signed(rng, max); return v; }

  function decimalQuestion(rng, operation, level) {
    const places = level === 'basic' ? 1 : level === 'standard' ? pick(rng, [1, 2]) : 2;
    const scale = 10 ** places;
    const maxWhole = level === 'basic' ? 20 : level === 'standard' ? 50 : level === 'advanced' ? 100 : 250;
    let a, b, answer;
    if (operation === 'div') {
      b = int(rng, 2, level === 'basic' ? 10 : 20) / (level === 'expert' ? 10 : 1);
      const target = int(rng, 2, level === 'basic' ? 20 : 50) / (level === 'advanced' || level === 'expert' ? 10 : 1);
      a = round(b * target, places + 1); answer = round(target, 3);
    } else {
      a = int(rng, 1, maxWhole * scale) / scale;
      b = int(rng, 1, maxWhole * scale) / scale;
      answer = operation === 'add' ? a + b : operation === 'sub' ? a - b : a * b;
      if (operation === 'sub' && level === 'basic' && answer < 0) [a, b, answer] = [b, a, -answer];
      answer = round(answer, operation === 'mul' ? Math.min(4, places * 2) : places + 1);
    }
    return numericQuestion(rng, a, b, operation, answer, Math.max(places, 1), 'decimal');
  }

  function randomFraction(rng, level) {
    const maxD = level === 'basic' ? 8 : level === 'standard' ? 12 : level === 'advanced' ? 16 : 24;
    const d = int(rng, 2, maxD);
    const maxN = level === 'basic' ? d - 1 : level === 'standard' ? d + 2 : level === 'advanced' ? d * 2 : d * 3;
    return new Fraction(int(rng, 1, Math.max(1, maxN)), d);
  }

  function fractionQuestion(rng, operation, level) {
    let a = randomFraction(rng, level);
    let b;
    if (level === 'basic' && (operation === 'add' || operation === 'sub')) {
      b = new Fraction(int(rng, 1, Math.max(1, a.d - 1)), a.d);
    } else {
      b = randomFraction(rng, level);
    }
    if (operation === 'sub' && level === 'basic' && a.value() < b.value()) [a, b] = [b, a];
    if (operation === 'div' && b.n === 0) b = new Fraction(1, b.d);
    const answer = operation === 'add' ? a.add(b) : operation === 'sub' ? a.sub(b) : operation === 'mul' ? a.mul(b) : a.div(b);
    const mixed = level === 'expert';
    const correct = fmtFraction(answer, mixed);
    const distractorFractions = [
      new Fraction(answer.n + answer.d, answer.d),
      new Fraction(answer.n + 1, answer.d),
      new Fraction(answer.n - 1 || answer.n + 2, answer.d),
      new Fraction(answer.n, Math.max(1, answer.d + 1))
    ];
    const options = uniqueOptions(rng, correct, distractorFractions.map(f => fmtFraction(f, mixed)));
    return {
      id: `fraction:${operation}:${level}:${a.key()}:${b.key()}`,
      prompt: `${fmtFraction(a, mixed)} ${OP_SYMBOL[operation]} ${fmtFraction(b, mixed)} = ?`,
      options,
      correct,
      explanation: `Das vollständig gekürzte Ergebnis ist ${correct}.`,
      domain: 'fraction', operation, level
    };
  }

  function numericQuestion(rng, a, b, operation, answer, places, domain) {
    const display = value => domain === 'decimal' ? fmtDecimal(value) : String(value).replace('-', '−');
    const correct = display(answer);
    const magnitude = Math.max(1, Math.abs(answer));
    const step = domain === 'decimal' ? (places >= 2 ? 0.1 : 1) : Math.max(1, Math.round(Math.sqrt(magnitude) / 2));
    const candidates = [answer + step, answer - step, answer + step * 2, answer - step * 2, -answer];
    const options = uniqueOptions(rng, correct, candidates.map(v => display(round(v, 4))));
    return {
      id: `${domain}:${operation}:${a}:${b}`,
      prompt: `${display(a)} ${OP_SYMBOL[operation]} ${display(b)} = ?`,
      options,
      correct,
      explanation: `${display(a)} ${OP_SYMBOL[operation]} ${display(b)} = ${correct}.`,
      domain, operation
    };
  }

  function uniqueOptions(rng, correct, candidates) {
    const values = [correct];
    for (const item of candidates) {
      if (item === correct || values.includes(item) || item === 'NaN' || item === '∞') continue;
      values.push(item);
      if (values.length === 4) break;
    }
    let bump = 1;
    while (values.length < 4) {
      const item = `${correct} ${bump > 0 ? '+' : ''}${bump}`;
      if (!values.includes(item)) values.push(item);
      bump += 1;
    }
    return shuffle(rng, values);
  }

  function createEngine(config) {
    const rng = createRng(config.seed >>> 0);
    const operations = config.operations?.length ? config.operations : ['add', 'sub', 'mul', 'div'];
    const domains = config.domains?.length ? config.domains : ['natural'];
    const level = config.level || 'standard';
    const seen = new Set();

    function next() {
      let question;
      for (let attempt = 0; attempt < 20; attempt += 1) {
        const operation = pick(rng, operations);
        const domain = pick(rng, domains);
        question = domain === 'natural' ? naturalQuestion(rng, operation, level)
          : domain === 'integer' ? integerQuestion(rng, operation, level)
          : domain === 'decimal' ? decimalQuestion(rng, operation, level)
          : fractionQuestion(rng, operation, level);
        if (!seen.has(question.id)) break;
      }
      seen.add(question.id);
      return question;
    }

    return { next };
  }

  window.FastQuizMath = { createEngine, OP_SYMBOL, DOMAIN_LABEL, LEVEL_LABEL, Fraction };
})();
