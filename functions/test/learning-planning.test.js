'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const P=require('../lib/learning-brain/planning');
test('visual line and fraction goals become answerable while actual audio and essays stay gated',()=>{
 assert.equal(P.eligibility({subject:'math',title:'Brüche auf der Zahlengeraden',modality:'visual'}).available,true);
 assert.equal(P.eligibility({subject:'math',title:'Ganzes und gleiche Teile',modality:'visual'}).available,true);
 assert.equal(P.eligibility({subject:'math',title:'Körpernetze zeichnen',modality:'visual'}).available,false);
 assert.equal(P.eligibility({subject:'german',title:'Wörter im Kontext klären',modality:'text'}).available,true);
 assert.equal(P.eligibility({subject:'german',title:'Erzählerisch ausgestalten',modality:'text'}).available,false);
 assert.equal(P.eligibility({subject:'german',title:'Hörinhalte zusammenfassen',modality:'audio'}).available,false);
});
test('success plans change cognitive demand and unsupported helpers remove a requirement',()=>{
 const topic={subject:'math',title:'Wertgleich erweitern'};
 const p=P.plan({topic,phase:'practice',level:0}),q=P.plan({topic,phase:'practice',level:1});assert.equal(p.preferredTool,'fraction-board');assert.equal(q.preferredTool,'none');assert.notEqual(p.demand,q.demand);
 const a=P.plan({topic,phase:'help',supportStage:1}),b=P.plan({topic,phase:'help',supportStage:3});assert.equal(a.supportStage,1);assert.equal(b.supportStage,3);assert.notEqual(a.demand,b.demand);assert.equal(b.preferredTool,'none');
});
test('fraction addition, reduction and representation never receive an expansion-only learning goal',()=>{
 const add=P.plan({topic:{subject:'math',title:'Ungleichnamig addieren oder subtrahieren'},phase:'practice',level:1});assert.match(add.demand,/Nenner|Addition|addieren/);assert.doesNotMatch(add.demand,/Erweiterungsfaktor aus Zielnenner/);
 const reduce=P.plan({topic:{subject:'math',title:'Wertgleich kürzen'},phase:'practice',level:2});assert.match(reduce.demand,/Kürz|kürz|Teiler/);
 const part=P.plan({topic:{subject:'math',title:'Ganzes und gleiche Teile',goal:'Bruchteile darstellen'},phase:'practice',level:0});assert.equal(part.preferredTool,'fraction-board');assert.match(part.demand,/Anteil/);
});

test('fraction expansion help removes the whole-board demand and isolates smaller prerequisites',()=>{
 const topic={subject:'math',title:'Wertgleich erweitern',goal:'Zähler und Nenner mit demselben Faktor multiplizieren'};
 const demands=[1,2,3].map(supportStage=>P.plan({topic,phase:'help',supportStage,level:0}));
 assert.match(demands[0].demand,/Zählerrechnung/);assert.match(demands[1].demand,/Addition/);assert.match(demands[2].demand,/einzelne/);
 assert.equal(demands.every(p=>p.preferredTool==='none'),true);assert.equal(new Set(demands.map(p=>p.demand)).size,3);
});

test('detailed competencies use their own four demands and three prerequisite help steps',()=>{
 const topic={id:'math:6:R:example:k1',parentTopicId:'math:6:R:example',subject:'math',delivery:'visual',didacticFamily:'area',learningPlan:{levels:['Flächenfelder zählen.','Aus Reihen und Spalten bestimmen.','Eine fehlende Seitenlänge bestimmen.','Zwei Flächenmethoden begründen.'],help:['Eine Reihe zeigen.','Felder einer Reihe zählen.','Ein einzelnes Feld erkennen.'],preferredTool:'none'}};
 assert.equal(P.eligibility(topic).available,true);
 assert.equal(P.plan({topic,phase:'practice',level:2}).demand,topic.learningPlan.levels[2]);
 assert.equal(P.plan({topic,phase:'help',supportStage:3}).demand,topic.learningPlan.help[2]);
 assert.equal(P.plan({topic,phase:'practice',level:0}).delivery,'visual');
});
