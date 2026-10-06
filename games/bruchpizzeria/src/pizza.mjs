const EPS=1e-8;
export function wholePizza(){return [Array.from({length:96},(_,i)=>({x:Math.cos(i*Math.PI/48),y:Math.sin(i*Math.PI/48)}))];}
export function area(poly){return Math.abs(poly.reduce((sum,p,i)=>{const q=poly[(i+1)%poly.length];return sum+p.x*q.y-q.x*p.y;},0))/2;}
const WHOLE=area(wholePizza()[0]);
function clip(poly,a,b,side){
 const d=p=>side*((b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x));
 const out=[];
 for(let i=0;i<poly.length;i++){
  const p=poly[i],q=poly[(i+1)%poly.length],dp=d(p),dq=d(q);
  if(dp>=-EPS)out.push({...p});
  if((dp>EPS&&dq< -EPS)||(dp< -EPS&&dq>EPS)){
   const t=dp/(dp-dq);out.push({x:p.x+t*(q.x-p.x),y:p.y+t*(q.y-p.y)});
  }
 }
 return out;
}
export function cutPizza(polygons,a,b){
 if(![a?.x,a?.y,b?.x,b?.y].every(Number.isFinite)||Math.hypot(b.x-a.x,b.y-a.y)<1.5||Math.hypot(a.x,a.y)<.92||Math.hypot(b.x,b.y)<.92)return polygons;
 // A real stroke must span the pizza, rather than an infinite extrapolation.
 const dx=b.x-a.x,dy=b.y-a.y,t=-(a.x*dx+a.y*dy)/(dx*dx+dy*dy);
 if(t<=0||t>=1||Math.hypot(a.x+t*dx,a.y+t*dy)>.9)return polygons;
 const result=[];
 for(const poly of polygons){
  const left=clip(poly,a,b,1),right=clip(poly,a,b,-1);
  if(area(left)>.002&&area(right)>.002)result.push(left,right);else result.push(poly);
 }
 return result.length<=4?result:polygons;
}
function validSelection(polygons,ids){return Array.isArray(ids)&&ids.length>0&&new Set(ids).size===ids.length&&ids.every(i=>Number.isInteger(i)&&i>=0&&i<polygons.length);}
export function portion(polygons,ids){return validSelection(polygons,ids)?ids.reduce((s,i)=>s+area(polygons[i])/WHOLE,0):0;}
export function evaluatePortion(polygons,ids,target){
 if(!validSelection(polygons,ids))return {ok:false,reason:'empty'};
 const n=polygons.length;
 if(![1,2,4].includes(n)||polygons.some(p=>Math.abs(area(p)/WHOLE-1/n)>.035))return {ok:false,reason:'unequal'};
 const fraction=ids.length/n;
 return {ok:Number.isFinite(target)&&Math.abs(fraction-target)<EPS,reason:Math.abs(fraction-target)<EPS?'correct':'quantity',fraction,numerator:ids.length,denominator:n};
}
