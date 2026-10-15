import test from 'node:test';import assert from 'node:assert/strict';
import * as sdk from './demo-sdk.mjs';
test('all remote mutation and query boundaries fail closed',async()=>{for(const name of ['getDoc','getDocs','setDoc','updateDoc','deleteDoc','createUserWithEmailAndPassword','signInWithEmailAndPassword','uploadBytesResumable'])assert.throws(()=>sdk[name](),/gesperrt/);await assert.rejects(sdk.httpsCallable({},'anything')({}),/gesperrt/);assert.equal(sdk.getAuth().currentUser,null);});
