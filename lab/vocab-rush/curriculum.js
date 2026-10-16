(() => {
'use strict';
const TOPICS={
  irregular_verbs:{label:'Irregular verbs',short:'Irregular verbs',introduced:5,group:'grammar',desc:'Grundform, simple past und past participle sicher abrufen.'},
  simple_present:{label:'Simple present',short:'Simple present',introduced:5,group:'grammar',desc:'Aussagen, Verneinung, Fragen und 3. Person Singular.'},
  simple_past:{label:'Simple past',short:'Simple past',introduced:5,group:'grammar',desc:'Vergangene Handlungen mit regelmäßigen und unregelmäßigen Verben.'},
  question_words:{label:'Question words',short:'Question words',introduced:5,group:'vocab',desc:'who, what, where, when, how und why passend einsetzen.'},
  prepositions:{label:'Prepositions',short:'Prepositions',introduced:5,group:'vocab',desc:'Grundlegende Orts- und Zeitpräpositionen sicher verwenden.'},
  some_any_no:{label:'some / any / no',short:'some/any/no',introduced:5,group:'grammar',desc:'Mengen und Verneinungen passend ausdrücken.'},
  phrasal_verbs:{label:'Phrasal verbs',short:'Phrasal verbs',introduced:5,group:'vocab',desc:'Häufige Verbverbindungen erkennen und verstehen.'},
  collocations:{label:'Collocations',short:'Collocations',introduced:5,group:'vocab',desc:'Typische Wortverbindungen wie do homework oder take a photo.'},
  present_progressive:{label:'Present progressive',short:'Present progressive',introduced:6,group:'grammar',desc:'Gerade ablaufende Handlungen bilden und erkennen.'},
  will_future:{label:'will-future',short:'will-future',introduced:6,group:'grammar',desc:'Zukünftige Handlungen und Vorhersagen ausdrücken.'},
  modal_verbs:{label:'Modal verbs',short:'Modal verbs',introduced:6,group:'grammar',desc:'can, must, have to, should, may und might passend verwenden.'},
  adjective_comparison:{label:'Comparison of adjectives',short:'Comparisons',introduced:6,group:'grammar',desc:'Adjektive vergleichen und steigern.'},
  pronouns:{label:'Pronouns',short:'Pronouns',introduced:6,group:'grammar',desc:'Objekt-, Possessiv-, Reflexiv- und Relativpronomen.'},
  present_perfect:{label:'Present perfect',short:'Present perfect',introduced:7,group:'grammar',desc:'Erfahrungen und Ergebnisse mit ever, never, already sowie for/since.'},
  quantities:{label:'Quantities',short:'Quantities',introduced:7,group:'grammar',desc:'much, many, (a) few und (a) little unterscheiden.'},
  going_to:{label:'going-to-future',short:'going-to',introduced:8,group:'grammar',desc:'Absichten und geplante Handlungen ausdrücken.'},
  relative_clauses:{label:'Relative clauses',short:'Relative clauses',introduced:8,group:'grammar',desc:'defining relative clauses mit who, which und that.'},
  adverbs:{label:'Adverbs',short:'Adverbs',introduced:8,group:'grammar',desc:'Art und Weise sowie kommentierende Adverbien unterscheiden.'},
  word_order:{label:'Word order',short:'Word order',introduced:5,group:'grammar',desc:'SVO sowie Angaben zu Ort, Zeit und Art und Weise richtig ordnen.'},
  past_progressive:{label:'Past progressive',short:'Past progressive',introduced:9,group:'grammar',desc:'Länger andauernde Vorgänge in der Vergangenheit ausdrücken.'},
  if_clause1:{label:'If-clauses type I',short:'If-clause I',introduced:9,group:'grammar',desc:'Reale Bedingungen mit present und will/can/imperative.'},
  tense_mix:{label:'Tense mix',short:'Tense mix',introduced:9,group:'grammar',desc:'Zeitformen aus dem Kontext passend auswählen.'}
};
const GRADE_HINTS={
  5:'Neu bzw. zentral: simple present, simple past, Fragen, unregelmäßige Plurale, Präpositionen, some/any/no, einfache phrasal verbs und Kollokationen.',
  6:'Neu bzw. zentral: present progressive, will-future, Modalverben, Objektpronomen, Steigerung und erweiterte Wortstellung.',
  7:'Neu bzw. zentral: present perfect, Possessiv-/Reflexiv-/Relativpronomen, should/shouldn’t und Mengenangaben im Kontrast.',
  8:'Neu bzw. zentral: going-to-future, Relativsätze, Adverbien, (a) few/(a) little sowie berufsweltbezogene Wortverbindungen.',
  9:'Neu bzw. zentral: past progressive, if-clauses Typ I, may/might, Zeitformen verknüpfen sowie komplexere phrasal verbs und Kollokationen.'
};
const IRREGULAR=[
 ['be','was/were','been','sein'],['become','became','become','werden'],['begin','began','begun','beginnen'],['break','broke','broken','brechen'],['bring','brought','brought','bringen'],['buy','bought','bought','kaufen'],['come','came','come','kommen'],['do','did','done','tun/machen'],['drink','drank','drunk','trinken'],['drive','drove','driven','fahren'],['eat','ate','eaten','essen'],['feel','felt','felt','fühlen'],['find','found','found','finden'],['get','got','got','bekommen'],['give','gave','given','geben'],['go','went','gone','gehen'],['have','had','had','haben'],['know','knew','known','wissen/kennen'],['leave','left','left','verlassen'],['make','made','made','machen'],['meet','met','met','treffen'],['read','read','read','lesen'],['run','ran','run','rennen'],['say','said','said','sagen'],['see','saw','seen','sehen'],['speak','spoke','spoken','sprechen'],['take','took','taken','nehmen'],['think','thought','thought','denken'],['write','wrote','written','schreiben']
];
const BANK={
 question_words:[['___ do you live?','Where'],['___ is your birthday?','When'],['___ is your best friend?','Who'],['___ are you late?','Why'],['___ do you get to school?','How'],['___ is your favourite subject?','What']],
 prepositions:[['The book is ___ the table.','on'],['We meet ___ Monday.','on'],['School starts ___ eight o’clock.','at'],['The cat is ___ the chair.','under'],['She sits ___ Tom and Mia.','between'],['He is waiting ___ the bus stop.','at']],
 some_any_no:[['Have you got ___ brothers or sisters?','any'],['I have ___ good friends here.','some'],['There is ___ milk left.','no'],['We haven’t got ___ homework today.','any'],['Would you like ___ water?','some']],
 phrasal_verbs:[['to get up','aufstehen'],['to look for','suchen'],['to fill in','ausfüllen'],['to apply for','sich bewerben um'],['to count on','sich verlassen auf'],['to rely on','sich verlassen auf'],['to come from','kommen aus'],['to find out','herausfinden']],
 collocations:[['do your homework','Hausaufgaben machen'],['have lunch','zu Mittag essen'],['take a photo','ein Foto machen'],['catch a bus','einen Bus erwischen'],['take a seat','Platz nehmen'],['complete a form','ein Formular ausfüllen'],['take an exam','eine Prüfung ablegen'],['take place','stattfinden']],
 modal_verbs:[['You ___ wear a helmet here. It is compulsory.','must'],['___ you swim?','Can'],['You ___ talk to your teacher if you need help.','should'],['It ___ rain later, but I am not sure.','might'],['Students ___ use their phones during the test.','mustn’t']],
 quantities:[['How ___ books have you got?','many'],['How ___ water do you drink?','much'],['I have ___ friends here, so I’m not lonely.','a few'],['There is ___ time left, but enough to finish.','a little'],['There are ___ buses on Sundays, so transport is difficult.','few'],['We have ___ money left, so we cannot buy it.','little']],
 pronouns:[['This bag belongs to me. It is ___.','mine'],['I can see Tom. I can see ___.','him'],['She taught ___ to play the guitar.','herself'],['The boy ___ lives next door is in my class.','who'],['The book ___ I bought is interesting.','that']],
 adverbs:[['She sings ___.','beautifully'],['He is a ___ driver.','careful'],['___, nobody was hurt.','Fortunately'],['Please speak ___.','slowly']],
 if_clause1:[['If you study, you ___ the test.','will pass'],['If it rains, we ___ at home.','will stay'],['If you need help, ___ me.','call'],['If you hurry, you ___ catch the bus.','can']],
 word_order:[['every day / I / English / study','I study English every day.'],['at school / we / lunch / have','We have lunch at school.'],['carefully / she / the text / reads','She reads the text carefully.'],['tomorrow / to Munich / they / are going','They are going to Munich tomorrow.']]
};
function rng(seed){let v=seed>>>0;return()=>{v+=0x6D2B79F5;let t=v;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
const pick=(r,a)=>a[Math.floor(r()*a.length)];
function shuffle(r,a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function wrongsFor(value,pool){return [...new Set(pool.filter(x=>x!==value))].slice(0,3);}
function task(id,prompt,correct,wrong,explanation,topic,type='single'){return{id,topic,prompt,correct,options:[correct,...wrong].slice(0,4),explanation,type};}
function generated(topic,r,index){
  if(topic==='irregular_verbs'){
    const v=pick(r,IRREGULAR), mode=Math.floor(r()*3); const all=IRREGULAR.map(x=>x[mode+1]);
    const labels=[`Simple past von “${v[0]}”`,`Past participle von “${v[0]}”`,`Deutsche Bedeutung von “${v[0]}”`];
    return task(`irr-${index}`,labels[mode],v[mode+1],wrongsFor(v[mode+1],shuffle(r,all)),`"${v[0]}" → ${v[1]} → ${v[2]} · ${v[3]}.`,topic);
  }
  if(BANK[topic]){const row=pick(r,BANK[topic]),correct=row[1],all=BANK[topic].map(x=>x[1]);return task(`${topic}-${index}`,row[0],correct,wrongsFor(correct,shuffle(r,all)),`Richtig ist: ${correct}.`,topic);}
  if(topic==='simple_present'){
    const rows=[['He ___ football every Friday.','plays',['play','played','is playing'],'Bei he/she/it bekommt das Verb im simple present normalerweise -s.'],['They ___ to school by bus.','go',['goes','went','are going'],'Bei they steht die Grundform im simple present.'],['___ she like music?','Does',['Do','Is','Did'],'Fragen mit he/she/it werden mit does gebildet.']];const x=pick(r,rows);return task(`sp-${index}`,x[0],x[1],x[2],x[3],topic);
  }
  if(topic==='simple_past'){
    const rows=[['Yesterday we ___ to the cinema.','went',['go','gone','are going'],'Für ein abgeschlossenes Ereignis gestern steht simple past: go → went.'],['She ___ her homework last night.','did',['does','done','is doing'],'do → did im simple past.'],['They ___ football yesterday.','played',['play','plays','are playing'],'Regelmäßige Verben bilden das simple past mit -ed.']];const x=pick(r,rows);return task(`past-${index}`,x[0],x[1],x[2],x[3],topic);
  }
  if(topic==='present_progressive'){
    const rows=[['Look! Tom ___ now.','is running',['runs','ran','will run'],'Gerade jetzt: am/is/are + Verb-ing.'],['We ___ dinner at the moment.','are having',['have','had','will have'],'at the moment signalisiert present progressive.']];const x=pick(r,rows);return task(`pp-${index}`,x[0],x[1],x[2],x[3],topic);
  }
  if(topic==='will_future'){
    const rows=[['I think it ___ rain tomorrow.','will',['is','did','has'],'will + Grundform wird für Vorhersagen verwendet.'],['Don’t worry. I ___ help you.','will',['am','have','did'],'Spontanes Angebot: will + Grundform.']];const x=pick(r,rows);return task(`will-${index}`,x[0],x[1],x[2],x[3],topic);
  }
  if(topic==='adjective_comparison'){
    const rows=[['good → better → ___','best',['goodest','more good','betterest'],'good hat unregelmäßige Steigerungsformen: good – better – best.'],['My bike is ___ than yours.','faster',['fastest','more fast','fast'],'Vergleich mit than: comparative faster.']];const x=pick(r,rows);return task(`comp-${index}`,x[0],x[1],x[2],x[3],topic);
  }
  if(topic==='present_perfect'){
    const rows=[['I have ___ finished my homework.','already',['yesterday','ago','last'],'already passt zum present perfect für ein bereits eingetretenes Ergebnis.'],['Have you ___ been to London?','ever',['ago','last','yesterday'],'ever fragt nach Erfahrungen bis jetzt.'],['She has lived here ___ 2022.','since',['for','ago','last'],'since steht vor einem Startzeitpunkt.']];const x=pick(r,rows);return task(`perf-${index}`,x[0],x[1],x[2],x[3],topic);
  }
  if(topic==='going_to'){
    const rows=[['We have tickets. We ___ visit London next week.','are going to',['will to','are going','going'],'Geplante Absicht: am/is/are going to + Grundform.'],['Look at those clouds! It ___.','is going to rain',['will to rain','rains yesterday','has rain'],'Ein sichtbares Anzeichen spricht für going-to-future.']];const x=pick(r,rows);return task(`going-${index}`,x[0],x[1],x[2],x[3],topic);
  }
  if(topic==='relative_clauses'){
    const rows=[['The girl ___ lives next door is my friend.','who',['which','where','when'],'Für Personen steht im Relativsatz who.'],['The phone ___ I bought is broken.','that',['who','when','where'],'Für Dinge kann in defining relative clauses that stehen.']];const x=pick(r,rows);return task(`rel-${index}`,x[0],x[1],x[2],x[3],topic);
  }
  if(topic==='past_progressive'){
    const rows=[['At 8 pm, I ___ TV.','was watching',['watched','am watching','have watched'],'Ein laufender Vorgang zu einem Zeitpunkt in der Vergangenheit: was/were + ing.'],['They ___ when the phone rang.','were sleeping',['slept','sleep','have slept'],'Der längere Hintergrundvorgang steht im past progressive.']];const x=pick(r,rows);return task(`pg-${index}`,x[0],x[1],x[2],x[3],topic);
  }
  if(topic==='tense_mix'){
    const rows=[['She ___ here since 2023.','has lived',['lived yesterday','is living last year','will lived'],'since + Startzeitpunkt mit Bezug bis heute: present perfect.'],['While I ___ home, it started to rain.','was walking',['walk','have walked','will walk'],'Laufender Hintergrundvorgang: past progressive.']];const x=pick(r,rows);return task(`mix-${index}`,x[0],x[1],x[2],x[3],topic);
  }
  return generated('irregular_verbs',r,index);
}
function availableTopics(grade){const g=Number(grade||5);return Object.keys(TOPICS).filter(id=>TOPICS[id].introduced<=g);}
function recommendedTopics(grade){const g=Number(grade||5);return Object.keys(TOPICS).filter(id=>TOPICS[id].introduced===g || (g===5&&TOPICS[id].introduced===5));}
function createCurriculumEngine({grade=5,topics=[],seed=1}){const r=rng(seed),allowed=(topics.length?topics:availableTopics(grade)).filter(x=>TOPICS[x]);let cycle=[],n=0;return{next(){if(!cycle.length)cycle=shuffle(r,allowed);const topic=cycle.shift();const t=generated(topic,r,++n);t.options=shuffle(r,t.options);return t;}};}
function createVocabEngine({items=[],direction='mixed',seed=1}){const r=rng(seed);let queue=shuffle(r,items.map((x,i)=>({...x,_i:i}))),n=0;function refill(){if(!queue.length)queue=shuffle(r,items.map((x,i)=>({...x,_i:i})));}
 return{next(){refill();const item=queue.shift();const dir=direction==='mixed'?(r()<.5?'en-de':'de-en'):direction;const source=dir==='en-de'?item.source:item.targets[0],answers=dir==='en-de'?item.targets:[item.source],all=items.flatMap(x=>dir==='en-de'?x.targets:[x.source]);const correct=answers[0],wrong=shuffle(r,[...new Set(all.filter(x=>!answers.includes(x))) ]).slice(0,3);return{id:`v-${item._i}-${++n}`,topic:'custom',prompt:dir==='en-de'?`Was bedeutet „${source}“?`:`Wie heißt „${source}“ auf Englisch?`,correct,accepted:answers,options:shuffle(r,[correct,...wrong]),explanation:`${item.source} → ${item.targets.join(' / ')}`,type:'single'};},requeue(taskId){const idx=Number(String(taskId).split('-')[1]);const item=items[idx];if(item)queue.splice(Math.min(2,queue.length),0,{...item,_i:idx});}};}
window.VocabRush={TOPICS,GRADE_HINTS,IRREGULAR,availableTopics,recommendedTopics,createCurriculumEngine,createVocabEngine};
})();