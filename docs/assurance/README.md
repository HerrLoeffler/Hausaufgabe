# GradeCrew Assurance: zwei Fachrollen und 40 Kontrollen

Task **GC-LAUNCH-CONTROLS-01**. Dieser Einstieg gilt für Website/Functions, Crew/Coco, Tests/Assessment, native/iPad, alle Games und konkret zugeordnete ET-Komponenten. Dauerhafte Rollenbriefs sind kein installierter Agent, Scanner, Skill, Hook oder Kostenmonitor. Das Dokusetup bestätigt weder vollständige Sicherheit noch rechtliche Konformität.

## Führende Kataloge und Rollen

| Ausführende Fachrolle | Katalog | Originaltask und Übergabe |
|---|---|---|
| [Technische Sicherheit](roles/technical-security.md) | [20 Kontrollen SEC01–SEC20](technical-security.md) | GC-LAUNCH-CONTROLS-01-SECURITY · [Quellübergabe](../../workstreams/launch-controls-security-20261010.md), PR189 |
| [Datenschutz, Recht und faire Bedienung](roles/privacy-legal-fairness.md) | [20 Kontrollen PRIV01–PRIV20](privacy-legal-fairness.md) | GC-LAUNCH-CONTROLS-01-PRIVACY · [Quellübergabe](../../workstreams/gc-launch-privacy-20261010.md), PR188 |

Die Kataloge führen Nutzen, Anwendung, Owner, Stand, Grenzen und konkrete Prüfung. Kontrollstände bleiben dort; hier keine zweite Statusdatenbank anlegen. Nutzen/Priorität beschreibt Bedeutung und Reihenfolge, keinen Erfüllungsgrad. [Integrationsübergabe](../../workstreams/launch-controls-integration-20261010.md) führt Herkunft, Review und Dokumentationsintegration. GRADECREW_STATE bleibt Release-/Deploy-Sicht, die Registry bleibt Zuordnung.

## Verbindlicher Ablauf bei Änderungen

1. Diff, Datenfluss, Oberfläche und Releaseumfang bestimmen; vorhandene Task, Owner und Übergabe prüfen. Haupt-, Games- und Spielzentralen koordinieren und recherchieren ausschließlich. Sie wählen den relevanten Umfang und beauftragen ausführende Fach-Chats.
2. Aus **beiden** Katalogen die betroffenen SEC-/PRIV-IDs auswählen. Auswahl und begründete Ausnahmen in der bestehenden Aufgabenübergabe dokumentieren. Keine 40 leeren Kontrollen pro PR, Nachricht oder Standfrage; keine neue Task-ID je Checkbox.
3. Nachweise an den exakten Kandidaten, die Umgebung und den Release binden. Implementierungsowner und unabhängigen Prüfer benennen. Eine Agentenrolle ist keine tatsächliche Betreiber-, Schul- oder Vertragspartei.
4. Berechtigte Findings und fehlende relevante Gatebelege priorisieren, begrenzt validieren und dem zuständigen Owner übergeben. Kleine konkret beauftragte technische Fixes darf die technische Fachrolle später isoliert bearbeiten; dieses Setup beauftragt keine Produktfixes.
5. Vor Integration/Release betroffene Änderungen und Nachweise erneut gegen den aktuellen Ziel-SHA prüfen. Kontrollstatus, Code, CI, Integration, Staging, Gerätetest und Production getrennt halten. Bereits belegte Audio-/Coco-/Assessment-Reparaturen und Budgets nicht erneut starten.

Ein unveränderter Fragen-Turn braucht eine Quellen-/Statusantwort mit Grenzen, keinen Codeauftrag oder neue Prüfer. Neue relevante Änderungen berücksichtigen beide Rollen; nur der tatsächlich betroffene Umfang erhält Prüfaufträge. Eine ausdrücklich beauftragte Gesamtprüfung darf alle 20 Punkte je Fachrolle umfassen; daraus folgt kein automatischer Wiederholungsauftrag pro PR. Modellwahl folgt AGENTS/CHAT_CONTRACT pro Arbeitsschritt, nicht pauschal Sol/high. Hooks schalten keine Modelle um und starten keine Agenten.

## Status und Mindestnachweis

| Status | Bedeutung |
|---|---|
| erfüllt | Kontrolle im benannten Scope/SHA/Release/Umgebung mit aktuellem reproduzierbarem Beleg bestanden |
| offen | konkrete bekannte Lücke, Finding oder noch fehlender relevanter Gatebeleg |
| nicht relevant | nachweislich außerhalb des aktuellen Umfangs; Grund und Reaktivierungsauslöser festhalten |
| nicht geprüft | tragfähiger Erfüllungs-/Ausnahmebeleg fehlt; allein kein Beweis eines Verstoßes |

Teilbelege machen nicht den Gesamtumfang grün. In der vorhandenen Übergabe festhalten: SEC-/PRIV-ID, Auswahlgrund, Task/Owner/ausführender Chat, Komponente, Branch/SHA/Release/Umgebung, Status, Beleg mit Datum/Ergebnis, Grenzen und genau nächste Aktion. Bei Rechtsfragen zusätzlich tatsächliche Rollen, Nutzungsfall und aktuelle Primärquelle nennen. AVV-/Schul-/Providerfacts unbekannt lassen, solange sie fehlen. Keine Secrets, Schüler-/Kontoinhalte oder Chatkopien in Berichten.

## Risiken und Freigabe

Ein berechtigt belegtes kritisches Risiko oder zwingender fehlender Nachweis blockiert den **betroffenen** Release-/Daten-/Funktionsscope. Unbeteiligte offene Punkte blockieren nicht pauschal unabhängige Dokumentations-/Produktarbeit. Die Zentrale ordnet ein und beauftragt Klärung; sie erteilt dadurch keine technische oder rechtliche Ausnahme.

Agenten akzeptieren keine Rechtsrisiken oder Schul-/Vertragszwecke. Ungeklärte relevante Tatsachen gehören zu tatsächlichem Betreiber/Schule bzw. qualifizierter menschlicher Prüfung; kein KI-Rechtszertifikat. Zulässige technische Ausnahme nur durch den nach geltender Policy verantwortlichen Owner, mit Scope, Grund, Kompensation, Frist und erneuter Prüfung. Strengere Security-/Guardian-/Reviewgates und menschliche Productionfreigabe niemals umgehen. Ein erheblicher Befund wird nicht durch Mehrheitswahl überstimmt.

Bestehende Grundlagen erhalten: [ASV-/Schularchitektur](../privacy/CLASSROOM_ASV_IMPORT_PRIVACY.md), [Audio-/Assessment-Securityhistorie](../../workstreams/security-audio-release-20261009.md), aktuelle fachliche Übergaben und Release-Train. Die ASV-Architektur ist ein Zielbild/Review, keine bestätigte Schul-/AVVfreigabe. Historische Befunde zuerst gegen aktuellen Code prüfen. Einwilligung, Verbraucher-, Mail- und Accessibilityanforderungen im konkreten Nutzungsfall einordnen, nicht aus einer universellen Liste ableiten.

## Neue Games und Auswahlhilfe

Neue Spiele verwenden dieselben Rollenbriefs. Games-Zentrale koordiniert gemeinsame Lern-/API-/Assetverträge; Spielzentrale spezifiziert Scope/Abnahme; Fach-Chats implementieren und prüfen. Bestehende Engine, Spec, Speicher-/Attempt-/APIverträge und aktive Artarbeit erhalten. Build oder Render ist keine Lern-/Geräte-/Produktabnahme.

| Anlass | Auswahlhilfe, am tatsächlichen Diff begründen |
|---|---|
| Auth, Rules, Attempts, Noten/Punkte, neue Game-/iPadadapter | SEC04/06/07/08/11/14/17; PRIV07/17/20 je Datenfluss |
| Coco, Datenzwecke, Fristen, gemeinsame Knowledge, Konto-/Löschwege | SEC06/07/14/17; PRIV01/07/08/09/17/20 |
| Uploads, Assets, UI, Canvas/3D oder zusätzliche SDKs | SEC01/03/15/16/18/20; PRIV04/08/12–15/19 |
| Bezahlung, Werbung, Mail, Marketingcopy oder Tracking | PRIV02–06/10–12/16/18; technische Kontrollen nach wirklichem Daten-/Credentialpfad |

Keine Auswahlhilfe bestätigt eine Kontrolle. Nicht registriertes ET oder unentschiedenen Multiplayer-/Streamingumfang zuerst konkretisieren. Games-/Preview- und Web-Staging bleiben getrennt innerhalb bestehender Freigaben.

## Wiederverwendbarer Startauftrag

> Task [bestehende ID], Owner/Chat/Rolle [zugeordnet], Scope [Komponente/Release/Umgebung], Quelle [aktueller Branch/SHA], betroffene SEC-/PRIV-IDs [begründete Auswahl], erlaubte Pfade/Tools [konkret], Schnittstellen [read-only/fachlicher Owner], Abnahme [Belege], vorhandene Versuche/Budget/laufende IDs [erhalten]. Lies START_HERE, AGENTS, CHAT_CONTRACT, diesen Index, passenden Rollenbrief und vorhandene Übergabe. Wähle verfügbares Modell/Effort an unterstützter Teilaufgaben-/Turn-Grenze gemäß Projektregel; dokumentiere angefordert/beobachtet und Ergebnis. Keine Kosten-, Daten-, Angriffs- oder Deployaktionen ohne konkreten Auftrag. Ergebnis zum Abholen in bestehender Übergabe sichern; genau nächstes Ziel [begrenzt].

Rollen-Skills aus GC-HOOKS-01 bleiben getrennte Entwürfe; dieses Setup installiert weder Skill noch Trust. Die vorhandenen Rollenbriefs sind auch ohne Installation nutzbare Repo-Einstiege.

## Setupgrenze und nächste Aktion

Integriert wird ausschließlich die dokumentierte Rollen-/Katalog-/Projekteinbindung. Keine Kontrolle wird dadurch pauschal erfüllt. Vollscan, Rechtsfreigabe, Kontodatenprüfung, Runtimeagenten und Deploys sind eigene konkrete Aufträge.

Martin hat am 10.10.2026 die nächste Ausführungsphase ausdrücklich beauftragt: die bestehenden Fachagenten security_role_setup und privacy_fairness_role_setup prüfen alle SEC01–SEC20 bzw. PRIV01–PRIV20 mit konkretem Scope, Owner, Beleg und tatsächlich verifizierten Fixes. Ursprüngliche Taskfamilien bleiben erhalten. Nach bestätigter Setupintegration erhalten sie den exakten Main-SHA/PR und die schreibende Zuständigkeit für ihren jeweiligen Katalog; während der Integration bleiben die sechs Setupdateien beim Integrationsowner. Beauftragt: Security Sol/high, Privacy Sol/medium; tatsächlich beobachtete Runtime/Usage separat belegen.

Beide Rollen sichern ihre Audit-/Fix-Unteraufträge und neuen Belege getrennt; keine zweite Prüfung durch den Integrationsowner und keine pauschalen grünen Listen. Produktfixes als eigenständige geprüfte PRs über den vorhandenen Release-Train, keine konkurrierenden Stagingdeploys und keine Productionfreigabe. Fehlende Betreiber-/Schul-/AVVfacts bleiben offene qualifizierte Klärungen. Die Coco-Metadatenmatrix PRIV07/20 ist ein begrenzter Teil dieses Privacy-Audits, kein zusätzlicher paralleler Auftrag. Dieser Index startet die Agenten nicht; sie wurden bereits durch die Zentrale beauftragt.
