'use strict';
const fs=require('node:fs'),path=require('node:path');
const {call,read,UID}=require('./access.cjs');const matrix=require('./matrix.cjs');
const dest=path.resolve(__dirname,'../../docs/evidence/visual-pilot-24-20261025');fs.mkdirSync(dest,{recursive:true});
const write=(name,data)=>{const p=path.join(dest,name);fs.writeFileSync(p+'.tmp',JSON.stringify(data,null,2)+'\n');fs.renameSync(p+'.tmp',p);};
(async()=>{const ids=process.argv.slice(2);for(const row of matrix.filter(x=>!ids.length||ids.includes(x.id))){
 const file=row.id+'-run.json',p=path.join(dest,file);let s=fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):{id:row.id,row,startedAt:new Date().toISOString(),status:'prepared'};
 if(s.status==='ready'||s.status==='failed'){console.log(row.id+' existing '+s.status+' preserved');continue;}
 if(!s.jobId){if(s.status==='dispatching')throw Error(row.id+' ambiguous dispatch; reconcile request ID before retry');
 s.input={clientRequestId:row.requestId,subject:row.subject,grade:String(row.grade),schoolType:'Mittelschule',region:'Bayern',topic:row.title+': '+row.goal,count:8,points:16,difficulty:[5,6].includes(row.grade)?'leicht bis mittel':'mittel bis anspruchsvoll',allowedTypes:['visual'],imageMode:'none',audioMode:'none',notes:'Ausschließlich 8 NEUE VISUELLE Aufgaben (type visual mit gültigem visualTask), keine klassischen Ersatztypen. Fachlich passende Formate aus '+row.formats.join(', ')+'. Nutze mehrere passende Formate, aber keine unpassenden Pflichtbilder. Alle nötigen Daten und eigenen kurzen Texte vollständig mitliefern. Keine fremden Quellen oder realen Schülerdaten. Jede Aufgabe hat 2 Punkte, spec und solution bilden genau dieselbe Aufgabe ab. Messwinkel nicht im Auftrag verraten; keine vorausgefüllten Antworten, Hinweise ohne Lösung. Tabellenlücken leer. Reihenfolge von Zahlen/Kategorien und Einheit beachten. Bei englischen Aufgaben verständliches Englisch. Fiktive Daten ausdrücklich als solche nennen.'};
 s.status='dispatching';write(file,s);const result=await call('visual255StartAiTestJob',s.input);s.jobId=result.jobId;s.dispatch=result;s.status='queued';write(file,s);console.log(row.id+' dispatched job '+s.jobId);}
 for(let poll=0;poll<120;poll++){
 const job=await read('aiJobs/'+s.jobId);if(job.ownerId!==UID)throw Error('Job owner mismatch');s.status=job.status;s.stage=job.stage;s.updatedAt=new Date().toISOString();s.job=job;write(file,s);
 if(job.status==='ready'){s.quizId=job.quizId;const quiz=await read('quizzes/'+s.quizId);if(quiz.ownerId!==UID)throw Error('Quiz owner mismatch');const questions=await read('quizzes/'+s.quizId+'/questions?pageSize=100');questions.sort((a,b)=>a.position-b.position);write(row.id+'-quiz.json',{pilotId:row.id,at:new Date().toISOString(),quiz,questions});write(file,s);console.log(row.id+' READY '+s.quizId+' '+questions.length+' questions '+questions.map(q=>q.type==='visual'?JSON.parse(q.visualTask).format:q.type).join(','));break;}
 if(['failed','error','cancelled','expired'].includes(job.status)){console.log(row.id+' FAILED '+JSON.stringify(job.error));break;}
 if(poll%6===0)console.log(row.id+' '+job.status+' '+job.stage);await new Promise(r=>setTimeout(r,10000));
 if(poll===119)throw Error('Polling deadline, request preserved; no duplicate dispatch');
 }
 }})().catch(e=>{console.error(e.message);process.exitCode=1;});
