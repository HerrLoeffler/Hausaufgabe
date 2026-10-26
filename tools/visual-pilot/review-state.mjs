export function nextPosition(test,question,delta,count){const n=Math.max(0,Math.min(count*8-1,test*8+question+delta));return {test:Math.floor(n/8),question:n%8};}
const key=(test,id)=>'gradecrew-pilot24-draft-v1:'+test+':'+id;
export function readDraft(storage,test,id){try{return JSON.parse(storage.getItem(key(test,id))||'null');}catch{return null;}}
export function saveDraft(storage,test,id,question,validate){validate(question);storage.setItem(key(test,id),JSON.stringify(question));}
