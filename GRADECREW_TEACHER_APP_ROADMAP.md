# GradeCrew Teacher App · Roadmap

Status: architecture/start branch only. Production and current release-candidate branches remain untouched.

## Product decision

GradeCrew Teacher is a real native iPhone/iPad application built with SwiftUI. It shares GradeCrew accounts, data, backend, AI workflows, brand assets and design tokens with the web product.

Complex existing editor surfaces may initially be embedded selectively with WKWebView. The app itself is not a full-site wrapper.

GradeCrew Secure remains a separate student/exam product. It shares the GradeCrew identity where useful but prioritizes examination clarity and security.

## Shared foundation

All new Teacher UI consumes `shared/gradecrew-design/`.

Single sources of truth:

- `tokens.json` — colors, spacing, radii, sizing and motion,
- `assets.json` — canonical GradeCrew mascots and scenes,
- `assets/gradecrew/` — canonical artwork,
- generated CSS — web platform values,
- generated Swift — native platform values.

No Teacher-specific copy of Coco, Remy, Emmi or Wilma should be edited independently.

## Phase 0 — Design system and project shell

- shared tokens and asset manifest,
- token generator for CSS + Swift,
- automated stale/missing asset checks,
- Teacher Xcode project,
- SwiftUI app shell,
- iPhone + iPad adaptive navigation,
- GradeCrew shared brand components.

Exit condition: the same primary color/radius/spacing change can be made once in shared tokens and regenerated for web + Teacher.

## Phase 1 — Authentication and dashboard

- Firebase Apple SDK integration,
- same GradeCrew teacher account as web,
- sign in / sign out,
- native dashboard,
- My Tests list from the real Firestore data model,
- test status, submissions count and timestamps,
- empty state using canonical GradeCrew artwork.

Exit condition: a test created on web appears in Teacher without migration or duplication.

## Phase 2 — Test details and distribution

- native test detail screen,
- publish / close actions through existing backend rules,
- share link,
- QR code,
- test code,
- duplicate/archive/delete according to existing permissions,
- submissions overview.

## Phase 3 — Create Test

Native start surface:

- With Remy / AI,
- Manual,
- From colleague/template.

Initial implementation may open only the complex editor flow in an authenticated, app-specific WKWebView route. Landing page, web login, duplicate navigation and unrelated website chrome must not be shown.

Exit condition: a teacher can create, edit and publish a real GradeCrew test entirely from the app workflow.

## Phase 4 — Native AI creation

- native test-generation form,
- existing server-side AI endpoints only,
- same prompt/validation/quality pipeline as web,
- Remy as canonical create mascot,
- progress/recovery state,
- never embed provider API secrets in the app.

## Phase 5 — Native correction

- submissions list,
- task-by-task correction,
- free-response grading,
- half-point scale,
- teacher comments,
- AI grading suggestion where supported,
- iPad-first split view,
- later Apple Pencil enhancements.

## Phase 6 — Classes

- classes/groups,
- student codes/names according to GradeCrew privacy model,
- assign tests to classes,
- release/close tests by group,
- class results and history.

## Phase 7 — Live exam control

Connect Teacher to GradeCrew Secure / supervised web attempts:

- active candidates,
- submitted candidates,
- connection/interruption state,
- server-side attempt state,
- teacher resume/unlock action,
- extend time where permitted,
- close session.

Security decisions remain server-authoritative.

## Phase 8 — Native advantages

- camera/photo import,
- QR scanning,
- push notifications,
- native share sheet,
- Face ID/device authentication for sensitive teacher surfaces where appropriate,
- offline draft/recovery support,
- widgets/live status only where they add real value.

## Phase 9 — TestFlight and App Store

- internal TestFlight,
- small teacher pilot,
- crash/recovery validation,
- iPhone and iPad accessibility,
- App Store review package,
- privacy labels and support material.

## Design-system rule

A product may deviate from shared GradeCrew patterns only for a platform reason or a security/accessibility reason. Deviations must be documented rather than silently creating a second visual language.

Examples:

- Teacher uses native iPad navigation even if web uses a top bar.
- Secure may remove decorative artwork during an active examination.
- Both still use the same brand identity, semantic roles and accessible status language.

## First build target

`GradeCrew Teacher 0.1`

1. app launches,
2. GradeCrew shared design tokens load,
3. native adaptive shell,
4. Firebase teacher login,
5. My Tests from real Firestore,
6. test detail view,
7. create-test entry point,
8. selective web editor bridge,
9. newly created test returns to native My Tests,
10. no production changes required for local/TestFlight development.
