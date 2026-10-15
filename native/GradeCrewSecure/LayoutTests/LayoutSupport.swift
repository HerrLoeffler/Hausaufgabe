import XCTest
import SwiftUI
import WebKit
@testable import GradeCrewSecureLayoutHost

struct SecureViewport: Decodable { let name:String; let width:CGFloat; let height:CGFloat }
struct SecureLayoutPolicy: Decodable { let viewports:[SecureViewport];let nativeScenarios:[String];let webScenarios:[String];let appearances:[String];let textSizes:[String];let interactions:[String] }
struct SecureLayoutRun: Decodable { let suite:String;let layer:String }
@MainActor enum SecureReports {
    static let run:SecureLayoutRun = {
        let path=Bundle.main.url(forResource:"run",withExtension:"json",subdirectory:"Fixtures")!
        return try! JSONDecoder().decode(SecureLayoutRun.self,from:Data(contentsOf:path))
    }()
    static let policy:SecureLayoutPolicy = {
        let path=Bundle.main.url(forResource:"layout-policy",withExtension:"json",subdirectory:"Fixtures")!
        return try! JSONDecoder().decode(SecureLayoutPolicy.self,from:Data(contentsOf:path))
    }()
    static var views:[SecureViewport] { run.suite == "full" ? policy.viewports : [policy.viewports[1],policy.viewports[8]] }
    static var sizes:[String] { run.suite == "full" ? policy.textSizes : [policy.textSizes[0],policy.textSizes[2]] }
    static func size(_ name:String)->DynamicTypeSize { name == "accessibility3" ? .accessibility3 : (name == "xxxLarge" ? .xxxLarge : .large) }
    static func category(_ name:String)->UIContentSizeCategory { name == "accessibility3" ? .accessibilityExtraLarge : (name == "xxxLarge" ? .extraExtraExtraLarge : .large) }
    static var folder:URL { FileManager.default.urls(for:.documentDirectory,in:.userDomainMask)[0].appendingPathComponent("SecureLayoutReports") }
    static func clear(_ prefix:String) throws {
        try FileManager.default.createDirectory(at:folder,withIntermediateDirectories:true)
        for file in try FileManager.default.contentsOfDirectory(at:folder,includingPropertiesForKeys:nil) where file.lastPathComponent.hasPrefix(prefix) { try FileManager.default.removeItem(at:file) }
    }
    static func save(_ id:String,viewport:SecureViewport,image:UIImage,issues:[String],metrics:[String:Any]=[:]) throws {
        try FileManager.default.createDirectory(at:folder,withIntermediateDirectories:true)
        try XCTUnwrap(image.pngData()).write(to:folder.appendingPathComponent(id+".png"))
        let record:[String:Any] = ["caseID":id,"viewport":["width":viewport.width,"height":viewport.height],"issues":issues,"metrics":metrics]
        try JSONSerialization.data(withJSONObject:record,options:[.prettyPrinted,.sortedKeys]).write(to:folder.appendingPathComponent(id+".json"))
    }
    static func image(_ view:UIView)->UIImage {
        let format=UIGraphicsImageRendererFormat();format.scale=1
        return UIGraphicsImageRenderer(bounds:view.bounds,format:format).image { _ in view.drawHierarchy(in:view.bounds,afterScreenUpdates:true) }
    }
}
