export const I18N_SCHEMA_VERSION = 1;
export const DEFAULT_LOCALE = "de-DE";
export const DEFAULT_TIME_ZONE = "Europe/Berlin";
export const SUPPORTED_UI_LOCALES = Object.freeze([DEFAULT_LOCALE]);

export function canonicalizeLocale(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    return Intl.getCanonicalLocales(value.trim())[0] || null;
  } catch {
    return null;
  }
}

export function localeLanguage(value) {
  const locale = canonicalizeLocale(value);
  return locale ? locale.split("-")[0].toLowerCase() : null;
}

function canonicalSupportedLocales(supportedLocales) {
  const unique = new Set();
  for (const value of supportedLocales || []) {
    const locale = canonicalizeLocale(value);
    if (locale) unique.add(locale);
  }
  return [...unique];
}

export function resolveUiLocale({
  userLocale = null,
  schoolLocale = null,
  deviceLocale = null,
  supportedLocales = SUPPORTED_UI_LOCALES,
  defaultLocale = DEFAULT_LOCALE,
} = {}) {
  const supported = canonicalSupportedLocales(supportedLocales);
  const fallback = canonicalizeLocale(defaultLocale) || DEFAULT_LOCALE;
  if (!supported.includes(fallback)) supported.push(fallback);

  const candidates = [
    ["user", userLocale],
    ["school", schoolLocale],
    ["device", deviceLocale],
  ];

  for (const [source, requested] of candidates) {
    const canonical = canonicalizeLocale(requested);
    if (!canonical) continue;
    if (supported.includes(canonical)) {
      return { locale: canonical, source, requestedLocale: canonical, fallbackUsed: false };
    }

    const language = localeLanguage(canonical);
    const sameLanguage = supported.find(locale => localeLanguage(locale) === language);
    if (sameLanguage) {
      return { locale: sameLanguage, source, requestedLocale: canonical, fallbackUsed: true };
    }
  }

  return { locale: fallback, source: "default", requestedLocale: null, fallbackUsed: false };
}

export function normalizeContentLocale(value, fallback = DEFAULT_LOCALE) {
  return canonicalizeLocale(value) || canonicalizeLocale(fallback) || DEFAULT_LOCALE;
}

export function createLocaleContext({
  uiLocale = DEFAULT_LOCALE,
  contentLocale = DEFAULT_LOCALE,
  gradingLocale = null,
  educationContextId = "DE-BY",
  timeZone = DEFAULT_TIME_ZONE,
} = {}) {
  const normalizedContent = normalizeContentLocale(contentLocale);
  return Object.freeze({
    schemaVersion: I18N_SCHEMA_VERSION,
    uiLocale: normalizeContentLocale(uiLocale),
    contentLocale: normalizedContent,
    gradingLocale: normalizeContentLocale(gradingLocale, normalizedContent),
    educationContextId: String(educationContextId || "").trim() || null,
    timeZone: String(timeZone || "").trim() || DEFAULT_TIME_ZONE,
  });
}

export function createAssessmentLocaleSnapshot({
  localeContext,
  messagesVersion = "de-DE@1",
  gradingPolicyVersion = null,
  curriculumVersion = null,
  createdAt = new Date().toISOString(),
} = {}) {
  const context = createLocaleContext(localeContext || {});
  return Object.freeze({
    schemaVersion: I18N_SCHEMA_VERSION,
    uiLocale: context.uiLocale,
    contentLocale: context.contentLocale,
    gradingLocale: context.gradingLocale,
    educationContextId: context.educationContextId,
    timeZone: context.timeZone,
    messagesVersion: String(messagesVersion || "").trim() || null,
    gradingPolicyVersion: gradingPolicyVersion == null ? null : String(gradingPolicyVersion),
    curriculumVersion: curriculumVersion == null ? null : String(curriculumVersion),
    createdAt: String(createdAt),
  });
}

function localeSeparators(locale) {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  return {
    group: parts.find(part => part.type === "group")?.value || ",",
    decimal: parts.find(part => part.type === "decimal")?.value || ".",
  };
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseLocaleNumber(input, locale = DEFAULT_LOCALE) {
  if (typeof input === "number") {
    return Number.isFinite(input)
      ? { ok: true, value: input, normalized: String(input) }
      : { ok: false, reason: "not-finite" };
  }

  if (typeof input !== "string") return { ok: false, reason: "not-a-string" };
  const canonicalLocale = normalizeContentLocale(locale);
  let raw = input.trim().replace(/\u2212/g, "-");
  if (!raw) return { ok: false, reason: "empty" };

  const { group, decimal } = localeSeparators(canonicalLocale);
  const alternateDecimal = decimal === "," ? "." : ",";

  if (raw.includes(alternateDecimal) && alternateDecimal === group) {
    const groupPattern = new RegExp(`^[+-]?\\d{1,3}(?:${escapeRegExp(group)}\\d{3})+(?:${escapeRegExp(decimal)}\\d+)?$`);
    if (!groupPattern.test(raw)) {
      return { ok: false, reason: "ambiguous-separator" };
    }
  } else if (raw.includes(alternateDecimal) && !raw.includes(decimal)) {
    return { ok: false, reason: "unexpected-decimal-separator" };
  }

  if (group) raw = raw.split(group).join("");
  if (decimal !== ".") raw = raw.split(decimal).join(".");
  raw = raw.replace(/[\u00A0\u202F ]/g, "");

  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(raw)) {
    return { ok: false, reason: "invalid-format" };
  }

  const value = Number(raw);
  if (!Number.isFinite(value)) return { ok: false, reason: "not-finite" };
  return { ok: true, value, normalized: raw };
}

export function formatLocaleNumber(value, locale = DEFAULT_LOCALE, options = {}) {
  return new Intl.NumberFormat(normalizeContentLocale(locale), options).format(value);
}

export function formatLocaleDate(value, locale = DEFAULT_LOCALE, options = {}) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new TypeError("Invalid date value");
  return new Intl.DateTimeFormat(normalizeContentLocale(locale), options).format(date);
}
