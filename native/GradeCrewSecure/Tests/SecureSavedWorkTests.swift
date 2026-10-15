import XCTest
@testable import AssessmentLabCore
final class SecureSavedWorkTests:XCTestCase {
    func testOldAnswerFileStillLoadsWithoutPresentation() throws {
        let old=Data(#"{"answers":{"revision":0,"answers":"e30="},"autoSubmitted":false}"#.utf8)
        let work=try JSONDecoder().decode(SecureSavedWork.self,from:old)
        XCTAssertNil(work.presentation)
        XCTAssertEqual(work.answers.answers,Data("{}".utf8))
    }
    func testMissingPresentationDoesNotEraseKnownOrderingConfirmation() throws {
        var work=SecureSavedWork()
        work.updatePresentation(.init(touchedQuestionIDs:["order"]),allowedIDs:["order"])
        work.updatePresentation(nil,allowedIDs:["order"])
        XCTAssertEqual(work.presentation?.touchedQuestionIDs,["order"])
        let decoded=try JSONDecoder().decode(SecureSavedWork.self,from:JSONEncoder().encode(work))
        XCTAssertEqual(decoded.presentation?.touchedQuestionIDs,["order"])
    }
    func testForeignAndDuplicateMetadataCannotReplaceValidState() {
        var work=SecureSavedWork()
        work.updatePresentation(.init(touchedQuestionIDs:["a"]),allowedIDs:["a","b"])
        work.updatePresentation(.init(touchedQuestionIDs:["foreign"]),allowedIDs:["a","b"])
        work.updatePresentation(.init(touchedQuestionIDs:["b","b"]),allowedIDs:["a","b"])
        XCTAssertEqual(work.presentation?.touchedQuestionIDs,["a"])
    }
}
