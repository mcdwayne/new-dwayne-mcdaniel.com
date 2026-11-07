/* ============================== GitGuardian ==============================
   Built to the same spec as LossyInc Range's console (06-gitguardian.js, 07-actions.js): same navigation, list,
   incident page, dialogs, exploration map, endpoints, honeytokens, perimeter, inventory and settings.
   Added for this game only: workspace roles (Restricted / Member, with Can view / Can edit / Full access), shown as
   "Your access" on the incident and enforced on every action, plus the Payments export and PCI evidence cards. */
const isRestricted=()=>/^Restricted/.test(S.gg);
const canEditPayments=()=>/Can edit|Full access/.test(S.gg);
let ggQ="";
/* the two incidents the quest runs on: full definitions, like Lossy's DEF */
const DEF={
 3112:{det:"TicketHive API Token",prov:"TicketHive",revGG:false,sev:"High",kind:"repo",repo:"precarium/helpdesk-automation",file:"autoclose.py",commit:"5c0d2e1",author:"otto.brannigan",dev:"otto",
   ident:"otto@precarium.io · tickets:read tickets:write",env:"Production",path:null,first:"2022",
   cons:[{name:"autoclose.py (helpdesk-01)",k:"th"}],hiddenNote:"helpdesk-01 isn't integrated",resource:"TicketHive (800,000+ tickets)"},
 2871:{det:"PayRail Secret Key",prov:"PayRail",revGG:false,sev:"Critical",kind:"public",where:"gist.github.com/teo-varga-dev/8f2a",file:"payments-config.yaml",author:"teo-varga-dev",dev:"teo",
   ident:"acct_PRC_88412 · live mode · charges, refunds, payouts",env:"Production",path:"kv/payments/payrail",first:"Sep 27",
   internal:[["precarium/payments-api","config/checkout.yaml","a41f9c2","teo.varga"],["precarium/payments-api","scripts/recon_test.sh","77be013","teo.varga"]],
   cons:[{name:"checkout-api",k:"checkout"},{name:"payouts-worker",k:"payouts"},{name:"recon-batch (batch-01, 2 AM)",k:"recon",hidden:true}],hiddenNote:"Vault isn't integrated",resource:"PayRail acct_PRC_88412"}};
const DEVNAME={otto:"Otto Brannigan",teo:"Teo Varga"};
/* everything else is history: shown in the list, opened as a stub, like Lossy's historical rows */
const HIST=[
 {id:2790,det:"AWS Keys",src:"precarium/payments-api",team:"Payments",status:"TRIGGERED",val:"Valid",sev:"High",when:"Apr 9"},
 {id:2655,det:"PostgreSQL Credentials",src:"precarium/ledger-service",team:"Payments",status:"TRIGGERED",val:"Cannot check",sev:"High",when:"Jan 10"},
 {id:2302,det:"Datadog API Key",src:"precarium/infra-terraform",team:"Platform",status:"ASSIGNED",val:"Failed to check",sev:"Medium",when:"last year"},
 {id:2477,det:'Mapbox Secret Token</b> <span style="font-weight:400;color:#545C6E;font-size:12.5px">(enriched from Generic High Entropy Secret)</span><b>',src:"precarium/sdk-examples",team:"Growth",status:"TRIGGERED",val:"Cannot check",sev:"Unknown",when:"last year"},
 {id:2430,det:"Slack Webhook URL",src:"Slack: #deploys",team:"Platform",status:"TRIGGERED",val:"Valid",sev:"Medium",when:"last year"},
 {id:2911,det:"Generic Password",src:"precarium/payouts-worker",team:"Payments",status:"IGNORED",val:"Invalid",sev:"Low",when:"Sep 30"},
 {id:2218,det:"Google Cloud Service Account Key",src:"Public: precarium/recon (Docker Hub)",team:"Payments",status:"IGNORED",val:"Invalid",sev:"High",when:"2 years ago",pub:true},
 {id:2099,det:"Twilio Auth Token",src:"precarium/notifications",team:"Growth",status:"IGNORED",val:"Invalid",sev:"Low",when:"2 years ago"}];
const STP={TRIGGERED:["Triggered","p-trig"],ASSIGNED:["Assigned","p-asg"],RESOLVED:["Resolved","p-res"],IGNORED:["Ignored","p-ign"]};
const VALCLS=v=>v==="Valid"?"p-valid":v==="Invalid"?"p-invalid":"p-tag";
const vpill=ok=>pill(ok?"Valid":"Invalid",ok?"p-valid":"p-invalid");
const clock=t=>{t=((t%1440)+1440)%1440;return `${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`;};
/* incident state, like Lossy's INC(id) */
function INC(id){if(!DEF[id])return null;S.gi=S.gi||{};let i=S.gi[id];
  if(!i){i=S.gi[id]={status:"TRIGGERED",assignee:null,severity:null,owner:null,timeline:id===2871?[["Sep 27","Incident created from public monitoring (gist)"],["Sep 27","Notification sent to hal.bender@precarium.io (bounced)"],["Oct 15","Notification sent to hal.bender@precarium.io (bounced)"]]:[["2022","Incident created (real-time scan)"],["9:00","Shared with "+S.player+" by "+PPL.otto.name+" (Can edit)"]],vAt:null,vLast:null,presence:null,map:false,shared:false,resolvedHow:null,ignoreReason:null};}
  /* the quest's own milestones (also set by save codes) keep the incident in step */
  if(id===3112&&S.f.thResolved&&i.status!=="RESOLVED")i.status="RESOLVED";
  if(id===2871){if(S.f.final&&i.status!=="RESOLVED")i.status="RESOLVED";if(S.f.won2&&i.status==="TRIGGERED"){i.status="ASSIGNED";i.assignee=S.player;}}
  if(id===2871&&S.f.prMap)i.map=true;if(id===3112&&S.f.thMap)i.map=true;return i;}
const tl=(id,text)=>INC(id).timeline.push([clock(S.t),text]);
const keyValid=id=>id===3112?!S.f.ottoRotated:id===2871?!!S.pr.v1:false;
const sevOf=id=>INC(id).severity||DEF[id].sev;
const vaulted=id=>id===2871&&!!S.f.scout;
const consOf=id=>DEF[id].cons.filter(c=>!c.hidden||(id===2871&&S.f.scout));
const hasHidden=id=>DEF[id].cons.some(c=>c.hidden&&!(id===2871&&S.f.scout))||(id===3112);
function conState(id,c){if(id===3112)return S.f.ottoRotated?"hard-v2":"hard-v1";
  const k=c.k;if(k==="recon")return S.c.recon==="vault"?(S.pr.v1||vaultProd()==="v2"?"vault":"down"):(S.pr.v1?"hard-v1":"down");
  const e=effKey(k);if(e==="v2")return "vault";return S.pr.v1?"hard-v1":"down";}
const visibleIds=()=>isRestricted()?[3112]:[3112,2871];
function canEdit(id){if(id===3112)return true;if(id===2871)return canEditPayments();return false;}
function permFor(id){if(id===3112)return "Can edit (shared with you)";if(isRestricted())return "No access";if(id===2871){if(/Full/.test(S.gg))return "Full access";if(canEditPayments())return "Can edit (Payments team)";}return "Can view";}
const fullAccess=id=>id===2871&&/Full/.test(S.gg);
function risk(id){const v=keyValid(id);let r=v?62:12;if(v&&DEF[id].kind==="public")r+=30;if(v&&DEF[id].sev==="Critical")r+=6;if(v&&consOf(id).length)r+=Math.min(6,consOf(id).length*2);return Math.min(99,r);}
function riskWhy(id){const v=keyValid(id),w=[v?"the secret is valid":"the secret is invalid"];if(DEF[id].kind==="public")w.push("it is publicly exposed");if(DEF[id].revGG&&v)w.push("it is revocable by GitGuardian");if(consOf(id).length)w.push(`${consOf(id).length} workload(s) depend on it`);return w.join(", ");}
/* playbooks: names and defaults from GitGuardian's documented list */
const PLAYBOOKS=[["autoShare","Auto-share incident public link to involved developer","When an incident is created, the developer who committed the secret gets a public link to it, with feedback collection.",false],
 ["autoGrant","Auto-grant access to involved developer (in-app)","The involved developer gets access to the incident in GitGuardian.",false],
 ["autoResolve","Auto-resolve revoked secrets","When a valid secret is revoked and its validity becomes invalid, the incident is resolved with the reason \"Secret was revoked\".",true],
 ["autoIgnoreInvalid","Auto-ignore invalid secrets","Incidents whose secret is invalid when detected are ignored with the reason \"Invalid secret\".",true],
 ["autoIgnoreFP","Auto-ignore false positives","Incidents tagged as false positives are ignored with the reason \"False positive (not a secret)\".",true]];
/* the quest flags that follow from incident state */
function syncQuest(id){const i=INC(id);
  if(id===3112&&i.status==="RESOLVED"&&!keyValid(3112)&&!S.f.thResolved){S.f.thResolved=true;const p=award("thResolved");if(p)setTimeout(()=>flash(`#3112 resolved (+${p} points)`),40);}
  if(id===2871&&i.status==="RESOLVED"&&!keyValid(2871)&&!S.f.final&&S.lv===6){S.f.final=true;award("final");setTimeout(finish,700);}}
/* LR-29 equivalent: validity and presence are re-checked whenever GitGuardian opens or is refreshed */
const presentNow=id=>id===3112?!S.f.ottoRotated:effKey("checkout")!=="v2";
function recheck(id,how){if(!visibleIds().includes(id))return;const i=INC(id),v=keyValid(id);
  if(i.vLast!==null&&i.vLast!==v){tl(id,`Validity re-checked ${how}: ${v?"valid":"invalid"}`);
    if(i.vLast&&!v&&(i.status==="TRIGGERED"||i.status==="ASSIGNED")){i.status="RESOLVED";i.resolvedHow="revoked";tl(id,"Resolved by playbook: Secret was revoked");}}
  i.vLast=v;i.vAt=clock(S.t);
  if(i.presence){const p=presentNow(id);if(i.presence.p!==p)tl(id,`Presence re-checked ${how}: ${p?"present in default branch":"no longer in default branch (still in git history)"}`);i.presence={p,at:clock(S.t)};}
  syncQuest(id);}
function ggRefresh(how){if(!S)return;for(const id of visibleIds())recheck(id,how||"automatically");}
const AGENTSAY={2871:"Related. The gist was published by teo-varga-dev, a former Precarium contractor. It holds payments-config.yaml from precarium/payments-api, and the key belongs to PayRail merchant acct_PRC_88412, which your internal incident data links to Precarium."};
const SIMILAR={2871:[2790]};
const ACC={3112:"TicketHive (800,000+ tickets)",2871:"PayRail acct_PRC_88412"};
const GGNAV=[["",[["perimeter","Monitored perimeter"]]],["Internal monitoring",[["list","Secret incidents"]]],["Public monitoring",[["publist","Public secret incidents"]]],["Endpoint protection",[["endpoints","Endpoints"]]],["Honeytoken",[["honeytokens","Honeytokens"]]],["NHI governance",[["inventory","Inventory"],["map","Exploration"]]],["Settings",[["playbooks","Playbooks"],["workflow","Remediation workflow"],["secmgr","Secrets managers"]]]];
const ggBadge=()=>visibleIds().filter(id=>INC(id).status==="TRIGGERED").length+(S.f.htFired&&!S.f.htSeen?1:0);
APPS.gg=()=>{if(!S.f.ggOpened||ggRoute.fresh){ggRefresh("on open");ggRoute.fresh=false;}S.f.ggOpened=true;award("ggOpen");
  const cur={incident:"list",denied:"list",endpoint:"endpoints",hist:"list"}[ggRoute.page]||ggRoute.page;
  const page=isRestricted()&&!["list","incident","denied","map","hist"].includes(ggRoute.page)?"restricted":ggRoute.page;
  return `<div class="gg"><nav aria-label="GitGuardian"><div class="ws">Precarium</div>${GGNAV.map(([g,items])=>`${g?`<div class="grp">${g}</div>`:""}${items.map(([k,l])=>`<button data-act="gg:${k}" aria-current="${cur===k?"page":"false"}">${l}</button>`).join("")}`).join("")}</nav><main>${(GG[page]||GG.list)()}</main></div>`;};
ACT.gg=p=>{ggRoute={page:p};if(p==="honeytokens")S.f.htSeen=S.f.htFired||S.f.htSeen;renderPC();};
ACT.open=id=>{const n=+id;if(!DEF[n]){ggRoute={page:"hist",id:n};return renderPC();}if(!visibleIds().includes(n)){ggRoute={page:"denied",id:n};return renderPC();}
  ggRoute={page:"incident",id:n,tab:"overview"};if(n===3112)S.f.thOpened=true;if(n===2871){S.f.pr=true;award("pr");}renderPC();};
ACT.tab=t=>{ggRoute.tab=t;renderPC();};
ACT.ggmap=id=>{const n=+id;if(!visibleIds().includes(n)){ggRoute={page:"denied",id:n};return renderPC();}ggRoute={page:"map",id:n};renderPC();};
ACT.ggq=f=>{ggQ=f.querySelector("#ggq").value;renderPC();};
ACT.ggteam=t=>{ggQ=ggQ.toLowerCase()===t?"":t;renderPC();};
ACT.ggclear=()=>{ggQ="";renderPC();};
ACT.ep=h=>{ggRoute={page:"endpoint",host:h};renderPC();};
const histHay=h=>[h.id,h.det,h.src,h.team].join(" ").toLowerCase();
const incHay=id=>{const d=DEF[id];return [id,d.det,d.repo||"",d.where||"",d.file,d.author,d.ident,d.path||"",(d.internal||[]).flat().join(" "),"payments" ].filter(x=>id===2871||x!=="payments").join(" ").toLowerCase();};
function srcLabel(id){const d=DEF[id];return d.kind==="repo"?d.repo:"Public: "+d.where.split("/").slice(-2).join("/");}
const GG={
restricted(){return `<div class="hdr"><h1>Restricted</h1></div><div class="warnbox">Restricted members can only open incidents explicitly shared with them. A workspace Manager can change your role.</div>`;},
list(pubOnly){const q=ggQ.trim().toLowerCase();
  const live=visibleIds().filter(id=>(!pubOnly||DEF[id].kind==="public")&&(!q||incHay(id).includes(q))).map(id=>{const i=INC(id);return [id,DEF[id].det,srcLabel(id),i.status,keyValid(id)?"Valid":"Invalid",sevOf(id),DEF[id].first];});
  const hist=isRestricted()?[]:HIST.filter(h=>(!pubOnly||h.pub)&&(!q||histHay(h).includes(q))).map(h=>[h.id,h.det,h.src,h.status,h.val,h.sev,h.when]);
  const rows=live.concat(hist);const payQ=!isRestricted()&&/payment/.test(q)&&!pubOnly;
  return `<div class="hdr"><h1>${pubOnly?"Public secret incidents":"Secret incidents"}</h1><span style="color:#545C6E;font-size:13px">${isRestricted()?"1 incident shared with you":pubOnly?"Public monitoring · found outside your perimeter":"Internal and public monitoring"}</span></div>
  ${isRestricted()?`<div class="warnbox"><b>You're a Restricted member.</b> You only see incidents someone shared with you. The workspace has 2,417 incidents. A Manager can change your role.</div>`:""}
  <form data-actform="ggq" class="ggsearch" role="search" style="display:flex;gap:6px"><input type="search" id="ggq" value="${esc(ggQ)}" aria-label="Search incidents" placeholder="Search by secret value, commit author, file path or source" style="flex:1;min-width:0;border-radius:6px;padding:6px 9px"><button class="btn" type="submit">Search</button>${ggQ?'<button class="btn" type="button" data-act="ggclear">Clear</button>':""}</form>
  ${isRestricted()?"":`<div class="ggfilters" role="group" aria-label="Filter by team" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:13px;color:#545C6E">Filter by team: ${["Payments","Platform","Support"].map(t=>`<button class="btn" data-act="ggteam:${t.toLowerCase()}" aria-pressed="${ggQ.toLowerCase()===t.toLowerCase()}">${t}</button>`).join("")}</div>`}
  ${q?`<div style="font-size:12.5px;color:#545C6E">Secret values are hashed in your browser before they're sent. Showing incidents matching “${esc(ggQ)}”.</div>`:""}
  ${payQ?`<div class="card"><h3>Team: Payments</h3><dl class="kv"><dt>Open incidents</dt><dd>63</dd><dt>Still valid</dt><dd>19</dd><dt>Median age</dt><dd>212 days</dd></dl><div><button class="btn pri" data-act="csv">${has("payments-incidents.csv")?"Exported ✓":"Export CSV"}</button></div></div>`:""}
  ${S.lv>=4&&!pubOnly&&!isRestricted()?`<div class="card"><h3>Audit evidence</h3><div style="font-size:13.5px">Detection history, remediation timeline and audit log for hardcoded secrets in the Payments perimeter, last 90 days.</div><div><button class="btn pri" data-act="pci">${S.f.pci?"Exported ✓":"Export PCI DSS evidence (Requirement 8.6.2)"}</button></div></div>`:""}
  <div class="card" style="padding:0"><div class="tw"><table class="t"><tr><th>Incident</th><th>Status</th><th>Validity</th><th>Severity</th><th>Detected</th></tr>
  ${rows.map(r=>`<tr class="click" data-act="open:${r[0]}"><td><b>${r[1]}</b><div style="color:#545C6E;font-size:12.5px">#${r[0]} · ${esc(r[2])}</div></td><td>${pill(...STP[r[3]])}</td><td>${pill(r[4],VALCLS(r[4]))}</td><td>${r[5]==="Critical"?pill("Critical","p-crit"):r[5]}</td><td>${r[6]}</td></tr>`).join("")||'<tr><td colspan="5" style="color:#545C6E">No incidents.</td></tr>'}</table></div></div>
  ${isRestricted()?`<div style="font-size:12.5px;color:#545C6E">Shared with you by ${PPL.otto.name} (Can edit): "can u look at this? idk what it is"</div>`:""}`;},
publist(){return GG.list(true);},
hist(){return `<div class="crumb"><button data-act="gg:list">Incidents</button> / #${ggRoute.id}</div><div class="card">A historical incident from an older scan. Important, but not today's fire.</div>`;},
denied(){return `<div class="crumb"><button data-act="gg:list">Incidents</button> / #${ggRoute.id}</div><div class="errbox"><b>You don't have access to this incident.</b> Restricted members only see incidents shared with them. Ask a Manager to change your role, or ask someone with access to share it.</div><div class="card"><h3>Workspace Managers</h3><div>Marisol Vance (IT Director), Floor 2</div></div>`;},
incident(){const id=+ggRoute.id,i=INC(id),d=DEF[id];if(!i)return GG.hist();const tab=ggRoute.tab||"overview",open=i.status==="TRIGGERED"||i.status==="ASSIGNED",edit=canEdit(id),v=keyValid(id);
  const lockNote=need=>`<span style="font-size:12.5px;color:#545C6E">Needs ${need}. Your access: ${esc(permFor(id))}.</span>`;
  const sd=stepsOf(id);
  const steps=REMSTEPS.map(([t,dd],n)=>[t,dd,[sd.assess,sd.store,sd.code,sd.deploy,sd.rotate,sd.verify][n]]);
  const presCell=`${i.presence?`${i.presence.p?pill("Present","p-trig"):pill("Removed from default branch","p-res")} <span class="xs">checked ${i.presence.at}</span> <button class="btn" data-act="presence:${id}" style="padding:2px 8px">Re-check</button>`:`<button class="btn" data-act="presence:${id}">Check presence</button>`}`;
  const occ=[];if(d.kind==="repo")occ.push([d.repo,d.file,d.commit,d.author,presCell]);
  if(d.kind==="public"){occ.push([d.where,d.file,"—","public",pill("Public","p-pub")]);(d.internal||[]).forEach(o=>occ.push([...o,presCell]));}
  const dev=d.dev?DEVNAME[d.dev]:null;
  const type=d.kind==="public"?"Public incident":"Internal incident";
  const crumb=d.kind==="public"?"Public monitoring › Public secret incidents":"Internal monitoring › Internal secret incidents";
  const vaultCell=vaulted(id)?pill("Vaulted","p-tag")+` <span style="font-size:12.5px;color:#545C6E">Vault · ${d.path} (and a stale copy in kv/payments/legacy)</span>`:v?`Not vaulted <button class="btn" data-act="pushvault:${id}" style="padding:2px 8px">Push to vault</button>`:`Not vaulted <span style="font-size:12.5px;color:#545C6E">(the leaked value is revoked; store the new key from Vault)</span>`;
  const owner=i.owner||(id===2871?(S.f.won2?esc(S.player):'<span style="color:#B42318">None (departed: teo.varga)</span>'):PPL.otto.name);
  const seen=i.map;
  const mapCard=`<div class="card xcard${seen?"":" xnew"}"><button class="xtoggle" data-act="ggmap:${id}"><span class="xico" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26"><circle cx="5" cy="6" r="3"/><circle cx="5" cy="18" r="3"/><circle cx="19" cy="12" r="3"/><path d="M8 6.5 16 11M8 17.5l8-4.5" stroke-width="2" fill="none"/></svg></span><span class="xtx"><b>Exploration map${seen?"":' <span class="xbadge">Start here</span>'}</b><span class="xs">See who uses this secret and what it unlocks before you change anything · ${consOf(id).length} consumer(s) · ${vaulted(id)?"in Vault":"no secrets manager"}</span></span><span class="xcta">Open map ›</span></button></div>`;
  const panel=(k,h)=>`<div class="ggpanel" ${tab===k?"":"hidden"}>${h}</div>`;const rc=risk(id);
  const overview=`${mapCard}
   <div class="card" style="grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:14px"><div style="font:700 28px var(--f-ui);color:${rc>80?"#B42318":rc>50?"#9A4A00":"#1D7A3D"}">${rc}</div><div><b style="font-size:13.5px">Risk score</b><div style="font-size:13px;color:#545C6E">Drivers: ${riskWhy(id)}.</div></div><div style="font-size:18px;color:#545C6E" title="Feedback on the risk score"><span role="img" aria-label="Thumbs up">👍</span> <span role="img" aria-label="Thumbs down">👎</span></div></div>
   <div class="card"><h3>Secret details</h3><dl class="kv"><dt>Detector</dt><dd>${d.det}</dd><dt>Secret validity</dt><dd>${vpill(v)} <span class="xs">checked ${i.vAt||"9:00"}</span> <button class="btn" data-act="valid:${id}" style="padding:2px 8px">Check validity</button></dd><dt>Identity</dt><dd class="mono" style="overflow-wrap:anywhere">${esc(d.ident)}</dd><dt>Environment</dt><dd>${d.env}</dd><dt>Public exposure</dt><dd>${d.kind==="public"?"Source is publicly visible · Has linked public incident · Found outside perimeter":"None"}</dd><dt>Secrets manager</dt><dd>${vaultCell}</dd><dt>Owner</dt><dd>${owner}${id===2871&&!S.f.won2&&!i.owner?` <button class="btn" data-act="owner:${id}" style="padding:2px 8px">Set owner: Payments team</button>`:""}</dd></dl>
    ${v?(d.revGG?"":`<div class="warnbox">GitGuardian can't revoke this secret type. Revoke or rotate it in ${d.prov}.</div>`):pill("Revoked","p-res")}</div>
   ${AGENTSAY[id]?`<div class="card"><h3>Analysis <span style="font-weight:400;font-size:12px;color:#545C6E">· GitGuardian agents · Beta</span></h3><dl class="kv"><dt>Company-related</dt><dd>${pill("Related","p-crit")}</dd><dt>Agents' risk score</dt><dd>${rc}</dd></dl><div style="font-size:13px">${AGENTSAY[id]}</div></div>`:""}
   ${SIMILAR[id]&&!isRestricted()?`<div class="card"><h3>Similar incidents</h3><div style="font-size:13px;color:#545C6E">Grouped by ML: same source and leak window. Remediate them together.</div><div style="display:flex;gap:6px;flex-wrap:wrap">${SIMILAR[id].map(x=>`<button class="btn" data-act="open:${x}">#${x} ${HIST.find(h=>h.id===x).det}</button>`).join("")}</div></div>`:""}`;
  const occurrences=`<div class="card"><h3>Occurrences (${occ.length})</h3><div class="tw"><table class="t"><tr><th>Source</th><th>File / location</th><th>Commit</th><th>Developer</th><th>Presence</th></tr>${occ.map(o=>`<tr>${o.map((x,n)=>`<td class="${n<3?"mono":""}">${n<4?esc(x):x}</td>`).join("")}</tr>`).join("")}</table></div></div>`;
  const remediation=`<div class="card"><h3>Remediation</h3><ol class="steps">${steps.map(([t,dd,ok])=>`<li class="${ok?"done":""}"><div><b>${t}</b><span>${dd}</span></div></li>`).join("")}</ol><div style="font-size:12.5px;color:#545C6E">Default remediation workflow · GET /v1/remediation-workflow</div></div>
   <div class="card"><h3>Impacted perimeter</h3><dl class="kv"><dt>Secret presence</dt><dd>${d.kind==="repo"?"1 occurrence requiring code fix":"public source (outside your perimeter) · "+(d.internal||[]).length+" internal occurrence(s) requiring code fix"}</dd><dt>Workloads using it</dt><dd>${consOf(id).length} known${hasHidden(id)?" · map may be incomplete":""}</dd></dl></div>
   ${dev?`<div class="card"><h3>Feedback</h3>${i.shared?(id===2871?`<div style="font-size:13.5px;color:#545C6E">Shared with ${dev}. The link went to teo.varga@precarium.io, which bounces: Teo left a year ago. Ask the people who work with the code instead.</div>`:`<div style="font-size:13.5px;color:#545C6E">Shared with ${dev}. Ask them about it.</div>`):'<div style="font-size:13.5px;color:#545C6E">Share the incident with the developer to collect feedback (Share, top right).</div>'}</div>`:""}`;
  const activity=`<div class="card"><h3>Activity</h3><ul class="tl">${i.timeline.slice().reverse().map(([t,x])=>`<li><time>${t}</time><span>${esc(x)}</span></li>`).join("")}</ul>
    <div style="display:flex;gap:6px"><input type="text" id="ggnote" aria-label="Leave a note" placeholder="Leave a note (type @ to mention someone)" style="flex:1;min-width:0;border-radius:6px;padding:6px 9px"><button class="btn" data-act="note:${id}">Add note</button></div></div>`;
  const tags=[d.kind==="repo"?"Default branch":null,d.kind==="public"?"Publicly leaked":null,vaulted(id)?"Vaulted":null,d.revGG?"Revocable by GitGuardian":null,d.env==="Production"?"Production":null].filter(Boolean);
  const aside=`<aside class="ggaside" aria-label="Incident details"><h3>Incident details</h3><dl class="kv"><dt>Type</dt><dd>${type}</dd><dt>Status</dt><dd>${pill(...STP[i.status])}</dd><dt>Your access</dt><dd>${esc(permFor(id))}</dd></dl>
    <div class="ggact">${!edit?lockNote("Can edit to resolve or ignore"):open?`<button class="btn pri" data-act="modal:resolve:${id}">Resolve</button><button class="btn" data-act="modal:ignore:${id}">Ignore</button>`:`<button class="btn" data-act="reopen:${id}">Reopen</button>`}</div>
    <dl class="kv"><dt>Assignee</dt><dd>${esc(i.assignee||"Unassigned")}${i.status==="TRIGGERED"&&edit?` <button class="btn" data-act="assign:${id}" style="padding:2px 8px">Assign to me</button>`:""}</dd><dt>First occurred</dt><dd>${d.first}</dd>
    <dt>Severity</dt><dd>${edit?`<select id="ggsevsel" aria-label="Severity" style="border-radius:6px;padding:2px 6px">${["Critical","High","Medium","Low","Info","Unknown"].map(x=>`<option ${x===sevOf(id)?"selected":""}>${x}</option>`).join("")}</select> <button class="btn" data-act="sev:${id}" style="padding:2px 8px">Set</button>`:sevOf(id)}</dd><dt>Set by</dt><dd>${i.severity?"Manually set":"Automatically set"}</dd>
    <dt>Tags</dt><dd style="display:flex;gap:4px;flex-wrap:wrap">${tags.map(t=>pill(t,t==="Publicly leaked"?"p-pub":"p-tag")).join(" ")||"—"}</dd><dt>Developer involved</dt><dd>${esc(d.author)}</dd></dl></aside>`;
  return `<div class="crumb" style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap"><span>${crumb} › <button data-act="gg:list">#${id}</button></span><span style="display:flex;gap:6px"><button class="btn" data-act="refresh:${id}" title="Re-run validity and presence checks">↻ Refresh</button>${dev?`<button class="btn" data-act="share:${id}">${i.shared?"Shared":"Share"}</button>`:""}</span></div>
  <div class="hdr"><div style="display:grid;gap:6px"><h1>${d.det}</h1><div style="display:flex;gap:6px;flex-wrap:wrap">${pill(...STP[i.status])} ${pill(sevOf(id),sevOf(id)==="Critical"?"p-crit":"p-tag")}</div></div></div>
  <div class="ggi"><div class="ggimain"><div class="tabs ggtabs" aria-label="Incident sections"><button data-act="tab:overview" aria-pressed="${tab==="overview"}">Overview</button><button data-act="tab:occ" aria-pressed="${tab==="occ"}">Occurrences (${occ.length})</button><button data-act="tab:rem" aria-pressed="${tab==="rem"}">Remediation</button><button data-act="tab:act" aria-pressed="${tab==="act"}">Activity</button></div>
   <div class="ggpanels">${panel("overview",overview)}${panel("occ",occurrences)}${panel("rem",remediation)}${panel("act",activity)}</div></div>${aside}</div>`;},
map(){const ids=visibleIds();let id=+ggRoute.id;if(!ids.includes(id))id=ids[ids.length-1];const i=INC(id),d=DEF[id];
  if(!i.map){i.map=true;tl(id,"Exploration map viewed");}
  if(id===2871&&!S.f.prMap){S.f.prMap=true;award("prMap");}if(id===3112)S.f.thMap=true;
  if(id===2871&&S.f.scout&&!S.f.map3&&S.lv>=3){S.f.map3=true;award("map3");tl(2871,"New consumer found by ggscout: recon-batch (batch-01)");setTimeout(()=>flash("A third consumer: recon-batch on batch-01"),30);}
  const cons=consOf(id),hid=hasHidden(id),inVault=vaulted(id),v=keyValid(id),v2=id===2871?S.pr.v2:S.f.ottoRotated;
  const W=760,rowH=64,rows=cons.length+(hid?1:0),H=Math.max(240,rows*rowH+60),colX=[20,290,560],nw=190,nh=46;
  const st=c=>conState(id,c);const col=c=>st(c)==="down"?"#B42318":st(c)==="hard-v1"?"#A15C00":"#1D7A3D";
  const lab=c=>({"hard-v1":"uses the leaked key","hard-v2":"new key, hardcoded",vault:"reads from Vault",keyless:"keyless (no key)",down:"DOWN"})[st(c)];
  const cy=r=>40+r*rowH;const secY=inVault?H/2-70:H/2-nh/2,vY=H/2+24,resY=H/2-nh/2;
  const box=(x,y,w,stroke,t1,t2,dash)=>`<rect x="${x}" y="${y}" width="${w}" height="${nh}" rx="8" fill="${dash?"#F7F8FB":"#fff"}" stroke="${stroke}" stroke-width="2"${dash?' stroke-dasharray="4 4"':""}/><text x="${x+10}" y="${y+19}" font-family="Inter" font-size="12.5" font-weight="600" fill="#1B1F29">${esc(t1)}</text><text x="${x+10}" y="${y+35}" font-family="Inter" font-size="11" fill="#4A5163">${esc(t2)}</text>`;
  const line=(x1,y1,x2,y2,c,dash)=>`<path d="M${x1} ${y1} C${(x1+x2)/2} ${y1}, ${(x1+x2)/2} ${y2}, ${x2} ${y2}" fill="none" stroke="${c}" stroke-width="2"${dash?' stroke-dasharray="5 5"':""}/>`;
  let svg="";const secMid=secY+nh/2,vMid=vY+nh/2;
  cons.forEach((c,r)=>{svg+=line(colX[0]+nw,cy(r)+nh/2,colX[1],inVault&&st(c)==="vault"?vMid:secMid,col(c));});
  if(hid)svg+=line(colX[0]+nw,cy(cons.length)+nh/2,colX[1],secMid,"#6B7385",true);
  if(inVault)svg+=line(colX[1]+nw/2,vY,colX[1]+nw/2,secY+nh,"#1D7A3D");
  svg+=line(colX[1]+nw,secMid,colX[2],resY+nh/2,v?"#A15C00":"#6B7385",!v);
  cons.forEach((c,r)=>{svg+=box(colX[0],cy(r),nw,col(c),c.name,lab(c));});
  if(hid)svg+=box(colX[0],cy(cons.length),nw,"#6B7385","Unmapped sources may exist","hosts not integrated",true);
  svg+=box(colX[1],secY,nw,"#2D3FD8",d.det,(v?"leaked key active":"leaked key revoked")+(v2?" · new key active":""));
  if(inVault)svg+=box(colX[1],vY,nw,"#1D7A3D","Vault · HashiCorp Vault",`${d.path} · v${S.vault.production.length}`);
  svg+=box(colX[2],resY,180,"#6A7183",ACC[id],"accessed resource");
  const head=`<text font-family="Inter" font-size="12" font-weight="600" fill="#4A5163"><tspan x="${colX[0]}" y="22">Consumers</tspan><tspan x="${colX[1]}" y="22">${inVault?"Secret · Secrets manager":"Secret"}</tspan><tspan x="${colX[2]}" y="22">Accessed resources</tspan></text>`;
  return `<div class="crumb">NHI governance / Exploration</div><div class="hdr"><h1 style="overflow-wrap:anywhere">${esc(d.ident.split(" ")[0])}</h1><div style="display:flex;gap:6px;flex-wrap:wrap">${ids.map(x=>`<button class="btn ${x===id?"pri":""}" data-act="ggmap:${x}">#${x}</button>`).join("")}<button class="btn" data-act="open:${id}">Back to incident</button></div></div>
  <div class="card map"><div class="tw"><svg viewBox="0 0 ${W} ${H}" style="min-width:620px" role="img" aria-label="Exploration map: ${cons.length} consumer(s)${inVault?", stored in Vault":", not in a secrets manager"}: ${cons.map(c=>c.name+", "+lab(c)).join("; ")}">${head}${svg}</svg></div>
   <div style="font-size:13px;color:#545C6E">Workloads using this credential, from integrated sources.${inVault?" Consumers that read from Vault connect through it.":" Not in a secrets manager yet, so no vault appears on the map."} ${hid?"Some hosts aren't integrated with GitGuardian, so the map can be incomplete: ask the developer, check provider usage, or look around.":""} Amber: on the leaked key. Green: moved. Red: down.</div></div>`;},
endpoints(){const rows=FLEET();const prot=rows.filter(r=>r[4]==="Protected").length;
  return `<div class="hdr"><h1>Endpoints</h1><span style="color:#545C6E;font-size:13px">Endpoint protection</span></div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px"><div class="card"><h3>Endpoints scan</h3><div style="font:600 22px var(--f-ui)">${Math.round(100*rows.filter(r=>r[2]!=="Never").length/rows.length)}%</div></div><div class="card"><h3>Honeytoken protection</h3><div style="font:600 22px var(--f-ui)">${Math.round(100*prot/rows.length)}%</div></div><div class="card"><h3>AI hooks coverage</h3><div style="font:600 22px var(--f-ui)">${(()=>{const w=rows.filter(r=>(AGENTS[r[0]]||[]).length);return Math.round(100*w.filter(r=>hooksOn(r[0])).length/Math.max(1,w.length));})()}%</div></div><div class="card"><h3>With critical findings</h3><div style="font:600 22px var(--f-ui)">${rows.filter(r=>/^[1-9]/.test(r[3])).length}</div></div></div>
  <div class="card" style="padding:0"><div class="tw"><table class="t"><tr><th>Endpoint</th><th>Latest endpoint scan</th><th>Scan secrets</th><th>Honeytoken protection</th><th>AI agents</th></tr>${rows.map(r=>`<tr class="click" data-act="ep:${r[0]}"><td><b>${r[0]}</b><div style="color:#545C6E;font-size:12.5px">${esc(r[1])}</div></td><td>${r[2]}</td><td>${r[3]}</td><td>${pill(r[4],r[4]==="Protected"?"p-res":"p-ign")}</td><td>${aiCell(r[0])}</td></tr>`).join("")}</table></div></div>
  <div class="card"><h3>Add an endpoint</h3><div style="font-size:13.5px">Not every machine is enrolled: an endpoint missing from this list has no ggshield installed, so nothing on it is scanned. On a single machine, install ggshield with the machine scan plugin (per user, no sudo needed), run a first scan, then turn on protections:</div>
   <div class="run" style="white-space:pre-wrap;word-break:break-all">${INSTALL_CMD}\nggshield machine report\nggshield machine setup</div><div style="font-size:12.5px;color:#545C6E">Linux servers (Debian, Ubuntu, RHEL) are in Beta. For a fleet, deploy through your MDM with a service account token.</div></div>`;},
endpoint(){const host=ggRoute.host;const r=FLEET().find(x=>x[0]===host)||[host,"","","",""];const fs=epFindings(host);
  return `<div class="crumb"><button data-act="gg:endpoints">Endpoints</button> / ${host}</div><div class="hdr"><h1>${host}</h1>${pill(r[4],r[4]==="Protected"?"p-res":"p-ign")}</div>
  <div class="cols"><div class="card"><h3>Local scanning</h3><dl class="kv"><dt>Owner</dt><dd>${esc(r[1])}</dd><dt>Latest scan</dt><dd>${r[2]}</dd><dt>Scanner</dt><dd>ggshield 1.53.2 · machine_scan</dd></dl></div>
   <div class="card"><h3>Honeytoken protection</h3><dl class="kv"><dt>Status</dt><dd>${r[4]}</dd></dl></div></div>
  <div class="card"><h3>AI agents and MCP servers</h3>${(MCP[host]||[]).length?`<div style="font-size:13px">MCP servers: <span class="mono">${MCP[host].join(", ")}</span> · Subscription: company</div>`:""}${(AGENTS[host]||[]).length?`<div class="tw"><table class="t"><tr><th>Agent</th><th>AI hook</th></tr>${AGENTS[host].map(a=>`<tr><td>${a}</td><td>${hooksOn(host)?pill("Installed","p-res"):pill("Not installed","p-ign")}</td></tr>`).join("")}</table></div>${hooksOn(host)?"":'<div style="font-size:13px;color:#545C6E">No guardrails: this machine\'s agents can read secrets, send them in prompts, and get secret-bearing tool output back. Have the owner run <span class="mono">ggshield machine setup</span>.</div>'}`:'<div style="font-size:13px;color:#545C6E">No AI agents detected.</div>'}</div>
  <div class="card" style="padding:0"><div style="padding:12px 16px 0"><h3>Secrets</h3></div><div class="tw"><table class="t"><tr><th>Detector</th><th>Location</th><th>Validity</th><th>Severity</th><th></th></tr>
  ${fs.map(f=>`<tr><td><b>${f.det}</b></td><td class="mono">${esc(f.path)}</td><td>${f.valid==null?pill("Decoy","p-tag"):vpill(f.valid)}</td><td>${f.sev==="Critical"?pill("Critical","p-crit"):f.sev}</td><td style="text-align:right">${f.inc?`<button class="btn" data-act="open:${f.inc}">Incident #${f.inc}</button>`:f.ht?'<button class="btn" data-act="gg:honeytokens">Honeytoken</button>':""}</td></tr>`).join("")||'<tr><td colspan="5" style="color:#545C6E">No scan results yet.</td></tr>'}</table></div></div>`;},
honeytokens(){const h=S.ht;const rows=[["endpoint-sec-brickbook","sec-brickbook · ~/.aws/credentials (Planted)","Active"],["endpoint-juni-mbp","juni-mbp · ~/.aws/credentials (Planted)","Active"]];
  if(S.term&&S.term.batch&&S.term.batch.ht)rows.push(["endpoint-batch-01","batch-01 · ~/.aws/credentials (Planted)","Active"]);
  if(h)rows.unshift([h.name,h.planted?"precarium/precarium-sdk-examples · .env.example (public repo)":"Not deployed yet",h.revoked?"Revoked":h.fired&&!h.reset?"Triggered":"Active"]);
  return `<div class="hdr"><h1>Honeytokens</h1>${S.lv>=5&&!h?`<button class="btn pri" data-act="modal:htnew">Create honeytoken</button>`:`<span style="color:#545C6E;font-size:13px">Decoy AWS keys: any use is an alert</span>`}</div>
  <div class="card" style="padding:0"><div class="tw"><table class="t"><tr><th>Name</th><th>Source</th><th>Status</th></tr>${rows.map(r=>`<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td>${pill(r[2],r[2]==="Triggered"?"p-crit":r[2]==="Revoked"?"p-ign":"p-res")}</td></tr>`).join("")}</table></div></div>
  ${h?`<div class="card"><h3>${esc(h.name)} · events</h3>${h.planted?"":`<div style="font-size:13.5px">Put it where an attacker would look and nobody legitimate ever would.</div><div><button class="btn pri" data-act="htplant">Commit it to precarium-sdk-examples/.env.example (public repo)</button></div>`}
    ${h.planted&&!h.fired?`<div class="okbox">Deployed at ${hhmm(h.plantedAt)}. No events yet.</div><div><button class="btn" data-act="htwait">↻ Refresh events</button></div>`:""}
    ${h.fired?`<div class="tw"><table class="t"><tr><th>Timestamp</th><th>IP address</th><th>User agent</th><th>Action</th></tr><tr><td>Today ${clock(h.fired)}:12</td><td>185.220.101.47 (NL)</td><td class="mono">aws-cli/2.15.30 Python/3.11.8 Linux botocore/2.4</td><td class="mono">GetCallerIdentity</td></tr><tr><td>Today ${clock(h.fired)}:19</td><td>185.220.101.47 (NL)</td><td class="mono">aws-cli/2.15.30</td><td class="mono">ListBuckets</td></tr></table></div>
     <div style="font-size:13.5px">Triggered ${h.fired-h.plantedAt} minutes after the commit. No real resources sit behind a honeytoken: whoever tried it is scanning public GitHub for credentials.</div>
     <div style="display:flex;gap:8px;flex-wrap:wrap">${h.revoked?pill("Revoked","p-ign"):`<button class="btn" data-act="htreset">Reset</button><button class="btn danger" data-act="htrevoke">Revoke</button>`}</div>
     <div style="font-size:12.5px;color:#545C6E">Reset returns the honeytoken to Active (use it for false alarms). Revoke deactivates it; plant a new one somewhere else when you're done.</div>`:""}</div>`:""}`;},
perimeter(){const src=[["precarium/payments-api","GitHub","Monitored","Payments"],["precarium/ledger-service","GitHub","Monitored","Payments"],["precarium/payouts-worker","GitHub","Monitored","Payments"],["precarium/helpdesk-automation","GitLab","Monitored","IT"],["precarium/precarium-sdk-examples (public)","GitHub","Monitored","—"],["Kubernetes prod (ggscout)","Secrets inventory","Monitored","Platform"],["Vault (ggscout)","Secrets manager",S.f.scout?"Monitored":"Unmonitored","Platform"],["batch-01",S.term&&S.term.batch&&S.term.batch.inst?"Endpoint":"Not integrated",S.term&&S.term.batch&&S.term.batch.inst?"Monitored":"Unmonitored","—"],["helpdesk-01","Not integrated","Unmonitored","—"]];
  const pc=st=>pill(st,st==="Monitored"?"p-res":"p-ign");
  return `<div class="hdr"><h1>Perimeter</h1><span style="color:#545C6E;font-size:13px">Coverage hub</span></div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px"><div class="card"><h3>Monitoring</h3><div style="font:600 22px var(--f-ui)">9 / 27</div><div style="font-size:12.5px;color:#545C6E">repositories monitored</div></div><div class="card"><h3>Historical scan</h3><div style="font:600 22px var(--f-ui)">7 / 9</div><div style="font-size:12.5px;color:#545C6E">monitored sources scanned</div></div><div class="card"><h3>Ownership</h3><div style="font:600 22px var(--f-ui)">${src.filter(r=>r[3]!=="—").length} / ${src.length}</div><div style="font-size:12.5px;color:#545C6E">sources with a team</div></div><div class="card"><h3>Endpoints</h3><div style="font:600 22px var(--f-ui)">${FLEET().length}</div><div style="font-size:12.5px;color:#545C6E">enrolled</div></div></div>
  <div class="card" style="padding:0"><div class="tw"><table class="t"><tr><th>Source</th><th>Type</th><th>Status</th><th>Teams</th></tr>${src.map(r=>`<tr><td class="mono">${esc(r[0])}</td><td>${r[1]}</td><td>${pc(r[2])}</td><td>${r[3]}</td></tr>`).join("")}</table></div></div>
  <div style="font-size:12.5px;color:#545C6E">Anything unmonitored is a blind spot: GitGuardian never sees a secret pasted there. That's why the exploration map can be incomplete.</div>`;},
inventory(){if(!S.f.scout)return `<div class="hdr"><h1>Inventory</h1><span style="color:#545C6E;font-size:13px">NHI Governance · secrets collected by ggscout</span></div><div class="warnbox">ggscout only collects from Kubernetes right now: its Vault source is switched off in <span class="mono">/etc/ggscout/config.toml</span> on ops-tools. Nothing from Vault is inventoried.</div>`;
  const cur=vaultProd(),curOk=cur==="v2"?S.pr.v2:S.pr.v1;
  const rows=[["kv/payments/payrail","PayRail Secret Key","Production",curOk?"Valid":"Invalid",S.f.won2?S.player:"Payments team",2871],["kv/payments/legacy","PayRail Secret Key","Production",S.pr.v1?"Valid":"Invalid","—",2871],["kv/platform/datadog","Datadog API Key","Production","Valid","Platform team",null],["kv/ledger/postgres","PostgreSQL Credentials","Production","Cannot check","Payments team",null],["kv/growth/legacy-blob","Unknown","Staging","Cannot check","—",null]];
  const leaked=visibleIds().filter(id=>!vaulted(id)&&["TRIGGERED","ASSIGNED"].includes(INC(id).status));
  return `<div class="hdr"><h1>Inventory</h1><span style="color:#545C6E;font-size:13px">NHI Governance · secrets collected by ggscout</span></div>
  ${leaked.length?`<div class="warnbox">${leaked.length} leaked secret(s) aren't in a secrets manager: ${leaked.map(id=>`<button class="btn" data-act="open:${id}">#${id}</button>`).join(" ")} Push them to vault from the incident.</div>`:""}
  <div class="card" style="padding:0"><div class="tw"><table class="t"><tr><th>Secret</th><th>Detector</th><th>Environment</th><th>Validity</th><th>Owner</th><th>Incident</th></tr>${rows.map(r=>`<tr><td><b class="mono">${r[0]}</b><div style="color:#545C6E;font-size:12.5px">Vault · HashiCorp Vault</div></td><td>${r[1]}</td><td>${r[2]}</td><td>${pill(r[3],VALCLS(r[3]))}</td><td>${esc(r[4])}</td><td>${r[5]&&visibleIds().includes(r[5])?`<button class="btn" data-act="open:${r[5]}">#${r[5]}</button>`:"—"}</td></tr>`).join("")}</table></div></div>
  <div style="font-size:12.5px;color:#545C6E">ggscout classifies each vaulted value with the Secrets Detection Engine and checks validity and permissions from inside your network. Only hashes and metadata reach GitGuardian.</div>`;},
playbooks(){const pb=PBK();const row=(k,t,d)=>`<div class="toggle"><div><b style="font-weight:600">${t}</b><div style="font-size:13px;color:#545C6E">${d}</div></div><button class="btn ${pb[k]?"pri":""}" data-act="pb:${k}">${pb[k]?"On":"Off"}</button></div>`;
  return `<h1>Playbooks</h1><div class="card">${PLAYBOOKS.map(p=>row(p[0],p[1],p[2])).join("")}</div><div style="font-size:12.5px;color:#545C6E">Names and defaults follow GitGuardian's list of available playbooks. Only workspace Managers can change them.</div>`;},
workflow(){return `<h1>Remediation workflow</h1><div class="card"><div style="color:#545C6E;font-size:13px">Using the default GitGuardian workflow (GET /v1/remediation-workflow returns its steps with no id). Workspace Managers can create a custom workflow of up to 20 steps; each step has a title, a description and an optional link.</div><ol class="steps">${REMSTEPS.map(([t,d])=>`<li><div><b>${t}</b><span>${d}</span></div></li>`).join("")}</ol></div>`;},
secmgr(){return `<h1>Secrets managers</h1><div class="card"><dl class="kv"><dt>Integration</dt><dd><b>Vault</b> · HashiCorp Vault</dd><dt>Address</dt><dd class="mono">https://vault.precarium.internal:8200</dd><dt>Mode</dt><dd>read/write (receives Push to vault)</dd><dt>Collector</dt><dd>${S.f.scout?"ggscout 0.34.2 · fetch-and-send and sync-secrets every minute":'<span style="color:#B42318">ggscout 0.34.2 · Vault source commented out in config.toml</span>'}</dd><dt>Token scopes</dt><dd class="mono">nhi:send-inventory, nhi:write-vault</dd><dt>Last sync</dt><dd>${S.f.scout?clock(Math.max(0,S.t-1)):"never"}</dd></dl>
   <div class="run" style="white-space:pre-wrap">[sources.vault-prod]\ntype = "hashicorpvault"\nvault_address = "https://vault.precarium.internal:8200"\nmode = "read/write"\n\n# cron: * * * * *  ggscout sync-secrets config.toml</div></div>
  <div class="card"><dl class="kv"><dt>Not integrated</dt><dd>AWS Secrets Manager (Growth team account). Nobody has asked for it yet.</dd></dl></div>
  <div style="font-size:12.5px;color:#545C6E">Write support: HashiCorp Vault, AWS Secrets Manager, CyberArk Secrets Manager, Akeyless, Delinea Secret Server. Read-only: Azure Key Vault, Google Secret Manager, GitLab CI, Kubernetes.</div>`;}};
const REMSTEPS=[["Assess before acting","Review the secret's scope and privileges, identify dependent systems, understand the impact of revocation."],["Secure storage","Store the secret in a secrets manager."],["Update code","Modify applications to retrieve the secret from secure storage."],["Test & deploy","Deploy with non-regression testing; monitor that applications work."],["Rotate & revoke","Generate a new credential, update it in the secrets manager, revoke the compromised secret."],["Monitor & verify","Check access logs for unauthorized usage, verify dependent systems, document the incident."]];
function stepsOf(id){if(id===3112){const r=S.f.ottoRotated;return {assess:!!(S.f.thValid||S.f.thMap),store:false,code:r,deploy:r,rotate:r,verify:!!S.f.thResolved};}
  const all=effKey("checkout")==="v2"&&effKey("payouts")==="v2";return {assess:!!S.f.prMap,store:vaulted(2871),code:all,deploy:all&&S.c.recon==="vault",rotate:!S.pr.v1,verify:!!S.f.final};}
function PBK(){S.playbook=S.playbook||Object.fromEntries(PLAYBOOKS.map(p=>[p[0],p[3]]));return S.playbook;}
/* endpoints: the fleet, its AI agents and what each machine scan found */
const AGENTS={"juni-mbp":["Claude Code","Cursor"],"kenji-mbp":["Copilot CLI"],"wendell-mbp":["Cursor"]};
const MCP={"juni-mbp":["github","postgres-ledger"],"kenji-mbp":["kubernetes"],"sec-brickbook":["gitguardian"]};
const hooksOn=h=>!!(S.hooks&&S.hooks[h]);
const aiCell=h=>{const ag=AGENTS[h];if(!ag||!ag.length)return "No AI agents";return hooksOn(h)?`Covered (${ag.length}/${ag.length})`:`Not covered (0/${ag.length})`;};
const INSTALL_CMD="curl -sSfL https://raw.githubusercontent.com/GitGuardian/ggshield/main/scripts/install/install.sh | bash -s -- --plugin machine_scan";
function FLEET(){const rows=[["sec-brickbook",S.player,"Today 1:00 AM","0 critical","Protected"],["juni-mbp",PPL.juni.name,"Today 1:00 AM",S.f.hook?"0 critical":"1 critical","Protected"],["kenji-mbp",PPL.kenji.name,"Yesterday","0 critical","Protected"],["wendell-mbp",PPL.wendell.name,"Today 1:00 AM","0 critical","Unprotected"]];
  const b=S.term&&S.term.batch;if(b&&b.inst)rows.push(["batch-01","recon (service account)",b.scanned?b.scannedAt:"Never",b.scanned?(S.c.recon==="vault"?"0 critical":(S.pr.v1?"1 critical":"0 critical")):"—",b.ht?"Protected":"Unprotected"]);return rows;}
function epFindings(host){if(host==="juni-mbp")return [{det:"AWS Keys",path:"~/src/payments-api/scripts/backfill.sh",valid:!S.f.hook,sev:"Critical",inc:null}];
  if(host==="batch-01"){const b=S.term&&S.term.batch;if(!b||!b.scanned)return [];const f=[];if(S.c.recon!=="vault")f.push({det:"PayRail Secret Key",path:"crontab (user spool) · /var/spool/cron/recon",valid:S.pr.v1,sev:"Critical",inc:2871});f.push({det:"PayRail Secret Key",path:"~/.bash_history",valid:S.pr.v1,sev:"Critical",inc:2871});return f;}
  return [];}

/* ----- incident actions (07-actions equivalents), each gated by your access ----- */
const needEdit=id=>{if(canEdit(id))return true;flash(`Needs Can edit on #${id}. Your access: ${permFor(id)}.`);return false;};
ACT.noop=t=>flash(t);
ACT.refresh=id=>pcAct(()=>{recheck(+id,"on refresh");return {toast:"Validity and presence re-checked."};});
ACT.valid=id=>pcAct(()=>{const n=+id;recheck(n,"manually");tl(n,"Secret validity checked: "+(keyValid(n)?"valid":"invalid"));
  if(n===3112&&!S.f.thValid){S.f.thValid=true;return {toast:keyValid(n)?"Valid. The token still works.":"Invalid. The old token no longer works.",p:award("thValid")};}
  return {toast:n===2871?(keyValid(n)?`Valid. ${K1} still works at PayRail.`:"Invalid. PayRail rejects the old key."):(keyValid(n)?"Valid. The token still works.":"Invalid. The old token no longer works.")};});
ACT.presence=id=>pcAct(()=>{const n=+id,i=INC(n),p=presentNow(n);i.presence={p,at:clock(S.t)};tl(n,`Presence checked: ${p?"present in default branch":"no longer in default branch (still in git history)"}`);return {toast:p?"Still in the default branch.":"Removed from the default branch. It's still in git history."};});
ACT.assign=id=>{const n=+id;if(!needEdit(n))return;pcAct(()=>{const i=INC(n);i.status="ASSIGNED";i.assignee=S.player;tl(n,"Assigned to "+S.player);return {toast:"Assigned to you."};});};
ACT.reopen=id=>{const n=+id;if(!needEdit(n))return;pcAct(()=>{INC(n).status="TRIGGERED";INC(n).resolvedHow=null;tl(n,"Incident reopened");return {toast:"Reopened."};});};
ACT.sev=id=>{const n=+id;if(!needEdit(n))return;const v=document.getElementById("ggsevsel").value;pcAct(()=>{INC(n).severity=v;tl(n,"Severity set to "+v+" (manual)");return {toast:"Severity set to "+v+"."};});};
ACT.owner=id=>{const n=+id;if(!needEdit(n))return;pcAct(()=>{INC(n).owner="Payments team";tl(n,"Owner set to Payments team");return {toast:"Owner set."};});};
ACT.note=id=>{const n=+id;const v=((document.getElementById("ggnote")||{}).value||"").trim()||"Remediation in progress";pcAct(()=>{tl(n,"Note: "+v);const men=Object.values(PPL).map(p=>p.name).filter(nm=>new RegExp("@"+nm.split(" ")[0],"i").test(v));if(men.length)tl(n,"Mentioned "+men.join(", ")+" (notified by email)");return {toast:men.length?"Note added. "+men.join(", ")+" notified.":"Note added."};});};
ACT.share=id=>{const n=+id;if(!fullAccess(n)){flash(`Sharing needs Full access on #${n}. Your access: ${permFor(n)}.`);return;}if(INC(n).shared)return flash("Already shared.");modal={k:"share",id:n};renderPC();};
ACT.pushvault=id=>{modal={k:"pushvault",id:+id};renderPC();};
ACT.pb=k=>flash("Only workspace Managers can change playbooks. Marisol Vance is the Manager.");
ACT.resolveOk=id=>{const n=+id,i=INC(n);const yes=(document.querySelector('input[name=rv]:checked')||{}).value==="yes";modal=null;
  pcAct(()=>{i.status="RESOLVED";i.resolvedHow=yes?"revoked":"not-revoked";tl(n,"Resolved"+(yes?" (secret revoked)":" (secret not revoked)"));syncQuest(n);
    return {toast:keyValid(n)?"Resolved in GitGuardian. The key itself still works.":"Resolved."};});};
ACT.ignoreOk=id=>{const n=+id;const r=(document.querySelector('input[name=ig]:checked')||{}).value||"this is low risk secret";modal=null;
  pcAct(()=>{INC(n).status="IGNORED";INC(n).ignoreReason=r;tl(n,"Ignored: "+r);return {toast:keyValid(n)?"Ignored. GitGuardian stops alerting, but the key still works.":"Ignored."};});};
ACT.shareOk=id=>{const n=+id;modal=null;pcAct(()=>{const i=INC(n);i.shared=true;tl(n,"Shared with "+DEVNAME[DEF[n].dev]+" (feedback collection)");
  if(n===2871){mail("teo-bounce","Mail Delivery Subsystem","Undeliverable: GitGuardian shared an incident with you","The account teo.varga@precarium.io was disabled when the contract ended.\n\nDevelopers who leave take their context with them. The exploration map and the people who work on the code are what you have left.");tl(n,"Share link email to teo.varga@precarium.io bounced");}
  return {toast:"Incident shared."};});};
ACT.pushOk=id=>{modal=null;flash("Nothing to push to: ggscout's Vault source is switched off, so GitGuardian has no writable secrets manager yet.");};
ACT.csv=()=>{if(has("payments-incidents.csv"))return;pcAct(()=>{give("payments-incidents.csv");S.f.csv=true;return {toast:"payments-incidents.csv added to your items",p:award("csv")};});};
ACT.pci=()=>{if(S.f.pci)return;pcAct(()=>{give("PCI evidence");S.f.pci=true;return {toast:"PCI evidence added to your items",p:award("pci")};});};
ACT.htnew=f=>{const name=(f.querySelector("#htname").value||"aws-docs-example").trim();modal=null;pcAct(()=>{S.ht={name,planted:false};S.f.htMade=true;return {toast:"Honeytoken created",p:award("htMade")};});};
ACT.htplant=()=>pcAct(()=>{S.ht.planted=true;S.ht.plantedAt=S.t;S.ht.at=S.t+4;S.f.htPlanted=true;return {toast:"Committed to the public repo. Now wait.",p:award("htPlanted")};});
ACT.htwait=()=>pcAct(()=>({min:2,toast:S.ht.fired?"":"No events yet"}));
ACT.htreset=()=>pcAct(()=>{S.ht.reset=true;S.ht.fired=S.ht.fired;return {toast:"Reset. The honeytoken is Active again. (The events stay in the log.)"};});
ACT.htrevoke=()=>pcAct(()=>{S.ht.revoked=true;return {toast:"Honeytoken revoked."};});
Object.assign(MODALS,{
 resolve:m=>mwrap(`Resolve incident #${m.id}`,`<div style="font-size:13.5px">Has the secret been revoked? <span style="color:#545C6E">(Recorded on the incident as a declaration, secret_revoked.)</span></div><label><input type="radio" name="rv" value="yes" checked> Yes, the secret has been revoked</label><label><input type="radio" name="rv" value="no"> No, it hasn't been revoked</label>`,`<button class="btn" data-act="close">Cancel</button><button class="btn pri" data-act="resolveOk:${m.id}">Resolve</button>`),
 ignore:m=>mwrap(`Ignore incident #${m.id}`,`<div style="font-size:13.5px">Why are you ignoring this incident?</div>${["this is not a secret (false positive)","this is test credential","this is low risk secret","this is an invalid secret"].map((r,n)=>`<label><input type="radio" name="ig" value="${r}" ${n?"":"checked"}> ${r}</label>`).join("")}`,`<button class="btn" data-act="close">Cancel</button><button class="btn pri" data-act="ignoreOk:${m.id}">Ignore</button>`),
 share:m=>mwrap("Share incident",`<div style="font-size:13.5px">Public sharing creates a link to a standalone page with the incident, its occurrences, validity and how to remediate. Anyone with the link can see the secret.</div><label><input type="checkbox" checked> Feedback collection</label><label><input type="checkbox"> Resolve or ignore via link</label><label style="display:grid;gap:4px">Send the link to<input type="text" value="${DEF[m.id].dev==="teo"?"teo.varga":"otto"}@precarium.io" readonly></label><div style="font-size:12.5px;color:#545C6E">The link expires 30 days after creation, or 5 days after the incident is closed. Requires Full access on the incident.</div>`,`<button class="btn" data-act="close">Cancel</button><button class="btn pri" data-act="shareOk:${m.id}">Share</button>`),
 pushvault:m=>mwrap("Push to vault",`<div style="font-size:13.5px">Write this incident's secret into a secrets manager. ggscout picks up the instruction on its next <span class="mono">sync-secrets</span> run (every minute), writes it from inside your network and reports back. GitGuardian only ever stores a hash.</div><label style="display:grid;gap:4px">Secrets manager<select><option>${S.f.scout?"Vault · HashiCorp Vault (read/write)":"No writable secrets manager integrated"}</option></select></label><div style="font-size:12.5px;color:#545C6E">This pushes the leaked value. That's fine for moving consumers off a hardcoded key before you rotate. If the key was stolen, revoke first and store the new one.</div>`,`<button class="btn" data-act="close">Cancel</button><button class="btn pri" data-act="pushOk:${m.id}">Push</button>`)});
/* GitGuardian notification emails, laid out like Lossy's */
const notif=(h,b,btn)=>`<div class="notif"><div class="nh">${h}</div><div class="nb">${b}${btn||""}</div></div>`;
const goBtn=id=>`<div><button class="btn pri" data-act="mailgg:${id}">View incident</button></div>`;
const MAILHTML={
 bounce:()=>notif("Mail Delivery Subsystem · 47 messages undeliverable",`<div>The account <span class="mono">hal.bender@precarium.io</span> was disabled on July 31. These GitGuardian alerts are being sent to nobody.</div><dl class="kv"><dt>Most recent</dt><dd>[Critical] Incident #2871: PayRail Secret Key</dd><dt>Validity</dt><dd>${vpill(true)}</dd><dt>Source</dt><dd>Publicly exposed (gist)</dd><dt>First detected</dt><dd>41 days ago</dd></dl>`,goBtn(2871)),
 invite:()=>notif("GitGuardian · You've been invited",`<div>Marisol Vance invited you to the <b>Precarium</b> workspace.</div><dl class="kv"><dt>Role</dt><dd>Restricted</dd><dt>Access</dt><dd>Incidents shared with you</dd></dl>`,`<div><button class="btn pri" data-act="mailgg:list">Open GitGuardian</button></div>`),
 otto:null,
 pub2:()=>notif("GitGuardian Public Monitoring · Secret exposed publicly",`<div>A secret belonging to your organization was found in a public location.</div><dl class="kv"><dt>Incident</dt><dd>#2871</dd><dt>Location</dt><dd class="mono">gist.github.com/teo-varga-dev/8f2a</dd><dt>Secret</dt><dd>PayRail Secret Key · ${vpill(S.pr.v1)}</dd><dt>Linked internal occurrences</dt><dd>precarium/payments-api (2)</dd></dl><div class="warnbox">External exposure: the secret may already be in attackers' hands. Revoke it as fast as possible.</div>`,goBtn(2871)),
 ht:()=>notif("GitGuardian · Honeytoken triggered",`<div>The honeytoken <b>${esc((S.ht&&S.ht.name)||"aws-docs-example")}</b> was used.</div><dl class="kv"><dt>Source</dt><dd>precarium-sdk-examples · .env.example (public repo)</dd><dt>When</dt><dd>${S.ht&&S.ht.fired?hhmm(S.ht.fired):""}, ${S.ht?S.ht.fired-S.ht.plantedAt:4} minutes after the commit</dd><dt>IP</dt><dd>185.220.101.47 (NL)</dd><dt>Action</dt><dd class="mono">GetCallerIdentity</dd></dl><div class="warnbox">A decoy credential has no legitimate use. Someone is scanning your public repos for keys.</div>`,`<div><button class="btn pri" data-act="mailgg:ht">View honeytoken</button></div>`)};
