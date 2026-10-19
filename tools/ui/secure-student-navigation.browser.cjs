const {chromium} = require('playwright');
const fs=require('fs'), path=require('path');
const root=process.cwd();
const output = process.env.GC_BROWSER_EVIDENCE || '/tmp';
(async()=>{
 const browser=await chromium.launch({...(process.env.GC_BROWSER_EXECUTABLE ? {executablePath:process.env.GC_BROWSER_EXECUTABLE} : {}),headless:true});
 const evidence=[];
 for(const [width,height,label] of [[390,844,'iphone390'],[375,812,'iphone375'],[1280,900,'desktop']]){
 const page=await browser.newPage({viewport:{width,height}});
 await page.route('https://fixture.test/**',route=>{
  const p=new URL(route.request().url()).pathname.slice(1);const file=path.join(root,p||'secure-student.html');
  if(!fs.existsSync(file))return route.fulfill({status:404,body:''});
  return route.fulfill({status:200,contentType:file.endsWith('.css')?'text/css':file.endsWith('.mjs')?'text/javascript':file.endsWith('.svg')?'image/svg+xml':'text/html',body:fs.readFileSync(file)});
 });
 let html=fs.readFileSync('secure-student.html','utf8').replace(/<script[^>]*>[\s\S]*?<\/script>/g,'');
 await page.route('https://fixture.test/fixture',route=>route.fulfill({contentType:'text/html',body:html}));
 await page.goto('https://fixture.test/fixture');
 await page.evaluate(()=>{

 document.querySelectorAll('main > section').forEach(s=>s.classList.toggle('hidden',s.id!=='secureAssessment'));
 document.getElementById('secureRunningTitle').textContent='Synthetischer Test – langer Titel für eine kleine Ansicht';
 document.getElementById('secureConnection').textContent='Verbunden';
 document.getElementById('secureQuestions').innerHTML=Array.from({length:8},(_,i)=>`<section class="secureQuestion" data-qid="q${i}"><div class="secureQuestionHead"><span class="secureQuestionNo">Aufgabe ${i+1}</span><span>2 P.</span></div><h2>${i===2?'Höre den Hörtext und wähle genau zwei passende Begriffe. '.repeat(5):'Welche Antwort passt zu diesem Beispiel?'}</h2>${i===2?'<audio controls src="data:audio/wav;base64,UklGRg=="></audio>':''}${[1,2,3].map(v=>`<label class="secureChoice"><input type="radio" name="q${i}" value="${v}">Beispielantwort ${v}</label>`).join('')}<input aria-label="Zusatzantwort ${i+1}" placeholder="Deine Antwort"></section>`).join('');
 });
 await page.addScriptTag({type:'module',url:'https://fixture.test/shared/i18n/bootstrap.mjs?v=3'});
 await page.waitForSelector('[data-gradecrew-locale-select]');
 await page.addScriptTag({type:'module',url:'https://fixture.test/secure-student-navigation.mjs'});
 await page.waitForSelector('#secureQuestionNavigation:not([hidden])');
 await page.evaluate(()=>window.scrollTo(0,700)); await page.waitForTimeout(80);
 let start=await page.evaluate(()=>({nav:document.getElementById('secureQuestionNavigation').getBoundingClientRect().toJSON(),header:document.querySelector('.secureTopbar').getBoundingClientRect().toJSON(),footer:document.querySelector('.secureSubmit').getBoundingClientRect().toJSON(),position:getComputedStyle(document.querySelector('.secureSubmit')).position,width:document.documentElement.scrollWidth,current:document.querySelector('[data-secure-current]').textContent,logo:document.querySelector('.secureBrandMark').naturalWidth}));
 if(start.footer.top<height)throw Error('Footer visible in middle');
 if(Math.abs(start.nav.top-start.header.bottom)>1)throw Error('Sticky navigation overlap/gap');
 if(start.width>width)throw Error('Horizontal overflow '+start.width+' '+width);
 await page.locator('[data-secure-next]').click();await page.waitForTimeout(80);
 const jump=await page.evaluate(()=>({current:document.querySelector('[data-secure-current]').textContent,target:document.activeElement.dataset.qid,top:document.activeElement.getBoundingClientRect().top,bottom:document.getElementById('secureQuestionNavigation').getBoundingClientRect().bottom}));
 if(jump.current!==`Aufgabe ${Number(jump.target.slice(1))+1} von 8`)throw Error('Index reset after scroll '+JSON.stringify(jump));
 if(jump.top<jump.bottom||jump.top-jump.bottom>40)throw Error('Jump target wrong offset '+JSON.stringify(jump));
 await page.screenshot({path:path.join(output,'gc-mobile-'+label+'.png'),fullPage:false});
 await page.locator('[data-secure-overview-toggle]').click();
 await page.locator('#secureQuestionOverview button').last().click();await page.waitForTimeout(80);
 await page.locator('#secureSubmitBtn').scrollIntoViewIfNeeded();
 const end=await page.evaluate(()=>({current:document.querySelector('[data-secure-current]').textContent,nextDisabled:document.querySelector('[data-secure-next]').disabled,footer:document.querySelector('.secureSubmit').getBoundingClientRect().toJSON(),nav:document.getElementById('secureQuestionNavigation').getBoundingClientRect().toJSON(),width:document.documentElement.scrollWidth}));
 if(end.current!=='Aufgabe 8 von 8'||!end.nextDisabled)throw Error('Last question navigation incorrect '+JSON.stringify(end));
 if(end.footer.bottom>height+1)throw Error('End submit unreachable');
 evidence.push({label,start,jump,end});await page.close();
 }
 fs.writeFileSync(path.join(output,'gc-mobile-layout.json'),JSON.stringify(evidence,null,2));await browser.close();console.log(JSON.stringify(evidence.map(x=>({label:x.label,footerPosition:x.start.position,stickyTop:x.start.nav.top,headerBottom:x.start.header.bottom,jump:x.jump,endVisible:x.end.footer.bottom})),null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
