"use strict";
const {test}=require("node:test");const assert=require("node:assert/strict");
const {wilmaDeploymentProject}=require("../lib/wilma-project");
test("direct v2 deployment uses its trusted Firebase project config",()=>assert.equal(wilmaDeploymentProject({FIREBASE_CONFIG:JSON.stringify({projectId:"hausaufgabe-staging"})}),"hausaufgabe-staging"));
test("conflicting deployment projects fail closed",()=>assert.equal(wilmaDeploymentProject({GCLOUD_PROJECT:"gradecrew-staging-2026",FIREBASE_CONFIG:JSON.stringify({projectId:"hausaufgabe-staging"})}),null));
test("missing or malformed project config cannot select a fallback project",()=>{assert.equal(wilmaDeploymentProject({}),null);assert.equal(wilmaDeploymentProject({FIREBASE_CONFIG:"invalid"}),null);});
