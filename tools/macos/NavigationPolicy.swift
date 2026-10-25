import Foundation

enum Destination: Equatable { case local, download, external, deny }
func destination(_ url: URL, origin: URL, userLink: Bool) -> Destination {
    if url.user != nil || url.password != nil { return .deny }
    if url.scheme == origin.scheme && url.host == origin.host && url.port == origin.port { return .local }
    if url.scheme == "blob", let nested = URL(string: String(url.absoluteString.dropFirst(5))),
       nested.scheme == origin.scheme && nested.host == origin.host && nested.port == origin.port { return .download }
    if userLink && url.scheme == "https" && url.host != nil { return .external }
    return .deny
}
