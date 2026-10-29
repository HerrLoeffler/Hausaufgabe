import {companyAudit,areaStatus} from './company-status.mjs';
// Preserved V3 snapshot at b912d03; no live feed.
export const areas=[
  {
    "id": "strategy",
    "name": "Strategie & Führung",
    "short": "Richtung, Ziele, Prioritäten",
    "purpose": "Wofür gibt es GradeCrew, welche Ziele verfolgen wir und was hat jetzt Vorrang?",
    "owner": "Martin / Unternehmensführung",
    "results": "Unternehmensziele, Prioritäten, Geschäftsmodell",
    "scope": "Strategie und Entscheidungen. Beauftragt Facharbeit und prüft Ergebnisse; übernimmt keine technische Ausführung."
  },
  {
    "id": "product",
    "name": "Produkt & Konzepte",
    "short": "Ideen, Funktionen, Design",
    "purpose": "Welche Probleme lösen Web-App, Native-App und Games? Welche Konzepte und Funktionen sind gültig?",
    "owner": "Produktverantwortung",
    "results": "Produktkonzept, Roadmap, Designs, Abnahmekriterien",
    "scope": "Ideeneingang, Konzepte, Funktionen, UX und Produktentscheidungen. Web, Native/Secure und Games sind Projekte unter diesem Blickwinkel."
  },
  {
    "id": "pedagogy",
    "name": "Pädagogik & Inhalte",
    "short": "Lernen, Didaktik, Aufgaben",
    "purpose": "Was sollen Lernende können und wie prüfen wir die fachliche und didaktische Qualität?",
    "owner": "Pädagogische Fachverantwortung",
    "results": "Lernziele, Aufgabenpool, Qualitätskriterien",
    "scope": "Lehrpläne, Kompetenzmodelle, Aufgaben, Hilfen und Lernwirksamkeit. Fachliche Freigabe wird nicht aus technischer CI abgeleitet."
  },
  {
    "id": "tech",
    "name": "Technik & Betrieb",
    "short": "Bauen, verbinden, betreiben",
    "purpose": "Wie setzen wir freigegebene Produktziele um und betreiben die Systeme zuverlässig?",
    "owner": "Zuständiger technischer Fachbereich",
    "results": "Kandidat, Tests, Releases, Betriebsnachweise",
    "scope": "Entwicklung, Architektur, Integrationen, Infrastruktur, Fehler und Releasebetrieb. Jeder Eingriff hat Scope, Owner und Nachweise."
  },
  {
    "id": "customers",
    "name": "Kunden & Schulbetrieb",
    "short": "Piloten, Feedback, Support",
    "purpose": "Wie kommen Schulen und Lehrkräfte erfolgreich in den Einsatz – und was lernen wir aus Rückmeldungen?",
    "owner": "Kunden-/Pilotverantwortung",
    "results": "Pilotplan, Onboarding, Feedbackfälle, Abnahmen",
    "scope": "Schul-/Kundenkontakte, Pilotbetrieb, Support, Rückmeldungen und Rollout. Keine Kopie sensibler Schülerdaten als Firmenwissen."
  },
  {
    "id": "market",
    "name": "Marketing & Vertrieb",
    "short": "Marke, Nachfrage, Partner",
    "purpose": "Wen wollen wir erreichen, mit welcher Botschaft und über welche Partner oder Vertriebsschritte?",
    "owner": "Marketing-/Vertriebsverantwortung",
    "results": "Positionierung, Kampagnen, Präsentationen, Pipeline",
    "scope": "Marke, Kommunikation, Verkauf, Partnerschaften und Außenauftritt. Nachrichten werden erst mit konkretem Versandauftrag verschickt."
  },
  {
    "id": "finance",
    "name": "Finanzen & Organisation",
    "short": "Budget, Kosten, Verwaltung",
    "purpose": "Welche Mittel stehen bereit, was kostet der Betrieb und welche organisatorischen Verpflichtungen bestehen?",
    "owner": "Kaufmännische Verantwortung",
    "results": "Budget, Kostenübersicht, Finanzierungsbedarf",
    "scope": "Kosten, Erlöse, Liquidität, Finanzierung, Buchhaltungsunterlagen und interne Organisation. Verbindliche Beratung bleibt bei qualifizierten Stellen."
  },
  {
    "id": "legal",
    "name": "Recht & Verträge",
    "short": "Rechte, Pflichten, Vereinbarungen",
    "purpose": "Welche Verträge, Lizenzen und rechtlichen Voraussetzungen brauchen konkrete Vorhaben?",
    "owner": "Rechts-/Vertragsverantwortung",
    "results": "Vertragsstand, offene Rechtsfragen, Fristen",
    "scope": "Verträge, AVV-Abstimmung, Lizenzen, Marken-/IP-Fragen und rechtliche Nachweise. Keine behauptete Rechtsfreigabe durch einen Agenten."
  },
  {
    "id": "privacy",
    "name": "Datenschutz & Sicherheit",
    "short": "Datenwege, Rechte, Risiken",
    "purpose": "Welche Daten verarbeiten wir, wer darf zugreifen und welche Schutzmaßnahmen sind nachgewiesen?",
    "owner": "Datenschutz-/Sicherheitsverantwortung",
    "results": "Datenfluss, Berechtigungskonzept, Prüfnachweise",
    "scope": "Zwecke, Datenwege, Rollen, Löschung, Sicherheitsanforderungen und Vorfälle. Rechtliche und technische Fachrollen bleiben bei Bedarf getrennt."
  }
];
const historicalTopics=[
  {
    "id": "GC-I18N-03",
    "aliases": [
      "GC-I18N-02",
      "GC-INTELLIGENCE-01"
    ],
    "area": "product",
    "relatedAreas": [
      "tech",
      "pedagogy"
    ],
    "real": true,
    "phase": "sourcecheck",
    "priority": 3,
    "title": "Internationalisierung",
    "statusLabel": "Teilstände abgleichen",
    "summary": "Oberfläche, Testsprache und Bewertungssprache sollen unabhängig funktionieren. Vorhandene DE/EN-Arbeit und spätere Spracherweiterungen bleiben als getrennte Bausteine erhalten.",
    "next": "Zentrale gleicht den vorhandenen Sprachstand und die offenen PRs ab; danach einen klar begrenzten nächsten Sprachauftrag festlegen.",
    "reason": "Kein neuer Gesamtneubau: vorhandene Sprachverträge und Änderungen zuerst zusammenführen. Aktuelle Releasezuordnung ist teilweise historisch.",
    "owner": "GradeCrew Zentrale → zuständiger Sprach-/Web-Fachchat; heutige Ausführungszuständigkeit bestätigen.",
    "stage": "Historische CI-Nachweise vorhanden; aktueller Gesamtumfang nicht erneut abgenommen.",
    "conflict": "TODO führt GC-I18N-02 als vorbereiteten Vertrag. GC-I18N-03 dokumentiert bereits Code und CI; Releasehistorie enthält weitere Sprachänderungen. Daraus folgt keine pauschale vollständige DE/EN-Freigabe.",
    "sources": [
      {
        "key": "I1",
        "label": "GC-I18N-03: Sprachlabels, Prüfungen und Integrationsgrenzen",
        "url": "https://github.com/HerrLoeffler/Hausaufgabe/blob/e2eb9b3eea38bfb01affc7f2e24ca01b03b6091f/workstreams/i18n-content-labels-gc-i18n-03.md",
        "stamp": "05./06.10.2026 · exakter Dokumentstand"
      },
      {
        "key": "I2",
        "label": "PR140: Koordination weiterhin offen",
        "url": "https://github.com/HerrLoeffler/Hausaufgabe/pull/140",
        "stamp": "22.10.2026 · offener PR gelesen"
      },
      {
        "key": "I3",
        "label": "TODO: GC-I18N-02 und Sprach-/Qualitätsverträge",
        "url": "https://github.com/HerrLoeffler/Hausaufgabe/blob/155bc1728c9dbb7b6cbeb1e6234ccbcad9cc130f/TODO.md",
        "stamp": "22.10.2026 · main-Snapshot"
      }
    ],
    "conversations": [
      {
        "title": "Internationalisierung GC",
        "id": "6ac2748c-7cc4-83ed-ace7-4d42752ee7ad",
        "text": "Als Vorgänger in I1 referenziert. Vollständige Besprechung noch nicht übernommen; dokumentierte Ergebnisse und Grenzen erhalten."
      }
    ],
    "tasks": [
      {
        "title": "Sprachkontexte trennen",
        "state": "Beschrieben und teilweise implementiert · I1",
        "children": [
          [
            "Oberflächensprache",
            "DE/EN-UI separat prüfen; keinen Testtext beim Umschalten verändern."
          ],
          [
            "Inhalts-/Testsprache",
            "Systemlabels wie Richtig/Falsch oder Bild A/B an contentLocale binden."
          ],
          [
            "Bewertungssprache",
            "Eigener Kontext; kein Ableiten allein aus der UI-Sprache."
          ]
        ]
      },
      {
        "title": "Vorhandenen Code zusammenführen",
        "state": "Aktueller Abgleich offen · I1/I2",
        "children": [
          [
            "Cache und Header",
            "PR137 und enthaltene Änderungen in PR139 nicht doppelt integrieren."
          ],
          [
            "Kompatibilität",
            "Gespeicherte Prüfungs-Fingerprints, Shuffle und opaque IDs erhalten."
          ]
        ]
      },
      {
        "title": "Sprachabnahme",
        "state": "Weitere Abnahme offen · I3",
        "children": [
          [
            "DE/EN auf Geräten",
            "Lange Texte, Fehlermeldungen und kleine Ansichten prüfen."
          ],
          [
            "Weitere Sprachen",
            "Idee erhalten; noch kein freigegebener Sprachumfang."
          ]
        ]
      }
    ],
    "decisions": [
      [
        "Nächsten Sprachumfang festlegen",
        "Vorschlag zur Entscheidung nach Bestandsabgleich: vollständige DE/EN-Abnahme oder weiterer Sprachumfang. Keine neue Sprache hier freigegeben."
      ],
      [
        "Integration ordnen",
        "Technische Klärung: welche früheren Änderungen sind bereits enthalten und welcher Kandidat bleibt tatsächlich offen?"
      ]
    ],
    "parked": [
      [
        "Weitere Sprachen",
        "Erst nach Abnahme des gemeinsamen Sprachvertrags erneut vorlegen. Auslöser: bestätigter DE/EN-Stand."
      ]
    ],
    "history": [
      {
        "title": "Bestehende Festlegung",
        "text": "UI-, Inhalts- und Bewertungssprache getrennt; authored Aufgaben, Lösungen und IDs nicht durch UI-Wechsel verändern (I1)."
      },
      {
        "title": "22.10. · Quellenabgleich",
        "text": "Vorhandene Original-IDs verbunden. Historische Code-/CI-Aussagen als solche erhalten; offenen Gesamtstatus nicht zu fertig aufgewertet."
      }
    ],
    "links": [
      [
        "GC-VISUAL-PROTOTYPE-AI-02",
        "Sprachabhängige Beschriftungen und neue Formate gemeinsam prüfen"
      ]
    ]
  },
  {
    "id": "GC-CLASSROOM-01",
    "aliases": [],
    "area": "product",
    "relatedAreas": [
      "tech",
      "privacy",
      "customers"
    ],
    "real": true,
    "phase": "sourcecheck",
    "priority": 2,
    "title": "Schüler, Klassen & ASV",
    "statusLabel": "Lokal umgesetzt · Zuweisung offen",
    "summary": "Gemeinsame Schulklassen, persönliche Schülerzugänge und Druck sind lokal umgesetzt. Der Schülerbereich hat noch keine angebundene Testzuweisung; Mehrgerätebetrieb und schulische Freigaben bleiben eigene Schritte.",
    "next": "Lokalen Klassen-/Zugangsstand bestätigen und danach die sichere Testzuweisung im vorhandenen Prüfungsablauf abgrenzen.",
    "reason": "Voraussetzung für persönliche Schülerabläufe und den späteren Classroom-Anschluss des Lerngehirns.",
    "owner": "GradeCrew Zentrale → GC · Schüler, Klassen & ASV. Datenschutz-/Schulfreigaben mit den bestehenden Fachrollen.",
    "stage": "branch_only · lokaler Checkout ba360c91; kein Cloud-/Productionrollout.",
    "conflict": "Zentrale TODO/STATE beschreiben noch die frühe Mockstufe. Lokale Übergabe und jüngste Besprechung berichten deutlich mehr Umsetzung. Die Produktstufe bleibt lokal; diese Übernahme korrigiert keine zentralen Release-Dateien.",
    "sources": [
      {
        "key": "C1",
        "label": "Aktueller lokaler Classroom-Plan",
        "path": "/Users/martin/.codex/.chatgpt-projects/g-p-6ab1877c30108191b2aabf44e8bf23e4/gradecrew-classroom-integrated-20261016/docs/classroom/GC-CLASSROOM-01-IMPLEMENTATION-20261016.md",
        "stamp": "21.10.2026 · Abschnitte O/P gelesen"
      },
      {
        "key": "C2",
        "label": "Lokale Übergabe und Zugangs-/Drucknachweise",
        "path": "/Users/martin/.codex/.chatgpt-projects/g-p-6ab1877c30108191b2aabf44e8bf23e4/gradecrew-classroom-integrated-20261016/workstreams/classroom-student-management-v1.md",
        "stamp": "21.10.2026 · HEAD ba360c91, read-only"
      },
      {
        "key": "C3",
        "label": "PR141: ursprünglicher Identitäts-/ASV-Entwurf",
        "url": "https://github.com/HerrLoeffler/Hausaufgabe/pull/141",
        "stamp": "22.10.2026 · Dokument-PR weiterhin offen"
      }
    ],
    "conversations": [
      {
        "title": "GC · Schüler, Klassen & ASV",
        "id": "01a10c7f-95f0-7360-a2e3-be5b970fbcb9",
        "text": "Zwei jüngste Besprechungen gelesen: ASV-unabhängige Klassenanlage, achtstellige dauerhafte Codes, A4-/Kartendruck und Verfügbar/Erledigt. Vollhistorie nicht importiert."
      }
    ],
    "tasks": [
      {
        "title": "Schule & gemeinsame Klassen",
        "state": "Lokal umgesetzt laut C2",
        "children": [
          [
            "Gemeinsame Klasse",
            "Bestätigte Lehrkräfte finden dieselbe Klasse; keine Kopie pro Fach."
          ],
          [
            "Manuelle Aufnahme",
            "ASV ist keine Voraussetzung; Personen manuell ergänzen."
          ],
          [
            "Rechte & Schulwechsel",
            "Schul-/Unterrichtsrechte getrennt; kein Mitnehmen fremder Schuldaten."
          ]
        ]
      },
      {
        "title": "Persönlicher Schülerzugang",
        "state": "Lokal umgesetzt laut C2 · Nutzertest offen",
        "children": [
          [
            "Achtstellige Codes",
            "Beim erneuten Drucken unverändert; Rotation/Sperre beendet alte Zugänge."
          ],
          [
            "Druck",
            "Klassenliste, Zugangskarten und Einzelblätter; Übergabe meldet A4-Prüfung und 571 Tests. Nicht hier neu ausgeführt."
          ],
          [
            "Wiederherstellung",
            "DB und separate Schlüssel gemeinsam geschützt sichern; reale Betriebssicherung separat."
          ]
        ]
      },
      {
        "title": "Tests zuweisen",
        "state": "Noch nicht angebunden · C1/C2",
        "children": [
          [
            "Verfügbar / Erledigt",
            "Schüler sehen nur ihre zugewiesenen Tests, optional nach Fach."
          ],
          [
            "Abgabe & Wiederholung",
            "Abgegeben bleibt erledigt; weiterer bewerteter Versuch nur nach ausdrücklicher Freigabe."
          ],
          [
            "Frist",
            "Sichtbares Enddatum oder bewusst Ohne Enddatum."
          ]
        ]
      },
      {
        "title": "ASV & gemeinsamer Betrieb",
        "state": "Weitere Klärung offen · C3",
        "children": [
          [
            "Identitätsabgleich",
            "Gleiche Namen allein sind kein Fusionsbeweis."
          ],
          [
            "Mehrgerätebetrieb",
            "Lokaler Mac ist noch kein gemeinsames Schülerbackend."
          ]
        ]
      }
    ],
    "decisions": [
      [
        "Nächsten Pilotumfang bestätigen",
        "Vorgeschlagener nächster Schritt: Klassen-/Code-/Druckablauf praktisch abnehmen, danach Testzuweisung konkret beauftragen."
      ],
      [
        "Schulischer Betrieb",
        "Zuständige Schule/Betreiber und Freigaben vor echter Nutzung verbindlich klären."
      ]
    ],
    "parked": [
      [
        "ASV-Ausbau",
        "Nach qualifiziertem manuellem Einstieg und konkretem Exportprofil erneut vorlegen; kein ASV-Zwang."
      ]
    ],
    "history": [
      {
        "title": "Beschlossen in der Besprechung",
        "text": "ASV optional; gemeinsame Klasse statt Fachkopien; persönliche achtstellige Codes; wiederholtes Drucken verändert sie nicht."
      },
      {
        "title": "21.10. · Letzter Fachstand",
        "text": "571 lokale Tests und Druckprüfung in C2 dokumentiert. Persönliche Testzuweisung ausdrücklich nicht angebunden; kein echter vollständiger Schülerlauf abgenommen."
      }
    ],
    "links": [
      [
        "GC-ADAPTIVE-PRACTICE-01",
        "Blockiert den späteren Schülercode-/Klassenanschluss des Lerngehirns"
      ]
    ]
  },
  {
    "id": "GC-ADAPTIVE-PRACTICE-01",
    "aliases": [],
    "area": "pedagogy",
    "relatedAreas": [
      "product",
      "tech",
      "privacy"
    ],
    "real": true,
    "phase": "sourcecheck",
    "priority": 2,
    "title": "Adaptives Lernen · Lerngehirn",
    "statusLabel": "Testseite dokumentiert · Fachabnahme offen",
    "summary": "Mathe und Deutsch 5–10 mit persönlichem Lernprofil und adaptiven Hilfen sind auf der getrennten Testseite dokumentiert. Der vollständige fachliche Umfang, Medienpfade und Classroom-Anschluss bleiben offen.",
    "next": "Fachliche Stichproben und bekannte Feedback-/Parsergrenzen priorisieren; den Klassenanschluss mit GC-CLASSROOM-01 abstimmen.",
    "reason": "Realer Teststand vorhanden. Qualität und sichere Lernstandsaussagen zählen vor weiterem Ausbau.",
    "owner": "GradeCrew Zentrale → GC · Adaptives Lernen – Konzept & Realisierung; pädagogische Freigabe separat.",
    "stage": "Getrennte Testseite laut A1/A2; PR262 offen/Draft. Keine Productionfreigabe.",
    "conflict": "Ursprünglicher Konzept-/Lokalpilot PR253 und späterer Testausbau PR262 sind Teil derselben Task. Sie dürfen weder als zwei Projekte gezählt noch auf den frühen Konzeptstand reduziert werden.",
    "sources": [
      {
        "key": "A1",
        "label": "PR262: Mathe/Deutsch-Testausbau und verbleibende Grenzen",
        "url": "https://github.com/HerrLoeffler/Hausaufgabe/pull/262",
        "stamp": "22.10.2026 · Head d590d7d4, offen/Draft"
      },
      {
        "key": "A2",
        "label": "Implementierungs- und Testnachweise",
        "url": "https://github.com/HerrLoeffler/Hausaufgabe/blob/d590d7d43f0fa0ec0126f00df3cb6b744b6c1911/docs/learning-brain/implementation-20261021.md",
        "stamp": "21.10.2026 · Dokument gelesen, Tests nicht erneut ausgeführt"
      },
      {
        "key": "A3",
        "label": "Konzept, Lernverläufe und Versuchshistorie",
        "url": "https://github.com/HerrLoeffler/Hausaufgabe/blob/2ac59c326e1b09a686ae4358fb3be3d756fef9bc/workstreams/adaptive-practice-01.md",
        "stamp": "21.10.2026 · Übergabe gelesen"
      }
    ],
    "conversations": [
      {
        "title": "GC · Adaptives Lernen – Konzept & Realisierung",
        "id": "01a158f7-7f85-77e1-9448-b32682030c05",
        "text": "Jüngste Besprechung gelesen: Rückmeldung einer vorherigen Aufgabe blieb irreführend sichtbar. Kein verifizierter Fix daraus abgeleitet. Älterer großer Turn nicht abrufbar; fachliche Vorgeschichte über A3 rekonstruiert."
      },
      {
        "title": "GC · Pädagogisches Konzept",
        "id": "01a1280a-c9f4-73a3-a12a-7b2b93a5ba5a",
        "text": "In A3 als Herkunft vorhandener Lehrplan-/Konzeptgrundlagen genannt. Für diese Übernahme nicht nochmals vollständig gelesen."
      }
    ],
    "tasks": [
      {
        "title": "Lernziele & Inhalte",
        "state": "Testkatalog dokumentiert · A1/A2",
        "children": [
          [
            "Mathe/Deutsch 5–10",
            "464 abgeleitete Ziele; 284 Textzugänge. Das ist keine didaktische Vollabnahme."
          ],
          [
            "Medienwege",
            "180 Ziele für Sehen, Hören oder Sprechen bleiben gesperrt."
          ]
        ]
      },
      {
        "title": "Adaptive Übung",
        "state": "Testabläufe dokumentiert · A2",
        "children": [
          [
            "Bei Schwierigkeiten",
            "Kleinere Teilaufgaben, kurze Hilfen, Rückkehr zur Originalaufgabe und neue unabhängige Probe."
          ],
          [
            "Lernstand",
            "Unterstützte Treffer getrennt; kein Können aus einem einzelnen richtigen Versuch."
          ],
          [
            "Lehrkraft einbeziehen",
            "Bei anhaltenden Schwierigkeiten freundlich auf Hilfe durch die Lehrkraft verweisen."
          ]
        ]
      },
      {
        "title": "Persönliches Profil & Klassen",
        "state": "Eigenprofil dokumentiert · Klassenanschluss offen",
        "children": [
          [
            "Eigener Zugang",
            "Private Profile über verifizierte Auth-Identität; keine Namensfusion."
          ],
          [
            "Classroomadapter",
            "Persönliche Schülercodes noch nicht angebunden."
          ]
        ]
      },
      {
        "title": "Qualität & Integration",
        "state": "Offene Restarbeit",
        "children": [
          [
            "Feedback beim Aufgabenwechsel",
            "Jüngste Besprechung meldet alten Richtig-Hinweis. Korrekturbeleg fehlt in der gelesenen Besprechung."
          ],
          [
            "Zahlenformate",
            "Bestehende Parsergrenze bei gemischter Leerzeichennotation in A2 dokumentiert."
          ],
          [
            "Fachabnahme & PR262",
            "Weitere Ziele prüfen und Kandidat in die Appbasis integrieren; kein behaupteter Merge."
          ]
        ]
      }
    ],
    "decisions": [
      [
        "Fachlichen Pilot begrenzen",
        "Vorschlag: konkrete Lernziele und verantwortliche Lehrkraft für die nächste Stichprobe benennen; keine Vollfreigabe aller 464 Ziele."
      ],
      [
        "Nächsten Ausbau gewichten",
        "Medienwege versus Klassenanschluss erst nach Bewertung der offenen Qualitätsfälle priorisieren."
      ]
    ],
    "parked": [
      [
        "180 Medienziele",
        "Reaktivieren, sobald geeignete Eingaben und fachliche Prüfungen freigegeben sind."
      ],
      [
        "Lernwirkung / Behalten",
        "Zeitversetzte Proben und Evaluation vor Wirksamkeitsaussagen."
      ]
    ],
    "history": [
      {
        "title": "20./21.10. · Bestätigte Richtung",
        "text": "Gezielt vereinfachen, verständliche kleine Hilfen geben, anschließend selbstständig prüfen; bei anhaltenden Schwierigkeiten Lehrkraft einbeziehen (A3)."
      },
      {
        "title": "21.10. · Erweiterter Teststand",
        "text": "A2 dokumentiert 313 Functions- und 28 UI-Tests, echte KI-Einstiege für zwölf Fach-/Jahrgangspaare und getrennte Profile. Keine didaktische Vollvalidierung."
      },
      {
        "title": "Jüngste Besprechung",
        "text": "Irreführenden alten Feedbackhinweis als offenen Qualitätsfall aufgenommen, keine Beleidigung aus dem ursprünglichen Screenshot in Firmenwissen kopiert."
      }
    ],
    "links": [
      [
        "GC-CLASSROOM-01",
        "Benötigt qualifizierte Schüleridentität"
      ],
      [
        "GC-VISUAL-PROTOTYPE-AI-02",
        "Medien- und Interaktionsformate können spätere Lernziele unterstützen"
      ]
    ]
  },
  {
    "id": "GC-VISUAL-PROTOTYPE-AI-02",
    "aliases": [
      "Issue #255"
    ],
    "area": "product",
    "relatedAreas": [
      "pedagogy",
      "tech"
    ],
    "real": true,
    "phase": "sourcecheck",
    "priority": 2,
    "title": "Erweiterte Aufgabentypen",
    "statusLabel": "Eigene Testvorschau · Abnahmen offen",
    "summary": "Zwölf zusätzliche visuelle Interaktionen sind im vorhandenen Remy-/Emmi-/Prüfungsablauf auf eigener Testvorschau dokumentiert. Folgefix für den technischen JSON-Editor liegt separat vor.",
    "next": "PR271 dem bestehenden Issue255-Kandidaten zuordnen, Vorschau nachführen und die noch offenen Browser-/Touchabläufe abnehmen.",
    "reason": "Erster Eindruck und einfache Lehrkraftbearbeitung brauchen denselben Qualitätsstand wie die Bewertungslogik.",
    "owner": "GradeCrew Zentrale → bestehender Issue255-Umsetzungsfachchat; Konzeptchat liefert fachliche Anforderungen.",
    "stage": "Eigene Testvorschau dokumentiert; PR265 und PR271 offen. Kein Productionrollout.",
    "conflict": "PR265 beschreibt veröffentlichte Testvorschau. PR271 entfernt JSON aus dem Editor, ändert aber die veröffentlichte Vorschau noch nicht. Ein offener PR ist keine veröffentlichte Korrektur.",
    "sources": [
      {
        "key": "V1",
        "label": "PR265: zwölf Interaktionen und Online-Nachweise",
        "url": "https://github.com/HerrLoeffler/Hausaufgabe/pull/265",
        "stamp": "22.10.2026 · Head 1ce20d96, offen"
      },
      {
        "key": "V2",
        "label": "PR271: JSON-Editor entfernen",
        "url": "https://github.com/HerrLoeffler/Hausaufgabe/pull/271",
        "stamp": "22.10.2026 · Head 59289c2e, offen"
      },
      {
        "key": "V3",
        "label": "Bestehende Issue255-Übergabe",
        "url": "https://github.com/HerrLoeffler/Hausaufgabe/blob/1ce20d9630d82209316ab7ab13764c4ee158f20f/workstreams/visual-prototype-ai-02-20261021.md",
        "stamp": "21.10.2026 · Umsetzungsumfang und Grenzen gelesen"
      }
    ],
    "conversations": [
      {
        "title": "GC · Erweiterte Aufgabentypen – Plan…",
        "id": "01a15a72-d74c-79a3-a180-2bd47a23d663",
        "text": "Jüngste Besprechung gelesen: JSON- und Reparaturfeld aus der Lehrkraftoberfläche entfernen; Musterlösung, Vorschau und Emmi erhalten. Älterer großer Turn nicht abrufbar."
      },
      {
        "title": "GradeCrew-Issue #255 umsetzen",
        "id": "01a15f2f-5b0d-7c71-b338-d37571fcce6d",
        "text": "Umsetzungszugehörigkeit durch V3 belegt; Ergebnisse aus dessen konkreter Übergabe/PR übernommen, keine vollständige Chatkopie."
      }
    ],
    "tasks": [
      {
        "title": "Formatfamilie",
        "state": "Implementiert laut V1/V3",
        "children": [
          [
            "Zwölf Interaktionen",
            "Hotspot, Beschriftung, Skala, Winkel, Raster, Diagramm, Verbindungen, Koordinaten, Belege, Bereich, Tabelle, Korrektur."
          ],
          [
            "Bestehende Formen",
            "Auswahl- und Zahlformen bleiben erhalten; keine Pflichtquote ungeeigneter Bildaufgaben."
          ]
        ]
      },
      {
        "title": "Erstellen & überarbeiten",
        "state": "Testläufe dokumentiert · V1",
        "children": [
          [
            "Remy / Emmi",
            "Erstellen, Einzel- und Gesamtüberarbeitung sowie Speicherung im bestehenden Ablauf."
          ],
          [
            "Verständlicher Editor",
            "JSON-/Reparaturfelder in PR271 entfernt; Testvorschau noch nachzuführen."
          ]
        ]
      },
      {
        "title": "Antworten & bewerten",
        "state": "Online-Serverabläufe dokumentiert · V1/V3",
        "children": [
          [
            "Lösungsschutz",
            "Öffentliche Aufgabe enthält keine privaten Schlüssel; bestehende unveränderliche Prüfungsstände erhalten."
          ],
          [
            "Winkelmesser",
            "Bewegen und drehen, keine automatisch vorgegebene Zielantwort."
          ]
        ]
      },
      {
        "title": "Abnahme",
        "state": "Noch offen · V1/V2",
        "children": [
          [
            "Browserabgabe",
            "Abschließender sichtbarer Abgabeweg war durch Bestätigungsdialog blockiert; Servernachweis separat vorhanden."
          ],
          [
            "Touch & Geräte",
            "Physische iPads/iPhones und Nutzerabnahme noch nicht belegt."
          ],
          [
            "Zusammenführung",
            "CI, Integration und Vorschau des Folgefixes separat nachweisen."
          ]
        ]
      }
    ],
    "decisions": [
      [
        "Abnahmeumfang priorisieren",
        "Vorschlag: verständliche Bearbeitung und vollständiger Geräteablauf zuerst; zusätzliche Formate erst danach. Keine vorhandenen bestätigten zwölf Formen erneut zur Grundsatzentscheidung machen."
      ]
    ],
    "parked": [
      [
        "Weitere Interaktionen",
        "Nach Abnahme der vorhandenen Formatfamilie mit echtem fachlichem Bedarf erneut prüfen."
      ]
    ],
    "history": [
      {
        "title": "Bisherige Festlegung",
        "text": "Vorhandene Testabläufe und KI-Anbindung erhalten; neue Formen als gemeinsame Familie ergänzen (V1/V3)."
      },
      {
        "title": "21.10. · Testvorschau dokumentiert",
        "text": "V1 berichtet 179 geprüfte Assets, echte KI-/Bewertungsabläufe und offene Geräte-/Browsergrenzen. Nachweise in diesem Designauftrag nicht wiederholt."
      },
      {
        "title": "Folgebesprechung",
        "text": "Technische JSON-Eingaben passen nicht in die Lehrkraftoberfläche. Fix PR271 liegt separat vor; Onlinevorschau noch unverändert."
      }
    ],
    "links": [
      [
        "GC-ADAPTIVE-PRACTICE-01",
        "Ergänzt spätere visuelle Lernpfade"
      ],
      [
        "GC-I18N-03",
        "Braucht stabile Sprachlabels ohne Veränderung der Lösung"
      ]
    ]
  }
];

const auditedTopicKeys={'GC-I18N-03':'learning/sprachen','GC-CLASSROOM-01':'classroom/zuweisungen','GC-ADAPTIVE-PRACTICE-01':'learning/adaptiv','GC-VISUAL-PROTOTYPE-AI-02':'learning/erneuerungen'};
export const topics=historicalTopics.map(t=>{const key=auditedTopicKeys[t.id],u=companyAudit.updates[key],a=areaStatus[key.split('/')[0]];return {...t,historicalTasks:t.tasks,statusLabel:u.state==='blocker'?'Engpass bestätigt · Abgleich25.10.':'Teilstand geprüft · Abnahme offen',summary:u.current,next:u.next,reason:u.gap,stage:u.current+' Offen: '+u.gap,conflict:'Fachabgleich25.10.2026. Neuere Chatmeldungen und Versionsänderungen stehen im Bereichsstand und unter Seiten & Releases. Historische Akte bleibt im Verlauf erhalten.',tasks:[{title:'Aktueller Bestand',state:'Fachabgleich25.10.2026',children:[['Belegt',u.current]]},{title:'Offene Prüfung',state:u.state==='blocker'?'Blockiert':'Abnahme offen',children:[['Lücke',u.gap],['Nächster Schritt',u.next]]}],sources:[{label:'Aktueller Bereichs-/Releaseabgleich',url:'https://github.com/HerrLoeffler/Hausaufgabe/pull/295',stamp:'25.10.2026'},...t.sources],history:[{title:'Fachabgleich25.10.2026',text:u.current+' Offen: '+u.gap},...t.history]};});
