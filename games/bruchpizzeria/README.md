# Bruchpizzeria

GC-GAMES-PIZZA-01: erster isolierter Browser-Pilot. Eine Küche, vier freundliche Bestellungen, Hälften/Viertel und selbst gesetzte Schnitte. Synthetische lokale Übungsinhalte, keine GradeCrew-Anmeldung oder verbindliche Bewertung.

## Start und Prüfungen

Node 24 und pnpm 11.25.0 verwenden:

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm test
pnpm build
pnpm start
```

Danach http://127.0.0.1:4187 öffnen. Der statische Build liegt unter dist; Phaser und seine MIT-Lizenz werden mitkopiert. Keine externen Laufzeit-Assets, keine Provideraufrufe.

Browser-Test: Playwright muss verfügbar sein. Auf dem Codex-Rechner kann PLAYWRIGHT_PACKAGE_PATH auf dessen gebündeltes Playwright zeigen. PIZZA_BROWSER_CHANNEL=chrome nutzt eine vorhandene Chrome-Installation; ohne Channel verwenden wir das Playwright-Chromium.

```sh
node tests/browser.cjs
```

Die lokale Vorschau ist kein Hosting-Deploy. Prüfungen auf echtem iPad, visuelle/spielerische Nutzerabnahme und ein konkret benannter Lehrplan bleiben offen.

## Bedienung

In der Küche tippen/klicken oder WASD/Pfeiltasten benutzen. An einer Station E drücken; alternativ die großen Stationsbuttons verwenden. Am Brett eine lange Schnittlinie ziehen, dann Stücke auswählen und auf den Teller legen. Für Tastaturbedienung den Schnittwinkel mit Pfeiltasten wählen und „Schnitt setzen“ drücken. Stücke mit Tab und Enter/Leertaste auswählen. Am Tresen den passenden Gast anklicken.

Fortschritt wird auf diesem Gerät gespeichert; blockierter Speicher wird angezeigt. Hilfe, Hintergrundpause und manuelle Pause stoppen die Geduld. Bei Null Geduld bleiben Gäste freundlich und die Aufgabe lösbar. Mathematisch falsche Portionen werden nicht gewertet; Restaurantleistung wird in diesem ersten Pilot nur über die Geduldsanzeige dargestellt.

PLAN.md, ART_DIRECTION.md und HANDOFF.md unter production halten Scope, Entscheidungen und Nachweise fest. Alle Figuren und Küchenobjekte wurden als eigene Vektorzeichnungen im Code erstellt; die Nutzerbilder dienen nur als Referenz.
