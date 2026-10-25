import {nodes,connections,edgesFor,clampZoom,matchNodes} from './network.mjs';
import {mountFocus,leaveFocus} from './focus-view.mjs';
const NS='http://www.w3.org/2000/svg';
const E=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const A=(p,...children)=>{p.append(...children.filter(Boolean));return p;};
const S=(tag,attrs={})=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,String(v));return n;};
const names={blocker:'Gemeldeter Engpass',requires:'Voraussetzung offen',flow:'Liefert an',relation:'Abstimmung'};
const colors={blocker:'#ff7a91',requires:'#f6c56b',flow:'#52dcec',relation:'#a98aff'};
const byId=id=>nodes.find(n=>n.id===id);
let zoom=1,offset={x:0,y:0},mode='all',query='';
function button(text,fn,cls='net-button'){const n=E('button',cls,text);n.type='button';n.addEventListener('click',fn);return n;}
function link(text,href,cls='net-link'){const n=E('a',cls,text);n.href=href;return n;}
function activate(n,fn){n.addEventListener('click',fn);n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn();}});}
export function mountNetwork(container,{selected='',child='',onDraft,brandIcon}){
 if(selected&&mountFocus(container,{selected,child,onDraft,brandIcon}))return;
 if(leaveFocus()){zoom=1;offset={x:0,y:0};mode='all';query='';}
 if(selected){container.append(E('p','focus-alert','Dieser Bereich ist nicht bekannt. Das Gesamtnetz steht zur Auswahl.'));selected='';}
 const selectedNode=byId(selected),root=E('section','nerve-center');
 const intro=A(E('div','net-heading'),A(E('div'),E('h1','','Unternehmensnetz'),E('p','net-subtitle','Bereich öffnen. Engpass erkennen. Weiterarbeiten.')),link('Stand & Quellen','#/arbeit/abdeckung','net-source-link'));
 root.append(intro);
 const toolbar=E('div','net-toolbar'),filters=E('div','net-filters');filters.setAttribute('aria-label','Netz filtern');
 const filterButtons=[];
 for(const [id,name]of [['all','Gesamtbild'],['blocker','Engpässe'],['requires','Voraussetzungen']]){const b=button(name,()=>{mode=id;update();});b.setAttribute('aria-pressed',String(mode===id));filterButtons.push([id,b]);filters.append(b);}
 const searchLabel=E('label','net-search'),search=E('input');search.type='search';search.placeholder='Bereich oder Thema finden …';search.setAttribute('aria-label','Im Netz suchen');search.value=query;search.addEventListener('input',()=>{query=search.value;update();});
 A(searchLabel,E('span','sr-only','Im Netz suchen'),search);A(toolbar,filters,searchLabel);root.append(toolbar);const jump=E('select','net-mobile-select');jump.setAttribute('aria-label','Bereich im Netz auswählen');const placeholder=E('option','','Bereich im Netz auswählen');placeholder.value='';jump.append(placeholder);nodes.forEach(n=>{const option=E('option','',n.label);option.value=n.id;option.selected=n.id===selected;jump.append(option);});jump.addEventListener('change',()=>{if(jump.value){offset={x:0,y:0};zoom=1;location.hash=`/arbeit/landkarte/${jump.value}`;}});root.append(jump);
 const layout=E('div','net-layout'),stage=E('div','net-stage'),panel=E('aside','net-inspector');panel.setAttribute('aria-label','Auswahl im Unternehmensnetz');
 const svg=S('svg',{viewBox:'0 0 1150 900',class:'net-svg','aria-label':'GradeCrew Unternehmensnetz mit gerichteten Verbindungen'});svg.setAttribute('role','group');
 const defs=S('defs'),glow=S('filter',{id:'net-glow',x:'-100%',y:'-100%',width:'300%',height:'300%'});glow.append(S('feGaussianBlur',{stdDeviation:'5'}));defs.append(glow);
 for(const [kind,color]of Object.entries(colors)){const marker=S('marker',{id:'arrow-'+kind,viewBox:'0 0 10 10',refX:'9',refY:'5',markerWidth:'6',markerHeight:'6',orient:'auto-start-reverse'});marker.append(S('path',{d:'M0 1 L9 5 L0 9 Z',fill:color}));defs.append(marker);}
 const gradient=S('radialGradient',{id:'core-light'});gradient.append(S('stop',{offset:'0%', 'stop-color':'#20506b'}),S('stop',{offset:'100%','stop-color':'#101b39'}));defs.append(gradient);svg.append(defs);
 const field=S('g',{class:'net-field'});svg.append(field);
 // Quiet organic branches are generated from actual relation geometry. Only
 // represented, inspectable connections are drawn; no fake live traffic.
 const edgeElements=[],edgeLabels=[];
 for(let i=0;i<connections.length;i++){
   const edge=connections[i],from=byId(edge.from),to=byId(edge.to),dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy),unit={x:dx/length,y:dy/length};
   const start={x:from.x+unit.x*35,y:from.y+unit.y*35},end={x:to.x-unit.x*36,y:to.y-unit.y*36};
   const bend=(i%2?1:-1)*(35+(i%4)*15),mid={x:(start.x+end.x)/2-unit.y*bend,y:(start.y+end.y)/2+unit.x*bend};
   const d=`M${start.x} ${start.y} Q${mid.x} ${mid.y} ${end.x} ${end.y}`;
   const g=S('g',{class:'net-edge edge-'+edge.kind,'data-edge':edge.id,role:'button',tabindex:'0','aria-label':`${from.label} → ${to.label}: ${edge.scope}. ${names[edge.kind]}`});
   const aura=S('path',{d,class:'edge-aura',stroke:colors[edge.kind]});
   for(const spread of [-12,12]){g.append(S('path',{d:`M${start.x} ${start.y} Q${mid.x-unit.y*spread} ${mid.y+unit.x*spread} ${end.x} ${end.y}`,class:'edge-fiber',stroke:colors[edge.kind]}));}
   const path=S('path',{d,class:'edge-line',stroke:colors[edge.kind],'marker-end':'url(#arrow-'+edge.kind+')'});
   const hit=S('path',{d,class:'edge-hit'});
   g.append(aura,path,hit);activate(g,()=>showEdge(edge));field.append(g);edgeElements.push([edge,g]);
   const point={x:.25*start.x+.5*mid.x+.25*end.x,y:.25*start.y+.5*mid.y+.25*end.y};
   const tag=S('g',{class:'net-edge-tag',transform:`translate(${point.x} ${point.y})`,role:'button',tabindex:'-1','aria-label':`Verbindung öffnen: ${edge.scope}`});
   const width=Math.min(320,edge.scope.length*9+30);tag.append(S('rect',{x:-width/2,y:-18,width,height:36,rx:7}));const title=S('text',{'text-anchor':'middle',y:6});title.textContent=edge.scope;tag.append(title);activate(tag,()=>showEdge(edge));edgeLabels.push([edge,tag]);
 }
 edgeLabels.forEach(([,tag])=>field.append(tag));
 const nodeElements=[];
 for(const n of nodes){
   const g=S('g',{transform:`translate(${n.x} ${n.y})`,class:`net-node ${n.id==='central'?'node-core':''} ${n.blocker?'node-issue':''}`,role:'button',tabindex:'0','aria-label':`${n.label}: ${n.status}`,'aria-pressed':String(n.id===selected)});
   g.append(S('circle',{r:n.id==='central'?73:34,class:'node-halo'}),S('circle',{r:n.id==='central'?54:17,class:'node-body'}),S('circle',{r:n.id==='central'?63:25,class:'node-orbit'}));
   if(n.id==='central'){g.append(S('image',{href:brandIcon,x:'-36',y:'-36',width:'72',height:'72'}));}
   else{const dot=S('circle',{r:4,class:'node-seed'});g.append(dot);}
   const text=S('text',{x:0,y:n.id==='central'?106:61,class:'node-title','text-anchor':'middle'});text.textContent=n.label;g.append(text);
   const status=S('text',{x:0,y:n.id==='central'?130:84,class:'node-state','text-anchor':'middle'});status.textContent=n.status;g.append(status);
   activate(g,()=>{location.hash=`/arbeit/landkarte/${n.id}`;});field.append(g);nodeElements.push([n,g]);
 }
 const controls=E('div','net-map-controls'),zoomLabel=E('span','net-zoom','100%');
 const transform=()=>{field.setAttribute('transform',`translate(${575+offset.x} ${450+offset.y}) scale(${zoom}) translate(-575 -450)`);zoomLabel.textContent=Math.round(zoom*100)+'%';};
 A(controls,button('−',()=>{zoom=clampZoom(zoom-.15);transform();}),zoomLabel,button('+',()=>{zoom=clampZoom(zoom+.15);transform();}),button('Einpassen',()=>{zoom=1;offset={x:0,y:0};transform();}));
 controls.children[0].setAttribute('aria-label','Netz verkleinern');controls.children[2].setAttribute('aria-label','Netz vergrößern');
 const hint=E('p','net-map-hint','Knoten und Linien anklicken · Freie Fläche ziehen');
 const searchStatus=E('p','net-search-status');searchStatus.setAttribute('role','status');
 A(stage,svg,controls,hint,searchStatus);A(layout,stage,panel);root.append(layout);
 const legend=E('div','net-legend');for(const[kind,name]of Object.entries(names)){const item=E('span','legend-'+kind);A(item,E('i'),document.createTextNode(name));legend.append(item);}root.append(legend);
 root.append(E('p','net-evidence-note','Redaktioneller Quellenstand: 23.–25.10.2026 · Keine Live-Messung.'));
 container.append(root);
 let selectedEdge=null,drag=null;
 function showNode(n){
   selectedEdge=null;
   panel.replaceChildren();
   if(!n){
     A(panel,E('h2','','Wo es gerade hängt'),E('p','inspector-copy','3 gemeldete Engpässe · Bereich öffnen'));
     for(const item of nodes.filter(n=>n.blocker)){const b=button('',()=>{location.hash=`/arbeit/landkarte/${item.id}`;},'net-blocker-choice');A(b,E('span','issue-dot'),A(E('span'),E('strong','',item.label),E('small','',item.blocker.title)));panel.append(b);}
     panel.append(E('p','inspector-foot','11 Bereiche · Verbindungen anklicken für Abhängigkeiten.'));return;
   }
   A(panel,E('p','inspector-kicker','Ausgewählter Bereich'),E('h2','',n.label),E('p',n.blocker?'inspector-status issue':'inspector-status',n.status));
   if(n.blocker){A(panel,E('h3','','Hier hakt es'),E('p','inspector-copy',n.blocker.problem),E('h3','','Das muss erledigt werden'),E('p','inspector-copy',n.blocker.next),E('p','inspector-source',n.blocker.source));}
   else A(panel,E('p','inspector-copy',n.goal),E('h3','','Nächster Schritt'),E('p','inspector-copy',n.next[0]));
   A(panel,E('h3','','Was davon abhängt'));
   const outgoing=edgesFor(n.id).filter(e=>e.from===n.id);
   if(!outgoing.length)panel.append(E('p','inspector-copy','Noch keine gerichtete Folgewirkung belegt.'));
   outgoing.forEach(e=>panel.append(edgeButton(e)));
   A(panel,E('h3','','Was dieser Bereich braucht'));edgesFor(n.id).filter(e=>e.to===n.id).forEach(e=>panel.append(edgeButton(e)));
   A(panel,E('h3','','Verantwortung'),E('p','inspector-copy',n.owner),button('Nächsten Schritt vorbereiten',()=>onDraft(n),'net-action'),link('Vollständige Themenakte öffnen',`#/arbeit/akte/${n.id}`,'net-link inspector-open'));
 }
 function edgeButton(edge){return button(`${names[edge.kind]} · ${byId(edge.from).label} → ${byId(edge.to).label}: ${edge.scope}`,()=>showEdge(edge),'inspector-edge edge-label-'+edge.kind);}
 function showEdge(edge){
   selectedEdge=edge;panel.replaceChildren();
   const origin=byId(edge.from),target=byId(edge.to),next=origin.blocker?.next||target.blocker?.next||target.next[0];
   A(panel,E('p','inspector-kicker',names[edge.kind]),E('h2','',edge.scope),E('p','inspector-route',`${origin.label} → ${target.label}`),E('h3','','Was jetzt zu tun ist'),E('p','inspector-copy',next),E('h3','','Verantwortung im bestehenden Auftrag'),E('p','inspector-copy',edge.kind==='requires'?target.owner:origin.owner),button('Arbeitsschritt vorbereiten',()=>onDraft(origin,{...edge,next}),'net-action'),link('Betroffenen Bereich auswählen',`#/arbeit/landkarte/${edge.to}`,'net-link inspector-open'));
   const evidence=A(E('details','inspector-evidence'),E('summary','','Zusammenhang & Quelle'),E('p','inspector-copy',edge.reason),E('p','inspector-source',edge.source),E('p','inspector-copy',edge.kind==='blocker'?'Gemeldeter Engpass im benannten Teilumfang. Keine pauschale Blockade des ganzen Zielbereichs.':'Redaktionell zusammengeführte Beziehung. Keine aktuell gemessene Betriebsblockade.'));panel.append(evidence);
   update();
 }

 function update(){
   const matches=new Set(matchNodes(query).map(n=>n.id)),visibleEdges=connections.filter(e=>mode==='all'||mode==='blocker'&&e.kind==='blocker'||mode==='requires'&&['requires','blocker'].includes(e.kind));
   const activeEdges=new Set(visibleEdges.map(e=>e.id));
   for(const[e,g]of edgeElements){const connected=!selected||e.from===selected||e.to===selected;const match=!query||matches.has(e.from)||matches.has(e.to);g.classList.toggle('is-dim',!activeEdges.has(e.id)||!match||!!selected&&!connected);g.classList.toggle('is-selected',selectedEdge?.id===e.id);g.setAttribute('tabindex',activeEdges.has(e.id)&&match?'0':'-1');}
   for(const[n,g]of nodeElements){const relevant=mode==='all'||visibleEdges.some(e=>e.from===n.id||e.to===n.id);g.classList.toggle('is-dim',!matches.has(n.id)||!relevant);g.classList.toggle('is-selected',n.id===selected);g.setAttribute('aria-pressed',String(n.id===selected));}
   edgeLabels.forEach(([e,tag])=>{const visible=activeEdges.has(e.id)&&(selectedEdge?.id===e.id||selected&&(e.from===selected||e.to===selected));tag.setAttribute('visibility',visible?'visible':'hidden');tag.setAttribute('tabindex',visible?'0':'-1');tag.setAttribute('aria-hidden',String(!visible));});
   filterButtons.forEach(([id,b])=>b.setAttribute('aria-pressed',String(mode===id)));
   searchStatus.textContent=query?(matches.size?matches.size===1?'1 passender Bereich hervorgehoben':`${matches.size} passende Bereiche hervorgehoben`:'Kein passender Bereich. Suchbegriff ändern.'):'';
 }
 svg.addEventListener('pointerdown',event=>{if(event.target.closest('[role="button"]'))return;drag={x:event.clientX,y:event.clientY,base:{...offset}};svg.setPointerCapture(event.pointerId);});
 svg.addEventListener('pointermove',event=>{if(!drag)return;const rect=svg.getBoundingClientRect(),scale=Math.min(rect.width/1150,rect.height/900);offset={x:drag.base.x+(event.clientX-drag.x)/scale,y:drag.base.y+(event.clientY-drag.y)/scale};transform();});
 svg.addEventListener('pointerup',()=>{drag=null;});svg.addEventListener('pointercancel',()=>{drag=null;});
 showNode(selectedNode);update();transform();
}
