# E-Mail-Code einrichten — GC-DESIGN-05

Stand 25.10.2026: Code vorbereitet, kein Maildienst eingerichtet, kein echter Versand oder Deploy aus diesem Auftrag. Die Oberfläche darf erst gemeinsam mit den Callables und den neuen Firestore-Regeln veröffentlicht werden, wenn der Empfangstest erfolgreich ist. Bestehende aktive Konten bleiben unverändert; neue selbstregistrierte Konten warten auf Bestätigung.

## Versand einrichten

Der Adapter `functions/lib/verification-mail.js` verwendet die dokumentierte Resend-API ohne zusätzliche Bibliothek. Die Service-Schnittstelle `sendMail({to,code,locale,idempotencyKey})` ist austauschbar.

1. Ein Mailkonto und eine eigene Absenderdomain einrichten. Domain beim Provider mit den geforderten DNS-Einträgen bestätigen. Absender erst danach festlegen, z. B. `GradeCrew <konto@eigene-domain>`.
2. Einen auf Versand begrenzten Provider-Schlüssel ausschließlich in Secret Manager unter `GRADECREW_RESEND_API_KEY` ablegen. Für Staging und Schul-Live getrennte Schlüssel/Konfiguration verwenden. Keine Schlüssel im Chat, Git oder Browser hinterlegen.
3. Ein unabhängiges zufälliges HMAC-Geheimnis mit mindestens 32 Bytes in `GRADECREW_VERIFICATION_HMAC_KEY` hinterlegen. Nicht den Provider-Schlüssel wiederverwenden. Parameter `GRADECREW_EMAIL_FROM` auf den bestätigten Absender setzen. Die Schlüsselwerte wurden in diesem Auftrag weder erzeugt noch gelesen.
4. In Firestore TTL für `expiresAt` in den Collection Groups `emailVerifications` und `emailVerificationLimits` aktivieren. Challenges werden nach zehn Minuten fachlich ungültig; TTL entfernt sie später. Versandzähler verfallen nach höchstens 48 Stunden, verbrauchte Challenges nach 24 Stunden. Keine Klartextcodes in Firestore oder Logs.
5. Auf dem getrennten Testprojekt `gradecrew-staging-2026` Callables `requestEmailVerificationCode`/`confirmEmailVerificationCode`, beide Runtime-/Regelstände und Hosting aus demselben geprüften Kandidaten ausliefern. Kein Schul-Live aus dieser Vorbereitung.
6. Mit einem eigenen synthetischen Testkonto echten Empfang, DE/EN, Spam-Ordner, Codeeinfügung, falschen/abgelaufenen Code, Neusenden und Aktivierung prüfen. Danach frische Anmeldung und die angebotene bestehende Crew-Tour sowie Anmeldung 7/8 und Einstellungen abnehmen. Echte Zustellung und physische Geräte sind durch die lokalen Tests nicht belegt.

## Grenzen und Betrieb

Ein Code bestätigt Zugriff auf die Kontoadresse. Er verhindert keine beliebig automatisierten Konten mit eigenen Mailboxen. Serverseitig gelten fünf Codeversuche, zehn Minuten Gültigkeit, 60 Sekunden Versandpause, fünf Sendungen pro Konto/Stunde, zehn pro Empfänger/Tag und hundert pro gehashter Quell-IP/Stunde. Versandfehler behalten die Pause und invalidieren die Challenge. Ein aktiver App-Check-/Auth-Abuse-Rollout bleibt eine eigene Entscheidung; hier wurde keine bestehende Prüfung abgeschaltet.

Firebase Auth verwaltet Identität und bestätigt die gebundene Adresse. Das aktive Profil wird anschließend in einer Transaktion gesetzt. Ein abgebrochener erfolgreicher Auth-Update kann beim nächsten Bestätigungsversuch sicher abgeschlossen werden. Gesperrte oder gelöschte Profile bleiben gesperrt. Neue unbestätigte Konten können durch direkte Firestore-Aufrufe keine aktive Rolle anlegen.

Quellen: https://firebase.google.com/docs/auth/admin/manage-users und https://resend.com/docs/api-reference/emails/send-email
