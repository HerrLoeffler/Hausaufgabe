# Remy Aufgabenlabor · erster Stapel

**Task:** GC-EXTENDED-QUESTION-TYPES-01. **Freigabe:** Martin, 09.11.2026, getrennte Testseite und ein erster 30er-Stapel mit echter KI.  
**Vorschau:** https://gradecrew-staging-2026--remy-mehrfeld30-1nsipawh.web.app/remy-labor/  
**Vorschau läuft ab:** 09.12.2026, 22:32 Uhr MEZ.

## Bedienung

Mit einem freigegebenen GradeCrew-Testkonto anmelden. „Erste 30 Aufgaben“ öffnet den gemeinsamen Stapel. Pro Karte gibt es die Eingabefelder wie in der Schüleransicht, eine Probeauswertung, Vor/Zurück und zwei Smileys. „Überarbeiten“ erlaubt Grund und Freitext. Die Rückmeldung bleibt privat beim bewertenden Konto, der aktuelle Platz bleibt im Browser gespeichert. „Neue Aufgaben mit KI erstellen“ startet aus freiem Wunsch, Fach und Klasse einen eigenen Stapel mit drei oder fünf Aufgaben. Die bestehende Vorschau-Warteschlange speichert die Auftrags-ID. Nach einem unbestätigten Start wird dieselbe ID erneut geprüft.

## Isolation und Prüfungen

- Hosting nur im Kanal `remy-mehrfeld30` des Projekts `gradecrew-staging-2026`, Quelle `bcafd321f30d0e65518535f0d64e1aa63dd0950e`. Acht öffentlich ausgelieferte Assets mit SHA-256 gegen das lokale Paket geprüft. Browser zeigte die Anmeldung.
- Nur neuer Callable `remyMehrfeld30Review` in Europa. Er überprüft Testprojekt, aktives freigegebenes Konto und den genauen Quelljob. Er liest ausschließlich private Pilotentwürfe der vier festgelegten Jobs bzw. eigene Laborjobs. Die Webseite erhält keine Lösungsschlüssel. Die Probe wird serverseitig bewertet.
- Bewertungen werden als versionsgebundene, idempotente Ereignisse plus aktuelles Urteil im privaten Pfad `remyMehrfeld30Reviewers` gespeichert. Die Pilotdaten werden noch nicht zum automatischen Ändern der Remy-Rezepte verwendet. Der Fingerabdruck verhindert Übernahme alter Urteile auf geänderte Aufgaben. Die Ereignisse speichern keine Kopie einer früheren Aufgabenfassung.
- Elf lokale fokussierte und visuelle Vertragstests grün. Frischer unabhängiger Review ohne kritischen Blocker, Projektguard und Hinweis zur Wiederaufnahme nachgebessert. Live-Prüfung am Test-Callable mit synthetischem Konto: anonyme Anfrage abgelehnt, 22 zum Prüfzeitpunkt bereitstehende Aufgaben ohne Schlüssel geladen, vollständige und leere Eingabe mit 2,5 und 0 Punkten bewertet, veraltete Version abgelehnt, beide Smileys gespeichert und nach erneutem Laden bestätigt, dieselbe Ereignis-ID idempotent. Synthetische Urteile zählen nicht als Lehrkraftfeedback.
- Keine Änderung von Rules, Rollen oder bestehender Worker-Quelle. Keine Änderung am regulären Hosting oder Schul-Live. Die freie Form wurde zusätzlich auf Schnittstellenvertrag und Wiederaufnahme geprüft. Ein weiterer bezahlter Auftrag nur als Demo wurde nicht gestartet. Persönliche Sichtung und physischer Gerätetest stehen aus.

## Inhaltliche Lernfälle

- 13 der 16 Dreisatzaufgaben fordern im Originaltext „vier Rechenpfeile“, obwohl einige schon vorgegeben sind. Die Rechenbeziehung war bei allen 16 stimmig. Das ist eine Abweichung zwischen Arbeitsauftrag und tatsächlicher Oberfläche. Die Entwürfe bleiben als Lernmaterial erhalten.
- Die Gegenprobe war auf Single Choice begrenzt. Sie prüft die generierte fachliche Unterscheidung, keine unbeeinflusste automatische Formatwahl. Vier von sechs sind klare Gegenfälle. Zwei Aufgaben (30 % von 240 und 15 % Rabatt auf 80 €) eignen sich grundsätzlich für Dreisatz. Remy hat sie fälschlich als reine Prozentdeutung behandelt. Beide bleiben als Fehlfälle erhalten.
- Der Physikauftrag nutzt den bestehenden Tabellenrenderer mit gerichteten Übergängen als Inhalt. Eine fachübergreifende automatische Rezeptwahl oder ein neuer Physikrenderer sind mit diesem Test nicht belegt.

## Belege

`direkt.json`, `umgekehrt.json`, `physik.json`, `gegenprobe.json`: stabile Request-/Job-IDs, Stände und erfasste Providerantworten. `verification.json`: maschinelle Aufgabenprüfung ohne Lösungstexte. `server-verification.json`: private Datenpfade, Bewertung und Smiley-Nachweis mit synthetischem Konto.

Nächster Schritt nach Lehrkraftsichtung: die häufigsten Gründe gruppieren, den Arbeitsauftrag aus den offenen Feldern ableiten und an neuen, zurückgehaltenen Fällen prüfen. Keine positive Freigabequote aus der Stückzahl ableiten.
