import AppKit
import WebKit

let pageURL = URL(fileURLWithPath:CommandLine.arguments[1]).standardizedFileURL
var complete = false
var passed = false
final class Probe: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
    func userContentController(_ userContentController:WKUserContentController,didReceive message:WKScriptMessage) {
        guard let body = message.body as? [String:Any], body["type"] as? String == "ready" else { return }
        guard message.frameInfo.isMainFrame, message.frameInfo.request.url?.standardizedFileURL == pageURL else {
            print("FAIL: bridge origin"); complete=true; return
        }
        message.webView?.evaluateJavaScript("({count:document.querySelectorAll('.secureQuestion').length,nav:document.querySelectorAll('.secureQuestionNumber').length,snapshot:window.gcFreezeAnswers()})") { result,error in
            if let object = result as? [String:Any], (object["count"] as? Int) == 3, (object["nav"] as? Int) == 3,
               let snapshot = object["snapshot"] as? [String:Any], let answers = snapshot["answers"] as? [String:Any],
               answers["text"] as? String == "Gesichert", answers["single"] as? String == "b" {
                passed=true
                print("PASS: real WKWebView, local CSP/resources, main-frame bridge, renderer and restored final answers")
            } else { print("FAIL: renderer",error?.localizedDescription ?? String(describing:result)) }
            complete=true
        }
    }
    func webView(_ webView:WKWebView,didFailProvisionalNavigation navigation:WKNavigation!,withError error:Error) { print("FAIL:",error); complete=true }
}
let app = NSApplication.shared
let probe=Probe()
let config=WKWebViewConfiguration()
config.websiteDataStore = .nonPersistent()
let payload:[String:Any] = ["quiz":["contentLocale":"de-DE"],"revision":2,"answers":["text":"Gesichert","single":"b"],"paper":[
    ["id":"text","type":"text","text":"Schreibe"],
    ["id":"single","type":"single","text":"Wähle","options":[["id":"a","text":"A"],["id":"b","text":"B"]]],
    ["id":"number","type":"number","text":"Rechne"]
]]
let data=try JSONSerialization.data(withJSONObject:payload)
config.userContentController.addUserScript(WKUserScript(source:"window.__GC_EXAM__="+String(decoding:data,as:UTF8.self)+";",injectionTime:.atDocumentStart,forMainFrameOnly:true))
config.userContentController.add(probe,name:"gradecrewSecure")
let web=WKWebView(frame:NSRect(x:0,y:0,width:768,height:1024),configuration:config)
web.navigationDelegate=probe
web.loadFileURL(pageURL,allowingReadAccessTo:pageURL.deletingLastPathComponent())
let deadline=Date().addingTimeInterval(45)
while !complete && Date()<deadline { RunLoop.current.run(until:Date().addingTimeInterval(0.05)) }
if !complete { print("FAIL: renderer timed out") }
exit(passed ? 0:1)
