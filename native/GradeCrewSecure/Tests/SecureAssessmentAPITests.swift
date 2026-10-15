import XCTest
@testable import AssessmentLabCore

private final class AssessmentHTTPStub: URLProtocol {
    static var responseBody = Data()
    static var lastURL: URL?
    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }
    override func startLoading() {
        Self.lastURL = request.url
        client?.urlProtocol(self, didReceive: HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: nil, headerFields: ["Content-Type":"application/json"])!, cacheStoragePolicy: .notAllowed)
        client?.urlProtocol(self, didLoad: Self.responseBody)
        client?.urlProtocolDidFinishLoading(self)
    }
    override func stopLoading() {}
}
final class SecureAssessmentAPITests: XCTestCase {
    func testCallableResponseUsesStagingAndUnwrapsResult() async throws {
        AssessmentHTTPStub.responseBody = Data("{\"result\":{\"quiz\":{\"title\":\"Test\"}}}".utf8)
        let config = URLSessionConfiguration.ephemeral
        config.protocolClasses = [AssessmentHTTPStub.self]
        let api = SecureAssessmentAPI(session: URLSession(configuration: config))
        let result = try await api.invoke("getAssessmentInfo", data: ["quizId":"ABCD12"])
        XCTAssertEqual((result["quiz"] as? [String:Any])?["title"] as? String, "Test")
        XCTAssertEqual(AssessmentHTTPStub.lastURL?.host, "europe-west1-hausaufgabe-staging.cloudfunctions.net")
        XCTAssertEqual(AssessmentHTTPStub.lastURL?.path, "/getAssessmentInfo")
    }
    func testFirebaseErrorIsNotTreatedAsSuccessfulSubmission() async throws {
        AssessmentHTTPStub.responseBody = Data("{\"error\":{\"status\":\"DEADLINE_EXCEEDED\",\"message\":\"Frist abgelaufen\"}}".utf8)
        let config = URLSessionConfiguration.ephemeral
        config.protocolClasses = [AssessmentHTTPStub.self]
        let api = SecureAssessmentAPI(session: URLSession(configuration: config))
        do {
            _ = try await api.invoke("submitAssessmentAttempt", data: [:])
            XCTFail("Server error must not become a successful submission")
        } catch let error as SecureAssessmentAPI.Failure {
            XCTAssertEqual(error.code, "DEADLINE_EXCEEDED")
            XCTAssertFalse(error.retryable)
        }
    }
}
