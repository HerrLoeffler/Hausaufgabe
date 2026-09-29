"use strict";
const { createHash, randomBytes } = require("node:crypto");
const SKILLS={strategy:["spelling",5],case:["spelling",5],spelling:["spelling",5],dasdass:["spelling",6],together:["spelling",6],punctuation:["spelling",5],wordclass:["grammar",5],sentenceparts:["grammar",5],sentencebuild:["grammar",6],tense:["grammar",5],voice:["grammar",7],wordformation:["grammar",7]};
const LEVELS=new Set(["n1","n2","n3","n4"]),PENALTIES=new Set([0,25,50,100]),LOCKS=new Set([0,2,5,10,30]);
const hash=v=>createHash("sha256").update(String(v||"")).digest("hex");
const token=()=>randomBytes(24).toString("base64url");
function fail(code,message,status=400){const e=new Error(message);e.apiCode=code;e.httpStatus=status;throw e;}
function text(v,n){return String(v||"").trim().slice(0,n)}
function cleanName(v){const n=text(v,24).replace(/[<>]/g,"");if(!n)fail("name_required","Bitte einen Namen oder ein Kürzel eingeben.");return n;}
function cleanGrade(g){return ["5","6","7","8","9","qa"].includes(String(g))?String(g):"9"}
const gradeNum=g=>g==="qa"?9:Number(g);
function cleanSkills(values,grade){const g=gradeNum(grade),a=Array.isArray(values)?[...new Set(values.map(String))]:[];const out=a.filter(s=>SKILLS[s]&&SKILLS[s][1]<=g);return out.length?out:Object.keys(SKILLS).filter(s=>SKILLS[s][1]<=g);}
function cleanConfig(raw={}){const grade=cleanGrade(raw.grade),level=LEVELS.has(raw.level)?raw.level:"n2",durationSec=Math.max(60,Math.min(300,Math.round(Number(raw.durationSec||180)/60)*60)),s=raw.scoring||{};return{version:1,grade,skills:cleanSkills(raw.skills,grade),level,durationSec,scoring:{correctPoints:100,wrongPenalty:PENALTIES.has(Number(s.wrongPenalty))?Number(s.wrongPenalty):50,lockSeconds:LOCKS.has(Number(s.lockSeconds))?Number(s.lockSeconds):5,speedBonus:s.speedBonus!==false,streakBonus:s.streakBonus!==false,showSolution:s.showSolution!==false,allowNegative:true},leaderboardMode:["live","after","hidden"].includes(raw.leaderboardMode)?raw.leaderboardMode:"after"};}
function cleanSummary(r={}){const total=Math.max(0,Math.min(500,Math.trunc(Number(r.total||0)))),correct=Math.max(0,Math.min(total,Math.trunc(Number(r.correct||0)))),bestStreak=Math.max(0,Math.min(correct,Math.trunc(Number(r.bestStreak||0)))),score=Math.max(-100000,Math.min(1000000,Math.trunc(Number(r.score||0))));return{total,correct,bestStreak,score};}
function officialConfig(grade,focus){grade=cleanGrade(grade);focus=["mix","spelling","grammar","qa"].includes(focus)?focus:"mix";let skills=Object.keys(SKILLS).filter(s=>SKILLS[s][1]<=gradeNum(grade));if(focus==="spelling")skills=skills.filter(s=>SKILLS[s][0]==="spelling");if(focus==="grammar")skills=skills.filter(s=>SKILLS[s][0]==="grammar");if(focus==="qa")skills=Object.keys(SKILLS);return{boardId:`v1_${grade}_${focus}`,config:{version:1,grade,skills,level:focus==="qa"?"n4":"n2",durationSec:120,scoring:{correctPoints:100,wrongPenalty:100,lockSeconds:3,speedBonus:true,streakBonus:true,showSolution:false,allowNegative:true},leaderboardMode:"after"}};}
module.exports={SKILLS,hash,token,fail,text,cleanName,cleanConfig,cleanSummary,officialConfig};
