'use strict';
const fs=require('node:fs'),path=require('node:path');
const {call,read,UID}=require('./normal-staging-repair-access.cjs');
const dest=path.resolve(__dirname,'../../docs/evidence/interactive-staging-repair-20261026');fs.mkdirSync(dest,{recursive:true});
const save=(name,d)=>{fs.writeFileSync(path.join(dest,name)+'.tmp',JSON.stringify(d,null,2)+'\n');fs.renameSync(path.join(dest,name)+'.tmp',path.join(dest,name));};
(async()=>{
 const count=Number(process.argv[2]);if(![20,40].includes(count))throw Error('Only two budgeted probes20/40');
 const file='generation-'+count+'.json',p=path.join(dest,file);
 const s=fs.existsSync(p)?JSON.parse(fs.readFileSync(p)): {count,points:count===20?60:100,status:'prepared',requestId:'GC-VISUAL-REPAIR-20261026-'+count+'-A',startedAt:new Date().toISOString()};
 if(!s.jobId){if(s.status!=='prepared')throw Error('Ambiguous dispatch: reconcile, never retry');
  s.input={clientRequestId:s.requestId,subject:'Mathematik',grade:'7',schoolType:'Mittelschule',region:'Bayern',topic:'Prozentrechnung: Grundwert, Prozentwert und Prozentsatz',count:s.count,points:s.points,difficulty:'mittel',allowedTypes:['visual'],allowedVisualFormats:['scale','coordinate','grid','table','connections'],imageMode:'none',audioMode:'none',materials:[],materialMode:'inspiration',notes:'Nur die ausgewählten interaktiven Aufgaben. Fachlich passende abwechslungsreiche Prozentaufgaben, klare Aufträge mit allen Daten, ohne Lösungen im Auftrag. Keine Formatquote. Mehrere Tabellenaufgaben mit Dreisatz (spec.layout dreisatz), drei Zeilen und unabhängigen Rechenpfeilen links/rechts; direkte Zuordnung, verschiedene Hilfestufen und halbe Punkte pro Feld. Koordinatenaufgaben nur wenn fachlich sinnvoll; Prozent-/Preisachsen dürfen beispielsweise0bis100 und0bis400mitEingabeschritt1haben, beschrifte Achsen samt Einheiten. Keine künstlichen Bilder, keine Schülerdaten.'};
  s.status='dispatching';save(file,s);const d=await call('startAiTestJob',s.input);s.jobId=d.jobId;s.dispatch=d;s.status='queued';save(file,s);console.log('Dispatched '+count+' job '+s.jobId);
 }
 for(let poll=0;poll<120;poll++){
  const job=await read('aiJobs/'+s.jobId);if(job.ownerId!==UID)throw Error('Owner mismatch');
  s.status=job.status;s.stage=job.stage;s.updatedAt=new Date().toISOString();
  s.error=job.error||null;s.errorReference=job.errorReference||null;save(file,s);
  if(job.status==='ready'){
   const quiz=await read('quizzes/'+job.quizId);if(quiz.ownerId!==UID)throw Error('Quiz owner mismatch');
   const questions=(await read('quizzes/'+job.quizId+'/questions?pageSize=100')).sort((a,b)=>a.position-b.position);
   if(questions.length!==count)throw Error('Count drift');
   const summary={...s,quizId:job.quizId,questionCount:questions.length,pointSum:questions.reduce((n,q)=>n+q.points,0),formats:questions.map(q=>JSON.parse(q.visualTask).format),providerRequests:job.usage?.providerRequests||null};
   const core=require('../../visual/core.js');for(const q of questions){const v=core.validate(JSON.parse(q.visualTask));if(v.length)throw Error('Invalid '+q.position+': '+v.join(';'));}
   save('generation-'+count+'-tasks.json',{quizId:job.quizId,title:quiz.title,questions});save(file,summary);console.log('READY '+JSON.stringify(summary));return;
  }
  if(['failed','error','cancelled','expired'].includes(job.status)){console.log('FAILED '+JSON.stringify(s));process.exitCode=1;return;}
  if(poll%4===0)console.log(count+' '+job.status+' '+job.stage);await new Promise(r=>setTimeout(r,10000));
 }
 throw Error('Deadline reached, job preserved; do not dispatch again');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
