/* ============================== LR-08: the workstation, a homemade Windows 3.1 ==============================
   A Program Manager with program groups and icons; each program opens in its own beveled window that can be
   moved, minimized to an icon, maximized and closed. Positions are percentages of the desktop so they survive resizes.
   On phones every window is maximized and only the active one shows. The programs inside stay faithful to the real tools. */
const WM={wins:[],z:1,drag:null};
const TITLES={progman:"Program Manager",mdm:"Lossy MDM - Device Management",mail:"Mail - Inbox",gg:"GitGuardian",vault:"Vault",ci:"CI/CD",slack:"Slack",ai:"AI provider console",github:"GitHub",sendgrid:"SendGrid",gcp:"Google Cloud Console",clock:"Clock",notepad:"Notepad - TODO.TXT",sol:"Solitaire"};
/* 16x16 pixel icons, drawn by hand, deliberately a little off */
const ICO={
 mail:["................","................","..wwwwwwwwwwww..","..wkwwwwwwwwkw..","..wwkwwwwwwkww..","..wwwkwwwwkwww..","..wwwwkwwkwwww..","..wwwwwkkwwwww..","..wwwwwwwwwwww..","..wwwwwwwwwwww..","..kkkkkkkkkkkk..","................","....rrr.........","....rrr.........","................","................"],
 gg:["................","......bbbb......","....bbbbbbbb....","...bbBBBBBBbb...","...bBBwwwwBBb...","...bBwwkkwwBb...","...bBwkkkkwBb...","...bBwwkkwwBb...","...bBBwwwwBBb...","....bBBBBBBb....","....bbBBBBbb....",".....bbBBbb.....","......bbbb......",".......bb.......","................","................"],
 vault:["................","..gggggggggggg..","..gGGGGGGGGGGg..","..gG........Gg..","..gG..yyyy..Gg..","..gG.yy..yy.Gg..","..gG.y.kk.y.Gg..","..gG.yy..yy.Gg..","..gG..yyyy..Gg..","..gG........Gg..","..gGGGGGGGGGGg..","..gggggggggggg..","...kk......kk...","................","................","................"],
 ci:["................",".....GG..GG.....","....GggGGggG....","....GggggggG....","..GGgggkkgggGG..","..GgggkwwkgggG..","...ggkwwwwkgg...","...ggkwwwwkgg...","..GgggkwwkgggG..","..GGgggkkgggGG..","....GggggggG....","....GggGGggG....",".....GG..GG.....","................","................","................"],
 slack:["................","................","..cccccccccc....","..cwwwwwwwwc....","..cwkkwkkwwc....","..cwwwwwwwwc....","..cccccc.ccc....","......cc.ccccccc","......c.ccwwwwwc","........cwkkwkwc","........cwwwwwwc","........ccccc.cc","............c...","................","................","................"],
 ai:["................","......pppp......","....pppppppp....","...ppPPppPPpp...","...pPPPPPPPPp...","..ppPpPPPPpPpp..","..pPPPPppPPPPp..","..ppPPPPPPPPpp..","...pPPpPPpPPp...","...ppPPPPPPpp...","....pppppppp....","......pppp......",".......kk.......","......kkkk......","................","................"],
 github:["................","...kk...........","..kwwk..........","..kwwk......kk..","...kk......kwwk.","...kk......kwwk.","...kk.......kk..","...kk......kk...","...kk....kk.....","...kk..kk.......","..kkkkk.........","..kwwwk.........","..kwwwk.........","...kkk..........","................","................"],
 sendgrid:["................","................",".............bb.","..........bbbbb.",".......bbbBBbb..","....bbbBBBBbb...","..bbBBBBBBbb....","....bbBBBbb.....",".......bBbb.....",".......bbb......","........bb......","........b.......","................","................","................","................"],
 gcp:["................","................",".......wwww.....",".....wwBBBBww...","....wBBBBBBBBw..","..wwBBBBBBBBBw..",".wBBBBBBBBBBBBw.",".wBBBBBBBBBBBBw.",".wBBBBBBBBBBBBw.","..wwwwwwwwwwww..","................","....r..y..l.....","................","................","................","................"],
 ssh:["................",".kkkkkkkkkkkkkk.",".kGGGGGGGGGGGGk.",".kG..........Gk.",".kG.l........Gk.",".kG..l.......Gk.",".kG.l..lll...Gk.",".kG..........Gk.",".kG..........Gk.",".kGGGGGGGGGGGGk.",".kkkkkkkkkkkkkk.","......kkkk......","....kkkkkkkk....","................","................","................"],
 mdm:["................",".gggggggggg.....",".gWWWWWWWWg.....",".gWbbbbbbWg.....",".gWbbbbbbWg.....",".gWbbbbbbWg.....",".gWWWWWWWWg.....",".gggggggggg.kk..","....gggg...kGGk.","..gggggggg.kGkGk","...........kGGk.","............kk..","................","................","................","................"],
 clock:["................",".....kkkkkk.....","...kkwwwwwwkk...","..kwwwwkwwwwwk..","..kwwwwkwwwwwk..",".kwwwwwkwwwwwwk.",".kwwwwwkwwwwwwk.",".kwwwwwkkkkkwwk.",".kwwwwwwwwwwwwk.",".kwwwwwwwwwwwwk.","..kwwwwwwwwwwk..","..kwwwwwwwwwwk..","...kkwwwwwwkk...",".....kkkkkk.....","................","................"],
 notepad:["................","...kkkkkkkkk....","...kwwwwwwwkk...","...kwkkkkkwwkk..","...kwwwwwwwwwk..","...kwkkkkkkkwk..","...kwwwwwwwwwk..","...kwkkkkwwwwk..","...kwwwwwwwwwk..","...kwkkkkkkkwk..","...kwwwwwwwwwk..","...kkkkkkkkkkk..","................","................","................","................"],
 sol:["................","..kkkkkkk.......","..kwwwwwk.......","..kwrwwwk.......","..kwrrwwkkkkkk..","..kwwrwwkwwwwk..","..kwwwwwkwkwwk..","..kkkkkkkwkkwk..","........kwwkwk..","........kwwwwk..","........kkkkkk..","................","................","................","................","................"]};
const ICOPAL={W:"#E0E0E0",k:"#000",w:"#fff",g:"#808080",G:"#C0C0C0",b:"#000080",B:"#0000FF",r:"#FF0000",y:"#FFFF00",c:"#008080",p:"#800080",P:"#FF00FF",l:"#00FF00"};
function icoSVG(k){const m=ICO[k]||ICO.notepad;let r="";m.forEach((row,y)=>{for(let x=0;x<16;x++){const c=ICOPAL[row[x]];if(c)r+=`<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`;}});
  return `<svg viewBox="0 0 16 16" width="32" height="32" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;}
/* program groups, as someone set them up years ago */
function groups(){const have=new Set(apps().map(a=>a[0]));const b=Object.fromEntries(apps().map(a=>[a[0],a[2]||0]));
  const G=[["Main",[["mail","Mail"],["clock","Clock"],["notepad","Notepad"],["sol","Solitaire"]]],
           ["Secruity Toolz",[["gg","GitGuardian"],["vault","Vault"],["ssh","nas01 (SSH)"],["mdm","Device Mgmt"]]],
           ["Dev Stuff (DO NOT DELETE)",[["ci","CI/CD"],["github","GitHub"],["slack","Slack"]]],
           ["Vendor Consoles",[["ai","AI provider"],["sendgrid","SendGrid"],["gcp","Google Cloud"]]]];
  return G.map(([n,items])=>[n,items.filter(([k])=>have.has(k)||["clock","notepad","sol"].includes(k)).map(([k,l])=>[k,l,b[k]||0])]).filter(g=>g[1].length);}
const isPhone=()=>matchMedia("(max-width:600px)").matches;
function openWin(app){if(app==="ssh")return;pcApp=app;let w=WM.wins.find(x=>x.app===app);
  if(!w){const n=WM.wins.filter(x=>x.app!=="progman").length;const small={clock:[30,12,34,34],notepad:[16,10,52,62],sol:[26,22,40,30]}[app];
    const [x,y,ww,hh]=small||[5+n*3,4+n*3,88,86];w={app,x,y,w:ww,h:hh,max:false,min:false,z:0};WM.wins.push(w);}
  w.min=false;w.z=++WM.z;}
function closeWin(app){WM.wins=WM.wins.filter(w=>w.app!==app);if(modal&&app===pcApp)modal=null;const top=WM.wins.filter(w=>!w.min).sort((a,b)=>b.z-a.z)[0];pcApp=top?top.app:"progman";}
function ensureProgman(){if(!WM.wins.some(w=>w.app==="progman"))WM.wins.unshift({app:"progman",x:6,y:6,w:62,h:62,max:false,min:false,z:0});}
APPS.progman=function(){return `<div class="pm">${groups().map(([n,items])=>`<div class="grpwin" role="group" aria-label="${esc(n)}"><div class="gt">${esc(n)}</div><div class="icons">${items.map(([k,l,b])=>`<button class="icon" data-pc="${k}">${icoSVG(k)}<span>${esc(l)}</span>${b?`<i class="nb">${b}<span class="sr"> new</span></i>`:""}</button>`).join("")}</div></div>`).join("")}</div>`;};
APPS.clock=function(){return `<div class="w31clock"><div class="dig">${hhmm(S.t)}</div><div>${DAYS[S.day].name}, March ${16+S.day}</div><div class="hint">Time only moves when you do something.</div></div>`;};
APPS.notepad=function(){return `<textarea class="w31note" aria-label="TODO.TXT" spellcheck="false">TODO.TXT (Jae)
----------------
- check validity BEFORE revoking anything
- ask the dev who else uses a key. the map doesnt know about nas01
- vault first, then rotate, then revoke
- stolen or public = revoke NOW, fix stuff after
- never reset a honeytoken that fired for real
- nas01 ssh: note in my right desk drawer
- buy more coffee
</textarea>`;};
APPS.sol=function(){return `<div class="w31sol"><div class="msgbox"><b>Solitaire</b><p>This program has been disabled by your system administrator.</p><p style="font-size:12px">(Jae, after the Q3 audit.)</p></div></div>`;};
function winHTML(w){const act=w.app===pcApp,t=TITLES[w.app]||w.app;const badge=(apps().find(a=>a[0]===w.app)||[])[2];
  return `<section class="win${act?" act":""}${w.max?" max":""}${w.min?" minz":""}" style="left:${w.x}%;top:${w.y}%;width:${w.w}%;height:${w.h}%;z-index:${w.z}" data-win="${w.app}" role="dialog" aria-label="${esc(t)}" aria-modal="false">
   <header class="tb" data-drag="${w.app}"><button class="ctl" data-wclose="${w.app}" aria-label="Close ${esc(t)}" title="Close"><i></i></button><span class="tt">${esc(t)}${badge?` (${badge})`:""}</span>${w.app!=="progman"||true?`<button class="tbb" data-wmin="${w.app}" aria-label="Minimize ${esc(t)}" title="Minimize">▼</button><button class="tbb" data-wmax="${w.app}" aria-label="${w.max?"Restore":"Maximize"} ${esc(t)}" title="${w.max?"Restore":"Maximize"}">${w.max?"⬍":"▲"}</button>`:""}</header>
   ${w.app==="progman"?`<div class="mbar" aria-hidden="true"><span>File</span><span>Options</span><span>Window</span><span>Help</span></div>`:`<div class="mbar"><button data-wclose="${w.app}">File: Exit</button><button data-wrestore="progman">Window: Program Manager</button><span aria-hidden="true">Help</span></div>`}
   <div class="wbody app">${APPS[w.app]()}</div></section>`;}
function renderPC(){const L=PL();updateBar();ensureProgman();if(!APPS[pcApp]||!WM.wins.some(w=>w.app===pcApp)){const top=WM.wins.filter(w=>!w.min).sort((a,b)=>b.z-a.z)[0];pcApp=top?top.app:"progman";}
  const phone=isPhone();const vis=WM.wins.filter(w=>!w.min);const mins=WM.wins.filter(w=>w.min);
  L.innerHTML=`<div class="pc" id="pcroot"><div class="bezel"><div class="screenpc w31" id="w31">
   <div class="desk" id="desk" data-phone="${phone}">${vis.filter(w=>!phone||w.app===pcApp).map(winHTML).join("")}
    <div class="minicons">${mins.map(w=>`<button class="icon mini" data-wrestore="${w.app}" aria-label="Restore ${esc(TITLES[w.app])}">${icoSVG(w.app==="progman"?"notepad":w.app)}<span>${esc(TITLES[w.app])}</span></button>`).join("")}</div>
    <div class="deskfoot">Simulation for training. Programs follow the real tools' documented flows; no real systems are contacted. · ${DAYS[S.day].short} ${hhmm(S.t)}</div>
    ${modal?MODALS[modal.k](modal):""}</div></div>
   <span class="brand">LOSSY-PC 486 · Windows 3.11 for Workgroups (unlicensed)</span><button class="off" data-pcclose>Turn away from the screen</button></div></div>`;
  const b=document.querySelector(`.win.act .wbody`);if(b&&WM.scroll&&WM.scroll.app===pcApp)b.scrollTop=WM.scroll.top;}
/* window chrome: focus on press, drag by the title bar, buttons */
document.addEventListener("pointerdown",e=>{const win=e.target.closest(".win");if(!win||!document.getElementById("w31"))return;const app=win.dataset.win;
  if(app!==pcApp){const w=WM.wins.find(x=>x.app===app);if(w){w.z=++WM.z;pcApp=app;document.querySelectorAll(".win").forEach(el=>el.classList.toggle("act",el===win));win.style.zIndex=w.z;}}
  const tb=e.target.closest(".tb");if(!tb||e.target.closest("button")||isPhone())return;const w=WM.wins.find(x=>x.app===app);if(!w||w.max)return;
  const desk=document.getElementById("desk").getBoundingClientRect();WM.drag={w,el:win,sx:e.clientX,sy:e.clientY,ox:w.x,oy:w.y,dw:desk.width,dh:desk.height};tb.setPointerCapture&&tb.setPointerCapture(e.pointerId);e.preventDefault();});
document.addEventListener("pointermove",e=>{const d=WM.drag;if(!d)return;d.w.x=Math.max(-d.w.w+10,Math.min(95,d.ox+(e.clientX-d.sx)*100/d.dw));d.w.y=Math.max(0,Math.min(92,d.oy+(e.clientY-d.sy)*100/d.dh));d.el.style.left=d.w.x+"%";d.el.style.top=d.w.y+"%";});
document.addEventListener("pointerup",()=>{WM.drag=null;});
document.addEventListener("scroll",e=>{const b=e.target&&e.target.classList&&e.target.classList.contains("wbody")?e.target:null;if(b){const w=b.closest(".win");if(w)WM.scroll={app:w.dataset.win,top:b.scrollTop};}},true);
document.addEventListener("click",e=>{if(!document.getElementById("w31"))return;const b=e.target.closest("[data-wclose],[data-wmin],[data-wmax],[data-wrestore]");if(!b)return;const d=b.dataset;
  if(d.wclose){if(d.wclose==="progman"){return closePC();}closeWin(d.wclose);return renderPC();}
  if(d.wmin){const w=WM.wins.find(x=>x.app===d.wmin);if(w){w.min=true;closeWinFocus();}return renderPC();}
  if(d.wmax){const w=WM.wins.find(x=>x.app===d.wmax);if(w){w.max=!w.max;w.z=++WM.z;pcApp=w.app;}return renderPC();}
  if(d.wrestore){openWin(d.wrestore);return renderPC();}});
function closeWinFocus(){const top=WM.wins.filter(w=>!w.min).sort((a,b)=>b.z-a.z)[0];pcApp=top?top.app:"progman";}
document.addEventListener("keydown",e=>{if(!document.getElementById("w31")||TM)return;
  if(e.key==="F4"&&e.ctrlKey&&pcApp!=="progman"){e.preventDefault();closeWin(pcApp);renderPC();}});

/* ============================== LR-09: tabs that are tabs (WAI-ARIA tabs pattern) ==============================
   Every .tabs strip becomes role=tablist with role=tab buttons, aria-selected, aria-controls, a roving tabindex and a
   labelled tabpanel. Left/Right/Home/End move between tabs and select them (automatic activation); focus survives the
   re-render that follows. */
function enhanceTabs(root){(root||document).querySelectorAll(".tabs").forEach(tl=>{const btns=[...tl.querySelectorAll(":scope > button")];if(!btns.length)return;
  const win=tl.closest(".win");const key=(btns[0].getAttributeNames().find(a=>a.startsWith("data-"))||"t").replace(/^data-/,"");const gid=`tab-${win?win.dataset.win:"x"}-${key}`;
  tl.setAttribute("role","tablist");if(!tl.getAttribute("aria-label"))tl.setAttribute("aria-label","Sections");tl.classList.add("tabset");
  const sel=btns.find(b=>b.getAttribute("aria-pressed")==="true")||btns[0];
  /* the panel: whatever follows the strip (wrapped), or the next block after its header */
  let panel=null;const after=[];let n=tl.nextElementSibling;while(n){after.push(n);n=n.nextElementSibling;}
  if(after.length){panel=document.createElement("div");tl.parentNode.insertBefore(panel,after[0]);after.forEach(x=>panel.appendChild(x));}
  else{let p=tl.parentElement;while(p&&!p.nextElementSibling&&p!==root)p=p.parentElement;panel=p&&p.nextElementSibling;}
  if(panel){panel.setAttribute("role","tabpanel");panel.id=gid+"-panel";panel.setAttribute("aria-labelledby",gid+"-"+btns.indexOf(sel));if(!panel.hasAttribute("tabindex"))panel.tabIndex=0;panel.classList.add("tabpanel");}
  btns.forEach((b,i)=>{b.setAttribute("role","tab");b.id=gid+"-"+i;b.setAttribute("aria-selected",String(b===sel));b.removeAttribute("aria-pressed");b.tabIndex=b===sel?0:-1;if(panel)b.setAttribute("aria-controls",panel.id);});});}
document.addEventListener("keydown",e=>{const t=e.target.closest&&e.target.closest('[role="tab"]');if(!t)return;const tl=t.closest('[role="tablist"]');const tabs=[...tl.querySelectorAll('[role="tab"]')];let i=tabs.indexOf(t);
  const k=e.key;let j=null;if(k==="ArrowRight"||k==="ArrowDown")j=(i+1)%tabs.length;else if(k==="ArrowLeft"||k==="ArrowUp")j=(i-1+tabs.length)%tabs.length;else if(k==="Home")j=0;else if(k==="End")j=tabs.length-1;
  if(j==null)return;e.preventDefault();WM.refocus=tabs[j].id;tabs[j].focus();tabs[j].click();});
document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest('[role="tab"]');if(t)WM.refocus=t.id;},true);
const _renderPC=renderPC;
renderPC=function(){_renderPC();const root=document.getElementById("w31");if(root){enhanceTabs(root);
  /* scrollable tables and panes must be reachable by keyboard */
  root.querySelectorAll(".tw,.slmsgs").forEach(el=>{if(el.scrollWidth>el.clientWidth+1||el.scrollHeight>el.clientHeight+1){el.tabIndex=0;if(!el.getAttribute("role")){el.setAttribute("role","region");el.setAttribute("aria-label","Scrollable table");}}});}if(WM.refocus){const el=document.getElementById(WM.refocus);WM.refocus=null;if(el){try{el.focus({preventScroll:true});}catch(err){}}}};
