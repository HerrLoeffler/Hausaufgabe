# GC-WEB-REPAIR-20261007 · Remy: Material und Lernziele verständlich machen

**Stand 29.10.2026: Idee und Umsetzungsplan, nicht beschlossen und nicht implementiert.** Fachzuständigkeit: Remy-Testerstellung / präzise Vorgaben. Bezug: [bestehende kompakte Erstellungsoberfläche](creation-compact-20261027.md), [Auto-Punkte-Dokumentations-PR #372](https://github.com/HerrLoeffler/Hausaufgabe/pull/372). Keine Freigabe für Code, Testaufrufe mit KI oder Deployment aus diesem Plan.

## Ziel und belegter Iststand

Lehrkräfte sollen auf einen Blick verstehen: Ein Thema reicht für den schnellen Start; eigenes geeignetes Unterrichtsmaterial und ein bis zwei konkrete Lernziele helfen Remy, den Entwurf auf den Unterricht auszurichten. Beides bleibt freiwillig. Der erzeugte Test ist weiterhin vor Veröffentlichung fachlich zu prüfen.

Der kompakte Erstellungsbildschirm hat bereits vier Bereiche **Angaben → Material → Bilder → Audio** und die letzte Aktion „Test erstellen“. In „Angaben“ stehen Thema und das Feld „Wichtig: Was soll der Test genau abfragen?“ (`#aiCustomNotes`, mit Mikrofon). „Material“ hat Rechtebestätigung (`#aiMaterialConfirmed`), Dropzone (`#aiMaterialDropZone`), Uploadstatus und „Material verwenden“ (`#aiMaterialMode`). Ohne Dateien bleibt der Modus deaktiviert; bei Upload ist „Inhalt auf das Material beschränken“ vorausgewählt. Der gezeigte Materialausschnitt beginnt mit der Rechtecheckbox, während ein Nutzenhinweis fehlt. Der vorhandene Hilfetext des Wünschefelds ist in der kompakten CSS-Ansicht verborgen. Aus dem vorhandenen Clientvertrag: `notes` darf leer sein, `materials` darf leer sein; nur ein tatsächlicher Upload erfordert die unveränderte Rechtebestätigung. Quelle für diese Einordnung: aktuelles Screenshot-Briefing und Remy-Releasequelltext `21d1e4b1`; vor Umsetzung den dann neuesten Live-/Integrationsstand prüfen.

## Drei eng begrenzte Ansätze

Bewertet auf 1–10: **Verständlichkeit** (erkennt man den Nutzen?), **wenige Zusatzklicks**, **ruhige Oberfläche** und **Handyeignung**. Hohe Zahl ist jeweils besser; Gesamtzahl ist eine begründete Empfehlung, kein Messwert.

| Ansatz | Verständlichkeit | Klicks | Ruhe | Handy | Gesamt | Abwägung |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| A. Zwei kurze Hinweise direkt an vorhandenen Feldern, dezenter blauer Akzent im Materialbereich | 9 | 10 | 8 | 9 | **9/10** | Immer am richtigen Ort sichtbar, ohne neue Bedienung; muss auf schmalen Ansichten knapp bleiben. |
| B. Einmaliger, schließbarer Einstiegshinweis beim ersten Öffnen | 8 | 8 | 7 | 7 | **7/10** | Gut für den ersten Besuch, später leicht vergessen; benötigt Merker und zusätzliche Schließen-Aktion. |
| C. Rückfrage-Popup vor „Test erstellen“ bei vermeintlich unklarem Auftrag | 7 | 4 | 4 | 5 | **5/10** | Kann gezielt erinnern, aber „unklar“ ist ohne Fehlalarme kaum sicher festzustellen; bremst den schnellen Test. |

**Empfehlung: A.** Keine neue Fläche, kein Popup und keine neuen Pflichtschritte. Remy-Sprechblase oder kleine Illustration erst als spätere Option prüfen, falls ein echter Lehrkrafttest zeigt, dass die zwei Hinweise übersehen werden. Eine Figur darf nie Upload, Checkbox oder Erstellen-Aktion verdecken.

## Vorgeschlagener Text an genau zwei Stellen

1. Unter dem vorhandenen Feldtitel „Wichtig: Was soll der Test genau abfragen?“ einen dauerhaft sichtbaren, kurzen Hilfetext: **„Nenne 1–2 konkrete Lernziele oder was bei der Lösung wichtig ist.“** Die vorhandene Feldbezeichnung und Diktierfunktion bleiben.
2. Direkt unter der Überschrift „Material“, **vor** der Rechtebestätigung: **„Optional: Material zeigt Remy, was ihr behandelt habt. Unter „Wichtig“ legst du die Schwerpunkte fest.“** Als ruhiger Hinweis mit dezentem Blau, nicht als weitere große Karte.

Die längere Alternative „Dein Unterricht ist die Grundlage: Lade Arbeitsblätter, Hefteinträge oder Buchseiten hoch und beschreibe, was deine Klasse können soll“ ist für die schmale Karte zu lang und nennt Buchseiten pauschal, obwohl deren Weitergabe an externe KI gesonderte Rechte voraussetzt. Auch die sehr kurze Variante „Material hochladen“ erklärt den Nutzen nicht. Die vorgeschlagene Fassung nennt den Nutzen und bleibt freiwillig. Die bestehenden Rechte- und Datenschutzhinweise sowie die tatsächlichen Uploadgrenzen bleiben wortgleich und wirksam. Keine Zusage, dass Remy aus Material automatisch alle fachlichen Schwerpunkte korrekt erkennt.

## Erwartetes Verhalten

| Fall | Erwartung |
| --- | --- |
| Kein Material, keine Zusatzwünsche | Thema und übrige bestehende Pflichtangaben genügen weiterhin. Kein Hinweisdialog und keine neue Fehlermeldung. |
| Nur konkrete Wünsche | Remy erhält die Wünsche wie bisher, ohne Uploadpflicht. |
| Material vorhanden | Rechtebestätigung bleibt vor dem Hochladen erforderlich und nicht vorausgewählt; Materialmodus bleibt zunächst „Inhalt auf das Material beschränken“. Der Hinweis fordert zusätzlich dazu auf, die gewünschten Schwerpunkte im vorhandenen Feld zu nennen. |
| Wiederholte Nutzung | Die statischen Hinweise bleiben auffindbar; keine Speicherung eines Onboarding-Zustands. |
| Bereits vorhandener Entwurf | Inhalt und Bearbeitung bleiben unverändert. Der Plan betrifft ausschließlich das Formular für neue Testaufträge. |

## Umsetzung nach Freigabe dieses Plans

1. Den dann aktuellen Live-Commit, den Web-Integrationszweig und parallele Editorarbeit (insbesondere PR #392/Vorlagenimport) abgleichen. Die Änderung auf einen frischen eigenen UI-Branch legen. Die Remy-Punkte- und Uploadverträge aus den bestehenden Releases erhalten.
2. Im aktuellen `index.html` nur die zwei Hinweise an `#aiCustomNotesHint` und im Bereich `#aiCreationPanel2` ergänzen. Den Materialhinweis **oberhalb** der Checkbox platzieren; `#aiMaterialConfirmed`, `#aiMaterialDropZone`, `#aiMaterialMode`, Rechtsdetails und Zahlenlimits nicht umsortieren oder verändern. Kein neuer Button, keine neuen Eingabefelder und keine Backendänderung.
3. In `styles.css` die Regel entfernen/anpassen, die `#aiCustomNotesHint` im kompakten Formular ausblendet; beide Hinweise klein, gut lesbar und im vorhandenen GradeCrew-Blau gestalten. Platzbedarf in der internen Panelhöhe und die Grid-Position neben dem Mikrofon prüfen. `design-system.css` nur anfassen, falls der aktuelle Stand den lokalen Stil überschreibt. Keine Änderung der vier Bereichsgrößen.
4. Vor Veröffentlichung in Chromium und WebKit bei normaler Desktopgröße, 390×844, 320×568, 150 % Text und eingeblendeter Bildschirmtastatur prüfen: beide Hinweise sichtbar, kein verdeckter Upload/Erstellen-Button, keine unlesbaren Zeilen, Tastatur- und Fokusreihenfolge korrekt. Screenreader liest Feldtitel plus Hinweis und die unveränderte Rechtecheckbox; der Hinweis ist nicht allein durch Farbe vermittelt. Bestehende Webtests und die relevanten Upload-/Erstellungsfälle laufen auf dem exakten Kandidaten.
5. Mit drei **synthetischen** fachübergreifenden Beispielen einen Testentwurf im Vorschau-/Stagingablauf begutachten, ohne echte Lehrkraft- oder Schülerdaten: Mathematik „Zinsrechnung mit Dreisatz und Zwischenschritten“, Englisch „Unit-Wortschatz in kurzen Sätzen anwenden“, Deutsch „Nomen, Verben und Adjektive in einem Text markieren“. Dabei prüfen, ob die Hinweise zu konkreteren Angaben führen; keine fachgebundenen Chips in der Oberfläche ergänzen.
6. Ergebnis und Grenzen in dieser Übergabe dokumentieren. Code, CI, Vorschau, Nutzertest und Live getrennt belegen. Production nur nach gesonderter ausdrücklicher Freigabe.

## Offener Schritt

Martin prüft den empfohlenen kurzen Wortlaut und den Verzicht auf ein Popup. Danach kann der zuständige UI-Fachchat die kleine Änderung auf aktuellem Stand umsetzen. Bis dahin ist dies ausschließlich ein **Plan**.
