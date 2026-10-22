import Foundation
struct SecureClassroomLaunch:Codable {
 let quizID:String
 let displayName:String
 let assignmentID:String
 let generation:Int
 let sessionToken:String
 let deviceMode:String
 var startFields:[String:Any] { ["classroomSession":sessionToken,"classroomAssignment":assignmentID,"classroomGeneration":generation] }
}
enum SecurePupilSessionPolicy {
 static func discardUnstarted(attemptID:String?,frozen:Bool,serverCode:String,requestSent:Bool=false)->Bool { attemptID == nil && !frozen && !requestSent && ["UNAUTHENTICATED","PERMISSION_DENIED","FAILED_PRECONDITION","ALREADY_EXISTS"].contains(serverCode) }
 static func valid(expiresAt:Double,now:Double,requiresCode:Bool=false)->Bool { !requiresCode && expiresAt.isFinite && expiresAt > now }
}
