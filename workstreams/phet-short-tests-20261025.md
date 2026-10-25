# PhET-Kurztestprofile — Übergabe

## Auftrag und Zuordnung

- Task-ID: GC-EXTENDED-QUESTION-TYPES-01; kein neuer konkurrierender Haupttask.
- Nutzerauftrag 25.10.2026: mehr PhET-Ideen verwenden, vorhandenen Prototypbestand zusammenführen und wirklich mit KI Tests erstellen.
- Ausführender Recherche-Fachchat: aktueller Chat; vollständiger Chatlink unbekannt.
- Bestehender Primary-Owner: Fachchat „Erweiterte Aufgabentypen“.
- Related Branch: `feature/phet-short-profiles-20261025`.
- Basis und direktes Integrationsziel: PR296, `test/visual-24-pilot-20261025`, `fda13a26d1c4b4cdeadd3689a1280cdd68beb765`.
- Übergeordnetes Integrationsziel: `feature/visual-prototype-ai-02-20261021` / PR265.
- Letzter gelesener main: `ec388fcd835b87d8aa8653f9f0cae4c461408a2b`; Development-Status-Lauf 40194915817 gelesen. Dieser Run gehörte PR305, nicht einem neuen main-Commit.

## Gesicherter Teilschritt

Acht opt-in Kurztestprofile sind als eigenes Modul implementiert und über zwei kleine Ergänzungen in `functions/lib/visual-prompts.js` an den bestehenden Autorenprompt angeschlossen. Eigene Referenzaufgaben, lesendes Hilfswerkzeug und fachliche Doku liegen bei.

Verwendeter Fundus: EXP01, EXP03 sowie VIS03, VIS05, VIS08, VIS12, VIS13. Vektoren, Koeffizienten, Teilchenbilanz und Mengen nutzen bestehende Interaktionen mit eigenen fachlichen Aufgaben.

Keine zweite App und keine neue Simulation. Keine Änderungen an Renderer, Authentifizierung, Solution-Stripping, Servergrader, aktiven Prüfungen oder den vorhandenen 192 Pilotaufgaben. Das gemeinsame Promptfile wurde gegen genau PR296 gelesen; alle bestehenden Regeln bleiben erhalten.

## Prüfungen und Befunde

- Acht Referenzaufgaben unabhängig handgerechnet und fachlich zweitgeprüft.
- `node functions/test/short-test-profiles.test.js`: **17 bestanden, 0 fehlgeschlagen**, Node 24.22.1.
- Geprüft: bestehender Remy-Request/Prompt, unbekannte Profil-IDs, unabhängige Requestobjekte, strikte Visualvalidierung, richtige/falsche/leere Antworten, Teilpunkte, alternative Bruchmuster, festgelegte Koordinaten, kleinste chemische Koeffizienten, feste mA-Einheit, öffentliche Projektion ohne private Lösungs-/Reviewdaten.
- Konkreter Reviewfund: bestehende strenge Ganzzahlschreibweise akzeptiert kein typografisches Minus. Im neuen Atomprofil wird deshalb der vorhandene numerische Wertvergleich (`numericForm: any`) genutzt. Er akzeptiert äquivalente ganze Werte und „−1“. Erst rot reproduziert, dann grün geprüft; kein Eingriff in den gemeinsamen Grader.
- Unabhängiger Code-/Fachreview: keine blockierenden Fehler im begrenzten Patchumfang. Keine pauschale Produkt-/Lernwirksamkeitsfreigabe.
- Isolierter Sparse-Quellstand über GitHub-Connector materialisiert, weil Shell-Git-Netzzugriff nicht verfügbar war. **Keine vollständige Repo-Testsuite, kein Node22-CI-Nachweis, kein Build-/Deploy-Nachweis dieses Patches.**

## Tatsächlich erreichbarer Ablauf

Die bestehende visual255-Lehrkraftseite und `/pilot24/` wurden im Browser geöffnet. Die öffentliche Übersicht zeigt die 24 vorhandenen Tests. Die Lehrkraftseite ist in dieser Sitzung nicht angemeldet. Für echte KI-Erstellung wird ein bereits berechtigtes Test-/Admin-Konto benötigt; keine Berechtigungen wurden erweitert.

Die lokale Browser-Anbindung meldete „Browser access requires the originating browser context“. Daher ist die Identität/Version auf Martins `127.0.0.1:8766` ungeklärt. Keine Gleichsetzung dieses Ports mit der Online-Vorschau.

**Neuer Provider-/Job-/Quiz-/Attempt-Start in diesem Arbeitsschritt: keiner.** Historische echte Remy-/Emmi-/Abgabeprüfungen und die 24er-Serie werden nicht als neue Prüfung dieses Patches ausgegeben. Der bestehende Preview-Deploy enthält diesen neuen globalen Prompthook noch nicht.

## Anlassbezogene Assurance

| Umfang | Owner | Status | Beleg / Grenze |
|---|---|---|---|
| Geschlossene Visualverträge und Lösungstrennung | ausführender Fachchat / bestehender Primary-Owner | erfüllt im lokalen Patchumfang | 17 Tests mit realem vorhandenen Validator/Grader; keine Online-Freigabe |
| Fachliche Schlüssel, alternative Antworten, Teilpunkte | ausführender Fachchat und unabhängiger Review | erfüllt für acht Referenzen | Handrechnung und deterministische Tests; KI-Ausgaben noch offen |
| Auth, Rate Limits, idempotente Serverabgabe | bestehender Primary-Owner | nicht geprüft für neuen Live-Durchlauf | unverändert; tatsächliche Sitzung fehlt |
| Fremde Assets, neue Provider, personenbezogene Inhalte | ausführender Fachchat | nicht relevant für Patch | eigene synthetische Inhalte, keine neuen externen Dienste |
| Preview-Release und Geräteabnahme | bestehender Primary-Owner | offen | kein neuer Deploy / keine Geräteabnahme |

## Koordination und nächster Schritt

Das Patchpaket wird als Draft-PR an den bestehenden Primary Branch gegeben. Repo-Übergabe ist kein Nachweis, dass der andere Chat eine Nachricht erhalten hat; direkte Chatsteuerung ist hier nicht verfügbar. Bekannte parallele Labeling- und Pilotänderungen bleiben unangetastet.

**Genau nächster ausführbarer Schritt:** mit vorhandener berechtigter Anmeldung KURZ-BRUCH im bestehenden Remy starten, zurückgelieferte Job-ID sofort sichern, Inhalte unabhängig prüfen und anschließend Emmi sowie die normale Vorschau-Abgabe testen. Der bereitgestellte Request enthält die Profilanweisung vollständig. Ein Lauf gegen die aktuell deployte Version qualifiziert diesen Anfragetext, nicht den noch nicht deployten globalen Hook.

Modelle/Aufwand: bestehende Delegationskontexte weiterverwendet; angefordert geerbt, tatsächlich verwendete Runtime-/Usagewerte nicht separat ausgewiesen. Kein Modellwechsel zur Umgehung des Anmelde-/Netzblocks.

