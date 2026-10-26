# GC-EXTENDED-QUESTION-TYPES-01: unabhängige Rechenpfeile

Martin bestätigt die konkrete Fotovorlage und ergänzt pro Pfeil vier Hilfestufen: Rechnung vorgeben, Zeichen vorgeben/Zahl offen, Zeichen auswählen/Zahl offen, gesamte Rechnung frei. Zwei Zahlenspalten, drei Wertezeilen, vier äußere gebogene Pfeile. Alle sechs Zahlengaben einzeln ein-/ausblendbar. Direkter und umgekehrter Dreisatz; keine gemeinsame Operation erzwingen.

Umsetzung im bestehenden localhost8784-Labor, eigener Branch/PR296. Gemeinsamer HTML/SVG-Renderer mit deklarativem Tabellenlayout, feldweise privatem Antwortmodus und 0,5 Punkten pro Eingabe. Keine H5P-Installation, keine neue KI-Pipeline, kein Cloud-/Production-Deploy. Erweiterte Datenverträge in beiden Serverkopien identisch halten. Historische Aufgaben erhalten.

1. Aussagekräftige Fehlerfälle zuerst: gemischte Zahlen/Operationen, getrennte Pfeile, freie und auswählbare Zeichen, umgekehrter Dreisatz, Teilpunkte und öffentliche Lösungsfreiheit.
2. Baustein und Lehrersteuerung implementieren; Beispiele ohne neue Provideraufrufe überarbeiten.
3. Browserdarstellung und Speichern tatsächlich prüfen; unabhängige Prüfung und gezielte Regressionen.
4. Erkenntnisse in vorhandener Lern-/Aufgabenübergabe sichern; überprüften Commit in bestehenden Aufgabenbranch pushen.

Stand vor Browserprüfung: neue Verhaltenstests zuerst rot gesehen und Kern-/Renderprüfungen grün. HTTP-Prüfung benötigt erlaubtes lokales Port-Binding. Fremde Änderungen werden nicht übernommen. Development Status40356354444 erfolgreich; PR310 bleibt separater normaler Testintegrationsowner, lokale Änderungen nicht in dessen Checkout.

Modellwahl: komplexe gemeinsame Darstellung/Datenvertrag/Bewertung; Sol/medium angefordert, beobachtete Laufzeit unknown, keine Modellwechsel oder Provideraufrufe durch diese Änderung. SEC: Lösungsschlüssel bleibt privat, begrenzte Daten und keine Ausdrucksauswertung; PRIV: nur vorhandenes synthetisches lokales Labor.
