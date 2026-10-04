# GradeCrew – Startscreen Masterpiece v3 / Multi-KI

- Task: GC-DESIGN-04
- Guardian queue id: `startscreen-masterpiece-v3-20261004`
- Datum: 04.10.2026
- Basis: `feature/gradecrew-app-integration@9559f7420aca9b62e45629e6bec02220006e6e88`
- Production: unverändert

## Warum v3

Der erste große v2-Guardian-Auftrag erreichte GPT-6.1 Sol, verlor aber nach dem früheren synchronen 240-Sekunden-HTTP-Limit das eindeutige Provider-Ergebnis. Es entstand kein Kandidat; Publish, Tests und Reviews liefen nicht. Der v2-Versuch bleibt unverändert im Ledger und wird nicht zurückgesetzt oder wiederholt.

PR #105 hat die Ursache strukturell beseitigt: OpenAI-Reasoning läuft jetzt als Background Response und wird über dieselbe Response-ID abgeholt. Der kleine echte Guardian-Pilot hat zuvor Builder + GPT-6 Astra + Claude Sonnet 5.5 + GPT-6 Sol + Integration + Staging bereits real bestätigt.

## Internationalisierung

Vor v3 wurde PR #108 in den Web-Integrationsbranch gemergt. Der gesamte Public Entry besitzt jetzt DE/EN-UI-Abdeckung über die bereits vorhandene Browser-i18n-Grenze.

Produktregel:
- UI-Sprache darf wechseln;
- Test-/Aufgabensprache bleibt unabhängig;
- Bewertungssprache bleibt unabhängig;
- v3 darf keine sichtbaren Wörter über CSS-Pseudoelemente oder Hintergrundgrafiken hinzufügen.

Der KI-Designauftrag darf deshalb nur `gradecrew-auth-startscreen.css` ändern. Markup und i18n-Katalog bleiben für diesen Durchlauf read-only.

## Ziel

Der jetzige funktionale Startscreen soll von „sauberer CSS-Rohbau“ zu einer hochwertigen GradeCrew-Markenhomepage werden:
- Coco als klarer Gastgeber im Vordergrund;
- Remy, Emmi und Wilma als zusammenhängende Crew;
- mehr Licht, Raumtiefe und warme Schulatmosphäre;
- weniger flache/geometrische CSS-Möbel;
- ruhige Premium-Hierarchie;
- keine Überschneidungen zwischen Figuren, Rollen, CTA, Schülerleiste und Benefits;
- echte responsive Neukomposition auf iPad und Smartphone.

## Multi-KI-Gate

1. GPT-6.1 Sol baut genau einen CSS-Kandidaten.
2. Combined Web Validation prüft den exakten Kandidaten.
3. GPT-6 Astra prüft Korrektheit/Auftragstreue.
4. Claude Sonnet 5.5 prüft Produkt-/Sicherheitsgrenzen.
5. GPT-6 Sol prüft QA/Nutzerfluss.
6. Nur bei drei Freigaben wird in `feature/gradecrew-app-integration` integriert.
7. Staging-Preview wird technisch belegt.
8. Martin macht die echte visuelle Desktop/iPad/Phone-Abnahme.
9. Production bleibt gesperrt.

## Budget

`module-web-v1`:
- max. 2,40 USD Reservat für diesen einen v3-Versuch;
- Task-Cap 2,55 USD;
- keine automatische Modell-/Budgeterhöhung;
- der alte v2-Reservat bleibt historisch bestehen und wird nicht umgebucht.

## Status

- Background-Responses-Fix auf main: integriert
- Startscreen DE/EN-Abdeckung: integriert und AI Staging Checks grün
- v3 Task + explizite Policy: auf Aufgabenbranch
- PR/Guardian-Prüfung: offen
- bezahlter v3-Modellaufruf: noch nicht
- neuer Kandidat: noch nicht
- Staging: noch nicht
- Production: UNVERÄNDERT
