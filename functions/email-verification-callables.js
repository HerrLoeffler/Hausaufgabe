"use strict";
const {onCall,HttpsError}=require("firebase-functions/v2/https");
const {defineSecret,defineString}=require("firebase-functions/params");
const {getFirestore}=require("firebase-admin/firestore");
const {getAuth}=require("firebase-admin/auth");
const {REGION}=require("./lib/constants");
const {createEmailVerification}=require("./lib/email-verification");
const {createVerificationMailer}=require("./lib/verification-mail");
const mailKey=defineSecret("GRADECREW_RESEND_API_KEY"),hashKey=defineSecret("GRADECREW_VERIFICATION_HMAC_KEY");
const sender=defineString("GRADECREW_EMAIL_FROM",{default:""});
const options={region:REGION,timeoutSeconds:30,memory:"256MiB",maxInstances:5,secrets:[mailKey,hashKey],enforceAppCheck:false};
function call(method){return onCall(options,async request=>{
  try{return await createEmailVerification({db:getFirestore(),auth:getAuth(),secret:hashKey.value(),sendMail:createVerificationMailer({apiKey:mailKey.value(),from:sender.value()})})[method](request);}
  catch(error){const codes=["unauthenticated","permission-denied","invalid-argument","failed-precondition","resource-exhausted","deadline-exceeded","aborted","unavailable"];
    if(codes.includes(error.code))throw new HttpsError(error.code,error.message);
    throw new HttpsError("unavailable","Die E-Mail-Bestätigung ist gerade nicht verfügbar. Bitte versuche es erneut.");}
});}
module.exports={requestEmailVerificationCode:call("requestCode"),confirmEmailVerificationCode:call("confirmCode")};
