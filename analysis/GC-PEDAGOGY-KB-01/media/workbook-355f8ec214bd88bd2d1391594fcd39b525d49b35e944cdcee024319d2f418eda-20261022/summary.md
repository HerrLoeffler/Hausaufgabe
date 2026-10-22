# Private workbook review — checkpoint 1

## Aktueller Gesamtstand (2026-10-22)

- Erstlektüre und Vollseiten-Bildsichtung aller 168 PDF-Seiten abgeschlossen. Die privaten Textauszüge, Renderbilder und Seiten-/Aufgaben-/Bildregister sind persistiert. Dies ist eine Eingangs- und Metadatenprüfung mit Autor-Erstbefund, keine vollständige fachliche Verifikation oder Freigabe.
- 168 Seitenrecords, 379 Aufgaben-/Aufgabengruppenrecords und 168 seitenbezogene Visualrecords; finale Strukturprüfung: Seitenfolge 1–168, eindeutige Aufgaben-IDs und auflösbare Seitenverweise.
- Offene Quellenabhängigkeiten: insbesondere PDF-Seite 164, Fragen 1–4 benötigen Abgleich mit den jeweiligen Originalgeschichten. Der gedruckte Antwortschlüssel belegt die vorgesehenen Optionsbuchstaben, aber nicht die erzählten Sachverhalte. Frage 3 lautet im Schlüssel Kohlmeise → R; Blaumeise → O. Das Lösungswort allein ist keine vollständige Fachprüfung. Auf PDF-Seite 99, Aufgabe 3, widerspricht der grüne Schlüssel („ja“) zur Aussage „Eine Sternschnuppe ist ein Himmelskörper“ der unabhängigen Quellenbewertung („nein“): NASA/JPL beschreibt einen Meteor als Lichtphänomen; Meteoroid bezeichnet den physischen Körper ([NASA/JPL Fast Facts](https://www.jpl.nasa.gov/asteroid-watch/fast-facts/), Abschnitt „Meteor“; geprüft durch Root). Auch der nummerierte Lesepfad auf PDF-Seiten 162–163 ist nur teilweise durch grüne Verbindungen belegt; fehlende Übergänge bleiben offen.
- PDF-Seite 161 enthält sowohl die Verbkorrektur im Spielplatztext als auch den Weltraumtext mit fünf Belegfragen; beide Aufgabenbereiche sind als separate Records vorhanden.
- Inhaltliche Detailprüfung und Bild-/Wort-Zuordnungen bleiben für die unabhängige Zweitprüfung offen. Der naturwissenschaftliche Konflikt auf PDF-Seite 99 ist als Quellenwiderspruch dokumentiert; die unabhängige Bewertung „nein“ gilt nur für Aufgabe 3, Item 1 und ersetzt nicht die Prüfung der übrigen Aussagen. Status aller Records: author_checked=true, independent_review_pending=true, runtime_release=false. Schulart ist estimated; Bayern explizit; Jahrgang 1 belegt die Einleitung auf PDF-Seite 3.

## Historische Checkpoints

Die folgenden Checkpoints dokumentieren den Stand jeweils zum damaligen Bearbeitungszeitpunkt. Frühere Formulierungen wie „Seiten noch unreviewed“ sind historische Momentaufnahmen und nicht der aktuelle Gesamtstand.

## Scope

Source: internal acquisition record `355f8ec214bd88bd`, revision acquired 2026-10-21. The reviewed metadata file supplies subject Deutsch / Schriftspracherwerb, source grade 1 (explicit in PDF page 3 introduction, which refers to the first class), school type Grundschule (estimated from first-class material; not printed on the cover), and Bavaria (explicit). No curriculum mapping or runtime release is inferred. This is task inventory and answer review, not a complete pedagogical acceptance decision.

## Checkpoint 2026-10-22 — PDF pages 1–10 / 168

- Read original text for all 10 pages and visually inspected a page-size rendering of every page. Private text and renders are stored under `private-archive/workbook-355f8ec214bd88bd2d1391594fcd39b525d49b35e944cdcee024319d2f418eda-20261022/`.
- Recorded 10 page records, 26 distinct activity/model-step records, and 5 visual-evidence records. Front matter and the introductory page are recorded as reviewed pages; explanatory examples were not double-counted as new exercises when they point to later actual tasks.
- The visible worked SOFA process is captured as five separate modeled actions. Pages 9–10 have personal/open/environment-dependent responses rather than a single key.
- Image dependent responses are recorded for pages 5, 8 and 10. Page 5 remains unresolved because its instruction text is absent and the printed green connections may be a solution layer. On page 8, cue naming depends on language labels; image matching is clearer than naming alone. On page 10, green circles are treated as examples, not an exhaustive key.

## Data conventions

`pages.jsonl` preserves every inspected page, page number, brief content summary, text/image review state and task IDs. `tasks.jsonl` uses one ID per recognizable action, including open prompts and modeled steps; regions are normalized full-page or approximate task areas. `visuals.jsonl` stores only image interpretations that affect the task or answer. Every task is marked `author_checked`, `independent_review_pending`, and `runtime_release: false`; my own working is not represented as independent review.

## Remaining work

Pages 11–168 remain unreviewed. Continue in 10-page packages (or up to 20 where density permits), rendering and reading every page, reconciling tasks and answer marks, then append page/task/visual records and update this checkpoint before moving on. Keep unresolved sound/image labels open while continuing other pages.

## Checkpoint 2026-10-22 — PDF pages 11–20 / 168

- Read and visually inspected every page in this second package; private text/renders for pages 11–20 were saved alongside the first package.
- Added 10 page records, 33 task/action records with separate item IDs for repeated word/picture subtasks, and 9 page-specific visual records. Overall progress: 20/168 pages; 59 task/action records and 14 visual records.
- Independently worked the clear rhyme, syllable, onset and vowel examples against visible green answer markings. Several image-dependent assignments are deliberately left unresolved: the upper rhyme scene on page 12; tiny image/pattern sets on page 15; object labels that change the initial sound on page 16; and possible letter/image mismatches in the page 18 word riddles and page 20 O/Ö cue. The review continues on other pages without treating these as resolved.
- Package mapping check confirmed page records 1–20 are unique and ordered, and every task ID referenced by a page has a matching task record. Task records preserve `independent_review_pending: true` and `runtime_release: false`.

Next package: PDF pages 21–30. Pages 21–168 remain unreviewed.


## Checkpoint 2026-10-22 — PDF pages 21–30 / 168

- Read original text and visually inspected full-page renders for pages 21–30. Private text and image copies were saved under the archive folder.
- Added 10 page records, 32 task/action records, and 7 visual records. Current cumulative totals are 40 pages, 118 tasks/actions, and 29 visuals.
- Page 32 has many ambiguous picture-to-syllable options; assignments are preserved unresolved pending the referenced cut-out page and accurate image naming. Pages 34–35 retain uncertainty around small ch/onset images and prefilled matching marks. The written examples for the AU cue consistently treat AU as a joined sound-table item.
- Validation: page records cover pages 1–30 uniquely and in order; every page task ID resolves to a task record; all tasks retain author_checked, independent_review_pending, runtime_release=false.

## Checkpoint 2026-10-22 — PDF pages 31–40 / 168

- Read text and viewed a full-page render for all ten pages. Pages 39–40 repeat visual material from pages 37–38 (the printed numbering also repeats 37–38); records preserve this scan duplication instead of treating it as new unique content.
- Added 10 page records, 32 task/action records, and 7 visual records. Current cumulative totals are 40 pages, 118 tasks/actions, and 29 visuals.
- Page 32 syllable/picture choices and page 37 onset matching remain unresolved where picture labels or overlapping lines prevent a reliable answer. Open letter and personal-interest tasks carry open response criteria.
- Validation: pages 1–40 unique and ordered; every referenced task ID resolves; all source grade and school/jurisdiction fields derive from validated resource metadata; task state remains author_checked, independent_review_pending, runtime_release=false.

Next package: PDF pages 41–50. Pages 41–168 remain unreviewed.


## Checkpoint 2026-10-22 — PDF pages 41–50 / 168

- Read original text and viewed full-page images for all ten pages; private text and renders are saved in the workbook archive folder.
- Added 10 page records, 24 task/action records, and 10 visual records. Current cumulative totals: 50 pages, 142 tasks/actions, 39 visuals.
- Pages introduce L, S, N and Sch; pages include grapheme formation, syllable-image matching, visual searches, phoneme spelling and open writing. I left image-label/answer-mark conflicts open on the Sch page and marked small word grids/maze endpoints as uncertain.
- Source grade for this workbook is explicit in PDF page 3 introduction: the text refers to the first class; the standalone cover “1” alone is not used as grade evidence. School type remains estimated, jurisdiction is explicitly Bavaria. All tasks retain author_checked, independent_review_pending, runtime_release=false.
- Validation: pages 1–50 unique and ordered; page task references resolve; private page renders exist.

Next package: PDF pages 51–60. Pages 51–168 remain unreviewed.


## Checkpoint 2026-10-22 — PDF pages 51–60 / 168

- Read original text and inspected full-page renders for each page. Private renders and text are stored in the archive folder.
- Added 10 page records, 21 task/action records and 10 visual records. Cumulative totals: 60 pages, 163 tasks/actions and 49 visuals.
- Pages cover M/N contrast, early-reader picture/word work, a recipe sequence, and P/T literacy tasks. I preserved answer-mark conflicts and uncertain picture labels on page 56 and 59 rather than correcting from OCR. PDF pages 59–60 visually repeat printed pages 57–58; both source pages remain individually represented.
- Source grade 1 remains explicit from the introduction on PDF page 3; every task remains author_checked, independent_review_pending, runtime_release=false.
- Validation: pages 1–60 unique and ordered; all page task IDs resolve; renders for pages 51–60 present.

Next package: PDF pages 61–70. Pages 61–168 remain unreviewed.


## Checkpoint 2026-10-22 — PDF pages 61–70 / 168

- Read original text and viewed a full-page render for every page. Private copies remain under the archive folder.
- Added 10 page records, 21 task/action records and 10 visual records. Cumulative totals: 70 pages, 184 tasks/actions and 59 visuals.
- This package moves from K into plosive contrasts P/B, T/D, K/G and later R/ER. Audio-dependent exercises on pages 63–64 remain open without recordings; several picture-grid or cluster strings are also flagged where the static image does not establish an exact response.
- Source grade remains explicitly evidenced by the page 3 introduction; review state remains author_checked, independent_review_pending, runtime_release=false.
- Validation: pages 1–70 unique and in order; page/task links resolve; private renders exist for pages 61–70.

Next package: PDF pages 71–80. Pages 71–168 remain unreviewed.


## Checkpoint 2026-10-22 — PDF pages 71–80 / 168

- Read extracted page text and viewed full-page renders for pages 71–80; stored page images/text remain in the private archive.
- Added 10 page records, 21 task/action groups and 10 visual records. Cumulative totals: 80 pages, 205 task/action groups and 69 visuals. Group records include item-level subtasks where discrete responses are visible; open response exercises remain open.
- Topics: D/T listening, sentence completion, noun categories/articles, H and F literacy, word boundaries, sentence-picture reading and clue matching. Audio-dependent D/T and Fr/Fl decisions remain unresolved where the recording or exact pictured label is absent. Page 78 sentence-picture handwritten numbers conflict with the scene-based mapping, so the conflict is recorded. Page 79 clue connectors and image labels remain uncertain.
- Grade 1 remains supported by the explicit introduction evidence on PDF page 3; school type remains estimated, Bavaria explicit. All records are author_checked, independent_review_pending=true, runtime_release=false.
- Validation: pages 1–80 unique and ordered; page/task references resolve; renders exist for pages 71–80.

Next package: PDF pages 81–90. Pages 81–168 remain unreviewed.

- Correction: two different activities on PDF page 32 had shared task ID `wb355-p032-t011`; the picture-card cut-and-paste activity now has ID `wb355-p032-t012`, including its page reference and subtask ID.


## Checkpoint 2026-10-22 — PDF pages 81–90 / 168

- Read extracted text and viewed a full-page image for every page in this package, including the cutout appendix and blank back cover.
- Added 10 page records, 19 task/action group records and 10 visual records. Cumulative totals: 90 pages, 224 task/action groups and 79 visuals. Item-level examples are represented as subtasks; open production remains open.
- The W/Ei units, articles and noun-classification exercises have visible modeled responses. The syllable-count sort has no colored grouping marks; on the cumulative noun review, crossed words conflict with the plain noun criterion and remain unresolved. The cutout appendix contains multiple page-referenced card groups, including three repeated card sheets.
- Grade 1 remains sourced explicitly to the introduction on PDF page 3; school type remains estimated, Bavaria explicit. All records remain author_checked, independent_review_pending=true, runtime_release=false.
- Validation: PDF page records 1–90 ordered and unique; all task references resolve and all new task IDs are unique; private renders exist for pages 81–90.

Next package: PDF pages 91–100. Pages 91–168 remain unreviewed.


## Checkpoint 2026-10-22 — PDF pages 91–100 / 168

- Read extracted text and viewed a full-page render for each PDF page 91–100, including front matter and new section pages.
- Added 10 page records, 14 task/action group records and 10 visual records. Cumulative totals: 100 pages, 238 task/action groups and 89 visuals. Front matter pages are represented as non-task pages without copying identifying publication details into the register.
- The new section covers St/Sp, Sch/St/Sp listening and spelling, sentence matching, plus a factual reading passage. Audio-dependent listening marks remain provisional; written spellings and visible matches are captured.
- Grade 1 stays explicitly sourced to page 3's introduction; school type remains estimated, Bavaria explicit. All records remain author_checked, independent_review_pending=true, runtime_release=false.
- Validation: pages 1–100 ordered and unique; task references resolve; new task IDs unique; renders exist for pages 91–100.

Next package: PDF pages 101–110. Pages 101–168 remain unreviewed.


## Checkpoint 2026-10-22 — PDF pages 101–110 / 168

- Read page text and viewed every full-page render.
- Added 10 page records, 24 task/action groups and 10 visual records. Cumulative totals: 110 pages, 262 task/action groups and 99 visuals. Individual discrete words/statements are represented as item subtasks where present.
- Coverage includes Sch/St/Sp listening and spelling, double consonants, G/K/ng, J names/statements and integrated review. Audio prompts without the source recording remain explicitly unverified; visual spelling and completed links are retained.
- Grade 1 stays explicitly evidenced on PDF page 3; school type estimated, Bavaria explicit. All records author_checked=true, independent_review_pending=true, runtime_release=false.
- Validation: pages 1–110 ordered and unique, task IDs unique, page references resolve; renders exist for pages 101–110.

Next package: PDF pages 111–120. Pages 111–168 remain unreviewed.


## Checkpoint 2026-10-22 — PDF pages 111–120 / 168

- Read extracted text and viewed full-page images for all ten pages.
- Added 10 page records, 26 task/action groups and 10 visuals. Cumulative totals: 120 pages, 288 task/action groups and 109 visuals. Itemized lists and sentence statements are represented as subtasks where legible.
- Coverage: B/P, silent h, compound nouns, Z, tz, Pf, ß and Ä. Audio-only B/P choices remain pending; the Pf odd-one-out rule/marks are ambiguous. Directly visible spelling and sentence responses are retained.
- Grade 1 remains explicitly tied to the page 3 introduction; school type estimated, Bavaria explicit. Every record remains author_checked=true, independent_review_pending=true, runtime_release=false.
- Validation: PDF pages 1–120 ordered/unique, task IDs unique, page-task links resolve; renders exist for pages 111–120.

Next package: PDF pages 121–130. Pages 121–168 remain unreviewed.


## Checkpoint 2026-10-22 — PDF pages 121–130 / 168

- Read page text and viewed full-page images for all ten pages.
- Added 10 pages, 25 task/action groups and 10 visuals. Cumulative totals: 130 pages, 313 task/action groups and 119 visuals.
- Topics include Ö/Ü plurals, noun compounds, word boundaries, V pronunciation variants, ver/vor prefixes and ie spelling. The final page's sentence fragments for four ie nouns are incomplete in the extracted/layout evidence, so intended order remains unresolved.
- Grade 1 explicit source remains PDF page 3; school type estimated, Bavaria explicit. author_checked=true, independent_review_pending=true, runtime_release=false.
- Validation: pages 1–130 ordered/unique, task IDs unique, references resolve; renders exist for pages 121–130.

Next package: PDF pages 131–140. Pages 131–168 remain unreviewed.

## Checkpoint: PDF pages 131–140

- Persisted 10 page records, 20 task/action-group records, and 10 visual records after text and full-page image review.
- Coverage: plural formation; noun grid and noun evidence; qu spelling and meaning; Y/y and eu; Yak, owl, and snail reading comprehension; ck spelling and personal truth judgments.
- Open responses are retained as open. Text-reading items have independent answer proposals; image-linked pairings depend on the inspected page layout. Independent pedagogical review remains pending.
- Grade 1 evidence: PDF page 3 introduction. School type estimated; Bavaria explicit. author_checked=true, independent_review_pending=true, runtime_release=false.
- Validation pending for this checkpoint. Next package: PDF pages 141–150.

## Checkpoint: PDF pages 141–150

- Persisted 10 pages, 17 task/action-group records and 10 visual records after full-page text and image review. Individual distinguishable words, questions, picture prompts, sentence blanks and riddle answers are represented as subtasks.
- Coverage: grapheme review; noun evidence; story comprehension; sequential illustration; äu plurals; final devoicing; C and Ch spelling, sound and meaning; verb identification and inflection.
- Open/personal work stays open. PDF page 143 question 5 depends on a separate story page not present in this source page; response remains unresolved.
- Grade 1 evidence: PDF page 3 introduction. School type estimated; Bavaria explicit. author_checked=true, independent_review_pending=true, runtime_release=false.
- Validation pending for this checkpoint. Next package: PDF pages 151–160.

## Checkpoint: PDF pages 151–160

- Persisted 10 pages, 20 task/action-group records and 10 visual records after full-page text and image review. Individually scored word sets, choices, questions and matching pairs are enumerated in subtasks.
- Coverage: Xx, witch-text comprehension, ng/nk, sentence matching, äu/eu, noun/verb sorting, creative writing, email information, word boundaries, literature matching and sentence discrimination.
- Personal/creative work remains open. The literature matching includes picture, book and Fibel-page mappings; text-based page citations retained.
- Grade 1 source: PDF page 3 introduction; school type estimated; Bavaria explicit. author_checked=true, independent_review_pending=true, runtime_release=false.
- Validation pending for this checkpoint. Next package: PDF pages 161–168.

## Final checkpoint: PDF pages 161–168

- Persisted 8 pages, 9 task/action-group records and 8 visual records after complete text and page-image review. Pages 167–168 are non-instructional credits/cover pages and have no task records.
- Page 161 has six astronomy fact items and five yes/no evidence items; page 162 lists all 18 game statements; page 163 captures the partially drawn map and open chest prediction; page 164 lists the quiz choices and solution letters; pages 165–166 enumerate words/letters.
- The game map has some green route connectors but not a complete key; unstated transitions remain unresolved. Creative and personal writing remains open.
- Grade 1 evidence for this workbook: PDF page 3 introduction; school type estimated; Bavaria explicit. author_checked=true, independent_review_pending=true, runtime_release=false.
- Whole-source visual/text scope complete through page 168. Final consistency validation follows.

## Final validation

- Pages 1–168 are present once in order; 379 task/action-group records have unique IDs and every page reference resolves; 168 per-page visual records cover all 168 private page renders.
- PDF page 164 stores the printed key as source-key evidence only. Questions 1–4 still require original-story checks; question 3 is Kohlmeise (R), while Blaumeise has O. The printed letters form SUPER, which does not verify the story facts. PDF page 99 item 1 retains the green-key answer „ja“ separately from the cited independent scientific assessment „nein“.
- Scope is author-checked text and image review, not an independent pedagogical review or release approval. author_checked=true, independent_review_pending=true, runtime_release=false.

- Final visual audit found 11 early page records without a per-page visuals.jsonl entry; added page-linked visual records for pages 1–4, 7, 11, 22–23, 36, 38 and 40. The images had already been reviewed in the earlier page batches.
