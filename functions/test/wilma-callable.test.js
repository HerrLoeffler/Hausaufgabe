"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const {reviewWilmaAnswers}=require("../wilma-review-callables");
test("Wilma callable rejects missing auth before any cloud read",async()=>{
 const prior=process.env.GCLOUD_PROJECT;process.env.GCLOUD_PROJECT="hausaufgabe-staging";
 try{await assert.rejects(reviewWilmaAnswers.run({data:{action:"decision"}}),error=>error.code==="unauthenticated");}
 finally{if(prior===undefined)delete process.env.GCLOUD_PROJECT;else process.env.GCLOUD_PROJECT=prior;}
});
test("Wilma callable rejects legacy project before cloud access",async()=>{
 const prior=process.env.GCLOUD_PROJECT;process.env.GCLOUD_PROJECT="hausaufgabe-40294";
 try{await assert.rejects(reviewWilmaAnswers.run({data:{action:"review"}}),error=>error.code==="failed-precondition");}
 finally{if(prior===undefined)delete process.env.GCLOUD_PROJECT;else process.env.GCLOUD_PROJECT=prior;}
});
test("normal v2 Firebase config reaches authentication without an extra project variable",async()=>{
 const keys=["GCLOUD_PROJECT","GOOGLE_CLOUD_PROJECT","FIREBASE_CONFIG"],prior=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
 delete process.env.GCLOUD_PROJECT;delete process.env.GOOGLE_CLOUD_PROJECT;process.env.FIREBASE_CONFIG=JSON.stringify({projectId:"hausaufgabe-staging"});
 try{await assert.rejects(reviewWilmaAnswers.run({data:{action:"decision"}}),error=>error.code==="unauthenticated");}
 finally{for(const key of keys)if(prior[key]===undefined)delete process.env[key];else process.env[key]=prior[key];}
});
