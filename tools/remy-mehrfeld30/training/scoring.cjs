'use strict';
const {core,parseVisualTask}=require('../../../functions/lib/visual-task');
const {equivalentOperation}=require('./oracle.cjs');
const op=value=>{
  const text=String(value||'').trim().toLowerCase();
  if(['×','·','*','mal','x'].includes(text))return '×';
  if(['÷',':','/','geteilt durch'].includes(text))return '÷';
  return null;
};
function scoreLearningTask(q,answer){
  const task=parseVisualTask(q.visualTask,{points:q.points});
  if(!answer||typeof answer!=='object'||Array.isArray(answer))return 0;
  const edges=[[1,0,1,0,2,2,2],[1,4,5,0,3,2,3],[3,0,1,2,2,4,2],[3,4,5,2,3,4,3]];
  const cellValue=(r,c)=>{
    const cell=task.spec.rows[r][c];
    return cell.input?task.solution.cells.find(x=>x.id===cell.id).accepted[0]:cell.text;
  };
  const pointPerCell=q.points/task.solution.cells.length;
  let points=0;
  const special=new Set();
  for(const [r,oc,fc,fr,fcol,tr,tcol] of edges){
    const operator=task.spec.rows[r][oc],factor=task.spec.rows[r][fc];
    const from=cellValue(fr,fcol),to=cellValue(tr,tcol);
    if(factor.control==='operation'){
      special.add(factor.id);
      const raw=String(answer[factor.id]||'').trim().toLowerCase();
      const match=raw.match(/^(geteilt\s+durch|mal|[×·*x÷:/])\s*(\d+(?:[.,]\d+)?|[.,]\d+)$/);
      if(match&&equivalentOperation(from,to,op(match[1].replace(/\s+/g,' ')),match[2]))points+=pointPerCell;
    }else if(operator.input){
      special.add(operator.id);special.add(factor.id);
      const selected=op(answer[operator.id]);
      if(selected)points+=pointPerCell;
      // A wrong operator does not erase a separately correct canonical factor.
      if(selected?equivalentOperation(from,to,selected,answer[factor.id]):
        String(answer[factor.id]||'').trim().replace(',','.')===String(cellValue(r,fc)).replace(',','.'))points+=pointPerCell;
    }
  }
  const ordinary={...answer};
  for(const key of special)delete ordinary[key];
  return Math.min(q.points,Math.round((points+core.grade(task,ordinary).points)*1000)/1000);
}
module.exports={scoreLearningTask};
