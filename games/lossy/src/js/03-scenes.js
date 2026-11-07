/* ============================== pixel art (original, EGA palette) ============================== */
let reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const PAL=["#000000","#0000AA","#00AA00","#00AAAA","#AA0000","#AA00AA","#AA5500","#AAAAAA","#555555","#5555FF","#55FF55","#55FFFF","#FF5555","#FF55FF","#FFFF55","#FFFFFF"];
const cv=document.getElementById("scene"),g=cv.getContext("2d");g.imageSmoothingEnabled=false;
const R=(x,y,w,h,c)=>{g.fillStyle=PAL[c];g.fillRect(x|0,y|0,w|0,h|0);};
const PATS={};const pat=(a,b)=>{const k=a+"-"+b;if(PATS[k])return PATS[k];const c=document.createElement("canvas");c.width=2;c.height=2;const x=c.getContext("2d");
  if(!x||!x.fillRect)return PAL[a];x.fillStyle=PAL[b];x.fillRect(0,0,2,2);x.fillStyle=PAL[a];x.fillRect(1,0,1,1);x.fillRect(0,1,1,1);return PATS[k]=g.createPattern(c,"repeat")||PAL[a];};
const D=(x,y,w,h,a,b)=>{g.fillStyle=pat(a,b);g.fillRect(x|0,y|0,w|0,h|0);};
const L=(x0,y0,x1,y1,c)=>{let dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1,e=dx+dy;g.fillStyle=PAL[c];for(;;){g.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}};
const F3={"(":"010100100100010",")":"010001001001010",A:"010101111101101",B:"110101110101110",C:"011100100100011",D:"110101101101110",E:"111100110100111",F:"111100110100100",G:"011100101101011",H:"101101111101101",I:"111010010010111",J:"001001001101010",K:"101101110101101",L:"100100100100111",M:"101111111101101",N:"110101101101101",O:"010101101101010",P:"110101110100100",Q:"010101101110011",R:"110101110101101",S:"011100010001110",T:"111010010010010",U:"101101101101111",V:"101101101101010",W:"101101111111101",X:"101101010101101",Y:"101101010010010",Z:"111001010100111","0":"111101101101111","1":"010110010010111","2":"110001010100111","3":"110001010001110","4":"101101111001001","5":"111100110001110","6":"011100111101111","7":"111001010010010","8":"111101111101111","9":"111101111001110",":":"000010000010000",".":"000000000000010","-":"000000111000000","!":"010010010000010","?":"110001010000010","'":"010010000000000","/":"001001010100100"," ":"000000000000000"};
const T=(x,y,s,c)=>{g.fillStyle=PAL[c];let cx=x;for(const ch of s.toUpperCase()){const m=F3[ch]||F3[" "];for(let i=0;i<15;i++)if(m[i]==="1")g.fillRect(cx+i%3,y+Math.floor(i/3),1,1);cx+=4;}};
function figure(x,y,o){const {skin=6,hair=0,shirt=1,shade=0,pants=8,long=false,tie=null,seated=false,collar=15}=o||{};
  if(long){R(x+5,y+2,5,22,hair);R(x+18,y+2,5,22,hair);}
  R(x+8,y+3,12,13,skin);R(x+7,y+7,1,4,skin);R(x+20,y+7,1,4,skin);R(x+8,y+1,12,4,hair);R(x+8,y+4,2,4,hair);R(x+18,y+4,2,3,hair);
  R(x+10,y+8,3,2,15);R(x+15,y+8,3,2,15);R(x+11,y+8,2,2,0);R(x+16,y+8,2,2,0);R(x+13,y+11,2,1,0);R(x+11,y+13,6,1,4);
  R(x+12,y+16,4,3,skin);
  R(x+4,y+18,20,24,shirt);D(x+19,y+18,5,24,shirt,shade);R(x+10,y+18,8,3,collar);if(tie!=null)R(x+13,y+20,2,16,tie);
  R(x+1,y+19,4,20,shirt);R(x+23,y+19,4,20,shirt);D(x+23,y+19,4,20,shirt,shade);R(x+1,y+39,4,3,skin);R(x+23,y+39,4,3,skin);
  if(!seated){R(x+6,y+42,7,22,pants);R(x+15,y+42,7,22,pants);D(x+18,y+42,4,22,pants,0);R(x+5,y+63,8,3,0);R(x+15,y+63,8,3,0);}}
function floorPersp(y0,c1,c2){for(let i=0;i<9;i++){const yy=y0+i*i*0.9;R(0,yy|0,320,Math.max(1,(i*1.8)|0),i%2?c1:c2);}}
function windowSky(x,y,w,h){const tt=S?S.t:0;R(x,y,w,h,11);D(x,y+h*0.55,w,h*0.45,11,9);
  for(let i=0;i<w;i+=7){const bh=10+((i*37)%23);R(x+i,y+h-bh,6,bh,i%14?8:1);for(let k=0;k<bh-3;k+=4)if((i+k)%3)R(x+i+2,y+h-bh+2+k,1,1,14);}
  R(x+w-16,y+4+Math.min(10,tt/20),8,8,14);R(x,y,w,1,7);R(x,y+(h/2|0),w,1,7);R(x+(w/2|0),y,1,h,7);}
const SCENES={
desk(){D(0,0,320,100,3,11);R(0,98,320,2,8);
  R(10,10,100,72,7);windowSky(14,14,92,64);R(10,82,100,4,15);
  R(232,10,46,32,15);R(234,12,42,28,1);T(237,16,"SECRETS",14);T(237,23,"ARE NOT",14);T(237,30,"CONFIG",14);
  R(284,4,34,96,6);R(286,6,30,94,0);D(286,6,30,94,0,8);R(310,52,3,4,14);
  R(254,80,26,20,4);D(254,80,26,20,4,6);R(250,64,34,18,2);D(252,56,30,10,2,10);R(264,50,4,8,2);
  R(0,100,320,42,6);D(0,100,320,3,14,6);D(0,136,320,6,6,0);
  /* a beige CRT: casing with light and shade, black glass bezel, glowing screen, a chin with a power LED, a neck and a base */
  R(115,25,106,80,8);R(116,26,104,78,7);R(116,26,104,2,15);R(116,26,2,74,15);D(212,28,8,72,7,8);R(116,100,104,4,8);
  R(121,30,94,62,0);R(124,33,88,56,1);R(124,33,88,1,9);
  const blink=anyTrig()&&(frame>>3)%2;R(126,35,84,7,9);T(128,37,"GITGUARDIAN",15);R(203,36,5,5,7);
  for(let i=0;i<5;i++){R(128,45+i*8,52,5,i===0?(blink?12:4):3);R(184,45+i*8,24,5,i===0?(anyLive()?12:10):10);}
  L(196,34,210,48,9);L(199,34,210,45,11);R(124,33,1,1,0);R(211,33,1,1,0);R(124,88,1,1,0);R(211,88,1,1,0);
  R(121,92,94,8,7);T(124,94,"LOSSY",8);R(196,94,8,4,8);R(197,95,6,2,7);R(207,95,4,3,!anyTrig()?10:(blink?12:4));
  R(156,104,24,4,8);R(158,104,20,3,7);R(140,107,56,4,7);R(140,107,56,1,15);R(138,111,60,2,8);
  R(214,30,12,10,14);R(212,42,12,10,14);R(215,33,6,1,6);R(213,45,7,1,6);
  R(100,114,110,16,8);D(102,116,106,12,7,15);for(let k=0;k<6;k++)R(104+k*17,118,14,3,7);
  R(218,116,10,14,7);R(222,116,2,4,8);L(223,116,232,104,8);
  R(232,102,16,18,4);D(244,102,4,18,4,0);R(248,106,5,8,4);R(250,108,2,4,6);R(234,102,12,2,6);
  if(!reduce){const st=(frame>>2)%3;R(237+st,92,1,8,15);R(242-st,90,1,8,15);}
  R(56,106,40,18,8);R(58,108,36,14,7);R(60,104,32,6,0);R(62,103,28,2,8);for(let k=0;k<9;k++)R(64+(k%3)*8,112+((k/3)|0)*3,6,2,15);R(88,111,4,4,S.mail.some(m=>!m.read)?12:4);
  R(176,126,30,10,15);D(176,132,30,4,15,7);T(178,127,"Q3",0);
  R(0,142,320,28,6);D(0,142,320,28,6,0);
  R(18,140,60,30,6);R(20,143,56,12,6);D(20,143,56,12,14,6);R(22,145,52,8,6);R(42,148,12,2,S.f.drawer?0:14);
  R(20,157,56,12,6);D(22,159,52,8,14,6);R(42,162,12,2,14);if(S.f.drawer){R(22,145,52,8,0);R(30,146,20,3,9);}
  R(90,142,140,28,0);D(90,142,140,4,0,8);
  R(242,140,60,30,6);D(244,143,56,24,14,6);R(266,150,12,2,14);},
hall(){R(0,0,320,24,7);for(let i=0;i<4;i++){R(130+i*16,6+i*3,30-i*4,3,14);}
  R(0,24,320,96,7);
  g.fillStyle=PAL[8];g.beginPath();g.moveTo(0,0);g.lineTo(118,44);g.lineTo(118,116);g.lineTo(0,170);g.fill();
  g.fillStyle=PAL[8];g.beginPath();g.moveTo(320,0);g.lineTo(202,44);g.lineTo(202,116);g.lineTo(320,170);g.fill();
  R(118,44,84,72,15);D(118,44,84,72,15,7);
  R(144,58,32,58,6);R(147,61,26,55,0);D(147,61,26,55,0,1);R(150,64,20,7,15);T(152,65,"COO",0);R(168,90,2,3,14);
  g.fillStyle=PAL[7];g.beginPath();g.moveTo(0,170);g.lineTo(118,116);g.lineTo(202,116);g.lineTo(320,170);g.fill();
  for(let i=1;i<6;i++){const yy=116+i*i*2;L(Math.max(0,118-i*i*4.7)|0,yy,Math.min(319,202+i*i*4.7)|0,yy,8);}
  L(160,116,160,169,8);L(140,116,90,169,8);L(180,116,230,169,8);
  g.fillStyle=PAL[6];g.beginPath();g.moveTo(26,38);g.lineTo(78,54);g.lineTo(78,128);g.lineTo(26,148);g.fill();
  g.fillStyle=PAL[0];g.beginPath();g.moveTo(30,44);g.lineTo(74,57);g.lineTo(74,125);g.lineTo(30,142);g.fill();R(66,90,3,3,14);
  R(32,60,36,9,15);T(34,62,"DEV PIT",0);
  g.fillStyle=PAL[8];g.beginPath();g.moveTo(294,38);g.lineTo(242,54);g.lineTo(242,128);g.lineTo(294,148);g.fill();
  g.fillStyle=PAL[0];g.beginPath();g.moveTo(290,44);g.lineTo(246,57);g.lineTo(246,125);g.lineTo(290,142);g.fill();
  R(248,62,40,9,15);T(250,64,"SERVERS",4);R(256,90,7,10,7);R(258,93,3,3,S&&S.inv.includes("badge")?10:((frame>>3)%2?12:4));
  R(92,96,14,22,9);D(92,96,14,22,9,11);R(94,88,10,8,11);R(96,118,10,6,8);
  R(214,98,16,20,4);D(214,98,16,20,4,6);R(208,80,28,20,2);D(210,74,24,10,2,10);
  R(113,151,95,11,0);R(113,151,95,1,8);T(116,154,"SECURITY (YOUR OFFICE)",15);const cn=COMPANY[Math.min(S.day,3)-1].toUpperCase();R(160-cn.length*2-3,46,cn.length*4+5,9,1);T(160-cn.length*2,48,cn,14);},
dev(){D(0,0,320,100,7,15);R(0,96,320,4,8);
  R(10,8,112,44,6);D(12,10,108,40,6,14);
  [[14,12,1],[48,12,2],[82,12,4],[14,30,0],[48,30,6],[82,30,5]].forEach(([x,y,c],k)=>{R(x,y,32,14,15);T(x+2,y+5,["SHIP IT","LGTM","AI FTW","NO TEST","OOPS","MCP?"][k],c);});
  R(206,4,100,38,15);R(208,6,96,34,9);const sp={1:["SPRINT 42","- AGENT SETUP","- SHIP REPRO"],2:["SPRINT 43","- BUMP DEPS","- RELEASE 2PM"],3:["SPRINT 44","- MAPWENDE","- FLOOD MAPS"],4:["IR-07 ACTIVE","- RAVI-MBP","- QUARANTINE"]}[S.day];T(212,10,sp[0],15);T(212,19,sp[1],14);T(212,28,sp[2],14);
  R(0,100,320,70,8);D(0,100,320,70,8,0);
  R(20,128,40,24,4);D(20,128,40,24,4,12);R(24,122,32,10,4);
  npcFigure();R(144,40,4,8,8);R(172,40,4,8,8);R(146,33,28,2,8);
  R(60,98,210,8,6);D(60,98,210,3,14,6);R(60,106,210,6,0);R(70,112,8,40,6);R(252,112,8,40,6);
  R(134,70,52,30,7);R(136,72,48,26,8);D(136,72,48,26,8,7);R(150,80,12,8,10);R(166,82,10,6,12);R(152,90,22,2,15);
  R(202,46,66,44,8);R(204,48,62,38,0);for(let i=0;i<6;i++)R(208,52+i*6,24+(i*13)%30,2,i===2?14:10);R(228,90,10,8,8);
  R(78,88,8,12,14);R(88,90,8,10,10);R(98,86,8,14,14);R(108,90,8,10,12);
  R(222,94,10,6,14);R(230,92,4,4,14);R(232,93,2,1,6);R(226,95,1,1,0);
  if(S.day===1&&!S.f.agentStopped&&!reduce)R(140+((frame*3)%40),66,2,2,10);if(S.day===4&&S.f.isolated){R(134,70,52,30,6);D(136,72,48,26,6,14);T(140,82,"TO IT",0);}},
closet(){D(0,0,320,130,0,1);R(0,130,320,40,8);D(0,130,320,40,8,0);
  for(let r=0;r<3;r++){const x=20+r*60;R(x,14,44,130,8);R(x+2,16,40,126,0);for(let u=0;u<14;u++){R(x+4,18+u*9,36,7,8);D(x+4,18+u*9,22,7,8,7);const on=((frame>>2)+u*7+r*3)%9;R(x+32,20+u*9,2,2,on<5?10:2);R(x+28,20+u*9,2,2,on===3?12:2);}}
  L(64,30,80,60,4);L(64,40,80,90,1);L(124,50,140,70,14);L(84,24,140,10,2);
  R(204,82,88,62,7);D(204,82,88,62,7,8);R(202,144,92,6,8);R(208,150,6,8,0);R(282,150,6,8,0);
  R(210,58,68,50,7);R(214,62,60,42,0);
  for(let i=0;i<5;i++)R(218,66+i*7,i===2?(S&&nasClean()?30:50):24+(i*11)%18,3,i===2&&S&&!nasClean()?14:10);
  if((frame>>3)%2)R(218,101,4,2,10);
  R(210,110,68,24,8);T(214,114,"NAS01",15);T(214,121,"DONT TURN",14);T(214,127,"OFF - GARY",14);
  R(296,18,22,124,6);R(298,20,18,122,0);D(298,20,18,122,0,8);R(300,80,2,4,14);},
coo(){D(0,0,320,108,1,9);R(0,104,320,4,8);
  R(14,8,124,84,7);windowSky(18,12,116,76);
  R(178,12,130,78,15);R(176,10,134,2,7);R(176,90,134,3,7);const wb={1:["DISBURSEMENT RUN","12:00 NOON","4,112 BORROWERS"],2:["PLIMBO RELEASE","2:00 PM","380K USERS"],3:["FLOOD MAPS","1:00 PM","12 FIELD TEAMS"],4:["IR-07","CONTAIN","NO SHORTCUTS"]}[S.day];T(184,18,wb[0],4);T(184,26,wb[1],4);
  L(186,78,208,62,1);L(208,62,232,68,1);L(232,68,258,44,1);L(258,44,294,36,1);T(184,82,wb[2],0);
  R(0,108,320,62,6);D(0,108,320,62,6,0);
  R(26,96,22,24,6);R(20,82,34,16,2);D(22,74,30,10,2,10);
  figure(110,40,{skin:6,hair:0,shirt:8,shade:0,pants:8,tie:4,collar:15});
  R(160,104,150,12,6);D(160,104,150,3,14,6);R(160,116,150,8,0);R(166,124,8,40,6);R(296,124,8,40,6);
  R(220,94,30,10,7);R(222,96,26,6,1);R(200,100,14,4,15);R(262,98,8,6,15);}};
/* hotspots: [x,y,w,h] in scene pixels */
const SPOTS={
desk:[
  {id:"monitor",name:"monitor",syn:["computer","screen","dashboard","crt","gitguardian","pc"],r:[116,26,104,84]},
  {id:"phone",name:"phone",syn:["mail","email","cellphone","desk phone"],r:[54,100,44,26]},
  {id:"drawer",name:"left desk drawer",syn:["drawer","drawers","left drawer","left desk drawer"],r:[18,140,60,30]},
  {id:"drawer2",name:"right desk drawer",syn:["right drawer","other drawer","second drawer","right desk drawer"],r:[242,140,60,30]},
  {id:"sticky",name:"sticky notes",syn:["notes","note","sticky","post-it"],r:[210,28,18,26]},
  {id:"mug",name:"coffee mug",syn:["coffee","mug","cup"],r:[230,88,26,34]},
  {id:"keyboard",name:"keyboard",syn:["keys"],r:[100,112,110,18]},
  {id:"papers",name:"printout",syn:["papers","paper","report","printout","q3"],r:[174,124,34,14]},
  {id:"window",name:"window",syn:["outside","sky"],r:[10,10,100,76]},
  {id:"poster",name:"poster",syn:["sign"],r:[232,10,46,32]},
  {id:"plant",name:"plant",syn:["fern"],r:[248,48,38,52]},
  {id:"door",name:"door to the hallway",syn:["door","hallway","hall","out"],r:[284,4,34,96],exit:"hall"}],
hall:[
  {id:"devdoor",name:"dev pit door",syn:["dev","dev pit","dana","left"],r:[26,38,52,110],exit:"dev"},
  {id:"srvdoor",name:"server closet door",syn:["server","servers","closet","server closet","right"],r:[242,38,52,110],exit:"closet"},
  {id:"coodoor",name:"COO's office door",syn:["coo","kofi","office","end"],r:[144,58,32,58],exit:"coo"},
  {id:"cooler",name:"water cooler",syn:["cooler","water"],r:[90,86,18,38]},
  {id:"back",name:"back to Security (your office)",syn:["desk","my desk","back","you","office","my office","security"],r:[112,146,97,24],exit:"desk"}],
dev:[
  {id:"npc",get name(){return npcName();},syn:["dana","ravi","amara","developer","engineer","her","him","holm","okafor","diallo","person"],r:[144,28,32,44],talk:true},
  {id:"laptop",get name(){return npcFirst()+"'s laptop";},syn:["laptop","terminal","agent"],r:[134,70,52,30]},
  {id:"screen2",get name(){return npcFirst()+"'s second monitor";},syn:["monitor","chat","second monitor"],r:[202,46,66,52]},
  {id:"cans",name:"energy drinks",syn:["cans","drinks","energy"],r:[76,84,42,16]},
  {id:"duck",name:"rubber duck",syn:["duck","rubber duck"],r:[220,88,16,12]},
  {id:"posters",name:"cork board",syn:["stickers","posters","wall","board","cork"],r:[10,8,112,44]},
  {id:"sprint",name:"sprint board",syn:["sprint","whiteboard","sprint board"],r:[206,4,100,38]},
  {id:"beanbag",name:"beanbag",syn:["bean bag","bag","chair"],r:[18,118,44,36]},
  {id:"out",name:"back to the hallway",syn:["hallway","hall","out","back"],r:[0,156,320,14],exit:"hall"}],
closet:[
  {id:"nas",name:"nas01's console",syn:["nas","nas01","console","screen","terminal","crontab","cron"],r:[204,56,90,90]},
  {id:"racks",name:"server racks",syn:["racks","rack","servers"],r:[18,12,170,134]},
  {id:"sign",name:"sign on nas01",syn:["sign","gary","label"],r:[210,110,68,24]},
  {id:"out",name:"back to the hallway",syn:["hallway","hall","out","back","door"],r:[296,18,22,124],exit:"hall"}],
coo:[
  {id:"kofi",name:P.coo,syn:["kofi","coo","lopez","him"],r:[108,38,32,68],talk:true},
  {id:"whiteboard",name:"whiteboard",syn:["board","chart","disbursement"],r:[176,10,134,84]},
  {id:"window",name:"window",syn:["outside","view"],r:[14,8,124,84]},
  {id:"plant",name:"plant",syn:["fern"],r:[18,70,38,52]},
  {id:"out",name:"back to the hallway",syn:["hallway","hall","out","back","door"],r:[0,156,320,14],exit:"hall"}]};
const ROOMNAME={desk:"Security (your office)",hall:"Hallway",dev:"The dev pit",closet:"Server closet",coo:"COO's office"};

function npcKey(){return DAYS[S.day].npc;}
function npcName(){return P[npcKey()];}
function npcFirst(){return npcName().split(" ")[0];}
function npcFigure(){const k=npcKey();
  if(k==="dana"){figure(146,34,{skin:6,hair:0,shirt:4,shade:0,long:true,seated:true,collar:4});}
  else if(k==="ravi"){figure(146,34,{skin:6,hair:0,shirt:2,shade:0,seated:true,collar:2});R(150,33,20,3,0);}
  else {figure(146,34,{skin:6,hair:5,shirt:3,shade:0,long:true,seated:true,collar:15});R(152,32,16,4,5);}}
function anyTrig(){return dayIncs(S.day).some(id=>INC(id)&&INC(id).created&&INC(id).status==="TRIGGERED")||(S.day===4&&!got("ht",4));}
function anyLive(){return dayIncs(S.day).some(id=>INC(id)?INC(id).key.v1:S.day===4);}
function nasClean(){const h=S.hosts.nas01;return !/sk-proj-|SG\./.test(h.cron.split("\n").filter(l=>!/^\s*#/.test(l)).join("\n"));}
