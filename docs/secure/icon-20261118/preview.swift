// Presentation-only comparison. Does not modify either app's asset catalog.
import AppKit
import Foundation
let args = CommandLine.arguments
guard args.count == 4, let teacher = NSImage(contentsOfFile: args[1]), let secure = NSImage(contentsOfFile: args[2]) else { fatalError("teacher.png secure.png output.png") }
let width = 880, height = 650
let space = CGColorSpace(name: CGColorSpace.sRGB)!
let ctx = CGContext(data:nil,width:width,height:height,bitsPerComponent:8,bytesPerRow:0,space:space,bitmapInfo:CGImageAlphaInfo.noneSkipLast.rawValue)!
ctx.setFillColor(CGColor(red:0.95,green:0.96,blue:0.98,alpha:1));ctx.fill(CGRect(x:0,y:0,width:width,height:height))
NSGraphicsContext.saveGraphicsState();NSGraphicsContext.current = NSGraphicsContext(cgContext:ctx,flipped:false)
func label(_ text:String,_ x:CGFloat,_ y:CGFloat,_ size:CGFloat=22) {
    NSAttributedString(string:text,attributes:[.font:NSFont.systemFont(ofSize:size,weight:.semibold),.foregroundColor:NSColor(calibratedRed:0,green:0.17,blue:0.42,alpha:1)]).draw(at:CGPoint(x:x,y:y))
}
label("GradeCrew · Icon-Vergleich",40,600,28)
label("Lehrer-App · unverändert",70,550)
label("Secure · Entwurf",500,550)
for (image,x) in [(teacher,CGFloat(90)),(secure,CGFloat(520))] {
    image.draw(in:CGRect(x:x,y:250,width:260,height:260))
    for (size,dx) in [(CGFloat(80),CGFloat(0)),(CGFloat(60),CGFloat(120)),(CGFloat(40),CGFloat(220))] {
        image.draw(in:CGRect(x:x+dx,y:110,width:size,height:size))
        label("\(Int(size)) px",x+dx,75,15)
    }
}
label("GC-Familie · Schloss + Secure · noch nicht eingereicht",40,24,18)
NSGraphicsContext.restoreGraphicsState()
let bitmap=NSBitmapImageRep(cgImage:ctx.makeImage()!)
try bitmap.representation(using:.png,properties:[:])!.write(to:URL(fileURLWithPath:args[3]))
