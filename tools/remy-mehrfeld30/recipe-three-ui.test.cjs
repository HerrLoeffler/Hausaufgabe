'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {createRequire}=require('node:module');
const {JSDOM}=createRequire(path.join(__dirname,'../ui/package.json'))('jsdom');
const {build,examples,publicRecipe,scoreRecipe}=require('./recipe-three.cjs');
test('source links, pictured maze and graphical notes each produce their own full answer',()=>{
  const dom=new JSDOM('<main></main>');
  try{
    const doc=dom.window.document,host=doc.querySelector('main');
    const source=fs.readFileSync(path.join(__dirname,'recipe-view.mjs'),'utf8');
    const mount=new Function('document',source.replace('export function mountRecipe','function mountRecipe')+'\nreturn mountRecipe;')(doc);
    for(const raw of examples){
      const q=build(raw);let answer={};host.replaceChildren();
      mount(host,publicRecipe(q),next=>{answer=next;});
      if(q.recipe==='sources'){
        const columns=host.querySelectorAll('.recipe-source-grid > div');
        q.display.sources.forEach((s,i)=>{
          columns[0].querySelectorAll('button')[i].click();
          columns[1].querySelectorAll('button')[q.display.claims.findIndex(c=>c.id===q.solution[s.id])].click();
        });
        assert.equal(host.querySelectorAll('li').length,q.points*2);
      }else if(q.recipe==='maze'){
        assert.equal(host.querySelectorAll('.maze-picture span').length,50);
        [...host.querySelectorAll('.recipe-board')].forEach((el,i)=>{
          el.querySelectorAll('button')[q.solution['m'+i]==='turn'?0:1].click();
        });
      }else{
        assert.equal(host.querySelectorAll('.recipe-note-slot').length,q.display.bars.length);
        [...host.querySelectorAll('.recipe-board')].forEach((el,i)=>{
          el.querySelectorAll('button')[q.display.noteValues.indexOf(q.solution['b'+i])].click();
        });
        assert.equal(host.querySelectorAll('.recipe-note-slot svg').length,q.display.bars.length);
      }
      assert.equal(scoreRecipe(q,JSON.parse(JSON.stringify(answer))),q.points,q.recipe);
    }
  }finally{dom.window.close();}
});

test('free wish button submits the teacher text and reuses its request after an uncertain response',async()=>{
  const read=name=>fs.readFileSync(path.join(__dirname,name),'utf8');
  const dom=new JSDOM(read('index.html'),{url:'https://example.test/remy-labor/'});
  try{
    const {window}=dom,{document}=window;
    const q=build(examples[2]),quizId='wish3:fixed-test';
    const calls=[];
    const projectId='gradecrew-staging-2026';
    let init;
    const env={document,localStorage:window.localStorage,FormData:window.FormData,crypto:{randomUUID:()=> 'unique-request'},
      firebaseConfig:{projectId},initializeApp:()=>({}),getAuth:()=>({}),getFirestore:()=>({}),getFunctions:()=>({}),
      onAuthStateChanged:(_a,cb)=>{init=cb({uid:'synthetic'});},
      mountRecipe:()=>{},
      httpsCallable:()=>async data=>{
        if(data.action==='list')return {data:{tasks:data.quizId===quizId?[{...q,quizId,recipe:publicRecipe(q)}]:[],expected:data.quizId===quizId?1:30}};
        assert.equal(data.action,'generateRecipe');
        calls.push(data);
        if(calls.length===1)throw Error('Verbindung unterbrochen');
        return {data:{status:'ready',quizId}};
      }};
    new Function(...Object.keys(env),read('pilot.mjs').replace(/^import .*;$/gm,''))(...Object.values(env));
    await init;
    const form=document.getElementById('recipeWish'),wish='Ein 3/4-Takt mit einer fehlenden Note';
    form.elements.wish.value=wish;
    form.dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
    await new Promise(resolve=>setImmediate(resolve));
    const retry=document.getElementById('resumeRecipe');
    assert.equal(retry.hidden,false);
    retry.click();
    await new Promise(resolve=>setImmediate(resolve));
    assert.deepEqual(calls,[{action:'generateRecipe',requestId:'unique-request',wish},{action:'generateRecipe',requestId:'unique-request',wish}]);
    assert.equal(document.getElementById('position').textContent,'Aufgabe 1 von 1');
  }finally{dom.window.close();}
});
