# Lernhandoff: Firebase Auth und Firestore-Zugriff

**Ziel:** Kurz verstehen, warum eine erfolgreiche Firebase-Anmeldung nicht automatisch Zugriff auf jedes Firestore-Dokument gibt.

**Erklärt:** Auth bestätigt, *wer* die anfragende Person ist. Firestore Security Rules prüfen separat, *welche* Daten diese Identität lesen darf. In einem fiktiven GradeCrew-Beispiel darf `uid=anna7` `/users/anna7` lesen, wenn die Regel `request.auth.uid == userId` verlangt. `/users/ben3` bleibt ihr trotz erfolgreichem Login gesperrt.

**Randfall:** Eine Abfrage für alle `assignments` wird abgelehnt, wenn sie auch Dokumente anderer Klassen enthalten könnte. Regeln schneiden unerlaubte Treffer nicht nachträglich heraus. Eine passende Abfrage muss die Regelbedingungen bereits erfüllen, etwa nach Annas eigener Klassen-ID filtern.

**Übung – Antwort ausstehend:** Wenn Anna eine Abfrage auf alle Klassenaufgaben startet, aber nur ihre Klasse lesen darf: Was muss die Abfrage einschränken, und warum reicht ihr Login nicht?

**Gelernt / erklärt:** Die Trennung von Identität und Datenberechtigung sowie die beiden Beispiele wurden erklärt. **Tatsächlich geübt:** Noch nichts; es liegt keine Antwort von Martin vor. **Unverifiziert:** Ob Martin die Regel auf eigenen Code übertragen kann; weder Regeln noch GradeCrew-Produktverhalten wurden hier geprüft.

**Nächste Anwendung:** Bei einer vorhandenen GradeCrew-Firestore-Regel `request.auth` und Dokumentpfad gemeinsam nachverfolgen.

**Quellen:** [Firebase Authentication](https://firebase.google.com/docs/auth) · [Firestore-Regelbedingungen und Abfragen](https://firebase.google.com/docs/firestore/security/rules-conditions). Lokale Referenz: `firebase-auth-basics/SKILL.md`.

**Modell:** Luna/medium angefordert; tatsächlich verwendetes Runtime-Modell hier nicht verifiziert. Ein Routineauftrag wie „behebe den freigegebenen Buttontext“ ist für sich kein Teach-Anlass; der Lernhandoff bleibt optional.
