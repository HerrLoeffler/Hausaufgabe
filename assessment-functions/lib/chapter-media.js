'use strict';
const {createHash}=require('node:crypto');
const fields=['id','position','chapterId','type','text','points','options','acceptedAnswers','manualReview','correctBoolean','pairs','items','acceptedOrders','groups','passage','targetWords','markGroups','gapColors','numericAnswer','tolerance','unit'];
const imageFields=['imageDataUrl','imageUrl','imagePath','imageAlt','imageChoicesOnly'];
function imageData(q){return Object.fromEntries(imageFields.filter(k=>q[k]!==undefined).map(k=>[k,q[k]]));}
function snapshotChapterQuestions(quizId,source){
 const assets=[];
 const questions=source.map(q=>{
  const frozen=Object.fromEntries(fields.filter(k=>q[k]!==undefined).map(k=>[k,k==='options'?q.options.map(o=>({text:o.text||'',correct:o.correct===true})):q[k]]));
  const media={...imageData(q),options:(q.options||[]).map(imageData)};
  if(Object.keys(imageData(q)).length||media.options.some(o=>Object.keys(o).length)){
   const assetId=createHash('sha256').update(JSON.stringify({quizId,questionId:q.id,media})).digest('hex');
   frozen.reviewMediaAssetId=assetId;assets.push({assetId,data:{quizId,questionId:q.id,kind:'chapter_review_image',media}});
  }
  return frozen;
 });
 return {questions,assets};
}
module.exports={snapshotChapterQuestions};
