/* ============================== How to play: the training level ==============================
   Cloned from LossyInc Range's training (12-tutorial.js), rewritten for Don't Break Prod.
   Optional, from the title screen. No clock pressure, no score, nothing saved.
   Part 1 teaches the controls: the laptop, Program Manager, walking, talking, the elevator, the Quest pad.
   Part 2 explains what GitGuardian is showing, for someone who has never used it.
   A coach box gives one instruction at a time. A green outline and arrow mark what to click next.
   They never move or blink (house rule for this game). */
const TUT={on:false,n:0,timer:null,last:-1,min:false,sig:""};
const pcOpen=()=>!!document.getElementById("pcroot");
const ggOpen=()=>pcOpen()&&WM.wins.some(w=>w.app==="gg"&&!w.min);
const dlgOpen=()=>!!document.querySelector("#msglayer .dlg");
const ggList=()=>document.querySelector('#w31 [data-act="open:2871"]')?'#w31 [data-act="open:2871"]':'#w31 [data-act="gg:list"]';
const TSTEPS=[
 {part:1,t:"Welcome to training",x:`Nothing can go wrong in here. There's no score, no deadline, and nothing is saved.\n\n<b>Part 1</b> shows you the controls in nine short moves. <b>Part 2</b> explains what GitGuardian, the security tool on your laptop, is telling you.\n\nThe <b>green outline and arrow</b> always mark what to click next. Everything you can click in a room is also listed under the picture.`,next:"Start"},
 {part:1,t:"Your office",x:`This is your office. It's a supply closet. You're the new security engineer at Precarium, and this is what they had.\n\nOutlined in green:\n• <b>your laptop</b> on the desk, where GitGuardian runs\n• the <b>shelves</b> and the <b>mop bucket</b> (people around the building lose things)\n• the <b>sticky note</b> and the <b>sign</b>\n• the <b>door</b> out to Floor 2\n\nPoint at anything and it gets a thin outline.`,labels:[["closet","desklaptop","Your laptop"],["closet","shelves","Shelves"],["closet","bucket","Mop bucket"],["closet","sticky","Sticky note"],["closet","sign","Sign"],["closet","door","Door to Floor 2"]],next:"Next"},
 {part:1,t:"1 · Open your laptop",x:`The buttons under the picture are <b>actions</b>. <b>Use</b> (the hand) is already picked, and it does almost everything.\n\nClick your <b>laptop</b> on the desk.\n\nAnywhere else in the building, the <b>Laptop</b> button under the picture does the same thing. You carry it everywhere.`,sel:["closet","desklaptop"],done:pcOpen},
 {part:1,t:"2 · Open GitGuardian",x:`Your laptop runs a homemade copy of Windows 3.1. This is <b>Program Manager</b>, where every program starts.\n\nIn the group called <b>Secruity Toolz</b> (yes, it's misspelled), click <b>GitGuardian</b>.`,sel:'#w31 [data-pc="gg"]',done:ggOpen},
 {part:1,t:"3 · Close the laptop",x:`That's GitGuardian. It runs in a browser, full screen. You'll come back to it in part 2.\n\nTo get back to the room, click <b>Close the laptop</b> at the bottom right.`,sel:'[data-pcclose]',done:()=>!pcOpen()},
 {part:1,t:"4 · Walk out the door",x:`Click the <b>door</b> on the right. Use works on doors too.\n\nYou can also click <b>Floor 2</b> in the list under the picture.`,sel:["closet","door"],done:()=>S.room==="f2"},
 {part:1,t:"5 · Talk to someone",x:`This is Floor 2. Every level has a <b>boss</b>: someone you have to convince before they'll change a setting or give you access. Marisol, the IT Director who runs GitGuardian, is the first.\n\nClick <b>Marisol</b> in her glass office to talk to her.`,sel:["f2","marisol"],done:dlgOpen},
 {part:1,t:"6 · Choose what to say",x:`Conversations are buttons:\n• <b>Yellow ▸ buttons</b> are your pitch to a boss. Three good ones fill the <b>Convinced</b> meter.\n• <b>Blue buttons</b> use something you're carrying, like "Give Marisol the silver pen".\n• <b>"Anything I can help with?"</b> starts a favor: find someone's lost thing for points.\n\nYou could pitch now, but bosses want evidence, and you don't have any yet. Click <b>Bye</b> for now.`,sel:'#msglayer .dlg button.bye',done:()=>!dlgOpen()},
 {part:1,t:"7 · Take the elevator",x:`Click the <b>elevator</b> doors in the middle of the room.`,sel:["f2","lift"],done:()=>S.room==="lift"},
 {part:1,t:"8 · Ride to B1",x:`Floors with a red light are locked. Your badge opens Floor 2 and B1 today. You get more floors by winning people over.\n\nClick <b>B1</b>: the basement, where the help desk is.`,sel:["lift","btnB1"],done:()=>S.room==="b1"},
 {part:1,t:"9 · The Quest pad",x:`The <b>blue bar</b> at the top of the picture always names your next step.\n\nClick <b>Quest</b> on the right end of it to see the whole level, the favors you've heard about, and what you're allowed to touch.`,sel:'#goalBtn',done:()=>!!document.getElementById("padwrap")},
 {part:1,t:"That's how to play",x:`• <b>Use</b> does almost everything: doors, objects, people, the elevator\n• <b>Look</b> tells you what something is (often with a hint)\n• <b>Talk</b> and <b>Walk</b> are there if you want them\n• <b>Items</b> lists what you're carrying\n• The <b>Laptop</b> button opens your laptop anywhere\n\nPeople only answer <b>Slack</b> once you've met them in person. Every level screen shows a <b>save code</b>: write it down to pick up there on any device.`,next:"Part 2: GitGuardian",end:"End training",
  enter:()=>{const p=document.getElementById("padwrap");if(p)p.remove();}},
 {part:2,t:"Open GitGuardian again",x:`Click the <b>Laptop</b> button under the picture, then <b>GitGuardian</b> in Program Manager.\n\nIn the real game you start <b>Restricted</b> and only see incidents someone shares with you. For training, you can see everything.`,sel:()=>pcOpen()?'#w31 [data-pc="gg"]':'[data-laptop]',done:ggOpen,enter:()=>{S.gg="Member · Can view";}},
 {part:2,t:"What GitGuardian watches for",x:`Programs log in to other services the way you log in to a website, except they use a <b>secret</b>: an API key, a token or a password written into their settings.\n\nWhen a secret ends up somewhere it shouldn't, like code on GitHub, anyone who finds it can act as your company. In 2024, <b>23.8 million</b> secrets leaked on public GitHub alone, and <b>70%</b> of the secrets leaked in 2022 still worked years later.\n\nGitGuardian scans code, laptops and servers for secrets and raises an <b>incident</b> for each one. Each row here is one.`,sel:()=>ggList(),next:"Next"},
 {part:2,t:"Open the PayRail incident",x:`Click the <b>PayRail</b> row. PayRail is Precarium's payment provider: this key moves real money for checkout and payouts.`,sel:()=>ggList(),done:()=>ggOpen()&&ggRoute.page==="incident"&&String(ggRoute.id)==="2871"},
 {part:2,t:"What leaked, and who's on it",x:`The title says what kind of secret it is.\n\nThe <b>Incident details</b> panel is the paperwork: <b>Status</b> (Triggered means nobody has handled it yet), <b>Severity</b>, who's assigned, and <b>Your access</b>. With edit access you'd also get <b>Resolve</b> and <b>Ignore</b> buttons.\n\nResolving is a label. It doesn't make the key stop working.`,sel:'#w31 .ggaside',next:"Next"},
 {part:2,t:"Is it still valid?",x:`<b>Secret validity</b> is the most important word on the page. <b>Valid</b> means the key still works right now. Think of a lost house key: until the locks change, whoever finds it can walk in.\n\n<b>Check validity</b> asks again. Try it.`,sel:'#w31 [data-act="valid:2871"]',next:"Next"},
 {part:2,t:"The exploration map",x:`Click <b>Exploration map</b> on the incident.`,sel:'#w31 [data-act="ggmap:2871"]',done:()=>ggOpen()&&ggRoute.page==="map"},
 {part:2,t:"Who depends on this key",x:`The map has three columns:\n• <b>Consumers</b>: the programs that use this key. Cancel the key and they break. Here, that's <b>checkout-api</b> and <b>payouts-worker</b>.\n• The dashed box, <b>Unmapped sources may exist</b>, is a warning: machines not connected to GitGuardian don't show up. Remember that later.\n• <b>Secret</b>: the key itself, and the vault it's stored in, if any.\n• <b>Accessed resources</b>: what the key unlocks.\n\nThis is how you avoid breaking prod: you know who to warn before you change anything.`,next:"Next"},
 {part:2,t:"Back, like a browser",x:`GitGuardian runs in a browser. Click <b>◀ Back</b> at the top left to return to the incident.`,sel:'[data-ggnav="back"]',done:()=>ggRoute.page==="incident"},
 {part:2,t:"How you fix it",x:`Click the <b>Remediation</b> tab.`,sel:'#w31 [data-act="tab:rem"]',done:()=>ggRoute.page==="incident"&&ggRoute.tab==="rem"},
 {part:2,t:"The order matters",x:`The fix, in order:\n1. Find everything that uses the key\n2. Put it in a vault\n3. Point the programs at the vault\n4. Make a new key, and test that everything still works\n5. Only then revoke the old key\n6. Check the logs for anyone who used it\n\nRevoke too early and checkout goes down. Revoke too late and a stranger keeps the key.\n\nYou can't do any of this alone. Each level is about convincing the person who can, with GitGuardian as your evidence.`,next:"Next"},
 {part:2,t:"Training complete",x:`You know the controls and what GitGuardian is telling you.\n\nWhen you're ready, start Level 1. Your badge opens two floors, your office is a closet, and your GitGuardian account can see exactly one incident.`,next:"Start Level 1",end:"Back to title",final:true}];
/* the Quest pad during training lists the training itself */
const TUT_CL=[["Part 1 · How to play",[[3,"Open your laptop"],[4,"Open GitGuardian from Program Manager"],[5,"Close the laptop"],[6,"Walk out the door"],[7,"Talk to Marisol"],[8,"Choose what to say"],[9,"Take the elevator"],[10,"Ride to B1"],[11,"Open the Quest pad"]]],
 ["Part 2 · What GitGuardian shows",[[14,"What GitGuardian watches for"],[15,"Open the PayRail incident"],[17,"Validity"],[19,"The exploration map"],[20,"Back, like a browser"],[22,"Remediation: the order of the fix"]]]];
function startTutorial(){S=fresh("Trainee");S.tut=true;clearMsgs();LVMAIL[1]();showGame();TUT.on=true;TUT.n=0;TUT.last=-1;TUT.min=false;tutRender();clearInterval(TUT.timer);TUT.timer=setInterval(tutTick,250);requestAnimationFrame(tutOverlay);}
function tutEnd(toTitle){TUT.on=false;clearInterval(TUT.timer);const c=document.getElementById("coach");if(c)c.remove();["tutbox","tutarrow","tutlabels"].forEach(i=>{const e=document.getElementById(i);if(e)e.remove();});if(toTitle)title();}
function tutSel(st){return typeof st.sel==="function"?st.sel():st.sel;}
/* a step's target: a CSS selector, or [room, hotspot id] for something drawn in the scene */
function spotRect(room,id){if(pcOpen()||!S||S.room!==room)return null;const sp=(SPOTS[room]||[]).find(x=>x.id===id);const c=document.getElementById("scene");if(!sp||!c)return null;const r=c.getBoundingClientRect(),k=r.width/320,q=r.height/170;if(!r.width)return null;
  return {left:r.left+sp.r[0]*k,top:r.top+sp.r[1]*q,width:sp.r[2]*k,height:sp.r[3]*q,right:r.left+(sp.r[0]+sp.r[2])*k,bottom:r.top+(sp.r[1]+sp.r[3])*q};}
function tutEl(st){const sel=st&&tutSel(st);if(!sel||Array.isArray(sel))return null;return document.querySelector(sel);}
function tutRect(st){const sel=st&&tutSel(st);if(!sel)return null;if(Array.isArray(sel))return spotRect(sel[0],sel[1]);
  const el=document.querySelector(sel);if(!el)return null;const r=el.getBoundingClientRect();return r.width&&r.height?r:null;}
/* a message box covers the scene: hide the marker unless the thing to click is inside that box */
function covered(st){const w=document.querySelector("#msglayer .msgwrap");if(!w)return false;const el=tutEl(st);return !(el&&w.contains(el));}
function tutTick(){if(!TUT.on||!S||!S.tut)return tutEnd(false);const st=TSTEPS[TUT.n];if(!st)return;
  if(st.done&&st.done()){TUT.n++;return tutRender();}
  const sig=screenSig();if(sig!==TUT.sig){TUT.sig=sig;if(TUT.min){TUT.min=false;return tutRender();}}
  if(!document.getElementById("coach"))tutRender();placeCoach();}
function screenSig(){return [S.room,pcOpen(),(WM.wins||[]).map(w=>w.app+(w.min?"-":"")+(w.max?"+":"")).join(","),ggRoute.page,ggRoute.id||"",ggRoute.tab||"",dlgOpen()].join("|");}
function tutLabels(){let lay=document.getElementById("tutlabels");const st=TSTEPS[TUT.n];const ls=(st&&st.labels)||[];
  if(!ls.length||document.querySelector("#msglayer .msgwrap")){if(lay)lay.innerHTML="";return;}
  if(!lay){lay=document.createElement("div");lay.id="tutlabels";lay.setAttribute("aria-hidden","true");document.body.appendChild(lay);}
  lay.innerHTML=ls.map(([room,id,txt])=>{const r=spotRect(room,id);if(!r)return "";return `<div class="tl-box" style="left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px"></div><div class="tl-tag" style="left:${Math.max(4,Math.min(innerWidth-170,r.left))}px;top:${Math.max(4,r.top-22)}px">${txt}</div>`;}).join("");}
/* a still green outline over the thing to click, and an arrow pointing at it. Re-measured every frame, so it follows windows and re-renders; it never animates. */
function tutOverlay(){if(!TUT.on)return;tutLabels();
  let box=document.getElementById("tutbox"),ar=document.getElementById("tutarrow");
  if(!box){box=document.createElement("div");box.id="tutbox";box.setAttribute("aria-hidden","true");document.body.appendChild(box);}
  if(!ar){ar=document.createElement("div");ar.id="tutarrow";ar.setAttribute("aria-hidden","true");ar.innerHTML='<svg viewBox="0 0 64 40" width="64" height="40"><path d="M2 14h38V2l22 18-22 18V26H2z" fill="#39FF14" stroke="#062B00" stroke-width="3" stroke-linejoin="round"/></svg>';document.body.appendChild(ar);}
  const st=TSTEPS[TUT.n];const r=tutRect(st);if(!r||covered(st)||TUT.min&&false){box.hidden=true;ar.hidden=true;}else{box.hidden=false;ar.hidden=false;const p=5;
    Object.assign(box.style,{left:r.left-p+"px",top:r.top-p+"px",width:r.width+2*p+"px",height:r.height+2*p+"px"});
    const cx=r.left+r.width/2,cy=r.top+r.height/2;let x,y,rot;
    if(r.left>84){x=r.left-p-74;y=cy-20;rot=0;}else if(r.top>60){x=cx-32;y=r.top-p-50;rot=90;}else if(innerWidth-r.right>84){x=r.right+p+10;y=cy-20;rot=180;}else{x=cx-32;y=r.bottom+p+10;rot=-90;}
    ar.style.left=x+"px";ar.style.top=y+"px";ar.style.setProperty("--rot",rot+"deg");}
  requestAnimationFrame(tutOverlay);}
/* put the coach in the corner that covers the least of its target, the labels and the action bar */
function placeCoach(){const c=document.getElementById("coach");if(!c)return;
  if(matchMedia("(max-width:760px)").matches){c.style.left=c.style.top="";const bar=document.getElementById("iconbar");const off=document.querySelector(".bezel .off");
    const br=bar&&bar.getBoundingClientRect();c.style.bottom=(pcOpen()?(off?off.offsetHeight+14:56):(br&&br.height?Math.max(8,innerHeight-br.top+6):8))+"px";return;}
  c.style.bottom="";const vw=innerWidth,vh=innerHeight,w=c.offsetWidth,h=c.offsetHeight,m=12;const tr=tutRect(TSTEPS[TUT.n]);
  const ov=(x,y,r)=>!r?0:Math.max(0,Math.min(x+w,r.right+40)-Math.max(x,r.left-40))*Math.max(0,Math.min(y+h,r.bottom+30)-Math.max(y,r.top-30));
  const avoid=[];if(tr)avoid.push([tr,10]);const st2=TSTEPS[TUT.n];for(const [room,id] of (st2&&st2.labels)||[]){const r=spotRect(room,id);if(r)avoid.push([r,4]);}
  const dl=document.querySelector("#msglayer .dlg, #msglayer .pad");if(dl)avoid.push([dl.getBoundingClientRect(),3]);
  if(!pcOpen()){const bar=document.getElementById("iconbar");if(bar)avoid.push([bar.getBoundingClientRect(),6]);}
  const cands=pcOpen()?[[m,vh-h-m],[vw-w-m,vh-h-m],[vw-w-m,m],[m,m]]:[[vw-w-m,vh-h-m],[m,vh-h-m],[m,m],[vw-w-m,m]];
  let best=cands[0],bs=Infinity;for(const [x,y] of cands){const sc=avoid.reduce((t,[r,wt])=>t+wt*ov(x,y,r),0);if(sc<bs){bs=sc;best=[x,y];}}
  c.style.left=Math.max(m,best[0])+"px";c.style.top=Math.max(m,best[1])+"px";}
function tutRender(){let c=document.getElementById("coach");if(!c){c=document.createElement("div");c.id="coach";c.setAttribute("role","dialog");c.setAttribute("aria-live","polite");c.setAttribute("aria-label","How to play");document.body.appendChild(c);}
  const st=TSTEPS[TUT.n];if(!st)return tutEnd(true);if(TUT.last!==TUT.n){TUT.min=false;if(st.enter)st.enter();}c.classList.toggle("min",!!TUT.min);
  c.innerHTML=`<div class="ch"><span>How to play · part ${st.part} of 2 · ${TUT.n+1}/${TSTEPS.length}</span><button class="cmin" data-tutmin aria-expanded="${!TUT.min}">${TUT.min?"▴ Show":"▾ Hide"}</button></div><b class="ct">${st.t}</b><div class="cx">${st.x}</div><div class="cb">${st.next?`<button data-tutnext>${st.next}</button>`:`<span class="cw">Do it to continue</span>`}${st.end?`<button data-tutend>${st.end}</button>`:`<button data-tutend class="sub">End training</button>`}</div>`;
  TUT.last=TUT.n;placeCoach();try{updateBar();}catch(e){}}
document.addEventListener("click",e=>{if(e.target.closest("[data-tt='tut']"))return startTutorial();
  if(e.target.closest("[data-tutmin]")){TUT.min=!TUT.min;TUT.sig=screenSig();return tutRender();}
  if(e.target.closest("[data-tutnext]")){const st=TSTEPS[TUT.n];if(st&&st.final){tutEnd(true);const b=document.querySelector('[data-tt="new"]');if(b)b.click();return;}TUT.n++;return tutRender();}
  if(e.target.closest("[data-tutend]")){tutEnd(true);}});
