"use strict";
const {randomBytes,timingSafeEqual}=require("node:crypto");
const {annualSchoolPeriod}=require("./domain/contracts");
const {SCHOOL_ANNUAL_SEAT_MINOR}=require("./domain/catalog");

function createSchoolOperations({store,now,caller,context,admin,identity,fail,key,identifier,requestId}) {
  const schoolKey=id=>"billingV2Schools/"+identifier(id);
  const memberKey=(schoolId,personId)=>"billingV2Memberships/"+key(schoolId,personId);
  const audit=(tx,action,schoolId,actorId,reference,extra={})=>tx.create("billingV2Audit/"+key(action,schoolId,reference),{action,schoolId,actorId,atMs:now(),...extra});
  const validRole=role=>["teacher","school_admin","billing"].includes(role);
  async function capacity(tx,personId,alreadyMember=false){const rows=await tx.find("billingV2Memberships",[["personId","==",personId],["status","==","active"]],21);if(!alreadyMember&&rows.length>=20)fail("resource-exhausted","Höchstens 20 aktive Schulzuordnungen sind im Testbetrieb möglich.");}
  function email(value) {
    if(typeof value!=="string"||value.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))fail("invalid-argument","Gültige E-Mail-Adresse erforderlich.");
    return value.trim().toLowerCase();
  }
  async function schoolContext(tx,actor,id,{manage=false}={}) {
    const ctx=await context(tx,actor),school=await tx.get(schoolKey(id)),membership=await tx.get(memberKey(id,actor.uid));
    if(!school||school.status!=="active")fail("not-found","Schule nicht verfügbar.");
    const platformAdmin=ctx.person.role==="admin",active=membership?.status==="active";
    if(!ctx.person.emailVerified||(!platformAdmin&&!active))fail("permission-denied","Kein Zugriff auf diese Schule.");
    const canManage=platformAdmin||(active&&membership.role==="school_admin");
    if(manage&&!canManage)fail("permission-denied","Nur für die Schulverwaltung.");
    return {ctx,school,membership,canManage,canBill:platformAdmin||(active&&["school_admin","billing"].includes(membership.role))};
  }
  async function pending(tx,school) {
    const rows=await tx.find("billingV2Invitations",[["schoolId","==",school.id],["status","==","pending"]],501);
    if(rows.length>500)fail("failed-precondition","Zu viele offene Einladungen, bitte bereinigen.");
    const at=now(),expired=rows.filter(i=>i.expiresAtMs<=at),valid=rows.filter(i=>i.expiresAtMs>at);
    return {valid,reservedSeats:valid.filter(i=>i.reservesSeat).length,
      expire:()=>{for(const item of expired.slice(0,100))tx.patch("billingV2Invitations/"+item.id,{status:"expired",closedAtMs:at});}};
  }
  async function createSchool(request) {
    const actor=await caller(request),data=request.data||{},rid=requestId(data.requestId),owner=await identity(identifier(data.ownerId));
    const name=String(data.name||"").trim().replace(/\s+/g," ");
    if(name.length<2||name.length>200||!Number.isInteger(data.seats)||data.seats<1||data.seats>500)fail("invalid-argument","Schulname und 1 bis 500 Plätze angeben.");
    let calendar;try{calendar=annualSchoolPeriod(data.startDate);}catch{fail("invalid-argument","Gültiges Startdatum erforderlich.");}
    const id=key(actor.uid,"school",rid),periodId=key(id,"first-period"),fingerprint=key(name,owner.uid,data.seats,data.startDate);
    return store.transaction(async tx=>{
      const operator=await context(tx,actor);admin(operator,request,now());
      await context(tx,owner);
      if(!owner.emailVerified)fail("failed-precondition","Schulverwaltung muss die E-Mail-Adresse bestätigt haben.");
      const previous=await tx.get(schoolKey(id));
      if(previous){if(previous.fingerprint!==fingerprint)fail("already-exists","Anfrage-ID bereits anders verwendet.");return{schoolId:id,periodId,replayed:true};}
      await capacity(tx,owner.uid);
      const school={id,name,status:"active",ownerId:owner.uid,seats:data.seats,usedSeats:1,reservedSeats:0,adminCount:1,currentPeriodId:periodId,periodIds:[periodId],renewalMode:"manual_confirmation",createdAtMs:now(),fingerprint};
      tx.create(schoolKey(id),school);
      tx.create("billingV2Periods/"+periodId,{...calendar,schoolId:id,paymentStatus:"open",amountMinor:data.seats*SCHOOL_ANNUAL_SEAT_MINOR,unitAmountMinor:SCHOOL_ANNUAL_SEAT_MINOR,quantity:data.seats,currency:"eur",taxBehavior:"inclusive",invoiceId:null,createdAtMs:now()});
      tx.create(memberKey(id,owner.uid),{schoolId:id,personId:owner.uid,email:owner.email,role:"school_admin",status:"active",seatAssigned:true,joinedAtMs:now()});
      audit(tx,"school_created",id,actor.uid,rid,{ownerId:owner.uid,seats:data.seats});
      return{schoolId:id,periodId,replayed:false};
    });
  }
  async function getSchool(request) {
    const actor=await caller(request),id=identifier(request.data?.schoolId);
    return store.transaction(async tx=>{
      const access=await schoolContext(tx,actor,id),school=access.school;
      const period=school.currentPeriodId?await tx.get("billingV2Periods/"+identifier(school.currentPeriodId)):null;
      const members=access.canManage?await tx.find("billingV2Memberships",[["schoolId","==",id],["status","==","active"]],501):[];
      const invitations=access.canManage?await pending(tx,school):null;
      if(invitations){invitations.expire();tx.patch(schoolKey(id),{reservedSeats:invitations.reservedSeats});}
      const publicPeriod=period?{startDate:period.startDate,endDateExclusive:period.endDateExclusive,startsAtMs:period.startsAtMs,endsAtMs:period.endsAtMs,paymentStatus:period.paymentStatus,...(access.canBill?{amountMinor:period.amountMinor,currency:period.currency,invoiceId:period.invoiceId}: {})}:null;
      return{school:{id,name:school.name,seats:school.seats,usedSeats:school.usedSeats,reservedSeats:invitations?.reservedSeats??school.reservedSeats,renewalMode:school.renewalMode},period:publicPeriod,myRole:access.membership?.role||"platform_admin",canManage:access.canManage,canBill:access.canBill,
        ...(access.canManage?{members:members.map(m=>({personId:m.personId,email:m.email,role:m.role,seatAssigned:m.seatAssigned})),invitations:invitations.valid.map(i=>({id:i.id,email:i.email,role:i.role,expiresAtMs:i.expiresAtMs}))}:{})};
    });
  }
  async function listSchools(request) {
    const actor=await caller(request);
    return store.transaction(async tx=>{
      const ctx=await context(tx,actor);
      let rows;
      if(ctx.person.role==="admin")rows=await tx.find("billingV2Schools",[["status","==","active"]],51);
      else{
        const memberships=await tx.find("billingV2Memberships",[["personId","==",actor.uid],["status","==","active"]],51);
        rows=[];for(const member of memberships.slice(0,50)){const school=await tx.get(schoolKey(member.schoolId));if(school?.status==="active")rows.push(school);}
      }
      return{schools:rows.slice(0,50).map(s=>({id:s.id,name:s.name,seats:s.seats,usedSeats:s.usedSeats})),hasMore:rows.length>50,canCreate:ctx.person.role==="admin"&&ctx.person.emailVerified===true};
    });
  }
  async function inviteSchoolMember(request) {
    const actor=await caller(request),data=request.data||{},id=identifier(data.schoolId),rid=requestId(data.requestId),recipient=email(data.email),role=data.role||"teacher";
    if(!validRole(role))fail("invalid-argument","Ungültige Schulrolle.");
    const invitationId=key(id,actor.uid,rid),secret=randomBytes(32).toString("base64url"),token=invitationId+"."+secret,expiresAtMs=now()+7*86400000;
    return store.transaction(async tx=>{
      const access=await schoolContext(tx,actor,id,{manage:true}),school=access.school;
      const previous=await tx.get("billingV2Invitations/"+invitationId),invitations=await pending(tx,school);
      const members=await tx.find("billingV2Memberships",[["schoolId","==",id],["status","==","active"]],501);
      if(previous){if(previous.email!==recipient||previous.role!==role)fail("already-exists","Anfrage-ID bereits anders verwendet.");return{schoolId:id,invitationId,expiresAtMs:previous.expiresAtMs,replayed:true,requiresReissue:true};}
      if(invitations.valid.length>=500)fail("resource-exhausted","Zuerst offene Einladungen abschließen oder widerrufen.");
      if(members.some(m=>m.email===recipient)||invitations.valid.some(i=>i.email===recipient))fail("already-exists","Für diese Adresse besteht bereits eine Mitgliedschaft oder Einladung.");
      const reservesSeat=role!=="billing";
      if(reservesSeat&&school.usedSeats+invitations.reservedSeats>=school.seats)fail("resource-exhausted","Alle Schulplätze sind vergeben oder reserviert.");
      invitations.expire();tx.patch(schoolKey(id),{reservedSeats:invitations.reservedSeats+(reservesSeat?1:0)});
      tx.create("billingV2Invitations/"+invitationId,{schoolId:id,email:recipient,role,reservesSeat,tokenHash:key(secret),status:"pending",expiresAtMs,createdBy:actor.uid,createdAtMs:now()});
      audit(tx,"school_invited",id,actor.uid,invitationId,{role});
      return{schoolId:id,invitationId,token,expiresAtMs,replayed:false};
    });
  }
  function parseToken(value) {
    const match=typeof value==="string"&&/^([a-f0-9]{64})\.([A-Za-z0-9_-]{43})$/.exec(value);
    if(!match)fail("invalid-argument","Ungültiger Einladungslink.");
    return{id:match[1],secret:match[2]};
  }
  function verifyInvitation(invitation,parsed,actor) {
    if(!invitation||typeof invitation.tokenHash!=="string"||!/^[a-f0-9]{64}$/.test(invitation.tokenHash)||!timingSafeEqual(Buffer.from(invitation.tokenHash,"hex"),Buffer.from(key(parsed.secret),"hex")))fail("not-found","Einladung nicht gefunden.");
    if(!actor.emailVerified||actor.email!==invitation.email)fail("permission-denied","Bitte mit der eingeladenen und bestätigten E-Mail-Adresse anmelden.");
  }
  async function previewSchoolInvitation(request) {
    const actor=await caller(request),parsed=parseToken(request.data?.token);
    return store.transaction(async tx=>{
      await context(tx,actor);
      const invitation=await tx.get("billingV2Invitations/"+parsed.id);verifyInvitation(invitation,parsed,actor);
      if(invitation.status!=="pending"||invitation.expiresAtMs<=now())fail("failed-precondition","Einladung abgelaufen oder bereits verwendet.");
      const school=await tx.get(schoolKey(invitation.schoolId));
      if(!school||school.status!=="active")fail("failed-precondition","Schule nicht verfügbar.");
      const period=await tx.get("billingV2Periods/"+identifier(school.currentPeriodId));
      return{schoolId:school.id,schoolName:school.name,role:invitation.role,endsAtMs:period?.endsAtMs||null,paymentStatus:period?.paymentStatus||"open"};
    });
  }
  async function acceptSchoolInvitation(request) {
    const actor=await caller(request),parsed=parseToken(request.data?.token);
    return store.transaction(async tx=>{
      await context(tx,actor);
      const invitation=await tx.get("billingV2Invitations/"+parsed.id);verifyInvitation(invitation,parsed,actor);
      const id=identifier(invitation.schoolId),school=await tx.get(schoolKey(id)),membership=await tx.get(memberKey(id,actor.uid));
      if(invitation.status==="accepted"&&invitation.acceptedBy===actor.uid&&membership?.status==="active")return{schoolId:id,replayed:true};
      if(invitation.status!=="pending"||invitation.expiresAtMs<=now()||!school||school.status!=="active")fail("failed-precondition","Einladung abgelaufen oder nicht verfügbar.");
      const invitations=await pending(tx,school),needsSeat=invitation.reservesSeat===true;
      const alreadyMember=membership?.status==="active";
      await capacity(tx,actor.uid,alreadyMember);
      const nextMember={schoolId:id,personId:actor.uid,email:actor.email,role:invitation.role,status:"active",seatAssigned:needsSeat,joinedAtMs:now()};
      const targetContext=await context(tx,actor,undefined,{membershipChanges:alreadyMember?[]:[nextMember]});
      if(needsSeat&&!alreadyMember&&school.usedSeats>=school.seats)fail("resource-exhausted","Kein freier Schulplatz.");
      invitations.expire();
      targetContext.saveAccount();
      tx.patch(schoolKey(id),{reservedSeats:Math.max(0,invitations.reservedSeats-(needsSeat?1:0)),usedSeats:school.usedSeats+(!alreadyMember&&needsSeat?1:0),adminCount:school.adminCount+(!alreadyMember&&invitation.role==="school_admin"?1:0)});
      if(!alreadyMember)tx.put(memberKey(id,actor.uid),nextMember);
      tx.patch("billingV2Invitations/"+parsed.id,{status:"accepted",acceptedBy:actor.uid,acceptedAtMs:now()});
      audit(tx,"school_joined",id,actor.uid,parsed.id);
      return{schoolId:id,replayed:false,alreadyMember};
    });
  }
  async function revokeSchoolInvitation(request) {
    const actor=await caller(request),data=request.data||{},id=identifier(data.schoolId),inviteId=identifier(data.invitationId);
    return store.transaction(async tx=>{
      const access=await schoolContext(tx,actor,id,{manage:true}),invitation=await tx.get("billingV2Invitations/"+inviteId),invitations=await pending(tx,access.school);
      if(!invitation||invitation.schoolId!==id)fail("not-found","Einladung nicht gefunden.");
      if(invitation.status!=="pending")return{revoked:false};
      invitations.expire();
      tx.patch(schoolKey(id),{reservedSeats:Math.max(0,invitations.reservedSeats-(invitation.reservesSeat&&invitation.expiresAtMs>now()?1:0))});
      tx.patch("billingV2Invitations/"+inviteId,{status:"revoked",revokedAtMs:now()});
      audit(tx,"school_invitation_revoked",id,actor.uid,inviteId);
      return{revoked:true};
    });
  }
  async function removeSchoolMember(request) {
    const actor=await caller(request),data=request.data||{},id=identifier(data.schoolId),personId=identifier(data.personId),reason=String(data.reason||"").trim();
    if(reason.length<3||reason.length>500)fail("invalid-argument","Grund erforderlich.");
    return store.transaction(async tx=>{
      const access=await schoolContext(tx,actor,id),school=access.school;
      if(!access.canManage&&actor.uid!==personId)fail("permission-denied","Keine Berechtigung für diese Änderung.");
      const member=await tx.get(memberKey(id,personId));
      if(!member||member.status!=="active")return{removed:false};
      if(member.role==="school_admin"&&school.adminCount<=1)fail("failed-precondition","Zuerst eine weitere Schulverwaltung einsetzen.");
      const account=await tx.get("billingV2Accounts/"+personId),profile=await tx.get("users/"+personId),deletion=await tx.get("accountDeletions/"+personId);
      // Cleanup must not need a still-existing Auth account. Recompute only from
      // the protected existing projection and profile; never recreate a person.
      const targetContext=account&&profile&&!deletion&&access.ctx.config.allowedUids.includes(personId)
        ?await context(tx,{uid:personId,registeredAtMs:account.trialStartedAtMs,email:member.email,emailVerified:account.emailVerified===true},undefined,{includeInactive:true,membershipChanges:[{...member,status:"left",seatAssigned:false}]}) : null;
      if(targetContext)targetContext.saveAccount();
      else if(account)tx.patch("billingV2Accounts/"+personId,{writesUntilMs:0,primarySchoolMembershipId:null,emailVerified:false});
      tx.patch(memberKey(id,personId),{status:"left",seatAssigned:false,leftAtMs:now()});
      tx.patch(schoolKey(id),{usedSeats:school.usedSeats-(member.seatAssigned?1:0),adminCount:school.adminCount-(member.role==="school_admin"?1:0)});
      audit(tx,"school_member_removed",id,actor.uid,key(personId,member.joinedAtMs),{personId,reason});
      return{removed:true};
    });
  }
  async function assignSchoolMember(request) {
    const actor=await caller(request),data=request.data||{},id=identifier(data.schoolId),personId=identifier(data.personId),rid=requestId(data.requestId),role=data.role||"teacher",reason=String(data.reason||"").trim();
    if(!validRole(role)||reason.length<3||reason.length>500)fail("invalid-argument","Gültige Rolle und Grund erforderlich.");
    return store.transaction(async tx=>{
      const access=await schoolContext(tx,actor,id,{manage:true});admin(access.ctx,request,now());
      const target=await identity(personId);await context(tx,target);
      if(!target.emailVerified)fail("failed-precondition","E-Mail-Adresse der Lehrkraft muss bestätigt sein.");
      const school=access.school,member=await tx.get(memberKey(id,personId)),invitations=await pending(tx,school);
      const auditId=key("school_member_assigned",id,rid),previous=await tx.get("billingV2Audit/"+auditId),fingerprint=key(actor.uid,personId,role,reason);
      if(previous){if(previous.fingerprint!==fingerprint)fail("already-exists","Anfrage-ID bereits anders verwendet.");return{assigned:true,replayed:true};}
      if(invitations.valid.some(item=>item.email===target.email))fail("already-exists","Zuerst die bestehende Einladung widerrufen.");
      const active=member?.status==="active",wasSeat=active&&member.seatAssigned,needsSeat=role!=="billing";
      await capacity(tx,personId,active);
      const nextMember={schoolId:id,personId,email:target.email,role,status:"active",seatAssigned:needsSeat,joinedAtMs:active?member.joinedAtMs:now(),assignedBy:actor.uid};
      const targetContext=await context(tx,target,undefined,{membershipChanges:[nextMember]});
      const usedSeats=school.usedSeats-(wasSeat?1:0)+(needsSeat?1:0),adminCount=school.adminCount-(active&&member.role==="school_admin"?1:0)+(role==="school_admin"?1:0);
      if(adminCount<1)fail("failed-precondition","Zuerst eine weitere Schulverwaltung einsetzen.");
      if(usedSeats+invitations.reservedSeats>school.seats)fail("resource-exhausted","Alle Schulplätze sind vergeben oder reserviert.");
      invitations.expire();targetContext.saveAccount();tx.patch(schoolKey(id),{usedSeats,adminCount,reservedSeats:invitations.reservedSeats});
      tx.put(memberKey(id,personId),nextMember);
      tx.create("billingV2Audit/"+auditId,{action:"school_member_assigned",schoolId:id,actorId:actor.uid,personId,role,reason,fingerprint,atMs:now()});
      return{assigned:true,replayed:false};
    });
  }
  return{createSchool,getSchool,listSchools,inviteSchoolMember,previewSchoolInvitation,acceptSchoolInvitation,revokeSchoolInvitation,removeSchoolMember,assignSchoolMember};
}
module.exports={createSchoolOperations};
