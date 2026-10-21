import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readTeacherFeedback} from '../plugin/teacher-feedback-reader.mjs';
const response=result=>new Response(JSON.stringify({result}),{headers:{'content-type':'application/json'}});
test('teacher feedback follows empty mixed-author pages and returns only minimal teacher notes',async()=>{
 const calls=[];
 const result=await readTeacherFeedback({token:'session-token',fetchImpl:async(url,init)=>{
  calls.push({url,init});const data=JSON.parse(init.body).data;
  assert.equal(data.action,'listTeacherFeedback');
  if(!data.cursor)return response({environment:'production',notes:[],nextCursor:'page-2'});
  assert.equal(data.cursor,'page-2');return response({environment:'production',notes:[{id:'teacher-1',authorRole:'teacher',approval:'pending',status:'open',text:'Bitte größer',email:'private@example.test',authorId:'private-uid',password:'secret'},{id:'admin',authorRole:'admin',text:'internal'}],nextCursor:null});
 }});
 assert.equal(calls.length,2);assert.equal(result.notes.length,1);assert.equal(result.notes[0].approval,'pending');assert.equal(result.truncated,false);assert.equal(result.untrustedContent,true);
 assert.ok(calls.every(x=>x.url==='https://europe-west1-hausaufgabe-staging.cloudfunctions.net/reviewMode'&&x.init.method==='POST'));
 assert.equal(/private@example|private-uid|password|session-token/.test(JSON.stringify(result)),false);
});
test('missing authentication, another environment and cyclic cursors fail closed',async()=>{
 let called=false;await assert.rejects(readTeacherFeedback({token:'',fetchImpl:async()=>{called=true;}}),/Live-Anmeldung/);assert.equal(called,false);
 await assert.rejects(readTeacherFeedback({token:'t',fetchImpl:async()=>response({environment:'staging',notes:[]})}),/Umgebung/);
 await assert.rejects(readTeacherFeedback({token:'t',fetchImpl:async()=>response({environment:'production',notes:[],nextCursor:'same'})}),/Cursor/);
 await assert.rejects(readTeacherFeedback({token:'t',fetchImpl:async()=>new Response('private server details',{status:403})}),/Berechtigung/);
});
test('bounded retrieval reports continuation instead of silently losing remaining notes',async()=>{
 let page=0;const r=await readTeacherFeedback({token:'t',maxPages:2,fetchImpl:async()=>response({environment:'production',notes:[],nextCursor:'page-'+(++page)})});
 assert.equal(r.truncated,true);assert.equal(r.nextCursor,'page-2');assert.equal(r.pages,2);
});
