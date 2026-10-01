import {
  DEFAULT_LOCALE,
  canonicalizeLocale,
  resolveUiLocale,
  formatLocaleNumber,
  formatLocaleDate,
} from "./i18n-core.mjs";

const SOURCE_LOCALE = "de-DE";
const SUPPORTED_BROWSER_UI_LOCALES = Object.freeze(["de-DE"]);
const TRANSLATABLE_ATTRIBUTES = Object.freeze(["aria-label", "alt", "placeholder", "title"]);
const catalogs = new Map([[SOURCE_LOCALE, Object.freeze({})]]);
let activeLocale = SOURCE_LOCALE;
let observer = null;
let browserInstalled = false;
let nativeDialogsInstalled = false;
const originalDialogs = {};

function catalogFor(locale = activeLocale) {
  return catalogs.get(canonicalizeLocale(locale)) || null;
}

export function supportedUiLocales() {
  return [...SUPPORTED_BROWSER_UI_LOCALES];
}

export function isSupportedUiLocale(locale) {
  const normalized = canonicalizeLocale(locale);
  return Boolean(normalized && SUPPORTED_BROWSER_UI_LOCALES.includes(normalized));
}

export function registerCatalog(locale, entries = {}) {
  const normalized = canonicalizeLocale(locale);
  if (!normalized || !SUPPORTED_BROWSER_UI_LOCALES.includes(normalized)) {
    throw new Error(`Unsupported GradeCrew UI locale: ${normalized || locale}`);
  }
  if (!entries || typeof entries !== "object" || Array.isArray(entries)) {
    throw new TypeError("Catalog entries must be an object.");
  }
  catalogs.set(normalized, Object.freeze({ ...entries }));
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

function storedLocaleCandidate(storageKey) {
  try {
    return globalThis.localStorage?.getItem(storageKey) || "";
  } catch (_) {
    return "";
  }
}

export function resolveBrowserUiLocale({
  userLocale = "",
  schoolLocale = "",
  deviceLocale = browserLocaleCandidate(),
  storageKey = "gradecrew.uiLocale",
  defaultLocale = DEFAULT_LOCALE,
} = {}) {
  const stored = storedLocaleCandidate(storageKey);
  const resolved = resolveUiLocale({
    userLocale: userLocale || stored,
    schoolLocale,
    deviceLocale,
    defaultLocale,
    supportedLocales: SUPPORTED_BROWSER_UI_LOCALES,
  });
  return isSupportedUiLocale(resolved.locale) ? resolved.locale : SOURCE_LOCALE;
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

export function translateSource(source, values = {}) {
  const text = String(source ?? "");
  if (!text || activeLocale === SOURCE_LOCALE) return interpolate(text, values);
  const catalog = catalogFor(activeLocale);
  const translated = catalog?.[`source:${text}`];
  return interpolate(translated == null ? text : translated, values);
}

function shouldSkipNode(node) {
  const parent = node?.parentElement;
  if (!parent) return false;
  return Boolean(parent.closest?.('[data-i18n-ignore],script,style,code,pre,textarea,[contenteditable="true"]'));
}

function translateTextNode(node) {
  if (!node || node.nodeType !== 3 || shouldSkipNode(node)) return;
  const original = node.nodeValue;
  if (!original || !original.trim()) return;
  const leading = original.match(/^\s*/)?.[0] || "";
  const trailing = original.match(/\s*$/)?.[0] || "";
  const end = trailing.length ? original.length - trailing.length : original.length;
  const core = original.slice(leading.length, end);
  const translated = translateSource(core);
  if (translated !== core) node.nodeValue = `${leading}${translated}${trailing}`;
}

function translateElementAttributes(element) {
  if (!element?.getAttribute || element.closest?.("[data-i18n-ignore]")) return;
  const key = element.getAttribute("data-i18n-key");
  if (key) {
    const fallback = element.getAttribute("data-i18n-fallback") || element.textContent || "";
    const translated = t(key, {}, fallback);
    if (translated !== element.textContent) element.textContent = translated;
  }
  for (const attribute of TRANSLATABLE_ATTRIBUTES) {
    const current = element.getAttribute(attribute);
    if (!current) continue;
    const translated = translateSource(current);
    if (translated !== current) element.setAttribute(attribute, translated);
  }
}

export function translateTree(root = globalThis.document?.documentElement) {
  if (!root || activeLocale === SOURCE_LOCALE || !globalThis.document) return;
  if (root.nodeType === 3) {
    translateTextNode(root);
    return;
  }
  if (root.nodeType === 1) translateElementAttributes(root);
  const walker = globalThis.document.createTreeWalker(root, globalThis.NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) translateTextNode(node);
  root.querySelectorAll?.("*").forEach(translateElementAttributes);
}

function installObserver() {
  if (observer || activeLocale === SOURCE_LOCALE || !globalThis.MutationObserver || !globalThis.document) return;
  observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") translateTextNode(mutation.target);
      if (mutation.type === "attributes") translateElementAttributes(mutation.target);
      if (mutation.type === "childList") mutation.addedNodes.forEach(translateTree);
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

export function setActiveUiLocale(locale) {
  const normalized = canonicalizeLocale(locale);
  if (!normalized || !isSupportedUiLocale(normalized)) {
    throw new Error(`GradeCrew UI locale is not enabled: ${normalized || locale}`);
  }
  activeLocale = normalized;
  if (globalThis.document?.documentElement) {
    globalThis.document.documentElement.lang = normalized;
    globalThis.document.documentElement.dir = "ltr";
  }
  removeObserver();
  translateTree();
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
    setLocale: setActiveUiLocale,
  });
  globalThis.GradeCrewI18n = api;
  browserInstalled = true;
  return api;
}

export function isBrowserI18nInstalled() {
  return browserInstalled;
}

export { SOURCE_LOCALE, SUPPORTED_BROWSER_UI_LOCALES, TRANSLATABLE_ATTRIBUTES };
