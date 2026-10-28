import test from 'node:test';
import assert from 'node:assert/strict';
import {createWilmaReviewClient} from './wilma-review-client.mjs';

const request={mode:'demo',answerIds:['s1','s2'],maxPoints:2};
const valid=()=>({source:'wilma-ai',requestId:'fictional-receipt',revision:'fictional-source-version',answers:[{id:'s1',points:2,status:'clear',reason:'Fachbegriff passt.'},{id:'s2',points:1,status:'uncertain',reason:'Begründung prüfen.'}]});
async function receive(receipt){return createWilmaReviewClient({request:async()=>receipt})(request);}
test('vollständige zugeordnete Vorschläge werden unverändert angenommen',async()=>assert.deepEqual(await receive(valid()),valid()));
for(const [label,change] of [
 ['fehlender Antwort',r=>r.answers.pop()],
 ['doppelter Antwortkennung',r=>r.answers[1].id='s1'],
 ['fremder Antwortkennung',r=>r.answers[1].id='foreign'],
 ['zu hoher Punktzahl',r=>r.answers[0].points=3],
 ['nicht erlaubtem Viertelpunkt',r=>r.answers[0].points=.25],
 ['unklarem Status',r=>r.answers[0].status='guaranteed'],
 ['fehlender Begründung',r=>delete r.answers[0].reason],
 ['Punkten bei unbewertbarem Kontext',r=>r.answers[0].status='ungradable'],
 ['fehlenden Punkten trotz klarer Bewertung',r=>r.answers[0].points=null],
])test('gesamten Vorschlagsblock ablehnen bei '+label,async()=>{const receipt=valid();change(receipt);await assert.rejects(receive(receipt));});
test('technisch unbewertbarer Fall ohne Punkte bleibt gültig',async()=>{const receipt=valid();receipt.answers[0]={id:'s1',points:null,status:'ungradable',reason:'Bild fehlt.'};assert.deepEqual(await receive(receipt),receipt);});
