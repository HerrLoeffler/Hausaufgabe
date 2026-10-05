// Share only an in-flight connection check; never cache liveness across requests.
export function createSnapshotReader(connect){
 let pending;
 return ()=>{pending??=connect().finally(()=>{pending=undefined;});return pending;};
}
