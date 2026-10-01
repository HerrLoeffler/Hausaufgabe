> **Historische Übergabe (29.09.2026).** Aktueller gemeinsamer Einstieg: [START_HERE.md](START_HERE.md). Branches und Aufgaben stehen in `GRADECREW_STATE.json` und `workstreams/`. Die folgenden Aussagen wurden hier nicht erneut als aktueller Release-Stand bestätigt.

# GradeCrew – Cross-Chat Status

> **Purpose:** This file is a compact handoff for new ChatGPT/Work chats. It is documentation only and must never be treated as production configuration.
>
> **Rule for every new chat:** Read this file first, then verify the actual GitHub branch tip/commits and the current Staging state before changing code. If this file and GitHub disagree, GitHub/current deployment wins.

**Last updated:** 2026-09-29

## Quick start for a new chat

Use this instruction:

> Weiter mit GradeCrew. Lies zuerst `GRADECREW_STATUS.md`. Prüfe danach den dort genannten aktuellen Arbeitsbranch, dessen neuesten Commit und den tatsächlichen Staging-Stand. Arbeite ausschließlich auf Staging, solange ich keinen Live-Deploy ausdrücklich freigebe. Aktualisiere `GRADECREW_STATUS.md` am Ende größerer Arbeitsschritte.

## Repository and environments

- Repository: `HerrLoeffler/Hausaufgabe`
- Default branch: `main`
- Staging Firebase project: `hausaufgabe-staging`
- Staging URL: `https://hausaufgabe-staging.web.app`
- Production Firebase project: `hausaufgabe-40294`
- Production URL: `https://hausaufgabe-40294.web.app`

## Current staging work

- **Current working branch:** `fix/gradecrew-staging-release-final`
- **Last observed branch tip:** `b2ed551466ecd81335dd321556a3aa20a186a07f`
- Latest commit message at time of this update: `Test legacy Remy preference copy replacement`
- This branch is the current GradeCrew tutorial/mobile release-polish line and is **not automatically approved for production**.

### Recently completed on this line

- Fixed scrolling and save-button overlap in the tutorial free-answer review on mobile.
- Polished the guided-tour wording around persistent **Remy** preferences versus one-test-only wishes.
- Added an isolated `GradeCrew Secure` iPad prototype and gated AAC hardware lab. Keep this isolated from normal web production behavior unless explicitly working on the native secure-assessment project.

## Last known safe production baseline

- **Verified live tag:** `v2.3.0_live_verified`
- **Verified live commit:** `80fc053b4c9270b19a0b835ad4e46b07e5d844aa`
- Treat this as the known rollback/reference point until a newer production release is explicitly tested and tagged as verified.

## Current release status

- Live remains on the verified V2.3.0 baseline unless a later production deployment is explicitly confirmed.
- Staging contains substantially newer GradeCrew work, including tutorial/mobile polish.
- Do **not** infer that the newest staging commit is release-ready merely because it exists in GitHub.

## Open checks / possible issues

These are verification items, not all confirmed bugs:

1. Re-run the complete GradeCrew tutorial on desktop and mobile after the latest Remy copy replacement.
2. Re-check free-text grading on narrow mobile screens: scrolling, keyboard, score controls and save button must never cover one another.
3. Check tutorial cards/overlays for small edge artifacts or stray visual flecks on different viewport sizes.
4. Confirm the red-smiley explanation still makes clear that a teacher can also simply correct/change the answer itself when appropriate, not only report or replace the generated task.
5. Confirm the latest tutorial wording is consistent everywhere and no legacy text remains.

## Next 5 tasks

1. Validate the current branch tip on Staging, including a full clean tutorial run.
2. Test the tutorial and free-text review on at least one narrow phone viewport plus desktop/tablet widths.
3. Resolve only remaining reproducible polish bugs; avoid unrelated refactors before release.
4. Run a final Staging release audit and record the exact commit that passed it.
5. Only after explicit approval: prepare the production deploy, verify production manually, then create a new immutable `*_live_verified` tag.

## Important technical decisions

- **Staging first.** New development and fixes are tested on `hausaufgabe-staging` before production.
- **Production needs explicit approval.** Never deploy to `hausaufgabe-40294` merely because Staging looks good.
- Keep production and staging Firebase configuration separate.
- Preserve rollback points/tags; verified tags are historical safety anchors, not moving labels.
- The native `GradeCrew Secure` / AAC work is a separate, gated path and must not silently change normal browser assessments.
- For status questions, inspect actual repository/deployment state instead of trusting old chat memory alone.

## Do not change / do not break

- Do not overwrite or move `v2.3.0_live_verified` or older verified backup tags.
- Do not accidentally deploy Staging Firebase configuration to production.
- Do not expose API keys, secrets or credentials in this file or in commits.
- Do not make an unverified feature/fix branch the production source without a deliberate release step.
- Do not remove working mobile/tutorial fixes while polishing unrelated UI.
- Do not activate experimental AAC/native secure-assessment behavior in the normal web app without an explicit task to do so.

## How to maintain this file

After a meaningful GradeCrew work session, update only what changed:

- current working branch and tip commit
- last safe live tag/commit
- recently completed changes
- open bugs/checks
- next tasks
- new architectural decisions or red lines

Keep it short enough that a new chat can understand the project state in a minute. Detailed history belongs in Git commits/issues, not here.

