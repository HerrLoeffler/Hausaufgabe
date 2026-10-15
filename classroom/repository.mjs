const copy=x=>structuredClone(x);
export function createClassroomRepository({now=Date.now}={}){
 let revision=0,sequence=10,sourceIndex=new Map(),state;
 function seed(){return {
  year:'2026/27',schoolYears:{'school-north':'2026/27','school-south':'2026/27'}, schools:[{id:'school-north',name:'Beispielschule Nord'},{id:'school-south',name:'Beispielschule Süd'}],
  teachers:[{id:'teacher-tech',name:'Toni · Technik',schoolId:'school-north',loginVerified:true},{id:'teacher-english',name:'Kim · Englisch',schoolId:'school-north',loginVerified:true},{id:'teacher-replacement',name:'Alex · Nachfolge',schoolId:'school-north',loginVerified:true},{id:'teacher-other',name:'Sam · 5a Deutsch / 9c Technik',schoolId:'school-north',loginVerified:true},{id:'school-admin',name:'Schulverwaltung',schoolId:'school-north',admin:true,loginVerified:true},{id:'school-deputy',name:'Stellvertretung',schoolId:'school-north',admin:true,loginVerified:true}],
  classes:[{id:'class-5a',name:'5a',schoolId:'school-north',year:'2026/27',status:'active'},{id:'class-9b',name:'9b',schoolId:'school-north',year:'2026/27',status:'active'},{id:'class-9c',name:'9c',schoolId:'school-north',year:'2026/27',status:'active'},{id:'class-south',name:'9b',schoolId:'school-south',year:'2026/27',status:'active'}],
  courses:[{id:'course-tech',classId:'class-9b',subject:'Technik',schoolId:'school-north'},{id:'course-english',classId:'class-9b',subject:'Englisch',schoolId:'school-north'},{id:'course-german',classId:'class-5a',subject:'Deutsch',schoolId:'school-north'},{id:'course-9c',classId:'class-9c',subject:'Technik',schoolId:'school-north'}],
  grants:[{id:'grant-tech',teacherId:'teacher-tech',courseId:'course-tech',from:0,to:null},{id:'grant-english',teacherId:'teacher-english',courseId:'course-english',from:0,to:null},{id:'grant-german',teacherId:'teacher-other',courseId:'course-german',from:0,to:null},{id:'grant-9c',teacherId:'teacher-other',courseId:'course-9c',from:0,to:null}],
  students:[{id:'pupil-9b',schoolId:'school-north',status:'active'},{id:'pupil-empty',schoolId:'school-north',status:'active'},{id:'pupil-9c',schoolId:'school-north',status:'active'},{id:'pupil-south',schoolId:'school-south',status:'active'}],
  memberships:[{id:'mem-1',studentId:'pupil-9b',classId:'class-9b',alias:'Fuchs 17',status:'active',year:'2026/27'},{id:'mem-2',studentId:'pupil-empty',classId:'class-5a',alias:'Biber 04',status:'active',year:'2026/27'},{id:'mem-3',studentId:'pupil-9c',classId:'class-9c',alias:'Eule 08',status:'active',year:'2026/27'},{id:'mem-4',studentId:'pupil-south',classId:'class-south',alias:'Otter 12',status:'active',year:'2026/27'}],
  quizzes:[{id:'QTECH',title:'Sicher arbeiten in der Werkstatt',subject:'Technik',grade:'9b',ownerId:'teacher-tech',published:false},{id:'QENG',title:'A day at school',subject:'Englisch',grade:'9b',ownerId:'teacher-english',published:false},{id:'QDEUT',title:'Eine Geschichte erzählen',subject:'Deutsch',grade:'5a',ownerId:'teacher-other',published:false}],assignments:[],history:[]
 };}
 function reset(){state=seed();sourceIndex.clear();sequence=10;revision++;}
 reset(); const id=prefix=>`${prefix}-${++sequence}`;
 const klass=cid=>state.classes.find(c=>c.id===cid);
 const course=cid=>state.courses.find(c=>c.id===cid);
 const teacher=tid=>state.teachers.find(t=>t.id===tid);
 const member=(sid,cid)=>state.memberships.find(m=>m.studentId===sid&&m.classId===cid&&m.status==='active');
 function canTeach(tid,cid,at=now()){const c=course(cid),t=teacher(tid);return !!(c&&t?.loginVerified&&c.schoolId===t.schoolId&&state.grants.some(g=>g.teacherId===tid&&g.courseId===cid&&g.from<=at&&(g.to==null||at<g.to)));}
 function requireCourse(tid,cid){if(!canTeach(tid,cid))throw Error('Keine Berechtigung für dieses Fach in dieser Schule.');return course(cid);}
 function requireClass(tid,cid){if(!state.courses.some(c=>c.classId===cid&&canTeach(tid,c.id)))throw Error('Keine Berechtigung für diese Klasse.');}
 function assign(tid,{quizId,courseId,startsAt=now(),endsAt=now()+86400000,recipientIds}){
  const c=requireCourse(tid,courseId),q=state.quizzes.find(q=>q.id===quizId);
  if(!q||q.ownerId!==tid||q.subject!==c.subject)throw Error('Nur eigene Entwürfe im zuständigen Fach zuweisen.');
  if(!Number.isFinite(startsAt)||!Number.isFinite(endsAt)||endsAt<=startsAt)throw Error('Ende muss nach dem Beginn liegen.');
  const eligible=state.memberships.filter(m=>m.classId===c.classId&&m.status==='active').map(m=>m.studentId);
  const audience=recipientIds??eligible;
  if(!audience.length||audience.some(sid=>!eligible.includes(sid)))throw Error('Empfänger müssen aktive Mitglieder dieser Klasse sein.');
  const a={id:id('assignment'),quizId,courseId,classId:c.classId,schoolId:c.schoolId,startsAt,endsAt,createdBy:tid,status:'open',recipients:[...new Set(audience)].map(sid=>({studentId:sid,membershipId:member(sid,c.classId).id,aliasSnapshot:member(sid,c.classId).alias})),resultsReleased:false,solutionsReleased:false};
  state.assignments.push(a);q.published=true;revision++;return copy(a);
 }
 function canStart(sid,aid,at=now()){
  const a=state.assignments.find(a=>a.id===aid),s=state.students.find(s=>s.id===sid); const m=a&&member(sid,a.classId);
  if(!a||!s||s.status!=='active'||s.schoolId!==a.schoolId||!m||!a.recipients.some(r=>r.studentId===sid&&r.membershipId===m.id))return {allowed:false,reason:'Dieser Test ist für diese Testperson nicht freigegeben.'};
  if(a.status!=='open'||at<a.startsAt||at>=a.endsAt)return {allowed:false,reason:'Der Test liegt außerhalb des freigegebenen Zeitraums.'};
  return {allowed:true};
 }
 function listStudentTests(sid,at=now()){
  return state.assignments.filter(a=>{const s=state.students.find(s=>s.id===sid),m=member(sid,a.classId);return s?.schoolId===a.schoolId&&m&&a.recipients.some(r=>r.studentId===sid&&r.membershipId===m.id);}).map(a=>({id:a.id,quizId:a.quizId,classId:a.classId,startsAt:a.startsAt,endsAt:a.endsAt,resultsReleased:a.resultsReleased,solutionsReleased:a.solutionsReleased,quiz:(()=>{const q=state.quizzes.find(q=>q.id===a.quizId);return q?{id:q.id,title:q.title,subject:q.subject,grade:q.grade}:null;})(),phase:a.completed?.includes(sid)?'done':at<a.startsAt?'upcoming':at<a.endsAt&&a.status==='open'?'now':'done'}));
 }
 function addDemoMember(cid){const c=klass(cid);if(!c)throw Error('Klasse fehlt.');const s={id:id('pupil'),schoolId:c.schoolId,status:'active'};state.students.push(s);state.memberships.push({id:id('mem'),studentId:s.id,classId:cid,alias:`Luchs ${sequence}`,status:'active',year:c.year});revision++;return copy(s);}
 function previewImport({kind='pupils',records,full=false,schoolId='school-north',year=state.year}){
  const counts={created:0,unchanged:0,moved:0,conflicts:0};const seen=new Set(),changes=[];
  for(const record of records){const key=`${schoolId}|synthetic-source|${kind}|${record.sourceId}`;const previous=sourceIndex.get(key);seen.add(key);let action=previous?'unchanged':'created';if(previous&&kind==='pupils'&&(previous.className!==record.className||previous.year!==year))action='moved';if(previous&&kind==='teaching'&&['teacherId','className','subject'].some(field=>previous[field]!==record[field]))action='conflict';if(previous&&kind==='teaching'&&previous.year!==year)action='conflict';if(action==='conflict')counts.conflicts++;else counts[action]++;changes.push({key,record:copy(record),action,entityId:previous?.entityId});}
  const missing=full?[...sourceIndex].filter(([k])=>k.startsWith(`${schoolId}|synthetic-source|${kind}|`)&&!seen.has(k)).map(([,v])=>({entityId:v.entityId,alias:'Fehlender Datensatz · prüfen'})):[];
  return {revision,kind,full,schoolId,year,counts,changes,missing};
 }
 function ensureClass(name,schoolId,year){let c=state.classes.find(c=>c.name===name&&c.schoolId===schoolId&&c.year===year);if(!c){c={id:id('class'),name,schoolId,year,status:'active'};state.classes.push(c);}return c;}
 function requireAdmin(actor,schoolId='school-north'){const t=teacher(actor);if(!t?.admin||!t.loginVerified||t.schoolId!==schoolId)throw Error('Nur die zuständige Schulverwaltung darf diesen Bestand verändern.');}
 function applyImport(actor,p){requireAdmin(actor,p.schoolId);if(p.revision!==revision)throw Error('Die Vorschau ist veraltet. Bitte erneut prüfen.');if(p.counts.conflicts)throw Error('Konflikte zuerst beheben.');
  const snapshot=copy(state),indexSnapshot=new Map(sourceIndex),sequenceSnapshot=sequence;
  try {for(const change of p.changes){const {record,action,key}=change; if(action==='unchanged')continue;
   if(p.kind==='pupils'){
    let sid=change.entityId;if(!sid){sid=id('pupil');state.students.push({id:sid,schoolId:p.schoolId,status:'active'});}
    const c=ensureClass(record.className,p.schoolId,p.year);if(action==='moved')for(const m of state.memberships)if(m.studentId===sid&&m.year===p.year&&m.status==='active')m.status='removed';
    if(!member(sid,c.id))state.memberships.push({id:id('mem'),studentId:sid,classId:c.id,alias:`Luchs ${sequence}`,status:'active',year:p.year});
    sourceIndex.set(key,{entityId:sid,className:record.className,year:p.year});
   }else if(p.kind==='teachers'){const tid=id('teacher');state.teachers.push({id:tid,name:`Import-Lehrkraft ${sequence}`,schoolId:p.schoolId,loginVerified:false});sourceIndex.set(key,{entityId:tid});}
   else {const t=sourceIndex.get(`${p.schoolId}|synthetic-source|teachers|${record.teacherId}`);if(!t)throw Error('Unterricht verweist auf unbekannte Lehrkraft. Zuerst Personal importieren.');const c=ensureClass(record.className,p.schoolId,p.year);const co={id:id('course'),classId:c.id,subject:record.subject,schoolId:p.schoolId};state.courses.push(co);state.grants.push({id:id('grant'),teacherId:t.entityId,courseId:co.id,from:now(),to:null,pending:true});sourceIndex.set(key,{entityId:co.id,teacherId:record.teacherId,className:record.className,subject:record.subject,year:p.year});}
  }revision++;return copy(p.counts);}catch(error){state=snapshot;sourceIndex=indexSnapshot;sequence=sequenceSnapshot;throw error;}
 }
 function transferTeachingGrant(actor,{grantId,toTeacherId,effectiveAt}){requireAdmin(actor);const g=state.grants.find(g=>g.id===grantId),t=teacher(toTeacherId);if(!g||!t?.loginVerified||t.schoolId!==course(g.courseId).schoolId)throw Error('Nachfolge benötigt ein verifiziertes Konto derselben Schule.');g.to=effectiveAt;state.grants.push({id:id('grant'),teacherId:toTeacherId,courseId:g.courseId,from:effectiveAt,to:null});revision++;}
 function rollover(actor,year){requireAdmin(actor);const schoolId=teacher(actor).schoolId,fromYear=state.schoolYears[schoolId];if(state.classes.some(c=>c.schoolId===schoolId&&c.year===year))throw Error('Dieses Schuljahr besteht bereits.');const classes=state.classes.filter(c=>c.schoolId===schoolId&&c.year===fromYear),owned=new Set(classes.map(c=>c.id)),before=copy(state.memberships.filter(m=>owned.has(m.classId)&&m.status==='active'&&m.year===fromYear));const cmap=new Map();for(const c of classes){c.status='archived';const n=ensureClass(c.name,schoolId,year);cmap.set(c.id,n.id);}for(const m of before)state.memberships.push({...m,id:id('mem'),classId:cmap.get(m.classId),year});state.history.push({kind:'rollover',schoolId,from:fromYear,to:year});state.schoolYears[schoolId]=year;state.year=year;revision++;}
 return {getState:()=>copy(state),reset,canTeach,assign,canStart,listStudentTests,addDemoMember,previewImport,applyImport,transferTeachingGrant,rollover,
  listClasses(tid,year=state.schoolYears[teacher(tid)?.schoolId]){return copy(state.classes.filter(c=>c.year===year&&state.courses.some(co=>co.classId===c.id&&canTeach(tid,co.id))));},
  listCourses(tid,cid){return copy(state.courses.filter(c=>c.classId===cid&&canTeach(tid,c.id)));},
  addRecipient(tid,aid,sid){const a=state.assignments.find(a=>a.id===aid);if(!a)throw Error('Zuweisung fehlt.');requireCourse(tid,a.courseId);const m=member(sid,a.classId);if(!m)throw Error('Keine aktive Mitgliedschaft.');if(!a.recipients.some(r=>r.studentId===sid))a.recipients.push({studentId:sid,membershipId:m.id,aliasSnapshot:m.alias});revision++;},
  removeMember(tid,cid,sid){requireClass(tid,cid);const m=member(sid,cid);if(m)m.status='removed';revision++;},
  setQuiz(q){const old=state.quizzes.find(x=>x.id===q.id);if(old)Object.assign(old,copy(q));else state.quizzes.push(copy(q));},
  complete(sid,aid){const a=state.assignments.find(a=>a.id===aid);if(!canStart(sid,aid).allowed)throw Error('Kein Start erlaubt.');a.completed=[...new Set([...(a.completed||[]),sid])];},
  release(tid,aid,field){const a=state.assignments.find(a=>a.id===aid);if(!a)throw Error('Zuweisung fehlt.');requireCourse(tid,a.courseId);if(!['resultsReleased','solutionsReleased'].includes(field))throw Error('Ungültige Freigabe.');a[field]=!a[field];},
 };
}
