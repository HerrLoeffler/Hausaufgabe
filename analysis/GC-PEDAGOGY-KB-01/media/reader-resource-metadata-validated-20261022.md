# Private source metadata check — 22 October 2026

## Scope and method

This is an **input and metadata check**, not a full book, task, solution, or curriculum analysis. I checked all nine acquisition records against their private original files. PDFs were opened locally with bundled `pypdf`; opening pages and relevant front matter were read, including cover/title page, introduction, and contents where present. Representative covers were rendered with bundled `pdftoppm` and visually inspected. The legacy `.doc` was converted transiently with macOS `textutil` for text reading; its original file was not changed. No title, author, publisher, ISBN, or original filename is reproduced here.

Detailed field-level entries and page locators are in the companion JSONL. `source_confirmed` is used only where the checked original itself supports the field. Estimates are marked with a reason; unsupported fields remain unresolved. Publication and printing dates are separate. No entry grants curriculum mapping or runtime release.

## Findings

- **Three original resources clearly identify a first-class Bavaria primer/workbook family.** The teacher material front matter identifies a first-class primer, its contents and concept section concern reading and writing, and the relevant cover/print pages identify Bavaria and dates. Companion workbook and copying-template covers independently show first grade and Bavaria. School type is left as estimated where the specific cover only says first grade.
- **The standalone assessment PDF has no title/grade/state/year statement in its checked opening pages.** Its opening activity pages show beginning reading and writing. Those pages support a subject estimate, not a source-year or jurisdiction claim. The shared reader reference does not transfer provenance automatically.
- **The phonics-card bundle proves the German letter/sound purpose, but its own checked front matter does not identify grade, school type, state, or country.** A 2019 print note is visible; it does not establish a particular grade.
- **The PDF scope/sequence document explicitly identifies a Bavaria first-school-year primer and cites German learning-area labels.** Its opening table ties the primer, workbook, and copying templates to competency references. No edition year was located in the checked front matter.
- **The editable scope/sequence document has no usable cover or explicit grade header.** Normalized text confirms German learning-area references and mapping to primer/workbook pages. Its 2014 file metadata is not treated as a publication year. Grade remains an estimate; school type, jurisdiction, and edition year remain unresolved.
- **The standalone phonics image shows German letter/initial-sound material only.** No grade, school type, jurisdiction, or year is printed on the image.
- **The second reader resource is a mathematics teacher-material set for volume 1, Bavaria.** Its cover identifies Bavaria, the subject and volume; contents include the first school year; the concept section names the elementary curriculum framework. The print note says 2021; no copyright year was established from checked pages.

## Supplementary original image, R115

This is outside the nine acquisition rows and is recorded separately so its provenance is not merged into them. The private original image is page 8, with SHA-256 `0013cff36fb3ae6f7ef8de9c6a983bc9b336e0fc286e48036b56d5ff6ffba093`; a private evidence copy is under `private-archive/metadata-check-20261022/r115-page8-original.png`. The page itself depicts mathematics multiplication content. The grade-4 / Grundschule / Bayern source context is supported by the prior 164-page commentary and regular reader description as specified in the existing handoff. Keep the locators distinct: the commentary is PDF page 22, while the depicted student-book page is printed page 8. The PNG itself is the original student-page image; its hash and printed-page locator do not stand in for the commentary citation. This check does not alter any commentary, didactics, transfer, or database register.

## Limits

Some original bundles are collections rather than self-contained books, so a resource-level grade or state cannot be assumed from an adjacent item. Missing cover/title pages stay open. The checked pages establish metadata and broad subject only; they do not prove complete content coverage, correctness of individual answers, legal usage rights, current curriculum validity, transfer suitability, or release readiness. No browser, downloads, Git operations, product tests, or external services were used.
