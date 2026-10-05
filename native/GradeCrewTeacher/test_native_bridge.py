"""Exercise the real native file contract with Swift/Foundation."""
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).parent
source = root / "Sources/GradeCrewNativeBridgePolicy.swift"
assert source.exists(), "Native bridge file contract is not implemented yet"
checks = r'''
let selected = URL(string: "https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app/")!
let body: [String: Any] = ["version": 1, "id": "request-1", "action": "shareFile", "payload": ["filename": "Ergebnisse.csv", "mimeType": "text/csv;charset=utf-8", "base64": "TmFtZTtQdW5rdGVcbsOEbm5lOzEw"]]
func parse(_ input: Any = body, source: URL? = selected, loaded: URL? = selected, main: Bool = true) throws -> GradeCrewNativeBridgePolicy.Request {
    try GradeCrewNativeBridgePolicy.validate(body: input, sourceURL: source, loadedURL: loaded, isMainFrame: main, selectedBaseURL: selected)
}
func rejects(_ input: Any = body, source: URL? = selected, loaded: URL? = selected, main: Bool = true) {
    do { _ = try parse(input, source: source, loaded: loaded, main: main); fatalError("Invalid request accepted") }
    catch { }
}
let csv = try parse().file!
assert(csv.filename == "Ergebnisse.csv")
assert(String(data: csv.data, encoding: .utf8) == "Name;Punkte\\nÄnne;10")
let temp = try GradeCrewNativeBridgePolicy.writeTemporaryFile(csv)
let saved = try Data(contentsOf: temp)
assert(saved == csv.data)
assert(temp.lastPathComponent == "Ergebnisse.csv")
GradeCrewNativeBridgePolicy.removeTemporaryFile(temp)
assert(!FileManager.default.fileExists(atPath: temp.deletingLastPathComponent().path))

for url in ["https://example.com", "https://hausaufgabe-40294.web.app", "https://hausaufgabe-staging--another.web.app", "https://hausaufgabe-staging.firebaseapp.com", "http://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app", "https://x:secret@hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app", "https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app:8443", "blob:https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app/id"] {
    rejects(source: URL(string: url)); rejects(loaded: URL(string: url))
}
rejects(main: false); rejects(source: nil); rejects(loaded: nil)
rejects(["version": true, "id": "x", "action": "capabilities"])
rejects(["version": 2, "id": "x", "action": "capabilities"])
rejects(["version": 1, "id": "", "action": "capabilities"])
rejects(["version": 1, "id": "x", "action": "scan"])
rejects(["version": 1, "id": "x", "action": "shareFile"])

func fileRequest(_ name: String, _ mime: String, _ data: Data) -> [String: Any] {
    ["version": 1, "id": "file", "action": "shareFile", "payload": ["filename": name, "mimeType": mime, "base64": data.base64EncodedString()]]
}
let path = try parse(fileRequest("../../results.csv", "text/csv", Data("A;1".utf8))).file!.filename
assert(!path.contains("/")); assert(!path.contains("..")); assert(path.hasSuffix(".csv"))
rejects(fileRequest("results.html", "text/csv", Data("A;1".utf8)))
rejects(fileRequest("evil.svg", "image/svg+xml", Data("<svg/>".utf8)))
rejects(fileRequest("empty.csv", "text/csv", Data()))
rejects(fileRequest("large.csv", "text/csv", Data(repeating: 65, count: 12 * 1024 * 1024 + 1)))
let boundary = try parse(fileRequest("max.csv", "text/csv", Data(repeating: 65, count: 12 * 1024 * 1024))).file!
assert(boundary.data.count == 12 * 1024 * 1024)
rejects(["version": 1, "id": "file", "action": "shareFile", "payload": ["filename": "a.csv", "mimeType": "text/csv", "base64": "!!!!"]])
rejects(fileRequest("fake.pdf", "application/pdf", Data("not pdf".utf8)))
let pdf = try parse(fileRequest("Test.pdf", "application/pdf", Data("%PDF-1.7\nfixture".utf8))).file!
assert(pdf.filename == "Test.pdf")
rejects(fileRequest("bad.json", "application/json", Data("not json".utf8)))
let json = try parse(fileRequest("a.json", "application/json", Data("{\"status\":true}".utf8)))
assert(json.file != nil)
let diag = try parse(["version": 1, "id": "diag", "action": "diagnostics"])
assert(diag.file == nil)
print("Native bridge contract: passed (origin, frame, payload, MIME, bounds, bytes, cleanup)")
var document = GradeCrewNativeBridgePolicy.DocumentState()
assert(!document.isReady)
document.commit(selected)
assert(document.isReady)
document.beginNavigation()
assert(!document.isReady)
assert(document.restoreAfterFailedNavigation(loadedURL: selected, selectedBaseURL: selected))
assert(document.isReady)
document.beginNavigation()
assert(!document.restoreAfterFailedNavigation(loadedURL: URL(string: "https://example.com/"), selectedBaseURL: selected))
assert(!document.isReady)
var neverCommitted = GradeCrewNativeBridgePolicy.DocumentState()
assert(!neverCommitted.restoreAfterFailedNavigation(loadedURL: selected, selectedBaseURL: selected))
print("Document lifecycle: passed (cancelled navigation restores only the intact committed page)")
'''
with tempfile.TemporaryDirectory() as work:
    script = Path(work) / "bridge.swift"
    script.write_text((root / "Sources/GradeCrewBetaEnvironment.swift").read_text() + "\n" + source.read_text() + "\n" + checks)
    subprocess.run(["swift", str(script)], check=True)
