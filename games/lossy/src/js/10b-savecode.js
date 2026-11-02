/* ============================== LR-07: 32-bit save codes ==============================
   A game condenses to 32 bits, shown as 8 hex digits: LR-XXXX-XXXX.
     bits  0-1   level (0 Tuesday, 1 Wednesday, 2 Thursday, 3 ULTIMATE)
     bits  2-7   in-game time, in 6-minute steps (0 to 63, so 9:00 AM to 3:18 PM)
     bits  8-9   Tuesday to Thursday: whether Tuesday and Wednesday were won. Friday (level 3): 0 means ULTIMATE on its own;
                 1 to 3 means Friday of the week, with that many of Tuesday to Thursday won (lossy: 0 won is stored as 1)
     bits 10-26  up to 17 milestones for the current level, in the order listed below
     bits 27-31  checksum: reported, not enforced (any code loads; a mismatch just gets a warning)
   It is lossy on purpose: it keeps what matters for play (where you are, what's fixed, what's broken) and drops
   the rest (exact minute, dialogue order, timeline wording). Points are recalculated from the milestones.
   Earlier days are rebuilt as either fully remediated (won) or untouched (lost). */
const SC_SLOT=6;
/* helpers that put the world into a state the way the game's own actions would */
const SC={
  open(id){const i=INC(id);if(!i)return;i.created=true;i.opened=true;aw(id,"open");},
  check(id){INC(id).checked=true;aw(id,"check");},
  vault(id,v){const p=DEF[id].path;S.vault[p]=S.vault[p]||[];if(!S.vault[p].length)S.vault[p].push("v1");if(v==="v2"&&vlast(p)!=="v2")S.vault[p].push("v2");INC(id).tags=[...new Set(INC(id).tags.concat(["Vaulted"]))];aw(id,"vault");if(v==="v2")aw(id,"vault2");},
  newKey(id){const i=INC(id);i.key.v2=true;i.v2made=true;aw(id,"newkey");},
  revoke(id){const i=INC(id);i.key.v1=false;aw(id,"revoke");},
  resolve(id){const i=INC(id);i.status="RESOLVED";i.resolvedHow="revoked";resAward(id);},
  logs(id){INC(id).logs=true;aw(id,"logs");},
  known(id,k){reveal(id,k,"restored from a save code");},
  onVault(id,k){const dc=DEF[id].cons[k];if(dc.kind==="ci"){INC(id).cons[k].on="vault";INC(id).cons[k].pending=null;return;}
    if(dc.kind==="cron"){const h=S.hosts.nas01;h.cron=h.cron.split("\n").map(l=>l.includes(dc.job)&&!/^\s*#/.test(l)?l.replace(new RegExp(DEF[id].field+"=(\\$\\([^)]*\\)|\\S+)"),DEF[id].field+"="+VLOOK(DEF[id].field,DEF[id].path)):l).join("\n");return;}
    if(dc.kind==="vmenv"){const f=S.hosts.tvx.fs;f["/etc/tvx/export.env"]=f["/etc/tvx/export.env"].split("\n").map(l=>/^\s*GOOGLE_APPLICATION_CREDENTIALS/.test(l)?"# "+l:l).join("\n");}},
  isVault(id,k){const on=conOn(id,k);return on==="vault"||on==="keyless";}};
/* milestones per level: [label, is it done?, make it so] */
const MILESTONES={
 1:[["incident opened",()=>!!INC(1017).opened,()=>SC.open(1017)],
    ["validity checked",()=>INC(1017).checked,()=>SC.check(1017)],
    ["badge taken",()=>S.f.drawer,()=>{S.f.drawer=true;if(!S.inv.includes("badge"))S.inv.push("badge");award("drawer",1);}],
    ["agent stopped",()=>S.f.agentStopped,()=>{S.f.agentStopped=true;award("stopAgent",1);}],
    ["nas01 cron known",()=>INC(1017).cons.cron.known,()=>{SC.known(1017,"cron");award("assess",1);}],
    ["key in Vault",()=>!!(S.vault["kv/lending/openai"]||[]).length,()=>SC.vault(1017,"v1")],
    ["repayments-svc on Vault",()=>INC(1017).cons.repay.on==="vault",()=>SC.onVault(1017,"repay")],
    ["ledger-batch on Vault",()=>INC(1017).cons.ledger.on==="vault",()=>SC.onVault(1017,"ledger")],
    ["nas01 cron on Vault",()=>conOn(1017,"cron")==="vault",()=>SC.onVault(1017,"cron")],
    ["new key created",()=>INC(1017).key.v2||!!INC(1017).v2made,()=>SC.newKey(1017)],
    ["new key in Vault",()=>vlast("kv/lending/openai")==="v2",()=>SC.vault(1017,"v2")],
    ["leaked key revoked",()=>!INC(1017).key.v1,()=>SC.revoke(1017)],
    ["usage reviewed",()=>INC(1017).logs,()=>SC.logs(1017)],
    ["incident resolved",()=>INC(1017).status==="RESOLVED",()=>SC.resolve(1017)],
    ["key went public",()=>INC(1017).public,()=>{const i=INC(1017);i.public=true;if(!i.tags.includes("Publicly leaked"))i.tags.push("Publicly leaked");mail("pub","GitGuardian","[GitGuardian] Public incident: your OpenAI API Key is on public GitHub");}],
    ["SSH note taken",()=>S.f.sshNote,()=>{S.f.sshNote=true;if(!S.inv.includes("sticky note"))S.inv.push("sticky note");}],
    ["Endpoint Protection on nas01",()=>S.hosts.nas01.ep.inst&&S.hosts.nas01.ep.ht,()=>{const e=S.hosts.nas01.ep;e.inst=true;e.ht=true;e.scanned=true;e.scannedAt="Tue";award("ep",1);award("epscan",1);award("epht",1);}]],
 2:[["incidents opened",()=>!!INC(1102).opened&&!!INC(1103).opened,()=>{SC.open(1102);SC.open(1103);}],
    ["worm contained",()=>S.f.contained,()=>{S.f.contained=true;award("contain",2);}],
    ["GitHub token revoked",()=>!INC(1102).key.v1,()=>SC.revoke(1102)],
    ["SendGrid key revoked",()=>!INC(1103).key.v1,()=>SC.revoke(1103)],
    ["digest cron known",()=>INC(1103).cons.digest.known,()=>SC.known(1103,"digest")],
    ["new GitHub token",()=>INC(1102).key.v2||!!INC(1102).v2made,()=>SC.newKey(1102)],
    ["new SendGrid key",()=>INC(1103).key.v2||!!INC(1103).v2made,()=>SC.newKey(1103)],
    ["GitHub token in Vault",()=>vlast("kv/plimbo/github")==="v2",()=>SC.vault(1102,"v2")],
    ["SendGrid key in Vault",()=>vlast("kv/plimbo/sendgrid")==="v2",()=>SC.vault(1103,"v2")],
    ["release job on Vault",()=>INC(1102).cons.release.on==="vault",()=>SC.onVault(1102,"release")],
    ["plimbo-api on Vault",()=>INC(1103).cons.api.on==="vault",()=>SC.onVault(1103,"api")],
    ["digest cron on Vault",()=>conOn(1103,"digest")==="vault",()=>SC.onVault(1103,"digest")],
    ["GitHub audit log reviewed",()=>INC(1102).logs,()=>SC.logs(1102)],
    ["SendGrid activity reviewed",()=>INC(1103).logs,()=>SC.logs(1103)],
    ["#1102 resolved",()=>INC(1102).status==="RESOLVED",()=>SC.resolve(1102)],
    ["#1103 resolved",()=>INC(1103).status==="RESOLVED",()=>SC.resolve(1103)],
    ["SSH note taken",()=>S.f.sshNote,()=>{S.f.sshNote=true;if(!S.inv.includes("sticky note"))S.inv.push("sticky note");}]],
 3:[["incident opened and checked",()=>!!INC(1219).opened&&INC(1219).checked,()=>{SC.open(1219);SC.check(1219);}],
    ["owner set",()=>!!INC(1219).owner,()=>{INC(1219).owner=P.amara;award("owner",3);}],
    ["break-glass access",()=>S.f.breakglass,()=>{S.f.breakglass=true;award("breakglass",3);}],
    ["VM found",()=>INC(1219).cons.vm.known,()=>SC.known(1219,"vm")],
    ["key disabled",()=>!INC(1219).key.v1,()=>SC.revoke(1219)],
    ["key deleted",()=>INC(1219).key.del,()=>{INC(1219).key.del=true;INC(1219).key.v1=false;award("delete",3);}],
    ["new key created",()=>INC(1219).key.v2||!!INC(1219).v2made,()=>SC.newKey(1219)],
    ["new key in Vault",()=>vlast("kv/mapwende/gcp-tiler")==="v2",()=>SC.vault(1219,"v2")],
    ["tile-renderer on Vault",()=>INC(1219).cons.tiler.on==="vault",()=>SC.onVault(1219,"tiler")],
    ["field-sync on Vault",()=>INC(1219).cons.sync.on==="vault",()=>SC.onVault(1219,"sync")],
    ["VM keyless",()=>conOn(1219,"vm")==="keyless",()=>SC.onVault(1219,"vm")],
    ["key file removed",()=>S.hosts.tvx.fs[TVX_JSON]==null,()=>{delete S.hosts.tvx.fs[TVX_JSON];award("jsonrm",3);}],
    ["key usage reviewed",()=>INC(1219).logs,()=>SC.logs(1219)],
    ["incident resolved",()=>INC(1219).status==="RESOLVED",()=>SC.resolve(1219)],
    ["talked to Amara",()=>got("amara",3),()=>award("amara",3)],
    ["SSH note taken",()=>S.f.sshNote,()=>{S.f.sshNote=true;if(!S.inv.includes("sticky note"))S.inv.push("sticky note");}],
    ["AI hooks on Amara's laptop",()=>hooksOn("amara-mbp"),()=>{S.f.aiHooks=S.f.aiHooks||{};S.f.aiHooks["amara-mbp"]=true;award("aihooks",3);}]],
 4:[["binder read",()=>S.f.binder,()=>{S.f.binder=true;S.f.drawer=true;for(const x of ["badge","binder"])if(!S.inv.includes(x))S.inv.push(x);award("binder",4);}],
    ["honeytoken event confirmed",()=>got("ht",4),()=>award("ht",4)],
    ["laptop isolated",()=>S.f.isolated,()=>{S.f.isolated=true;award("isolate",4);}],
    ["incidents created",()=>[1401,1402,1403].every(id=>INC(id).created),()=>{for(const id of [1401,1402,1403])createInc(id);}],
    ["Vault token revoked",()=>!INC(1403).key.v1,()=>SC.revoke(1403)],
    ["GitHub token revoked",()=>!INC(1401).key.v1,()=>SC.revoke(1401)],
    ["SendGrid key revoked",()=>!INC(1402).key.v1,()=>SC.revoke(1402)],
    ["new GitHub token",()=>INC(1401).key.v2||!!INC(1401).v2made,()=>SC.newKey(1401)],
    ["new SendGrid key",()=>INC(1402).key.v2||!!INC(1402).v2made,()=>SC.newKey(1402)],
    ["GitHub token in Vault",()=>vlast("kv/plimbo/github")==="v2",()=>SC.vault(1401,"v2")],
    ["SendGrid key in Vault",()=>vlast("kv/plimbo/sendgrid")==="v2",()=>SC.vault(1402,"v2")],
    ["release job on Vault",()=>INC(1401).cons.release.on==="vault",()=>SC.onVault(1401,"release")],
    ["digest cron found and on Vault",()=>INC(1402).cons.digest.known&&conOn(1402,"digest")==="vault",()=>{SC.known(1402,"digest");SC.onVault(1402,"digest");}],
    ["attacker activity investigated",()=>got("audit",4)&&got("vaudit",4)&&got("logs",4),()=>{SC.logs(1401);SC.logs(1402);award("vaudit",4);INC(1403).logs=true;}],
    ["incidents resolved",()=>[1401,1402,1403].every(id=>INC(id).status==="RESOLVED"),()=>{for(const id of [1401,1402,1403])SC.resolve(id);}],
    ["honeytoken revoked",()=>S.f.htRevoked,()=>{S.f.htRevoked=true;award("htrevoke",4);}],
    ["AI hooks on the loaner",()=>hooksOn("ravi-loaner"),()=>{S.f.aiHooks=S.f.aiHooks||{};S.f.aiHooks["ravi-loaner"]=true;award("aihooks",4);}]]};
const scCheck=d=>(Math.imul(d>>>0,2654435761)>>>27)&31;
function encodeSave(){if(!S)return null;const lvl=S.day-1;const slot=Math.min(63,Math.round(S.t/SC_SLOT));
  const prev=S.day===4?(S.week?Math.max(1,[1,2,3].filter(d=>S.results[d]==="won").length):0):(S.results[1]==="won"?1:0)|(S.results[2]==="won"?2:0);
  let ms=0;(MILESTONES[S.day]||[]).forEach((m,n)=>{let ok=false;try{ok=!!m[1]();}catch(e){}if(ok)ms|=1<<n;});
  const data=(lvl|(slot<<2)|(prev<<8)|(ms<<10))>>>0;const v=(data|(scCheck(data)<<27))>>>0;
  const h=v.toString(16).toUpperCase().padStart(8,"0");return `LR-${h.slice(0,4)}-${h.slice(4)}`;}
/* Any input decodes to some game. Eight hex digits are read as the 32 bits directly; anything else is hashed (FNV-1a)
   into 32 bits. The checksum is reported, not enforced: a code that doesn't check out still loads, it just might not be the
   game you meant, or might not be a game you can win. */
function fnv1a(str){let h=0x811c9dc5;for(const ch of str){h^=ch.charCodeAt(0);h=Math.imul(h,0x01000193)>>>0;}return h>>>0;}
function decodeSave(code){const raw=String(code||"").trim();const h=raw.toUpperCase().replace(/^LR/,"").replace(/[^0-9A-F]/g,"");
  const exact=h.length===8&&/^(LR)?[-\s]*[0-9A-F]{4}[-\s]*[0-9A-F]{4}$/i.test(raw.replace(/^LR-?/i,"LR"));
  const v=exact?parseInt(h,16)>>>0:fnv1a(raw.toUpperCase());const data=v&0x7FFFFFF;
  return {day:(data&3)+1,t:((data>>>2)&63)*SC_SLOT,prev:(data>>>8)&3,ms:(data>>>10)&0x1FFFF,checksumOk:exact&&scCheck(data)===(v>>>27),hashed:!exact};}
/* rebuild a game from a code */
function finishDay(d){/* canonical "won" state for an earlier day */
  if(d===1){const i=INC(1017);SC.open(1017);SC.check(1017);S.f.agentStopped=true;S.f.drawer=true;if(!S.inv.includes("badge"))S.inv.push("badge");SC.known(1017,"cron");SC.newKey(1017);SC.vault(1017,"v2");for(const k of ["repay","ledger","cron"])SC.onVault(1017,k);SC.revoke(1017);SC.logs(1017);SC.resolve(1017);award("kofi",1);}
  if(d===2){for(const id of [1102,1103]){SC.open(id);SC.revoke(id);SC.newKey(id);SC.vault(id,"v2");SC.logs(id);SC.resolve(id);}S.f.contained=true;award("contain",2);SC.known(1103,"digest");for(const [id,k] of [[1102,"release"],[1103,"api"],[1103,"digest"]])SC.onVault(id,k);award("kofi",2);}
  if(d===3){MILESTONES[3].slice(0,14).forEach(m=>m[2]());award("kofi",3);}}
/* Perfect-start codes: LR-PERF-TUE, LR-PERF-WED, LR-PERF-THU, LR-PERF-ULT start that level at 9:00 AM with every earlier day
   at a perfect 100 (all fixes, all bonuses). They're reserved words, not 32-bit codes, so normal codes keep their meaning. */
const PERFECT={TUE:1,WED:2,THU:3,FRI:5,ULT:4};
const perfectOf=code=>{const m=/^LR[-\s]*PERF(?:ECT)?[-\s]*(TUE|WED|THU|FRI|ULT)\w*$/i.exec(String(code||"").trim());return m?PERFECT[m[1].toUpperCase()]:0;};
function perfectDay(d){finishDay(d);const ms=MILESTONES[d]||[];
  if(d===1){S.f.drawer=true;S.f.agentStopped=true;S.f.sshNote=true;for(const x of ["badge","sticky note"])if(!S.inv.includes(x))S.inv.push(x);
    const e=S.hosts.nas01.ep;e.inst=true;e.scanned=true;e.ht=true;e.scannedAt="Tue";S.f.aiHooks=S.f.aiHooks||{};S.f.aiHooks["dana-mbp"]=true;S.f.setupInPerson=true;
    const i=INC(1017);i.assignee=S.player||"You";i.shared=true;i.feedback=true;}
  if(d===3){S.f.aiHooks=S.f.aiHooks||{};S.f.aiHooks["amara-mbp"]=true;S.f.sshNote=true;}
  if(d===2){S.f.aiHooks=S.f.aiHooks||{};S.f.aiHooks["ravi-mbp"]=true;for(const id of [1102,1103]){const i=INC(id);i.assignee=S.player||"You";i.shared=true;i.feedback=true;i.map=true;}}
  for(const k of Object.keys(POINTS[d]))award(k,d);}
function restoreFromCode(code){const pd=perfectOf(code);if(pd)return restorePerfect(pd);const r=decodeSave(code);S=fresh();snaps=[];
  if(r.day===4&&!r.prev){S.vault={};setupUltimate();beginDay(4);}
  else if(r.day===4){S.week=true;for(let d=1;d<=3;d++){beginDay(d);if(d<=r.prev){finishDay(d);S.results[d]="won";}else S.results[d]="lost:audit";}setupUltimate();beginDay(4);}
  else{S.week=true;for(let d=1;d<r.day;d++){beginDay(d);const won=d===1?(r.prev&1):(r.prev&2);if(won){finishDay(d);S.results[d]="won";}else S.results[d]="lost:audit";}beginDay(r.day);}
  S.inv=S.inv.length?S.inv:[];if(r.day>1&&!S.inv.includes("badge"))S.inv.push("badge");
  (MILESTONES[r.day]||[]).forEach((m,n)=>{if(r.ms&(1<<n))m[2]();});
  S.t=r.t;for(const id in S.incs)for(const k in S.incs[id].cons){const c=S.incs[id].cons[k];c.downSince=healthy(+id,k)?null:Math.max(0,r.t-1);}
  checkAwards();S.f.doneNotified={};
  /* if the code drops you past a deadline you haven't met, it already happened */
  if(!dayDone()){for(const id of dayIncs(S.day)){const rk=RISK[id];if(!rk||!INC(id)||!INC(id).created||incDone(id))continue;const k=rk(id,-1,x=>r.t>=x);if(k){S.dead=k;break;}}
    if(!S.dead&&r.t>=DAYS[S.day].audit)S.dead="audit";}
  save();return r;}
function restorePerfect(day){const keep=S&&S.player;S=fresh();snaps=[];if(keep)S.player=keep;
  if(day===4){S.vault={};setupUltimate();beginDay(4);}
  else if(day===5){S.week=true;for(let d=1;d<=3;d++){beginDay(d);perfectDay(d);S.results[d]="won";}setupUltimate();beginDay(4);day=4;}
  else{S.week=true;for(let d=1;d<day;d++){beginDay(d);perfectDay(d);S.results[d]="won";}beginDay(day);if(day>1&&!S.inv.includes("badge"))S.inv.push("badge");}
  checkAwards();S.f.doneNotified={};save();return {day,t:0,prev:S.week&&day===4?3:day===3?3:day===2?1:0,ms:0,checksumOk:true,hashed:false,perfect:true};}
function showSaveCode(){const L=ML();const w=document.createElement("div");w.className="msgwrap";const code=encodeSave();
  w.innerHTML=`<div class="msg" style="cursor:default"><b>Save code</b>\nWrite this down. Entering it on the title screen rebuilds this game: the day, the time (to the nearest 6 minutes) and everything you've fixed or broken so far. Points are recalculated.\n\n<span style="display:block;text-align:center;font:34px/1.2 var(--f-term);letter-spacing:.06em;user-select:all" id="sccode">${code}</span>\nIt fits in 32 bits.<div class="btns"><button data-sccopy>Copy</button><button data-scclose>Close</button></div></div>`;L.appendChild(w);}
function askSaveCode(){const L=ML();const w=document.createElement("div");w.className="msgwrap";w.id="scask";
  w.innerHTML=`<div class="msg" style="cursor:default"><b>Enter a save code</b>\n<form id="scform" style="display:flex;gap:8px;margin-top:8px"><input id="scin" placeholder="LR-XXXX-XXXX" autocomplete="off" spellcheck="false" style="flex:1;min-width:0;font:24px var(--f-term);padding:4px 8px;border:2px solid #0000AA;text-transform:uppercase"><button type="submit" style="background:#C8C8C8;border:2px solid;border-color:#FFF #555 #555 #FFF;padding:6px 12px;font:16px var(--f-pix)">Load</button></form><div id="scerr" style="color:#AA0000;min-height:1.4em"></div><div style="font-size:14px;color:#555">Any code loads. A real one rebuilds your game; anything else gives you some game, and maybe not a winnable one.</div><div class="btns"><button data-scclose>Cancel</button></div></div>`;L.appendChild(w);try{document.getElementById("scin").focus();}catch(e){}}
document.addEventListener("click",e=>{if(e.target.closest("[data-scclose]")){const w=e.target.closest(".msgwrap");if(w)w.remove();return;}
  if(e.target.closest("[data-sccopy]")){const c=(document.getElementById("sccode")||{}).textContent||"";try{navigator.clipboard.writeText(c);flash("Copied "+c);}catch(err){flash(c);}return;}
  if(e.target.closest("[data-mn='code']")){clearMsgs();return showSaveCode();}
  if(e.target.closest("[data-tt='code']"))return askSaveCode();});
document.addEventListener("submit",e=>{if(e.target.id!=="scform")return;e.preventDefault();const v=document.getElementById("scin").value;
  if(!v.trim()){document.getElementById("scerr").textContent="Type something. Anything.";return;}
  clearMsgs();const r=restoreFromCode(v);showGame();const D=DAYS[S.day];
  if(r.perfect){msgBox(`Perfect start: ${D.name}, 9:00 AM.${S.week&&S.day>1?` Every earlier day is a perfect 100 (score ${total()} of 400 so far).`:""}`);return;}
  const note=r.hashed?`"${v.trim()}" isn't a save code, so it was turned into one (${encodeSave()}). Who knows what you'll get.`:r.checksumOk?"":"That code doesn't check out (a typo, or made up), so this may not be the game you meant. Loaded it anyway.";
  if(S.dead){msgBox(`${note?note+"\n\n":""}It's ${D.name}, ${hhmm(S.t)}, and you've arrived too late.`,null,()=>after());return;}
  msgBox(`${note?note+"\n\n":"Restored from "+v.trim().toUpperCase()+".\n\n"}It's ${D.name}, ${hhmm(S.t)}. ${(MILESTONES[S.day]||[]).filter((m,n)=>{try{return m[1]();}catch(e){return false;}}).length} of today's milestones are done. The blue bar shows what's next.`);});
