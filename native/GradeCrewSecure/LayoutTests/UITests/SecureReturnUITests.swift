import XCTest

final class SecureReturnUITests:XCTestCase {
    func testConfirmedOfflineSubmissionReturnsToCodeFormAndNextTest() {
        let app=XCUIApplication()
        app.launchArguments=["--secure-lifecycle-ui","--late-recovery-task"]
        app.launch()
        let back=app.buttons["Zurück zum Start"]
        XCTAssertTrue(back.waitForExistence(timeout:15))
        XCTAssertTrue(back.isEnabled)
        // The visible blue surface must respond, including beside the text.
        back.coordinate(withNormalizedOffset:CGVector(dx:0.06,dy:0.5)).tap()
        let code=app.textFields["entry.code"]
        XCTAssertTrue(code.waitForExistence(timeout:5),app.debugDescription)
        XCTAssertEqual(code.value as? String,"Code deiner Lehrkraft")
        code.tap();code.typeText("NEXT123")
        let name=app.textFields["entry.name"]
        name.tap();name.typeText("Synthetic next pupil\n")
        XCTAssertTrue(app.buttons["Prüfungsmodus starten"].waitForExistence(timeout:5),app.debugDescription)
    }
}
