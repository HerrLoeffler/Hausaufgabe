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
guard let result = context.makeImage(), let png = NSBitmapImageRep(cgImage: result).representation(using: .png, properties: [:]) else { fatalError("Icon encoding failed") }
let assets = root.appendingPathComponent("Resources/Assets.xcassets")
let icon = assets.appendingPathComponent("AppIcon.appiconset")
try FileManager.default.createDirectory(at: icon, withIntermediateDirectories: true)
try png.write(to: icon.appendingPathComponent("AppIcon.png"))
try "{\"info\":{\"author\":\"xcode\",\"version\":1}}\n".write(to: assets.appendingPathComponent("Contents.json"), atomically: true, encoding: .utf8)
try "{\"images\":[{\"filename\":\"AppIcon.png\",\"idiom\":\"universal\",\"platform\":\"ios\",\"size\":\"1024x1024\"}],\"info\":{\"author\":\"xcode\",\"version\":1}}\n".write(to: icon.appendingPathComponent("Contents.json"), atomically: true, encoding: .utf8)
print("Prepared opaque 1024×1024 GradeCrew Secure icon")
