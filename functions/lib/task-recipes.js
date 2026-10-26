'use strict';
const {createHash}=require('node:crypto');
const catalog=require('../data/interactive-task-blueprints.v1.json');
const VERSION=createHash('sha256').update(JSON.stringify(catalog.authoringRecipes)+catalog.authoringRecipeVersion+require('node:fs').readFileSync(require.resolve('./visual/dreisatz-builder'),'utf8')+require('node:fs').readFileSync(require.resolve('./dreisatz-draft'),'utf8')).digest('hex').slice(0,16);
const norm=s=>String(s||'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/ß/g,'ss');
function selectTaskProfiles(context={},options={}){
 const types=options.allowedTypes||context.allowedTypes||[],formats=options.allowedVisualFormats||context.allowedVisualFormats||['hotspot','labeling','scale','angle','grid','connections','coordinate','table'];
 if(!types.includes('visual'))return [];
 const source=options.catalog?.authoringRecipes||catalog.authoringRecipes,topic=norm(context.topic),goals=norm((context.learningGoals||[]).join(' ')),subject=norm(context.subject),mixed=/facherubergreifend|mixed/.test(subject),math=/mathe/.test(subject)||mixed;
 return source.filter(p=>p.qualification==='contract_verified'&&formats.includes(p.format)).map(p=>{
  if(p.exclude.some(x=>(topic+' '+goals).includes(norm(x))))return null;
  if(p.subjects.length&&!mixed&&!p.subjects.some(s=>subject.includes(norm(s))))return null;
  const goalHits=p.match.filter(x=>goals.includes(norm(x))).length,topicHits=p.match.filter(x=>topic.includes(norm(x))).length;
  if(!goalHits&&!topicHits)return null;
  if(p.id.startsWith('dreisatz')&&!math)return null;
  if(p.id==='dreisatz-direct'&&/begriff|interpret|beurteil|wahl/.test(topic+' '+goals)&&!/berechn|rechenweg|bestimm/.test(goals))return null;
  return {...p,version:VERSION,score:goalHits*20+topicHits*3+(p.id.startsWith('dreisatz')?1:0)};
 }).filter(Boolean).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,6);
}
function buildRecipePlan(input={}){
 const profiles=selectTaskProfiles(input),count=Number(input.count||0),units=Math.round(Number(input.points||0)*2);
 if(!Number.isInteger(count)||count<1||count>100||units<count)return {version:VERSION,profiles,slots:[]};
 // Goals, not arbitrary format quotas: only equally ranked learning actions share slots.
 const candidates=profiles.filter(p=>p.score>=((profiles[0]?.score||0)-3));
 const slots=Array.from({length:count},(_,i)=>({index:i,points:(Math.floor((i+1)*units/count)-Math.floor(i*units/count))/2,...(candidates.length?{recipeId:candidates[i%candidates.length].id,recipeVersion:VERSION,goal:candidates[i%candidates.length].goal,format:candidates[i%candidates.length].format}:{}),variant:i}));
 return {version:VERSION,profiles,slots};
}
function validateTaskPlan(input,slots,profiles){
 const errors=[];if(slots.length!==input.count)errors.push('Aufgabenanzahl im Plan stimmt nicht.');
 if(Math.abs(slots.reduce((n,s)=>n+s.points,0)-input.points)>1e-9)errors.push('Punktesumme im Plan stimmt nicht.');
 slots.forEach((s,i)=>{if(s.index!==i||!Number.isFinite(s.points)||s.points<.5||s.points*2%1)errors.push('Ungültiger Aufgabenplatz.');if(s.recipeId&&!profiles.some(p=>p.id===s.recipeId&&p.version===s.recipeVersion&&p.format===s.format))errors.push('Nicht zugelassenes Aufgabenrezept.');});return errors;
}
module.exports={VERSION,selectTaskProfiles,buildRecipePlan,validateTaskPlan};
