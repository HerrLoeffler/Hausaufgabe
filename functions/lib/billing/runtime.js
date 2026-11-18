"use strict";
const { getApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const { HttpsError } = require("firebase-functions/v2/https");
const { createBillingService, BillingError } = require("./application");
const { createFirestoreBillingStore } = require("./firestore-store");

function projectId() {
  let config;
  try { config = JSON.parse(process.env.FIREBASE_CONFIG || "{}"); } catch (_) { throw new BillingError("failed-precondition", "Ungültige Projektkonfiguration."); }
  const projects = [...new Set([getApp().options.projectId, process.env.GCLOUD_PROJECT, process.env.GOOGLE_CLOUD_PROJECT, config.projectId].filter(Boolean))];
  if (projects.length !== 1) throw new BillingError("failed-precondition", "Projektkonfiguration nicht eindeutig.");
  return projects[0];
}
function supported() {
  let configured;
  try { configured = JSON.parse(process.env.FIREBASE_CONFIG || "{}").projectId; } catch (_) { configured = null; }
  const candidates = [getApp().options.projectId, process.env.GCLOUD_PROJECT, process.env.GOOGLE_CLOUD_PROJECT, configured];
  const billingCandidate = candidates.some(p => p === "gradecrew-staging-2026" || (p === "demo-gradecrew-billing" && !!process.env.FIRESTORE_EMULATOR_HOST));
  if (!billingCandidate) return false;
  const actual = projectId();
  return actual === "gradecrew-staging-2026" || (actual === "demo-gradecrew-billing" && !!process.env.FIRESTORE_EMULATOR_HOST);
}
let runtime;
let paymentRuntime;
function getRuntime() {
  if (!supported()) throw new BillingError("failed-precondition", "Zahlungstest nur in der getrennten Testumgebung.");
  if (!runtime) {
    const store = createFirestoreBillingStore(getFirestore());
    runtime = { store, service: createBillingService({ store, getIdentity: uid => getAuth().getUser(uid), projectId: projectId() }) };
  }
  return runtime;
}
function getPaymentRuntime(apiKey) {
  if (!supported()) throw new BillingError("failed-precondition", "Zahlungstest nur in der getrennten Testumgebung.");
  if (!paymentRuntime) {
    const store = getRuntime().store;
    const provider = require("./stripe-provider").createStripeProvider({ apiKey });
    paymentRuntime = { store, service: createBillingService({ store, provider, getIdentity: uid => getAuth().getUser(uid), projectId: projectId() }) };
  }
  return paymentRuntime;
}
async function enabledFor(uid) {
  if (!supported()) return false;
  const config = (await getFirestore().doc("appConfig/billingProduct").get()).data();
  return config?.enabled === true && Array.isArray(config.allowedUids) && config.allowedUids.includes(uid);
}
async function prepareJobReservation(tx, uid, jobId, expiredJobIds = []) {
  if (!await enabledFor(uid)) return undefined;
  const { service, store } = getRuntime();
  return service.prepareGenerationReservation(uid, jobId, store.unit(tx), {expiredJobIds});
}
async function prepareJobRelease(tx,uid,jobId){if(!supported())return()=>({released:false});const{service,store}=getRuntime();return service.prepareGenerationRelease(uid,jobId,store.unit(tx));}
async function reserveGeneration(uid, jobId) {
  if (!await enabledFor(uid)) return false;
  await getRuntime().service.reserveGeneration(uid, jobId);
  return true;
}
async function releaseGeneration(uid, jobId) {
  if (supported()) await getRuntime().service.releaseGeneration(uid, jobId);
}
async function requireFeature(uid, feature, scope) {
  if (await enabledFor(uid)) return getRuntime().service.requireFeature(uid, feature, scope);
  return null;
}
function firebaseError(error) {
  if (error instanceof BillingError) return new HttpsError(error.code, error.message, error.details);
  return error;
}
module.exports = { getRuntime, getPaymentRuntime, projectId, enabledFor, prepareJobReservation, prepareJobRelease, reserveGeneration, releaseGeneration, requireFeature, firebaseError };
