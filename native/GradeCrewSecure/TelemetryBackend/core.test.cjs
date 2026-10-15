const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {normalize,tokenMatches,mergeMetrics}=require('./core.cjs');
test('strict metrics never retain names answers or arbitrary fields',()=>{
 assert.throws(()=>normalize({eventId:'a'.repeat(32),kind:'progress',name:'Student'}));
 assert.throws(()=>normalize({eventId:'a'.repeat(32),kind:'progress',completedIds:['q','q']}));
 assert.equal(normalize({eventId:'a'.repeat(32),kind:'progress',completedIds:['q'],touchedIds:['q']}).kind,'progress');
});
test('token matches existing assessment contract and rejects bad tokens',()=>{
 const token='a'.repeat(64),hash=crypto.createHash('sha256').update('gradecrew-assessment-token:v1:'+token).digest('hex');
 assert.equal(tokenMatches(token,hash),true);assert.equal(tokenMatches('b'.repeat(64),hash),false);assert.equal(tokenMatches('',hash),false);
});
test('progress is last snapshot not a count of ever completed questions',()=>{
 const a=mergeMetrics({},normalize({eventId:'a'.repeat(32),kind:'progress',completedIds:['q'],touchedIds:['q'],observedAt:10}));
 const b=mergeMetrics(a,normalize({eventId:'b'.repeat(32),kind:'progress',completedIds:[],touchedIds:['q'],observedAt:20}));
 assert.deepEqual(b.completedIds,[]);assert.equal(b.lastObservedAt,20);
 const stale=mergeMetrics(b,normalize({eventId:'c'.repeat(32),kind:'progress',completedIds:['q'],observedAt:5}));assert.deepEqual(stale.completedIds,[]);
});
test('question IDs survive canonical private-key cleanup even before first metric',()=>{
 const {questionIDs}=require('./core.cjs');
 assert.deepEqual([...questionIDs({}, {grading:{q1:{autoPoints:0},q2:{}}})],['q1','q2']);
 assert.deepEqual([...questionIDs({gradingKey:[{id:'q1'}]},null)],['q1']);
});
