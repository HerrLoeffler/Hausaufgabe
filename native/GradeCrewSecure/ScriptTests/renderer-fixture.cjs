const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('../../../tools/ui/node_modules/jsdom');
const root = path.join(__dirname,'../Resources/Exam');
const fixtures = [
  {id:'s',type:'single',options:[{id:'a',text:'A'},{id:'b',text:'B'}]},
  {id:'m',type:'multi',options:[{id:'a',text:'A'},{id:'b',text:'B'}]},
  {id:'d',type:'dropdown',options:[{id:'a',text:'A'}]},
  {id:'tf',type:'truefalse'}, {id:'t',type:'text'}, {id:'n',type:'number'},
  {id:'g',type:'gapfill',segments:[{type:'text',text:'Das ist '},{type:'gap',id:'g1'}]},
  {id:'match',type:'matching',leftItems:[{id:'l',text:'Links'}],rightItems:[{id:'r',text:'Rechts'}]},
  {id:'order',type:'ordering',items:[{id:'x',text:'Eins'},{id:'y',text:'Zwei'}]},
  {id:'group',type:'grouping',items:[{id:'x',text:'Wort'}],groups:[{id:'gg',name:'Gruppe'}]},
  {id:'mark',type:'markwords',passage:'Ein kurzer Satz.'}
].map(q=>({...q,text:'Aufgabe '+q.id,points:1}));
function setup(answers={}, paper=fixtures) {
  const dom = new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{runScripts:'outside-only',url:'https://local.invalid/',pretendToBeVisual:true});
  const w = dom.window, messages=[];
  w.scrollTo=()=>{}; w.HTMLElement.prototype.scrollIntoView=()=>{};
  w.CSS = {escape:s=>String(s)};
  w.__GC_EXAM__={paper,quiz:{contentLocale:'de-DE'},answers,revision:4};
  w.webkit={messageHandlers:{gradecrewSecure:{postMessage:m=>messages.push(m)}}};
  w.eval(fs.readFileSync(path.join(root,'question-progress.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'question-renderer.js'),'utf8')+'\n'+(fs.existsSync(path.join(root,'question-navigation.js'))?fs.readFileSync(path.join(root,'question-navigation.js'),'utf8'):'')+'\n'+fs.readFileSync(path.join(root,'native-exam.js'),'utf8')+'\nwindow.createQuestionNavigation=createQuestionNavigation;');
  return {dom,w,messages};
}

module.exports={setup,fixtures,root};
