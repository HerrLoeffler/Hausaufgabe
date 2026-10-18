import {createHash} from 'node:crypto';
import {keys,text,year,fail} from './local-roster-validation.mjs';
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const folded=value=>value.normalize('NFC').toLocaleLowerCase('de');
const personKey=s=>JSON.stringify([folded(s.firstName),folded(s.lastName)]);
const classKey=(name,schoolYear)=>JSON.stringify([folded(name),schoolYear]);

// A name is only a conflict hint. Only a confirmed source reference, an exact
// previous import receipt, or an explicit user link may reuse an identity.
export function buildStudentImportPlan({state,payload,lookupSource,lookupReceipt}){
 keys(payload,['schoolYear','sourceNamespace','rows','decisions','fixedClassId']);
 const schoolYear=year(payload.schoolYear),sourceNamespace=text(payload.sourceNamespace,80);
 if(!Array.isArray(payload.rows)||!payload.rows.length||payload.rows.length>2000)fail('invalid-argument');
 const fixedClass=payload.fixedClassId?state.classes.find(c=>c.id===payload.fixedClassId):null;
 if(payload.fixedClassId!==undefined&&!fixedClass)fail('not-found',404);
 if(fixedClass&&fixedClass.schoolYear!==schoolYear)fail('target-conflict',409);
 const seenLines=new Set(),seenSources=new Set();
 const normalized=payload.rows.map(row=>{
  keys(row,['line','firstName','lastName','className','sourceId']);
  if(!Number.isSafeInteger(row.line)||row.line<1||seenLines.has(row.line))fail('invalid-argument');seenLines.add(row.line);
  const sourceId=row.sourceId?text(row.sourceId,200):'';
  if(row.sourceId!==undefined&&typeof row.sourceId!=='string')fail('invalid-argument');
  if(sourceId&&seenSources.has(sourceId))fail('duplicate-source');if(sourceId)seenSources.add(sourceId);
  return {line:row.line,firstName:text(row.firstName),lastName:text(row.lastName),className:fixedClass?.name||text(row.className,40),sourceId};
 });
 const decisions=new Map();
 if(payload.decisions!==undefined&&!Array.isArray(payload.decisions))fail('invalid-argument');
 for(const decision of payload.decisions||[]){
  keys(decision,['line','action','studentId']);
  if(!seenLines.has(decision.line)||decisions.has(decision.line)||!['create','link','skip'].includes(decision.action))fail('invalid-argument');
  if(decision.action==='link'&&!state.students.some(s=>s.id===decision.studentId))fail('not-found',404);
  if(decision.action!=='link'&&decision.studentId!==undefined)fail('invalid-argument');
  decisions.set(decision.line,decision);
 }
 const fileHash=hash({schoolYear,sourceNamespace,rows:normalized}),receipt=lookupReceipt(fileHash)||[];
 const receiptIds=new Map(receipt.map(r=>[r.line,r.studentId]));
 const sameNames=new Map();for(const row of normalized)sameNames.set(personKey(row),(sameNames.get(personKey(row))||0)+1);
 const used=new Set(),newClasses=new Map(),rows=[],actions=[];
 const counts={newStudents:0,unchanged:0,updated:0,nameChanges:0,classChanges:0,review:0,skipped:0};
 const findClass=(name,y)=>state.classes.find(c=>classKey(c.name,c.schoolYear)===classKey(name,y));
 const classLabel=id=>{const c=state.classes.find(c=>c.id===id);return c?`${c.name} · ${c.schoolYear}`:'Ohne Klasse';};
 for(const input of normalized){
  const decision=decisions.get(input.line),sourceKey=input.sourceId?hash(['gradecrew-local-source-v1',sourceNamespace,input.sourceId]):null;
  const knownId=(sourceKey?lookupSource(sourceKey):null)||receiptIds.get(input.line)||null;
  if(knownId&&!state.students.some(s=>s.id===knownId))fail('source-conflict',409);
  if(knownId&&decision&&(decision.action==='create'||decision.action==='link'&&decision.studentId!==knownId))fail('source-conflict',409);
  const studentId=decision?.action==='link'?decision.studentId:knownId;
  const existing=studentId?state.students.find(s=>s.id===studentId):null;
  const candidates=state.students.filter(s=>personKey(s)===personKey(input)).slice(0,50).map(s=>({id:s.id,firstName:s.firstName,lastName:s.lastName,classLabel:classLabel(s.classId)}));
  const target=findClass(input.className,schoolYear),after={firstName:input.firstName,lastName:input.lastName,classLabel:`${target?.name||input.className} · ${schoolYear}`};
  let action=decision?.action==='skip'?'skip':existing?'existing':decision?.action==='create'?'create':candidates.length||sameNames.get(personKey(input))>1?'review':'create';
  if(action==='existing'){
   if(used.has(studentId))fail('duplicate-target',409);used.add(studentId);
  }
  const before=existing?{firstName:existing.firstName,lastName:existing.lastName,classLabel:classLabel(existing.classId)}:null;
  const nameChanged=action==='existing'&&(before.firstName!==after.firstName||before.lastName!==after.lastName);
  const classChanged=action==='existing'&&(!target||existing.classId!==target.id);
  let status=action;
  if(action==='existing'){
   status=nameChanged||classChanged?'update':'unchanged';counts[status==='update'?'updated':'unchanged']++;if(nameChanged)counts.nameChanges++;if(classChanged)counts.classChanges++;
  }else if(action==='create')counts.newStudents++;else if(action==='review')counts.review++;else counts.skipped++;
  if(['create','existing'].includes(action)&&!target)newClasses.set(classKey(input.className,schoolYear),{name:input.className,schoolYear});
  rows.push({line:input.line,status,studentId:existing?.id||null,before,after,nameChanged,classChanged,candidates:action==='review'?candidates:[]});
  actions.push({line:input.line,action,studentId:existing?.id||null,firstName:input.firstName,lastName:input.lastName,className:target?.name||input.className,schoolYear,sourceKey});
 }
 if(state.classes.length+newClasses.size>200||state.students.length+counts.newStudents>5000)fail('resource-exhausted',429);
 const missingStudents=state.students.filter(s=>!used.has(s.id)).map(s=>({id:s.id,firstName:s.firstName,lastName:s.lastName,classLabel:classLabel(s.classId)}));
 const view={revision:state.revision,counts,newClasses:[...newClasses.values()],rows,missingStudents};
 view.planHash=hash({fileHash,view,decisions:[...decisions.values()].sort((a,b)=>a.line-b.line)});
 return {view,actions,fileHash};
}
