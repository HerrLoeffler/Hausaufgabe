'use strict';
function createGenerationAudit({ getUid, readJobs, readQuestions, storage }) {
  let sessionUid = null; let sessionId = null;
  const key = uid => `gradecrew.nativeRemy.audits:${uid}`;
  const load = uid => { try { return JSON.parse(storage.getItem(key(uid)) || '[]').filter(r => r && Date.now()-r.created < 86400000).slice(-8); } catch { return []; } };
  const save = (uid, rows) => storage.setItem(key(uid), JSON.stringify(rows));
  const assertUid = uid => { if (!uid || getUid() !== uid) throw new Error('Das GradeCrew-Konto wurde gewechselt.'); };
  const text = v => String(v || '').replace(/\s+/g, ' ').trim();
  const hasImage = q => /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(q.imageDataUrl || '') || /^https:\/\//.test(q.imageUrl || '');
  const hasAudio = q => !q.audioNeedsRegeneration && /^data:audio\/(?:mpeg|mp3|wav);base64,[A-Za-z0-9+/]+={0,2}$/.test(q.audioDataUrl || '');
  const hasAnswers = q => q.audioAnswerMode === 'audio-only' && Array.isArray(q.options) && q.options.length >= 2 && q.options.every(hasAudio);
  return {
    session() {
      const uid = getUid(); assertUid(uid);
      if (uid !== sessionUid) { sessionUid = uid; sessionId = crypto.randomUUID(); }
      return sessionId;
    },
    async prepare(expected) {
      const uid = getUid(); assertUid(uid);
      const jobs = await readJobs(uid); assertUid(uid);
      return { uid, created: Date.now(), expected: { ...expected }, before: jobs.filter(j => j.ownerId === uid).map(j => j.id) };
    },
    remember(receipt) {
      assertUid(receipt.uid);
      const rows = load(receipt.uid); rows.push(receipt); save(receipt.uid, rows);
    },
    async inspect() {
      const uid = getUid(); assertUid(uid);
      const rows = load(uid);
      if (!rows.length) return { status:'none' };
      const jobs = await readJobs(uid); assertUid(uid);
      const outcomes = [];
      for (const row of rows) {
        if (row.outcome?.status === 'checked') { outcomes.push(row.outcome); continue; }
        const expected = row.expected;
        const candidates = jobs.filter(job => job.ownerId === uid && !row.before.includes(job.id));
        let matches = candidates.filter(job =>
          ['subject','grade','topic'].every(k => text(job.input?.[k]) === text(expected[k])) && Number(job.input?.count) === Number(expected.count));
        if (!matches.length && candidates.length === 1) matches = candidates;
        if (matches.length !== 1) {
          outcomes.push(matches.length > 1 ? {status:'needsReview',message:'Mehrere passende Aufträge: Bitte den Test in GradeCrew prüfen.'} : {status:'pending'});
          continue;
        }
        const job = matches[0];
        if (!['ready','failed'].includes(job.status)) { outcomes.push({status:'pending'}); continue; }
        if (job.status === 'failed' || !job.quizId) {
          row.outcome = {status:'needsReview',message:'Die Testerstellung ist fehlgeschlagen. Bitte den Auftrag in GradeCrew prüfen.'}; outcomes.push(row.outcome); continue;
        }
        const questions = await readQuestions(job.quizId); assertUid(uid);
        const actual = { count:questions.length, imageQuestionCount:questions.filter(hasImage).length, audioQuestionCount:questions.filter(hasAudio).length, audioAnswerQuestionCount:questions.filter(hasAnswers).length };
        const labels = {count:'Aufgaben',imageQuestionCount:'Bilder',audioQuestionCount:'Höraufgaben',audioAnswerQuestionCount:'Audioantworten'};
        const problems=[];
        for (const [field,label] of [['subject','Fach'],['grade','Klasse'],['topic','Thema']]) {
          if (text(job.input?.[field]) !== text(expected[field])) problems.push(label+' im Auftrag abweichend');
        }
        for (const [field,label] of Object.entries(labels)) {
          const wanted=Number(expected[field] || 0);
          if (actual[field] !== wanted) problems.push(`${label} ${actual[field]}/${wanted}`);
          if (field !== 'count' && Number(job.input?.[field] || 0) !== wanted) problems.push(`${label}: Auftragszahl abweichend`);
        }
        if (expected.customNotes && !text(job.input?.notes).includes(text(expected.customNotes))) problems.push('Eigene Wünsche nicht vollständig übergeben');
        row.outcome = problems.length ? {status:'needsReview',message:'Medienprüfung offen: '+problems.join(' · ')+'. Bitte in GradeCrew prüfen.'}
          : {status:'checked',message:`Medien geprüft: ${actual.count} Aufgaben · ${actual.imageQuestionCount} Bilder · ${actual.audioQuestionCount} Höraufgaben.`};
        outcomes.push(row.outcome);
      }
      save(uid,rows);
      const review=outcomes.find(o=>o.status==='needsReview');
      if (review) return review;
      if (outcomes.some(o=>o.status==='pending')) return {status:'pending',message:'Test wird erstellt; Aufgaben und Medien werden anschließend geprüft.'};
      return outcomes.at(-1) || {status:'none'};
    }
  };
}
if (typeof module !== 'undefined') module.exports = { createGenerationAudit };
if (typeof window !== 'undefined') {
  const config = __GRADECREW_CONFIG__;
  if (window.top === window.self && window.location.origin === config.origin) {
    let adapter;
    async function getAdapter() {
      if (adapter) return adapter;
      const {getApp} = await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js');
      const {getAuth} = await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js');
      const {getFirestore,collection,query,where,getDocs} = await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js');
      const app=getApp();
      if (app.options.projectId !== 'hausaufgabe-staging') throw new Error('Die Staging-Verbindung konnte nicht bestätigt werden.');
      const db=getFirestore(app);
      adapter=createGenerationAudit({getUid:()=>getAuth(app).currentUser?.uid,
        readJobs:async uid=>(await getDocs(query(collection(db,'aiJobs'),where('ownerId','==',uid)))).docs.map(d=>({id:d.id,...d.data()})),
        readQuestions:async quizId=>(await getDocs(collection(db,'quizzes',quizId,'questions'))).docs.map(d=>d.data()),storage:window.localStorage});
      return adapter;
    }
    window.GradeCrewRemyAudit={session:async ()=>(await getAdapter()).session(),prepare:async fields=>(await getAdapter()).prepare(fields),remember:async receipt=>(await getAdapter()).remember(receipt),inspect:async ()=>(await getAdapter()).inspect()};
  }
}
