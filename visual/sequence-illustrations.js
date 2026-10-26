/* Fixed, locally authored illustrations. No AI markup or external media.
 * butterflyArt is reused from homepage/illustrations.js. */
(function(){'use strict';
const wrap=(body,viewBox,name,extra='')=>`<svg class="${extra}" viewBox="${viewBox}" role="img" aria-label="${name}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
function butterflyArt(scene) {
  const bg='<rect width="170" height="112" rx="13" fill="#f4f8f2"/><path d="M0 90 Q43 80 85 89 T170 87 V112 H0" fill="#e8f2e6"/>';
  const leaf='<path d="M22 74 Q65 29 124 59 Q78 91 22 74Z" fill="#91bf89" stroke="#4c8965" stroke-width="2"/><path d="M25 74 Q72 66 118 60" fill="none" stroke="#4c8965" stroke-width="2"/>';
  let art='';
  if(scene==='egg') art=`${leaf}<g fill="#f9f1d4" stroke="#b9a980" stroke-width="1.3"><ellipse cx="64" cy="61" rx="7" ry="9"/><ellipse cx="78" cy="57" rx="7" ry="9"/><ellipse cx="93" cy="57" rx="7" ry="9"/></g>`;
  if(scene==='caterpillar') art=`${leaf}<path d="M46 58 Q69 31 113 51" fill="none" stroke="#426f4b" stroke-width="18" stroke-linecap="round" stroke-dasharray="8 2"/><circle cx="113" cy="51" r="11" fill="#6ca56b" stroke="#426f4b" stroke-width="2"/><circle cx="117" cy="47" r="2" fill="#223c32"/><path d="M111 41 L108 34 M119 41 L124 35" stroke="#426f4b" stroke-width="2"/>`;
  if(scene==='chrysalis') art='<path d="M25 26 Q85 36 145 20" fill="none" stroke="#7a624d" stroke-width="8" stroke-linecap="round"/><path d="M88 31 V48" stroke="#7a624d" stroke-width="2"/><path d="M87 44 C59 46 65 87 86 95 C108 88 111 54 87 44Z" fill="#80ad79" stroke="#4b7b5c" stroke-width="2"/><path d="M80 49 Q88 61 76 80 M96 49 Q87 65 97 82" fill="none" stroke="#d3e4a2" stroke-width="3"/>';
  if(scene==='butterfly') art='<path d="M83 61 Q52 10 31 37 Q28 56 70 66 Q27 63 39 88 Q55 107 82 72 M87 61 Q118 10 139 37 Q142 56 100 66 Q143 63 131 88 Q115 107 88 72" fill="#eaa56d" stroke="#8e5b52" stroke-width="2"/><path d="M83 65 Q53 29 47 47 Q55 60 79 67 M87 65 Q117 29 123 47 Q115 60 91 67" fill="#f8dcb0"/><path d="M85 51 V80" stroke="#51494f" stroke-width="6" stroke-linecap="round"/><path d="M83 53 Q72 39 69 37 M87 53 Q98 39 101 37" fill="none" stroke="#51494f" stroke-width="2"/><circle cx="85" cy="50" r="4" fill="#51494f"/><path d="M42 103 Q68 94 89 101 T146 98" fill="none" stroke="#80a77d" stroke-width="3"/>';
  return wrap(bg+art,'0 0 170 112',`Butterfly life cycle: ${scene}`,'butterfly-art');
}

function waterArt(id){
 const base='<rect width="170" height="112" rx="13" fill="#edf6fc"/><path d="M0 91Q36 81 72 91T170 90V112H0Z" fill="#80b7d4"/>';
 const cloud='<path d="M43 49C23 49 27 24 45 27C51 8 80 12 85 28C103 20 120 36 108 49Z" fill="#fff" stroke="#9ab5c9" stroke-width="2"/>';
 const arrow=(x,y)=>`<path d="M${x} ${y+25}V${y}m-5 6 5-6 5 6" fill="none" stroke="#cc8b42" stroke-width="3" stroke-linecap="round"/>`;
 const art={evaporation:'<circle cx="130" cy="28" r="17" fill="#f1c765"/>'+arrow(47,46)+arrow(80,38)+arrow(110,53),condensation:cloud+'<g fill="#7db0cc"><circle cx="62" cy="34" r="4"/><circle cx="74" cy="38" r="4"/><circle cx="87" cy="34" r="4"/></g>',precipitation:cloud+'<path d="m45 62-6 12m30-12-6 12m30-12-6 12m30-12-6 12" stroke="#4d93bd" stroke-width="4" stroke-linecap="round"/>',collection:'<path d="M15 85 59 27 104 83" fill="#a7bca2"/><path d="m44 47 15-20 17 22-15-7Z" fill="#fff"/><path d="M66 59Q113 57 103 78T153 91" fill="none" stroke="#5d9ec3" stroke-width="6"/><path d="M35 100Q58 95 81 100T130 100" fill="none" stroke="#e7f7ff" stroke-width="2"/>'};
 return wrap(base+(art[id]||''),'0 0 170 112',{evaporation:'Wasser verdunstet',condensation:'Wolkenbildung',precipitation:'Niederschlag',collection:'Wasser sammelt sich'}[id]||'Wasserkreislauf');
}
function growthArt(id){
 const base='<rect width="170" height="112" rx="13" fill="#f3f7ec"/><path d="M0 77Q85 70 170 77V112H0Z" fill="#d6c1a0"/><path d="M0 77Q85 70 170 77" fill="none" stroke="#b29a77" stroke-width="2"/>';
 const seed='<ellipse cx="84" cy="84" rx="9" ry="6" fill="#997251" transform="rotate(-25 84 84)"/>';
 const stem='<path d="M85 80V41" stroke="#4a8858" stroke-width="4" fill="none"/><path d="M84 58Q53 34 48 56Q63 70 84 61M86 49Q112 29 122 44Q113 60 86 54" fill="#80af6b" stroke="#51885d" stroke-width="1.5"/>';
 const roots='<path d="M85 80 80 104m4-15-13 9m13-5 15 10" stroke="#a27d54" stroke-width="2" fill="none"/>';
 const flower='<g fill="#df8b9b" stroke="#bd6c81"><ellipse cx="85" cy="22" rx="8" ry="12"/><ellipse cx="97" cy="31" rx="12" ry="8"/><ellipse cx="91" cy="43" rx="8" ry="11"/><ellipse cx="77" cy="41" rx="8" ry="11"/><ellipse cx="73" cy="29" rx="11" ry="8"/></g><circle cx="85" cy="32" r="7" fill="#efc265"/>';
 const art={seed,germination:seed+'<path d="M85 84Q100 61 87 56M82 85 77 103" fill="none" stroke="#67975d" stroke-width="3"/><path d="M87 57Q69 46 70 58Q80 68 87 57" fill="#8db678"/>',seedling:stem+roots,flowering:stem+roots+flower};
 return wrap(base+(art[id]||''),'0 0 170 112',{seed:'Samen in der Erde',germination:'Keimung',seedling:'Jungpflanze',flowering:'Blühende Pflanze'}[id]||'Pflanzenwachstum');
}
window.GCSequenceArt={render:(family,id)=>family==='butterfly'?butterflyArt(id):family==='water-cycle'?waterArt(id):family==='plant-growth'?growthArt(id):''};
})();
