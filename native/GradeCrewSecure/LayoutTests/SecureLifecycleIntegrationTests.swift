import XCTest
import SwiftUI
import WebKit
@testable import GradeCrewSecureLayoutHost

private final class SecureLifecycleHTTP:URLProtocol {
    private static let lock=NSLock()
    private static var requests=0
    static var submissions:Int { lock.lock();defer{lock.unlock()};return requests }
    static func reset(){lock.lock();requests=0;lock.unlock()}
    override class func canInit(with request:URLRequest)->Bool { true }
    override class func canonicalRequest(for request:URLRequest)->URLRequest { request }
    override func startLoading(){
        let submit=request.url?.lastPathComponent == "submitAssessmentAttempt"
        if submit { Self.lock.lock();Self.requests+=1;Self.lock.unlock() }
        let receipt:[String:Any]=["attemptId":"a_"+String(repeating:"1",count:28),"submissionId":"a_"+String(repeating:"1",count:28),"status":"graded","submittedAtMillis":1000]
        let body=try! JSONSerialization.data(withJSONObject:["result":submit ? [:] : ["receipt":receipt]])
        DispatchQueue.global().asyncAfter(deadline:.now()+(submit ? 6 : 0)) { [self] in
            client?.urlProtocol(self,didReceive:HTTPURLResponse(url:request.url!,statusCode:200,httpVersion:nil,headerFields:["Content-Type":"application/json"])!,cacheStoragePolicy:.notAllowed)
            client?.urlProtocol(self,didLoad:body);client?.urlProtocolDidFinishLoading(self)
        }
    }
    override func stopLoading(){}
}
private final class SecureLifecycleMemoryStore:SecureAttemptPersistence {
    var savedIdentity:SecureAttemptIdentity?
    var savedWork=SecureSavedWork()
    func identity() throws ->SecureAttemptIdentity? { savedIdentity }
    func work() throws ->SecureSavedWork { savedWork }
    func save(identity:SecureAttemptIdentity,work:SecureSavedWork) throws { savedIdentity=identity;savedWork=work }
    func clear() throws { savedIdentity=nil;savedWork=SecureSavedWork() }
}
@MainActor final class SecureLifecycleIntegrationTests:XCTestCase {
    private func setup(expired:Bool) async throws ->(SecureExamCoordinator,UIWindow,WKWebView) {
        SecureLifecycleHTTP.reset()
        let config=URLSessionConfiguration.ephemeral;config.protocolClasses=[SecureLifecycleHTTP.self]
        let model=SecureExamCoordinator(api:SecureAssessmentAPI(session:URLSession(configuration:config)),store:SecureLifecycleMemoryStore())
        model.installLifecycleFixture(expired:expired)
        let view=SecureExamWebView(payload:model.paper!,answers:[:],revision:0,coordinator:model)
        let host=UIHostingController(rootView:view),window=UIWindow(frame:CGRect(x:0,y:0,width:744,height:800))
        window.rootViewController=host;window.makeKeyAndVisible();host.view.frame=window.bounds
        for _ in 0..<150 {
            if let web=model.webView,(try? await web.evaluateJavaScript("typeof window.gcFreezeAnswers==='function' && document.querySelectorAll('.secureQuestionNumber').length===30")) as? Bool == true { return(model,window,web) }
            try await Task.sleep(nanoseconds:20_000_000)
        }
        throw NSError(domain:"SecureLifecycleTest",code:1)
    }
    func testDeadlineClosesNativeConfirmationAndFreezesOpenOverviewExactlyOnce() async throws {
        let (model,window,web)=try await setup(expired:true)
        defer { window.isHidden=true;window.rootViewController=nil }
        _=try await web.evaluateJavaScript("document.getElementById('secureOverviewToggle').click()")
        model.requestSubmitConfirmation();XCTAssertTrue(model.showingSubmitConfirmation,model.storageStatus+model.message)
        let task=Task { await model.runLifecycleTick() }
        for _ in 0..<100 { if model.phase == .submitting {break};try await Task.sleep(nanoseconds:20_000_000) }
        XCTAssertFalse(model.showingSubmitConfirmation)
        await model.submitConfirmed() // A stale dialog action cannot duplicate automatic submission.
        for _ in 0..<100 { if SecureLifecycleHTTP.submissions>0 {break};try await Task.sleep(nanoseconds:20_000_000) }
        XCTAssertEqual(SecureLifecycleHTTP.submissions,1)
        let locked=try await web.evaluateJavaScript("[...document.querySelectorAll('input,textarea,select,button')].every(x=>x.disabled)") as? Bool
        XCTAssertEqual(locked,true)
        await task.value;XCTAssertEqual(model.phase,.completed);XCTAssertEqual(SecureLifecycleHTTP.submissions,1)
    }
    func testActualBridgeRefreezesAfterProcessReloadDuringSubmission() async throws {
        let (model,window,web)=try await setup(expired:false)
        defer { window.isHidden=true;window.rootViewController=nil }
        _=try await web.evaluateJavaScript("const field=document.querySelector('textarea');field.value='Gesicherte Antwort';field.dispatchEvent(new Event('input',{bubbles:true}))")
        let task=Task { await model.submit(auto:false) }
        for _ in 0..<100 { if SecureLifecycleHTTP.submissions>0 {break};try await Task.sleep(nanoseconds:20_000_000) }
        XCTAssertEqual(model.phase,.submitting,model.storageStatus+model.message)
        let bridge=try XCTUnwrap(web.navigationDelegate as? SecureExamWebView.Bridge)
        bridge.webViewWebContentProcessDidTerminate(web)
        var refrozen=false
        for _ in 0..<150 {
            if (try? await web.evaluateJavaScript("document.querySelector('textarea')?.value==='Gesicherte Antwort' && [...document.querySelectorAll('input,textarea,select,button')].every(x=>x.disabled)")) as? Bool == true { refrozen=true;break }
            try await Task.sleep(nanoseconds:20_000_000)
        }
        XCTAssertTrue(refrozen,"Actual Bridge.ready must freeze the replacement renderer while native submission is pending")
        await task.value;XCTAssertEqual(model.phase,.completed);XCTAssertEqual(SecureLifecycleHTTP.submissions,1)
    }
}
