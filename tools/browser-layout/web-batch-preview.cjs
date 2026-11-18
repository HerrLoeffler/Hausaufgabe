// Validate the exported offline examples as users will load them from Hosting.
const fs = require("node:fs"), http = require("node:http"), path = require("node:path"), assert = require("node:assert/strict");
const { createRequire } = require("node:module");
const { chromium, webkit } = createRequire(path.join(process.cwd(), "tools/browser-layout/package.json"))("playwright");
const os = require("node:os"), { execFileSync } = require("node:child_process");
const build = fs.mkdtempSync(path.join(os.tmpdir(), "gc-web-batch-preview-"));
execFileSync(process.execPath, ["tools/build-web-batch-preview.mjs", build], { cwd: process.cwd(), stdio: "pipe" });
const root = path.join(build, "public");
const server = http.createServer((req,res) => {
 let file=path.resolve(root,"."+new URL(req.url,"http://local").pathname);
 if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,"index.html");
 if(!fs.existsSync(file))return res.writeHead(404).end();
 res.setHeader("Content-Type",file.endsWith(".css")?"text/css":/\.m?js$/.test(file)?"text/javascript":file.endsWith(".svg")?"image/svg+xml":file.endsWith(".png")?"image/png":"text/html");
 res.end(fs.readFileSync(file));
});
(async()=>{
 await new Promise(r=>server.listen(0,"127.0.0.1",r));const origin="http://127.0.0.1:"+server.address().port;
 try {for(const [name,engine] of Object.entries({chromium,webkit})){
  const browser=await engine.launch();
  try {for(const [width,height] of [[390,844],[820,1180],[1180,820]]){
   const page=await browser.newPage({viewport:{width,height},hasTouch:true}),errors=[],external=[];
   page.on("pageerror",e=>errors.push(e.message));
   await page.route("**/*",route=>{
    const url=route.request().url();
    if(url.startsWith(origin)||url.startsWith("data:"))return route.continue();
    external.push(url);return route.abort();
   });
   await page.goto(origin+"/preview.html");
   await page.getByRole("link",{name:"Wilma-Sortierung und mobile Bewertung ansehen"}).click();
   await page.locator("body[data-ready=true]").waitFor();
   await page.selectOption("#resultsSort","lastName");
   await page.selectOption("#resultsSortDirection","asc");
   assert.equal(await page.locator(".resultTable").evaluate(e=>getComputedStyle(e).minWidth),"0px");
   await page.locator(".reviewBtn[data-id=s1]").click();
   await page.locator(".manualPoints").fill("2.5");
   assert.ok(await page.locator(".resultsAverages").count());
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll("*")].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(e=>[e.tagName,e.className,e.getBoundingClientRect().toJSON()]))));
   page.once("dialog",d=>d.accept());
   await page.locator("#saveReview").click();
   await page.goto(origin+"/emmi-demo/");
   await page.getByRole("button",{name:"Mit Emmi überarbeiten"}).click();
   const dialog=page.locator("dialog[open]");
   await dialog.locator("textarea").fill("Frage lassen, neue Antworten");
   assert.equal(await dialog.locator("select").inputValue(),"answers");
   await dialog.getByRole("button",{name:"Überarbeitung erstellen",exact:true}).click();
   await dialog.waitFor({state:"detached"});
   assert.match(await page.locator("#questionList").innerText(),/Hauptstadt von Frankreich/);
   assert.match(await page.locator("#questionList").innerText(),/Lyon/);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
   console.log(name,width,height,"exported offline Wilma/Emmi examples passed");
   await page.close();
  }}finally{await browser.close();}
 }}finally{await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();}).finally(()=>fs.rmSync(build,{recursive:true,force:true}));
