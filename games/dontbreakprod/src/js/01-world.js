/* ==========================================================================================
   DON'T BREAK PROD — a GitGuardian adventure at Precarium Inc.
   Same engine family as LossyInc Range: EGA pixel scenes, verbs, a Windows 3.1 laptop,
   message windows and dialogs. One long quest, six levels, an elevator between departments.
   Everything is simulated. No real systems are contacted.
   ========================================================================================== */
const BUILD="__BUILD__";
const COMPANY="Precarium Inc.";
const START_T={1:9*60,2:11*60,3:13*60+30,4:15*60,5:16*60+30,6:23*60};
const LV={
 1:{name:"Restricted",floor:"Floors B1 and 2",tag:"Day one. GitGuardian lets you see one incident. Somewhere in there is something bad."},
 2:{name:"Can view",floor:"Floor 3 · Engineering",tag:"You can see every incident now. You can't touch any of them."},
 3:{name:"Change freeze",floor:"Floor 4 · Platform & SRE",tag:"Prod belongs to SRE, and SRE has been burned before. Earn a change window."},
 4:{name:"Quarter close",floor:"Floor 5 · Finance & Compliance",tag:"The freeze exists for Finance. Talk money, not malware."},
 5:{name:"The top floor",floor:"Floor 6 · Executive",tag:"One signature left. The CTO doesn't believe anyone reads a contractor's old gist."},
 6:{name:"Don't Break Prod",floor:"Anywhere, with your laptop",tag:"11:00 PM. Rotate a live payment key while checkout keeps taking money."}};
/* the people. kpi = what they're measured on; agenda = what they actually want */
const PPL={
 otto:{name:"Otto Brannigan",role:"Help desk lead",kpi:"Tickets closed per day",agenda:"Not be the guy who caused a breach",bg:6,hair:6,shirt:2,skin:6},
 marisol:{name:"Marisol Vance",role:"IT Director · GitGuardian Manager",kpi:"SOC 2 audit closes Friday",agenda:"Prove the GitGuardian purchase was her best idea",bg:5,hair:0,shirt:5,skin:6,long:true},
 juni:{name:"Juni Castellano",role:"Senior engineer, Payments",kpi:"Ship Pay Later 2.0 without weekend work",agenda:"Never see a false positive again",bg:3,hair:4,shirt:3,skin:12,long:true,glasses:true},
 wendell:{name:"Wendell Park",role:"Engineering manager, Payments",kpi:"Deploy frequency and sprint velocity",agenda:"Make Director by Q1",bg:1,hair:0,shirt:9,skin:6},
 ingrid:{name:"Ingrid Solberg",role:"Head of SRE",kpi:"99.95% uptime, change failure rate",agenda:"Never again explain a self-inflicted outage",bg:8,hair:14,shirt:0,skin:12,long:true},
 kenji:{name:"Kenji Albright",role:"SRE, on call for the third night running",kpi:"Pages per shift (too many)",agenda:"Sleep",bg:2,hair:0,shirt:10,skin:6},
 desmond:{name:"Desmond Achebe",role:"Compliance manager",kpi:"PCI DSS assessment passes Monday",agenda:"Stop fabricating evidence at midnight",bg:9,hair:0,shirt:15,skin:6,glasses:true},
 harriet:{name:"Harriet Quill",role:"CFO",kpi:"A clean Q4 close",agenda:"Cut tools nobody can explain",bg:4,hair:7,shirt:4,skin:12,long:true},
 paloma:{name:"Paloma Reyes",role:"Executive assistant to the CTO",kpi:"Victor's calendar survives the day",agenda:"Protect Victor from people like you",bg:13,hair:6,shirt:13,skin:6,long:true},
 victor:{name:"Victor Lamb",role:"CTO",kpi:"Pay Later 2.0 launches Monday",agenda:"A good story for the board",bg:0,hair:8,shirt:8,skin:12,tie:4}};
const FLOORS=[["6","Executive"],["5","Finance"],["4","SRE"],["3","Engineering"],["2","IT & Security"],["1","Lobby"],["B1","Help desk"]];
const FLOOR_ROOM={"B1":"b1","2":"f2","3":"f3","4":"f4","5":"f5","6":"f6"};
const ROOMNAME={closet:"Security (a supply closet)",f2:"Floor 2 · IT & Security",lift:"Elevator",b1:"B1 · Help desk",f3:"Floor 3 · Engineering",f4:"Floor 4 · Platform & SRE",f5:"Floor 5 · Finance & Compliance",f6:"Floor 6 · Executive"};
const ROOMFLOOR={closet:"2",f2:"2",b1:"B1",f3:"3",f4:"4",f5:"5",f6:"6"};
/* points: every award key lives here so the maximum is honest */
const POINTS={
 mail:2,ggOpen:2,thValid:3,otto:3,thResolved:3,m1:3,m2:3,m3:3,win1:4,
 pr:2,prMap:3,csv:3,juni:2,hook:5,w1:3,w2:3,w3:3,win2:4,
 ingrid:2,coffee:2,scout:5,map3:3,runbook:5,i1:3,i2:3,i3:3,win3:4,
 harriet:2,des:2,pci:3,contract:3,h1:3,h2:3,h3:3,win4:4,
 paloma:1,victor:2,htMade:3,htPlanted:2,htFired:3,v1p:3,v2p:3,v3p:3,win5:4,
 newkey:4,vault:4,deploy:4,recon:5,quiet:4,revoke:5,final:6};
const MAXSCORE=Object.values(POINTS).reduce((a,b)=>a+b,0);
/* the leaked key, before and after */
const K1="sk_live_51Hq…7Qd",K2="sk_live_51Hq…r2Xq";

/* ============================== state ============================== */
const NAME_FIRST=["Alex","Sam","Jordan","Priya","Mateo","Noor","Kai","Lena","Tariq","Mei","Diego","Ines","Femi","Hana","Rosa","Theo","Yara","Omar"];
const NAME_LAST=["Keyes","Vaultman","Rotello","Hashworth","Tokenberg","Saltwell","Okoro","Lindqvist","Patchett","Revokovich","Cipriano","Nakamura"];
function randomName(){const r=a=>a[Math.floor(Math.random()*a.length)];return r(NAME_FIRST)+" "+r(NAME_LAST);}
let S=null,verb="hand",heldItem=null,frame=0;
const first=()=>((S&&S.player)||"you").split(" ")[0];
function fresh(name){return {v:1,player:name||randomName(),lv:1,room:"closet",t:START_T[1],inv:["laptop"],f:{},got:{},score:0,
  badge:["2","B1"],gg:"Restricted",acc:["Badge: Floor 2 and B1","Your laptop (BrickBook 9000) and email","GitGuardian: Restricted (sees only incidents shared with you)"],
  mail:[],pitch:{},seen:{},ckpt:null,ended:false,dead:null,
  c:{checkout:"v1",payouts:"v1",recon:"hard"},vault:{production:["v1"],default:[]},pr:{v2:false,v1:true},ht:null};}
const hhmm=t=>{t=((t%1440)+1440)%1440;const h=Math.floor(t/60),m=t%60;return `${((h+11)%12)+1}:${String(m).padStart(2,"0")} ${h<12?"AM":"PM"}`;};
function advance(m){if(!S||S.dead)return;S.t+=m||1;htTick();}
function award(k){if(!S||S.got[k]||!POINTS[k])return 0;S.got[k]=1;S.score+=POINTS[k];return POINTS[k];}
const has=it=>S.inv.includes(it);
function give(it){if(!has(it)){S.inv.push(it);}}
function take(it){S.inv=S.inv.filter(x=>x!==it);if(heldItem===it)heldItem=null;}
function grant(line){if(!S.acc.includes(line))S.acc.push(line);}
function mail(id,from,subj,body){if(S.mail.some(m=>m.id===id))return;S.mail.push({id,from,subj,body,time:hhmm(S.t),read:false});}
/* which key each consumer uses right now */
const vaultProd=()=>S.vault.production[S.vault.production.length-1];
function effKey(k){if(k==="recon")return S.c.recon==="vault"?vaultProd():"v1";return S.c[k];}
const v1InUseLive=()=>effKey("checkout")==="v1"||effKey("payouts")==="v1";
const v1InUseAny=()=>v1InUseLive()||effKey("recon")==="v1";
