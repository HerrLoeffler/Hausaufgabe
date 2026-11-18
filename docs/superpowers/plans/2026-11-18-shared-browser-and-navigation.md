# Gemeinsamer Schulrechner und Aufgabennavigation – Freigabeentwurf

Task **GC-WEB-REPAIR-20261007**, Teilauftrag vom 18.11.2026. Fachrolle: begrenzte Diagnose und Planung; gemeinsame Übergabe/TODO beim Batchowner. **Keine Freigabe zur Umsetzung oder Veröffentlichung.**

## Auftrag und Quellenstand

Nach einer Abgabe soll die nächste Person am selben Schulrechner beginnen können, ohne Browserdaten zu löschen. Eine laufende oder noch nicht bestätigte Abgabe darf dabei nicht verloren gehen. Zusätzlich wird eine seitliche Aufgabenübersicht für breite Ansichten in Browser und Secure vorgeschlagen; auf kleinen Bildschirmen bleibt die Navigation kompakt. Native Secure bleibt hier ein Konzept, kein Swift-/App-Buildauftrag.

Untersucht: der vom Batchowner als aktueller Live-Hostingstand verifizierte Sourcecommit `338c0432645803a58f71531a0d016abb5a44cbf9`. Einstieg/Regeln zusätzlich von Remote-main `398b7a45` gelesen. Public Staging ist ein anderer Stand; diese Diagnose wird ihm nicht als ausgeführter Gerätetest zugeschrieben. Der aktuelle tatsächliche Functionsdeploy wurde durch diese lokale Prüfung nicht erneut ermittelt. Die Handlerbelege unten gelten für die reale Exportkette dieses Sourcecommits.

Branch: `docs/shared-browser-plan-20261118`; eigener Checkout. Parent-Handoff: `workstreams/feedback-gc39-release-20261013.md`. Keine neuen Provideraufrufe, Kostenreservierungen, Cloud-Schreibtests, Deploys oder echten Schülerdaten. Modell/Aufwand vom Parent geerbt, tatsächliche Runtime-/Preisdaten nicht beobachtbar (`unknown`); kein Modellwechsel.

## Diagnose: Der Browser setzt die vorige Teilnahme fort

Der Befund erklärt das gemeldete Verhalten im normalen Browserzugang. Die konkrete Schulrechnersitzung wurde nicht ausgelesen; zusätzliche browser-/geräteabhängige Ursachen sind damit nicht ausgeschlossen.

| Codebeleg im untersuchten Commit | Bedeutung |
| --- | --- |
| `startup.js:74–86` | Öffentliche `?test=`-Links gehen vor dem Import von `app.js` nach `secure-student.html`. Der Secure-Webpfad ist für die Diagnose maßgeblich. |
| `secure-assessment-client.js:18–66` | Je Test existiert genau ein dauerhafter localStorage-Eintrag `gradecrew_secure_assessment:v2:<CODE>`. Er enthält die zufällige Clientkennung und den Versuchsschlüssel. |
| `secure-assessment-client.js:107–115` | Die gespeicherte Teilnahme wird bei einer neuen Veröffentlichungsrunde entfernt; beim selben Test in derselben Runde bleibt sie erhalten. |
| `secure-assessment-client.js:186–198` | Erfolgreiche Abgabe setzt den gespeicherten Status auf `submitted`; die Kennung bleibt bestehen. |
| `secure-student.js:749–764` | Bei vorhandener Attempt-ID wird der gespeicherte Name gegenüber einer neu übergebenen Namenseingabe bevorzugt und der Versuch fortgesetzt. `submitted` führt direkt zur bisherigen Abgabebestätigung. |
| `secure-student.js:667–706` | Der Ergebnisbildschirm leert Antwortentwürfe, enthält jedoch keinen Wechsel zur nächsten Person und entfernt die Teilnahmeberechtigung nicht. |
| `assessment-functions/package.json:9`, `assessment-functions/main.js:6–9` | Der tatsächlich konfigurierte Backend-Einstieg ist `main.js → lib/secure-lifecycle.js`. `assessment-functions/index.js` ist nicht der maßgebliche exportierte Handler. |
| `assessment-functions/lib/secure-lifecycle.js:436–437,611–619` | Versuch = Test + Runde + zufällige Clientkennung; bestehender Versuch verlangt passenden Schlüssel und denselben Namen. Ein neuer Name allein darf A nicht umbenennen. |
| `assessment-functions/lib/secure-lifecycle.js:40,472–484` | Die IP ist ein Missbrauchslimit von 250 neuen Starts pro Test/Tag, keine Ein-Person-pro-Anschluss-Sperre. |

Im Clientpfad werden weder Firebase-Auth noch anonyme Anmeldung importiert. Der Browser besitzt seinen Versuch über den zufälligen Schlüssel. Ein pauschales Abmelden oder Ändern der IP-Regeln wäre für diesen belegten Ablauf nicht zielführend. „Cache löschen“ entfernt wahrscheinlich auch die gespeicherte Teilnahme; das erklärt die Wirkung, ist aber kein geeigneter regulärer Ablauf.

### Lokal reproduzierbar, ohne Cloud

`docs/evidence/shared-browser-20261118/diagnose.cjs` lädt den unveränderten echten Client und die echten exportierten Callable-Handler über den vorhandenen In-Memory-Testadapter. Alle Requests besitzen dieselbe synthetische IP. Ausführen aus dem Repo mit `node docs/evidence/shared-browser-20261118/diagnose.cjs`.

Ergebnis am 18.11.2026: **PASS**, acht Eigenschaften bestätigt:

1. A startet und gibt ab; die Teilnahme bleibt als `submitted` im localStorage.
2. Eine neue Clientinstanz im selben Browserspeicher erhält wieder A und dessen Bestätigung.
3. B mit As weiterverwendeter Kennung wird bei einem direkten Start serverseitig abgewiesen.
4. Eine bewusst neue zufällige Kennung erzeugt B bei identischer IP.
5. As gespeicherte Abgabe bleibt unverändert.
6. Bs Schlüssel kann As Versuch nicht fortsetzen.
7. Das gemeinsame IP-Limit zählt beide Starts regulär, ohne erhöhtes Limit oder Ausnahme.
8. Eine alte Clientinstanz folgt derzeit ebenfalls der ersetzten globalen Kennung: **Ein bloßer Löschbutton wäre bei mehreren Tabs unzureichend.**

Bestehende Prüfungen: `node --test secure-assessment-client.test.mjs secure-student-route.test.mjs student-attempt-guard.test.mjs assessment-functions/test/security-audit-behavior.test.js` → **47/47 bestanden**. Der erste Lauf hatte 43 bestandene Tests und einen Ladefehler wegen nicht verknüpftem `jsdom`; nach Wiederverwendung der bereits vorhandenen Abhängigkeiten bestanden alle 47. Kein Produktfix wurde ausgeführt. Lokales Node: `/Applications/ChatGPT.app/Contents/Resources/cua_node/bin/node`, v24.22.1; Backendziel ist laut Paket Node22. Kein Browser-/Nativ-/Live-E2E-Nachweis.

### Historischer Pfad bleibt getrennt

`app.js:7502–7524` speichert einen alten Timer je Test. `student-attempt-guard.js:1–94,163–200` führt zusätzlich einen lokalen Abgabeschutz (sechs Stunden) und eine Kennung für unlimitierte Versuche. Diese Logik kann ähnliche Meldungen erzeugen, ist wegen des Redirects aber nicht der normale öffentliche Secure-Webzugang. Lehrer-Vorschau/Gasttour bleiben im alten Pfad. Für den vorgesehenen Fix keine pauschale Löschung aller Timer/Locks, keine zweite unsichere Submitstrecke und kein Abschalten des Guards.

## Empfohlener Ablauf für die nächste Person

Auf der serverseitig bestätigten Abgabe erscheint **„Nächste Person“**. Kurzer Begleittext: „Die Abgabe bleibt bei deiner Lehrkraft gespeichert. Danach ist dieser Rechner für die nächste Person bereit.“ Anschließend ist das Namensfeld leer; der gleiche Test bleibt vorausgewählt. B beginnt erst nach eigener Namenseingabe und ausdrücklichem Start. A wird weder geändert noch erneut abgegeben.

| Ansatz | Eignung 1–10 | Begründung anhand Datenerhalt, Alltagstauglichkeit und Regelwahrung |
| --- | --- | --- |
| Bewusster Wechsel nach bestätigter Abgabe | **9/10, empfohlen** | Verständliche Übergabe, A bleibt erhalten, erneutes Laden kann zunächst As Bestätigung zeigen; verlangt sorgfältige Tab-/Retrytrennung. |
| Teilnahme sofort nach jeder Abgabe automatisch löschen | **5/10** | Weniger Klicks, aber Reload verliert As Bestätigungszugang, unbeabsichtigter Neustart wird leichter und Tabs können die Person wechseln. |
| Browserdaten löschen oder IP-Sperre lockern | **1/10** | Löscht unnötig Wiederherstellungsdaten oder ändert eine nicht ursächliche Regel; löst keinen sicheren Personenwechsel. |

Die Bewertung betrifft nur diesen Nutzungsvorgang, keine Gesamtbewertung von GradeCrew. Dies ist die Empfehlung des Fachchats, noch keine Nutzerentscheidung.

### Sicherheits- und Zustandsvertrag für eine spätere Umsetzung

- Der Wechsel ist ausschließlich nach einer **frischen serverseitigen Bestätigung** für exakt die erwartete Attempt-ID erlaubt (`status=submitted` mit passendem Receipt). Ein lokales `submitted`, sichtbarer Erfolgstext oder abgelaufener Timer genügt nicht.
- Vor der Rotation separat öffentlich prüfen, ob der gleiche Test noch für neue Starts offen ist. Der bestehende `getInfo`-Fallback darf für diese Freigabe nicht als „offen“ gelten: Er gibt auch bei beendetem Test As legitime Bestätigung zurück. Bei beendetem/gesperrtem/unveröffentlichtem Test bleibt der neue Start gesperrt; ein anderer Testcode kann über den normalen Einstieg eingegeben werden.
- Bei laufendem Test, Warteraum, ausstehendem Submit, Offlinezustand oder unklarer Antwort bleibt As Kennung samt Entwurf erhalten. Kein automatischer Wechsel und kein Löschen als Fehlerbehandlung. Bei gespeichertem Submit mit verlorenem Netzwerk-Response zuerst As Status erneut abfragen; erst danach Wechsel erlauben.
- Neue Person erhält neue kryptografisch zufällige `clientAttemptId` und `attemptToken`; kein Namenstausch innerhalb As Versuch. Test-/Runden-/Fristen-/Sperr-/Lösungsfreigabe-/Quotaregeln und idempotente Abgabe bleiben serverseitig unverändert. Bei gemeinsamem Start erhält B nur die noch verbleibende Zeit derselben Runde; neue Startzeit nur im vorhandenen Selbststartmodus.
- Jede geladene Seite bindet Callable-Anfragen an ihre unveränderliche Teilnahmeidentität. Vor jedem Schreiben des lokalen Slots wird geprüft, ob dessen Generation noch passt. Verspätete Antworten dürfen Bs Slot niemals mit A überschreiben. `storage`-Ereignisse stoppen alte Polls und sperren deren Oberfläche mit „An diesem Rechner wurde eine neue Teilnahme begonnen“; alte Tabs dürfen keine Antworten mit Bs Schlüssel senden.
- Rotation und Start im selben Browser werden je Test über `navigator.locks` serialisiert; dabei erwartete Kennung nach Netzwerkantwort und innerhalb des Locks erneut vergleichen. Die Zufallskennung kann als Generationsmarker dienen. Unterstützt ein Zielbrowser diese verlässliche Sperre nicht, bleibt der Wechsel bis zu einer separat getesteten gleichwertigen Koordination gesperrt; kein stiller unsicherer Fallback.
- Der Slot wird mit **einem** geprüften Storage-Schreibvorgang ersetzt, nicht erst gelöscht. Bei Speicherfehler bleibt A erhalten und der Wechsel zeigt einen verständlichen Fehler. Doppelklick und parallele Wechsel erzeugen höchstens einen Übergang. Neue Seite übernimmt den Slot bewusst; Start/Resume dürfen nicht unbeabsichtigt einem fremd ersetzten Slot folgen.
- Nur As exakt zugeordnete flüchtige und dauerhafte Antwortentwürfe (`secure-draft-persistence.js:28–33`) sowie sichtbare Antworten, Ergebnis-/Lösungsdarstellung und Namenseingabe entfernen. Eine noch vorhandene `gradecrew.studentEntry.v1`-Namensübergabe für diesen Test ebenfalls verwerfen, damit A nicht wieder vorgefüllt wird; vorhandenes `autocomplete="off"` erhalten. Kein `localStorage.clear()`, keine Cookie-/Cache-/Serviceworker-Löschung, kein Lehrerlogout und kein Eingriff in andere Tests.
- Nach dem Wechsel keine lokale Historie mit As Schlüsseln anlegen. Die Abgabe bleibt auf dem Server bei der Lehrkraft; derselbe gemeinsam genutzte Browser bietet danach keinen Rückweg zu As persönlichem Ergebnis. Normales Reload **vor** dem bewussten Wechsel darf As Bestätigung weiterhin wiederherstellen.
- Namen/Kürzel sind im vorhandenen Zugang keine geprüften Personenidentitäten. Der Wechsel erhält vorhandene Wiederholungs-/Zugangsregeln, kann aber nicht beweisen, dass wirklich eine andere Person davor sitzt. Eine personenbezogene Einmalteilnahme würde einen gesondert freigegebenen Teilnehmer-/Zugangsvertrag benötigen und gehört nicht in diesen Fix.

### Betroffene Dateien und konkrete Umsetzungsschritte nach Freigabe

1. **Fehlende Verhaltenstests zuerst:** `secure-assessment-client.test.mjs` durch ausführbare Clienttests ergänzen (synthetische Callables, geteilter Storage, zwei Clientinstanzen); `secure-student.test.mjs` für Receipt→Nächste Person→leere Eingabe. Die unten stehende Matrix sind die Assertions, nicht nur Quelltextmuster.
2. **Clientvertrag in `secure-assessment-client.js`:** `beginNextParticipant(rawQuizId, { expectedAttemptId }) -> Promise<{ quiz, session }>` einführen. Es prüft serverseitigen Abschluss und echtes öffentliches Offen-Sein, serialisiert den geprüften Austausch und liefert den leeren neuen Slot; laufende/pagegebundene Identitäten und veraltete Response-Schreibvorgänge absichern. Kein Backendendpunkt und keine Auth-/Rulesänderung ist für den belegten Fall erforderlich.
3. **Ergebnisaktion in `secure-student.js`:** „Nächste Person“ erst am bestätigten Receipt anbieten. Aktion während Prüfung sperren, bei Fehlschlag A behalten, nach erfolgreichem Wechsel As Inhalte/Entwürfe gezielt entfernen und dieselbe Testseite frisch mit leerem Namen öffnen. `secure-draft-persistence.js` bei Bedarf um expliziten Cleanup für die erwartete alte Attempt-ID ergänzen; dessen Observer darf nach Rotation nicht versehentlich Bs Entwurf löschen.
4. **Lokale Prüfung und Vorschau:** alle betroffenen Client-/Secure-/Draft-/Deadline-/Result-/Solutiontests, bestehende Backend-Verhaltenstests sowie echte Browserreisen mit synthetischen Callables ausführen. Manifest nur nach tatsächlicher Runtimeumsetzung erneuern. Unabhängigen Review an genau diesem Patch durchführen; vorhandenen Batchstand integrieren und erneute CI vor Vorschau. Keine Veröffentlichung aus diesem Plan.

| Pflichtfall | Beobachtbare Abnahme |
| --- | --- |
| A abgeben → Nächste Person → B gleicher Test, gleiche IP | Zwei serverseitig getrennte Attempts/Abgaben; B sieht keinerlei Namen/Antworten/Punkte von A. A unverändert. |
| Reload vor und nach Wechsel; Browser schließen/öffnen | Vor Wechsel As Bestätigung, nach Wechsel leerer B-Einstieg bzw. Bs eigener laufender Versuch. |
| A noch aktiv/Warteraum/ungesendet; offline | Keine Rotation; As Kennung, Antworten und ursprünglicher Timer wiederherstellbar. |
| Submit gespeichert, Response verloren | Erneute Statusprüfung bestätigt A; kein Doppel-Submit, erst dann Übergabe. |
| Gleichzeitige getrennte Browserprofile/Geräte an derselben IP | Unabhängige Teilnahmen; reguläres gemeinsames Limit bleibt unverändert. |
| Zwei Tabs, paralleler Wechsel, verspätete Poll-/Start-/Submitantwort | Alter Tab kann A weder mit B verwechseln noch Bs Slot überschreiben; neuer B-Versuch bleibt erhalten. |
| Gefälschter lokaler Abschluss, fremder Token, falsche Attempt-ID | Wechsel abgewiesen, kein Datenverlust, keine fremde Bestätigung. |
| Test beendet/unveröffentlicht/neue Runde/Quote erschöpft | Richtige vorhandene Serverablehnung; keine Fristverlängerung oder Umgehung über Wechsel. |
| Storagefehler, Doppelklick, nicht unterstützte Tabsperre | Eindeutiger gesperrter/Fehlerzustand, kein halber Reset und kein Verlust aktiver Teilnahme. |
| Lehrer-Vorschau/Gasttour/Legacyguard | Keine neue Personenaktion ohne echten Serverbeleg; Vorschau und alte Schutzregeln bestehen unverändert. |

## Aufgabennavigation: breiter Bildschirm seitlich, Handy kompakt

**Nur Konzept zur Freigabe.** Aktuell zeigt Secure-Web alle Fragen in einer Liste; darüber liegt die klebende Vor-/Zurück-/Übersichtszeile (`secure-student-navigation.mjs:1–115`, `secure-student.html:75–85`, `secure-student.css:25–46`). Die Übersicht ist derzeit ein aufklappbares Zahlenraster. Die vorhandenen Antwortfelder bleiben maßgeblich; keine parallele Antwortkopie und kein neues Bewertungsmodell.

Empfohlen wird eine dauerhafte schmale Aufgabenliste links, sobald neben ihr mindestens 560 CSS-Pixel für den Aufgabeninhalt bleiben. Richtwert ab 1024 CSS-Pixel verfügbarer Breite, Liste etwa 208–240 Pixel, Abstand 24 Pixel, Aufgabenbereich maximal etwa 860 Pixel. Titel, Frage, Medien und Antworten stehen gemeinsam rechts und nutzen eine klare linke Kante. Die Seite scrollt weiter normal durch die bestehenden Aufgaben; Navigation springt zur gewählten Frage. Eine neue Einzelfragen-/Kartenlogik wäre ein zusätzlicher Verhaltensumbau und ist hier nicht vorgesehen.

```text
Breit / Browser und zukünftiges Secure
┌────────────────────────────────────────────────────────┐
│ Testtitel                           Restzeit / Verbindung│
├─────────────────┬──────────────────────────────────────┤
│ Aufgaben        │ Aufgabe 4                     2 Punkte│
│ 1 Bearbeitet    │ Frage, Bild oder Audio                │
│ 2 Offen         │                                      │
│ 3 Bearbeitet    │ Antworten / Eingabefelder             │
│ 4 Aktuell       │                                      │
│ …               │ Nächste Aufgabe im normalen Verlauf   │
│ 18 Offen        │                                      │
└─────────────────┴──────────────────────────────────────┘

Schmal / Handy und schmales Tablet
┌────────────────────────────────────┐
│ Test / Restzeit                     │
│ ‹  Aufgabe 4 von 18  Übersicht  ›    │
├────────────────────────────────────┤
│ Frage und Antworten volle Breite    │
└────────────────────────────────────┘
```

Die Liste zeigt Nummer und **„Offen“/„Bearbeitet“**, für die aktuelle Aufgabe zusätzlich ein klarer Rand und `aria-current="step"`. „Bearbeitet“ bedeutet vorhandene Eingabe, niemals richtige Antwort oder sichere Vollständigkeit. Numerierung folgt exakt der angezeigten, gegebenenfalls gemischten Aufgabenreihenfolge. Keine Lösungsbegriffe im Navigationskurztext.

Auf schmalem Tablet/Handy bleibt eine einzeilige kompakte Navigation mit aufklappbarer Übersicht; keine ständig sichtbare Seitenleiste, die Fragen einengt. Geöffnete Übersicht hat eine begrenzte Höhe und bleibt scrollbar. Breitenwechsel erhält aktive Aufgabe, Fokus, Eingaben, Audiozustand und Timer. Auf breitem Desktop ist nur die Aufgabenliste dauerhaft sichtbar; keine doppelte sichtbare Mobilübersicht. Lange Liste scrollt innerhalb der verfügbaren Höhe, der Hauptinhalt behält normalen Seitenscroll. Abgeben bleibt nach der letzten Aufgabe im Inhaltsbereich, kein versehentlich erreichbarer Abgabebutton in jeder Listenzeile.

Zugänglichkeit: `nav` mit verständlichem Namen; echte Buttons mit mindestens 44×44 CSS-Pixel, lesbare Labels, sichtbarer Fokus und Zustand zusätzlich zum Farbton. Tabreihenfolge bleibt logisch; Auswahl fokussiert die Frageüberschrift ohne Eingaben neu zu erzeugen. Escape schließt die mobile Übersicht und gibt Fokus zurück. Seitenleiste nach Breakpoint nicht duplizieren; unsichtbare Controls dürfen keinen Fokus bekommen. Bei 200%-Zoom, Bildschirmtastatur und 320px Breite bleibt die aktive Eingabe frei. Keine animierten automatischen Sprünge während der Eingabe.

Gestaltungsgrundlage sind vorhandene Secure-Farben `#f5f7fb` (Fläche), `#fff` (Inhalt), `#172033` (Text), `#1769e0` (Aktion), `#667085` (Nebeninformation), `#e1e7ef` (Trennung), vorhandene Schriften und minimaler Bildanteil gemäß Design Bible. Kein neuer visueller Stil und keine zusätzliche Crewdekoration im laufenden Test. Fachlich entscheidend ist die ruhige Frage-/Antwortfläche neben einer kleineren Orientierungsliste.

Spätere Webdateien: `secure-student.html`, `secure-student.css`, `secure-student-navigation.mjs`, bestehende Browsernavigationstests; falls die Lehrervorschau angeglichen wird, separat deren `app.js`-Navigationsrenderer und Styles. **Kein Dateiauftrag für native Secure jetzt.** Die vorhandenen Dateien unter `native/GradeCrewSecure` sind kein Nachweis des aktuell auf Geräten installierten Prüfungsbildschirms. Für einen späteren Nativeauftrag zuerst tatsächlichen Appbranch/Build und seine Sicherheits-/Offlineverträge prüfen; erst danach dieselbe breite/schmale Informationsstruktur übertragen. Keine Aussage über einen bereits vorhandenen Sidebarbuild.

Abnahme nach einer späteren Umsetzung: Chromium und WebKit mit 1/18/40/50 Aufgaben bei 320/390/768/1024/1440/2560px, kurzer Querformat-Höhe und 200%-Zoom; lange Frage-/Antworttexte, Bild/Audio, gemischte Reihenfolge, bearbeitet/offen, Touch-/Tastaturwahl, Fokus, letztes Aufgabenende, sichere Abgabe und Erhalt aller Antworten prüfen. Native und physische Geräte separat; ein Webtest ist kein Secure-App-Gerätetest.

## Relevante Kontrollen und Grenzen

Implementierungsowner ist der ausführende Web-/Assessmentfachchat nach Freigabe; unabhängiger Patchreview vor Integration. Für den **zukünftigen** Patch: SEC06/07 (Attempt-/Tabtrennung), SEC11 (bestehende IP-Quote), SEC14 (zulässiger Abschluss/Retry), SEC17 (kein Ergebnis-/Lösungszugang von A für B), PRIV07 (gezielter lokaler Cleanup), PRIV14/15 (Kontrast/Fokus/Bedienung), PRIV20 (lokale Bereinigung ist keine serverseitige Schülerdatenlöschung). Derzeit Status jeweils **nicht geprüft für den zukünftigen Patch**; die lokale Bestandsdiagnose bestätigt nur die ausdrücklich genannten Eigenschaften auf `338c043`. Kein Rechts-/Schul-/Gesamtsicherheitsnachweis.

## Übergabe und nächster Schritt

Dokumentation und Diagnose lokal gesichert; Produktcode, CI-, Integrations-, Staging-, Nutzer- und Productionstufe unverändert. Keine externen laufenden Vorgänge durch diesen Teilauftrag. Gemeinsame TODO-/Releasepflege beim Parent, nicht doppelt in diesem Checkout.

**Genau nächster Schritt:** Martin prüft den vorgeschlagenen Personenwechsel und das breite/schmale Navigationskonzept. Erst nach seinem Votum den bestätigten Teil umsetzen; native App bleibt ohne eigenen Folgeauftrag unberührt.
