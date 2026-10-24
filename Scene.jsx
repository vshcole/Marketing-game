import Phaser from "phaser";import {useEffect,useRef} from "react";
export const bus=new Phaser.Events.EventEmitter();
const ss={env:{tod:"day",weather:"sun",theme:0x25346b},emo:"normal",npc:{look:{skin:0xf1c27d,hair:0x2b1b10,cloth:0xe53935},name:""}};
const SKY={morning:0xffc98a,day:0x8fd0f5,evening:0xff8a65,night:0x1a237e},DARK={morning:.05,day:0,evening:.15,night:.38};
class Main extends Phaser.Scene{
  constructor(){super("m")}
  create(){
    const g=this.add.graphics(),tex=(k,w,h,fn)=>{g.clear();fn(g);g.generateTexture(k,w,h)};
    tex("coin",10,10,q=>{q.fillStyle(0xffd54f).fillRect(1,0,8,10).fillRect(0,1,10,8);q.fillStyle(0xb8860b).fillRect(4,2,2,6)});
    tex("puff",8,8,q=>q.fillStyle(0xffffff).fillRect(0,0,8,8));tex("drop",2,10,q=>q.fillStyle(0x9fd3ff).fillRect(0,0,2,10));tex("flake",4,4,q=>q.fillStyle(0xffffff).fillRect(0,0,4,4));g.destroy();
    const rad=(k,w,h,stops,r0,r1)=>{const c=this.textures.createCanvas(k,w,h),x=c.getContext(),gr=x.createRadialGradient(w/2,h/2,r0,w/2,h/2,r1);stops.forEach(s=>gr.addColorStop(s[0],s[1]));x.fillStyle=gr;x.fillRect(0,0,w,h);c.refresh()};
    rad("glow",128,128,[[0,"rgba(255,214,120,.9)"],[1,"rgba(255,214,120,0)"]],0,64);rad("vig",960,540,[[0,"rgba(0,0,0,0)"],[1,"rgba(0,0,12,.65)"]],200,620);
    this.wall=this.add.rectangle(480,150,960,300,0x25346b);
    for(let x=0;x<960;x+=24)this.add.rectangle(x,150,2,300,0x000000,.08);
    this.add.rectangle(480,420,960,240,0x3a4766);for(let x=0;x<960;x+=80)this.add.rectangle(x,420,2,240,0x2a3550);
    this.sky=this.add.rectangle(170,130,200,140,0x8fd0f5);
    this.stars=[[90,76],[130,70],[200,84],[240,72],[110,96]].map(p=>this.add.rectangle(p[0],p[1],3,3,0xffffff));
    this.sun=this.add.circle(235,92,14,0xfff3b0);
    const m=this.add.graphics();m.fillStyle(0x7986cb);m.fillTriangle(72,196,122,92,172,196);m.fillTriangle(140,196,200,80,262,196);m.fillStyle(0x3949ab);m.fillTriangle(72,196,100,130,150,196);m.fillTriangle(180,196,225,118,268,196);m.fillStyle(0xffffff);m.fillTriangle(110,108,122,92,134,108);m.fillTriangle(186,100,200,80,214,100);
    this.add.rectangle(170,130,200,140).setStrokeStyle(8,0x3e2723);this.add.rectangle(170,130,6,140,0x3e2723);this.add.rectangle(170,130,200,6,0x3e2723);
    this.add.rectangle(740,380,420,110,0x5c3a21);this.add.rectangle(740,322,430,16,0x8a5a35);this.add.rectangle(700,300,60,44,0xb0bec5);this.add.rectangle(716,292,8,8,0xff5252);
    this.add.particles(700,276,"puff",{lifespan:1600,speedY:{min:-40,max:-70},speedX:{min:-10,max:10},scale:{start:.5,end:1.6},alpha:{start:.5,end:0},frequency:220});
    this.coins=this.add.particles(0,0,"coin",{speed:{min:120,max:320},angle:{min:230,max:310},lifespan:1100,gravityY:600,scale:2,emitting:false});
    [400,680].forEach(x=>{this.add.rectangle(x,30,2,60,0x222222);this.add.rectangle(x,62,40,12,0xff9800);const gl=this.add.image(x,92,"glow").setBlendMode(Phaser.BlendModes.ADD).setScale(3).setAlpha(.45).setDepth(8);this.tweens.add({targets:gl,alpha:.3,yoyo:true,repeat:-1,duration:1100+x})});
    this.neon=this.add.text(480,48,"CMO SIM",{fontFamily:'"Press Start 2P",monospace',fontSize:"28px",color:"#ff80ab"}).setOrigin(.5).setDepth(11);this.tweens.add({targets:this.neon,alpha:.45,yoyo:true,repeat:-1,duration:900});
    const pl=this.add.container(150,330).setDepth(5);pl.add([this.add.rectangle(0,70,76,100,0x1a237e),this.add.circle(0,-6,30,0x2c3a8c),this.add.rectangle(0,-34,64,6,0x000000)]);this.tweens.add({targets:pl,y:334,yoyo:true,repeat:-1,duration:1300});
    this.ch=this.add.container(560,310);this.tweens.add({targets:this.ch,y:314,yoyo:true,repeat:-1,duration:900});
    this.tag=this.add.text(560,505,"",{fontFamily:'"Press Start 2P",monospace',fontSize:"12px",color:"#ffd54f",backgroundColor:"#0d1440",padding:{x:8,y:6}}).setOrigin(.5).setDepth(12);
    this.dark=this.add.rectangle(480,270,960,540,0x000022,0).setDepth(10);this.add.image(480,270,"vig").setDepth(13);
    bus.on("env",e=>this.env(e));bus.on("emo",e=>this.emo(e));bus.on("npc",d=>this.npc(d.look,d.name));bus.on("coin",()=>this.coins.explode(26,700,300));bus.on("bad",()=>this.bad());bus.on("float",t=>this.float(t));
    this.events.once("shutdown",()=>bus.removeAllListeners());
    this.env(ss.env);this.npc(ss.npc.look,ss.npc.name);this.emo(ss.emo);
  }
  // Персонаж собирается из примитивов по описанию внешности NPC (кожа, волосы, одежда, аксессуар)
  npc(look,name){
    const c=this.ch;this.tweens.killTweensOf(c.list.slice());c.removeAll(true);this.look=look;const A=o=>{c.add(o);return o};
    A(this.add.ellipse(0,150,110,18,0x000000,.3));
    [[-18,118,22,60,0x263238],[18,118,22,60,0x263238],[-20,150,28,12,0x111111],[20,150,28,12,0x111111]].forEach(r=>A(this.add.rectangle(...r)));
    this.armL=A(this.add.rectangle(-44,32,16,66,look.cloth).setOrigin(.5,0));this.armR=A(this.add.rectangle(44,32,16,66,look.cloth).setOrigin(.5,0));
    A(this.add.rectangle(0,70,80,104,look.cloth));A(this.add.rectangle(0,24,24,14,look.skin));A(this.add.ellipse(0,-14,86,76,look.hair));
    A(this.add.circle(0,-10,36,look.skin).setStrokeStyle(4,0x1b1020));A(this.add.circle(-35,-8,8,look.skin));A(this.add.circle(35,-8,8,look.skin));A(this.add.rectangle(0,-36,72,18,look.hair));
    A(this.add.circle(-22,6,6,0xff6b6b,.35));A(this.add.circle(22,6,6,0xff6b6b,.35));
    if(look.acc==="tie")A(this.add.rectangle(0,60,12,50,0xc62828));
    if(look.acc==="headphones"){A(this.add.rectangle(0,-42,84,8,0x111111));A(this.add.rectangle(-42,-8,12,26,0x111111));A(this.add.rectangle(42,-8,12,26,0x111111))}
    if(look.acc==="phone")A(this.add.rectangle(56,92,16,28,0x111111).setStrokeStyle(2,0x4fc3f7));
    this.face=A(this.add.graphics().setPosition(0,-10));
    this.tweens.add({targets:this.face,x:{from:-3,to:3},yoyo:true,repeat:-1,duration:1700});
    this.tweens.add({targets:this.armL,angle:{from:-12,to:12},yoyo:true,repeat:-1,duration:700});this.tweens.add({targets:this.armR,angle:{from:10,to:-10},yoyo:true,repeat:-1,duration:900});
    this.tag.setText(name||"");this.emo(this.curEmo||"normal");
    c.x=1050;this.tweens.add({targets:c,x:560,duration:550,ease:"Back.Out"});
  }
  env(e){
    this.wall.setFillStyle(e.theme);this.sky.setFillStyle(SKY[e.tod]);this.dark.setFillStyle(0x000022,DARK[e.tod]);
    this.sun.setVisible(e.weather==="sun"&&e.tod!=="night");this.stars.forEach(s=>s.setVisible(e.tod==="night"));
    if(this.wx)this.wx.destroy();this.wx=null;
    if(e.weather==="rain")this.wx=this.add.particles(0,0,"drop",{x:{min:72,max:268},y:64,lifespan:300,speedY:{min:350,max:450},quantity:2,frequency:30}).setDepth(9);
    if(e.weather==="snow")this.wx=this.add.particles(0,0,"flake",{x:{min:72,max:268},y:64,lifespan:2200,speedY:{min:20,max:40},speedX:{min:-10,max:10},frequency:90}).setDepth(9);
  }
  emo(e){
    this.curEmo=e;const f=this.face;if(!f)return;f.clear();f.fillStyle(0x1b1020);f.lineStyle(4,0x1b1020);
    if(e==="happy"){[-12,12].forEach(x=>{f.beginPath();f.arc(x,-12,6,Math.PI,0,false);f.strokePath()});f.beginPath();f.arc(0,4,10,0,Math.PI,false);f.strokePath()}
    else if(e==="shock"){f.fillCircle(-12,-14,6);f.fillCircle(12,-14,6);f.fillCircle(0,12,7)}
    else if(e==="angry"){f.fillRect(-18,-14,12,5);f.fillRect(6,-14,12,5);f.lineBetween(-20,-24,-6,-18);f.lineBetween(20,-24,6,-18);f.beginPath();f.arc(0,18,9,Math.PI,0,false);f.strokePath()}
    else if(e==="tired"){f.lineBetween(-18,-12,-6,-12);f.lineBetween(6,-12,18,-12);f.lineBetween(-8,10,8,10)}
    else{f.fillRect(-16,-16,8,10);f.fillRect(8,-16,8,10);f.lineBetween(-8,8,8,8)}
    if(this.look&&this.look.acc==="glasses"){f.lineStyle(3,0x111111);f.strokeCircle(-12,-12,10);f.strokeCircle(12,-12,10);f.lineBetween(-2,-12,2,-12)}
  }
  bad(){const m=this.cameras.main;m.flash(250,255,0,0);m.shake(300,.01);const b=this.add.graphics().setDepth(12);b.lineStyle(6,0xff1744);b.beginPath();b.moveTo(420,0);[[390,120],[440,170],[400,300]].forEach(p=>b.lineTo(p[0],p[1]));b.strokePath();this.time.delayedCall(350,()=>b.destroy())}
  float(t){const x=this.add.text(520+Phaser.Math.Between(-30,30),230,t,{fontSize:"32px"}).setDepth(12);this.tweens.add({targets:x,y:130,alpha:0,duration:1400,onComplete:()=>x.destroy()})}
}
export default function Scene({env,emo,npc}){
  const r=useRef();
  useEffect(()=>{const gm=new Phaser.Game({type:Phaser.AUTO,parent:r.current,width:960,height:540,pixelArt:true,backgroundColor:"#0b1030",scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:Main});return()=>gm.destroy(true)},[]);
  useEffect(()=>{ss.env=env;bus.emit("env",env)},[env.tod,env.weather,env.theme]);
  useEffect(()=>{ss.emo=emo;bus.emit("emo",emo)},[emo]);
  useEffect(()=>{if(npc){ss.npc=npc;bus.emit("npc",npc)}},[npc&&npc.name]);
  return <div ref={r} className="w-full max-w-3xl mx-auto aspect-video border-4 border-yellow-300 bg-black"/>;
}
