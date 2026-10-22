import XCTest
import WebKit
@testable import GradeCrewSecureLayoutHost
private final class SecureFixtureHandler:NSObject,WKScriptMessageHandler,WKNavigationDelegate {
    var ready=false
    var expectedDocument:URL?
    var failures:[String]=[]
    func userContentController(_ userContentController:WKUserContentController,didReceive message:WKScriptMessage) {
        guard message.frameInfo.isMainFrame,message.frameInfo.request.url == expectedDocument else { return }
        if (message.body as? [String:Any])?["type"] as? String == "ready" { ready=true }
    }
    func webView(_ webView:WKWebView,didFail navigation:WKNavigation!,withError error:Error) { failures.append("Navigation: "+error.localizedDescription) }
    func webView(_ webView:WKWebView,didFailProvisionalNavigation navigation:WKNavigation!,withError error:Error) { failures.append("Provisional navigation: "+error.localizedDescription) }
    func webViewWebContentProcessDidTerminate(_ webView:WKWebView) { failures.append("Fixture WebContent process terminated") }
}
@MainActor final class SecureWebLayoutTests:XCTestCase {
    // Fixtures have no accounts or external requests. Reuse the ephemeral browser store,
    // as a real exam does, instead of starting hundreds of isolated network processes.
    private let fixtureStore=WKWebsiteDataStore.nonPersistent()
    private var fixtureWeb:WKWebView?
    private var fixtureWindow:UIWindow?
    private var fixtureHandler:SecureFixtureHandler?
    private func closeFixture() {
        fixtureWeb?.stopLoading();fixtureWeb?.navigationDelegate=nil
        fixtureWeb?.configuration.userContentController.removeScriptMessageHandler(forName:"gradecrewSecure")
        fixtureWindow?.isHidden=true;fixtureWindow?.rootViewController=nil
        fixtureWeb=nil;fixtureWindow=nil;fixtureHandler=nil
    }
    func testResourceBoundary() throws { XCTAssertNotNil(Bundle.main.url(forResource:"index",withExtension:"html",subdirectory:"Exam")) }
    func testWebMatrix() async throws {
        defer {closeFixture()}
        try SecureReports.clear("web-")
        let scenes=SecureReports.run.suite != "smoke" ? SecureReports.policy.webScenarios : ["all-types","thirty"]
        for view in SecureReports.views { for size in SecureReports.sizes { for scene in scenes { for overview in [false,true] {
            try await capture(view,size:size,scene:scene,overview:overview)
        } } } }
    }
    private func capture(_ viewport:SecureViewport,size:String,scene:String,overview:Bool,interaction:String? = nil) async throws {
        let url=try XCTUnwrap(Bundle.main.url(forResource:"papers",withExtension:"json",subdirectory:"Fixtures"))
        let fixtures=try XCTUnwrap(try JSONSerialization.jsonObject(with:Data(contentsOf:url)) as? [String:[[String:Any]]])
        let paper=try XCTUnwrap(fixtures[scene])
        let scale=UIFont.preferredFont(forTextStyle:.body,compatibleWith:UITraitCollection(preferredContentSizeCategory:SecureReports.category(size))).pointSize/17
        let payload:[String:Any]=["paper":paper,"quiz":["contentLocale":"de-DE"],"revision":0,"answers":scene == "recovery" ? ["text":"Meine gesicherte Antwort","single":"b"] : [:],"presentationScale":scale]
        let data=try JSONSerialization.data(withJSONObject:payload)
        let web:WKWebView,window:UIWindow,handler:SecureFixtureHandler
        if let existing=fixtureWeb,let existingWindow=fixtureWindow,let existingHandler=fixtureHandler {
            web=existing;window=existingWindow;handler=existingHandler
        } else {
            handler=SecureFixtureHandler()
            let config=WKWebViewConfiguration()
            config.mediaTypesRequiringUserActionForPlayback=[];config.websiteDataStore=fixtureStore
            config.userContentController.add(handler,name:"gradecrewSecure")
            web=WKWebView(frame:.zero,configuration:config);web.navigationDelegate=handler
            web.scrollView.contentInsetAdjustmentBehavior = .never
            let controller=UIViewController();controller.view.addSubview(web)
            window=UIWindow(frame:.zero);window.rootViewController=controller
            fixtureWeb=web;fixtureWindow=window;fixtureHandler=handler
        }
        let frame=CGRect(x:0,y:0,width:viewport.width,height:viewport.height)
        window.frame=frame;window.rootViewController?.view.frame=frame;web.frame=frame
        window.makeKeyAndVisible();web.scrollView.setContentOffset(.zero,animated:false)
        let scripts=web.configuration.userContentController
        scripts.removeAllUserScripts()
        scripts.addUserScript(WKUserScript(source:"window.__GC_EXAM__="+String(decoding:data,as:UTF8.self)+";",injectionTime:.atDocumentStart,forMainFrameOnly:true))
        let page=try XCTUnwrap(Bundle.main.url(forResource:"index",withExtension:"html",subdirectory:"Exam"))
        var document=try XCTUnwrap(URLComponents(url:page,resolvingAgainstBaseURL:false))
        document.queryItems=[URLQueryItem(name:"layoutCase",value:UUID().uuidString)]
        let currentDocument=try XCTUnwrap(document.url)
        handler.expectedDocument=currentDocument;handler.ready=false;handler.failures=[]
        web.loadFileURL(currentDocument,allowingReadAccessTo:page.deletingLastPathComponent())
        for _ in 0..<300 { if handler.ready { break };try await Task.sleep(nanoseconds:50_000_000) }
        var issues:[String]=[]
        if !handler.ready { issues.append("Local renderer not ready");issues += handler.failures }
        var metrics:[String:Any]=[:]
        if handler.ready {
            if overview { _=try await web.evaluateJavaScript("document.getElementById('secureOverviewToggle').click()") }
            try await Task.sleep(nanoseconds:40_000_000)
            let audit="""
            (()=> { const issues=[]; if(document.documentElement.scrollWidth>innerWidth+1)issues.push('Horizontal page overflow');
            if(document.getElementById('secureNavigation').getBoundingClientRect().height>innerHeight*.65 && innerHeight>500)issues.push('Navigation consumes reading area');
            const font=parseFloat(getComputedStyle(document.body).fontSize);if(font<19*\(scale)-.5)issues.push('Requested text size not applied');
            if(document.querySelectorAll('.secureQuestionNumber').length!==\(paper.count))issues.push('Missing question selectors');
            return {issues,innerWidth,scrollWidth:document.documentElement.scrollWidth,font}; })()
            """
            if let result=try await web.evaluateJavaScript(audit) as? [String:Any] { issues += result["issues"] as? [String] ?? ["No audit result"];metrics=result }
        }
        if let interaction,handler.ready {
            issues += try await exercise(interaction,web:web,viewport:viewport)
        }
        let id=interaction.map { "interaction-"+$0 } ?? "web-\(viewport.name)-\(size)-\(scene)-\(overview ? "open" : "closed")"
        try SecureReports.save(id,viewport:SecureViewport(name:viewport.name,width:web.bounds.width,height:web.bounds.height),image:SecureReports.image(web),issues:issues,metrics:metrics)
        XCTAssertTrue(issues.isEmpty,id+": "+issues.joined(separator:", "))
        _=try? await web.evaluateJavaScript("document.getElementById('secureNavigation').__gcQuestionNavigation.destroy()")
        if !handler.ready { throw NSError(domain:"SecureFixture",code:1,userInfo:[NSLocalizedDescriptionKey:issues.joined(separator:", ")]) }
    }
    func testNavigationInteractions() async throws {
        defer {closeFixture()}
        try SecureReports.clear("interaction-")
        let bounds=UIScreen.main.bounds
        let viewport=SecureViewport(name:"device",width:bounds.width,height:bounds.height)
        let cases=[("direct","thirty"),("previous-next","thirty"),("bounds","hundred"),("clear","all-types"),("ordering","all-types"),("keyboard-height","thirty"),("image-resize","media"),("audio-pause","media"),("reduced-motion","thirty"),("freeze","thirty"),("reload","recovery"),("manual-scroll","thirty")]
        XCTAssertEqual(cases.map{$0.0},SecureReports.policy.interactions)
        for (name,scene) in cases { try await capture(viewport,size:"large",scene:scene,overview:false,interaction:name) }
    }
    private func exercise(_ name:String,web:WKWebView,viewport:SecureViewport) async throws ->[String] {
        var issues:[String]=[]
        let setup="""
        window.__beforeAnswers=JSON.stringify(collectAnswers());
        window.__nav=document.getElementById('secureNavigation').__gcQuestionNavigation;
        """
        _=try await web.evaluateJavaScript(setup)
        switch name {
        case "direct","reduced-motion":
            if name == "reduced-motion" { _=try await web.evaluateJavaScript("navigation.destroy();navigation=createQuestionNavigation({paper:currentPaper,root,navRoot:document.getElementById('secureNavigation'),reducedMotion:true});window.__nav=navigation;") }
            _=try await web.evaluateJavaScript("document.querySelectorAll('.secureQuestionNumber')[14].click()")
        case "previous-next":_ = try await web.evaluateJavaScript("document.getElementById('secureNext').click();document.getElementById('secureNext').click();document.getElementById('securePrevious').click()")
        case "bounds":_ = try await web.evaluateJavaScript("document.querySelectorAll('.secureQuestionNumber')[99].click()")
        case "clear":_ = try await web.evaluateJavaScript("const field=document.querySelector('textarea');field.value='Antwort';field.dispatchEvent(new Event('input',{bubbles:true}));field.value='';field.dispatchEvent(new Event('input',{bubbles:true}));")
        case "ordering":_ = try await web.evaluateJavaScript("[...document.querySelector('.secureQuestion[data-qid=ordering]').querySelectorAll('button')].find(b=>b.textContent==='Reihenfolge bestätigen').click()")
        case "keyboard-height":
            web.frame.size.height=380
            _=try await web.evaluateJavaScript("document.querySelectorAll('.secureQuestionNumber')[14].click()")
        case "image-resize":
            _=try await web.evaluateJavaScript("document.querySelectorAll('.secureQuestionNumber')[6].click()")
            try await Task.sleep(nanoseconds:850_000_000)
            _=try await web.evaluateJavaScript("document.querySelectorAll('.secureQuestion')[5].appendChild(Object.assign(document.createElement('div'),{style:'height:360px'}));void 0")
        case "audio-pause":
            // A cold simulator audio service can need more than two seconds.
            // Still require real playback before testing navigation's pause.
            let playing=try await web.callAsyncJavaScript("""
                const audio=document.querySelector('audio');let timer;
                try {
                  await Promise.race([audio.play(),new Promise((_,reject)=>{
                    timer=setTimeout(()=>reject(new Error('Audio playback timeout: '+JSON.stringify({readyState:audio.readyState,paused:audio.paused,error:audio.error?.code,visibility:document.visibilityState}))),10000);
                  })]);
                  return !audio.paused && audio.readyState>=2;
                } finally { clearTimeout(timer); }
                """,arguments:[:],in:nil,contentWorld:.page)
            XCTAssertEqual(playing as? Bool,true,"The audio fixture must actually play before navigation pauses it")
            _=try await web.evaluateJavaScript("document.querySelectorAll('.secureQuestionNumber')[5].click()")
        case "freeze":_ = try await web.evaluateJavaScript("window.__final=gcFreezeAnswers();document.querySelector('textarea').value='late';window.__retry=gcFreezeAnswers()")
        case "reload":
            // Same local reload/bootstrap used after WebKit process loss; no new server attempt.
            let before=try await web.evaluateJavaScript("performance.timeOrigin") as? Double ?? 0
            if before<=0 {issues.append("Missing original document identity")}
            web.reload()
            for _ in 0..<300 {
                if (try? await web.evaluateJavaScript("performance.timeOrigin!==\(before) && typeof gcFreezeAnswers==='function' && !!document.querySelector('textarea')")) as? Bool == true { break }
                try await Task.sleep(nanoseconds:50_000_000)
            }
            if try await web.evaluateJavaScript("performance.timeOrigin!==\(before)") as? Bool != true { issues.append("Reload did not create a new document") }
        case "manual-scroll":_ = try await web.evaluateJavaScript("window.scrollTo(0,document.querySelectorAll('.secureQuestion')[9].offsetTop-document.getElementById('secureNavigation').offsetHeight-4)")
        default:break
        }
        try await Task.sleep(nanoseconds:850_000_000)
        let predicate:String
        switch name {
        case "direct","reduced-motion","keyboard-height":predicate="document.querySelector('[aria-current=step]').dataset.qid==='q14'"
        case "previous-next":predicate="document.querySelector('[aria-current=step]').dataset.qid==='q1'"
        case "bounds":predicate="document.getElementById('secureNext').disabled && document.querySelector('[aria-current=step]').dataset.qid==='q99'"
        case "clear":predicate="!document.querySelector('.secureQuestionNumber[data-qid=text]').classList.contains('complete')"
        case "ordering":predicate="document.querySelector('.secureQuestionNumber[data-qid=ordering]').classList.contains('complete')"
        case "audio-pause":predicate="document.querySelector('audio').paused"
        case "freeze":predicate="__final.revision===__retry.revision && __retry.answers.q0==='' && [...document.querySelectorAll('.secureQuestionNumber')].every(b=>b.disabled)"
        case "reload":predicate="document.querySelector('textarea').value==='Meine gesicherte Antwort'"
        case "manual-scroll":predicate="document.querySelector('[aria-current=step]').dataset.qid==='q9'"
        default:predicate="true"
        }
        if try await web.evaluateJavaScript(predicate) as? Bool != true { issues.append("Interaction failed: "+name) }
        if ["direct","reduced-motion","keyboard-height","image-resize"].contains(name) {
            let visible=try await web.evaluateJavaScript("(()=>{const id=document.querySelector('[aria-current=step]').dataset.qid;const section=[...document.querySelectorAll('.secureQuestion')].find(s=>s.dataset.qid===id);const top=section.querySelector('h2').getBoundingClientRect().top;return top>=document.getElementById('secureNavigation').getBoundingClientRect().bottom && top<innerHeight-20;})()") as? Bool
            if visible != true { issues.append("Target question hidden after "+name)
                let geometry=try? await web.evaluateJavaScript("JSON.stringify({height:innerHeight,scrollY,navBottom:document.getElementById('secureNavigation').getBoundingClientRect().bottom,targets:[...document.querySelectorAll('.secureQuestion')].filter(s=>s.dataset.qid===document.querySelector('[aria-current=step]').dataset.qid).map(s=>s.getBoundingClientRect().top)})")
                issues.append("Geometry: "+String(describing:geometry)) }
        }
        if !["clear","ordering","freeze","reload"].contains(name),try await web.evaluateJavaScript("JSON.stringify(collectAnswers())===__beforeAnswers") as? Bool != true { issues.append("Navigation changed answers") }
        return issues
    }

}
