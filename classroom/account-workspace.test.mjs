import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {JSDOM}=require('../tools/ui/node_modules/jsdom');
import {installAccountWorkspace} from './account-workspace.mjs';
import {renderPreviewDocument} from '../tools/classroom-preview/server.mjs';

test('default local page keeps the real SDK and authentication; only explicit demo maps the SDK',()=>{
 const html='<html><head></head><body><form id="loginForm"></form></body></html>';
 const live=renderPreviewDocument(html);
 assert.doesNotMatch(live,/demo-sdk|importmap|__GRADECREW_CLASSROOM_PREVIEW__/);
 assert.match(live,/__GRADECREW_ACCOUNT_WORKSPACE__/);
 assert.match(live,/id="loginForm"/);
 const demo=renderPreviewDocument(html,{demo:true});
 assert.match(demo,/demo-sdk/);assert.match(demo,/importmap/);
 assert.doesNotMatch(demo,/__GRADECREW_ACCOUNT_WORKSPACE__/);
});

test('account sidebar preserves original login and tests and derives classes only from the actual account',()=>{
 const dom=new JSDOM(fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),{url:'http://127.0.0.1:8782/'}),doc=dom.window.document;
 let session=null,tests=[],listener,opened,visible='authView';
 const originalForm=doc.getElementById('loginForm'),dashboard=doc.getElementById('dashboardView');
 const port={getSession:()=>session,listTests:()=>tests,currentView:()=>visible,subscribe(fn){listener=fn;return()=>{};},registerView(){},showView(id){visible=id;doc.querySelectorAll('.view').forEach(v=>v.classList.toggle('hidden',v.id!==id));},showTests(){this.showView('dashboardView');listener();},openQuiz(id){opened=id;},openResults(){}};
 const shell=installAccountWorkspace({document:doc,port});
 assert.equal(doc.getElementById('loginForm'),originalForm);
 assert.equal(doc.querySelector('#accountWorkspaceNav').classList.contains('hidden'),true);
 assert.equal(doc.querySelector('.classroomLocalLogin'),null);
 session={uid:'existing-teacher',displayName:'Bestehender Account'};tests=[{id:'REAL-QUIZ',title:'Mein vorhandener Test',grade:'9b',subject:'Technik'}];visible='dashboardView';listener();
 doc.querySelector('[data-account-nav=tests]').click();assert.equal(doc.getElementById('dashboardView'),dashboard);
 doc.querySelector('[data-account-nav=classes]').click();
 assert.match(doc.getElementById('accountClassesView').textContent,/9b/);
 doc.querySelector('[data-account-class]').click();
 assert.match(doc.getElementById('accountClassesView').textContent,/Mein vorhandener Test/);
 doc.querySelector('[data-account-edit]').click();assert.equal(opened,'REAL-QUIZ');
 doc.querySelector('[data-account-nav=pupils]').click();
 assert.doesNotMatch(doc.getElementById('accountPupilsView').textContent,/Fuchs|Otter|Toni/);
 session={uid:'other-teacher',displayName:'Anderer Account'};tests=[{id:'OTHER-QUIZ',title:'Anderer Test',grade:'5a',subject:'Deutsch'}];listener();
 doc.querySelector('[data-account-nav=classes]').click();
 assert.match(doc.getElementById('accountClassesView').textContent,/5a/);
 assert.doesNotMatch(doc.getElementById('accountClassesView').textContent,/9b|Mein vorhandener Test/);
 session=null;tests=[];visible='authView';listener();
 assert.equal(doc.querySelector('#accountWorkspaceNav').classList.contains('hidden'),true);
 assert.doesNotMatch(doc.getElementById('accountClassesView').textContent,/Mein vorhandener Test/);
 shell.destroy();dom.window.close();
});
