'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('/Users/martin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {login,PROJECT}=require('../../visual-pilot/access.cjs');
const root=path.resolve(__dirname,'../../../docs/evidence/remy-training-20261118');
const wishes=[
  {id:'pumps',kind:'inverse',wish:'Mathematik, Klasse 7: Fünf gleich starke Pumpen leeren dasselbe Becken in 18 Stunden. Sie fördern gleichmäßig und beeinflussen einander nicht. Wie lange brauchen neun? Ohne Hilfen, alle vier Rechenpfeile vollständig frei.'},
  {id:'delivery',kind:'other',wish:'Mathematik, Klasse 7: Ein Lieferdienst verlangt 6 Euro Grundpreis und zusätzlich 3 Euro je Kilometer. Erstelle für eine Strecke von 11 Kilometern eine Aufgabe in einer passenden Darstellung.'}
];
(async()=>{
  const token=await login();
  async function call(data){
    const r=await fetch('https://europe-west1-'+PROJECT+'.cloudfunctions.net/remyMehrfeld30Review',{method:'POST',
      headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({data})});
    const b=await r.json();if(b.error)throw Error(b.error.message);return b.result;
  }
  const browser=await chromium.launch({headless:true,executablePath:'/Users/martin/Library/Caches/ms-playwright/chromium-1194/chrome-mac/Chromium.app/Contents/MacOS/Chromium'});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:1000}});
    await page.goto('https://gradecrew-staging-2026--remy-mehrfeld30-1nsipawh.web.app/remy-labor/');
    const credentials=JSON.parse(fs.readFileSync('/Users/martin/Documents/Codex/2026-10-21/setze-den-bestehenden-gradecrew-auftrag-aus/work/test-login.json','utf8'));
    await page.locator('#login:not([hidden])').waitFor();
    await page.getByLabel('E-Mail',{exact:true}).fill(credentials.email);
    await page.getByLabel('Passwort',{exact:true}).fill(credentials.password);
    await page.getByRole('button',{name:'Anmelden',exact:true}).click();
    await page.locator('#workspace:not([hidden])').waitFor();
    for(const wish of wishes){
      const file=path.join(root,'free-'+wish.id+'.json');
      if(fs.existsSync(file)){
        const previous=JSON.parse(fs.readFileSync(file,'utf8'));
        if(previous.status==='ready'){console.log(wish.id+' already verified');continue;}
        throw Error(wish.id+' has an earlier uncertain receipt; do not dispatch again.');
      }
      await page.locator('#trainingWish textarea').fill(wish.wish);
      await page.getByRole('button',{name:'Mit KI erstellen und prüfen',exact:true}).click();
      const pending=await page.evaluate(()=>JSON.parse(localStorage.getItem('remy-mehrfeld30:gc-visual255-e2e:training-job')));
      const receipt={at:new Date().toISOString(),...wish,status:'running',requestId:pending.requestId};
      fs.writeFileSync(file,JSON.stringify(receipt,null,2)+'\n');
      await page.waitForFunction(()=>/Entwurf und unabhängige Prüfung sind gespeichert|gesperrt|unbestätigt/.test(document.querySelector('#trainingStatus').textContent),null,{timeout:170000});
      const message=await page.locator('#trainingStatus').textContent();
      assert.match(message,/Entwurf und unabhängige Prüfung sind gespeichert/);
      const quizId=await page.evaluate(()=>JSON.parse(localStorage.getItem('remy-mehrfeld30:gc-visual255-e2e:last-training')));
      const runId=quizId.slice('training:'.length);
      const report=await call({action:'trainingDetails',runId,caseId:'wish'});
      assert.equal(report.decision,wish.kind);
      const state=await call({action:'trainingStatus',runId});
      if(wish.kind==='inverse'){
        assert.equal(report.solution.find(x=>x.label==='Zielwert · Zahl rechts').value,'10');
        assert.equal(await page.locator('#answer input[aria-label$="ganze Rechnung"]').count(),4);
        assert.equal(await page.locator('#answer select').count(),0);
      }else{
        assert.equal(await page.locator('#answer input[type=radio]').count(),3);
        assert.match(await page.locator('#group').textContent(),/Eignungsprobe/);
      }
      await page.getByRole('button',{name:'Auswahlgrund und Lösung zeigen'}).click();
      await page.locator('#trainingReport li').first().waitFor();
      const verified={...receipt,status:'ready',quizId,runId,decision:report.decision,reason:report.reason,
        independentReason:report.independentCheck,spentMicros:state.spentMicros,reservedMicros:state.reservedMicros,
        solution:report.solution,actualUI:true};
      fs.writeFileSync(file,JSON.stringify(verified,null,2)+'\n');
      console.log(wish.id+' '+report.decision+' '+state.spentMicros/1e6+' USD');
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
