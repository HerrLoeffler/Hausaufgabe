'use strict';
class TestDatabase{
  constructor(){this.docs=new Map();this.queue=Promise.resolve();}
  doc(path){const db=this;return {path,id:path.split('/').at(-1),get:async()=>db.snapshot(path),
    set:async(value,options)=>db.write(path,value,options?.merge),update:async value=>db.write(path,value,true)};}
  snapshot(path){return {id:path.split('/').at(-1),exists:this.docs.has(path),data:()=>structuredClone(this.docs.get(path))};}
  write(path,value,merge){this.docs.set(path,merge?{...this.docs.get(path),...structuredClone(value)}:structuredClone(value));}
  collection(path){
    const db=this,filters=[];
    const query={where:(field,op,value)=>{if(op!=='==')throw Error(op);filters.push([field,value]);return query;},
      limit:n=>{query.n=n;return query;},get:async()=>({docs:[...db.docs.keys()].filter(p=>p.startsWith(path+'/')&&p.split('/').length===path.split('/').length+1)
        .map(p=>db.snapshot(p)).filter(s=>filters.every(([k,v])=>s.data()[k]===v)).slice(0,query.n||1000)})};
    return query;
  }
  batch(){
    const db=this,writes=[];
    const batch={set:(ref,value,options)=>{writes.push(()=>db.write(ref.path,value,options?.merge));return batch;},
      update:(ref,value)=>{writes.push(()=>db.write(ref.path,value,true));return batch;},
      commit:async()=>{for(const write of writes)write();}};
    return batch;
  }
  runTransaction(callback){
    const db=this;
    const result=this.queue.then(async()=>{
      const batch=db.batch();
      const tx={get:ref=>ref.get(),set:batch.set,update:batch.update,create:(ref,value)=>{
        if(db.docs.has(ref.path))throw Error('exists');batch.set(ref,value);}};
      const result=await callback(tx);await batch.commit();return result;
    });
    this.queue=result.catch(()=>{});
    return result;
  }
}
module.exports={TestDatabase};
