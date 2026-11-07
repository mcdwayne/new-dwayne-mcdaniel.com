/* ============================== Slack (same as LossyInc Range's 05b-slack.js, plus one house rule) ==============================
   Same choices as talking in person. Replies take a random 2 to 200 real seconds; the game clock doesn't move while you wait.
   Pending replies are stored with an absolute due time, so they survive closing the computer and reloading the page.
   House rule: nobody at Precarium answers a DM from someone they haven't met. Talk to them in person first.
   Scripted messages (game mechanics) arrive regardless: Otto's first ping, channel posts, the change-window war room. */
const SL_COL={otto:"#AA5500",marisol:"#AA00AA",juni:"#006B6B",wendell:"#0000AA",ingrid:"#555555",kenji:"#006B00",desmond:"#5555FF",harriet:"#AA0000",paloma:"#AA00AA",victor:"#000000"};
let slWho=null;
function SL(){if(!S.slack)S.slack={msgs:{},pending:[],unread:{}};for(const k of Object.keys(PPL))S.slack.msgs[k]=S.slack.msgs[k]||[];return S.slack;}
/* who you've met in person: recorded when you talk to them, or implied by quest progress (so save codes keep it) */
function met(who){if(S.met&&S.met[who])return true;const f=S.f,pt=k=>Object.keys(S.pitch[k]||{}).length>0;
  return {otto:f.ottoWorried||f.ottoRotated||S.lv>1,marisol:S.lv>1||pt("marisol"),juni:f.juniAsk,wendell:S.lv>2||pt("wendell"),ingrid:f.ingridAsk,kenji:f.kenjiAwake,desmond:f.desAsk,harriet:f.harrietAsk,paloma:f.palAsk,victor:f.vicAsk}[who]||false;}
function markMet(who){S.met=S.met||{};S.met[who]=true;}
function slackDelay(){const o=typeof window!=="undefined"&&window.DBP_SLACK_DELAY_MS;if(o!=null)return +o;return (2+Math.floor(Math.random()*199))*1000;}
/* some things only work face to face: pitches to bosses, handing over a laptop, waking someone up */
const IN_PERSON=/^(▸|Bye$|Make a new token|Wake him up|\(Paloma)/;
function slOptions(who){if(!met(who))return [];if(who==="kenji"&&!S.f.kenjiAwake)return [];if(who==="victor"&&!S.f.palAsk)return [];
  const b=OPTS[who];return b?b().filter(o=>o[1]&&!IN_PERSON.test(o[0])):[];}
const slUnread=()=>{if(!S||!S.slack)return 0;return Object.values(S.slack.unread).reduce((a,b)=>a+b,0);};
/* turn an in-person reply ("narration" plus "quotes") into a chat message */
function chatText(t){const q=[...String(t).matchAll(/"([^"]+)"/g)].map(m=>m[1]);return (q.length?q.join(" "):String(t)).trim();}
function slSend(who,label,fnIdx){const s=SL();if(s.pending.some(p=>p.who===who&&p.label===label))return;
  s.msgs[who].push({me:true,txt:label,at:clock(S.t)});advance(1);
  if(!met(who)||(who==="kenji"&&!S.f.kenjiAwake)){save();return;}/* delivered, never answered */
  const ms=slackDelay();s.pending.push({who,label,fnIdx,due:Date.now()+ms,typingFrom:Date.now()+Math.max(0,ms-Math.min(6000,ms*0.6))});save();}
function slDeliver(p){const s=SL();s.pending=s.pending.filter(x=>x!==p);const who=p.who;let txt,pts=0;
  if(p.fnIdx==null){txt=["Can you ask me something specific? I'm a bit underwater.","👀 not sure what you mean","Sorry, in the middle of something. What do you need exactly?"][Math.floor(Math.random()*3)];}
  else{const opt=slOptions(who).find(o=>o[0]===p.label);if(!opt){txt="Already on it.";}else{const r=opt[1]()||{};txt=chatText(r.t||"👍");pts=r.p||0;}}
  s.msgs[who].push({me:false,txt,at:clock(S.t),pts});
  const viewing=document.getElementById("pcroot")&&pcApp==="slack"&&slWho===who;if(!viewing)s.unread[who]=(s.unread[who]||0)+1;
  if(document.getElementById("w31")&&!modal)renderPC();else updateBar();
  if(!viewing)flash(`Slack · ${PPL[who].name.split(" ")[0]}: ${txt.replace(/\s+/g," ").slice(0,70)}${txt.length>70?"…":""}${pts?` (+${pts})`:""}`);
  save();}
setInterval(()=>{if(!S||S.dead||!S.slack||!S.slack.pending.length)return;const now=Date.now();
  for(const p of S.slack.pending.slice())if(now>=p.due){slDeliver(p);if(!S||S.dead)return;}
  if(document.getElementById("w31")&&pcApp==="slack"&&!modal&&slWho&&PPL[slWho]){const t=document.getElementById("sltyping");const p=S.slack.pending.find(x=>x.who===slWho);const want=p&&now>=p.typingFrom?`${PPL[slWho].name.split(" ")[0]} is typing…`:p?"Delivered":"";if(t&&t.textContent!==want)t.textContent=want;}},500);
/* scripted DMs (game mechanics): they arrive whether or not you've met */
function slScript(who,txt){const s=SL();if(s.msgs[who].some(m=>!m.me&&m.txt===txt))return;s.msgs[who].push({me:false,txt,at:clock(S.t),scripted:true});s.unread[who]=(s.unread[who]||0)+1;}
/* channels: read-only, scripted */
function channels(){const c=[["general","Everyone at Precarium"]];if(S.lv>=2)c.push(["eng-payments","Payments engineering"]);if(S.lv>=6)c.push(["payrail-rotation","Change window 11 PM to 1 AM"]);return c;}
function channelLines(ch){const L=[];const m=(who,t)=>L.push([who,t]);
  if(ch==="general"){m("marisol","Reminder: SOC 2 auditors are on site Friday. Please don't plug anything weird into anything.");m("paloma","Victor is back from Tahoe at 4. His calendar is not.");if(S.lv>=3)m("kenji","if anyone needs me i'm the beanbag");}
  if(ch==="eng-payments"){m("wendell","Pay Later 2.0 ships Monday. No weekend work if we hit Friday's cut.");if(S.lv>=3)m("wendell","PSA: GitGuardian checks are on for every Payments PR. If it flags you, fix it, don't --no-verify it. Thanks Juni for the push.");if(S.lv>=4)m("ingrid","Reminder: CHANGE FREEZE until close. Exceptions need Harriet.");}
  if(ch==="payrail-rotation")return chatLines();
  return L;}
const mdChat=t=>esc(t).replace(/\n/g,"<br>");
APPS.slack=function(){const s=SL();const ppl=Object.keys(PPL);if(!slWho)slWho="ch:general";const isCh=/^ch:/.test(slWho);if(!isCh&&pcApp==="slack")s.unread[slWho]=0;
  const nav=`<nav><div class="ws">Precarium</div><div class="grp">Channels</div>${channels().map(([c])=>`<button data-act="slwho:ch:${c}" aria-current="${slWho==="ch:"+c}"># ${c}</button>`).join("")}<div class="grp">Direct messages</div>
   ${ppl.map(k=>`<button data-act="slwho:${k}" aria-current="${k===slWho}"><i style="background:${SL_COL[k]}"></i>${PPL[k].name}${s.unread[k]?`<span class="badge">${s.unread[k]}</span>`:""}</button>`).join("")}</nav>`;
  if(isCh){const ch=slWho.slice(3);const [,topic]=channels().find(x=>x[0]===ch)||[ch,""];
    return `<div class="sl">${nav}<main><div class="slh"><b>#${ch}</b><span>${topic}</span></div><div class="slmsgs" id="slmsgs">${channelLines(ch).map(([w,t])=>`<div class="slm"><i style="background:${SL_COL[w]||"#555"}">${PPL[w].name[0]}</i><div><b>${esc(PPL[w].name)}</b> <small>${clock(S.t)}</small><div>${esc(t)}</div></div></div>`).join("")||'<div class="slempty">Nothing here yet.</div>'}</div><div class="sltyping"></div><div class="slcompose"><span style="color:#545C6E;font-size:12.5px">You can read this channel. Post in DMs.</span></div></main></div>`;}
  const who=slWho,pp=PPL[who],opts=slOptions(who),pend=s.pending.filter(p=>p.who===who),known=met(who);
  const unanswered=!known&&s.msgs[who].some(m=>m.me);
  return `<div class="sl">${nav}<main><div class="slh"><b>${pp.name}</b><span>${pp.role} · ${known?(who==="kenji"&&!S.f.kenjiAwake?"asleep":"replies can take a few minutes"):"you haven't met"}</span></div>
   <div class="slmsgs" id="slmsgs">${s.msgs[who].length?"":`<div class="slempty">This is the very beginning of your direct message history with ${pp.name}.</div>`}${s.msgs[who].map(m=>`<div class="slm"><i style="background:${m.me?"#2D3FD8":SL_COL[who]}">${m.me?(S.player||"Y")[0]:pp.name[0]}</i><div><b>${m.me?esc(S.player):pp.name}</b> <small>${m.at}</small><div>${mdChat(m.txt)}${m.pts?` <span class="pill p-res">+${m.pts}</span>`:""}</div></div></div>`).join("")}</div>
   <div class="sltyping" id="sltyping" aria-live="polite">${pend.length?"Delivered":unanswered?`Delivered · ${pp.name.split(" ")[0]} hasn't replied. People here don't answer DMs from someone they haven't met. Go and say hi in person.`:""}</div>
   <div class="slcompose">${known?"":`<div style="font-size:12.5px;color:#545C6E">You haven't met ${pp.name.split(" ")[0]} yet. ${pp.role}, ${ROOMNAME[{otto:"b1",marisol:"f2",juni:"f3",wendell:"f3",ingrid:"f4",kenji:"f4",desmond:"f5",harriet:"f5",paloma:"f6",victor:"f6"}[who]]}.</div>`}
    <div class="slsugg">${opts.map((o,n)=>{const busy=pend.some(p=>p.label===o[0]);return `<button class="btn" data-act="slsend:${n}" ${busy?"disabled":""}>${esc(o[0])}${busy?" (sent)":""}</button>`;}).join("")}</div>
    ${known&&opts.length?`<div style="font-size:12.5px;color:#545C6E">Pitches and hand-offs happen in person.</div>`:""}
    <form id="slform" class="slform" data-actform="slform"><label for="slin" class="sr">Message ${esc(pp.name)}</label><input id="slin" type="text" placeholder="Message ${pp.name.split(" ")[0]}" autocomplete="off"><button class="btn pri" type="submit">Send</button></form></div></main></div>`;};
ACT.slwho=w=>{slWho=w;renderPC();const m=document.getElementById("slmsgs");if(m)m.scrollTop=m.scrollHeight;};
ACT.slsend=n=>{const o=slOptions(slWho)[+n];if(!o)return;slSend(slWho,o[0],+n);renderPC();const m=document.getElementById("slmsgs");if(m)m.scrollTop=m.scrollHeight;};
ACT.slform=f=>{const v=(f.querySelector("#slin").value||"").trim();if(!v||!slWho||/^ch:/.test(slWho))return;const o=slOptions(slWho);const k=o.findIndex(x=>x[0].toLowerCase()===v.toLowerCase());slSend(slWho,k>=0?o[k][0]:v,k>=0?k:null);renderPC();};
