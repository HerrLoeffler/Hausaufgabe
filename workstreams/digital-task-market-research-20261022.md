# GC-EXTENDED-QUESTION-TYPES-01: Markt- und Fachdidaktikrecherche

## Auftrag und Scope

Nutzer beauftragt eine sehr breite Internetrecherche zu digitalen Aufgaben über Grundschule, Haupt-/Mittelschule, Realschule, Sek I/II, Gymnasium und berufliche Schulen, vorhandenen Lösungs-/Lernangeboten sowie daraus ableitbaren KI-Aufgabentypen für GradeCrew. Bestehende Task-ID und gemeinsamer Fundus wiederverwendet; keine zweite technische Implementierung begonnen.

## Gesicherter Stand

- Branch: `docs/digital-task-market-research-20261022`; Ziel `main`, isolierter Dokumentationskandidat.
- Ursprünglicher main: `2b3f2863d3dc2dc067340dbf61ecf70ce47c9094`; früher Zwischenstand: `ad62871971cf5a0cd4a2191ab83088368adec179`.
- Vor Abschluss aktuelles main `f1e030ca642942e3b42f75a3ff091240793549fd` sowie START_HERE, AGENTS, STATE, Workstreams-README, TODO, Registry und bestehender Aufgabenfundus abgeglichen. Abschlusssnapshot baut auf dessen vollständigem Baum auf; zwischenzeitliche Native-/TestFlight-Dokumentation bleibt erhalten.
- Basisfundus aus PR285 bereits gemergt; dessen 13 VIS-, 5 EXP- und 8 MOD-Familien sind Referenz, keine pauschale Live-Funktionsbehauptung. PR265/PR271 und weitere Implementierungsarbeit werden nicht ersetzt.
- Live Development Status zuletzt Run [39843476057](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/39843476057), Job120050461501: success, Logs tatsächlich gelesen. Existing Primary `docs/visual-learning-principles-20261022` +0/-5 zu main; kein offener Primary-PR in diesem Audit. Registry ergänzt lediglich den eigenen Related Branch. Allgemeine Überschneidungen in TODO/Registry/Fundus bewusst additiv behandelt.

## Ergebnis

148 Angebots-/Fach-/Referenzprofile, 163 eigene Aufgabenentwürfe. Aufteilung: 28/44 MINT, 30/45 Sprache/Grundbildung, 35/50 Gesellschaft/Künste/Beruf, 30/10 fächerübergreifend, 10/14 fachliche Ergänzungen, 8/0 Lösungsdienste, 7/0 Qualitätsreferenzen (Quellen/Ideen). Einträge sind keine einzigartigen Anbieter; Ideen keine zusätzlichen technischen Fragetypen.

Kanonische Dateien:

- [Synthese](../docs/learning/DIGITAL_TASK_MARKET_RESEARCH_20261022.md): Marktgruppen, Fachmuster, Schulstufen, D/H/L, KI-Vertrag, Lösungshilfen, Prioritäten und Grenzen.
- [Strukturierter Katalog](../docs/learning/research/digital-task-market-20261022.json): vollständige Quellen und Aufgaben, stabile IDs, Original-URLs, Evidenz-/Rechtehinweise, Lernziele, Beispiele und Auswertung.
- [Prüfnotiz](../docs/learning/research/digital-task-market-20261022-review.md): konkret aufgelöste Fach-/Synthesebefunde und Datenvalidierung.
- Nutzerartefakte: filterbare XLSX-Ausgabe und PDF-Synthese; keine Medien-/Lehrwerkskopien in den Runtime-Pool aufgenommen.

## Tatsächliche Prüfungen und Grenzen

Öffentliche Originalseiten und ausdrücklich markierte offizielle Indexbelege recherchiert. Keine Konten angelegt, Abos gekauft oder kostenpflichtigen externen Produktläufe durchgeführt. Fachreview und unabhängiger Synthesereview mit konkreten Korrekturen abgeschlossen. JSON-Struktur, eindeutige IDs, Quellenverweise und vorhandene VIS/EXP/MOD-IDs geprüft. XLSX-Export/Wiederimport, native Tabellen/Filter/Fixierung, Formelzählung und visuelle Darstellung geprüft. Keine Laufzeit-, Generator-, Server-, Browserprodukt- oder Gerätetests dieses Projekts behauptet.

Drei fachliche Unteragenten beauftragt: Sprachen/Primarstufe, MINT/Informatik, Gesellschaft/Künste/Beruf; zusätzliche Cross-Recherche, Fachreview, Synthesereview und Artefaktaufbereitung. Angeforderte Agentkonfiguration `gpt-6.1-sol`, high; tatsächliche Provider-/Token-/Kostenwerte nicht separat ausgelesen. Keine separaten Task-IDs oder Ausführungsbudgets angelegt.

## Produkt- und Release-Status

Recherche und Dokumentation auf eigenem Branch. Kein Generator-/Poolimport, keine Änderung von Anwendungscode, API, Rules, Lösungsspeicherung oder Release-Manifest. `GRADECREW_STATE.json` bleibt unverändert, weil keine Release-/Deploy-Stufe geändert wird. Kein Staging-/Schul-Live-/Production-Deploy.

## Nächster ausführbarer Schritt

Die vorgeschlagenen 20 Referenzaufgaben pro Fachkontext ausarbeiten: MATH01, MATH04, LANG03, LANG06, MATH10, LANG13, SOC02, SOC11, MATH11, CHEM01, CS03, SOC39, SU01, BIO04, PHY05, SUP07, LANG21, LANG25, SOC21, SOC38. Jeweils Material, Lösung/Alternativen, Korrektor oder Rubrik, Hilfeverlauf und Lehrkraftvorschau prüfen. Das ist ein Vorschlag aus der Recherche, noch keine allgemeine Implementierungs- oder Deployfreigabe.

## Offene Grenzen

Kein flächendeckendes Mapping sämtlicher Bundesländer, Jahrgänge und Ausbildungsberufe. Kein vollständiger Preis-/API-/Rechte-/Accessibility-Audit fremder Produkte und kein empirischer Wirksamkeitsnachweis. Quellenzugang und Verfügbarkeit können sich ändern; scoyo, Duolingo for Schools und fobizz sind mit aktuellem differenziertem Status erfasst. Fachliche Eindeutigkeit, sinnvolle Alternativen und offene Beurteilung nicht durch einen allgemeinen freien KI-Korrektor ersetzen.

## Ergänzungsauftrag 25.10.2026 · laufender Zwischenstand

Martin fragt nach konkreten bisherigen Aufgaben und weiteren neuen nutzbaren Formaten. Fortsetzung unter derselben Task-ID und PR290; nur Recherche/Dokumentation. Aktuelle main-Basis geprüft: `21723ad5cfe3fb8e4062280b2dc2b7fb476c1de3`. Bestehender PR290 ist gegenüber main divergiert (+2 eigene/-5 main-Commits); gemeinsame TODO-/Registry-Ergänzungen werden vor Abschluss additiv abgeglichen. Development-Status Run40183534335, Job121139415611 erfolgreich; relevante Logs gelesen. Primary bleibt `docs/visual-learning-principles-20261022`, laut Audit +0/-10. PR265/271/296 bearbeiten Prototypen und bleiben außerhalb dieser Recherche.

Drei getrennte Fachrecherchen (MINT, Gesellschaft/Künste/Beruf, Sprache/Methoden) vergleichen Kandidaten gegen die 163 alten Entwürfe. Angefordert jeweils `gpt-6.1-sol`/`medium` für fachübergreifende Quellenarbeit; tatsächliche Provider-/Nutzungswerte unbekannt. Verantwortlicher Chat: bestehender Forschungsfachchat; Chat-Link unbekannt. Keine fremde aktive Schreibzuständigkeit übernommen.

Zwischenstand: 13 Kandidaten aus MINT und Ergänzung (16 Quellenprofile), noch ohne vollständigen Querschnittsreview. Datei `docs/learning/research/digital-task-extension-20261025.json` ausdrücklich `research_in_progress`. Noch keine neue Gesamtzahl als final berichten. Nächster Schritt: weitere Fachbeiträge einlesen, neue Mechanik/Untertyp/Lernablauf getrennt zählen und Überschneidungen zusammenführen. Kein Code, Runtime-Poolimport oder Deploy.
