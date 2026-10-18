import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getEnvironment,assertDeploymentTarget} from './environments.mjs';

test('live preserves the exact existing project, canonical URL and data region',()=>{
 const env=getEnvironment('production');
 assert.equal(env.projectId,'hausaufgabe-staging');
 assert.equal(env.origin,'https://hausaufgabe-staging.web.app');
 assert.equal(env.firestoreLocation,'eur3');
});
test('staging has a separate project and no live or legacy fallback',()=>{
 const env=getEnvironment('staging');
 assert.equal(env.projectId,'gradecrew-staging-2026');
 assert.equal(env.origin,'https://gradecrew-staging-2026.web.app');
 assertDeploymentTarget('staging','gradecrew-staging-2026');
 for(const wrong of ['hausaufgabe-staging','hausaufgabe-40294','']) assert.throws(()=>assertDeploymentTarget('staging',wrong));
});
test('production requires its exact project; unknown and legacy environments cannot deploy',()=>{
 assertDeploymentTarget('production','hausaufgabe-staging');
 for(const name of ['legacy','preview','',undefined]) assert.throws(()=>getEnvironment(name));
 assert.throws(()=>assertDeploymentTarget('production','gradecrew-staging-2026'));
 const env=getEnvironment('production');
 assert.throws(()=>{env.projectId='wrong';});
});
