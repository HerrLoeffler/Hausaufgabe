# Wilma: normaler Einstieg, semantische Vorschläge und erreichbare Aufgabenauswahl

GC-WEB-REPAIR-20261007 / GC-PEDAGOGY-KB-01 · Fachchat Web · Stand 19.11.2026 (Cloud-Nachweise vom 18.11. UTC). Vorhandene Task, PR438 und Budgethistorie fortgeführt. Kein neuer bezahlter Versuch durch diese Dokumentation.

## Ergebnis und genaue Quelle

**Production im begrenzten Wilma-Umfang veröffentlicht**, Quelle `4fe3baf733c8a57bcbbd3359ea45341b8f4d7882`, Tree `ff4fe8b4a36d9e2b3d46481f72a4bf0683061bbf`. [PR438](https://github.com/HerrLoeffler/Hausaufgabe/pull/438) bleibt auf dem vorhandenen gestapelten Zielbranch `fix/wilma-review-clarity-20261118`; eine Runtime-Integration in Koordinations-main wird nicht behauptet. Exakte [App-CI44412450416](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/44412450416) vollständig erfolgreich. `receipt.json` bündelt die maschinenlesbaren Nachweise.

- Selbstständige Text-/Lückenantworten scheitern nicht mehr pauschal an einem fehlenden zusätzlichen Bewertungsraster. Echte Kriterien, Musterantworten und alle Antwortteile gehen getrennt zum Modell. Beispiele wie Hund sind keine abschließende Liste zulässiger Tiere. Ohne tragfähige Kriterien bleibt die Entscheidung unsicher; fehlender notwendiger Medienkontext wird nicht erfunden.
- Bestehender Fingerprint und alte Belege bleiben identisch verwendbar. Normaler erster Vorschlag, bereits fehlgeschlagener Lauf und bewusster zweiter Versuch bleiben getrennt. Nicht gestartete historische Antworten haben die sichtbare Aktion „KI-Vorschlag erstellen“ direkt bei der Antwort.
- Aufgabenwahl öffnet als begrenztes Popover über der Tabelle, hält aktive/fokussierte Aufgaben sichtbar und zeigt den Scrollhinweis nur bei echtem Überlauf. Escape, Außenklick, Fokusrückgabe und Aktualisierung während einer laufenden Prüfung wurden geprüft. Die Aufgabenfläche und bestehende Antwortposition bleiben erhalten.
- Monatsbudget, Reservierungen, Versuchszähler, alte Noten und Lehrkraftbestätigung bleiben bestehen. Keine automatische Klassen-Neubewertung und keine automatische Notenübernahme.

## Tests und unabhängige Prüfung

509 Functions- und 853 Root-/UI-Tests bestanden. Geöffnete Auswahl:72 Chromium-/WebKit-Fälle mit15/30/100 Aufgaben, aktiver1/12/letzter Aufgabe,320/390/820px und kurzen Höhen; zusätzlich Zoom und Tastatur-/Fokusfälle. Die exakte CI enthält die vollständigen18 Tutorialreisen. Sechs gezielte unabhängige Browserfälle bestätigen die finale Fokuskorrektur; Review ohne verbleibenden P0–P2.

Die Historie bleibt erhalten: Der frühere Linux-CI-Lauf44411243717 auf `e69fd63` fand einen abgeschnittenen letzten Eintrag nach Seitenscrollen. Die Korrektur wurde im finalen4fe-Stand geprüft. Die unabhängige Review fand außerdem einen Fokusverlust beim Austausch der geöffneten Auswahl; auch dieser ist im finalen Stand behoben. Keine rote CI als grün umgedeutet und kein Gate abgeschwächt.

## Veröffentlichungen und Erhaltung anderer Arbeit

| Umgebung | reviewWilmaAnswers | Hosting | Beleg |
|---|---|---|---|
| Getrennte Testseite `/wilma/` | `reviewwilmaanswers-00012-pez` | `f5bbf2a1f554a9d4` | function-proof-gradecrew-staging-2026.json / stage-public-proof.json |
| gradecrew.de und bisherige Webadresse | `reviewwilmaanswers-00007-viz` | `7214fd4140dbc950` | function-proof-hausaufgabe-staging.json / production-public-proof.json |

Nur die Source von `reviewWilmaAnswers` und vier Wilma-Webdateien samt Release-Nachweis geändert. Functions-Archiv:147 getrackte Dateien, SHA256 `f400a6339c0fb043ebe8096281e0adf1a5fd99df066d314e205c4ff3b21737ef`. Vollständige Servicekonfiguration, Ressourcen, IAM, Umgebungs-/Secretbindung erhalten;100 andere Stage- und61 andere Live-Functions unverändert. Während Hosting blieben alle101/62 Functions unverändert.

Stage bewahrt447 Dateien außerhalb `/wilma/`, alle anderen659 regulären Dateien und den bestehenden `/api/classroom/**`-Rewrite. Live bewahrt212 andere Assets. Hostingheader erhalten.216/216 Hashes auf Stage und jeweils216/216 auf beiden Liveadressen, keine Abweichung. Kanonischer Stage-Root bleibt `5be513d6f8cc90520efb63ee3c0d4e878e84df2d`. Alte Links und bestehende Auth-/Datenhaltung nicht ausgetauscht. Legacyprojekt hausaufgabe-40294 unverändert.

## Tatsächliche KI-Abnahme mit ausschließlich fiktiven Daten

Fünf gespeicherte, quellegebundene Provider-Ergebnisse im Testprojekt; jeweils erster Versuch, abgerechnet und keine offene Reservierung:

| Fiktive Antwort | Ergebnis | Einordnung |
|---|---|---|
| Giraffe statt Musterbeispiel Hund |1/1 | klar richtig |
| Stein auf „Nenne ein reales Tier“ |0/1 | klar falsch |
| Jag… |0/1 | unsicher, Lehrkraft entscheidet |
|20€ und zweite Lücke leer, Raster1+0,5 |1/1,5 | nachvollziehbare Teilpunkte |
|320€ und zweite Lücke leer |0/1,5 | falsch und leer |

Giraffe, unklare Antwort und Teilantwort kamen über den normalen automatischen Einstieg. Die beiden fiktiven historischen Antworten wurden einmal über den sichtbaren ersten Start geprüft. Zwei neue automatische Identitäten pro Client und die globale Begrenzung wurden beibehalten. **Genau5 neue Stage-Aufrufe,6397 MikroEUR Usagebuchung (=0,006397EUR, kein Rechnungsnachweis), Reserve0.** Ein vollständiges erneutes Laden aller fünf Fälle ließ Operationen, Budget und Noten exakt unverändert. Keine weitere bezahlte Stage-Abnahme aus dieser Runde starten. Siehe `stage-acceptance.json` und `stage-semantic-receipts.json`; fünf Beispiele sind keine universelle Qualitätsquote.

Live wurde ein bereits vorhandener fiktiver1,5/1,5-Beleg mit der neuen Oberfläche kostenlos wiederverwendet; geöffnete Auswahl und aktive Aufgabe sichtbar. Kein neuer Live-Providerstart, keine zusätzliche Usage und keine Notenbestätigung. Siehe `live-safe-acceptance.json`. Browserbild lokal: `/private/tmp/gc-wilma-normal-live-safe-open.jpg` (nur fiktive Abgabe).

## Gemeldeter echter Einzelfall: Freigabe offen

Lesende Diagnose: historische Antwort, kein gestarteter Job, keine frühere Providerkostenbuchung dieses Falls; fehlendes zusätzliches Raster und historischer Auto-Start-Schutz erklären den fehlenden ersten Vorschlag. Kein belegter Anmelde- oder Budgetfehler.

Die bestehende, bereits sichtbare Ergebnisansicht wurde über ihren normalen Aktualisieren-Knopf **kostenlos** neu eingelesen. Dadurch blieb automatisches bezahltes Vorbereiten für dieselbe sichtbare Klasse aus. Antwort, Bewertung, Jobstatus und Budget waren vor/nach diesem Schritt identisch.

**Die automatische Genehmigungsprüfung lehnte den einzelnen anschließenden KI-Start vor Übermittlung ab:** echte Schülerantwort an OpenAI; die Live-Freigabe wurde nicht als ausdrückliche Freigabe dieses konkreten Inhalts an diesen Empfänger gewertet. Martin wurde direkt um Zustimmung für exakt diese eine Antwort gebeten. Bis zur ausdrücklichen Antwort keine Wiederholung, API-Umgehung, Kopie, Anonymisierungsumgehung oder neuer bezahlter Lauf. Nach der Ablehnung wurden unveränderter Status, fehlender Job und unverändertes Budget lesend bestätigt. Kein echter Schülerinhalt wurde durch diesen Test übermittelt, keine Note geändert. Private IDs/Antwortdaten verbleiben außerhalb des Repos.

Nächster ausführbarer Schritt nur nach direkter Zustimmung: im erhaltenen kostenlosen Ansichtskontext genau den gemeldeten nie gestarteten Fall einmal starten, vorher Quelle/Antwort/fehlenden Job abgleichen; danach Ergebnis, Usage/Reserve und unveränderte Note prüfen. Bei Ablehnung bei der fiktiven Abnahme bleiben. Keine Klasse neu laden und dadurch andere automatische Aufrufe auslösen.

## Secure und verbleibende Geräteabnahme

Der Native-Owner hat Secure1.0(1321), Quelle `1c061200`, unabhängig veröffentlicht; Martin hat die TestFlight-Verfügbarkeit bestätigt. [Native Übergabe](../../../workstreams/secure-phone-compact-20261118.md) belegt die kompakte Titel-/Uhrzeile und erhaltene Aufgabenschrift. Diese Web-/Backend-Veröffentlichung ist kein neuer Secure-Build und keine eigene native Lösungsfreigabeansicht. Physische Abnahme auf iPhone/iPad bleibt offen.

Der dokumentierte native Mindeststand iOS/iPadOS17 deckt Popover-API und `:popover-open` ab; `compatibility.json` enthält offizielle Quellen. Kein Safari16-Fallback und kein physischer iOS17-Test behauptet. Bestehende historische503-Ursache bleibt unbekannt. Ausgeführte Cloudaktionen beendet, keine laufende Deployment-Operation und keine neue Budgetreservierung.

Abgleich mit main0a364ac: Die nachträglichen Native-Ergänzungen zum separat hochgeladenen Secure1332-Logo sind erhalten.1321-Verfügbarkeit ist menschlich bestätigt;1332-Verfügbarkeit und physische Abnahme laut Native-Übergabe noch offen. Kein weiterer Upload durch den Webchat.
