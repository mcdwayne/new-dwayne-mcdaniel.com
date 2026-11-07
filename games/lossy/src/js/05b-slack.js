/* ============================== LR-04: Slack the developers ==============================
   Same choices as talking in person. Replies take a random 2 to 200 real seconds; the game clock doesn't move while you wait.
   Pending replies are stored with an absolute due time, so they survive closing the computer and reloading the page. */
const SL_PEOPLE={dana:{name:P.dana,role:"Skoupmouz engineer",col:"#AA00AA"},ravi:{name:P.ravi,role:"Plimbo mobile dev",col:"#006B00"},amara:{name:P.amara,role:"Mapwende field ops",col:"#006B6B"}};
let slWho=null;
function SL(){if(!S.slack)S.slack={msgs:{dana:[],ravi:[],amara:[]},pending:[],unread:{}};return S.slack;}
function slContacts(){const c=[];if(INC(1017)&&S.day<4)c.push("dana");if(S.day===2||S.day===4||INC(1102))c.push("ravi");if(S.day===3)c.push("amara");return c;}
function slackDelay(){const o=typeof window!=="undefined"&&window.LOSSY_SLACK_DELAY_MS;if(o!=null)return +o;return (2+Math.floor(Math.random()*199))*1000;}
function slBuilder(who){return {dana:danaOptions,ravi:S.day===4?raviUltOptions:raviOptions,amara:amaraOptions}[who];}
function slOptions(who){const b=slBuilder(who);/* machine setup is an in-person job: you have to go to their desk */return b?b().filter(o=>o[1]&&!/^Can you run ggshield machine setup/.test(o[0])):[];}
function slUnread(){const u=SL().unread;return Object.values(u).reduce((a,b)=>a+b,0);}
/* turn an in-person reply ("narration" plus "quotes") into a chat message */
function chatText(t){const q=[...String(t).matchAll(/"([^"]+)"/g)].map(m=>m[1]);let out=q.length?q.join(" "):String(t);
  const code=String(t).split("\n").filter(l=>/^\s{2}\S/.test(l));if(code.length)out=(q[0]||"")+"\n```\n"+code.map(l=>l.trim()).join("\n")+"\n```\n"+(q.slice(1).join(" "));return out.trim();}
function slSend(who,label,fnIdx){const s=SL();if(s.pending.some(p=>p.who===who&&p.label===label))return;
  s.msgs[who].push({me:true,txt:label,at:short(S.t)});const ms=slackDelay();s.pending.push({who,label,fnIdx,due:Date.now()+ms,typingFrom:Date.now()+Math.max(0,ms-Math.min(6000,ms*0.6))});
  advance(1);save();}
function slDeliver(p){const s=SL();s.pending=s.pending.filter(x=>x!==p);const who=p.who;let txt,pts=0;
  if(p.fnIdx==null){txt=["Can you ask me something specific? I'm a bit underwater.","👀 not sure what you mean","Sorry, in the middle of something. What do you need exactly?"][Math.floor(Math.random()*3)];}
  else{const opt=slOptions(who).find(o=>o[0]===p.label);if(!opt){txt="Already on it.";}else{snapshot("Slack reply from "+SL_PEOPLE[who].name);const r=opt[1]()||{};txt=chatText(r.t||"👍");pts=r.p||0;}}
  s.msgs[who].push({me:false,txt,at:short(S.t),pts});
  const viewing=document.getElementById("pcroot")&&pcApp==="slack"&&slWho===who;if(!viewing)s.unread[who]=(s.unread[who]||0)+1;
  if(after())return;const extra=checkAwards();
  if(document.getElementById("pcroot")&&!modal)renderPC();else updateBar();
  if(!viewing)flash(`Slack · ${SL_PEOPLE[who].name.split(" ")[0]}: ${txt.replace(/\s+/g," ").slice(0,70)}${txt.length>70?"…":""}${pts+extra?` (+${pts+extra})`:""}`);
  save();checkEnd();}
setInterval(()=>{if(!S||S.dead||!S.slack||!S.slack.pending.length)return;const now=Date.now();
  for(const p of S.slack.pending.slice())if(now>=p.due){slDeliver(p);if(!S||S.dead)return;}
  if(document.getElementById("pcroot")&&pcApp==="slack"&&!modal){const t=document.getElementById("sltyping");const p=S.slack.pending.find(x=>x.who===slWho);const want=p&&now>=p.typingFrom?`${SL_PEOPLE[slWho].name.split(" ")[0]} is typing…`:p?"Delivered":"";if(t&&t.textContent!==want)t.textContent=want;}},500);
const mdChat=t=>esc(t).replace(/```\n?([\s\S]*?)```/g,(m,c)=>`<pre class="slcode">${c}</pre>`).replace(/\n/g,"<br>");
APPS.slack=function(){const s=SL(),cs=slContacts();if(!slWho||!cs.includes(slWho))slWho=cs[0];if(slWho&&pcApp==="slack")s.unread[slWho]=0;
  const who=slWho,pp=who&&SL_PEOPLE[who],opts=who?slOptions(who):[];const pend=who?s.pending.filter(p=>p.who===who):[];
  return `<div class="sl"><nav><div class="ws">${COMPANY[Math.min(S.day,3)-1]}</div><div class="grp">Channels</div><span class="ch"># incident-response</span><span class="ch"># plimbo-release</span><div class="grp">Direct messages</div>
   ${cs.map(k=>`<button data-slwho="${k}" aria-current="${k===who}"><i style="background:${SL_PEOPLE[k].col}"></i>${SL_PEOPLE[k].name}${s.unread[k]?`<span class="badge">${s.unread[k]}</span>`:""}</button>`).join("")}</nav>
   <main>${who?`<div class="slh"><b>${pp.name}</b><span>${pp.role} · replies can take a few minutes</span></div>
   <div class="slmsgs" id="slmsgs">${s.msgs[who].length?"":`<div class="slempty">This is the very beginning of your direct message history with ${pp.name}.</div>`}${s.msgs[who].map(m=>`<div class="slm"><i style="background:${m.me?"#2D3FD8":pp.col}">${m.me?(S.player||"Y")[0]:pp.name[0]}</i><div><b>${m.me?(S.player||"You"):pp.name}</b> <small>${m.at}</small><div>${mdChat(m.txt)}${m.pts?` <span class="pill p-res">+${m.pts}</span>`:""}</div></div></div>`).join("")}</div>
   <div class="sltyping" id="sltyping" aria-live="polite">${pend.length?"Delivered":""}</div>
   <div class="slcompose"><div class="slsugg">${opts.map((o,n)=>{const busy=pend.some(p=>p.label===o[0]);return `<button class="btn" data-slsend="${n}" ${busy?"disabled":""}>${esc(o[0])}${busy?" (sent)":""}</button>`;}).join("")}</div>
    <form id="slform" class="slform"><input id="slin" type="text" placeholder="Message ${pp.name.split(" ")[0]}" autocomplete="off"><button class="btn pri" type="submit">Send</button></form></div>`:'<div class="slempty">Nobody to message today.</div>'}</main></div>`;};
document.addEventListener("click",e=>{if(!S||!document.getElementById("pcroot"))return;const b=e.target.closest("[data-slwho],[data-slsend]");if(!b||b.disabled)return;
  if(b.dataset.slwho){slWho=b.dataset.slwho;renderPC();return;}
  const n=+b.dataset.slsend,o=slOptions(slWho)[n];if(!o)return;slSend(slWho,o[0],n);if(after())return;renderPC();const m=document.getElementById("slmsgs");if(m)m.scrollTop=m.scrollHeight;});
document.addEventListener("submit",e=>{if(e.target.id!=="slform")return;e.preventDefault();const v=(document.getElementById("slin").value||"").trim();if(!v||!slWho)return;
  const o=slOptions(slWho);const k=o.findIndex(x=>x[0].toLowerCase()===v.toLowerCase());slSend(slWho,k>=0?o[k][0]:v,k>=0?k:null);if(after())return;renderPC();});

/* ============================== Device Management (MDM) ==============================
   Follows GitGuardian's fleet guidance: install ggshield through the MDM with a service account token, then schedule
   `ggshield machine report` (scan) and `ggshield machine setup` (AI hooks, git hooks, honeytoken). Servers aren't in MDM. */
APPS.mdm=function(){const m=S.f.mdm||{};const devs=[["dana-mbp",P.dana],["ravi-mbp",P.ravi],["kofi-mbp",P.coo],["sec-thinkpad",S.player||"You"],["isla-mbp",P.isla]].concat(S.day>=3&&S.day<4?[["amara-mbp",P.amara]]:[]);
  const pol=(k,name,cmd,desc)=>`<tr><td><b>${name}</b><div class="mono" style="font-size:12px">${cmd}</div><div style="font-size:12.5px;color:#545C6E">${desc}</div></td><td>${m[k]?pill("Deployed to "+devs.length+" devices","p-res"):pill("Not deployed","p-ign")}</td><td style="text-align:right">${m[k]?"":`<button class="btn pri" data-mdmdeploy="${k}">Deploy to all devices</button>`}</td></tr>`;
  return `<div class="ap"><div style="color:#545C6E;font-size:13px">Lossy MDM · Device management · you were added to the admins group</div><h1>Scripts and policies</h1>
   <div class="card" style="padding:0"><div class="tw"><table class="t"><tr><th>Policy</th><th>Status</th><th></th></tr>
   ${pol("scan","GitGuardian machine scan","ggshield machine report · daily","Installs ggshield with the machine_scan plugin, authenticated with a service account token stored in the MDM, and reports each laptop's secrets inventory.")}
   ${pol("setup","GitGuardian protections","ggshield machine setup · on every run","AI hooks for every coding assistant found, git pre-commit and pre-push hooks, and a honeytoken. Idempotent, so it's safe to schedule.")}</table></div></div>
   <div class="card" style="padding:0"><div style="padding:12px 16px 0"><h3>Devices</h3></div><div class="tw"><table class="t"><tr><th>Device</th><th>Owner</th><th>AI agents</th><th>AI hooks</th></tr>${devs.map(([h,o])=>`<tr><td class="mono">${h}</td><td>${esc(o)}</td><td>${(AGENTS[h]||[]).join(", ")||"none"}</td><td>${(AGENTS[h]||[]).length?(hooksOn(h)?pill("Installed","p-res"):pill("Missing","p-trig")):"—"}</td></tr>`).join("")}</table></div></div>
   <div style="font-size:12.5px;color:#545C6E">Servers (nas01, tvx-legacy-01) aren't enrolled in MDM. Install ggshield on them by hand.</div></div>`;};
document.addEventListener("click",e=>{const b=e.target.closest("[data-mdmdeploy]");if(!b||!document.getElementById("pcroot"))return;pcAct(()=>{const k=b.dataset.mdmdeploy;S.f.mdm=S.f.mdm||{};S.f.mdm[k]=true;advance(3);
  return {toast:k==="setup"?"Deployed. AI hooks are going onto every laptop's coding assistants; the Endpoints dashboard will show the coverage.":"Deployed. Every laptop will scan and report its secrets daily."};});});
function mdmAnnounce(){if(S.f.mdmAnnounced||!mdmUnlocked())return;S.f.mdmAnnounced=true;mail("mdm","IT Help Desk","You're now an MDM admin");
  setTimeout(()=>flash("IT added you to the MDM admins. Device Management is in Program Manager."),0);}
