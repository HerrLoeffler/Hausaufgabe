import {parseArgs} from 'node:util';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {tmpdir} from 'node:os';
import {mkdtemp,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {assertDeploymentTarget} from './environments.mjs';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
try{
 const {values}=parseArgs({options:{environment:{type:'string'},project:{type:'string'},'confirm-project':{type:'string'},only:{type:'string',default:'hosting'},'dry-run':{type:'boolean',default:false}},strict:true,allowPositionals:false});
 const env=assertDeploymentTarget(values.environment,values.project);
 if(env.name==='production'&&values['confirm-project']!==env.projectId)throw new Error('Live benötigt --confirm-project hausaufgabe-staging.');
 if(env.name==='production'&&values.only==='functions:ai')throw new Error('Live nur mit expliziten Einzelfunktionen aktualisieren; separat betriebene Learning-Funktionen bleiben erhalten.');
 if(!['hosting','functions:ai','functions:ai:reviewMode,functions:ai:recordCrewTelemetry','functions:ai:crewAssistant,functions:ai:recordCrewTelemetry,functions:ai:recordTeacherTelemetry,functions:ai:cleanupCrewTelemetry,functions:ai:retryTeacherAnalytics,functions:ai:teacherQuizAnalytics,functions:ai:teacherJobAnalytics,functions:ai:teacherUsageAnalytics,functions:ai:teacherSubmissionAnalytics','functions:assessment','firestore:rules,storage'].includes(values.only))throw new Error('Expliziten freigegebenen Deployment-Umfang wählen.');
 if(values['dry-run'])console.log(JSON.stringify({environment:env.name,projectId:env.projectId,only:values.only,dryRun:true}));
 else{
  execFileSync('git',['diff','--exit-code','HEAD','--'],{cwd:root,stdio:'pipe'});
  const dir=await mkdtemp(join(tmpdir(),'gradecrew-release-'));
  try{
   const firebase=process.env.GC_FIREBASE_BIN||'firebase';
   if(values.only==='hosting'){
    execFileSync(process.execPath,['tools/build-staging.mjs',dir,env.name],{cwd:root,stdio:'inherit'});
    execFileSync(firebase,['deploy','--project',env.projectId,'--config',join(dir,'firebase.json'),'--only','hosting','--non-interactive'],{cwd:root,stdio:'inherit'});
    execFileSync(process.execPath,['tools/verify-staging.mjs',join(dir,'public/release.json')],{cwd:root,stdio:'inherit'});
   }else execFileSync(firebase,['deploy','--project',env.projectId,'--config',join(root,'firebase.json'),'--only',values.only,'--non-interactive'],{cwd:root,stdio:'inherit'});
  }finally{await rm(dir,{recursive:true,force:true});}
 }
}catch(error){console.error(error.message);process.exitCode=1;}
