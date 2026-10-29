import {readFileSync} from 'node:fs';
const overhead=Buffer.byteLength(readFileSync(new URL('./system.json',import.meta.url)))+Buffer.byteLength(readFileSync(new URL('./schema.json',import.meta.url)))+8192;
export const MONTHLY_MICROS=20000000;
export const LEGACY_HOLD_MICROS=250000;
// Live retains its separate seven-request pilot; reserve its complete possible
// cost here instead of silently giving Stage an additional EUR20 allowance.
export const LIVE_PILOT_ALLOWANCE_MICROS=7*LEGACY_HOLD_MICROS;
export const PRICING_VERSION='luna-eur-ceiling-20261029';
export const MODEL='gpt-5.6-luna';
export function monthKey(now){return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit'}).format(now);}
const integer=v=>Number.isSafeInteger(v)&&v>=0;
export function quoteReview(task,model,now){
 if(model!==MODEL||!Number.isFinite(now)||now<Date.parse('2026-10-29')||now>=Date.parse('2027-01-27'))throw Error('Wilma-Kostentarif muss geprüft werden. Manuell bewerten.');
 const inputBound=Buffer.byteLength(JSON.stringify(task))+overhead;
 if(inputBound>200000)throw Error('Wilma-Anfrage zu groß für die Kostenfreigabe.');
 return {version:PRICING_VERSION,month:monthKey(now),inputBound,outputBound:4500,maxMicros:inputBound+4500*6};
}
function validBalance(ledger){if(!ledger||!integer(ledger.spentMicros)||!integer(ledger.reservedMicros)||ledger.spentMicros+ledger.reservedMicros>MONTHLY_MICROS)throw Error('Wilma-Kostenstand unklar. Manuell bewerten.');}
export function reserveBalance(ledger,quote){validBalance(ledger);if(!integer(quote.maxMicros)||ledger.spentMicros+ledger.reservedMicros+quote.maxMicros>MONTHLY_MICROS)throw Object.assign(Error('Wilmas Monatslimit von 20 € ist erreicht. Fundus und manuelles Bewerten bleiben verfügbar.'),{httpStatus:429});return {...ledger,reservedMicros:ledger.reservedMicros+quote.maxMicros};}
export function settleBalance(ledger,quote,usage){
 validBalance(ledger);
 if(!usage||!integer(usage.input_tokens)||!integer(usage.output_tokens)||usage.input_tokens>quote.inputBound||usage.output_tokens>quote.outputBound||ledger.reservedMicros<quote.maxMicros)throw Error('Wilma-Verbrauch unklar; Kostenreservierung bleibt bestehen.');
 return {...ledger,reservedMicros:ledger.reservedMicros-quote.maxMicros,spentMicros:ledger.spentMicros+usage.input_tokens+usage.output_tokens*6};
}
