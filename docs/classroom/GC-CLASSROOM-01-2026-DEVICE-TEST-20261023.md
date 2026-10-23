# GC-CLASSROOM-01: persönlicher Gerätetest auf 2026

Nur Testprojekt `gradecrew-staging-2026`. Bestehender Lehrerlogin und ursprüngliche Tests bleiben erhalten. Alle neu angelegten Personen und Klassen sind ausdrücklich fiktive SYSTEMTEST-Daten.

## Bereitgestellt und nachgewiesen

- Website: https://gradecrew-staging-2026.web.app/
- Webquelle `5490a5d1`, 718 bestandene Web-/Servertests, 182 öffentliche Dateihashes geprüft; 174 ursprüngliche Dateien unverändert.
- Persönlicher API-Ablauf mit der tatsächlichen Secure-Netzwerkklasse: Warteraum ohne Aufgaben → Lehrerstart → Aufgaben → passende Serverabgabe → Schüler „Erledigt“ → bestehende Lehrer-Ergebnisansicht. Dies ersetzt keinen physischen AAC-Test.
- Eigener zweiter Schüler einer anderen Klasse sieht keine Zuweisung und erhält bei fremder Zuweisung 403. Ein neuer Versuch nach bestätigter Abgabe wird mit 409 abgewiesen.
- Ersatzfreigabe über den echten Lehrerknopf und passender typisierter Ersatzbeleg mit ursprünglichem Versuchsschlüssel nachgewiesen. Alte Antworten werden dadurch nicht als Abgabe ausgegeben.
- Druckvorschau für die 24er-Testklasse: Liste zwei Seiten, Karten zwei Bögen, Einzelkarten 24 Seiten. Kein tatsächlicher Druck ausgelöst.

## Der vorbereitete neue Test

Schule **SYSTEMTEST GradeCrew 2026**, Klasse **SYSTEMTEST 8b**, 24 fiktive Schüler. Der neue Test heißt **SYSTEMTEST · 24 Schüler · Secure 2026**, Testcode `66CCZ7JY`. Er wartet auf die Lehrkraft und hat absichtlich kein Zeitlimit, damit die Bereitstellung nicht vor dem Gerätetest abläuft.

**Wichtig:** Dieser Testcode ist kein persönlicher Schülercode. Zum persönlichen Zugang den achtstelligen Code der Zugangskarte von **Test Eins** verwenden. Codes gehören weder in Git noch in öffentliche Screenshots. Die Karte ist unter **Klassen → SYSTEMTEST 8b → Zugangskarten drucken** erreichbar; die Druckansichten sortieren nach Nachnamen.

Der ältere Test **SYSTEMTEST · Persönlicher Schülerzugang 2026** (`BZSZRHJF`) enthält bereits die bestätigte synthetische Abgabe. Diesen nicht erneut als offenen Gerätetest verwenden. Die drei ursprünglichen Lehrertests wurden weder zugewiesen noch verändert.

## TestFlight-Kandidat

Genau ein neuer Produktlauf: https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/40003836588

Quelle `7bed48c0`, Lauf 21: alle vier Vorpruefungen und Build/Signierung/Upload erfolgreich. Tatsaechlich hochgeladen: **Version 1.0 (1211)**, ausschliesslich `gradecrew-staging-2026`. App Store Connect bestaetigt den Eingang; Apple-Status derzeit **Processing**. Erst nach Verarbeitung und sichtbarer Verfuegbarkeit diese Version installieren. Noch kein physischer iPad-Nachweis.

Es handelt sich um dieselbe GradeCrew-Secure-App mit der ausdrücklich ausgewählten 2026-Testumgebung. Ein Simulator bestätigt keine echte Apple-Gerätesperre und keinen signierten Geräte-Schlüsselbund.

## Einfacher erster Durchlauf am echten iPad

1. Die bestätigte neue TestFlight-Version installieren. In Secure muss **TESTUMGEBUNG 2026** und **Persönlicher Schülerzugang – Meine Tests** sichtbar sein.
2. Persönlichen Zugang öffnen und mit der Karte von **Test Eins** anmelden. Für ein gemeinsam genutztes iPad **Schulgerät** wählen; für ein eigenes Gerät **Privatgerät**. Keine Lehreranmeldedaten eingeben.
3. Den neuen **24 Schüler**-Test auswählen und den Apple-Prüfungsmodus bestätigen. Secure muss **Warte auf die Lehrkraft** anzeigen; Aufgaben dürfen davor nicht erscheinen.
4. Auf der Website als Lehrkraft **Laufende Tests → Teilnehmer und Durchführung** öffnen. Für Test Eins muss **Wartet** erscheinen. Die anderen 23 Personen sind fiktiv und noch nicht beigetreten; das ist hier beabsichtigt.
5. **Test für alle starten** wählen und die fehlenden fiktiven Teilnehmer bewusst mit **Trotzdem starten** bestätigen. Derselbe Versuch muss am iPad automatisch mit den Aufgaben fortfahren.
6. Eine Antwort eingeben und über **Abgeben → Jetzt abgeben** abschließen. Erst der bestätigte Serverbeleg zählt. Anschließend muss der Test beim Schüler unter **Erledigt** und beim Lehrer als **Abgegeben/Bewertet** erscheinen.
7. Prüfen, dass die Übersicht danach keinen unbeabsichtigten zweiten Start derselben abgegebenen Arbeit anbietet.

## Danach getrennt prüfen

- **Personwechsel:** Abmelden blendet die Schülerübersicht sofort aus. Nach erneutem Öffnen darf auf dem Schulgerät keine vorherige Person sichtbar sein. Ausstehende Prüfungsantworten bleiben geschützt erhalten.
- **Inaktivität:** Nach fünf Minuten ohne Bedienung sperrt die Schulgeräteübersicht auch ohne Internet. Eine laufende Prüfung wird dadurch nicht gelöscht oder beendet.
- **Fortsetzungsbitte:** Die Lehrkraft fordert beim laufenden, noch nicht abgegebenen Versuch Fortsetzung an. Zustellung und bewusste Bestätigung unterscheiden; keine Verlängerung der Prüfungszeit und keine Löschung.
- **Ersatzversuch:** Nur bei einem separaten noch nicht abgegebenen Test prüfen. Begründung und ausdrückliche Freigabe sind nötig. Das iPad muss den Ersatz anzeigen und den alten Stand vor dem Wechsel geschützt sichern. Bereits bestätigte Abgaben bleiben abgeschlossen.
- **Offlineübertragung/AAC-Unterbrechung:** Separat und kontrolliert prüfen. Keine Gerätesperre umgehen und keinen gespeicherten Stand löschen. Lokales Fertigstellen ist bis zum Serverbeleg weiterhin „Übertragung ausstehend“.

## Nachweise noch offen

Physischer persönlicher AAC-Durchlauf, signierter Geräte-Schlüsselbund, echte Offlineübertragung und Archivwechsel am iPad. Diese Punkte dürfen erst nach einem tatsächlichen Gerätetest als erfüllt markiert werden. Produktivsysteme wurden nicht verändert.
