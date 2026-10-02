const source = entries => Object.fromEntries(
  Object.entries(entries).map(([german, english]) => [`source:${german}`, english])
);

export const enGBCrewMessages = Object.freeze({
  ...source({
    "Coco – Hilfe und Orientierung": "Coco – help and guidance",
    "Hilfe & Orientierung": "Help & guidance",
    "Coco schließen": "Close Coco",
    "Diktieren": "Dictate",
    "Frag Coco …": "Ask Coco …",
    "Senden": "Send",
    "Hi, ich bin Coco. Wobei kann ich dir helfen?": "Hi, I'm Coco. How can I help?",
    "Coco denkt nach …": "Coco is thinking …",
    "Dazu habe ich gerade noch keine sichere Antwort.": "I don't have a reliable answer for that yet.",
    "Das klappt gerade nicht. Versuch es bitte noch einmal.": "That didn't work just now. Please try again.",
    "Diktieren wird von diesem Browser nicht unterstützt.": "Dictation isn't supported by this browser.",
    "Ich bekomme gerade keinen Mikrofonzugriff.": "I can't access the microphone right now.",
    "Frag Remy": "Ask Remy",
    "Remy schließen": "Close Remy",
    "Remy hört zu": "Remy is listening",
    "Remy denkt nach …": "Remy is thinking …",
    "Sprich oder schreib, was du erstellen möchtest.": "Say or type what you would like to create.",
    "Mit Remy sprechen": "Talk to Remy",
    "Test mit Remy vorbereiten": "Prepare test with Remy",
    "Sag mir, welchen Test du brauchst.": "Tell me what test you need.",
    "Testwunsch diktieren": "Dictate test request",
    "Übernehmen": "Apply",
    "z. B. Englisch, 4. Klasse, Farben, leicht, 10 Aufgaben …": "e.g. English, Year 4, colours, easy, 10 questions …",
    "Ich höre zu …": "I'm listening …",
    "Diktat übernommen.": "Dictation added.",
    "Remy trägt ein …": "Remy is applying your request …",
    "Test mit Emmi überarbeiten": "Improve test with Emmi",
    "Emmi schließen": "Close Emmi",
    "Was soll Emmi am gesamten Test verbessern?": "What should Emmi improve across the whole test?",
    "Beschreibe kurz, was Emmi ändern soll …": "Briefly describe what Emmi should change …",
    "Test überarbeiten": "Improve test",
    "Emmi prüft den Test …": "Emmi is reviewing the test …",
    "Emmi überarbeitet den Test …": "Emmi is improving the test …",
    "Keine Änderung nötig": "No change needed",
    "Änderungen übernehmen": "Apply changes",
    "Änderungen verwerfen": "Discard changes",
    "Testsprache": "Test language",
    "Legt die Sprache der Aufgaben und Lösungen fest. Die GradeCrew-Oberfläche kann unabhängig davon Deutsch oder Englisch sein.": "Sets the language of questions and solutions. The GradeCrew interface can independently be German or English.",
    "Testsprache ändern? Vorhandene Aufgaben und Lösungen werden nicht übersetzt. Die neue Sprache gilt für künftige KI-Erstellungen und Überarbeitungen dieses Tests.": "Change test language? Existing questions and solutions will not be translated. The new language applies to future AI generation and revisions for this test.",
    "Die Testsprache konnte nicht gespeichert werden. Bitte erneut versuchen.": "The test language could not be saved. Please try again.",
    "Hi! Ich bin Coco. Ich helfe dir, dich in GradeCrew zurechtzufinden und den nächsten Schritt zu finden.": "Hi! I'm Coco. I help you find your way around GradeCrew and work out the next step.",
    "Ich bin Coco. Ich helfe dir bei Orientierung, Navigation und Fragen zu GradeCrew.": "I'm Coco. I help with navigation, guidance and questions about GradeCrew.",
    "Gern! Wenn du noch etwas brauchst, frag einfach nach.": "You're welcome! If you need anything else, just ask.",
    "Bitte gib keine personenbezogenen Schülerdaten in die Crew-KI ein. Nutze Kürzel und beschreibe nur, was für die Aufgabe wirklich nötig ist.": "Please don't enter personal student data into Crew AI. Use code names and only describe what is genuinely needed for the task.",
    "KI-Erstellungen können Kosten verursachen. Wiederkehrende Standardfragen beantwortet GradeCrew möglichst lokal; die KI wird nur genutzt, wenn sie wirklich nötig ist.": "AI generation can incur costs. GradeCrew answers recurring standard questions locally whenever possible and only uses AI when it is genuinely needed.",
    "Du kannst Tests als Vorlage mit Kollegen teilen. Dabei werden keine Schülernamen, Abgaben oder Ergebnisse geteilt.": "You can share tests with colleagues as templates. Student names, submissions and results are not shared.",
    "Unter „+ Neuer Test“ kannst du manuell starten, einen Test mit KI erstellen oder eine Vorlage von Kollegen übernehmen.": "Under ‘+ New test’ you can start manually, create a test with AI or copy a colleague's template.",
    "Dazu brauche ich etwas mehr Kontext. Beschreibe kurz, was du in GradeCrew erreichen möchtest.": "I need a little more context. Briefly describe what you want to achieve in GradeCrew."
  })
});

export const enGBCrewSourcePatterns = Object.freeze([
  { pattern: /^Emmi hat (\d+) Aufgaben geändert\.$/, replacement: "Emmi changed $1 questions." },
  { pattern: /^Emmi hat (\d+) Aufgabe geändert\.$/, replacement: "Emmi changed $1 question." },
  { pattern: /^Remy hat (.*) übernommen\.$/, replacement: "Remy applied $1." },
]);
