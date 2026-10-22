# GC-DOMAIN-01 — gradecrew.de im Livebetrieb

Stand22.10.2026. Betreiberauftrag: gradecrew.de als neue öffentliche Liveadresse, bisherige Links und Konten weiter nutzbar. Ausführliche Versuchshistorie und Nachweise in workstreams/domain-gradecrew-de-20261022.md und analysis/domain-cutover-20261022/.

## Aktueller Aufbau

| Zweck | Adresse / Projekt |
|---|---|
| Neue öffentliche Liveadresse | https://gradecrew.de/ |
| WWW | https://www.gradecrew.de/ leitet mit Pfad und Query zur Hauptdomain |
| Weiter nutzbare bisherige Adresse | https://hausaufgabe-staging.web.app/ |
| Gemeinsames Firebaseprojekt und Hostingsite | hausaufgabe-staging |
| Unveränderter Authhost | hausaufgabe-staging.firebaseapp.com |
| Getrennte Testumgebung | gradecrew-staging-2026; keine Konten-/Datenvermischung |
| Unverändertes Legacyprojekt | hausaufgabe-40294 |

Es gibt keinen Konten- oder Testumzug. Beide Liveadressen verwenden denselben Firebaseaccount-/Datenbestand. Dieselben Zugangsdaten liefern dieselbe UID. Browser speichern ihre Anmeldung je Origin; ein neues Anmelden auf der neuen Adresse ist normal. Abmelden auf der neuen Origin meldet eine bestehende Sitzung der alten Origin nicht ab; tatsächlich geprüft. Keine harte Weiterleitung der alten Webadresse einrichten, solange alte Kontozugänge, QR-Links und ausgelieferte Apps darauf angewiesen sind.

## DNS und Auth erhalten

Netcup-Nameserver/SOA blieben unverändert. Ausgangszone enthielt nur die Parkadresse; Original in netcup-zone-before.json gesichert. Alle fünf autoritativen Netcup-Nameserver liefern das Firebaseziel. Aktive Records:

| Host | Typ | Ziel |
|---|---|---|
| @ | A | 199.36.158.100 |
| @ | TXT | hosting-site=hausaufgabe-staging |
| www | CNAME | hausaufgabe-staging.web.app. |
| _acme-challenge | TXT | aktuelle Firebasechallenge; exakter Wert im Beleg |
| _acme-challenge.www | TXT | aktuelle Firebasechallenge; exakter Wert im Beleg |

Ownership-TXT dauerhaft behalten, keine Rücksetzung auf Netcup-Parking. Bei späteren Zertifikatsproblemen aktuelle Firebaseanforderungen lesen; nicht blind neue Domains/Challenges erstellen. Firebase erneuert Hostingzertifikate selbst. Zertifikate beider Domains sind am22.10.20:33UTC CERT_ACTIVE, Host/Ownership aktiv. Keine Mailrecords waren vorhanden oder wurden geändert; zukünftige MX/SPF/DKIM/DMARC nicht bei Webänderungen entfernen.

Auth authorizedDomains wurde ausschließlich um gradecrew.de/www ergänzt; alle vorherigen Domains und die gesamte übrige Config blieben gleich. Keine Wildcards, keine neuen Provider, keine Ruleslockerung. Firebaseprojekt-/Functions-/API-/Authhostkennungen nicht wegen der Marketingdomain ersetzen. Native Keychain-/QueueIDs bleiben ebenfalls unverändert.

## Durchgeführte Webabnahme

- GültigesHTTPS, HTTP-/WWWweiterleitung mit erhaltenem Pfad und Testcode.
- Gleicher veröffentlichter Quellreleaseab6fcc9d/gc45-rc1; alle173Assets auf der neuen Origin gegen bestehendesManifest geprüft. Kein Hostinginhaltsdeploy durch Domainanbindung.
- Neuer fiktiver Testaccount: Browserpasswortlogin, Reload/Sitzungsrestore und Logout bestanden. RESTpasswortlogin mit denselbenCredentials und beidenOriginconfigs bestätigt identischeUID; alte realeBrowsersitzung erhalten, keine fremdenKontoinhalte verändert.
- Tatsächlicher synthetischer Schülerdurchlauf im bestehendenDemo3F2RH3PU mit serverbestätigterAbgabe.
- Eigener manuell erstellter synthetischer Test7WGQTJ5S erzeugt echtenQR190x190. LokaleDecodierung ergibt https://gradecrew.de/?test=7WGQTJ5S. Derselbe Schülercode öffnet auf beidenOrigins denselbenTest mit verbundenemServer.
- Passwortresetlinks mit Rückwegen auf beideOrigins erfolgreich generiert, ohne Mailversand oder Passwortänderung. TatsächlicheMailzustellung und vollständigerNutzerpasswortreset nicht behauptet.
- PhysischerKamerascan/Handy-/AAC-Geräteabnahme bleiben von Browser-/Decodertests getrennt.

Webkandidat750212e7 nach unabhängigemReviewPASS und CI39848742312success normalfastforward integriert; nur kanonischeReleaseprüfadresse in tools/environments.mjs geändert, Projektbindung und Stagingisolation erhalten. MainkoordinationPR283 integriertcb1b0e28, alte42STATE-/61Registryeinträge erhalten.

## Appzuständigkeit

GC · iPhone & iPad,01a10c75-8912-7a12-98f0-c9e78064aa2c, betreut NativePR289. Neue öffentliche BaseURL bei alten kompatiblenHostfreigaben; Bridge weiter strict same-origin, Projekt-/API-/Keychain-/Offlinequeuekennungen unverändert. Tatsächliche Store-Support/Marketing/Datenschutz-URLs für Secure und Teacher nach Martins Appleanmeldung gespeichert und nachReload bestätigt. TestFlightabschluss anhand eigener Native-/Signierungs-/Uploadreceipts prüfen; Websiteerreichbarkeit ist kein Appupload-/Gerätenachweis.

Domainwechsel ist keine Server-/Datenmigration und ändert nicht den bestehenden Datenschutz-/Vertragsstand.

Quellen: https://firebase.google.com/docs/hosting/custom-domain und tatsächliche eigeneCloud-/DNS-/Browser-/CIbelege in der Workstreamübergabe.
