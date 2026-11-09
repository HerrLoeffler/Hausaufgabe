const test=require('node:test'),assert=require('node:assert/strict');
const {deviceExitAction}=require('../lib/classroom-device-actions');
const action={kind:'classroom_device_exit_v1',quizId:'Q',assignmentId:'A',studentId:'S',attemptId:'T',generation:2,actionId:'exit1',state:'pending'};
const fail=(code,message)=>{throw Object.assign(Error(message),{code})};
test('device exit acknowledgements and resume never overtake delivery or another action',()=>{
 assert.throws(()=>deviceExitAction(action,{operation:'ack',actionId:'wrong',outcome:'ended',now:2,fail}),{code:'aborted'});
 assert.throws(()=>deviceExitAction(action,{operation:'resume',actionId:'exit1',now:2,fail}),{code:'failed-precondition'});
 const arrived=deviceExitAction(action,{operation:'poll',now:2,fail});assert.equal(arrived.state,'delivered');
 const ended=deviceExitAction(arrived,{operation:'ack',actionId:'exit1',outcome:'ended',now:3,fail});assert.equal(ended.state,'ended');
 const resume=deviceExitAction(ended,{operation:'resume',actionId:'exit1',now:4,fail});assert.equal(resume.state,'resume_allowed');
 assert.throws(()=>deviceExitAction(resume,{operation:'ack',actionId:'exit1',outcome:'ended',now:5,fail}),{code:'aborted'});
});
