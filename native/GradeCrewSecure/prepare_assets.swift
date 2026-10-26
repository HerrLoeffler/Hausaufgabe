import AppKit
import Foundation

let root = URL(fileURLWithPath: CommandLine.arguments[0]).deletingLastPathComponent()
let repo = root.deletingLastPathComponent().deletingLastPathComponent()
let source = repo.appendingPathComponent("assets/gradecrew/brand-icon-v1.svg")
let scratch = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
try FileManager.default.createDirectory(at: scratch, withIntermediateDirectories: true)
defer { try? FileManager.default.removeItem(at: scratch) }
let preview = Process()
preview.executableURL = URL(fileURLWithPath: "/usr/bin/qlmanage")
preview.arguments = ["-t", "-s", "896", "-o", scratch.path, source.path]
try preview.run()
preview.waitUntilExit()
guard preview.terminationStatus == 0,
      let file = try FileManager.default.contentsOfDirectory(at: scratch, includingPropertiesForKeys: nil).first(where: { $0.pathExtension == "png" }),
      let image = NSImage(contentsOf: file) else { fatalError("GradeCrew icon rendering failed") }
var rect = NSRect(origin: .zero, size: image.size)
guard let cg = image.cgImage(forProposedRect: &rect, context: nil, hints: nil),
      let context = CGContext(data: nil, width: 1024, height: 1024, bitsPerComponent: 8, bytesPerRow: 0,
                              space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else { fatalError("Icon context failed") }
context.setFillColor(CGColor(red: 0.96, green: 0.97, blue: 0.98, alpha: 1))
context.fill(CGRect(x: 0, y: 0, width: 1024, height: 1024))
context.draw(cg, in: CGRect(x: 64, y: 64, width: 896, height: 896))
// Secure-only badge: canonical logo pixels stay untouched outside this composition.
func variantPNG(test: Bool) throws -> Data {
    guard let ctx = CGContext(data:nil,width:1024,height:1024,bitsPerComponent:8,bytesPerRow:0,
        space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.noneSkipLast.rawValue), let base=context.makeImage() else { fatalError("Secure icon context") }
    ctx.draw(base,in:CGRect(x:0,y:0,width:1024,height:1024))
    let blue=CGColor(red:0.02,green:0.20,blue:0.47,alpha:1)
    ctx.setFillColor(blue);ctx.fillEllipse(in:CGRect(x:665,y:35,width:310,height:310))
    ctx.setStrokeColor(CGColor(gray:1,alpha:1));ctx.setLineWidth(25)
    ctx.addPath(CGPath(roundedRect:CGRect(x:770,y:205,width:100,height:105),cornerWidth:50,cornerHeight:50,transform:nil));ctx.strokePath()
    ctx.setFillColor(CGColor(gray:1,alpha:1));ctx.addPath(CGPath(roundedRect:CGRect(x:735,y:90,width:170,height:145),cornerWidth:24,cornerHeight:24,transform:nil));ctx.fillPath()
    ctx.setFillColor(blue);ctx.fillEllipse(in:CGRect(x:805,y:155,width:30,height:30));ctx.fill(CGRect(x:814,y:132,width:12,height:30))
    if test {
        ctx.setFillColor(CGColor(red:0.75,green:0.25,blue:0.02,alpha:1))
        ctx.addPath(CGPath(roundedRect:CGRect(x:35,y:805,width:355,height:145),cornerWidth:36,cornerHeight:36,transform:nil));ctx.fillPath()
        NSGraphicsContext.saveGraphicsState();NSGraphicsContext.current=NSGraphicsContext(cgContext:ctx,flipped:false)
        NSAttributedString(string:"TEST",attributes:[.font:NSFont.systemFont(ofSize:95,weight:.heavy),.foregroundColor:NSColor.white]).draw(at:CGPoint(x:65,y:817))
        NSGraphicsContext.restoreGraphicsState()
    }
    guard let result=ctx.makeImage(),let data=NSBitmapImageRep(cgImage:result).representation(using:.png,properties:[:]) else {fatalError("Secure icon encoding")}
    return data
}
let assets=root.appendingPathComponent("Resources/Assets.xcassets")
try FileManager.default.createDirectory(at:assets,withIntermediateDirectories:true)
try "{\"info\":{\"author\":\"xcode\",\"version\":1}}".write(to:assets.appendingPathComponent("Contents.json"),atomically:true,encoding:.utf8)
for test in [false,true] {
    let png=try variantPNG(test:test)
    let icon=assets.appendingPathComponent(test ? "TestAppIcon.appiconset" : "AppIcon.appiconset")
    try FileManager.default.createDirectory(at:icon,withIntermediateDirectories:true)
    try png.write(to:icon.appendingPathComponent("AppIcon.png"))
    try "{\"images\":[{\"filename\":\"AppIcon.png\",\"idiom\":\"universal\",\"platform\":\"ios\",\"size\":\"1024x1024\"}],\"info\":{\"author\":\"xcode\",\"version\":1}}".write(to:icon.appendingPathComponent("Contents.json"),atomically:true,encoding:.utf8)
    let logo=assets.appendingPathComponent(test ? "GradeCrewTestLogo.imageset" : "GradeCrewLogo.imageset")
    try FileManager.default.createDirectory(at:logo,withIntermediateDirectories:true)
    try png.write(to:logo.appendingPathComponent("logo.png"))
    try "{\"images\":[{\"filename\":\"logo.png\",\"idiom\":\"universal\"}],\"info\":{\"author\":\"xcode\",\"version\":1}}".write(to:logo.appendingPathComponent("Contents.json"),atomically:true,encoding:.utf8)
}
print("Prepared separate opaque 1024×1024 Secure/TEST lock icons")
// Reuse the current transparent Crew artwork; Quick Look adds a square white canvas.
let crewSet = assets.appendingPathComponent("GradeCrewCrew.imageset")
try FileManager.default.createDirectory(at:crewSet,withIntermediateDirectories:true)
let crewSource = repo.appendingPathComponent("native/GradeCrewTeacher/LayoutTests/Web/Source/assets/gradecrew/crew-dashboard-lineup-c-r-e-w-alpha.png")
try Data(contentsOf:crewSource).write(to:crewSet.appendingPathComponent("crew.png"))
try "{\"images\":[{\"filename\":\"crew.png\",\"idiom\":\"universal\"}],\"info\":{\"author\":\"xcode\",\"version\":1}}".write(to:crewSet.appendingPathComponent("Contents.json"),atomically:true,encoding:.utf8)
