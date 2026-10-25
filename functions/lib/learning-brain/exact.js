'use strict';
// Exact arithmetic only. Never execute a learner's expression.
function rational(value){
 const s=String(value).normalize('NFKC').trim().replace(/−/g,'-').replace(/,/g,'.').replace(/\s+/g,'');
 if(s.length>100)return null;
 const f=s.match(/^([+-]?\d{1,18})\/([+-]?\d{1,18})$/);
 if(f){const a=BigInt(f[1]),b=BigInt(f[2]);return b===0n?null:[a,b];}
 const n=s.match(/^([+-]?)(\d{1,18})(?:\.(\d{1,12}))?$/);
 if(!n)return null;
 return [BigInt((n[1]==='-'?'-':'')+n[2]+(n[3]||'')),10n**BigInt((n[3]||'').length)];
}
function assessExact(answer,key){
 if(!key||!Array.isArray(key.values)||!key.values.length)return null;
 if(key.kind==='rational'||key.kind==='number'||key.kind==='exact-fraction'){
  const x=rational(answer);if(!x)return null;
  const values=key.values.map(rational);if(values.some(v=>!v))return null;
  return values.some(v=>key.kind==='exact-fraction'?x[0]===v[0]&&x[1]===v[1]:x[0]*v[1]===v[0]*x[1]);
 }
 // Open language answers are judged against a rubric by AI, including alternatives.
 return null;
}
module.exports={rational,assessExact};
