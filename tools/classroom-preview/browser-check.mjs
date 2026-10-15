import {chromium} from '/Users/martin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
const output=process.env.GC_CLASSROOM_EVIDENCE||'/private/tmp/gc-classroom-evidence';await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[],external=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8782/')&&!r.url().startsWith('data:'))external.push(r.url());});
try{await page.goto('http://127.0.0.1:8782/');await page.waitForTimeout(2000);const report={headings:await page.locator('h1:visible').allTextContents(),errors,external,body:(await page.locator('body').innerText()).slice(0,1800)};await page.screenshot({path:output+'/overview.png',fullPage:true});console.log(JSON.stringify(report));await fs.writeFile(output+'/initial.json',JSON.stringify(report,null,2));}finally{await browser.close();}
