'use strict';
// Deliberately independent of the display builder and its answer key.
const gcd=(a,b)=>b?gcd(b,a%b):a;
function rational(n,d=1n){
  if(d===0n)throw Error('Division durch null.');
  if(d<0n){n=-n;d=-d;}
  const g=gcd(n<0n?-n:n,d);
  return {n:n/g,d:d/g};
}
function parse(value){
  const raw=String(value).trim().replace(',','.');
  if(!/^\d{1,7}(?:\.\d{1,6})?$/.test(raw))throw Error('Zahl mit höchstens sechs Nachkommastellen angeben.');
  const [whole,decimal='']=raw.split('.');
  return rational(BigInt(whole+decimal),10n**BigInt(decimal.length));
}
const multiply=(a,b)=>rational(a.n*b.n,a.d*b.d);
const divide=(a,b)=>rational(a.n*b.d,a.d*b.n);
function decimal(a){
  let d=a.d;
  for(const factor of [2n,5n])while(d%factor===0n)d/=factor;
  if(d!==1n)throw Error('Dieser Wert benötigt eine ausdrücklich festgelegte Rundung.');
  let digits=0n,unit=1n;
  while(unit%a.d!==0n&&digits<6n){unit*=10n;digits++;}
  if(unit%a.d!==0n)throw Error('Dieser Wert benötigt eine ausdrücklich festgelegte Rundung.');
  const scaled=a.n*unit/a.d,raw=scaled.toString().padStart(Number(digits)+1,'0');
  return digits?raw.slice(0,-Number(digits))+'.'+raw.slice(-Number(digits)).replace(/0+$/,'')||'0':raw;
}
function solve({kind,a,b,c}){
  if(!['direct','inverse'].includes(kind))throw Error('Keine proportionale Beziehung.');
  const numbers=[a,b,c].map(parse);
  if(numbers.some(q=>q.n<=0n))throw Error('Angaben müssen positiv sein.');
  const [x,y,target]=numbers;
  const result=kind==='direct'?divide(multiply(y,target),x):divide(multiply(x,y),target);
  const resultText=decimal(result);
  for(const candidate of [1,2,3,4,5,10,20,25,50,100]){
    try{
      const pivot=parse(candidate),unit=kind==='direct'?divide(multiply(y,pivot),x):divide(multiply(x,y),pivot);
      const first=decimal(divide(x,pivot)),second=decimal(divide(target,pivot));
      return {values:[decimal(x),decimal(y),String(candidate),decimal(unit),decimal(target),resultText],result:resultText,
        invariant:kind==='direct'?x.n+'/'+x.d+':'+y.n+'/'+y.d:decimal(multiply(x,y)),kind,pivot:String(candidate),
        operations:[{op:'÷',value:first},{op:kind==='direct'?'÷':'×',value:first},
          {op:'×',value:second},{op:kind==='direct'?'×':'÷',value:second}]};
    }catch(error){if(!/Rundung/.test(error.message))throw error;}
  }
  throw Error('Der Zwischenweg benötigt eine ausdrücklich festgelegte Rundung.');
}
function compareFacts(expected,actual){
  if(expected.kind!==actual.kind)return false;
  if(!['direct','inverse'].includes(expected.kind))return true;
  try{return ['a','b','c'].every(k=>{const x=parse(expected[k]),y=parse(actual[k]);return x.n===y.n&&x.d===y.d;});}
  catch{return false;}
}
function checkFit(facts){
  const eligible=facts.positive===true&&(facts.relationship==='direct'&&facts.constantRate===true||
    facts.relationship==='inverse'&&facts.constantWork===true);
  return {eligible,reason:eligible?'Die fachliche Beziehung ist belegt.':'Die Voraussetzungen eines einfachen Dreisatzes fehlen.'};
}
function valuesAtPivot({kind,a,b,c},pivot){
  if(!['direct','inverse'].includes(kind))throw Error('Beziehung fehlt.');
  const [x,y,target,p]=[a,b,c,pivot].map(parse);
  if([x,y,target,p].some(v=>v.n<=0n))throw Error('Ein positiver Zwischenwert ist nötig.');
  const unit=kind==='direct'?divide(multiply(y,p),x):divide(multiply(x,y),p);
  const result=kind==='direct'?divide(multiply(y,target),x):divide(multiply(x,y),target);
  return {pivot:decimal(p),unit:decimal(unit),result:decimal(result)};
}
function equivalentOperation(from,to,op,factor){
  if(!['×','÷'].includes(op))return false;
  try{
    const a=parse(from),b=parse(to),raw=String(factor??'').trim().replace(/^[.,]/,'0.');
    const value=parse(raw);
    if(value.n<=0n)return false;
    const result=op==='×'?multiply(a,value):divide(a,value);
    return result.n*b.d===b.n*result.d;
  }catch{return false;}
}
module.exports={solve,compareFacts,checkFit,equivalentOperation,valuesAtPivot};
