export class RosterError extends Error {
 constructor(code,status=400){super(code);this.code=code;this.status=status;}
}
export const fail=(code,status)=>{throw new RosterError(code,status);};
export function keys(value,allowed){if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!allowed.includes(k)))fail('invalid-argument');}
export function text(value,max=100){
 if(typeof value!=='string'||/[\p{Cc}\p{Cf}]/u.test(value))fail('invalid-argument');
 const result=value.trim();if(!result||result.length>max)fail('invalid-argument');return result;
}
export function year(value){const result=text(value,7);if(!/^\d{4}\/\d{2}$/.test(result)||Number(result.slice(-2))!==(Number(result.slice(0,4))+1)%100)fail('invalid-argument');return result;}
export function actor(uid){if(typeof uid!=='string'||!uid||uid.length>128)fail('unauthenticated',401);return uid;}
