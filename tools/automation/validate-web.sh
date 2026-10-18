#!/usr/bin/env bash

set -euo pipefail

# Fixed profile copied from verified Combined CI PR #51; controlled on main.

# Verify fresh Cloud Shell runtime

bash -n tools/cloud-shell-runtime.sh deploy-app-integration-preview.sh cloud-shell-bootstrap.sh
python3 -m unittest tools.test_cloud_shell_runtime -v

# Run unit tests

(
cd functions
npm test
)

# Check function syntax and identifiers

(
cd functions
npm run check
)

# Test secure assessment backend

test "$(node -p 'require("./assessment-functions/package.json").main')" = "main.js"
! grep -q 'require("./index")' assessment-functions/main.js
grep -q 'secure-lifecycle' assessment-functions/main.js
npm test --prefix assessment-functions
npm run check --prefix assessment-functions

# Check secure assessment browser syntax

node --check secure-assessment-client.js
node --check secure-draft-persistence.js
node --check secure-student.js
node --check secure-deadline-guard.js
node --check secure-result-policy.js
node --check secure-solution-release.js
node --check secure-assessment-teacher-polish.js
node --check startup.js

# Test shared internationalization boundary

node --check shared/i18n/i18n-core.mjs
node --check shared/i18n/browser-runtime.mjs
node --check shared/i18n/messages-de-DE.mjs
node --check shared/i18n/bootstrap.mjs
node --test shared/i18n/i18n-core.test.mjs
node --test shared/i18n/browser-runtime.test.mjs
node --test i18n-integration.test.mjs

# Test secure client boundary

node --test secure-assessment-client.test.mjs

# Test secure student persistence, renderer, deadline and result policies

node --test secure-draft-persistence.test.mjs
node --test secure-student.test.mjs
node --test secure-deadline-guard.test.mjs
node --test secure-result-policy.test.mjs

# Test controlled solution release

node --test secure-solution-release.test.mjs

# Test teacher assessment locks

node --test secure-assessment-teacher-polish.test.mjs

# Test secure routing and target rules source contracts

node --test secure-student-route.test.mjs
node --test secure-firestore-rules.test.mjs

# Test secure Firestore rules in emulator

npm run test:secure --prefix tools/rules

# Check Gate E load runner contracts

node --check tools/gate-e-load-test.mjs
node tools/gate-e-load-test.mjs --help >/dev/null
node --test tools/gate-e-load-test.test.mjs
node --check gate-e-lab.js
node --test gate-e-lab.test.mjs
bash -n deploy-gate-e-preview.sh
grep -q 'PROJECT_ID="hausaufgabe-staging"' deploy-gate-e-preview.sh
grep -q 'CHANNEL="gate-e-lab"' deploy-gate-e-preview.sh
grep -q -- '--only functions' deploy-gate-e-preview.sh && { echo 'Gate E deploy must not redeploy functions'; exit 1; } || true
grep -q 'hosting:channel:deploy' deploy-gate-e-preview.sh

# Check legacy browser app syntax and regressions

if grep -Eq '^import .*gradecrew-brand\.js|^import .*layout-enhancements\.js|^import .*variant-enhancements\.js|^import .*admin-ai-access\.js' ai-client.js; then
  echo 'Visual/admin enhancement modules must not be statically imported from ai-client.js'
  exit 1
fi
node --check app.js
node --check ai-client.js
node --check ui-enhancements.js
node --check visual-enhancements.js
node --check first-guide-guard.js
node --check teacher-copy-polish.js
node --check gradecrew-tour.js
node --check gradecrew-tour-v7.js
node --check gradecrew-tour-v8.js
node --check tutorial-ordering-guard.js
node --check tutorial-variant-fallback.js
node --check crew-tour-hardening.js
node --check crew-tour-gc22-polish.js
node --check crew-tour-gc23-polish.js
node --check crew-tour-gc24-polish.js
node --check crew-tour-gc25-final-polish.js
node --check crew-tour-gc26-story-polish.js
node --check student-attempt-guard.js
node --check remy-ai-help.js
node --check gradecrew-brand.js
node --check layout-enhancements.js
node --check variant-enhancements.js
node --check tutorial-variant-fallback.js
node --check admin-ai-access.js
node --check editor-drafts.js
node --check ai-review-state.js
node --check ordering-grading.mjs
node --check first-guide-responsive.js
node --check crew-tour-responsive.js
node --check mobile-viewport-polish.js
node --check tools/generate-gradecrew-design.mjs
node --test gradecrew-design-foundation.test.mjs
node --test gradecrew-brand-assets.test.mjs
node --test first-guide-responsive.test.mjs crew-tour-responsive.test.mjs assessment-receipt-check.test.mjs
node --test diagnostics.test.mjs
node --test crew-art.test.mjs
node --test ai-*.test.js
node --test ordering-grading.test.mjs
node --test gradecrew-tour.test.mjs
node --test gradecrew-tour-v8-dashboard.test.mjs
node --test tutorial-ordering-guard.test.mjs
node --test crew-tour-gc23-polish.test.mjs
node --test crew-tour-gc24-polish.test.mjs
node --test crew-tour-gc25-final-polish.test.mjs
node --test crew-tour-gc26-story-polish.test.mjs
node --test student-attempt-guard.test.mjs
node --test remy-ai-help.test.mjs
test -f assets/gradecrew/brand-primary-v1.svg
test -f assets/gradecrew/penguin-guide.svg
test -f assets/gradecrew/elephant-create.svg
test -f assets/gradecrew/fox-improve.svg
test -f assets/gradecrew/owl-grade.svg
test -f assets/gradecrew/crew-lineup.svg
test -f assets/gradecrew/demo-cat.svg

# Test integrated Crew, admin, login and tutorial contracts

node --check crew-assistant-ui.js
node --check crew-telemetry-client.mjs
node --check crew-statistics-admin.mjs
node --check emmi-whole-test-revision.mjs
node --test crew-assistant-core.test.mjs emmi-whole-test-bridge.test.mjs
node --test admin-test-account-controls.test.mjs staging-short-login.test.mjs tutorial-choice-v1.test.mjs

# Smoke test staging build

BUILD_DIR="$(mktemp -d)"
node tools/build-staging.mjs "$BUILD_DIR"
test -f "$BUILD_DIR/public/generated/gradecrew-design-tokens.css"
test -f "$BUILD_DIR/public/generated/gradecrew-assets.js"
test -f "$BUILD_DIR/public/gradecrew-logo.css"
test -f "$BUILD_DIR/public/assets/gradecrew/brand-primary-v1.svg"
test -f "$BUILD_DIR/public/gradecrew-dashboard-foundation.css"
test -f "$BUILD_DIR/public/shared/i18n/i18n-core.mjs"
test -f "$BUILD_DIR/public/shared/i18n/browser-runtime.mjs"
test -f "$BUILD_DIR/public/shared/i18n/messages-de-DE.mjs"
test -f "$BUILD_DIR/public/shared/i18n/bootstrap.mjs"
test -f "$BUILD_DIR/public/tutorial-ordering-guard.js"
test -f "$BUILD_DIR/public/secure-student.html"
test -f "$BUILD_DIR/public/secure-draft-persistence.js"
test -f "$BUILD_DIR/public/secure-student.js"
test -f "$BUILD_DIR/public/secure-assessment-client.js"
test -f "$BUILD_DIR/public/secure-deadline-guard.js"
test -f "$BUILD_DIR/public/secure-result-policy.js"
test -f "$BUILD_DIR/public/secure-solution-release.js"
test -f "$BUILD_DIR/public/secure-assessment-teacher-polish.js"
test -f "$BUILD_DIR/public/gate-e-lab.js"
grep -q 'shared/i18n/bootstrap.mjs' "$BUILD_DIR/public/secure-student.html"
grep -q 'secure-draft-persistence.js' "$BUILD_DIR/public/secure-student.html"
grep -q 'secure-deadline-guard.js' "$BUILD_DIR/public/secure-student.html"
grep -q 'secure-result-policy.js' "$BUILD_DIR/public/secure-student.html"
grep -q 'secure-solution-release.js' "$BUILD_DIR/public/secure-student.html"
grep -q 'hausaufgabe-staging' "$BUILD_DIR/public/firebase-config.js"
