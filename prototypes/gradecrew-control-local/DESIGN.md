# GC-BRAIN-01 – lokaler Prototyp, 06.10.2026

Expliziter Nutzerauftrag: jetzt einen kurzen lokalen Prototyp bauen. Bereichsübersicht, belegte Farbstufen, Aufgabenkommentare und Modellauswahl vor Übergabe. Vorherige konzeptionelle Entwürfe sind die Grundlage; dieser Auftrag autorisiert den lokalen Prototyp, keine Cloud-/Production-Inbetriebnahme.

## Umfang
Ein lokaler Node-Server ohne installierte Produktabhängigkeiten liefert eine Browseroberfläche und schreibt Kommentare, eigene Aufgaben und bestätigte Auftragsentwürfe atomar in `.local/state.json`. Start nur an 127.0.0.1. Kein automatischer KI-Aufruf, kein API-Key, keine automatische Chat- oder Guardian-Steuerung. Entwürfe können kopiert oder exportiert und im Codex-Chat übernommen werden. Auswahl ist kein tatsächlicher Modellwechsel. Lokale Änderungen bleiben getrennt von GitHub-Snapshots.

GitHub-TODO und exakt zugeordnete Release-State-Einträge werden als importierte Beobachtungen angezeigt. Kein aktueller Live-Deploy wird allein daraus behauptet. Fehlende Zuordnung bleibt unbekannt. Fünf UI-Reifestufen, sechs interne Zustände und ein separater Arbeitsstatus. Jeder Quellstand hat Datum und Herkunft.

Aufträge verwenden Abo oder getrennt Guardian/API. Modellberater ist eine nachvollziehbare lokale Heuristik nach Umfang und Risiko, nicht eine erfundene Benchmarkberechnung. Drei Modellfamilien: GPT-6 Luna, GPT-6.1 Sol, GPT-6 Astra. Manuelle Auswahl bleibt erforderlich. Sicherheits-/Architekturthemen werden nicht allein wegen Preis heruntergestuft. Guardian bleibt vorhanden und unverändert; in diesem Prototyp nur als gesonderter Prüfweg beschrieben, ohne Dispatch.

DeepSWE-Snapshot (22.09.2026) speichert exakt bezeichnete Modell-/Effort-Ergebnisse; diese sind keine Vorhersage der Pro-Nutzung. Artificial Analysis wird als Quelle verlinkt, ohne aus nicht abgerufenen Charts Werte zu erfinden. Keine kostenpflichtige Live-Abfrage. Arbeitsräume sind thematische Filter, noch keine neu angelegten Codex-Chats.

## Ausführung und Prüfung
1. Bestehende Quellen importieren und Herkunft bewahren.
2. Tests für Persistenz, doppelte Auftrags-IDs, Validierung und lokale Zugriffsschranken; dann minimalen Server implementieren.
3. Übersicht, Bereichsfilter, Aufgabenansicht, Kommentare, Modellentscheidung und Export bauen.
4. Lokale End-to-End-Prüfung und visuelle Desktop-/Mobilkontrolle; Kopier-/Exportgrenze sichtbar lassen.
5. Code und bestehende Task-Historie auf eigenem Branch sichern.

Nicht in diesem Prototyp: lückenloser Chatimport, automatische Ausführung, Cloudbetrieb bei ausgeschaltetem Mac, geänderte bestehende API-Ketten, echte Live-Synchronisierung, Rollout oder Production-Freigabe. Nächster Integrationsschritt: getestete Abo-Chat-Brücke mit Ergebnisrückschreiben.
