"use strict";

if (process.env.GCLOUD_PROJECT === "gradecrew-staging-2026") console.info("GC-CLASSROOM-01 startup: loading assessment exports");

// One authoritative export surface for the assessment codebase. Keeping the
// lifecycle in one module prevents Firebase from accidentally deploying an
// older submit handler while CI exercises a newer one.
module.exports = {
  ...require("./lib/secure-lifecycle"),
  ...require("./lib/cleanup"),
  ...require("./lib/classroom-functions")
};

if (process.env.GCLOUD_PROJECT === "gradecrew-staging-2026") console.info("GC-CLASSROOM-01 startup: exports loaded");
