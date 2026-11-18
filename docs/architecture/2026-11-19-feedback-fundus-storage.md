# Entscheidung: Feedback und bestätigter Wilma-Fundus bleiben zunächst in Firebase

GC-PEDAGOGY-KB-01 / GC-WEB-REPAIR-20261007 ·19.11.2026. Kleiner lesender Entscheidungsvermerk nach Wilma-Veröffentlichung; kein Infrastrukturauftrag. Geprüfte Runtimequelle `4fe3baf733c8a57bcbbd3359ea45341b8f4d7882`.

## Tatsächlicher Bestand

- **Smileys/Aufgabenfeedback:** Firestore-Collection `feedback`, Kennung `aiq4-…`, Feld `category=ai_question` (kein verschachtelter Pfad feedback/ai_question). `functions/lib/question-feedback.js` speichert die idempotente Rückmeldung mit begrenztem Aufgabensnapshot, Release-/Prompt-/Modellbezug und Lehrkraftkommentar. Schülerantworten sind kein erlaubtes Feedbackfeld. Eigentum und veröffentlichte Aufgaben sind geschützt.
- **Verwendung bei neuen Aufgaben:** `functions/lib/feedback-learning.js` lädt begrenzte jüngste Metadaten sowie eigene Snapshots. Persönliche Signale und signiert freigegebene gemeinsame Signale sind getrennt; zurückgewiesene Prüferwarnungen sind ausgeschlossen. Rohkommentare/negative Aufgabentexte gehen nicht an das Modell. Strukturstatistik/Präferenzhinweise fließen in den Prompt; tatsächliche Nutzung erhält Version/Operation/Zeitbeleg. `functions/index.js` bindet dies bei Erstellung, Varianten und Überarbeitung ein. Zusätzlich existiert die enge automatische Freigabe schon geprüfter struktureller Regeln (`automatic_structural`); das ist keine pauschale fachliche Freigabe fremder Meldungen.
- **Bestätigter Wilma-Fundus:** `users/{uid}/aiRuntime/wilma-fundus/operations/{key}`. `functions/lib/wilma/runtime.mjs` und `fundus.mjs` prüfen Lehrkraftbestätigung, Aufgaben-/Antwort-/Rasterbindung sowie unveränderte Quelle. Keine globale Sammlung ungeprüfter KI-Antworten. Geeignete bestätigte Fälle können eine weitere Provideranfrage vermeiden.
- **KI-Belege und Kosten:** Metadaten unter `users/{uid}/aiRuntime/wilma-reviews/operations/{fingerprint}`, privater Storagebeleg `aiGeneratedCache/{uidHash}/wilma-{fingerprint}.json`, Monatsledger `_wilmaPilotPrivate/month-YYYY-MM` und vorhandene Zähler. Quelle, Versuchshistorie, Reservierung und Cachezugriff sind gekoppelt. Die fünf aktuellen Stage-Ergebnisse wurden nach vollständigem Reload ohne zusätzliche Kosten wiederverwendet; siehe [Abnahme](../evidence/wilma-normal-entry-20261119/REPORT.md).

Keiner dieser Mechanismen trainiert automatisch Modellgewichte. Es handelt sich um gespeicherte Hinweise, bestätigte Wiederverwendung und Promptkontext. Der Umfang schon produktiv veröffentlichter Feedbackhandlers ergibt sich aus den früheren jeweiligen Releases; die aktuelle enge Wilma-Veröffentlichung deployt nicht nochmals alle Feedbackfunktionen.

## Abwägung und Empfehlung

Eignung für den **aktuellen** Auftrag, qualitativ1–10 nach denselben Kriterien: nachgewiesener Zusatznutzen, Integrations-/Betriebsaufwand, Rechte-/Datentrennung und Erhaltung bestehender Beleg-/Budgetketten. Keine gemessenen Prozentwerte oder Preisprognosen.

| Ansatz | Eignung | Gründe |
|---|---|---|
| Firebase als aktuelle Hauptablage behalten |9/10 | Vorhandene Auth-/Ownerprüfung und atomare Kosten-/Bestätigungskette; kostenlose Wiederverwendung nachgewiesen, kein Umbau. Komplexere relationale Auswertung bleibt eine Grenze. |
| Jetzt zusätzlich Supabase/Postgres einführen |4/10 | SQL/pgvector wären nützlich, aber aktuell kein belegter Engpass, keine projektspezifische Einrichtung und zusätzlicher Synchronisations-/Berechtigungsbetrieb. Risiko doppelter Wahrheiten und neuer Kosten. |

**Empfehlung: jetzt Firebase behalten.** Supabase später nur bei einer konkreten, messbar nicht ausreichend lösbaren Analyse-/Wissenssuche prüfen, beispielsweise relationale Auswertung von freigegebenen Qualitätsregeln oder semantische Suche in minimierten, fachlich geprüften Aufgabenrezepten. Firestore bleibt dabei Quelle für Abgaben/Noten und Kostenoperationen. Keine Roh-Schülerantworten oder Noten für eine solche optionale Wissensablage vorgesehen; Zweck, Löschung, Rechte und zulässiger Datenumfang wären vorher verbindlich festzulegen.

## Was Supabase technisch ermöglichen würde

Die [offizielle Dokumentation](https://supabase.com/docs) beschreibt Postgres und [pgvector-Vektorspalten](https://supabase.com/docs/guides/ai/vector-columns): Embeddings speichern und nach Ähnlichkeit abfragen. Embeddings müssen gesondert erzeugt, versioniert und bei Inhaltsänderungen erneuert werden. Ein Vektorindex oder die Plugin-Verbindung trainiert kein Modell und ersetzt keine Bewertungslogik.

[Firebase Auth als Drittanbieter](https://supabase.com/docs/guides/auth/third-party/firebase-auth) kann bestehende Firebase-JWTs weiterverwenden. Dafür sind registrierte Projektbindung, Claims/Clientintegration und geeignete Row-Level-Security mit Eigentümer-/Schultrennung nötig; keine automatische Übernahme unserer Firestore-Regeln. Beim Selfhosting ist die Prüfung gegen fremde Firebaseprojekte ausdrücklich selbst abzusichern. Das [Repository](https://github.com/supabase/supabase) ist ein Quellcodeangebot, kein Nachweis eines eingerichteten GradeCrew-Dienstes.

Der verbundene Connector liefert bei lesendem `list_projects` aktuell `projects:[]`. Das belegt nur: keine für diese Verbindung sichtbaren Projekte; weder Fehler noch Ausschluss anderer Konten. Es wurde kein Projekt, Branch, Schema oder Schlüssel angelegt und keine Daten kopiert. Keine Migration oder Veröffentlichung.

Ein Kostenvorteil ist **nicht belegt**. Vor einem neuen Auftrag zuerst Firestore-Lese-/Schreib-/Speicherkosten und tatsächliche Cachetreffer gegen Postgres-Compute, Speicher/Backups, Netzwerk, Synchronisation und Embedding-/Providerkosten messen. Erst danach Entscheidung über einen eng begrenzten Versuch mit Testdaten. Verträge, Region und zulässige Verarbeitung wären gesondert zu prüfen; der Anbieterwechsel allein belegt keine Schul-/DSGVO-Freigabe.
