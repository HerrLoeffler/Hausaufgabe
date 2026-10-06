// Original, reproducible vector artwork. No reference-game assets are included.
export const palette={floor:0xe9be79,tile:0xf4d59b,green:0x45694d,cream:0xf7ebc9,wood:0xa56b43,brick:0xbc6749,dark:0x3e4c35};
export function rounded(g,x,y,w,h,r,color){g.fillStyle(color,1);g.fillRoundedRect(x,y,w,h,r);}
function box(g,x,y,w,h,color,side=0xaa8763){g.fillStyle(0x000000,.12);g.fillRoundedRect(x+4,y+10,w,h+16,6);rounded(g,x,y+16,w,h,5,side);rounded(g,x,y,w,h,6,color);g.lineStyle(2,0xffffff,.25);g.strokeRoundedRect(x+3,y+3,w-6,h-6,4);}
function plant(g,x,y){g.fillStyle(0x000000,.1);g.fillEllipse(x,y+9,45,15);rounded(g,x-14,y-7,28,24,5,0xb76645);g.fillStyle(0x365a36);for(let i=0;i<7;i++){const a=i*2.4;g.fillEllipse(x+Math.sin(a)*12,y-16+Math.cos(a)*9,15,24);}g.fillStyle(0x789747);g.fillEllipse(x-6,y-24,10,24);}
function plate(g,x,y,r){g.fillStyle(0x000000,.08);g.fillEllipse(x+3,y+4,r*2,r*1.3);g.fillStyle(0xfcf7dc);g.fillEllipse(x,y,r*2,r*1.3);g.lineStyle(2,0xcac9ac);g.strokeEllipse(x,y,r*1.6,r*.96);}
export function makeTextures(scene){
 for(let i=0;i<5;i++){
  const g=scene.make.graphics({x:0,y:0,add:false});const shirt=[0x4e7957,0xe49b54,0x7897ab,0xcf7460,0x9278a3][i];
  g.fillStyle(0x443c2d,.18);g.fillEllipse(48,121,63,18);
  rounded(g,24,103,18,18,7,0x5a4531);rounded(g,53,103,18,18,7,0x5a4531);
  rounded(g,14,64,68,48,20,shirt);rounded(g,24,76,48,36,14,i===0?0xf3ead4:shirt);
  if(i===0){rounded(g,36,71,24,9,3,0x385a41);g.lineStyle(3,0x385a41);g.lineBetween(28,77,34,66);g.lineBetween(61,77,56,66);}
  g.fillStyle(0xc49164);g.fillEllipse(17,88,17,22);g.fillEllipse(78,88,17,22);
  g.fillStyle(0xb8885d);g.fillCircle(48,51,28);g.fillStyle([0xe3b78c,0xd8a36d,0xc38d60,0xedbf96,0xd9a874][i]);g.fillCircle(47,47,27);
  if(i===0){rounded(g,22,14,51,19,7,0xe9e7d7);g.fillStyle(0xfffdf2);g.fillCircle(31,15,15);g.fillCircle(48,11,18);g.fillCircle(64,16,15);rounded(g,23,24,50,9,3,0xfffdf2);}
  else{g.fillStyle([0x6b4932,0x4a3325,0x96703c,0x4c3527,0x745c3b][i]);g.fillEllipse(48,27,53,25);g.fillEllipse(23,41,9,25);}
  g.fillStyle(0x383d2c);g.fillEllipse(38,48,4,6);g.fillEllipse(57,48,4,6);
  g.fillStyle(0xe59678,.55);g.fillEllipse(31,59,10,5);g.fillEllipse(65,59,10,5);
  g.lineStyle(2,0x754e37);g.beginPath();g.moveTo(42,60);g.lineTo(47,63);g.lineTo(53,60);g.strokePath();
  g.generateTexture('person-'+i,96,140);g.destroy();
 }
 const p=scene.make.graphics({add:false});p.fillStyle(0x000000,.12);p.fillEllipse(34,38,64,37);p.fillStyle(0xf9f2d8);p.fillEllipse(32,32,62,43);p.fillStyle(0xb97637);p.fillEllipse(32,29,53,36);p.fillStyle(0xe8b45c);p.fillEllipse(32,27,50,34);p.fillStyle(0xe6cb73);p.fillEllipse(32,26,43,28);p.fillStyle(0xbc5a3c);for(const [x,y] of [[20,19],[37,16],[44,29],[23,31],[31,26]])p.fillCircle(x,y,4);p.fillStyle(0x57844c);p.fillEllipse(22,25,4,9);p.fillEllipse(38,32,8,4);p.generateTexture('pizza',68,56);p.destroy();
 const q=scene.make.graphics({add:false});q.fillStyle(0xf9f2d8);q.fillEllipse(32,30,61,40);q.fillStyle(0xe0b965);q.fillTriangle(13,22,50,20,32,40);q.fillStyle(0xb95d42);q.fillCircle(32,27,4);q.generateTexture('portion',68,56);q.destroy();
}
export function drawKitchen(scene){
 const g=scene.add.graphics();
 rounded(g,0,0,1000,580,0,0xdce5cb);
 // A small courtyard frames a deliberately compact restaurant.
 rounded(g,75,73,850,470,20,0xb9c6a4);rounded(g,83,63,834,474,17,0x9a7552);
 rounded(g,92,65,816,440,11,0xe9c78b);rounded(g,92,249,816,269,0,palette.floor);
 for(let y=249;y<518;y+=38)for(let x=92;x<908;x+=42){g.fillStyle(((x/42+y/38)|0)%2?0xf0cb8b:0xeac080);g.fillRect(x+1,y+1,Math.min(40,907-x),Math.min(36,517-y));g.lineStyle(1,0xb28d51,.2);g.strokeRect(x,y,Math.min(42,908-x),Math.min(38,518-y));}
 // Back wall, green wainscot and striped awning.
 rounded(g,92,66,816,126,10,0xf3e5bf);g.fillStyle(0x638158);g.fillRect(92,177,816,69);g.fillStyle(0x314c38);g.fillRect(92,233,816,13);
 for(let x=101;x<906;x+=30){g.lineStyle(1,0x8c9c6c,.4);g.lineBetween(x,179,x,232);}
 rounded(g,568,87,289,52,5,0xedd7a1);for(let x=569;x<851;x+=40){g.fillStyle(0xbd634c);g.fillRect(x,88,20,47);g.fillStyle(0xe6a68a);g.fillTriangle(x,135,x+20,135,x+10,144);}g.fillStyle(0x68543c);g.fillRect(566,84,294,5);
 // Window and chalk menu.
 rounded(g,145,90,132,95,4,0x395c45);rounded(g,154,99,114,77,3,0xa6c1bb);g.fillStyle(0xd9e5c7);g.fillEllipse(210,153,103,36);g.fillStyle(0x749559);g.fillEllipse(204,161,124,25);g.fillStyle(0xf3e8c9);g.fillRect(207,98,7,77);g.fillRect(154,134,114,6);rounded(g,135,88,12,100,3,0x74935c);rounded(g,276,88,12,100,3,0x74935c);
 box(g,323,94,184,80,0x9a6f49,0x745035);rounded(g,331,101,168,66,4,0x2c4a38);scene.add.text(416,109,'OGGI',{fontFamily:'Georgia',fontSize:13,color:'#e4dab8'}).setOrigin(.5,0);scene.add.text(416,131,'Pizza · amici · frazioni',{fontFamily:'Georgia',fontSize:12,color:'#f8edce'}).setOrigin(.5,0);
 // Cutting bench and service counter.
 box(g,316,215,214,63,0xf8e9c4,0xb38c61);box(g,353,223,120,39,0xc78e51,0x9c6b3d);g.lineStyle(2,0x9f713d,.25);for(let x=366;x<460;x+=12)g.lineBetween(x,226,x,254);rounded(g,480,234,27,8,3,0xc0c2af);rounded(g,502,234,13,8,3,0x523c2b);
 box(g,565,233,310,58,0xf5e6c0,0x9f7048);for(let x=583;x<850;x+=29){g.fillStyle(0x855d3e,.4);g.fillRect(x,270,3,23);}plate(g,665,254,25);plate(g,795,254,25);
 // Brick pizza oven, warm flame and peel.
 rounded(g,108,290,112,175,9,0xb96145);for(let y=299;y<454;y+=19)for(let x=114+(y%2)*9;x<217;x+=31){g.lineStyle(1,0xf1b382,.65);g.strokeRect(x,y,29,18);}g.fillStyle(0x703d2a);g.fillEllipse(164,325,101,106);g.fillRect(115,325,98,94);g.fillStyle(0x352b25);g.fillEllipse(164,337,78,77);g.fillRect(125,337,78,74);g.fillStyle(0xe98c3f,.3);g.fillEllipse(164,391,90,38);g.fillStyle(0xf0ae42);g.fillTriangle(137,399,148,356,160,399);g.fillStyle(0xcf6934);g.fillTriangle(161,399,172,345,190,399);g.fillStyle(0xffdd76);g.fillTriangle(158,401,166,376,174,401);box(g,104,408,120,23,0xc79863,0x93643e);
 g.lineStyle(5,0x8b5d35);g.lineBetween(215,418,257,443);g.fillStyle(0xc6b588);g.fillEllipse(222,416,30,14);
 // Ingredients, pots, hanging lights and trim.
 box(g,101,476,135,38,0xc99762,0x8e6740);plate(g,139,484,18);plant(g,213,481);plant(g,881,190);plant(g,102,214);
 box(g,820,453,76,59,0xa98253,0x8e6741);plant(g,851,457);g.fillStyle(0xc24b36);for(let i=0;i<8;i++)g.fillCircle(843+(i%4)*10,494+Math.floor(i/4)*9,5);
 for(const x of [317,532,887]){g.lineStyle(2,0x514839);g.lineBetween(x,65,x,94);g.fillStyle(0xe5b253);g.fillTriangle(x-18,109,x,92,x+18,109);g.fillStyle(0xffefbc);g.fillEllipse(x,110,32,7);}
 // Kitchen edge and soft grounding shadows.
 g.fillStyle(0x9c754b);g.fillRect(92,517,816,14);g.fillStyle(0xcda570);g.fillRect(92,515,816,5);
 const label=(x,y,txt)=>scene.add.text(x,y,txt,{fontFamily:'Georgia',fontSize:13,color:'#785839'}).setOrigin(.5).setAlpha(.8);
 label(278,456,'FORNO');label(424,298,'TAGLIA');label(716,312,'SERVI');
 return g;
}
