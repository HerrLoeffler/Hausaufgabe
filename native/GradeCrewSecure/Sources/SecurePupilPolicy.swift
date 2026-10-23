import Foundation
struct SecureClassroomLaunch:Codable {
 let quizID:String
 let displayName:String
 let assignmentID:String
 let generation:Int
 let sessionToken:String
 let deviceMode:String
 var studentID:String?=nil
 var startFields:[String:Any] { ["classroomSession":sessionToken,"classroomAssignment":assignmentID,"classroomGeneration":generation] }
}
struct SecurePupilCredential:Codable {
 let token:String
 let deviceMode:String
 let expiresAt:Double
 var lastActivity:Double?=nil
 func locallyValid(at now:Double)->Bool {SecurePupilSessionPolicy.valid(expiresAt:expiresAt,now:now) && (deviceMode != "shared" || (lastActivity.map{$0+300000>now} ?? false))}
}
enum SecurePupilSessionPolicy {
 static func canRenew(original:SecureClassroomLaunch,replacement:SecureClassroomLaunch)->Bool {
  guard let student=original.studentID,!student.isEmpty,student==replacement.studentID else{return false}
  return original.quizID==replacement.quizID && original.assignmentID==replacement.assignmentID && original.generation==replacement.generation
 }
 static func discardUnstarted(attemptID:String?,frozen:Bool,serverCode:String,requestSent:Bool=false)->Bool { attemptID == nil && !frozen && !requestSent && ["UNAUTHENTICATED","PERMISSION_DENIED","FAILED_PRECONDITION","ALREADY_EXISTS"].contains(serverCode) }
 static func valid(expiresAt:Double,now:Double,requiresCode:Bool=false)->Bool { !requiresCode && expiresAt.isFinite && expiresAt > now }
}
