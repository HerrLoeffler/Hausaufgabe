# Secure entry logo correction

Task GC-IOS-02 / GC-RELEASE-06. User supplied a screenshot showing the old round-lock badge above the entry form in1321; the approved AppIcon uses the through-C lock.

Bounded fix: make the generated Live GradeCrewLogo.imageset use exactly the approved Brand/SecureAppIcon.png bytes, as AppIcon already does. Keep Test variant, image dimensions, entry form/labels, compact exam chrome, AAC/offline and Store build selection untouched. No new artwork or image transformations.

- [x] Reproduce actual generated asset mismatch with a failing behavioral hash test.
- [x] Reuse selected bytes and verify real generated Live/Test assets, native preview and existing relevant tests.
- [x] Review the narrow patch and integrate it into the existing gated Secure TestFlight pipeline once.
- [ ] Verify signed upload and actual TestFlight availability separately; no AppStore review submission.
