// Own schematic geometry, no semantic shape names or answer keys.
export const scenes = {
  "plant": [
  {
    "id": "r1",
    "shape": "path",
    "x": 200,
    "y": 55,
    "d": "M200 19 C213 2 229 16 224 34 C248 20 261 41 239 55 C261 69 248 91 225 77 C231 100 207 108 200 85 C191 108 168 99 175 77 C151 91 139 69 161 55 C139 41 153 20 176 34 C171 14 190 2 200 19 Z M212 55 A12 12 0 1 0 188 55 A12 12 0 1 0 212 55 Z",
    "color": "#cf83a5",
    "fill": "#df9bb7",
    "strokeWidth": 2
  },
  {
    "id": "r2",
    "shape": "path",
    "x": 191,
    "y": 98,
    "d": "M194 91 C199 124 188 150 195 182 C199 207 192 231 195 255 L207 255 C203 229 210 205 207 181 C200 149 211 121 206 91 Z",
    "color": "#58875b",
    "fill": "#58875b",
    "strokeWidth": 2
  },
  {
    "id": "r3",
    "shape": "path",
    "x": 147,
    "y": 169,
    "d": "M199 186 C151 188 117 178 104 139 C145 137 181 148 199 186 Z M204 167 C206 133 239 117 279 119 C268 154 241 171 204 167 Z M199 186 C164 169 135 153 109 142 M204 167 C229 147 251 134 273 122",
    "color": "#487d47",
    "fill": "#84b56d",
    "strokeWidth": 2
  },
  {
    "id": "r4",
    "shape": "path",
    "x": 200,
    "y": 254,
    "d": "M200 254 C194 275 199 296 188 322 M197 267 C181 272 163 283 149 302 M180 278 C171 279 158 274 147 277 M165 288 C155 290 143 290 132 298 M199 277 C218 281 238 297 249 322 M222 286 C231 285 245 280 257 285 M238 302 C252 301 262 307 270 316 M194 291 C180 297 170 313 166 330 M198 310 C207 317 210 329 208 338",
    "color": "#9a7552",
    "fill": "none",
    "strokeWidth": 6
  }
],
  "room": [
    {
      "id": "r1",
      "shape": "rect",
      "x": 40,
      "y": 40,
      "w": 100,
      "h": 90,
      "color": "#a9d8ef"
    },
    {
      "id": "r2",
      "shape": "rect",
      "x": 255,
      "y": 38,
      "w": 92,
      "h": 120,
      "color": "#c3a18a"
    },
    {
      "id": "r3",
      "shape": "path",
      "x": 170,
      "y": 250,
      "d": "M80 210 h180 v18 h-180 z M95 228 v60 M245 228 v60",
      "color": "#d6b073",
      "fill": "#d6b073",
      "strokeWidth": 6
    },
    {
      "id": "r4",
      "shape": "ellipse",
      "x": 278,
      "y": 250,
      "w": 40,
      "h": 40,
      "color": "#8a80c4"
    }
  ]
};
for(const [template,captions] of Object.entries({sentence:['Am Morgen','fährt','der Bus','zur Schule.'],receipt:['20.10.2026 · 10:35','2 × Heft A5 · 3,00 €','SUMME · 3,00 €','Zahlung: BAR']}))scenes[template]=captions.map((caption,i)=>({id:`r${i+1}`,shape:'rect',x:40,y:30+i*80,w:320,h:45,color:'#e2e8f0',caption}));
export function authoredVisual(q) {
 const v=q.visual||{};
 if(q.type==='numberline')return {version:1,min:v.min,max:v.max,step:v.step,...(v.markers?{markers:v.markers.map(m=>({id:m.id,text:m.text}))}:{})};
 if(q.type==='fraction-grid')return {version:1,rows:v.rows,columns:v.columns};
 if(q.type==='angle-measure')return {version:1,rays:[{x:1,y:0},{x:Math.cos(v.degrees*Math.PI/180),y:-Math.sin(v.degrees*Math.PI/180)}]};
 if(q.type==='bar-chart')return {version:1,min:v.min,max:v.max,step:v.step,categories:(v.categories||[]).map(c=>({id:c.id,text:c.text,sourceValue:c.sourceValue})),...(v.unit?{unit:v.unit}:{})};
 return {version:1,objects:scenes[v.template] || [],labels:[...(v.labels || [])].sort((a,b)=>a.id.localeCompare(b.id))};
}
