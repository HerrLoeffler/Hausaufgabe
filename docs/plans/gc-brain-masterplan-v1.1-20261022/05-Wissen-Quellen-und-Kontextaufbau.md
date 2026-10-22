# Band 05 - Firmenwissen, Quelleninventar und Kontext

## 5.1 Wissensziel

Die Zentrale soll bestätigte Entscheidungen, gültige Konzepte und belegten Projektstand erinnern. Sie soll zugleich wissen, welche Quellen fehlen und welche Aussagen einander widersprechen. „Über alles Bescheid wissen“ bedeutet daher eine überprüfbare Übersicht mit bekannten Grenzen, kein Allwissenversprechen.

Firmenwissen wird in bestätigte Fakten, Entscheidungen, Konzepte, Arbeitsstände, Ideen und Hypothesen getrennt. Eine persönliche Präferenz Martins kann für die Produktgestaltung wichtig sein, wird aber nicht automatisch auf Mitarbeiter oder Kunden übertragen. Persönlicher und unternehmensbezogener Kontext haben unterschiedliche Sichtbarkeit und Gültigkeit.

## 5.2 Quelleninventur FZ-KNOW-01

Die Inventur beginnt bei aktuellem main-TODO, Registry, STATE und den passenden Workstreamübergaben. Ergänzend werden zugängliche relevante Fachchats, lokale Kandidaten, offene PRs, CI-/Deployartefakte und autorisierte Dokumente gelesen. Ein Chat ist eine Quelle für Entscheidungen und Hinweise, nicht der alleinige Beweis für Code oder Livebetrieb.

Die Inventur dokumentiert für jede Quelle: ID, Typ, Zuständigkeit, Zugriffspfad, Klassifikation, beobachtete Version, Erfassungszeit, abgedeckten Zeitraum/Ausschnitt, tatsächliche Lesetiefe, Fehler und bekannte Lücken. „Nicht abgerufen“ und „nicht vorhanden“ sind unterschiedliche Werte.

Die sichtbare App-Liste kann technisch auf die jüngsten Chats oder bestimmte Projekte begrenzt sein. Der Bestand darf daraus keine vollständige Kontoinventur behaupten. Große oder nicht abrufbare Turns werden als Lücke protokolliert; vorhandene Übergabedateien werden bevorzugt, ohne deren Behauptungen ungeprüft zu übernehmen.

## 5.3 Extraktion und Abgleich

Schritt 1: SourceObservation mit genauer Version sichern. Schritt 2: Kandidatenaussagen mit Originalstelle extrahieren. Schritt 3: bestehende Task-/Konzept-/Entscheidungs-ID suchen. Schritt 4: gegen kanonische Artefakte prüfen. Schritt 5: Widersprüche auflösen oder offen markieren. Schritt 6: bestätigte Daten in das bestehende Modell übernehmen.

Jede Kandidatenaussage erhält candidate, verified, disputed, rejected oder superseded. „Verified“ braucht eine passende Quelle für genau die behauptete Eigenschaft. Ein CI-Log kann einen Testlauf bestätigen; es kann nicht die fachliche Zufriedenheit Martins oder den Zustand eines physischen iPads belegen.

Eine neuere Chataussage überschreibt nicht automatisch einen älteren gültigen Releasebeleg. Es kann eine neue lokale Implementierung geben, die noch nicht integriert ist. Das Modell stellt beide Stufen dar und benennt den fehlenden Integrationsnachweis.

## 5.4 Erste Charge der vier Themen

Internationalisierung: Original-IDs GC-I18N-02 und GC-INTELLIGENCE-01 erhalten. UI-, Test-, Bewertungs- und Inhaltssprache getrennt führen. Geprüfte Vertrags-/CI-Stände von tatsächlich integrierten Produktteilen unterscheiden. Neue gewünschte Sprachen sind keine bereits unterstützten Märkte.

Klassen/ASV: GC-CLASSROOM-01 führt Identität, Klassen, Membership, Codes, Zuweisung und Import. Main-TODO und jüngste lokale Aussagen können abweichen. Lokale Tests zu Klassen/Codes belegen noch keine integrierte Testzuweisung oder datenschutzkonforme Produktfreigabe.

Adaptives Lernen: bestehenden Konzept-/Umsetzungschat und vorhandene lokale Prototypen auswerten. Die Behebung eines Feedbackfehlers ist kein Gesamtabschluss des Lernmodells. Fachliche Voraussetzungen, Datenbedarf und bestätigte Lernlogik gesondert erfassen.

Erweiterte Aufgabentypen: bestehende Aufgaben-/Issuezuordnung und Editoränderungen, einschließlich PR271 als damaligem Quellhinweis, frisch prüfen. Ein JSON-Editorfix ist nicht die Implementierung sämtlicher geplanter Aufgabentypen. Gemeinsame Komponenten und Abhängigkeiten verlinken, keine zweite Task anlegen.

Für jede Charge entsteht eine Abdeckungsmatrix: Welche Teilfragen sind bestätigt, welche nur geplant, welche umgesetzt, welche integriert, welche abgenommen? Die jetzige Designprobe zeigt einen Ausschnitt dieser Daten als Snapshot.

## 5.5 Weitere fachliche Bestände

Pädagogik: Lehrplan-/Kompetenzquellen, Fach-/Stufenabdeckung, Aufgaben-/Bewertungskriterien, lokale Beispiele und offene Qualitätsfälle.

Recht/Verträge: Rechtsträger, aktuelle Dokumentfassungen, Anbieter-/Schulverträge, Fristen, offene qualifizierte Prüfung und Unterzeichnungsstatus. Keine erfundene Vollständigkeit des Vertragsbestands.

Datenschutz/Sicherheit: bestehende SEC-/PRIV-Kontrollen, Produktdatenflüsse, Anbieter, Rollen, Speicherorte, Retention und konkrete Freigaben. Katalog und tatsächlicher Kontrollnachweis bleiben getrennt.

Finanzen: verifizierbare Dienst-/Kosteninventare, Reservierungen und bekannte Rechnungen. Kein Lesen privater Bank-/Steuerquellen ohne passenden Auftrag/Zugang. Unbekannte Kosten bleiben unbekannt.

Kunden/Vertrieb: autorisierte organisatorische Bedarfe, Onboarding-/Supportfälle und nachgewiesene Gespräche/Angebote. Keine Kontakte allein aus zufälligen privaten Chats übernehmen.

Technik/Betrieb: Workstream-, Branch-, CI-, Release-/Staging-/Gerätebelege, aktive Verbindungen und laufende unklare Prozesse. Die Aussage „bereit“ wird auf ihren genauen Scope zurückgeführt.

## 5.6 Konzeptpflege

Eine ConceptRevision enthält Problem, Zielnutzer, gewünschtes Verhalten, Abnahmekriterien, Alternativen, Gründe, Annahmen, Abhängigkeiten, Daten-/Rechtewirkung und Nichtumfang. Eine bestätigte Fassung bleibt unveränderlich. Änderungen erzeugen neue Revisionen mit Diff und Entscheidung.

Ein Konzept kann mehrere Produktprojekte betreffen. Änderungen lösen eine Impactliste aus: welche Ziele, Schnittstellen, Tasks und offenen Executions verwenden die alte Fassung? Die Liste führt zur Revalidierung, nicht zum automatischen Neuschreiben aller Aufgaben.

Verworfene Ideen bleiben mit Ablehnungsgrund und möglichen neuen Voraussetzungen auffindbar. Wiederholte Vorschläge ohne neue Evidenz werden zur bestehenden Entscheidung geführt. So muss Martin die gleiche Ablehnung nicht in jedem Chat erneut erklären.

## 5.7 Retrieval und Suchstrategie

V1 verwendet strukturierte Filter, Volltextsuche und direkte Beziehungen. Eine zusätzliche semantische Suche wird erst eingeführt, wenn reale Suchfälle den Bedarf zeigen und Daten-/Kosten-/Löschvertrag klar sind.

Retrievalfolge: tatsächlichen Actor/Scope ermitteln; Policy und ACL prüfen; Task/Ziel/Konzeptrevision laden; aktuelle bestätigte Entscheidungen auswählen; relevante Belege und offene Konflikte holen; Quellenalter und Abdeckung ergänzen; erst danach zusammenfassen.

Jede Trefferliste enthält nur autorisierte Objekte. Ein Modell darf nicht erst vollständige geschützte Daten lesen und anschließend entscheiden, was es dem Nutzer nicht verrät. Die Filterung findet vor der Modellweitergabe statt.

Bei mehr Kontext als zulässig wird nicht blind am Ende abgeschnitten. Das System priorisiert Auftrag, harte Regeln, gültige Entscheidungen, Kriterien und notwendige Quellen. Weggelassene Teile werden im Abdeckungsmanifest genannt. Falls die Auslassung eine sichere Ausführung verhindert, bleibt die Aufgabe blockiert.

## 5.8 Arbeitsbrief FZ-BRIEF-01

Ein Brief enthält mindestens:

1. Identität: Task, Request, Goal/Contribution, Auftraggeber, Owner, Rolle und Hostroute.
2. Gewünschtes Ergebnis und explizite Abnahmekriterien.
3. Zulässiger Scope: Dateien/Module oder fachliche Artefakte, Umgebungen, Datenklassen und Verbote.
4. Gültige Entscheidungen und Konzeptrevisionen mit Quellen.
5. Aktueller belegter Stand, offene Konflikte und laufende/unklare Vorgänge.
6. Konkreter nächster Schritt und notwendige Voraussetzungen.
7. Rechteprofil, Policyversion, Budgetreservierung und Versuchshistorie.
8. Erwartetes Ergebnisformat, Rückfragenkanal, Reviewrolle und Rückmeldevertrag.
9. Quellenmanifest mit Version, Hash, gelesener Abdeckung und Klassifikation.

Der Brief speichert die aufgelösten Inhalte in einem unveränderlichen Snapshot. Er enthält keine Tokens, Passwörter oder unnötigen Kundendaten. Ein Hash gehört zur Versionsbindung; die Herkunft des Datensatzes wird durch Store-/Actorberechtigung und Audit gesichert.

## 5.9 Antworten und Quellenpflicht

Eine fachliche Antwort unterscheidet bestätigte Erkenntnisse, nachvollziehbare Schlussfolgerungen, offene Unsicherheit und vorgeschlagene Aktion. Sie nennt die wenigen entscheidenden Quellen direkt am Befund. Eine lange Linkliste ohne Aussagebindung genügt nicht.

Ein Ergebnis beschreibt, was verändert oder untersucht wurde, welcher Stand geprüft ist, welche Tests tatsächlich liefen, welche Grenzen bleiben und welchen nächsten Schritt es empfiehlt. Ein completed-Modellturn ohne geeignetes Ergebnis wird nicht als fachlich angenommen markiert.

Die Zentrale erhält eine verdichtete Antwort und kann Detailartefakte öffnen. Die ausführende Fachrolle muss keine vollständige Gedankenkette veröffentlichen; gespeichert werden Entscheidungen, Gründe und prüfbare Nachweise, keine privaten internen Reasoningprotokolle.

## 5.10 Wissenskorrektur und Widerruf

Eine Korrektur erzeugt zunächst einen referenzierten Änderungsvorschlag. Der zuständige Owner bestätigt sie oder begründet die Ablehnung. Nach Bestätigung werden aktuelle Projektionen, Suche und künftige Arbeitsbriefe invalidiert beziehungsweise aktualisiert.

Ein Quellwiderruf markiert betroffene KnowledgeEntries und laufende Requests. Falls Rechte wegfallen, stoppt jede weitere Offenlegung unmittelbar im Zugriffsservice. Bereits gestartete Arbeit wird kontrolliert angehalten oder zur Revalidierung gestellt, soweit der Host das tatsächlich unterstützt. Eine bestätigte Ausführungsbeendigung wird nicht erfunden.

Löschung trennt notwendigen technischen Nachweis von Inhalt. Ein Bericht darf später sagen, dass eine Quelle gelöscht wurde; er darf nicht deren gesamten vertraulichen Text im angeblich unveränderlichen Auditlog konservieren.

## 5.11 Quellenfrische

Vorschlag: Start-/Dispatchdaten, Rechte und aktuelle Zielbasis unmittelbar vor externer Wirkung prüfen. Aktuelle PR-/CI-/Deploystände vor Integration oder Statusaussage neu lesen. Weniger volatile Konzeptquellen erhalten eine fachliche Wiedervorlage. Genaue Intervalle sind je SourceProfile zu konfigurieren.

Fresh, stale, unavailable und unknown sind explizite Zustände. Ein fehlgeschlagener Refresh löscht den letzten gültigen Snapshot nicht. Er markiert ihn als veraltet und nennt den Fehler. Die Zentrale darf auf dieser Grundlage orientieren, aber keine davon abhängige riskante Aktion freigeben.

## 5.12 Abnahme des Wissenskerns

Pflichtfälle: neue Aufgabe kennt gültige Entscheidung ohne Neueinweisung; ersetzte Fassung wird nicht geladen; derselbe Fakt aus mehreren Quellen wird nicht doppelt gezählt; widersprüchliche Quellen erzeugen ein offenes Klärungsthema; fremde Finanznotiz fehlt im Gamesbrief; gelöschte Quelle verschwindet aus Suche; unzugänglicher Chat wird als Abdeckungslücke gezeigt.

Zusätzlich wird die Inventur selbst geprüft: stichprobenartig Aussagen bis zur Originalstelle zurückverfolgen und mindestens einen bewusst widersprüchlichen aktuellen Code-/alten Chatstand korrekt darstellen. Eine formal gefüllte Datenbank ohne diese Herkunftsprüfung gilt nicht als erfolgreiches Firmenwissen.

## 5.13 Erkenntnisse aus Aufgabenqualität

Eine Fehlermeldung wird als Beobachtung mit Quelle gespeichert. Erst fachlich geprüfte Ursachen und angenommene Korrekturen können eine gültige Konzeptrevision oder einen Katalogeintrag begründen. Regression, Scope und Gegenbeispiele bleiben verlinkt. Bestehender Aufgabenfundus und freigegebener Laufzeitpool bleiben unterschiedliche Stufen. Einzelne falsche Antworten erzeugen weder automatisch eine allgemeine Lernregel noch einen neuen Modelltrainingsauftrag. Details: Band 17.12.
