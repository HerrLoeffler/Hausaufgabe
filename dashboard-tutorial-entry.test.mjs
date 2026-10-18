import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {syncDashboardTutorialEntry} from './dashboard-tutorial-entry.mjs';
const {JSDOM}=createRequire(import.meta.url)('./tools/ui/node_modules/jsdom');
const html=fs.readFileSync('index.html','utf8');
function setup(t){const dom=new JSDOM(html,{url:'https://example.test'});t.after(()=>dom.window.close());const d=dom.window.document;const b=d.createElement('button');b.id='gradecrewTourBtn';b.innerHTML='<span>Crew kennenlernen</span><small>Tutorial · ca. 6–7 Minuten</small>';d.querySelector('.dashboardActions').prepend(b);return {d,b};}

test('the same tutorial button moves before the account label and preserves its handler',t=>{
 const {d,b}=setup(t);let starts=0;b.onclick=()=>starts++;
 syncDashboardTutorialEntry(d,{enabled:true,dashboard:true,count:1});
 assert.equal(b.parentElement,d.getElementById('userBar'));assert.equal(b.nextElementSibling,d.getElementById('userLabel'));
 b.click();assert.equal(starts,1);assert.equal(d.querySelector('.gcWorkspaceCrewEntry'),null);
});
for(const [count,visible] of [[0,true],[1,true],[5,true],[6,false],[99,false]])test(`header visibility for login count ${count}`,t=>{
 const {d,b}=setup(t);syncDashboardTutorialEntry(d,{enabled:true,dashboard:true,count});assert.equal(b.hidden,!visible);
 assert.ok(d.getElementById('settingsTutorialStart'),'permanent settings replay entry exists');
 assert.equal(d.getElementById('settingsTutorialStart').disabled,false);
});
test('leaving the dashboard, signing out and switching to a later-login account hide the entry',t=>{
 const {d,b}=setup(t);
 for(const state of [{enabled:true,dashboard:false,count:1},{enabled:false,dashboard:true,count:1},{enabled:true,dashboard:true,count:6}]){syncDashboardTutorialEntry(d,state);assert.equal(b.hidden,true);}
 syncDashboardTutorialEntry(d,{enabled:true,dashboard:true,count:1});assert.equal(b.hidden,false);
});
test('settings replay reaches the actual tour after six logins, without counting a new login',async t=>{
 const {d}=setup(t),calls=[];const state={user:{uid:'a'},profile:{crewTourSignInCount:6}};
 const app=fs.readFileSync('app.js','utf8');const start=app.indexOf('async function startSettingsTutorial(');assert.ok(start>=0,'settings replay function exists');const end=app.indexOf('\nfunction openSettings()',start);
 const context=vm.createContext({state,guestTourRepo:null,crewTour:{start:()=>calls.push('tour')},loadDashboard:async()=>calls.push('dashboard')});
 vm.runInContext(app.slice(start,end),context);await vm.runInContext('startSettingsTutorial()',context);
 assert.deepEqual(calls,['dashboard','tour']);assert.equal(state.profile.crewTourSignInCount,6);
});


test('late onboarding metadata does not replace newer settings or leak to another account',async t=>{
 const {d}=setup(t);const state={user:{uid:'a'},profile:{settings:{defaultSubject:'Maths'}}};
 let resolve;const pending=new Promise(r=>{resolve=r;});const source=fs.readFileSync('app.js','utf8');
 const start=source.indexOf('async function refreshTutorialSignIn('),end=source.indexOf('\nlet authStateGeneration',start);
 const context=vm.createContext({state,recordTutorialSignIn:()=>pending,db:{},doc:()=>({}),runTransaction:()=>{},authStateGeneration:1,document:d,$:id=>d.getElementById(id),syncDashboardTutorialEntry});
 vm.runInContext(source.slice(start,end),context);const work=vm.runInContext('refreshTutorialSignIn({uid:"a"},1)',context);
 state.profile.settings.defaultSubject='English';resolve({settings:{defaultSubject:'OLD'},crewTourSignInCount:6,crewTourSignInSessions:[]});await work;
 assert.equal(state.profile.settings.defaultSubject,'English');assert.equal(state.profile.crewTourSignInCount,6);
 context.authStateGeneration=2;state.user={uid:'b'};state.profile={settings:{defaultSubject:'B'}};
 await vm.runInContext('refreshTutorialSignIn({uid:"a"},1)',context);
 assert.equal(state.profile.crewTourSignInCount,undefined);assert.equal(state.profile.settings.defaultSubject,'B');
});
