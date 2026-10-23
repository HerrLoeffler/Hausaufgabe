import XCTest
@testable import AssessmentLabCore
final class SecureReplacementPolicyTests:XCTestCase {
 func testOnlyTypedMatchingReplacementReceiptAllowsTransfer() {
  let valid:[String:Any]=["kind":"classroom_replacement_v1","quizId":"TEST2026","oldAttemptId":"old","assignmentId":"assignment","oldGeneration":0,"generation":1,"replacementActionId":"release","serverNow":2000]
  XCTAssertNotNil(SecureReplacementReceipt.parse(valid,quizID:"TEST2026",attemptID:"old",assignmentID:"assignment",generation:0))
  for key in ["kind","quizId","oldAttemptId","assignmentId","oldGeneration","generation","replacementActionId","serverNow"] {var changed=valid;changed[key]=nil;XCTAssertNil(SecureReplacementReceipt.parse(changed,quizID:"TEST2026",attemptID:"old",assignmentID:"assignment",generation:0),key)}
  XCTAssertNil(SecureReplacementReceipt.parse(valid,quizID:"OTHER",attemptID:"old",assignmentID:"assignment",generation:0))
  XCTAssertNil(SecureReplacementReceipt.parse(valid,quizID:"TEST2026",attemptID:"other",assignmentID:"assignment",generation:0))
 }
 func testResumeNoticeMustBeCurrentDeliveredAndUnacknowledged(){
  let action:[String:Any]=["id":"help","generation":2,"expiresAt":2000,"deliveredAt":1000]
  XCTAssertEqual(SecureResumeNotice.parse(action,generation:2,serverNow:1500)?.id,"help")
  XCTAssertNil(SecureResumeNotice.parse(action,generation:1,serverNow:1500))
  XCTAssertNil(SecureResumeNotice.parse(action,generation:2,serverNow:2000))
  var read=action;read["acknowledgedAt"]=1500;XCTAssertNil(SecureResumeNotice.parse(read,generation:2,serverNow:1600))
 }
}
