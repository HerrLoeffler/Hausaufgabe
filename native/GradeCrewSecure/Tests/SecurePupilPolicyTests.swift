import XCTest
@testable import AssessmentLabCore
final class SecurePupilPolicyTests:XCTestCase {
 func testLaunchStoresAssignmentIdentitySeparatelyFromPersonalLoginCode() throws {
  let launch=SecureClassroomLaunch(quizID:"TEST2026",displayName:"Test Eins",assignmentID:"assignment",generation:2,sessionToken:String(repeating:"A",count:43),deviceMode:"shared")
  let encoded=try JSONEncoder().encode(launch)
  let restored=try JSONDecoder().decode(SecureClassroomLaunch.self,from:encoded)
  XCTAssertEqual(restored.assignmentID,"assignment");XCTAssertEqual(restored.generation,2)
  XCTAssertEqual(restored.startFields["classroomSession"] as? String,String(repeating:"A",count:43))
  XCTAssertEqual(restored.startFields["classroomGeneration"] as? Int,2)
  XCTAssertNil(restored.startFields["code"])
 }
 func testSharedModeNeverRemembersThePersonalCodeAndExpiresAtServerBoundary(){
  XCTAssertFalse(SecurePupilSessionPolicy.valid(expiresAt:1000,now:1000))
  XCTAssertTrue(SecurePupilSessionPolicy.valid(expiresAt:1001,now:1000))
 }
}
extension SecurePupilPolicyTests {
 func testOnlyDefinitiveRejectedUnstartedPersonalAttemptCanBeDiscarded(){
  XCTAssertTrue(SecurePupilSessionPolicy.discardUnstarted(attemptID:nil,frozen:false,serverCode:"UNAUTHENTICATED"))
  XCTAssertFalse(SecurePupilSessionPolicy.discardUnstarted(attemptID:nil,frozen:false,serverCode:"NETWORK"))
  XCTAssertFalse(SecurePupilSessionPolicy.discardUnstarted(attemptID:"saved",frozen:false,serverCode:"UNAUTHENTICATED"))
  XCTAssertFalse(SecurePupilSessionPolicy.discardUnstarted(attemptID:nil,frozen:true,serverCode:"PERMISSION_DENIED"))
 }
}
extension SecurePupilPolicyTests {
 func testUnknownStartAcknowledgementAndLockedSharedDeviceNeverRestoreAnotherPerson(){
  XCTAssertFalse(SecurePupilSessionPolicy.discardUnstarted(attemptID:nil,frozen:false,serverCode:"UNAUTHENTICATED",requestSent:true))
  XCTAssertFalse(SecurePupilSessionPolicy.valid(expiresAt:2000,now:1000,requiresCode:true))
 }
}
extension SecurePupilPolicyTests {
 func testLocalSharedExpiryDoesNotNeedNetworkAndPollingCannotProlongIt(){
  let shared=SecurePupilCredential(token:"opaque",deviceMode:"shared",expiresAt:999999,lastActivity:1000)
  XCTAssertTrue(shared.locallyValid(at:300999));XCTAssertFalse(shared.locallyValid(at:301000))
  let legacy=SecurePupilCredential(token:"opaque",deviceMode:"shared",expiresAt:999999)
  XCTAssertFalse(legacy.locallyValid(at:1000))
  XCTAssertTrue(SecurePupilCredential(token:"opaque",deviceMode:"personal",expiresAt:999999).locallyValid(at:301000))
 }
 func testRenewalRetainsOriginalAttemptBindingAndRequiresSamePupilNotJustSameClass(){
  var original=SecureClassroomLaunch(quizID:"TEST2026",displayName:"Original",assignmentID:"assigned",generation:0,sessionToken:"old",deviceMode:"shared");original.studentID="A"
  XCTAssertTrue(SecurePupilSessionPolicy.canRenew(original:original,replacement:original))
  var other=SecureClassroomLaunch(quizID:"TEST2026",displayName:"Other",assignmentID:"assigned",generation:0,sessionToken:"new",deviceMode:"shared");other.studentID="B"
  XCTAssertFalse(SecurePupilSessionPolicy.canRenew(original:original,replacement:other))
 }
}
