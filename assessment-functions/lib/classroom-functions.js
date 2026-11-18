'use strict';
const {getApps,initializeApp}=require('firebase-admin/app');
const {getFirestore}=require('firebase-admin/firestore');
const {getAuth}=require('firebase-admin/auth');
const {onCall,onRequest,HttpsError}=require('firebase-functions/v2/https');
const {createClassroomService}=require('./classroom-service');
const {createClassroomFirestoreStore}=require('./classroom-firestore-store');
if(!getApps().length)initializeApp();
const region='europe-west1';
function environment(){if(process.env.GCLOUD_PROJECT!=='gradecrew-staging-2026')throw new HttpsError('failed-precondition','Dieser Schülerzugang ist nur in der Testumgebung 2026 eingerichtet.');}
function service(){return createClassroomService({store:createClassroomFirestoreStore(getFirestore()),getIdentity:uid=>getAuth().getUser(uid)});}
const fields={connectSchool:['billingSchoolId','confirm','useExistingSchool'],setTeacherClasses:['classIds'],requestDeviceExit:['assignmentId','studentId','attemptId','expectedGeneration','actionId','reason','confirm'],allowDeviceResume:['assignmentId','studentId','attemptId','expectedGeneration','actionId','confirm'],deviceExitStatus:['quizId','attemptId','attemptToken','build'],acknowledgeDeviceExit:['quizId','attemptId','attemptToken','actionId','outcome'],resolveSubmission:['assignmentId','attemptId','studentId','disposition','confirm'],createSchool:['name'],workspace:['classId'],createClass:['name','year'],createStudent:['classId','firstName','lastName'],printCodes:['classId'],assign:['quizId','classId'],participants:['assignmentId'],startRound:['assignmentId'],requestResume:['assignmentId','studentId','expectedGeneration','actionId'],acknowledgeResume:['sessionToken','assignmentId','actionId','generation'],restart:['assignmentId','studentId','confirm','reason','expectedGeneration'],login:['code','deviceMode','deviceId'],me:['sessionToken'],activity:['sessionToken'],logout:['sessionToken']};
for(const command of ['connectSchool','setTeacherClasses','createSchool','workspace','createClass','createStudent','printCodes','assign','participants','startRound','requestResume','restart','resolveSubmission','requestDeviceExit','allowDeviceResume'])fields[command].push('schoolId');
async function run(uid,command,data,ip){environment();if(!Object.hasOwn(fields,command)||!data||typeof data!=='object'||Array.isArray(data)||Object.keys(data).some(k=>!fields[command].includes(k)))throw new HttpsError('invalid-argument','Ungültige Schülerverwaltungsanfrage.');try{return await service().execute(uid,command,data,{ip});}catch(e){if(e instanceof HttpsError)throw e;const safe=['unauthenticated','permission-denied','invalid-argument','not-found','failed-precondition','already-exists','aborted','resource-exhausted'].includes(e.code);throw new HttpsError(safe?e.code:'internal',safe?e.message:'Die Schülerverwaltung ist vorübergehend nicht erreichbar.');}}
exports.classroomAccess=onCall({region,timeoutSeconds:60,memory:'256MiB',enforceAppCheck:false},request=>run(request.auth?.uid,request.data?.command,request.data?.payload||{},request.rawRequest?.ip));
const cookieName='__Host-gc-pupil';
exports.classroomWeb=onRequest({region,timeoutSeconds:60,memory:'256MiB',invoker:'public'},async(req,res)=>{
 res.set('Cache-Control','no-store');res.set('Pragma','no-cache');res.set('X-Content-Type-Options','nosniff');
 try{
  environment();const origin=req.get('origin');if(origin&&origin!=='https://gradecrew-staging-2026.web.app')throw new HttpsError('permission-denied','Unzulässige Herkunft.');if(req.method==='OPTIONS'&&origin==='https://gradecrew-staging-2026.web.app'){
   if(req.get('access-control-request-method')!=='POST')throw new HttpsError('permission-denied','Diese Methode ist nicht freigegeben.');
   res.set('Access-Control-Allow-Origin',origin);res.set('Vary','Origin');res.set('Access-Control-Allow-Methods','POST');res.set('Access-Control-Allow-Headers','Authorization, Content-Type');res.status(204).send('');return;
  }
  if(req.method!=='POST'||origin!=='https://gradecrew-staging-2026.web.app')throw new HttpsError('permission-denied','Bitte die Schülerverwaltung über die 2026-Seite öffnen.');
  res.set('Access-Control-Allow-Origin',origin);res.set('Vary','Origin');
  const command=req.body?.command,payload={...(req.body?.payload||{})};let uid=null;
  if(!['login','me','activity','logout','acknowledgeResume'].includes(command)){const authorization=req.get('authorization')||'';if(!authorization.startsWith('Bearer '))throw new HttpsError('unauthenticated','Bitte als Lehrkraft anmelden.');try{uid=(await getAuth().verifyIdToken(authorization.slice(7),true)).uid;}catch{throw new HttpsError('unauthenticated','Bitte erneut als Lehrkraft anmelden.');}}
  if(['me','activity','logout','acknowledgeResume'].includes(command)){if(Object.hasOwn(payload,'sessionToken'))throw new HttpsError('invalid-argument','Ungültige Sitzungsanfrage.');const cookies=Object.fromEntries(String(req.get('cookie')||'').split(';').map(s=>s.trim().split('=')));payload.sessionToken=cookies[cookieName];}
  const result=await run(uid,command,payload,req.ip);
  if(command==='login'){res.set('Set-Cookie',`${cookieName}=${result.sessionToken}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${result.session.deviceMode==='personal'?2592000:28800}`);delete result.sessionToken;}
  if(command==='logout')res.set('Set-Cookie',`${cookieName}=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0`);
  res.status(200).json(result);
 }catch(e){const status={unauthenticated:401,'permission-denied':403,'not-found':404,'already-exists':409,aborted:409,'failed-precondition':409,'resource-exhausted':429,'invalid-argument':400}[e.code]||500;res.status(status).json({error:{code:status===500?'internal':e.code,message:status===500?'Die Schülerverwaltung ist vorübergehend nicht erreichbar.':e.message}});}
});
