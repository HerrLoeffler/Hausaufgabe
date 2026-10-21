// Testify AI import helpers – deliberately dependency-free and browser-side.
// Repairs common formatting mistakes from copied LLM output without making
// subject-matter decisions.

const SMART_DOUBLE_QUOTES = /[\u201c\u201d\u201e\u201f\u00ab\u00bb]/;

export function stripCodeFence(text) {
  return String(text || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/^```(?:json|javascript|js)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function firstJsonStart(text) {
  const objectStart = text.indexOf("{");
  const arrayStart = text.indexOf("[");
  if (objectStart < 0) return arrayStart;
  if (arrayStart < 0) return objectStart;
  return Math.min(objectStart, arrayStart);
}

export function extractJsonPayload(text) {
  const cleaned = stripCodeFence(text)
    .replace(/[\u200B-\u200D\u2060]/g, "")
    .trim();
  if (!cleaned) return "";
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch (_) {
    // Continue with extraction.
  }

  const start = firstJsonStart(cleaned);
  if (start < 0) return cleaned;
  const open = cleaned[start];
  const close = open === "{" ? "}" : "]";
  const end = cleaned.lastIndexOf(close);
  if (end > start) return cleaned.slice(start, end + 1).trim();
  return cleaned.slice(start).trim();
}

function replaceSmartQuotedKeys(text, changes) {
  let out = text;
  // Keys are intentionally limited to one line. This avoids touching quoted
  // wording inside actual question text.
  const keyPattern = /([\{,]\s*)[\u201c\u201d\u201e\u201f\u00ab\u00bb]([^\r\n:\u201c\u201d\u201e\u201f\u00ab\u00bb]+?)[\u201c\u201d\u201e\u201f\u00ab\u00bb]\s*:/g;
  const next = out.replace(keyPattern, (_, lead, key) => `${lead}"${String(key).trim()}":`);
  if (next !== out) changes.add("typografische Anführungszeichen bei Feldnamen");
  return next;
}

function replaceSmartQuotedValues(text, changes) {
  let out = text;
  // Replace only quote pairs that occur where a JSON value/array item begins
  // and whose closing quote is followed by a JSON delimiter. Inner German
  // quotation marks such as „Homevideo“ remain untouched.
  const valuePattern = /([:\[,]\s*)[\u201c\u201d\u201e\u201f\u00ab\u00bb]([\s\S]*?)[\u201c\u201d\u201e\u201f\u00ab\u00bb](?=\s*[,\}\]])/g;
  let previous;
  do {
    previous = out;
    out = out.replace(valuePattern, (_, lead, value) => {
      const escaped = String(value)
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\r?\n/g, "\\n");
      return `${lead}"${escaped}"`;
    });
  } while (out !== previous && SMART_DOUBLE_QUOTES.test(out));
  if (out !== text) changes.add("typografische Anführungszeichen bei Textwerten");
  return out;
}

function replaceSingleQuotedJson(text, changes) {
  let out = text;
  const keyPattern = /([\{,]\s*)'([^'\r\n:]+?)'\s*:/g;
  const keyFixed = out.replace(keyPattern, (_, lead, key) => `${lead}"${String(key).trim().replace(/"/g, '\\"')}":`);
  if (keyFixed !== out) changes.add("einfache Anführungszeichen bei Feldnamen");
  out = keyFixed;

  const valuePattern = /([:\[,]\s*)'([\s\S]*?)'(?=\s*[,\}\]])/g;
  const valueFixed = out.replace(valuePattern, (_, lead, value) => `${lead}"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, "\\n")}"`);
  if (valueFixed !== out) changes.add("einfache Anführungszeichen bei Textwerten");
  return valueFixed;
}

function quoteBareKeys(text, changes) {
  const next = text.replace(/([\{,]\s*)([A-Za-zÄÖÜäöüß_$][A-Za-z0-9ÄÖÜäöüß_$\- ]*)\s*:/g, (_, lead, key) => `${lead}"${String(key).trim()}":`);
  if (next !== text) changes.add("fehlende Anführungszeichen bei Feldnamen");
  return next;
}

function replacePythonLiterals(text, changes) {
  let out = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      out += ch;
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ch;
      continue;
    }
    const rest = text.slice(i);
    const match = rest.match(/^(True|False|None)\b/);
    if (match) {
      out += match[1] === "True" ? "true" : match[1] === "False" ? "false" : "null";
      i += match[1].length - 1;
      changes.add("True/False/None in JSON-Werte umgewandelt");
      continue;
    }
    out += ch;
  }
  return out;
}

function removeComments(text, changes) {
  let out = "";
  let inString = false;
  let escaped = false;
  let changed = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (inString) {
      out += ch;
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ch;
      continue;
    }
    if (ch === "/" && next === "/") {
      changed = true;
      i += 2;
      while (i < text.length && text[i] !== "\n") i += 1;
      out += "\n";
      continue;
    }
    if (ch === "/" && next === "*") {
      changed = true;
      i += 2;
      while (i < text.length - 1 && !(text[i] === "*" && text[i + 1] === "/")) i += 1;
      i += 1;
      continue;
    }
    out += ch;
  }
  if (changed) changes.add("Kommentare entfernt");
  return out;
}

function escapeRawNewlinesInStrings(text, changes) {
  let out = "";
  let inString = false;
  let escaped = false;
  let changed = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (!inString) {
      if (ch === '"') inString = true;
      out += ch;
      continue;
    }
    if (escaped) {
      out += ch;
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      out += ch;
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = false;
      out += ch;
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      out += "\\n";
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      changed = true;
      continue;
    }
    if (ch.charCodeAt(0) < 0x20) {
      out += " ";
      changed = true;
      continue;
    }
    out += ch;
  }
  if (changed) changes.add("Zeilenumbrüche in Textwerten repariert");
  return out;
}

function removeTrailingCommas(text, changes) {
  const next = text.replace(/,\s*([}\]])/g, "$1");
  if (next !== text) changes.add("überflüssige Kommas entfernt");
  return next;
}

function balanceClosingBrackets(text, changes) {
  const stack = [];
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === "{" || ch === "[") stack.push(ch);
    else if (ch === "}" || ch === "]") {
      const expected = ch === "}" ? "{" : "[";
      if (stack[stack.length - 1] === expected) stack.pop();
    }
  }
  if (inString || !stack.length || stack.length > 6) return text;
  let out = text.trimEnd();
  while (stack.length) out += stack.pop() === "{" ? "}" : "]";
  changes.add("fehlende schließende Klammern ergänzt");
  return out;
}

export function repairJsonText(input) {
  const changes = new Set();
  let text = extractJsonPayload(input)
    .replace(/[\u200B-\u200D\u2060]/g, "")
    .replace(/：/g, ":")
    .replace(/，/g, ",")
    .replace(/；/g, ";")
    .trim();

  const original = text;
  text = replaceSmartQuotedKeys(text, changes);
  text = replaceSmartQuotedValues(text, changes);
  text = replaceSingleQuotedJson(text, changes);
  text = quoteBareKeys(text, changes);
  text = removeComments(text, changes);
  text = replacePythonLiterals(text, changes);
  text = escapeRawNewlinesInStrings(text, changes);
  text = removeTrailingCommas(text, changes);
  text = balanceClosingBrackets(text, changes);

  return { text, changed: text !== original, changes: [...changes] };
}

export function parseJsonWithRepair(input) {
  const extracted = extractJsonPayload(input);
  if (!extracted) return { ok: false, error: new Error("Keine KI-Antwort gefunden."), changes: [], repaired: false, text: "" };

  try {
    return { ok: true, data: JSON.parse(extracted), text: extracted, changes: [], repaired: false };
  } catch (firstError) {
    const repaired = repairJsonText(extracted);
    try {
      return {
        ok: true,
        data: JSON.parse(repaired.text),
        text: repaired.text,
        changes: repaired.changes,
        repaired: true,
        firstError
      };
    } catch (error) {
      return {
        ok: false,
        error,
        firstError,
        text: repaired.text,
        changes: repaired.changes,
        repaired: repaired.changed
      };
    }
  }
}
