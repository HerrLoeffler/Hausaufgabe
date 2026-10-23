import SwiftUI
import Security
#if GRADECREW_STAGING
enum SecurePupilKeychain {
 static var lockKey:String { SecureReleaseEnvironment.attemptService+".pupil-requires-code" }
 static var query:[String:Any] {[kSecClass as String:kSecClassGenericPassword,kSecAttrService as String:SecureReleaseEnvironment.attemptService+".pupil-session",kSecAttrAccount as String:"pupil"]}
 static func read() throws -> SecurePupilCredential? {if UserDefaults.standard.bool(forKey:lockKey){return nil};var q=query;q[kSecReturnData as String]=true;q[kSecMatchLimit as String]=kSecMatchLimitOne;var result:CFTypeRef?;let status=SecItemCopyMatching(q as CFDictionary,&result);if status==errSecItemNotFound{return nil};guard status==errSecSuccess,let data=result as? Data else{throw failure()};return try JSONDecoder().decode(SecurePupilCredential.self,from:data)}
 static func save(_ credential:SecurePupilCredential) throws {let data=try JSONEncoder().encode(credential),attributes:[String:Any]=[kSecValueData as String:data,kSecAttrAccessible as String:kSecAttrAccessibleWhenUnlockedThisDeviceOnly];let status=SecItemUpdate(query as CFDictionary,attributes as CFDictionary);if status==errSecItemNotFound {var q=query;attributes.forEach{q[$0.key]=$0.value};guard SecItemAdd(q as CFDictionary,nil)==errSecSuccess else{throw failure()}}else if status != errSecSuccess{throw failure()};UserDefaults.standard.set(false,forKey:lockKey)}
 static func clear() throws {UserDefaults.standard.set(true,forKey:lockKey);let status=SecItemDelete(query as CFDictionary);guard status==errSecSuccess||status==errSecItemNotFound else{throw failure()}}
 static func failure()->NSError {NSError(domain:"GradeCrewPupilSession",code:1,userInfo:[NSLocalizedDescriptionKey:"Der persönliche Schülerzugang konnte nicht sicher auf diesem Gerät gespeichert werden."])}
}
@MainActor final class SecurePupilAccessModel:ObservableObject {
 @Published var code=""
 @Published var deviceMode="shared"
 @Published var message=""
 @Published private(set)var workspace:[String:Any]?
 @Published private(set)var busy=false
 private var credential:SecurePupilCredential?
 private let api=SecureAssessmentAPI()
 private var revision=UUID()
 private var lastServerActivity:Double=0
 init(){do{credential=try SecurePupilKeychain.read()}catch{message=error.localizedDescription}}
 var studentName:String {let s=workspace?["student"] as? [String:Any] ?? [:];return [s["firstName"] as? String,s["lastName"] as? String].compactMap{$0}.joined(separator:" ")}
 var assignments:[[String:Any]] {workspace?["assignments"] as? [[String:Any]] ?? []}
 func login() async {guard !busy else{return};busy=true;message="";let current=revision;defer{busy=false};do{let result=try await api.invoke("classroomAccess",data:["command":"login","payload":["code":code,"deviceMode":deviceMode]]);guard current==revision else{return};guard let token=result["sessionToken"] as? String,let session=result["session"] as? [String:Any],let expires=(session["expiresAt"] as? NSNumber)?.doubleValue else{throw SecurePupilKeychain.failure()};let saved=SecurePupilCredential(token:token,deviceMode:deviceMode,expiresAt:expires,lastActivity:Date().timeIntervalSince1970*1000);try SecurePupilKeychain.save(saved);credential=saved;workspace=result;code=""}catch{guard current==revision else{return};message=error.localizedDescription}}
 func refresh(activity:Bool=false) async {guard let credential else{return};guard credential.locallyValid(at:Date().timeIntervalSince1970*1000) else{lockLocal();return};if activity{noteActivity()};guard !busy else{return};busy=true;let current=revision;defer{busy=false};do{let result=try await api.invoke("classroomAccess",data:["command":activity ? "activity":"me","payload":["sessionToken":credential.token]]);guard current==revision else{return};workspace=result;message=""}catch let error as SecureAssessmentAPI.Failure {guard current==revision else{return};message=error.localizedDescription;if error.code=="UNAUTHENTICATED" {workspace=nil;self.credential=nil;try? SecurePupilKeychain.clear()}}catch{message=error.localizedDescription}}
 func launch(_ row:[String:Any])->SecureClassroomLaunch? {guard let credential,let quiz=row["quizId"] as? String,let assignment=row["id"] as? String,let generation=(row["generation"] as? NSNumber)?.intValue else{return nil};return .init(quizID:quiz,displayName:String(studentName.prefix(120)),assignmentID:assignment,generation:generation,sessionToken:credential.token,deviceMode:credential.deviceMode,studentID:(workspace?["student"] as? [String:Any])?["id"] as? String)}
 func currentLaunch(_ row:[String:Any]) async -> SecureClassroomLaunch? {
  let current=revision,student=(workspace?["student"] as? [String:Any])?["id"] as? String
  await refresh(activity:true)
  guard current==revision,student==(workspace?["student"] as? [String:Any])?["id"] as? String,let id=row["id"] as? String,let refreshed=assignments.first(where:{($0["id"] as? String)==id}) else{return nil}
  return launch(refreshed)
 }
 func lockLocal(){revision=UUID();workspace=nil;credential=nil;code="";do{try SecurePupilKeychain.clear()}catch{message=error.localizedDescription}}
 func noteActivity(){guard var saved=credential else{return};let now=Date().timeIntervalSince1970*1000;guard saved.locallyValid(at:now) else{lockLocal();return};guard saved.deviceMode=="shared",now-(saved.lastActivity ?? 0)>=1000 else{return};saved.lastActivity=now;do{try SecurePupilKeychain.save(saved);credential=saved;if now-lastServerActivity>=30000 {lastServerActivity=now;Task {await refresh(activity:true)}}}catch{lockLocal();message=error.localizedDescription}}
 func acknowledge(_ row:[String:Any]) async {
  guard !busy,let credential,let assignment=row["id"] as? String,let action=row["resumeAction"] as? [String:Any],let actionId=action["id"] as? String,let generation=row["generation"] as? NSNumber else{return}
  busy=true;let current=revision;defer{busy=false}
  do {_ = try await api.invoke("classroomAccess",data:["command":"acknowledgeResume","payload":["sessionToken":credential.token,"assignmentId":assignment,"actionId":actionId,"generation":generation]])
   guard current==revision else{return};let next=try await api.invoke("classroomAccess",data:["command":"me","payload":["sessionToken":credential.token]]);guard current==revision else{return};workspace=next
  } catch {if current==revision{message=error.localizedDescription}}
 }
 func signOut() async {revision=UUID();let old=credential;workspace=nil;credential=nil;code="";do{try SecurePupilKeychain.clear()}catch{message="Auf diesem Gerät ist der Zugang gesperrt. "+error.localizedDescription};if let old{_ = try? await api.invoke("classroomAccess",data:["command":"logout","payload":["sessionToken":old.token]])}}

}
struct SecurePupilAccessView:View {
 @StateObject private var pupil=SecurePupilAccessModel()
 @Environment(\.dismiss) private var dismiss
 var renewing=false
 let onSelect:(SecureClassroomLaunch) async -> String?
 var body:some View {
  NavigationStack {
   ScrollView { VStack(alignment:.leading,spacing:20) {
    if pupil.workspace != nil { workspaceContent } else { loginContent }
    if !pupil.message.isEmpty { Text(pupil.message).foregroundStyle(.red) }
    if pupil.busy { ProgressView() }
   }.padding(24).frame(maxWidth:640).frame(maxWidth:.infinity) }
   .simultaneousGesture(TapGesture().onEnded{pupil.noteActivity()})
   .simultaneousGesture(DragGesture(minimumDistance:10).onChanged{_ in pupil.noteActivity()})
   .background(SecureTheme.canvas).navigationTitle("Meine Tests")
   .toolbar { ToolbarItem(placement:.topBarTrailing) { Button("Schließen") { dismiss() } } }
   .task { await pupil.refresh();while !Task.isCancelled { try? await Task.sleep(for:.seconds(10));if !Task.isCancelled { await pupil.refresh() } } }
  }
 }
 private var loginContent:some View {
  VStack(alignment:.leading,spacing:20) {
   Text("Dein persönlicher Schülerzugang").font(.title2.bold())
   Text("Gib den achtstelligen Code von deiner Zugangskarte ein. Ein Testcode gehört in den bisherigen Testzugang.")
   TextField("Persönlicher Schülercode",text:$pupil.code).textInputAutocapitalization(.characters).autocorrectionDisabled().textFieldStyle(.roundedBorder).privacySensitive()
   Picker("Dieses Gerät",selection:$pupil.deviceMode) { Text("Schulgerät / gemeinsam genutzt").tag("shared");Text("Mein Privatgerät").tag("personal") }.pickerStyle(.menu)
   Text("Schulgerät: Nach 5 Minuten Pause ist der Schülerzugang gesperrt. Deine laufende Prüfung und gesicherten Antworten bleiben erhalten.").font(.footnote)
   Button("Mit Schülercode anmelden") { Task { await pupil.login() } }.buttonStyle(.borderedProminent).disabled(pupil.busy||pupil.code.trimmingCharacters(in:.whitespacesAndNewlines).isEmpty)
  }
 }
 private var workspaceContent:some View {
  VStack(alignment:.leading,spacing:20) {
   Text("Hallo \(pupil.studentName)").font(.title2.bold())
   Button("Abmelden / Person wechseln") { Task { await pupil.signOut() } }
   if pupil.assignments.isEmpty { Text("Dir wurden noch keine Tests zugewiesen.") }
   ForEach(Array(pupil.assignments.enumerated()),id:\.offset) { item in pupilRow(item.element) }
   Button("Übersicht aktualisieren") { Task { await pupil.refresh(activity:true) } }
  }
 }
 private func label(_ row:[String:Any])->String {
  switch row["status"] as? String {
   case "submitted":return "Erledigt"
   case "closed":return "Diese Runde ist geschlossen"
   case "in_progress":return "Bereits begonnen – auf demselben Gerät fortsetzen"
   default:return row["startState"] as? String == "waiting" ? "Warte auf die Lehrkraft" : "Bereit zum Start"
  }
 }
 private func pupilRow(_ row:[String:Any])->some View {
  VStack(alignment:.leading,spacing:12) {
   Text(row["title"] as? String ?? "Test").font(.headline)
   Text(row["subject"] as? String ?? "")
   Text(label(row))
   if let action=row["resumeAction"] as? [String:Any],!(action["acknowledgedAt"] is NSNumber) {
    Text("Die Lehrkraft bittet dich, deinen Prüfungsstand zu prüfen. Öffne Secure auf demselben Gerät; deine Antworten bleiben erhalten.")
    Button("Hinweis gelesen") {Task {await pupil.acknowledge(row)}}.disabled(pupil.busy)
   }
   if row["status"] as? String == "available" || (renewing && row["status"] as? String == "in_progress") {
    Button(renewing ? "Diesen Zugang erneuern" : "Test öffnen") {Task {guard let launch=await pupil.currentLaunch(row) else{return};if let problem=await onSelect(launch) { pupil.message=problem } else { dismiss() } } }.buttonStyle(.borderedProminent)
   }
   if row["status"] as? String == "in_progress" { Text("Bei einem gespeicherten Versuch: Schülerbereich schließen und auf diesem Gerät die Wiederaufnahme wählen. Falls der Versuch auf einem anderen Gerät begonnen wurde, bitte die Lehrkraft informieren.").font(.footnote) }
  }.padding().frame(maxWidth:.infinity,alignment:.leading).background(SecureTheme.surface,in:RoundedRectangle(cornerRadius:16))
 }
}
#endif
