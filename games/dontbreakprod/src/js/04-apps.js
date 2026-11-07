/* ============================== the computer: kiosk or BrickBook, a homemade Windows 3.1 ============================== */
let pcApp="progman",pcKind="kiosk",ggRoute={page:"list"},modal=null;
const WM={wins:[],z:1,drag:null};
const TITLES={progman:"Program Manager",mail:"Mail - Inbox",gg:"GitGuardian",slack:"Slack",vault:"Vault",payrail:"PayRail Dashboard",deploys:"Deploys",batch:"batch-01 (SSH)",clock:"Clock",notepad:"Notepad - RUNBOOK.TXT",sol:"Solitaire"};
function apps(){const L=S.lv;const a=[["mail","Mail",S.mail.filter(m=>!m.read).length],["slack","Slack",slUnread()],["gg","GitGuardian",ggBadge()],["clock","Clock"],["notepad","Notepad"],["sol","Solitaire"]];
  if(pcKind==="laptop"&&L>=6)a.push(["vault","Vault"],["payrail","PayRail"],["deploys","Deploys"],["batch","batch-01 (SSH)"]);return a;}
const ICO={
 mail:["................","................","..wwwwwwwwwwww..","..wkwwwwwwwwkw..","..wwkwwwwwwkww..","..wwwkwwwwkwww..","..wwwwkwwkwwww..","..wwwwwkkwwwww..","..wwwwwwwwwwww..","..wwwwwwwwwwww..","..kkkkkkkkkkkk..","................","....rrr.........","....rrr.........","................","................"],
 gg:["................","......bbbb......","....bbbbbbbb....","...bbBBBBBBbb...","...bBBwwwwBBb...","...bBwwkkwwBb...","...bBwkkkkwBb...","...bBwwkkwwBb...","...bBBwwwwBBb...","....bBBBBBBb....","....bbBBBBbb....",".....bbBBbb.....","......bbbb......",".......bb.......","................","................"],
 vault:["................","..gggggggggggg..","..gGGGGGGGGGGg..","..gG........Gg..","..gG..yyyy..Gg..","..gG.yy..yy.Gg..","..gG.y.kk.y.Gg..","..gG.yy..yy.Gg..","..gG..yyyy..Gg..","..gG........Gg..","..gGGGGGGGGGGg..","..gggggggggggg..","...kk......kk...","................","................","................"],
 deploys:["................",".....GG..GG.....","....GggGGggG....","....GggggggG....","..GGgggkkgggGG..","..GgggkwwkgggG..","...ggkwwwwkgg...","...ggkwwwwkgg...","..GgggkwwkgggG..","..GGgggkkgggGG..","....GggggggG....","....GggGGggG....",".....GG..GG.....","................","................","................"],
 slack:["................","................","..cccccccccc....","..cwwwwwwwwc....","..cwkkwkkwwc....","..cwwwwwwwwc....","..cccccc.ccc....","......cc.ccccccc","......c.ccwwwwwc","........cwkkwkwc","........cwwwwwwc","........ccccc.cc","............c...","................","................","................"],
 payrail:["................","................","..kkkkkkkkkkkk..",".kBBBBBBBBBBBBk.",".kBBBBBBBBBBBBk.",".kkkkkkkkkkkkkk.",".kwwwwwwwwwwwwk.",".kwyywwwwwwwwwk.",".kwyywwkkkkwwwk.",".kwwwwwwwwwwwwk.","..kkkkkkkkkkkk..","................","................","................","................","................"],
 batch:["................",".kkkkkkkkkkkkkk.",".kGGGGGGGGGGGGk.",".kG..........Gk.",".kG.l........Gk.",".kG..l.......Gk.",".kG.l..lll...Gk.",".kG..........Gk.",".kG..........Gk.",".kGGGGGGGGGGGGk.",".kkkkkkkkkkkkkk.","......kkkk......","....kkkkkkkk....","................","................","................"],
 clock:["................",".....kkkkkk.....","...kkwwwwwwkk...","..kwwwwkwwwwwk..","..kwwwwkwwwwwk..",".kwwwwwkwwwwwwk.",".kwwwwwkwwwwwwk.",".kwwwwwkkkkkwwk.",".kwwwwwwwwwwwwk.",".kwwwwwwwwwwwwk.","..kwwwwwwwwwwk..","..kwwwwwwwwwwk..","...kkwwwwwwkk...",".....kkkkkk.....","................","................"],
 notepad:["................","...kkkkkkkkk....","...kwwwwwwwkk...","...kwkkkkkwwkk..","...kwwwwwwwwwk..","...kwkkkkkkkwk..","...kwwwwwwwwwk..","...kwkkkkwwwwk..","...kwwwwwwwwwk..","...kwkkkkkkkwk..","...kwwwwwwwwwk..","...kkkkkkkkkkk..","................","................","................","................"],
 sol:["................","..kkkkkkk.......","..kwwwwwk.......","..kwrwwwk.......","..kwrrwwkkkkkk..","..kwwrwwkwwwwk..","..kwwwwwkwkwwk..","..kkkkkkkwkkwk..","........kwwkwk..","........kwwwwk..","........kkkkkk..","................","................","................","................","................"]};
const ICOPAL={k:"#000",w:"#fff",g:"#808080",G:"#C0C0C0",b:"#000080",B:"#0000FF",r:"#FF0000",y:"#FFFF00",c:"#008080",l:"#00FF00"};
function icoSVG(k){const m=ICO[k]||ICO.notepad;let r="";m.forEach((row,y)=>{for(let x=0;x<16;x++){const c=ICOPAL[row[x]];if(c)r+=`<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`;}});
  return `<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;}
function groups(){const have=new Set(apps().map(a=>a[0]));const b=Object.fromEntries(apps().map(a=>[a[0],a[2]||0]));
  const G=[["Main",[["mail","Mail"],["slack","Slack"],["notepad","Notepad"],["clock","Clock"],["sol","Solitaire"]]],["Secruity Toolz",[["gg","GitGuardian"],["vault","Vault"]]],
           ["Prod (CHANGE WINDOW ONLY)",[["deploys","Deploys"],["batch","batch-01 (SSH)"]]],["Vendors",[["payrail","PayRail"]]]];
  return G.map(([n,items])=>[n,items.filter(([k])=>have.has(k)).map(([k,l])=>[k,l,b[k]||0])]).filter(g=>g[1].length);}
const isPhone=()=>matchMedia("(max-width:600px)").matches;
function openWin(app){if(app==="batch")return openTerm("batch");pcApp=app;let w=WM.wins.find(x=>x.app===app);if(app==="gg"&&!w)ggRoute={page:"list",fresh:true};
  if(!w){const n=WM.wins.filter(x=>x.app!=="progman").length;const small={clock:[58,50,34,34],sol:[22,62,40,30]}[app];const [x,y,ww,hh]=small||[4+(n*4)%24,3+(n*5)%30,90,88];w={app,x,y,w:ww,h:hh,max:false,min:false,z:0};WM.wins.push(w);}
  w.min=false;w.z=++WM.z;}
function closeWin(app){WM.wins=WM.wins.filter(w=>w.app!==app);if(modal)modal=null;closeWinFocus();}
function closeWinFocus(){const top=WM.wins.filter(w=>!w.min).sort((a,b)=>b.z-a.z)[0];pcApp=top?top.app:"progman";}
function ensureProgman(){if(!WM.wins.some(w=>w.app==="progman"))WM.wins.unshift({app:"progman",x:4,y:4,w:64,h:64,max:false,min:false,z:0});}
function openPC(app,kind){if(kind)pcKind=kind;if(app==="batch")return openTerm("batch");if(pcKind==="kiosk")WM.wins=WM.wins.filter(w=>apps().some(a=>a[0]===w.app)||w.app==="progman");
  if(app==="gg"){ggRoute={page:"list",fresh:true};}if(app)openWin(app);else if(!WM.wins.some(w=>w.app!=="progman"))openWin("gg");renderPC();}
function openLaptop(app){if(!has("laptop"))return say("You don't have a laptop. Yet. The help desk on B1 has a cage full of them.");openPC(app||null,"laptop");}
function closePC(){PL().innerHTML="";modal=null;verb="hand";heldItem=null;iconbar();draw();if(S.dead)return death(S.dead);}
function pcAct(fn){const out=fn()||{};advance(out.min||1);if(S.dead){PL().innerHTML="";return death(S.dead);}renderPC();if(out.toast)flash(out.toast+(out.p?` (+${out.p} points)`:""));if(out.msg)say(out.msg,out.p,out.who);}
function winHTML(w){const act=w.app===pcApp,t=TITLES[w.app]||w.app;const badge=(apps().find(a=>a[0]===w.app)||[])[2];
  return `<section class="win${act?" act":""}${w.max?" max":""}${w.min?" minz":""}" style="left:${w.x}%;top:${w.y}%;width:${w.w}%;height:${w.h}%;z-index:${w.z}" data-win="${w.app}" role="dialog" aria-label="${esc(t)}" aria-modal="false">
   <header class="tb" data-drag="${w.app}"><button class="ctl" data-wclose="${w.app}" aria-label="Close ${esc(t)}" title="Close"><i></i></button><span class="tt">${esc(t)}${badge?` (${badge})`:""}</span><button class="tbb" data-wmin="${w.app}" aria-label="Minimize ${esc(t)}" title="Minimize">▼</button><button class="tbb" data-wmax="${w.app}" aria-label="${w.max?"Restore":"Maximize"} ${esc(t)}" title="${w.max?"Restore":"Maximize"}">${w.max?"⬍":"▲"}</button></header>
   ${w.app==="progman"?`<div class="mbar" aria-hidden="true"><span>File</span><span>Options</span><span>Window</span><span>Help</span></div>`:`<div class="mbar"><button data-wclose="${w.app}">File: Exit</button><button data-wrestore="progman">Window: Program Manager</button><span aria-hidden="true">Help</span></div>`}
   <div class="wbody app">${(APPS[w.app]||APPS.notepad)()}</div></section>`;}
function renderPC(){const Lr=PL();updateBar();ensureProgman();WM.wins=WM.wins.filter(w=>w.app==="progman"||apps().some(a=>a[0]===w.app));
  if(!WM.wins.some(w=>w.app===pcApp&&!w.min))closeWinFocus();
  const phone=isPhone();const vis=WM.wins.filter(w=>!w.min);const mins=WM.wins.filter(w=>w.min);const lap=pcKind==="laptop";
  Lr.innerHTML=`<div class="pc" id="pcroot"><div class="bezel${lap?" brick":""}"><div class="screenpc w31" id="w31">
   <div class="desk" id="desk">${vis.filter(w=>!phone||w.app===pcApp).map(winHTML).join("")}
    <div class="minicons">${mins.map(w=>`<button class="icon mini" data-wrestore="${w.app}" aria-label="Restore ${esc(TITLES[w.app])}">${icoSVG(w.app==="progman"?"notepad":w.app)}<span>${esc(TITLES[w.app])}</span></button>`).join("")}</div>
    <div class="deskfoot">Simulation for training. No real systems are contacted. · ${esc(S.gg)} · ${hhmm(S.t)}</div>
    ${modal?MODALS[modal.k](modal):""}</div></div>
   <span class="brand">${lap?"BRICKBOOK 9000 · REFURBISHED TWICE · PROPERTY OF B1":"PRECARIUM KIOSK 3000 · LOGS OUT EVERY 4 MIN"}</span><button class="off" data-pcclose>${lap?"Close the laptop":"Turn away from the screen"}</button></div></div>`;
  enhanceTabs(document.getElementById("w31"));
  const b=document.querySelector(`.win.act .wbody`);if(b&&WM.scroll&&WM.scroll.app===pcApp)b.scrollTop=WM.scroll.top;}
document.addEventListener("pointerdown",e=>{const win=e.target.closest(".win");if(!win||!document.getElementById("w31"))return;const app=win.dataset.win;
  if(app!==pcApp){const w=WM.wins.find(x=>x.app===app);if(w){w.z=++WM.z;pcApp=app;document.querySelectorAll(".win").forEach(el=>el.classList.toggle("act",el===win));win.style.zIndex=w.z;}}
  const tb=e.target.closest(".tb");if(!tb||e.target.closest("button")||isPhone())return;const w=WM.wins.find(x=>x.app===app);if(!w||w.max)return;
  const desk=document.getElementById("desk").getBoundingClientRect();WM.drag={w,el:win,sx:e.clientX,sy:e.clientY,ox:w.x,oy:w.y,dw:desk.width,dh:desk.height};e.preventDefault();});
document.addEventListener("pointermove",e=>{const d=WM.drag;if(!d)return;d.w.x=Math.max(-d.w.w+10,Math.min(95,d.ox+(e.clientX-d.sx)*100/d.dw));d.w.y=Math.max(0,Math.min(92,d.oy+(e.clientY-d.sy)*100/d.dh));d.el.style.left=d.w.x+"%";d.el.style.top=d.w.y+"%";});
document.addEventListener("pointerup",()=>{WM.drag=null;});
document.addEventListener("scroll",e=>{const b=e.target&&e.target.classList&&e.target.classList.contains("wbody")?e.target:null;if(b){const w=b.closest(".win");if(w)WM.scroll={app:w.dataset.win,top:b.scrollTop};}},true);
document.addEventListener("click",e=>{if(!document.getElementById("w31"))return;const b=e.target.closest("[data-wclose],[data-wmin],[data-wmax],[data-wrestore],[data-pc],[data-pcclose]");if(!b)return;const d=b.dataset;
  if(d.pcclose!==undefined)return closePC();
  if(d.pc){if(d.pc==="batch")return openTerm("batch");openWin(d.pc);return renderPC();}
  if(d.wclose){if(d.wclose==="progman")return closePC();closeWin(d.wclose);return renderPC();}
  if(d.wmin){const w=WM.wins.find(x=>x.app===d.wmin);if(w){w.min=true;closeWinFocus();}return renderPC();}
  if(d.wmax){const w=WM.wins.find(x=>x.app===d.wmax);if(w){w.max=!w.max;w.z=++WM.z;pcApp=w.app;}return renderPC();}
  if(d.wrestore){openWin(d.wrestore);return renderPC();}});
/* tabs that behave like tabs */
function enhanceTabs(root){if(!root)return;root.querySelectorAll(".tabs").forEach(tl=>{const btns=[...tl.querySelectorAll(":scope > button")];if(!btns.length)return;
  tl.setAttribute("role","tablist");tl.classList.add("tabset");const sel=btns.find(b=>b.getAttribute("aria-pressed")==="true")||btns[0];
  btns.forEach(b=>{b.setAttribute("role","tab");b.setAttribute("aria-selected",String(b===sel));b.removeAttribute("aria-pressed");b.tabIndex=b===sel?0:-1;});});}

/* ============================== app actions ============================== */
const ACT={};
document.addEventListener("click",e=>{const b=e.target.closest("[data-act]");if(!b||!S||!document.getElementById("w31"))return;e.preventDefault();const [k,...rest]=b.dataset.act.split(":");const a=ACT[k];if(a)a(rest.join(":"),b);});
document.addEventListener("submit",e=>{const f=e.target.closest("form[data-actform]");if(!f)return;e.preventDefault();const a=ACT[f.dataset.actform];if(a)a(f);});
const pill=(t,c)=>`<span class="pill ${c}">${t}</span>`;
const mwrap=(h,body,btns)=>`<div class="modalbg"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(h)}"><h2>${h}</h2>${body}<div class="row">${btns}</div></div></div>`;
ACT.close=()=>{modal=null;renderPC();};
ACT.modal=k=>{const [n,id]=k.split(":");modal=id?{k:n,id:+id}:{k:n};renderPC();};

/* ----- progman, clock, sol ----- */
const APPS={};
APPS.progman=()=>`<div class="pm">${groups().map(([n,items])=>`<div class="grpwin" role="group" aria-label="${esc(n)}"><div class="gt">${esc(n)}</div><div class="icons">${items.map(([k,l,b])=>`<button class="icon" data-pc="${k}">${icoSVG(k)}<span>${esc(l)}</span>${b?`<i class="nb">${b}<span class="sr"> new</span></i>`:""}</button>`).join("")}</div></div>`).join("")}</div>`;
APPS.clock=()=>`<div class="w31clock"><div class="dig">${hhmm(S.t)}</div><div>Friday</div><div class="hint">Time moves when you do something.</div></div>`;
APPS.sol=()=>`<div class="w31sol"><div class="msgbox"><b>Solitaire</b><p>Disabled by your system administrator.</p><p style="font-size:12px">(Marisol, after the last audit.)</p></div></div>`;

/* ----- mail ----- */
let mailSel=null;
APPS.mail=()=>{const list=S.mail.slice().reverse();const m=S.mail.find(x=>x.id===mailSel)||list[0];if(m&&!m.read){m.read=true;mailRead(m);}
  const body=m?(MAILHTML[m.id]?MAILHTML[m.id]():`<div style="white-space:pre-wrap;font-size:14px;max-width:62ch">${esc(m.body)}</div>`):"No mail.";
  return `<div class="mail"><div class="list">${list.map(x=>`<button class="item ${x.read&&x!==m?"":"unread"}" data-act="mail:${x.id}" aria-current="${x===m}"><b>${esc(x.from)}</b><span>${esc(x.subj)}</span><small>Fri ${x.time}</small></button>`).join("")}</div><div class="read">${m?`<h2 style="margin:0;font:600 18px var(--f-ui)">${esc(m.subj)}</h2><div style="color:#545C6E;font-size:13px">From ${esc(m.from)} · ${m.time}</div>${body}`:body}</div></div>`;};
ACT.mail=id=>{mailSel=id;renderPC();};
ACT.mailgg=id=>{openWin("gg");if(id==="list"){ggRoute={page:"list",fresh:true};return renderPC();}if(id==="ht"){S.f.htSeen=true;ggRoute={page:"honeytokens",fresh:true};return renderPC();}ACT.open(id);};
function mailRead(m){if(m.id==="bounce"){S.f.sawBounce=true;const p=award("mail");if(p)setTimeout(()=>flash(`Hal's mailbox has been eating GitGuardian alerts (+${p} points)`),30);}}

/* ----- chat (read-only war room) ----- */
const CHATCOL={ingrid:"#555555",juni:"#006B6B",kenji:"#006B00",wendell:"#0000AA",marisol:"#AA00AA",victor:"#000000",harriet:"#AA0000"};
function chatLines(){const L=[];const m=(who,t)=>L.push([who,t]);
  m("wendell","PSA: GitGuardian checks are on for every Payments PR. If it flags you, fix it, don't --no-verify it. Thanks Juni for the push.");
  if(S.lv>=3)m("kenji","if anyone needs me i'm the beanbag");
  if(S.lv>=4)m("ingrid","Reminder: CHANGE FREEZE until close. Exceptions need Harriet.");
  if(S.lv>=6){m("ingrid",`Change window open. ${first()} is driving the PayRail rotation. Runbook pinned. Nobody else touches payments.`);
    m("juni","watching checkout-api logs. go when ready");
    if(S.pr.v2)m("juni","new key exists, old one still active. good, keep it that way for now");
    if(S.vault.default.includes("v2")&&vaultProd()!=="v2")m("kenji","heads up: you wrote the new version to the DEFAULT environment. prod reads kv/payments/payrail in production. nothing will pick that up");
    if(vaultProd()==="v2")m("kenji","vault production now has version 2. services pick it up on restart");
    if(effKey("checkout")==="v2")m("juni","checkout-api restarted, using …r2Xq. payments still flowing ✅");
    if(effKey("payouts")==="v2")m("juni","payouts-worker on the new key too");
    if(effKey("checkout")==="v1"&&S.f.restartedCheckout)m("juni","checkout-api restarted but it's still on …7Qd. vault production must still have the old version?");
    if(S.c.recon==="vault")m("kenji","recon-batch crontab reads from vault now. it runs at 2 AM, so we won't see it in traffic before then");
    if(S.f.quiet)m("ingrid","PayRail shows zero live traffic on the old key. Your call.");
    if(!S.pr.v1)m("ingrid","Old key revoked. Dashboards green.");
    if(S.f.final)m("victor","👍");}
  return L;}

/* ----- notepad: the runbook puzzle ----- */
const RB=[["new","Create a new PayRail key. Keep the old key active."],["vault","Write the new key to Vault as a new version, production environment."],["move","Move every consumer: restart checkout-api and payouts-worker, fix recon-batch's crontab."],["quiet","Confirm the old key has no live traffic and no scheduled jobs left on it."],["revoke","Revoke the old key in PayRail."],["verify","Check validity in GitGuardian (should be Invalid) and resolve the incident."]];
const RBWHY={revoke:"Revoking before everything has moved is the classic rotation outage. Cloudflare R2, March 2025.",verify:"GitGuardian will still say Valid until the old key is actually revoked.",quiet:"There's nothing to confirm yet: nothing has moved.",move:"Consumers need somewhere to get the new key from first.",vault:"There's no new key to store yet."};
const RBMIX=["move","revoke","new","verify","quiet","vault"];
APPS.notepad=()=>{if(S.lv<3||!S.f.map3)return `<textarea class="w31note" aria-label="TODO.TXT" spellcheck="false">TODO.TXT (left by Hal)
---------------------
- read the GitGuardian alerts (where do they go??)
- figure out who owns the PayRail key
- rotation runbook (later)
- buy a chair</textarea>`;
  const done=S.f.runbook?RB.map(x=>x[0]):(S.rbPick||[]);
  return `<div style="padding:14px 16px;display:grid;gap:10px;background:#fff;min-height:100%"><b style="font:600 15px var(--f-ui)">RUNBOOK.TXT · Rotate the PayRail live key (#2871)</b>
   <div style="font-size:13px;color:#545C6E">${S.f.runbook?"Saved. Ingrid will want to see this.":"Click the steps in the order you'd do them tonight. GitGuardian's remediation workflow (Remediation tab on #2871) is a good guide."}</div>
   <ol class="steps">${done.map(k=>`<li class="done"><div><b>${esc(RB.find(x=>x[0]===k)[1])}</b></div></li>`).join("")}</ol>
   ${S.f.runbook?"":`<div style="display:grid;gap:6px">${RBMIX.filter(k=>!done.includes(k)).map(k=>`<button class="btn" style="text-align:left" data-act="rb:${k}">${esc(RB.find(x=>x[0]===k)[1])}</button>`).join("")}</div>${done.length?'<div><button class="btn" data-act="rbreset">Start over</button></div>':""}`}
   <div style="font-size:12.5px;color:#545C6E">Rollback: point Vault production back at version 1 and restart. Only possible while the old key is still active.</div></div>`;};
ACT.rb=k=>{const pick=S.rbPick||(S.rbPick=[]);const want=RB[pick.length][0];
  if(k!==want){S.rbPick=[];renderPC();return say(`Not yet. ${RBWHY[k]||"That step comes later."}\n\nThe runbook starts over.`);}
  pick.push(k);if(pick.length===RB.length){S.f.runbook=true;give("runbook");pcAct(()=>({toast:"Runbook saved",p:award("runbook")}));}else renderPC();};
ACT.rbreset=()=>{S.rbPick=[];renderPC();};

const MODALS={
 htnew:()=>mwrap("Create honeytoken",`<form id="htform" data-actform="htnew" style="display:grid;gap:10px"><label for="htname" style="display:grid;gap:4px">Name<input type="text" id="htname" value="aws-docs-example"></label><label style="display:grid;gap:4px">Type<select id="httype"><option>AWS</option></select></label><div class="xs">GitGuardian generates a real-looking AWS key with no permissions. Any attempt to use it is logged with the source IP and user agent.</div><div class="row"><button type="button" class="btn" data-act="close">Cancel</button><button class="btn pri" type="submit">Create</button></div></form>`,""),
 prnew:()=>mwrap("Create secret key",`<div>How should the existing live key behave?</div><label><input type="radio" name="prmode" id="prkeep" value="keep" checked> <span><b>Keep the existing key active</b><br><span class="xs">Both keys work until you revoke the old one.</span></span></label><label><input type="radio" name="prmode" id="prroll" value="roll"> <span><b>Roll key: expire the existing key immediately</b><br><span class="xs">The old key stops working now.</span></span></label>`,`<button class="btn" data-act="close">Cancel</button><button class="btn pri" data-act="prcreate">Create key</button>`),
 vwrite:()=>mwrap("Create new version · kv/payments/payrail",`<label for="venv" style="display:grid;gap:4px">Environment<select id="venv"><option value="default">default</option><option value="production">production</option></select></label><label for="vval" style="display:grid;gap:4px">api_key<select id="vval"><option value="v2">${K2} (from PayRail)</option><option value="v1">${K1} (the leaked one)</option></select></label><div class="xs">Writes a new version. Older versions stay available for rollback.</div>`,`<button class="btn" data-act="close">Cancel</button><button class="btn pri" data-act="vsave">Save</button>`),
 revoke:m=>mwrap("Revoke "+(m.key==="v1"?K1:K2)+"?",`<div class="errbox">Requests using this key will fail immediately. This can't be undone.</div><div class="xs">Live traffic on this key right now: <b>${m.key==="v1"?v1rpm():v2rpm()} requests/min</b>.</div>`,`<button class="btn" data-act="close">Cancel</button><button class="btn danger" data-act="prrevoke:${m.key}">Revoke key</button>`)};

/* ----- PayRail (vendor console) ----- */
const v1rpm=()=>(effKey("checkout")==="v1"?820:0)+(effKey("payouts")==="v1"?410:0);
const v2rpm=()=>(effKey("checkout")==="v2"?820:0)+(effKey("payouts")==="v2"?410:0);
function lastUsed(k){const live=k==="v1"?v1rpm():v2rpm();if(live)return "just now";if(k==="v1")return "yesterday 2:00 AM · 10.4.2.17 (batch-01)";return "never";}
APPS.payrail=()=>{if(S.pr.v2&&S.pr.v1&&!v1rpm()&&!S.f.quiet){S.f.quiet=true;award("quiet");}
  const row=(k,lab,created)=>{const alive=k==="v1"?S.pr.v1:S.pr.v2;const rpm=k==="v1"?v1rpm():v2rpm();return `<tr><td class="mono">${lab}</td><td>${created}</td><td>${alive?pill("Active","p-res"):pill("Revoked","p-ign")}</td><td><b>${alive?rpm:0}</b> req/min</td><td class="xs">${alive?lastUsed(k):"—"}</td><td>${alive?`<button class="btn danger" data-act="prrev:${k}">Revoke</button>`:""}</td></tr>`;};
  return `<div class="ap"><h1>PayRail · Developers · API keys</h1><div class="xs">Merchant acct_PRC_88412 · Live mode</div>
   <div class="card" style="padding:0"><div class="tw"><table class="t"><tr><th>Secret key</th><th>Created</th><th>Status</th><th>Live traffic</th><th>Last used</th><th></th></tr>${row("v1",K1,"2024-09-12")}${S.pr.v2?row("v2",K2,"Today"):""}</table></div></div>
   ${S.pr.v2?"":`<div><button class="btn pri" data-act="modal:prnew">+ Create secret key</button></div>`}
   <div class="xs">Live traffic is the last 5 minutes. Scheduled jobs only show up when they run. Section 14.2 of your merchant agreement: compromised keys must be rotated within 72 hours of discovery.</div></div>`;};
ACT.prcreate=()=>{const roll=document.getElementById("prroll")&&document.getElementById("prroll").checked;modal=null;
  if(roll){S.pr.v2=true;S.pr.v1=false;die("rollnow");return pcAct(()=>({}));}
  pcAct(()=>{S.pr.v2=true;return {toast:"New key created. The old key still works.",p:award("newkey")};});};
ACT.prrev=k=>{if(k==="v2")return say("That's the new key. Revoking it would take everything down the moment you finish migrating. Leave it.");modal={k:"revoke",key:k};renderPC();};
ACT.prrevoke=k=>{modal=null;S.pr.v1=false;if(v1InUseLive()){die("down");return pcAct(()=>({}));}
  if(effKey("recon")==="v1"){pcAct(()=>({toast:"Old key revoked. Dashboards green."}));return setTimeout(()=>{PL().innerHTML="";msgBox("11:42 PM. Dashboards are green. Juni posts a thumbs up. You close the BrickBook and go home.\n\n...\n\n2:00 AM. Your phone rings.",null,()=>{die("recon");death("recon");});},300);}
  pcAct(()=>({toast:"Old key revoked. Nothing broke.",p:award("revoke")}));};

/* ----- Vault ----- */
APPS.vault=()=>{const P=S.vault.production,Dd=S.vault.default,cur=vaultProd();const val=v=>v==="v2"?K2:K1;
  const nav=`<nav><b>Vault</b><span>Secrets engines</span><button class="vnav on" aria-current="page">kv/payments/payrail</button><span>kv/payments/legacy</span><span>Policies</span></nav>`;
  return `<div class="vt">${nav}<main><div class="crumb">kv / payments / payrail</div><div class="hdr"><h1 style="margin:0;font:600 22px var(--f-ui)">payrail</h1><button class="btn" data-act="vnew" ${S.pr.v2?"":"disabled"}>Create new version</button></div>
   ${S.pr.v2?"":'<div style="font-size:12.5px;color:#545C6E">Create a new credential at the provider first.</div>'}
   <div class="card"><h3>Current version: ${P.length} · production</h3><dl class="kv"><dt>Key</dt><dd class="mono">api_key</dd><dt>Value</dt><dd class="mono">${val(cur)}  <span style="color:#545C6E">(${cur==="v1"?"the old key"+(S.pr.v1?"":", revoked"):"the new key"})</span></dd></dl></div>
   <div class="card"><h3>Version history · production</h3><div class="tw"><table class="t"><tr><th>Version</th><th>Value</th><th>Created</th></tr>${P.map((v,n)=>`<tr><td>${n+1}</td><td class="mono">${val(v)}</td><td>${n===0?"2024-09-12":"today"}</td></tr>`).reverse().join("")}</table></div></div>
   <div class="card"><h3>Environment: default</h3>${Dd.length?`<div class="tw"><table class="t"><tr><th>Version</th><th>Value</th></tr>${Dd.map((v,n)=>`<tr><td>${n+1}</td><td class="mono">${val(v)}</td></tr>`).join("")}</table></div>`:""}<div style="font-size:12.5px;color:#545C6E">Nothing reads the default environment.</div></div>
   <div class="card"><h3>Consumers reading this path</h3><div>checkout-api (production, at startup)</div><div>payouts-worker (production, at startup)</div>${S.c.recon==="vault"?"<div>recon-batch (production, at run time)</div>":""}</div></main></div>`;};
ACT.vnew=()=>{if(!S.pr.v2)return say("You don't have a new key to store yet. Create one in PayRail first.");modal={k:"vwrite"};renderPC();};
ACT.vsave=()=>{const env=document.getElementById("venv").value,val=document.getElementById("vval").value;modal=null;
  pcAct(()=>{S.vault[env].push(val);if(env==="production"&&val==="v2")return {toast:"Version saved to production",p:award("vault")};if(val==="v1")return {toast:"Saved the old key again. That doesn't rotate anything."};return {toast:"Saved to the default environment"};});};

/* ----- Deploys ----- */
APPS.deploys=()=>{const r=(k,n,how)=>`<tr><td><b>${n}</b><div class="xs">${how}</div></td><td class="mono">${effKey(k)==="v2"?K2:K1}</td><td>${S.pr.v1||effKey(k)==="v2"?pill("Healthy","p-res"):pill("Failing","p-trig")}</td><td><button class="btn" data-act="restart:${k}">Restart (rolling)</button></td></tr>`;
  return `<div class="ci"><div class="rh"><h1>Deploys · payments · production</h1></div><main><div class="card" style="padding:0"><div class="tw"><table class="t"><tr><th>Service</th><th>PAYRAIL_KEY loaded</th><th>Health</th><th></th></tr>${r("checkout","checkout-api","reads Vault kv/payments/payrail (production) at startup")}${r("payouts","payouts-worker","reads Vault kv/payments/payrail (production) at startup")}
   <tr><td><b>recon-batch</b><div class="xs">cron on batch-01, 2:00 AM · not managed here</div></td><td class="mono">${S.c.recon==="vault"?"from Vault at run time":K1+" (pasted in crontab)"}</td><td>${pill("Scheduled","p-tag")}</td><td><button class="btn" data-pc="batch">SSH to batch-01</button></td></tr></table></div></div>
   ${S.f.deployLog?`<div class="run">${S.f.deployLog.map(l=>`<div class="${/OK|healthy/.test(l)?"ok":/still/.test(l)?"bad":""}">${esc(l)}</div>`).join("")}</div>`:""}</main></div>`;};
ACT.restart=k=>pcAct(()=>{const v=vaultProd();S.c[k]=v;if(k==="checkout")S.f.restartedCheckout=true;const n=k==="checkout"?"checkout-api":"payouts-worker";
  S.f.deployLog=[`$ rollout restart deploy/${n} -n payments`,`pods 1/3 ... 2/3 ... 3/3 ready`,`PAYRAIL_KEY loaded: ${v==="v2"?K2:K1}`,v==="v2"?`${n} healthy OK`:`${n} is still on the old key: Vault production has no new version`];
  let p=0;if(effKey("checkout")==="v2"&&effKey("payouts")==="v2")p=award("deploy");return {min:3,toast:v==="v2"?`${n} restarted on the new key`:`${n} restarted, but it loaded the OLD key`,p};});

/* ============================== the editor (nano, simplified) for hands-on config changes ============================== */
let ED=null;
const FILES={
 precommit:{host:"juni@juni-mbp",path:"~/src/payments-api/.pre-commit-config.yaml",helper:"Replace secretsniff with the ggshield hook",
  text:`repos:\n  - repo: https://github.com/acme-oss/secretsniff\n    rev: v0.9.1\n    hooks:\n      - id: secretsniff\n        args: ["--entropy", "3.0"]   # TODO tune this (Teo, 2023)\n  - repo: https://github.com/psf/black\n    rev: 24.4.2\n    hooks:\n      - id: black\n`,
  fix:t=>t.replace(/  - repo: https:\/\/github.com\/acme-oss\/secretsniff[\s\S]*?(?=  - repo: https:\/\/github.com\/psf)/,`  - repo: https://github.com/gitguardian/ggshield\n    rev: v1.x.x   # pin the current release\n    hooks:\n      - id: ggshield\n        language_version: python3\n        stages: [pre-commit]\n`),
  ok:t=>/github\.com\/gitguardian\/ggshield/i.test(t)&&/id:\s*ggshield/.test(t)&&!/secretsniff/.test(t),
  bad:t=>/secretsniff/.test(t)?"secretsniff is still in there. Replace that whole hook, not just add another one.":"The hook needs repo https://github.com/gitguardian/ggshield and id: ggshield.",
  done:()=>{S.f.hook=true;const p=award("hook");return ["Saved. Juni runs git commit.","ggshield secret scan ........ Passed (0.4s)","","She tries a commit she'd stashed last week:","ggshield found 1 secret: AWS Keys in scripts/backfill.sh","","Juni stares. \"That's a real key. Secretsniff missed it and flagged my cat.\" She removes it and commits again: Passed.",`[+${p} points]  Talk to Juni again about the PayRail key.`];}},
 ggscout:{host:"kenji@ops-tools",path:"/etc/ggscout/config.toml",helper:"Uncomment the vault-prod source",
  text:`# ggscout: collects the secrets inventory for GitGuardian NHI governance (simulated config)\n[gitguardian]\napi_url = "https://api.gitguardian.com"\ntoken = "\${GGSCOUT_TOKEN}"\n\n[sources.k8s-prod]\ntype = "k8s"\ncontext = "prod"\n\n# TODO turn on after CAB (Teo, 2024)\n# [sources.vault-prod]\n# type = "hashicorpvault"\n# vault_address = "https://vault.precarium.internal:8200"\n# mode = "read/write"\n\n# cron: * * * * *  ggscout fetch-and-send config.toml\n`,
  fix:t=>t.replace(/# \[sources\.vault-prod\]\n# type = "hashicorpvault"\n# vault_address = "([^"]+)"\n# mode = "read\/write"/,'[sources.vault-prod]\ntype = "hashicorpvault"\nvault_address = "$1"\nmode = "read/write"'),
  ok:t=>/^\[sources\.vault-prod\]\s*$/m.test(t)&&/^type = "hashicorpvault"\s*$/m.test(t)&&/^vault_address = "https:\/\/vault\.precarium\.internal:8200"\s*$/m.test(t)&&/^\[sources\.k8s-prod\]\s*$/m.test(t),
  bad:t=>!/^\[sources\.k8s-prod\]\s*$/m.test(t)?"Kenji said not to touch the k8s-prod source. It needs to stay as it was.":"The vault-prod source is still commented out. Remove the # from its four lines.",
  done:()=>{S.f.scout=true;const p=award("scout");return ["Saved /etc/ggscout/config.toml","ggscout fetch-and-send config.toml","source k8s-prod ............ 214 secrets","source vault-prod .......... 1,086 secrets","inventory sent to GitGuardian (hashes and metadata only)","",`[+${p} points]  Re-open #2871's exploration map in GitGuardian.`];}},
 recon:{host:"you@batch-01",path:"crontab -e",helper:"Read PAYRAIL_KEY from Vault instead of the pasted key",
  text:`# m h  dom mon dow   command\n0 2 * * * PAYRAIL_KEY=${K1} /opt/recon/run.sh --since yesterday   # temporary - Teo\n30 2 * * * /opt/recon/report.sh | mail -s "recon" finance-ops@precarium.io\n`,
  fix:t=>t.replace(/PAYRAIL_KEY=sk_live_\S+/,"PAYRAIL_KEY=$(vault kv get -field=api_key kv/payments/payrail)").replace(/\s+# temporary - Teo/,""),
  ok:t=>!/sk_live_/.test(t)&&/vault kv get[^\n]*kv\/payments\/payrail/.test(t)&&/\/opt\/recon\/run\.sh/.test(t),
  bad:t=>/sk_live_/.test(t)?"There's still a sk_live_ key pasted in the crontab.":!/\/opt\/recon\/run\.sh/.test(t)?"You deleted the job itself. Finance needs recon to run.":"PAYRAIL_KEY should come from: vault kv get -field=api_key kv/payments/payrail",
  done:()=>{S.c.recon="vault";const p=award("recon");return ["crontab: installing new crontab","recon-batch will read the key from Vault production at 2:00 AM.",`[+${p} points]`];}}};
function openEditor(k,from){if(k==="recon"&&S.c.recon==="vault"){return say("recon-batch's crontab already reads from Vault.");}
  const f=FILES[k];ED={k,buf:f.text,msg:"",out:null,from:from||null};renderEditor();}
function renderEditor(){const f=FILES[ED.k];const Lr=PL();
  if(ED.out){Lr.innerHTML=`<div class="term" id="pcroot"><div class="crt"><div class="scr" tabindex="0">${[`${f.host}$ `+(ED.k==="recon"?"crontab -e":"nano "+f.path),...ED.out].map(l=>`<div class="ln">${esc(l)}</div>`).join("")}</div><div class="chips"><button data-ed="exit">Done</button></div></div></div>`;return;}
  Lr.innerHTML=`<div class="term" id="pcroot"><div class="crt nano"><div class="nbar"><span>GNU nano 7.2</span><span>${esc(f.path)}</span><span>${f.host}</span></div><textarea id="nanobuf" spellcheck="false" aria-label="Edit ${esc(f.path)}">${esc(ED.buf)}</textarea><div class="nmsg" role="status">${esc(ED.msg)}</div>
   <div class="nkeys"><button data-ed="save"><b>^O</b>Save</button><button data-ed="exit"><b>^X</b>Exit</button><button class="helper" data-ed="help">${esc(f.helper)}</button></div></div><button class="walkaway" data-ed="exit">Walk away</button></div>`;
  const ta=document.getElementById("nanobuf");if(ta)try{ta.focus({preventScroll:true});}catch(e){}}
document.addEventListener("click",e=>{const b=e.target.closest("[data-ed]");if(!b||!ED)return;const ta=document.getElementById("nanobuf");if(ta)ED.buf=ta.value;const f=FILES[ED.k];const a=b.dataset.ed;
  if(a==="help"){ED.buf=f.fix(ED.buf);ED.msg="[ helper edited the line for you; read it, then ^O to save ]";return renderEditor();}
  if(a==="save"){if(f.ok(ED.buf)){advance(2);ED.out=f.done();return renderEditor();}ED.msg="[ "+f.bad(ED.buf)+" ]";return renderEditor();}
  if(a==="exit"){const from=ED.from,done=!!ED.out,k=ED.k;ED=null;PL().innerHTML="";if(from){openTerm(from);if(done)tsay(k==="recon"?["crontab: installing new crontab"]:["ggscout restarted with the Vault source on."],"note"),renderTerm();}else{iconbar();draw();}}});
document.addEventListener("keydown",e=>{if(!ED||ED.out)return;if(e.ctrlKey&&(e.key==="o"||e.key==="s")){e.preventDefault();document.querySelector('[data-ed="save"]').click();}if(e.ctrlKey&&e.key==="x"){e.preventDefault();document.querySelector('[data-ed="exit"]').click();}});
