export const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
export const add=(p,...children)=>{p.append(...children.filter(Boolean));return p;};
export const link=(text,href,cls='button secondary')=>{const a=el('a',text,cls);a.href=href;return a;};
export const button=(text,fn,cls='button secondary')=>{const b=el('button',text,cls);b.type='button';b.onclick=fn;return b;};
export function field(title,name,value='',type='textarea'){
 const label=el('label',title,'ops-field'),input=el(type);input.name=name;input.setAttribute('aria-label',title);input.value=value;if(type==='textarea')input.rows=3;label.append(input);return {label,input};
}
export function details(title,...children){return add(el('details',undefined,'ops-details'),el('summary',title),...children);}
export function textPair(title,value){return add(el('div',undefined,'ops-pair'),el('h3',title),el('p',value||'Noch nicht belegt.'));}
export async function act(client,path,payload,error,onDone){
 error.textContent='';try{const result=await client.post(path,payload);onDone?.(result);await client.refresh();return result;}catch(e){error.textContent=e.message;return null;}
}
export function chatLink(owner){
 const valid=owner&&/^[a-f0-9-]{36}$/.test(owner.conversationId);return valid?link('Fachchat öffnen','codex://threads/'+owner.conversationId):el('span','Chat nicht zugeordnet.');
}
