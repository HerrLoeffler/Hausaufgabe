# GC-IOS-02 / GC-RELEASE-06 — Materialhinweis und Apple-Inhaltsrechte

Direkter Auftrag Martin21.10.2026: bestätigten Materialhinweis einbauen, sachliche Erläuterung bei Apple hinterlegen und Storevorbereitung fortführen. Bestehende ausdrückliche Rechtebestätigung erneut bekräftigt. Kein Versprechen, dass KI jede geschützte Übernahme ausschließt.

Scope: ausschließlich erklärender Text im bestehenden Materialbereich; Checkbox, Datenschutz-/OpenAI-/Löschhinweise, Uploadfreigabe, Originalmaterial-Modus und APIs unverändert. Native Änderung betrifft die Lehrer-App, nicht Secure1.0(1141).

Basis: Web2a6ff107, Native8ab3891; getrennte Checkouts/Branches. Main2324652 frisch gelesen; Development Status39642098842 success. Offene PRs263/265/254/191 berühren breitere Weboberflächen; nur eigenen HTMLabsatz oberhalb der bestehenden Uploadbestätigung ergänzen, keine fremden Hunks übernehmen. Keine offene Nativeänderung zu diesem Hinweis gefunden.

Umsetzung: exakt vom Nutzer bestätigter Dreisatz im aufgeklappten Materialbereich. Bestehende Checkbox bleibt erhalten. Reversible reine Textänderung: keine spiegelnden neuen Unit-Tests; vorhandene Paket-/Layoutprüfung verwenden.

Assurance: PRIV04/08/12–15/19 anlassbezogen; Hinweis erklärt Quelle/Verarbeitung/Verantwortung, ohne Rechteprüfung zu behaupten. Bestehende DSA-/Alters-/Datenschutzlabel-Fakten bleiben getrennt. requested/actual Runtime-Modell unbekannt; kein Modellwechsel.

Apple: Inhaltsrechte-Auswahl Ja auf konkreten Nutzerauftrag gespeichert und nach Reload bestätigt. Erläuterung in Review-Anmerkungen ergänzt; endgültige Persistenzprüfung noch offen. Kein AppReview eingereicht.

Nächster Schritt: gebaute Webhinweise und Native-Syntax/Layouts prüfen, Änderungen gesichert integrieren, sichtbaren Apple-/Veröffentlichungsstand dokumentieren.

## Verifikation vor Review
- Beide tatsächlichen Hostingpakete:173Dateien, explizit production/hausaufgabe-staging und staging/gradecrew-staging-2026 erfolgreich gebaut. Original-Uploadbereich aus index.html mit tatsächlichem styles.css lokal im Browser320/834px geprüft:0px horizontaler Überlauf; Checkbox und bestehende Details vorhanden. Kein Konto/Upload/KI-Aufruf.
- NativeTeacher: vorhandenes verify-on-mac.sh erfolgreich, BUILD SUCCEEDED. Nur3Textzeilen im QuickRemyView-Diff, Securecode unverändert. Keine neue Binärveröffentlichung.
- Apple-Inhaltsrechte und ergänzte Review-Erklärung nach Reload bestätigt; Build1141 im Storeentwurf ausgewählt, Persistenz folgt. Kein AppReview eingereicht.

## Gesicherter Checkpoint nach Veröffentlichung
- Website PR267, Integrationab6fcc9d, exakte CI39678215545/39678215463/39678215543 success; Hosting-only hausaufgabe-staging deploy complete, alle173Assethashes remote exakt. Baseline2a6ff107, nurindex.html geändert,0entfernt.24lokaleWebregressionen bestanden. SeparatesStaging enthält Lerngehirn-Prototyp0de53073; bewusst nicht überschrieben.
- Native PR268 nach begrenztem unabhängigem PASS integriertaa39a9fb. Teacher-TestFlightworkflow39678556334 automatisch gestartet, Statusin_progress, noch keinUpload/Appleprocessing behauptet. Secure1.0(1141) unverändert.
- Apple: konkrete Rechtebestätigung gespeichert und nachReload verifiziert; Erläuterung fürAppReview gespeichert und nachReload verifiziert. Build1141 zugeordnet/gespeichert/nachReload vorhanden. Keine Revieweinreichung oderStoreveröffentlichung.
- PhysischeOfflineabnahme, Reviewcode/Storebilder, Telefon, genaueAlterskategorien und expliziteDatenschutzlabelveröffentlichung bleibenoffen. Frühere automatischeApprovalreviewblocks zuAlterskategorien/Datenschutzpublication nichtumgangen.
Nächster Schritt: vorhandenenTeacherlauf39678556334 biszum tatsächlichenErgebnis beobachten; keine Wiederholung ohneStatusprüfung.
