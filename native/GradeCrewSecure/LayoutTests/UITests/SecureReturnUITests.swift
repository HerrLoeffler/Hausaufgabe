import XCTest
import UIKit

final class SecureReturnUITests:XCTestCase {
    func testStartButtonWithKeyboardOpenPortrait() {
        XCUIDevice.shared.orientation = .portrait
        startWithKeyboardOpen()
    }
    func testStartButtonWithKeyboardOpenLandscape() {
        XCUIDevice.shared.orientation = .landscapeLeft
        defer { XCUIDevice.shared.orientation = .portrait }
        startWithKeyboardOpen()
    }
    private func startWithKeyboardOpen() {
        let app=XCUIApplication()
        app.launchArguments=["--secure-lifecycle-ui","--late-recovery-task"]
        app.launch()
        let back=app.buttons["Zurück zum Start"]
        XCTAssertTrue(back.waitForExistence(timeout:15))
        if !back.isHittable { app.swipeUp() }
        back.tap()
        let code=app.textFields["entry.code"]
        XCTAssertTrue(code.waitForExistence(timeout:5))
        code.tap();code.typeText("NEXT123")
        let name=app.textFields["entry.name"]
        name.tap();name.typeText("Synthetic pupil")
        let keyboard=app.keyboards.firstMatch
        XCTAssertTrue(keyboard.waitForExistence(timeout:5),"A visible software keyboard is required for this test")
        let start=app.buttons["Test starten"]
        let visible=NSPredicate(format:"hittable == true")
        _=XCTWaiter.wait(for:[XCTNSPredicateExpectation(predicate:visible,object:start)],timeout:3)
        let image=XCTAttachment(screenshot:app.screenshot());image.name="start-with-keyboard-open";image.lifetime = .keepAlways;add(image)
        XCTAssertTrue(start.isHittable,"Test starten must be reachable without closing the keyboard")
        XCTAssertFalse(keyboard.frame.intersects(start.frame),"Test starten must not be covered by the keyboard")
        guard start.isHittable,!keyboard.frame.intersects(start.frame) else { return }
        start.tap()
        XCTAssertTrue(app.buttons["Prüfungsmodus starten"].waitForExistence(timeout:5))
    }
    func testConfirmedOfflineSubmissionReturnsToCodeFormAndNextTest() {
        XCUIDevice.shared.orientation = .portrait
        returnFlow()
    }
    func testPhoneLandscapeReturnAndKeyboardEntry() {
        guard UIDevice.current.userInterfaceIdiom == .phone else { return }
        XCUIDevice.shared.orientation = .landscapeLeft
        defer { XCUIDevice.shared.orientation = .portrait }
        returnFlow()
    }
    private func returnFlow() {
        let app=XCUIApplication()
        app.launchArguments=["--secure-lifecycle-ui","--late-recovery-task"]
        app.launch()
        let back=app.buttons["Zurück zum Start"]
        XCTAssertTrue(back.waitForExistence(timeout:15))
        XCTAssertTrue(back.isEnabled)
        if !back.isHittable { app.swipeUp() }
        XCTAssertTrue(back.isHittable)
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
