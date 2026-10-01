# GradeCrew Design Bible · Foundation V1

Status: Produkt- und Designgrundlage. Noch keine Aussage über deployte UI.

## 1. Zielbild

GradeCrew soll gleichzeitig professionelles Lehrerwerkzeug, ruhiger Prüfungsraum und sympathische Lern-/Spielwelt sein. Die Oberfläche priorisiert immer Aufgabe und Inhalt; Crew-Illustrationen unterstützen Orientierung und Emotion, ersetzen aber nie Status, Text oder Bedienlogik.

Leitprinzip: **Ruhe → Fokus → Persönlichkeit → Feedback.**

## 2. Unverhandelbare Regeln

1. Jede Seite hat genau eine klar erkennbare Hauptaktion.
2. Inhalt ist wichtiger als Navigation oder Dekoration.
3. Je ernster die Aufgabe, desto geringer die Illustrationsdichte.
4. In einer Arbeitsansicht maximal ein dominantes Maskottchen; weitere Figuren nur als kleine funktionale Hinweise.
5. Prüfungsansichten für Schüler bleiben nahezu dekorationsfrei.
6. Erweiterte Funktionen erscheinen erst bei Bedarf (Progressive Disclosure).
7. Jede relevante Aktion liefert sichtbares Feedback: gespeichert, läuft, erfolgreich, Fehler, blockiert.
8. Fehler nennen Ursache soweit bekannt und eine nächste Handlung; Maskottchen allein genügt nie.
9. Löschen und irreversible Aktionen sind nie die primäre Aktion und verlangen Schutz/Undo, wo technisch sinnvoll.
10. Keine neue permanente Farbe, Radius-, Spacing- oder Typografie-Konstante direkt im Produkt; gemeinsame Werte gehören in das bestehende Shared-Design-System.
11. Desktop, Tablet und Smartphone werden bewusst gestaltet; mobile Ansichten sind keine geschrumpften Desktopseiten.
12. Tastaturfokus, Kontrast, Touch-Ziele und `prefers-reduced-motion` sind Teil des Designs, kein späteres Add-on.
13. Status darf nie nur über Farbe kommuniziert werden.
14. Modals sparsam; Inline-Bearbeitung, Sidepanel, Dropdown oder Toast bevorzugen, wenn sie den Kontext erhalten.
15. Bestehende funktionierende Prüfungs-, Security-, Upload-, PDF/Bild-, Tutorial- und Bewertungslogik darf durch visuelle Arbeit nicht stillschweigend verändert werden.

## 3. Visuelle Hierarchie

### Ebene A – Arbeitsfläche
Ruhige helle Fläche, klare Inhaltsbreite, konsistente Abstände. Keine dekorativen Vollflächen hinter produktiver Arbeit.

### Ebene B – Navigation
Stabil, vorhersehbar und visuell sekundär. Primärnavigation verändert ihre Position nicht zwischen Kernansichten.

### Ebene C – Seite
Titel, kurze unterstützende Zeile, eine primäre Aktion. Suche/Filter/Ansicht kompakt und sekundär.

### Ebene D – Inhalt
Cards, Listen, Tabellen und Editorflächen verwenden gemeinsame Komponentenverträge statt individuelle Stile.

### Ebene E – Delight
Crew, Mikroanimationen, Celebration und Szenen werden nur dort eingesetzt, wo sie Orientierung, Wartezeit, Motivation oder Ergebnis verständlicher machen.

## 4. Illustrationsdichte

- **hoch:** Landing/Willkommen, Onboarding, Empty States, Spiele, große Erfolge
- **mittel:** Dashboard, KI-Erstellung, Einstellungen, Hilfe
- **niedrig:** Meine Tests, Editor, Auswertung
- **minimal:** Schülerprüfung, Secure-Prüfungsmodus, kritische Admin-/Security-Aktionen

## 5. Kernkomponenten

Gemeinsame semantische Verträge:

- `PrimaryButton`
- `SecondaryButton`
- `GhostButton`
- `DangerButton`
- `GradeCrewCard`
- `TestCard`
- `PageHeader`
- `StatusBadge`
- `SearchFilterBar`
- `SidePanel`
- `Toast`
- `EmptyState`
- `MascotCoach`
- `Progress/LoadingState`
- `ConfirmAction`

Jede Komponente berücksichtigt mindestens: default, hover (wo vorhanden), focus, active, selected, disabled, loading, success, warning und error, soweit semantisch sinnvoll.

## 6. Statussprache

Teststatus werden zentral und eindeutig benannt:

- Entwurf
- Wird erstellt
- Bereit
- Veröffentlicht
- Läuft
- Beendet
- Archiviert
- Fehler

Status besteht aus Text + ggf. Icon + Farbe. Keine konkurrierenden Synonyme auf verschiedenen Screens.

## 7. Kern-Workflows

### Neuer Test
Global konsistente Hauptaktion `+ Neuer Test`.

Erste Entscheidung:
1. Mit KI erstellen
2. Manuell erstellen
3. Test übernehmen / Vorlage, sofern funktional vorhanden

### Meine Tests
Testkarte zeigt nur die entscheidenden Informationen: Fach/Klasse, Titel, wenige Metadaten, Status. Primäraktion Öffnen; seltene Aktionen unter `…`.

### Editor
Aufgabeninhalt dominiert. Detailaktionen erscheinen bei Auswahl/Hover/Sidepanel. Autosave-Zustand bleibt sichtbar, aber ruhig. Undo/Redo ist Designziel, sobald die zugrunde liegende Logik zuverlässig verfügbar ist.

### KI-Erstellung
Wartezeit wird als nachvollziehbarer Prozess dargestellt (z. B. verstehen → planen → erstellen → prüfen), ohne falsche technische Zustände zu behaupten. Crew darf die Wartezeit illustrieren, aber echte Fortschrittsdaten dürfen nicht simuliert werden.

## 8. Tutorial

Kein langes Pflicht-Tutorial. Drei Ebenen:

1. kurzes Willkommen / erster Einstieg,
2. kontextbezogene Coach Marks an echten Funktionen,
3. dauerhafte kontextbezogene Hilfe.

Bestehende interaktive Crew-Tour wird als wertvolle Grundlage behandelt. Neue Designarbeit darf ihre echte Zielklickbarkeit, Mobile-Viewport-Regeln und Tutorial-Sicherungen nicht regressieren.

## 9. Responsive Prinzipien

### Desktop
Volle Navigation, Editor mit Kontextpanel, mehr Metadaten sichtbar.

### Tablet
Arbeitsfläche priorisiert; Panels können ein-/ausblenden; Touch-Ziele mindestens 44 px/pt.

### Smartphone
Kompakte Navigation, gestapelte Inhalte, keine seitlichen Pflichtpanels. Wichtige Aktionen bleiben im sichtbaren Bereich.

## 10. Accessibility

- sichtbarer Tastaturfokus
- ausreichender Kontrast
- sinnvolle Labels/ARIA bzw. native Accessibility-Bezeichner
- keine reine Farbcodierung
- Mindest-Touchziel 44 px/pt
- reduzierte Bewegung respektieren
- Illustrationen dekorativ markieren, wenn Text dieselbe Information trägt
- Prüfungsinhalte und Hauptaktionen bleiben auch ohne Bilder vollständig bedienbar

## 11. Technische Designquelle

Im bereits bestehenden Branch `feature/shared-gradecrew-design-system` existiert `shared/gradecrew-design/` mit `tokens.json`, `assets.json`, Generator und Web-/Swift-Ausgaben. Diese Architektur ist ausdrücklich zu erhalten und weiterzuentwickeln statt ein zweites Token-System zu schaffen.

Vor Übernahme in aktuelle Produktbranches müssen die dortigen Werte und generierten Dateien gegen den aktuellen Web-/App-Stand geprüft werden. Dieser Foundation-Branch definiert deshalb zunächst Produktregeln und Informationsarchitektur, nicht neue konkurrierende Farbwerte.

## 12. Priorität der Umsetzung

1. Screen-Inventar und Zustände abschließen
2. Dashboard als Referenzscreen
3. Meine Tests + TestCard
4. Neuer-Test-Flow
5. Testeditor
6. KI-Erstellung / Qualitätsprüfung
7. Klassen / Schüler / Auswertung
8. Einstellungen / Hilfe
9. Live / Spiele
10. Polish: Animation, Dark Mode, tiefere Microinteractions

Dark Mode, Sound, große Crew-Welten und hunderte Spezialillustrationen sind bewusst spätere Ausbaustufen, nicht Foundation-Blocker.
