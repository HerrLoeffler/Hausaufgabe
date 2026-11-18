"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const { initializeApp, deleteApp } = require("firebase-admin/app");
const { enabledFor, getRuntime } = require("../lib/billing/runtime");
test("an unrelated legacy test project is unaffected by billing runtime deployment checks", async () => {
  const app = initializeApp({projectId:"demo-existing-account-tests"});
  const prior = process.env.GCLOUD_PROJECT;
  process.env.GCLOUD_PROJECT = "demo-existing-security-tests";
  try {
    assert.equal(await enabledFor("teacher"), false);
    assert.throws(() => getRuntime(), error => error.code === "failed-precondition");
    process.env.GCLOUD_PROJECT = "gradecrew-staging-2026";
    await assert.rejects(enabledFor("teacher"), error => error.code === "failed-precondition");
  } finally {
    if (prior === undefined) delete process.env.GCLOUD_PROJECT; else process.env.GCLOUD_PROJECT = prior;
    await deleteApp(app);
  }
});
