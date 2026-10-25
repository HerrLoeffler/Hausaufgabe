// Local homepage showcase rubric. Real GradeCrew assessments grade server-side.
export const taskIds = ['coordinate','audio','markwords','equation','plant','history','music','circuit','butterfly','angleSet'];
export const maxPoints = taskIds.length * 2;

const has = value => value !== undefined && value !== null && String(value).trim() !== '';
const numeric = value => {
  if (!has(value)) return null;
  const clean = String(value).trim().replace(',', '.').replace('−', '-').replace(/\s*°$/, '');
  return /^-?\d+(?:\.\d+)?$/.test(clean) ? Number(clean) : null;
};
const pointIs = (point, x, y) => numeric(point?.x) === x && numeric(point?.y) === y;
const pointAttempted = point => has(point?.x) || has(point?.y);
const targetWords = {fox:'noun',shed:'noun',box:'noun',discovers:'verb',curious:'adj',old:'adj',mysterious:'adj'};
const historyCorrect = ['charlemagne','gutenberg','bastille','sarajevo','wall'];
const butterflyCorrect = ['egg','caterpillar','chrysalis','butterfly'];
const musicCorrect = {guitar:'strings',violin:'strings',flute:'winds',trumpet:'winds',drum:'percussion',xylophone:'percussion'};
const solutions = {
  coordinate:['A liegt bei (−2 | 1), B bei (2 | 3). Zwei einzelne Punkte.','A is at (−2, 1), B at (2, 3). They are separate points.'],
  audio:['Die Aufnahme nennt GradeCrew.','The recording says GradeCrew.'],
  markwords:['Nomen: Füchsin, Schuppen, Kiste. Verb: entdeckt. Adjektive: neugierige, alten, geheimnisvolle.','Nouns: fox, shed, box. Verb: discovers. Adjectives: curious, old, mysterious.'],
  equation:['x² − 5x + 6 = (x − 2)(x − 3). Daher sind die Nullstellen x = 2 und x = 3.','x² − 5x + 6 = (x − 2)(x − 3), so the zeros are x = 2 and x = 3.'],
  plant:['Blüte oben, Blatt seitlich, Stängel in der Mitte, Wurzel unten.','Flower at the top, leaf at the side, stem in the middle, roots below.'],
  history:['800 Kaiserkrönung Karls des Großen; um 1450 Buchdruck; 1789 Sturm auf die Bastille; 1914 Attentat von Sarajevo; 1989 Maueröffnung.','800 Charlemagne crowned emperor; c. 1450 printing press; 1789 Storming of the Bastille; 1914 Sarajevo assassination; 1989 Berlin Wall opens.'],
  music:['Gitarre/Geige: Saiten. Querflöte/Trompete: Blasinstrumente. Trommel/Xylofon: Schlaginstrumente.','Guitar/violin: strings. Flute/trumpet: winds. Drum/xylophone: percussion.'],
  circuit:['A und D leuchten: jeweils ein geschlossener Kreis zwischen beiden Batteriepolen. B hat einen offenen Schalter, C keine Spannung an der Lampe.','A and D light up: each has a closed path between both battery terminals. B has an open switch; C has no voltage across the bulb.'],
  butterfly:['Ei → Raupe → Puppe → Schmetterling.','Egg → caterpillar → chrysalis → butterfly.'],
  angleSet:['60°; die Demo akzeptiert 58–62°.','60°; the demo accepts 58–62°.']
};

export function gradeTask(id, state, language='de') {
  let points = 0;
  let attempted = false;
  switch (id) {
    case 'coordinate': {
      const p = state.coords || {};
      attempted = pointAttempted(p.A) || pointAttempted(p.B);
      points = Number(pointIs(p.A,-2,1)) + Number(pointIs(p.B,2,3));
      break;
    }
    case 'audio': {
      const answer = state.audio || [];
      attempted = answer.length > 0;
      points = answer.length === 1 && answer[0] === 0 ? 2 : 0;
      break;
    }
    case 'markwords': {
      const answer = Object.fromEntries(Object.entries(state.wordClass || {}).filter(([,role]) => has(role)));
      attempted = Object.keys(answer).length > 0;
      const correct = Object.entries(targetWords).filter(([key,role]) => answer[key] === role).length;
      const wrong = Object.entries(answer).filter(([key,role]) => targetWords[key] !== role).length;
      points = correct === 7 && wrong === 0 ? 2 : correct - wrong >= 5 ? 1 : 0;
      break;
    }
    case 'equation': {
      const a = state.equation || {};
      attempted = has(a.first) || has(a.second);
      const first=numeric(a.first),second=numeric(a.second);
      points = (first===2&&second===3)||(first===3&&second===2) ? 2
        : Number(first===2||first===3||second===2||second===3);
      break;
    }
    case 'plant': {
      const a = state.plantSlots || [];
      attempted = a.some(has);
      const right = ['flower','leaf','stem','roots'].filter((label,i) => a[i] === label).length;
      points = right === 4 ? 2 : right >= 2 ? 1 : 0;
      break;
    }
    case 'history': {
      const a = state.historySlots || [];
      attempted = a.some(has);
      const right = historyCorrect.filter((label,i) => a[i] === label).length;
      // An incomplete submission can have four correct slots.
      points = right === 5 ? 2 : right >= 3 ? 1 : 0;
      break;
    }
    case 'music': {
      const a = state.musicGroups || {};
      attempted = Object.keys(a).length > 0;
      const right = Object.entries(musicCorrect).filter(([item,group]) => a[item] === group).length;
      points = right === 6 ? 2 : right >= 4 ? 1 : 0;
      break;
    }
    case 'circuit': {
      const a = state.circuit || [];
      attempted = a.length > 0;
      points = a.length === 2 && a.includes(0) && a.includes(3) ? 2
        : a.length === 1 && (a[0] === 0 || a[0] === 3) ? 1 : 0;
      break;
    }
    case 'butterfly': {
      const a = state.butterflyOrder || [];
      attempted = Boolean(state.butterflyTouched);
      const exact = a.length === 4 && a.every((value,i) => value === butterflyCorrect[i]);
      const oneAdjacentSwap = a.length === 4 && [0,1,2].some(i => {
        const expected = [...butterflyCorrect];
        [expected[i],expected[i+1]] = [expected[i+1],expected[i]];
        return a.every((value,j) => value === expected[j]);
      });
      points = exact ? 2 : oneAdjacentSwap ? 1 : 0;
      break;
    }
    case 'angleSet': {
      attempted = has(state.angleSet);
      points = attempted && Math.abs(numeric(state.angleSet)-60) <= 2 ? 2 : 0;
      break;
    }
  }
  const max = Math.max(0,Math.min(20,Number(state.pointWeights?.[id]??2)));
  return {id, points:Math.round(points*max*50)/100, max, attempted, solution:solutions[id]?.[language==='en'?1:0] || ''};
}

export function gradeAll(state, language='de') {
  const items = taskIds.map(id => gradeTask(id,state,language));
  return {items, points:items.reduce((sum,item)=>sum+item.points,0), max:items.reduce((sum,item)=>sum+item.max,0),
    answered:items.filter(item=>item.attempted).length};
}
