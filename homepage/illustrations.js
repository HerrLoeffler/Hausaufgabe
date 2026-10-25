// Crisp, self-contained illustrations for the local interactive showcase.
const wrap = (body, viewBox, name, extra='') => `<svg class="${extra}" viewBox="${viewBox}" role="img" aria-label="${name}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

export function plantArt() {
  return wrap(`<rect width="360" height="260" rx="20" fill="#f1f8ff"/>
    <ellipse cx="180" cy="220" rx="125" ry="21" fill="#dfedda"/>
    <path d="M180 211 C178 172 177 112 181 71" fill="none" stroke="#397d56" stroke-width="10" stroke-linecap="round"/>
    <path d="M179 165 C150 136 112 132 96 151 C116 177 151 184 179 165Z" fill="#59ae76" stroke="#2f7a4f" stroke-width="2"/>
    <path d="M181 145 C206 119 248 120 264 141 C239 161 208 164 181 145Z" fill="#6bbc84" stroke="#2f7a4f" stroke-width="2"/>
    <path d="M103 152 Q141 151 170 164 M250 140 Q218 139 188 146" fill="none" stroke="#d7f3dc" stroke-width="2"/>
    <path d="M180 206 Q171 226 145 235 M179 208 Q187 230 211 236 M179 214 Q180 230 177 244 M172 217 Q155 222 146 248 M188 217 Q206 225 216 248" fill="none" stroke="#956d4a" stroke-width="4" stroke-linecap="round"/>
    <g transform="translate(181 60)"><ellipse cy="-21" rx="17" ry="24" fill="#e5849a"/><ellipse cx="20" cy="-7" rx="17" ry="24" transform="rotate(69 20 -7)" fill="#f39aac"/><ellipse cx="13" cy="18" rx="17" ry="24" transform="rotate(140 13 18)" fill="#e987a0"/><ellipse cx="-13" cy="18" rx="17" ry="24" transform="rotate(-140 -13 18)" fill="#f29eaf"/><ellipse cx="-20" cy="-7" rx="17" ry="24" transform="rotate(-69 -20 -7)" fill="#e889a1"/><circle r="16" fill="#f6c75f"/><circle r="7" fill="#b8723c"/></g>
    <path d="M43 214 Q48 206 51 216 M294 207 Q300 198 306 213" stroke="#8fbd87" stroke-width="3" fill="none"/>`, '0 0 360 260', 'Illustrierte Pflanze mit Blüte, Blättern, Stängel und Wurzeln', 'plant-art');
}

export function historyArt(id) {
  const bg = `<rect width="110" height="78" rx="13" fill="#e9f2fc"/>`;
  let art = '';
  if (id === 'charlemagne') art = `<path d="M18 61 Q55 10 92 61" fill="#cadbed" stroke="#8eabc8" stroke-width="2"/><path d="M37 59 V40 H73 V59" fill="#f8fbff"/><path d="M33 38 L41 21 L50 31 L55 16 L61 31 L70 21 L77 38Z" fill="#eebd62" stroke="#a56d34" stroke-width="2"/><circle cx="55" cy="28" r="3" fill="#c55e5e"/>`;
  if (id === 'gutenberg') art = `<rect x="20" y="22" width="69" height="39" rx="4" fill="#a16b4c"/><rect x="27" y="14" width="55" height="10" rx="2" fill="#6d554a"/><path d="M32 22 V13 M77 22 V13" stroke="#6d554a" stroke-width="3"/><rect x="28" y="38" width="53" height="17" rx="2" fill="#fffaf1"/><path d="M37 43 H73 M37 47 H69 M37 51 H74" stroke="#728093" stroke-width="2"/><path d="M84 25 L94 17" stroke="#6d554a" stroke-width="4" stroke-linecap="round"/>`;
  if (id === 'sarajevo') art = `<path d="M14 57 H98" stroke="#91adc4" stroke-width="2"/><path d="M24 57 V27 L37 21 L50 27 V57 M57 57 V31 L76 23 L89 31 V57" fill="#d1dfe8" stroke="#7594ad" stroke-width="2"/><path d="M29 38 H44 M64 39 H80" stroke="#8ca7ba" stroke-width="2"/><path d="M30 59 Q31 48 42 48 H66 Q79 48 80 59Z" fill="#314d68"/><circle cx="40" cy="59" r="5" fill="#243d57"/><circle cx="70" cy="59" r="5" fill="#243d57"/>`;
  if (id === 'bastille') art = `<path d="M16 64 H96" stroke="#7594ad" stroke-width="2"/><rect x="21" y="30" width="18" height="34" fill="#a4b4c5" stroke="#66829e" stroke-width="2"/><rect x="72" y="30" width="18" height="34" fill="#a4b4c5" stroke="#66829e" stroke-width="2"/><path d="M38 64 V37 H73 V64" fill="#d5e1ec" stroke="#66829e" stroke-width="2"/><path d="M20 30 L30 23 L40 30 M71 30 L81 23 L91 30" fill="#7d9ab2" stroke="#66829e" stroke-width="2"/><path d="M48 64 V46 H62 V64" fill="#59758f"/><path d="M11 47 L19 43 M97 44 L105 39" stroke="#d87961" stroke-width="3" stroke-linecap="round"/><path d="M13 41 L13 27 L17 30 L13 33" fill="#557abb" stroke="#557abb" stroke-width="2"/><path d="M97 45 L97 30 L103 33 L97 36" fill="#d46b66" stroke="#d46b66" stroke-width="2"/>`;
  if (id === 'wall') art = `<rect x="16" y="24" width="30" height="42" fill="#adbdd0"/><rect x="64" y="24" width="30" height="42" fill="#adbdd0"/><path d="M16 38 H46 M64 38 H94 M16 52 H46 M64 52 H94" stroke="#e2ecf5" stroke-width="2"/><path d="M45 61 L64 61 L64 28 L45 28Z" fill="#f6c879"/><path d="M35 63 Q42 48 49 59 M60 62 Q67 47 75 62" fill="none" stroke="#3a5f85" stroke-width="3"/><circle cx="44" cy="47" r="5" fill="#3a5f85"/><circle cx="67" cy="47" r="5" fill="#3a5f85"/>`;
  return wrap(bg + art, '0 0 110 78', `Historische Illustration: ${id}`, 'history-art');
}

export function instrumentArt(id) {
  let art = '';
  if (id === 'guitar') art = `<path d="M64 14 L51 48" stroke="#8a6046" stroke-width="11" stroke-linecap="round"/><path d="M51 44 C35 35 20 45 23 57 C25 72 52 71 58 58 C62 50 57 45 51 44Z" fill="#d9955d" stroke="#8f5d3d" stroke-width="2"/><circle cx="43" cy="55" r="7" fill="#704d3d"/><path d="M38 69 L69 13 M41 69 L72 14" stroke="#fff5df" stroke-width="1"/>`;
  if (id === 'violin') art = `<path d="M62 15 L48 47" stroke="#8a6046" stroke-width="9" stroke-linecap="round"/><path d="M42 43 C29 35 24 49 32 56 C22 62 34 76 45 66 C56 75 65 59 56 54 C64 44 51 36 42 43Z" fill="#c58450" stroke="#865b40" stroke-width="2"/><path d="M37 66 L66 15 M40 67 L69 16" stroke="#fff5df" stroke-width="1"/><path d="M70 27 L23 60" stroke="#4f647a" stroke-width="2"/>`;
  if (id === 'flute') art = `<path d="M16 49 H78" stroke="#9eb5c5" stroke-width="9" stroke-linecap="round"/><path d="M17 49 H79" stroke="#edf7fc" stroke-width="3"/><g fill="#577b99"><circle cx="31" cy="48" r="2"/><circle cx="43" cy="48" r="2"/><circle cx="55" cy="48" r="2"/><circle cx="67" cy="48" r="2"/></g>`;
  if (id === 'trumpet') art = `<path d="M19 45 H62 L82 29 V64 L62 48 H19Z" fill="#e9ba63" stroke="#a77b3d" stroke-width="2"/><path d="M20 52 H11 V42 H20 M37 38 V30 M47 38 V30 M57 38 V30" fill="none" stroke="#a77b3d" stroke-width="3"/><path d="M33 29 H41 M43 29 H51 M53 29 H61" stroke="#d9a451" stroke-width="3"/>`;
  if (id === 'drum') art = `<ellipse cx="48" cy="35" rx="28" ry="10" fill="#f9dbab" stroke="#a96a50" stroke-width="2"/><path d="M20 35 V61 Q48 77 76 61 V35" fill="#d98670" stroke="#a96a50" stroke-width="2"/><ellipse cx="48" cy="61" rx="28" ry="10" fill="#ca715f" stroke="#a96a50" stroke-width="2"/><path d="M33 26 L65 69 M64 26 L32 69" stroke="#f7d6bb" stroke-width="3"/><path d="M18 18 L74 52 M76 18 L22 52" stroke="#8f684e" stroke-width="3"/>`;
  if (id === 'xylophone') art = `<path d="M18 61 L75 28 M20 29 L76 62" stroke="#7e8da0" stroke-width="4"/><g fill="#d49a63" stroke="#a66e44" stroke-width="1"><rect x="25" y="24" width="13" height="43" rx="3" transform="rotate(-26 31 45)"/><rect x="41" y="23" width="13" height="43" rx="3" transform="rotate(-19 47 45)"/><rect x="57" y="22" width="13" height="43" rx="3" transform="rotate(-12 63 44)"/></g><path d="M72 15 L48 35 M81 20 L56 39" stroke="#795e52" stroke-width="3"/><circle cx="72" cy="15" r="4" fill="#e7c47f"/><circle cx="81" cy="20" r="4" fill="#e7c47f"/>`;
  return wrap(`<rect width="96" height="80" rx="12" fill="#eff5fc"/>${art}`, '0 0 96 80', `Illustration: ${id}`, 'instrument-art');
}

export function circuitArt(index, lit=false) {
  const glow = lit ? `<circle cx="141" cy="26" r="28" fill="#ffe6a2" opacity=".67" class="bulb-glow"/><g stroke="#efaa38" stroke-width="2"><path d="M141 0 V5 M103 25 H110 M173 25 H180 M113 1 L119 7 M163 1 L169 7"/></g>` : '';
  const lamp = `${glow}<circle cx="141" cy="26" r="17" fill="${lit?'#ffdf85':'#f8fbff'}" stroke="#496887" stroke-width="2"/><path d="M130 26 L136 20 L141 32 L146 20 L152 26" fill="none" stroke="#a87948" stroke-width="2"/>`;
  const top = `<path d="M39 25 H124 M158 25 H189 V84" fill="none" stroke="#496887" stroke-width="3" stroke-linecap="round"/>`;
  const battery = `<path d="M39 25 V46 M39 65 V84" stroke="#496887" stroke-width="3"/><path d="M21 49 H57 M28 61 H50" stroke="#496887" stroke-width="3"/><text x="18" y="43" font-size="12" fill="#365b7e">+</text><text x="20" y="78" font-size="12" fill="#365b7e">−</text>`;
  let bottom = '';
  if (index === 0) bottom = `<path d="M39 84 H189" stroke="#496887" stroke-width="3"/>`;
  if (index === 1) bottom = `<path d="M39 84 H93 M124 84 H189 M93 84 L122 69" stroke="#496887" stroke-width="3" stroke-linecap="round"/><circle cx="93" cy="84" r="3" fill="#496887"/><circle cx="124" cy="84" r="3" fill="#496887"/>`;
  if (index === 2) bottom = `<path d="M39 84 H58 M189 84 H169 M189 84 V57 H70 V25 H39" stroke="#496887" stroke-width="3" fill="none"/><circle cx="58" cy="84" r="3" fill="#496887"/><circle cx="169" cy="84" r="3" fill="#496887"/>`;
  if (index === 3) bottom = `<path d="M39 84 H93 M124 84 H189 M93 84 H124" stroke="#496887" stroke-width="3"/><circle cx="93" cy="84" r="3" fill="#496887"/><circle cx="124" cy="84" r="3" fill="#496887"/>`;
  return wrap(`<rect width="220" height="110" rx="14" fill="#f6f9ff"/>${top}${battery}${bottom}${lamp}`, '0 0 220 110', `Schaltbild ${'ABCD'[index]}${lit?' mit leuchtender Lampe':''}`, 'circuit-art');
}

const horse = (x,y,color,scale=1,pouch=false) => `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M54 22 C44 17 34 23 34 31 L18 33 L13 39 L29 43 L36 38 C29 48 32 58 40 64 C51 73 64 63 60 51 C67 42 64 30 54 22Z" fill="${color}" stroke="#3c6980" stroke-width="1.5"/><path d="M41 62 C39 78 59 89 64 76 C66 69 59 66 54 72 C51 76 54 79 58 77" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round"/><path d="M61 35 L74 30 L64 43Z" fill="#9fd2cb" stroke="#3c6980"/><path d="M34 30 L29 21 L38 25" fill="${color}" stroke="#3c6980"/><circle cx="41" cy="31" r="2.1" fill="#203c50"/>${pouch?'<ellipse cx="49" cy="55" rx="12" ry="14" fill="#f6cb94" stroke="#c99268" stroke-width="1.5"/><circle cx="46" cy="52" r="2" fill="#e8a96e"/><circle cx="53" cy="58" r="2" fill="#e8a96e"/>':''}</g>`;
export function seahorseArt(scene) {
  const base = `<rect width="170" height="112" rx="13" fill="#e6f4f6"/><path d="M0 88 Q36 78 72 89 T170 87 V112 H0Z" fill="#d4ebe8"/><path d="M17 111 Q21 79 16 66 M25 112 Q31 90 37 76 M148 111 Q144 87 153 72" fill="none" stroke="#83bdaa" stroke-width="4" stroke-linecap="round"/><g fill="#c9e9ef"><circle cx="20" cy="24" r="4"/><circle cx="142" cy="20" r="3"/><circle cx="157" cy="45" r="5"/></g>`;
  let art = '';
  if (scene === 'dance') art = `${horse(5,7,'#e5a374',.98)}<g transform="translate(163 7) scale(-.98 .98)">${horse(0,0,'#75b7bc',1)}</g><path d="M80 16 Q91 4 100 16 M81 25 Q91 13 101 25" fill="none" stroke="#d5a66b" stroke-width="2" stroke-linecap="round"/>`;
  if (scene === 'transfer') art = `${horse(2,5,'#e5a374',1.03)}<g transform="translate(167 8) scale(-1 1)">${horse(0,0,'#75b7bc',1,true)}</g><g fill="#e6b462"><circle cx="82" cy="49" r="3"/><circle cx="91" cy="54" r="3"/><circle cx="99" cy="58" r="3"/></g>`;
  if (scene === 'pouch') art = `${horse(47,2,'#75b7bc',1.28,true)}<circle cx="117" cy="33" r="18" fill="#ffffffae" stroke="#8ac7d2"/><g fill="#e6b462"><circle cx="110" cy="29" r="4"/><circle cx="121" cy="29" r="4"/><circle cx="115" cy="39" r="4"/></g>`;
  if (scene === 'birth') art = `${horse(18,4,'#75b7bc',1.15,true)}${horse(100,46,'#9accc8',.43)}${horse(129,26,'#9accc8',.35)}<path d="M94 75 Q105 69 114 72 M110 86 Q124 80 137 84" fill="none" stroke="#a8d6d9" stroke-width="2"/>`;
  return wrap(base + art, '0 0 170 112', `Seepferdchen-Szene ${scene}`, 'seahorse-art');
}

export function butterflyArt(scene) {
  const bg='<rect width="170" height="112" rx="13" fill="#f4f8f2"/><path d="M0 90 Q43 80 85 89 T170 87 V112 H0" fill="#e8f2e6"/>';
  const leaf='<path d="M22 74 Q65 29 124 59 Q78 91 22 74Z" fill="#91bf89" stroke="#4c8965" stroke-width="2"/><path d="M25 74 Q72 66 118 60" fill="none" stroke="#4c8965" stroke-width="2"/>';
  let art='';
  if(scene==='egg') art=`${leaf}<g fill="#f9f1d4" stroke="#b9a980" stroke-width="1.3"><ellipse cx="64" cy="61" rx="7" ry="9"/><ellipse cx="78" cy="57" rx="7" ry="9"/><ellipse cx="93" cy="57" rx="7" ry="9"/></g>`;
  if(scene==='caterpillar') art=`${leaf}<path d="M46 58 Q69 31 113 51" fill="none" stroke="#426f4b" stroke-width="18" stroke-linecap="round" stroke-dasharray="8 2"/><circle cx="113" cy="51" r="11" fill="#6ca56b" stroke="#426f4b" stroke-width="2"/><circle cx="117" cy="47" r="2" fill="#223c32"/><path d="M111 41 L108 34 M119 41 L124 35" stroke="#426f4b" stroke-width="2"/>`;
  if(scene==='chrysalis') art='<path d="M25 26 Q85 36 145 20" fill="none" stroke="#7a624d" stroke-width="8" stroke-linecap="round"/><path d="M88 31 V48" stroke="#7a624d" stroke-width="2"/><path d="M87 44 C59 46 65 87 86 95 C108 88 111 54 87 44Z" fill="#80ad79" stroke="#4b7b5c" stroke-width="2"/><path d="M80 49 Q88 61 76 80 M96 49 Q87 65 97 82" fill="none" stroke="#d3e4a2" stroke-width="3"/>';
  if(scene==='butterfly') art='<path d="M83 61 Q52 10 31 37 Q28 56 70 66 Q27 63 39 88 Q55 107 82 72 M87 61 Q118 10 139 37 Q142 56 100 66 Q143 63 131 88 Q115 107 88 72" fill="#eaa56d" stroke="#8e5b52" stroke-width="2"/><path d="M83 65 Q53 29 47 47 Q55 60 79 67 M87 65 Q117 29 123 47 Q115 60 91 67" fill="#f8dcb0"/><path d="M85 51 V80" stroke="#51494f" stroke-width="6" stroke-linecap="round"/><path d="M83 53 Q72 39 69 37 M87 53 Q98 39 101 37" fill="none" stroke="#51494f" stroke-width="2"/><circle cx="85" cy="50" r="4" fill="#51494f"/><path d="M42 103 Q68 94 89 101 T146 98" fill="none" stroke="#80a77d" stroke-width="3"/>';
  return wrap(bg+art,'0 0 170 112',`Butterfly life cycle: ${scene}`,'butterfly-art');
}
