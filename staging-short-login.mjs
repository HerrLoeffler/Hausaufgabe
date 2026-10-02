import { appEnvironment } from "./firebase-config.js?v=2.3.1-gc28";

export const STAGING_ALIAS_DOMAIN = "staging.gradecrew.test";
const SHORT_ALIAS_RE = /^[a-z0-9](?:[a-z0-9._-]{0,30}[a-z0-9])?$/;

export function normalizeShortAlias(value) {
  const alias = String(value ?? "").trim().toLowerCase();
  if (!alias || alias.includes("@") || !SHORT_ALIAS_RE.test(alias)) return "";
  return alias;
}

export function resolveAuthIdentifier(value, environment = appEnvironment) {
  const raw = String(value ?? "").trim();
  if (!raw || environment !== "staging" || raw.includes("@")) return raw;
  const alias = normalizeShortAlias(raw);
  return alias ? `${alias}@${STAGING_ALIAS_DOMAIN}` : raw;
}

function installHint(form, input, mode) {
  if (!form || !input || form.querySelector(".stagingShortLoginHint")) return;
  const hint = document.createElement("p");
  hint.className = "hint stagingShortLoginHint";
  hint.textContent = mode === "register"
    ? "STAGING: Für Testkonten reicht ein Kurzname wie „test“. Intern bleibt Firebase Auth unverändert."
    : "STAGING: E-Mail oder Kurzname wie „test“ eingeben.";
  input.closest("label")?.insertAdjacentElement("afterend", hint);
}

function prepareInput(form, input, mode) {
  if (!form || !input) return;
  input.type = "text";
  input.autocapitalize = "none";
  input.spellcheck = false;
  input.placeholder = mode === "register"
    ? "E-Mail oder Kurzname, z. B. test"
    : "E-Mail oder Kurzname";
  input.autocomplete = mode === "register" ? "username" : "username";
  input.dataset.stagingShortLogin = "1";
  installHint(form, input, mode);

  form.addEventListener("submit", () => {
    const original = input.value;
    const resolved = resolveAuthIdentifier(original, "staging");
    if (!resolved || resolved === original) return;
    input.value = resolved;
    queueMicrotask(() => {
      if (input.value === resolved) input.value = original;
    });
  }, true);
}

export function installStagingShortLogin(doc = document) {
  if (appEnvironment !== "staging") return false;
  const loginForm = doc.getElementById("loginForm");
  const loginInput = doc.getElementById("loginEmail");
  const registerForm = doc.getElementById("registerForm");
  const registerInput = doc.getElementById("registerEmail");

  prepareInput(loginForm, loginInput, "login");
  prepareInput(registerForm, registerInput, "register");
  return Boolean(loginForm && loginInput && registerForm && registerInput);
}
