# Urheberrecht und Rechtehinweise – Testify Beta

## Einordnung vor einer Freigabe für weitere Schulen

- Die Upload-Bestätigung dokumentiert eine Erklärung der Lehrkraft. Sie ist weder eine Lizenz für fremdes Material noch ein Ausschluss möglicher Ansprüche gegen den Betreiber. Eine AGB-Freistellung könnte zusätzliche vertragliche Rechte eröffnen, darf aber nicht als Haftungsschutz „gegen null“ dargestellt werden. Wortlaut, Wirksamkeit und Zuordnung des Vertragspartners (Lehrkraft, Schule, Träger) müssen juristisch geprüft werden.
- § 60a UrhG erlaubt unter bestimmten Voraussetzungen begrenzte Nutzungen für nicht kommerziellen Unterricht und nennt ausdrücklich Einschränkungen für Unterrichtswerke. Ob dadurch gerade die Speicherung bei Testify und die Übermittlung der Originaldatei an einen externen KI-Anbieter gedeckt sind, ist separat zu prüfen. Bis dahin verbietet der Uploadhinweis Verlagsseiten ohne ausdrückliche Erlaubnis für diese Verarbeitung.
- Das UrhDaG erfasst nach § 2 nicht automatisch jeden Dienst mit Uploads: Es setzt unter anderem öffentliche Zugänglichmachung großer Mengen von Drittinhalten als (Mit-)Hauptzweck, Organisation der Inhalte, gewinnorientierte Bewerbung und Wettbewerb mit Online-Inhaltediensten voraus. Testify lädt KI-Ausgangsmaterial privat in Storage hoch, gibt aber Tests per Code ohne Schülerlogin und Vorlagen per Freigabecode zugänglich. Ein Code allein garantiert keinen geschlossenen Klassenraum. Der genaue Dienst und seine Vertriebsform sind vor dem Vertrieb rechtlich einzuordnen.
- DSA-Hostingpflichten und mögliche Haftungsausschlüsse hängen vom tatsächlichen Dienst und seiner Reaktion auf konkrete Hinweise ab; eine Checkbox ersetzt keinen Prozess. Ebenso benötigen Datenschutzhinweise, Schulverträge, OpenAI-Datenverarbeitung und Löschfristen eine gesonderte Prüfung.

## Bereits technisch vorhanden

1. Vor dem KI-Upload muss die Lehrkraft Speicherung/Übermittlung an einen externen KI-Dienst und das Fehlen personenbezogener Schülerdaten bestätigen. Die Originaldatei liegt nur vorübergehend privat in Storage und wird nach dem Verarbeitungsversuch gelöscht; verwaiste Uploads räumt eine tägliche Funktion auf.
2. Ein öffentlich zugängliches Formular **„Rechtsverletzung melden“** nimmt Werk, Testcode/Link, Kontaktdaten und Begründung auf. Es speichert Meldungen ohne KI-Verarbeitung in der privaten Admin-Feedbackliste unter `category: rights`. Unauthentifizierte Einreichungen sind pro Quelle und Tag begrenzt. Die Meldung löscht keinen Test automatisch.
3. Admins können nach Prüfung einen konkreten Test vorübergehend sperren (`rightsHold`). Firestore-Regeln unterbinden dann den öffentlichen Schülerzugriff und Vorlagenzugriff; nur Admins können die Sperre aufheben. Eigentümer können den Test weiter zur Klärung bearbeiten, aber dessen gespeicherte Sperre nicht ändern oder den Test löschen. Die Aktion wird im Admin-Log festgehalten.

## Betrieb – manuell erforderlich

1. Zuständigkeit und Vertretung festlegen; eingehende Rechtehinweise regelmäßig und bei dringenden Fällen zeitnah prüfen. Das Formular sendet derzeit **keine E-Mail oder Push-Benachrichtigung**. Ohne zuverlässig überwachtes Postfach ist kein schneller Reaktionsprozess zugesichert.
2. Rechtebehauptung, Fundstelle und vorhandene Lizenz prüfen; bei begründetem Verdacht Zugang über `rightsHold` sperren. Den Fall und den Zeitpunkt dokumentieren, Meldenden und betroffene Lehrkraft kontaktieren und eine Prüfung oder Gegendarstellung ermöglichen. Sperren erst nach Klärung aufheben.
3. Eine verifizierte Kontaktadresse/Impressum und rechtlich geprüfte Nutzungsbedingungen, Freistellung, Datenschutzhinweise, Aufbewahrungs- und Löschregeln ergänzen. Kein nicht existierendes `abuse@`-Postfach veröffentlichen. Rechtliche Einordnung und Verträge vor dem kommerziellen Betrieb anwaltlich prüfen lassen.

Amtliche Ausgangsquellen: [§ 60a UrhG](https://www.gesetze-im-internet.de/urhg/__60a.html), [§ 2 UrhDaG](https://www.gesetze-im-internet.de/urhdag/__2.html), [DSA-Verordnung (EU) 2022/2065](https://eur-lex.europa.eu/eli/reg/2022/2065/oj/de).
