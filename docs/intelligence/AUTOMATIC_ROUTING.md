# Automatische KI-Auswahl für GradeCrew

Task GC-AI-ROUTING-02 / GC-AI-OBS-02, 02.10.2026.

## Produktentscheidung

Automatische Modellwechsel sind ausdrücklich gewünscht. Lehrkräfte wählen kein Modell aus und bestätigen keine einzelnen Wechsel. GradeCrew wählt pro qualifiziertem Aufgabenprofil. Neue Kandidaten können nach bestandenen, vorab festgelegten Qualitäts- und Kostengates von einem vertrauenswürdigen Evaluationsworker automatisch in die signierte Konfiguration aufgenommen werden. Menschlich geprüfte Referenzdaten, Prüfmaßstäbe und Datenschutzzulässigkeit sind Voraussetzungen; eine KI kann sie nicht selbst freigeben.

Der vorherige Offline-Report bleibt absichtlich keine Runtime-Berechtigung. Die neue Veröffentlichungsschicht prüft ihn erneut, bindet ihn an Modell/Scope/Kostenbelege und signiert daraus eine neue Konfiguration. Nur dieser vertrauenswürdige Publisher hat den privaten Signaturschlüssel. Der Gateway hat ausschließlich den öffentlichen Prüfkey. Keine neuen Modellreferenzen oder erfundenen Qualitätswerte sind mit diesem Branch freigegeben.

## Zwei getrennte Regelkreise

### 1. Unterricht und Lehrerarbeit

Vor der KI bleiben der vorhandene Crew-Parser, feste Produktantworten, validierte Lernhilfen und exakte, kontextgebundene Caches. Navigation, Punkteberechnung, Fortschritt, Freigabe und Bewertung nach festen Regeln benötigen keinen zusätzlichen KI-Router-Aufruf.

Wenn KI erforderlich ist, liefert der authentifizierte Backend-Aufrufer ein serverseitig abgeleitetes Profil, eine stabile Operation-ID, einen Scope-Hash, den versionierten Systemprompt und begrenzte Textnachrichten. Nutzer können nicht Modell, Kostenbudget, Freigabestatus oder Ausführungsrechte überschreiben. Der Gateway:

1. prüft Signatur, Ablauf, Scope, Datenschutzprofil, vorhandenen Adapter und Validator;
2. wählt unter ausreichend qualifizierten Routen nach gemessenen Gesamtkosten pro akzeptiertem Ergebnis;
3. berücksichtigt Mindestvorteil und Wartefrist gegen unnötige Modellwechsel;
4. reserviert Tages-/Monatsbudget und Aufrufzahl transaktional, bevor ein Provider kontaktiert wird;
5. prüft die Antwort durch den für diesen Scope registrierten Validator;
6. erlaubt bei bekannter Abrechnung und ungültigem Ergebnis höchstens einen weiteren qualifizierten Versuch;
7. schreibt einen inhaltsfreien Entscheidungs-/Kostenbeleg.

Bei unbekannter Abrechnung nach Timeout/Providerfehler: keine automatische Wiederholung, volle Reservierung bleibt bestehen. Ein Erfolg geht bei Ausfall der Protokollierung nicht verloren. Doppelte Operation-IDs lösen keinen neuen bezahlten Auftrag aus. Fertige Antworten selbst werden nicht im Kostenledger gespeichert; ein bestehender Fachauftrag muss sie in seinem eigenen autorisierten Speicher halten und wiederauffindbar machen. Genau-einmal-Ausführung beim externen Provider kann dieser Mechanismus bei Netzwerkabbrüchen nicht garantieren; er verhindert unsere blinden Wiederholungen.

Qualifizierte Routen können auslaufen oder gesperrt werden. Gibt es keinen zulässigen Ersatz, wird gestoppt. Region/Datenempfänger, Rubrik oder Qualitätsmaßstab werden dabei nicht gelockert. Fachliche Fehlermeldungen werden zu neuen Referenzfällen, nicht automatisch zu ungeprüften globalen Regeln.

### 2. Forschung im Hintergrund

`evaluation-plan.js` erstellt eine deterministische, kostenbegrenzte Warteschlange. Auslöser: neue Modellversion, neuer Prompt/Validator, neue Sprache/Aufgabenart, auffällige Fehler oder fällige Wiederprüfung. Priorität haben problematische und häufig genutzte Aufgabentypen mit realistischer Einsparmöglichkeit. Kein Vergleich bei jeder Schülerfrage.

Evaluationsbudget, Aufrufzahl und Tages-/Monatsgrenzen sind vom Unterrichtsbudget getrennt. Dieselbe Periode/Kandidaten-ID ergibt dieselbe Job-ID. Der spätere ausführende Worker muss jeden tatsächlichen API-Aufruf zusätzlich durch dieselbe transaktionale Budgetgrenze schicken; der reine Plan ist keine Abrechnungssperre. Ein separater Timer/Queue-Worker für reale Modellvergleiche ist noch nicht deployed.

Praktisches Verfahren: günstiger synthetischer Vorfilter → Entwicklungsfälle → zurückgehaltene, fachlich geprüfte Referenzfälle → getrennte schwierige Teilgruppen → begrenzter Rollout → Produktionsmonitoring. Kritische Fehler stoppen die Zulassung. Bei Drift wird eine Route widerrufen; eine noch qualifizierte vorherige Route übernimmt. Vergleichsfamilien und statistische Grenzen vorab festlegen, damit häufiges Probieren nicht zufällig ein „gutes“ Modell produziert. Nicht pauschal alle Anbieter für jede Sprache/Frage testen.

## Aufgabenprofile und Sparmöglichkeiten

| Bereich | Ohne neuen KI-Aufruf | Wann KI sinnvoll ist | Wesentliche Qualitätsprüfung |
| --- | --- | --- | --- |
| Coco / Navigation | lokale Produktantworten, direkte Aktionen | unbekannter Produktwunsch | korrekte Funktion, keine erfundenen Aktionen |
| Remy / Formular | Parser, aktuelle Felder, Klassenkontext | freier komplexer Wunsch | Slot-/Negationsrichtigkeit, erlaubte Patches |
| Tests / Emmi | Schema, Punkte, Typen, vorhandene Bilder | neue Aufgaben oder gezielte Überarbeitung | fachlich richtige Lösung, Eindeutigkeit, Lehrplan, feste Vorgaben |
| Freitextbewertung | akzeptierte Varianten, Zahlen-/Einheitenregeln | begründete Bewertung nach Rubrik | Referenzbewertungen, Fehler nach Noten-/Punktewirkung; Lehrerprüfung bleibt |
| Spiele | kuratierte Hinweise, vorbereitete Erklär-/Transferpakete | unbekannte Verständnisfrage | verständliche Hilfe ohne Lösungsverrat; KI-Hilfe gibt keinen Spielfortschritt frei |
| Sprache | Gerätefunktion, bestehende Formlogik | STT/TTS nach Bedarf | Sprache, Zahlen, Fachwörter, Lärm, Abbruchverhalten |
| Bilder | exakt passendes geprüftes Bild | neues erforderliches Bild | Bild-Aufgaben-Bezug und didaktische Notwendigkeit |

Viele Inhalte einmal bei der Spiel-/Testvorbereitung erzeugen und prüfen, danach im Unterricht wiederverwenden. Gemeinsame Cache-Treffer nur für ausdrücklich freigegebene, unpersönliche Inhalte. Keine semantische Wiederverwendung bloß „ähnlicher“ Schülerantworten in Benotungen. Cache-Schlüssel müssen Sprache, Curriculum, Inhaltsrevision und Validator-/Prompt-/Modellversion berücksichtigen.

Die erste Runtime unterstützt **Text**. Die Jobnamen für Bild, Spracherkennung und Sprachausgabe sind kein Funktionsnachweis: fehlende Provider-Capabilities werden jetzt abgelehnt. Zusätzliche Modalitäten brauchen eigene Kostenadapter, Limits und Nachweise. Der Anthropic-Adapter ist der einzige echte Gateway-Provider im geprüften Ausgangsstand; vorhandene OpenAI-Firebase-Aufrufer laufen weiterhin separat.

## Konfiguration und Erweiterbarkeit

Signierte Policy: Währung, getrennte Budgets, Ablauf und Profile. Profil: Job, Scope-/Prompt-Hash, Validator, Datenprofil, Input-/Outputgrenzen, maximal 1–2 API-Aufrufe, Deadline, Referenzroute und optional aktive Route, `minimumSavingsRatio` und `switchAfter`. Standard-Wechselvorteil ist 5 %, vor der ersten realen Freigabe ausdrücklich kalibrieren. Das ist keine Qualitätsmarge. Qualitätsgrenzen stehen im separaten fachlichen Gate.

Route: aufgelöstes Modell, Provider, Evidenz-ID/-Hash, Ablauf, Gesamtkostenvorhersage, optional gesonderter API-Vergleichswert und versionierte Preistabelle. Kosten kommen nicht aus einem Modellversprechen. Jede Prompt-/Validator-/Scopeänderung braucht passende neue Evidenz.

`tools/evaluation/publish-routing-policy.mjs` verarbeitet nur vertrauenswürdige Worker-Eingaben. Pro Profil werden die Routen aus erneut geprüften Evaluationsdaten aufgebaut; mitgelieferte Routenlisten werden ersetzt. Der Worker kann ohne Einzelbestätigung signieren, wenn alle Vorgaben erfüllt sind. Die echte Schlüssel-/Artifact-/Queue-Infrastruktur ist noch einzurichten. Keine privaten Schlüssel in GitHub-Dateien, Browsern oder Logs ablegen.

```bash
node tools/evaluation/publish-routing-policy.mjs reviewed-input.json /secure/signing-key.pem routing-policy.json
```

Die neue Konfiguration wird vom Gateway beim Auftrag neu gelesen. Der private Schlüssel gehört in einen kontrollierten Signierprozess. Schlüsselwechsel, Widerruf und Rollback müssen vor Staging-Aktivierung praktisch geprüft werden. Die Signatur beweist die Herkunft; sie macht ungeprüfte/erfundene Referenzdaten nicht wahr.

## Was Martin in der Statistik sehen soll

Die implementierte Komponente `ai-routing-admin.mjs` bietet Suche und Sortierung nach Kosten, Aufrufen und Preislücken. Pro Profil/Route/Währung/Budgetbereich zeigt sie:

- verwendete Modelle und Auswahlgrund;
- akzeptierte Ergebnisse, gesamte API-Aufrufe einschließlich verworfener Versuche;
- anhand erfasster Nutzung berechnete API-Kosten und Prozentanteil vollständig bepreister Aufträge;
- geschätzte API-Ersparnis gegenüber einem separat belegten API-Referenzwert und Zahl vergleichbarer Ergebnisse;
- Qualitäts- und Preisbeleg-IDs.

USD/EUR sowie Evaluation/Unterricht werden getrennt. Negative Ersparnis bleibt negativ. Unbekannte Kosten bleiben unbekannt. Begrenzte Abfragen werden als Ausschnitt gekennzeichnet. API-Nutzungspreise sind keine geprüfte Anbieterrechnung; Steuern, Rabatte, Währungsumrechnung, Infrastruktur und menschliche Arbeitszeit sind getrennte Kostenbestandteile.

Ein wichtiger Fix in diesem Arbeitsblock: API-Kosten werden nicht gegen die höheren Gesamtkosten inklusive menschlicher Nacharbeit verglichen. Ohne separaten API-Vergleichswert wird keine Ersparnis ausgewiesen.

Der interne IAM-geschützte Gateway-Endpunkt `/v1/routing/statistics` liefert maximal 500 Belege der letzten 7 Tage. Der Browser bekommt keine Cloud-Run-Zugangsdaten. Zur sichtbaren Einbindung fehlt noch ein GradeCrew-Admin-Proxy mit Rollenprüfung und Anschluss des Widgets an den bestehenden Statistikbereich. Danach monatliche Rollups/Filter erweitern; keine unbegrenzten Rohdatenabfragen.

## Aktivierung und Grenzen

Der Code ist vorbereitet, aber keine reale automatische Modellauswahl ist dadurch bereits deployed. Vor Aktivierung erforderlich:

1. Authentifizierte Backend-Aufrufer an `/v1/route` anbinden, bestehende Nutzerquoten/Prüfregeln erhalten. Scope, Prompt und Operation-ID serverseitig ableiten. Bestehende direkte Aufrufer schrittweise erfassen.
2. Fachlich geprüfte Scope-Evidenz, reale Preisstände und passende Produktionsvalidatoren bereitstellen. Keine synthetischen Unit-Testprofile freigeben.
3. Signierte Policy/öffentlichen Key und Server-Validator-Modul bereitstellen; `GC_AUTOMATIC_ROUTING=true`, `GCLOUD_PROJECT=hausaufgabe-staging`, `GC_ROUTING_POLICY_FILE`, `GC_ROUTING_PUBLIC_KEY_FILE`, `GC_ROUTING_VALIDATORS_MODULE` konfigurieren. Runtime verweigert andere Projekte in dieser Stufe.
4. IAM nur für vorgesehene Backend-Aufrufer, private Firestore-Pfade `aiRouting/**`, getrenntes Evaluationskonto/-budget, Retention/Cleanup und Kostenalarm prüfen. Es werden weder rohe Inhalte noch Audio im Ledger gespeichert. Fingerprints bleiben nur kurzlebige serverseitige Diagnosemetadaten.
5. Echten Staging-Durchlauf für Erfolg, Timeout, doppelte Anfrage, leeres Budget, Widerruf, falsche Signatur und Rückfall abnehmen. Admin-Proxy autorisieren. Dann kontrollierte Aktivierung.

Budgetreservierungen nutzen konservative Text-/Outputgrenzen. Sie sind kein garantierter Anbieter-Rechnungsdeckel: Preisadapter, Tokenizer, Zusatzleistungen und externe Abrechnung können abweichen. Bei einer gemessenen Überschreitung der Reservierung sperrt der Ledger den betroffenen Budgetbereich bis zur Prüfung. Unbekannte Preise bleiben reserviert. Bestehende andere API-Pfade sind noch nicht von diesen neuen Limits erfasst.

`expiresAt` ist derzeit ein vorbereiteter 30-Tage-Löschzeitpunkt, keine bereits konfigurierte TTL. Rohbelege, Wiederholsperren und Monatsabgleich dürfen nicht versehentlich vor Abschluss gelöscht werden. Budgetdokumente brauchen eigene monatliche Aufbewahrungs-/Abstimmungsregeln. Bei einem abstürzenden Worker bleiben Reservierungen stehen; ein späterer Reconciler muss Anbieterbelege prüfen, bevor er freigibt.

Tests: `npm test --prefix ai-gateway`, `node --test shared/intelligence/test/*.test.mjs`, `node --test tools/evaluation/*.test.mjs`. Eigene GitHub-CI prüft mit Node 22/Java 21 zusätzlich reale Firestore-Transaktionen. CI ruft keine bezahlten Modelle auf.

Technische Referenzen: [Firestore-Transaktionen](https://firebase.google.com/docs/firestore/manage-data/transactions), [Anthropic-Cache-Usage](https://platform.claude.com/docs/en/build-with-claude/prompt-caching). Keine aktuellen Modellpreise aus diesen Dokumenten fest eincodiert; Preisstände gehören in die geprüfte Konfiguration.
