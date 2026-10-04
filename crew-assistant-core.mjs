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
  [/\b(mathematik|mathe|mathematics|maths|math)(?:test|probe|prüfung|pruefung| test)?\b/i, "Mathematik"],
  [/\b(deutsch|german)(?:test|probe|prüfung|pruefung| test)?\b/i, "Deutsch"],
  [/\b(englisch|english)(?:test|probe|prüfung|pruefung| test)?\b/i, "Englisch"],
  [/\b(geschichte|gpg|history)(?:test|probe|prüfung|pruefung| test)?\b/i, "GPG"],
  [/\b(ethik|ethics)(?:test|probe|prüfung|pruefung| test)?\b/i, "Ethik"],
  [/\b(informatik|it|computer science|computing)(?:test|probe|prüfung|pruefung| test)?\b/i, "Informatik"],
  [/\b(biologie|bio|biology)(?:test|probe|prüfung|pruefung| test)?\b/i, "Biologie"],
  [/\b(physik|physics)(?:test|probe|prüfung|pruefung| test)?\b/i, "Physik"],
  [/\b(chemie|chemistry)(?:test|probe|prüfung|pruefung| test)?\b/i, "Chemie"],
  [/\b(kunst|art)(?:test|probe|prüfung|pruefung| test)?\b/i, "Kunst"],
  [/\b(musik|music)(?:test|probe|prüfung|pruefung| test)?\b/i, "Musik"],
  [/\b(wib|wirtschaft und beruf|economics and careers)(?:test|probe|prüfung|pruefung| test)?\b/i, "WiB"]
];

const SCHOOL_TYPE_PATTERNS = [
  [/\b(grundschule|primary school|elementary school)\b/i, "Grundschule"],
  [/\b(mittelschule|middle school)\b/i, "Mittelschule"],
  [/\b(realschule)\b/i, "Realschule"],
  [/\b(gymnasium|grammar school)\b/i, "Gymnasium"],
  [/\b(berufsschule|vocational school)\b/i, "Berufsschule"]
];

const TYPE_PATTERNS = [
  [/\b(single[ -]?choice|einfachauswahl)\b/i, "single"],
  [/\b(multiple[ -]?choice|mehrfachauswahl)\b/i, "multi"],
  [/\b(freitext(?:aufgaben?|fragen?)?|offene[nr]? frage[n]?|free[ -]?text|open questions?)\b/i, "text"],
  [/\b(dropdown|auswahlliste)\b/i, "dropdown"],
  [/\b(richtig\s*\/\s*falsch|richtig oder falsch|true\s*\/\s*false|true or false)\b/i, "truefalse"],
  [/\b(lückentext|lueckentext|gap[ -]?fill)\b/i, "gapfill"],
  [/\b(zuordnen|zuordnung|matching)\b/i, "matching"],
  [/\b(sortieren|reihenfolge|ordering|put in order)\b/i, "ordering"],
  [/\b(gruppieren|kategorien|grouping|categories)\b/i, "grouping"],
  [/\b(wörter markieren|woerter markieren|markieren|mark words)\b/i, "markwords"],
  [/\b(rechenergebnis|zahl(?:en)?aufgabe[n]?|numeric answer|calculation result)\b/i, "number"]
];

const COMMON_RESPONSES = Object.freeze({
  "de-DE": Object.freeze({
    greeting: Object.freeze({
      coco: "Hallo! Ich bin Coco. Frag mich einfach, wo du etwas findest oder was als Nächstes sinnvoll ist.",
      remy: "Hallo! Ich bin Remy. Sag mir zum Beispiel: „Englisch, 4. Klasse, Farben, leicht, 10 Aufgaben.“",
      emmi: "Hallo! Ich bin Emmi. Schick mir eine Aufgabe oder sag mir, was daran noch nicht passt.",
      wilma: "Hallo! Ich bin Wilma. Ich helfe dir bei Bewertung, Ergebnissen und der Frage, wo eine Klasse noch Unterstützung braucht."
    }),
    privacy: "Für die Assistenz gilt: Bitte keine personenbezogenen Schülerdaten eingeben. Wiederkehrende Standardfragen kann GradeCrew direkt beantworten, ohne dafür jedes Mal eine KI-Anfrage zu senden.",
    cost: "GradeCrew versucht zuerst, häufige Fragen und klare Befehle direkt zu lösen. Nur wenn dafür wirklich KI-Verständnis nötig ist, wird der KI-Fallback verwendet. So sparen wir API-Aufrufe und halten Antworten schneller.",
    capabilities: Object.freeze({
      coco: "Ich helfe dir bei der Orientierung in GradeCrew. Tests erstellst du direkt mit Remy auf der Seite „Test mit KI erstellen“, Emmi arbeitet im Editor und Wilma später bei der Auswertung.",
      remy: "Ich kann Testwünsche verstehen und das KI-Formular vorbereiten: Fach, Klasse, Schulart, Thema, Schwierigkeit, Aufgabenanzahl, Punkte, Höraufgaben, Aufgabentypen und Zusatzwünsche.",
      emmi: "Ich kann Aufgaben prüfen und einen Test im Editor gezielt überarbeiten.",
      wilma: "Ich kann beim Bewerten und Interpretieren von Ergebnissen helfen."
    })
  }),
  "en-GB": Object.freeze({
    greeting: Object.freeze({
      coco: "Hi! I'm Coco. Ask me where to find something or what the next useful step is.",
      remy: "Hi! I'm Remy. For example, say: ‘English, Year 4, colours, easy, 10 questions.’",
      emmi: "Hi! I'm Emmi. Send me a question or tell me what still needs improving.",
      wilma: "Hi! I'm Wilma. I help with grading, results and identifying where a class may need more support."
    }),
    privacy: "Please don't enter personal student data into the assistant. GradeCrew can answer recurring standard questions locally without sending an AI request every time.",
    cost: "GradeCrew first tries to handle common questions and clear commands locally. The AI fallback is used only when genuine language understanding is needed. This saves API calls and keeps responses faster.",
    capabilities: Object.freeze({
      coco: "I help you find your way around GradeCrew. Create tests with Remy under ‘Create with AI’; Emmi works in the editor and Wilma helps with results.",
      remy: "I can understand test requests and prepare the AI form: subject, year/class, school type, topic, difficulty, question count, points, listening questions, question types and additional requests.",
      emmi: "I can review questions and help improve a test in the editor.",
      wilma: "I can help with grading and interpreting results."
    })
  })
});

const ENGLISH_SUBJECT_LABELS = Object.freeze({
  Mathematik: "Mathematics", Deutsch: "German", Englisch: "English",
  GPG: "History / Social Studies", Ethik: "Ethics", Informatik: "Computer Science",
  Biologie: "Biology", Physik: "Physics", Chemie: "Chemistry",
  Kunst: "Art", Musik: "Music", WiB: "Economics & Careers"
});
const ENGLISH_DIFFICULTY_LABELS = Object.freeze({
  leicht: "easy", mittel: "medium", anspruchsvoll: "challenging", gemischt: "mixed"
});
function normalizeLocale(value = "de-DE") {
  return /^en(?:-|$)/i.test(String(value || "")) ? "en-GB" : "de-DE";
}

const PARSER_VERSION = "remy-structure-v4-audio";
const INITIAL_EASY = /\b(?:(?:die\s+)?(?:erste[nr]?\s+aufgaben?|am\s+anfang|anfangs)|(?:the\s+)?(?:first\s+(?:questions?|tasks?)|at\s+the\s+beginning|initially))\b[^.!?]{0,50}?\b(?:leicht|einfach|easy|simple)\b/i;
const NEGATED_DIFFICULTY = /\b(?:nicht|keinesfalls|keine?|not|no)\s+(?:(?:zu|so|too)\s+)?(?:leicht(?:e[nrsm]?)?|einfach(?:e[nrsm]?)?|schwer(?:e[nrsm]?)?|anspruchsvoll(?:e[nrsm]?)?|mittel|gemischt|easy|simple|hard|difficult|challenging|medium|mixed)\b/gi;

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
    .replace(/,\s*(?=(?:sehr\s+)?(?:leicht|einfach|mittel|anspruchsvoll|schwer|gemischt|easy|simple|medium|challenging|hard|difficult|mixed)|\d+\s*(?:aufgaben?|fragen?|questions?|tasks?|punkte?|points?|minuten?|minutes?)|(?:mit|ohne|with|without)\b).*$/i, "")
    .replace(/\s+(?:mit|ohne|with|without)\s+(?=(?:single|multiple|freitext|offene|free|open|dropdown|richtig|true|lücken|luecken|gap|zuord|matching|sortier|ordering|reihenfolge|gruppier|grouping|kategorien|categories|wörter|woerter|markier|mark words|rechen|numeric|zahl|(?:sehr\s+)?(?:leicht|einfach|mittel|anspruchsvoll|schwer|gemischt|easy|simple|medium|challenging|hard|difficult|mixed)|\d+\s*(?:aufgaben?|fragen?|questions?|tasks?|punkte?|points?|minuten?|minutes?))).*$/i, "")
    .replace(/\s+(?=(?:(?:vor allem|überwiegend|hauptsächlich|hauptsaechlich|bitte|möglichst|moeglichst|mainly|mostly|please)s+)?(?:sehr\s+)?(?:leichte[nr]?|einfache[nr]?|mittlere[nr]?|anspruchsvolle[nr]?|schwere[nr]?|gemischte[nr]?|easy|simple|medium|challenging|hard|mixed)\s+(?:aufgaben?|fragen?|questions?|tasks?)\b).*$/i, "")
    .replace(/\s+(?=(?:viele[nr]?|wenige[nr]?|many|several|few)\s+(?:alltagsbeispiele?|beispiele?|texte?|rechenaufgaben?|sachaufgaben?|aufgaben?|fragen?|real[- ]life examples?|examples?|texts?|questions?|tasks?)\b).*$/i, "")
    .replace(/[,;\s]+(?:(?:keine?|ohne)\s+(?:freitext(?:aufgaben?|fragen?)?|offene[nr]?\s+fragen?)|(?:no|without)\s+(?:free[ -]?text|open questions?))\b.*$/i, "")
    .replace(/\s+(?=(?:wenig|kurze[nr]?|klare[nr]?|little|short|clear)\s+(?:text|texte|aufgaben?|fragen?|questions?|tasks?)\b).*$/i, "")
    .replace(/\s+(?=(?:(?:keine?|ohne)\s+(?:fangfragen?|trickfragen?)|(?:no|without)\s+trick questions?)\b).*$/i, "")
    .replace(/\s+(?=(?:(?:davon\s+)?\d+\s*(?:hör|hoer)(?:aufgaben?|fragen?)|\d+\s*(?:listening|audio)\s+(?:questions?|tasks?))\b).*$/i, "")
    .replace(/\b(?:mit|und|with|and)\s+\d+(?:[.,]\d+)?\s*(?:punkte?|points?|aufgaben?|questions?|tasks?|minuten?|minutes?).*$/i, "")
    .replace(/\s+(?:sehr\s+)?(?:leicht|einfach|mittel|anspruchsvoll|schwer|gemischt|easy|simple|medium|challenging|hard|difficult|mixed)\s*$/i, "")
    .replace(/[\s,;]+$/g, "")
    .slice(0, 220);
}

function extractTopic(text) {
  const candidates = [
    /\b(?:thema|topic)\s*[:=-]?\s*([^.!?]+)/i,
    /\b(?:über|ueber|about|on)\s+([^.!?]+)/i,
    /\b(?:klasse|jahrgang(?:sstufe)?|year|grade)\s*\d{1,2}\b[^.!?]*?\b(?:für|fuer|about|on)\s+([^.!?]+)/i,
    /\b\d{1,2}\.?\s*(?:klasse|jahrgang(?:sstufe)?|year|grade)\b[^.!?]*?\b(?:für|fuer|about|on)\s+([^.!?]+)/i,
    /\b(?:klasse|jahrgang(?:sstufe)?|year|grade)\s*\d{1,2}\b\s+([^,;.!?]+?)(?=\s*[,;]|\s+\d{1,3}\s*(?:aufgaben?|fragen?|questions?|tasks?|punkte?|points?)\b|$)/i,
    /\b\d{1,2}\.?\s*(?:klasse|jahrgang(?:sstufe)?|year|grade)\b\s+([^,;.!?]+?)(?=\s*[,;]|\s+\d{1,3}\s*(?:aufgaben?|fragen?|questions?|tasks?|punkte?|points?)\b|$)/i,
    /\bzu\s+(?!der\s+\d|den\s+\d|einer?\s+\d)([^.!?]+)/i
  ];
  for (const pattern of candidates) {
    const match = text.match(pattern);
    if (match) {
      const topic = cleanTopic(match[1]);
      if (topic) return topic;
    }
  }
  const forMatches = [...text.matchAll(/\b(?:für|fuer|for)\s+([^.!?]+)/gi)];
  for (let index = forMatches.length - 1; index >= 0; index -= 1) {
    const raw = forMatches[index][1];
    if (/^(?:die|den|der)?\s*(?:year\s*)?\d+\.?\s*(?:klasse|jahrgang|year|grade)?/i.test(raw)) continue;
    const topic = cleanTopic(raw);
    if (topic && !/^(?:mich|uns|meine|einen?\s+test|me|us|my|a\s+test)/i.test(topic)) return topic;
  }
  return undefined;
}

function extractNotes(text) {
  const notes = [];
  const add = note => {
    const value = normalizeText(note).replace(/[\s,;:.]+$/g, "");
    if (!value) return;
    const sentence = `${value.charAt(0).toUpperCase()}${value.slice(1)}.`;
    if (!notes.some(existing => existing.toLocaleLowerCase() === sentence.toLocaleLowerCase())) notes.push(sentence);
  };

  const progression = /\b(?:(?:die\s+)?(?:erste[nr]?\s+aufgaben?|erst).*?(?:leicht|einfach).*?(?:danach|später|spaeter|anschließend|anschliessend).*?(?:schwer|schwieriger|anspruchsvoll)|(?:start|begin|first).*?(?:easy|simple).*?(?:then|later|afterwards).*?(?:harder|challenging|difficult))\b/i.test(text);
  if (progression) add("Zuerst leichte Aufgaben, danach anspruchsvollere Aufgaben");
  else if (INITIAL_EASY.test(text)) add("Die ersten Aufgaben leicht gestalten");
  for (const match of text.matchAll(NEGATED_DIFFICULTY)) add(match[0]);

  if (/\b(?:vor allem|überwiegend|hauptsächlich|hauptsaechlich|mainly|mostly)\s+(?:einfache|leichte|easy|simple)\s+(?:aufgaben|questions|tasks)\b/i.test(text)) add("Vor allem einfache Aufgaben");
  if (/\b(?:(?:viele|mehrere)\s+alltagsbeispiele|(?:many|several)\s+real[- ]life examples?)\b/i.test(text)) add("Viele Alltagsbeispiele");
  if (/\b(?:(?:wenig|möglichst\s+wenig|moeglichst\s+wenig)\s+text|(?:little|minimal)\s+text)\b/i.test(text)) add("Wenig Text");
  if (/\b(?:(?:keine?|ohne)\s+(?:fangfragen?|trickfragen?)|(?:no|without)\s+trick questions?)\b/i.test(text)) add("Keine Fangfragen");
  if (/\b(?:kurze|knappe|short|concise)\s+(?:aufgaben|fragen|texte|questions|tasks|texts)\b/i.test(text)) add("Kurze Aufgaben");
  if (/\b(?:klare|eindeutige|verständliche|verstaendliche|clear|unambiguous)\s+(?:aufgaben|fragen|sprache|questions|tasks|language)\b/i.test(text)) add("Klare, verständliche Formulierungen");
  if (/\b(?:vor allem|überwiegend|hauptsächlich|hauptsaechlich|mainly|mostly)\s+(?:rechenaufgaben|calculation questions?|calculation tasks?)\b/i.test(text)) add("Vor allem Rechenaufgaben");
  if (/\b(?:(?:viele|mehr)\s+sachaufgaben|(?:many|more)\s+word problems?)\b/i.test(text)) add("Viele Sachaufgaben");
  if (/\b(?:viele\s+aufgaben|many\s+(?:questions|tasks))\b/i.test(text) && !/\b\d{1,3}\s+(?:aufgaben|questions|tasks)\b/i.test(text)) add("Viele Aufgaben");

  const explicit = text.match(/\b(?:(?:eigene\s+)?wünsche?|requests?|additional requests?|notes?)\s*[:=-]\s*([^.!?]+)/i);
  if (explicit?.[1]) add(explicit[1].slice(0, 500));

  return notes.join(" ").slice(0, 1000) || undefined;
}

function parseTestRequest(input = "") {
  const text = normalizeText(input);
  const patch = {};
  if (!text) return patch;

  const subject = firstMatch(text, SUBJECT_PATTERNS);
  if (subject) patch.subject = subject;

  const schoolType = firstMatch(text, SCHOOL_TYPE_PATTERNS);
  if (schoolType) patch.schoolType = schoolType;

  if (/\b(bayern|bavaria)\b/i.test(text)) patch.region = "Bayern";

  const grade = extractNumber(text, [
    /\b(?:klasse|jahrgang(?:sstufe)?|year|grade)\s*(\d{1,2})\b/i,
    /\b(\d{1,2})\.?\s*(?:klasse|jahrgang(?:sstufe)?|year|grade)\b/i,
    /\b(?:für|fuer|for)\s+(?:die\s+)?(?:year\s*)?(\d{1,2})\.?\b/i
  ], 1, 13);
  if (grade !== undefined) patch.grade = String(grade);

  const topic = extractTopic(text);
  if (topic) patch.topic = topic;

  const progressiveDifficulty = /\b(?:(?:die\s+)?(?:erste[nr]?\s+aufgaben?|erst).*?(?:leicht|einfach).*?(?:danach|später|spaeter|anschließend|anschliessend).*?(?:schwer|schwieriger|anspruchsvoll)|(?:start|begin|first).*?(?:easy|simple).*?(?:then|later|afterwards).*?(?:harder|challenging|difficult))\b/i.test(text);
  const difficultyText = text.replace(INITIAL_EASY, " ").replace(NEGATED_DIFFICULTY, " ");
  if (!progressiveDifficulty) {
    if (/\b(sehr\s+)?(leicht|einfach|einfache|leichte|leichtes|easy|simple)\b/i.test(difficultyText)) patch.difficulty = "leicht";
    else if (/\b(anspruchsvoll|schwer|schwieriger|schwere|anspruchsvolle|challenging|hard|difficult)\b/i.test(difficultyText)) patch.difficulty = "anspruchsvoll";
    else if (/\b(gemischt|unterschiedliche\s+schwierigkeitsgrade|mixed|varied difficulty)\b/i.test(difficultyText)) patch.difficulty = "gemischt";
    else if (/\b(mittel|mittlere[mnr]?|medium)\b/i.test(difficultyText)) patch.difficulty = "mittel";
  }

  const count = extractNumber(text, [/\b(\d{1,3})\s*(?:aufgaben?|fragen?|questions?|tasks?)\b/i], 1, 100);
  if (count !== undefined) patch.count = count;

  const points = extractNumber(text, [/\b(\d{1,3}(?:[.,]5)?)\s*(?:punkte?|points?|pkt\.?|p\.)\b/i], 0.5, 500);
  if (points !== undefined) patch.points = points;

  const duration = extractNumber(text, [/\b(\d{1,3})\s*(?:minuten?|minutes?|mins?|min\.?)(?:\s|$)/i], 1, 300);
  if (duration !== undefined) patch.durationMinutes = duration;

  const audioQuestionCount = extractNumber(text, [
    /\b(?:davon\s+)?(\d{1,2})\s*(?:hör|hoer)(?:aufgaben?|fragen?)\b/i,
    /\b(\d{1,2})\s*(?:aufgaben?|fragen?)\s+mit\s+(?:audio|hörtext|hoertext)\b/i,
    /\b(?:of\s+those\s+)?(\d{1,2})\s*(?:listening|audio)\s+(?:questions?|tasks?)\b/i,
    /\b(\d{1,2})\s+(?:questions?|tasks?)\s+(?:with\s+audio|using\s+audio)\b/i
  ], 0, 5);
  if (audioQuestionCount !== undefined) patch.audioQuestionCount = audioQuestionCount;

  const allowedTypes = [];
  const excludedTypes = [];
  for (const [pattern, value] of TYPE_PATTERNS) {
    const excluded = new RegExp('\\b(?:keine?|ohne|nicht|no|without|not)\\s+(?:' + pattern.source + ')', 'i').test(text);
    if (excluded) excludedTypes.push(value);
    else if (pattern.test(text)) allowedTypes.push(value);
  }
  if (allowedTypes.length) patch.allowedTypes = allowedTypes;
  if (excludedTypes.length) patch.excludeTypes = excludedTypes;

  const notes = extractNotes(text);
  if (notes) patch.notes = notes;

  return patch;
}

function looksLikeTestCommand(text) {
  return /\b(test|probe|prüfung|pruefung|lernzielkontrolle|assessment|quiz)\b/i.test(text) ||
    /\b(?:klasse|jahrgang|year|grade|punkte?|points?|questions?|tasks?|multiple[ -]?choice|freitext|free[ -]?text|zuordnung|matching|lückentext|gap[ -]?fill|listening|audio)\b/i.test(text);
}

function patchSummary(patch = {}, locale = "de-DE") {
  const english = normalizeLocale(locale) === "en-GB";
  const parts = [];
  if (patch.subject) parts.push(english ? (ENGLISH_SUBJECT_LABELS[patch.subject] || patch.subject) : patch.subject);
  if (patch.grade) parts.push(english ? `Year ${patch.grade}` : `Klasse ${patch.grade}`);
  if (patch.topic) parts.push(patch.topic);
  if (patch.difficulty) parts.push(english ? (ENGLISH_DIFFICULTY_LABELS[patch.difficulty] || patch.difficulty) : patch.difficulty);
  if (patch.count) parts.push(english ? `${patch.count} questions` : `${patch.count} Aufgaben`);
  if (patch.points) parts.push(english ? `${patch.points} points` : `${patch.points} Punkte`);
  if (patch.durationMinutes) parts.push(english ? `${patch.durationMinutes} min.` : `${patch.durationMinutes} Min.`);
  if (patch.audioQuestionCount !== undefined) parts.push(english ? `${patch.audioQuestionCount} listening questions` : `${patch.audioQuestionCount} Höraufgaben`);
  if (patch.notes) parts.push(english ? "Additional requests added" : "Wünsche übernommen");
  return parts.join(" · ");
}

function resolveCommonResponse(crewId, text, locale = "de-DE") {
  const normalizedLocale = normalizeLocale(locale);
  const copy = COMMON_RESPONSES[normalizedLocale] || COMMON_RESPONSES["de-DE"];
  if (/^(hi|hello|hey|hallo|servus|moin|good (morning|afternoon|evening)|guten (morgen|tag|abend))[!. ]*$/i.test(text)) {
    return { intent: "greeting", reply: copy.greeting[crewId] || copy.greeting.coco };
  }
  if (/\b(was kannst du|wobei hilfst du|was machst du|deine aufgabe|what can you do|how can you help|what do you do|your role)\b/i.test(text)) {
    return { intent: "capabilities", reply: copy.capabilities[crewId] || copy.capabilities.coco };
  }
  if (/\b(datenschutz|personenbezogen|schülerdaten|schuelerdaten|privat|privacy|personal data|student data)\b/i.test(text)) {
    return { intent: "privacy", reply: copy.privacy };
  }
  if (/\b(kosten|api|token|punkte sparen|günstig|guenstig|costs?|tokens?|save api|cheaper)\b/i.test(text)) {
    return { intent: "cost", reply: copy.cost };
  }
  return null;
}

function resolveLocalCrewRequest({ crewId = "coco", text = "", context = {}, locale = "de-DE" } = {}) {
  const member = CREW_MEMBERS[crewId] || CREW_MEMBERS.coco;
  const normalizedLocale = normalizeLocale(locale);
  const english = normalizedLocale === "en-GB";
  const normalized = normalizeText(text);
  if (!normalized) return {
    handled: true,
    source: "local",
    intent: "empty",
    reply: english ? "Just tell me what you'd like help with." : "Sag mir einfach, wobei ich dir helfen soll."
  };

  const common = resolveCommonResponse(member.id, normalized, normalizedLocale);
  if (common) return { handled: true, source: "local", ...common };

  const patch = parseTestRequest(normalized);
  if (member.id === "remy" && Object.keys(patch).length) {
    const summary = patchSummary(patch, normalizedLocale);
    return {
      handled: true,
      source: "local",
      intent: "patch_ai_form",
      reply: english
        ? (summary ? `Got it. I understood: ${summary}.` : "Got it. I'll apply the recognised details to the test form.")
        : (summary ? `Klar. Ich habe verstanden: ${summary}.` : "Klar. Ich übernehme die erkannten Angaben ins Testformular."),
      action: { type: "patch_ai_form", patch },
      contextUsed: Boolean(context && Object.keys(context).length)
    };
  }

  if (member.id === "coco" && looksLikeTestCommand(normalized)) {
    return {
      handled: true,
      source: "local",
      intent: "route_remy",
      reply: english
        ? "Remy handles test creation. Open ‘New test’ → ‘Create with AI’ and tell or dictate what you need there."
        : "Für das Erstellen von Tests ist Remy da. Öffne „Neuer Test“ → „Mit KI erstellen“ – dort kannst du Remy direkt sagen oder diktieren, was du brauchst."
    };
  }

  if (/\b(wer bist du|wie heißt du|wie heisst du|who are you|what is your name|what's your name)\b/i.test(normalized)) {
    if (english) {
      const roles = { coco: "guidance & navigation", remy: "creating tests & ideas", emmi: "improving & reviewing", wilma: "grading & results" };
      return { handled: true, source: "local", intent: "identity", reply: `I'm ${member.name}. My role here is ${roles[member.id] || "helping in GradeCrew"}.` };
    }
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
  PARSER_VERSION,
  normalizeLocale,
  normalizeText,
  parseTestRequest,
  patchSummary,
  resolveLocalCrewRequest
};
