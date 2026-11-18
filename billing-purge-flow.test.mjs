import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const source=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8'),start=source.indexOf('async function permanentlyDeleteQuiz('),end=source.indexOf('\nasync function openTrash(',start);
test('the real purge checks audio cleanup before irreversible child deletion and clears both private audio kinds',async()=>{
 const deleted=[],payloads=[];let blocked=true;
 const c=vm.createContext({state:{quizzes:[{id:'TRASH001',title:'Trash'}],adminQuizzes:[]},confirmPermanentDelete:async()=>true,db:{},collection:(_db,...path)=>path.join('/'),doc:(_db,...path)=>path.join('/'),
 getDocs:async path=>({docs:[{ref:path+'/child'}]}),deleteDoc:async ref=>deleted.push(ref),aiApi:{syncQuestionAudioDrafts:async data=>{payloads.push(data);if(blocked)throw Error('Synthetic unavailable cleanup');}},toast(){},console:{error(){}},openTrash:async()=>{}});
 vm.runInContext(source.slice(start,end),c);await c.permanentlyDeleteQuiz('TRASH001');assert.equal(deleted.length,0,'failed preflight must not already destroy questions/results');
 blocked=false;await c.permanentlyDeleteQuiz('TRASH001');assert.equal(payloads.at(-1).drafts.length,0);assert.equal(payloads.at(-1).solutionDrafts.length,0);assert.equal(deleted.at(-1),'quizzes/TRASH001');
});
