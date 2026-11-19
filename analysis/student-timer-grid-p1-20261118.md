# Student timer and number grid · existing GC-WEB-REPAIR-20261007 / GC-PEDAGOGY-KB-01

Isolated specialist `student_right_submit`, branch `fix/student-timer-grid-p1-20261118`, base actual live d67b0b5. Parent verified main609b644 and owns shared handoff/TODO/STATE, integration, exact CI and release. Original tasks, budgets and provider history retained. No deploy, external message, provider, real student/account data or native changes.

Native worktree tool did not return an operation ID after several minutes; no second native request. Parent explicitly authorized local Git fallback. Sole writing checkout is work/student-timer-grid-p1-20261118 on d67b0b5. Any late native checkout remains unused/read-only. Requested/actual runtime model and effort unknown; no model switch.

## Reproduction and change

Baseline 9 focused tests passed. New synthetic real Secure100-task browser reproduction failed: after instantaneous1600pxscroll timer top−1481px/bottom−1401px; existing titlecard timer had left viewport. Overview single186pxcolumn, number font0px and full 'Aufgabe1 · beantwortet' pseudo-label. Screenshot and geometry `/tmp/gc-student-timer-grid-red/`.

Moved the original timer node in initial markup into the existing sidebar for both Secure and legacy student renderer. Wide timer stays above progress/grid with submit below, outside the only scrolling grid. Compact timer is a44px-minimum sticky line below the existing header, using measured timer height and safe-area offset. Titlecard remains ordinary flow. Secure server-time calculation, deadline guard, API, frozen snapshot and typed ABGEBEN/SUBMIT confirmation unchanged. No secure-student.js changes.

Both sidebars show a3-column number grid with44px-minimum cells, numbers and existing answered check only. Full aria-label/title/open/answered state retained; active item has a separate outline and answered state stays green. Existing answerIsComplete definition unchanged, including partial gaps/matching and touched ordering. Clearing reopens the number. Grid auto-scroll reveals newly active item without moving document scroll or fighting a manually scrolled overview. One input/audio tree is preserved on resize; sidebar breakpoint remains1180CSSpx/600CSSpxheight and existing question width/fonts unchanged.

Real WebKit test found a previously hidden pointer bug now that numbers are visible text: after textarea blur, progress repaint rewrote unchanged button text and the click never arrived. RED text-node identity test reproduced it. Shared answer-completion.mjs now skips an unchanged textContent write; no completion-definition change. Real WebKit mouse click then passed. This applies to both existing Secure and actual legacy callers.

## Verified locally

- Root and tools/ui:829/829 tests passed with existing dependency symlinks. Command: NODE_PATH=tools/ui/node_modules node --experimental-vm-modules --test *.test.mjs *.test.cjs tools/ui/*.test.cjs tools/ui/*.test.mjs. Log `/tmp/gc-timer-grid-root-ui-final.log`.
- Focused navigation/completion:12/12 passed. RED timer/sidebar contract and unchanged-number text identity failures observed before their fixes. Tests also verify active grid reveal does not reset manual scroll.
- New Chromium/WebKit matrix24/24 passed: real Secure renderer + legacy fixture using actual enhancement;30/50/100tasks,1180×700 and390×700. Every case additionally rotates to700×390, shrinks to390×400, uses590×350 equivalent200%CSS width, then restores initial viewport. Timer remains visible after page scroll; grid numbers/font/ARIA, actual last-number clicks, bounded grid and active visibility, wide submit reachability, answer/check clearing, no horizontal overflow and input identity/value/focus preserved. Evidence `/tmp/gc-student-timer-grid-green/verification.json` and screenshots.
- Existing layout/audio36/36 passed; node identity/audio position and fonts/task width retained. Log `/tmp/gc-timer-grid-sidebar.log`; evidence `/tmp/gc-timer-grid-sidebar/`.
- Existing real Secure completion/persistence journeys8/8 passed: clearing, partial gaps, ordering and reload. Log `/tmp/gc-timer-grid-progress.log`.
- Existing full submission journeys18/18 passed: DE/EN, typed word, Escape/cancel, offline draft reload/retry and separate deadline-guard abort/frozen retry. Log `/tmp/gc-timer-grid-submit.log`.

Browser transports wholly synthetic, no actual save/backend calls. CSS viewport simulation is not a physical-device, actual keyboard, screenreader or OS dictation acceptance. Native owner separate.

## Assurance and integration

SEC08 authority: no API/grading/deadline changes; existing callable/frozen submission tests passed. SEC15 scoped DOM rendering uses existing textContent and retains nodes on unchanged paint. PRIV07 no new stored data or external service. PRIV15 controls remain keyboard accessible with44px targets/full labels, active item independent of completion. No legal/whole-project certification claimed.

app.js diff is only relocation of studentTimerBar in renderStudentQuiz around7686, no Wilma/results region. Shared answer-completion.mjs is a2-line UI-paint guard only. Existing root/coordination docs untouched. Parent should add new tools/browser-layout/student-timer-grid.cjs to exact browser acceptance workflow if desired; its all-scenarios run is bounded24cases. Local node_modules symlinks remain untracked test setup only. Stage branch_only; independent review, exact integrated CI and any release belong to parent.
