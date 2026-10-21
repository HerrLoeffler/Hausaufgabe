const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../../gradecrew-entry-flow.js'),'utf8');
function height(width,windowHeight){let value;const stage={style:{setProperty:(_,v)=>value=v}};const page={getBoundingClientRect:()=>({top:100,width})};const lead={getBoundingClientRect:()=>({height:210})};const authView={classList:{contains:()=>false},dataset:{entryState:'start'},querySelector:s=>({'.gcHeroPage':page,'.gcHeroVisual':{},'.gcHeroStage':stage,'.gcHeroLead':lead}[s])};const c={window:{innerWidth:width,innerHeight:windowHeight,scrollY:0,addEventListener(){}},document:{querySelector:()=>null},MutationObserver:class{observe(){}},requestAnimationFrame:fn=>{fn();return 1;}};vm.createContext(c);const start=source.indexOf('function installHeroViewportFit(');const end=source.indexOf('\nfunction ',start+10);vm.runInContext(source.slice(start,end),c);c.installHeroViewportFit(authView);return value;}
test('desktop hero fits remaining window height instead of forcing scroll',()=>{assert.equal(height(1920,958),'858px');assert.equal(height(1920,1349),'1249px');assert.equal(height(1920,650),'550px');});

test('auth scrolling follows the visible viewport when an on-screen keyboard reduces height', () => {
  const heights = [], frames = [], resize = [];
  const visualViewport = { height: 420, addEventListener: (_event, callback) => resize.push(callback) };
  const authView = { classList: { contains: () => false }, dataset: { entryState: 'login' }, querySelector: () => null };
  const context = {
    window: { innerWidth: 390, innerHeight: 844, visualViewport, addEventListener() {} },
    document: { body: { style: { setProperty: (name, value) => heights.push([name, value]) } }, querySelector: () => null },
    MutationObserver: class { observe() {} }, requestAnimationFrame: callback => { frames.push(callback); return frames.length; }
  };
  vm.createContext(context);
  const start = source.indexOf('function installHeroViewportFit('), end = source.indexOf('\nfunction ', start + 10);
  vm.runInContext(source.slice(start, end), context);
  context.installHeroViewportFit(authView); frames.shift()();
  assert.deepEqual(heights.at(-1), ['--gc-entry-viewport-height', '420px']);
  visualViewport.height = 844; resize[0](); frames.shift()();
  assert.deepEqual(heights.at(-1), ['--gc-entry-viewport-height', '844px']);
});
