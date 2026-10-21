# Aktueller Ablauf - direkte Bearbeitung

Seit der Nutzerkorrektur vom08.10.2026 ist **An KI senden** die Hauptaktion: lokale Frontend-Änderung über das installierte Codex CLI mit vorhandener ChatGPT-Anmeldung, sofort In Arbeit, anschließend Quelltextänderung und Live-Aktualisierung. Zurück/Wiederholen verwenden echte persistente Vorher-/Nachher-Snapshots. Weitere Aufträge desselben Projekts warten und starten danach automatisch. **Nur als Hinweis speichern** sammelt ausdrücklich ohne KI. Die Hinweisfläche bleibt eine optionale Übersicht; dort können ausgewählte Hinweise direkt bearbeitet werden.

Der CLI-Aufruf arbeitet read-only an einer begrenzten Frontend-Kopie und liefert einen JSON-Patch. Der Server prüft erlaubte Dateien, Eindeutigkeit und Quellstand; er bearbeitet weder Production noch Test-Datenbanken. Private Schlüssel werden nicht an die Oberfläche gegeben. Aus diesem Workflow erfolgen keine GitHub-Uploads oder Deploys. Der echte isolierte Durchlauf mit Änderung/Undo/Redo wurde zweimal ausgeführt (12s und18s); dies ist keine allgemeine Zeitgarantie.

Die Modellsteuerung gilt ausschließlich für den lokalen Codex-CLI-Unterprozess dieses Live-Auftrags: Routinen fordern ausdrücklich `gpt-6-luna` mit `medium` an. Aufgaben mit begründetem Komplexitätsbedarf dürfen `gpt-6.1-sol` mit `medium` anfordern; `high` erfordert eine konkrete autorisierte Risiko- oder Engine-Anforderung. Die CLI-Argumente und ein technischer Job-Beleg halten angefordertes Modell/Aufwand, vom Host gemeldete Annahme, beobachtetes Laufzeitmodell und Usage getrennt. Nicht gemeldete Werte bleiben `unknown`; fehlende Task-ID oder Usage werden nicht ergänzt. Kann die CLI die Auswahl nicht starten, gibt es keinen stillen Modell-Fallback. Dieser Pfad steuert keine nativen Codex-Oberflächenchats, bereits laufenden Chats oder andere Startwege. Der Beleg enthält keine Notiztexte oder Prompts und ist kein Nachweis für Modell-/Usage-Daten, die der CLI-Eventstrom nicht meldet.

Die ältere folgende Anleitung und der220-Seiten-Atlas beschreiben den Ausgangsstand. Bei Widerspruch gilt der hier korrigierte direkte Ablauf.

# GradeCrew Entwicklungswerkzeug

Stand: Werkzeug zuerst; Integration der tatsächlichen Spiele später. Task GC-WEB-REPAIR-20261007.

## Start
Doppelklick auf Werkzeug starten.command öffnet die Zentrale. Mac-Leiste starten.command startet zusätzlich die eigenständige Mac-Schaltfläche. Server nur 127.0.0.1:8772. Homepage-Code ist lokal, Firebase-Anmeldung/Tests/KI im ausdrücklich gestarteten Staging-Modus. Speichern eines Testinhalts ändert Staging sofort; der Website-Code wird dadurch nicht deployed. Private KI-Schlüssel bleiben im vorhandenen Backend.

## Bedienung
Normal: nur kleines schwebendes Pfeilsymbol unten links. Klick: Element, Bereich, Screenshot-Fenster, ganze Seite, Hinweisübersicht. Während der Auswahl verschwindet das Menü. Danach kurzer dunkler Prompt. Nur ein Serverbeleg bestätigt gespeicherte Hinweise. Bei Ausfall bleibt eine lokale Outbox; Serverabgleich kann wiederholt werden, gleiche Client-ID erzeugt keine Duplikate. Screenshot ist freiwillig, Browser/macOS erfragen die Aufnahmeberechtigung. Ohne Berechtigung kann der Text gespeichert werden.

## Live-Arbeit
CSS wird ohne Seitenreload ausgetauscht. JS-Änderung: mit sauberem Adapterstand automatisch reload plus Rücksprung; sonst sichtbar als Aktualisierung im Menü. GradeCrew erhält nur Ansicht/Test-ID, keine Antworten oder Tokens. Laufende Schülerabgaben, AI-Formulare und ungespeicherte Tests werden nicht automatisch zurückgesetzt. Neutrale Prüffläche zeigt Pause/Resume und Prüfpunktrücksprung. Native Spielcodeänderungen benötigen echte Engine-Kompilierung; diese Integration ist späterer Scope.

## Auftrag an Codex
Die Zentrale listet ausschließlich visuelle Hinweise. Technische Prüfnachweise haben einen separaten Bereich. Gewünschte Hinweise auswählen und Auftrag für Codex kopieren; im bestehenden Chat einfügen. Das Werkzeug führt keine automatische KI bei bloßem Speichern aus und nutzt keine versteckte Desktop-Session-API. Über den bestehenden Codex-Chat können wir den Code direkt ändern, ohne zusätzliche API-Schlüssel. Serverdaten: .review-local/visual-tasks.json und captures/*.png; Browser- und Native-Outbox getrennt. notes.mjs liest genau diese Hinweise; status ändert nur die festen Statuswerte.

## Vorlagen und Adapter
scaffold.mjs --id name --kind canvas --name "Name" erzeugt auf ausdrücklichen Auftrag ein leeres Grundgerüst und registriert es. Die Browser-Leiste ist über denselben Server ab der ersten HTML-Seite vorhanden, wird aber nicht in Release-Dateien geschrieben. Erst Werkzeug prüfen, danach echte Spielprojekte anbinden. window.GradeCrewDev.registerAdapter({version:1,captureContext,captureCheckpoint,restoreCheckpoint,isDirty,pause,resume}) ist das gemeinsame freiwillige Interface. Adapter müssen sichere Entwicklerzustände liefern; allgemeine Prozess-/Spielstand-Wiederherstellung wird nicht versprochen.

## Zugriff und Grenzen
Gemeinsamer Backlog auf diesem Mac; alle registrierten lokalen Oberflächen greifen darauf zu. Ein von anderen Geräten erreichbarer geschützter Online-Link ist noch nicht eingerichtet. Dafür ist ein verifizierter Gateway notwendig. Kein anonymer Tunnel und keine Production-Konfiguration. Der In-App-Browser war für Agentenzugriff zuletzt durch eine unverfügbare admin-enforced policy blockiert; Code-/DOM-Prüfungen ersetzen keinen Staging-Nutzertest. Bereits frühere fehlende neun Rahmenmeldungen wurden nicht aus diesen neuen Daten herbeigezaubert.
