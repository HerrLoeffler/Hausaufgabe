# GradeCrew Homepage Release Implementation Plan

Goal: Publish the approved ten-question homepage on gradecrew.de and preserve its creation method for future AI-assisted tests.
Architecture: Keep the exact live teacher/student app at workspace.html; package the approved public homepage separately. Legacy root query links hand off to workspace.html with their query and hash intact. No Functions, Rules, email or auth rollout.
Tech stack: Existing vanilla ES modules, Firebase classic Hosting and SHA-256 release manifest.
Spec: User approval25Oct2026, GC-DESIGN-05, prototype README/HANDOFF in the ChatGPT project.

## Constraints / review focus
- Existing test/preview/login/register/reset links and authenticated app must work.
- Approved ten cards, reversible answers, local grading, original Remy audio and transparent Crew retained.
- DE/EN and narrow/short viewports remain usable. Legal and pupil entry links remain reachable.
- Demo answers are public practice data; actual assessment answers remain server controlled.
- No claim that client demo widgets are supported by the production AI schema.

## Tasks
- [ ] Save approved source/assets under homepage/, excluding earlier variants and private previews.
- [ ] Add tested legacy query handoff, same-origin auth links and explicit app/legal access.
- [ ] Extend existing Hosting builder, including workspace.html and all homepage assets in release hashes.
- [ ] Document design workflow, ten-task mapping, data schema/generator limits and adaptation checklist under docs/learning.
- [ ] Run homepage/grading/routing/build checks and browser smoke; request independent exact-scope review.
- [ ] Secure source in a PR, verify exact CI, publish preview, then approved production Hosting only; verify all hashes and live routes; record receipts/status.
