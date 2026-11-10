import {initializeApp} from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut} from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js';
import {getFirestore,doc,getDoc} from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js';
import {getFunctions,httpsCallable} from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-functions.js';
import {firebaseConfig} from './firebase-config.js';

if(firebaseConfig.projectId!=='gradecrew-staging-2026')throw Error('Dieses Labor läuft nur im Testprojekt.');
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app),fn=getFunctions(app,'europe-west1');
const api=async data=>(await httpsCallable(fn,'remyMehrfeld30Review',{timeout:40000})(data)).data;
const start=async data=>(await httpsCallable(fn,'sequence28StartAiTestJob',{timeout:70000})(data)).data;
const $=id=>document.getElementById(id);
const message=text=>{$('status').textContent=text;};
const ROUND_TWO='REMYRND2';
const groupNames={direkt:'Direkter Dreisatz',umgekehrt:'Umgekehrter Dreisatz',physik:'Physik · Übergänge',gegenprobe:'Gegenprobe · Formatwahl',eigener:'Dein KI-Stapel'};
let uid='',tasks=[],index=0,answer=null,renderer=null,stack='seed',expected=30,epoch=0,rating=false,watching=false;

const key=name=>'remy-mehrfeld30:'+uid+':'+name;
function saved(name){
  try{return JSON.parse(localStorage.getItem(key(name))||'null');}catch{return null;}
}
function save(name,data){
  if(data===null)localStorage.removeItem(key(name));
  else localStorage.setItem(key(name),JSON.stringify(data));
}
function fields(task){return {quizId:task.quizId,id:task.id,version:task.version};}
function mountDiagram(host,diagram){
  host.classList.add('flow-preview');
  const fields=new Map(diagram.fields.map(f=>[f.id,f]));
  const root=document.createElement('div'),branches=document.createElement('div');
  root.className='flow-branch';branches.className='flow-branches';
  if(diagram.branchRoot){
    const label=document.createElement('strong');
    label.className='flow-node';label.textContent=diagram.branchRoot;
    root.append(label,branches);host.append(root);
  }
  for(const [pathIndex,path] of diagram.paths.entries()){
    const heading=document.createElement('h4'),line=document.createElement('div');
    heading.textContent=path.title;
    line.className='flow-line';
    for(const step of path.steps){
      if(Object.hasOwn(step,'field')){
        const def=fields.get(step.field),label=document.createElement('label');
        const input=document.createElement(def.mode==='choice'?'select':'input');
        label.className='flow-field';
        label.textContent=def.label;
        if(def.mode==='choice'){
          for(const choice of ['',...def.options]){
            const option=document.createElement('option');
            option.value=choice;option.textContent=choice||'Bitte wählen';
            input.append(option);
          }
        }else{
          input.type='text';input.maxLength=120;input.autocomplete='off';
          if(def.mode==='number')input.inputMode='decimal';
        }
        input.dataset.diagramField=def.id;
        label.append(input);line.append(label);
      }else if(Object.hasOwn(step,'arrow')){
        const edge=document.createElement('span'),symbol=document.createElement('span');
        edge.className='flow-arrow';symbol.className='flow-symbol';symbol.textContent='→';
        if(step.arrow)edge.append(document.createTextNode(step.arrow));
        edge.append(symbol);line.append(edge);
      }else{
        const node=document.createElement('span');node.className='flow-node';node.textContent=step.label;
        line.append(node);
      }
    }
    (diagram.branchRoot&&pathIndex<2?branches:host).append(heading,line);
  }
}
function render(moveFocus=false){
  renderer?.destroy?.();
  renderer=null;
  const old=$('answer'),host=old.cloneNode(false);
  old.replaceWith(host);
  host.classList.remove('flow-preview');
  $('score').textContent='';
  $('feedback').hidden=true;
  $('feedback').reset();
  const task=tasks[index];
  $('review').hidden=!task;
  if(!task)return;
  answer=null;
  const rated=tasks.filter(t=>t.review).length;
  $('group').textContent=task.subject?task.subject+' · '+task.shape:(groupNames[task.group]||task.group);
  $('taskTitle').hidden=!task.heading;
  $('taskTitle').textContent=task.heading||'';
  $('position').textContent='Aufgabe '+(index+1)+' von '+tasks.length;
  $('progress').textContent=rated+' von '+tasks.length+' bewertet';
  $('meter').max=tasks.length;
  $('meter').value=rated;
  $('prompt').textContent=task.text;
  $('verdict').textContent=task.review?.verdict==='good'?'Als gut gespeichert':task.review?.verdict==='bad'?'Zur Überarbeitung markiert':'Noch offen';
  $('prev').disabled=index===0;
  $('next').disabled=index===tasks.length-1;
  if(task.diagram)mountDiagram(host,task.diagram);
  else if(task.visual)renderer=globalThis.GCRenderer.mount(host,task.visual,null,{onAnswer:value=>{answer=value;}});
  else task.options.forEach((text,i)=>{
    const label=document.createElement('label'),radio=document.createElement('input');
    label.className='choice';
    radio.type='radio';radio.name='answer';
    radio.addEventListener('change',()=>{answer=i;});
    label.append(radio,document.createTextNode(text));
    host.append(label);
  });
  if(moveFocus)$('position').focus();
}
async function load(quizId=null){
  const requestEpoch=++epoch,owner=uid;
  $('review').hidden=true;
  try{
    const result=await api({action:'list',...(quizId?{quizId}:{})});
    if(epoch!==requestEpoch||uid!==owner)return;
    tasks=result.tasks;expected=result.expected;
    stack=quizId||'seed';
    save('stack',stack);
    const savedVersion=saved('position:'+stack);
    const stored=tasks.findIndex(t=>t.version===savedVersion);
    const firstOpen=tasks.findIndex(t=>!t.review);
    index=stored>=0?stored:Math.max(0,firstOpen);
    render();
    message(quizId===ROUND_TWO?'Runde 2 zeigt redaktionell entworfene Aufgaben.':quizId?'Dein Stapel ist bereit.':tasks.length===expected?'Der erste Stapel ist bereit.':tasks.length+' von '+expected+' Aufgaben sind derzeit verfügbar.');
  }catch(e){
    if(epoch===requestEpoch&&uid===owner)message(e.message||'Der Stapel konnte nicht geladen werden.');
  }
}
function step(indexNext){
  if(rating||!tasks[indexNext])return;
  index=indexNext;
  save('position:'+stack,tasks[index].version);
  render(true);
}
async function rate(verdict,reason='',comment=''){
  const task=tasks[index],owner=uid,view=epoch;
  if(rating||!task)return;
  const pending=saved('pending-rating');
  const same=pending?.version===task.version&&pending.verdict===verdict&&pending.reason===reason&&pending.comment===comment;
  const payload=same?pending:{action:'rate',...fields(task),verdict,reason,comment,eventId:crypto.randomUUID()};
  if(pending&&!same){
    message('Eine Rückmeldung ist noch nicht bestätigt. Lade die Seite neu, um sie erneut zu prüfen.');
    return;
  }
  rating=true;
  for(const id of ['good','bad','seed','roundTwo','last'])$(id).disabled=true;
  try{
    save('pending-rating',payload);
    const result=await api(payload);
    if(owner!==uid)return;
    save('pending-rating',null);
    if(epoch!==view)return;
    task.review=result.rating;
    rating=false;
    if(index+1<tasks.length)step(index+1);
    else render();
    message('Rückmeldung gespeichert.');
  }catch(e){
    if(uid===owner){
      if(['functions/invalid-argument','functions/failed-precondition','functions/permission-denied'].includes(e.code))save('pending-rating',null);
      message(e.message||'Rückmeldung noch nicht bestätigt.');
    }
  }finally{
    rating=false;for(const id of ['good','bad','seed','roundTwo','last'])$(id).disabled=false;
  }
}
$('prev').onclick=()=>step(index-1);
$('next').onclick=()=>step(index+1);
$('good').onclick=()=>rate('good');
$('bad').onclick=()=>{$('feedback').hidden=false;$('feedback').elements.reason.focus();};
$('cancel').onclick=()=>{$('feedback').hidden=true;$('bad').focus();};
$('feedback').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);void rate('bad',f.get('reason'),f.get('comment'));};
$('scoreButton').onclick=async()=>{
  const task=tasks[index],owner=uid;
  if(!task)return;
  const submission=task.diagram
    ?Object.fromEntries([...$('answer').querySelectorAll('[data-diagram-field]')].map(input=>[input.dataset.diagramField,input.value]))
    :answer;
  const current=()=>uid===owner&&tasks[index]===task;
  const output=$('score');
  output.textContent='Wird ausgewertet …';
  $('scoreButton').disabled=true;
  try{
    const result=await api({action:'score',...fields(task),answer:submission});
    if(current()){
      const number=new Intl.NumberFormat('de-DE');
      output.textContent=number.format(result.points)+' von '+number.format(result.maxPoints)+' Punkten';
    }
  }catch{
    if(current())output.textContent='Die Auswertung war nicht möglich. Bitte erneut versuchen.';
  }finally{$('scoreButton').disabled=false;}
};
$('seed').onclick=()=>load();
$('roundTwo').onclick=()=>load(ROUND_TWO);
$('last').onclick=()=>load(saved('last'));
$('logout').onclick=()=>signOut(auth);
$('login').onsubmit=async e=>{
  e.preventDefault();const f=new FormData(e.target);
  try{await signInWithEmailAndPassword(auth,f.get('email'),f.get('password'));e.target.reset();}
  catch{message('Anmeldung nicht möglich. Bitte prüfe dein Testkonto.');}
};
async function watch(dispatch=false){
  const owner=uid;
  let job=saved('job');
  if(watching||!job)return;
  watching=true;$('resume').hidden=true;$('generate').disabled=true;
  try{
    if(dispatch){
      const result=await start(job.input);
      if(owner!==uid)return;
      job={...job,id:result.jobId};save('job',job);
    }
    if(!job.id)throw Error('Der Start ist noch nicht bestätigt. Prüfe dieselbe Anfrage erneut.');
    for(let i=0;i<90&&owner===uid;i++){
      const snap=await getDoc(doc(db,'aiJobs',job.id));
      if(owner!==uid)return;
      if(!snap.exists()||snap.data().ownerId!==owner)throw Error('Auftrag ist noch nicht bestätigt.');
      const state=snap.data();
      message(state.progressMessage||'Remy erstellt die Aufgaben …');
      if(state.status==='ready'){
        save('last',state.quizId);save('job',null);$('last').hidden=false;
        await load(state.quizId);return;
      }
      if(['failed','error','cancelled','expired'].includes(state.status)){
        save('job',null);throw Error(state.progressMessage||'Der Auftrag konnte nicht abgeschlossen werden.');
      }
      if(state.status==='queued'&&state.dispatchState==='pending'&&i>=1)throw Error('Der Auftrag ist gespeichert und wartet. Prüfe dieselbe Anfrage erneut.');
      await new Promise(resolve=>setTimeout(resolve,4000));
    }
    if(owner===uid)message('Remy arbeitet weiter. Du kannst den gespeicherten Auftrag erneut prüfen.');
  }catch(e){
    if(owner!==uid)return;
    if(!job.id&&['functions/permission-denied','functions/invalid-argument','functions/resource-exhausted','functions/failed-precondition'].includes(e.code))save('job',null);
    message(e.message||'Auftrag noch nicht bestätigt.');
  }finally{
    watching=false;
    if(uid===owner){$('resume').hidden=!saved('job');$('generate').disabled=!!saved('job');}
  }
}
$('resume').onclick=()=>watch(true);
$('wish').onsubmit=e=>{
  e.preventDefault();
  if(!uid||saved('job'))return;
  const f=new FormData(e.target),count=Number(f.get('count')),topic=String(f.get('wish')).trim(),subject=String(f.get('subject')).trim();
  if(!topic||!subject)return;
  const input={clientRequestId:'mehrfeld30-wish-'+crypto.randomUUID().slice(0,24),topic,subject,grade:f.get('grade'),count,points:2.5*count,
    allowedTypes:['visual','single'],allowedVisualFormats:['table','connections'],imageMode:'none',audioMode:'none',materials:[],materialMode:'inspiration',
    notes:'Verwende Mehrfeldtabellen oder Pfeile, wenn sie zum Lernziel passen. Bei ungeeignetem Lernziel wähle eine andere zulässige Darstellung. Keine Bilder oder Audios.'};
  save('job',{input});message('Remy startet den Auftrag …');void watch(true);
};
onAuthStateChanged(auth,async user=>{
  epoch++;uid=user?.uid||'';tasks=[];render();message('');
  $('login').hidden=!!uid;$('workspace').hidden=!uid;
  if(!uid)return;
  const owner=uid;
  $('last').hidden=!saved('last');
  $('resume').hidden=!saved('job');
  $('generate').disabled=!!saved('job');
  const pending=saved('pending-rating');
  if(pending){
    try{await api(pending);if(uid===owner)save('pending-rating',null);}
    catch(e){if(uid===owner&&['functions/invalid-argument','functions/failed-precondition','functions/permission-denied'].includes(e.code))save('pending-rating',null);}
  }
  if(uid!==owner)return;
  const previous=saved('stack');
  const showNewRound=!saved('seen-round-two')&&(!previous||previous==='seed');
  if(showNewRound)save('seen-round-two',true);
  await load(showNewRound?ROUND_TWO:previous&&previous!=='seed'?previous:null);
  if(uid!==owner)return;
  if(saved('job')?.id)void watch();
});
