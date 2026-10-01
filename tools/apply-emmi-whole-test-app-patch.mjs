import fs from "node:fs";

const path = "app.js";
let source = fs.readFileSync(path, "utf8");
const bridge = fs.readFileSync("tools/emmi-editor-bridge-snippet.txt", "utf8").trim();

function replaceOnce(anchor, replacement, label) {
  const count = source.split(anchor).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one anchor, found ${count}`);
  source = source.replace(anchor, replacement);
}

if (!source.includes("emmiRevisionRunning: false")) {
  replaceOnce(
    "  aiVariantsRunning: false,\n  draftCheckpointSaved: true,",
    "  aiVariantsRunning: false,\n  emmiRevisionRunning: false,\n  emmiRevisionUndo: null,\n  draftCheckpointSaved: true,",
    "state"
  );
}

if (!source.includes("function wholeTestRevisionFingerprint()")) {
  replaceOnce(
    "\ndocument.addEventListener(\"gradecrew:variant-request\", handleVariantRequest);",
    `\n\n${bridge}\n\ndocument.addEventListener("gradecrew:variant-request", handleVariantRequest);`,
    "bridge insertion"
  );
}

if (!source.includes('document.addEventListener("gradecrew:emmi-whole-test-request", handleEmmiWholeTestRequest);')) {
  replaceOnce(
    'document.addEventListener("gradecrew:variant-kept", handleVariantKept);',
    'document.addEventListener("gradecrew:variant-kept", handleVariantKept);\ndocument.addEventListener("gradecrew:emmi-whole-test-request", handleEmmiWholeTestRequest);\ndocument.addEventListener("gradecrew:emmi-whole-test-undo", handleEmmiWholeTestUndo);',
    "event listeners"
  );
}

fs.writeFileSync(path, source);
console.log("Emmi whole-test editor bridge is present in app.js");
