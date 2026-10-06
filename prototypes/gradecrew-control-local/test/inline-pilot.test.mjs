import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function setup({pendingId,host=true,fail=false}={}){
 const html=readFileSync(new URL('../inline/gradecrew-verbindungstest.html',import.meta.url),'utf8');
 const result=JSON.parse(html.match(/<script id="gct-result" type="application\/json">([\s\S]*?)<\/script>/)[1]);
 const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
 const handlers={},calls=[],globals=[];
 const nodes=Object.fromEntries([...html.matchAll(/\bid="([^"]+)"/g)].map(([,id])=>[id,{value:'',disabled:false,textContent:'',addEventListener:(event,fn)=>{handlers[id+':'+event]=fn;}}]));
 nodes['gct-result'].textContent=JSON.stringify(result);
 nodes['gc-connection-test'].querySelector=selector=>nodes[selector.slice(1)];
 nodes['gc-connection-test'].contains=()=>false;
 const state=pendingId?{privateContent:{testId:result.testId,requestId:pendingId,requested:true,message:'old'}}:undefined;
 const api={widgetState:state,setWidgetState:async()=>{}};
 if(host)api.sendFollowUpMessage=async arg=>{calls.push(arg);if(fail)throw Error('uncertain');};
 vm.runInNewContext(script,{document:{getElementById:id=>nodes[id]},window:{openai:api,addEventListener:(event,fn)=>globals.push(fn)},crypto:{randomUUID:()=> 'new-id'},Promise,Date});
 return {nodes,calls,result,submit:()=>handlers['gct-form:submit']({preventDefault(){}})};
}

test('answered request opens a new empty composer without resending or losing answer',()=>{
 const initial=setup();
 const h=setup({pendingId:initial.result.requestId});
 assert.equal(h.nodes['gct-message'].disabled,false);
 assert.equal(h.nodes['gct-send'].disabled,false);
 assert.equal(h.nodes['gct-message'].value,'');
 assert.equal(h.nodes['gct-answer'].textContent,h.result.answer);
 assert.equal(h.calls.length,0);
});

test('a different unresolved request remains locked',async()=>{
 const h=setup({pendingId:'different-uncertain-request'});
 assert.equal(h.nodes['gct-send'].disabled,true);
 h.nodes['gct-message'].value='Do not resend';await h.submit();
 assert.equal(h.calls.length,0);
});

test('explicit new work has new request identity, kind and exact text; double submit sends once',async()=>{
 const h=setup();h.nodes['gct-message'].value='Verbessere diese Karte';
 await h.submit();await h.submit();
 assert.equal(h.calls.length,1);
 assert.match(h.calls[0].prompt,/"kind"\s*:\s*"work"/);
 assert.match(h.calls[0].prompt,/Verbessere diese Karte/);
 assert.match(h.calls[0].prompt,/new-id/);
 assert(!h.calls[0].prompt.includes(h.result.requestId));
});

test('unavailable host and empty input never send; unknown delivery never retries',async()=>{
 const absent=setup({host:false});absent.nodes['gct-message'].value='hello';await absent.submit();assert.equal(absent.calls.length,0);
 const empty=setup();await empty.submit();assert.equal(empty.calls.length,0);
 const uncertain=setup({fail:true});uncertain.nodes['gct-message'].value='hello';await uncertain.submit();await uncertain.submit();
 assert.equal(uncertain.calls.length,1);assert.equal(uncertain.nodes['gct-send'].disabled,true);
});
