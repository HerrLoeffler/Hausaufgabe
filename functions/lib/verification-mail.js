"use strict";
function createVerificationMailer({apiKey,from,fetchImpl=globalThis.fetch}) {
  return async ({to,code,locale,idempotencyKey})=>{
    if(!apiKey||!/^.{1,100}<[^<>\s]+@[^<>\s]+>$|^[^<>\s]+@[^<>\s]+$/.test(from||""))throw new Error("Mail configuration missing");
    const english=locale==="en";
    const subject=english?"Your GradeCrew verification code":"Dein GradeCrew-Bestätigungscode";
    const intro=english?"Enter this code in GradeCrew to confirm your email address.":"Gib diesen Code in GradeCrew ein, um deine E-Mail-Adresse zu bestätigen.";
    const footer=english?"Valid for 10 minutes. If you did not request this code, you can ignore this email.":"10 Minuten gültig. Wenn du den Code nicht angefordert hast, kannst du diese E-Mail ignorieren.";
    const response=await fetchImpl("https://api.resend.com/emails",{method:"POST",signal:globalThis.AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json","Idempotency-Key":idempotencyKey},
      body:JSON.stringify({from,to:[to],subject,text:`${intro}\n\n${code}\n\n${footer}`,html:`<div style="font-family:system-ui,sans-serif;color:#202b3c;max-width:480px;margin:auto;padding:32px"><h1 style="color:#071b3b;font-size:24px">GradeCrew</h1><p>${intro}</p><p style="font-size:36px;letter-spacing:8px;font-weight:700;color:#285ac9">${code}</p><p style="color:#5e6b7b">${footer}</p></div>`})});
    if(!response.ok)throw new Error("Mail delivery unavailable");
  };
}
module.exports={createVerificationMailer};
