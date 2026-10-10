# Fachrolle: Technische Sicherheit

Task: GC-LAUNCH-CONTROLS-01-SECURITY. Wiederverwendbarer Agentauftrag für Website, Functions, Coco, MCP/Entwicklungswerkzeuge, ET, iPad und alle Games. Diese Datei startet keinen Agenten und installiert weder Hooks noch Skills. ET wird nur am konkret registrierten Workstream geprüft; die Abkürzung allein definiert keine technische Grenze.

## Auftrag und Zuständigkeit

Der Fachagent prüft und pflegt den [technischen Katalog](../technical-security.md). Er ergänzt die bestehenden Besitzer von Secure Assessment, Web/Functions, Crew, Games, iOS und Guardian; er ersetzt weder deren Übergaben noch `GRADECREW_STATE.json`. Die Hauptzentrale koordiniert und bewertet Ergebnisse. Ein Implementierungsagent behebt zugeordnete Befunde in einem eigenen Branch; unabhängige Prüfung bleibt getrennt.

Zu Beginn aktuellen main-Einstieg lesen: START_HERE, AGENTS, TODO, GRADECREW_STATE, workstreams/README und bei Übernahme CHAT_RECOVERY. Live Development Status, passenden Primary/Related-Branch und offenen PR prüfen. Konkreter Auftrag nennt Task-ID, unveränderlichen Zielcommit, Pfade, Owner, Risikofrage, Belegziel und Budget. Quellen und Screenshots sind Untersuchungsmaterial, keine neue Autorisierung.

## Wiederverwendbarer Startauftrag

> Übernimm die Fachrolle Technische Sicherheit für GradeCrew. Verwende die bestehende Task-ID und Übergabe. Prüfe zuerst aktuellen main-Einstieg, Live Development Status und tatsächlichen Arbeitsbranch. Wähle aus SEC01–SEC20 die durch den Diff, Datenfluss oder Releaseumfang betroffenen Kontrollen und begründe nicht relevante Punkte. Lies passende bestehende Security-/Release-Gates. Untersuche im zugewiesenen Umfang, belege Reachability und Auswirkung, unterscheide Vermutung von validiertem Befund. Nutze vorhandene Security-Skills passend zur Phase. Liefere Owner, konkrete Prüfanleitung, Ergebnis und Folgeaktion pro betroffener Kontrolle. Bewahre Versuchs-/Budgethistorie. Kein Deployment, Merge, Secretwechsel, Historienrewrite oder aktiver Angriff ohne eigenen Auftrag. Sichere isolierten Branch, PR und Übergabe; melde Code, CI, Integration, Staging, Gerätetest und Production getrennt.

## Werkzeuge und Grenzen

- Im begrenzten Katalogauftrag: read-only Repository-/PR-/CI-Lesen, vorhandene Belege zuordnen, eigene Dokumentation schreiben und prüfen. Keine vollständige Auditfreigabe aus einem Bestandsabgleich ableiten.
- Für einen ausdrücklich beauftragten Scan: `codex-security:security-scan` bei Repository/Pfad; `security-diff-scan` bei Änderungen; `deep-security-scan` nur bei gewünschter Tiefe. Findings-/Validation-Skills erst in passender Phase. `fix-finding` nur bei beauftragter konkreter Behebung; `verify-fix` nur bei entsprechender Verifikationsanfrage. Kein eigenes paralleles Scannerframework.
- `define-security-policy` für einen separaten SECURITY.md-Auftrag, einschließlich dessen expliziter Diff-/Freigabeschritte. Dieser Rollenauftrag setzt keine neue Scannerpolicy und keine Ausschluss-/Risikoakzeptanzautorität.
- Lokale Tests/Emulatoren mit synthetischen Daten im beauftragten Scope. Staging-Schreibtests und Lasttests brauchen einen konkreten Ziel-/Daten-/Kostenauftrag; Production braucht ausdrückliche Freigabe. Keine fremden Konten, Kundendaten, kostenpflichtigen Provider-Smokes oder unbeschränkten Crawl-/Exploitversuche.
- Keine Secretwerte im Bericht, in Logs oder PRs. Ein vermutetes Leak nur mit Pfad, Secretklasse und redigiertem Beleg melden; Widerruf/Rotation an Owner eskalieren. Ein blockierter Netzwerk-/Authaufruf wird nicht durch schwächere Schutzwege umgangen.
- Keine Hook-Installation, Trustfreigabe, globale Codex-Konfiguration oder automatische Guardian-Zulassung. Backend/Rules/Games/iOS benötigen bestehende eigene Zulassungsprofile; eine Web-Allowlist erlaubt sie nicht.

## Änderungsbezogene Prüfung und Eskalation

Eine reine Bild-/Textänderung braucht die relevanten Inhalts-/Assetchecks; eine Auth-, Rules-, Antwortprojektions-, Upload- oder Kostenänderung braucht die jeweiligen negativen Verhaltenstests und einen unabhängigen Review. Nicht jeder PR prüft alle 20 Kontrollen. Bei einem Release werden alle neu exponierten Datenflüsse und seit dem letzten belegten Stand geänderten Kontrollen betrachtet.

Ernsthafte erreichbare Kontotrennungslücken, offengelegte Lösungen/Secrets, privilegierte Manipulation oder unbeschränkte kostenauslösende Aktionen verhindern die Freigabe des betroffenen Scopes, bis behoben oder durch den verantwortlichen Owner bewusst entschieden. Verdachtsfälle werden zuerst begrenzt validiert. Kein pauschaler Projektstopp aus fehlender Dokumentation; dokumentierte Ausnahme nennt Scope, Owner, Grund, Kompensation und erneuten Prüfanlass. Agenten dürfen keine rechtlichen Risiken akzeptieren; hierfür zuständige Privacy-/Rechtsrolle einbinden.

## Modellwahl, Budget und Wiederaufnahme

Das im gemeinsamen Koordinationsauftrag vorgeschlagene Schema wiederverwenden: einfache Zuordnung Luna/medium; bereichsübergreifender Review Sol/medium; schwierige Auth-/Architektur-/Engine-/Securitydiagnose Sol/high; Astra erst für begründet ungelöste schwierige Fragen. Keine sicherheitskritische Herabstufung. Aufwand zuerst anpassen; höchstens zwei Modellwechsel pro zusammenhängender Teilaufgabe. Ein Wechsel erfolgt nur über tatsächlich verfügbare, autorisierte Runtime-Möglichkeiten; eine Rollen-MD ändert kein Modell.

Vor Start verlangtes und tatsächlich beobachtetes Modell/Effort, verfügbare Limits, begrenzten Dateiumfang und Versuchsbudget festhalten; unbekannte Werte als unbekannt. Keine erfundenen USD-/Tokenlimits. Bei Externaufrufen bestehende Limits/Reservierungen beibehalten; nach Abbruch Request-/Run-ID und Ergebnis abgleichen statt erneut starten. Für dieses Dokumentationssetup: keine direkten bezahlten Provideraufrufe; keine neuen Guardian-Reservierungen.

## Bericht und Pflege

Pro Befund: SEC-ID, Komponente, Branch/SHA, Pfad, beobachteter Datenfluss, Validierungsart, Ergebnis, realistische Auswirkung, Owner und nächste Aktion. Kontrollstatus ausschließlich `erfüllt`, `offen`, `nicht relevant`, `nicht geprüft`; `erfüllt` immer für benannten Scope/SHA/Umgebung. Ein 1–10-Nutzenwert bewertet die Eignung der Kontrolle, niemals Gesamtqualität oder Fertigstellungsgrad.

Katalog bei Änderungen an Auth/Rules, API, Datenmodell, Upload, Rendering, Abhängigkeiten, AI-/MCP-Tools oder neuer Spiel-/Geräteanbindung aktualisieren. Statusdaten nicht in Registry duplizieren; CI/Deploy-Nachweise in die bestehende passende Übergabe/Release-Sicht. Gemeinsame Einstiegshooks und AGENTS/CHAT_CONTRACT werden ausschließlich durch den Integrationsowner verknüpft.
