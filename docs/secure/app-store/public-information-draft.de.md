# Öffentliche Informationen für GradeCrew Secure — Arbeitsfassung

Stand: 21.10.2026. **Nicht veröffentlichungsfertig.** Eckige Markierungen sind offene Tatsachen, keine auszuliefernden Platzhalter. Keine rechtliche Freigabe. Gilt für die Schüler-App `de.gradecrew.secure`; eine gemeinsame Website-Erklärung braucht zusätzliche Abschnitte für Lehrerkonten, Remy, KI-Material, Feedback und Web-Analytics.

## Vorgesehene öffentliche Adressen

Die vorhandene Live-Adresse kann verwendet werden; eine gekaufte Domain ist dafür nicht erforderlich. Geplante, noch nicht bereitgestellte Seiten:

- `https://hausaufgabe-staging.web.app/datenschutz.html`
- `https://hausaufgabe-staging.web.app/support.html`
- `https://hausaufgabe-staging.web.app/impressum.html`

Keine dieser Adressen ist hier als bereits geprüfte oder veröffentlichte Rechtsseite bestätigt. Nicht vorzeitig in App Store Connect eintragen. Hosting darf die URLs nicht lediglich auf die Startseite umleiten.

## Entwurf: Datenschutz für GradeCrew Secure

### Wer betreibt den Dienst und wer verantwortet die Prüfung?

GradeCrew ist die Produktmarke. Technischer Betreiber: **Martin Löffler (selbständiger gewerblicher Betreiber, von Martin bestätigt)**, **Auenstraße 76, 80469 München, Deutschland**, Kontakt **martin.loeffler91@yahoo.de**.

Bei einer schulisch organisierten Prüfung entscheidet **[verantwortliche Schule/Träger, Kontakt und gegebenenfalls Datenschutzbeauftragte]** über den konkreten Einsatz und die Behandlung der Prüfungsdaten. **[Rollen und vertragliche Beauftragung je Verarbeitung bestätigen; Betreiber nicht ungeprüft als allein Verantwortlichen bezeichnen.]**

### Welche Angaben werden verarbeitet?

Du trittst einer Prüfung mit einem Testcode und dem von der Lehrkraft vorgegebenen Namen oder Kürzel bei. Ein eigenes Schülerkonto mit E-Mail und Passwort ist im untersuchten Secure-Ablauf nicht erforderlich. Ein Kürzel kann trotzdem einer Person zugeordnet werden und ist deshalb nicht automatisch anonym.

Für die Prüfung werden insbesondere Teilnahme- und Testkennungen, deine Antworten, Bearbeitungsstände sowie Start- und Abgabezeit verarbeitet. Technische Ereignisse können erkennen lassen, welche Aufgaben berührt oder als bearbeitet gemeldet wurden und ob eine Abgabe automatisch erfolgte. Die Zeit zwischen Start und Abgabe beweist nicht, dass du die ganze Zeit aktiv gearbeitet hast.

### Wozu dienen diese Daten?

Die Prüfungsdaten ermöglichen das Laden der Aufgaben, die Wiederherstellung unterbrochener Arbeit, die Abgabe und die schulische Auswertung. Technische Verlaufsdaten dienen außerdem **[tatsächliche betriebliche Statistikzwecke und Umfang bestätigen]**. Eine Verwendung für neue Zwecke muss gesondert geprüft und erklärt werden.

**[Rechtsgrundlage der schulischen Verarbeitung ergänzen; Rechtsgrundlage für eigene Betriebs-/Statistikzwecke separat festlegen.]** Der Startknopf ist nicht pauschal eine Einwilligung in sämtliche Verarbeitung. Keine erfundene Einwilligungs-Checkbox ergänzen.

### Was geschieht bei einem WLAN-Ausfall?

Antworten werden während der Bearbeitung auch im geschützten App-Speicher auf dem iPad gesichert. Nach lokal gesicherter Abgabe kann die Prüfungssperre aufgehoben werden, obwohl die Serverbestätigung noch fehlt. Die App zeigt diesen Unterschied an. Öffne sie mit Internetverbindung erneut, damit die ausstehende Abgabe übertragen werden kann. Vor der Bestätigung ist kein neuer Test vorgesehen. Bei vollständig beendeter App ist eine sofortige Hintergrundübertragung nicht garantiert.

Der lokale Antwortpuffer bleibt für die Nachübertragung erhalten und wird erst nach der passenden Serverbestätigung entfernt. Zugangsmerkmale und die technische Ereigniswarteschlange werden gerätegebunden gespeichert; der Antwortpuffer ist vom Gerätebackup ausgeschlossen. Löschen der App oder Verlust des Geräts kann eine noch nicht übertragene Arbeit verlieren lassen. Ausstehende Abgaben daher nicht durch Neuinstallation zu beheben versuchen.

### Prüfungssperre und Gerätezugriff

GradeCrew Secure nutzt Apples Automatic Assessment Configuration für den Prüfungsmodus. Vor dem Prüfungsstart wird die Sperre erklärt und bestätigt. Der untersuchte Schülerablauf zeichnet weder Kamerabilder noch Mikrofonaufnahmen auf. Die App besitzt damit keine allgemeine Überwachung aller Aktivitäten außerhalb der Prüfung. Die geräteseitige Sperre ersetzt keine schulische Prüfungsaufsicht.

### Wer erhält Daten und wo werden sie verarbeitet?

Die Prüfung wird über Google-/Firebase-Infrastruktur bereitgestellt. Aufgaben können entfernte Bild- oder Audiodateien laden. **[Konkrete Vertragspartner, Dienste, Medienhosts, Regionen, Protokollierung und gegebenenfalls Drittlandgarantien aus dem tatsächlichen Betrieb ergänzen.]** Berechtigte schulische Personen erhalten die für ihre Auswertung vorgesehenen Daten; **[Rollen/Zugriffswege bestätigen]**.

Ein unmittelbar vom Secure-Schülerablauf ausgelöster OpenAI- oder PostHog-Aufruf wurde im untersuchten nativen Client nicht gefunden. Das ist keine Aussage, dass die gesamte GradeCrew-Plattform diese Dienste nicht nutzt. KI-Erstellung durch Lehrkräfte und spätere serverseitige Verarbeitung müssen in der Plattform-Erklärung gesondert beschrieben werden. Nicht pauschal „keine Daten an Dritte“ oder „alles ausschließlich in Deutschland“ versprechen.

### Wie lange werden Daten gespeichert?

Lokale Antwortdaten: bis zur bestätigten Übergabe gemäß obigem Ablauf. Technische Ereignisse in der lokalen Warteschlange werden beim Laden, Erfassen oder Übertragen anhand einer Grenze von 30 Tagen ausgesondert; dies ist **keine garantierte Löschung auf einem ausgeschalteten Gerät und keine Server-Löschfrist**.

**[Serverfristen oder überprüfbare Kriterien für Prüfungsantworten, Versuche, technische Einzelereignisse, Statistiken, Sicherheitsprotokolle und Sicherungen ergänzen.]** Eine siebentägige technische Wiederherstellungsgrenze ist keine siebentägige Löschfrist für Schülerleistungen. Schulische Aufbewahrungspflichten und die tatsächliche technische Löschung müssen übereinstimmen.

### Auskunft, Berichtigung und weitere Rechte

Bei Fragen zu deiner Prüfung wende dich an **[schulischer Kontakt]**; bei technischen Datenschutzfragen an **[Betreiberkontakt]**. Je nach Voraussetzungen bestehen Rechte auf Auskunft, Berichtigung, Löschung oder Einschränkung sowie weitere gesetzliche Rechte. Schulische Aufbewahrungspflichten können einer sofortigen Löschung entgegenstehen. **[Zuständige Aufsichtsbehörde und Kontakt nach Rollen/Sitz ergänzen.]** Die Zuordnung eines Kürzels soll über die zuständige Schule geklärt werden; keine unnötigen Ausweiskopien sammeln.

**[Bewertungsablauf bestätigen: regelbasierte Vorbewertung, menschliche Prüfung, tatsächliche Folgen; keine ungeprüfte Behauptung zur automatisierten Entscheidung.]**

## Entwurf: Support

GradeCrew Secure ist die iPad-App zur Teilnahme an von Lehrkräften bereitgestellten Prüfungen. Du benötigst einen gültigen Testcode und den mit der Lehrkraft vereinbarten Namen oder ein Kürzel.

- Testcode oder Prüfungsinhalt: zuständige Lehrkraft fragen.
- Abgabe noch ausstehend: Internetverbindung herstellen und Secure erneut öffnen. Die lokale Sicherung ist noch keine Serverbestätigung. App nicht löschen oder Gerät zurücksetzen.
- Start oder Sperre nicht möglich: Meldung der Lehrkraft zeigen; Prüfung nicht unter Umgehung der vorgesehenen Sperre beginnen.
- Technische Unterstützung: **martin.loeffler91@yahoo.de**. Bitte App-Version, iPad-Modell, Betriebssystem und den Wortlaut der Fehlermeldung nennen. Keine Prüfungsantworten, Zugangstoken oder fremde Schülerdaten per E-Mail mitschicken.

Keine garantierte Reaktionszeit oder Rund-um-die-Uhr-Betreuung behaupten. Links zu Datenschutz und Impressum ergänzen.

## Entwurf: Impressum

GradeCrew Secure / GradeCrew

**Martin Löffler**
**Auenstraße 76, 80469 München, Deutschland**
E-Mail: **martin.loeffler91@yahoo.de**

**[Nur falls zutreffend: Rechtsform, Vertretung, Register und Nummer, bestehende relevante Steuer-/Wirtschafts-ID und weitere Pflichtangaben.]** Keine Gesellschaft, Umsatzsteuer-ID oder Schulträgerschaft erfinden. Markenname und Anbietername können nebeneinander stehen.

## Quellen und Befundgrenzen

- Öffentliches Informationsniveau/Betroffenenrechte: [DSGVO Kapitel III bei der Datenschutzaufsicht CNPD](https://cnpd.public.lu/de/legislation/droit-europ/union-europeenne/rgpd/chapitre-3.html).
- Anbieterangaben: [§5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html); die konkrete Anwendbarkeit ist anhand des Betriebs zu bestimmen.
- Schulische Rollen/Beauftragung: [Bayerisches Kultusministerium – Datenschutz an Schulen](https://www.km.bayern.de/recht/datenschutz-an-schulen/); kein Nachweis einer bereits abgeschlossenen GradeCrew-AVV.
- Öffentliche und in der App erreichbare Datenschutzerklärung: [Apple App Review 5.1](https://developer.apple.com/app-store/review/guidelines/#privacy).

Technischer Abgleich: Secure-Client auf Kandidat `b8b2e509624b696a524d1adef0788579863a85de`; Web-Quellstand `4f8b79222a35997852aad4673f8aaf338904f485`. Der dortige KI-Uploadhinweis ersetzt keine vollständige Secure-Datenschutzerklärung. Alte Berichte vom September sind historische Arbeitsstände, keine aktuellen Sicherheitsbefunde. Keine privaten Nutzer-/Prüfungsdaten oder Secrets für diese Bestandsaufnahme gelesen.

## Bestätigte öffentliche Betreiberanschrift

Martin hat am 21.10.2026 ausdrücklich die zuvor genannte Münchner Anschrift für die öffentlichen Betreiberunterlagen gewählt. Anbieter: Martin Löffler, Auenstraße 76, 80469 München, Deutschland. Öffentlicher Kontakt: martin.loeffler91@yahoo.de. Die vorherige Zurückstellung der Wohnanschrift ist damit aufgehoben. Diese Übernahme in den lokalen Entwurf ist noch keine Veröffentlichung, keine Bestätigung der Apple-Händlerdaten und keine rechtliche Freigabe der übrigen offenen Angaben.

Apple verlangt für gewerbliche EU-Angebote öffentliche Händlerkontaktdaten. Bei Individual-Konten erlaubt Apple dafür ausdrücklich eine Adresse oder ein Postfach, Telefonnummer und E-Mail. Das Postfach genügt deshalb noch nicht für das deutsche Impressum. Eine eigene zulässige Geschäftsanschrift ist für beide Zwecke separat zu prüfen. [Apple EU-Händleranforderungen](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements/).
