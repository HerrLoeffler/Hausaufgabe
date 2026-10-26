const test=require('node:test'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
test('device exit requires a supported current attempt, a reason and an explicit confirmation',async t=>{
 const dom=new JSDOM('<section></section>');t.after(()=>dom.window.close());const {mountDeviceHelp}=await import('../../classroom/device-help.mjs');const host=dom.window.document.querySelector('section'),calls=[];
 mountDeviceHelp({host,row:{studentId:'s',attemptId:'a',generation:2,name:'Test',deviceCapabilities:null},assignment:{id:'assigned'},api:{},onChanged(){}});
 assert.equal(host.querySelector('form'),null);assert.match(host.textContent,/noch nicht/);assert.equal(host.querySelector('button').disabled,true);assert.equal(host.querySelector('details').open,false);
 mountDeviceHelp({host,row:{studentId:'s',attemptId:'a',generation:2,name:'Test',deviceCapabilities:{exitProtocol:1}},assignment:{id:'assigned'},api:{teacher:async(c,p)=>{calls.push([c,p]);return {action:{state:'pending'}};}},onChanged(){}});
 assert.equal(host.querySelector('form'),null);host.querySelector('button').click();const form=host.querySelector('form');form.querySelector('textarea').value='Gerät hängt';form.querySelector('[type=checkbox]').checked=true;
 form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));form.dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));await Promise.resolve();await Promise.resolve();assert.equal(calls.length,1);assert.equal(calls[0][1].attemptId,'a');assert.equal(calls[0][1].expectedGeneration,2);assert.equal(calls[0][1].confirm,true);assert.match(host.textContent,/Verbindung/);
});
