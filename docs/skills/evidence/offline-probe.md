# GC-HOOKS-01-SKILLS: Offlineprobe

Die beiden installierten SKILL.md-Dateien und GRADECREW_EXECUTION_SKILLS.md wurden tatsächlich gelesen. Keine Installation, Konfigurations-/Produktänderung, Cloud-, Kundendaten-, Deployment- oder externe API-Nutzung.

## Statischer Rules-Audit

```json
{
  "score": 2,
  "summary": "Erfundene Fixture: major Integritätsfehler, da jeder angemeldete Nutzer fremde displayName-Felder ändern kann. Private email wird durch die gezeigte owner-only Leseregel nicht offengelegt.",
  "findings": [
    {
      "check": "Field-Level vs. Identity-Level Security",
      "severity": "major",
      "issue": "update prüft Anmeldung und betroffene Felder, aber nicht request.auth.uid == uid. Ein fremder Nutzer kann displayName ändern oder entfernen; unveränderte email erfüllt hasOnly weiterhin.",
      "recommendation": "Owner-Prüfung zusätzlich verlangen: request.auth.uid == uid."
    },
    {
      "check": "Type Safety",
      "severity": "minor",
      "issue": "displayName hat keine Typ- oder Pflichtfeldprüfung.",
      "recommendation": "Erforderlichen displayName als string validieren."
    },
    {
      "check": "Storage Abuse",
      "severity": "minor",
      "issue": "Keine anwendungsspezifische Längenbegrenzung für displayName; Firestore-Plattformlimits ersetzen diese nicht.",
      "recommendation": "Begründete maximale Länge prüfen."
    }
  ]
}
```

Prüfgrenzen: Nur die vorgegebene Fixture, kein Repositoryaudit. Keine create/delete-Freigabe gezeigt; weitere überlappende Regeln unbekannt. Keine Emulator-, Syntax-, Runtime-, Cloud- oder Angriffsprüfung. Kein beobachteter PII-Leak. Der Skillscore 2/5 ist kein GradeCrew-Gate.

## Designplan und Briefabgleich

Palette: Ink #173f35, Paper #fffaf0, Accent #d96836; die gewünschte Drei-Farben-Vorgabe gewinnt vor der allgemeinen Skillheuristik 4–6 Farben. Inter/system-ui für alle Rollen. Layout linksbündig: Titel → Erklärung → Beispielsatz mit Wortarten → CTA. Fachlicher Schwerpunkt: Satzzerlegung statt dekorativer Kennzahlen. Tokens und 16px-Radius unverändert; kein Fontdownload. Statisches test-card.html mit Fokus und reduced-motion-Regel erstellt. CTA ist ein Darstellungsbutton ohne Übungslogik.

Selbstkritik aus dem Quelltext: Akzent nur als zusätzliche Unterstreichung, Wortarten auch textlich benannt; flexible Zeilenumbrüche. Render-/Browser-/Geräte-/Accessibilityprüfung bleibt offen, nicht bestanden.

## Hypothetische Zentralenfrage

„Sind diese Skills installiert?“: Eine belastbare Zentralenantwort benötigt den erlaubten API-Beleg skills/list mit Host, Zeitpunkt, enabled/scope und Discovery-Fehlern. Ohne diesen Beleg bleibt der aktuelle Installationsstatus unbestätigt. Daraus folgt keine Shell-, Datei- oder Testaktion.

Modell/Effort: Sol medium angefordert. Tatsächliches Runtime-Modell nicht unabhängig beobachtet.
