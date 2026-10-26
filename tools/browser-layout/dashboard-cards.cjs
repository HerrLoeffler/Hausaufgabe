// Local-only browser geometry check: serves the existing fixture; never starts Firebase.
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const out=process.env.GC_DASHBOARD_EVIDENCE||path.join(root,'dashboard-card-evidence');
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.json':'application/json'};
const server=http.createServer((req,res)=>{
  const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!target.startsWith(root+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',mime[path.extname(target)]||'application/octet-stream');res.end(fs.readFileSync(target));
});
const sizes=[[320,568],[390,844],[430,932],[768,1024],[1024,768],[1366,900],[1600,900]];
function measure(){
  const cards=[...document.querySelectorAll('#quizList .quizCard')];
  const errors=[];
  if(cards.length!==52)errors.push(`card count ${cards.length}`);
  if(document.documentElement.scrollWidth>innerWidth+1){
    const protruding=[...document.querySelectorAll('*')].filter(el=>{
      const r=el.getBoundingClientRect();return r.width&&getComputedStyle(el).visibility!=='hidden'&&r.right>innerWidth+1;
    }).slice(0,8).map(el=>`${el.tagName.toLowerCase()}${el.id?'#'+el.id:''}${el.className&&typeof el.className==='string'?'.'+el.className.replaceAll(' ','.'):''}:${Math.round(el.getBoundingClientRect().right)}`);
    errors.push(`horizontal page scroll ${document.documentElement.scrollWidth}: ${protruding.join(', ')}`);
  }
  cards.forEach((card,index)=>{
    if(card.scrollWidth>card.clientWidth+1)errors.push(`card ${index} clipped`);
    for(const value of card.querySelectorAll('.quizStats strong')){
      const box=value.getBoundingClientRect(),cell=value.parentElement.getBoundingClientRect();
      if(box.width>cell.width+1||box.height>parseFloat(getComputedStyle(value).lineHeight)*1.5)errors.push(`stat ${index} wrapped`);
    }
    for(const button of card.querySelectorAll('.quizCardQuickLinks button,.primaryQuizActions button,.quizMore summary')){
      const r=button.getBoundingClientRect();
      if(r.height<43||r.left<card.getBoundingClientRect().left-1||r.right>card.getBoundingClientRect().right+1)errors.push(`target ${index} outside`);
    }
  });
  const first=cards[0].getBoundingClientRect(),neighbor=cards[1].getBoundingClientRect();
  return {errors,count:cards.length,first:first.toJSON(),neighbor:neighbor.toJSON(),width:innerWidth,height:innerHeight};
}
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  fs.mkdirSync(out,{recursive:true});const receipt=[];
  try{
    for(const [engineName,engine] of Object.entries({chromium,webkit})){
      const browser=await engine.launch({headless:true});
      try{
        const page=await browser.newPage({reducedMotion:'reduce'});
        await page.goto(`http://127.0.0.1:${server.address().port}/tools/ui/workspace-preview.html`);
        await page.locator('#previewScenario').selectOption('many');
        await page.locator('#quizList .quizCard').nth(51).waitFor();
        for(const [width,height] of sizes){
          await page.setViewportSize({width,height});
          const before=await page.evaluate(measure);
          assert.deepEqual(before.errors,[],`${engineName} ${width}: ${before.errors.join(', ')}`);
          const menu=page.locator('#quizList .quizCard').first().locator('.quizMore');
          await menu.locator('summary').click();
          const after=await page.evaluate(measure);
          assert.deepEqual(after.errors,[],`${engineName} ${width} open: ${after.errors.join(', ')}`);
          assert.ok(after.first.height>before.first.height,`${engineName} ${width} first card did not expand`);
          assert.ok(Math.abs(after.neighbor.height-before.neighbor.height)<1,`${engineName} ${width} neighboring card stretched`);
          assert.equal(await page.locator('#quizList .quizCard').nth(1).locator('.quizMore').getAttribute('open'),null);
          if([390,768,1600].includes(width)){
            await page.locator('#quizList .quizCard').first().scrollIntoViewIfNeeded();
            await page.screenshot({path:path.join(out,`${engineName}-${width}-menu.png`)});
          }
          const secondary=menu.locator('.duplicate');await secondary.focus();await secondary.press('Escape');
          assert.equal(await menu.getAttribute('open'),null);
          assert.equal(await menu.locator('summary').evaluate(el=>document.activeElement===el),true);
          receipt.push({engine:engineName,width,height,cardCount:before.count,neighborBefore:before.neighbor.height,neighborAfter:after.neighbor.height,errors:[]});
        }
        await page.locator('#quizList .quizCard').first().locator('.teacherLiveOpen').click();
        assert.match(await page.locator('#previewLog').innerText(),/DEMO001/);
        await page.locator('#quizList .quizCard').first().locator('.studentShare').click();
        assert.match(await page.locator('#previewLog').innerText(),/DEMO001/);
      }finally{await browser.close();}
    }
    fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify(receipt,null,2));
    console.log(`PASS ${receipt.length} card layouts across Chromium/WebKit; 52 synthetic cards, per-card menu and focus`);
  }finally{server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
