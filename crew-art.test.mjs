import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('Clay sprites are self-contained, have six bounded pose views and preserve a greeting default',()=>{
 for(const name of ['penguin-guide','elephant-create','fox-improve','owl-grade']){
  const svg=fs.readFileSync(`assets/gradecrew/${name}.svg`,'utf8');
  assert.ok(svg.includes('viewBox="0 0 512 512"'));
  const views=[...svg.matchAll(/<view id="pose-(\d)" viewBox="(\d+) (\d+) (\d+) (\d+)"/g)];
  assert.equal(views.length,6);
  for(const [,id,x,y,w,h] of views){assert.ok(+x + +w<=1536 && +y + +h<=1024);assert.ok(+id>=1 && +id<=6);}
  assert.ok(svg.includes('data:image/webp;base64,'));
  assert.ok(!svg.includes('<script'));
 }
});
test('Clay integration ships its stylesheet and respects reduced motion without an observer',()=>{
 const css=fs.readFileSync('crew-clay.css','utf8');
 assert.ok(css.includes('prefers-reduced-motion:reduce'));
 assert.ok(!css.includes('infinite'));
 assert.ok(fs.readFileSync('tools/build-staging.mjs','utf8').includes("'crew-clay.css'"));
 assert.ok(fs.readFileSync('index.html','utf8').includes('clay-welcome.svg'));
});


test('clean atlas uses independently clipped and padded pose windows',()=>{
 for(const name of ['penguin-guide','elephant-create','fox-improve','owl-grade']){
  const svg=fs.readFileSync(`assets/gradecrew/${name}.svg`,'utf8');
  assert.equal([...svg.matchAll(/overflow="hidden"/g)].length,6);
  assert.equal([...svg.matchAll(/clip-path="url\(#crop-/g)].length,6);
  assert.equal([...svg.matchAll(/preserveAspectRatio="xMidYMid meet"/g)].length,6);
  assert.equal(fs.readFileSync(`assets/gradecrew/${name}-welcome.svg`,'utf8'),svg);
 }
});
