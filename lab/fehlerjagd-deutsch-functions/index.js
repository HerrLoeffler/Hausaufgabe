"use strict";
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { onRequest } = require("firebase-functions/v2/https");
const { fail } = require("./lib/common");
initializeApp();
const db=getFirestore();
const rooms=require("./lib/rooms")(db);
const scores=require("./lib/highscore")(db);
async function dispatch(action,payload){if(typeof rooms[action]==="function")return rooms[action](payload);if(typeof scores[action]==="function")return scores[action](payload);fail("action_invalid","Unbekannte Aktion.",404);}
exports.fehlerjagdApi=onRequest({region:"europe-west1",cors:true,timeoutSeconds:30,memory:"256MiB"},async(req,res)=>{if(req.method==="OPTIONS")return res.status(204).end();if(req.method!=="POST")return res.status(405).json({ok:false,error:{message:"POST erforderlich."}});try{const data=await dispatch(String(req.body?.action||""),req.body?.payload||{});res.json({ok:true,data});}catch(err){console.error("Fehlerjagd API",err);res.status(err.httpStatus||500).json({ok:false,error:{code:err.apiCode||"internal",message:err.apiCode?err.message:"Technischer Fehler."}});}});
