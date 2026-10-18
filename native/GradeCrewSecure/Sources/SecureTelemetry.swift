import Foundation
import Security

// All credentials AND queued metrics stay in a separate device-only Keychain item.
// The submission path never awaits analytics and clearing exam work cannot erase this queue.
@MainActor final class SecureTelemetry {
    static let shared=SecureTelemetry()
    private var queue=SecureTelemetryQueue()
    private var flushing=false
    private var retry:Task<Void,Never>?
    private let query:[String:Any]=[kSecClass as String:kSecClassGenericPassword,kSecAttrService as String:SecureReleaseEnvironment.telemetryService,kSecAttrAccount as String:"outbox"]
    private init() {
        var read=query;read[kSecReturnData as String]=true;read[kSecMatchLimit as String]=kSecMatchLimitOne
        var value:CFTypeRef?
        if SecItemCopyMatching(read as CFDictionary,&value)==errSecSuccess,let data=value as? Data,let saved=try? JSONDecoder().decode(SecureTelemetryQueue.self,from:data) { queue=saved }
        queue.expire(before:Self.now-30*86400000)
        Task { await flush() }
    }
    static var now:Int64 { Int64(Date().timeIntervalSince1970*1000) }
    func record(identity:SecureAttemptIdentity?,kind:String,completed:[String]?=nil,touched:[String]?=nil,auto:Bool?=nil,revision:Int?=nil) {
        guard let identity,let id=identity.attemptID else { return }
        let event=SecureTelemetryEvent(kind:kind,observedAt:Self.now,completedIds:completed,touchedIds:touched,autoSubmitted:auto,revision:revision)
        queue.expire(before:Self.now-30*86400000)
        queue.append(.init(quizId:identity.code,attemptId:id,attemptToken:identity.token,event:event))
        persist()
        Task { await flush() }
    }
    private func persist() {
        guard let bytes=try? JSONEncoder().encode(queue) else { return }
        let values:[String:Any]=[kSecValueData as String:bytes,kSecAttrAccessible as String:kSecAttrAccessibleWhenUnlockedThisDeviceOnly]
        let result=SecItemUpdate(query as CFDictionary,values as CFDictionary)
        if result == errSecItemNotFound { var add=query;values.forEach{add[$0.key]=$0.value};_ = SecItemAdd(add as CFDictionary,nil) }
    }
    private func flush() async {
        guard !flushing else { return };flushing=true
        defer { flushing=false }
        queue.expire(before:Self.now-30*86400000)
        while let envelope=queue.entries.first {
            do {
                let bytes=try JSONEncoder().encode(envelope)
                let data=try JSONSerialization.jsonObject(with:bytes) as! [String:Any]
                let result=try await SecureAssessmentAPI().invoke("recordSecureExamTelemetry",data:data)
                guard result["accepted"] as? Bool == true else { break }
                queue.acknowledge(envelope.event.eventId);persist()
            } catch let error as SecureAssessmentAPI.Failure where ["PERMISSION_DENIED","INVALID_ARGUMENT"].contains(error.code) {
                // A deleted/revoked attempt must not block later queue entries indefinitely.
                queue.acknowledge(envelope.event.eventId);persist()
            } catch { break }
        }
        if !queue.entries.isEmpty, retry == nil {
            retry=Task { [weak self] in
                try? await Task.sleep(nanoseconds:60_000_000_000)
                guard !Task.isCancelled else { return }
                self?.retry=nil;await self?.flush()
            }
        }
    }
}
