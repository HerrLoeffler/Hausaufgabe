import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { createAccountController } from './admin-account-actions.mjs';

const require = createRequire(import.meta.url);
const { JSDOM } = require('./tools/ui/node_modules/jsdom');
const source = fs.readFileSync('app.js', 'utf8');
const start = source.indexOf('function teacherQuizCount(');
const end = source.indexOf('function exportAdminTeachersCsv(', start);

function setup() {
  const dom = new JSDOM('<select id="adminTeacherSort"><option value="name">Name</option><option value="registered">Registriert</option><option value="activity">Aktivität</option><option value="tests">Tests</option></select><div id="adminTeachersTable"></div>');
  const updates = [];
  const state = {
    user: { uid: 'admin' },
    adminUsers: [
      { id: 'admin', displayName: 'Admin', email: 'admin@example.test', role: 'admin', status: 'active', createdAt: 100, lastActiveAt: 300 },
      { id: 'a', displayName: 'Anna', email: 'anna@example.test', role: 'teacher', status: 'active', createdAt: 200, lastActiveAt: 100 },
      { id: 'b', displayName: 'Bernd', email: 'bernd@example.test', role: 'teacher', status: 'active', createdAt: 300, lastActiveAt: 200, isTestAccount: true }
    ],
    adminQuizzes: [{ ownerId: 'a' }, { ownerId: 'a' }, { ownerId: 'b' }]
  };
  const context = {
    document: dom.window.document,
    state, app: {}, createAccountController, CustomEvent: dom.window.CustomEvent,
    getFunctions: () => ({}),
    httpsCallable: (_functions,name) => async data => {
      updates.push({name,data});
      if(name === 'previewAdminAccountAction')return {data:{operationId:'synthetic',targets:data.targets.map(id=>({id,label:id,code:'allowed'}))}};
      return {data:{status:'complete',outcomes:[{id:'a',code:'complete'}]}};
    },
    $: id => dom.window.document.getElementById(id),
    normalize: text => String(text).toLowerCase(),
    escapeHtml: text => String(text ?? ''),
    fmtDate: value => String(value),
    toMillis: value => Number(value),
    openAdminTeacher: () => {},
    updateDoc: async (...args) => updates.push(args),
    doc: (...args) => args,
    db: {},
    serverTimestamp: () => 'now',
    writeAdminAudit: async () => {},
    loadAdminData: async () => {},
    toast: () => {},
    confirm: () => true,
    console
  };
  vm.runInNewContext(source.slice(start, end), context);
  return { dom, context, state, updates };
}

test('teacher list sorts by newest registration and by quiz count', () => {
  const { dom, context } = setup();
  const sort = dom.window.document.getElementById('adminTeacherSort');
  sort.value = 'registered';
  context.renderAdminTeachers();
  assert.deepEqual([...dom.window.document.querySelectorAll('tbody tr')].map(row => row.querySelector('strong').textContent), ['Bernd', 'Anna', 'Admin']);
  sort.value = 'tests';
  context.renderAdminTeachers();
  assert.deepEqual([...dom.window.document.querySelectorAll('tbody tr')].map(row => row.querySelector('strong').textContent), ['Anna', 'Bernd', 'Admin']);
  dom.window.close();
});

test('admin previews and confirms another regular teacher role through the server action', async () => {
  const { dom, context, updates } = setup();
  context.renderAdminTeachers();
  const select = dom.window.document.querySelector('.adminTeacherRole[data-id="a"]');
  assert.ok(select);
  select.value = 'admin';
  select.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(updates.length, 1);
  assert.equal(updates[0].name, 'previewAdminAccountAction');
  assert.deepEqual(Array.from(updates[0].data.targets), ['a']);
  assert.equal(updates[0].data.value, 'admin');
  dom.window.document.querySelector('[data-confirm]').click();
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(updates.length, 2);
  assert.equal(updates[1].name, 'executeAdminAccountAction');
  assert.equal(updates[1].data.operationId, 'synthetic');
  assert.equal(dom.window.document.querySelector('.adminTeacherRole[data-id="admin"]').disabled, true);
  assert.equal(dom.window.document.querySelector('.adminTeacherRole[data-id="b"] option[value="admin"]').disabled, true);
  dom.window.close();
});
