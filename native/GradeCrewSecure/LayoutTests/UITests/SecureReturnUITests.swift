import XCTest
import UIKit

final class SecureReturnUITests:XCTestCase {
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
    #if GRADECREW_STAGING
    func testPersonalCodeIsDirectlyAvailableBesideGuestEntry() throws {
        XCUIDevice.shared.orientation = .landscapeLeft
        defer { XCUIDevice.shared.orientation = .portrait }
        let app=XCUIApplication()
        app.launchArguments=["--secure-start-ui"]
        app.launch()
        let guest=app.textFields["entry.code"]
        let personal=app.textFields["pupil.code"]
        XCTAssertTrue(guest.waitForExistence(timeout:10))
        XCTAssertTrue(personal.waitForExistence(timeout:5),"Personal code must be available without opening a sheet.")
        XCTAssertTrue(app.staticTexts["Du hast einen Account?"].exists)
        let version=app.staticTexts["secure.app.version"]
        XCTAssertTrue(version.exists)
        XCTAssertTrue(version.label.hasPrefix("Version "))
        XCTAssertTrue(version.label.contains("(Build "))
        XCTAssertLessThanOrEqual(version.frame.maxY,app.frame.maxY,"Version must stay visible at the bottom.")
        print("DIRECT_ENTRY_FRAMES",app.frame,guest.frame,personal.frame)
        XCTAssertGreaterThanOrEqual(guest.frame.minX,app.frame.minX)
        XCTAssertLessThanOrEqual(personal.frame.maxX,app.frame.maxX-12,"Personal code must stay inside the screen.")
        if UIDevice.current.userInterfaceIdiom == .pad {
            XCTAssertLessThan(guest.frame.maxX,personal.frame.minX,"Guest entry belongs on the left; personal entry on the right.")
            XCTAssertEqual(guest.frame.minY,personal.frame.minY,accuracy:180)
        }
        let before=XCTAttachment(screenshot:XCUIScreen.main.screenshot());before.name="Direct pupil and guest entry";before.lifetime = .keepAlways;add(before)
        personal.tap();personal.typeText("AB12CD34")
        XCTAssertEqual(personal.value as? String,"AB12CD34")
        XCTAssertEqual(guest.value as? String,"Code deiner Lehrkraft","Personal code must not overwrite the guest test code.")
        XCTAssertTrue(app.buttons["Mit Schülercode anmelden"].isEnabled)
        let attachment=XCTAttachment(screenshot:app.screenshot());attachment.lifetime = .keepAlways;add(attachment)
    }
    func testPortraitPersonalEntryFitsScreen() {
        XCUIDevice.shared.orientation = .portrait
        let app=XCUIApplication();app.launchArguments=["--secure-start-ui"];app.launch()
        let guest=app.textFields["entry.code"],personal=app.textFields["pupil.code"]
        XCTAssertTrue(guest.waitForExistence(timeout:10));XCTAssertTrue(personal.waitForExistence(timeout:5))
        XCTAssertGreaterThanOrEqual(guest.frame.minX,app.frame.minX)
        XCTAssertLessThanOrEqual(guest.frame.maxX,app.frame.maxX-12)
        XCTAssertLessThanOrEqual(personal.frame.maxX,app.frame.maxX-12)
        if UIDevice.current.userInterfaceIdiom == .phone {XCTAssertGreaterThan(personal.frame.minY,guest.frame.maxY)}
        for _ in 0..<3 {if personal.isHittable {break};app.swipeUp()}
        XCTAssertTrue(personal.isHittable)
        personal.tap();personal.typeText("ZX12CV34")
        XCTAssertEqual(personal.value as? String,"ZX12CV34")
        XCTAssertEqual(guest.value as? String,"Code deiner Lehrkraft")
    }
    #endif
    private func returnFlow() {
        let app=XCUIApplication()
        app.launchArguments=["--secure-lifecycle-ui","--late-recovery-task"]
        app.launch()
        let back=app.buttons["Zurück zum Start"]
        XCTAssertTrue(back.waitForExistence(timeout:15))
        XCTAssertTrue(back.isEnabled)
        XCTAssertTrue(app.staticTexts["secure.app.version"].exists,"Version must also be visible after a test.")
        if UIDevice.current.userInterfaceIdiom == .phone, XCUIDevice.shared.orientation.isLandscape {
            XCTAssertTrue(back.isHittable,"The confirmed-return action must fit on a landscape phone without a scroll gesture.")
        }
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
