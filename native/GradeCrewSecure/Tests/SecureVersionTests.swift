import XCTest
@testable import AssessmentLabCore

final class SecureVersionTests:XCTestCase {
    func testVersionUsesTheInstalledBundleValuesInsteadOfAHardcodedBuild() {
        XCTAssertEqual(SecureReleaseEnvironment.displayVersion(info:["CFBundleShortVersionString":"1.0","CFBundleVersion":"1232"]),"Version 1.0 (Build 1232)")
        XCTAssertEqual(SecureReleaseEnvironment.displayVersion(info:["CFBundleShortVersionString":"2.1","CFBundleVersion":"2045"]),"Version 2.1 (Build 2045)")
        XCTAssertEqual(SecureReleaseEnvironment.displayVersion(info:[:]),"Version unbekannt (Build unbekannt)")
    }
}
