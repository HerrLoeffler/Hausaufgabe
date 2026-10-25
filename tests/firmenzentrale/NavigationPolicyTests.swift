import Foundation
@main struct PolicyTests {
 static func main() {
  let base=URL(string:"http://127.0.0.1:8796")!
  let cases:[(String,Bool,Destination)]=[
   ("http://127.0.0.1:8796/#/eingang",false,.local),
   ("http://127.0.0.1:8797/",true,.deny),
   ("http://localhost:8796/",true,.deny),
   ("http://evil.test:8796/",true,.deny),
   ("file:///etc/passwd",true,.deny),
   ("javascript:alert(1)",true,.deny),
   ("https://github.com/HerrLoeffler/Hausaufgabe",true,.external),
   ("https://github.com/",false,.deny),
   ("http://user:password@127.0.0.1:8796/",true,.deny),
   ("blob:http://127.0.0.1:8796/abc",true,.download),
   ("blob:https://evil.test/abc",true,.deny)]
  for (raw,clicked,expected) in cases {
   precondition(destination(URL(string:raw)!,origin:base,userLink:clicked)==expected, raw)
  }
  print("11 native navigation boundaries passed")
 }
}
