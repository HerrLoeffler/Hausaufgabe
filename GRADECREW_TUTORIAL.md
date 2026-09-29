# GradeCrew: agreed tutorial behavior

Updated 29 September 2026. Work on Staging only.

- Center introductory scenes, their character artwork, headings and actions. Contextual coaches stay beside the real control without obscuring it.
- Coco introduces Remy with both characters and an arrow. Remy then works alone. Keep Coco's later thank-you with the heart.
- Remy introduces Emmi with both characters; Emmi says hello alone on the next scene. Emmi handles quality review, editing and variants. Coco thanks Emmi, introduces Wilma, and Wilma explains settings before assessment.
- Use the real application controls. Do not introduce decorative pseudo-buttons or a second variant workflow specific to the tour.
- Prepared English grade-4 draft: ten questions, three subject pictures plus a Crew finale image, mixed task types, precise instructions, one minute. No AI provider requests for prepared tutorial operations.
- Edit question 4. Create a distinct image variant from question 6 through the regular variant dialog. The regular queue inserts it automatically, marks its outline entry green, and offers Behalten / Ändern / Entfernen on the actual question.
- Guide the user to the green outline entry, then Behalten, then the green quality smiley. Explain naturally that smileys show which task styles the user likes or dislikes; practice smileys in the tutorial are not stored. Demonstrate the red smiley on the intentionally incorrect answer key and use Melden & entfernen. Mention that simply fixing yellow would be possible, but for the exercise the task is deliberately rejected as a whole.
- After the green smiley, bridge playfully to the remaining warning ("Ach stimmt – da war ja noch was!"). In the removal scene explain only the available actions; do not mention the cat variant there.
- After the faulty task is removed, summarize the achievement before Wilma takes over: one task revised, one variant added, one faulty task removed, and the test is back to exactly ten tasks.
- Follow the real publication, student identity, timed attempt, saved submission and teacher assessment paths. Allow scrolling during the student attempt.

Regression checks must exercise the public module wrapper and the actual variant manager together with the production workspace CSS. In particular, the managed queue hides its manual Apply button; the tour must never require clicking it. Verify that outline observers settle while a variant awaits review.

Pause after ghost-filled wishes and let the user confirm the test-specific wishes before highlighting only the collapsed „Persönliche KI-Vorgaben“ summary. Explain that personal preferences apply to future AI tests.

Introduce the wrong yellow/blue answer gently instead of abruptly. Free response is task 5, word selection task 9, and the four-member Crew ordering surprise task 10. Preserve targeted free-response assessment by question ID.

Tutorial scoring stays at ten total points: the first two easy picture questions are worth 0.5 points each and the Crew finale is worth 2 points. Its four ordering positions are graded proportionally, therefore every correctly placed Crew member is worth 0.5 points. In teacher review, jump to the Crew finale first and show friendly feedback for 0 / 0.5 / 1 / 1.5 / 2 points; then return the viewport to the actual free-response card at task 5. Keep the real „Bewertung speichern“ control visible and clickable while the free response is reviewed; never leave the viewport parked at task 10.

Wilma's introduction should simply invite the user to look at the settings for the current test. Before publishing, distinguish those test settings from the general settings in the main menu and mention that publishing saves the current test state automatically.

In the student identity scene Coco notices that the introduction was forgotten ("Ach, fast vergessen!") and asks naturally how the user should be addressed, including the light joke „Ich darf doch du sagen, oder?“. Example placeholder: „Martin, Herr Löffler oder ML“. Do not introduce student/privacy explanations there.

Offer the complete tour after login once per account (server completion flag plus local fallback). After completion, remove the persistent „Mit der Crew starten“ dashboard button. The final screen should emphasize the measured duration, wish the user fun exploring GradeCrew, offer „Eigenen Test erstellen“, and optionally open a short walkthrough of the general main-menu settings for default values and the standard grade scale. Do not show separate „Tour abschließen“ or „Einstellungen kurz kennenlernen“ actions.

After onboarding, provide optional contextual help next to „Mit KI erstellen“ instead of rerunning the full tour. Remy's AI-creation help is non-modal and non-blocking: teachers can freely enter any values while Remy explains Test festlegen, Eigene Wünsche, Persönliche KI-Vorgaben, Material & Bilder and the final Test erstellen action. Remy never prefills or locks fields in this help mode.

On dashboard test cards, publication status is controlled through the existing „Veröffentlicht“ switch. Do not duplicate that state with separate „Beenden“ / „Erneut öffnen“ actions in „Weitere Aktionen“.
