'use strict';
const {onSchedule}=require('firebase-functions/v2/scheduler');
const {onDocumentDeleted}=require('firebase-functions/v2/firestore');
const {REGION}=require('./lib/constants');
const {imageStorage}=require('./feedback-image-storage');
exports.cleanupVisualFeedbackImages=onSchedule({region:REGION,schedule:'every 60 minutes',timeZone:'Etc/UTC',timeoutSeconds:300,memory:'256MiB'},async()=>{
 const {db,service}=imageStorage();const snap=await db.collection('reviewImageLeases').where('cleanupAt','<=',Date.now()).limit(500).get();
 for(const doc of snap.docs){const row=doc.data();await service.remove({imageId:doc.id,ownerId:row.ownerId},'expired');}
});
exports.purgeVisualFeedbackImagesOnAccountDeletion=onDocumentDeleted({region:REGION,document:'users/{uid}',retry:true,timeoutSeconds:300},async event=>{
 const {db,service}=imageStorage(),uid=event.params.uid;
 // Account deletion is idempotent; all image leases for this owner are private.
 for(;;){const snap=await db.collection('reviewImageLeases').where('ownerId','==',uid).limit(100).get();if(snap.empty)break;for(const doc of snap.docs){await service.remove({imageId:doc.id,ownerId:uid});await doc.ref.delete();}}
});
exports.purgeVisualFeedbackImageOnReportDeletion=onDocumentDeleted({region:REGION,document:'feedback/{id}',retry:true},async event=>{
 const row=event.data?.data();if(!row?.attachment?.imageId||row.category!=='screenshot_error')return;
 const {service,leases}=imageStorage();if(await leases.get(row.attachment.imageId))await service.remove({imageId:row.attachment.imageId,ownerId:row.authorId});
});
