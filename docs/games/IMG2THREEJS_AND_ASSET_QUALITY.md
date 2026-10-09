# img2threejs und Assetqualität für GradeCrew-Spiele

Stand: 09.10.2026 · Task GC-IMG2THREEJS-01.

## Verbindlicher Einstieg für jeden Spielechat

Bei neuen oder überarbeiteten 3D-Objekten, Figuren und bildgestützten Modellrekonstruktionen diese Anleitung lesen und img2threejs auf Eignung prüfen. Für passende Aufgaben den vorhandenen Skill tatsächlich lesen und ausführen. Die Übergabe muss den gelesenen Skill-Pfad und die ausgeführten Schritte mit Ergebnisdateien nennen. Ein bloßer Hinweis „Werkzeug vorhanden“ reicht nicht. Bei ungeeigneten Aufgaben eine kurze fachliche Begründung und den verwendeten anderen Weg dokumentieren.

Diese Regel ergänzt die vorhandene Spieleproduktion; sie ist kein Auftrag für einen Enginewechsel, eine erneute Installation oder eine Übernahme fremder laufender Artarbeit. Reine 2D-, UI-, Lernlogik- oder Serveraufgaben benötigen keine 3D-Rekonstruktion. Die ausführlichen Produktionsregeln in [PR153](https://github.com/HerrLoeffler/Hausaufgabe/pull/153) bleiben ein gesonderter Integrationsauftrag.

## Verfügbarkeit prüfen und auf den Skill zugreifen

Auf Martins Mac wurde img2threejs v2.0.0 installiert:

- Skill: /Users/martin/.codex/skills/img2threejs/SKILL.md
- Quelle: [img2threejs/img2threejs](https://github.com/img2threejs/img2threejs)
- Fixierte Version: v2.0.0; Upstream-Commit a669e9a97cea4452b1c2310c5cca6aa0f6657c1f
- Lokaler Python-Laufzeitpfad: /Users/martin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3
- Lizenz des Werkzeugs: Apache-2.0. Rechte an Referenzbildern und anderen Assets separat prüfen.

1. Im aktuellen Skill-Katalog nach img2threejs suchen. Falls er nicht angezeigt wird, den oben genannten lokalen Pfad auf diesem Host prüfen und SKILL.md lesen. Auf einem anderen Rechner den dort tatsächlich vorhandenen Pfad ermitteln; ein GitHub-Dokument installiert kein Werkzeug.
2. Die anwendbaren, im Skill verlinkten Regeln lesen. Version, Host und gelesenen Pfad in der Aufgabenübergabe festhalten. Fehlender Zugriff ist ein offener Werkzeugnachweis; Nutzung niemals behaupten, wenn die Datei oder Ausführung nicht erreichbar ist.
3. Vor Modelländerungen aktuellen Aufgabenbranch, Quellen, bereits vorhandene Spezifikation und aktive Schreibarbeit prüfen. Für jedes Asset eigene Dateien und einen eigenen Zustandsordner im jeweiligen Spiel-/Art-Arbeitsbereich verwenden. Keinen gemeinsamen Rekonstruktionszustand im globalen Skill-Ordner anlegen.
4. Vorhandenen Zustand mit forge/next.py --state <absoluter-Asset-Zustandspfad> <absoluter-Spec-Pfad> prüfen. Nur bei einer neuen Rekonstruktion mit forge/state.py init und den echten Referenz-/Spec-Pfaden initialisieren. Skripte nach dem Skillvertrag ausführen; fremde Zustände nicht neu initialisieren.
5. Wiederaufnahmestand, Pflichtschritte, Stopps und begrenzte Korrekturrunden befolgen. Referenzanalyse, Assessment, Spezifikation, strict-quality, schrittweiser Bau und gerenderter Vergleich gehören zusammen. Nicht einfach eine einfache Primitive als fertige Rekonstruktion ausgeben.
6. Ausgabe mit tatsächlichem Render und Vergleich zur Vorlage prüfen; Verbesserung, verbleibende Abweichungen und nächste Aktion sichern. Zustandsdatei und erfolgreiche Skripte sind allein kein visueller Qualitätsnachweis.

## Passender Einsatz je Spieltechnik

| Aufgabe | Verwendung / Nachweis |
| --- | --- |
| Echtzeitobjekt oder stilisierte Figur in Three.js | Direkter Einsatz für bearbeitbaren TypeScript-Modellcode. Vorlage, Silhouette, Details und Materialien kontrollieren; bestehende Engine- und Performancebudgets erhalten. |
| Asset für Unreal oder eine andere native Engine | Als Kandidat für Referenzanalyse und Modellproduktion prüfen. Three.js-Code ist kein direkt importierbares Unreal-Asset. Export-/Importweg nur ausdrücklich auswählen und anhand der tatsächlichen Ausgabe verifizieren. Falls Blender oder ein passender Grundkörper bessere Voraussetzungen liefert, diesen Weg begründen. |
| Rig oder Animation | Ein statisches Mesh ist keine fertige animierte Figur. Die Basisinstallation enthält nicht den separaten character-Plugin-Nachweis. Bei notwendiger Bewegung den im Skill geforderten animated-character-Weg bzw. den ausgewählten Blender-/Engine-Rigweg mit tatsächlichen Bewegungsprüfungen belegen; fehlende Plugins oder Nachweise offen nennen. |
| 2D-Spiel, Steuerung, Gameplay, Aufgaben oder Backend | Passende vorhandene Werkzeuge verwenden; keinen künstlichen 3D-Umweg erzwingen. |

## Aktueller Qualitätsauftrag

Martin meldet am 09.10.2026: Die Qualität ist aktuell noch zu schlecht. Dieser Hinweis ist keine visuelle Freigabe und wird als offene Qualitätsarbeit geführt. Ohne neue Bilder oder konkrete Spielabnahme keine neue Qualitätszahl erfinden.

Konkreter bekannter Fall: Die [Lerninsel-Übergabe](../../workstreams/lerninsel-layouts-20261007.md) dokumentiert den abgelehnten groben Fuchs und einen bestehenden Abstand zum gewünschten Detailziel. Die damalige Einschätzung von etwa 3/10 betrifft diese Figur, nicht alle Spiele oder das Gesamtprojekt. Installation, mehr Polygone, Glättung oder ein Enginewechsel beweisen keine Verbesserung.

Vor größerer Assetproduktion zuerst ein wichtiges Objekt bzw. eine Figur als repräsentativen Abschnitt ausarbeiten und im tatsächlichen Spiel prüfen. Im zuständigen Spielchat offene Qualitätsmängel, Zielvorlage und Annahmen konkretisieren. Danach erst den Umfang ausbauen.

## Qualitätsprüfung vor Abnahme

- Gestalterisches Ziel: vorhandene oder mit Martin abgestimmte Referenz; nachvollziehbare Silhouette, Proportionen, Anatomie und Erkennungsdetails. Verdeckte Ansichten und angenommene Formen kennzeichnen.
- Modell: zusammenhängende geeignete Flächen, passende Konturen und Verbindungen; keine sichtbaren Löcher, Durchdringungen, schwebenden Teile oder ungeklärten Platzhalter.
- Materialien: Farben, Oberflächen und Detailgrenzen im realen Spiellicht beurteilen. Ein schöner Einzelrender ersetzt die Prüfung in der Spielszene nicht.
- Ansichten: mindestens vorne, seitlich und hinten sowie die tatsächliche Spielkamera sichern; bei Rekonstruktion die geforderten Mehrwinkel-/Turntable-Gates des Skills ausführen. Einzelbildähnlichkeit allein reicht nicht.
- Bewegung: bei animierten Figuren die im Spiel benötigten Bewegungen zeigen, mit Bodenhaftung und ohne sichtbare Gelenk-/Verformungsfehler. Ein vorhandenes Rig ersetzt keinen Bewegungstest.
- Zielgerät: Ladegröße, Speicher, Frametimes und Eingaben im vereinbarten repräsentativen Build prüfen. Qualität innerhalb der vereinbarten Budgets verbessern; diese nicht still absenken.
- Freigabe: technischer Nachweis, visuelle Bewertung und Martins Abnahme getrennt dokumentieren. Nicht bestandene oder fehlende kritische Prüfungen lassen das Asset offen.

Beim img2threejs-Weg die strikten und anwendbaren Detail-, Material-, Anbau-/Durchdringungs-, Mehrwinkel- und Animationsprüfungen verwenden. Diese Anforderungen verhindern einfache Scheinerfolge; sie garantieren nicht automatisch ein hochwertiges Ergebnis.

## Pflichtnachweis in der Aufgabenübergabe

Pro Asset festhalten: Task-ID und Eigentümer; Werkzeugentscheidung mit Grund; Host, Version und tatsächlich gelesener Skill-Pfad; Referenz und Rechte; Quellen-/Spec-/State-/Output-Pfade; ausgeführte Befehle samt Ergebnissen; Render- und Vergleichsdateien; kritische Abweichungen; Engineimport-/Gerätenachweis soweit ausgeführt; Martins Abnahmestand; genau ein nächster Schritt.

Kosten, Versuchshistorie und bestehende Budgets erhalten. Keine bezahlten Generatoren oder Käufe allein wegen dieser Werkzeugregel starten. Diese Regel startet keinen anderen Chat; bereits laufende Chats müssen die aktuellen main-Regeln beim nächsten Arbeitsschritt neu lesen.
