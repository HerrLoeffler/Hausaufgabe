# Lokale Workspace-Vorschau (GC-WEB-REPAIR-20261007)

Repo-Root auf localhost ausliefern, z.B. `python3 -m http.server 8765 --bind 127.0.0.1`; dann http://127.0.0.1:8765/tools/ui/workspace-preview.html öffnen. Base-URL zeigt auf den Repo-Root. Nur lokale Dateien werden gelesen; kein Firebase-SDK, Login, Provider oder app.js-Top-Level wird ausgeführt. Die Seite verweigert Nicht-localhost-Hosts und die CSP erlaubt nur lokale Verbindungen.

Styles werden aus aktuellem index.html plus der Startup-Styles-Liste gelesen; die neue Workspace-CSS kommt zuletzt. Dashboard-DOM und echte render/filter-Funktionen stammen aus dem aktuellen lokalen Code, wie bei den JSDOM-Tests. Beispieldaten sind explizit fiktiv. Aktionshandler protokollieren nur oben und ersetzen keine realen Backendtests. Keine vorgetäuschte Authentifizierung.

Oben: gemischter Bestand mit langen Titeln/laufendem und fehlerhaftem Auftrag/Prüfentwurf, leer, keine Treffer oder Laden auswählen; Deutsch/English umschalten; Coco erneut ansehen. Bestehende Suche/Status/Sortierung und Details sind interaktiv. Für Mobil 360/390/768px, Desktop 1280/1536px prüfen. Browser-/OS-Bewegungsreduktion wirkt auf die echte SVG-Mediaquery. Die vereinfachte Coco-Vektorfigur winkt mit einem eigenen Flügel und blinzelt; Fotofiguren bleiben unverändert.

Diese drei Dateien sind ausschließlich unter tools/ui. tools/build-staging.mjs kopiert eine explizite App-Allowlist und assets/gradecrew/*.svg; keine tools/ui-Datei ist darin aufgeführt. Nicht in diese Hosting-Allowlist aufnehmen oder aus der App verlinken. Nur der echte Coco-SVG ist ein App-Asset. Keine Browser-/Geräteabnahme aus Syntaxprüfung ableiten.
