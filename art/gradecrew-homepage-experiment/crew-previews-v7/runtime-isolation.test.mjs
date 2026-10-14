import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as backend from './tour-runtime/firebase-local.mjs';
test('local adapter refuses authentication, database, storage and callable operations',async()=>{
 for(const name of ['createUserWithEmailAndPassword','signInWithEmailAndPassword','setDoc','getDoc','updateDoc','uploadBytesResumable'])assert.throws(()=>backend[name](),/isolated/i,name);
 await assert.rejects(backend.httpsCallable({},'paid-call')({}),/isolated/i);
});
test('anonymous auth initialization has no user and no durable session',async()=>{
 const auth=backend.getAuth();assert.equal(auth.currentUser,null);let observed='waiting';backend.onAuthStateChanged(auth,user=>{observed=user;});await Promise.resolve();assert.equal(observed,null);assert.equal(auth.currentUser,null);
});
test('original tutorial engine and in-memory repository remain byte-identical',async()=>{
 for(const f of ['gradecrew-tour.js','gradecrew-tour-v7.js','gradecrew-tour-v8.js','guest-tour-port.mjs'])assert.deepEqual(await readFile('tour-runtime/'+f),await readFile('baseline/'+f),f);
});
test('tutorial runtime has a local-only policy and imports no external SDK',async()=>{
 const app=await readFile('tour-runtime/app.js','utf8');assert.doesNotMatch(app,/https:\/\/www\.gstatic\.com\/firebasejs/);assert.match(app,/firebase-local\.mjs/);
 const html=await readFile('tour-runtime/index.html','utf8');assert.match(html,/connect-src 'self'/);assert.match(html,/form-action 'none'/);assert.doesNotMatch(html,/<script[^>]+src="https:/);
});
