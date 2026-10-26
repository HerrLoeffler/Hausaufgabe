"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {createVerificationMailer}=require("../lib/verification-mail");
test("mail adapter refuses incomplete configuration before contacting provider",async()=>{
 let calls=0;await assert.rejects(createVerificationMailer({apiKey:"",from:"",fetchImpl:()=>calls++})({}));assert.equal(calls,0);
});
test("mail adapter sends a localized, bounded verification message with idempotency",async()=>{
 let sent;const send=createVerificationMailer({apiKey:"synthetic-not-secret",from:"GradeCrew <test@example.invalid>",fetchImpl:async(url,request)=>{sent={url,request};return {ok:true};}});
 await send({to:"teacher@example.invalid",code:"123456",locale:"en",idempotencyKey:"synthetic-1"});
 const data=JSON.parse(sent.request.body);assert.deepEqual(data.to,["teacher@example.invalid"]);assert.match(data.text,/123456/);assert.match(data.text,/10 minutes/);assert.equal(sent.request.headers["Idempotency-Key"],"synthetic-1");assert.equal(sent.url,"https://api.resend.com/emails");
});
