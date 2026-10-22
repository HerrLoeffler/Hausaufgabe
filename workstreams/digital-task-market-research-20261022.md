# GC-EXTENDED-QUESTION-TYPES-01 — digitale Aufgaben: Markt- und Fächerrecherche

Stand 22.10.2026. Ausführender Fachchat: breit angelegte digitale Aufgabenrecherche; Chat-Link unbekannt. Bestehende Task-ID und Prototyp-/Budgethistorie bleiben erhalten.

## Auftrag
Systematische Webrecherche über Grundschule, Mittel-/Hauptschule, Realschule, Sekundarstufen, Gymnasium und Berufsschule. Ziel: dokumentierte Angebote, fachspezifische Aufgabenmuster, eigene GradeCrew-Entwürfe und Anforderungen an KI-Erstellung/Bewertung. Keine Produktimplementierung und keine Deploymentfreigabe.

## Ausgangspunkt
START_HERE, AGENTS, CHAT_CONTRACT, TODO, GRADECREW_STATE, workstreams/README/registry und die aktuellen Aufgabenprinzipien/Fundus auf main gelesen; relevante Abschnitte großer Statusdateien gezielt ausgewertet. Basis main 2b3f2863d3dc2dc067340dbf61ecf70ce47c9094. PR285 ist tatsächlich gemergt; PR265/271 sowie Adaptive/Pool bleiben eigene Arbeiten. Keine erneute Prototypimplementierung. Fundus: VIS01–13, EXP01–05, MOD01–08. Neuer Bericht ergänzt diese IDs, ersetzt sie nicht.

## Zuständigkeit und Sicherung
Eigener Branch docs/digital-task-market-research-20261022, Ziel main. Drei parallele Fachrecherchen: Mathematik/MINT/Informatik; Deutsch/Fremdsprachen/Grundschule; Gesellschaft/Kunst/Musik/Sport/Berufsbildung. Parent ergänzt fachübergreifende Autorenwerkzeuge, Standards, Qualität und Konsolidierung. Angeforderte Fachagenten gpt-6.1-sol/high wegen fachübergreifender Korrektursemantik; tatsächliche Runtimekonfiguration und Usage nicht gesondert beobachtbar. Kein kostenpflichtiger externer Providerstart, kein Budgetreset.

## Aktueller Stand
Recherche läuft. Offizielle Quellen und Funktionsdokumentation werden geöffnet; nicht zugängliche oder rein indexierte Evidenz wird markiert. Eigene Aufgabenbeispiele werden von dokumentierten Produkteigenschaften getrennt. Schulart/Jahrgang in Ideen sind Vorschläge, keine amtliche Lehrplanzuordnung. Keine Vollständigkeit des gesamten Internets oder empirische Wirksamkeit behauptet.

## Nächster ausführbarer Schritt
Fachrecherchen zusammenführen, Dubletten/Fachlücken prüfen und den belegten Bericht samt maschinenlesbarem Katalog sichern. TODO/Registry/Fundus nur additiv nach erneutem Lesen aktualisieren. Release-State bleibt unverändert; noch keine neue CI-, Integration-, Staging-, Nutzer- oder Productionstufe.
