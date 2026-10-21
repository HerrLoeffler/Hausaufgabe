import XCTest
import SwiftUI
@testable import GradeCrewSecureLayoutHost

@MainActor final class SecureNativeLayoutTests: XCTestCase {
    func testBootstrap() async throws {
        let host = UIHostingController(rootView: SecureStagingRootView())
        let window = UIWindow(frame:CGRect(x:0,y:0,width:744,height:1133))
        window.rootViewController=host;window.makeKeyAndVisible()
        host.view.frame=window.bounds;host.view.layoutIfNeeded()
        try await Task.sleep(nanoseconds:300_000_000)
        XCTAssertEqual(host.view.bounds.width,744,accuracy:1)
        let image=UIGraphicsImageRenderer(bounds:host.view.bounds).image { _ in host.view.drawHierarchy(in:host.view.bounds,afterScreenUpdates:true) }
        XCTAssertNotNil(image.pngData())
        window.isHidden=true;window.rootViewController=nil
    }
    func testEntryMatrix() async throws {
        try SecureReports.clear("native-")
        for view in SecureReports.views { for appearance in ["light","dark"] { for size in SecureReports.sizes {
            for scenario in (SecureReports.run.suite == "full" ? SecureReports.policy.nativeScenarios : ["entry-empty","entry-ready","active","storage-error","completed"]) {
                try await capture(view,appearance:appearance,size:size,scenario:scenario)
            }
        } } }
    }
    private func capture(_ viewport:SecureViewport,appearance:String,size:String,scenario:String) async throws {
        var samples:[String:SecureLayoutSample]=[:]
        let ready=scenario != "entry-empty"
        let content=fixture(scenario,ready:ready)
            .environment(\.dynamicTypeSize,SecureReports.size(size)).coordinateSpace(name:"secureLayout")
            .onPreferenceChange(SecureLayoutSamples.self) { samples=$0 }
        let host=UIHostingController(rootView:content)
        let window=UIWindow(frame:CGRect(x:0,y:0,width:viewport.width,height:viewport.height))
        window.overrideUserInterfaceStyle=appearance == "dark" ? .dark : .light
        window.rootViewController=host;window.makeKeyAndVisible();host.view.frame=window.bounds;host.view.layoutIfNeeded()
        try await Task.sleep(nanoseconds:60_000_000)
        var issues:[String]=[]
        if samples.isEmpty { issues.append("No actual native geometry samples") }
        for sample in samples.values {
            let r=sample.frame
            if r.minX < -1 || r.maxX > viewport.width+1 { issues.append(sample.id+": horizontal overflow") }
            if sample.role == "center",abs(r.midX-viewport.width/2)>1.5 { issues.append(sample.id+": not centered") }
            if ["field","tap"].contains(sample.role),r.width<43.99 || r.height<43.99 { issues.append(sample.id+": small target") }
        }
        let id="native-\(viewport.name)-\(appearance)-\(size)-\(scenario)"
        try SecureReports.save(id,viewport:viewport,image:SecureReports.image(host.view),issues:issues,metrics:["samples":samples.count])
        XCTAssertTrue(issues.isEmpty,id+": "+issues.joined(separator:", "))
        window.isHidden=true;window.rootViewController=nil
    }

    @ViewBuilder private func fixture(_ scenario:String,ready:Bool)->some View {
        if ["entry-empty","entry-ready","code-error","preflight"].contains(scenario) {
            SecureWelcomeFrame(entry:true) {
                SecureEntryView(code:.constant(ready ? "AB12CD" : ""),name:.constant(ready ? "Testkürzel" : ""),busy:scenario == "preflight",message:scenario == "code-error" ? "Dieser Test existiert nicht. Prüfe bitte den Code deiner Lehrkraft." : "",onStart:{})
            }
        } else if ["active","active-long","network","storage-error"].contains(scenario) {
            SecureExamFrame(header:SecureExamHeader(title:scenario == "active-long" ? String(repeating:"Ein sehr langer Testtitel ",count:7) : "Englisch · Farben und Schulsachen",participant:"Testkürzel 123",remaining:scenario == "active-long" ? nil : 59),footer:SecureExamFooter(storageStatus:scenario == "storage-error" ? "Nicht gesichert. Bitte Lehrkraft informieren." : "Auf diesem iPad gesichert",warning:scenario == "network" ? "Verbindung unterbrochen. Antworten bleiben auf diesem iPad." : nil,canSubmit:scenario != "storage-error",onSubmit:{})) {
                SecureTheme.canvas.secureMeasure("exam.content")
            }
        } else {
            let phase:SecureExamCoordinator.Phase = ["starting":.starting,"waiting":.waiting,"submitting":.submitting,"verifying":.verifying,"recovery":.recovery,"interrupted":.interrupted,"completed":.completed][scenario]!
            SecureWelcomeFrame { SecureStatusView(presentation:.init(phase:phase,message:"Die Prüfung wird vorbereitet. Dein gesicherter Stand bleibt erhalten.",busy:["starting","submitting","verifying"].contains(scenario)),onAction:{}) }
        }
    }

}
