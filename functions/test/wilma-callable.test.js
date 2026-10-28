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
