# Gemeinsame Qualitätsregeln und automatische Rückmeldungsverarbeitung

Humanauftrag 08.11.2026: sinnvolle fachlich geprüfte Regeln implementieren, testen und auf gradecrew.de veröffentlichen; unklare Altbewertungen offen lassen; Anwendung an neuen Aufgaben belegen; neue Meldungen automatisch prüfen und Hilfe anfordern, wenn nötig.

Architekturentscheidung: bestehende Erstellungs-, Validierungs- und Feedbackpfade erweitern. Versionierter, redaktionell geprüfter Regelkatalog im Code, keine automatisch erfundenen Fachregeln aus Freitext. Gemeinsame Regeln gelten bei Neuerstellung, Ersatz, Varianten, Reparatur und Gesamtüberarbeitung. Eindeutige strukturelle Fehler werden deterministisch beanstandet; semantische Anforderungen bleiben ausdrücklicher Prüfauftrag an die KI und kein angeblicher mathematischer Beweis. Bestehende Medienprüfung und Dublettenerkennung weiterverwenden.

Neue aktuelle Aufgabenmeldungen werden beim autorisierten Speichern automatisch klassifiziert. Nur ein eindeutig nachprüfbarer Befund einer bereits aktiven Regel wird als automatisch durch diese Regel verarbeitet ausgewiesen. Keine automatische Freigabe fremder Aufgabeninhalte; sharedLearning bleibt unabhängig. Neue Fachregeln, fehlende Medien-/Aufgabenkontexte, Dubletten und reine Smileys benötigen menschliche Prüfung. Bewertungsdaten sind untrusted; Freitext gelangt nicht in Regeln oder Prompts. Keine neuen Provideraufrufe pro Meldung. Keine Rückwirkung auf die 39 Altbewertungen.

Nachweis: Erstellungsantwort und bestehendes Nutzungsprotokoll erhalten denselben serverseitig erzeugten Regelbeleg mit Regelversion, Promptfingerabdruck, Auftragskennung, Aufgabenfingerabdruck und Ergebnis der deterministischen Prüfungen. Der Beleg entsteht nach der Modellantwort und sagt nicht, dass semantische Qualität vollständig bewiesen ist. Speicherausfall nicht als gespeicherter Beleg ausgeben.

UI: Admin zeigt automatische Einordnung/Grund/Regelstand pro neuer Meldung sowie gezielten Bereich für benötigte Hilfe. Keine künstlichen Freigaben/Erledigtmarker für Altbestände. Bestehende Rollen, Fristen, Quotas und Auth bleiben.

Alternativen: Nur Promptänderung wäre nicht ausreichend prüfbar. Autonome KI-Fachfreigabe mit Vertrauenszahl kann fehlerhafte Rückmeldungen verstärken und neue Kosten verursachen. Gewählte feste Regeln mit belegbarer Automatik erfüllen den Auftrag ohne diese Abhängigkeiten.
