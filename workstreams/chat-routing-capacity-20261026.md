# GC-HOOKS-01 — Fachchat-Routing und Auslastung

- Aktualisiert: 26.10.2026, eigener Dokumentationscheckpoint.
- Ausführender Owner: GC · Automatisierung & Integration, Thread01a1089e-bbae-74c2-9a6a-6ce71fb3dba7; die GradeCrew Zentrale koordiniert ausschließlich.
- Quelle: direkte Humananweisung26.10. im Zentralchat01a10df6-736b-7a62-bd38-2724cf254c2e tatsächlich über read_thread gelesen: unabhängige Themen nicht im selben Chat stapeln; geeignete andere oder vollständig eingewiesene neue Fachchats nutzen, Übersicht über Aufträge/Blocker/Belegung.
- Branch: docs/chat-routing-capacity-20261026; Basis/main8c3becedab7bf38887b7b6a8e4d690e6d98b6f66; Integrationsziel main. Status branch_only, zur Dokumentationsprüfung.
- Eigener Sparse-Checkout: /Users/martin/Documents/Codex/2026-10-04/weiter-mit-gradecrew-nach-einem-chat/work/governance-routing-20261026.

## Abgleich und Änderung

START_HERE, AGENTS, CHAT_CONTRACT, TODO, STATE, WorkstreamsREADME und Recovery auf exakter Basis gelesen. DevelopmentStatus40397952292/Job121835905246 success samt relevanten Überschneidungslogs gelesen. Offene ältere PR14/184/153/142/112 betreffen teils dieselben Dateien, aber andere Hunkbereiche; keine dieser Änderungen übernommen oder überschrieben. Aktuelle gemeinsame Aufgabenprinzipien am AGENTS-Ende bleiben erhalten. Einziger Writer dieses Deltas ist dieser Fachchat.

AGENTS erhält die konkrete Nutzerregel; CHAT_CONTRACT verweist darauf und hält die Übergabefelder fest. Bestehende GC-HOOKS-01-TODO-Zeile wird um diesen Dokumentationsstand ergänzt. Keine neue Taskfamilie oder Registry-/STATE-Reparatur.

Die von der Zentrale gemeldeten neuen TeacherAuth-/RemyPlan-Fachchats bleiben bis belegter Übergabe lesend; dieser Dokumentationsauftrag bestätigt keine operative Schreibübernahme. Bestehender GC-BRAIN-01-Builder/PR295 verantwortet die operative Appübersicht. Hier keine Store-/UI-/Hook-/Runtimearbeit, kein zusätzlicher Fachdispatch oder Threadstart.

## Nachweise und offene Übergabe

- Lokal geprüft: vollständiger Diff und git diff --check sauber; nach Herausnahme ausschließlich der neuen Abschnitte stimmen AGENTS/CHAT_CONTRACT exakt mit der Basis überein. AGENTS-Linkziel vorhanden. Remote-main unmittelbar vor Sicherung erneut gefetcht, unverändert8c3bece. Automatische PR-Dokumentationschecks anschließend getrennt ablesen.
- Bestehende Versuche/Task-IDs/Budgets unverändert; keine Provider-/Login-/Deployaktion. Produkt-/Geräteabnahme nicht relevant für dieses Dokumentationsdelta.
- Noch offen: unabhängige Dokumentationsprüfung und bewusste Integration nach erneutem main-/Writerabgleich. Die Regeldateien allein erzwingen keine Runtime-Sperre.
- Nächster Schritt: den gesicherten PR-Diff samt exakten Dokumentationschecks prüfen, danach allein dieses Delta zur normalen Integration übergeben.
- Wiederaufnahme: Remote-Head/PR/Checks und lokale Dirty-Dateien frisch prüfen; nicht aus Zustellung eine Auftragsaufnahme ableiten. Laufende Produktjobs anderer Fachchats wurden hier nicht übernommen oder neu gestartet.
