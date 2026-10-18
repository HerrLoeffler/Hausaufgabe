const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {JSDOM}=require('jsdom');

test('ET launcher is only visible for a signed-in administrator outside test mode',async()=>{
 const {syncDashboardTutorialEntry}=await import('../../dashboard-tutorial-entry.mjs');
 const source=fs.readFileSync('app.js','utf8');
 const html=fs.readFileSync('index.html','utf8');
 const body=source.match(/function setTeacherBar\(\) \{[\s\S]*?\n\}/)?.[0];
 assert.ok(body,'setTeacherBar role gate exists');
 assert.match(html,/<a id="gradecrewEtLauncher"[^>]*href="http:\/\/127\.0\.0\.1:8772\/__dev"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
 assert.match(html,/muss auf diesem Rechner laufen/);
 const dom=new JSDOM('<section id="dashboardView" class="hidden"></section><div id="userBar"></div><span id="userLabel"></span><button id="adminTopBtn"></button><a id="gradecrewEtLauncher" class="hidden"></a><footer id="appFooter"></footer>',{url:'https://example.test'});
 const state={user:{uid:'u',email:'admin@example.test'},profile:{role:'admin'}};
 const location={search:'',hostname:'staging.example'};
 const context=vm.createContext({syncDashboardTutorialEntry,guestTourRepo:null,document:dom.window.document,state,URLSearchParams,location,$:id=>dom.window.document.getElementById(id),isAdmin:()=>state.profile?.role==='admin'});
 vm.runInContext(`${body};setTeacherBar();`,context);
 assert.equal(dom.window.document.getElementById('gradecrewEtLauncher').classList.contains('hidden'),false);
 state.profile.role='teacher';vm.runInContext('setTeacherBar();',context);
 assert.equal(dom.window.document.getElementById('gradecrewEtLauncher').classList.contains('hidden'),true);
 state.profile.role='admin';dom.window.history.replaceState({},'','?test=1');context.location.search='?test=1';vm.runInContext('setTeacherBar();',context);
 assert.equal(dom.window.document.getElementById('gradecrewEtLauncher').classList.contains('hidden'),true);
 context.location.search='';
 for(const hostname of ['localhost','127.0.0.1','::1','[::1]']){
  context.location.hostname=hostname;vm.runInContext('setTeacherBar();',context);
  assert.equal(dom.window.document.getElementById('gradecrewEtLauncher').classList.contains('hidden'),true,`duplicate static ET hidden on ${hostname}`);
  assert.equal(dom.window.document.getElementById('adminTopBtn').classList.contains('hidden'),false,'local review toolbar/admin access remains independent');
 }
 dom.window.close();
});
