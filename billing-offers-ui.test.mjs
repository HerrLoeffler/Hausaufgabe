import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {paintBillingPanel} from './billing-panel.mjs';
const {JSDOM}=createRequire(new URL('./tools/ui/package.json',import.meta.url))('jsdom');
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
const plans=[{code:'personal-monthly',interval:'month',currency:'eur',amountMinor:1500},{code:'personal-yearly',interval:'year',currency:'eur',amountMinor:12000}];
const access={tier:'trial',freeCreationsRemaining:5,trialEndsAtMs:Date.UTC(2026,11,1),plans,featureCodes:[],purchasingEnabled:true};
function setup(value=access,options={}) {const dom=new JSDOM('<main></main>',{url:'https://test.example/workspace.html'}),root=dom.window.document.querySelector('main');paintBillingPanel(root,value,options);return{dom,root};}
function quote(planCode,extra={}){return{id:'server-quote',planCode,baseAmountMinor:planCode.endsWith('yearly')?12000:1500,discountAmountMinor:0,totalMinor:planCode.endsWith('yearly')?12000:1500,expiresAtMs:Date.now()+300000,offer:null,...extra};}
function openPlans(root){root.querySelector('[data-action=show-plans]').click();}
test('trial access starts compact with plans and trial rules closed; school is loaded only when opened',async()=>{
 const calls=[];const {root}=setup(access,{client:{request:async action=>{calls.push(action);return{schools:[]};}}});
 assert.equal(root.querySelector('[data-section=access]').getAttribute('aria-pressed'),'true');
 assert.equal(root.querySelector('[data-view=plans]'),null);assert.match(root.textContent,/5 von 5/);
 assert.equal(root.querySelector('[data-trial-details]').open,false);assert.deepEqual(calls,[]);
 root.querySelector('[data-section=school]').click();await tick();assert.deepEqual(calls,['listSchools']);
 assert.equal(root.querySelector('[data-view=plans]'),null);
});
test('year selection discloses annual upfront total and savings against twelve monthly payments',async()=>{
 const {root}=setup({...access,purchasingEnabled:false});openPlans(root);
 root.querySelector('[data-plan=personal-yearly]').click();
 assert.match(root.textContent,/10\s*€/);assert.match(root.textContent,/120\s*€ jährlich im Voraus/);assert.match(root.textContent,/60\s*€ weniger/);assert.match(root.textContent,/12 × 15\s*€/);assert.match(root.textContent,/33/);
});
test('a server quote supplies the checkout ID and client code is sent only to GradeCrew',async()=>{
 const calls=[],chosen=[];const {root,dom}=setup(access,{client:{request:async(action,data)=>{calls.push({action,data});return{eligible:true,quote:quote(data.planCode,{offer:{title:'Persönliches Angebot',duration:'months',durationMonths:3,endsAtMs:Date.now()+86400000},discountAmountMinor:300,totalMinor:1200})};}},onChoose:async(...args)=>chosen.push(args)});
 openPlans(root);await tick();const code=root.querySelector('[name=offerCode]');code.value='MEINCODE';code.dispatchEvent(new dom.window.Event('input'));root.querySelector('[data-action=check-offer-code]').click();await tick();
 root.querySelector('[data-action=choose-plan]').click();await tick();assert.deepEqual(calls.at(-1),{action:'offerQuote',data:{planCode:'personal-monthly',code:'MEINCODE'}});assert.deepEqual(chosen,[['personal-monthly',{quoteId:'server-quote'}]]);
 assert.match(root.textContent,/12\s*€/);assert.match(root.textContent,/danach.*15\s*€/i);assert.match(root.textContent,/3 Monate/);assert.equal(root.textContent.includes('targetIds'),false);
});
test('switching plans discards a late quote and a conflict cannot start checkout',async()=>{
 let finish;const chosen=[];const {root}=setup(access,{client:{request:async(_,data)=>data.planCode==='personal-monthly'?new Promise(resolve=>{finish=resolve;}):{eligible:false,conflict:'Ein anderes Angebot ist bereits zugeordnet.'}},onChoose:(...args)=>chosen.push(args)});
 openPlans(root);root.querySelector('[data-plan=personal-yearly]').click();await tick();finish({eligible:true,quote:quote('personal-monthly')});await tick();
 assert.match(root.textContent,/anderes Angebot/);assert.equal(root.querySelector('[data-action=choose-plan]').disabled,true);assert.deepEqual(chosen,[]);
});
test('expired quotes fail closed at purchase and do not grant access',async()=>{
 const chosen=[];const {root}=setup(access,{client:{request:async(_,data)=>({eligible:true,quote:quote(data.planCode,{expiresAtMs:Date.now()-1})})},onChoose:(...args)=>chosen.push(args)});openPlans(root);await tick();root.querySelector('[data-action=choose-plan]').click();await tick();assert.deepEqual(chosen,[]);assert.match(root.textContent,/abgelaufen/i);
});
test('invoices have their own view and existing subscriptions cannot open another checkout',()=>{
 const {root}=setup({...access,tier:'personal_premium',payments:{hasSubscription:true,portalAvailable:true,invoices:[{invoiceNumber:'GC-001',total:1500,remaining:0,status:'paid'}]}});
 assert.equal(root.querySelector('[data-action=show-plans]'),null);assert.equal(root.querySelector('[data-view=invoices]'),null);root.querySelector('[data-section=invoices]').click();assert.ok(root.querySelector('[data-view=invoices]'));assert.match(root.textContent,/GC-001/);
});
test('only server authorized platform admin receives an offer management entry',()=>{
 for(const role of ['teacher','school_admin']){const{root}=setup({...access,role,canManageOffers:false});assert.equal(root.querySelector('[data-section=offers]'),null);}
 const{root}=setup({...access,canManageOffers:true});assert.ok(root.querySelector('[data-section=offers]'));
});
test('unmounting access while a quote is pending never appends private price data to the next view',async()=>{
 let finish;const{root}=setup(access,{client:{request:()=>new Promise(resolve=>{finish=resolve;})}});openPlans(root);root.querySelector('[data-section=invoices]').click();finish({eligible:true,quote:quote('personal-monthly',{offer:{title:'Private price title'}})});await tick();assert.doesNotMatch(root.textContent,/Private price title/);
});
test('Stripe and invitation addresses choose the correct initial account section',async()=>{
 const {billingSectionFromLocation}=await import('./billing-panel.mjs');assert.equal(billingSectionFromLocation('https://test.example/workspace.html?billing=return'),'access');assert.equal(billingSectionFromLocation('https://test.example/workspace.html?account=invoices'),'invoices');assert.equal(billingSectionFromLocation('https://test.example/workspace.html#school-invite=abc'),'school');
});
test('annual discounted quotes retain the actual upfront charge beside the monthly equivalent',async()=>{
 const{root}=setup(access,{client:{request:async(_,data)=>({quote:quote(data.planCode,{offer:{title:'Genehmigter Jahresnachlass',duration:'once'},baseAmountMinor:12000,totalMinor:9600,discountAmountMinor:2400})})}});openPlans(root);root.querySelector('[data-plan=personal-yearly]').click();await tick();assert.match(root.textContent,/8\s*€\/Monat/);assert.match(root.textContent,/96\s*€ jährlich im Voraus/);assert.match(root.textContent,/danach 120\s*€ jährlich im Voraus/i);
});
test('the tariff picker closes again and a late private quote stays unmounted',async()=>{
 let finish;const{root}=setup(access,{client:{request:()=>new Promise(resolve=>{finish=resolve;})}});openPlans(root);root.querySelector('[data-action=show-plans]').click();assert.equal(root.querySelector('[data-view=plans]'),null);finish({quote:quote('personal-monthly',{offer:{title:'Vertrauliches Angebot'}})});await tick();assert.doesNotMatch(root.textContent,/Vertrauliches Angebot/);assert.equal(root.querySelector('[data-action=show-plans]').getAttribute('aria-expanded'),'false');
});

test('an uncertain checkout can retry the same quoted order after the initial quote decision window',async()=>{
 let clock=Date.now(),chosen=0;const original=Date.now;Date.now=()=>clock;try{const{root}=setup(access,{client:{request:async(_,data)=>({quote:quote(data.planCode,{expiresAtMs:clock+1000})})},onChoose:async()=>{chosen++;throw new Error('Antwort verloren');}});openPlans(root);await tick();root.querySelector('[data-action=choose-plan]').click();await tick();clock+=2000;root.querySelector('[data-action=choose-plan]').click();await tick();assert.equal(chosen,2);}finally{Date.now=original;}
});
