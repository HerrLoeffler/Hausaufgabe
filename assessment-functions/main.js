"use strict";

// One authoritative export surface for the assessment codebase. Keeping the
// lifecycle in one module prevents Firebase from accidentally deploying an
// older submit handler while CI exercises a newer one.
module.exports = {
  ...require("./lib/secure-lifecycle"),
  ...require("./lib/cleanup"),
  ...require("./lib/telemetry"),
  ...require("./lib/telemetry-ai")
};
