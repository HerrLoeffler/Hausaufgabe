"use strict";
// Firebase CLI and direct v2 deployments expose project identity differently.
// Accept the trusted Firebase config only when every configured ID agrees.
function wilmaDeploymentProject(env=process.env){
  let firebase={};
  try{firebase=JSON.parse(env.FIREBASE_CONFIG||"{}");}catch{return null;}
  const ids=[env.GCLOUD_PROJECT,env.GOOGLE_CLOUD_PROJECT,firebase.projectId].filter(Boolean);
  return ids.length&&new Set(ids).size===1?ids[0]:null;
}
module.exports={wilmaDeploymentProject};
