import test from 'node:test';
import assert from 'node:assert/strict';
import {renderDiagram} from '../diagrams.mjs';
import {sourceTask,sourceKey,renderSourceText,renderFocusLabels} from '../assistance.mjs';
const grid={kind:'area-grid',title:'Figur',unit:'',columns:4,rows:3,cells:[{x:0,y:0},{x:0,y:1},{x:1,y:1}]};
test('count along numbers existing coloured cells without changing or adding geometry',()=>{
 const plain=renderDiagram(grid),help=renderDiagram(grid,{numberLabels:true,focusIds:['row:0']});
 const geometry=svg=>[...svg.matchAll(/<rect[^>]*>/g)].map(m=>m[0].replace(' data-help-focus="true"',''));
 assert.deepEqual(geometry(help),geometry(plain));assert.equal([...help.matchAll(/data-help-focus="true"/g)].length,1);
 assert.match(help,/>1<\/text>/);assert.match(help,/>2<\/text>/);assert.match(help,/>3<\/text>/);assert.match(help,/viewBox="0 0 500 353"/);
});
test('shared annotations focus bars, points, dimensions, fractions and safe text tokens',()=>{
 const bars=renderDiagram({kind:'bars',title:'Daten',unit:'',max:10,step:2,bars:[{label:'A',value:4}]},{focusIds:['bar:0']});assert.match(bars,/data-bar="0" data-help-focus="true"/);
 const rectangle=renderDiagram({kind:'rectangle',title:'Form',unit:'cm',width:4,height:2},{focusIds:['side:width']});assert.match(rectangle,/<text[^>]*data-help-focus="true"[^>]*>4 cm/);
 const fraction=renderDiagram({kind:'fraction-area',title:'Anteil',unit:'',rows:2,columns:3,selectedRows:1,selectedColumns:2,mode:'part-of-part'},{focusIds:['part:1']});assert.equal([...fraction.matchAll(/data-help-focus="true"/g)].length,1);
 assert.match(renderSourceText('Der <Hund> läuft.',{focusIds:['token:1']}),/data-source-token="1" data-help-focus="true">&lt;Hund&gt;/);
 assert.equal(renderFocusLabels({focusIds:['unit'],regions:[{id:'unit',label:'Einheit <cm>'}]}),'<p class="help-focus-label"><strong>Schau hierhin:</strong> Einheit &lt;cm&gt;</p>');
});
test('source identity survives help microquestions but changes with the actual source',()=>{
 const task={id:'s',prompt:'Wie groß?',contextText:'Eine Figur',diagram:grid},base={id:'session',task};
 assert.equal(sourceKey(base),sourceKey({...base,phase:'help',originalTask:task,task:{...task,prompt:'Welche Zeile?'},assistance:{anchorTaskId:'s'}}));
 assert.notEqual(sourceKey(base),sourceKey({...base,task:{...task,diagram:{...grid,rows:4}}}));
});
test('area cell unit keeps singular Einheitsquadrat while physical units remain unchanged',()=>{
 assert.match(renderDiagram({...grid,unit:'Einheitsquadrate'}),/Ein Kästchen = 1 Einheitsquadrat<\/text>/);
 assert.match(renderDiagram({...grid,unit:'cm²'}),/Ein Kästchen = 1 cm²<\/text>/);
});

test('pending first help retains original source identity before assistance generation succeeds',()=>{const task={id:'same-board',workshop:{tool:'fraction-board',denominator:3},contextText:''};const before={id:'s',task};const pending={id:'s',task:null,originalTask:task,pendingNext:true};assert.equal(sourceKey(pending),sourceKey(before));assert.equal(sourceTask(pending).id,'same-board');});
