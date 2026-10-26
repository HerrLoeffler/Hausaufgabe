import Foundation
struct SecureReplacementReceipt:Codable {
 let kind:String
 let quizId:String
 let oldAttemptId:String
 let assignmentId:String
 let oldGeneration:Int
 let generation:Int
 let replacementActionId:String
 let serverNow:Double
 static func parse(_ value:[String:Any],quizID:String,attemptID:String,assignmentID:String,generation:Int)->Self? {
  guard let bytes=try? JSONSerialization.data(withJSONObject:value),let r=try? JSONDecoder().decode(Self.self,from:bytes),r.kind=="classroom_replacement_v1",r.quizId==quizID,r.oldAttemptId==attemptID,r.assignmentId==assignmentID,r.oldGeneration==generation,r.generation>generation,!r.replacementActionId.isEmpty,r.serverNow.isFinite,r.serverNow>0 else{return nil};return r
 }
}
struct SecureResumeNotice {
 let id:String
 let generation:Int
 static func parse(_ value:[String:Any],generation:Int,serverNow:Double)->Self? {
  guard let id=value["id"] as? String,!id.isEmpty,(value["generation"] as? NSNumber)?.intValue==generation,let expiry=(value["expiresAt"] as? NSNumber)?.doubleValue,expiry>serverNow,(value["deliveredAt"] as? NSNumber)?.doubleValue != nil,!(value["acknowledgedAt"] is NSNumber) else{return nil};return .init(id:id,generation:generation)
 }
}


struct SecureDeviceExitAction:Codable {
 let kind:String
 let quizId:String
 let assignmentId:String
 let studentId:String
 let attemptId:String
 let generation:Int
 let actionId:String
 let state:String
 static func parse(_ value:[String:Any],quizID:String,attemptID:String,assignmentID:String,studentID:String,generation:Int)->Self? {
  guard let data=try? JSONSerialization.data(withJSONObject:value),let a=try? JSONDecoder().decode(Self.self,from:data),a.kind=="classroom_device_exit_v1",a.quizId==quizID,a.attemptId==attemptID,a.assignmentId==assignmentID,a.studentId==studentID,a.generation==generation,!a.actionId.isEmpty,["pending","delivered","ended","failed","resume_allowed"].contains(a.state) else{return nil};return a
 }
}

enum SecureDeviceControlState { case clear, held, unavailable }
