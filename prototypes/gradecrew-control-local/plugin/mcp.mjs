import {createInterface} from 'node:readline';
import {readFile} from 'node:fs/promises';
import {snapshot,post} from './client.mjs';
import {classify} from './taxonomy.mjs';
const uri='ui://gradecrew/central.html';
const string=(maxLength=10000)=>({type:'string',minLength:1,maxLength});
const schema=(properties,required=Object.keys(properties))=>({type:'object',properties,required,additionalProperties:false});
const tools=[
 {name:'gradecrew_open',title:'Aufgabenübersicht',description:'GradeCrew Central öffnen: datierter Aufgabenbestand, nächste Schritte, Fragen und Antworten. Snapshot, keine Live-Deployment-Prüfung.',inputSchema:schema({}),annotations:{readOnlyHint:true,openWorldHint:false},_meta:{ui:{resourceUri:uri,visibility:['model','app']},'openai/ui':{entrypoints:[{type:'global'},{type:'thread'}]}}},
 {name:'gradecrew_task',title:'GradeCrew-Aufgabe lesen',description:'Eine Aufgabe und ihre gespeicherten Fragen/Antworten lesen. Quellen vor Aussagen zum aktuellen Stand frisch prüfen.',inputSchema:schema({taskId:string(100)}),annotations:{readOnlyHint:true,openWorldHint:false},_meta:{ui:{visibility:['model','app']}}},
 {name:'gradecrew_question',title:'Standfrage speichern',description:'Speichert eine ausdrücklich gewünschte Standfrage. Startet keinen Agenten, keine Implementierung und keinen Modellwechsel. Dieselbe requestId bei Wiederholung verwenden.',inputSchema:schema({taskId:string(100),text:string(),requestId:string(80),sourceCommit:string(100)}),annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:true,openWorldHint:false},_meta:{ui:{visibility:['model','app']}}},
 {name:'gradecrew_answer',title:'Antwort zurückmelden',description:'Antwort auf eine gespeicherte Standfrage nach Prüfung zurückschreiben. Quellen, Unsicherheit und nächsten Schritt im Text nennen. Quellenstand ehrlich angeben. Verändert keine Release-Stufe. Keine Antwort ohne passenden Nutzerauftrag erfinden.',inputSchema:schema({id:string(100),text:string(20000),actor:string(100),sourceCommit:string(100)}),annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:true,openWorldHint:false},_meta:{ui:{visibility:['model']}}}
];
function validate(def,args){
 if(!args||typeof args!=='object'||Array.isArray(args))throw Error('Objekt erwartet.');
 for(const k of Object.keys(args))if(!Object.hasOwn(def.properties,k))throw Error('Unbekanntes Eingabefeld: '+k);
 for(const k of def.required){const v=args[k],s=def.properties[k];if(typeof v!=='string'||!v.trim()||v.length>s.maxLength)throw Error('Ungültiges Feld: '+k);}
}
const result=data=>({content:[{type:'text',text:JSON.stringify(data)}],structuredContent:data});
async function view(){const {catalog,state}=await snapshot();return {sourceCommit:catalog.sourceCommit,capturedAt:catalog.capturedAt,sourceType:catalog.sourceType,tasks:[...catalog.tasks,...state.tasks].map(classify),questions:state.questions,drafts:state.drafts.map(({id,taskId,status,result,model})=>({id,taskId,status,result,model}))};}
async function call(name,args){
 const def=tools.find(t=>t.name===name);if(!def)throw Error('Unbekanntes Werkzeug.');validate(def.inputSchema,args);
 if(name==='gradecrew_open')return result(await view());
 if(name==='gradecrew_task'){const v=await view();const task=v.tasks.find(t=>t.id===args.taskId);if(!task)throw Error('Aufgabe nicht gefunden.');return result({sourceCommit:v.sourceCommit,task,questions:v.questions.filter(q=>q.taskId===args.taskId)});}
 return result(await post(name==='gradecrew_question'?'/api/questions':'/api/questions/answer',args));
}
async function resource(){
 let html=await readFile(new URL('./ui.html',import.meta.url),'utf8');
 const bridge=await readFile(new URL('./bridge.mjs',import.meta.url),'utf8');
 const ui=await readFile(new URL('./view.mjs',import.meta.url),'utf8');
 html=html.replace('/* GRADECREW_SCRIPT */',bridge+'\n'+ui);
 return {contents:[{uri,mimeType:'text/html;profile=mcp-app',text:html,_meta:{ui:{csp:{connectDomains:[],resourceDomains:[]},prefersBorder:false}}}]};
}
async function route(m){
 switch(m.method){
  case 'initialize': return {protocolVersion:'2025-11-25',capabilities:{tools:{},resources:{}},serverInfo:{name:'gradecrew-central',version:'0.2.2'},instructions:'GradeCrew-Aufgaben und Standfragen. Nutzerauftrag prüfen, Quellen lesen, danach gradecrew_answer aufrufen. Keine Implementierung aus einer reinen Standfrage ableiten. Antworten verändern keine Release-Nachweise.'};
  case 'ping':return {};
  case 'tools/list':return {tools};
  case 'tools/call':try{return await call(m.params?.name,m.params?.arguments??{});}catch(e){return {content:[{type:'text',text:e.message}],structuredContent:{errorStatus:Number.isInteger(e.status)?e.status:null},isError:true};}
  case 'resources/list':return {resources:[{uri,name:'gradecrew-central',title:'GradeCrew Central',mimeType:'text/html;profile=mcp-app'}]};
  case 'resources/templates/list':return {resourceTemplates:[]};
  case 'resources/read':if(m.params?.uri!==uri)throw Object.assign(Error('Ressource unbekannt'),{code:-32602});return resource();
  default:throw Object.assign(Error('Methode nicht unterstützt'),{code:-32601});
 }
}
// MCP stdio is newline-delimited JSON-RPC. Never print logs to stdout.
const rl=createInterface({input:process.stdin,crlfDelay:Infinity});
for await(const line of rl){
 let m;
 try{
  if(Buffer.byteLength(line)>131072)throw Object.assign(Error('Nachricht zu groß'),{code:-32600});
  try{m=JSON.parse(line);}catch{throw Object.assign(Error('Ungültiges JSON'),{code:-32700});}
  if(m?.jsonrpc!=='2.0'||typeof m.method!=='string')throw Object.assign(Error('Ungültige Anfrage'),{code:-32600});
  if(m.id===undefined)continue;
  process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m.id,result:await route(m)})+'\n');
 }catch(e){process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:m?.id??null,error:{code:e.code??-32603,message:e.message}})+'\n');}
}
