# GC-BRAIN-01 – fachliche Kontextübernahmen, 06.10.2026

Verdichtete Zusammenfassungen, keine technisch verschmolzenen Verläufe. Originale/Anhänge bleiben erhalten. Statusbehauptungen aus Chats sind historische Hinweise, vor Produktarbeit frisch zu prüfen. Versand und Empfang werden getrennt dokumentiert.

## Internationalisierung

Kontextübernahme im Auftrag von Martin zur GradeCrew-Chat-Bereinigung, keine neue Implementierung. Dieser Chat „GC · Internationalisierung“ (vormals „GC-I18N-03 fortsetzen“) ist der fachliche Hauptchat für Internationalisierung. Die vorhandenen Task-IDs GC-I18N-02/03, PRs, Versuche und Budgets bleiben unverändert.

Aus „Internationalisierung GC“ (6ac2748c-7cc4-83ed-ace7-4d42752ee7ad), fünf abrufbare Gesprächsrunden:
- Oberflächensprache, Inhaltssprache und Bewertungssprache getrennt halten; Umschalten darf Fragen, Lösungen und Schülerantworten nicht verändern.
- Cache/Header aus PR #137 und contentLocale aus PR #139 wurden bereits an diesen Arbeitschat übergeben. Deine vorhandenen Ergebnisse zuerst verwenden, keine Wiederholung. Historischer Abschlussbericht: 310 Tests, keine Integration/Veröffentlichung; tatsächlichen heutigen Stand bei nächster Produktarbeit frisch prüfen.
- Zusätzlich erhalten: Martin möchte die Lehrkraft-Vorschau deutlich als „Vorschau als Schüler – Antworten und Ergebnisse werden nicht gespeichert“ kennzeichnen, mit „Vorschau auswerten“ statt echter Abgabe. Echte Schülerabgaben müssen weiterhin gespeichert werden. Das ist ein fachübergreifender offener Wunsch, kein Anlass, Firestore-Regeln zu lockern. Vor Aufnahme vorhandene TODOs gegenprüfen.
- GradeCrew-Sprachwahl soll ausschließlich GradeCrew betreffen; keine Browser-/ChatGPT-Spracheinstellungen ändern.

Dies ist eine verdichtete Übergabe mit Quellenhinweis, kein technisch zusammengeführter vollständiger Verlauf. Original bleibt erhalten, Anhänge sind nicht mitkopiert. Bitte nur kurz bestätigen, dass der Kontext in diesem Chat angekommen ist, und eventuell einen Widerspruch zu deiner bestehenden Übergabe nennen. Keine Recherche-, Code-, Test-, API-, Review-, Merge- oder Deployrunde starten, keine Nachrichten an andere Chats senden.

## Schüler, Klassen und ASV

Kontextübernahme im Auftrag von Martin zur GradeCrew-Chat-Bereinigung, keine neue Implementierung. Dieser Chat „GC · Schüler, Klassen & ASV“ (vormals „Präzisiere ASV-Importarchitektur“) ist der fachliche Hauptchat. GC-CLASSROOM-01 und bestehende Übergaben/PR #141 unverändert fortführen.

Aus „Schülerintegration Codekonzept“ (6abae2b9-f014-83eb-83af-ad9057cf7ba5), fünf abrufbare Gesprächsrunden:
- Schülerkonten sollen über Schuljahres-/Klassenwechsel erhalten bleiben. Identität, Klassenmitgliedschaft, Alias und Zugangscode sind getrennte Dinge.
- ASV/CSV-Import und unverwechselbare stabile Kennung prüfen; nicht aus Name/Akronym die Identität ableiten. Tatsächliches Exportfeld bleibt zu bestätigen.
- Das frühe Konzept „Namenszuordnung nur auf einem einzelnen Lehrkraftgerät“ wurde im späteren Gespräch präzisiert. Dein neuerer Entwurf mit schulisch kontrollierter Zuordnung, Berechtigungen, Backup/Recovery und dem beschriebenen Wiedererkennungsverfahren ist der maßgebliche Entwurfsstand; die alte Vereinfachung nicht wieder einführen.
- Vorhandenes Secure Assessment nutzen; kein zweiter Prüfungsserver.
- Dein jüngerer Entwurf zu mehreren Lehrkräften je Klasse/Fach, Lehrerimport und administrierter Übergabe samt Stellvertretung bleibt erhalten.
- Frühere rechtliche Aussagen sind Quellenhinweise, keine neue Rechtsfreigabe. PR #141 laut deinem Abschlussbericht Entwurf/branch_only, kein Produktcode.

Dies ist eine verdichtete Übergabe mit Quellenhinweis, kein technisch zusammengeführter vollständiger Verlauf. Original bleibt erhalten; zwei historische Bilder wurden nicht mitkopiert. Bitte nur kurz bestätigen, dass der Kontext in diesem Chat angekommen ist, und gegebenenfalls einen Widerspruch zur bestehenden Übergabe nennen. Keine Recherche-, Code-, Test-, API-, Review-, Merge- oder Deployrunde starten, keine Nachrichten an andere Chats senden.

## Weitere inhaltliche Zuordnung

- Games GC enthält neben Games mehrere PostHog-Gespräche. GC-TELEMETRY-POSTHOG-01, GC-TELEMETRY-01/02/03 und GC-ANALYTICS-01 gehören fachlich zu Statistik/Nutzung; Games bleibt beteiligte Funktion. Die Main-Übergabe workstreams/posthog-staging-telemetry-v1.md bestätigt historisch Staging-Deployment und weiterhin offene Prüfung eines echten erlaubten Events. Keine erneute Secret-Einrichtung oder Neuimplementierung aus den früheren Nachrichten ableiten.
- L APP GC enthält iOS-Versionen 0.1.6/0.1.7/0.1.8 und die neue Native-Diskussion. Main-Übergabe workstreams/ios-app-v2.md nennt hybride App und offenen Gerätetest. Der jüngere Wunsch, stärker nativ zu werden, bleibt eine Architekturfrage, kein Beleg, dass der Umbau schon beschlossen oder umgesetzt wurde. Ziel ist GC · iPhone & iPad; Original vor weiterem Zusammenfassen erhalten.
- Design GC enthält GC-DESIGN-05: Hero-Szene und optionale Erstbesuch-Animation, konsistente Crew-Figuren. Offene Designarbeit nicht wegen vorhandenem v4-Preview als erledigt archivieren. Der Chat lässt sich weiterhin wegen Ladezeitüberschreitung nicht umsortieren.
- MONEY GC ist inhaltlich gemischt; vor Übernahme in Kosten/Produktplanung alle relevanten Entscheidungen prüfen. Keine Archivierung allein anhand des Titels.

## Empfangsnachweise

Beide Zusammenfassungen wurden am 06.10.2026 ausdrücklich als reine Kontextübernahme versandt und bestätigt:

- GC · Internationalisierung, Zielchat 01a10ac2-1486-7480-b644-f2fc953609de, Empfangsrunde 01a10e54-6a0a-75d0-99b5-165f72211f48: Kontext angekommen, bestehende IDs/PRs/Versuche/Budgets erhalten, Vorschau-Wunsch als offen übernommen; kein Widerspruch. Heutiger Integrationsstand nicht neu geprüft.
- GC · Schüler, Klassen & ASV, Zielchat 01a10c7f-95f0-7360-a2e3-be5b970fbcb9, Empfangsrunde 01a10e54-7782-7062-a77f-95606a208763: Kontext angekommen, GC-CLASSROOM-01/PR #141 erhalten, kein Widerspruch. ASV-Exportkennung bleibt offen; keine neue Arbeitsrunde gestartet.

Erst danach wurden „Internationalisierung GC“ und „Schülerintegration Codekonzept“ archiviert. Beide Archivierungsaufrufe bestätigten archived=true. Originale und historische Anhänge sind nicht gelöscht; keine technische Verschmelzung der Gesprächsverläufe. Die drei Hauptchats für Internationalisierung, Schüler/Klassen/ASV und iPhone/iPad wurden passend umbenannt. Weitere offene/gemischte Chats bleiben erhalten.
