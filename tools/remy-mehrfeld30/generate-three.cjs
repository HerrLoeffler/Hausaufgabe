'use strict';
const OpenAI=require('openai');
const {HttpsError}=require('firebase-functions/v2/https');
const {FieldValue}=require('firebase-admin/firestore');
const {TEXT_MODEL}=require('../../functions/lib/constants');
const {parseStructuredResponse}=require('../../functions/lib/structured-response');
const {build}=require('./recipe-three.cjs');

const requestIdPattern=/^[a-f0-9-]{36}$/i;
const wishPrefix='wish3:';
const structure=(properties)=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const string={type:'string'},integer={type:'integer'},array=items=>({type:'array',items});
const schema=structure({recipe:{type:'string',enum:['sources','maze','music','unsupported']},title:string,actor:{type:'string',enum:['Maus','Roboter','Figur']},
  sources:array(structure({source:string,claim:string})),
  mazes:array(structure({cells:array(string),x:integer,y:integer,facing:{type:'string',enum:['north','east','south','west']}})),
  meter:integer,bars:array(array(integer))});
const instruction=`Du bist Remy in einem isolierten Aufgabenpilot. Entscheide nach dem Lernziel, welches Rezept passt.
sources: Zwei oder drei kurze selbst formulierte fiktive Quellen und je eine direkt belegte Aussage. Jede Quelle stützt genau ihre eigene Aussage; keine unklaren Alternativen, keine echten personenbezogenen Daten. Keine Reihenfolge im Text erwähnen.
maze: actor benennt Maus, Roboter oder Figur passend zum Wunsch. Zeichne zwei verschiedene 5x5-Raster aus # (Wand) und . (Weg), jeweils fünf Strings mit je fünf Zeichen. x und y sind 0-basiert, Start ist ein freies Innenfeld von 1 bis 3. facing ist north/east/south/west. Direkt vor der Figur muss in einer Situation eine Wand, in der anderen ein Weg liegen. Ein Schritt nach links drehen oder vorwärts ist die feste Regel. Bei anderen ausdrücklich verlangten Regeln: unsupported.
music: meter 3 oder 4 (Vierteltakt). Gib 2 bis 4 unterschiedliche Takte als Arrays der sichtbaren Noten an. Einheiten: Achtel=1, Viertel=2, Halbe=4, Ganze=8. Jeder Takt muss genau eine fehlende Note von 1, 2, 4 oder 8 Einheiten erlauben. Gesamt 2*meter je Takt. Jede Notenfolge ist mindestens eine Note lang. Wenn im Wunsch Tonhöhen, echte Melodien, punktierte Noten oder andere Takte verlangt werden: unsupported.
Für andere Wünsche: unsupported. Für unbenutzte Arrays [], für unbenutzten meter 0. Schreibe nur neue, knappe Inhalte. Der Code erzeugt Arbeitsauftrag, Grafik und Lösung. Schreibe keine Musterlösung in den Titel.`;
async function generate({db,owner,uid,data,secret}){
  const requestId=data.requestId;
  const wish=typeof data.wish==='string'?data.wish.trim():'';
  if(typeof requestId!=='string'||!requestIdPattern.test(requestId)||wish.length<8||wish.length>1000)
    throw new HttpsError('invalid-argument','Beschreibe deinen Wunsch in 8 bis 1000 Zeichen.');
  const day=new Date().toISOString().slice(0,10);
  const ref=owner.collection('recipeDrafts').doc(requestId);
  const quota=owner.collection('recipeBudget').doc(day);
  const reservation=await db.runTransaction(async tx=>{
    const existing=await tx.get(ref);
    if(existing.exists){
      const previous=existing.data();
      if(previous.status==='running'&&Date.now()-(previous.createdAt?.toMillis?.()??Date.now())>120000)
        return {status:'failed',message:'Der frühere Auftrag ist unbestätigt. Er wird nicht erneut ausgelöst. Du kannst einen neuen Wunsch eingeben.'};
      return previous;
    }
    const current=await tx.get(quota);
    const count=current.data()?.count||0;
    if(count>=(uid==='gc-visual255-e2e'?3:6))throw new HttpsError('resource-exhausted','Für heute sind die Versuche im Aufgabenpilot aufgebraucht.');
    tx.set(quota,{count:count+1});
    tx.create(ref,{status:'running',createdAt:FieldValue.serverTimestamp()});
    return null;
  });
  const quizId=wishPrefix+requestId;
  if(reservation)return {status:reservation.status,quizId,message:reservation.message||''};
  let usage=null;
  try{
    const client=new OpenAI({apiKey:secret.value(),timeout:50000,maxRetries:0});
    const response=await client.responses.create({model:TEXT_MODEL,store:false,reasoning:{effort:'low'},
      input:[{role:'system',content:instruction},{role:'user',content:wish}],max_output_tokens:3500,
      text:{format:{type:'json_schema',name:'remy_pilot_recipe_three',strict:true,schema}}});
    usage={responseId:response.id||'',requestId:response._request_id||'',model:response.model||TEXT_MODEL,tokens:response.usage?.total_tokens||0};
    const q=build(parseStructuredResponse(response),'wish');
    await ref.update({status:'ready',q,usage,finishedAt:FieldValue.serverTimestamp()});
    return {status:'ready',quizId};
  }catch(error){
    const message=usage?(error.name==='AiResponseError'?'Remy hat keine verwendbare Antwort geliefert.':error.message):
      'Der KI-Auftrag konnte nicht bestätigt werden. Es wird kein zweiter Aufruf gestartet.';
    await ref.update({status:'failed',message:String(message).slice(0,180),usage,finishedAt:FieldValue.serverTimestamp()});
    return {status:'failed',quizId,message:String(message).slice(0,180)};
  }
}
module.exports={generate,wishPrefix,requestIdPattern};
