import XCTest
@testable import GradeCrewSecureLayoutHost
private final class ReplacementHTTP:URLProtocol {
 static var response:[String:Any]=[:]
 override class func canInit(with request:URLRequest)->Bool{true}
 override class func canonicalRequest(for request:URLRequest)->URLRequest{request}
 override func startLoading(){let data=try! JSONSerialization.data(withJSONObject:["result":Self.response]);client?.urlProtocol(self,didReceive:HTTPURLResponse(url:request.url!,statusCode:200,httpVersion:nil,headerFields:nil)!,cacheStoragePolicy:.notAllowed);client?.urlProtocol(self,didLoad:data);client?.urlProtocolDidFinishLoading(self)}
 override func stopLoading(){}
}
private final class ReplacementMemoryStore:SecureAttemptPersistence {
 var saved:SecureAttemptIdentity?
 var answers=SecureSavedWork()
 var archiveFails=true
 var archived:SecureSavedWork?
 func identity()throws->SecureAttemptIdentity?{saved}
 func work()throws->SecureSavedWork{answers}
 func save(identity:SecureAttemptIdentity,work:SecureSavedWork)throws{saved=identity;answers=work}
 func clear()throws{XCTFail("A replacement must never call receipt-only clear")}
 func archiveReplaced(identity:SecureAttemptIdentity,work:SecureSavedWork,receipt:SecureReplacementReceipt)throws{
  if archiveFails{throw NSError(domain:"archive",code:1)}
  archived=work;saved=nil;answers=SecureSavedWork()
 }
}
private final class ArchiveMemoryVault:SecureIdentityVault {
 var values:[String:Data]=[:]
 var failRemoval=false
 func read(_ account:String)throws->Data?{values[account]}
 func write(_ data:Data,account:String)throws{values[account]=data}
 func remove(_ account:String)throws{if failRemoval{throw NSError(domain:"vault",code:1)};values[account]=nil}
}
@MainActor final class SecureReplacementIntegrationTests:XCTestCase {
 func testDeviceExitEndsOnlyMatchingAttemptAndKeepsDurableAnswersAcrossReopen() async throws {
  let store=ReplacementMemoryStore(),config=URLSessionConfiguration.ephemeral;config.protocolClasses=[ReplacementHTTP.self]
  let api=SecureAssessmentAPI(session:URLSession(configuration:config)),model=SecureExamCoordinator(api:api,store:store)
  let binding=SecureClassroomLaunch(quizID:"AB12CD",displayName:"Test",assignmentID:"assigned",generation:0,sessionToken:String(repeating:"A",count:43),deviceMode:"shared",studentID:"pupil")
  model.installLifecycleFixture(expired:false,classroom:binding);XCTAssertTrue(model.snapshot(revision:9,answers:["q0":"keep this answer"]))
  let old=model.attemptID
  let action:[String:Any]=["kind":"classroom_device_exit_v1","quizId":"AB12CD","assignmentId":"assigned","studentId":"pupil","attemptId":old,"generation":0,"actionId":"exit1","state":"delivered"]
  ReplacementHTTP.response=["action":action]
  await model.pollDeviceControl()
  XCTAssertEqual(model.phase,.recovery);XCTAssertTrue(model.deviceExitPending);XCTAssertNil(model.paper)
  XCTAssertEqual(store.answers.answers.revision,9);XCTAssertEqual(model.attemptID,old);XCTAssertNotNil(store.saved)
  await model.startOrRecover();XCTAssertEqual(model.phase,.recovery);XCTAssertEqual(store.answers.answers.revision,9)
  let reopened=SecureExamCoordinator(api:api,store:store);XCTAssertTrue(reopened.deviceExitPending);XCTAssertEqual(reopened.attemptID,old)
 }

 func testReplacementRequiresExplicitAcceptanceAndArchiveFailureKeepsSavedAnswers() async throws {
  let store=ReplacementMemoryStore(),config=URLSessionConfiguration.ephemeral;config.protocolClasses=[ReplacementHTTP.self]
  let model=SecureExamCoordinator(api:SecureAssessmentAPI(session:URLSession(configuration:config)),store:store)
  let binding=SecureClassroomLaunch(quizID:"AB12CD",displayName:"Test",assignmentID:"assigned",generation:0,sessionToken:String(repeating:"A",count:43),deviceMode:"shared")
  model.installLifecycleFixture(expired:false,classroom:binding)
  XCTAssertTrue(model.snapshot(revision:1,answers:["q0":"retained answer"]))
  let old=model.attemptID
  ReplacementHTTP.response=["status":"replaced","attemptId":old,"replacementReceipt":["kind":"classroom_replacement_v1","quizId":"AB12CD","oldAttemptId":old,"assignmentId":"assigned","oldGeneration":0,"generation":1,"replacementActionId":"release1","serverNow":2000]]
  await model.runLifecycleTick()
  XCTAssertEqual(model.phase,.recovery);XCTAssertNotNil(model.replacementReceipt);XCTAssertNotNil(store.saved);XCTAssertNil(store.archived)
  await model.acceptReplacement()
  XCTAssertEqual(model.phase,.recovery);XCTAssertNotNil(store.saved);XCTAssertEqual(store.answers.answers.revision,1)
  store.archiveFails=false;await model.acceptReplacement()
  XCTAssertEqual(model.phase,.code);XCTAssertEqual(store.archived?.answers.revision,1);XCTAssertNil(store.saved)
 }
 func testProtectedArchiveRetainsOriginalWorkAfterActiveIdentityIsRetired() throws {
  let namespace="qa-"+UUID().uuidString,vault=ArchiveMemoryVault()
  let store=SecureAttemptStore(namespace:namespace,vault:vault)
  var identity=SecureAttemptIdentity(code:"AB12CD",name:"Synthetic archive")
  identity.attemptID="a_"+String(repeating:"2",count:28)
  identity.classroom=SecureClassroomLaunch(quizID:"AB12CD",displayName:"Test",assignmentID:"assigned",generation:0,sessionToken:String(repeating:"A",count:43),deviceMode:"shared")
  var work=SecureSavedWork();XCTAssertTrue(work.answers.accept(revision:7,answers:Data("{\"q\":\"saved\"}".utf8)))
  try store.save(identity:identity,work:work)
  let receipt=SecureReplacementReceipt(kind:"classroom_replacement_v1",quizId:"AB12CD",oldAttemptId:identity.attemptID!,assignmentId:"assigned",oldGeneration:0,generation:1,replacementActionId:"syntheticRelease",serverNow:2000)
  vault.failRemoval=true
  XCTAssertThrowsError(try store.archiveReplaced(identity:identity,work:work,receipt:receipt))
  XCTAssertEqual(try store.work().answers.revision,7);XCTAssertEqual(try store.identity()?.clientID,identity.clientID)
  vault.failRemoval=false
  try store.archiveReplaced(identity:identity,work:work,receipt:receipt)
  XCTAssertNil(try store.identity())
  let root=FileManager.default.urls(for:.applicationSupportDirectory,in:.userDomainMask)[0].appendingPathComponent(SecureReleaseEnvironment.workDirectory+"-"+namespace).appendingPathComponent("replaced")
  let bytes=try Data(contentsOf:root.appendingPathComponent(identity.clientID+".json"))
  let archived=try SecureWorkEnvelope.decode(bytes,code:identity.code,clientID:identity.clientID,attemptID:identity.attemptID)
  XCTAssertEqual(archived.answers.revision,7);XCTAssertEqual(archived.answers.answers,work.answers.answers)
  XCTAssertFalse(String(data:bytes,encoding:.utf8)!.contains(identity.token))
  XCTAssertTrue(try root.resourceValues(forKeys:[.isExcludedFromBackupKey]).isExcludedFromBackup == true)
  var next=SecureAttemptIdentity(code:"NEXT123",name:"Next synthetic")
  next.attemptID="a_"+String(repeating:"3",count:28)
  try store.save(identity:next,work:SecureSavedWork())
  XCTAssertThrowsError(try store.archiveReplaced(identity:identity,work:work,receipt:receipt))
  XCTAssertEqual(try store.identity()?.clientID,next.clientID)
 }

 func testUnconfirmedStartCanRenewOnlySamePupilWithoutChangingItsOriginalAttemptSecret() throws {
  let store=ReplacementMemoryStore()
  var original=SecureAttemptIdentity(code:"TEST2026",name:"Test A")
  original.classroom=SecureClassroomLaunch(quizID:"TEST2026",displayName:"Test A",assignmentID:"assigned",generation:0,sessionToken:"expired",deviceMode:"shared",studentID:"A")
  original.startRequestSent=true;store.saved=original
  let model=SecureExamCoordinator(store:store)
  XCTAssertTrue(model.canRenewPersonal)
  let wrong=SecureClassroomLaunch(quizID:"TEST2026",displayName:"Test B",assignmentID:"assigned",generation:0,sessionToken:"other",deviceMode:"shared",studentID:"B")
  XCTAssertNotNil(model.renewPersonalSession(wrong));XCTAssertEqual(store.saved?.classroom?.sessionToken,"expired")
  let same=SecureClassroomLaunch(quizID:"TEST2026",displayName:"Test A",assignmentID:"assigned",generation:0,sessionToken:"renewed",deviceMode:"shared",studentID:"A")
  XCTAssertNil(model.renewPersonalSession(same));XCTAssertEqual(store.saved?.classroom?.sessionToken,"renewed")
  XCTAssertEqual(store.saved?.clientID,original.clientID);XCTAssertEqual(store.saved?.token,original.token);XCTAssertEqual(store.saved?.startRequestSent,true);XCTAssertNil(store.saved?.attemptID)
 }

}
