# Spec-Probe PR191

Task `GC-POCOCK-IMPLEMENT-01-SKILLS`; unabhängige **Spec-Achse**, mit `gradecrew-review-retro` und `references/review-record.md`. Gegenstand: PR191, Basis `c3a5fdcfb949bc0de23295a549388c23cf7655e6`, Head `bb1c6bee97ee42fe3981905d9c89123dc96d26bf`. Angefordert Sol/medium; tatsächlich beobachtetes Modell/Aufwand und Kosten unbekannt. Keine Standards-/Security-Gesamtprüfung oder Freigabe.

Kriterienquelle: `probe-input/pr191.json`, Feld body, ist **Autorenabsicht**. Die Übergabe `workstreams/gc-launch-privacy-audit-20261010.md:3–7` berichtet Parentauftrag/Settingsbestätigung; ein ursprünglicher menschlicher Auftrag mit vollständigen Abnahmekriterien liegt hier nicht vor. Daher keine Behauptung vollständiger Originalspec-Erfüllung.

Dateiangaben beziehen sich auf PR-Dateien. `pr191-labelled.diff` bestätigt die Dateizuordnung; `Diff:…` bezeichnet ergänzend Zeilen des ursprünglichen `pr191.diff`. Nachgereicht und selbst gelesen: Account-Auszug (Blob `fbcd5d10…`), Backendhelper (`3b53382d…`) und Callable-Auszug (`69d511c4…`), laut Koordinator am erneut identisch bestätigten Head.

| Kriterium aus Autorenabsicht | Status und eigener Quellenbeleg | Grenze/Implikation |
|---|---|---|
| Einstellungen außerhalb Chat; bewusstes Lesen | Erfüllt statisch: `index.html:291/570` (Diff:514/522); `coco-account-privacy.mjs:42–50,75–78` | Installation liest nicht automatisch; echter Settings-/SDK-Einstieg nicht ausgeführt. |
| Zweistufiger Reset über bestehenden Endpoint | Erfüllt statisch: Modul:54–65,77; Tests:18; `functions/lib/coco-support.js:23–38`; `functions/main.js:248–255` | Callable bindet Speicher an UID aus `requireAiUser`, verlangt identische accountId; Clear leert transaktional und erhöht generation. |
| Kontowechsel invalidiert verspätete Ergebnisse | Erfüllt statisch: Modul:20–29,48,61,65; `app.js:1173–1195`; Tests:19–21 | Tatsächlicher UID-Wechsel emittiert synchron das abonnierte Ereignis; Token verhindert A→B→A-Altergebnisse. End-to-End offen. |
| Unklarer Reset verlangt erneutes Lesen | Erfüllt statisch: Modul:69–70; Test:22 | `loadedUid` wird verworfen, Reset gesperrt, Read erlaubt. |
| Reload transparent; Hintergrundmemory bleibt | Erfüllt statisch: Modul:11–12,67–72; `functions/main.js:305–307` | Kein automatischer Reload; Memorykontext mit bis zu zwölf Nachrichten vor Crew-Verzweigung belegt. Provider-/Runtimefluss nicht ausgeführt. |
| Copy verspricht nur keine kopierten Abgaben | Erfüllt statisch: `index.html:143` (Diff:505–506) | Enthält ausdrückliche Warnung vor Personenangaben im kopierten Inhalt. |
| PRIV01–20, Games/iPad und fehlende externe Fakten dokumentieren | Erfüllt als Dokumentationsumfang: Audit:49–91 (Diff:152–195) | Alle 20 IDs und acht Faktengruppen vorhanden; kein Nachweis ihrer materiellen Erfüllung. |
| Buildliste; begrenzter Scope | Erfüllt statisch: `tools/build-staging.mjs:15`; Diffumfang | Kein erkennbarer unerbetener Runtimeumbau. Vollständige Originalfreigabe fehlt. |

**Befund:** Kein konkretes falsches/fehlendes Verhalten gegen die belegte Autorenabsicht gefunden; fehlende Originalkriterien und Runtimebelege begrenzen diese Aussage. Testquellen wurden gelesen, **keine Tests ausgeführt**. Historische 19 Tests/Build/Chrome-Simulation sind autorberichtete Evidenz; Übergabe:13 nennt außerdem einen älteren Kandidatencommit. Daraus folgt kein eigener Testnachweis für diesen Head. Geräte, echte API-/Netzwerkflüsse, Rechts-/Vertrags-/Provider-/Retentionfakten bleiben ungeprüft; keine Rechtsbewertung.

**Ein nächster Owner-Schritt:** Integrationsowner ergänzt zum exakten Head den ursprünglichen freigegebenen Auftrag und die verbleibenden Runtimebelege in der bestehenden PR191-Übergabe.
