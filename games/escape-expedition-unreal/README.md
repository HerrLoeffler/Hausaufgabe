# Das verschwundene Leuchtfeuer – lokale Unreal-Fassung

Doppelklick auf **Expedition starten.command**. Das Spiel nutzt das installierte Unreal5.8 auf diesem Mac und öffnet ein Standalone-Spiel; du musst den Editor nicht bedienen. Noch kein unabhängig gepacktes Mac-/iOS-/Android-Appartefakt.

Auf dem Startbildschirm **Neue Expedition starten** wählen. Sprich zuerst mit Mara auf dem Dorfplatz. Der aktuelle nächste Schritt steht oben; in der Nähe eines Ziels erscheint genau ein Interaktionsknopf.

WASD oder Pfeile bewegen. **E** untersucht das angezeigte Ziel; **I** öffnet den Rucksack, **Esc** schließt einen Dialog beziehungsweise öffnet das Pausenmenü. Antworten auswählen und ausdrücklich **Prüfen** drücken. **1–4** wählen Antworten, **Enter** bestätigt. Mausbuttons sind echte native Slate-Widgets; die Richtungstasten unten links sind auch als Touchflächen angelegt. Ein physischer Mobiletest und ein vollständiger echter OS-Maustest sind noch offen.

Vier zusammenhängende Gebiete: Küstenort, Garten/Wald, Strand/Steg und Ruine. Zwölf Hauptstationen: sieben Mathefragen und fünf Logik-/Inventarrätsel. Das Ziel bleibt ungefähr zehn Minuten; eine real gemessene Erstspielzeit liegt noch nicht vor. Es gibt keinen Countdown und falsche Einsätze verbrauchen keine Gegenstände.

Die **Lehrkraft-Vorschau** zeigt die sieben tatsächlich verwendeten Beispielaufgaben samt Lösungen. Dieses lokale Paket enthält Prozentrechnung, Brüche und Mengen. Promptgenerierung, Anmeldung und serverseitige GradeCrew-Übungsbewertung sind noch nicht angebunden; dies ist eindeutig die lokale Mathe-Demo.

## Speichern und Wiederherstellen

Spielstände werden nach Lern-/Rätselschritten und beim Gehen regelmäßig lokal unter Saved/SaveGames/ gespeichert. Die neue Episode verwendet **ExpeditionMasterV1**; die abgelehnte alte Amazonas-Fassung hatte ExpeditionDemo und wird nicht umgedeutet. Testläufe verwenden einen separaten Slot und löschen nur ihren eigenen Testsave.

Quellen liegen in Source/, eigener Asset-/Kartengenerator in Tools/create_world.py. Content/, Binaries/ und Intermediate/ sind lokale erzeugte Unreal-Dateien. Quellcode, Generator, Spielbuch und Prüfbelege werden im bestehenden Aufgabenbranch und PR171 gesichert. Native PNG-Screenshots liegen lokal unter Reports/Mastergame/; sie sind aus dem Code und Automationstest wieder erzeugbar.

## Prüfstand

25 frühere Regelprüfungen plus63neue Episoden-/Eingabeprüfungen bestanden. GradeCrew.Expedition.MasterRoute läuft nativ mit kompletter Folge, Dialog-/Menürückkehr, vier Slate-Pfeilrichtungen, gehaltenen Wiederholsignalen, Transfertexten, Save-Restore/ungültigem Save, Kollision und verbundenem Wegenetz; null Fehler/Warnings im zuletzt geprüften Stand. Diese Automationen rufen teilweise die Spielaktionen direkt auf und ersetzen keinen beobachteten Zehn-Minuten-Durchlauf oder echten OS-Maustest.

Gerenderte Dorf-, Ruinen- und Fragedialogbilder geprüft. Vorprüfung fand abgeschnittenen Text; feste Umbrüche und zweispaltige Auswahl korrigieren das. Unabhängiger Code-Review und RED/GREEN-Korrekturen: Production/MASTER_REVIEW.md. Aktuelle Übergabe: Production/HANDOFF.md. Stufe branch_only; kein Web-/Staging-/Production-Deploy.
