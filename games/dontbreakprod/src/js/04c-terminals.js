/* ============================== Terminals (same markup and ggshield commands as LossyInc Range's hosts) ==============================
   batch-01: the box where recon-batch runs (reached over SSH from the laptop during the change window).
   ops-tools: Kenji's terminal on Floor 4, where ggscout's config lives.
   Everything is simulated: no command runs anywhere. */
let TM=null;
const HOSTCFG={
 batch:{name:"batch-01",user:"recon",via:"laptop",close:"Close the SSH session",
   motd:["Ubuntu 22.04.4 LTS · batch-01 · reconciliation jobs","Last login: 14 months ago from 10.4.0.12 (teo.varga)"]},
 ops:{name:"ops-tools",user:"kenji",via:"room",close:"Step away from Kenji's terminal",
   motd:["ops-tools · platform tooling (ggscout, backups, on-call scripts)","Logged in as kenji. Please don't touch anything that pages me."]}};
function TS(h){S.term=S.term||{};S.term[h]=S.term[h]||{inst:false,scanned:false,scannedAt:null,ht:false,redacted:false};return S.term[h];}
const HISTORY=()=>TS("batch").redacted?["cd /opt/recon","export PAYRAIL_KEY=[REDACTED]","./run.sh --since yesterday","crontab -e"]:["cd /opt/recon",`export PAYRAIL_KEY=${K1}`,"./run.sh --since yesterday","crontab -e"];
const CRON=()=>S.c.recon==="vault"?["# m h  dom mon dow   command","0 2 * * * PAYRAIL_KEY=$(vault kv get -field=api_key kv/payments/payrail) /opt/recon/run.sh --since yesterday","30 2 * * * /opt/recon/report.sh | mail -s \"recon\" finance-ops@precarium.io"]:FILES.recon.text.trim().split("\n");
function openTerm(host){const cfg=HOSTCFG[host];if(host==="batch"&&S.lv<6)return say("batch-01 only takes logins during the change window.");
  TM={host,out:cfg.motd.map(t=>({t,c:"dim"})),hist:[]};renderTerm();}
function chipsFor(){const h=TM.host,t=TS(h);
  if(h==="ops")return S.f.scout?["cat /etc/ggscout/config.toml","exit"]:["ls /etc/ggscout","cat /etc/ggscout/config.toml","sudoedit /etc/ggscout/config.toml"];
  const c=["crontab -l"];if(S.c.recon!=="vault")c.push("crontab -e");c.push("cat ~/.bash_history");
  if(!t.inst)c.push(INSTALL_CMD);else{c.push("ggshield machine report");if(!t.ht)c.push("ggshield machine setup");if(!t.redacted)c.push("ggshield machine redact --dry-run");}c.push("exit");return c;}
function renderTerm(){const L=PL();if(!TM)return;updateBar();const cfg=HOSTCFG[TM.host];
  L.innerHTML=`<div class="term" id="pcroot"><div class="crt" role="region" aria-label="${cfg.name} console">
    <div class="scr" id="tscr">${TM.out.map(x=>`<div class="ln ${x.c||""}">${esc(x.t)}</div>`).join("")}<form class="tin" id="tform"><label for="tinp">${cfg.user}@${cfg.name}:~$</label><input id="tinp" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Command"></form></div>
    <div class="chips" aria-label="Suggested commands">${chipsFor().map(c=>{const lab=c===INSTALL_CMD?"install ggshield: curl … install.sh | bash":c.length>48?c.slice(0,46)+"…":c;return `<button type="button" data-tchip="${esc(c)}" title="${esc(c)}"${c===INSTALL_CMD?' aria-label="Install ggshield with the machine scan plugin: '+esc(c)+'"':""}>${esc(lab)}</button>`;}).join("")}</div></div>
    <button class="walkaway" data-tclose>${cfg.close}</button></div>`;
  const s=document.getElementById("tscr");s.scrollTop=s.scrollHeight;try{document.getElementById("tinp").focus({preventScroll:true});}catch(e){}}
function closeTerm(){const h=TM&&TM.host;TM=null;PL().innerHTML="";if(h==="batch"&&has("laptop"))openPC(null,"laptop");else{iconbar();draw();}}
function tsay(lines,c){(Array.isArray(lines)?lines:[lines]).forEach(t=>TM.out.push({t,c}));}
function runCmd(raw){const cmd=raw.trim();const h=TM.host,cfg=HOSTCFG[h],t=TS(h);TM.out.push({t:`${cfg.user}@${cfg.name}:~$ ${cmd}`});if(!cmd)return renderTerm();advance(1);
  const a=cmd.replace(/\s+/g," ");
  if(a==="exit"||a==="logout")return closeTerm();
  if(a==="help")tsay(h==="ops"?["Try: ls /etc/ggscout · cat /etc/ggscout/config.toml · sudoedit /etc/ggscout/config.toml · exit"]:["Try: crontab -l · crontab -e · cat ~/.bash_history · ggshield machine report · exit"],"note");
  else if(a==="whoami")tsay(cfg.user);else if(a==="hostname")tsay(cfg.name);else if(a==="pwd")tsay(h==="ops"?"/home/kenji":"/home/recon");
  else if(h==="ops"){
    if(/^ls( -la)? \/etc\/ggscout\/?$/.test(a))tsay(["config.toml","ggscout.log"]);
    else if(a==="ls")tsay(["oncall-notes.md","backup.sh"]);
    else if(/^cat \/etc\/ggscout\/config\.toml$/.test(a))tsay(ED_BUF("ggscout").split("\n"),"");
    else if(/^(sudoedit|sudo nano|sudo vi|nano|vi|vim) \/etc\/ggscout\/config\.toml$/.test(a)){if(S.f.scout)tsay("Already done. The Vault source is on and syncing.","note");else{TM=null;return openEditor("ggscout","ops");}}
    else if(/^sudo /.test(a))tsay("Sorry, user kenji may only run sudoedit on /etc/ggscout/* on ops-tools.","err");
    else tsay(`bash: ${a.split(" ")[0]}: command not found`,"err");}
  else{/* batch-01 */
    if(a==="ls")tsay(["run.sh","report.sh","reports/"]);
    else if(a==="crontab -l")tsay(CRON(),"");
    else if(a==="crontab -e"){if(S.c.recon==="vault")tsay("No changes needed: the job reads the key from Vault.","note");else{TM=null;return openEditor("recon","batch");}}
    else if(/^cat (~\/)?\.bash_history$/.test(a))HISTORY().forEach(l=>tsay(l,/sk_live_/.test(l)?"hl":""));
    else if(a===INSTALL_CMD||/install\.sh \| bash/.test(a)){if(t.inst)tsay("ggshield 1.53.2 is already installed.","note");else{t.inst=true;tsay(["Installing ggshield 1.53.2 for user recon (no sudo needed)...","Adding plugin: machine_scan","Logged in to GitGuardian (Precarium) with a service account token.","Note: Linux server support is in Beta.","batch-01 is now enrolled in Endpoint protection."],"");tsay("Next: ggshield machine report","note");}}
    else if(/^ggshield /.test(a)&&!t.inst)tsay("bash: ggshield: command not found. Install it first (see GitGuardian › Endpoints › Add an endpoint).","err");
    else if(a==="ggshield machine report"){t.scanned=true;t.scannedAt=hhmm(S.t);const f=epFindings("batch-01");
      tsay(["Scanning batch-01 as user recon ...",`${f.length} secret(s) found:`],"");
      f.forEach(x=>tsay(`  ${x.det} · ${x.path} · ${x.valid?"VALID":"invalid"} · linked to incident #${x.inc}`,x.valid?"hl":""));
      if(!f.length)tsay("  none","");tsay("Results sent to GitGuardian › Endpoints › batch-01.","note");}
    else if(a==="ggshield machine setup"){t.ht=true;tsay(["AI hooks: skipped (no AI agents found)","Git hooks: skipped (git is not installed on this machine)","Honeytoken: planted in ~/.aws/credentials [default-ggh]","Protections are on. Status: Protected."],"");}
    else if(/^ggshield machine redact( --dry-run)?$/.test(a)){const dry=/dry-run/.test(a);if(t.redacted)tsay("Nothing left to redact.","note");
      else if(dry)tsay(["Plan: replace 1 secret in ~/.bash_history with [REDACTED]","Run without --dry-run to apply."],"");
      else{t.redacted=true;tsay(["Redacted 1 secret in ~/.bash_history.","Warning: your shell's in-memory history will rewrite the file at logout. Run: history -c"],"");}}
    else if(a==="history -c")tsay("(history cleared)","dim");
    else if(a==="ggshield machine doctor")tsay(["ggshield 1.53.2 · plugin machine_scan 0.9","Token scopes: scan, honeytokens:write, endpoints:write",`Honeytoken: ${t.ht?"planted":"not planted"}`,"Git hooks: n/a (git not installed)"],"");
    else if(/^ggshield /.test(a))tsay("Usage: ggshield machine [report | setup | redact | doctor | dashboard]","note");
    else if(/^vault /.test(a))tsay("vault: permission denied (recon's token can only read kv/payments/payrail at run time)","err");
    else tsay(`bash: ${a.split(" ")[0]}: command not found`,"err");}
  renderTerm();}
const ED_BUF=k=>k==="ggscout"&&S.f.scout?FILES.ggscout.fix(FILES.ggscout.text):FILES[k].text;
document.addEventListener("submit",e=>{if(e.target.id!=="tform"||!TM)return;e.preventDefault();const v=document.getElementById("tinp").value;TM.hist.push(v);runCmd(v);});
document.addEventListener("click",e=>{const c=e.target.closest("[data-tchip]");if(c&&TM){const i=document.getElementById("tinp");if(i){i.value=c.dataset.tchip;i.focus();}return;}if(e.target.closest("[data-tclose]")&&TM)closeTerm();});
