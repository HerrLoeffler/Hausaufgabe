export const SCENES=Object.freeze(['welcome','remy','editor','student','submit','results','finish']);
export function validScene(value){return value?.version===1&&SCENES.includes(value.scene)?value.scene:null;}
export function allowLocalRequest(headers,port){return ['127.0.0.1','localhost'].some(host=>headers.host===`${host}:${port}`&&headers.origin===`http://${host}:${port}`);}
