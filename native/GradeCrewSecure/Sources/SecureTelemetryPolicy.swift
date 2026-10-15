import Foundation
struct SecureTelemetryEvent:Codable {
    var eventId=UUID().uuidString.replacingOccurrences(of:"-",with:"").lowercased()
    var kind:String
    var observedAt:Int64
    var completedIds:[String]?
    var touchedIds:[String]?
    var autoSubmitted:Bool?
    var revision:Int?
}
struct SecureTelemetryEnvelope:Codable {
    var quizId:String
    var attemptId:String
    var attemptToken:String
    var event:SecureTelemetryEvent
}
struct SecureTelemetryQueue:Codable {
    private(set) var entries:[SecureTelemetryEnvelope]=[]
    mutating func append(_ entry:SecureTelemetryEnvelope) {
        if entry.event.kind == "progress" {
            entries.removeAll { $0.attemptId == entry.attemptId && $0.quizId == entry.quizId && $0.event.kind == "progress" }
        }
        entries.append(entry)
        if entries.count>128 { entries.removeFirst(entries.count-128) }
    }
    mutating func acknowledge(_ id:String) { entries.removeAll{$0.event.eventId == id} }
    mutating func expire(before millis:Int64) { entries.removeAll{$0.event.observedAt<millis} }
}
