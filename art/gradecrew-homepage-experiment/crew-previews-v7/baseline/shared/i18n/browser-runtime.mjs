import {
  DEFAULT_LOCALE,
  canonicalizeLocale,
  resolveUiLocale,
  formatLocaleNumber,
  formatLocaleDate,
} from "./i18n-core.mjs?v=2";

const SOURCE_LOCALE = "de-DE";
const ENGLISH_LOCALE = "en-GB";
const SUPPORTED_BROWSER_UI_LOCALES = Object.freeze([SOURCE_LOCALE, ENGLISH_LOCALE]);
const TRANSLATABLE_ATTRIBUTES = Object.freeze(["aria-label", "alt", "placeholder", "title"]);
const UI_LOCALE_STORAGE_KEY = "gradecrew.uiLocale";
const catalogs = new Map([[SOURCE_LOCALE, Object.freeze({})]]);
const patternCatalogs = new Map([[SOURCE_LOCALE, Object.freeze([])]]);
const textStates = new WeakMap();
const attributeStates = new WeakMap();
const semanticStates = new WeakMap();
let activeLocale = SOURCE_LOCALE;
let observer = null;
let browserInstalled = false;
let nativeDialogsInstalled = false;
const originalDialogs = {};

// These nodes contain assessment, user or administrator-authored content. UI language
// changes must never rewrite them. Mixed UI/content rows are handled through patterns
// that only translate the fixed UI prefix/suffix and preserve the embedded content.
const PROTECTED_CONTENT_SELECTORS = Object.freeze([
  "[data-i18n-content]",
  "#secureTitle",
  "#secureDescription",
  "#secureRunningTitle",
  "#secureWaitingName",
  "#secureQuestions .secureQuestion:not([data-type=\"gapfill\"]) > h2",
  "#secureQuestions .secureChoice > span > span",
  "#secureQuestions .secureQuestionImage",
  "#secureQuestions .secureOptionImage",
  "#secureQuestions .secureMatchingRow > strong",
  "#secureQuestions .secureMatchingRow option:not([value=\"\"])",
  "#secureQuestions .secureOrderItem > span",
  "#secureQuestions .secureGroupingRow > strong",
  "#secureQuestions .secureGroupingRow option:not([value=\"\"])",
  "#secureQuestions .secureMarkPassage",
  "#studentQuizCard .studentHead h1",
  "#studentQuizCard .studentHead > p",
  "#studentQuestions .studentQuestion:not([data-type=\"gapfill\"]) > h3",
  "#studentQuestions .gapSentence",
  "#studentQuestions .studentQuestion:not([data-type=\"truefalse\"]) .choice > span",
  "#studentQuestions .studentQuestion[data-type=\"dropdown\"] option:not([value=\"\"])",
  "#studentQuestions .studentQuestionImage img",
  "#studentQuestions .choiceImage",
  "#studentQuestions .numberStudentRow > span",
  "#studentQuestions .matchLeft",
  "#studentQuestions .dragItem",
  "#studentQuestions .sortText",
  "#studentQuestions .groupDrop > strong",
  "#studentQuestions .markWordsBox",
  "#studentResultDetails .studentResultDetail > strong",
  ".quizCard h3",
  "#editorHeading",
  "#resultsHeading",
  "#reviewHeading",
  "#reviewQuestions .reviewQuestion > strong",
  "#resultsTableWrap tbody td:first-child",
  "#adminTeachersTable tbody td:first-child",
  "#adminTestsTable tbody td:first-child > strong",
  "#announcementHost",
  "#announcementPreview",
  "#adminAnnouncementList",
  "#announcementDialogTitle",
  "#announcementDialogText",
  "#teacherTourAdminList",
  ".gcCrewMsg.user",
]);

function catalogFor(locale = activeLocale) {
  return catalogs.get(canonicalizeLocale(locale)) || null;
}

function patternsFor(locale = activeLocale) {
  return patternCatalogs.get(canonicalizeLocale(locale)) || [];
}

export function supportedUiLocales() {
  return [...SUPPORTED_BROWSER_UI_LOCALES];
}

export function isSupportedUiLocale(locale) {
  const normalized = canonicalizeLocale(locale);
  if (!normalized) return false;
  if (SUPPORTED_BROWSER_UI_LOCALES.includes(normalized)) return true;
  const language = normalized.split("-")[0].toLowerCase();
  return SUPPORTED_BROWSER_UI_LOCALES.some(item => item.split("-")[0].toLowerCase() === language);
}

function resolveSupportedLocale(locale) {
  const normalized = canonicalizeLocale(locale);
  if (!normalized) return null;
  if (SUPPORTED_BROWSER_UI_LOCALES.includes(normalized)) return normalized;
  const language = normalized.split("-")[0].toLowerCase();
  return SUPPORTED_BROWSER_UI_LOCALES.find(item => item.split("-")[0].toLowerCase() === language) || null;
}

export function registerCatalog(locale, entries = {}) {
  const normalized = resolveSupportedLocale(locale);
  if (!normalized) throw new Error(`Unsupported GradeCrew UI locale: ${locale}`);
  if (!entries || typeof entries !== "object" || Array.isArray(entries)) {
    throw new TypeError("Catalog entries must be an object.");
  }
  const existing = catalogs.get(normalized) || {};
  catalogs.set(normalized, Object.freeze({ ...existing, ...entries }));
}

export function registerSourcePatterns(locale, entries = []) {
  const normalized = resolveSupportedLocale(locale);
  if (!normalized) throw new Error(`Unsupported GradeCrew UI locale: ${locale}`);
  if (!Array.isArray(entries)) throw new TypeError("Source patterns must be an array.");
  const safe = entries.map(entry => {
    if (!entry || !(entry.pattern instanceof RegExp) || !(typeof entry.replacement === "string" || typeof entry.replacement === "function")) {
      throw new TypeError("Each source pattern needs a RegExp pattern and replacement.");
    }
    return Object.freeze({ pattern: entry.pattern, replacement: entry.replacement });
  });
  const existing = patternCatalogs.get(normalized) || [];
  patternCatalogs.set(normalized, Object.freeze([...existing, ...safe]));
}

export function getActiveUiLocale() {
  return activeLocale;
}

function browserLocaleCandidate() {
  try {
    return globalThis.navigator?.languages?.[0] || globalThis.navigator?.language || "";
  } catch (_) {
    return "";
  }
}

function urlLocaleCandidate() {
  try {
    if (!globalThis.location?.search) return "";
    const value = new URLSearchParams(globalThis.location.search).get("lang") || "";
    if (/^de(?:-|$)/i.test(value)) return SOURCE_LOCALE;
    if (/^en(?:-|$)/i.test(value)) return ENGLISH_LOCALE;
    return value;
  } catch (_) {
    return "";
  }
}

function storedLocaleCandidate(storageKey = UI_LOCALE_STORAGE_KEY) {
  try {
    return globalThis.localStorage?.getItem(storageKey) || "";
  } catch (_) {
    return "";
  }
}

function persistLocale(locale, storageKey = UI_LOCALE_STORAGE_KEY) {
  try { globalThis.localStorage?.setItem(storageKey, locale); } catch (_) {}
}

export function resolveBrowserUiLocale({
  userLocale = "",
  schoolLocale = "",
  deviceLocale = browserLocaleCandidate(),
  storageKey = UI_LOCALE_STORAGE_KEY,
  defaultLocale = DEFAULT_LOCALE,
} = {}) {
  const explicit = userLocale || urlLocaleCandidate() || storedLocaleCandidate(storageKey);
  const resolved = resolveUiLocale({
    userLocale: explicit,
    schoolLocale,
    deviceLocale,
    defaultLocale,
    supportedLocales: SUPPORTED_BROWSER_UI_LOCALES,
  });
  return resolveSupportedLocale(resolved.locale) || SOURCE_LOCALE;
}

function interpolate(message, values = {}) {
  return String(message ?? "").replace(/\{([A-Za-z0-9_.-]+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match);
}

export function t(key, values = {}, fallback = "") {
  const id = String(key || "").trim();
  const catalog = catalogFor(activeLocale);
  const sourceCatalog = catalogFor(SOURCE_LOCALE);
  const value = catalog && id && catalog[id] != null
    ? catalog[id]
    : sourceCatalog && id && sourceCatalog[id] != null
      ? sourceCatalog[id]
      : fallback || id;
  return interpolate(value, values);
}

function applySourcePattern(text) {
  for (const entry of patternsFor(activeLocale)) {
    entry.pattern.lastIndex = 0;
    if (!entry.pattern.test(text)) continue;
    entry.pattern.lastIndex = 0;
    return text.replace(entry.pattern, entry.replacement);
  }
  return text;
}

export function translateSource(source, values = {}) {
  const text = String(source ?? "");
  if (!text || activeLocale === SOURCE_LOCALE) return interpolate(text, values);
  const catalog = catalogFor(activeLocale);
  const translated = catalog?.[`source:${text}`];
  const value = translated == null ? applySourcePattern(text) : translated;
  return interpolate(value, values);
}

function matchesProtectedContent(element) {
  if (!element?.closest) return false;
  return PROTECTED_CONTENT_SELECTORS.some(selector => element.closest(selector));
}

function shouldSkipTextNode(node) {
  const parent = node?.parentElement;
  if (!parent) return false;
  if (parent.closest?.('[data-i18n-ignore],script,style,code,pre,textarea,[contenteditable="true"]')) return true;
  if (parent.closest?.("#secureQuestions .secureGapText")) return true;
  return matchesProtectedContent(parent);
}

function shouldSkipElement(element) {
  if (!element?.closest) return false;
  if (element.closest('[data-i18n-ignore],script,style,code,pre,textarea,[contenteditable="true"]')) return true;
  return matchesProtectedContent(element);
}

function splitWhitespace(value) {
  const text = String(value ?? "");
  const leading = text.match(/^\s*/)?.[0] || "";
  const trailing = text.match(/\s*$/)?.[0] || "";
  const end = trailing.length ? text.length - trailing.length : text.length;
  return { leading, core: text.slice(leading.length, end), trailing };
}

function translateTextNode(node, { force = false } = {}) {
  if (!node || node.nodeType !== 3 || shouldSkipTextNode(node)) return;
  const current = node.nodeValue || "";
  if (!current.trim()) return;
  const previous = textStates.get(node);
  const source = force && previous
    ? previous.source
    : previous && current === previous.rendered
      ? previous.source
      : current;
  const { leading, core, trailing } = splitWhitespace(source);
  const translatedCore = activeLocale === SOURCE_LOCALE ? core : translateSource(core);
  const rendered = `${leading}${translatedCore}${trailing}`;
  textStates.set(node, { source, rendered });
  if (current !== rendered) node.nodeValue = rendered;
}

function attributeStateFor(element) {
  let state = attributeStates.get(element);
  if (!state) {
    state = new Map();
    attributeStates.set(element, state);
  }
  return state;
}

function translateAttribute(element, attribute, { force = false } = {}) {
  const current = element.getAttribute(attribute);
  if (!current) return;
  const state = attributeStateFor(element);
  const previous = state.get(attribute);
  const source = force && previous
    ? previous.source
    : previous && current === previous.rendered
      ? previous.source
      : current;
  const rendered = activeLocale === SOURCE_LOCALE ? source : translateSource(source);
  state.set(attribute, { source, rendered });
  if (current !== rendered) element.setAttribute(attribute, rendered);
}

function translateSemanticElement(element, key, { force = false } = {}) {
  const current = element.textContent || "";
  const previous = semanticStates.get(element);
  const sourceFallback = force && previous
    ? previous.sourceFallback
    : previous && current === previous.rendered
      ? previous.sourceFallback
      : element.getAttribute("data-i18n-fallback") || current;
  const rendered = activeLocale === SOURCE_LOCALE
    ? sourceFallback
    : t(key, {}, sourceFallback);
  semanticStates.set(element, { sourceFallback, rendered });
  if (current !== rendered) element.textContent = rendered;
}

function translateElementAttributes(element, options = {}) {
  if (!element?.getAttribute || shouldSkipElement(element)) return;
  const key = element.getAttribute("data-i18n-key");
  if (key) translateSemanticElement(element, key, options);
  for (const attribute of TRANSLATABLE_ATTRIBUTES) translateAttribute(element, attribute, options);
}

export function translateTree(root = globalThis.document?.documentElement, options = {}) {
  if (!root || !globalThis.document) return;
  if (root.nodeType === 3) {
    translateTextNode(root, options);
    return;
  }
  if (root.nodeType === 1) translateElementAttributes(root, options);
  const walker = globalThis.document.createTreeWalker(root, globalThis.NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) translateTextNode(node, options);
  root.querySelectorAll?.("*").forEach(element => translateElementAttributes(element, options));
}

function installObserver() {
  if (observer || activeLocale === SOURCE_LOCALE || !globalThis.MutationObserver || !globalThis.document) return;
  observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") translateTextNode(mutation.target);
      if (mutation.type === "attributes") translateElementAttributes(mutation.target);
      if (mutation.type === "childList") mutation.addedNodes.forEach(node => translateTree(node));
    }
  });
  observer.observe(globalThis.document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: TRANSLATABLE_ATTRIBUTES,
  });
}

function removeObserver() {
  observer?.disconnect();
  observer = null;
}

function installNativeDialogTranslation() {
  if (nativeDialogsInstalled || typeof globalThis.window === "undefined") return;
  nativeDialogsInstalled = true;
  for (const name of ["alert", "confirm", "prompt"]) {
    const fn = globalThis.window[name];
    if (typeof fn !== "function") continue;
    originalDialogs[name] = fn.bind(globalThis.window);
    globalThis.window[name] = (message, ...rest) => originalDialogs[name](translateSource(message), ...rest);
  }
}

function languageControlCopy(locale = activeLocale) {
  return locale === ENGLISH_LOCALE
    ? {
        title: "Interface language",
        description: "Changes GradeCrew menus and help text only. Test content, answers and grading language stay unchanged.",
      }
    : {
        title: "Oberflächensprache",
        description: "Ändert nur Menüs und Hilfetexte in GradeCrew. Testinhalte, Antworten und Bewertungssprache bleiben unverändert.",
      };
}

function injectLanguageControlStyles() {
  if (!globalThis.document || document.querySelector("style[data-gradecrew-language-control]")) return;
  const style = document.createElement("style");
  style.dataset.gradecrewLanguageControl = "1";
  style.textContent = `
    .gradecrewLanguageControl{display:inline-flex;align-items:center;gap:6px;margin-left:0;white-space:nowrap;flex:0 0 auto}
    .gradecrewLanguageControl select{min-height:34px;border:1px solid rgba(100,116,139,.35);border-radius:10px;background:var(--gc-surface,#fff);color:inherit;padding:5px 8px;font:inherit;font-size:13px}
    .gradecrewLanguageControl .gcLanguageIcon{font-size:15px;line-height:1}
    .topbar.gradecrewLanguageReady{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;grid-template-areas:"brand nav user language";align-items:center}
    .topbar.gradecrewLanguageReady>.brand{grid-area:brand}
    .topbar.gradecrewLanguageReady>#gcPublicNav{grid-area:nav;min-width:0;justify-self:center;margin-inline:auto}
    .topbar.gradecrewLanguageReady>#userBar{grid-area:user;justify-self:end;margin-left:0;max-width:100%}
    .topbar.gradecrewLanguageReady>#gradecrewLanguageControl{grid-area:language;justify-self:end}
    .gcLanguageSettingsCard{grid-column:1/-1}
    .gcLanguageSettingsRow{display:flex;gap:16px;align-items:flex-end;justify-content:space-between;flex-wrap:wrap}
    .gcLanguageSettingsRow p{margin:.35rem 0 0;max-width:680px}
    .gcLanguageSettingsRow label{min-width:180px}
    @media(max-width:900px){
      .topbar.gradecrewLanguageReady{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"brand language" "nav nav" "user user"}
      .topbar.gradecrewLanguageReady>#gcPublicNav{justify-self:stretch;margin-inline:0}
    }
    @media(max-width:720px){.gradecrewLanguageControl .gcLanguageIcon{display:none}.gradecrewLanguageControl select{max-width:108px;padding-inline:6px}}
  `;
  document.head.appendChild(style);
}

function createLocaleSelect(className = "") {
  const select = document.createElement("select");
  select.className = className;
  select.setAttribute("aria-label", "Sprache / Language");
  select.innerHTML = `<option value="de-DE">DE · Deutsch</option><option value="en-GB">EN · English</option>`;
  select.value = activeLocale;
  select.addEventListener("change", () => {
    const locale = resolveSupportedLocale(select.value) || SOURCE_LOCALE;
    persistLocale(locale);
    setActiveUiLocale(locale);
    try {
      globalThis.dispatchEvent?.(new CustomEvent("gradecrew:ui-locale-changed", { detail: { locale } }));
    } catch (_) {}
  });
  return select;
}

function syncLanguageControls() {
  if (!globalThis.document) return;
  document.querySelectorAll("[data-gradecrew-locale-select]").forEach(select => { select.value = activeLocale; });
  const card = document.getElementById("gradecrewLanguageSettingsCard");
  if (card) {
    const copy = languageControlCopy();
    const title = card.querySelector("[data-language-title]");
    const description = card.querySelector("[data-language-description]");
    if (title) title.textContent = copy.title;
    if (description) description.textContent = copy.description;
  }
}

function ensureLanguageControls() {
  if (!globalThis.document) return;
  injectLanguageControlStyles();
  const header = document.querySelector(".topbar,.secureTopbar");
  if (header) header.classList.add("gradecrewLanguageReady");
  if (header && !document.getElementById("gradecrewLanguageControl")) {
    const wrap = document.createElement("div");
    wrap.id = "gradecrewLanguageControl";
    wrap.className = "gradecrewLanguageControl";
    wrap.dataset.i18nIgnore = "1";
    wrap.innerHTML = '<span class="gcLanguageIcon" aria-hidden="true">🌐</span>';
    const select = createLocaleSelect();
    select.dataset.gradecrewLocaleSelect = "1";
    wrap.appendChild(select);
    header.appendChild(wrap);
  }

  document.getElementById("gradecrewLanguageSettingsCard")?.remove();
  syncLanguageControls();
}

export function setActiveUiLocale(locale) {
  const normalized = resolveSupportedLocale(locale);
  if (!normalized) throw new Error(`GradeCrew UI locale is not enabled: ${canonicalizeLocale(locale) || locale}`);
  activeLocale = normalized;
  if (globalThis.document?.documentElement) {
    globalThis.document.documentElement.lang = normalized;
    globalThis.document.documentElement.dir = "ltr";
  }
  removeObserver();
  translateTree(globalThis.document?.documentElement, { force: true });
  ensureLanguageControls();
  installObserver();
  return activeLocale;
}

export function installBrowserI18n(options = {}) {
  const resolved = resolveBrowserUiLocale(options);
  setActiveUiLocale(resolved);
  installNativeDialogTranslation();
  const api = Object.freeze({
    sourceLocale: SOURCE_LOCALE,
    supportedUiLocales: supportedUiLocales(),
    get locale() { return activeLocale; },
    t,
    translateSource,
    formatNumber: (value, formatOptions) => formatLocaleNumber(value, activeLocale, formatOptions),
    formatDate: (value, formatOptions) => formatLocaleDate(value, activeLocale, formatOptions),
    formatList: (items, formatOptions) => new Intl.ListFormat(activeLocale, formatOptions).format(items),
    formatRelativeTime: (value, unit, formatOptions) => new Intl.RelativeTimeFormat(activeLocale, formatOptions).format(value, unit),
    setLocale(locale, { persist = true } = {}) {
      const next = setActiveUiLocale(locale);
      if (persist) persistLocale(next);
      return next;
    },
  });
  globalThis.GradeCrewI18n = api;
  browserInstalled = true;
  ensureLanguageControls();
  return api;
}

export function isBrowserI18nInstalled() {
  return browserInstalled;
}

export {
  SOURCE_LOCALE,
  ENGLISH_LOCALE,
  SUPPORTED_BROWSER_UI_LOCALES,
  TRANSLATABLE_ATTRIBUTES,
  PROTECTED_CONTENT_SELECTORS,
  UI_LOCALE_STORAGE_KEY,
};
