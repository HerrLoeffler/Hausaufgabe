import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('./app.js',import.meta.url),'utf8'),start=source.indexOf('function wilmaAutomaticPreview('),fn=source.slice(start,source.indexOf('\n}',start)+2);
const allowed={quiz:{id:'WILMAAUTO20261028',wilmaAutoReviewPreview:true}};
const gate=(projectId,pathname,ctx)=>new Function('firebaseConfig','location',fn+';return wilmaAutomaticPreview;')({projectId},{pathname})(ctx);
test('automatic preparation is disabled for Live, ordinary paths and real tests',()=>{for(const [project,path,ctx] of [['hausaufgabe-staging','/wilma-review-preview/',allowed],['gradecrew-staging-2026','/wilma/',allowed],['gradecrew-staging-2026','/wilma-review-preview/',{quiz:{id:'REALTEST',wilmaAutoReviewPreview:true}}],['gradecrew-staging-2026','/wilma-review-preview/',{quiz:{id:'WILMAAUTO20261028'}}]])assert.equal(gate(project,path,ctx),false);});
test('only the explicit fictional Staging preview has automatic preparation',()=>assert.equal(gate('gradecrew-staging-2026','/wilma-review-preview/',allowed),true));
