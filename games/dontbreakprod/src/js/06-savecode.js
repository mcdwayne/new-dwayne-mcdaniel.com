/* ============================== 32-bit save codes (same system as LossyInc Range) ==============================
   A game condenses to 32 bits, shown as 8 hex digits: DBP-XXXX-XXXX.
     bits  0-2   level (0 to 5 for levels 1 to 6)
     bits  3-8   time since the level started, in 6-minute steps (0 to 63)
     bits  9-26  up to 18 milestones for the current level, in the order listed below
     bits 27-31  checksum: reported, not enforced (any code loads; a mismatch just gets a warning)
   It is lossy on purpose: it keeps what matters for play (where you are in the quest, what you've done, what you
   carry) and drops the rest (exact minute, which room you were in, dialogue order). Points are recalculated from the
   milestones. Earlier levels are rebuilt as finished: in this game you can only move up a floor by winning. */
const SC_SLOT=6;
const pm=(who,k,pt,label)=>[label,()=>!!(S.pitch[who]||{})[k],()=>{(S.pitch[who]||(S.pitch[who]={}))[k]=1;award(pt);}];
function readMail(id){const m=S.mail.find(x=>x.id===id);if(m)m.read=true;}
/* milestones per level: [label, is it done?, make it so] */
const MILESTONES={
 1:[["bounced alerts read",()=>S.f.sawBounce,()=>{readMail("bounce");S.f.sawBounce=true;award("mail");}],
    ["GitGuardian opened",()=>S.f.ggOpened,()=>{S.f.ggOpened=true;award("ggOpen");}],
    ["#3112 opened",()=>S.f.thOpened,()=>{S.f.thOpened=true;}],
    ["#3112 validity checked",()=>S.f.thValid,()=>{S.f.thValid=true;award("thValid");}],
    ["Otto warned",()=>S.f.ottoWorried,()=>{S.f.ottoWorried=true;}],
    ["TicketHive token rotated",()=>S.f.ottoRotated,()=>{S.f.ottoWorried=true;S.f.ottoRotated=true;grant("Otto at the help desk owes you one");award("otto");
      mail("otto2",PPL.otto.name,"done!!","New TicketHive token is in the auto-close script and the old one is revoked. The script still works. I checked twice.\n\nThanks for not making it my fault.\n\n- Otto");}],
    ["#3112 resolved",()=>S.f.thResolved,()=>{S.f.thResolved=true;award("thResolved");}],
    ["printer unjammed",()=>S.f.jam,()=>{S.f.jam=true;if(!S.f.penBack)give("silver pen");}],
    ["Marisol has her pen",()=>S.f.penBack,()=>{S.f.jam=true;take("silver pen");S.f.penBack=true;S.f.fav_pen=true;award("pen");}],
    ["Otto has his tickets",()=>S.f.rollBack,()=>{S.f.rollTaken=true;take("ticket roll");S.f.rollBack=true;S.f.fav_roll=true;award("roll");if(!S.f.cage)give("cage key");}],
    ["loaner cage opened",()=>S.f.cage,()=>{take("cage key");S.f.cage=true;award("cage");if(!S.f.dongleBack)give("USB-C dongle");if(!S.f.clipsBack)give("binder clips");}],
    pm("marisol","th","m1","Marisol: the TicketHive story"),
    pm("marisol","bounce","m2","Marisol: the 47 bounced alerts")],
 2:[["#2871 found",()=>S.f.pr,()=>{S.f.pr=true;award("pr");}],
    ["exploration map opened",()=>S.f.prMap,()=>{S.f.prMap=true;award("prMap");}],
    ["Payments incidents exported",()=>S.f.csv,()=>{S.f.csv=true;give("payments-incidents.csv");award("csv");}],
    ["talked to Juni",()=>S.f.juniAsk,()=>{S.f.juniAsk=true;award("juni");}],
    ["pre-commit hook fixed",()=>S.f.hook,()=>{S.f.hook=true;award("hook");}],
    ["Juni explained the key",()=>S.f.juniTold,()=>{S.f.juniTold=true;}],
    ["Wendell has his timer",()=>S.f.timerBack,()=>{S.f.timerTaken=true;take("tomato timer");S.f.timerBack=true;S.f.fav_timer=true;award("timer");}],
    ["Juni has her duck",()=>S.f.duckBack,()=>{S.f.duckTaken=true;take("rubber duck");S.f.duckBack=true;S.f.fav_duck=true;award("duck");}],
    pm("wendell","csv","w1","Wendell: the Payments export"),
    pm("wendell","hook","w2","Wendell: faster commits"),
    pm("wendell","pr","w3","Wendell: the launch has no payments")],
 3:[["talked to Ingrid",()=>S.f.ingridAsk,()=>{S.f.ingridAsk=true;award("ingrid");}],
    ["cold brew taken",()=>S.f.fridgeOpen,()=>{S.f.fridgeOpen=true;if(!S.f.coffeeGiven)give("cold brew");}],
    ["Kenji awake",()=>S.f.kenjiAwake,()=>{take("cold brew");S.f.fridgeOpen=true;S.f.kenjiAwake=true;S.f.coffeeGiven=true;award("coffee");}],
    ["ggscout Vault source on",()=>S.f.scout,()=>{S.f.scout=true;award("scout");}],
    ["recon-batch found",()=>S.f.map3,()=>{S.f.map3=true;award("map3");}],
    ["asked Kenji about recon-batch",()=>S.f.kenjiBatch,()=>{S.f.kenjiBatch=true;}],
    ["runbook written",()=>S.f.runbook,()=>{S.f.runbook=true;give("runbook");award("runbook");}],
    ["runbook printed",()=>S.f.printed,()=>{S.f.jam=true;S.f.printed=true;give("printed runbook");award("print");}],
    pm("ingrid","map","i1","Ingrid: three consumers"),
    pm("ingrid","rb","i2","Ingrid: the runbook"),
    pm("ingrid","budget","i3","Ingrid: the error budget")],
 4:[["talked to Harriet",()=>S.f.harrietAsk,()=>{S.f.harrietAsk=true;award("harriet");}],
    ["talked to Desmond",()=>S.f.desAsk,()=>{S.f.desAsk=true;award("des");}],
    ["PCI evidence exported",()=>S.f.pci,()=>{S.f.pci=true;if(!S.f.desDone)give("PCI evidence");award("pci");}],
    ["Desmond has his evidence",()=>S.f.desDone,()=>{take("PCI evidence");S.f.desDone=true;give("PayRail contract");award("contract");}],
    ["Desmond has his binder clips",()=>S.f.clipsBack,()=>{take("binder clips");S.f.clipsBack=true;S.f.fav_clips=true;award("clips");}],
    ["Harriet has her glasses",()=>S.f.glassesBack,()=>{take("reading glasses");S.f.glassesGot=true;S.f.glassesBack=true;S.f.fav_glasses=true;award("glasses");}],
    pm("harriet","contract","h1","Harriet: the 72-hour clause"),
    pm("harriet","rev","h2","Harriet: $410,000 an hour"),
    pm("harriet","pci","h3","Harriet: the report she never saw")],
 5:[["talked to Paloma",()=>S.f.palAsk,()=>{S.f.palAsk=true;award("paloma");}],
    ["talked to Victor",()=>S.f.vicAsk,()=>{S.f.vicAsk=true;award("victor");}],
    ["Victor's demo screen works",()=>S.f.dongleBack,()=>{take("USB-C dongle");S.f.dongleBack=true;S.f.fav_dongle=true;award("dongle");}],
    ["honeytoken created",()=>S.f.htMade,()=>{S.ht=S.ht||{name:"aws-docs-example",planted:false};S.f.htMade=true;award("htMade");}],
    ["honeytoken planted",()=>S.f.htPlanted,()=>{S.ht=S.ht||{name:"aws-docs-example"};if(!S.ht.planted){S.ht.planted=true;S.ht.plantedAt=S.t;S.ht.at=S.t+4;}S.f.htPlanted=true;award("htPlanted");}],
    ["honeytoken fired",()=>S.f.htFired,()=>{if(!S.ht.fired)S.ht.fired=S.ht.plantedAt+4;S.f.htFired=true;award("htFired");mail("ht","GitGuardian","[Honeytoken triggered] aws-docs-example in precarium-sdk-examples","Your honeytoken was used.\n\nSource IP: 185.220.101.47\nUser agent: aws-cli/2.15 Python/3.11 botocore\nAction: sts:GetCallerIdentity\nFirst use: 4 minutes after the commit was pushed\n\nNo real resources are behind a honeytoken. Whoever tried it was scanning public GitHub for credentials.");readMail("ht");}],
    pm("victor","ht","v1p","Victor: someone is looking"),
    pm("victor","plan","v2p","Victor: a planned change")],
 6:[["new PayRail key",()=>S.pr.v2,()=>{S.pr.v2=true;award("newkey");}],
    ["new key in Vault's default environment",()=>S.vault.default.includes("v2"),()=>{S.vault.default.push("v2");}],
    ["new key in Vault production",()=>vaultProd()==="v2",()=>{S.vault.production.push("v2");award("vault");}],
    ["checkout-api on the new key",()=>effKey("checkout")==="v2",()=>{S.c.checkout=vaultProd();S.f.restartedCheckout=true;}],
    ["payouts-worker on the new key",()=>effKey("payouts")==="v2",()=>{S.c.payouts=vaultProd();}],
    ["recon-batch reads Vault",()=>S.c.recon==="vault",()=>{S.c.recon="vault";award("recon");}],
    ["old key confirmed quiet",()=>S.f.quiet,()=>{S.f.quiet=true;award("quiet");}],
    ["old key revoked",()=>!S.pr.v1,()=>{S.pr.v1=false;}],
    ["#2871 resolved",()=>S.f.final,()=>{S.f.final=true;award("final");}]]};
/* the boss you win each level from, and the canonical end state of a finished level */
const BOSS={1:"marisol",2:"wendell",3:"ingrid",4:"harriet",5:"victor"};
function silentWin(who){const lu=levelUp;levelUp=()=>{};try{WIN[who]();}finally{levelUp=lu;}}
function startLevelQuiet(n){S.lv=n;S.t=Math.max(S.t,START_T[n]);LVMAIL[n]();}
function finishLevel(n){(MILESTONES[n]||[]).forEach(m=>{try{if(!m[1]())m[2]();}catch(e){}});
  if(n===2&&!S.f.juniTold)S.f.juniTold=true;
  if(n===5&&!(S.pitch.victor||{}).board){(S.pitch.victor||(S.pitch.victor={})).board=1;award("v3p");}
  if(n===1&&!(S.pitch.marisol||{}).ask){(S.pitch.marisol||(S.pitch.marisol={})).ask=1;award("m3");}
  silentWin(BOSS[n]);S.mail.forEach(m=>m.read=true);}
const scCheck=d=>(Math.imul(d>>>0,2654435761)>>>27)&31;
function encodeSave(){if(!S)return null;const lvl=Math.min(5,S.lv-1);const slot=Math.max(0,Math.min(63,Math.round((S.t-START_T[S.lv])/SC_SLOT)));
  let ms=0;(MILESTONES[S.lv]||[]).forEach((m,n)=>{let ok=false;try{ok=!!m[1]();}catch(e){}if(ok)ms|=1<<n;});
  const data=(lvl|(slot<<3)|(ms<<9))>>>0;const v=(data|(scCheck(data)<<27))>>>0;
  const h=v.toString(16).toUpperCase().padStart(8,"0");return `DBP-${h.slice(0,4)}-${h.slice(4)}`;}
/* Any input decodes to some game. Eight hex digits are read as the 32 bits directly; anything else is hashed (FNV-1a). */
function fnv1a(str){let h=0x811c9dc5;for(const ch of str){h^=ch.charCodeAt(0);h=Math.imul(h,0x01000193)>>>0;}return h>>>0;}
function decodeSave(code){const raw=String(code||"").trim();const h=raw.toUpperCase().replace(/^DBP/,"").replace(/[^0-9A-F]/g,"");
  const exact=h.length===8&&/^(DBP)?[-\s]*[0-9A-F]{4}[-\s]*[0-9A-F]{4}$/i.test(raw.replace(/^DBP-?/i,"DBP"));
  const v=exact?parseInt(h,16)>>>0:fnv1a(raw.toUpperCase());const data=v&0x7FFFFFF;
  return {lv:Math.min(6,(data&7)+1),t:((data>>>3)&63)*SC_SLOT,ms:(data>>>9)&0x3FFFF,checksumOk:exact&&scCheck(data)===(v>>>27),hashed:!exact};}
/* Perfect-start codes: DBP-PERF-L1 to DBP-PERF-L6 start that level with every earlier level perfect.
   They're reserved words, not 32-bit codes, so normal codes keep their meaning. */
const perfectOf=code=>{const m=/^DBP[-\s]*PERF(?:ECT)?[-\s]*L?([1-6])$/i.exec(String(code||"").trim());return m?+m[1]:0;};
function rebuild(lv,keepName){S=fresh(keepName);startLevelQuiet(1);for(let n=1;n<lv;n++){finishLevel(n);startLevelQuiet(n+1);}
  give("laptop");S.room=lv===1?"closet":FLOOR_ROOM[{2:"3",3:"4",4:"5",5:"6",6:"4"}[lv]]||"f2";if(lv===6)S.room="f4";
  const c=Object.assign({},S);delete c.ckpt;S.ckpt=JSON.stringify(c);}
function restoreFromCode(code){const keep=S&&S.player;const pd=perfectOf(code);
  if(pd){rebuild(pd,keep);save();return {lv:pd,t:0,ms:0,checksumOk:true,hashed:false,perfect:true};}
  const r=decodeSave(code);rebuild(r.lv,keep);
  (MILESTONES[r.lv]||[]).forEach((m,n)=>{if(r.ms&(1<<n)){try{m[2]();}catch(e){}}});
  S.t=START_T[r.lv]+r.t;htTick();
  /* a code can describe a boss who's already convinced: that level is won, so move up */
  const boss=BOSS[r.lv];if(boss&&Object.keys(S.pitch[boss]||{}).length>=3){finishLevel(r.lv);startLevelQuiet(r.lv+1);r.advanced=true;r.lv++;
    const c=Object.assign({},S);delete c.ckpt;S.ckpt=JSON.stringify(c);}
  /* the change window: a code can describe a revoke that already broke prod */
  if(S.lv===6&&!S.pr.v1){if(v1InUseLive())S.dead="down";else if(effKey("recon")==="v1")S.dead="recon";}
  save();return r;}
/* the code for the start of level n, shown on every level screen (same block as Lossy's end-of-day screens) */
function levelCode(n){if(!S)return "";const lv=S.lv,t=S.t;S.lv=n;S.t=Math.max(t,START_T[n]);let c;try{c=encodeSave();}finally{S.lv=lv;S.t=t;}
  return `<span class="lvcode" style="display:block;margin-top:12px;border-top:2px dashed #AAA;padding-top:8px;text-align:left"><b>Your save code</b><span style="display:block;text-align:center;font:30px/1.2 var(--f-term);letter-spacing:.06em;user-select:all" id="sccode">${c}</span>Enter it on the title screen (Enter a save code) to start level ${n} again, on any device. Anyone you give it to can load it too. There's no back end: nothing about your game is stored on a server, so write it down.<span style="display:block;margin-top:6px;text-align:center"><button data-sccopy style="background:#C8C8C8;border:2px solid;border-color:#FFF #555 #555 #FFF;padding:4px 10px;font:15px var(--f-pix);color:#000">Copy code</button></span></span>`;}
function showSaveCode(){const Lr=ML();const w=document.createElement("div");w.className="msgwrap";const code=encodeSave();
  w.innerHTML=`<div class="msg" style="cursor:default" role="dialog" aria-modal="true" aria-label="Save code"><b>Save code</b>\nWrite this down. Entering it on the title screen rebuilds this game: the level, the time (to the nearest 6 minutes) and everything you've done on this level so far. Points are recalculated.\n\n<span style="display:block;text-align:center;font:34px/1.2 var(--f-term);letter-spacing:.06em;user-select:all" id="sccode">${code}</span><div class="btns"><button data-sccopy>Copy</button><button data-scclose>Close</button></div></div>`;Lr.appendChild(w);w.querySelector("[data-sccopy]").focus();}
function askSaveCode(){const Lr=ML();const w=document.createElement("div");w.className="msgwrap";w.id="scask";
  w.innerHTML=`<div class="msg" style="cursor:default" role="dialog" aria-modal="true" aria-label="Enter a save code"><b>Enter a save code</b>\n<form id="scform" style="display:flex;gap:8px;margin-top:8px"><label for="scin" class="sr">Save code</label><input id="scin" placeholder="DBP-XXXX-XXXX" autocomplete="off" spellcheck="false" style="flex:1;min-width:0;font:24px var(--f-term);padding:4px 8px;text-transform:uppercase"><button type="submit">Load</button></form><div id="scerr" role="alert" style="color:#AA0000;min-height:1.4em"></div><div style="font-size:14px;color:#444">Any code loads. A real one rebuilds your game; anything else gives you some game, and maybe not the one you meant.</div><div class="btns"><button data-scclose>Cancel</button></div></div>`;Lr.appendChild(w);try{document.getElementById("scin").focus();}catch(e){}}
document.addEventListener("click",e=>{if(e.target.closest("[data-scclose]")){const w=e.target.closest(".msgwrap");if(w)w.remove();return;}
  if(e.target.closest("[data-sccopy]")){const c=(document.getElementById("sccode")||{}).textContent||"";try{navigator.clipboard.writeText(c).then(()=>flash("Copied "+c),()=>flash(c));}catch(err){flash(c);}return;}
  if(e.target.closest("[data-mn='code']")){clearMsgs();return showSaveCode();}
  if(e.target.closest("[data-tt='code']"))return askSaveCode();});
document.addEventListener("submit",e=>{if(e.target.id!=="scform")return;e.preventDefault();const v=document.getElementById("scin").value;
  if(!v.trim()){document.getElementById("scerr").textContent="Type something. Anything.";return;}
  const nm=document.getElementById("pname");const keepName=nm&&nm.value.trim();if(!S&&keepName)S={player:keepName};
  clearMsgs();const r=restoreFromCode(v);showGame();const L=LV[S.lv];
  if(r.perfect){msgBox(`Perfect start: level ${S.lv}, ${L.name}, ${hhmm(S.t)}.${S.lv>1?` Every earlier level is perfect (score ${S.score} of ${MAXSCORE} so far).`:""}\n\n${nextStep().t}.`);return;}
  const note=r.hashed?`"${v.trim()}" isn't a save code, so it was turned into one (${encodeSave()}). Who knows what you'll get.`:r.checksumOk?"":"That code doesn't check out (a typo, or made up), so this may not be the game you meant. Loaded it anyway.";
  if(S.dead){msgBox(`${note?note+"\n\n":""}It's ${hhmm(S.t)}, and the change you made already broke something.`,null,()=>death(S.dead));return;}
  if(S.f.final){msgBox(`${note?note+"\n\n":""}This code is a finished game.`,null,()=>finish());return;}
  const done=(MILESTONES[S.lv]||[]).filter(m=>{try{return m[1]();}catch(err){return false;}}).length;
  msgBox(`${note?note+"\n\n":"Restored from "+v.trim().toUpperCase()+".\n\n"}${r.advanced?"That boss was already convinced, so you're on the next level.\n\n":""}Level ${S.lv}: ${L.name}, ${hhmm(S.t)}. ${done} of this level's milestones are done. The blue bar shows what's next.`);});
Object.assign(window.GAME,{encodeSave,decodeSave,restoreFromCode,MILESTONES});
