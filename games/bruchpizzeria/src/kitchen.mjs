import {makeTextures,drawKitchen} from './art.mjs';
export function createKitchen({onStation,getState,onReady}){
 const Phaser=window.Phaser,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const stations={oven:{x:270,y:386},board:{x:421,y:333},guest0:{x:659,y:336},guest1:{x:793,y:336}};
 class Kitchen extends Phaser.Scene{
  create(){
   makeTextures(this);drawKitchen(this);this.target=null;this.pending=null;
   this.chef=this.add.image(496,443,'person-0').setScale(.54).setDepth(10);this.carried=this.add.image(496,453,'pizza').setScale(.55).setDepth(11).setVisible(false);
   this.guests=[this.add.image(658,210,'person-1').setScale(.51),this.add.image(796,210,'person-2').setScale(.51)];
   this.bubbles=this.guests.map(g=>this.add.text(g.x,g.y-62,'',{fontFamily:'Georgia',fontSize:18,color:'#37513b',backgroundColor:'#fff8dc',padding:{x:10,y:5}}).setOrigin(.5));
   this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E',false);
   this.input.keyboard.on('keydown',event=>{if(this.allowed()&&document.getElementById('game').contains(document.activeElement)&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key))event.preventDefault();});
   this.input.on('pointerdown',p=>{
    if(!this.allowed())return;
    if(p.x<245&&p.y>290&&p.y<470)this.go('oven');
    else if(p.x>310&&p.x<535&&p.y>195&&p.y<310)this.go('board');
    else if(p.x>565&&p.x<880&&p.y>150&&p.y<310)this.go(p.x<726?'guest0':'guest1');
    else{this.pending=null;this.target={x:Phaser.Math.Clamp(p.x,245,875),y:Phaser.Math.Clamp(p.y,326,488)};}
   });
   this.input.keyboard.on('keydown-E',()=>{
    if(!this.allowed())return;let nearest=null,best=80;
    for(const [id,p] of Object.entries(stations)){const d=Math.hypot(p.x-this.chef.x,p.y-this.chef.y);if(d<best){nearest=id;best=d;}}
    if(nearest)onStation(nearest);
   });
   if(!reduced){this.tweens.add({targets:this.guests,y:'-=3',duration:1800,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});}
   onReady({go:id=>this.go(id),refresh:()=>this.refresh()});this.refresh();
  }
  allowed(){const s=getState();return !s.paused&&!s.help&&!s.complete&&!document.querySelector('dialog[open]');}
  go(id){if(!this.allowed()||!stations[id])return;this.target=stations[id];this.pending=id;}
  refresh(){
   const s=getState();this.carried.setVisible(!!s.carry).setTexture(s.carry==='plate'?'portion':'pizza');
   this.guests.forEach((g,i)=>{const o=s.orders[i];g.setVisible(!!o);this.bubbles[i].setVisible(!!o).setText(o?o.label:'');if(o)g.setTexture('person-'+o.id);});
  }
  update(time,delta){
   if(!this.chef||!this.allowed())return;
   const k=this.keys;let x=Number(k.D.isDown||k.RIGHT.isDown)-Number(k.A.isDown||k.LEFT.isDown),y=Number(k.S.isDown||k.DOWN.isDown)-Number(k.W.isDown||k.UP.isDown);
   if(x||y){this.target=null;this.pending=null;}else if(this.target){x=this.target.x-this.chef.x;y=this.target.y-this.chef.y;}
   const distance=Math.hypot(x,y),step=220*Math.min(delta,40)/1000;
   if(distance){
    const amount=this.target?Math.min(step,distance):step;this.chef.x=Phaser.Math.Clamp(this.chef.x+x/distance*amount,245,875);this.chef.y=Phaser.Math.Clamp(this.chef.y+y/distance*amount,326,488);
    this.chef.setRotation(reduced?0:Math.sin(time/80)*.035);
    if(this.target&&distance<step+1){this.target=null;const id=this.pending;this.pending=null;if(id)onStation(id);}
   }else this.chef.setRotation(0);
   this.carried.setPosition(this.chef.x,this.chef.y+10).setRotation(this.chef.rotation);
  }
 }
 return new Phaser.Game({type:Phaser.AUTO,parent:'game',width:1000,height:580,backgroundColor:'#dce5cb',scene:Kitchen,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true},audio:{noAudio:true}});
}
