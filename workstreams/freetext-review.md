# Freitext-Review / manuelle Lehrerprüfung

Stand: 01.10.2026. Zentrale Einordnung des bestehenden Freitext-Branches.

- Registry-ID: `freetext-review`
- Primärer Branch: `feature/freetext-review-priority`
- Verifizierte Branchspitze: `67dacb0e5fd1e2371ecbf142de37703e3b2ba1f7`
- Integrationsziel: `feature/gradecrew-app-integration`
- Zentrale Task-ID: `GC-FREETEXT-01`
- Branch-eigene Übergabe: `FREETEXT_REVIEW_STATUS.md` auf dem Feature-Branch

## Bedeutung

Dieser Branch enthält gegenüber `fix/ai-review-workflow` weitere, umfangreiche Arbeit und eine aktuelle Freitext-Übergabe. Er berührt aber zusätzlich viele andere Produktbereiche. Deshalb darf er nicht pauschal als neue Gesamtbasis oder als bereits integrierter Stand behandelt werden.

## Startregel

Bei Freitext-/Lösungsvorschlags-/manueller Bewertungsarbeit zuerst:
1. `FREETEXT_REVIEW_STATUS.md` und aktuelle Branchspitze lesen;
2. offenen PR und betroffene Dateien prüfen;
3. gegen `feature/gradecrew-app-integration`, KI-Qualitäts- und Security-Workstream vergleichen;
4. nur den konkret benötigten Teil integrieren oder auf diesem Branch fortsetzen.

## Offen

- branch-eigene Tests und Security-Regeln gegen heutigen Integrationsstand verifizieren;
- Zusammenhang zwischen erwartbarer Lösung, KI-Vorschlag und zwingender Lehrerprüfung sauber erhalten;
- Integrationsumfang ausdrücklich festlegen, statt den gesamten historischen Branch ungeprüft zu mergen.
