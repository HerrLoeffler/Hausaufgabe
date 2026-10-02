import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  STAGING_ALIAS_DOMAIN,
  normalizeShortAlias,
  resolveAuthIdentifier
} from "./staging-short-login.mjs";

test("staging aliases resolve to a reserved non-deliverable test email", () => {
  assert.equal(resolveAuthIdentifier("test", "staging"), `test@${STAGING_ALIAS_DOMAIN}`);
  assert.equal(resolveAuthIdentifier(" Lehrer-1 ", "staging"), `lehrer-1@${STAGING_ALIAS_DOMAIN}`);
});

test("real email addresses remain unchanged on staging", () => {
  assert.equal(resolveAuthIdentifier("martin@example.com", "staging"), "martin@example.com");
});

test("production never rewrites a short username", () => {
  assert.equal(resolveAuthIdentifier("test", "production"), "test");
  assert.equal(resolveAuthIdentifier("lehrer1", "production"), "lehrer1");
});

test("short aliases are deliberately narrow", () => {
  assert.equal(normalizeShortAlias("test"), "test");
  assert.equal(normalizeShortAlias(" Lehrer-1 "), "lehrer-1");
  assert.equal(normalizeShortAlias("nicht erlaubt"), "");
  assert.equal(normalizeShortAlias("mail@example.com"), "");
  assert.equal(normalizeShortAlias("_start"), "");
});

test("startup installs staging alias handling before app auth listeners load", () => {
  const source = fs.readFileSync("startup.js", "utf8");
  const installAt = source.indexOf("installStagingShortLogin();");
  const appAt = source.indexOf('await import("./app.js');
  assert.ok(installAt >= 0, "short-login install is missing");
  assert.ok(appAt >= 0, "app import is missing");
  assert.ok(installAt < appAt, "short-login capture listener must be installed before app auth handlers");
});

test("source login markup remains email-native; only staging runtime relaxes it", () => {
  const html = fs.readFileSync("index.html", "utf8");
  assert.match(html, /id="loginEmail" type="email"/);
  assert.match(html, /id="registerEmail" type="email"/);
  const productionConfig = fs.readFileSync("firebase-config.production.js", "utf8");
  assert.match(productionConfig, /appEnvironment\s*=\s*["']production["']/);
});
