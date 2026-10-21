# AAC-Antrag vorbereiten

Formular: https://developer.apple.com/contact/request/automatic-assessment-configuration/
App: GradeCrew Secure · Plattform: iPadOS
Vorgeschlagene Bundle ID: de.gradecrew.secure (mit der tatsächlich registrierten ID abgleichen).

## Beschreibung für das Formular

GradeCrew is an educational platform for creating, conducting and evaluating school assessments, developed by a teacher in Germany. We are developing a dedicated iPad application, GradeCrew Secure, for teacher-supervised classroom assessments.

We request the com.apple.developer.automatic-assessment-configuration entitlement to use AEAssessmentSession during an explicitly started educational assessment. The app will show assessment content only after the framework confirms that the assessment session has started. We intend to end the restricted session after authenticated server confirmation of a final submission or an authorized teacher termination, with appropriate recovery and emergency procedures.

The entitlement will not be used for parental control, advertising, tracking or general device management. The browser version remains available for activities that do not require device-level restrictions.

We currently have an early SwiftUI/WKWebView staging prototype and a separate local assessment-session hardware test. The secure server attempt protocol and production recovery flow are still being developed. We are requesting approval to develop and test the native assessment functionality before a school pilot and App Store submission.

Kind regards,
Martin Löffler
GradeCrew

## Nach dem Absenden

Genehmigung und Hinweise von Apple abwarten. Mitgliedschaft, App-ID, Provisioning-Profil und AAC-Freigabe müssen zusammenpassen. Entitlement-Datei allein erteilt keine Berechtigung. Bei Rückfragen den tatsächlichen Entwicklungsstand beschreiben, keine fertige Sicherheitsprüfung behaupten.
