"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
let validate, plan;
try { ({ validateAction: validate, planAction: plan } = require("../lib/admin-account-actions")); } catch (_) { validate = () => ({targets:[]}); plan = () => ({allowed:true}); }
const admin = {id:"a",role:"admin",status:"active"};
const teacher = {id:"t",role:"teacher",status:"active"};
test("bounded requests reject empty, duplicate, oversized and path-like identities", () => {
  for (const targets of [[], ["t","t"], Array.from({length:21},(_,i)=>`u${i}`), ["users/x"]]) assert.throws(()=>validate({action:"delete",targets}), {code:"invalid-argument"});
});
test("only approved role/status/archive actions and values are accepted", () => {
  for(const request of [{action:"wipe",targets:["t"]},{action:"role",value:"owner",targets:["t"]},{action:"archive",value:"true",targets:["t"]}]) assert.throws(()=>validate(request),{code:"invalid-argument"});
});
test("self deletion, demotion and suspension are rejected", () => {
  for(const action of ["delete","role","status"]) assert.equal(plan(admin,[admin,teacher],{action,value:action==="role"?"teacher":"suspended"},"a").code,"self-protected");
});
test("a bulk action cannot remove every active administrator", () => {
  const b={...admin,id:"b"};
  assert.equal(plan(b,[admin,b],{action:"role",value:"teacher"},"caller",["a","b"]).code,"last-admin");
});
test("test-account promotion and archived account mutation retain restrictions", () => {
  assert.equal(plan({...teacher,isTestAccount:true},[admin],{action:"role",value:"admin"},"a").code,"test-account");
  assert.equal(plan({...teacher,isTestAccountArchived:true},[admin],{action:"status",value:"active"},"a").code,"archived-account");
});
