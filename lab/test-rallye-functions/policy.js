'use strict';
const {createHash,timingSafeEqual}=require('node:crypto');
function reject(message='Keine Berechtigung.'){throw new Error(message)}
function assertOwner(identity,quiz){if(!identity?.uid||quiz?.ownerId!==identity.uid)reject();}
function canDevelop({project,enabled,role}){return project==='hausaufgabe-staging'&&enabled===true&&role==='admin'}
function assertDevelopment(room,gate){if(room.development!==true||!canDevelop(gate))reject('Entwicklungsaktionen sind für diese Runde nicht verfügbar.');}
function hashToken(token){return createHash('sha256').update(String(token||'')).digest('hex')}
function assertPlayer(player,token){if(!/^[A-Za-z0-9_-]{32,100}$/.test(token||''))reject();const a=Buffer.from(hashToken(token)),b=Buffer.from(player?.tokenHash||'');if(a.length!==b.length||!timingSafeEqual(a,b))reject()}
function cleanCode(value){if(!/^\d{6}$/.test(value||''))reject('Bitte sechsstelligen Rundencode eingeben.');return value}
function cleanIdentity(value){if(!/^[A-Za-z0-9_-]{20,100}$/.test(value||''))reject('Ungültige Teilnehmer-ID.');return value}
function cleanAlias(value){const s=String(value||'').trim();if(!s||s.length>24||/[<>\x00-\x1f]/.test(s))reject('Bitte ein Kürzel mit 1–24 Zeichen eingeben.');return s}
function assertHostProfile({exists,profile={},deletionExists}){if(!exists||deletionExists||profile.accountDeletionId||(profile.status&&profile.status!=="active")||profile.disabled===true||!["teacher","admin"].includes(profile.role||"teacher"))reject("Ein freigeschaltetes Lehrkraftkonto ist erforderlich.");}
function assertPlayableQuiz(quiz){if(!quiz||quiz.isDeleted===true||quiz.rightsHold===true)reject("Dieser Test ist nicht verfügbar oder gesperrt.");}
module.exports={assertHostProfile,assertPlayableQuiz,assertOwner,canDevelop,assertDevelopment,hashToken,assertPlayer,cleanCode,cleanIdentity,cleanAlias};
