const single = (text, choices, answer, image = "") => ({
  type: "single", text, points: 1,
  options: choices.map((label, index) => ({ text: label, correct: index === answer })),
  ...(image ? {
    imageUrl: `/assets/gradecrew/demo-${image}.svg`,
    imageAlt: ({ backpack: "Ein blauer Schulrucksack.", pencil: "Ein roter Bleistift aus Holz.", books: "Drei Bücher nebeneinander." })[image]
  } : {})
});

export const DEMO_TEST = Object.freeze({
  title: "Übung · Meine erste GradeCrew-Reise",
  subject: "Englisch",
  grade: "4",
  timeLimitMinutes: 1,
  description: "10 kurze Aufgaben für die Einführung in GradeCrew.",
  questions: [
    single("What colour is the schoolbag?", ["red", "blue", "green"], 1, "backpack"),
    single("What can you see?", ["a ruler", "a pencil", "a chair"], 1, "pencil"),
    single("How many books can you see?", ["two", "four", "three"], 2, "books"),
    // Deliberately German so Emmi can demonstrate a meaningful AI rewrite.
    single("Was heißt „Hund“ auf Englisch?", ["cat", "dog", "bird"], 1),
    { type: "text", text: "Write one colour in English.", points: 1, acceptedAnswers: ["red", "blue", "green", "yellow", "orange", "purple", "pink", "black", "white", "brown", "grey", "gray"], manualReview: true },
    // A DIFFERENT task is used for the variant demonstration.
    single("Choose the English word for „Vogel“.", ["bird", "cat", "dog"], 0),
    { type: "truefalse", text: "Decide whether this is correct: „Red“ means „rot“.", points: 1, correctBoolean: true },
    { type: "markwords", text: "Select all three colour words in the sentence.", passage: "The red bag holds a blue book and a green pencil.", targetWords: ["red", "blue", "green"], points: 1 },
    // Deliberately wrong answer key so the quality-first lesson is concrete.
    single("Which English word means the German colour „gelb“?", ["yellow", "blue", "red"], 1),
    { type: "ordering", text: "Crew-Finale: Wer war zuerst da? Bringe die vier Crew-Mitglieder in die Reihenfolge, in der sie dich begleitet haben.", items: ["Coco", "Remy", "Emmi", "Wilma"], points: 1, manualReview: false,
      imageUrl: "/assets/gradecrew/demo-crew.svg", imageAlt: "Die vier Crew-Mitglieder feiern gemeinsam." }
  ]
});
DEMO_TEST.questions[8].options.forEach((option, index) => { option.correct = index === 1; });

