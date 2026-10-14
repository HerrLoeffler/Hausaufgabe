/* Unit tests for paint classification with explicit geometry/hit-stack inputs.
 * Real layout and negative probes are verified independently by WKWebView. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(require.resolve('jsdom',{paths:[path.join(__dirname,'../../../../tools/ui'),'/private/tmp/game-et-jsdom/node_modules']}));
function model(t){
 const dom=new JSDOM('<!doctype html><html><head></head><body><header id="sticky" style="position:sticky;top:84px;background:rgba(245,247,251,.97)"><button id="gcCrewLauncher" data-gc-native-coco style="position:static">Coco</button></header><textarea id="field"></textarea></body></html>',{url:'https://fixture.invalid',runScripts:'outside-only'});
 const w=dom.window,d=w.document;t.after(()=>w.close());w.innerWidth=320;w.innerHeight=568;
 const header=d.getElementById('sticky'),coco=d.getElementById('gcCrewLauncher'),field=d.getElementById('field');
 const box=(left,top,width,height)=>({left,top,right:left+width,bottom:top+height,width,height,x:left,y:top,toJSON(){return this;}});
 header.getBoundingClientRect=()=>box(0,84,300,80);coco.getBoundingClientRect=()=>box(160,100,44,44);field.getBoundingClientRect=()=>box(20,100,220,44);
 d.elementFromPoint=()=>coco;d.elementsFromPoint=()=>[coco,header,field,d.body,d.documentElement];
 w.eval(fs.readFileSync(path.join(__dirname,'geometry-audit.js'),'utf8'));
 return {w,d,header,coco,field,box,audit:()=>w.gcLayoutAudit()};
}
test('native static Coco inside active opaque sticky header records an existing paint clip',t=>{
 const m=model(t),result=m.audit();assert.equal(result.issues.some(x=>x.rule==='control-occluded'),false);
 assert.equal(result.metrics.paintClips.length,1);assert.equal(result.metrics.paintClips[0].by,'#sticky');
});
for(const [name,change] of [
 ['transparent header',m=>m.header.style.backgroundColor='transparent'],
 ['ordinary flow header',m=>m.header.style.position='static'],
 ['sticky header not pinned at its inset',m=>m.header.style.top='20px'],
 ['floating launcher',m=>m.coco.style.position='fixed'],
 ['launcher without native docking provenance',m=>m.coco.removeAttribute('data-gc-native-coco')],
 ['header painted behind the target',m=>m.d.elementsFromPoint=()=>[m.coco,m.field,m.header,m.d.body]]
])test(`actual Coco occlusion remains actionable with ${name}`,t=>{
 const m=model(t);change(m);assert.ok(m.audit().issues.some(x=>x.rule==='control-occluded'&&x.selector==='#field'));
});
test('44pt check tolerates floating point roundoff while rejecting43.9pt',t=>{
 const m=model(t);m.field.getBoundingClientRect=()=>m.box(20,100,43.99999999999994,44);
 assert.equal(m.audit().issues.some(x=>x.rule==='touch-target'&&x.selector==='#field'),false);
 m.field.getBoundingClientRect=()=>m.box(20,100,43.9,44);
 assert.ok(m.audit().issues.some(x=>x.rule==='touch-target'&&x.selector==='#field'));
});
