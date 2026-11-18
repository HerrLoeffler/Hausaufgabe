'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('/Users/martin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {login,PROJECT}=require('../../visual-pilot/access.cjs');
const {fullAnswer}=require('./runner.cjs');
const root=path.resolve(__dirname,'../../../docs/evidence/remy-training-20261118');
const base='https://gradecrew-staging-2026--remy-mehrfeld30-1nsipawh.web.app/remy-labor/';
(async()=>{
  const audit=JSON.parse(fs.readFileSync('/private/tmp/gc-remy-training-audit-private.json','utf8'));
  const browser=await chromium.launch({headless:true,executablePath:'/Users/martin/Library/Caches/ms-playwright/chromium-1194/chrome-mac/Chromium.app/Contents/MacOS/Chromium'});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:1000}});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
    const credentials=JSON.parse(fs.readFileSync('/Users/martin/Documents/Codex/2026-10-21/setze-den-bestehenden-gradecrew-auftrag-aus/work/test-login.json','utf8'));
    await page.locator('#login:not([hidden])').waitFor({timeout:60000});
    await page.getByLabel('E-Mail',{exact:true}).fill(credentials.email);
    await page.getByLabel('Passwort',{exact:true}).fill(credentials.password);
    await page.getByRole('button',{name:'Anmelden',exact:true}).click();
    await page.locator('#workspace:not([hidden])').waitFor();
    await page.getByRole('button',{name:'60 KI-Erprobungen öffnen'}).click();
    await page.waitForFunction(()=>document.querySelector('#jump').options.length===60);
    const tasks=[];
    const token=await login();
    async function call(data){
      const r=await fetch('https://europe-west1-'+PROJECT+'.cloudfunctions.net/remyMehrfeld30Review',{method:'POST',
        headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({data})});
      const b=await r.json();if(b.error)throw Error(b.error.message);return b.result;
    }
    const listed=(await call({action:'list',quizId:'training:dreisatz60-20261118-v1'})).tasks;
    const number=new Intl.NumberFormat('de-DE');
    for(const [index,task]of listed.entries()){
      await page.getByLabel('Direkt zu einer Aufgabe').selectOption(String(index));
      await page.waitForFunction(text=>document.querySelector('#prompt').textContent===text,task.text);
      const c=audit.cases.find(c=>c.id===task.id),answer=fullAnswer(c.q);
      if(task.type==='single'){
        await page.locator('#answer input[type=radio]').nth(answer).check();
        assert.match(await page.locator('#group').textContent(),/Eignungsprobe/);
      }else{
        for(const [id,value]of Object.entries(answer)){
          const input=page.locator('[data-table="'+id+'"]');
          if(await input.evaluate(el=>el.tagName)==='SELECT')await input.selectOption(String(value));
          else await input.fill(String(value).replace('.',','));
        }
      }
      await page.getByRole('button',{name:'Probe auswerten',exact:true}).click();
      await page.waitForFunction(expected=>document.querySelector('#score').textContent===expected,
        number.format(c.q.points)+' von '+number.format(c.q.points)+' Punkten');
      tasks.push({id:task.id,points:c.q.points});
    }
    const layouts=[];
    await page.getByLabel('Direkt zu einer Aufgabe').selectOption('3');
    for(const [width,height,name]of [[1280,1000,'desktop'],[820,1180,'tablet'],[360,900,'phone']]){
      await page.setViewportSize({width,height});
      const dims=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,
        controls:[...document.querySelectorAll('#answer input,#answer select')].map(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right}))}));
      assert.ok(dims.documentWidth<=width+2,name+' body overflow');
      assert.ok(dims.controls.every(r=>r.left>=0&&r.right<=width+1),name+' unreachable input');
      await page.screenshot({path:'/private/tmp/gc-remy-training-'+name+'.png',fullPage:true});
      layouts.push({name,width,documentWidth:dims.documentWidth,reachableControls:dims.controls.length});
    }
    await page.reload();
    await page.waitForFunction(()=>document.querySelector('#position').textContent==='Aufgabe 4 von 60');
    assert.equal(await page.locator('#jump').inputValue(),'3');
    const receipt={at:new Date().toISOString(),tasks,layouts,reloadPositionPreserved:true,pageErrors:errors};
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(root,'browser-verification.json'),JSON.stringify(receipt,null,2)+'\n');
    console.log(JSON.stringify({renderedAndScored:tasks.length,layouts,reloadPositionPreserved:true}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
