import Foundation
import CoreFoundation

/// The native bridge deliberately has narrower privileges than link navigation.
enum GradeCrewNativeBridgePolicy {
    static let version = 1
    static let maximumFileBytes = 12 * 1024 * 1024
    static let maximumEncodedBytes = ((maximumFileBytes + 2) / 3) * 4

    struct DocumentState {
        private(set) var isReady = false
        private var committedURL: URL?
        mutating func beginNavigation() { isReady = false }
        mutating func commit(_ url: URL?) { committedURL = url; isReady = url != nil }
        mutating func restoreAfterFailedNavigation(loadedURL: URL?, selectedBaseURL: URL) -> Bool {
            isReady = committedURL != nil && loadedURL == committedURL && isAllowedDocument(loadedURL, selectedBaseURL: selectedBaseURL)
            return isReady
        }
    }

    struct File {
        let filename: String
        let mimeType: String
        let data: Data
    }

    struct Request {
        let id: String
        let action: String
        let file: File?
    }

    enum Failure: String, Error {
        case forbidden, invalidRequest, unsupportedFile, fileTooLarge
    }

    static func isAllowedDocument(_ url: URL?, selectedBaseURL: URL) -> Bool {
        guard let url, url.scheme?.lowercased() == "https",
              url.user == nil, url.password == nil, url.port == nil,
              let host = url.host?.lowercased(), host == selectedBaseURL.host?.lowercased(),
              selectedBaseURL.scheme?.lowercased() == "https",
              selectedBaseURL.user == nil, selectedBaseURL.password == nil, selectedBaseURL.port == nil else { return false }
        return host == "hausaufgabe-staging.web.app" || GradeCrewBetaEnvironment.previewURL(from: "https://\(host)/") != nil
    }

    static func validate(body: Any, sourceURL: URL?, loadedURL: URL?, isMainFrame: Bool, selectedBaseURL: URL) throws -> Request {
        guard isMainFrame, isAllowedDocument(sourceURL, selectedBaseURL: selectedBaseURL),
              isAllowedDocument(loadedURL, selectedBaseURL: selectedBaseURL) else { throw Failure.forbidden }
        guard let object = body as? [String: Any], let protocolVersion = object["version"] as? NSNumber,
              CFGetTypeID(protocolVersion) != CFBooleanGetTypeID(), protocolVersion.doubleValue == Double(version),
              let id = object["id"] as? String, !id.isEmpty, id.utf8.count <= 80,
              id.allSatisfy({ $0.isASCII && ($0.isLetter || $0.isNumber || "-_.".contains($0)) }),
              let action = object["action"] as? String,
              ["capabilities", "diagnostics", "shareFile"].contains(action) else { throw Failure.invalidRequest }
        if action != "shareFile" { return Request(id: id, action: action, file: nil) }
        guard let payload = object["payload"] as? [String: Any],
              let name = payload["filename"] as? String, !name.isEmpty, name.utf8.count <= 1024,
              let rawMIME = payload["mimeType"] as? String, rawMIME.utf8.count <= 100,
              let encoded = payload["base64"] as? String, !encoded.isEmpty else { throw Failure.invalidRequest }
        guard encoded.utf8.count <= maximumEncodedBytes else { throw Failure.fileTooLarge }
        let mime = rawMIME.split(separator: ";", maxSplits: 1).first?.trimmingCharacters(in: .whitespaces).lowercased() ?? ""
        let allowedExtensions = ["text/csv": ["csv"], "application/pdf": ["pdf"], "text/plain": ["txt"],
                                 "application/json": ["json"], "image/png": ["png"], "image/jpeg": ["jpg", "jpeg"]]
        let filename = safeFilename(name)
        guard let extensions = allowedExtensions[mime], extensions.contains((filename as NSString).pathExtension.lowercased()) else { throw Failure.unsupportedFile }
        guard let data = Data(base64Encoded: encoded), !data.isEmpty else { throw Failure.invalidRequest }
        guard data.count <= maximumFileBytes else { throw Failure.fileTooLarge }
        switch mime {
        case "application/pdf":
            guard data.starts(with: Data("%PDF-".utf8)) else { throw Failure.unsupportedFile }
        case "image/png":
            guard data.starts(with: [137, 80, 78, 71, 13, 10, 26, 10]) else { throw Failure.unsupportedFile }
        case "image/jpeg":
            guard data.starts(with: [255, 216, 255]) else { throw Failure.unsupportedFile }
        case "application/json":
            guard (try? JSONSerialization.jsonObject(with: data, options: .fragmentsAllowed)) != nil else { throw Failure.unsupportedFile }
        default:
            guard String(data: data, encoding: .utf8) != nil else { throw Failure.unsupportedFile }
        }
        return Request(id: id, action: action, file: File(filename: filename, mimeType: mime, data: data))
    }

    private static func safeFilename(_ value: String) -> String {
        let forbidden = CharacterSet.controlCharacters.union(CharacterSet(charactersIn: "/\\:"))
        var result = value.components(separatedBy: forbidden).joined(separator: "-")
        while result.contains("..") { result = result.replacingOccurrences(of: "..", with: "-") }
        result = result.trimmingCharacters(in: .whitespacesAndNewlines)
        // Bound by UTF-8 bytes (APFS filename limit), preserving the extension.
        let ext = (result as NSString).pathExtension
        var stem = (result as NSString).deletingPathExtension
        while stem.utf8.count > 180 { stem.removeLast() }
        if stem.isEmpty || stem == "." { stem = "GradeCrew" }
        return ext.isEmpty ? stem : "\(stem).\(ext)"
    }

    static func writeTemporaryFile(_ file: File) throws -> URL {
        let root = FileManager.default.temporaryDirectory.appendingPathComponent("GradeCrewBridge", isDirectory: true)
            .appendingPathComponent(UUID().uuidString, isDirectory: true)
        do {
            try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
            let destination = root.appendingPathComponent(file.filename)
            try file.data.write(to: destination, options: .atomic)
            return destination
        } catch {
            try? FileManager.default.removeItem(at: root)
            throw error
        }
    }

    static func removeTemporaryFile(_ file: URL) {
        try? FileManager.default.removeItem(at: file.deletingLastPathComponent())
    }
}
