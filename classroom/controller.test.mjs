import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {JSDOM}=require('../tools/ui/node_modules/jsdom');
import {installClassroom} from './controller.mjs';
test('classroom extends the actual app shell, preserves editor and uses three class tabs',()=>{
 const dom=new JSDOM(fs.readFileSync(new URL('../index.html',import.meta.url),'utf8'),{url:'http://127.0.0.1:8782/'});const doc=dom.window.document;
 const port={seed(){},getQuiz(){return null;},showView(id){doc.querySelectorAll('.view').forEach(e=>e.classList.toggle('hidden',e.id!==id));},showDashboard(){this.showView('dashboardView');},listQuizzes:()=>[],setVisibleQuizzes(){},openQuiz(){},createQuiz(){},publishQuiz(){}};
 const c=installClassroom({document:doc,port});assert.ok(doc.querySelector('#editorView'));assert.equal(doc.querySelectorAll('#classroomNav button').length,3);doc.querySelector('[data-nav="classes"]').click();doc.querySelector('[data-class="class-9b"]').click();assert.deepEqual([...doc.querySelectorAll('[data-class-tab]')].map(e=>e.textContent),['Übersicht','Schüler','Tests']);assert.equal(c.repository.listStudentTests('pupil-empty').length,0);c.destroy();dom.window.close();
});
