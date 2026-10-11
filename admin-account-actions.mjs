const escape = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
const reasons = {
  'self-protected':'Das eigene Konto ist geschützt.', 'last-admin':'Letzter aktiver Admin – mindestens ein Admin muss aktiv bleiben.',
  'active-exam':'Konto hat einen laufenden veröffentlichten Test. Test zuerst beenden.', 'test-account':'Testkonten können keine Admins sein.',
  'archived-account':'Archiviertes Testkonto zuerst wieder aktivieren.', 'missing':'Konto nicht mehr vorhanden.',
  'deletion-pending':'Löschung läuft bereits. Die ursprüngliche Aktion erneut prüfen.', 'scope-too-large':'Zu viele Tests für diese begrenzte Aktion.',
  'active-job':'KI-Erstellung läuft. Bitte zuerst abschließen lassen.'
};
const actionTitle = (action,value) => action === 'delete' ? 'Konten endgültig löschen' : action === 'role' ? `Rolle auf ${value === 'admin'?'Admin':'Lehrkraft'} ändern` : action === 'archive' ? (value?'Testkonto archivieren':'Testkonto wieder aktivieren') : (value === 'suspended'?'Konten sperren':'Konten entsperren');
export function createAccountController({root,getSession,call,refresh,open,formatDate=()=> '–'}) {
  const document=root.ownerDocument;
  let selected=new Set(),rows=[],allUsers=[],session=getSession(),epoch=0,busy=false,pending=null,summary='';
  function reset(){epoch++;session=getSession();selected.clear();busy=false;pending=null;summary='';root.querySelector('dialog')?.remove();root.replaceChildren();}
  function visibleSelection(){const visible=new Set([...root.querySelectorAll('tr[data-account-id]')].filter(tr=>!tr.hidden).map(tr=>tr.dataset.accountId));selected=new Set([...selected].filter(id=>visible.has(id)));return [...selected];}
  function updateSelection(){visibleSelection();root.querySelector('[data-selected-count]').textContent=`${selected.size} ausgewählt`;for(const b of root.querySelectorAll('[data-select-account]'))b.checked=selected.has(b.dataset.selectAccount);const boxes=[...root.querySelectorAll('[data-select-account]:not(:disabled)')].filter(b=>!b.closest('tr').hidden);for(const b of boxes)b.checked=selected.has(b.dataset.selectAccount);const all=root.querySelector('[data-select-all]');all.checked=!!boxes.length&&boxes.every(b=>b.checked);all.indeterminate=boxes.some(b=>b.checked)&&!all.checked;for(const b of root.querySelectorAll('[data-bulk-action]'))b.disabled=busy||!!pending||!selected.size;}
  function render(nextRows,options={}) {
    if(getSession()!==session)reset();
    rows=nextRows;allUsers=options.allUsers||nextRows;
    selected=new Set([...selected].filter(id=>rows.some(r=>r.id===id&&id!==session&&!r.accountDeletionId)));
    const adminCount=allUsers.filter(u=>u.role==='admin'&&(!u.status||u.status==='active')&&!u.accountDeletionId).length;
    root.innerHTML=`<div class="adminAccountToolbar" aria-label="Ausgewählte Konten"><strong data-selected-count aria-live="polite"></strong><label>Rolle <select data-bulk-role aria-label="Rolle für ausgewählte Konten"><option value="teacher">Lehrkraft</option><option value="admin">Admin</option></select></label><button type="button" class="button secondary" data-bulk-action="role">Rolle ändern</button><button type="button" class="button secondary" data-bulk-action="suspended">Sperren</button><button type="button" class="button secondary" data-bulk-action="active">Entsperren</button><button type="button" class="button danger" data-bulk-action="delete">Löschen</button><button type="button" class="button ghost" data-clear-selection>Auswahl aufheben</button></div><div data-action-result role="status" aria-live="polite">${escape(summary)}</div>${pending?'<button class="button secondary" type="button" data-retry>Aktion erneut prüfen / fortsetzen</button>':''}<table><thead><tr><th><label class="adminAccountSelection"><input type="checkbox" data-select-all ${busy||pending?'disabled':''}> Alle sichtbaren</label></th><th>Lehrkraft</th><th>Status</th><th>Registriert</th><th>Letzte Aktivität</th><th>Tests</th><th>Aktionen</th></tr></thead><tbody>${rows.map(u=>{
      const self=u.id===session,locked=busy||!!pending||self||!!u.accountDeletionId,last=u.role==='admin'&&adminCount<=1&&u.status!=='suspended';
      return `<tr data-account-id="${escape(u.id)}"><td><input type="checkbox" data-select-account="${escape(u.id)}" aria-label="${escape(u.displayName||u.email||u.id)} auswählen" ${locked?'disabled':''}></td><td data-account-name><strong>${escape(u.displayName||'–')}</strong><small>${escape(u.email||'')}</small></td><td><span class="status ${u.status==='suspended'?'ended':'published'}">${u.accountDeletionId?'Löschung ausstehend':u.isTestAccountArchived?'Archiviert':u.status==='suspended'?'Gesperrt':'Aktiv'}</span>${u.accountDeletionId?`<button class="button secondary" type="button" data-resume-operation="${escape(u.accountDeletionId)}" aria-label="Unvollständige Löschung von ${escape(u.displayName||u.email||u.id)} fortsetzen" ${busy||pending?'disabled':''}>Löschung fortsetzen</button>`:''}</td><td>${escape(formatDate(u.createdAt))}</td><td>${escape(formatDate(u.lastActiveAt))}</td><td>${escape(u.quizCount??'–')}</td><td><div class="adminAccountRowActions" data-account-actions><button class="button ghost adminTeacherOpen" type="button" data-id="${escape(u.id)}" data-row-action="open">Öffnen</button><select class="adminTeacherRole" data-row-role data-id="${escape(u.id)}" aria-label="Rolle von ${escape(u.displayName||u.email||u.id)}" ${(locked||last||u.isTestAccountArchived)?'disabled':''}><option value="teacher" ${u.role==='admin'?'':'selected'}>Lehrkraft</option><option value="admin" ${u.role==='admin'?'selected':''} ${u.isTestAccount?'disabled':''}>Admin</option></select><button class="button danger" type="button" data-row-action="delete" data-id="${escape(u.id)}" ${locked||last?'disabled':''} ${last?'title="Letzter aktiver Admin"':''}>Löschen</button></div></td></tr>`;
    }).join('')}</tbody></table>${rows.length?'':'<div class="emptyInline">Keine Lehrkräfte gefunden.</div>'}`;
    root.querySelector('[data-select-all]').addEventListener('change',e=>{for(const box of root.querySelectorAll('[data-select-account]:not(:disabled)'))if(!box.closest('tr').hidden){if(e.target.checked)selected.add(box.dataset.selectAccount);else selected.delete(box.dataset.selectAccount);}updateSelection();});
    for(const box of root.querySelectorAll('[data-select-account]'))box.addEventListener('change',e=>{if(e.target.checked)selected.add(box.dataset.selectAccount);else selected.delete(box.dataset.selectAccount);updateSelection();});
    root.querySelector('[data-clear-selection]').addEventListener('click',()=>{selected.clear();updateSelection();});
    for(const button of root.querySelectorAll('[data-row-action]'))button.addEventListener('click',()=>button.dataset.rowAction==='open'?open(button.dataset.id):start('delete',[button.dataset.id]));
    for(const select of root.querySelectorAll('[data-row-role]'))select.addEventListener('change',()=>{const value=select.value;select.value=rows.find(u=>u.id===select.dataset.id)?.role||'teacher';void start('role',[select.dataset.id],value);});
    for(const button of root.querySelectorAll('[data-bulk-action]'))button.addEventListener('click',()=>{const action=button.dataset.bulkAction;void start(['active','suspended'].includes(action)?'status':action,visibleSelection(),action==='role'?root.querySelector('[data-bulk-role]').value:action);});
    for(const button of root.querySelectorAll('[data-resume-operation]'))button.addEventListener('click',()=>{
      if(busy||pending||getSession()!==session)return;
      pending={operationId:button.dataset.resumeOperation,action:'delete',targets:allUsers.filter(u=>u.accountDeletionId===button.dataset.resumeOperation).map(u=>({id:u.id,label:u.displayName||u.email||u.id}))};
      void execute();
    });
    root.querySelector('[data-retry]')?.addEventListener('click',()=>void execute());
    updateSelection();
  }
  async function start(action,targets,value) {
    if(busy||pending||!targets.length)return;
    if(getSession()!==session){reset();return;}
    const currentEpoch=epoch;busy=true;summary='Aktion wird geprüft …';render(rows,{allUsers});
    try {
      const preview=await call('previewAdminAccountAction',{action,targets,value});
      if(currentEpoch!==epoch||getSession()!==session)return;
      const dialog=document.createElement('dialog');dialog.className='adminAccountDialog';
      dialog.innerHTML=`<h2>${escape(actionTitle(action,value))}</h2><p>Betroffene Konten:</p><ul>${preview.targets.map(t=>`<li><strong>${escape(t.label||t.id)}</strong>${t.email?` (${escape(t.email)})`:''}${t.code==='allowed'?'':` – ${escape(reasons[t.code]||t.code)}`}</li>`).join('')}</ul>${action==='delete'?`<p>${escape(preview.extent)}</p><p><strong>Die Löschung ist endgültig.</strong> Geschützte Einträge werden nicht geändert. Bei Fehlern bleibt die Löschung ausdrücklich unvollständig.</p>`:''}<div class="actions"><button class="button secondary" type="button" data-cancel>Abbrechen</button><button class="button ${action==='delete'?'danger':'primary'}" type="button" data-confirm ${preview.targets.some(t=>t.code==='allowed')?'':'disabled'}>${action==='delete'?'Endgültig löschen':'Änderung bestätigen'}</button></div>`;
      root.append(dialog);summary='';root.querySelector('[data-action-result]').textContent='';
      const cancel=()=>{if(dialog.querySelector('[data-confirm]').dataset.started)return;pending=null;busy=false;dialog.remove();render(rows,{allUsers});};
      dialog.querySelector('[data-cancel]').addEventListener('click',cancel);
      dialog.addEventListener('cancel',e=>{e.preventDefault();cancel();});
      dialog.querySelector('[data-confirm]').addEventListener('click',()=>{if(dialog.querySelector('[data-confirm]').dataset.started)return;dialog.querySelector('[data-confirm]').dataset.started='1';dialog.querySelector('[data-confirm]').disabled=true;dialog.querySelector('[data-cancel]').disabled=true;pending={operationId:preview.operationId,action,value,targets:preview.targets};void execute(dialog);});
      if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
      dialog.querySelector('[data-cancel]').focus();
    }catch(error){if(currentEpoch===epoch&&getSession()===session){busy=false;summary=error?.message||'Prüfung fehlgeschlagen. Bitte erneut auswählen.';render(rows,{allUsers});}}
  }
  async function execute(dialog) {
    if(!pending||pending.running||getSession()!==session)return;
    const currentEpoch=epoch,operation=pending;operation.running=true;busy=true;
    if(!dialog)render(rows,{allUsers});
    try {
      const result=await call('executeAdminAccountAction',{operationId:operation.operationId});
      if(currentEpoch!==epoch||getSession()!==session)return;
      const completed=result.outcomes.filter(o=>o.code==='complete').length,failed=result.outcomes.filter(o=>o.code==='failed'||o.code==='pending').length,blocked=result.outcomes.filter(o=>!['complete','failed','pending'].includes(o.code)).length;
      summary=failed?`${completed} abgeschlossen; ${failed} nicht vollständig gelöscht/geändert. Aktion erneut prüfen / fortsetzen.`:operation.action==='delete'?`${completed} ${completed===1?'Konto gelöscht':'Konten gelöscht'}${blocked?`; ${blocked} geschützt / übersprungen`:''}.`:`${completed} ${completed===1?'Konto geändert':'Konten geändert'}${blocked?`; ${blocked} geschützt / übersprungen`:''}.`;
      summary += '\n' + result.outcomes.map(outcome=>{
        const target=operation.targets.find(t=>t.id===outcome.id),label=target?.label||outcome.id;
        const resultLabel=outcome.reason==='identity-changed'?'Anmeldeidentität geändert – aus Sicherheitsgründen nicht gelöscht.':outcome.code==='complete'?(operation.action==='delete'?'gelöscht':'geändert'):outcome.code==='failed'?'nicht vollständig abgeschlossen':reasons[outcome.code]||outcome.code;
        return `${label}: ${resultLabel}`;
      }).join('\n');
      if(result.status==='complete')pending=null;
      selected.clear();dialog?.remove();await refresh();
    }catch(error){if(currentEpoch!==epoch||getSession()!==session)return;dialog?.remove();summary=error?.code?.includes('failed-precondition')?'Bestätigung veraltet. Bitte Konten erneut auswählen.':`Ergebnis nicht bestätigt: ${error?.message||'Verbindung unterbrochen'}. Aktion erneut prüfen / fortsetzen.`;if(error?.code?.includes('failed-precondition')||error?.code?.includes('permission-denied'))pending=null;}
    finally{operation.running=false;if(currentEpoch===epoch&&getSession()===session){busy=false;render(rows,{allUsers});}}
  }
  return {render,reset,start};
}
