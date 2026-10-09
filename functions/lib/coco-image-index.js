'use strict';
const {createHash}=require('node:crypto');
function imageKey(value){return createHash('sha256').update(String(value||'')).digest('hex');}
function imageSources(question){return [question,...(question.options||[])].filter(q=>typeof q.imageDataUrl==='string'&&/^data:image\/(?:png|jpeg|webp);base64,/.test(q.imageDataUrl)&&q.imageDataUrl.length<=1000000);}
async function enrichImages(questions,lookup){return Promise.all(questions.map(async q=>{const sources=imageSources(q);const descriptions=await Promise.all(sources.map(s=>lookup(imageKey(s.imageDataUrl))));return {...q,searchImages:sources.map((source,index)=>({src:source.imageDataUrl,description:descriptions[index]||source.imageAlt||""})),unindexedImageCount:descriptions.filter(value=>!value).length,imageDescription:[q.imageDescription,...descriptions].filter(Boolean).join(' ')};}));}
async function indexMissingImages({quizzes,questions,lookup,reserve,describe,finish},limit=6){
 let indexed=0,failed=0,pending=0,remaining=0;const seen=new Set();
 for(const quiz of quizzes){if(quiz.isDeleted||quiz.rightsHold)continue;
  for(const q of await questions(quiz.id))for(const source of imageSources(q)){
   const key=imageKey(source.imageDataUrl);if(seen.has(key))continue;seen.add(key);if(await lookup(key))continue;
   if(indexed+failed>=limit){remaining++;continue;}
   if(!await reserve(key)){pending++;continue;}
   try{const description=String(await describe(source.imageDataUrl)||'').trim().slice(0,600);if(!description)throw Error('empty-description');await finish(key,{status:'ready',description});indexed++;}
   catch(_){await finish(key,{status:'failed',description:''});failed++;}
  }
 }
 return {indexed,failed,pending,remaining};
}
module.exports={imageKey,imageSources,enrichImages,indexMissingImages};
