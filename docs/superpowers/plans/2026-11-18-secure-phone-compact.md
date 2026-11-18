# Secure iPhone compact exam chrome

Task: GC-RELEASE-06, follow-up to sidebar release1313. Owner: GC iPhone & iPad.

Goal: give iPhone questions/answers more usable space without shrinking their typography or changing iPad task width.

Design: Native title/clock one compact row on widths below600pt or height below500pt. Full test title and participant available through a44pt info action. Footer uses its existing compact status action and44pt submit. Web navigation on phone widths<=500px/shortheight<500px shows only Previous, current count, Next, Overview until opened. Grid/progress remain accessible by opening Overview; answer DOM is never rebuilt. Standard iPad header and1180px sidebar contract unchanged.

Alternatives considered: reducing task font rejected (explicit previous user constraint); hiding timer rejected (exam requirement). Keep regular task fonts and compact only supporting controls. This is a bounded implementation choice within Martins direct request to revise the oversized phone header.

- [ ] Add real SwiftUI height-budget and WebKit closed/open/jump tests; demonstrate baseline failures.
- [ ] Implement compact native header/footer selection and on-demand phone number grid.
- [ ] Verify phone regular/large text, portrait/landscape/keyboard, tablet preservation, answers and confirmation regressions.
- [ ] Independently review exact patch; preserveAAC/offline/deadline code.
- [ ] Integrate into existing native release branch, run gated TestFlight pipeline once; Store1293 unchanged.

Release1313: Martin confirms actual TestFlight availability18Nov. Device complaint is source of this follow-up, not an automatic pass for1313layout. Apple90725email says futureApril2027SDKrequirement;1313delivery accepted. Do not change SDK just for warning within small UI patch without verifying CI support.
