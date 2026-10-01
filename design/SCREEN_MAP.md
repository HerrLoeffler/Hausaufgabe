# GradeCrew Screen Map · V1

Status: Inventar für Design und UX. Ein Eintrag bedeutet nicht, dass die Funktion bereits implementiert ist.

## A. Einstieg und Auth

- Landing / Start
- Lehrer anmelden
- Lehrer registrieren
- Passwort / Zugang wiederherstellen
- Schüler beitreten per Code
- Schüler beitreten per QR
- Schul-/Account-Verknüpfung, falls vorhanden
- Fehler / abgelaufener Link / keine Berechtigung

## B. Lehrer – Kernbereich

### Dashboard
- Begrüßung
- `+ Neuer Test`
- letzte Tests
- laufende / relevante Aktivitäten
- Klassen-Kurzüberblick
- Tutorial-/Hilfe-Einstieg
- Benachrichtigungen

### Meine Tests
- Liste/Karten
- Suche
- Filter
- Ansicht
- Status
- Empty State
- Ladezustand
- Fehlerzustand
- Overflow-Aktionen

### Neuer Test
- Startauswahl: KI / manuell / übernehmen
- Metadaten: Fach, Klasse, Thema, Dauer, Punkte
- Aufgabentypen
- eigene Wünsche
- Material/Bild/PDF-Upload
- Bildregeln
- Generierungsstatus
- Qualitätsprüfung
- Fehler / Retry

### Testeditor
- Testkopf
- Aufgabenliste
- Aufgabe ausgewählt
- Aufgabeneigenschaften
- Punkte
- Lösung
- Bild/Medien
- KI bearbeiten / neu generieren
- Varianten
- Feedback
- Autosave
- Undo/Redo als Zielzustand
- Vorschau
- Schüleransicht

### Veröffentlichung
- Einstellungen
- Zielgruppe / Klasse
- Öffnen / Sperren
- Code
- QR
- Live-Status
- Zurückziehen / Beenden

### Ergebnisse
- Gesamtübersicht
- Punkte-/Notenverteilung
- einzelne Abgabe
- schwierigste Aufgaben
- manuelle Bewertung
- Lösungsfreigabe
- Export

## C. Organisation

### Klassen
- Klassenübersicht
- Klasse anlegen
- Klassendetail
- Schülerliste
- Testfreigaben
- Aktivitäten

### Schüler
- Schülerübersicht
- Schüler anlegen / importieren
- Kürzel / Name
- Zuordnung zu Klasse
- Detail / Verlauf, soweit datenschutzrechtlich und funktional vorgesehen

### Schule / Admin
- Schule
- Lehrkräfte
- Rollen
- Klassen
- Lizenz
- Integrationen
- Datenschutz / Datenverwaltung
- Vorlagen / gemeinsame Inhalte, falls später vorhanden

## D. Einstellungen

- Profil
- Konto
- Schule
- Test-Standards
- Bewertung / Notenschlüssel
- KI
- Bilder / Material
- Darstellung
- Barrierefreiheit / reduzierte Bewegung
- Datenschutz
- Abonnement
- Integrationen
- Hilfe / Support

## E. Tutorial und Hilfe

- Willkommen
- Crew kennenlernen
- KI-Erstellung erklären
- Editor erklären
- Feedback erklären
- Varianten erklären
- Veröffentlichung erklären
- Abschluss
- kontextbezogene Coach Marks
- Hilfe-Sidepanel
- Tutorial erneut starten

## F. Schüler – Test

- Code/Kürzel-Einstieg
- Testinformationen
- Start-Gate
- Prüfung
- Navigation zwischen Aufgaben, falls vorgesehen
- Verbindungs-/Offline-Zustand
- Zeitstatus
- Abgabe bestätigen
- Abgabe erfolgreich
- Ergebnis, wenn freigegeben
- keine Ergebnisfreigabe / wartet

Grundregel: Während der eigentlichen Prüfung nahezu keine dekorative Crew-Darstellung.

## G. Secure

- Secure-Einstieg
- Geräte-/Umgebungsprüfung
- Prüfung starten
- aktive Prüfung
- technischer Fehler
- sichere Abgabe
- Prüfung beendet

Grundregel: funktional, ruhig, eindeutig; Markenidentität ja, Gamification nein.

## H. Live

### Lehrer
- Lobby
- Teilnehmer
- Steuerung
- Aufgabe
- Score / Fortschritt
- Beenden

### Schüler
- Beitritt
- Lobby
- Aufgabe
- Antwort
- Zwischenfeedback
- Ergebnis

### Beamer
- Lobby / QR
- Aufgabe / Timer
- Live-Score
- Sieger / Abschluss

## I. Spiele

- Spieleübersicht
- Spiel auswählen
- Spiel konfigurieren
- KI-Inhalte erzeugen
- Vorschau / Lehrer-Schnellprüfung
- Lobby
- Spiel
- Scoreboard
- Abschluss
- Fehler melden
- Analyse / Nutzungsdaten

## J. Systemzustände

Jeder Kernscreen muss diese relevanten Zustände bewusst behandeln:

- initial
- loading / skeleton
- empty
- success
- warning
- error
- offline / reconnect
- no permission
- disabled
- partial data
- unsaved changes
- background job running
- background job failed

## K. Priorisierte Referenzscreens

1. Dashboard
2. Meine Tests
3. Neuer Test
4. Testeditor
5. KI-Erstellung / Qualitätsprüfung
6. Veröffentlichung
7. Ergebnisse
8. Klassen
9. Einstellungen
10. Schülerprüfung

Erst wenn die Referenzscreens konsistent sind, werden seltene Nebenansichten visuell finalisiert.
