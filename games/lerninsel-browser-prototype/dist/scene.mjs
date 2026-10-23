import * as THREE from './vendor/three.module.js';
export function createScene(canvas,onChoose){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#c9e3f2');scene.fog=new THREE.Fog('#c9e3f2',35,65);
 const camera=new THREE.PerspectiveCamera(38,1,.1,100);let angle=.67;
 const setCamera=()=>{camera.position.set(Math.sin(angle)*23,19,Math.cos(angle)*23);camera.lookAt(0,0,0);};setCamera();
 scene.add(new THREE.HemisphereLight('#fff6e7','#416b68',2));const sun=new THREE.DirectionalLight('#fff3de',3);sun.position.set(-8,17,9);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-16,right:16,top:16,bottom:-16});scene.add(sun);
 const material=color=>new THREE.MeshStandardMaterial({color,roughness:.88});
 const add=(geo,color,x,y,z,parent=scene)=>{const mesh=new THREE.Mesh(geo,typeof color==='string'?material(color):color);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 const box=(w,h,d,c,x,y,z,p)=>add(new THREE.BoxGeometry(w,h,d),c,x,y,z,p);
 const cylinder=(r,h,c,x,y,z,p)=>add(new THREE.CylinderGeometry(r,r,h,32),c,x,y,z,p);
 const ocean=add(new THREE.PlaneGeometry(150,150),'#73b4ce',0,-.9,0);ocean.rotation.x=-Math.PI/2;ocean.receiveShadow=false;
 cylinder(11,.8,'#cfbea0',0,-.6,0);cylinder(10.5,.22,'#7d9e71',0,-.07,0);
 const path=new THREE.Shape();path.moveTo(-6,5);path.bezierCurveTo(-4,1,-2,-4,2,-4);path.bezierCurveTo(5,-3,7,1,5,4);path.lineTo(3,5);path.bezierCurveTo(5,1,3,-2,1,-2);path.bezierCurveTo(-1,-2,-3,1,-4,5);path.closePath();const pathMesh=add(new THREE.ShapeGeometry(path),'#e6dcc4',0,.055,0);pathMesh.rotation.x=-Math.PI/2;
 function tree(x,z,size=1){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(size);scene.add(g);cylinder(.13,1.3,'#8d6e49',0,.6,0,g);add(new THREE.IcosahedronGeometry(.95,1),'#457959',0,1.8,0,g);add(new THREE.IcosahedronGeometry(.65,1),'#649467',.5,1.6,0,g);add(new THREE.IcosahedronGeometry(.58,1),'#7da270',-.4,2.0,.25,g);}
 [[-8,-3],[-6,-7],[-1,-8],[5,-7],[8,-2],[8,4],[-8,3],[-3,8]].forEach(([x,z],i)=>tree(x,z,.9+(i%3)*.15));
 for(let i=0;i<20;i++){const a=i*Math.PI/10;add(new THREE.DodecahedronGeometry(.25+(i%3)*.07),'#b6c4b3',Math.sin(a)*9.8,.08,Math.cos(a)*9.8);}
 function label(text,x,y,z,width=2.3){const surface=document.createElement('canvas');surface.width=512;surface.height=128;const c=surface.getContext('2d');c.fillStyle='#ffffff';c.fillRect(0,0,512,128);c.fillStyle='#1c2940';c.font='600 36px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(text,256,64,480);const texture=new THREE.CanvasTexture(surface);texture.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:true}));sprite.position.set(x,y,z);sprite.scale.set(width,width/4,1);scene.add(sprite);return sprite;}
 const spots=[[-4,2],[0,-3.1],[4,1.4],[0,5.6]];const groups=[],plates=[],signs=[],gates=[];const waters=[],models=[],tickGroups=[];let activeIndex=0;
 spots.forEach(([x,z],i)=>{const g=new THREE.Group();g.position.set(x,0,z);g.userData.station=i;scene.add(g);groups.push(g);
  plates.push(cylinder(1.55,.12,'#eee7d6',0,.13,0,g));
  cylinder(.06,1.3,'#6b826f',-.9,.8,-.9,g);cylinder(.06,1.3,'#6b826f',.9,.8,-.9,g);const wing=box(1.7,.7,.1,'#819780',0,.8,-.9,g);gates.push(wing);
  signs.push(label(`${i+1}`,x,2.65,z,1.65));
  const variants={};models.push(variants);for(const name of ['choice','measure','order','match']){const v=new THREE.Group();g.add(v);variants[name]=v;v.visible=false;}
  [-.65,0,.65].forEach((a,j)=>{box(.46,.35,.4,['#e0bd73','#a8c3d6','#d5ae9b'][j],a,.37,0,variants.choice);});
  const glass=new THREE.MeshStandardMaterial({color:'#d7edf9',transparent:true,opacity:.32,roughness:.3,side:THREE.DoubleSide});cylinder(.54,1.5,glass,0,.9,0,variants.measure);waters[i]=cylinder(.48,.04,'#53aadc',0,.18,0,variants.measure);tickGroups[i]=new THREE.Group();variants.measure.add(tickGroups[i]);
  [-.72,-.24,.24,.72].forEach((a,j)=>{box(.4,.28,.7,j%2?'#9dbca0':'#abc4d9',a,.3,0,variants.order);});
  [-.6,.6].forEach(a=>{cylinder(.32,.22,'#d4ad79',a,.32,0,variants.match);box(.35,.3,.35,'#8eafbf',a,.57,0,variants.match);});

 });
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null,dragged=false;
 canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,a:angle};dragged=false;});
 canvas.addEventListener('pointermove',e=>{if(down&&e.pointerType==='mouse'&&(e.buttons&1)){const dx=e.clientX-down.x;if(Math.abs(dx)>8){dragged=true;angle=down.a+dx*.004;setCamera();}}});
 canvas.addEventListener('pointerup',e=>{if(!down)return;const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y);down=null;if(dragged||moved>12)return;const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(groups,true);for(const hit of hits){let node=hit.object;while(node&&node.userData.station===undefined)node=node.parent;if(node){onChoose(node.userData.station);break;}}});
 canvas.addEventListener('pointercancel',()=>{down=null;});
 const resize=new ResizeObserver(()=>{const w=canvas.clientWidth,h=canvas.clientHeight;if(w&&h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}});resize.observe(canvas);
 let frame=0;renderer.setAnimationLoop(()=>{if(document.hidden)return;renderer.render(scene,camera);canvas.dataset.frames=String(++frame);});canvas.dataset.renderer='webgl';
 return {
  select(index){activeIndex=index;plates.forEach((p,i)=>p.material.color.set(i===index?'#bbd8f2':'#eee7d6'));},
  progress(solved){gates.forEach((g,i)=>{g.rotation.y=solved[i]?1.42:0;g.material.color.set(solved[i]?'#357b5c':'#819780');});},
  fill(value){const water=waters[activeIndex];if(water){const h=Math.max(.035,value*1.35);water.scale.y=h/.04;water.position.y=.17+h/2;}},
  tasks(tasks){signs.forEach((s,i)=>{for(const [name,v] of Object.entries(models[i]))v.visible=name===tasks[i]?.type;const n=tasks[i]?.denominator;if(tasks[i]?.type==='measure'&&Number.isInteger(n)&&n>=2&&n<=20&&tickGroups[i].userData.n!==n){for(const child of [...tickGroups[i].children]){tickGroups[i].remove(child);child.geometry.dispose();child.material.dispose();}for(let j=1;j<=n;j++)box(.25,.02,.035,'#62829d',.37,.18+j*1.35/n,.47,tickGroups[i]);tickGroups[i].userData.n=n;}const text=tasks[i]?`${i+1} · ${({choice:'Wörter',measure:'Messen',order:'Ordnen',match:'Paare'})[tasks[i].type]||'Aufgabe'}`:'Station';const c=s.material.map.image.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,512,128);c.fillStyle='#1c2940';c.font='600 36px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(text,256,64,480);s.material.map.needsUpdate=true;s.visible=i<tasks.length;groups[i].visible=i<tasks.length;});},
  dispose(){renderer.setAnimationLoop(null);resize.disconnect();scene.traverse(o=>{o.geometry?.dispose();if(o.material){o.material.map?.dispose();o.material.dispose?.();}});renderer.dispose();}
 };
}
