/* ============================== message windows and dialogs ============================== */
let MQ=[],showing=false;
const ML=()=>document.getElementById("msglayer"),PL=()=>document.getElementById("pclayer");
function esc(s){return String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function say(txt,pts,who){if(pts)txt+=`\n\n[+${pts} points]`;msgBox(txt,who);updateBar();draw();}
function msgBox(txt,who,then){MQ.push({txt,who,then});if(!showing)nextMsg();}
function nextMsg(){const m=MQ.shift();if(!m){showing=false;return;}showing=true;const w=document.createElement("div");w.className="msgwrap";
  w.innerHTML=`<div class="msg" role="dialog" aria-modal="true" tabindex="-1">${m.who?`<span class="who">${esc(m.who)}</span>`:""}${esc(m.txt)}<span class="hint">click or press Enter</span></div>`;
  const close=()=>{w.remove();document.removeEventListener("keydown",kd);updateBar();if(m.then)m.then();nextMsg();};const kd=ev=>{if(!w.isConnected){document.removeEventListener("keydown",kd);return;}if(ev.key==="Enter"||ev.key==="Escape"){ev.preventDefault();close();}};
  w.addEventListener("click",close);document.addEventListener("keydown",kd);ML().appendChild(w);w.querySelector(".msg").focus();}
function clearMsgs(){MQ=[];showing=false;ML().innerHTML="";}
function flash(t){const w=document.createElement("div");w.className="toast";w.setAttribute("role","status");w.textContent=t;document.body.appendChild(w);setTimeout(()=>w.remove(),3600);updateBar();}
function portrait(who){const c=document.createElement("canvas");c.width=48;c.height=48;c.style.width="96px";c.style.height="96px";const x=c.getContext("2d");const p=PPL[who]||{bg:1,hair:0,shirt:8,skin:6};
  const P=(a,b,w,h,col)=>{x.fillStyle=PAL[col];x.fillRect(a,b,w,h);};
  P(0,0,48,48,p.bg);if(p.long){P(9,8,7,28,p.hair);P(32,8,7,28,p.hair);}P(14,10,20,24,p.skin);P(12,6,24,8,p.hair);P(8,36,32,12,p.shirt);P(20,36,8,4,p.tie!=null?15:p.shirt);if(p.tie!=null)P(23,38,3,10,p.tie);
  P(18,18,3,3,0);P(27,18,3,3,0);if(p.glasses){P(16,17,7,1,0);P(25,17,7,1,0);P(16,21,7,1,0);P(25,21,7,1,0);}P(20,27,8,2,4);
  if(who==="kenji"&&!S.f.kenjiAwake){P(18,19,3,1,0);P(27,19,3,1,0);P(17,18,4,2,p.skin);P(26,18,4,2,p.skin);}return c;}
function dialog(name,who,intro,builder){const Lr=ML();const w=document.createElement("div");w.className="msgwrap";
  w.innerHTML=`<div class="dlg" role="dialog" aria-modal="true" aria-label="${esc(name)}"><div class="pf"></div><div><span class="who">${esc(name)}</span><div class="kpi">Measured on: ${esc(PPL[who].kpi)}</div><div class="say">${esc(intro)}</div></div><div class="opts"></div></div>`;
  w.querySelector(".pf").appendChild(portrait(who));const box=w.querySelector(".opts"),sayEl=w.querySelector(".say");
  const render=list=>{box.innerHTML="";list.forEach(([label,fn])=>{const b=document.createElement("button");b.textContent=label;if(/^▸/.test(label))b.className="pitch";else if(!fn)b.className="bye";b.onclick=ev=>{ev.stopPropagation();
    if(!fn){w.remove();updateBar();draw();return;}const r=fn();if(!r)return;advance(2);sayEl.textContent=r.t+(r.p?`\n\n[+${r.p} points]`:"");updateBar();draw();
    if(r.win){box.innerHTML="";const z=document.createElement("button");z.textContent="Continue";z.className="go";z.onclick=()=>{w.remove();save();r.win();};box.appendChild(z);z.focus();return;}
    render(builder());}; box.appendChild(b);});};
  render(builder());Lr.appendChild(w);const f=box.querySelector("button");if(f)try{f.focus({preventScroll:true});}catch(e){}}

/* ============================== verbs, the room list, the bars ============================== */
const ICONS={walk:'<svg viewBox="0 0 16 16"><path d="M7 1h2v2H7zM6 4h3v4l2 2-1 1-2-2-1 3 2 3H6l-2-3 1-3V6L3 8 2 7l4-3z" fill="#000"/></svg>',
  look:'<svg viewBox="0 0 16 16"><path d="M1 8c2-3 4-4 7-4s5 1 7 4c-2 3-4 4-7 4S3 11 1 8z" fill="#fff" stroke="#000"/><circle cx="8" cy="8" r="2.5" fill="#000"/></svg>',
  hand:'<svg viewBox="0 0 16 16"><path d="M5 15V7l-2-2 1-1 2 2V1h2v6V2h2v5V3h2v5V5h2v6l-2 4z" fill="#F5C38B" stroke="#000"/></svg>',
  talk:'<svg viewBox="0 0 16 16"><path d="M2 3h12v8H7l-4 3v-3H2z" fill="#fff" stroke="#000"/></svg>',
  tasks:'<svg viewBox="0 0 16 16"><rect x="3" y="2" width="10" height="13" fill="#FFFFAA" stroke="#000"/><rect x="6" y="1" width="4" height="2" fill="#AAAAAA" stroke="#000"/><path d="M5 6l1 1 2-2M5 10l1 1 2-2" fill="none" stroke="#00AA00"/><path d="M9 6h3M9 10h3" stroke="#000"/></svg>',
  inv:'<svg viewBox="0 0 16 16"><rect x="2" y="5" width="12" height="9" fill="#AA5500" stroke="#000"/><rect x="5" y="3" width="6" height="3" fill="none" stroke="#000"/></svg>',
  laptop:'<svg viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="3" y="3" width="10" height="7" fill="#555" stroke="#000"/><rect x="4" y="4" width="8" height="5" fill="#0000AA"/><rect x="1" y="10" width="14" height="3" fill="#AAA" stroke="#000"/><rect x="6" y="3" width="4" height="1" fill="#FFFF55"/><rect x="11" y="10" width="3" height="1" fill="#AA5500"/></svg>'};
function iconbar(){hereSig="";setTimeout(renderHere,0);const lap=S&&has("laptop");
  document.getElementById("iconbar").innerHTML=[["walk","Walk"],["look","Look"],["hand","Use"],["talk","Talk"]].map(([k,l])=>`<button class="ic" data-verb="${k}" aria-pressed="${verb===k&&!heldItem}" title="${l}">${ICONS[k]}${l}</button>`).join("")+
  `<button class="ic" data-verb="inv" aria-pressed="${!!heldItem}" title="Items">${ICONS.inv}${heldItem?`<span class="inv">${esc(heldItem)}</span>`:"Items"}</button>${lap?`<button class="ic lap" data-laptop title="Open your laptop">${ICONS.laptop}Laptop</button>`:""}<button class="ic" data-tasks title="Quest and access">${ICONS.tasks}Quest</button><button class="ic" data-menu title="Menu">☰ Menu</button>`;}
let hereSig="";
function renderHere(){const el=document.getElementById("here");if(!el||!S)return;const vname=heldItem?`Use the ${heldItem} on…`:{walk:"Walk to…",look:"Look at…",hand:"Use…",talk:"Talk to…"}[verb];
  const sp=SPOTS[S.room];const sig=S.room+"|"+verb+"|"+heldItem+"|"+S.badge.join();if(sig===hereSig)return;hereSig=sig;
  const things=sp.filter(s=>!s.exit),exits=sp.filter(s=>s.exit);
  el.innerHTML=`<span class="hv">${vname}</span>${things.map(s=>`<button data-here="${s.id}" class="${s.talk?"who":""}">${esc(s.name)}</button>`).join("")}${exits.map(s=>`<button data-here="${s.id}" class="exit">→ ${esc(s.name)}</button>`).join("")}`;}
document.addEventListener("click",e=>{const b=e.target.closest("[data-here]");if(!b||!S||S.dead)return;const id=b.dataset.here;
  if(heldItem){const it=heldItem;heldItem=null;iconbar();return interact("item",id,it);}
  const s=SPOTS[S.room].find(x=>x.id===id);interact((s&&(s.exit||s.floor))&&verb!=="look"?"use":{walk:"walk",look:"look",hand:"use",talk:"talk"}[verb],id);});
function updateBar(){if(!S)return;renderHere();document.getElementById("stScore").textContent=`Score: ${S.score} of ${MAXSCORE}`;
  document.getElementById("stTitle").textContent=`Level ${S.lv} · ${ROOMNAME[S.room]}`;document.getElementById("stTime").textContent=hhmm(S.t);
  const n=nextStep(),g=document.getElementById("goal");g.classList.toggle("urgent",!!n.boss);document.getElementById("goalTxt").textContent=(n.win?"★ ":n.boss?"⚔ ":"Next: ")+n.t;
  const c=stepCount();document.getElementById("goalBtn").textContent=`Quest ${c[0]}/${c[1]}`;}
function draw(){if(!S)return;g.clearRect(0,0,320,170);SCENES[S.room]();if(night()&&S.room!=="lift"){g.fillStyle="rgba(0,0,40,.35)";g.fillRect(0,0,320,170);}updateBar();}
function spotAt(ev){const r=cv.getBoundingClientRect();const x=(ev.clientX-r.left)*320/r.width,y=(ev.clientY-r.top)*170/r.height;
  return SPOTS[S.room].filter(s=>x>=s.r[0]&&x<s.r[0]+s.r[2]&&y>=s.r[1]&&y<s.r[1]+s.r[3]).sort((a,b)=>(a.talk?0:1)-(b.talk?0:1)||a.r[2]*a.r[3]-b.r[2]*b.r[3])[0];}
cv.addEventListener("mousemove",ev=>{if(!S)return;const s=spotAt(ev);const vname={walk:"Walk to",look:"Look at",hand:"Use",talk:"Talk to"}[verb];document.getElementById("hover").textContent=s?(heldItem?`Use ${heldItem} on ${s.name}`:`${vname} ${s.name}`):"";});
cv.addEventListener("mouseleave",()=>document.getElementById("hover").textContent="");
cv.addEventListener("click",ev=>{if(!S||S.dead)return;const s=spotAt(ev);if(!s){if(verb==="look")say(lookRoom());return;}
  if(heldItem){const it=heldItem;heldItem=null;iconbar();return interact("item",s.id,it);}interact({walk:"walk",look:"look",hand:"use",talk:"talk"}[verb],s.id);});
function lookRoom(){return ENTER[S.room]||(S.room==="closet"?"Your office. It's a supply closet with a kiosk PC in it. The door goes out to Floor 2.":"");}
function interact(v,id,item){const sp=SPOTS[S.room].find(s=>s.id===id);if(!sp)return say("You don't see that here.");
  if(v==="look")return say(lookAt(sp));
  if(v==="item"){const f=ITEMUSE[item]&&ITEMUSE[item][sp.talk||sp.id];if(f)return f();if(item==="laptop")return openLaptop();
    if(sp.talk&&/csv|evidence|contract|exception|runbook/.test(item))return say(`Better to make your case in conversation. Talk to ${PPL[sp.talk].name.split(" ")[0]}: once you have the ${item}, new things to say will show up.`);
    return say(`The ${item} doesn't do anything useful with the ${sp.name}.`);}
  if(sp.floor)return ride(sp.floor);
  if(sp.exit&&(v==="walk"||v==="use"))return go(sp.exit);
  if(sp.talk&&(v==="talk"||v==="use"||v==="walk"))return talk(sp.talk);
  if(v==="talk")return say(sp.exit?"It's a door. It doesn't talk back.":`The ${sp.name} has nothing to say.`);
  const u=(USE[S.room]||{})[sp.id];if(u&&v==="use")return u();
  if(v==="walk")return say(lookAt(sp));
  return say(["Nothing happens.","That doesn't do anything.","You poke it. It stays a "+sp.name+"."][S.t%3]);}
document.addEventListener("click",e=>{const b=e.target.closest("[data-verb],[data-menu],[data-tasks],[data-laptop]");if(!b||!S)return;
  if(b.dataset.menu!==undefined)return menu();if(b.dataset.tasks!==undefined)return showTasks();if(b.dataset.laptop!==undefined)return openLaptop();
  const v=b.dataset.verb;if(v==="inv"){const usable=S.inv.filter(x=>x!=="laptop");if(!usable.length){heldItem=null;iconbar();return say(S.inv.length?"You're carrying your laptop (use the Laptop button) and nothing else.":"You're carrying a badge and a lot of optimism.");}
    const n=heldItem?usable.indexOf(heldItem)+1:0;heldItem=n<usable.length?usable[n]:null;iconbar();if(heldItem)flash(`Holding the ${heldItem}. Click someone or something to use it on.`);return;}
  verb=v;heldItem=null;iconbar();});
document.addEventListener("click",e=>{if(e.target.closest("#goalTxt"))document.getElementById("goal").classList.toggle("open");});
document.getElementById("parser").addEventListener("submit",e=>{e.preventDefault();const inp=document.getElementById("cmd");const raw=inp.value.trim().toLowerCase();inp.value="";if(!raw||!S||S.dead)return;parse(raw);});
function parse(raw){const words=raw.replace(/[^a-z0-9 #]/g," ").replace(/\b(the|a|an|at|to|on|with|in|into|floor)\b/g," ").replace(/\s+/g," ").trim();
  const [v0,...rest]=words.split(" ");const obj=rest.join(" ");
  const V={look:"look",l:"look",examine:"look",x:"look",read:"look",check:"look",use:"use",open:"use",press:"use",push:"use",get:"use",take:"use",grab:"use",talk:"talk",ask:"talk",speak:"talk",go:"use",walk:"use",enter:"use",ride:"use"};
  if(["inventory","inv","i","items"].includes(words))return say(S.inv.length?"You are carrying: "+S.inv.join(", ")+".":"Nothing yet.");
  if(["tasks","task","quest","checklist","goal","hint","next","access"].includes(words))return showTasks();
  if(/^(open |use )?laptop$/.test(words))return openLaptop();
  if(words==="score")return say(`Score: ${S.score} of ${MAXSCORE}.`);
  if(["help","h","?"].includes(words))return say("Click a verb (Walk, Look, Use, Talk), then click the picture. Or type: LOOK KIOSK, USE ELEVATOR, PRESS 3, TALK OTTO, OPEN LAPTOP, QUEST, ITEMS.\n\nThe blue bar always shows your next step. A red bar means a boss: someone you have to convince. Each boss cares about a number. GitGuardian is how you get the evidence that moves it.");
  if(words==="save"){save();return say("Game saved.");}if(words==="restart")return title();
  if(!v0||!V[v0])return say(`I don't understand "${raw}".`);
  const vb=V[v0];if(vb==="look"&&!obj)return say(lookRoom());
  if(S.room==="lift"&&/^(b1|[1-6])$/.test(obj))return ride(obj==="b1"?"B1":obj);
  const sp=SPOTS[S.room].find(s=>s.name.toLowerCase()===obj||s.id===obj||(s.syn||[]).includes(obj))||SPOTS[S.room].find(s=>obj&&(s.name.toLowerCase().includes(obj)||(s.syn||[]).some(y=>y.includes(obj)||obj.includes(y))));
  if(!sp)return say(obj?`You don't see any ${obj} here.`:`What do you want to ${v0}?`);interact(vb,sp.id);}

/* ============================== quest pad ============================== */
function showTasks(){if(document.getElementById("padwrap"))return;const Lr=ML();const w=document.createElement("div");w.className="msgwrap";w.id="padwrap";const st=STEPS[S.lv]||[];
  w.innerHTML=`<div class="pad" role="dialog" aria-modal="true" aria-label="Quest"><h2>Level ${S.lv}: ${esc(LV[S.lv].name)}</h2><div class="win">${esc(LV[S.lv].tag)}</div>
   <ol>${st.map(([t,d])=>`<li class="${d()?"ok":""}"><span>${d()?"[x]":"[ ]"}</span> ${esc(t)}</li>`).join("")}</ol>
   <div class="final"><b>Your access</b><ul>${S.acc.map(a=>`<li><span class="x">✓</span> ${esc(a)}</li>`).join("")}</ul></div>
   <div class="final"><b>Items</b><ul>${S.inv.length?S.inv.map(a=>`<li>• ${esc(a)}</li>`).join(""):"<li>none</li>"}</ul></div>
   <div class="btns"><button data-padclose>Close</button></div></div>`;
  Lr.appendChild(w);w.querySelector("button").focus();}
document.addEventListener("click",e=>{if(e.target.closest("[data-padclose]")||e.target.id==="padwrap"){const p=document.getElementById("padwrap");if(p)p.remove();}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){const p=document.getElementById("padwrap");if(p)p.remove();}});
function menu(){const Lr=ML();const w=document.createElement("div");w.className="msgwrap";
  w.innerHTML=`<div class="msg" style="cursor:default"><b>Don't Break Prod</b> <span style="font-size:13px;color:#555">build ${BUILD}</span>\nLevel ${S.lv}, ${hhmm(S.t)}. Score ${S.score} of ${MAXSCORE}.<div class="btns"><button data-mn="close">Resume</button><button data-mn="save">Save</button><button data-mn="code">Save code</button><button data-mn="retry">Restart this level</button><button data-mn="title">Title screen</button></div></div>`;Lr.appendChild(w);}
document.addEventListener("click",e=>{const b=e.target.closest("[data-mn]");if(!b)return;const k=b.dataset.mn;clearMsgs();
  if(k==="save"){save();say("Game saved. Continue picks it up from the title screen.");}if(k==="retry")retryLevel();if(k==="title")title();});

/* ============================== saving (this browser only) ============================== */
const SKEY="dontbreakprod.save.v1";
function save(){if(!S)return;try{localStorage.setItem(SKEY,JSON.stringify(S));}catch(e){}}
function load(){try{const s=localStorage.getItem(SKEY);return s?JSON.parse(s):null;}catch(e){return null;}}
function retryLevel(){if(!S||!S.ckpt)return;const ck=JSON.parse(S.ckpt);ck.ckpt=S.ckpt;S=ck;S.dead=null;PL().innerHTML="";ED=null;WM.wins=[];modal=null;clearMsgs();showGame();save();say(`Back to the start of level ${S.lv}: ${LV[S.lv].name}. ${nextStep().t}.`);}

/* ============================== levels, death, the end ============================== */
const LVMAIL={
 1:()=>{mail("welcome",PPL.marisol.name,"Welcome to Precarium!",`Hi ${first()},\n\nWelcome! Your badge opens Floor 2 and the help desk on B1. Your office is the room on Floor 2 marked SECURITY. It used to be supplies. We're working on it.\n\nGitGuardian: you're invited as Restricted for now. We'll talk once you've settled in. I'm in the glass office.\n\nMarisol\nIT Director`);
   mail("invite","GitGuardian","You've been invited to the Precarium workspace","Marisol Vance invited you to the Precarium workspace on GitGuardian.\n\nRole: Restricted. You can access incidents that are shared with you.");
   slScript("otto","hey welcome! i shared a gitguardian incident with u. its about the help desk script. idk what a token is lol. can u look? i'm on B1 if u want to come down");
   mail("bounce","Mail Delivery Subsystem","Undeliverable: 47 messages to hal.bender@precarium.io","47 messages could not be delivered. The account hal.bender@precarium.io was disabled on July 31.\n\nMost recent undelivered message:\n  From: GitGuardian\n  Subject: [Critical] Incident #2871: PayRail Secret Key (live) · Valid · Publicly exposed\n  First detected: 41 days ago\n\nThese alerts are being sent to nobody.");},
 2:()=>{mail("pub2","GitGuardian Public Monitoring","[Critical] Secret exposed publicly: PayRail Secret Key (#2871)","A secret belonging to your organization was found in a public gist. Incident #2871. Revoke it as fast as possible.");mail("m2",PPL.marisol.name,"You're a Member now","You can see every incident, view only. Alerts route to you now, so welcome to your new inbox.\n\nThe critical one, #2871, belongs to Payments on Floor 3. Wendell Park runs that team.");},
 3:()=>{mail("m3",PPL.wendell.name,"#2871 is yours","Assigned #2871 to you. PR checks are live on Payments repos.\n\nFor anything in production, you need Ingrid (Floor 4). She will say no. Bring a plan.");},
 4:()=>{mail("m4",PPL.ingrid.name,"Change window (pending)","Tonight 11 PM to 1 AM, pending a freeze exception. Freeze exceptions need Harriet's signature, Floor 5.");},
 5:()=>{mail("m5",PPL.harriet.name,"Freeze exception","Signed for one change, tonight. Victor approves production changes during launch week. Floor 6.");},
 6:()=>{mail("m6",PPL.victor.name,"Approved","Do it tonight. Don't break prod.");mail("m6b",PPL.ingrid.name,"Bridge is open","Change window is open. Everything you need is on your laptop: PayRail, Vault, Deploys, batch-01. Follow your runbook. I'm watching #payrail-rotation.");}};
function levelCard(n){clearMsgs();PL().innerHTML="";const Lr=ML();const w=document.createElement("div");w.className="msgwrap";w.style.background="#000";
  w.innerHTML=`<div class="msg lvcard" style="cursor:default;text-align:center"><span class="lvn">LEVEL ${n} OF 6</span><b class="lvt">${esc(LV[n].name)}</b><span class="lvf">${esc(LV[n].floor)}</span>\n${esc(LV[n].tag)}${levelCode(n)}<div class="btns tmenu"><button class="big go" data-go="${n}">Start level ${n}</button></div></div>`;
  Lr.appendChild(w);setTimeout(()=>{const b=w.querySelector("[data-go]");if(b)b.focus();},0);}
document.addEventListener("click",e=>{const b=e.target.closest("[data-go]");if(!b)return;clearMsgs();beginLevel(+b.dataset.go);});
function beginLevel(n){S.lv=n;S.t=Math.max(S.t,START_T[n]);S.dead=null;if(n===6){S.room=has("laptop")?S.room:"closet";}
  LVMAIL[n]();const c=Object.assign({},S);delete c.ckpt;S.ckpt=JSON.stringify(c);save();showGame();
  const open={1:"Day one at Precarium Inc. Your badge opens Floor 2 and B1. Your office is a supply closet. Your GitGuardian account is Restricted.\n\nThe kiosk PC is blinking. Start there.",
   2:"You can see all 2,417 incidents now. Open your laptop (the Laptop button) and find the one Hal never read.",
   3:"#2871 is yours. Production isn't. Floor 4 is SRE.",4:"Floor 5 is Finance and Compliance. The freeze is theirs.",5:"Floor 6. Paloma first. Then the CTO.",
   6:"11:00 PM. The building is quiet. Everyone is on #payrail-rotation, watching you.\n\nOpen your laptop. Your runbook is the plan. Checkout is taking about 1,200 PayRail calls a minute, and they all need to keep working."}[n];
  say(open);}
function showGame(){WM.wins=[];modal=null;pcApp="progman";document.getElementById("game").hidden=false;verb="hand";heldItem=null;iconbar();draw();}
function death(k){const d=DEATHS[k];PL().innerHTML="";ED=null;clearMsgs();const Lr=ML();const w=document.createElement("div");w.className="msgwrap";
  w.innerHTML=`<div class="msg death" role="alertdialog" aria-modal="true"><span class="who" style="font-size:24px">${d[0]}</span>${esc(d[1])}\n\nNobody loses their job over this. It's a game. Try the change again.<div class="btns"><button data-dd="retry">Retry the change window</button><button data-dd="title">Title screen</button></div></div>`;Lr.appendChild(w);}
document.addEventListener("click",e=>{const b=e.target.closest("[data-dd]");if(!b)return;if(b.dataset.dd==="retry")return retryLevel();title();});
function finish(){if(S.ended)return;S.ended=true;save();PL().innerHTML="";clearMsgs();const pct=Math.round(S.score*100/MAXSCORE);
  const rank=pct>=95?"Principal Prod Whisperer":pct>=80?"Trusted Change Owner":pct>=60?"Security Engineer, Probation Passed":"Survived Day One";
  const Lr=ML();const w=document.createElement("div");w.className="msgwrap";w.style.background="#000";
  const kpis=[["marisol","SOC 2 finding 'tool deployed, no owner' closed. Renewal justified."],["wendell","PR checks on every Payments repo. No more --no-verify. Pay Later 2.0 ships Monday."],["ingrid","A planned change with a rollback. Zero minutes of downtime. Error budget untouched."],["harriet","PayRail clause 14.2 met. No suspension during close. GitGuardian renewed."],["desmond","PCI DSS 8.6.2 evidence from real detection and remediation history."],["victor","A board slide: found it, fixed it, no downtime, and proof."]];
  w.innerHTML=`<div class="pad end" role="dialog" aria-modal="true"><h2>PROD IS UP. ${esc(first()).toUpperCase()} IS A LEGEND.</h2><div class="win">12:31 AM. PayRail rejects the old key. GitGuardian says Invalid. #2871: Resolved, 41 days after the first alert nobody read.</div>
   <b>Score: ${S.score} of ${MAXSCORE} · ${rank}</b>
   <div class="final"><b>Every boss got their number</b><ul>${kpis.map(([k,t])=>`<li><span class="x">✓</span> <b>${esc(PPL[k].name)}</b> (${esc(PPL[k].kpi)}): ${esc(t)}</li>`).join("")}</ul></div>
   <div class="final"><b>What GitGuardian did tonight</b><ul><li>• Found a live key in a public gist that no internal scan could see (public monitoring)</li><li>• Proved it was still dangerous, then proved it wasn't (validity checks)</li><li>• Showed every consumer, including a 2 AM batch job in no repo (NHI inventory and the exploration map)</li><li>• Turned "trust me" into numbers each boss cared about (exports, reports, honeytokens)</li><li>• Stopped the next one at the commit (ggshield pre-commit and PR checks)</li></ul></div>
   <div class="btns"><button data-mn="title">Title screen</button></div></div>`;Lr.appendChild(w);}

/* ============================== title ============================== */
function title(){S=null;ED=null;WM.wins=[];modal=null;document.getElementById("game").hidden=true;PL().innerHTML="";clearMsgs();const sv=load();const Lr=ML();
  const cont=sv&&!sv.ended?`<button data-tt="continue" class="big">Continue <small>Level ${sv.lv}: ${esc(LV[sv.lv].name)} · ${hhmm(sv.t)}</small></button>`:"";
  Lr.innerHTML=`<div class="msgwrap" style="background:#000"><div class="msg" style="cursor:default;text-align:center;max-width:560px"><canvas id="logo" width="160" height="60" style="width:320px;max-width:100%;height:auto;image-rendering:pixelated;display:block;margin:0 auto 10px"></canvas><b style="font-size:32px">Don't Break Prod</b>
<span style="font-size:16px">A GitGuardian adventure at ${COMPANY}</span>

It's your first day as the only security person. GitGuardian has been screaming about a live payment key for 41 days, into the mailbox of someone who left. You can't even open the incident.

Six levels, six floors. Convince people, one at a time.
<label for="pname" style="display:block;margin-top:12px;font-size:16px">Your name <input id="pname" value="${esc(randomName())}" style="font:18px var(--f-pix);padding:4px 8px;border:2px solid #555;width:200px;max-width:100%"></label>
<div class="btns tmenu"><button data-tt="new" class="big go">New game <small>Level 1: Restricted</small></button>${cont}<button data-tt="code">Enter a save code</button></div><div class="thint">About 30 to 45 minutes · Saves in this browser</div>
<span style="display:block;margin-top:10px;font-size:13px;color:#555">An original game. Simulated tools follow GitGuardian's documented workflows. Build ${BUILD}</span></div></div>`;
  setTimeout(()=>{const f=document.querySelector(".tmenu button");if(f)try{f.focus({preventScroll:true});}catch(e){}},0);
  const lc=document.getElementById("logo").getContext("2d");if(lc&&lc.fillRect){const P2=(x,y,w,h,c)=>{lc.fillStyle=PAL[c];lc.fillRect(x,y,w,h);};P2(0,0,160,60,1);for(let i=0;i<30;i++)P2((i*37)%160,(i*23)%30,1,1,15);
    for(let k=0;k<6;k++){const x=20+k*20,h=14+k*5;P2(x,52-h,16,h,k===5?7:8);for(let j=0;j<h-4;j+=4)P2(x+3,52-h+2+j,2,2,k===5?14:11);}P2(0,52,160,8,2);P2(132,10,22,30,7);P2(134,12,18,20,0);P2(136,15,10,2,10);P2(136,19,14,2,10);P2(136,23,8,2,12);P2(130,40,26,4,8);}}
document.addEventListener("click",e=>{const b=e.target.closest("[data-tt]");if(!b)return;
  if(b.dataset.tt==="code")return;
  if(b.dataset.tt==="new"){const n=(document.getElementById("pname").value||"").trim().slice(0,40)||randomName();S=fresh(n);clearMsgs();return levelCard(1);}
  const sv=load();if(!sv)return;S=sv;clearMsgs();showGame();if(S.dead)return death(S.dead);say(`Welcome back, ${first()}. Level ${S.lv}: ${LV[S.lv].name}.\n\n${lookRoom()}`);});
setInterval(()=>{if(reduce)return;frame++;if(S&&!document.getElementById("game").hidden&&!document.getElementById("pcroot"))draw();},120);
window.GAME={get S(){return S},set S(v){S=v},interact,go,ride,talk,openPC,openLaptop,parse,nextStep,ACT,WIN,beginLevel,openEditor,FILES,finish};
iconbar();title();
