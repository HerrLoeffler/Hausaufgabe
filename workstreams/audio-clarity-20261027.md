# GC-WEB-REPAIR-20261007 / GC-AUDIO-01 — Klarere Audio-Bedienung und Änderungsmarkierungen

Fortsetzung derselben Task und Chat-ID 01a15f06-837c-73b3-93fa-0d07a8104d3a. Basis ist verifiziertes Live cedbcef0; main48e8719. Ältere Versuche und Übergaben bleiben erhalten. Scope: Hosting auf gradecrew.de/hausaufgabe-staging. Backend, Regeln, Providerlimits, Accounts und übrige Projekte unverändert.

Nutzerfeedback: Hörvarianten eindeutig, „Beides hören“ → „Aufgabe und Antworten hören“; Testsprache neben Remy, kompaktere Diktiersteuerung, Angaben ohne normales Scrollen. Im Editor Aufgaben- und Antwortaudio in EINEM Audio-Reiter, vorhandene Frage/eigener Hörtext weiterhin auswählbar, Erklärungen nur bei Bedarf. Bestehende Farben, Schrift,44px-Ziele und Datenverträge weiterverwenden.

Zusatzwunsch: Erfolgreiche Emmi-, Bild- und Audioänderungen in der linken Aufgabenübersicht sichtbar markieren, bis ausdrücklich geprüft. Markierungen lokal nach Konto/Test/Aufgaben-ID getrennt, ohne Aufgabeninhalte oder Zugangsdaten zu speichern. Erneute Änderung setzt Prüfhinweis erneut. Keine automatische fachliche Freigabe und keine neue serverseitige Sperre. Bestehende Hintergrundabläufe weiterverwenden; Abschluss darf Eingaben in anderen Aufgaben nicht neu aufbauen.

Plan: passende Regressionen zunächst rot; UI und Erfolgsmarkierungen klein umsetzen; tatsächliche dynamische Testsprache UND Remy in Browserfixture einbeziehen (fehlten zuvor als komplette Oberfläche); Chromium/WebKit, bestehende Webprüfungen und unabhängige Review; exakte CI/Preview und begrenzter Hosting-Release mit Dateinachweis. Keine kostenpflichtigen Providerproben. Bei winzigen Höhen/Zoom bedienbare Ausweichlösung erhalten, keine abgeschnittenen Felder.

Entscheidung: Die sichtbare Audiofläche enthält zwei kurze Teilbereiche „Aufgabe“ und „Antworten“ unter einem Reiter. Keine zweite Navigationsebene oder neuer Audio-Modus. Änderungsmarkierung ist eine persönliche Browserhilfe; geräteübergreifende Synchronisation bleibt offen. Modell requested inherited, actual unknown; kein Modellwechsel.

Historischer Zwischenstand vor Umsetzung; durch den folgenden finalen Release-Nachweis ersetzt.

Zwischenstand: 618 Webprüfungen und2 echte App-Szenen grün, einschließlich Erhalt von Fokus und ungespeichertem Text einer anderen Aufgabe bei Hintergrundabschluss. Alte Browserfixture erfasste den vollständigen dynamischen Remy-/Sprachbereich nicht; nun korrigiert und Platzbedarf reproduziert. Neue Handyfotos bestätigen denselben Fehler. Überschrift16px mobil, Erklärung ausgeblendet, Remy eine kompakte Zeile, Testsprache im Kopf, gekürzte Zusammenfassung; Normalansicht ohne initiales Angaben-Scrollen. Bei sehr kurzer Höhe bleibt Erstellen fest sichtbar, bedienbares Scroll-Ausweichverhalten erhalten. Drei WebKit-Resize-Überläufe auf native Sprachauswahl mit unerwünschter Mindestbreite eingegrenzt; explizite min-width0-Korrektur wird geprüft. Keine Assertion entfernt.

Abschlussprüfung lokal: vollständige Browserfixture44/44 grün (Chromium/WebKit), einschließlich tatsächlicher Remyfläche und dynamischer Sprachsteuerung. Mindestbreite durch kompaktes natives Sprachfeld beseitigt; sichtbare Optionen kürzer, Werte de-DE/en-GB unverändert. Fußzeile auf Erstellung kompakt, Feedback/Neuigkeiten/Rechtslinks bleiben erreichbar. Review fand2P2: Gesamt-Emmi/Varianten fehlten im Markerpfad und Typwechsel hatte abschließenden Vollrender. Gezielt korrigiert: erfolgreiche geänderte Gesamt-Emmi-Aufgaben/übernommene Varianten markieren; Typwechselabschluss rendert nur eigene Karte. Normale andere Eingabe bleibt mit DOM, Fokus und Inhalt erhalten (echte App-Szene geprüft). Marker persistieren nur in diesem Browser, getrennt nach Konto/Test/Aufgabe; keine serverseitige Speicherung und keine zusätzliche Freigabesperre. Physische iPhone-Abnahme nach Veröffentlichung offen.

## Finaler Release-Nachweis

{
  "source_commit": "f589dd97e2859f9549b105f191aba9045b66e6d3",
  "tree": "8061a7e2b1503f5abf0f528cca99d26d0587db91",
  "pr": 348,
  "scope": "Hosting only; gradecrew.de and existing Firebase address",
  "ci": {
    "run": 40583925143,
    "attempt": 2,
    "conclusion": "success",
    "first_attempt": "Node and44media checks green; unrelated public reset-entry load timeout; targeted failed job rerun succeeded",
    "local_web_checks": 631,
    "browser_checks": 46,
    "public_entry_followup": "36 viewport layouts,60 task layouts and account/legal interactions passed locally"
  },
  "hosting": {
    "project": "hausaufgabe-staging",
    "version": "d25510c881c79b99",
    "release_time": "2026-10-27T21:11:51.645Z",
    "origins": [
      {
        "origin": "https://gradecrew.de",
        "commit": "f589dd97e2859f9549b105f191aba9045b66e6d3",
        "files": 206,
        "verified": 206,
        "failed": []
      },
      {
        "origin": "https://hausaufgabe-staging.web.app",
        "commit": "f589dd97e2859f9549b105f191aba9045b66e6d3",
        "files": 206,
        "verified": 206,
        "failed": []
      }
    ]
  },
  "backend_changed": false,
  "rules_changed": false,
  "auth_configuration_changed": false,
  "limits_changed": false,
  "paid_provider_calls": 0,
  "review": "two P2 findings fixed; original isolated handlers rechecked for whole-test marker and focused type-change render",
  "user_device_acceptance": "pending",
  "reminder_scope": "local browser, separate account/quiz/question; no task content in reminder storage",
  "prior_candidate_runs": [
    40583581340,
    40583791696
  ]
}

Nur dieser Hosting-Scope ist veröffentlicht. Aktuelle physische iPhone-/iPad-Abnahme bleibt offen. Änderungen werden auf diesem Browser markiert, nicht geräteübergreifend synchronisiert. Schmale/kurze Ansichten bewahren bedienbare Felder und erreichbares Erstellen durch begrenztes Scroll-Ausweichverhalten. Keine neuen Provider-Proben oder Backend-Deploys. Frühere vollständige Tests631/631, Browser44/44 und zusätzliche Handyprüfung46/46; Referenzen im Receipt. Unabhängige2P2 gezielt behoben und mit synthetischen echten Handlern nachgeprüft.
