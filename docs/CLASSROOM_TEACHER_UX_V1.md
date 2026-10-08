# GC-CLASSROOM-01 – Lehrer- und Schülernavigation V1

Stand: 08.10.2026  
Status: Bedienkonzept zur Prüfung; keine Produktimplementierung und kein Deploy.

## Das konkrete Problem

Lehrkräfte öffnen GradeCrew und finden etwa 20–30 Tests als lange, ungeordnete Liste. Dadurch muss man sich erinnern, wann ein Test erstellt wurde oder wie er hieß. Für den Unterricht zählt zuerst: Welche Klasse/Fach betreue ich, welche Prüfung ist als Nächstes dran, wo muss ich korrigieren oder Ergebnisse ansehen?

Die Struktur soll deshalb an der täglichen Arbeit der Lehrkraft ausgerichtet sein. Tests werden nicht als eine flache Sammlung angezeigt.

## Empfohlene linke Navigation

1. **Übersicht** – Startseite nach der Anmeldung; zeigt nur die nächsten sinnvollen Aufgaben.
2. **Klassen** – Klassen und Fachkurse des aktuellen Schuljahrs. Das ist der Hauptweg zu Schüler:innen, Fachkolleg:innen und den Prüfungen dieser Lerngruppe.
3. **Tests** – zentrale Suche und Verwaltung aller Tests, auch wenn die Lehrkraft gerade nicht weiß, zu welcher Klasse sie gehören.
4. **Vorlagen** – späterer, eigener Bereich für wiederverwendbare Aufgaben/Testentwürfe; persönliche und schulisch geteilte Vorlagen klar unterscheiden.

Profil, Hilfe und schulische Verwaltung gehören in das Profil-/Einstellungsmenü, nicht in die tägliche Hauptnavigation. „Schüler:innen“ muss nicht als gleichrangiger globaler Menüpunkt starten: Die Lehrkraft erreicht die Liste innerhalb einer Klasse, wo der Kontext und die Berechtigungen klar sind. Wenn viele Schulen/Klassen getestet zeigen, kann eine globale Schüler-Suche später ergänzt werden.

## Übersicht: nach nächster Handlung sortieren

Die Startseite zeigt kompakte Abschnitte:

- **Jetzt aktiv** – Prüfungen, die gerade laufen, mit Klasse/Fach und Abgabe-/Zeitstatus.
- **Als Nächstes** – geplante Prüfungen mit Datum, Klasse und Fach.
- **Rückmeldung offen** – nur Arbeiten, bei denen die Lehrkraft tatsächlich etwas erledigen muss.
- **Zuletzt bearbeitet** – wenige eigene oder geteilte Entwürfe, nicht die komplette Testhistorie.

Darunter stehen die aktuellen Klassen als Karten, zum Beispiel „9b · Deutsch“ und „9b · Englisch“, mit direkten Aktionen „Klasse öffnen“ und „Test erstellen“. Eine Klasse mit mehreren Fächern bleibt eine gemeinsame Klasse; Fächer sind Zuständigkeiten bzw. Kurse darin. Die Seite priorisiert anstehende Arbeit und ersetzt keine vollständige Testverwaltung.

## Tests: eine Übersicht, mehrere klare Ansichten

Die Seite **Tests** enthält eine Suchzeile und gut sichtbare Filter für Schuljahr, Klasse, Fach und Status. Als Standard gilt das aktuelle Schuljahr und nur der Lehrkraft zugewiesene Klassen/Fächer. Ein schneller Wechsel erlaubt „Alle meine Klassen“.

Oben liegen vier Statusansichten:

- **Entwürfe** – noch nicht für Schüler:innen freigegeben.
- **Geplant** – freigegeben mit zukünftigem Start oder Termin.
- **Aktiv** – derzeit für Schüler:innen verfügbar oder laufend.
- **Abgeschlossen** – beendet; Ergebnisse und Archivzugriff nur im Umfang der Rechte.

In der Ansicht „Alle“ sind Tests nach **Klasse → Fach** gruppiert. Gruppen lassen sich ein- und ausklappen. Innerhalb einer Gruppe stehen die neuesten/geplanten zuerst; jeder Eintrag zeigt Titel, Fach, Status, Termin und bei Bedarf eine knappe offene-Abgaben-Zahl. Ein Statusfilter kann mehrere Gruppen zusammenfassen. So bleibt die Klassenstruktur erkennbar, ohne denselben Test mehrfach als Kopie abzulegen.

Jeder Test hat einen eindeutigen Eintrag und kann mehreren Klassen zugewiesen werden, falls das fachlich gewollt ist. Die Liste zeigt dann „2 Klassen“, und die Details machen Zielgruppe sowie je Klasse den Freigabestatus sichtbar. Ergebnisse bleiben pro freigegebener Lerngruppe geschützt.

## Klasse: gemeinsamer Schülerbestand, Fächer als Unterkontext

Die Klassenseite beginnt mit Name und Schuljahr, zuständigen Lehrkräften/Fächern und einem kurzen Überblick über aktive oder nächste Prüfungen. Drei Reiter genügen:

- **Übersicht** – aktuelle Aktivitäten und schnelle Aktionen.
- **Schüler:innen** – Klassenliste mit zufälligem Alias, bei entsprechender schulischer Berechtigung lokale Namensauflösung; Zugangscodes werden nicht in der Liste angezeigt.
- **Tests** – dieselben Testeinträge wie in der zentralen Testsicht, hier auf diese Klasse beschränkt und nach Fach gruppiert.

Fachfilter wie Deutsch und Englisch zeigen nur die zuständigen Tests. Mehrere Lehrkräfte können in einer Klasse arbeiten; jede sieht ihre eigenen bzw. ausdrücklich geteilten Fachprüfungen und Ergebnisse. Eine Klassenleitung bekommt zusätzliche Rechte nur, wenn sie ausdrücklich zugewiesen sind. Bei Vertretung oder Personalwechsel überträgt die Schuladministration die konkrete Klasse/Fachzuständigkeit.

Der Klassenwechsel zum neuen Schuljahr erzeugt einen neuen Klassen-/Mitgliedschaftskontext. Er verschiebt nicht rückwirkend alte Prüfungen: abgeschlossene Ergebnisse behalten ihren ursprünglichen Klassen-, Fach- und Testkontext.

## Test erstellen: Zielgruppe zuerst sichtbar machen

Der Einstieg **Test erstellen** ist sowohl global als auch auf einer Klassen- oder Fachseite erreichbar. Vom Klassenkontext aus sind Klasse/Fach vorausgewählt und immer sichtbar. Global fragt der Ablauf zuerst:

1. Für welche Klasse(n) und welches Fach ist der Test?
2. Wann soll er verfügbar sein und wann enden?
3. Ist er ein Entwurf, geplant oder jetzt freizugeben?
4. Dann erst öffnet sich der bestehende Testeditor.

Vor der Freigabe zeigt eine kurze Bestätigung den Namen der Klasse, das Fach, die Zahl der zugeordneten Schülerkonten und den Zeitraum. Keine neue Prüfungs- oder Abgabe-Engine: Veröffentlichung und Bearbeitung bleiben an den bestehenden Secure-Assessment-Ablauf angebunden.

## Schüleransicht: persönlich und ruhig

Nach dem persönlichen Zugang sehen Schüler:innen zuerst **Meine Tests** mit drei einfachen Gruppen:

- **Anstehend** – noch nicht gestartet, mit Fach und Startzeit.
- **Jetzt verfügbar** – große klare Schaltfläche zum Öffnen/Weiterarbeiten.
- **Erledigt** – nur Ergebnisse oder Rückmeldungen, die die Schule für diese Person freigegeben hat.

Die Schüleransicht zeigt keine anderen Schüler:innen und keine Lehrer-Verwaltung. Ein Test gehört sichtbar zu einem Fach und einer Klasse, bleibt aber für das Kind leicht auffindbar. Der spontane Gastzugang per Testcode bleibt ein getrennter Einstieg und wird nicht mit der persönlichen Klassenübersicht vermischt.

## Regeln, damit die Struktur übersichtlich bleibt

- Klassenjahr und Fach ordnen Tests; Titel allein ist keine Ablagestruktur.
- Status ist ein Filter und Arbeitsweg, kein Ordner, in den Tests manuell verschoben werden.
- Ein Test wird nicht kopiert, nur um ihn in mehreren Ansichten zu zeigen.
- Alte Schuljahre sind standardmäßig eingeklappt/archiviert und lassen sich gezielt öffnen.
- Suche findet Titel; Filter reduzieren nach Jahr, Klasse, Fach und Status.
- „Zuletzt verwendet“ bleibt klein und ergänzend, nicht der Startpunkt für 30 Einträge.
- Sichtbarkeit folgt aktuellen Schul-/Fachrechten. Ein Menüpunkt oder Gruppierung verleiht selbst keine Berechtigung.
- Alias/Name-Auflösung bleibt an die bestehende schulische Datenschutzentscheidung gebunden; keine Namen oder Schülerlisten in Produkttelemetrie.

## Warum diese Struktur

Für den Lehreralltag ist Klasse/Fach die stabile Ablage: mehrere Lehrkräfte können dieselbe Lerngruppe betreuen, und dieselben Schülerkonten nehmen an verschiedenen Fachprüfungen teil. Statusansichten helfen beim täglichen Abarbeiten; die Klassenansicht hilft beim Einordnen. Beides arbeitet auf denselben Tests. Für Schüler:innen reicht eine persönliche Liste nach Zeitpunkt/Status.

Der wichtigste offene UX-Schritt ist ein kurzer Prototypentest mit Lehrkräften: Können sie ohne Erklärung (a) eine Deutschprüfung für 9b erstellen, (b) einen aktiven Test finden, (c) Ergebnisse nur ihres Fachs öffnen und (d) eine alte Prüfung aus dem Vorjahr aufrufen? Das sollte vor Produktimplementierung anhand der echten bestehenden GradeCrew-Oberfläche geprüft werden.

## Status und nächste Schritte

Dies ist ein Bedienkonzept innerhalb GC-CLASSROOM-01, kein implementiertes UI. Es steht im selben Dokumentations-Draft PR wie der ASV-Identitätsentwurf. Produktstufe bleibt branch_only; Produkt-CI, Staging und Nutzertest für Classroom sind nicht erfolgt.

Nächste inhaltliche Prüfung: zuerst UX-Prototyp gegen den bestehenden GradeCrew-Testeditor und echte Lehreraufgaben durchgehen; danach mit Identitäts-/Berechtigungsmodell zusammenführen. Separat bleiben ASV-Exportspalten, schulischer Schlüsseltresor/Recovery und schulische Prüfung von Aufbewahrung/Zugriff offen.


## Von der Lehrkraft bis zum Test auf dem Schülergerät

Ja: Ein neues Schülerkonto kann zunächst ohne freigegebene Tests starten. Die leere Ansicht erklärt den Zustand: „Noch keine Tests für dich freigegeben. Sobald deine Lehrkraft einen Test zuweist, erscheint er hier.“ Falls bereits eine Klasse zugeordnet ist, wird diese klein als Kontext angezeigt. Es wird kein zufälliger oder öffentlicher Test automatisch in das Konto gelegt.

Damit ein Test bei einer Schülerin oder einem Schüler erscheint, müssen zwei Dinge eingerichtet sein:

1. **Klassenmitgliedschaft:** Das Schülerkonto ist Mitglied der richtigen Klasse im aktuellen Schuljahr. Das entsteht durch bestätigten Import oder durch einen kontrollierten manuellen Beitritt. Eine Fachklasse/Kurszuordnung kann zusätzlich festlegen, welche Schüler:innen am Fach teilnehmen.
2. **Testzuweisung:** Die Lehrkraft wählt beim Veröffentlichen den passenden Klassenkurs, zum Beispiel „9b · Technik“, plus Start-/Endzeit und gegebenenfalls einzelne Ausnahmen. Das Fach kommt aus dem Schul-/Kursverzeichnis, nicht aus einem frei geratenen Testtitel. Wenn Unterrichtsdaten aus ASV importiert wurden, schlägt die Schuladministration sie vor und bestätigt sie; sonst pflegt die Schule den Fachkurs einmalig.

Ein Test im Editor bleibt zunächst ein privater Entwurf. Erst **„Zuweisen und veröffentlichen“** erstellt die Freigabe. Vorher zeigt GradeCrew die Zielklasse, das Fach, die Anzahl der ausgewählten Schülerkonten und den Zeitraum zur Kontrolle. Beim Veröffentlichen prüft der Server, dass die Lehrkraft genau für diese Klasse und dieses Fach zuständig ist.

Die Freigabe verweist auf den vorhandenen Test und Secure-Assessment-Durchlauf. Sie speichert den gewählten Kurs und eine feste Zielgruppe zum Veröffentlichungszeitpunkt, ohne eine lange ID-Liste in ein einzelnes Dokument zu packen. Die Zielgruppen-Einträge werden einzeln und idempotent vorbereitet; erst wenn die Vorbereitung vollständig ist, wird die Freigabe für Schüler sichtbar. Eine später neu aufgenommene Person erhält einen bereits veröffentlichten Test nicht stillschweigend. Die Lehrkraft kann sie gezielt nachtragen oder neu zuweisen. Eine beendete Mitgliedschaft sperrt den Zugriff weiterhin, auch wenn die Person ursprünglich in der Zielgruppe war.

Auf dem Schülerkonto läuft es dann so:

- **Entwurf:** für Schüler unsichtbar.
- **Geplant:** nach ausdrücklicher Freigabe sichtbar unter „Anstehend“, mit Fach und Startzeit.
- **Offen:** unter „Jetzt verfügbar“, mit einer klaren Schaltfläche zum Starten/Fortsetzen.
- **Abgegeben/geschlossen:** Status bleibt beim eigenen Test sichtbar. Punkte oder Rückmeldung erscheinen erst, wenn die Lehrkraft sie freigibt.

Der Server liefert für „Meine Tests“ nur Zuweisungen zurück, die zum angemeldeten Schülerkonto gehören, für dessen aktive Mitgliedschaft gelten und deren Zeitraum/Status passt. Beim Start prüft die vorhandene Secure-Assessment-Logik dieselbe Berechtigung nochmals; die Browseroberfläche darf sich nicht selbst eine Klasse oder Freigabe aussuchen. Ein direkter Link allein verschafft keinen Zugang. Lehrer-Vorschau, Gastzugang und persönliche Klassenfreigabe bleiben getrennte Zugangsarten.

**Beispiel:** Die Techniklehrkraft ist für Technik in 9b eingetragen. Sie erstellt „Stromkreis – Kurztest“, wählt „9b · Technik“, prüft die Zielgruppe und veröffentlicht mit Start morgen 08:00 Uhr. Die Schüler:innen aus dieser Klasse sehen ab dann „Stromkreis – Kurztest · Technik“ bei „Anstehend“. Ab 08:00 Uhr wandert er zu „Jetzt verfügbar“. Schüler:innen anderer Klassen oder ohne passende Mitgliedschaft sehen ihn nicht.

## Veröffentlichungs- und Zugriffsregeln

- Klasse und Fachkurs sind von der Lehrkraft gewählte, gültige Schulobjekte; Tippfehler im Testtitel ändern keine Zuordnung.
- Ein Zuweisungseintrag verbindet bestehenden Quiz-/Run mit Klasse, Fachkurs, Zielgruppe und Zeitfenster; Prüfungsversuche und Bewertung bleiben in Secure Assessment.
- Der Zielgruppenstand wird zum Freigabezeitpunkt festgehalten. Nachträge sind ausdrücklich sichtbar und protokolliert.
- Server prüft bei Listenaufruf und Start aktive Identität, Mitgliedschaft, Zuweisung, Zeitfenster und Rechte erneut.
- Fachlehrkräfte sehen nur die ihnen zugewiesenen Klassen/Fächer und dafür freigegebene Ergebnisse. Die Schuladministration vergibt diese Rechte; ASV-Import alleine schaltet nichts frei.
- Lehrkraft legt separat fest, wann Ergebnisse sichtbar werden. Geschlossen bedeutet nicht automatisch „Noten veröffentlicht“.
- Scheitert die Vorbereitung einer Freigabe, bleibt sie für Schüler unsichtbar und kann idempotent fortgesetzt werden; keine halbe Klassenfreigabe.
