const CREW_MEMBERS = Object.freeze({
  coco: Object.freeze({
    id: "coco",
    name: "Coco",
    role: "Begleitung & Orientierung",
    asset: "assets/gradecrew/penguin-guide.svg",
    greeting: "Hi, ich bin Coco. Ich helfe dir, dich in GradeCrew zurechtzufinden und finde mit dir den nächsten sinnvollen Schritt."
  }),
  remy: Object.freeze({
    id: "remy",
    name: "Remy",
    role: "Erstellen & Ideen",
    asset: "assets/gradecrew/elephant-create.svg",
    greeting: "Hi, ich bin Remy. Sag mir einfach, welchen Test du brauchst – ich kann die Angaben für dich vorbereiten."
  }),
  emmi: Object.freeze({
    id: "emmi",
    name: "Emmi",
    role: "Verbessern & Prüfen",
    asset: "assets/gradecrew/fox-improve.svg",
    greeting: "Hi, ich bin Emmi. Ich schaue genau hin und helfe dir, Aufgaben verständlicher, passender und sauberer zu machen."
  }),
  wilma: Object.freeze({
    id: "wilma",
    name: "Wilma",
    role: "Bewerten & Auswerten",
    asset: "assets/gradecrew/owl-grade.svg",
    greeting: "Hi, ich bin Wilma. Ich helfe dir beim Bewerten, Auswerten und Einordnen von Ergebnissen."
  })
});

const SUBJECT_PATTERNS = [
  [/\b(mathematik|mathe)\b/i, "Mathematik"],
  [/\bdeutsch\b/i, "Deutsch"],
  [/\b(englisch|english)\b/i, "Englisch"],
  [/\b(geschichte|gpg)\b/i, "GPG"],
  [/\b(ethik)\b/i, "Ethik"],
  [/\b(informatik|it)\b/i, "Informatik"],
  [/\b(biologie|bio)\b/i, "Biologie"],
  [/\b(physik)\b/i, "Physik"],
  [/\b(chemie)\b/i, "Chemie"],
  [/\b(kunst)\b/i, "Kunst"],
  [/\b(musik)\b/i, "Musik"],
  [/\b(wib|wirtschaft und beruf)\b/i, "WiB"]
];

const SCHOOL_TYPE_PATTERNS = [
  [/\bgrundschule\b/i, "Grundschule"],
  [/\bmittelschule\b/i, "Mittelschule"],
  [/\brealschule\b/i, "Realschule"],
  [/\bgymnasium\b/i, "Gymnasium"],
  [/\bberufsschule\b/i, "Berufsschule"]
];

const TYPE_PATTERNS = [
  [/\b(single[ -]?choice|einfachauswahl)\b/i, "single"],
  [/\b(multiple[ -]?choice|mehrfachauswahl)\b/i, "multi"],
  [/\b(freitext|offene[nr]? frage[n]?)\b/i, "text"],
  [/\b(dropdown|auswahlliste)\b/i, "dropdown"],
  [/\b(richtig\s*\/\s*falsch|richtig oder falsch|true\s*\/\s*false)\b/i, "truefalse"],
  [/\b(lückentext|lueckentext)\b/i, "gapfill"],
  [/\b(zuordnen|zuordnung|matching)\b/i, "matching"],
  [/\b(sortieren|reihenfolge|ordering)\b/i, "ordering"],
  [/\b(gruppieren|kategorien)\b/i, "grouping"],
  [/\b(wörter markieren|woerter markieren|markieren)\b/i, "markwords"],
  [/\b(rechenergebnis|zahl(?:en)?aufgabe[n]?)\b/i, "number"]
];

const COMMON_RESPONSES = Object.freeze({
  greeting: Object.freeze({
    coco: "Hallo! Ich bin Coco. Frag mich einfach, wo du etwas findest oder was als Nächstes sinnvoll ist.",
    remy: "Hallo! Ich bin Remy. Sag mir zum Beispiel: „Englisch, 4. Klasse, Farben, leicht, 10 Aufgaben.“",
    emmi: "Hallo! Ich bin Emmi. Schick mir eine Aufgabe oder sag mir, was daran noch nicht passt.",
    wilma: "Hallo! Ich bin Wilma. Ich helfe dir bei Bewertung, Ergebnissen und der Frage, wo eine Klasse noch Unterstützung braucht."
  }),
  privacy: "Für die Assistenz gilt: Bitte keine personenbezogenen Schülerdaten eingeben. Wiederkehrende Standardfragen kann GradeCrew direkt beantworten, ohne dafür jedes Mal eine KI-Anfrage zu senden.",
  cost: "GradeCrew versucht zuerst, häufige Fragen und klare Befehle direkt zu lösen. Nur wenn dafür wirklich KI-Verständnis nötig ist, wird der KI-Fallback verwendet. So sparen wir API-Aufrufe und halten Antworten schneller.",
  capabilities: Object.freeze({
    coco: "Ich kann dir GradeCrew erklären, dich zu Funktionen führen und den nächsten Schritt finden. Für das Erstellen, Verbessern oder Bewerten kann ich dich direkt an Remy, Emmi oder Wilma weitergeben.",
    remy: "Ich kann Testwünsche verstehen und das KI-Formular vorbereiten: Fach, Klasse, Schulart, Thema, Schwierigkeit, Aufgabenanzahl, Punkte, Aufgabentypen und Zusatzwünsche.",
    emmi: "Ich kann Aufgaben prüfen, Verbesserungen vorschlagen und später gezielte Änderungen an einzelnen Aufgaben auslösen. Im ersten Entwurf beantworte ich bereits allgemeine Fragen; direkte Editor-Aktionen werden schrittweise angeschlossen.",
    wilma: "Ich kann beim Bewerten und Interpretieren von Ergebnissen helfen. Im ersten Entwurf beantworte ich bereits allgemeine Fragen; echte Ergebnis-Aktionen werden anschließend an die bestehende Auswertung angebunden."
  })
});

function normalizeText(value = "") {
  return String(value)
    .normalize("NFKC")
    .replace(/[“”„]/g, '"')
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function firstMatch(text, patterns) {
  for (const [pattern, value] of patterns) if (pattern.test(text)) return value;
  return undefined;
}

function extractNumber(text, patterns, min, max) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const value = Number(String(match[1]).replace(",", "."));
    if (Number.isFinite(value) && value >= min && value <= max) return value;
  }
  return undefined;
}

function cleanTopic(value = "") {
  return normalizeText(value)
    .replace(/^[\s:,-]+|[\s,;.?!]+$/g, "")
    .replace(/\b(?:mit|und)\s+(?:leichten?|mittleren?|anspruchsvollen?|schweren?|gemischten?)\s+aufgaben.*$/i, "")
    .replace(/\b(?:mit|und)\s+\d+(?:[.,]\d+)?\s*(?:punkte?|aufgaben?|minuten?).*$/i, "")
    .trim()
    .slice(0, 220);
}

function extractTopic(text) {
  const candidates = [
    /\bthema\s*[:=-]?\s*([^.!?]+)/i,
    /\b(?:über|ueber)\s+([^.!?]+)/i,
    /\bzu\s+(?!der\s+\d|den\s+\d|einer?\s+\d)([^.!?]+)/i
  ];
  for (const pattern of candidates) {
    const match = text.match(pattern);
    if (match) {
      const topic = cleanTopic(match[1]);
      if (topic) return topic;
    }
  }
  const forMatch = text.match(/\b(?:für|fuer)\s+([^.!?]+)/i);
  if (forMatch && !/^(?:die|den|der)?\s*\d+\.?\s*(?:klasse|jahrgang)/i.test(forMatch[1])) {
    const topic = cleanTopic(forMatch[1]);
    if (topic && !/^(?:mich|uns|meine|einen?\s+test)/i.test(topic)) return topic;
  }
  return undefined;
}

function parseTestRequest(input = "") {
  const text = normalizeText(input);
  const patch = {};
  if (!text) return patch;

  const subject = firstMatch(text, SUBJECT_PATTERNS);
  if (subject) patch.subject = subject;

  const schoolType = firstMatch(text, SCHOOL_TYPE_PATTERNS);
  if (schoolType) patch.schoolType = schoolType;

  if (/\bbayern\b/i.test(text)) patch.region = "Bayern";

  const grade = extractNumber(text, [
    /\b(?:klasse|jahrgang(?:sstufe)?)\s*(\d{1,2})\b/i,
    /\b(\d{1,2})\.?\s*(?:klasse|jahrgang(?:sstufe)?)\b/i,
    /\b(?:für|fuer)\s+(?:die\s+)?(\d{1,2})\.?\b/i
  ], 1, 13);
  if (grade !== undefined) patch.grade = String(grade);

  const topic = extractTopic(text);
  if (topic) patch.topic = topic;

  if (/\b(sehr\s+)?(leicht|einfach|einfache|leichte|leichtes)\b/i.test(text)) patch.difficulty = "leicht";
  else if (/\b(anspruchsvoll|schwer|schwieriger|schwere|anspruchsvolle)\b/i.test(text)) patch.difficulty = "anspruchsvoll";
  else if (/\bgemischt|unterschiedliche\s+schwierigkeitsgrade\b/i.test(text)) patch.difficulty = "gemischt";
  else if (/\bmittel|mittlere[mnr]?\b/i.test(text)) patch.difficulty = "mittel";

  const count = extractNumber(text, [/\b(\d{1,3})\s*(?:aufgaben?|fragen?)\b/i], 1, 100);
  if (count !== undefined) patch.count = count;

  const points = extractNumber(text, [/\b(\d{1,3}(?:[.,]5)?)\s*(?:punkte?|pkt\.?|p\.)\b/i], 0.5, 500);
  if (points !== undefined) patch.points = points;

  const duration = extractNumber(text, [/\b(\d{1,3})\s*(?:minuten?|min\.?)(?:\s|$)/i], 1, 300);
  if (duration !== undefined) patch.durationMinutes = duration;

  const allowedTypes = [];
  for (const [pattern, value] of TYPE_PATTERNS) if (pattern.test(text) && !allowedTypes.includes(value)) allowedTypes.push(value);
  if (allowedTypes.length) patch.allowedTypes = allowedTypes;

  const noText = /\b(?:keine?|ohne)\s+(?:freitext|offene[nr]?\s+fragen?)\b/i.test(text);
  if (noText) patch.excludeTypes = ["text"];

  return patch;
}

function looksLikeTestCommand(text) {
  return /\b(test|probe|prüfung|pruefung|lernzielkontrolle|aufgaben?)\b/i.test(text) ||
    /\b(?:klasse|jahrgang|punkte?|multiple[ -]?choice|freitext|zuordnung|lückentext)\b/i.test(text);
}

function patchSummary(patch = {}) {
  const parts = [];
  if (patch.subject) parts.push(patch.subject);
  if (patch.grade) parts.push(`Klasse ${patch.grade}`);
  if (patch.topic) parts.push(patch.topic);
  if (patch.difficulty) parts.push(patch.difficulty);
  if (patch.count) parts.push(`${patch.count} Aufgaben`);
  if (patch.points) parts.push(`${patch.points} Punkte`);
  if (patch.durationMinutes) parts.push(`${patch.durationMinutes} Min.`);
  return parts.join(" · ");
}

function resolveCommonResponse(crewId, text) {
  if (/^(hi|hallo|hey|servus|moin|guten (morgen|tag|abend))[!. ]*$/i.test(text)) {
    return { intent: "greeting", reply: COMMON_RESPONSES.greeting[crewId] || COMMON_RESPONSES.greeting.coco };
  }
  if (/\b(was kannst du|wobei hilfst du|was machst du|deine aufgabe)\b/i.test(text)) {
    return { intent: "capabilities", reply: COMMON_RESPONSES.capabilities[crewId] || COMMON_RESPONSES.capabilities.coco };
  }
  if (/\b(datenschutz|personenbezogen|schülerdaten|schuelerdaten|privat)\b/i.test(text)) {
    return { intent: "privacy", reply: COMMON_RESPONSES.privacy };
  }
  if (/\b(kosten|api|token|punkte sparen|günstig|guenstig)\b/i.test(text)) {
    return { intent: "cost", reply: COMMON_RESPONSES.cost };
  }
  return null;
}

function resolveLocalCrewRequest({ crewId = "coco", text = "", context = {} } = {}) {
  const member = CREW_MEMBERS[crewId] || CREW_MEMBERS.coco;
  const normalized = normalizeText(text);
  if (!normalized) return { handled: true, source: "local", intent: "empty", reply: "Sag mir einfach, wobei ich dir helfen soll." };

  const common = resolveCommonResponse(member.id, normalized);
  if (common) return { handled: true, source: "local", ...common };

  const patch = parseTestRequest(normalized);
  if ((member.id === "remy" || looksLikeTestCommand(normalized)) && Object.keys(patch).length) {
    const summary = patchSummary(patch);
    return {
      handled: true,
      source: "local",
      intent: "patch_ai_form",
      reply: summary ? `Klar. Ich habe verstanden: ${summary}. Ich trage das ins Testformular ein – du kannst danach alles noch ändern.` : "Klar. Ich übernehme die erkannten Angaben ins Testformular.",
      action: { type: "patch_ai_form", patch },
      contextUsed: Boolean(context && Object.keys(context).length)
    };
  }

  if (/\b(wer bist du|wie heißt du|wie heisst du)\b/i.test(normalized)) {
    return { handled: true, source: "local", intent: "identity", reply: `${member.greeting} Meine Rolle hier ist: ${member.role}.` };
  }

  return {
    handled: false,
    source: "none",
    intent: "unknown",
    needsAi: true,
    reply: ""
  };
}

export {
  CREW_MEMBERS,
  COMMON_RESPONSES,
  normalizeText,
  parseTestRequest,
  patchSummary,
  resolveLocalCrewRequest
};
