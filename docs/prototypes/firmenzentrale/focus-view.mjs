import {focusProjection,filterChildren,prepareChildWork,statusLabels,priorityLabels} from './focus.mjs';
import {nodes,edgesFor,clampZoom} from './network.mjs';
const NS='http://www.w3.org/2000/svg';
const E=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const A=(p,...children)=>{p.append(...children.filter(Boolean));return p;};
const S=(tag,attrs={})=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,String(v));return n;};
const link=(text,href,cls='net-link')=>{const n=E('a',cls,text);n.href=href;return n;};
const button=(text,fn,cls='net-button')=>{const n=E('button',cls,text);n.type='button';n.addEventListener('click',fn);return n;};
const route=(id,child='')=>`#/arbeit/landkarte/${id}${child?'/'+child:''}`;
const activate=(n,fn)=>{n.addEventListener('click',fn);n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn();}});};
let lastDomain='',zoom=1,offset={x:0,y:0},mode='all',query='';
export function leaveFocus(){const previous=lastDomain;lastDomain='';return previous;}
function wrapped(parent,text,{x=0,y=0,width=23,size=24,step=28,cls=''}={}){
 const lines=[],words=text.split(' ');let line='';for(const word of words){if(line&&`${line} ${word}`.length>width){lines.push(line);line=word;}else line=line?`${line} ${word}`:word;}if(line)lines.push(line);
 const t=S('text',{x,y,'text-anchor':'middle','font-size':size,class:cls});lines.forEach((l,i)=>{const span=S('tspan',{x,dy:i?step:0});span.textContent=l;t.append(span);});parent.append(t);return lines.length;
}
export function mountFocus(container,{selected,child='',onDraft,brandIcon}){
 const p=focusProjection(selected,child),domain=p.domain;if(!domain)return false;
 const changed=lastDomain!==selected;if(changed){zoom=1;offset={x:0,y:0};mode='all';query='';lastDomain=selected;}
 const root=E('section','nerve-center focus-center');
 const crumbs=A(E('nav','focus-crumbs'),link('Gesamtnetz','#/arbeit/landkarte'),E('span','','/'),link(domain.label,route(selected)));crumbs.setAttribute('aria-label','Position im Netz');if(p.selected)A(crumbs,E('span','','/'),E('span','',p.selected.title));root.append(crumbs);
 A(root,A(E('div','net-heading'),A(E('div'),E('h1','',domain.label),E('p','net-subtitle',`${p.children.length} Unterpunkte · Stand, offene Arbeit und nächste Schritte`)),link('Quellenstand & Lücken','#/arbeit/abdeckung','net-source-link')));
 if(p.invalid)root.append(E('p','focus-alert','Dieser Unterpunkt ist nicht bekannt. Die vorhandenen Unterpunkte des Bereichs stehen unten zur Auswahl.'));
 const toolbar=E('div','net-toolbar'),filters=E('div','net-filters'),filterButtons=[];
 filters.setAttribute('aria-label','Unterpunkte filtern');for(const[id,title]of [['all','Alle Unterpunkte'],['urgent','Dringend'],['review','Abnahme offen']]){const b=button(title,()=>{mode=id;update();});filterButtons.push([id,b]);filters.append(b);}
 const search=E('input');search.type='search';search.placeholder='Unterpunkt oder offene Arbeit finden …';search.value=query;search.setAttribute('aria-label','Unterpunkte durchsuchen');search.addEventListener('input',()=>{query=search.value;update();});A(toolbar,filters,A(E('label','net-search'),E('span','sr-only','Unterpunkte durchsuchen'),search));root.append(toolbar);
 const layout=E('div','net-layout'),stage=E('div','net-stage focus-stage'),panel=E('aside','net-inspector focus-inspector');panel.setAttribute('aria-label','Arbeitsblatt im Bereich');
 const svg=S('svg',{viewBox:'0 0 1150 900',class:'net-svg focus-svg',role:'group','aria-label':`${domain.label} in der Mitte mit ${p.children.length} Unterpunkten`}),field=S('g',{class:'net-focus-field'});svg.append(field);
 const spokes=[],childElements=[];
 for(const c of p.children){const line=S('path',{d:`M575 450 Q${(575+c.x)/2} ${450} ${c.x} ${c.y}`,class:`focus-spoke state-${c.state}`});field.append(line);spokes.push([c,line]);}
 const core=S('g',{class:'focus-core',transform:'translate(575 450)',role:'button',tabindex:0,'aria-label':`${domain.label}: Mittelpunkt und Bereichsübersicht`});
 core.append(S('circle',{r:108,class:'focus-core-halo'}),S('circle',{r:84,class:'focus-core-body'}),S('circle',{r:94,class:'focus-core-orbit'}),S('image',{href:brandIcon,x:-22,y:-59,width:44,height:44}));
 wrapped(core,domain.label,{y:14,width:18,size:24,step:27,cls:'focus-core-title'});const sub=S('text',{y:112,'text-anchor':'middle',class:'focus-core-caption'});sub.textContent='Bereichsübersicht';core.append(sub);activate(core,()=>{location.hash=route(selected);});field.append(core);
 if(changed&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&typeof core.animate==='function')core.animate([{transform:`translate(${domain.x}px,${domain.y}px)`,opacity:.5},{transform:'translate(575px,450px)',opacity:1}],{duration:360,easing:'cubic-bezier(.2,.7,.2,1)'});
 for(const c of p.children){const g=S('g',{transform:`translate(${c.x} ${c.y})`,class:`focus-child state-${c.state}${p.selected?.id===c.id?' is-selected':''}`,role:'button',tabindex:0,'aria-label':`${c.title}: ${statusLabels[c.state]}`,'aria-pressed':String(p.selected?.id===c.id),'data-child':c.id});
  g.append(S('rect',{x:-150,y:-61,width:300,height:122,rx:12,class:'focus-child-body'}),S('circle',{cx:-126,cy:-39,r:4,class:'focus-status-dot'}));
  const lines=wrapped(g,c.title,{y:-16,width:24,size:24,step:27,cls:'focus-child-title'});const status=S('text',{y:lines>2?57:44,'text-anchor':'middle',class:'focus-child-status'});status.textContent=statusLabels[c.state];g.append(status);activate(g,()=>{location.hash=route(selected,c.id);});field.append(g);childElements.push([c,g]);
 }
 const controls=E('div','net-map-controls'),zoomLabel=E('span','net-zoom');
 function transform(){field.setAttribute('transform',`translate(${575+offset.x} ${450+offset.y}) scale(${zoom}) translate(-575 -450)`);zoomLabel.textContent=Math.round(zoom*100)+'%';}
 const less=button('−',()=>{zoom=clampZoom(zoom-.15);transform();}),more=button('+',()=>{zoom=clampZoom(zoom+.15);transform();});less.setAttribute('aria-label','Netz verkleinern');more.setAttribute('aria-label','Netz vergrößern');
 A(controls,less,zoomLabel,more,button('Einpassen',()=>{zoom=1;offset={x:0,y:0};transform();}));
 const searchStatus=E('p','net-search-status');searchStatus.setAttribute('role','status');const reset=button('Filter zurücksetzen',()=>{mode='all';query='';search.value='';update();},'net-button focus-reset');
 A(stage,svg,controls,E('p','net-map-hint','Unterpunkt öffnen · Freie Fläche ziehen'),searchStatus,reset);A(layout,stage,panel);root.append(layout);
 const alternatives=E('div','focus-alternatives');alternatives.setAttribute('aria-label','Lesbare Unterpunktauswahl');const altElements=[];for(const c of p.children){const a=link('',route(selected,c.id),'focus-alt');A(a,E('strong','',c.title),E('span','',statusLabels[c.state]));if(p.selected?.id===c.id)a.setAttribute('aria-current','page');alternatives.append(a);altElements.push([c,a]);}layout.insertBefore(alternatives,panel);
 const note=E('p','net-evidence-note','Fachinventur23.10.2026 · Konzept-Ergänzung25.10.2026. Prioritäten sind Vorschläge, keine neue Firmenentscheidung. Speichen zeigen Zugehörigkeit. Vor tatsächlicher Arbeit aktuellen Stand prüfen.');root.append(note);container.append(root);
 if(p.selected)showChild(p.selected);else showDomain();
 function showChild(c){
  A(panel,link('Zur Bereichsübersicht',route(selected),'net-link focus-back'),E('p','inspector-kicker','Ausgewählter Unterpunkt'),E('h2','',c.title),E('p',`focus-status state-${c.state}`,statusLabels[c.state]),E('p','focus-priority',`${priorityLabels[c.priority]} · ${c.why}`),E('h3','','Nächster Arbeitsschritt'),E('p','inspector-copy focus-next',c.next),button('Arbeitsschritt vorbereiten',()=>onDraft(domain,{scope:c.title,next:c.next,childWork:prepareChildWork(c)}),'net-action'));
  A(panel,E('h3','','Was bereits dokumentiert ist'),E('p','inspector-copy',c.current),E('h3','','Was noch fehlt'),E('p','inspector-copy',c.gap),E('h3','','Woran wir den Schritt abnehmen'));
  const ul=E('ul','focus-acceptance');c.acceptance.forEach(t=>ul.append(E('li','',t)));A(panel,ul,E('h3','','Verantwortung'),E('p','inspector-copy',c.owner),A(E('details','inspector-evidence'),E('summary','','Quelle & Geltungsbereich'),E('p','inspector-source',c.source),E('p','inspector-copy',`Fachquellenstand: ${c.sourceDate}. Keine aktuelle Vollabnahme oder automatische Statusaktualisierung.`)),link('Vollständige Bereichsakte öffnen',`#/arbeit/akte/${selected}`,'net-link inspector-open'));
 }
 function showDomain(){
  const urgent=p.children.filter(c=>c.priority==='urgent'),review=p.children.filter(c=>c.state==='review');
  A(panel,E('p','inspector-kicker','Bereich im Mittelpunkt'),E('h2','',domain.label),E('p','inspector-copy',domain.goal),E('p','focus-summary',`${p.children.length} Unterpunkte · ${review.length} Abnahmen offen · ${urgent.length===1?'1 gemeldeter Engpass':`${urgent.length} gemeldete Engpässe`}`),E('h3','','Wo wir jetzt dran müssen'));
  if(!urgent.length)panel.append(E('p','inspector-copy','Kein Engpass in dieser Erfassung gemeldet. Die offenen Abnahmen und Klärungen bleiben zu bearbeiten.'));
  const order={urgent:0,next:1,planned:2};[...p.children].sort((a,b)=>order[a.priority]-order[b.priority]).forEach(c=>{const a=link('',route(selected,c.id),'focus-work-choice');A(a,E('small',`priority-${c.priority}`,priorityLabels[c.priority]),E('strong','',c.title),E('span','',c.next));panel.append(a);});
  const relationships=A(E('details','inspector-evidence'),E('summary','','Abhängigkeiten zu anderen Bereichen'));
  for(const edge of edgesFor(selected)){const other=nodes.find(n=>n.id===(edge.from===selected?edge.to:edge.from));A(relationships,A(E('div','focus-relation'),E('strong','',`${edge.from===selected?'Wirkt auf':'Braucht'}: ${edge.scope}`),E('p','inspector-copy',edge.reason),E('p','inspector-source',edge.source),link(other.label,route(other.id))));}panel.append(relationships);
  A(panel,A(E('details','inspector-evidence'),E('summary','','Dokumentierter Bereichsbestand'),E('p','inspector-copy',domain.built)),link('Vollständige Bereichsakte öffnen',`#/arbeit/akte/${selected}`,'net-link inspector-open'));
 }
 function update(){
  const hits=new Set(filterChildren(p.children,query,mode).map(c=>c.id));
  for(const[c,g]of childElements){g.setAttribute('visibility',hits.has(c.id)?'visible':'hidden');g.setAttribute('aria-hidden',String(!hits.has(c.id)));g.setAttribute('tabindex',hits.has(c.id)?'0':'-1');}
  for(const[c,line]of spokes)line.setAttribute('visibility',hits.has(c.id)?'visible':'hidden');
  for(const[c,a]of altElements)a.hidden=!hits.has(c.id);
  filterButtons.forEach(([id,b])=>b.setAttribute('aria-pressed',String(mode===id)));
  searchStatus.textContent=hits.size===0?'Keine passenden Unterpunkte. Filter oder Suche zurücksetzen.':query||mode!=='all'?`${hits.size} von ${p.children.length} Unterpunkten sichtbar`:'';reset.hidden=hits.size!==0;
 }
 let drag=null;svg.addEventListener('pointerdown',e=>{if(e.target.closest('[role="button"]'))return;drag={x:e.clientX,y:e.clientY,base:{...offset}};svg.setPointerCapture(e.pointerId);});svg.addEventListener('pointermove',e=>{if(!drag)return;const r=svg.getBoundingClientRect(),scale=Math.min(r.width/1150,r.height/900);offset={x:drag.base.x+(e.clientX-drag.x)/scale,y:drag.base.y+(e.clientY-drag.y)/scale};transform();});svg.addEventListener('pointerup',()=>{drag=null;});svg.addEventListener('pointercancel',()=>{drag=null;});
 update();transform();
 if(p.selected&&window.matchMedia('(max-width:760px)').matches)requestAnimationFrame(()=>{if(panel.isConnected)panel.scrollIntoView({block:'start',behavior:'instant'});});
 return true;
}
