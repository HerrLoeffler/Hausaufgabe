import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
function setup({host=true,fail=false,state}={}){
 const html=readFileSync(new URL('../inline/gradecrew-central.html',import.meta.url),'utf8');
 const handlers={},calls=[],saves=[];
 const nodes=Object.fromEntries([...html.matchAll(/\bid="([^"]+)"/g)].map(([,id])=>[id,{value:'',disabled:false,innerHTML:'',textContent:'',addEventListener:(ev,fn)=>handlers[id+':'+ev]=fn,setAttribute(){}}]));
 for(const id of ['gcc-data','gcc-results'])nodes[id].textContent=html.match(new RegExp('<script[^>]*id="'+id+'"[^>]*>([\\s\\S]*?)<\\/script>'))[1];
 nodes.gcc.querySelector=s=>['#gcc-data','#gcc-results'].includes(s)?null:nodes[s.slice(1)];
 nodes.gcc.querySelectorAll=()=>[];
 const api={widgetState:state,setWidgetState:async s=>saves.push(s)};
 if(host)api.sendFollowUpMessage=async p=>{calls.push(p);if(fail)throw Error('uncertain');};
 const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
 vm.runInNewContext(script,{document:{getElementById:id=>nodes[id]},window:{openai:api},crypto:{randomUUID:()=> 'test-id'},URL,Date,Promise});
 return {nodes,calls,saves,submit:()=>handlers['gcc-form:submit']({preventDefault(){}}),input:(id,value)=>{nodes[id].value=value;handlers[id+':input']({target:{value}});},click:dataset=>handlers['gcc:click']({target:{closest:()=>({dataset})}})};
}
test('renders real urgent tasks on load and search filters all tasks',()=>{const h=setup();assert.match(h.nodes['gcc-summary'].innerHTML,/50/);assert.match(h.nodes['gcc-list'].innerHTML,/Tutorial/);assert.equal(h.calls.length,0);h.click({focus:'all'});h.input('gcc-search','GC-SECURITY-01');assert.match(h.nodes['gcc-count'].textContent,/1 Treffer/);assert.match(h.nodes['gcc-list'].innerHTML,/30-Teilnehmer/);});
test('switching tasks preserves drafts; explicit submit sends once',async()=>{const h=setup();h.input('gcc-message','Mein Auftrag');h.click({task:'GC-SECURITY-01'});h.input('gcc-message','Fehler prüfen');h.click({task:'GC-TUTORIAL-01'});assert.equal(h.nodes['gcc-message'].value,'Mein Auftrag');await h.submit();await h.submit();assert.equal(h.calls.length,1);assert.match(h.calls[0].prompt,/Mein Auftrag/);assert.equal(h.nodes['gcc-send'].disabled,true);});
test('missing host sends nothing; ambiguous response stays locked after restoration',async()=>{const h=setup({host:false});h.input('gcc-message','Prüfen');await h.submit();assert.equal(h.calls.length,0);const u=setup({fail:true});u.input('gcc-message','Prüfen');await u.submit();await u.submit();assert.equal(u.calls.length,1);const restored=setup({state:u.saves.at(-1)});assert.equal(restored.nodes['gcc-send'].disabled,true);assert.equal(restored.calls.length,0);});
