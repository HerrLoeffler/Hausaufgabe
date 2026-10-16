# GC-GAMES-LEARNING-UX-01 · Gemeinsames Lernspiele-Planbuch

Auftrag:15.10.2026. Abschluss dieses Dokumentationsblocks:16.10.2026. Fachowner `/root/games_redesign_plan`, beauftragt durch die bestehende GC · Games-Zentrale. Chatlink unbekannt. Angefordert Sol/medium; tatsächliches Modell, Aufwand und Usage unbekannt. Keine Modellwechsel, keine neue Kostenreservierung.

## Auftrag und Grenzen

Nur Planung und Dokumentation für Vocab Rush, Fast Quiz Mathematik, Fehlerjagd Deutsch und Wissensreise. Bestätigter Nutzerfokus: Mittelschule Bayern, Klassen5–10. Einfacher gemeinsamer Einstieg, Lehrplan als erweiterte Option, Remy beziehungsweise eigene Tests als Quelle, fortlaufendes fünfminütiges Üben und kleine fachliche Schwierigkeitsbrücken. Nutzerbericht: Stufe1/2 spielbar,3 zu schwer,4/5 ungetestet; keine Kohortenmessung. Im geprüften Enginebestand sind vier interne Niveaus belegt; der Plan erfindet kein fünftes Bestandsniveau.

Keine Runtimeänderung, kein Providerstart, kein Game-/Appbuild, kein Merge, keine Integration oder Deploymentfreigabe. Production bleibt ausgeschlossen. `sources/**` blieb unverändert. Originalaufträge, Versuche und Budgets wurden erhalten.

## Frisch gelesene Ausgangsbelege

- main `8560992c072779814017ebac6e86b65e938bc951`: START_HERE, AGENTS, STATE, TODO, Workstream-README, Registry, CHAT_CONTRACT, Gamesworkflow, Spielbriefing, Assetguide, Assurance und Skillzuordnung gelesen.
- Development Status `38809750925`, Job `116679689447`, erfolgreich;26 aktive Workstreams,22 Überschneidungshinweise,12 ältere kritische Branches,147 unklassifizierte Branches. Warnungen bleiben fremde Koordinationsarbeit; keine Bereinigung.
- STATE nennt Web GC39/`8f869790…`; Nutzer-/physische Geräteabnahme offen. Keine Produktstufe geändert, deshalb kein STATE-Delta.
- Wissensreise PR238 Draft, offen/unmerged, `ec751260…`; Docs-PR237 `a66fb81b…`. Isolierte Vorschau und echte private50-Aufgaben-Vorbereitung46 geeignet/4 Medienausschlüsse sind enge Belege; vollständiges Cloudspiel, reale Providersemantik und Geräteabnahme bleiben offen.
- PR218/208/214 offen; Code/Recherche und neuere lokale Lehrplanarbeit14.10 nicht als integrierte Volllehrplananalyse ausgegeben. Researchdatei dokumentiert die genauen Grenzen.

## Branch, Dateien und Checkpoints

Eigener Docsbranch `docs/games-learning-ux-20261015`, Draft-PR [239](https://github.com/HerrLoeffler/Hausaufgabe/pull/239) gegen main. Isolierte lokale Arbeitsausgaben unter `work/games-redesign-20261015/`. Eigene Repo-Pfade `docs/games/learning-ux-20261015/**`, diese Übergabe sowie ausschließlich die eigene TODO-Zeile und Registry-Zuordnung. Main-TODO und Registry vor Abschluss erneut gelesen: gegenüber Startbasis unverändert. Andere Einträge erhalten.

| Checkpoint | Gesicherter Umfang |
|---|---|
| `571e153b` | Struktur, Task-ID, Ausgangsbelege, TODO/Registry/Handoff |
| `36bcd619` | Erste neun Kapitel |
| `5ac6e97c` | Vollständiger Haupttext, Beispiele und Anhänge |
| `cb19edef` | Finales Manuskript, Research/SourceLedger, zwölf SVG-Ansichten, Galerie, Brandreferenzen |

Der vollständige remote MASTERPLAN an `cb19edef` wurde textgleich mit dem lokalen Manuskript verglichen; Remote-Blob `2b0cbc647a7ec42fd7e7d09e0f6bd4bcc186e7de`. Das spätere Abschlussdelta sichert Satzquellen, Prüfbelege und Review; den tatsächlichen neuesten Head vor Weiterarbeit über PR239 lesen.

## Artefakte und unveränderliche Bezugswerte

| Artefakt | Umfang | SHA256 |
|---|---|---|
| `MASTERPLAN.md` |19 Hauptkapitel,2 Anhänge,13.483 Wörter | `f2e67d9fcb260a1d8d3b084c1e1240976d4a3d18806e3afd0035bc62937c5478` |
| End-PDF |61 Seiten,12 Konzeptansichten,2.407.648 Bytes | `150f68ef7d150ac9b0cd90f94f92a05b7924e51740e519e91bcf2b68a0e92664` |
| Zusätzliches eigenständiges HTML |354.678 Bytes | `67e44ce0ed45ee6007fa6ff387f59ff6a204ee03676ad1a12140e03591cb0351` |
| `final/asset-manifest.json` |31 Datei-/Größen-/Hashbezüge | `7be3480be2bd28f29151fadca0afac3672e50ccc8cfb913d7f3e9002e9648f9e` |
| `review/OWNREVIEW.md` | Unabhängiger Spec-/Standardsreview | `579652d0d352b721b3c361ed810ac33bc76bfd155dd2794abfaa30188eee5b84` |

PDF und fertiges HTML werden lokal unter `work/games-redesign-20261015/final/` ausgeliefert. **Diese beiden fertigen Leseartefakte nicht als GitHub-committed behaupten.** Das Repo sichert vollständiges Manuskript, Research, Quellenregister, editierbare SVGs, vorhandene GC-Brandreferenzen mit Provenienz, Galerie, Satz-/HTML-/Prüfskripte, konkrete Wiederholungsanleitung, Manifeste und Review. Keine Fontdateien oder privaten Nutzerscreenshots. Ungenutzte Remy-Assetkopie und Einleseabhängigkeit wurden entfernt.

## Tatsächlich ausgeführte Prüfung

- Manuskript:19 Hauptkapitel,2 Anhänge,12 Ansichten; JSON gültig; keine TBD-/FIXME-Platzhalter; fünf Minuten, private Seedgrenze, Teacherquota und Wissensreise ohne manuelle Antwortbewertung explizit.
- Designer: alle61 PDF-Seiten gerendert und in Kontaktbögen gesichtet;6 repräsentative Vollseiten zusätzlich. Kein Tabellenabschnitt verloren; Inhaltsverzeichnis vollständig auf Seite2, keine leeren Füllseiten.
- Textabgleich:932 geparste Inhaltsblöcke,0 fehlend.126 Lesezeicheneinträge,46 interne und26 externe Links.
- Planowner: alle31 Manifestdateien samt Bytes/Hashes erneut abgeglichen; `verify_book.py` frisch ausgeführt:61 Seiten, exakter End-PDFhash,72 Links,0 Safe-Area-Ausreißer. Deckblatt/TOC/Inhaltskontaktbogen selbst visuell gelesen.
- Unabhängiger Reviewer, getrennt von Autor/Designer/Research:185 normalisierte längere Prosaabsätze gegen End-PDF,0 fehlend;46 interne Linkziele,0 ungültig. Gezielte Code-/Primärquellenstichproben und ausgewählte volle PDF-Seiten/Ansichten geprüft. Keine eigene Vollbildprüfung aller61 Seiten durch Reviewer behauptet. D01–D05 geschlossen. Spec und Standards sequenziell durch denselben Reviewer PASS im Dokumentumfang; keine zwei unabhängigen Reviewer behauptet.
- Zusätzliche HTML-Fassung: vollständiger Manuskriptinhalt und13 eingebettete SVGs strukturell geprüft. Chrome-Start in Sandbox endete mit SIGABRT vor einer Seite; keine visuelle Browserprüfung behauptet. Die maßgebliche PDF wurde vollständig gerendert und geprüft.

Remote-Doku-CI an `cb19edef`: Development Status `38815189945` und Project handoff checks `38815189920` erfolgreich. Frühere Checks an `5ac6e97c`: `38814883351`/`38814883365` erfolgreich. Abschlussdeltachecks am aktuellen Head frisch lesen. Der tatsächliche PR-Diff enthält ausschließlich eigene Dokumentation/Design/Research und die eigene Koordinationszeile; keine Runtimepfade.

## Entscheidungen und erhaltene Verträge

„Einfach starten“ ist primär, „Genau auswählen“ optional. Direkte Bedienung bleibt vollständig; Remy ergänzt sie und benötigt kein neues Voice-SDK. Quelle/Lernziel, Spielregel und Antwortformat bleiben getrennt. Eigene Remy-/manuelle Tests behalten ihre Stoffgrenze; keine feste Demoquelle ersetzt Martins Quelle. Konkrete3a/3b-Brücken, Fachbeispiele und Hilfen sind Vorschläge; Jahrgang ist kein Niveau, keine Diagnose und keine100%-Kompetenz aus drei Treffern.

Fünf Minuten bedeuten fortlaufende Versorgung bis zum Zeitende, kein frühes Ende wegen Quellanzahl.50–150 Bearbeitungen sind nur die Planrechnung für angenommene2–6 Sekunden pro Kurzaufgabe. Istgrenze generischer KIvarianten:3×12 plus ehrliche Wiederholung. Kein unbegrenztes Neuheits-/Kostenversprechen. Teacher-/Tenantquoten und idempotente Antwortwirkung bleiben erhalten. MathFamilyKey, Generator-/Profilversion, Seed, Quellrevision und Schlüsselherleitung bleiben privat/serverseitig; öffentlich nur opake Instanz-ID und freigegebene Anzeigeparameter.

Wissensreise erhält keine Noten, Spielpunkte, Strafsperren oder manuelle Antwortbewertung. Im aktuellen Bestand läuft die absolute Serverdeadline bei Pause weiter; vorgeschlagene pausierbare Soloaktivzeit wäre eine ausdrückliche spätere Verhaltensänderung. Klassenfrist und Teacher-Stop dürfen durch individuelle Pause oder Adaptation nicht umgangen werden. Bestehende Boards, QR, Rollen und Backendverträge wiederverwenden, keine konkurrierende Plattform.

## Skills und Versuchshistorie

Autor: Brainstorming gelesen, Architektur-/Designauftrag; Nutzer hat Schreiben dieses Planbuchs ausdrücklich jetzt autorisiert, keine zusätzliche Interviewrunde. verification-before-completion gelesen und an tatsächlichen Dokumentchecks angewendet. Design: frontend-design/PDF-Skill und gebündelte Runtime26.1013.11914 dokumentiert. Research und unabhängiger Review führen eigene gelesene Skills im jeweiligen Receipt. img2threejs ist für reine2D-/Bedien-/Lernlogikplanung ungeeignet; kein künstlicher3D-Schritt.

Ein großer Textpaket-Leseversuch wurde vor Gitmutation wegen Ausgabeabschneidung verworfen. Danach Dateien einzeln mit Trunkierungsprüfung gelesen und gemeinsam gesichert; kein Commit oder Refupdate aus dem Fehlversuch. Keine Credentialwerte gelesen, kein Firebase-Login-JSON. Kein Providerrequest/Deploy läuft aus diesem Auftrag. Bestehende Historien und Budgets wurden nicht zurückgesetzt.

## Status und genau nächster Schritt

Dokumentationsumfang ausgearbeitet, gesichert und unabhängig geprüft; eigener Branch/Draft-PR, keine Integration. Produktcode und Release-/Deploystufen unverändert. Keine App-/Cloud-/Provider-/Lernwirksamkeits-/Geräte-/Productionabnahme aus dem Dokument-PASS ableiten.

**Genau nächster Schritt:** Root prüft finalen Docshead und die Artefakthashes und legt Martin das61seitige Planbuch zur inhaltlichen Entscheidung vor. Umsetzung erst als separat konkret beauftragter Referenzabschnitt nach Kapitel17/18; dieses Artefakt ist keine Bau-, Merge- oder Deployfreigabe.


## Fortsetzung 16.10.2026 — Punkte, Arbeitsweise und Denkzeit

Neuer Nutzerauftrag im selben Task/Branch/PR: transparente optionale Punkte-Challenge, Kompetenz je Familie getrennt vom Score, Kopfrechnen mit passenden Zahlen, Stift/Block vorher ankündigen, längere Denkaufgaben und faire Zeit-/Endregeln detailliert planen. Noch ausschließlich Dokumentation. Original-PDF61Seiten und alter Review bleiben auf ihrer eingefrorenen Fassung. Eigene Markdown-Ergänzung ERGAENZUNG-PUNKTE-ARBEITSWEISEN-20261016.md, separater Nachtragsatz beim Designowner. Requested bestehendes Modell laut Auftrag, actual Modell/Effort/Usage unbekannt; keine Modellwechsel/Providerreservierung.

Frisch gelesen: main START/AGENTS/STATE/TODO/Registry/Workstream-README/CHAT_CONTRACT/Gamesworkflow/Briefing/Assurance/Skillzuordnung unverändert. PR239 offen/Draft/unmerged f10627, exakte Handoff-/Developmentchecks38815987892/38815987909 success. Root las jüngsten Auditjob116700654162:26aktiv/22Überschneidungen/12ältere kritische/148unklassifiziert; keineBereinigung. Kein anderer Produktscope übernommen.

Erster substantieller Nachtragcheckpoint: Ziel-/Achsentrennung, drei konkrete Lehrerpresets, gleichkriterielle1–10Vergleiche und fachliche Kopfrechenprofile inklusive Zahlen-/Strategiebeispielen. Noch offen: ausführbare Leiter-/Punkteformeln, Zeit-/Finishzustände, Simulation, Übertragung/Prüfkatalog, Vorrangmatrix und unabhängiger Nachtragreview. Keine Behauptung, der alte PASS decke den neuen Text. Genau nächster Schritt: konkrete Challengeleiter samt Restzeit-/Hilfen-/Grenzregeln ausarbeiten.


### Vollständiger Nachtragtext gesichert

ERGAENZUNG-PUNKTE-ARBEITSWEISEN-20261016.md:7.026Wörter,16Kapitel, SHA2560a96863c4db11b692382c08c3b314989a0398d81d72ace622bbaa4adfd103e2b. Volltext an Designer und getrennten Reviewer übergeben. Der Nachtrag führt tatsächlich spielbare30/90-Schwellen/10-30-60-Punkte als unkalibriertes Modell, min(Resttopf,Nominal×Hilfefaktor), keine Fehler-Rückstufung, endliche leichte Töpfe, erste Abgabe allein gewertet, kein pro-Klick-Providerstart. SimulationA210/B150/C90 und Zwischen-Gleichstand2:20 sind handkonstruiert, keine Messung. Kopfrechenstruktur, Materialankündigung, lange Denkzeit, HardCut versus angekündigte5+1-Fertigstellphase, Restzeit/Rejoin/Idempotenz, Quellenbindung und Wissensreise ohne Punkte enthalten. Vorrangmatrix Kapitel14 trennt Originalregeln von neuen Vorschlägen. Neue institutionelle Quellen gezielt geprüft; keine Vollrecherche oder Wirkungs-/Fairnessgarantie.

Genau nächster Schritt: unabhängigen Inhaltsreview und eigenständigen Nachtragsatz an dieser Fassung prüfen, danach Abschlussbelege sichern. Alte61seitige PDF, Designdateien, alte Prüfberichte/Review bleiben unverändert; der neue Text erbt deren PASS nicht.


## Nachtragabschluss 16.10.2026 — 29 Seiten zusätzlich, Original erhalten

Der vollständig überarbeitete Nachtrag hat 16 Kapitel und 7.393 Wörter. Endmanuskript SHA256 b62db2815a1c72399769a3db8e8cea31df72d79648333916218a82f46ac700b7. Die früheren 7.026-Wörter-Stände bleiben nur Checkpointhistorie. Leseindex LESEREIHENFOLGE.md und README-Einstieg verbinden das ursprüngliche Planbuch mit der aktuellen Ergänzung; MASTERPLAN.md und dessen 61seitige PDF sind unverändert.

Designer hat sein neues Paket ausdrücklich unverändert zur Übernahme freigegeben; Root autorisierte die gesammelte Übernahme. Eigene Design-/Renderer-/SVGdateien unter design/adaptive-addendum/, eindeutige neue Prüfmanifeste unter final/. Autor hat keine Dateien des Designers oder Reviewers redigiert. Alle16 Lieferdateien samt Bytes/Hashes unabhängig abgeglichen. PDF/HTML bleiben wie beim Hauptbuch lokale Leseartefakte; Repo sichert die regenerierbaren Text-/SVG-/Satzquellen und Hashberichte, nicht die fertigen PDF-/HTMLdateien.

End-PDF GradeCrew-Spiele-Nachtrag-Adaptive-Runden-20261016.pdf:29 Seiten, zwei neue Konzeptansichten,702.663 Bytes, SHA256 e343a4d2848d4f5157494e88b1fb477e75cbc2b3f749e2788ba5bc7f8d15ccdf. Zusätzliche HTML-Fassung SHA2563dae547d8b0c79177f4db835fb891fbf73eadb2810a246ccf7651292dfea157b; strukturell geprüft, keine visuelle Browserprüfung behauptet. Beide Dateien liegen lokal unter work/games-redesign-20261015/final/. Hauptbuch61+Nachtrag29=90inhaltlich gefüllte Seiten, kein künstlicher100-Seitenumfang.

Designer: alle29 Seiten gerendert und Kontaktbögen vollständig visuell geprüft,499 Inhaltsblöcke/0fehlend,51Bookmarks,36interne gültige/9externe Links, keine Safe-Area-Verletzung. Autor: Manifest-/Originalhashvergleich und Kontaktbogen selbst gelesen. Unabhängiger Reviewer: Spec-/Standards-PASS ausschließlich Dokumentumfang, A01–A04 geschlossen;93Prosaabsätze/309Tabellenzellen ohne Verlust,36interne Links/0ungültig und repräsentative Endvollseiten geprüft. Receipt review/ADAPTIVE-REVIEW.md SHA256a5ae7ef50a4b4d745368e98c5e4243c05381eb8d747c5cccebd785a8b039f264 unverändert übernommen. Ein Reviewer, zwei sequenzielle Achsen; keine zweite unabhängige Person behauptet.

Wesentliche Reviewkorrekturen: erste Referenz-Challenge nur freie Zahlen/zuverlässige strukturierte Eingaben, MC ohne eigenen Ratevertrag ausgeschlossen; fachlicher kanonischer Fingerprint höchstens einmal gewertet pro Runde, neueGUID/Optionsfolge kein Neuheitsbeleg; nach Fehler Korrektur/Feedbackabschluss vor nächster Instanz; Resttopf nurStufe1/2,Stufe3 R×h unter Instanz-/Zeitgrenze; Hilfe zuerst auf nominale Belohnung, dann Topfcap (kein Zeno-Fall); Simulation ausdrücklich All-in inklusive Korrektur/Feedback. Punktewerte, Risiko-/Zeitannahmen und Simulation bleiben ungemessene Modelle. Keine behauptete technische Manipulationsfestigkeit, Lernwirkung oder Fairnesszertifizierung.

Checkpoint2e29bcc9: vollständiger erster Text plus Research/Leseindex/TODO; Dokuchecks38818010377 und38818010219 success. Neuester gesammelter Abschlusshead und exakte CI danach im PR239 prüfen; keine Datei-/Actions-Schleife allein zur Selbstreferenz. Neuer Auftrag änderte keine Runtime-, Cloud-, Quellen-/Lehrplan- oder Productionstufe; STATE bleibt unverändert. Keine Provideranforderung, Gamebuilds, echten Schülerdaten, Merge oder Deploy.

Genau nächster Schritt: Root prüft den neuesten Docshead/Hashes und liefert den fertigen29seitigen Nachtrag mit dem bestehenden Hauptbuch an Martin aus. Danach ausschließlich bei konkretem Folgeauftrag einen begrenzten Referenzabschnitt bauen; das Dokument selbst ist keine Umsetzungsfreigabe.


## Neuer Folgeauftrag 16.10.2026 — Nutzerkorrektur Kategorien und Klassensammeln

Gleiche Task/Branch/PR, Basis46c2ed99. Frische main-Regeln/STATE/TODO/Registry/Workstream/CHAT_CONTRACT/Gamesworkflow/Briefing/Assurance gelesen, gegenüber vorheriger Basis unverändert; exakte Dokuchecks38818718136/38818718109 success. Root las Auditjob116709752706:27aktiv/24Überschneidungen/12ältere kritische/148unklassifiziert, eigenePrimary+8/-0; nureigeneKoordinationszeile ändern.

Nutzer korrigiert verbindlich: Kopfrechnenkategorie100%Kopf mit eigenen Leveln; Stift-und-Blockkategorie eigene Level, ungefähr65/35Slotmix aus erschwerten Kopf-/Materialaufgaben. Frühere freie Arbeitsweisenwahl und N1-Nachtragansicht insoweit überholt. Neuer Modus AlsKlasseSammeln übernimmt primär den bekannten individuell fortlaufenden Flow; optionaler Klassenvergleich braucht getrennte normierte Skala/feste Gelegenheiten. Keine Runtime-/Provider-/Build-/Deploy-/Mergeaktion. Requested bestehendes Sol/medium, actualRuntime/Effort/Usageunknown, keine neue Budgetreservierung.

Erster substanzieller Checkpoint: FOLGEPLAN-KATEGORIEN-KLASSENSAMMELN-20261016.md mit verbindlicher Korrektur, getrennten Levelrastern und geprüften Beispielantworten, reproduzierbarem Präfixscheduler13/20,5Slots3/2Näherung, Quell-/Adaptionsgrenzen und einfachem Sammelflow. Weitere Normierung/Roster-/Fehlerregeln, Vergleichsmatrix, UI, Vorrang und Abnahmen folgen. Designer/Reviewer separat beauftragt; alte61/29Seiten und ihre Hashes bleiben erhalten. Genau nächster Schritt: konkreten Vergleichsvertrag mit festem Roster und gemeinsamen Gelegenheiten ausarbeiten.
