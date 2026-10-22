import XCTest
import SwiftUI
import WebKit
@testable import GradeCrewSecureLayoutHost

private final class SecureLifecycleHTTP:URLProtocol {
    private static let lock=NSLock()
    private static var requests=0
    static var readyBackend=false
    static var failSubmission=false
    static var receiptPending=false
    static var sentAnswers:[Data]=[]
    static var submissions:Int { lock.lock();defer{lock.unlock()};return requests }
    static func reset(){lock.lock();requests=0;readyBackend=false;failSubmission=false;receiptPending=false;sentAnswers=[];lock.unlock()}
    override class func canInit(with request:URLRequest)->Bool { true }
    override class func canonicalRequest(for request:URLRequest)->URLRequest { request }
    override func startLoading(){
        if request.url?.lastPathComponent == "getAssessmentInfo" {
            var result:[String:Any]=["quiz":["title":"QA","timeLimitMinutes":5]]
            if Self.readyBackend { result["capabilities"]=["offlineRecovery":1] }
            let body=try! JSONSerialization.data(withJSONObject:["result":result])
            client?.urlProtocol(self,didReceive:HTTPURLResponse(url:request.url!,statusCode:200,httpVersion:nil,headerFields:nil)!,cacheStoragePolicy:.notAllowed)
            client?.urlProtocol(self,didLoad:body);client?.urlProtocolDidFinishLoading(self);return
        }
        let submit=request.url?.lastPathComponent == "submitAssessmentAttempt"
        if submit { Self.lock.lock();Self.requests+=1;Self.lock.unlock() }
        if submit {
            if let bytes=request.httpBody { Self.sentAnswers.append(bytes) }
            if Self.failSubmission { client?.urlProtocol(self,didFailWithError:URLError(.notConnectedToInternet));return }
            Self.receiptPending=false
        } else if Self.receiptPending {
            let body=Data("{\"error\":{\"status\":\"FAILED_PRECONDITION\",\"message\":\"Not submitted\"}}".utf8)
            client?.urlProtocol(self,didReceive:HTTPURLResponse(url:request.url!,statusCode:400,httpVersion:nil,headerFields:nil)!,cacheStoragePolicy:.notAllowed)
            client?.urlProtocol(self,didLoad:body);client?.urlProtocolDidFinishLoading(self);return
        }
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
    private func setup(expired:Bool,store:SecureLifecycleMemoryStore=SecureLifecycleMemoryStore()) async throws ->(SecureExamCoordinator,UIWindow,WKWebView) {
        SecureLifecycleHTTP.reset()
        let config=URLSessionConfiguration.ephemeral;config.protocolClasses=[SecureLifecycleHTTP.self]
        let model=SecureExamCoordinator(api:SecureAssessmentAPI(session:URLSession(configuration:config)),store:store)
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
    func testPreflightRequiresRecoveryCapableBackendBeforeAnyAttemptStarts() async throws {
        SecureLifecycleHTTP.reset()
        let config=URLSessionConfiguration.ephemeral;config.protocolClasses=[SecureLifecycleHTTP.self]
        let store=SecureLifecycleMemoryStore()
        let model=SecureExamCoordinator(api:SecureAssessmentAPI(session:URLSession(configuration:config)),store:store)
        model.code="QA1234"
        await model.preflight()
        XCTAssertEqual(model.phase,.code)
        XCTAssertTrue(model.message.contains("noch nicht bereit"))
        XCTAssertNil(store.savedIdentity)
        SecureLifecycleHTTP.readyBackend=true
        await model.preflight()
        XCTAssertEqual(model.phase,.identity)
        XCTAssertNil(store.savedIdentity)
    }
    func testOfflineSubmissionPersistsThenRecoversAfterAppRestartWithoutNewAAC() async throws {
        let store=SecureLifecycleMemoryStore()
        let (model,window,web)=try await setup(expired:false,store:store)
        defer {window.isHidden=true;window.rootViewController=nil}
        _=try await web.evaluateJavaScript("const field=document.querySelector('textarea');field.value='Offline answer';field.dispatchEvent(new Event('input',{bubbles:true}))")
        SecureLifecycleHTTP.failSubmission=true
        await model.submit(auto:false)
        XCTAssertEqual(model.phase,.recovery)
        XCTAssertNotNil(store.savedWork.answers.frozen)
        XCTAssertNotNil(store.savedIdentity)
        XCTAssertNil(model.paper)
        XCTAssertFalse(model.assessment.active)
        XCTAssertFalse(model.canSubmit)
        XCTAssertTrue(model.message.contains("Übertragung ausstehend"))
        let frozen=store.savedWork.answers.frozen
        SecureLifecycleHTTP.failSubmission=false;SecureLifecycleHTTP.receiptPending=true
        let config=URLSessionConfiguration.ephemeral;config.protocolClasses=[SecureLifecycleHTTP.self]
        let restored=SecureExamCoordinator(api:SecureAssessmentAPI(session:URLSession(configuration:config)),store:store)
        await restored.startOrRecover()
        XCTAssertEqual(restored.phase,.completed,"Pending transmission must not attempt a new AAC session on simulator")
        XCTAssertNil(store.savedIdentity)
        XCTAssertEqual(SecureLifecycleHTTP.submissions,2)
        XCTAssertFalse(restored.busy,"Confirmed completion must enable the return action")
        // A retry queued before confirmation must not start another attempt.
        await restored.startOrRecover()
        XCTAssertEqual(restored.phase,.completed,"A late retry must leave confirmed completion available")
        XCTAssertNil(store.savedIdentity,"A late retry must not persist a fresh attempt")
        restored.restart()
        XCTAssertEqual(restored.phase,.code)
        XCTAssertEqual(restored.code,"")
        XCTAssertEqual(restored.name,"")
        await restored.foreground()
        XCTAssertEqual(restored.phase,.code,"A foreground callback must not restore the finished attempt")
        SecureLifecycleHTTP.readyBackend=true
        restored.code="NEXT123";restored.name="Next synthetic pupil"
        await restored.preflight()
        XCTAssertEqual(restored.phase,.identity,"The next test must be reachable without relaunching the app")
        for bytes in SecureLifecycleHTTP.sentAnswers {
            let payload=try XCTUnwrap(try JSONSerialization.jsonObject(with:bytes) as? [String:Any])
            let data=try XCTUnwrap(payload["data"] as? [String:Any])
            let answers=try XCTUnwrap(data["answers"])
            let sent=try JSONSerialization.data(withJSONObject:answers,options:.sortedKeys)
            let expected=try JSONSerialization.data(withJSONObject:JSONSerialization.jsonObject(with:try XCTUnwrap(frozen)),options:.sortedKeys)
            XCTAssertEqual(sent,expected)
        }
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
        let previousOrigin=try await web.evaluateJavaScript("performance.timeOrigin") as? Double ?? 0
        XCTAssertGreaterThan(previousOrigin,0)
        bridge.webViewWebContentProcessDidTerminate(web)
        var refrozen=false
        for _ in 0..<150 {
            if (try? await web.evaluateJavaScript("performance.timeOrigin!==\(previousOrigin) && document.querySelector('textarea')?.value==='Gesicherte Antwort' && [...document.querySelectorAll('input,textarea,select,button')].every(x=>x.disabled)")) as? Bool == true { refrozen=true;break }
            try await Task.sleep(nanoseconds:20_000_000)
        }
        XCTAssertTrue(refrozen,"Actual Bridge.ready must freeze the replacement renderer while native submission is pending")
        await task.value;XCTAssertEqual(model.phase,.completed);XCTAssertEqual(SecureLifecycleHTTP.submissions,1)
    }
    func testManualActionSurvivesSwiftUIDialogAutoDismissal() async throws {
        let (model,window,_)=try await setup(expired:false)
        defer { window.isHidden=true;window.rootViewController=nil }
        model.requestSubmitConfirmation()
        // SwiftUI writes false to its presentation binding as it invokes the chosen action.
        model.hideSubmitConfirmation()
        await model.submitConfirmed()
        XCTAssertEqual(SecureLifecycleHTTP.submissions,1)
        XCTAssertEqual(model.phase,.completed)
    }
}
