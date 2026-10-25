import AppKit
// Rasterize the existing canonical SVG; no new brand artwork.
let source = URL(fileURLWithPath: CommandLine.arguments[1])
let output = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
guard let logo = NSImage(contentsOf: source) else { fatalError("Canonical brand SVG unavailable") }
for points in [16,32,128,256,512] {
 for scale in [1,2] {
  let size = points * scale
  let rep = NSBitmapImageRep(bitmapDataPlanes:nil,pixelsWide:size,pixelsHigh:size,bitsPerSample:8,samplesPerPixel:4,hasAlpha:true,isPlanar:false,colorSpaceName:.deviceRGB,bytesPerRow:0,bitsPerPixel:0)!
  NSGraphicsContext.saveGraphicsState(); NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep:rep)
  let s=CGFloat(size), inset=s*0.055
  NSColor.white.setFill(); NSBezierPath(roundedRect:NSRect(x:inset,y:inset,width:s-2*inset,height:s-2*inset),xRadius:s*0.19,yRadius:s*0.19).fill()
  logo.draw(in:NSRect(x:s*0.19,y:s*0.19,width:s*0.62,height:s*0.62))
  NSGraphicsContext.restoreGraphicsState()
  let name="icon_\(points)x\(points)\(scale == 2 ? "@2x" : "").png"
  try rep.representation(using:.png,properties:[:])!.write(to:output.appendingPathComponent(name))
 }
}
