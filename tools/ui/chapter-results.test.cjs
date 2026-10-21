const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../../shared/chapter-contract');const source=fs.readFileSync('app.js','utf8');
test('teacher chapter table uses frozen labels and escapes author text',()=>{
 const c={Chapters:C,escapeHtml:s=>String(s).replaceAll('<','&lt;').replaceAll('>','&gt;')};vm.createContext(c);vm.runInContext(source.slice(source.indexOf('function chapterResultsMarkup('),source.indexOf('\nfunction renderResultsTable(')),c);
 const html=c.chapterResultsMarkup({chapterSnapshot:{chapters:[{id:'ch_a',title:'<Brüche>',position:1}],questions:[{id:'q',chapterId:'ch_a',maxPoints:4}]},grading:{q:{awardedPoints:3,needsReview:false}}});
 assert.match(html,/3\/4/);assert.match(html,/75 %/);assert.match(html,/&lt;Brüche&gt;/);assert.doesNotMatch(html,/<Brüche>/);
});

test('chapter notes use the frozen scale and remain pending until reviewed',()=>{
 const c={Chapters:C,escapeHtml:s=>String(s),gradeFromPercent:(p,scale)=>p>=scale.thresholds[1]?2:4};vm.createContext(c);vm.runInContext(source.slice(source.indexOf('function chapterResultsMarkup('),source.indexOf('\nfunction renderResultsTable(')),c);
 const submission={status:'graded',gradeScaleSnapshot:{thresholds:[95,80,65,50,30,0]},chapterSnapshot:{chapters:[{id:'ch_a',title:'Brüche',position:1}],questions:[{id:'q',chapterId:'ch_a',maxPoints:4}]},grading:{q:{awardedPoints:3}}};
 let html=c.chapterResultsMarkup(submission);assert.match(html,/<th>Note<\/th>/);assert.match(html,/>4<\/td>/);
 html=c.chapterResultsMarkup({...submission,status:'review'});assert.doesNotMatch(html,/>4<\/td>/);assert.match(html,/Bewertung offen/);
});

test('secure student renders supplied chapter notes only in grade release mode',()=>{
 const {JSDOM}=require('jsdom');const studentSource=fs.readFileSync('secure-student.js','utf8');
 for(const mode of ['points_percent','points_grade']){
  const dom=new JSDOM('<section id="secureResult"></section>');const c={document:dom.window.document,$:id=>dom.window.document.getElementById(id),clearTimers(){},clearDraft(){},showOnly(){},Number,Array};vm.createContext(c);
  vm.runInContext(studentSource.slice(studentSource.indexOf('function showReceipt('),studentSource.indexOf('\nasync function submitAssessment(')),c);
  c.showReceipt({resultMode:mode,totalPoints:3,maxPoints:4,percent:75,grade:3,chapterResults:[{title:'Brüche',awardedPoints:3,maxPoints:4,percent:75,grade:3}]});
  const table=c.document.querySelector('.secureChapterResults');assert.equal(table.textContent.includes('Note 3'),mode==='points_grade');assert.match(table.textContent,/75 %/);dom.window.close();
 }
});

test('class average is a native disclosure with overall grade visible while collapsed',()=>{
 const {JSDOM}=require('jsdom');
 for(const total of [null,{count:3,gradeCount:3,points:7,maxPoints:10,percent:70,grade:2.67}]){
  const c={classAverages:()=>({total,chapters:[],included:total?3:0,pending:1}),gradeFromPercent(){},escapeHtml:s=>String(s)};vm.createContext(c);vm.runInContext(source.slice(source.indexOf('function classAveragesMarkup('),source.indexOf('\nfunction renderResultsTable(')),c);
  const dom=new JSDOM(c.classAveragesMarkup([]));const detail=dom.window.document.querySelector('details.chapterClassAverages');assert.ok(detail);assert.equal(detail.open,false);assert.match(detail.querySelector('summary').textContent,/Klassendurchschnitt/);assert.match(detail.querySelector('summary').textContent,total?/Ø Gesamtnote 2,67/:/Ø Gesamtnote –/);dom.window.close();
 }
});
