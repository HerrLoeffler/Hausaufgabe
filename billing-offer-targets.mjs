function node(doc,tag,text,classes){const el=doc.createElement(tag);if(text!==undefined)el.textContent=text;if(classes)el.className=classes;return el;}
export function mountOfferTargets(root,{client,kind='person',canManageOffers=false,initialIds=[],onChange=()=>{}}={}){
 const doc=root.ownerDocument,ticket=Symbol();root.offerTargetsTicket=ticket;root.replaceChildren();root.className='billingOfferTargets';
 let generation=0,enabled=true,selected=new Map(),known=new Map();
 const current=id=>root.isConnected&&root.offerTargetsTicket===ticket&&id===generation&&enabled;
 const empty={ids:()=>[],labelFor:()=>'',setKind:()=>{},setSelected:()=>{},clear:()=>{},setEnabled:()=>{}};if(canManageOffers!==true)return empty;
 const label=node(doc,'label'),input=node(doc,'input');input.type='search';input.name='offerTargetQuery';input.autocomplete='off';input.maxLength=120;label.append(input);
 const search=node(doc,'button','Suchen','button secondary');search.type='button';search.dataset.action='search-targets';
 const status=node(doc,'p',undefined,'hint');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const chips=node(doc,'div',undefined,'billingTargetChips'),results=node(doc,'div',undefined,'billingTargetResults');root.append(label,search,status,chips,results);
 function describe(target){return target.label+(target.email?' · '+target.email:'');}
 const fallback=()=>kind==='school'?'Ausgewählte Schule':'Ausgewähltes Konto';
 function heading(){label.firstChild?.nodeType===3&&label.firstChild.remove();label.prepend(doc.createTextNode(kind==='school'?'Schule suchen':'Person nach Name oder E-Mail suchen'));}
 function notify(){onChange([...selected.keys()]);}
 function draw(){chips.replaceChildren();for(const[id,target]of selected){const chip=node(doc,'span',undefined,'billingTargetChip');chip.append(node(doc,'span',target?describe(target):fallback()));const remove=node(doc,'button','Entfernen','button ghost');remove.type='button';remove.dataset.action='remove-target';remove.setAttribute('aria-label',(target?describe(target):fallback())+' entfernen');remove.disabled=!enabled;remove.onclick=()=>{if(!enabled)return;selected.delete(id);generation++;results.replaceChildren();draw();status.textContent=selected.size+' ausgewählt.';notify();};chip.append(remove);chips.append(chip);}}
 function invalidate(){generation++;results.replaceChildren();status.textContent='';search.disabled=!enabled;}
 input.oninput=invalidate;input.onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();void lookup();}};search.onclick=()=>{void lookup();};
 async function lookup(){if(!enabled)return;const query=input.value.trim();invalidate();if(query.length<2){status.textContent='Bitte mindestens zwei Zeichen eingeben.';return;}const id=generation;search.disabled=true;status.textContent='Suche läuft …';try{
   const response=await client.request('offerTargets',{query,kind});if(!current(id))return;
   const targets=(Array.isArray(response.targets)?response.targets:[]).filter(target=>target.kind===kind&&typeof target.id==='string'&&typeof target.label==='string'&&target.label.trim()).slice(0,20);
   for(const target of targets){known.set(target.id,target);if(selected.has(target.id))selected.set(target.id,target);}draw();
   status.textContent=response.hasMore||response.targets?.length>20?'Bitte genauer suchen, um weitere Treffer zu finden.':targets.length?'Passende Treffer auswählen.':'Keine passenden Treffer.';
   for(const target of targets){if(selected.has(target.id))continue;const choose=node(doc,'button',describe(target),'button secondary');choose.type='button';choose.dataset.action='select-target';choose.onclick=()=>{if(!current(id))return;selected.set(target.id,target);choose.remove();draw();status.textContent=selected.size+' ausgewählt.';notify();};results.append(choose);}
  }catch(error){if(current(id))status.textContent=error.message||'Die Suche konnte nicht geladen werden. Bitte erneut versuchen.';}finally{if(current(id))search.disabled=false;}}
 function setSelected(ids){invalidate();selected=new Map(ids.map(id=>[id,known.get(id)||null]));draw();notify();}
 heading();selected=new Map(initialIds.map(id=>[id,null]));draw();
 return{ids:()=>[...selected.keys()],labelFor:id=>{const value=selected.get(id)||known.get(id);return value?describe(value):'';},setSelected,clear:()=>setSelected([]),setKind:next=>{if(next===kind)return;kind=next==='school'?'school':'person';known.clear();input.value='';heading();setSelected([]);},setEnabled:next=>{enabled=next===true;input.disabled=!enabled;invalidate();draw();}};
}
