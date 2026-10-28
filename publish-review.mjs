let sequence = 0;
const copy = {
 de: { title:'Test veröffentlichen',
  intro:'Prüfe kurz, wie deine Klasse den Test durchführt.',
  steps:['Start & Zeit','Reihenfolge','Auswertung & Freigabe'],
  cancel:'Abbrechen',
  back:'Zurück',
  next:'Weiter',
  publish:'Jetzt veröffentlichen',
  busy:'Wird veröffentlicht …',
  start:'Start des Tests',
  student:'Schüler startet selbst',
  teacher:'Lehrkraft startet für alle',
  useTime:'Zeitlimit verwenden',
  minutes:'Zeitlimit in Minuten',
  studentNoTime:'Lernende beginnen mit „Test starten“. Es gibt kein automatisches Zeitende.',
  teacherNoTime:'Die Klasse wartet auf deine Freigabe. Danach starten alle gemeinsam.',
  studentHint:'Der Countdown beginnt mit dem eigenen Teststart. Bei 00:00 werden die Antworten automatisch abgegeben.',
  teacherHint:'Die Klasse wartet auf deine Freigabe. Dann beginnt der Countdown für alle gleichzeitig.',
  shuffleQuestions:'Aufgaben für Schüler mischen',
  shuffleAnswers:'Antwortmöglichkeiten mischen',
  orderHint:'Ohne Mischen sieht die Klasse die gespeicherte Reihenfolge.',
  scale:'Notenschlüssel',
  result:'Nach Abgabe',
  results:['Nur Abgabe bestätigen','Punkte anzeigen','Punkte + Prozent','Punkte + Prozent + Note'],
  release:'Lösungsfreigabe',
  exam:'Nach Testende',
  practice:'Nach eigener Abgabe',
  show:'Lösungen freigeben',
  examHint:'Lösungen werden nach Testende und Nachfrist sichtbar.',
  more:'Mehr erfahren',
  releaseDetails:'Die Freigabe wartet auf Testende und Ablauf der Nachfrist. Nach der Freigabe ist dieser Test für eine weitere Gruppe möglicherweise bekannt.',
  practiceDetails:'Nach der eigenen Abgabe werden Lösungen sichtbar, wenn du die Freigabe bestätigst. Der Test ist danach für eine weitere Gruppe möglicherweise bekannt.',
  noSolutions:'Lösungen verborgen',
  examSummary:'Lösungen nach Testende + Nachfrist',
  practiceSummary:'Lösungen nach eigener Abgabe',
  independent:'Die Lösungsfreigabe ist unabhängig von der Punkte- und Notenanzeige.',
  warning:'Nach der Abgabe können Lernende die Lösungen anzeigen.',
  acknowledge:'Ich möchte Lösungen direkt nach der eigenen Abgabe freigeben.',
  timeError:'Wähle 1 bis 300 ganze Minuten.',
  ackError:'Bestätige die direkte Lösungsfreigabe oder ändere die Einstellung.',
  summary:'Deine Durchführung',
  unlimited:'Ohne Zeitlimit',
  mixed:'gemischt',
  saved:'gespeicherte Reihenfolge',
  questions:'Aufgaben',
  answers:'Antworten',
  failure:'Veröffentlichung konnte nicht sicher bestätigt werden.',
  refresh:'Schließe diesen Check und öffne ihn erneut. Dabei wird der aktuelle Veröffentlichungsstand geprüft.' },
 en: { title:'Publish test',
  intro:'Check how your class will take this test.',
  steps:['Start & time','Order','Results & solutions'],
  cancel:'Cancel',
  back:'Back',
  next:'Next',
  publish:'Publish now',
  busy:'Publishing …',
  start:'Test start',
  student:'Students start individually',
  teacher:'Teacher starts for everyone',
  useTime:'Use time limit',
  minutes:'Time limit in minutes',
  studentNoTime:'Students begin by choosing Start test. There is no automatic time limit.',
  teacherNoTime:'The class waits for you to start. Everyone then starts together.',
  studentHint:'The countdown begins when each student starts. Answers are submitted automatically at 00:00.',
  teacherHint:'The class waits for you to start. The countdown then begins for everyone at once.',
  shuffleQuestions:'Shuffle questions for students',
  shuffleAnswers:'Shuffle answer options',
  orderHint:'Without shuffling, the class sees the saved order.',
  scale:'Grade scale',
  result:'After submission',
  results:['Confirm submission only','Show points','Points + percentage','Points + percentage + grade'],
  release:'Solution release',
  exam:'After test end',
  practice:'After own submission',
  show:'Release solutions',
  examHint:'Solutions become visible after test end and the grace period.',
  more:'Learn more',
  releaseDetails:'Release waits until the test ends and the grace period expires. Once released, the test may be known to another group.',
  practiceDetails:'Solutions become visible after each student submits if you confirm release. The test may then be known to another group.',
  noSolutions:'Solutions hidden',
  examSummary:'Solutions after test end + grace period',
  practiceSummary:'Solutions after own submission',
  independent:'Solution release is independent of points and grades.',
  warning:'After submitting, students can view the solutions.',
  acknowledge:'I want to release solutions immediately after each student submits.',
  timeError:'Choose 1 to 300 whole minutes.',
  ackError:'Confirm immediate solution release or change the setting.',
  summary:'Your session',
  unlimited:'No time limit',
  mixed:'shuffled',
  saved:'saved order',
  questions:'Questions',
  answers:'Answers',
  failure:'Publication could not be confirmed.',
  refresh:'Close this check and open it again to check the current publication status.' }
};

/** Local settings only until onPublish. Errors cannot trigger a blind second write. */
export function requestPublishReview({ settings, scales = [], onChange = () => {}, onPublish, doc = globalThis.document, locale = 'de', aiReviewPending = false, returnFocus = doc.activeElement }) {
 const c=copy[String(locale).startsWith('en')?'en':'de'];
 const previous=returnFocus, id=`publish-review-${++sequence}`;
 const values={...settings, useTimeLimit:settings.timeLimitMinutes!=null, timeLimitMinutes:settings.timeLimitMinutes??10,practiceAcknowledged:false,aiReviewAcknowledged:false};
 const el=(tag,text,className)=>{const n=doc.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n;};
 const dialog=el('dialog',null,'publishReview');dialog.setAttribute('aria-labelledby',`${id}-title`);dialog.setAttribute('aria-describedby',`${id}-intro`);
 const header=el('header',null,'publishReviewHeader'), title=el('h2',c.title),intro=el('p',c.intro);title.id=`${id}-title`;intro.id=`${id}-intro`;header.append(title,intro);
 const progress=el('ol',null,'publishReviewProgress');progress.setAttribute('aria-label',c.title);
 const dots=c.steps.map((label,i)=>{const li=el('li');const n=el('span',String(i+1));n.setAttribute('aria-label',label);li.append(n,el('span',label));progress.append(li);return n;});header.append(progress);
 const body=el('div',null,'publishReviewBody'), panels=c.steps.map(label=>{const s=el('section');const h=el('h3',label);h.tabIndex=-1;s.append(h);body.append(s);return s;});
 const controls={};
 function field(panel,name,label,options) {
  const wrap=el('label',null,options===true?'publishReviewCheck':'publishReviewField');let input;
  if(Array.isArray(options)){input=el('select');for(const [value,text] of options){const option=el('option',text);option.value=value;input.append(option);}input.value=String(values[name]??'');}
  else {input=el('input');input.type=options===true?'checkbox':'number';if(input.type==='checkbox')input.checked=!!values[name];else{input.min='1';input.max='300';input.step='1';input.value=values[name];}}
  input.name=name;controls[name]=input;
  if(options===true)wrap.append(input,el('span',label));else wrap.append(el('span',label),input);
  panel.append(wrap);input.addEventListener('input',()=>{
   values[name]=input.type==='checkbox'?input.checked:input.type==='number'?input.value:input.value;
   if(name==='solutionReleaseMode'||name==='showSolutions'){values.practiceAcknowledged=false;controls.practiceAcknowledged.checked=false;}
   error.textContent='';sync();onChange(snapshot());
  });return wrap;
 }
 field(panels[0],'startMode',c.start,[['student',c.student],['teacher',c.teacher]]);
 field(panels[0],'useTimeLimit',c.useTime,true);
 const timeWrap=field(panels[0],'timeLimitMinutes',c.minutes);const startHint=el('p',null,'publishReviewHint');panels[0].append(startHint);
 field(panels[1],'shuffleQuestions',c.shuffleQuestions,true);field(panels[1],'shuffleAnswers',c.shuffleAnswers,true);panels[1].append(el('p',c.orderHint,'publishReviewHint'));
 field(panels[2],'gradeScaleId',c.scale,scales.map(s=>[s.id,s.name]));
 field(panels[2],'resultMode',c.result,['none','points','points_percent','points_grade'].map((v,i)=>[v,c.results[i]]));
 field(panels[2],'solutionReleaseMode',c.release,[['exam_after_end',c.exam],['practice_after_submit',c.practice]]);
 field(panels[2],'showSolutions',c.show,true);const releaseHint=el('p',null,'publishReviewHint');panels[2].append(releaseHint);
 const releaseDetails=el('details',null,'publishReviewDetails'),releaseDetailsText=el('p',null,'publishReviewHint');releaseDetails.append(el('summary',c.more),releaseDetailsText);panels[2].append(releaseDetails);
 const warning=el('div',null,'publishReviewWarning');warning.append(el('p',c.warning));field(warning,'practiceAcknowledged',c.acknowledge,true);panels[2].append(warning);
 const aiWarning=el('div',null,'publishReviewWarning');aiWarning.hidden=!aiReviewPending;field(aiWarning,'aiReviewAcknowledged',String(locale).startsWith('en')?'AI review still pending. I have checked this test myself.':'KI-Prüfung noch offen. Ich habe den Test selbst geprüft.',true);panels[2].append(aiWarning);
 const summary=el('div',null,'publishReviewSummary');summary.dataset.summary='';panels[2].append(summary);
 const error=el('p',null,'publishReviewError');error.setAttribute('role','alert');body.append(error);
 const footer=el('footer',null,'publishReviewActions');const buttons={};for(const [name,text] of [['cancel',c.cancel],['back',c.back],['next',c.next],['publish',c.publish]]){const b=el('button',text,`button ${name==='next'||name==='publish'?'primary':'secondary'}`);b.type='button';b.dataset.action=name;buttons[name]=b;footer.append(b);}
 dialog.append(header,body,footer);doc.body.append(dialog);
 let step=0,busy=false,settled=false,failed=false;
 function snapshot(){return {...values,timeLimitMinutes:values.useTimeLimit?Number(values.timeLimitMinutes):null};}
 function needsAcknowledgement(){return values.solutionReleaseMode==='practice_after_submit'&&values.showSolutions;}
 function sync(){
  dialog.dataset.step=String(step+1);panels.forEach((p,i)=>{p.hidden=i!==step;});dots.forEach((n,i)=>{if(i===step)n.setAttribute('aria-current','step');else n.removeAttribute('aria-current');n.parentElement.dataset.complete=String(i<step);});
  buttons.back.hidden=step===0;buttons.next.hidden=step===2;buttons.publish.hidden=step!==2;
  timeWrap.hidden=!values.useTimeLimit;controls.timeLimitMinutes.disabled=!values.useTimeLimit||busy;
  startHint.textContent=values.startMode==='teacher'?(values.useTimeLimit?c.teacherHint:c.teacherNoTime):(values.useTimeLimit?c.studentHint:c.studentNoTime);
  releaseHint.textContent=values.solutionReleaseMode==='exam_after_end'?c.examHint:'';releaseHint.hidden=!values.showSolutions||values.solutionReleaseMode!=='exam_after_end';
  releaseDetailsText.textContent=values.solutionReleaseMode==='practice_after_submit'?c.practiceDetails:c.releaseDetails;
  warning.hidden=!needsAcknowledgement();
  summary.replaceChildren(el('strong',c.summary),el('span',`${values.startMode==='teacher'?c.teacher:c.student} · ${values.useTimeLimit?`${values.timeLimitMinutes} min`:c.unlimited}`),el('span',`${c.questions}: ${values.shuffleQuestions?c.mixed:c.saved} · ${c.answers}: ${values.shuffleAnswers?c.mixed:c.saved}`),el('span',`${c.results[['none','points','points_percent','points_grade'].indexOf(values.resultMode)]||c.results[0]} · ${!values.showSolutions?c.noSolutions:values.solutionReleaseMode==='exam_after_end'?c.examSummary:c.practiceSummary}`));
  for(const b of Object.values(buttons))b.disabled=busy;
  buttons.publish.disabled=busy||failed;buttons.publish.textContent=busy?c.busy:c.publish;
  for(const input of Object.values(controls))input.disabled=busy;
  controls.timeLimitMinutes.disabled=busy||!values.useTimeLimit;
  dialog.setAttribute('aria-busy',String(busy));
 }
 function validTime(){const n=Number(values.timeLimitMinutes);if(values.useTimeLimit&&(!Number.isInteger(n)||n<1||n>300)){error.textContent=c.timeError;controls.timeLimitMinutes.focus();return false;}return true;}
 let resolve;const promise=new Promise(r=>{resolve=r;});
 function finish(result){if(settled||busy)return;settled=true;dialog.remove();if(previous?.isConnected)previous.focus();resolve(result);}
 buttons.cancel.addEventListener('click',()=>finish(false));
 dialog.addEventListener('cancel',event=>{event.preventDefault();finish(false);});
 dialog.addEventListener('close',()=>finish(false));
 dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const focusable=[...dialog.querySelectorAll('input,select,button,summary')].filter(n=>!n.disabled&&!n.closest('[hidden]'));
  const first=focusable[0],last=focusable.at(-1),active=doc.activeElement;
  if(!first){event.preventDefault();return;}
  event.preventDefault();
  const index=focusable.indexOf(active);
  focusable[index<0?(event.shiftKey?focusable.length-1:0):(index+(event.shiftKey?-1:1)+focusable.length)%focusable.length].focus();
 });
 function move(next){step=next;error.textContent='';sync();body.scrollTop=0;panels[step].querySelector('h3').focus();}
 buttons.back.addEventListener('click',()=>{if(!busy)move(Math.max(0,step-1));});
 buttons.next.addEventListener('click',()=>{if(!busy&&validTime())move(Math.min(2,step+1));});
 buttons.publish.addEventListener('click',async()=>{
  if(busy||failed||step!==2||!validTime())return;
  if(needsAcknowledgement()&&!values.practiceAcknowledged){error.textContent=c.ackError;controls.practiceAcknowledged.focus();return;}
  if(aiReviewPending&&!values.aiReviewAcknowledged){error.textContent=String(locale).startsWith('en')?'Check and acknowledge the pending AI review.':'Prüfe und bestätige den Hinweis zur offenen KI-Prüfung.';controls.aiReviewAcknowledged.focus();return;}
  busy=true;sync();
  try{const result=await onPublish(snapshot());if(result!==true)throw new Error(c.failure);busy=false;finish(true);}
  catch(err){busy=false;failed=true;sync();error.textContent=`${err?.message||c.failure} ${c.refresh}`;error.tabIndex=-1;error.focus();}
 });
 sync();try{dialog.showModal();}catch{dialog.setAttribute('open','');}panels[0].querySelector('h3').focus();return promise;
}
