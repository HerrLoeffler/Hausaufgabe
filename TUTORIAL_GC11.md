# GradeCrew gc11 — actual product onboarding

Replaces gc10's isolated practice simulation. The only modal is the welcome image: all four smiling crew members. Coco (penguin) guides, Remy (elephant) creates, Emmi (fox) reviews/improves/adds variants, Wilma (owl) appears for submission assessment. Names live in the CREW constant.

The coach points at ordinary app controls without an overlay, click interception or global DOM observer. Its desktop side column and mobile top area reserve space in the layout. Closing the coach or leaving the guided route stops the tutorial, not an already running real exam.

Flow: New test → AI creation → prefilled real form → actual Create button → persisted prepared test after a minimum three-second preparation → actual editor → real edit panel with prepared response → actual variant queue/dialog with prepared response → delete the original item to retain 10 questions → settings → publish → same-tab real student page → name/alias → one-minute timer → real submission → real results → normal manual assessment and save.

The 10-point English test contains ten short tasks, three original vector illustrations, native gap-fill and ordering controls, and a manually reviewed free-text colour answer. The QR/code are real. The teacher owns the clearly labelled exercise test; questions, timed attempt and submission use existing Firestore paths. Test and result remain available. There is no synthetic score or alternate student form.

Prepared responses apply only to the active tour's exact quiz and account. Synthetic exercise feedback is excluded from shared AI-quality feedback. Ordinary tests still use the existing AI path. No Firebase rules, backend functions or production deployment changed. Existing security limitations of ordinary tests are not claimed to be fixed by this UI work.

Submission transitions happen only after addDoc resolves. Manual/timer overlap is guarded, including a second click after the attempt state has been cleared. Failed writes keep a retryable form. An expired timer no longer installs a useless interval after triggering immediate submission. Local timer cleanup cannot turn a successful write into a displayed save failure.

Validation: behavior tests cover welcome, real route transitions, exact preparation delay, account/abort isolation, persistence payloads, actual student renderer and image widgets, 60-second automatic submission, acknowledged submission persistence, duplicate submission prevention and failed-write recovery; existing 43 regression/unit tests; static staging build. Crew and exercise SVGs were rendered and visually inspected. Authenticated live Chrome/Safari end-to-end testing remains required after deployment; this environment has no Firebase deployment credentials.
