// Synthetic fixtures for the isolated local school tests.
export function schoolFixture(store){
 const p=store.school.previewSetup('admin',{name:'Beispielschule',displayName:'Ada'});store.school.command('admin',{command:'createSchool',payload:{name:p.name,displayName:p.displayName,previewHash:p.planHash},expectedRevision:p.revision,operationId:crypto.randomUUID()});
 const a=store.school.read('admin'),invite=store.school.command('admin',{command:'invite',payload:{name:'Bea',role:'teacher'},expectedRevision:a.revision,operationId:crypto.randomUUID()});
 store.school.command('teacher',{command:'claimInvitation',payload:{secret:invite.invitation.secret,displayName:'Bea'},expectedRevision:0,operationId:crypto.randomUUID()});const next=store.school.read('admin');store.school.command('admin',{command:'approveRequest',payload:{requestId:next.requests[0].id},expectedRevision:next.revision,operationId:crypto.randomUUID()});
 return store.school.read('admin').currentSchool.id;
}
