import {randomBytes} from 'node:crypto';
import {send,jsonBody,errors} from './local-roster-api.mjs';import {fail,keys} from './local-roster-validation.mjs';
const cookie=(name,value,maxAge)=>`${name}=${value}; Path=/api/classroom/student; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`;
function cookies(req){const result={};for(const part of (req.headers.cookie||'').split(';')){const [key,...value]=part.trim().split('=');if(['gc_student_session','gc_student_device'].includes(key))result[key]=value.join('=');}return result;}
export async function handleLocalStudent(req,res,{access,path}){
 try{
  const origin=`http://${req.headers.host}`;
  if((req.headers.origin&&req.headers.origin!==origin)||req.headers['sec-fetch-site']==='cross-site')fail('permission-denied',403);
  if(req.method==='POST'&&req.headers.origin!==origin)fail('permission-denied',403);
  const c=cookies(req);
  if(path==='/api/classroom/student/me'&&req.method==='GET'){send(res,200,access.me(c.gc_student_session));return;}
  if(req.method!=='POST')fail('invalid-argument',405);
  const body=await jsonBody(req);
  if(path==='/api/classroom/student/login'){
   keys(body,['code','deviceMode']);if(typeof body.code!=='string'||body.code.length>40)fail('invalid-access',401);
   const device=/^[A-Za-z0-9_-]{43}$/.test(c.gc_student_device||'')?c.gc_student_device:randomBytes(32).toString('base64url');
   res.setHeader('Set-Cookie',cookie('gc_student_device',device,30*86400));
   const session=access.login(body.code,device,req.socket.remoteAddress||'loopback',{deviceMode:body.deviceMode});
   res.setHeader('Set-Cookie',[cookie('gc_student_device',device,30*86400),cookie('gc_student_session',session.token,session.maxAge)]);send(res,200,access.me(session.token));return;
  }
  if(path==='/api/classroom/student/activity'){keys(body,[]);send(res,200,access.activity(c.gc_student_session));return;}
  if(path==='/api/classroom/student/logout'){
   keys(body,[]);access.logout(c.gc_student_session);res.setHeader('Set-Cookie',cookie('gc_student_session','',0));send(res,200,{signedOut:true});return;
  }
  fail('not-found',404);
 }catch(e){const code=errors[e.code]?e.code:'internal';send(res,e.status||500,{error:{code,message:errors[code]}});}
}
