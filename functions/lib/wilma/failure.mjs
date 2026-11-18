// Deliberately content-free service metadata. Never include provider messages or answer text.
const reasons=new Set(['provider_incomplete','provider_refusal','provider_format','provider_timeout','provider_access','provider_capacity','provider_unavailable','receipt_invalid','result_store_failed','result_store_unavailable','review_in_progress','result_unknown','receipt_expired','cache_miss']);
const states=new Set(['running','failed','not_started']);
export const safeRequestId=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,180}$/.test(value)?value:null;
export function reviewDetails(reasonCode,reviewState='failed'){
 return {reasonCode:reasons.has(reasonCode)?reasonCode:'result_unknown',reviewState:states.has(reviewState)?reviewState:'failed',recovery:'cached_only'};
}
export function safeReviewDetails(value){return value&&reasons.has(value.reasonCode)?reviewDetails(value.reasonCode,value.reviewState):undefined;}
