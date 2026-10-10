# Datenschutz, Recht und faire Bedienung — GradeCrew

Task GC-LAUNCH-CONTROLS-01-PRIVACY · Stand 10.10.2026 · Dokumentationssetup, kein Produktaudit.
Owner: ausführende Fachrolle [Datenschutz, Recht & faire Bedienung](roles/privacy-legal-fairness.md).
Geltung: Website, Coco/Remy/Emmi, Tests, iPad-App, Games einschließlich Pizza, Lerninsel, Escape-Expedition und ET.
Nutzenwerte beziehen sich auf Schadensvermeidung, Schul-/Kinderdaten und reale Nutzung; sie sind weder rechtliche Pflicht noch Erfüllungsgrad. Jeder Punkt erhält bei konkreten Änderungen einen Owner und einen Nachweis pro Oberfläche/Umgebung.

## Befundbasis und Statusregeln

Geprüfte Koordination: main `59dd0a501a28c04c36ee877450239bf1d64a3187`; [Live Development Status 38052529662](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/38052529662), Job114214359532 success, Artifact11670280804. Jobs, Artifact und Audittext frisch gelesen. Offene PR186/187 (Coco), PR184 (Rollen), PR185 (Games-Modus) bleiben getrennt; keine bestehende identische Assurance-PR in geprüfter Suche. Die Registry ist lückenhaft (118 unklassifizierte Branches), kein Vollständigkeitsbeweis.
Produktquellen frisch vom Integrationsbranch gelesen: `feature/gradecrew-app-integration@c3a5fdcfb949bc0de23295a549388c23cf7655e6`, insbesondere `index.html`, `crew-assistant-ui.js`, `functions/lib/coco-support.js`, `functions/lib/posthog-telemetry.js`.
PR186 ist offen/draft auf `70f420498c26f26ad2920bc061cce78d9b0f75a2`; sein UI-Patch ist lokal geprüft, nicht integriert oder als Stagingänderung bestätigt.
Keine Browser-, Geräte-, Vertrags-, Providerkonto- oder Kundendatenprüfung in diesem Setup. Keine pauschale DSGVO-/WCAG-Konformität.

- **erfüllt**: konkreter Umfang plus reproduzierbarer aktueller Beleg; Teilbelege reichen nicht für Gesamtgrün.
- **offen**: bekannte Lücke oder ausdrücklich vorhandene Folgeaufgabe.
- **nicht relevant**: Funktion/Anwendungsfall nachweislich nicht im aktuellen Umfang; Begründung und Reaktivierungsauslöser festhalten.
- **nicht geprüft**: belastbarer Erfüllungs-/Nichtrelevanzbeleg fehlt. Fehlender Nachweis beweist keinen Verstoß.
- Alle folgenden Stände gelten für das Setupdatum. Ein Produkt-, Rechts- oder Deploymentwechsel verlangt erneute Prüfung betroffener IDs.

Bestehende Quellen weiterführen: [Schul-/ASV-Datenschutzarchitektur](../privacy/CLASSROOM_ASV_IMPORT_PRIVACY.md) auf main; [historischer Produktreview](https://github.com/HerrLoeffler/Hausaufgabe/blob/c3a5fdcfb949bc0de23295a549388c23cf7655e6/PRODUCT_PRIVACY_REVIEW.md) und [historische Roadmap](https://github.com/HerrLoeffler/Hausaufgabe/blob/c3a5fdcfb949bc0de23295a549388c23cf7655e6/PRIVACY_ROADMAP.md). Deren alte Sicherheitsbefunde vom September nicht ungeprüft auf den heutigen Integrationscode übertragen.

## Die 20 Kontrollen

Ownerkürzel sind Aufgabenzuständigkeiten, keine erfundenen Personen: **D** = Datenschutz-Fachrolle, **P** = Produkt-/Web-Fachchat, **G** = jeweiliger Games-Fachchat, **B** = Betreiber (Identität offen), **S** = verantwortliche Schule/DSB (konkrete Schule offen).

| ID | Screenshotpunkt / Nutzen | Anwendung / Owner | Stand und vorhandener Beleg | Konkreter nächster Prüfbeleg |
|---|---|---|---|---|
| PRIV01 | Datenschutzerklärung · 10/10 | Website, App, Games, KI; D+B+S | **offen**: Produktreview/Roadmap und Schularchitektur nennen fehlende Rollen-/Vertrags-/Retentiondetails; index.html hat Materialhinweise, keine Vollständigkeitsprüfung | Datenflussregister mit Datenart, Zweck, Rechtsgrundlage, Verantwortlichem, Empfänger, Standort, Frist und Rechten; öffentliche Hinweise gegen tatsächliche Flows abgleichen |
| PRIV02 | Nutzungsbedingungen · 8/10 | Konten, Schuleinsatz, Games, KI; D+B | **nicht geprüft**: keine aktuellen Bedingungen in gelesener Stichprobe validiert | Betreiber/Vertragsparteien und Nutzungsszenarien bestimmen; Bedingungen auf Rechte, KI-Entwürfe, Leistungsumfang und verständliche Sprache prüfen |
| PRIV03 | Rückerstattungsregelung · 6/10 | Nur kostenpflichtige Angebote; D+B | **nicht geprüft**: aktiver Bezahl-/Vertragsumfang nicht belegt; nicht automatisch nicht relevant | Aktuelle Angebote/Checkout erfassen; bei Verkauf Refunds und anwendbare Verbraucherrechte abgleichen; sonst begründetes nicht relevant mit Reaktivierung bei Verkauf |
| PRIV04 | Cookie-/Speicherungsinformationen · 8/10 | Browser/App-WebView, Games, Auth; D+P+G | **nicht geprüft**: kein frisches Cookie/localStorage/IndexedDB-Inventar | Saubere Testsitzung: Namen, Zwecke, Empfänger und Laufzeiten jeder Speicherung erfassen; Informationen dagegen prüfen |
| PRIV05 | Cookie-Einwilligungsbanner · 6/10 | Nur einwilligungspflichtige Endgerätespeicherung; D+P | **nicht geprüft**: PostHog-Serverprojektion allein belegt weder Browsertracking noch Bannerpflicht | Nach PRIV04 notwendigen Dienst vs zusätzliche Zwecke einordnen; falls erforderlich vor Zustimmung blockieren, Ablehnen und Widerruf praktisch prüfen |
| PRIV06 | Formulareinwilligungen prüfen · 9/10 | Registrierung, Upload, Feedback, Mikrofon, Games; D+P+G | **nicht geprüft**: index.html enthält Rechte-/Uploadhinweise; Freiwilligkeit/Versionierung nicht validiert | Pro Formular Rechtsgrundlage bestimmen; notwendige Bestätigung vs optionale Einwilligung trennen, keine Vorbelegung; Ablehnung/Widerruf mit synthetischen Daten prüfen |
| PRIV07 | Keine unnötigen Daten · 10/10 | Schüler, Material, Coco, Telemetrie, ET; D+P+G | **offen**: Coco 40 Nachrichten/2000 Zeichen ohne TTL; Schularchitektur setzt Pseudonyme als Ziel; kein Gesamtinventar | Felder und Retention je Datenkategorie rechtfertigen; Prompts/Uploads auf unnötige Namen, Codes, Freitext prüfen; keine Rohgespräche ins gemeinsame Gedächtnis |
| PRIV08 | Drittanbieter-SDKs prüfen · 10/10 | Firebase, KI, PostHog, App-/Game-SDKs; D+Security+B | **offen**: PostHog-Modul nutzt EU-Endpunkt; tatsächliche Anbieter-/Vertrags-/Kontokonfiguration fehlt | Pakete und Netzwerkempfänger inventarisieren; AVVs, Unterauftragnehmer, Transfers, Kontoeinstellungen, Training/Retention und Datenzugriff belegen |
| PRIV09 | Dark Patterns entfernen · 9/10 | Anmeldung, Tutor, Abo, Gedächtnis, Gamebelohnungen; P+G+D | **offen**: PR186 entfernt Chat-Löschbedienung, alternative eigene Verwaltung nicht gefunden; kein breites UX-Audit | Ablehnen, Abbrechen, Wiederholen, Löschen/Kündigen mit gleicher Auffindbarkeit testen; keine erzwungenen Zustimmungen oder Druck auf Kinder |
| PRIV10 | Versteckte Gebühren entfernen · 9/10 | Verkauf, KI-Kontingente, Gamekäufe; B+P+G | **nicht geprüft**: Preise/Checkout nicht bestätigt | Reale Angebots-/Limittexte und Gesamtpreis vor kostenpflichtiger Aktion vergleichen; bei fehlendem Verkauf N/R mit Trigger dokumentieren |
| PRIV11 | Gefälschte Bewertungen entfernen · 8/10 | Startscreen, Store, Testimonials; P+B | **nicht geprüft**: kein vollständiges Bewertungsinventar | Jede sichtbare Bewertung mit Herkunft/Zustimmung belegen, fiktive Beispiele kenntlich machen; fehlende Bewertungsfunktion begründet N/R |
| PRIV12 | Unbelegte Aussagen entfernen · 10/10 | KI-Qualität, Sicherheit, Datenschutz, Lernwirkung; P+G+D | **nicht geprüft**: keine vollständige Copyprüfung; index.html sagt „keine Schülerdaten geteilt“ bei Testkopie | Aussage→aktuelle Evidenz/Umfang zuordnen; freie Aufgaben können selbst Personenangaben enthalten, pauschale Anonymitäts-/Fehlerfreiheits-/Deutschlandversprechen gesondert prüfen |
| PRIV13 | Alternativtexte · 9/10 | Bilder, Aufgaben, Crew, Gameinformationen; P+G | **offen**: Coco-Suche meldet Bilder ohne brauchbare Beschreibung; Suchbeschreibung ist kein Accessibilitynachweis | Screenreader in realen Aufgaben: aussagekräftiger Alternativtext ohne Lösung vorwegzunehmen; Dekoration leer; wesentliche Canvas-/3D-Information über zugängliche Alternative |
| PRIV14 | Farbkontrast · 9/10 | Website, iPad, ET, Games; P+G | **nicht geprüft**: kein gemessener Kontrastnachweis | Text/Controls in Normal-, Fokus-, Fehler-, Disabled- und Overlayzuständen messen; WCAG22-Kriterien und Einsatzumfang festhalten, Ergebnisse am Gerät prüfen |
| PRIV15 | Tastaturnavigation · 9/10 | Web/App, Editor, Coco, Menüs/Spielsteuerung; P+G | **nicht geprüft**: PR186 belegt nur Composer→Send-Tab lokal, keine Gesamtabnahme | Vollständige Abläufe nur Tastatur: Fokus sichtbar/logisch, Dialogrückgabe, Escape, keine Falle; Spielsteuerung und alternative Aufgabenbedienung prüfen |
| PRIV16 | Anbieterangaben · 9/10 | Website, App/Store, Gameangebot; B+D+P | **nicht geprüft**: Betreiberidentität/öffentliche Angaben nicht bestätigt | Tatsächliche Betreiberangaben feststellen, geltende Informationspflichten anhand Nutzungs-/Geschäftsmodell prüfen; öffentliche Erreichbarkeit testen |
| PRIV17 | Voraussetzungen Kinderdaten · 10/10 | Schule, Schülerzugang, Games, KI; S+B+D | **offen**: Schularchitektur ist Zielbild; konkrete Rollen/Rechtsgrundlagen und Schulfreigaben fehlen | Bundesland, Schulart, verpflichtend/freiwillig, Daten/ Zwecke klären; Schule/AVV/DSB/DSFA-Erforderlichkeit prüfen; Art8 nur passenden einwilligungsbasierten Dienst zuordnen |
| PRIV18 | Abmeldelink in E-Mails · 7/10 | Newsletter/Werbung; B+P+D | **nicht geprüft**: aktiver Marketingmailfluss nicht belegt | Nachrichteninventar: Werbung vs notwendige Kontomail; Werbeeinwilligung/Ausnahme und funktionierende einfache Abmeldung prüfen; keine Newsletterpflicht aus Passwortmail ableiten |
| PRIV19 | Fonts/Bilder/Assets lizenzieren · 9/10 | Website, PDF, App, Games, 3D, Sounds; P+G+D | **nicht geprüft**: keine vollständige Asset-/Lizenzprüfung | Eingesetzte Dateien→Quelle/Lizenz/Version/Nutzung/Attribution nachweisen; Store/Web/Print/KI-Uploadrechte getrennt prüfen, vorhandene Assetregister wiederverwenden |
| PRIV20 | Datenlöschanfragen · 10/10 | Konten, Coco, Tests, Uploads, Logs, Backups; D+P+B+S | **offen**: Coco clear-Backend vorhanden, PR186 entfernt Chat-Controls; eigenständige Verwaltung außerhalb Chat nicht gefunden | Lösch-/Auskunftsweg außerhalb Chat definieren; mit synthetischem Konto Geräte-/Queue-/Backup-/Providerfolgen prüfen; schulische Aufbewahrung beachten, keine echten Daten im Setup löschen |

## Rechts- und Prüfquellen

Primärquellen am 10.10.2026 recherchiert; der Agent prüft beim nächsten rechtlichen Entscheidungsauftrag den aktuellen Text erneut. Zusammenfassung pro Quelle bewusst knapp:
- [DSGVO](https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679): Zwecke, Erforderlichkeit, Informationen, Betroffenenrechte, Verträge, technische Gestaltung und Sicherheit zusammen prüfen (Art5/6/12–17/25/28/32/35/44ff). Art8 betrifft bestimmte auf Einwilligung gestützte direkt angebotene Dienste; keine pauschale Elternzustimmung für jeden Schuleinsatz. Pseudonyme können personenbezogen bleiben.
- [Bayerisches Kultusministerium — Datenschutz an Schulen](https://www.km.bayern.de/recht/datenschutz-an-schulen): konkrete schulische Verantwortlichkeit, DSB und Einsatzbedingungen klären; die vorhandene ASV-Architektur liefert weiterführende Landesquellen, keine bundesweite Freigabe.
- [§25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html): Endgerätespeicherung/-zugriff prüfen; unbedingt erforderliche Funktionen können von Einwilligung ausgenommen sein. Ein Banner ist keine automatische Pflicht für jede App.
- [§7 UWG](https://www.gesetze-im-internet.de/uwg_2004/__7.html): Werbemails gesondert einordnen und Abmeldung prüfen; operative Kontonachrichten sind kein pauschaler Newsletterfall.
- [WCAG2.2](https://www.w3.org/TR/WCAG22/): Alternativtexte, Kontrast, Tastatur und Fokus praktisch prüfen. Vier Screenshotpunkte belegen keine vollständige Barrierefreiheit; gesetzliche Anwendbarkeit separat klären.

## Coco-Grenze und erste Folgeaufgaben

Coco auf Integrationsstand speichert kontogebunden die letzten40 Nachrichten und explizite Vorlieben bis2000 Zeichen ohne TTL; Modellkontext12 laut aktueller main-Übergabe. Backendread/clear und Generation/Accountschutz vorhanden. PR186 entfernt nur Chat-Gedächtnisbedienung und bleibt branch_only; die bisherigen Stagingnachweise PR179–183 gelten nicht für seinen UI-Patch.
Automatische Vorliebenableitung und gemeinsame selbstlernende Knowledge sind kein nachgewiesenes Produktfeature. Geprüfte allgemeine Produktanleitungen sind von privaten Gesprächen, Kontodaten und fremden Schülerdaten getrennt zu halten.

Priorisierte Folgeaufträge (bestehende Owner wiederverwenden, keine automatische Umsetzung durch dieses Dokument):
1. **P0 / PRIV01,07,08,17,20**: D führt eine Datenfluss-/Fristenmatrix aus aktuellem Code und vorhandenen Verträgen; B/S liefern fehlende Tatsachen ohne Schülerdaten. Verantwortlichkeit, AVVs, reale Standorte/Providerretention und Schuleinsatz bleiben echte offene Fragen.
2. **P1 / PRIV09,20**: Coco-Web-Fachchat ergänzt separat eine verständliche kontogebundene Auskunfts-/Löschverwaltung außerhalb Chat und prüft Cross-device/Reset-Races mit synthetischem Konto. Speicherregel transparent machen; Fristentscheidung nicht erfinden.
3. **P1 / PRIV04–06,18**: Web/App-Fachchat erstellt Cookie-/Speicher-/Mail-/Consent-Inventar und daraus erst erforderliche Bedienung.
4. **P1 / PRIV12–16,19**: Web- und jeweilige Games-Fachchats prüfen tatsächliche Oberflächen/Assets einschließlich ET, iPad und Spielmenüs. Vorhandene Lizenz-/Accessibilityarbeit zuerst lesen.

Kleinster nächster Schritt: **Datenschutz-Fachrolle ergänzt eine reine Metadatenmatrix für Coco: gespeicherte Felder, aktueller Zweck, Kontozugriff, Frist, eigener Auskunfts-/Löschweg; PRIV07/20 gegen Integration und PR186 getrennt abgleichen.** Keine Kontoinhalte lesen oder löschen.
