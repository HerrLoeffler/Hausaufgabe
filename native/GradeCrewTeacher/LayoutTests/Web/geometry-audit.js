/* Real browser geometry only: no jsdom coordinates are treated as layout evidence. */
(() => {
 'use strict';
 const epsilon=1.5;
 const rect = element => element.getBoundingClientRect();
 function visible(element){
  if(!element || element.hidden || element.closest('[hidden],.hidden'))return false;
  const style=getComputedStyle(element);
  if(style.display==='none'||style.visibility==='hidden'||style.visibility==='collapse')return false;
  for(let p=element;p;p=p.parentElement){if(p.tagName==='DETAILS'&&!p.open && !p.querySelector(':scope > summary')?.contains(element))return false;}
  const r=rect(element);return r.width>0&&r.height>0;
 }
 function selector(element){
  if(element.id)return '#'+element.id;
  const parts=[];
  for(let p=element;p&&p!==document.body;p=p.parentElement){
   if(p.id){parts.unshift('#'+p.id);break;}
   let s=p.tagName.toLowerCase();
   if(p.classList.length)s+='.'+[...p.classList].slice(0,2).join('.');
   if(p.parentElement)s+=':nth-child('+([...p.parentElement.children].indexOf(p)+1)+')';
   parts.unshift(s);
  }
  return parts.join(' > ');
 }
 function intendedScrollAncestor(element,axis){
  for(let p=element.parentElement;p&&p!==document.body;p=p.parentElement){
   const s=getComputedStyle(p),value=axis==='x'?s.overflowX:s.overflowY;
   if((value==='auto'||value==='scroll')&&(axis==='x'?p.scrollWidth>p.clientWidth+epsilon:p.scrollHeight>p.clientHeight+epsilon))return p;
  }
  return null;
 }
 // A native-docked launcher can sit inside the existing sticky editor header.
 // Content scrolling behind that header is already outside its current paint area.
 // Confirm the opaque sticky layer and actual hit-stack order at each point; this
 // never exempts a floating launcher or a normal-flow overlap outside the header.
 function stickyPaintCover(overlay,target,x,y){
  if(!overlay.hasAttribute('data-gc-native-coco')||getComputedStyle(overlay).position!=='static')return null;
  const hits=document.elementsFromPoint(x,y);
  for(let header=overlay.parentElement;header&&header!==document.body;header=header.parentElement){
   const style=getComputedStyle(header),position=style.position;
   if(position!=='sticky'&&position!=='fixed')continue;
   const bounds=rect(header),inset=parseFloat(style.top);
   if(position==='sticky'&&(!Number.isFinite(inset)||Math.abs(bounds.top-inset)>epsilon))continue;
   if(x<bounds.left||x>bounds.right||y<bounds.top||y>bounds.bottom||header.contains(target))continue;
   const channels=style.backgroundColor.match(/[\d.]+/g)||[],alpha=channels.length>3?Number(channels[3]):channels.length===3?1:0;
   if(alpha*Number(style.opacity||1)<.9)continue;
   const headerIndex=hits.indexOf(header),targetIndex=hits.findIndex(node=>node===target||target.contains(node));
   if(headerIndex>=0&&targetIndex>headerIndex)return {header,background:style.backgroundColor,position,top:bounds.top,inset};
  }
  return null;
 }
 const center=(r)=>(r.left+r.right)/2;
 window.gcLayoutAudit=()=>{
  const issues=[],metrics={viewport:{width:innerWidth,height:innerHeight},document:{width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight},scenario:window.gcLayoutScenario,centers:{},equalGaps:[],questions:[],intendedScroll:[],targets:0,visibleElements:0,selectLabels:[],occludedTargets:[],paintClips:[]};
  const add=(rule,e,detail)=>issues.push({rule,selector:e?selector(e):'window',detail});
  for(const error of window.gcLayoutErrors||[])add('fixture-error',null,error);
  if(document.documentElement.scrollWidth>innerWidth+epsilon)add('horizontal-overflow',document.documentElement,'Document width '+document.documentElement.scrollWidth+' exceeds viewport '+innerWidth);
  const elements=[...document.body.querySelectorAll('*')].filter(visible);metrics.visibleElements=elements.length;
  for(const e of elements){
   if(e.tagName==='OPTION'||e.namespaceURI==='http://www.w3.org/2000/svg')continue;
   const r=rect(e),s=getComputedStyle(e),scroll=intendedScrollAncestor(e,'x');
   if((r.left < -epsilon || r.right > innerWidth+epsilon) && !scroll)add('element-overflow',e,JSON.stringify({left:r.left,right:r.right,viewport:innerWidth}));
   if(scroll&&!metrics.intendedScroll.includes(selector(scroll)))metrics.intendedScroll.push(selector(scroll));
   if(e.tagName==='IMG'&&(!e.complete||e.naturalWidth===0))add('missing-image',e,e.getAttribute('src')||'empty src');
   if(e.matches('#gradecrewLanguageControl select,select.qType')){
    const label=e.selectedOptions[0]?.textContent||'';
    const canvas=document.createElement('canvas'),context=canvas.getContext('2d');context.font=s.font;
    const textWidth=context.measureText(label).width;
    // Native WebKit select arrow consumes at least 16 CSS px beside the text.
    const available=r.width-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-parseFloat(s.borderLeftWidth)-parseFloat(s.borderRightWidth)-16;
    metrics.selectLabels.push({selector:selector(e),label,textWidth,available});
    if(textWidth>available+epsilon)add('selected-text-clipped',e,'Selected label '+JSON.stringify(label)+' needs '+textWidth.toFixed(1)+' pt; available '+available.toFixed(1));
   }
   // Inputs deliberately scroll long authored values. Static UI text must remain readable.
   if(!e.matches('input,textarea,select') && e.childNodes.length && [...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())){
    if((s.overflowX==='hidden'||s.overflowX==='clip'||s.textOverflow==='ellipsis')&&e.scrollWidth>e.clientWidth+epsilon)add('text-clipped',e,'Static text scrollWidth '+e.scrollWidth+' > clientWidth '+e.clientWidth);
    if((s.overflowY==='hidden'||s.overflowY==='clip')&&e.scrollHeight>e.clientHeight+epsilon)add('text-clipped',e,'Static text scrollHeight '+e.scrollHeight+' > clientHeight '+e.clientHeight);
    for(let p=e.parentElement;p&&p!==document.body;p=p.parentElement){
     const ps=getComputedStyle(p);if(ps.overflowX!=='hidden'&&ps.overflowX!=='clip'&&ps.overflowY!=='hidden'&&ps.overflowY!=='clip')continue;
     const pr=rect(p),range=document.createRange();range.selectNodeContents(e);
     for(const tr of range.getClientRects()){
      if((['hidden','clip'].includes(ps.overflowX)&&(tr.left<pr.left-epsilon||tr.right>pr.right+epsilon))||(['hidden','clip'].includes(ps.overflowY)&&(tr.top<pr.top-epsilon||tr.bottom>pr.bottom+epsilon))){add('text-clipped',e,'Text extends beyond clipping ancestor '+selector(p));break;}
     }
    }
   }
  }
  // A radio/checkbox is activated by every associated real label. Hidden native
  // controls behind custom switches still require a visible label hit region.
  const targetSet=new Set(elements.filter(e=>e.matches('button,select,summary,input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=hidden]),textarea')));
  for(const input of document.querySelectorAll('input[type=checkbox],input[type=radio]')){
   const labels=[...input.labels||[]].filter(visible);
   if(labels.length)for(const label of labels)targetSet.add(label);
   else if(visible(input))targetSet.add(input);
  }
  const targets=[...targetSet];
  for(const e of targets){const r=rect(e);metrics.targets++;if(r.width<44-.01||r.height<44-.01)add('touch-target',e,'Target '+r.width.toFixed(2)+'×'+r.height.toFixed(2)+' pt; minimum 44×44');}
  // The shared floating assistant is painted above the page. Report actual hit-test
  // occlusion of controls, not merely bounding-box intersections at rounded corners.
  const overlays=[...document.querySelectorAll('#gcCrewLauncher,#gcCrewPanel')].filter(visible);
  for(const e of targets)for(const overlay of overlays){
   if(overlay===e||overlay.contains(e)||e.contains(overlay))continue;
   const a=rect(e),b=rect(overlay),left=Math.max(a.left,b.left,0),right=Math.min(a.right,b.right,innerWidth),top=Math.max(a.top,b.top,0),bottom=Math.min(a.bottom,b.bottom,innerHeight);
   if(right-left<=epsilon||bottom-top<=epsilon)continue;
   const points=[[.5,.5],[.25,.25],[.75,.25],[.25,.75],[.75,.75]];
   let occluded=false;const clippedBy=new Map();
   for(const [dx,dy] of points){
    const x=left+(right-left)*dx,y=top+(bottom-top)*dy;
    if(!overlay.contains(document.elementFromPoint(x,y)))continue;
    const clip=stickyPaintCover(overlay,e,x,y);
    if(clip){clippedBy.set(clip.header,clip);continue;}
    occluded=true;
   }
   for(const clip of clippedBy.values())metrics.paintClips.push({selector:selector(e),by:selector(clip.header),background:clip.background,position:clip.position,top:clip.top,inset:clip.inset,reason:'Control pixels already behind the active sticky header in the actual hit stack'});
   if(occluded){
    const entry={selector:selector(e),covering:selector(overlay),left,right,top,bottom};metrics.occludedTargets.push(entry);
    add('control-occluded',e,'Covered by '+selector(overlay)+' over '+(right-left).toFixed(1)+'×'+(bottom-top).toFixed(1)+' pt');
   }
  }
  for(const group of document.querySelectorAll('#userBar,.questionGrid,.questionTop,.dashboardOverview,.editorHeadActions,.gradeScaleTop,.numberEditorGrid')){
   if(!visible(group))continue;
   const children=[...group.children].filter(visible);
   for(let i=0;i<children.length;i++)for(let j=i+1;j<children.length;j++){
    const a=rect(children[i]),b=rect(children[j]);
    if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>epsilon&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>epsilon)add('control-overlap',children[j],'Overlaps sibling '+selector(children[i]));
   }
  }
  const dashboard=document.getElementById('dashboardView');
  if(visible(dashboard)){
   const dr=rect(dashboard);
   for(const e of dashboard.querySelectorAll(':scope > .gcWorkspaceCrewEntry,#gradecrewTourBtn,#newQuizBtn')){
    if(!visible(e))continue;const r=rect(e),delta=center(r)-center(dr);metrics.centers[selector(e)]={center:center(r),container:center(dr),delta};
    if(Math.abs(delta)>2)add('not-centered',e,'Center differs from workspace by '+delta.toFixed(2)+' pt');
   }
   const row=dashboard.querySelector('.dashboardOverview');
   const buttons=[...row?.children||[]].filter(visible);const rows=[];
   for(const e of buttons){const r=rect(e);let group=rows.find(g=>Math.abs(g[0].top-r.top)<epsilon);if(!group)rows.push(group=[]);group.push(r);}
   for(const group of rows){group.sort((a,b)=>a.left-b.left);const gaps=group.slice(1).map((r,i)=>r.left-group[i].right);metrics.equalGaps.push(gaps);if(gaps.length>1&&Math.max(...gaps)-Math.min(...gaps)>2)add('unequal-gaps',row,'Metric gaps '+gaps.map(n=>n.toFixed(1)).join(', '));}
  }
  for(const card of document.querySelectorAll('#questionList .questionCard')){
   if(!visible(card))continue;
   const grid=card.querySelector(':scope > .questionGrid'),answer=card.querySelector(':scope > .answerEditor'),media=card.querySelector(':scope > .gcNativeQuestionMedia');
   if(!grid||!answer||!media){add('question-structure',card,'Expected question, answers and media sections');continue;}
   const g=rect(grid),a=rect(answer),m=rect(media);metrics.questions.push({id:card.dataset.id,questionBottom:g.bottom,answerTop:a.top,answerBottom:a.bottom,mediaTop:m.top});
   if(a.top<g.bottom-epsilon||m.top<a.bottom-epsilon)add('question-order',card,'Required order is question → answers → optional media');
  }
  return {issues,metrics};
 };
 // Destructive probes are limited to temporary fixture nodes/inline styles and restore immediately.
 window.gcLayoutAuditSelfTest=()=>{
  const describe=element=>{
   const r=rect(element),style=getComputedStyle(element);
   return {selector:selector(element),rect:{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height},hidden:element.hidden,connected:element.isConnected,parent:element.parentElement?selector(element.parentElement):null,position:style.position,display:style.display,visibility:style.visibility,opacity:style.opacity,zIndex:style.zIndex,transform:style.transform,pointerEvents:style.pointerEvents,overflowX:style.overflowX,overflowY:style.overflowY};
  };
  const hit=(x,y)=>({x,y,top:document.elementFromPoint(x,y)?selector(document.elementFromPoint(x,y)):null,stack:document.elementsFromPoint(x,y).slice(0,8).map(selector)});
  const checks=[];const probe=document.createElement('div');probe.id='gcAuditOverflowProbe';probe.style.cssText='position:absolute;left:0;top:0;width:calc(100vw + 80px);height:12px';probe.textContent='Auditor overflow proof';document.body.append(probe);
  checks.push({rule:'horizontal-overflow',passed:window.gcLayoutAudit().issues.some(x=>x.rule==='horizontal-overflow'||(x.rule==='element-overflow'&&x.selector==='#gcAuditOverflowProbe'))});probe.remove();
  const button=document.querySelector('#newQuizBtn');const view=document.getElementById('dashboardView');
  if(button&&view){
   const oldStyle=button.getAttribute('style'),oldClass=view.className;view.classList.remove('hidden');
   // Deployed .button transitions all properties for .15s. Disable the transition
   // before measuring the temporary offset, then restore without a reverse animation.
   button.style.setProperty('transition','none','important');
   void button.offsetWidth;
   button.style.setProperty('transform','translateX(31px)','important');
   const measured=window.gcLayoutAudit();
   checks.push({rule:'not-centered',passed:measured.issues.some(x=>x.rule==='not-centered'&&x.selector==='#newQuizBtn'),observed:measured.metrics.centers['#newQuizBtn']});
   if(oldStyle===null)button.removeAttribute('style');else button.setAttribute('style',oldStyle);
   button.style.setProperty('transition','none','important');void button.offsetWidth;
   if(oldStyle===null)button.removeAttribute('style');else button.setAttribute('style',oldStyle);
   view.className=oldClass;
  }
  const tinyLabel=document.createElement('label');tinyLabel.id='gcAuditTinyChoiceLabel';
  tinyLabel.style.cssText='position:absolute!important;left:12px!important;top:12px!important;display:block!important;width:12px!important;height:12px!important;min-width:0!important;min-height:0!important;padding:0!important;margin:0!important;border:0!important;';
  const tinyInput=document.createElement('input');tinyInput.type='checkbox';tinyInput.id='gcAuditTinyChoiceInput';tinyInput.style.cssText='width:12px!important;height:12px!important;min-width:0!important;min-height:0!important;margin:0!important;';tinyLabel.append(tinyInput);document.body.append(tinyLabel);
  checks.push({rule:'touch-target-choice-label',passed:window.gcLayoutAudit().issues.some(x=>x.rule==='touch-target'&&x.selector==='#gcAuditTinyChoiceLabel')});tinyLabel.remove();
  const coco=document.getElementById('gcCrewLauncher');
  const toggleTarget=document.querySelector('#dashboardView .dashboardPublishControl');
  if(coco&&toggleTarget&&view){
   const oldStyle=coco.getAttribute('style'),oldClass=view.className,oldHidden=coco.hidden,oldParent=coco.parentNode,oldNext=coco.nextSibling;view.classList.remove('hidden');coco.hidden=false;
   const savedScroll=window.scrollY;
   // Establish fixed positioning BEFORE measuring/scrolling. Otherwise a static
   // body portal adds44pt to document height; removing it after scrollIntoView can
   // clamp a short dashboard's bottom scroll and move the target by exactly44pt.
   coco.style.setProperty('transition','none','important');coco.style.setProperty('position','fixed','important');coco.style.setProperty('z-index','2147483646','important');
   coco.style.setProperty('left','0px','important');coco.style.setProperty('top','0px','important');coco.style.setProperty('right','auto','important');coco.style.setProperty('bottom','auto','important');
   // Backdrop-filter on the sticky heading establishes a fixed-position containing
   // block. Move the ORIGINAL launcher to body for an unambiguous viewport probe.
   document.body.append(coco);void coco.offsetWidth;
   // Put an actual existing target in view, then cover it with the actual launcher.
   toggleTarget.scrollIntoView({block:'center',behavior:'instant'});const targetInView=rect(toggleTarget);
   const targetBeforeOverlay=describe(toggleTarget);
   const targetHitBeforeOverlay=hit((targetInView.left+targetInView.right)/2,(targetInView.top+targetInView.bottom)/2);
   const beforeHit=document.elementFromPoint((targetInView.left+targetInView.right)/2,(targetInView.top+targetInView.bottom)/2);
   const targetUnobstructed=beforeHit===toggleTarget||toggleTarget.contains(beforeHit);
   coco.style.setProperty('left',targetInView.left+'px','important');coco.style.setProperty('top',targetInView.top+'px','important');
   const targetAtAudit=describe(toggleTarget),cocoAtAudit=describe(coco);
   const cr=cocoAtAudit.rect;
   const points=[[.5,.5],[.25,.25],[.75,.25],[.25,.75],[.75,.75]].map(([dx,dy])=>hit(cr.left+cr.width*dx,cr.top+cr.height*dy));
   const measured=window.gcLayoutAudit();
   const targetStable=Math.abs(targetAtAudit.rect.top-targetBeforeOverlay.rect.top)<epsilon&&Math.abs(targetAtAudit.rect.left-targetBeforeOverlay.rect.left)<epsilon;
   checks.push({rule:'control-occluded',passed:targetUnobstructed&&targetStable&&measured.issues.some(x=>x.rule==='control-occluded'&&x.selector===selector(toggleTarget)),observed:measured.metrics.occludedTargets,diagnostic:{viewport:{width:innerWidth,height:innerHeight,scrollX,scrollY,visualViewport:window.visualViewport?{width:visualViewport.width,height:visualViewport.height,offsetLeft:visualViewport.offsetLeft,offsetTop:visualViewport.offsetTop,pageLeft:visualViewport.pageLeft,pageTop:visualViewport.pageTop,scale:visualViewport.scale}:null},targetUnobstructed,targetStable,targetBeforeOverlay,targetHitBeforeOverlay,targetAtAudit,cocoAtAudit,points,targetAfterAudit:describe(toggleTarget),cocoAfterAudit:describe(coco)}});
   if(oldStyle===null)coco.removeAttribute('style');else coco.setAttribute('style',oldStyle);
   oldParent.insertBefore(coco,oldNext?.parentNode===oldParent?oldNext:null);coco.hidden=oldHidden;view.className=oldClass;window.scrollTo({top:savedScroll,behavior:'instant'});
  }
  return {passed:checks.length===4&&checks.every(x=>x.passed),checks};
 };
})();
