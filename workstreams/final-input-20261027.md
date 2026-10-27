# GC-WEB-REPAIR-20261007 / GC-AUDIO-01 — letzte Eingabe- und Layoutkorrektur

Gleiche Task/Chat-ID01a15f06-837c-73b3-93fa-0d07a8104d3a. Nutzer meldet auf iPad durch Bildschirmtastatur verschobene/unlesbare Felder; knappes Wochenbudget und Präsentation morgen. Basis Live ad36780c, main0f123095. Kleine Hosting-Korrektur: Tastatur öffnet natürliche Seitenhöhe statt geschrumpftem festem Raster; aktives Feld bei Bedarf sichtbar scrollen, nach Schließen kompakten Modus wiederherstellen. Mikrofon als44px-Nachbar neben Wunschtext statt Überlagerung. Sichtbare Testsprache. Klarer Erstellen-Button. Rechtliche Links/Meldeoption in einer festen Fußzeile, App-Footer nur während Erstellung ausgeblendet (doppeltes Feedback); sonst unverändert.

Plan: Tastaturzustand Regression rot→kleine Korrektur→Web/Browser und synthetische visualViewport-Fokusprüfung→begrenzte Review/exakteCI/Preview/HostingLive/Receipt. Kein Provideraufruf, keine Backend-/Regel-/Auth-/Quotenänderung, keine andere Umgebung. iPad-Hardwaretest nicht simuliert; reale Abnahme nach Release bleibt offen. Bei Bildschirmtastatur hat erreichbare Eingabe Vorrang vor dem Ein-Seiten-Raster. Alle bestehenden Versuche erhalten.

Historischer Zwischenstand; finaler Hosting-Nachweis unten. Inherited Modell actual unknown, kein Wechsel.

Lokal633/633 Webprüfungen grün;46/46 Browserprüfungen einschließlich Fokus/Schreiben bei synthetisch verkleinertem visualViewport in390×844 und1024×768 sowie Rückkehr zum kompakten Modus. Touch-Eingaben16px verhindern zusätzlich Safari-Autozoom; diese letzte CSS-Regel wird mit demselben Browserlauf nochmals geprüft. Keine Aussage über echte iPad-Tastaturhardware. Weitere Featurearbeit ausgeschlossen.

Visuelle Zusatzkontrolle fing eine durch einzeln platzierte Footer-Gridspalten zusammengedrückte mobile Breite ab, obwohl reine Overflowprüfungen grün waren. Footer nun in gemeinsamem neutralem Wrapper (außerhalb Erstellung display:contents), Erstellung explizit eine volle Gridspalte. Regression prüft zusätzlich volle Body-/Ansichtsbreite;633Web und46Browser grün. Finales WebKit-Handybild geprüft: volle Breite, lesbare Überschrift/Testsprache, separater Mikrofonknopf und gemeinsame Rechtszeile. Platzhalter gezielt gekürzt. Keine Liveübernahme des verworfenen7d96de0-Vorschaukandidaten.

## Finaler Hosting-Nachweis

{
  "source_commit": "f033f901080b91ef66b8e14e4dba94956ac396b1",
  "tree": "c097c60c4a8b6b134c2c6d6dd49bd69da7ab1d2e",
  "pr": 352,
  "scope": "Hosting-only final input visibility, microphone, language/action labels and aligned legal footer",
  "ci": {
    "run": 40589118100,
    "conclusion": "success",
    "local_checks": 633,
    "browser_checks": 46,
    "keyboard_proof": "synthetic visualViewport at390x844 and1024x768; input focus and visibility plus dismissal restoration",
    "review": "no concrete P1/P2 in keyboard/microphone diff;28 targeted regressions green; final footer width corrected and explicit width regressions passed"
  },
  "hosting": {
    "project": "hausaufgabe-staging",
    "version": "7395a9f6257a8772",
    "release_time": "2026-10-27T21:46:27.482Z",
    "origins": [
      {
        "origin": "https://gradecrew.de",
        "commit": "f033f901080b91ef66b8e14e4dba94956ac396b1",
        "files": 206,
        "verified": 206,
        "failed": []
      },
      {
        "origin": "https://hausaufgabe-staging.web.app",
        "commit": "f033f901080b91ef66b8e14e4dba94956ac396b1",
        "files": 206,
        "verified": 206,
        "failed": []
      }
    ]
  },
  "backend_changed": false,
  "rules_changed": false,
  "auth_changed": false,
  "limits_changed": false,
  "paid_provider_calls": 0,
  "user_device_acceptance": "physical iPad keyboard pending",
  "superseded_preview_source": "7d96de0636d1ede45679fc33e75be77c163f06e1; never live"
}

633 lokale Prüfungen und46 Browserprüfungen grün, einschließlich synthetischem visualViewport bei Handy/iPad-Größe und Rückkehr nach Fokusende. Physischer iPad-Tastaturtest bleibt offen. Tastatureingabe nutzt bedienbares Scrollen statt abgeschnittener Ein-Seiten-Fläche. Keine Backend-/Regel-/Auth-/Quotaänderung oder andere Umgebung.
