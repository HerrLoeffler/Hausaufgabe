import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {JSDOM}=require('../tools/ui/node_modules/jsdom');
import {installClassroom} from './controller.mjs';
test('classroom extends the actual app shell, preserves editor and uses three class tabs',()=>{
 const dom=new JSDOM(fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),{url:'http://127.0.0.1:8782/'});const doc=dom.window.document;
 const port={seed(){},getQuiz(){return null;},showView(id){doc.querySelectorAll('.view').forEach(e=>e.classList.toggle('hidden',e.id!==id));},showDashboard(){this.showView('dashboardView');},listQuizzes:()=>[],setVisibleQuizzes(){},openQuiz(){},createQuiz(){},publishQuiz(){}};
 const c=installClassroom({document:doc,port});assert.ok(doc.querySelector('#editorView'));c.login();doc.querySelector('[data-nav="classes"]').click();doc.querySelector('[data-class="class-9b"]').click();assert.deepEqual([...doc.querySelectorAll('[data-class-tab]')].map(e=>e.textContent),['Übersicht','Schüler','Tests']);assert.equal(c.repository.listStudentTests('pupil-empty').length,0);c.destroy();dom.window.close();
});

test('public entry comes first; local login adds sidebar to original tests and logout restores entry',()=>{
 const dom=new JSDOM(fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),{url:'http://127.0.0.1:8782/'}),doc=dom.window.document;
 const originalLogin=doc.getElementById('loginForm'),originalDashboard=doc.getElementById('dashboardView');
 const port={seed(){},setVisibleQuizzes(){},showView(id){doc.querySelectorAll('.view').forEach(e=>e.classList.toggle('hidden',e.id!==id));},showDashboard(){this.showView('dashboardView');},listQuizzes:()=>[]};
 const c=installClassroom({document:doc,port});
 assert.equal(doc.getElementById('authView').classList.contains('hidden'),false);
 assert.equal(doc.getElementById('classroomNav').classList.contains('hidden'),true);
 assert.equal(doc.getElementById('loginForm'),originalLogin);
 c.login();
 assert.equal(doc.getElementById('dashboardView'),originalDashboard);
 assert.equal(originalDashboard.classList.contains('hidden'),false);
 assert.equal(doc.getElementById('userBar').classList.contains('hidden'),false);
 assert.equal(doc.querySelector('[data-nav=tests]').textContent,'Meine Tests');
 doc.querySelector('[data-nav=students]').click();
 assert.match(doc.getElementById('classroomView').textContent,/Fuchs 17/);
 assert.doesNotMatch(doc.getElementById('classroomView').textContent,/Eule 08|Otter 12/);
 c.logout();
 assert.equal(doc.getElementById('authView').classList.contains('hidden'),false);
 assert.equal(doc.getElementById('classroomNav').classList.contains('hidden'),true);
 assert.equal(doc.getElementById('userBar').classList.contains('hidden'),true);
 c.destroy();dom.window.close();
});
