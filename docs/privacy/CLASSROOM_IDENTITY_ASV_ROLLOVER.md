# GC-CLASSROOM-01 – Identität und ASV-Abgleich über Schuljahre

Stand: 05.10.2026  
Status: Architekturvorschlag zur Prüfung; keine Implementierungs- oder Deploymentfreigabe.  
Produktbranch: `feature/classroom-student-management-v1`  
Integrationsziel: `feature/gradecrew-app-integration`

## 1. Ziel und gesicherter Ausgangspunkt

Eine Schülerperson behält innerhalb derselben Schule ihr GradeCrew-Konto, auch wenn Klasse, Schuljahr, Name oder zuständige Lehrkraft wechseln. Neue Personen erhalten neue Konten. Abgänge werden kontrolliert behandelt. Lehrkräfte können berechtigte Ergebnisse einer Person zuordnen, ohne dass GradeCrew eine zusätzliche Klarnamensdatenbank führt.

Der aktuelle Auftrag verlangt ausschließlich Architekturklärung. Die vorher geplante Mock-Implementierung wird in dieser Runde nicht begonnen. Die Nutzerangabe, dass ASV vermutlich eine Schüler-ID enthält, bestätigt noch keine konkrete Exportspalte.

Am 05.10.2026 geprüft:
- Classroom-Produktbranch und Integrationsbranch stehen beide auf `bb91ce3590d773472ece60c4dd881da729bd32c1`; Classroom hat keinen eigenen Produktcommit.
- Live Development Status Run [37326636949](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37326636949) erfolgreich; Classroom `+0/-0`, kein PR, `branch_only`. Allgemeine Registry-/Altbranch-Warnungen bleiben bestehen.
- Die Koordinationsdateien und der Classroom-Handoff wurden auf aktuellem main gelesen. Auf dem Produktbasiscommit fehlen die später auf main ergänzten AGENTS-/Classroom-Handoff-Dateien; aktuelle main-Regeln gelten weiter.
- Vorheriger Chat: „Schülerintegration Codekonzept“, bekannte Gesprächs-ID `6abae2b9-f014-83eb-83af-ad9057cf7ba5`; gelesene Arbeitsschritte abgeschlossen. Kein laufender Classroom-Implementierungsauftrag nachgewiesen. Ein alter, nicht zugänglicher Checkout bleibt unbekannt.
- Bestehende Staging-Workflows 37238585607 und 37238585657 sind erfolgreich, betreffen den bestehenden Integrationsstand. Ihre Workflow-Heads sind Koordinationscommits und allein kein Beleg für den deployten Produkt-SHA. Sie belegen keine Classroom-Implementierung.

## 2. Welche ASV-Kennung geeignet ist

Die offizielle [ASV-Dokumentation zur XML-Exportschnittstelle](https://doku.asv.bayern.de/alle/schnittstellen/xml_sst/xmlexport) beschreibt das **lokale Differenzierungsmerkmal** als eindeutige Kennung innerhalb der ASV-Datenbasis. Es bleibt bei Schuljahreswechseln und Backup-Rückspielung erhalten und wird auch nach einem Austritt nicht erneut vergeben. Eine `xml_id` kann hingegen zwischen Exporten wechseln. Die [ASV-Importdokumentation](https://doku.asv.bayern.de/alle/schueler/import/grunddatenimport) nennt dafür die Spalte `Lokales_DM`.

Diese Aussagen beziehen sich auf das dokumentierte Merkmal. Die konkrete CSV-Vorlage der Schule ist noch nicht geprüft. Eine beliebige Spalte „ID“ oder „Schülernummer“ darf nicht automatisch damit gleichgesetzt werden. Exportprofil, Feldbedeutung und Unveränderlichkeit sind vor Umsetzung mit nicht personenbezogenen Beispielen zu bestätigen.

Die Kennung ist **keine bundesweite Schüler-ID**. Ihr Geltungsbereich hängt von der ASV-Datenbasis ab. GradeCrew bindet deshalb jede Quelle an einen schulischen Mandanten und einen dauerhaft registrierten Quell-Namensraum. Kein automatisches Zusammenführen verschiedener Schulen.

Geeigneter lokaler Schlüssel:

`schoolId + sourceNamespace + lokalesDifferenzierungsmerkmal`

Der Quell-Namensraum identifiziert die logische ASV-Datenbasis, nicht Rechner, Dateiname, Softwareversion, Klasse oder Schuljahr. Er bleibt beim normalen Backup-/Gerätewechsel erhalten. Beim Wechsel der Datenbasis oder Neuanlage eines ASV-Datensatzes ist eine kontrollierte Zuordnungsmigration nötig.

Kennungen werden als Text behandelt. Führende Nullen, vollständige Ziffernfolgen und Groß-/Kleinschreibung werden nach dem bestätigten Exportvertrag erhalten. Keine Umwandlung in Fließkommazahlen, keine pauschale Unicode-/Fallnormalisierung einer unbekannten ID.

## 3. Vier verschiedene Dinge

| Element | Aufgabe | Dauer / Sichtbarkeit |
|---|---|---|
| ASV-Differenzierungsmerkmal | Person im schulischen Quellsystem wiedererkennen | Stabil innerhalb der Quelle; roh nur im schulischen Bereich |
| GradeCrew-`studentIdentityId` | Technischer Verweis für Konto, Mitgliedschaften und Ergebnisse | Zufällig, undurchsichtig, über Schuljahre innerhalb der Schule stabil |
| Alias | Anzeige in einer Klasse / einem Kurs | Namensunabhängig; klassenbezogen; darf sich ändern |
| Persönlicher Zugangscode | Anmeldung | Geheime Credential; unabhängig von allen IDs; gezielt rotierbar |

Ein Alias ist kein Abgleichschlüssel. Ein Zugangscode ist kein Import-Schlüssel. Der ASV-Abgleich ersetzt weder die persönliche Anmeldung noch die Verifikation vor Leistungsnachweisen.

Die bislang „globale“ StudentIdentity wird als **innerhalb des Schulmandanten gemeinsame Identität** präzisiert: dieselbe ID in mehreren Klassen/Fachgruppen dieser Schule, keine automatische schulübergreifende Personenverknüpfung. Ein Schulwechsel ist ein eigener autorisierter Transferprozess; V1 legt in der neuen Schule eine neue lokale Identität an.

## 4. Drei Ansätze und Empfehlung

| Ansatz | Vorteil | Wesentlicher Aufwand / Nachteil |
|---|---|---|
| A: Lokaler HMAC-Abgleich mit schulischem Schlüssel | GradeCrew erkennt Konten aus jeder neuen ASV-Datei wieder; keine jährliche vollständige Mapping-Datei für das Matching nötig | Schlüsselverwahrung, Backup, Gerätewechsel und Migration müssen vor Nutzung funktionieren |
| B: Verschlüsseltes schulisches Mapping ASV-ID → GradeCrew-ID | Einfach nachvollziehbar; rohe ASV-ID bleibt ebenfalls außerhalb GradeCrew | Aktuelle Zuordnung muss nach jedem Import gesichert und bei mehreren Administratoren konsistent gehalten werden |
| C: Namen / rohe ASV-ID bei GradeCrew speichern | Zentrale Bedienung und Recovery leichter | Zusätzliche identifizierende Daten und höherer Schutzbedarf; Erforderlichkeit müsste eigens begründet werden |

**Empfohlenes Zielbild ist A**, unter der Voraussetzung eines betriebsfähigen schulischen Schlüsseltresors. B ist eine zulässige Alternative und ein Migrationspfad für den früheren Entwurf. C wird nicht als Standard empfohlen. Die Empfehlung ist ein Architekturvorschlag, keine bereits erteilte Produktfreigabe.

Fehlen bei A Schlüsselverwaltung oder Recovery, wird A nicht mit echten Daten freigeschaltet. Ein ausdrücklich eingerichteter Modus B kann genutzt werden. Kein automatischer Wechsel der Verfahren bei Fehlern.

## 5. Geschützter Abgleichschlüssel

Die Schule erzeugt einmal einen zufälligen 256-Bit-Schlüssel `Kschool`. Ein freigegebener Importclient berechnet lokal:

`matchKey = HMAC-SHA256(Kschool, UTF8(JSON.stringify(["gradecrew-asv-match-v1", schoolId, sourceNamespace, localDM])))`

Die Arraydarstellung vermeidet mehrdeutige Trennzeichen. Der vollständige Digest wird verwendet. HMAC ist eine standardisierte Konstruktion mit geheimem Schlüssel; siehe [NIST – HMAC](https://www.nist.gov/publications/keyed-hash-message-authentication-code-hmac-0). Diese konkrete Verwendung als Importpseudonym ist unser Architekturvorschlag.

GradeCrew erhält den `matchKey`, die nicht geheimen Quell-/Schlüsselversionsangaben und die erforderliche Klassenzuordnung. Namen, rohe ASV-ID, Dateiinhalt und `Kschool` werden nicht übertragen.

Der Server hält einen nicht öffentlich lesbaren Index:

`schoolId + sourceNamespace + keyId + matchKey -> studentIdentityId`

Er erzeugt die zufällige `studentIdentityId` selbst. Derselbe eindeutige Indexeintrag darf nur einer Identität zugeordnet sein; konkurrierende Erstanlagen werden atomar aufgelöst. Derselbe Digest ist keine Berechtigung zum Lesen, Anmelden oder Ändern.

Aus dem Namen, dem Geburtsdatum oder einem öffentlich bekannten Salt wird kein Schlüssel gebildet. Ein einfacher Hash einer kurzen/strukturierten ID schützt nicht ausreichend vor Ausprobieren. Schuljahr, Klasse und Alias gehen nicht in den HMAC ein, weil sie beim Wechsel sonst die Wiedererkennung zerstören.

Ein nicht geheimer `keyId` und ein getrennt abgeleiteter schulbezogener Prüftag werden bei Einrichtung registriert. Der Client weist vor jedem Import nach, dass er den eingerichteten Schlüssel nutzt:

`keyCheck = HMAC-SHA256(Kschool, UTF8(JSON.stringify(["gradecrew-asv-keycheck-v1", schoolId, keyId])))`

Bei abweichendem Prüftag, unbekanntem Namensraum oder falschem Mandanten wird der Import gestoppt. Keine Anlage eines zweiten gesamten Schülerbestands. Der Prüftag ist eine Konfigurationskontrolle; administrative Authentifizierung und Rollenprüfung bleiben erforderlich.

## 6. Was „auf einem Gerät der Schule“ tatsächlich bedeutet

Eine private Download-Datei auf dem Laptop einer einzelnen Lehrkraft ist keine ausreichende dauerhafte Architektur.

Die Schule verwaltet den Schlüssel in einem verschlüsselten, schulisch freigegebenen Tresor, zum Beispiel auf ihrem administrierten Speicher mit geregelten Zugriffsrechten. Das kann ein freigegebenes Schulnetzlaufwerk oder ein geeigneter schulischer Dienst sein. „Lokal“ beschreibt hier die Verarbeitung vor der GradeCrew-Übertragung, nicht eine Bindung an einen bestimmten Computer oder das Schulgebäude.

Festzulegen sind:
- verantwortliche Schuladministration und benannte Vertretung;
- Importberechtigung getrennt von normalem Lehrkraftzugang;
- Verschlüsselung und getrennte Aufbewahrung des Entsperr-/Recovery-Geheimnisses;
- versioniertes Backup und praktisch geprüfte Wiederherstellung;
- Entzug des Zugriffs bei Personalwechsel;
- freigegebene Geräte und definierte Nutzung außerhalb des Schulnetzes.

GradeCrew speichert den unverschlüsselten Schulschlüssel nicht. V1 sieht keine automatische Tresorablage bei GradeCrew vor. Ein späterer Ende-zu-Ende-verschlüsselter Cloudtresor wäre ein gesondert zu prüfendes Betriebsmodell.

Normale Fachlehrkräfte erhalten nicht den schulweiten HMAC-Schlüssel. Für ihre Klassen kann die Schuladministration eine eingeschränkte, verschlüsselte Zuordnung `studentIdentityId -> Name` bereitstellen. Diese bleibt im schulischen Bereich, enthält keine persönlichen Zugangscodes und ist nach Zweck und Berechtigung begrenzt.

Bei Modus B enthält der schulische Tresor zusätzlich die aktuelle Zuordnung aus Quellkennung und GradeCrew-ID sowie eine Revision. Auch B braucht Backup, Schreibkoordination und Recovery; eine Browserablage allein reicht nicht.

## 7. So erkennt die Lehrkraft die reale Person

ASV bleibt die maßgebliche Quelle der Klarnamen. Beim Import kann die berechtigte Administration lokal Namen, Klassen und GradeCrew-Konten zusammen anzeigen. Für die Ergebnisansicht kann eine berechtigte Lehrkraft ihre schulische Klassenzuordnung lokal öffnen; der Client verbindet sie über `studentIdentityId` mit den vom Server autorisierten Ergebnissen.

Beispiel mit ausschließlich erfundenen Daten:

| Schuljahr | Lokale Quelle | GradeCrew-Konto | Klasse / Alias |
|---|---|---|---|
| 2026/27 | Quelle A, DM „001234“, lokal „Max Beispiel“ | `stu_random_42` | 9b / M7Q4 |
| 2027/28 | Quelle A, DM „001234“, lokal „Max Beispiel“ | `stu_random_42` | 10b / K2PX |

Die Person und ihr Konto bleiben gleich, obwohl Klassenbezeichnung und Alias wechseln können. Vorhandener persönlicher Zugangscode bleibt beim normalen Jahreswechsel gültig. Ein Wiederimport kann einen alten Code nicht erneut anzeigen. Verlorene Codes werden gezielt ersetzt.

Klarnamenprojektionen und offizielle benannte Nachweise brauchen eine schulisch geregelte Aufbewahrung. Ein aktuelles ASV-Verzeichnis allein reicht nach Abgang oder Löschung nicht zwingend für die spätere Zuordnung alter Leistungsnachweise. Dafür ist ein begrenztes schulisches Archiv mit erforderlicher Zuordnung vorzusehen.

## 8. Importvertrag und Abgleichlogik

Ein Import ist ein autorisierter, versionierter Vorgang mit:
- Schulmandant, Quell-Namensraum, Schlüsselversion;
- Zielschuljahr und fachlichem Wirksamkeitsdatum;
- `partial` oder `complete_roster` als ausdrücklich gewähltem Umfang;
- benannten Klassen bzw. dem gesamten bestätigten Schulbestand;
- Snapshot-Revision, Vorschau, bestätigtem Plan und eindeutiger `importId`.

Eine ausgewählte CSV wird nicht allein aufgrund ihrer Größe als vollständiger Bestand behandelt. Eine Klasse fehlt nicht automatisch „an der Schule“.

### Lokale Prüfung

Die Datei wird nur im freigegebenen Client gelesen. Zugelassen sind stabiles Differenzierungsmerkmal, Klasse sowie optional Vor-/Nachname für die schulische Vorschau. Schuljahr und Umfang können außerhalb der Datei angegeben werden. Weitere ASV-Felder werden nicht übernommen.

Fehlende IDs, uneindeutige Spalten, widersprüchliche Dubletten, unbekannte Klassen oder Quellen stoppen die betroffenen Änderungen. Identische Mehrfachzeilen werden nur nach eindeutigem Vertrag zusammengeführt. Mehrere Kursmitgliedschaften derselben Person sind zulässig; widersprüchliche Stammklassenzuordnungen werden geprüft.

### Ergebnisfälle

| Fall | Geplante Behandlung |
|---|---|
| Bekannter matchKey, gleiche Klasse | Vorhandenes Konto und Mitgliedschaft wiederverwenden |
| Bekannter matchKey, andere Klasse / neues Schuljahr | Dasselbe Konto; neue Jahresmitgliedschaft, alte zeitlich abschließen |
| Wiederholung oder Überspringen einer Stufe | Tatsächliche ASV-Zuordnung übernehmen; keine automatische „+1“-Versetzung |
| Neuer matchKey bei bereits gebundenem Quellbestand | Neuer Kontoentwurf; Ausgabe eines persönlichen Codes erst bei kontrollierter Aktivierung |
| Vorhandenes manuelles/Legacy-Konto ohne ASV-Bindung | Schulisch verifizierte Erstbindung an die vorhandene StudentIdentity; keine automatische Zuordnung über Alias oder Name |
| Fehlende Zeile im Teilimport | Keine Abgangs- oder Löschwirkung |
| Fehlende Zeile im bestätigten vollständigen Bestand | Als Abgangskandidat zur Prüfung anzeigen; kein automatisches Löschen |
| Namensänderung bei gleicher ASV-ID | Konto bleibt; nur schulische Namensprojektion aktualisieren |
| Geänderte/neue ASV-ID einer bekannten Person | Lokale Klärung und kontrollierte Umbindung; kein Namensmatching |
| Rückkehr vor endgültiger Löschung | Bestehende gesperrte Identität nach Prüfung reaktivieren; Credential-Policy beachten |
| Rückkehr nach rechtmäßiger vollständiger Löschung | Neue Identität; keine ewige Identifikationshistorie |

Namen, Initialen, Geburtsdatum und Klassenname werden niemals als automatischer Ersatzschlüssel verwendet. Bei fehlendem DM ist ein schulisch verwalteter eigener stabiler Schlüssel mit manuell bestätigter Erstzuordnung möglich. Eine Datei mit nur Namen und Klassen ermöglicht keine zuverlässig automatische Wiedererkennung über Jahre.

Bei der ersten Einrichtung eines Importprofils werden vorhandene Konten ohne ASV-Bindung gesondert geprüft. Ein leerer Match-Index ist kein Beleg, dass alle Personen neu sind. Eine berechtigte Administration bestätigt vorhandene Zuordnungen mit einer verifizierten lokalen Crosswalk-Liste; unaufgelöste Fälle bleiben offen. Ein Selbstbeitrittskonto wird erst nach Identitätsprüfung angebunden.

### Vorschau und Bestätigung

Vor Anwendung werden „unverändert“, „Klasse gewechselt“, „neu“, „möglicher Abgang“ und „Konflikt“ angezeigt. Ungewöhnlich große Abweichungen, falsches Schuljahr und leere vollständige Bestände erhalten eine explizite Kontrolle. Abgänge werden separat bestätigt; Kontolöschung ist keine normale Importaktion.

## 9. Anwendung, Wiederholung und Abbruch

Der Server prüft Mandant, Rollen, zulässige Felder, eindeutige Indizes und aktuelle Revision. Ein vorgeprüfter Plan ist nur gegen diese Revision gültig. Parallele Importe benötigen eine schulweite Import-Lease und Konflikterkennung; ein veralteter Plan wird neu berechnet.

Der Vorgang läuft als persistierte Stufenfolge: `prepared -> applying -> applied`, mit einem Fehler-/Konfliktzustand und wiederaufnehmbaren einzelnen Operationen. Große Bestände werden in begrenzten Batches verarbeitet. Ein Abbruch darf keinen teilweise aktualisierten Bestand als vollständig abgeschlossen darstellen.

`importId` und stabile Operations-IDs machen Wiederholung idempotent. Nach verlorenem Netzwerkresultat fragt der Client den bestehenden Vorgang ab, statt einen neuen anzulegen. Technische Journale enthalten notwendige pseudonyme Zuordnungen und Status, aber keine Namen, Roh-IDs oder Zugangscodes.

Neue Konten bleiben bis zum abgeschlossenen Vorgang inaktiv. In Modus B wird vor Aktivierung die vollständige neue Mapping-Revision schulisch gesichert und deren Abschluss bestätigt. Zugangscodes werden separat einmalig ausgegeben. Bei unterbrochener Ausgabe gezielt neu erzeugen; keine dauerhaft abrufbare Klartext-Codeliste.

Rollback betrifft nur vom Import vorgenommene organisatorische Änderungen. Bereits entstandene Prüfungsdaten werden nicht gelöscht oder umgeschrieben. Offene Attempts und laufende Prüfungen brauchen eine vor Umsetzung festgelegte Konfliktbehandlung; Standard ist keine automatische Änderung ihrer Autorisierung während der Durchführung.

## 10. Schuljahr, Klassen und historische Leistungen

Klassen bekommen eine unveränderliche technische `classId`, `schoolId` und `schoolYear`. „9b“ des nächsten Jahres ist ein neues Klassenobjekt. Ein alter Jahresbestand wird nicht einfach umbenannt.

Mitgliedschaften erhalten Gültigkeitszeitraum, Quelle und Status. Ein Jahreswechsel erzeugt neue aktive Mitgliedschaften und beendet alte zum fachlichen Stichtag. Fachkurse und manuell gepflegte Gruppen werden nur verändert, wenn sie ausdrücklich im Importumfang liegen.

Bestehende Ergebnisse behalten `studentIdentityId`, damalige `classId`, `membershipId`, `assignmentId`, `sessionRunId` und `aliasSnapshot`. Neue Klassenzugehörigkeit darf alte Resultate nicht neu etikettieren. Secure Assessment bleibt die alleinige Attempt-, Submission- und Bewertungsengine.

Ein minimaler Schulmandant mit Importadministration, Stellvertretung und class-bezogener Berechtigung ist dafür Voraussetzung. Das bisherige ausschließlich an eine einzelne `ownerId` gebundene Klassenmodell reicht für schulweite Importe und Personalwechsel nicht. Dies ist ein begrenzter architektonischer Erweiterungsbedarf; kein Auftrag für ein öffentliches Schulverzeichnis, Elternkonten oder Schulchat.

## 10a. Lehrkraftwechsel und schulische Übergabe

**Empfehlung:** Schulische Klassen, Mitgliedschaften, Prüfungsdurchläufe und aufzubewahrende Nachweise werden im Schulmandanten verwaltet. Jede Lehrkraft meldet sich mit ihrem eigenen persönlichen Konto an und bekommt eine begrenzte Zuständigkeit. `createdBy` dokumentiert die Autorenschaft; dieser Verweis ist keine dauerhafte alleinige Zugriffsberechtigung. Ein Erstellerkonto darf durch sein Ausscheiden keine schulischen Bestände unzugänglich machen.

### Rollen und Zuständigkeitsumfang

| Rolle | Empfohlene Befugnis |
|---|---|
| Schuladministration und benannte Stellvertretung | Personen verifiziert aufnehmen, Schulmitgliedschaften/Zuständigkeiten verwalten, Importbetrieb und Recovery organisieren |
| Lehrkraft | Zugewiesene Klassen bzw. Kurse und Fächer im festgelegten Schuljahr/Zeitraum bearbeiten; erforderliche Ergebnisse lesen |
| Vertretung / Co-Teacher | Ausdrücklich erteilte, begrenzte Berechtigung mit Enddatum; kein pauschaler Schulzugriff |
| Berechtigte Archiv-/Schulleitungsrolle | Zweckgebundener Zugriff auf erforderliche historische Unterlagen im Einzelfall |

Technische Administration erhält nicht automatisch Leserechte für sämtliche Leistungen. Die [KM-Vorgaben zu digitalen Leistungsnachweisen](https://www.km.bayern.de/gestalten/digitalisierung/durchfuehrung-und-speicherung-von-digitalen-leistungsnachweisen) verlangen einen auf aktuelle Zuständigkeit und Erforderlichkeit begrenzten Zugriff. Alte Leistungen einer Klasse werden deshalb nicht pauschal an jede Nachfolgeperson freigegeben.

Ein Zuordnungsdatensatz umfasst `schoolId`, `teacherUid`, Klasse/Kurs, Fach bzw. konkreten Assignment-Umfang, Rechte, Beginn/Ende und Berechtigungsrevision. Lehrkraftkonten werden nicht allein anhand gleicher Namen oder E-Mail-Domänen zusammengeführt. Die Schuladministration bestätigt Person und Zuständigkeit. Ein bloßer E-Mail-Wechsel ändert die Schülerkonten nicht.

### Bedienablauf bei einer neuen Lehrkraft

1. Schuladministration oder Stellvertretung lädt die verifizierte neue Lehrkraft in den Schulbereich ein; die Lehrkraft verwendet ihren eigenen Login.
2. Die Administration wählt „Zuständigkeit übergeben“, etwa „10b – Mathematik“, und einen Wirksamkeitstermin.
3. Eine Vorschau zeigt aktive Tests/Aufträge, erforderliche Ergebnisse, befristete Übergaberechte und laufende Prüfungen. Private Testentwürfe der alten Lehrkraft sind davon ausgenommen. Wiederverwendbare Vorlagen werden nur bei entsprechender schulischer Freigabe geteilt.
4. Die neue Lehrkraft erhält die zugewiesenen GradeCrew-Berechtigungen **und** Zugriff auf die erforderliche schulische Namenszuordnung. Bei der üblichen Fachlehrkraft ist hierfür kein schulweiter HMAC-Schlüssel nötig.
5. Zum Termin enden die bisherigen Rechte für diesen Zuständigkeitsbereich. Bei endgültigem Schulaustritt wird zusätzlich die Schulmitgliedschaft geschlossen. Eine notwendige Übergabe-/Korrekturphase wird ausdrücklich befristet, nicht stillschweigend verlängert.
6. Die Administration prüft den neuen Zugang und den Zugriffsentzug. Der Vorgang protokolliert Akteure, Umfang, Termin und Ergebnis; keine Schülernamen, Antworten oder Codes in der technischen Historie.

Die GradeCrew-Berechtigung und die Berechtigung zum schulischen Namensspeicher sind zwei getrennte Systeme. Die Übergabe führt beide als kontrollierte Schritte und gilt erst als abgeschlossen, wenn beide bestätigt sind. Ein Fehler in einem Schritt wird sichtbar nachbearbeitet; die alte Berechtigung darf dadurch nicht unbemerkt unbegrenzt weiterlaufen.

Beispiel: Frau A unterrichtet 9b in Mathematik, Herr B übernimmt im nächsten Jahr 10b. Die Schüler behalten ihre StudentIdentity und Zugangscodes. Herr B erhält die Zuständigkeit für 10b/Mathematik und die zugehörige Namenszuordnung. Frau A verliert den betreffenden Zugriff. Alte Ergebnisse behalten damalige Klasse, Run, Alias und Autorenschaft; historische Einsicht für Herrn B wird nur im erforderlichen Umfang erteilt.

### Zugriffsentzug und Prüfungen

Der Server prüft aktuelle Schulmitgliedschaft und Berechtigungsrevision bei geschützten Zugriffen. Ein vorhandener Login oder veraltete Claims dürfen ausgeschiedenen Lehrkräften keinen Zugriff erhalten. Bei Entzug werden betroffene Berechtigungen und gegebenenfalls Sitzungen widerrufen; private Bereiche bzw. andere Schulmandanten desselben Kontos bleiben eigenständig.

Bereits heruntergeladene Daten lassen sich durch einen Server-Klick nicht zurückholen. Die Schule muss nicht mehr erforderliche lokale Kopien, Gerätezugriffe und Freigaben im Rahmen ihres Ausscheidensprozesses bereinigen.

Laufende Prüfungen werden vor einem geplanten Wechsel geprüft und kontrolliert abgeschlossen oder unter bewusster Zuständigkeit weitergeführt. Ein dringender Zugriffsentzug kann die alte Lehrkraft sofort sperren; die Administration bestimmt eine berechtigte Nachfolge. Attempts, Bewertungen und Prüfungsinhalte werden dabei nicht automatisch umgeschrieben.

### Wechsel der Administration oder vollständiger Ausfall

Für den Schulbetrieb sind eine bestätigte Administration und mindestens eine aktive Stellvertretung mit eigenem Konto und geregelter Recovery vorzusehen. Die letzte aktive Administration wird nicht ohne gesicherte Nachfolge aus dem normalen Verwaltungsablauf entfernt.

Scheidet eine Administration aus, übernimmt die Stellvertretung. Wenn die ausscheidende Person den Schulschlüssel kennen konnte, reicht das Entfernen ihres Cloudzugangs nicht zum Widerruf dieses Wissens. Die Schule prüft dann Schlüsselwechsel und führt gegebenenfalls die in Abschnitt 11 beschriebene Migration aus; bestehende Schülerkonten bleiben erhalten. Beim normalen Fachlehrkraftwechsel ist keine HMAC-Rotation nötig.

Sind alle administrativen Konten unzugänglich, erfolgt die Wiederaufnahme nur durch eine verifizierte schulische Stelle mit dokumentiertem Recovery-Verfahren. Der Support darf keine Schule aufgrund einer bloßen Behauptung übertragen. Zugriffswiederherstellung im Schulmandanten ersetzt nicht die Wiederherstellung eines verlorenen HMAC-Schlüssels; dieser benötigt das schulische Backup.

Für eine zunächst allein nutzende Lehrkraft muss spätestens vor schulweiter Nutzung oder einem Personalwechsel ein verifizierter Schulbereich mit Administration/Stellvertretung eingerichtet sein. Eine automatische Zuordnung zur Schule allein über einen Namen oder eine Maildomain ist nicht ausreichend.

### Noch nicht implementierte Akzeptanzfälle

- Eine neue Lehrkraft übernimmt genau den ausgewählten Bereich; Schülerkonten/Codes bleiben gleich.
- Alte Lehrkraft kann nach Ablauf auch mit vorhandenem Login keine weiteren Daten dieses Bereichs lesen.
- Vertretungsrechte enden zum Termin; Archivzugriff bleibt eigenständig begrenzt.
- Die Löschung/Deaktivierung eines Lehrkraftkontos löscht keine schulischen Schülerkonten oder Nachweise.
- Der Wechsel funktioniert ohne Mitwirkung der ausgeschiedenen Lehrkraft über die verifizierte Administration/Stellvertretung.
- Namensspeicher und GradeCrew-Zugriff werden gemeinsam geprüft; unvollständige Übergaben bleiben sichtbar.
- Adminwechsel/Recovery und nötige Schlüsselrotation erzeugen keine neuen Schülerkonten.

## 10b. ASV-Lehrkräfteimport und mehrere Lehrkräfte in derselben Klasse

Der Nutzer hat Lehrkräfteimport und mehrere Fachlehrkräfte je Klasse als gewünschte Erweiterung der Architektur benannt. Beides wird im selben Schulmodell geplant; Produktcode bleibt außerhalb des Auftrags.

### ASV als Quelle für Personal und Unterricht

Die [ASV-Schnittstelle für Notenverwaltung](https://doku.asv.bayern.de/alle/schnittstellen/xml_sst/xmlexportnotenverwaltung/start) kann Schul-, Schüler-, Lehrer- und Unterrichtsdaten exportieren. Das [lokale Differenzierungsmerkmal](https://doku.asv.bayern.de/alle/schnittstellen/xml_sst/xmlexport) ist auch für Lehrkräfte dokumentiert. Die konkrete CSV-/XML-Vorlage der Schule und ihre Unterrichtszuordnungen sind noch zu bestätigen.

Ein Lehrkräfteimport erzeugt bzw. aktualisiert zunächst einen schulischen Personalbestand. Minimal erforderlich sind die bestätigte stabile Lehrkraftkennung und, sofern für Einladung/Verwaltung notwendig, der Name bzw. eine dienstliche Kontaktadresse. Fach-/Klassen-/Kurszuordnungen werden nur aus einem dafür geeigneten Exportprofil übernommen. ASV-Passwörter, Initialpasswörter anderer Dienste und sonstige Personalaktenfelder werden nicht übernommen.

Für den pseudonymen technischen Abgleich wird lokal eine **eigene Lehrkraft-Domäne** verwendet:

`teacherMatchKey = HMAC-SHA256(Kschool, UTF8(JSON.stringify(["gradecrew-asv-teacher-match-v1", schoolId, sourceNamespace, teacherLocalDM])))`

Der Index verweist auf eine stabile schulische `schoolTeacherId`, die separat mit dem verifizierten persönlichen `teacherUid` verbunden wird. Lehrkraft und Schülerperson mit eventuell gleichem numerischem DM werden durch die verschiedenen Domänen niemals zusammengeführt. Der ASV-Abgleich ist keine Anmeldung und kein Berechtigungsnachweis.

Neue Personalzeilen bleiben `pending`, bis die Schuladministration Person und persönlichen Login verifiziert zugeordnet hat. Ein vorhandenes GradeCrew-Konto wird kontrolliert verbunden; Namens- oder Mailänderung erzeugt kein neues schulisches Personalprofil. Der normale persönliche Lehrkraftlogin bleibt erhalten. Kein geteilter Schul-Login und keine Weitergabe des Logins der Vorgängerperson.

Schuladministration wird nicht allein durch einen ASV-Personaleintrag vergeben. Unterrichtszuordnungen werden als Änderungsvorschlag angezeigt und durch eine autorisierte Administration bestätigt. Importquelle, Schuljahr, Umfang, Revision und manuelle Ausnahmen sind nachweisbar; ein Wiederimport überschreibt keine ausdrückliche Vertretungs- oder Sonderfreigabe ohne Abgleich. Ein Teilimport bewirkt keinen Personalaustritt; ein möglicher Abgang wird geprüft und beendet nur die betroffene Schulmitgliedschaft/Zuständigkeit.

Die besonders strenge Vorgabe zur serverseitigen Vermeidung von Schülerklarnamen bedeutet kein pauschales Verbot erforderlicher Lehrkraftnamen im Dienstprofil. Lehrerprofil, Kontakt-/Login-Daten und schulischer Personalabgleich sind getrennte Zwecke mit eigener Erforderlichkeits- und Aufbewahrungsprüfung.

### Eine Klasse, mehrere Zuständigkeiten

Eine Klasse wie `9b, 2026/27` existiert einmal im Schulmandanten und enthält einen gemeinsamen Schülerbestand. Sie wird nicht pro Fachlehrkraft dupliziert.

| Klasse | Lehrkraft | Zuständigkeitsbereich |
|---|---|---|
| 9b, 2026/27 | Lehrkraft A | Deutsch |
| 9b, 2026/27 | Lehrkraft B | Englisch |
| 9b, 2026/27 | Lehrkraft C | Mathematik |
| 9b, 2026/27 | Lehrkraft D | Befristete Vertretung in Englisch |

Jede zugewiesene Lehrkraft kann eigene Prüfungen in ihrem Bereich erstellen und an dieselben Schüleridentitäten der Klasse freigeben. Der persönliche Schülerzugang bleibt derselbe. Das Schüler-Home zeigt die aktuell autorisierten Tests dieser verschiedenen Lehrkräfte/Fächer.

Ein `teacherAssignment` bindet Lehrkraft, Klasse/Kurs, Fach, Schuljahr, Rechte und Gültigkeitszeitraum. Ein Prüfungsassignment verweist zusätzlich auf die verantwortliche Lehrkraft bzw. autorisierte Co-Teacher-Gruppe und den zugehörigen Unterrichtsbereich. Bestehender `quizId + sessionRunId`-Lifecycle bleibt maßgeblich.

Standardmäßig sieht die Deutschlehrkraft die für ihren Unterricht notwendigen Schülerzuordnungen und ihre eigenen bzw. ausdrücklich gemeinsam verantworteten Deutschprüfungen. Englischresultate sind nicht automatisch freigegeben. Eine erforderliche zusätzliche Zuständigkeit, etwa Klassenleitung, wird ausdrücklich und begrenzt vergeben. Gemeinsamer Unterricht kann mehreren Lehrkräften Rechte auf dieselbe Prüfung geben; Änderung/Bewertung bleibt nachvollziehbar.

Das Veröffentlichen einer Prüfung ist eine eigene Berechtigung. Änderung des Klassenbestands, personalweiter ASV-Import, Verwaltung des Schulschlüssels und Zurücksetzen persönlicher Schülercodes werden nicht automatisch jeder Fachlehrkraft erlaubt.

Ein Lehrkraftwechsel ersetzt nur die betreffende Zuständigkeit, etwa `9b/Englisch`. Andere Fachlehrkräfte und ihre Prüfungen bleiben bestehen. Bei Schuljahreswechsel werden die Zuständigkeiten für den neuen Jahresbestand bestätigt, statt sämtliche alten Fachrechte unbegrenzt fortzuführen.

### Noch nicht implementierte Akzeptanzfälle

- Mehrere Lehrkräfte veröffentlichen unabhängig Deutsch-/Englischtests an dieselbe Klasse ohne doppelte Schülerkonten.
- Schüler sehen beide freigegebenen Tests über denselben persönlichen Zugang.
- Eine Fachlehrkraft kann keine fremden Fachleistungen lesen oder bearbeiten, sofern keine ausdrückliche zusätzliche Freigabe besteht.
- ASV-Personalimport erkennt bestehende Lehrkräfte wieder, erzeugt aber weder automatisch Adminrechte noch doppelte persönliche Logins.
- Gleichlautende Schüler-/Lehrkraft-DMs kollidieren nicht.
- Lehrkraftwechsel und Teilimporte erhalten fremde Fachzuständigkeiten und manuelle Vertretungsfreigaben.

## 11. Schlüsselverlust, Rotation und Quellenwechsel

**Gerätewechsel:** Derselbe gesicherte Schultresor wird auf einem freigegebenen Ersatzgerät genutzt. Konten und Abgleich bleiben erhalten.

**Verlorener Schlüssel:** Zuerst geprüfte schulische Sicherung wiederherstellen. Ist weder Schlüssel noch verifizierte lokale Crosswalk-Zuordnung verfügbar, kann GradeCrew rohe ASV-IDs nicht aus den Pseudonymen zurückgewinnen. Matching und Massenneuanlage werden gestoppt. Recovery erfolgt über schulisch verifizierte Einzel-/Crosswalk-Zuordnung; ohne Beleg keine Zusammenführung.

**Rotation:** Ein bloßer Geräte-/Passwortwechsel rotiert den HMAC-Schlüssel nicht. Bei notwendiger Schlüsselrotation berechnet ein autorisierter Client mit altem und neuem Schlüssel für dieselben lokal verifizierten IDs die beiden matchKeys. Der Server bindet neue Indexeinträge an dieselben StudentIdentity-IDs, prüft Konflikte und schaltet nach vollständiger Prüfung um. Alte Indexversion wird entsprechend dem Löschkonzept entfernt. Rotation des Import-Schlüssels rotiert keine Schüler-Zugangscodes.

**ASV-Datenbasiswechsel:** Neuer Quell-Namensraum, lokal verifizierter Crosswalk, kontrollierte Umbindung. Gleiches DM in verschiedenen Datenbasen ist kein Identitätsbeweis.

**Kompromittierter Schlüssel:** Zugriff entziehen, schulischen Vorfallprozess starten, Auswirkungen auf Pseudonyme prüfen und kontrolliert migrieren. Stable Pseudonyme können bei Kenntnis von Schlüssel und ASV-Bestand zugeordnet werden.

## 12. Datenschutz und Aufbewahrung

Klarnamensverarbeitung in der Schule ist nicht pauschal verboten. Art. 85 Abs. 1 BayEUG verlangt Erforderlichkeit. [§ 46 BaySchO](https://www.gesetze-bayern.de/Content/Document/BaySchO2016-46) und [Anlage 1](https://www.gesetze-bayern.de/Content/Document/BaySchO2016-ANL_1), seit 01.08.2026, konkretisieren den Verfahrensrahmen. Eine exportierbare ASV-Spalte ist für sich keine Weitergabefreigabe.

Unser Zielbild minimiert zusätzliche Klarnamensspeicherung. Für dieses Schulverfahren bleiben pseudonyme Konten personenbezogen, weil die Schule zuordnen kann. Maßgeblich sind Art. 4 Nr. 5, 5, 6, 25, 28, 32 und gegebenenfalls 35 [DSGVO](https://eur-lex.europa.eu/legal-content/DE-EN/TXT/?uri=CELEX%3A02016R0679-20160504). Das Muster ersetzt keine schulische Prüfung des konkreten Einsatzes.

Account-, Import-, Protokoll-, Übungs- und Leistungsdaten erhalten getrennte Löschregeln. Anlage 1 enthält differenzierte Fristen; ein dauerhaft aktives Konto erlaubt nicht die unbegrenzte Speicherung aller früheren Aktivitäten. [§ 40 BaySchO](https://www.gesetze-bayern.de/Content/Document/BaySchO2016-40) regelt für die dort bezeichneten Leistungsnachweise grundsätzlich zwei Jahre ab Ende des Anfertigungsschuljahres, mit Ausnahmen. Ein Schuljahresimport darf weder Fristen zurücksetzen noch sämtliche alten Daten pauschal behalten oder vernichten.

Nach bestätigtem Abgang werden aktuelle Berechtigungen beendet und gegebenenfalls Login/Refresh Tokens gesperrt. Offizielle Nachweise und erforderliche schulische Identitätszuordnungen bleiben nur im geregelten Archiv. Technische Match-Indizes und Reaktivierungsdaten dürfen nicht unbegrenzt für eine hypothetische Rückkehr bestehen bleiben.

Für echten Einsatz müssen Verantwortlichkeit, Auftragsverarbeitung, Datenstandorte, Unterauftragnehmer, Transparenz, konkretes Löschkonzept und DSFA-Erforderlichkeit geklärt sein. Die [KM-Handreichung](https://www.km.bayern.de/recht/datenschutz-an-schulen) ist der schulische Ausgangspunkt. Schulart und Trägerschaft sind hier noch nicht bestätigt.

## 13. Grenzen des Schutzversprechens

Die Zusage lautet: GradeCrew sieht im vorgesehenen Importprotokoll keine Klarnamen, rohe ASV-Kennungen oder Schulschlüssel. Diese Aussage muss später durch Prüfung der tatsächlichen Datenflüsse belegt werden.

Clientseitige Verarbeitung ist kein Schutz gegen kompromittierte Geräte, Browsererweiterungen oder einen manipulierten Importclient. Der Import benötigt einen freigegebenen, überprüfbaren Client ohne Drittanbieter-Skripte, Session-Replay, Formularaufzeichnung oder Inhaltslogging. Ein von GradeCrew ausgeliefertes Webskript verarbeitet lokal weiterhin die Rohdaten; dessen Integrität bleibt Teil des Vertrauensmodells.

Keine Namen, ASV-IDs, matchKeys, Aliase, individuellen StudentIdentity-IDs oder Codes in PostHog oder KI-Prompts. Produktmetriken verwenden nur erforderliche Aggregate. Eine streng geschützte, zweckgebundene administrative Importhistorie ist davon getrennt. Freitextantworten bleiben ein eigener Datenschutzpfad.

Der HMAC erschwert Zuordnung ohne Schulschlüssel, verhindert jedoch keine Verkettung innerhalb der Schule, solange GradeCrew Konto und Ergebnisse zusammenführt. Deshalb keine Werbeaussage „anonym“ und kein Schulschlüssel als universeller Schlüssel für andere Dienste.

## 14. Später zu prüfende Akzeptanzfälle

Diese Liste definiert Anforderungen; sie sind noch nicht implementiert oder getestet.

- Dieselbe DM in zwei Schuljahren ergibt denselben matchKey und dieselbe StudentIdentity.
- Klassenwechsel, Wiederholung und Namensänderung erzeugen kein neues Konto.
- Gleiches DM in zwei Schulmandanten bzw. Quellen wird nicht zusammengeführt.
- `xml_id`, Zeilennummer und wechselnde Export-IDs werden als stabile Kennung abgelehnt.
- Führende Nullen und lange Text-IDs bleiben erhalten.
- Teilimport, leere Datei, falsches Schuljahr und falscher Schlüssel bewirken keinen Massenabgang.
- Dubletten und parallele Importe führen nicht zu Doppelkonten.
- Wiederholung nach unbekanntem Netzwerkresultat setzt denselben Vorgang fort.
- Schlüssel-/Gerätewechsel, Recovery und Rotation erhalten bestehende Konten.
- Code bleibt bei Jahreswechsel gültig; Reset widerruft ausschließlich die betroffene Credential.
- Alte Ergebnisse und aktive Prüfungen werden nicht umetikettiert.
- Unberechtigte Lehrkräfte/Schüler können weder Importindex noch fremde Zuordnungen lesen.
- Netzwerkmitschnitt, Storage- und Telemetrieprüfung belegen die vorgesehenen Grenzen.
- Abgang, Archivierung und endgültige Löschung folgen den beschlossenen Datenfristen.

## 15. Ein nächster Schritt

Das konkrete ASV-Exportprofil mit Spaltenüberschriften und ausschließlich synthetischen Beispielen bestätigen: Enthält es das dokumentierte lokale Differenzierungsmerkmal, bleibt es in zwei Exporten desselben Quellbestands gleich, und welche Schulart/Trägerschaft ist betroffen? Danach diesen Entwurf fachlich prüfen. Produktcode und Deploy bleiben außerhalb dieses Auftrags.
