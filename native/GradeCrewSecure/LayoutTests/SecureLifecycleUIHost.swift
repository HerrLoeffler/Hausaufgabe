import SwiftUI

// Compiled into the non-distributed layout host only. No real server or AAC bypass.
struct SecureLifecycleUIHost:View {
    @StateObject private var model:SecureExamCoordinator
    init() {
        let config=URLSessionConfiguration.ephemeral
        config.protocolClasses=[SecureUIReceiptHTTP.self]
        _model=StateObject(wrappedValue:SecureExamCoordinator(api:SecureAssessmentAPI(session:URLSession(configuration:config)),store:SecureUIPendingStore()))
    }
    var body:some View {
        SecureStagingScreen(model:model,assessment:model.assessment)
            .task {
                await model.foreground()
                if ProcessInfo.processInfo.arguments.contains("--late-recovery-task") { await model.startOrRecover() }
            }
    }
}
private final class SecureUIPendingStore:SecureAttemptPersistence {
    private var attempt:SecureAttemptIdentity? = {
        var value=SecureAttemptIdentity(code:"QA1234",name:"Synthetic pupil")
        value.attemptID="a_"+String(repeating:"1",count:28)
        return value
    }()
    private var saved:SecureSavedWork = { var value=SecureSavedWork();_=value.answers.freeze();return value }()
    func identity() throws ->SecureAttemptIdentity? { attempt }
    func work() throws ->SecureSavedWork { saved }
    func save(identity:SecureAttemptIdentity,work:SecureSavedWork) throws { attempt=identity;saved=work }
    func clear() throws { attempt=nil;saved=SecureSavedWork() }
}
private final class SecureUIReceiptHTTP:URLProtocol {
    override class func canInit(with request:URLRequest)->Bool { true }
    override class func canonicalRequest(for request:URLRequest)->URLRequest { request }
    override func startLoading() {
        let result:[String:Any]
        if request.url?.lastPathComponent == "getAssessmentInfo" {
            result=["capabilities":["offlineRecovery":1],"quiz":["title":"Next synthetic test","timeLimitMinutes":5]]
        } else {
            let id="a_"+String(repeating:"1",count:28)
            result=["receipt":["attemptId":id,"submissionId":id,"status":"graded","submittedAtMillis":1000]]
        }
        let bytes=try! JSONSerialization.data(withJSONObject:["result":result])
        client?.urlProtocol(self,didReceive:HTTPURLResponse(url:request.url!,statusCode:200,httpVersion:nil,headerFields:["Content-Type":"application/json"])!,cacheStoragePolicy:.notAllowed)
        client?.urlProtocol(self,didLoad:bytes)
        client?.urlProtocolDidFinishLoading(self)
    }
    override func stopLoading() {}
}
