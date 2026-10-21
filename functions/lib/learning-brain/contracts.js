'use strict';
const {LearningError}=require('./service');
function requireLearningIdentity({project,uid,profile,deleted=false}){
 if(project!=='gradecrew-staging-2026')throw new LearningError('failed-precondition','Das Lerngehirn ist nur in der getrennten Testumgebung verfügbar.');
 if(!uid)throw new LearningError('unauthenticated','Bitte mit deinem eigenen Zugang anmelden.');
 if(!profile||deleted||profile.accountDeletionId||(profile.status&&profile.status!=='active')||!['student','teacher','admin'].includes(profile.role))throw new LearningError('permission-denied','Dieses Konto ist nicht für die Testübung freigeschaltet.');
 return uid;
}
module.exports={requireLearningIdentity};
