import XCTest
import WebKit
@testable import GradeCrewSecureLayoutHost
private final class SecureFixtureHandler:NSObject,WKScriptMessageHandler {
    var ready=false
    func userContentController(_ userContentController:WKUserContentController,didReceive message:WKScriptMessage) {
        if (message.body as? [String:Any])?["type"] as? String == "ready" { ready=true }
    }
}
@MainActor final class SecureWebLayoutTests:XCTestCase {
    func testResourceBoundary() throws { XCTAssertNotNil(Bundle.main.url(forResource:"index",withExtension:"html",subdirectory:"Exam")) }
    func testWebMatrix() async throws {
        try SecureReports.clear("web-")
        let scenes=SecureReports.run.suite == "full" ? SecureReports.policy.webScenarios : ["all-types","thirty"]
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
        let handler=SecureFixtureHandler(),config=WKWebViewConfiguration()
        config.mediaTypesRequiringUserActionForPlayback = []
        config.websiteDataStore = .nonPersistent()
        config.userContentController.add(handler,name:"gradecrewSecure")
        config.userContentController.addUserScript(WKUserScript(source:"window.__GC_EXAM__="+String(decoding:data,as:UTF8.self)+";",injectionTime:.atDocumentStart,forMainFrameOnly:true))
        let web=WKWebView(frame:CGRect(x:0,y:0,width:viewport.width,height:viewport.height),configuration:config)
        web.scrollView.contentInsetAdjustmentBehavior = .never
        let controller=UIViewController();controller.view.addSubview(web)
        let window=UIWindow(frame:web.frame);window.rootViewController=controller;window.makeKeyAndVisible();web.frame=CGRect(origin:.zero,size:CGSize(width:viewport.width,height:viewport.height))
        let page=try XCTUnwrap(Bundle.main.url(forResource:"index",withExtension:"html",subdirectory:"Exam"))
        web.loadFileURL(page,allowingReadAccessTo:page.deletingLastPathComponent())
        for _ in 0..<100 { if handler.ready { break };try await Task.sleep(nanoseconds:50_000_000) }
        var issues:[String]=[]
        if !handler.ready { issues.append("Local renderer not ready") }
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
        web.stopLoading();config.userContentController.removeScriptMessageHandler(forName:"gradecrewSecure")
        window.isHidden=true;window.rootViewController=nil
    }
    func testNavigationInteractions() async throws {
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
            _=try await web.evaluateJavaScript("document.querySelectorAll('.secureQuestion')[5].appendChild(Object.assign(document.createElement('div'),{style:'height:360px'}))")
        case "audio-pause":
            _=try await web.callAsyncJavaScript("const audio=document.querySelector('audio');await Promise.race([audio.play(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Audio playback timeout')),2000))]);return !audio.paused;",arguments:[:],in:nil,contentWorld:.page)
            _=try await web.evaluateJavaScript("document.querySelectorAll('.secureQuestionNumber')[5].click()")
        case "freeze":_ = try await web.evaluateJavaScript("window.__final=gcFreezeAnswers();document.querySelector('textarea').value='late';window.__retry=gcFreezeAnswers()")
        case "reload":
            // Same local reload/bootstrap used after WebKit process loss; no new server attempt.
            let revision=try await web.evaluateJavaScript("revision")
            web.reload()
            for _ in 0..<100 { if (try? await web.evaluateJavaScript("typeof gcFreezeAnswers==='function' && !!document.querySelector('textarea')")) as? Bool == true { break };try await Task.sleep(nanoseconds:50_000_000) }
            _=revision
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
            if visible != true { issues.append("Target question hidden after "+name) }
        }
        if !["clear","ordering","freeze","reload"].contains(name),try await web.evaluateJavaScript("JSON.stringify(collectAnswers())===__beforeAnswers") as? Bool != true { issues.append("Navigation changed answers") }
        return issues
    }

}
