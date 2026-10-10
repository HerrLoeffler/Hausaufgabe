# GC-RESTORE-01 – Secrets und isolierter Restore-Nachweis

11.10.2026; Beginn 10.10.2026. Bestehende Task-ID und Sicherung vom 05.10.2026 fortgeführt. Owner: ausführender Sicherungs-/Restore-Chat, Chat-Link unbekannt. Eigener Dokumentationsbranch `docs/gc-restore-secrets-emulator-20261011`, Basis main@6833a1d93562a29199183dc90e59f8069286bf6e. Keine Übernahme gemeinsamer Integrationsdateien oder SEC-/PRIV-Vollprüfungen.

## Auftrag und Ergebnis

Fehlende Firebase/Google-Secret-Manager-Werte lokal sichern und Wiederherstellung testen, ohne Production zu verändern. Ergebnis: verschlüsselte Ergänzung erstellt und im Speicher entschlüsselt/integritätsgeprüft; Daten-Restore in privaten Demo-Emulatoren durchgeführt. Kein vollständiger Disaster-Recovery- oder Production-Freigabenachweis.

| Bestandteil | Staging-Backup | Production-Backup | Tatsächlicher Beleg |
|---|---:|---:|---|
| Secret Manager | 2 Secrets / 3 aktive Versionen | 1 Secret / 1 aktive Version | 4/4 gelesen, Google-CRC32C und SHA geprüft, vor Download OpenSSL CMS/AES-256-CBC verschlüsselt; RSA-3072-Schlüssel separat lokal. Entschlüsselung im Speicher bestanden, falscher Schlüssel abgewiesen. |
| Firestore | 2108 Dokumente + 1 fehlender Parent als Strukturmarker | 1014 Dokumente | Alle Pfade und typisierten Inhaltsfelder nach Import und nach Export/Neustart identisch; Referenzen auf Demo-Projekt umgebogen. |
| Auth | 39 von 40 Konten | 18 von 18 Konten | UID-/Metadaten-/Hash-/Saltvergleich hart geprüft, nochmals nach Neustart; synthetischer Login davor/danach bestanden. |
| Storage | 13 Objekte | leer | Namen, binäre SHA-256-Werte und ausgewählte Originalmetadaten nach Import und Neustart geprüft. |
| Hosting | 558 Dateien / 15 Stände | 26 Dateien / 1 Stand | Private lokale Wiederherstellung; alle 584 Dateien über Loopback bytegleich ausgeliefert, kein JavaScript gestartet. |
| Functions-Quellen | 32 Archive / 6 verschiedene Pakete | 11 Archive / 1 verschiedenes Paket | ZIP-Integrität, sichere Extraktion und 119 + 39 JS-Syntaxchecks; keine Backendausführung. |

Firebase CLI 15.32.0, Java 21.0.12.1; Firestore-Emulator 1.22.0, Storage-Rules-Runtime 1.1.3. Beide Originaldatenbanken Standard/Native. Emulatoren ausschließlich 127.0.0.1 mit `demo-gradecrew-restore-*`-IDs; keine Cloudprojekte oder IAM-Rechte eingerichtet. Alle fünf verwendeten Emulatorports am Ende ohne Listener.

## Grenzen und offene Punkte

- Staging-Altbackup enthält zwei Konten mit derselben E-Mail-Adresse. Auth-Emulator lehnt ausdrücklich den doppelten Import ab. Ein Konto deshalb nicht in derselben Emulatorinstanz importiert; Originalkonto im Backup unverändert erhalten. Keine Umbenennung, Löschung oder stillschweigende Identitätsreparatur. Vollständiger Staging-Auth-Restore offen.
- Auth-Emulator ergänzt einen impliziten Passwort-Providereintrag, den der CLI-Export nicht ausgibt. Dies wurde mit rein synthetischem Konto reproduziert; bekannter Eintrag wird aus denselben Kontoattributen projiziert, falsche/fremde Provideridentitäten bleiben ablehnend. Keine Originalpasswörter getestet; Produktion-SCRYPT-Anmeldung nicht durch synthetischen Login belegt.
- Firestore-Backup ist sequenziell gelesen, kein atomarer Snapshot; keine Wiederherstellung von späteren Abgaben. Server-createTime/updateTime, Storage-Generationen und Systemzeitstempel nicht als unverändert behaupten. Emulatoren qualifizieren keine echten Composite-Indizes/IAM/Billing/Quotas.
- Secrets Stand 10./11.10. ergänzen Daten/Code vom 05.10.; keine gemeinsame atomare historische Momentaufnahme. Anbieter-Gültigkeit, Cloud-Secret-Manager-Neuanlage, reale Backend-/Cloud-Run-Deploys, App-/Geräte-Smokes und vollständige Disaster-Recovery bleiben ungeprüft. Keine Provideraufrufe gestartet.
- Private Daten, Secretwerte, Schlüssel, CMS-/ZIP-Archive, Auth-/Storage-/DB-Snapshots und private Logs bleiben ausschließlich lokal bzw. im privaten ursprünglichen Cloud-Shell-Arbeitsbereich; nichts davon in Git/PR. Der Entschlüsselungsschlüssel ist nicht Bestandteil des Ergänzungsarchivs.

## Production-Grenze und Prüfungen

Cloud-Backup-/Vergleichsprogramm verwendet ausschließlich GET-Aufrufe für Konfigurations-/Secretlesungen. Import-/Schreibprogramm lehnt fremde Hosts, echte Projektpfade, Redirects und Umgebungsproxies ab; kein Functions-Emulator oder Anwendungscode gestartet. Negative Guards/Metadaten-/Provider-/binäre Multipartprüfungen: 6/6 grün, die relevanten Fehler vorher reproduziert. Unabhängiger begrenzter Helper-Review ohne Daten-/Secretlektüre; wichtige Hinweise zu Startcleanup, Auth-/Storage-Metadaten, Redirects und Fehlerexit umgesetzt und geprüft. Kein Vollscan daraus.

Production vor/nach: Hosting-Releases, Functions, aktive Rules, Cloud-Run-Services und Secret-Metadaten SHA-identisch. Keine Produktions-Schreiboperation, Rotation, Deploy oder Restore. Staging-Functions/Cloud-Run-Digests während des Arbeitsfensters abweichend; Ursache hier nicht zugeordnet, kein allgemeiner Unverändert-Nachweis für Staging. Andere laufende Arbeit nicht erneut gestartet oder verändert.

Originalbackup 763 Dateiprüfsummen erneut bestätigt; Ergänzungsarchivtransfer und 14 enthaltene Prüfsummen lokal bestätigt. Ausgeführter finaler Helper-SHA: `b8d2bae0a798ad449c5d4210a77509f6010f92f9942b7ebd9fe82076d35fa408`. Lokaler Hosting- und Secret-Entschlüsselungsbericht liegen zusätzlich bei.

## Versuchshistorie erhalten

1. DB-Import grün; Auth-Duplikatgrenze und TIME_WAIT-Portbindung erkannt.
2. Upload hatte Korrektur unter zusätzlichem Dateinamen abgelegt; alter Helper irrtümlich erneut gelaufen. Originalresultate/Logs erhalten, keinen Code-/Fixnachweis daraus abgeleitet.
3. Exakten hochgeladenen SHA geprüft; Auth-Providerprojektion als strikter Vergleichsfehler erkannt.
4. Providerdarstellung synthetisch qualifiziert; Production inklusive Neustart abgeschlossen, Staging-Storage meldet HTTP501 für nicht unterstützten Media-Upload.
5. GCS-Multipartmodus anhand vorhandener Emulator-API und synthetischem Binärtest qualifiziert; nur Staging fortgesetzt, zuvor erfolgreicher Production-Lauf erhalten. Uploads/Neustart/Syntaxprüfungen abgeschlossen; Duplikatgrenze bleibt ausdrücklich offen.

Keine Secretlese-/Provider-Versuchszähler zurückgesetzt, keine neue Taskfamilie/Budgetreservierung, keine bezahlten Providerstarts. Konkrete Runtime-Modell-/Effort-/Kostenwerte des Hauptchats unbekannt; unabhängiger Helper-Review als Sol/high angefordert, keine Einsparung behauptet.

## Integrationsdelta / nächster Schritt

Gemeinsame TODO/STATE/Registry bleiben beim zuständigen Integrationowner. Vorgeschlagene GC-RESTORE-01-Statuszeile: „Secret-Ergänzung und begrenzter Emulator-/Hosting-Restore nachgewiesen; vollständiger Cloud-/Staging-Auth-Restore wegen doppeltem Altkonto sowie IAM/Backend/Provider-Gates weiterhin offen“. Keine Produktauslieferungsstufe geändert: eigene Dokumentation/Operationsnachweise, keine neue CI-/Staging-/Productionfreigabe.

Nächster ausführbarer Schritt: Integrationowner ordnet den Auth-Duplikatbefund im bestehenden GC-RESTORE-01-Scope zu und legt einen gesonderten isolierten Cloud-Restorevertrag mit Zielprojekt, Rollen, Testdaten-/Kostenrahmen und Rückbau fest. Kein Konto bereinigen oder Production wiederherstellen ohne konkreten weiteren Auftrag.
