/* ============================== parser, verbs, render ============================== */
const ICONS={walk:'<svg viewBox="0 0 16 16"><path d="M7 1h2v2H7zM6 4h3v4l2 2-1 1-2-2-1 3 2 3H6l-2-3 1-3V6L3 8 2 7l4-3z" fill="#000"/></svg>',
  look:'<svg viewBox="0 0 16 16"><path d="M1 8c2-3 4-4 7-4s5 1 7 4c-2 3-4 4-7 4S3 11 1 8z" fill="#fff" stroke="#000"/><circle cx="8" cy="8" r="2.5" fill="#000"/></svg>',
  hand:'<svg viewBox="0 0 16 16"><path d="M5 15V7l-2-2 1-1 2 2V1h2v6V2h2v5V3h2v5V5h2v6l-2 4z" fill="#F5C38B" stroke="#000"/></svg>',
  talk:'<svg viewBox="0 0 16 16"><path d="M2 3h12v8H7l-4 3v-3H2z" fill="#fff" stroke="#000"/></svg>',
  tasks:'<svg viewBox="0 0 16 16"><rect x="3" y="2" width="10" height="13" fill="#FFFFAA" stroke="#000"/><rect x="6" y="1" width="4" height="2" fill="#AAAAAA" stroke="#000"/><path d="M5 6l1 1 2-2M5 10l1 1 2-2" fill="none" stroke="#00AA00"/><path d="M9 6h3M9 10h3" stroke="#000"/></svg>',
  inv:'<svg viewBox="0 0 16 16"><rect x="2" y="5" width="12" height="9" fill="#AA5500" stroke="#000"/><rect x="5" y="3" width="6" height="3" fill="none" stroke="#000"/></svg>'};
function iconbar(){hereSig="";setTimeout(renderHere,0);document.getElementById("iconbar").innerHTML=[["walk","Walk"],["look","Look"],["hand","Use"],["talk","Talk"]].map(([k,l])=>`<button class="ic" data-verb="${k}" aria-pressed="${verb===k&&!heldItem}" title="${l}">${ICONS[k]}${l}</button>`).join("")+
  `<button class="ic" data-verb="inv" aria-pressed="${!!heldItem}" title="Inventory">${ICONS.inv}${heldItem?`<span class="inv">${heldItem}</span>`:"Items"}</button><button class="ic" data-tasks title="Checklist">${ICONS.tasks}Tasks</button><button class="ic" data-menu title="Menu">☰ Menu</button>`;}
/* LR-01: a tappable list of what's in the room, so phones don't depend on hitting small pixel hotspots */
let hereSig="";
function renderHere(){const el=document.getElementById("here");if(!el||!S)return;const vname=heldItem?`Use the ${heldItem} on…`:{walk:"Walk to…",look:"Look at…",hand:"Use…",talk:"Talk to…"}[verb];
  const sp=roomSpots(S.room);const sig=S.room+"|"+verb+"|"+heldItem+"|"+sp.map(s=>s.name).join(",");if(sig===hereSig)return;hereSig=sig;
  const things=sp.filter(s=>!s.exit),exits=sp.filter(s=>s.exit);
  el.innerHTML=`<span class="hv">${vname}</span>${things.map(s=>`<button data-here="${s.id}" class="${s.talk?"who":""}">${esc(s.name)}</button>`).join("")}${exits.map(s=>`<button data-here="${s.id}" class="exit">→ ${esc(s.name.replace(/^back to /,""))}</button>`).join("")}`;}
document.addEventListener("click",e=>{const b=e.target.closest("[data-here]");if(!b||!S||S.dead)return;snapshot();const id=b.dataset.here;
  if(heldItem){const it=heldItem;heldItem=null;iconbar();interact("item",id,it);return after();}
  const s=roomSpots(S.room).find(x=>x.id===id);interact(s&&s.exit&&verb!=="look"?"walk":{walk:"walk",look:"look",hand:"use",talk:"talk"}[verb],id);after();});
const goalEl=()=>document.getElementById("goal");
document.addEventListener("click",e=>{if(e.target.closest("#goalTxt")){goalEl().classList.toggle("open");}});
function updateBar(){if(!S)return;renderHere();document.getElementById("stScore").textContent=`Score: ${shownScore()} of ${maxScore()}`;document.getElementById("stTitle").textContent=`${DAYS[S.day].name} · ${ROOMNAME[S.room]}`;document.getElementById("stTime").textContent=hhmm(S.t);
  const n=nextStep(),g=document.getElementById("goal");g.classList.toggle("urgent",!!n.u);document.getElementById("goalTxt").textContent=(n.win?"★ ":n.u?"! ":"Next: ")+n.t;const gc=goalCount();document.getElementById("goalBtn").textContent=S.day===4?`IR-07 ${gc[0]}/${gc[1]}`:`Checklist ${gc[0]}/${gc[1]}`;}
function draw(){if(!S)return;g.clearRect(0,0,320,170);SCENES[S.room]();updateBar();}
function spotAt(ev){const r=cv.getBoundingClientRect();const x=(ev.clientX-r.left)*320/r.width,y=(ev.clientY-r.top)*170/r.height;
  /* smallest hotspot under the cursor wins, so people standing in front of windows stay clickable */
  return roomSpots(S.room).filter(s=>x>=s.r[0]&&x<s.r[0]+s.r[2]&&y>=s.r[1]&&y<s.r[1]+s.r[3]).sort((a,b)=>(a.talk?0:1)-(b.talk?0:1)||a.r[2]*a.r[3]-b.r[2]*b.r[3])[0];}
function roomSpots(room){return SPOTS[room];}
cv.addEventListener("mousemove",ev=>{const s=spotAt(ev);const vname={walk:"Walk to",look:"Look at",hand:"Use",talk:"Talk to"}[verb];document.getElementById("hover").textContent=s?(heldItem?`Use ${heldItem} on ${s.name}`:`${vname} ${s.name}`):"";});
cv.addEventListener("mouseleave",()=>document.getElementById("hover").textContent="");
cv.addEventListener("click",ev=>{if(!S||S.dead)return;const s=spotAt(ev);if(!s){if(verb==="look")say(lookRoom());return;}snapshot();
  if(heldItem){const it=heldItem;heldItem=null;iconbar();interact("item",s.id,it);return after();}interact({walk:"walk",look:"look",hand:"use",talk:"talk"}[verb],s.id);after();});
function lookRoom(){return ({desk:"Your desk on the security team's floor. A CRT with GitGuardian open, a phone, a drawer, sticky notes, a coffee of uncertain age. The door leads to the hallway.",
  hall:"The hallway. The dev pit is to the left, the server closet to the right, and the COO's office straight ahead.",dev:`The dev pit. ${npcName()} is at the desk by the window.`,
  closet:"The server closet. Racks, cables, a fan that sounds like regret, and an old box called nas01 on a cart.",coo:`${P.coo}'s office. A whiteboard tracks today's deadline.`})[S.room];}
document.addEventListener("click",e=>{const b=e.target.closest("[data-verb],[data-menu]");if(!b)return;if(b.dataset.menu!==undefined)return menu();
  const v=b.dataset.verb;if(v==="inv"){if(!S.inv.length)return say("You're carrying: one phone, one opinion about hardcoded secrets.");const n=heldItem?S.inv.indexOf(heldItem)+1:0;heldItem=n<S.inv.length?S.inv[n]:null;iconbar();if(heldItem==="binder"){heldItem=null;iconbar();return readBinder();}if(heldItem)flash("Click something to use the "+heldItem+" on it.");return;}verb=v;heldItem=null;iconbar();});
document.getElementById("parser").addEventListener("submit",e=>{e.preventDefault();const inp=document.getElementById("cmd");const raw=inp.value.trim().toLowerCase();inp.value="";if(!raw||!S||S.dead)return;parse(raw);});
function parse(raw){const words=raw.replace(/[^a-z0-9 ]/g," ").replace(/\b(the|a|an|at|to|on|with|in|into)\b/g," ").replace(/\s+/g," ").trim();
  const [v0,...rest]=words.split(" ");const obj=rest.join(" ");
  const V={look:"look",l:"look",examine:"look",x:"look",read:"look",check:"look",use:"use",open:"use",press:"use",push:"use",type:"use",log:"use",login:"use",get:"use",take:"use",grab:"use",pick:"use",talk:"talk",ask:"talk",speak:"talk",go:"walk",walk:"walk",enter:"walk",leave:"walk",exit:"walk"};
  if(["inventory","inv","i"].includes(words))return say(S.inv.length?"You are carrying: "+S.inv.join(", ")+".":"You are carrying nothing useful. Your phone doesn't count.");
  if(["tasks","task","checklist","goal","goals","objective","hint","next"].includes(words))return showTasks();
  if(/^ssh( gary)?( nas01)?$|^ssh .*nas01/.test(words))return sshNas();
  if(words==="score")return say(`Your score is ${shownScore()} of ${maxScore()}. It's ${DAYS[S.day].name}, ${hhmm(S.t)}.`);
  if(["playbook","binder","read binder","read playbook","ir 07","ir07"].includes(words))return S.inv.includes("binder")?readBinder():say(S.day===4?"The binder is in your desk drawer.":"There's no playbook binder for this one. Use the Checklist.");
  if(["help","h","?"].includes(words))return say("Click a verb (Walk, Look, Use, Talk), then click the scene. Or type: LOOK MONITOR, USE DRAWER, TALK DANA, GO HALLWAY, OPEN MAIL, TASKS, INVENTORY, SCORE, SAVE, RESTORE.\n\nThe blue bar under the scene always shows your next step. You finish a day by fixing everything on the checklist and telling "+P.coo+" it's handled.");
  if(words==="save"){save();return say("Game saved.");}if(words==="restore")return restoreMenu();if(words==="restart")return startNew(S&&S.player);
  if(!v0||!V[v0]){return say(["I don't understand \""+raw+"\".","That doesn't seem to work here.","You can't do that... at least not now."][raw.length%3]);}
  const verbN=V[v0];if(verbN==="look"&&!obj)return say(lookRoom());
  if(verbN==="use"&&/^(mail|email|inbox)$/.test(obj)){if(S.room!=="desk")return say("Your computer is at your desk.");return openPC("mail");}
  const spot=roomSpots(S.room).find(s=>s.name.toLowerCase()===obj||s.id===obj||(s.syn||[]).includes(obj))||roomSpots(S.room).find(s=>obj&&(s.name.toLowerCase().includes(obj)||(s.syn||[]).some(y=>y.includes(obj)||obj.includes(y))));
  if(!spot)return say(obj?"You don't see any "+obj+" here.":"What do you want to "+v0+"?");snapshot();interact(verbN==="walk"?"walk":verbN,spot.id);after();}
function menu(){const L=ML();const w=document.createElement("div");w.className="msgwrap";
  w.innerHTML=`<div class="msg" style="cursor:default"><b>LossyInc Range</b> <span style="font-size:13px;color:#555">build ${BUILD}</span>\n${DAYS[S.day].name}, ${hhmm(S.t)}. Score ${shownScore()} of ${maxScore()}.<div class="btns"><button data-mn="close">Resume</button><button data-mn="save">Save</button><button data-mn="restore">Restore</button><button data-mn="code">Save code</button><button data-mn="restart">Restart</button><button data-mn="title">Title</button></div></div>`;
  L.appendChild(w);}
document.addEventListener("click",e=>{const b=e.target.closest("[data-mn]");if(!b)return;const k=b.dataset.mn;clearMsgs();
  if(k==="save"){save();say("Game saved. Continue picks it up from the title screen.");}if(k==="restore")restoreMenu();if(k==="restart")startNew(S&&S.player);if(k==="title")title();});

