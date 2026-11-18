import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {JSDOM}=createRequire(new URL('./tools/ui/package.json',import.meta.url))('jsdom');
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
const record={id:'offer-1',name:'Jahresaktion',title:'20 % fürs erste Jahr',planCode:'personal-yearly',audience:'public',discountType:'percent',percentOff:20,fixedBasis:'invoice',duration:'once',startsOn:'2026-11-18',endsOn:'2026-12-31',firstTimeOnly:true,reason:'Kampagne',status:'draft'};
const labels={'person-a':'Anna Lehrkraft','person-b':'Ben Lehrkraft',a:'Amelie Lehrkraft',b:'Bernd Lehrkraft','school-a':'Testschule'};
async function pick(root,purpose,ids){const host=root.querySelector(`[data-target-purpose=${purpose}]`);assert.ok(host);for(const remove of host.querySelectorAll('[data-action=remove-target]'))remove.click();const input=host.querySelector('input');input.value='Test';input.dispatchEvent(new input.ownerDocument.defaultView.Event('input'));host.querySelector('[data-action=search-targets]').click();await tick();for(const id of ids){const choose=[...host.querySelectorAll('[data-action=select-target]')].find(b=>b.textContent===labels[id]);assert.ok(choose,`missing friendly search result ${id}`);choose.click();}}
async function setup(handler=async()=>({offers:[]})){const {mountOffersAdmin}=await import('./billing-offers-admin.mjs');const dom=new JSDOM('<main></main>'),root=dom.window.document.querySelector('main');await mountOffersAdmin(root,{canManageOffers:true,client:{request:async(action,data)=>action==='offerTargets'?{targets:Object.entries(labels).filter(([id])=>data.kind==='school'?id==='school-a':id!=='school-a').map(([id,label])=>({id,label,kind:data.kind}))}:handler(action,data)}});return{dom,root};}
function enter(root,name,value){const field=root.querySelector(`[name=${name}]`);assert.ok(field,`missing field ${name}`);if(field.type==='checkbox')field.checked=value;else field.value=value;field.dispatchEvent(new field.ownerDocument.defaultView.Event('change',{bubbles:true}));}
async function validForm(root){for(const[name,value]of Object.entries({name:'Herbst',title:'Persönliches Jahresangebot',planCode:'personal-yearly',audience:'accounts',discountType:'percent',percentOff:'20',startsOn:'2026-11-18',endsOn:'2026-12-31',duration:'months',durationMonths:'3',reason:'Genehmigte Herbstaktion'}))enter(root,name,value);await pick(root,'offer',['person-a','person-b']);}
test('offer form sends the exact contract with calendar dates, explicit targets and duration',async()=>{
 const sent=[];const{root}=await setup(async(action,data)=>{sent.push({action,data});return action==='listOffers'?{offers:[]}:{offer:{...record,...data.offer}};});await await validForm(root);root.querySelector('[data-action=save-offer]').click();await tick();
 const saved=sent.find(call=>call.action==='saveOffer');assert.ok(saved);assert.deepEqual(saved.data.offer,{name:'Herbst',title:'Persönliches Jahresangebot',planCode:'personal-yearly',audience:'accounts',targetIds:['person-a','person-b'],discountType:'percent',percentOff:20,fixedBasis:'invoice',startsOn:'2026-11-18',endsOn:'2026-12-31',duration:'months',durationMonths:3,firstTimeOnly:false,reason:'Genehmigte Herbstaktion'});assert.ok(saved.data.requestId);assert.match(root.textContent,/Europe\/Berlin/);assert.match(root.textContent,/Entwurf gespeichert/);
});
test('fixed school discount cannot be saved without choosing invoice or seat basis',async()=>{
 const sent=[];const{root}=await setup(async(action,data)=>{sent.push({action,data});return action==='listOffers'?{offers:[]}:{offer:{...record,...data.offer}};});await await validForm(root);enter(root,'planCode','school-yearly');await pick(root,'offer',['school-a']);enter(root,'discountType','fixed');enter(root,'amountOffMinor','10');root.querySelector('[data-action=save-offer]').click();await tick();assert.equal(sent.some(call=>call.action==='saveOffer'),false);
 enter(root,'fixedBasis','seat');root.querySelector('[data-action=save-offer]').click();await tick();const offer=sent.find(call=>call.action==='saveOffer').data.offer;assert.equal(offer.amountOffMinor,1000);assert.equal(offer.fixedBasis,'seat');assert.equal(offer.percentOff,undefined);
});
test('code audience stays explicit and sync failure is never reported as an active offer',async()=>{
 const{root}=await setup(async(action,data)=>action==='listOffers'?{offers:[record]}:{offer:{...record,status:'sync_error'}});root.querySelector('[data-action=publish-offer]').click();await tick();assert.match(root.textContent,/Abgleich fehlgeschlagen/);assert.doesNotMatch(root.textContent,/Angebot veröffentlicht/);assert.equal(root.querySelector('[data-action=publish-offer]'),null);
 await validForm(root);enter(root,'audience','code');const code=root.querySelector('[name=code]');assert.equal(code.required,true);assert.equal(root.querySelector('[data-target-purpose=offer]').hidden,false);assert.equal(root.querySelector('[name=targetIds]'),null);
});
test('existing subscriptions require an authoritative preview and report partial application',async()=>{
 const calls=[];const preview={id:'preview-1',count:2,expiresAtMs:Date.now()+300000,subscriptions:[{personId:'a',planCode:'personal-yearly',baseAmountMinor:12000,totalMinor:9600,effectiveAtMs:Date.UTC(2027,0,1),discountEndsAtMs:Date.UTC(2027,3,1)},{personId:'b',planCode:'personal-yearly',baseAmountMinor:12000,totalMinor:9600,effectiveAtMs:Date.UTC(2027,0,1)}]};
 const{root}=await setup(async(action,data)=>{calls.push({action,data});if(action==='listOffers')return{offers:[{...record,status:'active'}]};if(action==='previewExistingOffer')return{preview};return{status:'partial',count:2,completedCount:1,results:[{personId:'a',state:'scheduled'},{personId:'b',state:'failed',error:'Vertrag geändert'}]};});
 enter(root,'existingReason','Genehmigter Bestandsrabatt');await pick(root,'existing',['a','b']);root.querySelector('[data-action=preview-existing-offer]').click();await tick();assert.match(root.textContent,/2 Abos/);assert.match(root.textContent,/96/);assert.match(root.textContent,/120/);const apply=root.querySelector('[data-action=apply-existing-offer]');assert.ok(apply);apply.click();await tick();assert.deepEqual(calls.find(c=>c.action==='applyExistingOffer').data.previewId,'preview-1');assert.match(root.textContent,/1 von 2/);assert.match(root.textContent,/Vertrag geändert/);
});
test('changing the selected existing accounts invalidates an earlier preview',async()=>{
 const{root}=await setup(async action=>action==='listOffers'?{offers:[{...record,status:'active'}]}:{preview:{id:'p',count:1,expiresAtMs:Date.now()+300000,subscriptions:[]}});enter(root,'existingReason','Genehmigter Bestandsrabatt');await pick(root,'existing',['a']);root.querySelector('[data-action=preview-existing-offer]').click();await tick();assert.ok(root.querySelector('[data-action=apply-existing-offer]'));await pick(root,'existing',['b']);assert.equal(root.querySelector('[data-action=apply-existing-offer]'),null);
});
test('direct management mounting without the server flag never reads or writes offers',async()=>{
 const{mountOffersAdmin}=await import('./billing-offers-admin.mjs');let calls=0;const dom=new JSDOM('<main></main>');await mountOffersAdmin(dom.window.document.querySelector('main'),{canManageOffers:false,client:{request:async()=>{calls++;}}});assert.equal(calls,0);assert.equal(dom.window.document.querySelector('form'),null);
});

test('code offers may explicitly restrict eligible account IDs without making them public',async()=>{
 const sent=[];const{root}=await setup(async(action,data)=>{sent.push({action,data});return action==='listOffers'?{offers:[]}:{offer:{...record,...data.offer}};});await await validForm(root);enter(root,'audience','code');enter(root,'code','HERBST');await pick(root,'offer',['person-a']);assert.equal(root.querySelector('[data-target-purpose=offer]').hidden,false);root.querySelector('[data-action=save-offer]').click();await tick();assert.deepEqual(sent.find(call=>call.action==='saveOffer').data.offer.targetIds,['person-a']);
});
test('retrying an uncertain publication reuses its operation ID',async()=>{
 const calls=[];const{root}=await setup(async(action,data)=>{calls.push({action,data});if(action==='listOffers')return{offers:[record]};throw new Error('Antwort verloren');});root.querySelector('[data-action=publish-offer]').click();await tick();root.querySelector('[data-action=publish-offer]').click();await tick();const publishes=calls.filter(call=>call.action==='publishOffer');assert.equal(publishes.length,2);assert.equal(publishes[0].data.requestId,publishes[1].data.requestId);
});

test('removing an existing discount is separate, reasoned and requires a dated price preview',async()=>{
 const calls=[];const{root}=await setup(async(action,data)=>{calls.push({action,data});if(action==='listOffers')return{offers:[]};if(action==='previewExistingOffer')return{preview:{id:'remove-preview',count:1,expiresAtMs:Date.now()+300000,subscriptions:[{personId:'a',planCode:'personal-yearly',baseAmountMinor:12000,totalMinor:12000,effectiveAtMs:Date.UTC(2027,0,1),discountEndsAtMs:Date.UTC(2027,0,1)}]}};return{status:'scheduled',count:1,completedCount:1,results:[{personId:'a',state:'scheduled'}]};});
 const section=root.querySelector('[data-view=remove-existing-discount]');assert.ok(section,'removal needs its own explicit section');await pick(section,'existing',['a']);enter(section,'existingReason','Vereinbarte Aktion endet');section.querySelector('[data-action=preview-existing-offer]').click();await tick();assert.equal(calls.find(call=>call.action==='previewExistingOffer').data.offerId,null);assert.match(section.textContent,/120/);section.querySelector('[data-action=apply-existing-offer]').click();await tick();assert.equal(calls.find(call=>call.action==='applyExistingOffer').data.reason,'Vereinbarte Aktion endet');assert.equal(calls.some(call=>call.action==='endOffer'),false);
});
test('changing an amendment reason invalidates the old contractual preview',async()=>{
 const{root}=await setup(async action=>action==='listOffers'?{offers:[{...record,status:'active'}]}:{preview:{id:'p',count:1,expiresAtMs:Date.now()+300000,subscriptions:[]}});await pick(root,'existing',['a']);enter(root,'existingReason','Erster Grund');root.querySelector('[data-action=preview-existing-offer]').click();await tick();assert.ok(root.querySelector('[data-action=apply-existing-offer]'));enter(root,'existingReason','Geänderter Grund');assert.equal(root.querySelector('[data-action=apply-existing-offer]'),null);
});
test('sync failures can explicitly resume publication but stay unavailable until server status is active',async()=>{
 const calls=[];let count=0;const{root}=await setup(async(action,data)=>{calls.push({action,data});if(action==='listOffers')return{offers:[{...record,status:'sync_error'}]};return{offer:{...record,status:++count===1?'syncing':'active'}};});assert.match(root.textContent,/nicht kaufbar/);root.querySelector('[data-action=retry-offer-sync]').click();await tick();assert.match(root.textContent,/noch nicht kaufbar/);assert.doesNotMatch(root.textContent,/Angebot veröffentlicht/);root.querySelector('[data-action=retry-offer-sync]').click();await tick();assert.match(root.textContent,/Angebot veröffentlicht und vom Zahlungsdienst bestätigt/);const requests=calls.filter(call=>call.action==='publishOffer');assert.equal(requests.length,2);assert.equal(requests[0].data.requestId,requests[1].data.requestId);
});

test('changing offer audience or switching between personal and school plans clears prior selected people',async()=>{
 const{root}=await setup();await validForm(root);assert.match(root.querySelector('[data-target-purpose=offer]').textContent,/Anna Lehrkraft/);enter(root,'audience','code');assert.equal(root.querySelector('[data-target-purpose=offer] [data-action=remove-target]'),null);await pick(root,'offer',['person-a']);enter(root,'planCode','school-yearly');assert.equal(root.querySelector('[data-target-purpose=offer] [data-action=remove-target]'),null);assert.match(root.querySelector('[data-target-purpose=offer]').textContent,/Schule suchen/);
});
test('private offer rows and copied selections never display raw identifiers',async()=>{
 const{root}=await setup(async()=>({offers:[{...record,audience:'accounts',targetIds:['opaque-private-uid']}]}));assert.doesNotMatch(root.textContent,/opaque-private-uid|Konto-IDs|Schul-IDs/);assert.match(root.textContent,/1 ausgewählt/);root.querySelector('[data-action=copy-offer]').click();assert.match(root.querySelector('[data-target-purpose=offer]').textContent,/Ausgewähltes Konto/);assert.doesNotMatch(root.innerHTML,/opaque-private-uid/);
});

test('pending amendments keep the original confirmation identity and retry beyond preview expiry',async()=>{
 const calls=[],p={id:'pending-preview',count:1,expiresAtMs:Date.now()+300000,subscriptions:[]};let retries=0;
 const{root}=await setup(async(action,data)=>{calls.push({action,data});if(action==='listOffers')return{offers:[{...record,status:'active'}]};if(action==='previewExistingOffer')return{preview:p};return{status:++retries===1?'pending':'scheduled',count:1,completedCount:retries===1?0:1,results:[]};});
 enter(root,'existingReason','Bewusst vereinbart');await pick(root,'existing',['a']);root.querySelector('[data-action=preview-existing-offer]').click();await tick();root.querySelector('[data-action=apply-existing-offer]').click();await tick();
 const retry=root.querySelector('[data-action=retry-existing-offer]');assert.ok(retry);p.expiresAtMs=Date.now()-1;retry.click();await tick();
 const applies=calls.filter(c=>c.action==='applyExistingOffer');assert.equal(applies.length,2);assert.deepEqual(applies[1].data,applies[0].data);
});

test('reopening management resumes a saved pending application using its original server identity',async()=>{
 const calls=[];const pending={previewId:'saved-preview',requestId:'saved-request',reason:'Ursprünglich bestätigt',count:2};let done=false;
 const{root}=await setup(async(action,data)=>{calls.push({action,data});if(action==='listOffers')return{offers:[],pendingApplications:done?[]:[pending]};done=true;return{status:'scheduled',count:2,completedCount:2,results:[]};});
 root.querySelector('[data-action=resume-existing-offer]').click();await tick();assert.deepEqual(calls.find(c=>c.action==='applyExistingOffer').data,{previewId:pending.previewId,requestId:pending.requestId,reason:pending.reason});assert.equal(root.querySelector('[data-action=resume-existing-offer]'),null);
});
