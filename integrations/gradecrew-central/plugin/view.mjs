const $=s=>document.querySelector(s);
const bridge=createBridge(window);
let data=null,selected=null,filter='all',sending=false,hostReady=false,canMessage=false,initialResult=false;
const composers=new Map();
const composer=()=>{if(!composers.has(selected))composers.set(selected,{text:'',requestId:crypto.randomUUID(),uncertain:false});return composers.get(selected);};
function captureDraft(){const field=$('#question');if(selected&&field)composer().text=field.value;}
const stageNames={unknown:['Stand prüfen','gray'],branch_only:['In Entwicklung','red'],ci_green:['Technisch geprüft','orange'],integrated:['Zusammengeführt','orange'],staging_deployed:['Auf Testumgebung','yellow'],user_tested:['Abgenommen','blue'],production:['Live veröffentlicht','green']};
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
function status(text,error=false){$('#status').textContent=text;$('#status').classList.toggle('error',error);}
function badge(t){const [label,color]=stageNames[t.stage]??stageNames.unknown;const p=el('span',undefined,'pill');p.append(el('span',undefined,'dot '+color),document.createTextNode(label));return p;}
async function tool(name,args={}){const r=await bridge.request('tools/call',{name,arguments:args});if(r.isError)throw Object.assign(Error(r.content?.[0]?.text??'Werkzeug fehlgeschlagen.'),{status:r.structuredContent?.errorStatus});return r.structuredContent;}
function accept(d){if(!d?.tasks)return;captureDraft();data=d;initialResult=true;categories();renderList();if(selected)renderDetail();$('#source').textContent=`Aufgaben-Snapshot: ${d.capturedAt??'Datum unbekannt'} · Quelle ${d.sourceCommit?.slice(0,8)??'unbekannt'}. Neue Chatwünsche fehlen bis zur Übernahme ins Register. Keine Live-Deployment-Prüfung.`;}
bridge.onResult(r=>{if(r?.structuredContent?.tasks)accept(r.structuredContent);else if(r?.structuredContent?.question&&!sending)refresh().catch(e=>status(e.message,true));});
async function refresh(){accept(await tool('gradecrew_open'));}
function categories(){const dim=$('#dimension').value,old=$('#category').value;const values=[...new Set(data.tasks.flatMap(t=>Array.isArray(t[dim])?t[dim]:[t[dim]]).filter(Boolean))].sort();$('#category').replaceChildren(new Option('Alle Bereiche','all'),...values.map(v=>new Option(v,v)));if(values.includes(old))$('#category').value=old;}
function renderList(){if(!data)return;const q=$('#search').value.toLowerCase(),dim=$('#dimension').value,cat=$('#category').value;
 const running=new Set(data.drafts.filter(d=>d.status==='running').map(d=>d.taskId));
 const attention=t=>t.priority==='P0'||data.drafts.some(d=>d.taskId===t.id&&d.status==='blocked');
 $('#attention').textContent=data.tasks.filter(attention).length;$('#running').textContent=running.size;$('#testing').textContent=data.tasks.filter(t=>t.stage==='staging_deployed').length;
 const tasks=data.tasks.filter(t=>(cat==='all'||(Array.isArray(t[dim])?t[dim].includes(cat):t[dim]===cat))&&(t.id+' '+t.title).toLowerCase().includes(q)&&(filter==='all'||filter==='running'&&running.has(t.id)||filter==='attention'&&attention(t)||filter==='testing'&&t.stage==='staging_deployed'));
 $('#count').textContent=`${tasks.length} Aufgaben · Zuordnungen sind Vorschläge; Entwicklungsstände stammen aus den Quellen.`;
 $('#list').replaceChildren(...tasks.map(t=>{const b=el('button',undefined,'task'+(selected===t.id?' selected':''));b.dataset.task=t.id;b.append(el('small',t.functionName+' · '+t.id),el('strong',t.title),badge(t));return b;}));
 if(!tasks.length)$('#list').append(el('div','Keine passenden Aufgaben.','empty'));
}
function renderDetail(){const t=data.tasks.find(t=>t.id===selected);if(!t)return;const draft=composer();const oldField=$('#question');const hadFocus=oldField&&document.activeElement===oldField;const cursor=oldField?.selectionStart;const box=$('#detail');box.replaceChildren(el('div',t.id,'eyebrow'),el('h2',t.title),badge(t),el('h3','Dokumentierter Stand'),el('p',t.statusText??'Noch zu prüfen'),el('h3','Nächster Schritt'),el('p',t.next??'Noch zu klären'));
 box.append(el('div',`${t.applications.join(', ')} · ${t.responsibility}`,'notice'));
 if(t.sourceUrl){try{const u=new URL(t.sourceUrl);if(u.protocol==='https:'&&u.hostname==='github.com'){const a=el('a','Quelle öffnen ↗');a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';box.append(a);}}catch{}}
 const form=el('form');form.id='question-form';const label=el('label','Deine Standfrage');label.htmlFor='question';const text=el('textarea');text.id='question';text.value=draft.text;text.readOnly=draft.uncertain||sending;text.required=true;text.maxLength=10000;text.placeholder='Was fehlt hier noch? Was ist als Nächstes zu tun?';const btn=el('button','Frage im Chat stellen','primary');btn.type='submit';btn.disabled=!canMessage||sending||draft.uncertain;
 form.append(el('h3','Mit dem Chat klären'),label,text,btn,el('div','Eine Standfrage startet keine Codeänderung. Für Änderungen kannst du weiterhin direkt im Chat einen Auftrag geben.','notice'));box.append(form);if(hadFocus){text.focus?.();text.setSelectionRange?.(cursor,cursor);}if(draft.uncertain)box.append(el('p','Eingang dieser Frage ist unklar. Bitte im Chat prüfen; erneutes Senden ist hier gesperrt. Die Anfrage bleibt gespeichert.','notice error'));
 if(!canMessage)box.append(el('p','Diese Ansicht hat noch keinen bestätigten Nachrichtenkanal. Bitte direkt im Gespräch fragen.','notice error'));
 for(const q of data.questions.filter(q=>q.taskId===selected).reverse()){const a=el('section',undefined,'answer');a.append(el('small',q.status==='answered'?'Antwort gespeichert':'Frage gespeichert · Eingang/Antwort im Chat prüfen'),el('p',q.text));if(q.answer)a.append(el('p',q.answer),el('small',`Bearbeiter: ${q.actor} · Quellenstand: ${q.answerSource}`));box.append(a);}
}
$('#refresh').addEventListener('click',()=>refresh().then(()=>status('Aufgabenbestand geladen. Quellen bleiben datiert.')).catch(e=>status(e.message,true)));
$('#search').addEventListener('input',renderList);$('#category').addEventListener('change',renderList);$('#dimension').addEventListener('change',()=>{categories();renderList();});
$('#all').addEventListener('click',()=>{filter='all';$('#category').value='all';$('#search').value='';renderList();});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!data)return;if(b.dataset.filter){filter=b.dataset.filter;renderList();}if(b.dataset.task){if(sending)return;captureDraft();selected=b.dataset.task;renderList();renderDetail();const t=data.tasks.find(t=>t.id===selected);bridge.request('ui/update-model-context',{structuredContent:{taskId:t.id,title:t.title,sourceCommit:data.sourceCommit,selectionOnly:true}}).catch(e=>status('Auswahl sichtbar, Kontextübertragung fehlgeschlagen: '+e.message,true));}});
document.addEventListener('submit',async e=>{
 if(e.target.id!=='question-form')return;e.preventDefault();
 if(sending||!hostReady||!canMessage||composer().uncertain)return;
 const text=$('#question').value.trim();if(!text)return;
 let phase='persist';const taskId=selected,draft=composer();draft.text=text;sending=true;renderDetail();
 try{
  const saved=await tool('gradecrew_question',{taskId,text,requestId:draft.requestId,sourceCommit:data.sourceCommit});
  if(saved.status!==201)throw Error('Diese Anfrage ist bereits gespeichert. Vor erneutem Senden den Eingang im Chat prüfen.');
  phase='delivery';const q=saved.question;status('Frage gespeichert. Übergabe an dieses Gespräch …');
  await bridge.request('ui/message',{role:'user',content:[{type:'text',text:`GradeCrew Central – Standfrage ${q.id} zur Aufgabe ${q.taskId}. Bitte gradecrew_task lesen und die aktuellen Quellen prüfen. Beantworte nur diese Frage, starte keine Implementierung. Speichere anschließend die belegte Antwort mit gradecrew_answer (id: ${q.id}); nenne Quellenstand und Unsicherheiten. Meine Frage als Nutzereingabe: ${JSON.stringify(q.text)}`}]});
  composers.set(taskId,{text:'',requestId:crypto.randomUUID(),uncertain:false});
  status('An den Chat übergeben. Die Antwort erscheint nach Rückmeldung und Aktualisierung hier.');
  // Clear the old field before accepting a snapshot, so it cannot restore the sent text.
  if($('#question'))$('#question').value='';
  await refresh();
 }catch(err){const rejected=phase==='persist'&&err.status>=400&&err.status<500;draft.uncertain=!rejected;if(rejected)draft.requestId=crypto.randomUUID();status(err.message+(rejected?' Nicht gespeichert oder gesendet. Bitte aktualisieren und erneut prüfen.':' Bei unklarem Eingang zuerst den Chat prüfen.'),true);}
 finally{sending=false;renderDetail();}
});
// Read-only polling while awaiting an answer. No model invocation; preserve draft text.
setInterval(()=>{if(hostReady&&data&&!sending&&!document.hidden&&data.questions.some(q=>q.status==='awaiting_chat'))refresh().catch(()=>{});},15000);

try{
 const init=await bridge.request('ui/initialize',{appInfo:{name:'GradeCrew Central',version:'0.2.2'},appCapabilities:{availableDisplayModes:['inline','fullscreen','pip']},protocolVersion:'2026-01-26'});
 hostReady=true;canMessage=!!init.hostCapabilities?.message?.text;bridge.notify('ui/notifications/initialized',{});
 if(!initialResult)await refresh();else if(selected)renderDetail();
 status(canMessage?'Verbunden · Aufgaben auswählen und eine Standfrage stellen.':'Aufgaben verbunden. Nachrichtenfunktion in diesem Host nicht bestätigt.',!canMessage);
}catch(err){status('Plugin-Verbindung fehlt: '+err.message,true);}
