'use strict';const test=require('node:test'),assert=require('node:assert/strict');
const {snapshotChapterQuestions}=require('../lib/chapter-media');
test('frozen review references retain question and choice images outside attempt payload',()=>{
 const source=[{id:'q',text:'Bild',type:'single',points:2,chapterId:'ch_a',imageDataUrl:'data:image/png;base64,AAAA',options:[{text:'A',correct:true,imageDataUrl:'data:image/png;base64,BBBB'}]}];
 const a=snapshotChapterQuestions('quiz',source);assert.equal(a.assets.length,1);assert.ok(a.questions[0].reviewMediaAssetId);assert.equal(a.questions[0].imageDataUrl,undefined);assert.equal(a.questions[0].options[0].imageDataUrl,undefined);assert.equal(a.assets[0].data.media.options[0].imageDataUrl,source[0].options[0].imageDataUrl);
 assert.equal(snapshotChapterQuestions('quiz',source).assets[0].assetId,a.assets[0].assetId);source[0].imageDataUrl+='X';assert.notEqual(snapshotChapterQuestions('quiz',source).assets[0].assetId,a.assets[0].assetId);
});
