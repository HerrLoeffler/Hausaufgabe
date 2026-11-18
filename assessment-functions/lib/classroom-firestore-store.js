'use strict';
// One adapter for ordinary reads and transaction-bound authorization/catalog
// reads. Queries in a transaction use the same transaction snapshot/locks.
function createClassroomFirestoreStore(db){
 const read=(reader,path)=>reader?reader.get(db.doc(path)):db.doc(path).get();
 async function list(reader,path,field,value){
  let query=db.collection(path);if(field)query=query.where(field,field==='recipientIds'?'array-contains':'==',value);
  const rows=[];let cursor=null;
  for(;;){const pageQuery=(cursor?query.startAfter(cursor):query).limit(250),page=reader?await reader.get(pageQuery):await pageQuery.get();rows.push(...page.docs.map(doc=>({id:doc.id,...doc.data()})));
   if(rows.length>5000){const e=Error('Diese Gesamtliste ist zu groß. Bitte nach Klasse filtern.');e.code='resource-exhausted';throw e;}
   if(page.size<250)return rows;cursor=page.docs[page.docs.length-1];
  }
 }
 const unit=reader=>({get:async path=>(await read(reader,path)).data(),list:(...args)=>list(reader,...args),set:(path,data)=>reader.set(db.doc(path),data),remove:path=>reader.delete(db.doc(path))});
 return {get:async path=>(await read(null,path)).data(),list:(...args)=>list(null,...args),count:async(path,field,value)=>(await db.collection(path).where(field,'==',value).count().get()).data().count,transaction:work=>db.runTransaction(reader=>work(unit(reader)))};
}
module.exports={createClassroomFirestoreStore};
