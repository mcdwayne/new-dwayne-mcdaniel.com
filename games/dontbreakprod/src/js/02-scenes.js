/* ============================== pixel art (original, EGA palette; helpers shared with LossyInc Range) ============================== */
let reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const PAL=["#000000","#0000AA","#00AA00","#00AAAA","#AA0000","#AA00AA","#AA5500","#AAAAAA","#555555","#5555FF","#55FF55","#55FFFF","#FF5555","#FF55FF","#FFFF55","#FFFFFF"];
const cv=document.getElementById("scene"),g=cv.getContext("2d");g.imageSmoothingEnabled=false;
const R=(x,y,w,h,c)=>{g.fillStyle=PAL[c];g.fillRect(x|0,y|0,w|0,h|0);};
const PATS={};const pat=(a,b)=>{const k=a+"-"+b;if(PATS[k])return PATS[k];const c=document.createElement("canvas");c.width=2;c.height=2;const x=c.getContext("2d");
  if(!x||!x.fillRect)return PAL[a];x.fillStyle=PAL[b];x.fillRect(0,0,2,2);x.fillStyle=PAL[a];x.fillRect(1,0,1,1);x.fillRect(0,1,1,1);return PATS[k]=g.createPattern(c,"repeat")||PAL[a];};
const D=(x,y,w,h,a,b)=>{g.fillStyle=pat(a,b);g.fillRect(x|0,y|0,w|0,h|0);};
const L=(x0,y0,x1,y1,c)=>{x0|=0;y0|=0;x1|=0;y1|=0;let dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1,e=dx+dy;g.fillStyle=PAL[c];for(;;){g.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}};
const F3={"(":"010100100100010",")":"010001001001010",A:"010101111101101",B:"110101110101110",C:"011100100100011",D:"110101101101110",E:"111100110100111",F:"111100110100100",G:"011100101101011",H:"101101111101101",I:"111010010010111",J:"001001001101010",K:"101101110101101",L:"100100100100111",M:"101111111101101",N:"110101101101101",O:"010101101101010",P:"110101110100100",Q:"010101101110011",R:"110101110101101",S:"011100010001110",T:"111010010010010",U:"101101101101111",V:"101101101101010",W:"101101111111101",X:"101101010101101",Y:"101101010010010",Z:"111001010100111","0":"111101101101111","1":"010110010010111","2":"110001010100111","3":"110001010001110","4":"101101111001001","5":"111100110001110","6":"011100111101111","7":"111001010010010","8":"111101111101111","9":"111101111001110",":":"000010000010000",".":"000000000000010","-":"000000111000000","!":"010010010000010","?":"110001010000010","'":"010010000000000","/":"001001010100100","%":"101001010100101","$":"011110010011110","#":"101111101111101"," ":"000000000000000"};
const T=(x,y,s,c)=>{g.fillStyle=PAL[c];let cx=x;for(const ch of String(s).toUpperCase()){const m=F3[ch]||F3[" "];for(let i=0;i<15;i++)if(m[i]==="1")g.fillRect(cx+i%3,y+Math.floor(i/3),1,1);cx+=4;}};
function figure(x,y,o){const {skin=6,hair=0,shirt=1,shade=0,pants=8,long=false,tie=null,seated=false,collar=15,glasses=false}=o||{};
  if(long){R(x+5,y+2,5,22,hair);R(x+18,y+2,5,22,hair);}
  R(x+8,y+3,12,13,skin);R(x+7,y+7,1,4,skin);R(x+20,y+7,1,4,skin);R(x+8,y+1,12,4,hair);R(x+8,y+4,2,4,hair);R(x+18,y+4,2,3,hair);
  R(x+10,y+8,3,2,15);R(x+15,y+8,3,2,15);R(x+11,y+8,2,2,0);R(x+16,y+8,2,2,0);if(glasses){R(x+9,y+7,5,1,0);R(x+14,y+7,5,1,0);}R(x+13,y+11,2,1,0);R(x+11,y+13,6,1,4);
  R(x+12,y+16,4,3,skin);
  R(x+4,y+18,20,24,shirt);D(x+19,y+18,5,24,shirt,shade);R(x+10,y+18,8,3,collar);if(tie!=null)R(x+13,y+20,2,16,tie);
  R(x+1,y+19,4,20,shirt);R(x+23,y+19,4,20,shirt);D(x+23,y+19,4,20,shirt,shade);R(x+1,y+39,4,3,skin);R(x+23,y+39,4,3,skin);
  if(!seated){R(x+6,y+42,7,22,pants);R(x+15,y+42,7,22,pants);D(x+18,y+42,4,22,pants,0);R(x+5,y+63,8,3,0);R(x+15,y+63,8,3,0);}}
const person=(who,x,y,seated)=>{const p=PPL[who];figure(x,y,{skin:p.skin,hair:p.hair,shirt:p.shirt,long:!!p.long,glasses:!!p.glasses,tie:p.tie??null,seated,collar:p.tie!=null?15:p.shirt});};
function windowSky(x,y,w,h,night){R(x,y,w,h,night?1:11);if(!night)D(x,y+h*0.55,w,h*0.45,11,9);
  for(let i=0;i<w;i+=7){const bh=10+((i*37)%23);R(x+i,y+h-bh,6,bh,i%14?8:night?0:1);for(let k=0;k<bh-3;k+=4)if((i+k)%3)R(x+i+2,y+h-bh+2+k,1,1,14);}
  R(x,y,w,1,7);R(x,y+(h/2|0),w,1,7);R(x+(w/2|0),y,1,h,7);}
/* elevator doors, the same on every floor, with the floor number painted above */
function liftDoor(x,y,lbl){R(x-4,y-12,52,10,8);R(x-3,y-11,50,8,0);T(x+22-lbl.length*2,y-9,lbl,14);R(x-2,y-2,48,74,8);R(x,y,44,70,7);D(x,y,22,70,7,15);D(x+22,y,22,70,15,7);R(x+21,y,2,70,8);
  R(x+48,y+30,6,12,8);R(x+50,y+32,2,3,14);R(x+50,y+37,2,3,6);}
function floorTiles(y,a,b){R(0,y,320,170-y,a);for(let i=0;i<9;i++){const yy=y+i*i*0.9;R(0,yy|0,320,Math.max(1,(i*1.8)|0),i%2?a:b);}}
const night=()=>S&&S.lv===6;
const SCENES={
closet(){R(0,0,320,112,8);D(0,0,320,112,8,0);
  for(let s=0;s<4;s++){R(8,26+s*22,92,3,6);for(let k=0;k<6;k++){const c=[15,7,14,15,9,7][(k+s)%6];R(12+k*14,14+s*22,11,12,c);R(12+k*14,14+s*22,11,2,8);}}
  T(14,4,"PAPER TOWELS",14);
  L(170,0,170,12,0);R(166,12,9,8,14);R(168,20,5,2,7);
  floorTiles(112,6,8);
  R(116,86,100,6,6);D(116,86,100,2,14,6);R(120,92,4,48,6);R(208,92,4,48,6);
  /* your laptop (BrickBook 9000), set up on the desk whenever you're in here */
  R(140,44,56,38,8);R(140,44,56,2,7);R(143,47,50,32,1);
  R(147,51,30,20,15);R(147,51,30,3,1);R(149,56,5,4,14);R(156,56,5,4,9);R(163,56,5,4,11);R(149,63,5,4,12);
  if(S&&S.mail.some(m=>!m.read))R(178,52,4,4,12);
  R(186,72,6,5,13);R(145,74,5,4,10);
  R(130,82,76,5,7);R(130,82,76,1,15);R(134,83,68,2,8);R(138,80,14,4,7);R(184,80,14,4,7);R(140,81,10,2,15);
  R(192,36,13,11,14);R(194,39,8,1,0);R(194,42,6,1,0);
  R(150,92,40,6,7);D(152,93,36,4,8,7);
  /* mop bucket: yellow, wringer on top, wheels, mop standing in it */
  for(let i=0;i<26;i++){const w=32-(i>>2);R(247-(w>>1),120+i,w,1,14);R(247+(w>>1)-5,120+i,5,1,6);}
  T(237,128,"WET",0);R(230,117,34,3,7);R(230,117,34,1,15);R(234,111,24,6,8);R(236,109,20,2,7);R(254,105,2,6,8);
  R(232,146,5,3,0);R(257,146,5,3,0);
  L(244,54,247,112,6);L(245,54,248,112,6);L(246,54,249,112,14);R(242,50,6,5,4);
  for(let k=0;k<6;k++)L(239+k*3,112,237+k*3+((k%2)?1:0),121,k%2?7:15);
  /* broken office chair: red seat, backrest hanging off at an angle, one wheel rolled away, tape */
  R(106,117,28,6,4);R(106,117,28,1,12);R(106,122,28,1,0);
  for(let i=0;i<20;i++)R(102+(i>>2),96+i,6,1,i<2?12:4);R(103,104,8,2,15);
  R(118,123,4,13,8);R(119,123,1,13,7);R(106,136,28,2,8);R(108,138,4,3,0);R(118,138,4,3,0);R(128,138,4,3,0);R(140,146,4,3,0);
  R(282,8,34,104,6);R(285,11,28,101,0);D(285,11,28,101,0,8);R(306,60,3,6,14);
  R(214,20,60,24,15);R(214,20,60,3,9);T(228,26,"SECURITY",4);T(218,34,"WAS SUPPLIES",8);
  if(!has("laptop")&&S&&S.f.ottoRotated){}},
f2(){D(0,0,320,108,7,15);R(0,104,320,4,8);
  R(18,22,46,86,6);R(21,25,40,83,0);D(21,25,40,83,0,8);R(24,34,34,12,15);T(26,36,"SECURITY",4);T(26,41,"SUPPLIES",8);L(25,43,57,38,4);R(52,68,3,5,14);
  liftDoor(118,36,"2");
  R(204,8,112,100,11);D(204,8,112,100,11,15);R(204,8,112,2,7);R(204,8,2,100,7);R(314,8,2,100,7);R(258,8,2,100,7);
  person("marisol",250,30);R(222,86,70,6,6);R(226,92,4,16,6);R(284,92,4,16,6);R(232,72,24,14,8);R(234,74,20,10,9);
  R(208,14,46,10,15);T(210,17,"M. VANCE IT",1);
  /* printer: paper tray on top, a sheet coming out, status lights */
  R(72,80,34,24,7);R(72,80,34,1,15);R(72,103,34,1,8);R(105,80,1,24,8);
  R(76,72,26,8,15);R(76,72,26,1,7);R(78,70,22,2,15);
  R(76,88,26,2,0);R(80,90,18,7,15);R(82,92,12,1,8);R(82,94,9,1,8);
  R(96,83,6,3,0);R(97,84,2,1,S.f.jam?10:2);R(100,84,1,1,S.f.jam?10:12);R(76,99,26,2,8);
  /* plant: fern in a terracotta pot */
  for(let i=0;i<12;i++){const w=22-(i>>1);R(181-(w>>1),96+i,w,1,i<2?12:4);}R(168,94,26,3,6);R(168,94,26,1,12);
  [[166,80],[168,72],[176,66],[186,66],[194,72],[197,80],[172,86],[191,86]].forEach(([x,y],k)=>{L(181,94,x,y,2);L(182,94,x+1,y,k%2?10:2);R(x-1,y-1,3,3,k%3?10:2);});
  floorTiles(108,8,7);},
lift(){R(0,0,320,170,8);D(0,0,320,170,7,8);for(let i=0;i<8;i++)R(i*40,0,1,170,8);
  R(0,0,320,14,0);const fl=S.liftFrom||"2";T(150,4,"FLOOR "+fl,14);
  R(40,24,170,120,7);D(40,24,170,120,7,15);R(124,24,2,120,8);R(40,24,170,2,15);
  R(228,22,76,132,8);R(230,24,72,128,0);T(240,28,"PRECARIUM",7);
  /* badge reader: black box, card slot, status light */
  R(212,66,14,22,0);R(213,67,12,20,8);R(215,69,8,7,0);R(216,70,6,5,9);R(215,79,8,2,0);R(218,83,2,2,10);
  FLOORS.forEach(([n,lbl],i)=>{const y=38+i*16,ok=n==="1"||S.badge.includes(n),cur=n===fl;R(236,y,16,12,cur?14:ok?7:8);R(237,y+1,14,10,cur?6:ok?15:8);T(n.length>1?239:242,y+3,n,ok?0:7);
    T(258,y+3,lbl,ok?15:8);if(!ok)R(296,y+4,3,3,12);});
    floorTiles(150,6,8);},
b1(){R(0,0,320,110,8);D(0,0,320,110,8,1);for(let i=0;i<320;i+=32)R(i,0,2,110,0);
  liftDoor(16,36,"B1");
  R(96,6,140,14,15);T(102,10,"HELP DESK - TAKE A NUMBER",1);R(244,8,22,12,4);T(247,12,S.f.rollBack?"48":"47",15);
  R(196,28,104,66,8);for(let r=0;r<4;r++){R(198,30+r*16,100,2,7);for(let k=0;k<6;k++)R(202+k*16,20+r*16+12,12,8,k%3?0:8);}for(let x=196;x<302;x+=6)R(x,28,1,66,7);T(242,24,"LOANER CAGE",14);
  person("otto",128,26);R(84,82,138,10,6);D(84,82,138,4,14,6);R(84,92,138,40,6);D(86,94,134,36,6,0);R(150,70,26,12,7);R(152,72,22,8,1);
  R(96,72,16,10,15);R(98,74,12,1,8);R(98,77,10,1,8);
  floorTiles(132,8,0);},
f3(){D(0,0,320,104,15,7);R(0,100,320,4,8);
  liftDoor(14,30,"3");
  R(78,6,96,40,15);R(80,8,92,36,9);T(84,12,"SPRINT 51",15);T(84,20,"- PAY LATER 2.0",14);T(84,28,"- SHIP MONDAY",14);T(84,36,"- NO WEEKENDS?",12);
  R(284,22,32,82,7);R(286,24,28,40,15);R(286,66,28,36,15);R(310,40,2,10,8);R(310,76,2,10,8);T(287,26,"FRIDGE",8);if(S.f.fridgeOpen){R(287,67,26,34,0);R(290,90,6,10,has("cold brew")||S.f.coffeeGiven?0:8);}
  person("juni",112,52,true);R(96,98,90,6,6);R(102,104,4,40,6);R(176,104,4,40,6);/* Juni's laptop: open lid with a terminal on screen, keyboard deck, trackpad. Beside Juni so you can still see her. */
  R(134,72,42,24,7);R(134,72,42,1,15);R(134,72,1,24,15);R(175,72,1,24,8);
  R(137,75,36,18,0);R(154,73,2,1,0);
  for(let i=0;i<4;i++)R(139,77+i*4,6+i*5,2,i===3?(S.f.hook?10:12):(S.f.hook?10:2));
  R(139+6+3*5+2,89,3,2,15);
  R(132,96,46,1,8);R(130,97,50,2,7);R(130,97,50,1,15);
  for(let k=0;k<11;k++)R(133+k*4,98,3,1,8);
  R(100,90,7,8,4);R(107,92,2,4,4);R(180,91,5,7,3);
  person("wendell",220,34);R(204,96,72,6,7);R(210,102,4,38,7);R(266,102,4,38,7);R(222,82,40,14,8);R(224,84,36,10,9);T(226,86,"OKR",15);
  floorTiles(104,7,15);},
f4(){R(0,0,320,108,0);D(0,0,320,108,0,1);
  liftDoor(276,36,"4");
  for(let k=0;k<3;k++){const x=10+k*82;R(x,6,76,44,8);R(x+2,8,72,40,0);}
  T(16,10,"UPTIME 30D",10);T(16,40,"99.95%",S.dead?12:10);for(let i=0;i<60;i+=3)R(16+i,24+((i*7)%9),2,2,10);
  T(98,10,"ERROR BUDGET",14);R(98,22,60,8,8);R(98,22,night()?44:52,8,14);T(98,36,"PAGES: 31",12);
  T(180,10,"PAYRAIL TPS",11);for(let i=0;i<64;i+=4)R(180+i,40-((i*13)%14),3,(i*13)%14+2,11);
  R(16,56,60,18,4);T(20,60,"CHANGE",15);T(20,67,"FREEZE",15);
  person("ingrid",112,38);
  R(180,112,52,22,5);D(180,112,52,22,5,13);R(176,106,60,10,5);
  if(!S.f.kenjiAwake){figure(190,76,{skin:6,hair:0,shirt:10,seated:true,collar:10});T(222,74,"Z",15);T(228,68,"Z",15);}
  else{person("kenji",196,40);}
  R(150,82,44,6,6);R(150,82,44,1,14);R(152,88,4,20,6);R(186,88,4,20,6);
  /* Kenji's terminal: CRT monitor on a stand, keyboard in front */
  R(155,56,34,22,7);R(155,56,34,1,15);R(155,56,1,22,15);R(188,56,1,22,8);R(158,59,28,15,0);
  for(let i=0;i<4;i++)R(160,61+i*3,10+i*4,1,S.f.scout?10:2);R(160+10+3*4+1,70,2,2,10);
  R(167,78,10,2,8);R(163,80,18,2,8);R(156,82,32,3,7);for(let k=0;k<7;k++)R(158+k*4,83,3,1,8);
  floorTiles(108,8,0);},
f5(){D(0,0,320,106,14,15);R(0,102,320,4,8);
  liftDoor(14,32,"5");
  R(84,8,86,30,0);T(90,12,"Q4 CLOSE IN",14);T(90,22,"3 DAYS 4 HRS",12);T(90,30,"SAY NO TO SPEND",10);
  person("harriet",120,40,true);R(96,84,96,6,6);R(100,90,4,30,6);R(184,90,4,30,6);R(102,66,30,18,8);R(104,68,26,14,10);R(154,66,30,18,8);R(156,68,26,14,10);
  person("desmond",232,36);R(216,90,70,6,7);for(let k=0;k<5;k++){R(220+k*12,72,10,18,[4,1,2,6,5][k]);T(221+k*12,76,"P",15);}
  R(290,12,24,30,15);T(292,16,"PCI",4);T(292,24,"DSS",4);T(292,32,"4.0",4);
  floorTiles(106,6,14);},
f6(){D(0,0,320,110,15,11);
  windowSky(70,8,240,80,false);R(70,88,240,4,8);
  liftDoor(12,34,"6");
  person("victor",210,38);
  R(250,70,50,34,8);R(252,72,46,22,S.f.dongleBack?1:0);if(S.f.dongleBack){T(254,76,"PAY LATER",15);T(254,84,"2.0 DEMO",14);}else{T(258,80,"NO SIGNAL",7);}R(272,94,6,12,8);
  person("paloma",108,48,true);R(86,90,90,8,6);D(86,90,90,3,14,6);R(86,98,90,30,6);R(128,78,20,12,7);R(130,80,16,8,0);
  floorTiles(110,1,9);}};

/* hotspots: [x,y,w,h] in scene pixels */
const SPOTS={
closet:[
 {id:"desklaptop",name:"your laptop",syn:["laptop","brickbook","computer","pc","screen","monitor","kiosk","mail","gitguardian","desk"],r:[128,42,80,48]},
 {id:"sticky",name:"sticky note",syn:["note","sticky","post-it"],r:[190,34,17,15]},
 {id:"shelves",name:"shelves of supplies",syn:["shelves","shelf","supplies","towels","paper"],r:[6,4,98,96]},
 {id:"bucket",name:"mop bucket",syn:["mop","bucket"],r:[228,52,38,96]},
 {id:"chair",name:"broken chair",syn:["chair","stool"],r:[104,98,32,52]},
 {id:"sign",name:"sign",syn:["sign","label"],r:[212,18,64,28]},
 {id:"door",name:"door to Floor 2",syn:["door","out","floor","hall","hallway","floor 2"],r:[282,8,34,104],exit:"f2"}],
f2:[
 {id:"marisol",name:"Marisol Vance",syn:["marisol","vance","it director","director","her","boss"],r:[246,26,34,68],talk:"marisol"},
 {id:"office",name:"Marisol's glass office",syn:["office","glass"],r:[204,8,112,100]},
 {id:"printer",name:"printer",syn:["printer","print"],r:[70,72,38,32]},
 {id:"plant",name:"plant",syn:["plant","fern"],r:[164,74,34,34]},
 {id:"closetdoor",name:"your office (the supply closet)",syn:["closet","my office","desk","security","supply"],r:[18,22,46,86],exit:"closet"},
 {id:"lift",name:"elevator",syn:["elevator","lift"],r:[114,24,56,84],exit:"lift"}],
lift:FLOORS.map(([n,lbl],i)=>({id:"btn"+n,name:`button ${n} (${lbl})`,syn:[n.toLowerCase(),"floor "+n.toLowerCase(),lbl.toLowerCase(),"button "+n.toLowerCase()],r:[234,36+i*16,74,16],floor:n})).concat([
 {id:"panel",name:"badge reader",syn:["badge","reader","panel"],r:[210,62,18,30]},
 {id:"doors",name:"elevator doors",syn:["doors","out","exit","leave"],r:[40,24,170,120],exit:"back"}]),
b1:[
 {id:"otto",name:"Otto Brannigan",syn:["otto","brannigan","help desk","helpdesk","him"],r:[124,22,36,62],talk:"otto"},
 {id:"cage",name:"loaner laptop cage",syn:["cage","laptops","loaner"],r:[196,28,104,72]},
 {id:"number",name:"ticket counter",syn:["number","take a number","sign","counter"],r:[240,6,30,16]},
 {id:"note",name:"note on the counter",syn:["note","paper","note on counter"],r:[94,70,20,14]},
 {id:"lift",name:"elevator",syn:["elevator","lift"],r:[12,22,58,86],exit:"lift"}],
f3:[
 {id:"juni",name:"Juni Castellano",syn:["juni","castellano","engineer","dev","developer","her"],r:[110,48,32,48],talk:"juni"},
 {id:"junilaptop",name:"Juni's laptop",syn:["juni laptop","juni's laptop","laptop on desk","pre-commit","precommit","config"],r:[126,68,58,34]},
 {id:"wendell",name:"Wendell Park",syn:["wendell","park","manager","em","him"],r:[216,30,34,68],talk:"wendell"},
 {id:"fridge",name:"fridge",syn:["fridge","refrigerator","coffee","cold brew"],r:[282,20,34,84]},
 {id:"sprint",name:"sprint board",syn:["sprint","board","whiteboard"],r:[78,6,96,40]},
 {id:"lift",name:"elevator",syn:["elevator","lift"],r:[10,18,58,86],exit:"lift"}],
f4:[
 {id:"ingrid",name:"Ingrid Solberg",syn:["ingrid","solberg","sre","head of sre","her"],r:[108,34,34,70],talk:"ingrid"},
 {id:"kenji",name:"Kenji Albright",syn:["kenji","albright","oncall","on-call","sleeping","him"],r:[184,40,46,72],talk:"kenji"},
 {id:"kterm",name:"Kenji's terminal",syn:["terminal","kenji terminal","ops-tools","ggscout","console"],r:[150,54,44,34]},
 {id:"screens",name:"dashboards",syn:["screens","dashboard","dashboards","uptime","wall"],r:[8,4,246,48]},
 {id:"freeze",name:"change freeze sign",syn:["freeze","sign","change freeze"],r:[14,54,64,22]},
 {id:"lift",name:"elevator",syn:["elevator","lift"],r:[272,22,58,86],exit:"lift"}],
f5:[
 {id:"harriet",name:"Harriet Quill",syn:["harriet","quill","cfo","her"],r:[116,36,36,52],talk:"harriet"},
 {id:"desmond",name:"Desmond Achebe",syn:["desmond","achebe","compliance","him"],r:[228,32,34,68],talk:"desmond"},
 {id:"binders",name:"PCI binders",syn:["binders","binder","pci"],r:[216,70,64,22]},
 {id:"countdown",name:"close countdown",syn:["countdown","clock","close"],r:[84,8,86,30]},
 {id:"lift",name:"elevator",syn:["elevator","lift"],r:[10,20,58,86],exit:"lift"}],
f6:[
 {id:"victor",name:"Victor Lamb",syn:["victor","lamb","cto","him"],r:[206,34,34,70],talk:"victor"},
 {id:"paloma",name:"Paloma Reyes",syn:["paloma","reyes","assistant","ea","her"],r:[104,44,34,44],talk:"paloma"},
 {id:"demo",name:"demo screen",syn:["demo","screen","tv"],r:[250,70,50,36]},
 {id:"window",name:"window",syn:["window","view","city"],r:[70,8,130,80]},
 {id:"lift",name:"elevator",syn:["elevator","lift"],r:[8,22,58,86],exit:"lift"}]};
