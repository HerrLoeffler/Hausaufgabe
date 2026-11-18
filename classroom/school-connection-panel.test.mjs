import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const {JSDOM}=createRequire(new URL('../tools/ui/package.json',import.meta.url))('jsdom');const tick=()=>new Promise(r=>setTimeout(r,0));
const fixture=()=>{const dom=new JSDOM('<main></main>');return{dom,host:dom.window.document.querySelector('main')};};
test('binding requires explicit school and confirmation and preserves the existing physical namespace',async()=>{
 const {mountSchoolConnectionPanel}=await import('./school-connection-panel.mjs');const {dom,host}=fixture(),calls=[],changed=[];
 mountSchoolConnectionPanel({host,workspace:{school:{id:'physical',name:'Vorhanden'},role:'admin',classes:[{id:'a'}],availableBillingSchools:[{id:'canon',name:'Kanonische Schule',canManage:true}]},api:{teacher:async(command,payload)=>{calls.push({command,payload});return{schoolId:'physical'};}},onSchoolChange:async id=>changed.push(id)});
 const form=host.querySelector('form'),select=host.querySelector('select');select.value='canon';form.dispatchEvent(new dom.window.Event('submit',{cancelable:true}));await tick();assert.equal(calls.length,0);
 host.querySelector('[name=confirmSchoolConnection]').checked=true;form.dispatchEvent(new dom.window.Event('submit',{cancelable:true}));await tick();assert.deepEqual(calls[0],{command:'connectSchool',payload:{billingSchoolId:'canon',useExistingSchool:true,confirm:true}});assert.deepEqual(changed,['physical']);
});
test('teacher class choice preserves selected hidden search results and saves only class identifiers',async()=>{
 const {mountSchoolConnectionPanel}=await import('./school-connection-panel.mjs');const {dom,host}=fixture(),calls=[];
 mountSchoolConnectionPanel({host,workspace:{school:{id:'physical',canonicalSchoolId:'canon'},role:'teacher',classCatalog:[{id:'a',name:'8a',year:'2026/27',selected:true},{id:'b',name:'9b',year:'2026/27',selected:false}]},api:{teacher:async(command,payload)=>calls.push({command,payload})},onClassesChanged:async()=>{}});
 const search=host.querySelector('[type=search]');search.value='9b';search.dispatchEvent(new dom.window.Event('input'));host.querySelector('[value=b]').checked=true;host.querySelector('form').dispatchEvent(new dom.window.Event('submit',{cancelable:true}));await tick();assert.deepEqual(calls[0],{command:'setTeacherClasses',payload:{classIds:['a','b']}});
});
test('ordinary members cannot bind a school and school switching remains explicit',async()=>{
 const {mountSchoolConnectionPanel}=await import('./school-connection-panel.mjs');const {dom,host}=fixture(),changed=[];
 mountSchoolConnectionPanel({host,workspace:{school:null,schools:[{id:'a',name:'Schule A'},{id:'b',name:'Schule B'}],availableBillingSchools:[{id:'c',name:'Noch nicht verbunden',canManage:false}]},api:{teacher:async()=>{throw Error('Forbidden');}},onSchoolChange:async id=>changed.push(id)});
 assert.equal(host.querySelector('[name=confirmSchoolConnection]'),null);const select=host.querySelector('[name=currentSchool]');select.value='b';host.querySelector('form').dispatchEvent(new dom.window.Event('submit',{cancelable:true}));await tick();assert.deepEqual(changed,['b']);
});
