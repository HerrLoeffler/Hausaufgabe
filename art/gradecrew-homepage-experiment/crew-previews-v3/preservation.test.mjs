import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
test('Emmi and Wilma rendering functions are byte-identical to the frozen staging source',async()=>{
 const original=await readFile('baseline/gradecrew-hero-demo.mjs','utf8');
 const current=await readFile('demo-v3.mjs','utf8');
 const slice=s=>s.slice(s.indexOf('  function renderEmmi'),s.indexOf('  function render()'));
 assert.equal(slice(current),slice(original));
});
test('the original start-screen markup and viewport animation placement remain byte-identical',async()=>{
 const original=await readFile('baseline/gradecrew-entry-flow.js','utf8');
 const current=await readFile('entry-v3.mjs','utf8');
 const markup=s=>s.slice(s.indexOf('  authView.innerHTML ='),s.indexOf('  installPublicHeader();'));
 const fit=s=>s.slice(s.indexOf('function installHeroViewportFit'),s.indexOf('function installPublicHeader'));
 assert.equal(markup(current),markup(original));assert.equal(fit(current),fit(original));
});
test('original stylesheet and hero assets still match the canonical release hashes',async()=>{
 const release=JSON.parse(await readFile('baseline/release.json','utf8'));
 for(const file of ['styles.css','gradecrew-auth-startscreen.css','gradecrew-auth-startscreen-polish.css','gradecrew-hero-scene.css','assets/gradecrew/crew-classroom-wide-v4.png','assets/gradecrew/emmi-colors.png','assets/gradecrew/wilma-grading.png']){
  const hash=createHash('sha256').update(await readFile('baseline/'+file)).digest('hex');
  const expected=release.files[file];assert.equal(hash,typeof expected==='string'?expected:expected.sha256,file);
 }
});
test('the new Remy catalog does not override Wilma’s shared Points label',async()=>{
 const copy=await readFile('copy-v3.mjs','utf8');
 assert.doesNotMatch(copy,/(?:^|[,\s])points\s*:/);
 assert.match(copy,/remyPoints:/);
});

test('original startup styles are installed after i18n bootstrap, and the header is translated after hero catalogs load',async()=>{
 const original=await readFile('baseline/startup.js','utf8');const preview=await readFile('preview-start.mjs','utf8');
 const extract=s=>s.slice(s.indexOf('function installGradeCrewDesignStyles()'),s.indexOf('function installGradeCrewBrandAssets()')).trimEnd();
 assert.equal(extract(preview),extract(original));
 assert.ok(preview.indexOf('import {gradeCrewI18n}')<preview.indexOf('installGradeCrewDesignStyles();'));
 assert.ok(preview.indexOf('entry.installGradeCrewEntryFlow();')<preview.indexOf('translateTree(document.querySelector(".topbar"));'));
 const html=await readFile('index.html','utf8');assert.match(html,/body id="gradecrewPage"/);assert.doesNotMatch(html,/<link[^>]+gradecrew-auth-startscreen/);
});
