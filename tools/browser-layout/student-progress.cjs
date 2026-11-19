// Runs the actual Secure browser entry with an in-memory assessment transport.
const { chromium, webkit } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const root = process.cwd();
const paper = [
  { id: "order", type: "ordering", text: "Ordne die Schritte.", points: 1, items: [{id:"first",text:"Schritt eins"},{id:"second",text:"Schritt zwei"}] },
  { id: "text", type: "text", text: "Begründe deine Antwort.", points: 1 },
  { id: "choice", type: "single", text: "Wähle eine Möglichkeit.", points: 1,
    options: [{ id: "a", text: "Möglichkeit A" }, { id: "b", text: "Möglichkeit B" }] },
  { id: "gaps", type: "gapfill", text: "", points: 1,
    segments: [{ type: "text", text: "Erstens " }, { type: "gap", id: "g1" }, { type: "text", text: " zweitens " }, { type: "gap", id: "g2" }] }
];
const server = http.createServer((req, res) => {
  const name = new URL(req.url, "http://local").pathname;
  const file = path.resolve(root, "." + name);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) return res.writeHead(404).end();
  res.setHeader("Content-Type", file.endsWith(".css") ? "text/css" : /\.m?js$/.test(file) ? "text/javascript" : file.endsWith(".svg") ? "image/svg+xml" : "text/html");
  res.end(fs.readFileSync(file));
});
(async () => {
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const origin = "http://127.0.0.1:" + server.address().port;
  try {
    for (const [name, engine] of Object.entries({ chromium, webkit })) {
      const browser = await engine.launch();
      try {
        for (const [width, height] of [[390, 844], [820, 1180], [1180, 820], [1366, 900]]) {
          const page = await browser.newPage({ viewport: { width, height }, hasTouch: width < 1366 });
          const errors = [];
          page.on("pageerror", error => errors.push(error.message));
          await page.route("https://www.gstatic.com/**", route => route.fulfill({ contentType: "text/javascript", body: "export const initializeApp=()=>({}),getApps=()=>[{}],getApp=()=>({}),getAuth=()=>({currentUser:null}),onAuthStateChanged=()=>()=>{},getFirestore=()=>({}),getFunctions=()=>({}),httpsCallable=()=>async()=>({data:{}}),doc=()=>({}),getDoc=async()=>({exists:()=>false}),getDocs=async()=>({docs:[]}),onSnapshot=()=>()=>{},collection=()=>({}),query=()=>({}),where=()=>({}),orderBy=()=>({}),limit=()=>({}),setDoc=async()=>{},serverTimestamp=()=>0;" }));
          await page.route("**/secure-assessment-client.js", route => route.fulfill({
            contentType: "text/javascript",
            body: `const response=${JSON.stringify({ status: "running", attemptId: "synthetic-attempt", quiz: { title: "Fiktiver Fortschrittstest", startMode: "self" }, paper })};
              export const createSecureAssessmentClient=()=>({
                getInfo:async()=>({quiz:response.quiz}), readSession:()=>({attemptId:response.attemptId,studentName:"Fiktiv"}),
                resume:async()=>response
              });`
          }));
          await page.goto(origin + "/secure-student.html?test=DEMO1234&lang=de");
          await page.locator("#secureAssessment:not(.hidden)").waitFor();
          assert.match(await page.locator("#secureProgressText").textContent(), /0 von 4/);
          const text = page.locator('[data-qid="text"] textarea');
          const overview = page.locator("#secureQuestionOverview");
          if(await page.locator("[data-secure-overview-toggle]").isVisible())await page.locator("[data-secure-overview-toggle]").click();
          assert.match(await overview.locator("button").nth(1).getAttribute("aria-label"), /offen/);
          await text.fill("Absichtlich unbewertete Antwort");
          await page.waitForFunction(() => document.querySelector("#secureQuestionOverview button:nth-child(2)").classList.contains("complete"));
          assert.match(await page.locator("#secureProgressText").textContent(), /1 von 4/);
          assert.equal(await overview.locator("button").nth(1).textContent(), "2 ✓");
          assert.match(await overview.locator("button").nth(1).getAttribute("aria-label"), /beantwortet/);
          await text.fill("");
          assert.match(await overview.locator("button").nth(1).getAttribute("aria-label"), /offen/);
          await page.locator('[data-qid="choice"] input').last().check();
          await page.locator(".secureGap").nth(0).fill("Teil");
          assert.match(await page.locator("#secureProgressText").textContent(), /1 von 4/);
          await page.locator(".secureGap").nth(1).fill("vollständig");
          assert.match(await page.locator("#secureProgressText").textContent(), /2 von 4/);
          await page.locator(".secureGap").nth(1).fill("");
          assert.match(await overview.locator("button").nth(3).getAttribute("aria-label"), /offen/);
          await page.reload();
          await page.locator("#secureAssessment:not(.hidden)").waitFor();
          assert.equal(await page.locator('[data-qid="choice"] input').last().isChecked(), true);
          assert.match(await page.locator("#secureProgressText").textContent(), /1 von 4/);
          await page.locator(".secureConfirmOrder").click();
          assert.match(await page.locator("#secureProgressText").textContent(), /2 von 4/);
          await page.reload();
          await page.locator("#secureAssessment:not(.hidden)").waitFor();
          assert.match(await page.locator("#secureProgressText").textContent(), /2 von 4/);
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
          assert.deepEqual(errors, []);
          console.log(name, width, height, "answer state, clearing, partial gaps, reload and page width passed");
          await page.close();
        }
      } finally { await browser.close(); }
    }
  } finally { await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });
