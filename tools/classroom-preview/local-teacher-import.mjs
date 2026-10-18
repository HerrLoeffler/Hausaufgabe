import {createHash} from 'node:crypto';
import {keys,text,year,fail} from './local-roster-validation.mjs';
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const fold=v=>v.normalize('NFC').toLocaleLowerCase('de');
const nameKey=p=>JSON.stringify([fold(p.firstName),fold(p.lastName)]);
const pairKey=a=>JSON.stringify([fold(a.className),fold(a.subject),a.schoolYear]);
const optional=(v,max)=>v===undefined||v===''?'':text(v,max);
const sorted=rows=>[...rows].sort((a,b)=>pairKey(a).localeCompare(pairKey(b)));

// Staff records are local organisation data, never an authentication grant.
export function buildTeacherImportPlan({state,payload,lookupSource,lookupReceipt}){
 keys(payload,['schoolYear','sourceNamespace','rows','decisions']);
 const schoolYear=year(payload.schoolYear),sourceNamespace=text(payload.sourceNamespace,80);
 if(!Array.isArray(payload.rows)||!payload.rows.length||payload.rows.length>2000)fail('invalid-argument');
 const lines=new Set(),groups=new Map();
 for(const r of payload.rows){
  keys(r,['line','firstName','lastName','shortCode','sourceId','className','subject']);
  if(!Number.isSafeInteger(r.line)||r.line<1||lines.has(r.line))fail('invalid-argument');lines.add(r.line);
  const firstName=text(r.firstName),lastName=text(r.lastName),shortCode=optional(r.shortCode,40),sourceId=optional(r.sourceId,200),className=optional(r.className,40),subject=optional(r.subject,80);
  if(Boolean(className)!==Boolean(subject))fail('invalid-argument');
  const key=sourceId?'id:'+sourceId:'line:'+r.line;
  let g=groups.get(key);
  if(!g){g={line:r.line,firstName,lastName,shortCode,shortCodeProvided:r.shortCode!==undefined,sourceId,assignments:[]};groups.set(key,g);}
  else if(g.firstName!==firstName||g.lastName!==lastName||g.shortCode!==shortCode||g.shortCodeProvided!==(r.shortCode!==undefined))fail('duplicate-source');
  if(className&&!g.assignments.some(a=>pairKey(a)===pairKey({className,subject,schoolYear})))g.assignments.push({className,subject,schoolYear});
  if(g.assignments.length>100)fail('resource-exhausted',429);
 }
 const normalized=[...groups.values()].map(g=>({...g,assignments:sorted(g.assignments)})),teachers=state.teachers||[];
 const decisions=new Map();if(payload.decisions!==undefined&&!Array.isArray(payload.decisions))fail('invalid-argument');
 for(const d of payload.decisions||[]){
  keys(d,['line','action','teacherId']);
  if(!normalized.some(g=>g.line===d.line)||decisions.has(d.line)||!['create','link','skip'].includes(d.action))fail('invalid-argument');
  if(d.action==='link'&&!teachers.some(t=>t.id===d.teacherId))fail('not-found',404);
  if(d.action!=='link'&&d.teacherId!==undefined)fail('invalid-argument');decisions.set(d.line,d);
 }
 const fileHash=hash({schoolYear,sourceNamespace,rows:normalized}),receipt=new Map((lookupReceipt(fileHash)||[]).map(x=>[x.line,x.teacherId]));
 const counts={newTeachers:0,unchanged:0,updated:0,nameChanges:0,assignmentChanges:0,review:0,skipped:0};
 const classFor=id=>state.classes.find(c=>c.id===id);
 const oldPairs=t=>(t.assignments||[]).map(a=>({className:classFor(a.classId)?.name||'',schoolYear:classFor(a.classId)?.schoolYear||'',subject:a.subject}));
 const label=pairs=>pairs.map(a=>`${a.className} / ${a.subject} · ${a.schoolYear}`).join('; ')||'Keine Zuordnung';
 const sameNames=new Map();for(const g of normalized)sameNames.set(nameKey(g),(sameNames.get(nameKey(g))||0)+1);
 const used=new Set(),rows=[],actions=[],newClasses=new Map();
 for(const g of normalized){
  const d=decisions.get(g.line),sourceKey=g.sourceId?hash(['gradecrew-local-staff-v1',sourceNamespace,g.sourceId]):null;
  const known=(sourceKey?lookupSource(sourceKey):null)||receipt.get(g.line)||null;
  if(known&&!teachers.some(t=>t.id===known))fail('source-conflict',409);
  if(known&&d&&(d.action==='create'||d.action==='link'&&d.teacherId!==known))fail('source-conflict',409);
  const teacherId=d?.action==='link'?d.teacherId:known,existing=teachers.find(t=>t.id===teacherId);
  const candidates=teachers.filter(t=>nameKey(t)===nameKey(g)).slice(0,50).map(t=>({id:t.id,firstName:t.firstName,lastName:t.lastName,classLabel:label(oldPairs(t))}));
  const action=d?.action==='skip'?'skip':existing?'existing':d?.action==='create'?'create':candidates.length||sameNames.get(nameKey(g))>1?'review':'create';
  if(action==='existing'){if(used.has(teacherId))fail('duplicate-target',409);used.add(teacherId);}
  const before=existing?{firstName:existing.firstName,lastName:existing.lastName,shortCode:existing.shortCode||'',classLabel:label(oldPairs(existing))}:null;
  const assignments=g.assignments.length||!existing?g.assignments:oldPairs(existing).filter(a=>a.schoolYear===schoolYear);
  const shortCode=g.shortCodeProvided?g.shortCode:existing?.shortCode||'';
  const after={firstName:g.firstName,lastName:g.lastName,shortCode,classLabel:label(assignments)};
  const nameChanged=action==='existing'&&(before.firstName!==g.firstName||before.lastName!==g.lastName);
  const assignmentChanged=action==='existing'&&JSON.stringify(sorted(oldPairs(existing).filter(a=>a.schoolYear===schoolYear)).map(pairKey))!==JSON.stringify(sorted(assignments).map(pairKey));
  const shortCodeChanged=action==='existing'&&before.shortCode!==shortCode;
  const status=action==='existing'?(nameChanged||assignmentChanged||shortCodeChanged?'update':'unchanged'):action;
  counts[status==='create'?'newTeachers':status==='update'?'updated':status==='skip'?'skipped':status]++;
  if(nameChanged)counts.nameChanges++;if(assignmentChanged)counts.assignmentChanges++;
  if(['create','existing'].includes(action))for(const a of g.assignments){if(!state.classes.some(c=>fold(c.name)===fold(a.className)&&c.schoolYear===schoolYear))newClasses.set(fold(a.className),{name:a.className,schoolYear});}
  rows.push({line:g.line,status,teacherId:existing?.id||null,before,after,nameChanged,classChanged:assignmentChanged,shortCodeChanged,candidates:action==='review'?candidates:[]});
  actions.push({...g,shortCode,assignments,action,teacherId:existing?.id||null,sourceKey,schoolYear});
 }
 if(teachers.length+counts.newTeachers>500||state.classes.length+newClasses.size>200)fail('resource-exhausted',429);
 const missingTeachers=teachers.filter(t=>!used.has(t.id)).map(t=>({id:t.id,firstName:t.firstName,lastName:t.lastName,classLabel:label(oldPairs(t))}));
 const view={revision:state.revision,counts,newClasses:[...newClasses.values()],rows,missingTeachers};view.planHash=hash({fileHash,view,decisions:[...decisions.values()].sort((a,b)=>a.line-b.line)});
 return {view,actions,fileHash};
}
