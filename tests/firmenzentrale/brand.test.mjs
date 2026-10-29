import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
test('cockpit uses exact canonical GradeCrew logo bytes from product commit750212e7',()=>{
 for(const [file,expected]of [['brand-primary-v1.svg','c4c3db88b82bdd1de08fd8a80389ba72d0b28702'],['brand-icon-v1.svg','83c235b4cbac1d348c530969a15c252255b52ee6']]){
 const bytes=readFileSync(new URL('../../assets/gradecrew/'+file,import.meta.url));
 const actual=createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');assert.equal(actual,expected,file);
 }
});
