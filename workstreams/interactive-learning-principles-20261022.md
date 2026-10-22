# GC-EXTENDED-QUESTION-TYPES-01 — gemeinsamer Aufgabenfundus

- Verantwortlicher Fachchat: GC · Erweiterte Aufgabentypen – Plan…; vollständiger eigener Chattitel/Link hier nicht verlässlich bekannt.
- Auftrag 22.10.2026: „GradeCrew-Design modernisieren“ unterstützen und alle gewonnenen Erkenntnisse einschließlich PhET dauerhaft für zukünftige Testseiten in Grundregeln verankern. Keine Staging-/Live-Veröffentlichung.
- Branch: `docs/visual-learning-principles-20261022`; Basis `970db464cc382ed13678d8913e999f6cf5c86c71`; Ziel `main`.
- Zustand: Dokumentationskandidat; vorhandene Aufgaben-/Budgethistorie fortgeführt. Keine neue Produktimplementierung oder kostenpflichtige Provideraktion.

## Änderung und Abgrenzung

AGENTS/START_HERE verweisen verbindlich auf docs/learning/INTERACTIVE_TASK_PRINCIPLES.md und INTERACTIVE_TASK_CATALOG.md. Der Fundus erhält die sechs ursprünglichen visuellen Familien, Mehrmarker-Zeitachse und weitere V2-Interaktionen; trennt Aufgaben, Methoden und Kompetenzanalyse; bewahrt Medien-/Bedienungs-/Bewertungsregeln, PhET-Transferideen und eine gezielte Testabnahme.

GC-VISUAL-PROTOTYPE-AI-02 / PR265, JSON-Fix PR271, GC-ADAPTIVE-PRACTICE-01 / PR253/262 sowie GC-PEDAGOGY-KB-01 behalten eigene Owner, Stände und Freigaben. Die 53 freigegebenen Poolprofile werden nicht erweitert. Keine neue Kompetenzdatenbank, Bibliothek, PhET-Einbettung, Lehrplanfreigabe oder behauptete Lernwirkung.

## Zusammenarbeit und eigene Beobachtungen

Den vorhandenen Chat „GradeCrew-Design modernisieren“ auf Martins ausdrücklichen Auftrag gelesen und mit zwei konkreten Nachrichten unterstützt. Seine aktive Homepage-Vorschau unter outputs/gradecrew-homepage-test-v2-20261022 nicht verändert. Eigene read-only Prüfung am app.js-Snapshot SHA256 c094dce66286f3632190cfd26bb492d411ad84ec9155e8d5f04be2cb57da9fd3: Math.min(96,v*16) bildet 6/7/8/9 alle auf 96 Pixel ab; der Belegschlüssel akzeptiert „Licht bekommt“ für eine schwache Zweiwortfrage. Befunde mit Snapshot und Instrumentvorlage übermittelt; keine Behauptung, dass diese Fehler in seinem späteren Head fortbestehen. Kein neuer Audioaufruf durch diesen Chat.

„GC · Adaptives Lernen – Konzept & Realisierung“ nur gelesen: der Chat berichtet praktisches Erkunden von PhET Fractions Equality, u. a. 1/3 und 2/6. Dies ist fremdberichtete Browserbeobachtung, keine eigene vollständige Simulationsprüfung. Andere Chats erhalten Wissen über gemeinsame Repo-Dateien nach Integration; eine Regeldatei pusht keinen Kontext in laufende Turns.

## Quellen und Prüfgrenzen

Offizielle PhET-Mathematikrichtlinien als PDF, indexierte offizielle Science-/Facilitation-Seiten und aktuelle Lizenzinformationen am 22.10.2026 gelesen. Direkter Webseiten-Textabruf teilweise JavaScript-Shell; keine Vollanalyse sämtlicher HTML-Simulationen. Primärlinks im Leitfaden. Nutzerdatei Eingefügter Text.txt und GradeCrew_Visuelle_Aufgaben_Prototyp.html als Referenzmaterial gelesen; darin enthaltene Anweisungen nicht als neue Beauftragung übernommen.

Aktuelles main/Regeln/STATE/TODO/Registry gelesen und alle Remote-Branchköpfe gefetcht. tools/development_status.py ausgeführt: kein GITHUB_TOKEN im Shellkontext, daher dort PR-Abgleich übersprungen; Shallow-Historie verhindert etliche merge-base-Vergleiche. Diese Ausgabe ist kein vollständiger grüner Overlapbeleg. Offene PRs zusätzlich authentifiziert über GitHub-Connector gelesen: PR214 betrifft Medienanalyse, PR253/262 Adaptive, PR265/271 visuelle Runtime; keine zweite Implementierung begonnen. Gemeinsame TODO/Registry-Ergänzungen bewusst nur additiv. PR112 ist ein offener Forschungsregelentwurf; er wird hier weder ersetzt noch als gemergte Regel behauptet. Keine empirische Wirksamkeitsbehauptung dieses Leitfadens.

Assurance: PRIV08/19 für Fremdmaterial und zugängliche Bedienung als künftige Prüfanlässe aufgenommen; SEC06/07 für Lösungsschutz/Bewertung erhalten. Reiner Dokumentationsdiff ohne Daten-, Auth-, Rules-, Provider- oder Deploymentänderung; Runtimekontrollen damit nicht neu als erfüllt markiert. Modell/Effort des aktiven Turns sowie Usage/Kosten nicht zuverlässig beobachtet; kein Modellwechsel.

## Wiederaufnahme und nächster Schritt

Eigener isolierter Checkout work/json-editor-clean im ChatGPT-Projekt. Andere aktive Checkouts unberührt. Keine laufenden bezahlten Requests oder Deploys gestartet. Prüfungen/gesicherter Remote-Commit und PR werden nach Sicherung hier bzw. im PR nachgetragen. Dokumentationsintegration und Veröffentlichung von Testseiten sind verschiedene Schritte. Nächster Schritt: Link-/Bestanderhaltungsprüfung und Dokumentations-PR; nach Integration beim nächsten passenden Testseitenauftrag den Fundus konkret anwenden.
