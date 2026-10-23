export function formatRallyeClock(endAt, now) {
 const seconds=Math.ceil(Math.max(0,endAt-now)/1000);
 return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
}
