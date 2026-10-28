"use strict";
const {onCall,HttpsError}=require("firebase-functions/v2/https");
const {defineSecret}=require("firebase-functions/params");
const {getAuth}=require("firebase-admin/auth");
const {getFirestore}=require("firebase-admin/firestore");
const {requireAiUser}=require("./lib/access");
const {requireAccountWrite}=require("./lib/account-state");
const {consumeQuota,recordUsage}=require("./lib/usage");
const {getOpenAI}=require("./lib/openai-client");
const {privateResultStore}=require("./lib/media-operation");
const {REGION,TEXT_MODEL}=require("./lib/constants");
const {wilmaDeploymentProject}=require("./lib/wilma-project");
const OPENAI_API_KEY=defineSecret("OPENAI_API_KEY");
const statusCodes={400:"invalid-argument",401:"unauthenticated",403:"permission-denied",409:"failed-precondition",429:"resource-exhausted",503:"unavailable"};
async function handler(request){
  const projectId=wilmaDeploymentProject();
  if(!["hausaufgabe-staging","gradecrew-staging-2026"].includes(projectId))throw new HttpsError("failed-precondition","Wilma: Projekt nicht zugelassen.");
  const bearer=request.rawRequest?.headers?.authorization;
  if(!request.auth?.uid||typeof bearer!=="string"||!bearer.startsWith("Bearer "))throw new HttpsError("unauthenticated","Bitte anmelden.");
  let identity;
  try{identity=await getAuth().verifyIdToken(bearer.slice(7),true);}catch{throw new HttpsError("unauthenticated","Bitte erneut anmelden.");}
  if(identity.uid!==request.auth.uid)throw new HttpsError("unauthenticated","Konto stimmt nicht überein.");
  const {createTeacherWilmaRuntime}=await import("./lib/wilma/runtime.mjs");
  const {createWilmaProvider}=await import("./lib/wilma/provider.mjs");
  const runtime=createTeacherWilmaRuntime({projectId,db:getFirestore(),requireTeacher:requireAiUser,requireAccountWrite,consumeQuota,resultStore:privateResultStore(),provider:async(task,actor)=>createWilmaProvider({client:getOpenAI(),model:TEXT_MODEL,recordUsage})(task,actor)});
  try{return await runtime(request);}catch(error){
    if(error instanceof HttpsError)throw error;
    const code=statusCodes[error.httpStatus]||"unavailable";
    throw new HttpsError(code,error.httpStatus?error.message:"Wilma ist gerade nicht verfügbar. Vorhandene Punkte bleiben erhalten.");
  }
}
module.exports={reviewWilmaAnswers:onCall({region:REGION,secrets:[OPENAI_API_KEY],timeoutSeconds:180,memory:"512MiB",maxInstances:2,enforceAppCheck:false,cors:["https://gradecrew.de","https://www.gradecrew.de","https://hausaufgabe-staging.web.app","https://gradecrew-staging-2026.web.app"]},handler)};
