const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../../shared/chapter-contract');const source=fs.readFileSync('app.js','utf8');
test('teacher chapter table uses frozen labels and escapes author text',()=>{
 const c={Chapters:C,escapeHtml:s=>String(s).replaceAll('<','&lt;').replaceAll('>','&gt;')};vm.createContext(c);vm.runInContext(source.slice(source.indexOf('function chapterResultsMarkup('),source.indexOf('\nfunction renderResultsTable(')),c);
 const html=c.chapterResultsMarkup({chapterSnapshot:{chapters:[{id:'ch_a',title:'<Brüche>',position:1}],questions:[{id:'q',chapterId:'ch_a',maxPoints:4}]},grading:{q:{awardedPoints:3,needsReview:false}}});
 assert.match(html,/3\/4/);assert.match(html,/75 %/);assert.match(html,/&lt;Brüche&gt;/);assert.doesNotMatch(html,/<Brüche>/);
});
