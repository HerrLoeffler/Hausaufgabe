import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const run=(...args)=>spawnSync(process.execPath,['tools/deploy-release.mjs',...args],{encoding:'utf8'});
test('staging deploy rejects the old staging project before running Firebase',()=>{
 const r=run('--environment','staging','--project','hausaufgabe-staging','--dry-run');
 assert.notEqual(r.status,0);assert.match(r.stderr,/Falsches Deploy-Ziel/);
});
test('live deploy requires explicit confirmation of the physical project',()=>{
 const r=run('--environment','production','--project','hausaufgabe-staging','--dry-run');
 assert.notEqual(r.status,0);assert.match(r.stderr,/confirm-project/);
});
test('valid dry runs return the exact Firebase target without publishing',()=>{
 for(const [env,project] of [['staging','gradecrew-staging-2026'],['production','hausaufgabe-staging']]){
  const r=run('--environment',env,'--project',project,'--confirm-project',project,'--dry-run');
  assert.equal(r.status,0,r.stderr);const data=JSON.parse(r.stdout);
  assert.equal(data.projectId,project);assert.equal(data.environment,env);assert.equal(data.dryRun,true);
 }
});
test('legacy, unknown scopes and misspelled flags cannot publish',()=>{
 for(const args of [['--environment','legacy'],['--environment','staging','--project','gradecrew-staging-2026','--only','all'],['--environment','staging','--project','gradecrew-staging-2026','--dry-rnu']])assert.notEqual(run(...args).status,0);
});
test('Live AI deployment is bounded to the two changed school functions',()=>{
 const args=['--environment','production','--project','hausaufgabe-staging','--confirm-project','hausaufgabe-staging','--dry-run'];
 const broad=run(...args,'--only','functions:ai');
 assert.notEqual(broad.status,0);assert.match(broad.stderr,/Einzelfunktionen/);
 const scoped=run(...args,'--only','functions:ai:reviewMode,functions:ai:recordCrewTelemetry');
 assert.equal(scoped.status,0,scoped.stderr);
 assert.equal(JSON.parse(scoped.stdout).only,'functions:ai:reviewMode,functions:ai:recordCrewTelemetry');
 for(const scope of ['functions:ai:reviewMode,functions:ai:generateTest','functions:ai:reviewMode,functions:assessment','functions:ai:recordCrewTelemetry,functions:ai:reviewMode,functions:ai:deleteAccount'])assert.notEqual(run(...args,'--only',scope).status,0);
});
test('Analytics release is exactly scoped and preserves all unknown functions',()=>{
 const scope='functions:ai:crewAssistant,functions:ai:recordCrewTelemetry,functions:ai:recordTeacherTelemetry,functions:ai:cleanupCrewTelemetry,functions:ai:retryTeacherAnalytics,functions:ai:teacherQuizAnalytics,functions:ai:teacherJobAnalytics,functions:ai:teacherUsageAnalytics,functions:ai:teacherSubmissionAnalytics';
 const args=['--environment','staging','--project','gradecrew-staging-2026','--dry-run'];
 assert.equal(run(...args,'--only',scope).status,0);
 assert.notEqual(run(...args,'--only',scope+',functions:ai:generateTest').status,0);
});
