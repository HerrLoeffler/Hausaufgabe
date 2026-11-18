'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {login, read, UID, PROJECT} = require('../visual-pilot/access.cjs');

const work = path.resolve(process.env.REMY30_EVIDENCE || './docs/evidence/remy-mehrfeld30-20261109');
const cases = {
  direkt: {count:8, subject:'Mathematik', visual:true, topic:'Direkter Dreisatz und Prozentrechnung', goal:'Prozentwert und proportionale Zuordnungen mit einem direkten Dreisatz über die Einheit berechnen.', notes:'Ausschließlich direkter Dreisatz mit Rechenpfeilen. Vier verschiedene Prozentaufgaben und vier verschiedene proportionale Alltagskontexte. Zwei Spalten, klare Einheiten, jeweils über 1 bzw. 1 %. Rechenzeichen und Faktoren teils vorgeben, teils offen lassen.'},
  umgekehrt: {count:8, subject:'Mathematik', visual:true, topic:'Umgekehrt proportionaler Dreisatz', goal:'Umgekehrt proportionale Zuordnung mit Dreisatz über die Einheit berechnen.', notes:'Ausschließlich umgekehrter Dreisatz mit gegenläufigen Rechenpfeilen. Fester Arbeitsumfang und identische Leistung pro Gerät oder Person. Acht verschiedene Kontexte, keine Vermischung mit direktem Dreisatz.'},
  physik: {count:8, subject:'Physik', visual:true, topic:'Aggregatzustände und gerichtete Übergänge', goal:'Eine Tabelle zu Zustandsübergängen vervollständigen und mehrere Fachbegriffe eintragen.', notes:'Ausschließlich gewöhnliche Mehrfeldtabellen, kein Dreisatz. Je Zeile z. B. Ausgangszustand, sichtbarer Pfeil →, Endzustand, offener Fachbegriff. Zwei bis fünf offene Felder. Eindeutige Übergänge, Deutsch, alltagsnahe Kontexte, verschiedene Paare und Lücken.'},
  'physik-uebergaenge': {count:4, subject:'Physik', visual:true, topic:'Vier unterscheidbare Phasenübergänge in Experimenten', goal:'Fachbegriffe in Mehrfeldtabellen zu unterschiedlichen gerichteten Zustandsübergängen eintragen.', notes:'Vier normale Mehrfeldtabellen, kein Dreisatz. Unverwechselbare Ziele je Aufgabe: 1 Schmelzen und Erstarren von Wasser, 2 Verdunsten und Kondensieren im Wasserkreislauf, 3 Sublimieren von Trockeneis und Resublimieren bei Reif, 4 Stoffzustände vor und nach dem Abkühlen von Wachs aus Beobachtungen bestimmen. Keine Aufgabe wiederholt dieselbe Lückenkombination. Ausgangszustand → Endzustand deutlich zeigen. Je 2–5 Lücken.'},
  'physik-beobachtungen': {count:4, subject:'Physik', visual:true, topic:'Vom Experiment zum Zustandsübergang', goal:'Zustandsübergänge anhand unterschiedlicher Angaben in Mehrfeldtabellen anwenden.', notes:'Vier normale Mehrfeldtabellen, kein Dreisatz. Aufgaben mit vier verschiedenen Lernhandlungen: 1 Wärmezufuhr oder Wärmeabgabe anhand gegebener Übergangsrichtungen auswählen und eintragen, 2 zwei offene Zustandsangaben zum beschlagenen Spiegel ergänzen, 3 die Richtung des Übergangs aus Messbeobachtungen beim Kerzenwachs rekonstruieren, 4 fest, flüssig und gasförmig bei gegebenem Stoffzustand vor und nach Abkühlung von Dampf unterscheiden. Unterschiedliche Kombinationen an Lücken und Antworten. Zeilen mit Ausgang → Ziel. Je 2–5 Lücken.'},
  gegenprobe: {count:6, subject:'Mathematik', visual:false, topic:'Wann ist der Dreisatz geeignet?', goal:'Proportionalität und umgekehrte Proportionalität von ungeeigneten Modellierungen unterscheiden.', notes:'Sechs Single-Choice-Aufgaben, bei denen Dreisatz nicht passt. Je zwei Fälle mit Grundgebühr, reine Prozentdeutung und zeitabhängige oder ungleichmäßige Leistung. Korrekte Alternative und fachlichen Grund in der richtigen Option nennen, Ablenkungen plausibel, keine Dreisatzgrafik.'}
};
async function dispatch(input){
  const response = await fetch('https://europe-west1-'+PROJECT+'.cloudfunctions.net/sequence28StartAiTestJob',{
    method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+await login()},
    body:JSON.stringify({data:input}),signal:AbortSignal.timeout(65000)
  });
  const body = await response.json();
  if(!response.ok || body.error) throw Error('Dispatch '+response.status+' '+(body.error?.message || ''));
  return body.result ?? body.data;
}
function save(file,data){
  fs.writeFileSync(file+'.tmp',JSON.stringify(data,null,2)+'\n',{mode:0o600});
  fs.renameSync(file+'.tmp',file);
}
async function run(key){
  const spec=cases[key];
  if(!spec) throw Error('Unbekannte Pilotgruppe');
  fs.mkdirSync(work,{recursive:true});
  const file=path.join(work,key+'.json');
  const requestId='gc-remy-mehrfeld30-20261109-'+key;
  const input={clientRequestId:requestId,subject:spec.subject,grade:'7',schoolType:'Mittelschule',region:'Bayern',
    topic:spec.topic,learningGoals:[spec.goal],notes:spec.notes,count:spec.count,points:spec.count*2.5,
    allowedTypes:[spec.visual?'visual':'single'],...(spec.visual?{allowedVisualFormats:['table']}:{}),
    imageMode:'none',audioMode:'none',materials:[],materialMode:'inspiration'};
  const s=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):{group:key,requestId,input,status:'prepared'};
  if(s.requestId!==requestId)throw Error('Request-ID-Konflikt');
  if(!s.jobId){
    if(s.status!=='prepared')throw Error('Unbestätigter Start: erst vorhandenen Auftrag abgleichen.');
    await login();
    s.status='dispatching';s.startedAt=new Date().toISOString();save(file,s);
    try{
      const d=await dispatch(input);
      if(!/^[a-f0-9]{40}$/.test(d?.jobId))throw Error('Job-ID fehlt');
      s.jobId=d.jobId;s.status='queued';save(file,s);
    }catch(e){s.dispatchError=e.message;save(file,s);throw e;}
  }
  console.log(key+' '+s.jobId);
  for(let i=0;i<100;i++){
    const job=await read('aiJobs/'+s.jobId);
    if(job.ownerId!==UID)throw Error('Fremder Auftrag');
    Object.assign(s,{status:job.status,stage:job.stage??null,errorReference:job.errorReference??null,
      errorDetails:job.errorDetails??null,usage:job.usage??null,completedAt:job.completedAt??null});
    if(job.status==='ready'){
      const quiz=await read('quizzes/'+job.quizId);
      if(quiz.ownerId!==UID || quiz.published)throw Error('Nur private Pilotentwürfe');
      const questions=(await read('quizzes/'+job.quizId+'/questions?pageSize=100')).sort((a,b)=>a.position-b.position);
      s.quizId=job.quizId;s.count=questions.length;s.pointSum=questions.reduce((sum,q)=>sum+q.points,0);
      s.layouts=questions.map(q=>q.type==='visual'?JSON.parse(q.visualTask).spec.layout||'table':q.type);
      save(file,s);
      if(questions.length!==spec.count||s.pointSum!==input.points)throw Error('Aufgabenzahl oder Punkte weichen ab.');
      save(path.join(work,key+'-tasks.private.json'),{quizId:job.quizId,group:key,questions});
      console.log(key+' ready '+job.quizId+' '+questions.length);
      return;
    }
    save(file,s);
    if(['failed','error','cancelled','expired'].includes(job.status))throw Error(key+' '+job.status+' '+s.errorReference);
    await new Promise(resolve=>setTimeout(resolve,8000));
  }
  throw Error(key+' wartet weiterhin, Job-ID bleibt erhalten.');
}
const keys=process.argv.slice(2);
if(!keys.length||keys.length>2||new Set(keys).size!==keys.length)throw Error('Ein oder zwei verschiedene Gruppen angeben');
Promise.allSettled(keys.map(run)).then(results=>{
  for(const result of results)if(result.status==='rejected'){console.error(result.reason.message);process.exitCode=1;}
});
