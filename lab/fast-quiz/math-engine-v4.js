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
    add(o) { return new Fraction(this.n * o.d + o.n * this.d, this.d * o.d); }
    sub(o) { return new Fraction(this.n * o.d - o.n * this.d, this.d * o.d); }
    mul(o) { return new Fraction(this.n * o.n, this.d * o.d); }
    div(o) { if (!o.n) throw new Error('Division by zero'); return new Fraction(this.n * o.d, this.d * o.n); }
    value() { return this.n / this.d; }
    key() { return `${this.n}/${this.d}`; }
  }

  const OP_SYMBOL = { add: '+', sub: '−', mul: '×', div: '÷' };
  const OP_LABEL = { add: 'Addition', sub: 'Subtraktion', mul: 'Multiplikation', div: 'Division' };
  const DOMAIN_LABEL = { natural: 'Natürliche Zahlen', integer: 'Ganze Zahlen', decimal: 'Dezimalzahlen', fraction: 'Brüche' };
  const LEVEL_LABEL = {
    n1: 'Niveau 1 · Grundlagen',
    n2: 'Niveau 2 · Standard',
    n3: 'Niveau 3 · Erweitert',
    n4: 'Niveau 4 · Komplex'
  };

  const LEVEL_RULES = {
    natural: {
      n1: '+/− bis 100 · ×/÷ mit Faktoren 2–10 · Divisionen gehen ohne Rest auf.',
      n2: '+/− bis 1.000 · × bis etwa 12 × 20 · größere, weiterhin glatte Divisionen.',
      n3: '+/− bis 10.000 · × bis etwa 25 × 50 · größere Divisoren und Quotienten.',
      n4: '+/− bis 100.000 · × bis 99 × 99 · große, exakt aufgehende Divisionen.'
    },
    integer: {
      n1: 'Zahlen von −20 bis 20 · einfache Vorzeichen bei allen vier Grundrechenarten.',
      n2: 'Zahlen von −100 bis 100 · mehr Vorzeichenwechsel und größere Produkte.',
      n3: 'Zahlen bis etwa ±500 · Produkte mit Faktoren bis 20 · größere glatte Divisionen.',
      n4: 'Zahlen bis etwa ±2.000 · Produkte mit Faktoren bis 50 · anspruchsvolle Vorzeichenkombinationen.'
    },
    decimal: {
      n1: 'Eine Nachkommastelle · Werte bis 20 · Division überwiegend durch ganze Zahlen.',
      n2: 'Eine bis zwei Nachkommastellen · Werte bis 100 · mehr Stellenwechsel.',
      n3: 'Bis zu drei Nachkommastellen · Werte bis 500 · Division auch durch Dezimalzahlen.',
      n4: 'Zwei bis drei Nachkommastellen · Werte bis 1.000 · komplexere Produkte und Dezimaldivisionen.'
    },
    fraction: {
      n1: 'Echte, einfache Brüche · bei +/− gleicher Nenner · kleine Nenner bis 10.',
      n2: 'Unterschiedliche Nenner bis 12 · alle vier Grundrechenarten · Ergebnisse werden gekürzt.',
      n3: 'Nenner bis 16 · auch unechte Brüche · anspruchsvolleres Erweitern, Kürzen und Teilen.',
      n4: 'Nenner bis 24 · unechte und gemischte Brüche · komplexe Kombinationen aller vier Rechenarten.'
    }
  };

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
    return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 5, useGrouping: false }).format(value);
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
      if (!candidate || candidate === correct || values.includes(candidate)) continue;
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
    const step = domain === 'decimal' ? (precision >= 2 ? 0.1 : magnitude < 10 ? 0.5 : 1) : Math.max(1, Math.round(Math.sqrt(magnitude) / 2));
    const raw = [answer + step, answer - step, answer + 2 * step, answer - 2 * step, -answer, answer * 10, answer / 10]
      .map(value => domain === 'decimal' ? round(value, 5) : Math.round(value));
    return uniqueStrings(rng, correct, raw.map(display), i => display(domain === 'decimal' ? round(answer + i * step, 5) : answer + i * step));
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
      domain,
      operation
    };
  }

  const NATURAL = {
    n1: { addMax: 100, mulA: 10, mulB: 10, divResult: 10 },
    n2: { addMax: 1000, mulA: 12, mulB: 20, divResult: 25 },
    n3: { addMax: 10000, mulA: 25, mulB: 50, divResult: 50 },
    n4: { addMax: 100000, mulA: 99, mulB: 99, divResult: 100 }
  };

  function naturalQuestion(rng, operation, level) {
    const p = NATURAL[level];
    let a, b, answer;
    if (operation === 'add') {
      a = int(rng, 1, p.addMax); b = int(rng, 1, p.addMax); answer = a + b;
    } else if (operation === 'sub') {
      a = int(rng, 2, p.addMax); b = int(rng, 1, a); answer = a - b;
    } else if (operation === 'mul') {
      a = int(rng, 2, p.mulA); b = int(rng, 2, p.mulB); answer = a * b;
    } else {
      b = int(rng, 2, p.mulA); answer = int(rng, 2, p.divResult); a = b * answer;
    }
    return makeNumericQuestion(rng, a, b, operation, answer, 'natural');
  }

  const INTEGER = {
    n1: { range: 20, factor: 10, quotient: 12 },
    n2: { range: 100, factor: 12, quotient: 25 },
    n3: { range: 500, factor: 20, quotient: 50 },
    n4: { range: 2000, factor: 50, quotient: 100 }
  };
  function signed(rng, max) { return int(rng, -max, max); }
  function signedNonZero(rng, max) { let n = 0; while (!n) n = signed(rng, max); return n; }

  function integerQuestion(rng, operation, level) {
    const p = INTEGER[level];
    let a, b, answer;
    if (operation === 'div') {
      b = signedNonZero(rng, p.factor);
      answer = signedNonZero(rng, p.quotient);
      a = b * answer;
    } else if (operation === 'mul') {
      a = signedNonZero(rng, p.factor); b = signedNonZero(rng, p.factor); answer = a * b;
    } else {
      a = signed(rng, p.range); b = signed(rng, p.range); answer = operation === 'add' ? a + b : a - b;
    }
    return makeNumericQuestion(rng, a, b, operation, answer, 'integer');
  }

  const DECIMAL = {
    n1: { places: [1], maxWhole: 20, divisorPlaces: 0, targetPlaces: 1 },
    n2: { places: [1, 2], maxWhole: 100, divisorPlaces: 0, targetPlaces: 2 },
    n3: { places: [1, 2, 3], maxWhole: 500, divisorPlaces: 1, targetPlaces: 2 },
    n4: { places: [2, 3], maxWhole: 1000, divisorPlaces: 2, targetPlaces: 2 }
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
      b = int(rng, 2, 20 * divisorScale) / divisorScale;
      answer = randomDecimal(rng, level === 'n4' ? 50 : 25, p.targetPlaces);
      a = round(b * answer, Math.min(5, p.divisorPlaces + p.targetPlaces));
    } else {
      a = randomDecimal(rng, p.maxWhole, places);
      b = randomDecimal(rng, p.maxWhole, places);
      if (operation === 'add') answer = a + b;
      else if (operation === 'sub') {
        if (level === 'n1' && a < b) [a, b] = [b, a];
        answer = a - b;
      } else answer = a * b;
      answer = round(answer, Math.min(5, operation === 'mul' ? places * 2 : places));
    }
    return makeNumericQuestion(rng, a, b, operation, answer, 'decimal', places);
  }

  const FRACTION_DENOMS = {
    n1: [2, 3, 4, 5, 6, 8, 10],
    n2: [2, 3, 4, 5, 6, 8, 9, 10, 12],
    n3: [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 16],
    n4: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 20, 24]
  };

  function randomFraction(rng, level, denominator = null, simpleOnly = false) {
    const d = denominator || pick(rng, FRACTION_DENOMS[level]);
    const factor = level === 'n1' || simpleOnly ? 1 : level === 'n2' ? 1.25 : level === 'n3' ? 2 : 3;
    const maxN = Math.max(1, Math.floor(d * factor));
    return new Fraction(int(rng, 1, maxN), d);
  }

  function fractionDistractors(operation, a, b, answer) {
    const values = [];
    if (operation === 'add') {
      values.push(new Fraction(a.n + b.n, a.d + b.d));
      values.push(new Fraction(a.n + b.n, a.d));
    } else if (operation === 'sub') {
      if (a.n !== b.n) values.push(new Fraction(a.n - b.n, Math.max(1, a.d + b.d)));
      values.push(new Fraction(Math.abs(a.n - b.n) || 1, Math.max(2, a.d + 1)));
    } else if (operation === 'mul') {
      values.push(new Fraction(a.n * b.n, Math.max(1, a.d + b.d)));
      values.push(new Fraction(a.n + b.n, a.d * b.d));
    } else {
      values.push(a.mul(b));
      values.push(new Fraction(a.n * b.n, a.d * b.d));
    }
    values.push(new Fraction(answer.n + 1, answer.d));
    values.push(new Fraction(answer.n - 1 || answer.n + 2, answer.d));
    values.push(new Fraction(answer.n, answer.d + 1));
    return values;
  }

  function fractionQuestion(rng, operation, level) {
    let a, b;
    if (level === 'n1' && (operation === 'add' || operation === 'sub')) {
      const d = pick(rng, FRACTION_DENOMS.n1);
      a = randomFraction(rng, level, d, true);
      b = randomFraction(rng, level, d, true);
    } else if (level === 'n1') {
      const simple = [2, 3, 4, 5, 6];
      a = randomFraction(rng, level, pick(rng, simple), true);
      b = randomFraction(rng, level, pick(rng, simple), true);
    } else {
      a = randomFraction(rng, level);
      b = randomFraction(rng, level);
    }
    if (operation === 'sub' && level === 'n1' && a.value() < b.value()) [a, b] = [b, a];
    const answer = operation === 'add' ? a.add(b) : operation === 'sub' ? a.sub(b) : operation === 'mul' ? a.mul(b) : a.div(b);
    const mixed = level === 'n4';
    const correct = fmtFraction(answer, mixed);
    const candidates = fractionDistractors(operation, a, b, answer).map(value => fmtFraction(value, mixed));
    return {
      id: `fraction:${operation}:${level}:${a.key()}:${b.key()}`,
      prompt: `${fmtFraction(a, mixed)} ${OP_SYMBOL[operation]} ${fmtFraction(b, mixed)} = ?`,
      options: uniqueStrings(rng, correct, candidates, i => fmtFraction(new Fraction(answer.n + i, answer.d), mixed)),
      correct,
      explanation: `Das vollständig gekürzte Ergebnis ist ${correct}.`,
      domain: 'fraction',
      operation
    };
  }

  function createEngine(config) {
    const rng = createRng(config.seed >>> 0);
    const operations = config.operations?.length ? [...config.operations] : ['add', 'sub', 'mul', 'div'];
    const domains = config.domains?.length ? [...config.domains] : ['natural'];
    const level = LEVEL_LABEL[config.level] ? config.level : 'n2';
    const combinations = domains.flatMap(domain => operations.map(operation => ({ domain, operation })));
    const seen = new Set();
    let cycle = [];

    function nextPair() {
      if (!cycle.length) cycle = shuffle(rng, combinations);
      return cycle.shift();
    }
    function build(pair) {
      if (pair.domain === 'natural') return naturalQuestion(rng, pair.operation, level);
      if (pair.domain === 'integer') return integerQuestion(rng, pair.operation, level);
      if (pair.domain === 'decimal') return decimalQuestion(rng, pair.operation, level);
      return fractionQuestion(rng, pair.operation, level);
    }
    function next() {
      const pair = nextPair();
      let question = build(pair);
      for (let attempt = 0; attempt < 24 && seen.has(question.id); attempt += 1) question = build(pair);
      seen.add(question.id);
      return question;
    }
    return { next };
  }

  window.FastQuizMath = { createEngine, OP_SYMBOL, OP_LABEL, DOMAIN_LABEL, LEVEL_LABEL, LEVEL_RULES, Fraction };
})();
