# Designanalyse: Testify und die 100 meistbesuchten Websites

Stand: 26. September 2026. Vergleichsmenge: Similarweb, *Top 100 Most Visited Websites Worldwide*, Daten für August 2026. Die Liste zählt Website-Besuche auf Desktop und mobilem Web; App-Nutzung ist nicht enthalten. Reichweite ist **kein** Qualitätsurteil über Design, Datenschutz oder Zugänglichkeit. Andere Messanbieter können andere Zahlen melden.

## Methode und Grenzen

1. Alle 100 Domains der aktuellen Rangliste inventarisiert und nach ihrer hauptsächlichen Aufgabe gruppiert (Tabelle unten). Die Zuordnung ist eine redaktionelle Näherung; gemischte Portale können mehrere Rollen erfüllen.
2. Die für Testify relevanten Muster nach **Nutzeraufgabe** übertragen: schneller Einstieg, Suche und Wiederfinden, Bearbeitung, eindeutige Fortschrittsanzeige, zweitrangige Aktionen und einfache Fehlerrückkehr. Die öffentlichen Einstiege von Google, Wikipedia, Canva und GitHub wurden direkt im Browser angesehen. Aussagen zu ChatGPT, Amazon und Booking sind **Transferhypothesen aus den Produkttypen**, keine Behauptung, deren angemeldete Flows oder alle 100 Designs durchgetestet zu haben.
3. Testifys öffentliche Staging-Startansicht visuell geprüft; die restlichen Flows im Quellcode überprüft. Vorher auffällig: schlechter Kontrast des „Testcode“-Labels auf Blau, viel ungenutzter Platz, gleich gewichtete Aktionen auf Testkarten, sehr langer KI-Erstellungsbereich mit doppelten Bildoptionen. Der neue lokale Entwurf konnte in der Cloud-Browser-Umgebung nicht gerendert werden; visuelle Prüfung nach dem Staging-Deployment bleibt notwendig.
4. Entscheidungen gegen Nielsen Normans zehn Usability-Heuristiken, progressive Offenlegung und WCAG 2.2 abgeglichen. Eine formale Usability-Studie oder WCAG-Zertifizierung wurde nicht durchgeführt.

## Was für Testify übertragbar ist

| Nutzerziel | Bewertung für Testify | Konkrete Umsetzung |
| --- | --- | --- |
| Sofort beginnen | Sehr wichtig | Schülercode und Lehrer-Login als getrennte Wege, sichtbare Beschriftungen, eine Hauptaktion je Weg. |
| Schnell wiederfinden | Sehr wichtig | Suche/Filter mit sichtbarer Trefferzahl und einem Knopf zum Zurücksetzen. |
| Ohne Ablenkung arbeiten | Sehr wichtig | Bearbeiten bzw. Ergebnisse als Hauptaktion einer Testkarte, seltene Aktionen in „Weitere Aktionen“. |
| Orientierung bei langen Vorgängen | Sehr wichtig | KI-Erstellung in zwei klar benannte Abschnitte, Fortschritt mit Status und Rückkehr über „Meine Tests“. |
| Eindeutige Eingaben | Sehr wichtig | Nur noch eine Bildvorgabe für die Fragestellung; Textantworten bleiben eindeutig lesbar. |
| Fehler erkennen und beheben | Sehr wichtig | Bestehende persistente Fehlermeldungen, konkrete Hinweise an Feldern, erhaltener lokaler Entwurf. |
| Plattformstil kopieren | Gering | Fremde Markenlayouts, Rankings und Dark Patterns sind keine Designvorgabe. |

Die Schlussfolgerungen sind aus Testifys Aufgaben und den unten verlinkten UX-Prinzipien abgeleitet. Dass eine Website stark besucht wird, beweist keinen kausalen Designvorteil.

## Direkt beobachtete Muster und Grenzen

| Öffentlicher Einstieg | Konkrete Beobachtung | Übertrag auf Testify | Grenze |
| --- | --- | --- | --- |
| Google | Die zentrale Suche bestimmt den Einstieg; zusätzliche Dienste stehen abseits. | Suchfeld und Trefferzahl auf „Meine Tests“ klar hervorheben. | Eine Lehrkraft braucht daneben Teststatus und Bearbeitung. |
| Wikipedia | Suche und Sprachauswahl bieten klare Wege zu einem Inhalt. | Fachbegriffe verständlich beschriften und den gewünschten Test schnell auffindbar machen. | Langes Lesen ist nicht Testifys Hauptaufgabe. |
| Canva | Eine Frage im großen Titel und „Start designing“ als zentrale Aktion; Produktdetails folgen weiter unten. | Erstellungswege mit sprechenden Verben und eindeutigem Einstieg zeigen. | Der Canva-Editor hinter Login wurde nicht untersucht. |
| GitHub | Oben Suche/Navigation, ein klarer Einstieg und ein Link zum Inhalt für Tastaturnutzung. | Skip-Link, sichtbarer Fokus und aufgeräumte Navigation. | Öffentliche Marketingseite und angemeldete Projektansicht sind verschieden. |

Die Übertragung ist eine **Gestaltungsentscheidung**, keine Aussage darüber, dass eine einzelne Oberfläche nachweislich erfolgreicher ist. Von den 100 Domains wurden vier öffentliche Einstiege direkt betrachtet; die übrigen 96 wurden für das vollständige Inventar und die Produkttypen ausgewertet.

## Prüfung vor einer breiten Freigabe

| Aufgabe | Beobachtbares Ziel auf Staging |
| --- | --- |
| Schülerin oder Schüler öffnet einen Test | Ohne Erklärung im ersten Versuch Codefeld und Startaktion finden; Testcode und Fehlermeldung auf Mobilgerät lesbar. |
| Lehrkraft findet einen Entwurf | Über Suche oder Statusfilter in wenigen Schritten finden und nach „Keine passenden Tests“ den Filter zurücksetzen. |
| Lehrkraft erstellt einen KI-Test | Gewünschte Aufgabenanzahl und höchstens fünf Bilder in Fragestellungen wählen; Kostenhinweis vor dem Start sehen; Fortschritt nach erneutem Aufruf unter „Meine Tests“ finden. |
| Lehrkraft bearbeitet einen Test | Primäraktion auf Testkarte und Save-Status erkennen; weitere Aktionen bei Bedarf auffinden. |
| Technische Prüfung | Tastatur, 320/390/768/1440-Pixel-Layouts, Kontrast, Fehlermeldungen und vorhandene Bildaufgaben visuell kontrollieren; reale Core Web Vitals und Fehlerrate über Nutzung messen. |

Erst Nutzertests mit Lehrkräften und Lernenden sowie Feldmessungen können belegen, wie gut diese Ziele tatsächlich erreicht werden. Eine Platzierung unter den „100 besten Websites“ lässt sich aus einer Traffic-Rangliste nicht ableiten.

## Gestaltungsregeln für weitere Arbeiten

- **Klarheit vor Dichte:** pro Karte eine wichtigste Aktion; weitere Aktionen auffindbar, aber nachrangig.
- **Status sichtbar:** Speichern, KI-Fortschritt, veröffentlichter Zustand, Suche und Fehler dürfen keine Ratespiele sein.
- **Lesbarkeit:** konstante Typografie und Abstände, sichtbare Feldbezeichnungen, Kontraste prüfen.
- **Zugänglichkeit:** sichtbarer Tastaturfokus; Ziele mindestens 24 × 24 CSS-Pixel oder ausreichender Abstand, vorzugsweise 44 Pixel bei Hauptaktionen; reduzierte Bewegung berücksichtigen.
- **Schnelligkeit:** keine externe Schriftbibliothek oder dekorative Bilder für die Oberfläche; bei echter Nutzung LCP, INP und CLS getrennt für Mobil/Desktop messen.
- **Ruhige Sprache:** Lehrkräfte sollen schnell eine Entscheidung treffen können; Kostenhinweis vor KI-Erstellung und keine technischen Details im Schülerablauf.

## Inventar der 100 Domains

| Rang | Domain | Besuche im August 2026 | Hauptrolle (grobe Einordnung) |
| ---: | --- | ---: | --- |
| 1 | google.com | 86.6B | Suche & Portale |
| 2 | youtube.com | 30.4B | Medien & Wissen |
| 3 | facebook.com | 11.5B | Soziale Netzwerke & Community |
| 4 | instagram.com | 7.6B | Soziale Netzwerke & Community |
| 5 | chatgpt.com | 5.6B | KI-Werkzeuge |
| 6 | x.com | 4.6B | Soziale Netzwerke & Community |
| 7 | reddit.com | 4.2B | Soziale Netzwerke & Community |
| 8 | bing.com | 3.8B | Suche & Portale |
| 9 | tiktok.com | 3.8B | Soziale Netzwerke & Community |
| 10 | whatsapp.com | 3.7B | Soziale Netzwerke & Community |
| 11 | wikipedia.org | 3.5B | Medien & Wissen |
| 12 | yahoo.co.jp | 2.9B | Suche & Portale |
| 13 | amazon.com | 2.8B | Handel & Dienste |
| 14 | yahoo.com | 2.7B | Suche & Portale |
| 15 | yandex.ru | 2.7B | Suche & Portale |
| 16 | gemini.google.com | 2.6B | KI-Werkzeuge |
| 17 | linkedin.com | 2.0B | Soziale Netzwerke & Community |
| 18 | baidu.com | 1.8B | Suche & Portale |
| 19 | netflix.com | 1.6B | Medien & Wissen |
| 20 | pinterest.com | 1.6B | Soziale Netzwerke & Community |
| 21 | naver.com | 1.6B | Suche & Portale |
| 22 | cloud.microsoft | 1.5B | Arbeit & Technik |
| 23 | live.com | 1.3B | Arbeit & Technik |
| 24 | bilibili.com | 1.3B | Medien & Wissen |
| 25 | pornhub.com | 1.3B | Adult-/Glücksspielangebote |
| 26 | temu.com | 1.2B | Handel & Dienste |
| 27 | xhamster.com | 1.2B | Adult-/Glücksspielangebote |
| 28 | twitch.tv | 1.2B | Medien & Wissen |
| 29 | dzen.ru | 1.2B | Medien & Wissen |
| 30 | bet.br | 1.2B | Adult-/Glücksspielangebote |
| 31 | microsoft.com | 1.1B | Arbeit & Technik |
| 32 | weather.com | 1.1B | Medien & Wissen |
| 33 | vk.ru | 1.0B | Soziale Netzwerke & Community |
| 34 | xvideos.com | 956.4M | Adult-/Glücksspielangebote |
| 35 | claude.ai | 950.2M | KI-Werkzeuge |
| 36 | canva.com | 863.7M | Arbeit & Technik |
| 37 | samsung.com | 816.9M | Arbeit & Technik |
| 38 | fandom.com | 814.6M | Medien & Wissen |
| 39 | news.yahoo.co.jp | 793.9M | Medien & Wissen |
| 40 | stripchat.com | 743.6M | Adult-/Glücksspielangebote |
| 41 | duckduckgo.com | 699.1M | Suche & Portale |
| 42 | mail.ru | 697.5M | Suche & Portale |
| 43 | globo.com | 694.6M | Medien & Wissen |
| 44 | booking.com | 693.9M | Handel & Dienste |
| 45 | t.me | 674.3M | Soziale Netzwerke & Community |
| 46 | ebay.com | 670.0M | Handel & Dienste |
| 47 | brave.com | 666.3M | Suche & Portale |
| 48 | discord.com | 665.6M | Soziale Netzwerke & Community |
| 49 | imdb.com | 664.3M | Medien & Wissen |
| 50 | github.com | 649.3M | Arbeit & Technik |
| 51 | xhamster46.desi | 636.0M | Adult-/Glücksspielangebote |
| 52 | eporner.com | 627.6M | Adult-/Glücksspielangebote |
| 53 | nytimes.com | 618.9M | Medien & Wissen |
| 54 | aliexpress.com | 601.7M | Handel & Dienste |
| 55 | ozon.ru | 600.7M | Handel & Dienste |
| 56 | apple.com | 597.6M | Arbeit & Technik |
| 57 | roblox.com | 591.0M | Medien & Wissen |
| 58 | spotify.com | 588.1M | Medien & Wissen |
| 59 | walmart.com | 581.7M | Handel & Dienste |
| 60 | amazon.in | 552.7M | Handel & Dienste |
| 61 | xnxx.com | 546.2M | Adult-/Glücksspielangebote |
| 62 | zoom.us | 539.2M | Arbeit & Technik |
| 63 | espn.com | 518.7M | Medien & Wissen |
| 64 | bbc.co.uk | 500.2M | Medien & Wissen |
| 65 | docomo.ne.jp | 495.9M | Handel & Dienste |
| 66 | threads.com | 482.5M | Soziale Netzwerke & Community |
| 67 | amazon.co.jp | 479.4M | Handel & Dienste |
| 68 | paypal.com | 472.4M | Handel & Dienste |
| 69 | disneyplus.com | 466.5M | Medien & Wissen |
| 70 | etsy.com | 465.9M | Handel & Dienste |
| 71 | office.com | 450.1M | Arbeit & Technik |
| 72 | indeed.com | 443.6M | Handel & Dienste |
| 73 | adobe.com | 433.9M | Arbeit & Technik |
| 74 | ya.ru | 433.4M | Suche & Portale |
| 75 | bbc.com | 429.5M | Medien & Wissen |
| 76 | chaturbate.com | 426.6M | Adult-/Glücksspielangebote |
| 77 | music.youtube.com | 426.6M | Medien & Wissen |
| 78 | amazon.de | 423.4M | Handel & Dienste |
| 79 | msn.com | 411.9M | Medien & Wissen |
| 80 | rm358.com | 398.8M | Andere / unklar |
| 81 | rakuten.co.jp | 386.5M | Handel & Dienste |
| 82 | onlyfans.com | 378.7M | Adult-/Glücksspielangebote |
| 83 | telegram.org | 378.5M | Soziale Netzwerke & Community |
| 84 | ok.ru | 369.2M | Soziale Netzwerke & Community |
| 85 | hbomax.com | 368.5M | Medien & Wissen |
| 86 | zillow.com | 360.8M | Handel & Dienste |
| 87 | douyin.com | 356.9M | Medien & Wissen |
| 88 | vkvideo.ru | 356.1M | Medien & Wissen |
| 89 | deepseek.com | 353.8M | KI-Werkzeuge |
| 90 | usps.com | 352.9M | Handel & Dienste |
| 91 | erome.com | 351.7M | Adult-/Glücksspielangebote |
| 92 | amazon.co.uk | 350.0M | Handel & Dienste |
| 93 | auone.jp | 345.4M | Suche & Portale |
| 94 | namu.wiki | 330.0M | Medien & Wissen |
| 95 | qq.com | 329.8M | Soziale Netzwerke & Community |
| 96 | dcinside.com | 326.2M | Soziale Netzwerke & Community |
| 97 | shop.app | 325.1M | Handel & Dienste |
| 98 | avito.ru | 323.8M | Handel & Dienste |
| 99 | marca.com | 320.8M | Medien & Wissen |
| 100 | primevideo.com | 319.0M | Medien & Wissen |

Gruppierung:

| Hauptrolle | Anzahl |
| --- | ---: |
| Suche & Portale | 12 |
| KI-Werkzeuge | 4 |
| Soziale Netzwerke & Community | 16 |
| Medien & Wissen | 26 |
| Handel & Dienste | 20 |
| Arbeit & Technik | 10 |
| Adult-/Glücksspielangebote | 11 |
| Andere / unklar | 1 |

## Quellen

- Similarweb, Top-100-Liste und Methodik: https://www.similarweb.com/blog/research/market-research/most-visited-websites/
- Nielsen Norman Group, zehn Usability-Heuristiken: https://www.nngroup.com/articles/ten-usability-heuristics/
- Nielsen Norman Group, progressive Offenlegung: https://www.nngroup.com/articles/progressive-disclosure/
- W3C, WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Google web.dev, Core Web Vitals: https://web.dev/articles/vitals
