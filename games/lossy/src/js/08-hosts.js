/* ============================== hosts: nas01 (closet) and tvx-legacy-01 (Google Cloud) ============================== */
const VLOOK=(f,p)=>`$(vault kv get -field=${f} ${p})`;
const TVX_JSON=`/etc/tvx/sa-terravox-tiler.json`;
function hostInit(h){if(h==="nas01")return {cron:`# Edit this file to introduce tasks to be run by cron.\n#\n# m h  dom mon dow   command\n# support ticket summaries for the helpdesk (gary, 2021)\n*/15 * * * * OPENAI_API_KEY=sk-proj-…7Qd4 /opt/summarize.sh >> /var/log/summarize.log 2>&1\n# marketing digest queue flush (gary, 2020)\n0 * * * * SENDGRID_API_KEY=SG.…Hq3d /opt/digest.sh >> /var/log/digest.log 2>&1\n`,
    fs:{"/home/gary/TODO.txt":"- renew the nas01 disk warranty\n- move the summarizer key into vault before I leave!!\n- tell someone nas01 exists\n"},
    hist:[`sudo apt-get install -y jq vault`,`export OPENAI_API_KEY=sk-proj-…7Qd4`,`curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"`,`crontab -e`,`tail -f /var/log/summarize.log`,`echo "- move the summarizer key into vault before I leave!!" >> TODO.txt`,`vault login -method=approle`,`exit`],
    ep:{inst:false,scanned:false,ht:false,findings:[],scannedAt:null},dirty:true};
  return {fs:{"/etc/tvx/export.env":"PROJECT=terravox-maps-prod\nBUCKET=gs://tvx-imagery-eu\nGOOGLE_APPLICATION_CREDENTIALS=/etc/tvx/sa-terravox-tiler.json\n",
     [TVX_JSON]:`{\n  "type": "service_account",\n  "project_id": "terravox-maps-prod",\n  "private_key_id": "3f9a…c21e",\n  "private_key": "-----BEGIN PRIVATE KEY-----\\nMIIEv…\\n-----END PRIVATE KEY-----\\n",\n  "client_email": "tiler@terravox-maps-prod.iam.gserviceaccount.com"\n}\n`,
     "/opt/tvx/export.sh":"#!/bin/sh\n# nightly imagery export -bram\nset -a; . /etc/tvx/export.env; set +a\ngsutil -m rsync -r /data/imagery \"$BUCKET\"\n"},
    hist:[`sudo mkdir -p /etc/tvx`,`sudo cp ~/sa.json ${TVX_JSON}`,`gcloud auth activate-service-account --key-file=${TVX_JSON}`,`crontab -l`,`exit`],
    ep:{inst:false,scanned:false,ht:false,findings:[],scannedAt:null},dirty:false};}
const HOSTCFG={nas01:{user:"gary",name:"nas01",home:"/home/gary",sudo:false,banner:"Debian GNU/Linux 9 nas01 tty1\n\nnas01 login: gary (session restored)\nLast login: Tue Mar  2 17:41:09 2021 from 10.0.4.17\n\n*** System restart required ***\nType 'help' if you're lost. Gary was.",
    chips:["help","crontab -l","history","cat ~/.bash_history","tail /var/log/summarize.log",`vault kv get kv/lending/openai`,"crontab -e","ggshield machine report","exit"]},
  tvx:{user:"tvx-deploy",name:"tvx-legacy-01",home:"/home/tvx-deploy",sudo:true,banner:"Connected to tvx-legacy-01 (europe-west1-b) via Google Cloud SSH-in-browser.\nLinux tvx-legacy-01 4.19.0-21-cloud-amd64 #1 SMP Debian\n\nLast login: Fri Jun  4 09:12:33 2021 from 35.235.240.1\nThis VM has an attached service account: tvx-export@terravox-maps-prod.iam.gserviceaccount.com",
    chips:["help","ls /etc/tvx","cat /etc/tvx/export.env","history","sudo nano /etc/tvx/export.env",`sudo rm ${TVX_JSON}`,"/opt/tvx/export.sh","exit"]}};
/* consumer state derived from what's actually on the box */
function jobState(id,dc){const line=S.hosts.nas01.cron.split("\n").find(l=>l.includes(dc.job)&&!/^\s*#/.test(l));if(!line)return "off";
  if(!/^\s*\S+\s+\S+\s+\S+\s+\S+\s+\S+\s+\S/.test(line))return "broken";const d=DEF[id];const m=line.match(new RegExp(d.field+"=(\\$\\([^)]*\\)|\\S+)"));if(!m)return "broken";const v=m[1];
  if(v.includes(d.v1))return "hard-v1";if(d.v2&&v.includes(d.v2))return "hard-v2";
  if(v===VLOOK(d.field,d.path))return "vault";return "broken";}
function vmState(){const env=S.hosts.tvx.fs["/etc/tvx/export.env"];if(env==null)return "keyless";const l=env.split("\n").find(x=>/^\s*GOOGLE_APPLICATION_CREDENTIALS\s*=/.test(x));if(!l)return "keyless";
  const p=l.split("=")[1].trim();const f=S.hosts.tvx.fs[p];if(f==null)return "broken";if(f.includes(DEF[1219].v1))return "hard-v1";if(f.includes(DEF[1219].v2))return "hard-v2";return "broken";}
function jobErr(id,dc){const on=jobState(id,dc),d=DEF[id];if(on==="off")return null;if(on==="broken"){const line=S.hosts.nas01.cron.split("\n").find(l=>l.includes(dc.job)&&!/^\s*#/.test(l))||"";return /vault/.test(line)?`Error reading secret: check the path and -field (expected -field=${d.field} ${d.path})`:`${d.field} not set`;}
  if(on==="vault"&&!(S.vault[d.path]||[]).length)return `Error reading ${d.path}: no value found at ${d.path.replace(/^kv\//,"kv/data/")}`;
  return healthy(id,Object.keys(d.cons).find(k=>d.cons[k]===dc))?null:(d.prov==="sendgrid"?`HTTP 401 Unauthorized: {"errors":[{"message":"The provided authorization grant is invalid, expired, or revoked"}]}`:`HTTP 401 Unauthorized: {"error":{"message":"Incorrect API key provided","code":"invalid_api_key"}}`);}
const SECRET_RE=/sk-proj-…\w+|SG\.…\w+|ghp_…\w+/g;
function histText(h){return S.hosts[h].hist.join("\n");}
function histClean(h){return !/sk-proj-…|SG\.…|ghp_…/.test(histText(h));}
function histDirtyOnce(h){return S.hosts[h].dirty;}

/* ============================== terminal ============================== */
let TM=null;
function openTerm(host,o){const cfg=HOSTCFG[host];const via=o&&o.via;if(host==="nas01")foundNas();const ban=via==="pc"?`you@sec-thinkpad:~$ ssh -i ~/.ssh/nas01_gary gary@nas01\nLinux nas01 4.9.0-19-amd64 #1 SMP Debian 4.9.320-2 x86_64\nLast login: Tue Mar  2 17:41:09 2021 from 10.0.4.17\nType 'help' if you're lost. Gary was.`:cfg.banner;TM={host,via,out:[{t:ban,c:"dim"}],mem:S.hosts[host].hist.slice(),hi:0,mode:"sh",buf:"",orig:"",msg:"",file:null};TM.hi=TM.mem.length;renderTerm();}
function closeTerm(){if(!TM)return;const h=TM.host,via=TM.via;verb="hand";heldItem=null;iconbar();S.hosts[h].hist=TM.mem.slice(-500);/* bash writes its in-memory history on logout */TM=null;const p=checkAwards();PL().innerHTML="";
  if(p)flash(`+${p}`);if(h==="tvx"){openWin("gcp");renderPC();return;}if(via==="pc"){renderPC();return;}draw();checkEnd();}
function tprint(o,s,c){o.push(c?{t:s,c}:{t:s});}
const absPath=(a,home)=>a.replace(/^~(?=\/|$)/,home).replace(/^(?![\/])/,home+"/");
function fileGet(h,p){const H=S.hosts[h],cfg=HOSTCFG[h];if(p===cfg.home+"/.bash_history")return histText(h)+"\n";return H.fs[p];}
function shell(line){const h=TM.host,H=S.hosts[h],cfg=HOSTCFG[h];const o=[];const p=(s,c)=>tprint(o,s,c);
  let raw=line.trim();if(!raw)return o;let sudo=false;if(/^sudo\s/.test(raw)){if(!cfg.sudo){p(`[sudo] password for ${cfg.user}: `);p(`Sorry, try again. ${cfg.user} is not in the sudoers file. This incident will be reported.`);return o;}sudo=true;raw=raw.replace(/^sudo\s+/,"");}
  if(/install\.sh/.test(raw)&&/curl/.test(raw))return epInstall(o);
  const [cmd,...a]=raw.split(/\s+/);const arg=a.join(" ");
  switch(cmd){
  case "help":p(`Commands this console knows:\n  ls [dir]  cat FILE  tail [-n N] FILE  nano FILE  rm FILE  history [-c | -d N | -w]\n  whoami  hostname  uptime  date  pwd  clear  exit${h==="nas01"?"\n  crontab -l | -e     scheduled jobs\n  vault kv get [-field=NAME] PATH\n  /opt/summarize.sh  /opt/digest.sh   run a job by hand":"\n  sudo CMD            (tvx-deploy is a sudoer)\n  /opt/tvx/export.sh  run the export by hand"}${H.ep.inst?"\n  ggshield machine report | setup | redact [--dry-run] | doctor":"\n  curl -sSfL …/install.sh | bash -s -- --plugin machine_scan\n                      installs ggshield (GitGuardian's CLI) with the machine scan plugin;\n                      GitGuardian isn't installed here yet (full command: the install chip,\n                      or GitGuardian › Endpoint protection › Endpoints)"}`);break;
  case "ls":{const d=(arg.replace(/^-\w+\s*/,"")||"~");const L=h==="nas01"?{"~":"TODO.txt  notes/","/opt":"digest.sh  summarize.sh","/var/log":"digest.log  summarize.log  syslog","/":"bin  boot  dev  etc  home  opt  root  srv  tmp  usr  var"}:{"~":"","/etc/tvx":Object.keys(H.fs).filter(x=>x.startsWith("/etc/tvx/")).map(x=>x.split("/").pop()).join("  "),"/opt/tvx":"export.sh","/":"bin  boot  data  dev  etc  home  opt  root  tmp  usr  var"};
    const key=d.replace(/\/$/,"")||"/";let r=L[key]!==undefined?L[key]:L[d];if(/-a/.test(arg)&&key==="~")r=".  ..  .bash_history  "+(h==="nas01"?".vault-token  TODO.txt  notes/":(H.ep.ht?".aws/  ":""));if(r===undefined)p(`ls: cannot access '${d}': No such file or directory`);else if(r)p(r);break;}
  case "pwd":p(cfg.home);break;case "whoami":p(sudo?"root":cfg.user);break;case "hostname":p(cfg.name);break;
  case "date":p(`${DAYS[S.day].name.slice(0,3)} Mar ${16+S.day} ${hhmm(S.t).replace(/ (AM|PM)/,"")}:00 2026`);break;
  case "uptime":p(` ${short(S.t)}:00 up ${h==="nas01"?1843+S.day:1734} days,  1 user,  load average: 0.08, 0.03, 0.01`);break;
  case "clear":TM.out=[];return [];
  case "history":{if(a[0]==="-c"){TM.mem=[];p("");break;}if(a[0]==="-d"){const n=+a[1];if(!n||n<1||n>TM.mem.length){p(`bash: history: ${a[1]||""}: history position out of range`,"err");break;}TM.mem.splice(n-1,1);break;}
    if(a[0]==="-w"){H.hist=TM.mem.slice();p("");break;}TM.mem.forEach((x,i)=>p(`  ${String(i+1).padStart(3)}  ${x}`,/sk-proj-|SG\.…|ghp_/.test(x)?"hl":""));break;}
  case "cat":{const f=absPath(arg,cfg.home);if(h==="tvx"&&f===TVX_JSON&&!sudo&&H.fs[f]!=null){p(`cat: ${arg}: Permission denied`,"err");break;}const v=fileGet(h,f);
    if(v!=null)v.replace(/\n$/,"").split("\n").forEach(l=>p(l,/sk-proj-|SG\.…|ghp_|private_key_id/.test(l)?"hl":""));
    else if(/summarize\.log$/.test(arg))logLines(1017,"cron",6).forEach(l=>p(l,/ERROR/.test(l)?"err":""));else if(/digest\.log$/.test(arg))logLines(1103,"digest",4).forEach(l=>p(l,/ERROR/.test(l)?"err":""));
    else if(h==="nas01"&&/^\/opt\/(summarize|digest)\.sh$/.test(f))p(`#!/bin/sh\n# ${/summ/.test(f)?"summarize new helpdesk tickets with an LLM":"flush the marketing digest queue through SendGrid"}. -gary\nset -e\n: "\${${/summ/.test(f)?"OPENAI_API_KEY":"SENDGRID_API_KEY"}:?not set}"\n...`);
    else p(`cat: ${arg||"(missing operand)"}: No such file or directory`,"err");break;}
  case "tail":{const n=+(arg.match(/-n\s*(\d+)/)||[])[1]||5;if(/summarize\.log/.test(arg))logLines(1017,"cron",Math.min(n,12)).forEach(l=>p(l,/ERROR/.test(l)?"err":""));else if(/digest\.log/.test(arg))logLines(1103,"digest",Math.min(n,12)).forEach(l=>p(l,/ERROR/.test(l)?"err":""));else p(`tail: cannot open '${arg}' for reading: No such file or directory`,"err");break;}
  case "rm":{const f=absPath(a.filter(x=>!x.startsWith("-")).join(" "),cfg.home);if(h==="nas01"){p("You consider it. Then you remember the label on the box says DO NOT TURN OFF. You don't delete anything on Gary's box.");break;}
    if(f.startsWith("/etc/")&&!sudo){p(`rm: cannot remove '${f}': Permission denied`,"err");break;}if(H.fs[f]==null){p(`rm: cannot remove '${f}': No such file or directory`,"err");break;}
    delete H.fs[f];if(f===TVX_JSON){const pt=award("jsonrm",3);tl(1219,"Key file removed from tvx-legacy-01");if(vmState()==="broken")p("(The export still points GOOGLE_APPLICATION_CREDENTIALS at that file. The next run will fail.)","note");if(pt)p(`[+${pt}] No key file left on the VM.`,"note");}break;}
  case "nano":{const f=absPath(arg,cfg.home);if(!arg){p("Usage: nano FILE");break;}const v=fileGet(h,f);if(v==null&&!f.startsWith(cfg.home)){p(`[ Error reading ${f}: No such file or directory ]`,"err");break;}
    TM.mode="nano";TM.file=f;TM.sudo=sudo;TM.orig=v||"";TM.buf=TM.orig;TM.msg="";return null;}
  case "crontab":if(h!=="nas01"){p("no crontab for tvx-deploy (the export runs from /etc/cron.d/tvx-export)");break;}
    if(a[0]==="-l"){H.cron.split("\n").filter(Boolean).forEach(l=>p(l,/sk-proj-|SG\.…/.test(l)&&!l.startsWith("#")?"hl":l.startsWith("#")?"dim":""));const pt=revealNas("seen in nas01's crontab");if(pt)p(`[+${pt}] Hardcoded keys in a crontab. You add nas01 to the exploration map as a manual consumer.`,"note");}
    else if(a[0]==="-e"){const pt=revealNas("seen in nas01's crontab");if(pt)o.push({t:`[+${pt}] You add nas01's jobs to the exploration map as manual consumers.`,c:"note"});TM.out.push(...o);TM.mode="nano";TM.file="crontab";TM.orig=H.cron;TM.buf=H.cron;TM.msg="";return null;}
    else if(a[0]==="-r")p("crontab: that would delete every job, including the ones people rely on. You think better of it.");else p("usage: crontab [-l | -e | -r]");break;
  case "vault":{if(h!=="nas01"||a[0]!=="kv"||a[1]!=="get"){p(h==="nas01"?"Usage: vault kv get [-field=NAME] PATH":"bash: vault: command not found","err");break;}
    const field=(arg.match(/-field=(\S+)/)||[])[1];const path=a.filter(x=>!x.startsWith("-")&&x!=="kv"&&x!=="get")[0];const id=dayIncs(S.day).find(x=>DEF[x].path===path);
    if(!path){p("Not enough arguments (expected 1, got 0)","err");break;}if(!id||!(S.vault[path]||[]).length){p(`No value found at ${path.replace(/^kv\//,"kv/data/")}`,"err");break;}
    const vals=S.vault[path],val=keyLabel(id,vals[vals.length-1]);if(field){if(field===DEF[id].field)p(val);else p(`Field "${field}" not present in secret`,"err");break;}
    p(`====== Secret Path ======\n${path.replace(/^kv\//,"kv/data/")}\n\n======= Metadata =======\nKey                Value\n---                -----\nversion            ${vals.length}\n\n========= Data =========\nKey               Value\n---               -----\n${DEF[id].field.padEnd(18)}${val}`);break;}
  case "/opt/summarize.sh":case "/opt/digest.sh":{if(h!=="nas01"){p(`bash: ${cmd}: No such file or directory`,"err");break;}const [id,k]=cmd.includes("summ")?[1017,"cron"]:[dayIncs(S.day).filter(x=>DEF[x].prov==="sendgrid").pop()||1103,"digest"];
    if(!INC(id)){p(cmd.includes("summ")?"summarize.sh: ok":"digest.sh: queue flushed (12 messages)");break;}const err=jobErr(id,DEF[id].cons[k]);if(jobState(id,DEF[id].cons[k])==="off"){p(`${cmd.split("/").pop()}: ${DEF[id].field}: not set (the cron job that sets it is gone)`,"err");break;}
    p(err?`${cmd.split("/").pop()}: ERROR ${err}`:cmd.includes("summ")?"summarize.sh: summarized 9 tickets, posted to #support-digest":"digest.sh: queue flushed (12 messages)",err?"err":"");break;}
  case "/opt/tvx/export.sh":{if(h!=="tvx"){p(`bash: ${cmd}: No such file or directory`,"err");break;}const on=vmState();
    p(on==="keyless"?"Using attached service account tvx-export@terravox-maps-prod\nBuilding synchronization state...\nCopying file:///data/imagery/2026-03-19/... [42 files][1.9 GiB]\nexport: ok":on==="broken"?`ERROR: (gsutil) Could not load the default credentials. File ${(S.hosts.tvx.fs["/etc/tvx/export.env"]||"").match(/GOOGLE_APPLICATION_CREDENTIALS=(\S+)/)?.[1]||"?"} was not found.`:healthy(1219,"vm")?"Copying file:///data/imagery/2026-03-19/... [42 files][1.9 GiB]\nexport: ok (authenticated with a service account key file)":"ERROR: 401 Anonymous caller does not have storage.objects.create access: invalid_grant (Invalid JWT Signature: key disabled)",on==="broken"||!healthy(1219,"vm")?"err":"");break;}
  case "ggshield":return ggsh(a,o);
  case "exit":case "logout":closeTerm();return null;
  default:p(`bash: ${cmd}: command not found`,"err");}
  return o;}
function logLines(id,k,n){const out=[];if(!INC(id))return ["(no entries)"];const dc=DEF[id].cons[k];const now=START+S.t;const step=k==="cron"?15:60;let m=Math.floor(now/step)*step;const ds=INC(id).cons[k].downSince;
  for(let i=0;i<n;i++,m-=step){const ts=`2026-03-${16+S.day} ${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}:01`;const ok=ds==null&&jobState(id,dc)!=="off"||(ds!=null&&m<START+ds);
    if(!ok&&jobState(id,dc)==="off")continue;const err=ok?null:jobErr(id,dc);out.unshift(err?`${ts} ${dc.job}: ERROR ${err}`:`${ts} ${dc.job}: ${k==="cron"?"summarized "+(7+((m*13)%11))+" tickets":"queue flushed"}`);}
  return out.length?out:["(no new entries: the job isn't scheduled anymore)"];}
/* Endpoint Protection, simulated inside the game. Commands follow docs.gitguardian.com/endpoint-protection. */
function epInstall(o){const h=TM.host,H=S.hosts[h],cfg=HOSTCFG[h];const p=(s,c)=>tprint(o,s,c);if(H.ep.inst){p("ggshield is already installed (1.53.2).");return o;}
  p(`ggshield installer\n  Platform: linux-x86_64 (Debian)\n  Downloading ggshield 1.53.2 ... checksum verified\n  Installed to ${cfg.home}/.local/bin/ggshield (per user, no sudo needed)\n  Installing plugin machine_scan ... done\n  Logging in to https://dashboard.gitguardian.com\n  Requested scopes: scan, honeytokens:check, endpoints:send, ai-discover:send\n  Approved in the browser on your workstation.\n  Endpoint enrolled: ${cfg.name}`);
  p("(Linux servers are a Beta platform for Endpoint Protection.)","note");H.ep.inst=true;advance(4);const pt=S.day===1&&h==="nas01"?award("ep",1):0;if(pt)p(`[+${pt}] nas01 is enrolled. Next: ggshield machine report`,"note");return o;}
function ggsh(a,o){const h=TM.host,H=S.hosts[h],cfg=HOSTCFG[h];const p=(s,c)=>tprint(o,s,c);if(!H.ep.inst){p("bash: ggshield: command not found","err");return o;}
  const sub=a.slice(0,2).join(" ");
  if(a[0]==="--version"){p("ggshield, version 1.53.2");return o;}
  if(sub==="machine report"){const f=[];const ht=histText(h);
    if(h==="nas01"){const leak=[["OpenAI API Key",/sk-proj-…7Qd4/,1017,"v1"],["OpenAI API Key",/sk-proj-…m2Pa/,1017,"v2"]].filter(x=>x[1].test(ht));for(const x of leak)if(INC(x[2]))f.push({det:x[0],path:"~/.bash_history",valid:INC(x[2]).key[x[3]],sev:"Critical",inc:x[2]});}
    if(h==="tvx"&&H.fs[TVX_JSON]!=null&&INC(1219))f.push({det:"Google Cloud Service Account Key",path:TVX_JSON,valid:INC(1219).key.v1,sev:"Critical",inc:1219});
    H.ep.scanned=true;H.ep.findings=f;H.ep.scannedAt=DAYS[S.day].short+" "+hhmm(S.t);advance(3);
    p(`Scanning ${cfg.name} (standard mode)...\n  files scanned: ${h==="nas01"?"18,422":"9,107"}   env vars: 23   temp dirs: 2\n  skipped (permission denied): ${h==="nas01"?"/var/spool/cron/crontabs, /root":"/root"}${h==="tvx"?"\n  note: other users' files need sudo; /etc/tvx is group-readable by tvx-deploy":""}`);
    if(f.length){p("\nFINDINGS");f.forEach(x=>p(`  ${x.sev.padEnd(9)} ${x.det.padEnd(34)} ${x.path}  ${x.valid?"VALID":"invalid"}${x.inc?"  (matches incident #"+x.inc+")":""}`,x.valid?"hl":""));}else p("\nNo secrets found.");
    p("Results uploaded to GitGuardian › Endpoint protection › Endpoints.");
    if(h==="nas01"&&S.day===1){const pt=award("epscan",1);if(pt)p(`[+${pt}] nas01 shows up in the Endpoints dashboard with its findings.${/sk-proj-|SG\.…/.test(H.cron)?" Note what it couldn't read: crontabs live in a root-only spool, so the cron keys are invisible to a user-level scan.":""}`,"note");}
    if(h==="tvx"&&f.length)p("(The key file the export uses is on disk in plain text. Matches incident #1219.)","note");return o;}
  if(sub==="machine setup"||sub==="honeytoken plant"){p(`AI hooks: no AI coding agents found, skipped.\nGit hooks: ${h==="nas01"?"git not installed, skipped (warning)":"installed (pre-commit, pre-push)"}\nHoneytoken: re-authenticating with scope honeytokens:write ... ok\n  planted decoy AWS profile [default-ggh] in ${cfg.home}/.aws/credentials`);H.ep.ht=true;advance(2);
    const pt=S.day===1&&h==="nas01"?award("epht",1):0;if(pt)p(`[+${pt}] If anything ever harvests credentials on ${cfg.name}, GitGuardian will know which box it came from.`,"note");return o;}
  if(sub==="machine redact"){const dry=a.includes("--dry-run");const hits=TM.mem.filter(x=>/sk-proj-|SG\.…|ghp_/.test(x)).length+(/sk-proj-|SG\.…|ghp_/.test(histText(h))?0:0);const fileHits=H.hist.filter(x=>/sk-proj-|SG\.…|ghp_/.test(x)).length;
    if(!fileHits){p("Nothing auto-fixable: no secrets in shell history or log files.");return o;}
    if(dry){p(`Plan: redact ${fileHits} occurrence(s) in ${cfg.home}/.bash_history (replace secret with [REDACTED]). Run without --dry-run to apply.`);return o;}
    H.hist=H.hist.map(x=>x.replace(/sk-proj-…\w+|SG\.…\w+|ghp_…\w+/g,"[REDACTED]"));p(`Redacted ${fileHits} occurrence(s) in ${cfg.home}/.bash_history. Redaction cannot be undone.`);
    if(hits)p("(Your current shell still holds the old lines in memory, and bash rewrites ~/.bash_history from memory when you log out. Clear it with history -c, or the secret comes back.)","note");return o;}
  if(sub==="machine doctor"){p(`ggshield 1.53.2 · machine_scan plugin enabled\nToken scopes: scan, honeytokens:check, endpoints:send${H.ep.ht?", honeytokens:write":""}\nHoneytoken: ${H.ep.ht?"planted":"not planted (run ggshield machine setup)"}\nGit hooks: ${h==="nas01"?"skipped (no git)":"ok"}`);return o;}
  if(sub==="machine dashboard"){p("Local dashboard listening on http://127.0.0.1:8765. Open it in a browser on this machine. (There is no browser on this machine.)");return o;}
  p("Usage: ggshield machine [report | setup | redact | doctor | dashboard]");return o;}
/* saving from nano: crontab, env file, history, anything else */
function saveFile(){const h=TM.host,H=S.hosts[h],cfg=HOSTCFG[h],f=TM.file,txt=TM.buf;const res=[];
  if(f==="crontab"){if(S.day===4&&!PB.ok(7,"edit nas01's crontab"))return null;const bad=txt.split("\n").find(l=>l.trim()&&!l.startsWith("#")&&!/^\s*\S+\s+\S+\s+\S+\s+\S+\s+\S+\s+\S/.test(l));
    if(bad){res.push(`"/tmp/crontab.Xa13/crontab": bad minute\nerrors in crontab file, can't install.\nDo you want to retry the same edit? (y/n) n`);return res;}
    snapshot("before crontab change");H.cron=txt;res.push("crontab: installing new crontab");
    for(const [id,k] of [[1017,"cron"],[1103,"digest"],[1402,"digest"]]){if(!INC(id)||(!INC(id).created&&id!==1402))continue;const on=jobState(id,DEF[id].cons[k]);
      if(on==="vault"&&!(S.vault[DEF[id].path]||[]).length)res.push(`(${DEF[id].cons[k].job} now reads from Vault, but nothing is stored at ${DEF[id].path} yet. Its next run will fail until you store the secret.)`);
      if(on==="broken")res.push(`(Something in ${DEF[id].cons[k].job}'s line looks off. Run /opt/${DEF[id].cons[k].job} by hand to see.)`);
      if(on==="off")res.push(`(The ${DEF[id].cons[k].job} job is gone. Whatever it did will quietly stop.)`);}
    return res;}
  if(f===cfg.home+"/.bash_history"){H.hist=txt.replace(/\n$/,"").split("\n").filter(x=>x!=="");res.push(`[ Wrote ${H.hist.length} lines ]`);if(/sk-proj-|SG\.…|ghp_/.test(TM.mem.join("\n")))res.push("(bash still has the old lines in memory and rewrites this file when you log out. Run history -c before you exit.)");return res;}
  if(f.startsWith("/etc/")&&!TM.sudo){res.push(`[ Error writing ${f}: Permission denied ]`);return res;}
  H.fs[f]=txt;res.push(`[ Wrote ${txt.split("\n").filter(Boolean).length} lines ]`);
  if(f==="/etc/tvx/export.env"){tl(1219,"tvx-legacy-01 export.env edited");const on=vmState();if(on==="keyless")res.push("(No key file configured: the export will use the VM's attached service account.)");else if(on==="broken")res.push("(GOOGLE_APPLICATION_CREDENTIALS points at a file that isn't there.)");}
  return res;}
function renderTerm(){const L=PL();if(!TM)return;updateBar();const cfg=HOSTCFG[TM.host];
  if(TM.mode==="sh"){L.innerHTML=`<div class="term" id="termroot"><div class="crt" role="region" aria-label="${cfg.name} console">
    <div class="scr" id="tscr">${TM.out.map(x=>`<div class="ln ${x.c||""}">${esc(x.t)}</div>`).join("")}<form class="tin" id="tform"><label for="tinp">${cfg.user}@${cfg.name}:~$</label><input id="tinp" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Command"></form></div>
    <div class="chips" aria-label="Suggested commands">${chipsFor().map(c=>{const lab=c===INSTALL_CMD?"install ggshield: curl … install.sh | bash":c.length>48?c.slice(0,46)+"…":c;return `<button type="button" data-tchip="${esc(c)}" title="${esc(c)}"${c===INSTALL_CMD?' aria-label="Install ggshield with the machine scan plugin: '+esc(c)+'"':""}>${esc(lab)}</button>`;}).join("")}</div></div>
    <button class="walkaway" data-tclose>${TM.host==="tvx"||TM.via==="pc"?"Close the SSH session":"Step away from nas01"}</button></div>`;
    const s=document.getElementById("tscr");s.scrollTop=s.scrollHeight;try{document.getElementById("tinp").focus({preventScroll:true});}catch(e){}return;}
  const modified=TM.buf!==TM.orig;const fname=TM.file==="crontab"?"/tmp/crontab.Xa13/crontab":TM.file;
  L.innerHTML=`<div class="term" id="termroot"><div class="crt nano" role="region" aria-label="nano editor">
    <div class="nbar"><span>GNU nano 2.7.4</span><span>File: ${esc(fname)}</span><span>${modified?"Modified":""}</span></div>
    <textarea id="nanobuf" spellcheck="false" aria-label="File contents" rows="9">${esc(TM.buf)}</textarea>
    <div class="nmsg">${TM.mode==="ask"?`Save modified buffer?  (Answering "No" will DISCARD changes.)`:esc(TM.msg||"")}</div>
    ${TM.mode==="ask"?`<div class="nkeys"><button data-nano="y"><b>Y</b> Yes</button><button data-nano="n"><b>N</b> No</button><button data-nano="cancel"><b>^C</b> Cancel</button></div>`:
    `<div class="nkeys"><button data-nano="help"><b>^G</b> Get Help</button><button data-nano="write"><b>^O</b> Write Out</button><button data-nano="exit"><b>^X</b> Exit</button>${helperFor()?`<button data-nano="helper" class="helper">${helperFor()}</button>`:""}<button data-nano="undo"><b>M-U</b> Undo all</button></div>`}</div></div>`;
  const ta=document.getElementById("nanobuf");ta.addEventListener("input",()=>{TM.buf=ta.value;const m=document.querySelector(".nbar span:last-child");if(m)m.textContent=TM.buf!==TM.orig?"Modified":"";});
  if(TM.mode!=="ask"){try{ta.focus({preventScroll:true});}catch(e){}}}
function chipsFor(){const cfg=HOSTCFG[TM.host],H=S.hosts[TM.host];let c=cfg.chips.slice();if(!H.ep.inst)c.splice(c.length-1,0,INSTALL_CMD);else if(!H.ep.ht)c.splice(c.length-1,0,"ggshield machine setup");
  if(TM.host==="nas01"&&S.day>=2)c=c.map(x=>x.replace("kv/lending/openai","kv/plimbo/sendgrid").replace("summarize.log","digest.log"));if(H.ep.inst&&!c.includes("ggshield machine report"))c.splice(c.length-1,0,"ggshield machine report");
  if(/sk-proj-|SG\.…|ghp_/.test(TM.mem.join("\n")))c.splice(c.length-1,0,"history -c");
  /* every fix the console offers is a click away: secrets in the saved history can be edited out or redacted with ggshield */
  if((H.hist||[]).some(x=>/sk-proj-|SG\.…|ghp_/.test(x))){c.splice(c.length-1,0,"nano ~/.bash_history");if(H.ep.inst)c.splice(c.length-1,0,"ggshield machine redact --dry-run","ggshield machine redact");}
  return [...new Set(c)];}
function helperFor(){if(TM.file==="crontab")return "Insert Vault lookups";if(TM.file==="/etc/tvx/export.env")return "Use attached service account";if(/bash_history$/.test(TM.file))return "Delete lines with secrets";return null;}
function nano(k){if(!TM)return;const ta=document.getElementById("nanobuf");if(ta)TM.buf=ta.value;
  if(k==="helper"){const before=TM.buf;
    if(TM.file==="crontab"){const act=dayIncs(S.day).filter(id=>INC(id)&&(INC(id).created||S.day===4));
      if(act.includes(1017))TM.buf=TM.buf.replace(/OPENAI_API_KEY=(sk-proj-\S+)/,()=>"OPENAI_API_KEY="+VLOOK("OPENAI_API_KEY","kv/lending/openai"));
      if(act.some(id=>DEF[id].prov==="sendgrid"))TM.buf=TM.buf.replace(/SENDGRID_API_KEY=(SG\.\S+)/,()=>"SENDGRID_API_KEY="+VLOOK("SENDGRID_API_KEY","kv/plimbo/sendgrid"));}
    else if(TM.file==="/etc/tvx/export.env")TM.buf=TM.buf.split("\n").map(l=>/^\s*GOOGLE_APPLICATION_CREDENTIALS/.test(l)?"# "+l+"   # use the attached service account instead":l).join("\n");
    else TM.buf=TM.buf.split("\n").filter(l=>!/sk-proj-|SG\.…|ghp_/.test(l)).join("\n");
    TM.msg=TM.buf===before?"[ Nothing to change ]":"[ Done. ^O to write it out. ]";return renderTerm();}
  if(k==="undo"){TM.buf=TM.orig;TM.msg="[ Undid all changes ]";return renderTerm();}
  if(k==="help"){TM.msg=TM.file==="crontab"?"[ Edit the job lines, then ^O and ^X. Vault lookup: VAR=$(vault kv get -field=VAR kv/path) ]":"[ Edit, then ^O to write and ^X to exit. ]";return renderTerm();}
  if(k==="write"){TM.pend=true;TM.orig=TM.buf;TM.msg=`[ Wrote ${TM.buf.split("\n").length} lines ]`;return renderTerm();}
  if(k==="exit"){if(TM.buf!==TM.orig){TM.mode="ask";return renderTerm();}return finishNano();}
  if(k==="y"){TM.orig=TM.buf;TM.pend=true;return finishNano();}
  if(k==="n"){TM.buf=TM.orig;TM.pend=false;return finishNano();}
  if(k==="cancel"){TM.mode="nano";TM.msg="[ Cancelled ]";return renderTerm();}}
function finishNano(){TM.mode="sh";if(TM.pend){TM.pend=false;const r=saveFile();if(r===null){if(after())return;}else{r.forEach(x=>TM.out.push({t:x,c:/^\(|^\[\+/.test(x)?"note":""}));advance(TM.file==="crontab"?4:1);if(after())return;}}
  else TM.out.push({t:"No modification made"});const p=checkAwards();if(p)TM.out.push({t:`[+${p}]`,c:"note"});updateBar();renderTerm();}
document.addEventListener("submit",e=>{if(e.target.id!=="tform")return;e.preventDefault();runTerm(document.getElementById("tinp").value);});
function runTerm(v){if(!TM||S.dead)return;TM.out.push({t:`${HOSTCFG[TM.host].user}@${HOSTCFG[TM.host].name}:~$ `+v});if(v.trim()&&!/^\s/.test(v)&&!/^history\s+-[cdw]/.test(v.trim()))TM.mem.push(v.trim());TM.hi=TM.mem.length;
  const r=shell(v);if(after())return;if(r===null){if(TM)renderTerm();return;}r.forEach(x=>TM.out.push(x));const p=checkAwards();if(p)TM.out.push({t:`[+${p}]`,c:"note"});if(TM.out.length>400)TM.out=TM.out.slice(-300);renderTerm();}
document.addEventListener("click",e=>{const c=e.target.closest("[data-tchip]");if(c)return runTerm(c.dataset.tchip);
  if(e.target.closest("[data-tclose]"))return closeTerm();const n=e.target.closest("[data-nano]");if(n)return nano(n.dataset.nano);
  if(e.target.closest("#tscr")&&!e.target.closest("input")){const i=document.getElementById("tinp");if(i&&!String(window.getSelection&&window.getSelection()||""))i.focus();}});
document.addEventListener("keydown",e=>{if(!TM)return;
  if(TM.mode==="sh"&&e.target.id==="tinp"){if(e.key==="ArrowUp"&&TM.mem.length){e.preventDefault();TM.hi=Math.max(0,TM.hi-1);e.target.value=TM.mem[TM.hi]||"";}
    else if(e.key==="ArrowDown"){e.preventDefault();TM.hi=Math.min(TM.mem.length,TM.hi+1);e.target.value=TM.mem[TM.hi]||"";}
    else if(e.key==="Tab"){e.preventDefault();const v=e.target.value;const m=chipsFor().find(c=>v&&c.startsWith(v));if(m)e.target.value=m;}
    else if(e.key==="l"&&e.ctrlKey){e.preventDefault();TM.out=[];renderTerm();}else if(e.key==="d"&&e.ctrlKey){e.preventDefault();closeTerm();}return;}
  if(TM.mode==="nano"&&e.ctrlKey){const k={o:"write",x:"exit",g:"help"}[e.key.toLowerCase()];if(k){e.preventDefault();nano(k);}}
  else if(TM.mode==="ask"){const k={y:"y",n:"n"}[e.key.toLowerCase()]||(e.ctrlKey&&e.key.toLowerCase()==="c"?"cancel":null);if(k){e.preventDefault();nano(k);}}});
