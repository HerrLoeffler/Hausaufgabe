// Extra fictional examples are included only in this explicitly isolated preview build.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const destination = process.argv[2];
if (!destination || !path.isAbsolute(destination)) throw new Error("An absolute preview directory is required.");
execFileSync(process.execPath, ["tools/build-staging.mjs", destination, "staging"], { cwd: root, stdio: "inherit" });
const output = path.join(destination, "public");
execFileSync(process.execPath, ["tools/ui/emmi-revision-scope-preview.mjs", "--export", path.join(output, "emmi-demo")], { cwd: root, stdio: "inherit" });
execFileSync(process.execPath, ["tools/browser-layout/teacher-results.cjs", "--export", path.join(output, "results-demo")], { cwd: root, stdio: "inherit" });
const hub = `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/styles.css"><title>GradeCrew Vorschau vom 18. November</title>
<main class="shell"><section class="card"><h1>GradeCrew Web-Vorschau</h1>
<p>Fiktive Beispieldaten · keine echten Änderungen. Du kannst beide Beispiele ohne Anmeldung öffnen.</p>
<p><a class="button primary" href="/results-demo/">Wilma-Sortierung und mobile Bewertung ansehen</a></p>
<p><a class="button secondary" href="/emmi-demo/">Emmi-Bereiche mit Beispielantworten ausprobieren</a></p>
<p>Bei Emmi werden Antworten simuliert. Die Serverfreigabe für echte Teilüberarbeitungen steht noch aus.</p>
<p><a href="/workspace.html?intent=login">Zur Anwendung im getrennten Testprojekt</a></p>
<p>„Nächste Person“ und die seitliche Aufgabennavigation liegen zunächst als Plan zur Freigabe vor.</p>
</section></main></html>`;
await fs.writeFile(path.join(output, "preview.html"), hub);
const manifestPath = path.join(output, "release.json");
const release = JSON.parse(await fs.readFile(manifestPath, "utf8"));
if (release.project !== "gradecrew-staging-2026") throw new Error("This fixture build is for isolated staging only.");
for (const file of ["preview.html", "emmi-demo/index.html", "emmi-demo/client.mjs", "emmi-demo/styles.css", "emmi-demo/workspace.css", "results-demo/index.html", "results-demo/fixture-results.mjs"]) {
  release.files[file] = createHash("sha256").update(await fs.readFile(path.join(output, file))).digest("hex");
}
release.previewOnly = { fictionalExamples: true, providerCalls: false, emmiScopedBackendDeployed: false };
await fs.writeFile(manifestPath, JSON.stringify(release, null, 2) + "\n");
console.log("Prepared isolated examples with " + Object.keys(release.files).length + " verified files.");
