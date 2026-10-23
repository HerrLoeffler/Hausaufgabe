(() => {
'use strict';
const $=id=>document.getElementById(id);
let resizeTimer=null;
let lastWidth=window.innerWidth;
let lastHeight=window.innerHeight;

function cropOpen(){const d=$('vrCropDialog');return Boolean(d?.open);}
function hint(){
  const head=$('vrCropDialog')?.querySelector('.vrDialogHead>div');
  if(!head||head.querySelector('.vrCropDeviceHint'))return;
  const p=document.createElement('p');
  p.className='vrCropDeviceHint';
  p.textContent='Mit Maus, Finger oder Stift über den gewünschten Bereich ziehen.';
  head.append(p);
}
function fitStage({reset=false}={}){
  const dialog=$('vrCropDialog'),card=dialog?.querySelector('.vrCropCard'),stage=$('vrCropStage'),img=$('vrCropImage');
  if(!dialog?.open||!card||!stage||!img)return;
  const apply=()=>{
    if(!img.naturalWidth||!img.naturalHeight)return;
    const cardStyle=getComputedStyle(card);
    const padX=(parseFloat(cardStyle.paddingLeft)||0)+(parseFloat(cardStyle.paddingRight)||0);
    const availableW=Math.max(220,Math.min(card.clientWidth-padX,window.innerWidth-28));
    const availableH=Math.max(220,Math.min(window.innerHeight*0.62,760));
    const scale=Math.min(1,availableW/img.naturalWidth,availableH/img.naturalHeight);
    const w=Math.max(1,Math.round(img.naturalWidth*scale));
    const h=Math.max(1,Math.round(img.naturalHeight*scale));
    stage.style.width=`${w}px`;
    stage.style.height=`${h}px`;
    stage.style.marginLeft='auto';
    stage.style.marginRight='auto';
    img.style.width='100%';
    img.style.height='100%';
    img.style.maxHeight='none';
    img.style.objectFit='fill';
    if(reset){$('vrCropReset')?.click();const status=$('importStatus');if(status)status.textContent='Ansicht geändert. Bitte den Ausschnitt noch einmal markieren.';}
  };
  if(img.complete&&img.naturalWidth)apply();else img.addEventListener('load',apply,{once:true});
}
function decorate(){hint();fitStage();}
function observeDialog(){
  const observer=new MutationObserver(records=>{
    for(const record of records){
      if(record.type==='childList'&&$('vrCropDialog')){hint();}
      if(record.type==='attributes'&&record.target?.id==='vrCropDialog'&&record.attributeName==='open'&&record.target.open){requestAnimationFrame(()=>requestAnimationFrame(decorate));}
    }
  });
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
}
function bindCropClicks(){
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-crop]'))setTimeout(decorate,0);
  });
}
function bindViewport(){
  const onResize=()=>{
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(()=>{
      if(!cropOpen())return;
      const changed=Math.abs(window.innerWidth-lastWidth)>8||Math.abs(window.innerHeight-lastHeight)>8;
      lastWidth=window.innerWidth;lastHeight=window.innerHeight;
      if(changed)fitStage({reset:true});
    },180);
  };
  window.addEventListener('resize',onResize,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(()=>fitStage({reset:true}),260),{passive:true});
  window.visualViewport?.addEventListener('resize',onResize,{passive:true});
}
function init(){observeDialog();bindCropClicks();bindViewport();setTimeout(()=>{hint();},0);}
init();
})();
