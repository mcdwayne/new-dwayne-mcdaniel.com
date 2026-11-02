/* ============================== LR-24: Training level ==============================
   Optional, from the title screen. A coached Tuesday with no clock, no deadlines, no score and no saving.
   Part 1 teaches the controls (open GitGuardian, turn away from the screen, walk to the hallway and back).
   Part 2 explains what the GitGuardian dashboard is showing, written for someone who has never used it. */
const TUT={on:false,n:0,timer:null,last:-1};
const pcOpen=()=>!!document.getElementById("pcroot");
const ggOpen=()=>pcOpen()&&WM.wins.some(w=>w.app==="gg"&&!w.min);
const TSTEPS=[
 {part:1,t:"Welcome to training",x:`Nothing can go wrong in here. There's no clock, no deadline and no score, and nothing is saved.\n\n<b>Part 1</b> shows you the controls in four moves. <b>Part 2</b> explains what GitGuardian, the security tool on your computer, is telling you.\n\nThe green arrow and the pulsing green outline always point at what to click next. On a phone, everything you can click in a room is also listed under the picture.`,next:"Start"},
 {part:1,t:"1 · Open your computer",x:`The row of buttons under the picture is the <b>verb bar</b>. Click <b>Use</b> (the hand), then click the beige <b>monitor</b> on your desk.\n\nYou can also type <b>use monitor</b> in the box under the picture and press Enter.`,sel:'.ic[data-verb="hand"]',done:pcOpen},
 {part:1,t:"2 · Open GitGuardian",x:`Your computer runs a homemade copy of Windows 3.1. In <b>Program Manager</b>, find the group called <b>Secruity Toolz</b> (yes, it's misspelled) and click <b>GitGuardian</b>.`,sel:()=>pcOpen()?'[data-pc="gg"]':'.ic[data-verb="hand"]',done:ggOpen},
 {part:1,t:"3 · Turn away from the screen",x:`That's GitGuardian. You'll come back to it in part 2.\n\nTo get back to the office, click <b>Turn away from the screen</b> at the bottom right of the monitor.`,sel:'[data-pcclose]',done:()=>!pcOpen()},
 {part:1,t:"4 · Walk to the hallway",x:`Click <b>Walk</b> (the legs), then click the <b>door</b> at the far right edge of the room.\n\nOr type <b>go hallway</b>.`,sel:()=>verb==="walk"?["desk","door"]:'.ic[data-verb="walk"]',done:()=>S.room==="hall"},
 {part:1,t:"5 · Walk back to your desk",x:`This hallway connects every room: the dev pit, the server closet and the COO's office.\n\nThe other doors are locked during training. Go back: <b>Walk</b>, then click the bottom middle of the hallway, marked <b>back to your desk</b>. Or type <b>go desk</b>.`,sel:()=>verb==="walk"?["hall","back"]:'.ic[data-verb="walk"]',done:()=>S.room==="desk"},
 {part:1,t:"That's how to play",x:`Four verbs do everything:\n• <b>Use</b> opens and operates things\n• <b>Talk</b> gets people talking (they know things the tools don't)\n• <b>Look</b> tells you what something is\n• <b>Walk</b> moves you around\n\nIn the real game, every action costs a few minutes, and the blue bar under the picture always names your next step.`,next:"Part 2: the dashboard",end:"End training"},
 {part:2,t:"Open GitGuardian again",x:`Use the monitor, then click GitGuardian in Program Manager.`,sel:()=>pcOpen()?'[data-pc="gg"]':'.ic[data-verb="hand"]',done:ggOpen},
 {part:2,t:"What GitGuardian watches for",x:`Programs log in to other services the way you log in to a website, except they use a <b>secret</b>: an API key, a token or a password written into their settings.\n\nWhen a secret ends up somewhere it shouldn't, like code on GitHub, anyone who finds it can act as your company. In 2024, <b>23.8 million</b> secrets leaked on public GitHub alone, and <b>70%</b> of the secrets leaked in 2022 still worked years later.\n\nGitGuardian scans code, laptops and servers for secrets and raises an <b>incident</b> for each one it finds. Each row here is one.`,sel:'[data-openinc="1017"]',next:"Next"},
 {part:2,t:"Open the incident",x:`Click the <b>OpenAI API Key</b> row. An AI coding assistant pasted this key into a config file this morning.`,sel:'[data-openinc="1017"]',done:()=>ggOpen()&&ggRoute.page==="incident"},
 {part:2,t:"What leaked, and who's on it",x:`The title says what kind of secret it is. An OpenAI key lets a program use OpenAI's AI models, and the company pays for every use. If a stranger has it, they spend your money.\n\nThe <b>Incident details</b> panel (on the right, or at the top on a phone) is the paperwork: <b>Status</b> (Triggered means nobody has handled it yet), <b>Severity</b> (how bad), who's assigned, and the <b>Resolve</b> and <b>Ignore</b> buttons.\n\nResolving is a label. It doesn't make the key stop working.`,sel:'.ggaside',next:"Next"},
 {part:2,t:"Risk score and validity",x:`<b>Risk score</b> (0 to 99) is GitGuardian's guess at how urgent this is, with the reasons listed next to it.\n\n<b>Secret validity</b> is the most important word on the page. <b>Valid</b> means the key still works right now. Think of a lost house key: until the locks change, whoever finds it can walk in. <b>Check validity</b> tests it again.`,sel:'[data-ggcheck]',next:"Next"},
 {part:2,t:"The exploration map",x:`Click <b>Exploration map</b> at the top of the incident.`,sel:'[data-ggmap="1017"].xtoggle',done:()=>ggOpen()&&ggRoute.page==="map"},
 {part:2,t:"Who depends on this key",x:`The map has three columns:\n• <b>Consumers</b>: the programs that use this key. Cancel the key and they break. Here, one of them pays out 4,112 small loans at noon.\n• <b>Secret</b>: the leaked key itself. Once it's stored in a <b>vault</b> (a locked safe where programs fetch keys instead of keeping copies), the vault shows up here too. This key isn't in one yet, so there's no vault on the map.\n• <b>Accessed resources</b>: what the key unlocks.\n\nThe dashed box matters: some machines aren't connected to GitGuardian, so the map can miss consumers. People and server logs fill the gaps.`,sel:'.card.map svg',next:"Next"},
 {part:2,t:"Where it leaked",x:`Click <b>Back to incident</b>, then the <b>Occurrences</b> tab.`,sel:()=>ggRoute.page==="map"?'.hdr [data-openinc="1017"]':'[data-ggtab="occ"]',done:()=>ggRoute.page==="incident"&&ggRoute.tab==="occ"},
 {part:2,t:"Every copy, and who made it",x:`Each occurrence is one place the secret was found: the repository, the file, the commit and who wrote it.\n\nThis is real life. In 2022, Toyota found an access key that had sat in public code on GitHub for about five years, exposing data on roughly 296,000 customers.`,sel:'.ggpanel[data-panel="occ"] .card',next:"Next"},
 {part:2,t:"How you fix it",x:`Click the <b>Remediation</b> tab.`,sel:'[data-ggtab="rem"]',done:()=>ggRoute.tab==="rem"},
 {part:2,t:"The order matters",x:`These six steps are the fix, in order:\n1. Find everything that uses the key\n2. Put it in a vault\n3. Point the programs at the vault\n4. Test that they still work\n5. Make a new key, put it in the vault, then cancel (<b>revoke</b>) the old one\n6. Check the logs for anyone who used it\n\nRevoke too early and the company's own programs break. Revoke too late and a stranger keeps spending your money. When a key has already been stolen, you revoke first and repair after.`,sel:'.ggpanel[data-panel="rem"] .steps',next:"Next"},
 {part:2,t:"Training complete",x:`You know the controls and what the dashboard is telling you. In the real game the clock is running, people will page you, and mistakes cost loans, money and customers' trust.\n\nWhen you're ready, start Tuesday.`,next:"Start Tuesday",end:"Back to title",final:true}];
function startTutorial(){S=fresh();S.player="Trainee";S.tut=true;snaps=[];beginDay(1);showGame();TUT.on=true;TUT.n=0;TUT.last=-1;tutRender();clearInterval(TUT.timer);TUT.timer=setInterval(tutTick,250);requestAnimationFrame(tutOverlay);}
function tutEnd(toTitle){TUT.on=false;clearInterval(TUT.timer);const c=document.getElementById("coach");if(c)c.remove();if(toTitle)title();}
/* the checklist (Tasks) during training lists the training itself */
const TUT_CL=[["Part 1 · How to play",[[2,"Open your computer (Use, then the monitor)"],[3,"Open GitGuardian from Program Manager"],[4,"Turn away from the screen"],[5,"Walk to the hallway"],[6,"Walk back to your desk"]]],
 ["Part 2 · What the dashboard shows",[[9,"What GitGuardian watches for"],[10,"Open the OpenAI API Key incident"],[11,"The details panel: status, severity, Resolve and Ignore"],[12,"Risk score and validity"],[14,"The exploration map: consumers, vaults, what the key unlocks"],[16,"Occurrences: where it leaked"],[18,"Remediation: the order of the fix"]]]];
function tutChecklist(){return TUT_CL.map(([t,its])=>({t,it:its.map(([n,x])=>[TUT.n>=n,x])}));}
function tutSel(st){return typeof st.sel==="function"?st.sel():st.sel;}
/* a step's target: a CSS selector, or [room, hotspot id] for something drawn in the scene */
function tutRect(st){const sel=st&&tutSel(st);if(!sel)return null;
  if(Array.isArray(sel)){const [room,id]=sel;if(pcOpen()||S.room!==room)return null;const sp=roomSpots(room).find(x=>x.id===id);const c=document.getElementById("scene");if(!sp||!c)return null;const r=c.getBoundingClientRect(),k=r.width/320,q=r.height/170;
    return {left:r.left+sp.r[0]*k,top:r.top+sp.r[1]*q,width:sp.r[2]*k,height:sp.r[3]*q,right:r.left+(sp.r[0]+sp.r[2])*k,bottom:r.top+(sp.r[1]+sp.r[3])*q};}
  const el=document.querySelector(sel);if(!el)return null;const r=el.getBoundingClientRect();return r.width&&r.height?r:null;}
function tutTick(){if(!TUT.on||!S||!S.tut)return tutEnd(false);const st=TSTEPS[TUT.n];if(!st)return;
  if(st.done&&st.done()){TUT.n++;return tutRender();}
  if(!document.getElementById("coach"))tutRender();placeCoach();}
/* LR-24: a pulsing bright-green box over the thing to click, and an arrow pointing at it. Measured every frame, so it follows re-renders and dragged windows. */
function tutOverlay(){if(!TUT.on){["tutbox","tutarrow"].forEach(i=>{const e=document.getElementById(i);if(e)e.remove();});return;}
  let box=document.getElementById("tutbox"),ar=document.getElementById("tutarrow");
  if(!box){box=document.createElement("div");box.id="tutbox";box.setAttribute("aria-hidden","true");document.body.appendChild(box);}
  if(!ar){ar=document.createElement("div");ar.id="tutarrow";ar.setAttribute("aria-hidden","true");ar.innerHTML='<svg viewBox="0 0 64 40" width="64" height="40"><path d="M2 14h38V2l22 18-22 18V26H2z" fill="#39FF14" stroke="#062B00" stroke-width="3" stroke-linejoin="round"/></svg>';document.body.appendChild(ar);}
  const r=tutRect(TSTEPS[TUT.n]);if(!r||document.querySelector("#msglayer .msgwrap")){box.hidden=true;ar.hidden=true;}else{box.hidden=false;ar.hidden=false;const p=5;
    Object.assign(box.style,{left:r.left-p+"px",top:r.top-p+"px",width:r.width+2*p+"px",height:r.height+2*p+"px"});
    const cx=r.left+r.width/2,cy=r.top+r.height/2;let x,y,rot;
    if(r.left>84){x=r.left-p-74;y=cy-20;rot=0;}else if(r.top>60){x=cx-32;y=r.top-p-50;rot=90;}else if(innerWidth-r.right>84){x=r.right+p+10;y=cy-20;rot=180;}else{x=cx-32;y=r.bottom+p+10;rot=-90;}
    ar.style.left=x+"px";ar.style.top=y+"px";ar.style.setProperty("--rot",rot+"deg");}
  requestAnimationFrame(tutOverlay);}
/* put the coach in a corner that covers neither its target nor (on the office screen) the door or the verb bar */
function placeCoach(){const c=document.getElementById("coach");if(!c||matchMedia("(max-width:760px)").matches){if(c){c.style.left=c.style.top="";}return;}
  const vw=innerWidth,vh=innerHeight,w=c.offsetWidth,h=c.offsetHeight,m=12;const tr=tutRect(TSTEPS[TUT.n]);
  const hit=(x,y,r)=>r&&!(x+w<r.left-80||x>r.right+80||y+h<r.top-56||y>r.bottom+56);
  const avoid=[];if(tr)avoid.push(tr);if(!pcOpen()){const bar=document.getElementById("iconbar");if(bar)avoid.push(bar.getBoundingClientRect());const g=document.getElementById("game");if(g){const r=g.getBoundingClientRect();avoid.push({left:r.right-r.width*.14,right:r.right,top:r.top,bottom:r.top+r.height*.62});}}
  const cands=pcOpen()?[[m,vh-h-m],[vw-w-m,vh-h-m],[vw-w-m,m],[m,m]]:[[vw-w-m,vh-h-m],[m,vh-h-m],[m,m],[vw-w-m,m]];
  const pick=cands.find(([x,y])=>!avoid.some(r=>hit(x,y,r)))||cands[0];c.style.left=Math.max(m,pick[0])+"px";c.style.top=Math.max(m,pick[1])+"px";}
function tutRender(){let c=document.getElementById("coach");if(!c){c=document.createElement("div");c.id="coach";c.setAttribute("role","dialog");c.setAttribute("aria-live","polite");c.setAttribute("aria-label","Training");document.body.appendChild(c);}
  const st=TSTEPS[TUT.n];if(!st)return tutEnd(true);const total=TSTEPS.length;
  c.innerHTML=`<div class="ch"><span>Training · part ${st.part} of 2</span><span>${TUT.n+1} / ${total}</span></div><b class="ct">${st.t}</b><div class="cx">${st.x}</div><div class="cb">${st.next?`<button data-tutnext>${st.next}</button>`:`<span class="cw">Do it to continue</span>`}${st.end?`<button data-tutend>${st.end}</button>`:`<button data-tutend class="sub">End training</button>`}</div>`;
  TUT.last=TUT.n;placeCoach();try{updateBar();}catch(e){}}
document.addEventListener("click",e=>{if(e.target.closest("[data-tt='tut']"))return startTutorial();
  if(e.target.closest("[data-tutnext]")){const st=TSTEPS[TUT.n];if(st&&st.final){tutEnd(false);return startNew();}TUT.n++;return tutRender();}
  if(e.target.closest("[data-tutend]")){const st=TSTEPS[TUT.n];tutEnd(true);return;}});
