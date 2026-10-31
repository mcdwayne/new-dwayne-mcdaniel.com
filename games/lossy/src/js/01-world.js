
/* ============================== world constants ============================== */
/* stamped by build.py: the same ID appears on the title screen, in the menu and on the landing page */
const BUILD="__BUILD__";
const P={dana:"Dana Holm",ravi:"Ravi Okafor",amara:"Amara Diallo",coo:"Kofi Lopez",head:"Jae Ueda",isla:"Isla Dimitrov"};
const COMPANY=["Lossy Inc","Lossy Incorporated","LOSSI"];
const START=9*60;
const DAYS={
 1:{name:"Tuesday",short:"Tue",title:"The Agent Committed It",npc:"dana",audit:210,
   intro:()=>`Tuesday, 9:00 AM. ${COMPANY[0]}.\n\nYou're ${playerName()}, the newest member of the security team. ${P.head} is at a conference and left you the keys, figuratively. Your desk phone just buzzed: an email from GitGuardian.\n\nYOUR GOAL TODAY: kill the leaked key without breaking anything before the 12:00 disbursement run, then tell ${P.coo} it's handled.\n\nThis is day 1 of 3. Win or lose, tomorrow comes, and anything you leave broken comes with it.`},
 2:{name:"Wednesday",short:"Wed",title:"The Worm in the Lockfile",npc:"ravi",audit:360,
   intro:()=>`Wednesday, 9:00 AM. ${COMPANY[1]}. Legal finished the rebrand overnight; the old letterhead is in the recycling.\n\nGitGuardian Public Monitoring caught two of your secrets in a brand-new public GitHub repository, plimbo-bot/env-dump-7f3a. A poisoned npm package, colorfmt 4.1.2, ran its install script inside Plimbo's CI last night, scooped up the environment, and published it.\n\nEvery CI run that still installs that package leaks whatever secrets it can see. Including new ones.\n\nYOUR GOAL TODAY: stop the worm, kill the stolen keys, and keep Plimbo's password resets and the 2:00 PM app-store release working. Then tell ${P.coo}.`},
 3:{name:"Thursday",short:"Thu",title:"Ghost of the Acquisition",npc:"amara",audit:360,
   intro:()=>`Thursday, 9:00 AM. ${COMPANY[2]}. The new logo is a lowercase "lossi" with no explanation.\n\nGitGuardian Public Monitoring found a Google Cloud service account key inside a public Docker image from Terravox, the mapping startup the company acquired in 2022. Nobody from Terravox works here anymore. Mapwende, the NGO line, runs on that project, and flood-response teams download offline maps at 1:00 PM.\n\nYOUR GOAL TODAY: kill the public key, keep Mapwende's maps flowing, and find whatever else still uses it. GitGuardian can't revoke Google Cloud keys for you, and nobody here has admin on that project. Yet.`},
 4:{name:"Friday",short:"ULT",title:"ULTIMATE: Patient Zero",npc:"ravi",audit:300,ultimate:true,
   intro:()=>`Friday, 9:00 AM. ULTIMATE.\n\nAt 3:12 AM the decoy AWS key that Endpoint Protection planted on ${P.ravi}'s MacBook was used from an IP abroad. Nobody uses a decoy by accident: an infostealer is on that laptop.\n\nThe damage is already done. By 3:40 AM the attacker had used Ravi's GitHub token to clone private repositories and read secrets out of Vault with his Vault token. You can't undo that. You can only stop it going further.\n\nThere is exactly one way through: the incident playbook in your desk drawer (IR-07, Endpoint Compromise). Do every step, in order. Skip one, or do one early, and you lose.\n\nGo get the binder.`}};
/* incident definitions: static facts. Runtime state lives in S.incs[id]. */
const SG={det:"SendGrid API Key",prov:"sendgrid",revGG:true,sev:"Critical",dev:"ravi",line:"Plimbo",path:"kv/plimbo/sendgrid",field:"SENDGRID_API_KEY",v1:"SG.…Hq3d",v2:"SG.…Lm7e",ident:"sendgrid:plimbo-prod · Full Access",
  cons:{api:{name:"plimbo-api (password resets)",kind:"ci",repo:"plimbo-api",wf:"deploy",desc:"workload · prod"},
        digest:{name:"weekly digest cron (nas01)",kind:"cron",host:"nas01",job:"digest.sh",desc:"cron · on-prem",hidden:true}}};
const GH={det:"GitHub Personal Access Token",prov:"github",revGG:true,sev:"Critical",dev:"ravi",line:"Plimbo",path:"kv/plimbo/github",field:"GH_RELEASE_TOKEN",
  cons:{release:{name:"plimbo-ios release workflow",kind:"ci",repo:"plimbo-ios",wf:"release",desc:"CI · release train 2 PM"}}};
const DEF={
 1017:{day:1,det:"OpenAI API Key",prov:"ai",revGG:true,sev:"Critical",dev:"dana",line:"Skoupmouz",
   src:{kind:"repo",repo:"skoupmouz-ledger-batch",file:".mcp.json",commit:"4f1c9e2",author:"ai-coding-agent (for Dana Holm)"},
   path:"kv/lending/openai",field:"OPENAI_API_KEY",v1:"sk-proj-…7Qd4",v2:"sk-proj-…m2Pa",ident:"openai:skoupmouz-prod",
   cons:{repay:{name:"repayments-svc",kind:"ci",repo:"skoupmouz-repayments",wf:"deploy",desc:"workload · prod"},
         ledger:{name:"ledger-batch pipeline",kind:"ci",repo:"skoupmouz-ledger-batch",wf:"deploy",desc:"CI · nightly"},
         cron:{name:"support-summarizer cron (nas01)",kind:"cron",host:"nas01",job:"summarize.sh",desc:"cron · on-prem",hidden:true}}},
 1102:Object.assign({},GH,{day:2,src:{kind:"public",where:"github.com/plimbo-bot/env-dump-7f3a",file:"results.json (double base64)"},v1:"ghp_…k2Rw",v2:"github_pat_…8TzQ",ident:"github:plimbo-bot · classic PAT (repo, workflow)"}),
 1103:Object.assign({},SG,{day:2,src:{kind:"public",where:"github.com/plimbo-bot/env-dump-7f3a",file:"results.json (double base64)"}}),
 1219:{day:3,det:"Google Cloud Service Account Key",prov:"gcp",revGG:false,sev:"Critical",dev:null,line:"Mapwende",
   src:{kind:"public",where:"hub.docker.com/r/terravox/tiler:2021-legacy",file:"layer 7 · /app/creds/sa.json"},
   path:"kv/mapwende/gcp-tiler",field:"GCP_SA_KEY",v1:"3f9a…c21e",v2:"8b1d…07fa",ident:"gcp:tiler@terravox-maps-prod.iam.gserviceaccount.com",
   cons:{tiler:{name:"tile-renderer (Cloud Run)",kind:"ci",repo:"mapwende-tiler",wf:"deploy",desc:"workload · prod"},
         sync:{name:"field-sync API",kind:"ci",repo:"mapwende-field-sync",wf:"deploy",desc:"workload · prod"},
         vm:{name:"imagery export (tvx-legacy-01)",kind:"vmenv",host:"tvx",desc:"GCE VM · cron",hidden:true}}},
 1401:Object.assign({},GH,{day:4,src:{kind:"endpoint",host:"ravi-mbp",files:["~/.config/gh/hosts.yml","~/.zsh_history"]},v1:"ghp_…Wq81",v2:"github_pat_…3NcV",ident:"github:ravi-okafor · classic PAT (repo, workflow)"}),
 1402:Object.assign({},SG,{day:4,src:{kind:"endpoint",host:"ravi-mbp",files:["~/code/plimbo-api/.env"]}}),
 1403:{day:4,det:"HashiCorp Vault Token",prov:"vaulttok",revGG:false,sev:"High",dev:"ravi",line:"Plimbo",
   src:{kind:"endpoint",host:"ravi-mbp",files:["~/.vault-token"]},path:null,field:null,v1:"hvs.…r4Kp",v2:null,ident:"vault:token ravi-okafor · policy plimbo-dev (read kv/plimbo/*)",cons:{}}};
const POINTS={
 1:{incident:5,assign:2,check:4,assess:5,stopAgent:7,cron:7,share:1,vault:7,repay:7,ledger:5,cronfix:7,newkey:5,vault2:5,revoke:7,logs:4,resolved:2,kofi:3,drawer:2,ep:4,epscan:2,epht:2,history:3,sticky:1,duck:1,aihooks:2},
 2:{open:4,check:3,contain:10,ravi:3,sgrevoke:8,patrevoke:8,sgnew:4,patnew:4,sgvault:4,patvault:4,api:7,release:7,digest:6,digestfound:5,logs:4,audit:4,resolved:4,kofi:3,assign:2,map:2,share:2,aihooks:2},
 3:{pubopen:5,check:3,assign:2,owner:5,amara:3,breakglass:6,findvm:7,newkey:5,vault:5,tiler:7,sync:7,vm:8,jsonrm:4,disable:9,delete:6,logs:7,resolved:4,kofi:3,map:2,aihooks:2},
 4:{binder:3,ht:6,isolate:10,inc1401:3,inc1402:3,inc1403:3,vtrevoke:8,patrevoke:6,sgrevoke:6,patnew:3,sgnew:3,vault:6,api:5,release:5,digest:5,audit:4,vaudit:4,logs:4,resolved:4,htrevoke:5,kofi:2,aihooks:2}};
/* ============================== state ============================== */
/* the player's name; a new game suggests a random one */
const NAME_FIRST=["Alex","Sam","Jordan","Priya","Mateo","Noor","Kai","Lena","Tariq","Mei","Diego","Ines","Femi","Hana","Rosa","Theo","Yara","Omar","Wren","Ivo"];
const NAME_LAST=["Keyes","Vaultman","Rotello","Hashworth","Tokenberg","Saltwell","Okoro","Lindqvist","Patchett","Revokovich","Cipriano","Nakamura","Ferreira","Mbeki","Gruber","Quill","Entwhistle","Sato","Brannigan","Delacroix"];
function randomName(){const r=a=>a[Math.floor(Math.random()*a.length)];return r(NAME_FIRST)+" "+r(NAME_LAST);}
const playerName=()=>(S&&S.player)||"you";const first=()=>((S&&S.player)||"you").split(" ")[0];
let S=null, snaps=[], verb="hand", heldItem=null, frame=0, db=null;
function freshInc(id,created){const d=DEF[id];const cons={};for(const k in d.cons){const c=d.cons[k];cons[k]={on:"hard-v1",pending:null,known:!c.hidden,downSince:null};}
  return {id,created,status:"TRIGGERED",assignee:null,checked:false,timeline:[],tags:[],resolvedHow:null,ignoreReason:null,shared:false,feedback:false,presence:false,logs:false,map:false,
    key:{v1:true,v2:false,del:false},public:d.src.kind==="public",cons,owner:null};}
const PLAYBOOKS=[["autoShare","Auto-share incident public link to involved developer","When an incident is created, the developer who committed the secret gets a public link to it, with feedback collection.",false],
 ["autoGrant","Auto-grant access to involved developer (in-app)","The involved developer gets access to the incident in GitGuardian.",false],
 ["autoResolve","Auto-resolve revoked secrets","When a valid secret is revoked and its validity becomes invalid, the incident is resolved with the reason \"Secret was revoked\".",true],
 ["autoIgnoreInvalid","Auto-ignore invalid secrets","Incidents whose secret is invalid when detected are ignored with the reason \"Invalid secret\".",true],
 ["autoIgnoreFP","Auto-ignore false positives","Incidents tagged as false positives are ignored with the reason \"False positive (not a secret)\".",true]];
function PBK(){if(!S.playbook||S.playbook.autoIgnoreFP===undefined){const o={};for(const p of PLAYBOOKS)o[p[0]]=(S.playbook&&p[0] in S.playbook)?S.playbook[p[0]]:p[3];S.playbook=o;}return S.playbook;}
function fresh(){const s={v:7,day:1,score:{1:0,2:0,3:0,4:0},t:0,room:"desk",inv:[],seen:{},dead:null,ended:false,dayWon:null,results:{},got:{},
  f:{drawer:false,agentStopped:false,contained:false,isolated:false,breakglass:false,htRevoked:false,restolenAt:null,doneNotified:{},cronDownNotified:false,digestDownNotified:false,vmDownNotified:false,binder:false},pb:{step:0,log:[]},
  incs:{},vault:{},mail:[],
  hosts:{nas01:hostInit("nas01"),tvx:hostInit("tvx")},usage:[]};
  return s;}
const hhmm=t=>{const m=START+t,h=Math.floor(m/60),mm=m%60;return `${((h+11)%12)+1}:${String(mm).padStart(2,"0")} ${h<12?"AM":"PM"}`;};
const short=t=>{const m=START+t;return `${Math.floor(m/60)}:${String(m%60).padStart(2,"0")}`;};
const INC=id=>S.incs[id];
const vlast=path=>{const a=S.vault[path]||[];return a[a.length-1];};
/* which credential a consumer actually uses right now */
function conOn(id,k){const c=INC(id).cons[k],d=DEF[id].cons[k];
  if(d.kind==="cron")return jobState(id,d);
  if(d.kind==="vmenv")return vmState(id);
  return c.on;}
function keyWorks(id,which){const k=INC(id).key;return which==="v1"?k.v1:which==="v2"?k.v2:false;}
function healthy(id,k){const on=conOn(id,k);if(on==="hard-v1")return keyWorks(id,"v1");if(on==="hard-v2")return keyWorks(id,"v2");
  if(on==="vault"){const l=vlast(DEF[id].path);return !!l&&keyWorks(id,l);}if(on==="keyless")return true;return false;}
const consOf=id=>Object.keys(DEF[id].cons);
const allHealthy=id=>consOf(id).every(k=>healthy(id,k));
const known=id=>consOf(id).filter(k=>INC(id).cons[k].known);
function incDone(id){const i=INC(id);return !!i&&i.created&&!i.key.v1&&allHealthy(id)&&i.status==="RESOLVED";}
function dayIncs(d){return Object.keys(DEF).map(Number).filter(id=>d===4?DEF[id].day===4:DEF[id].day<=d);}
function openIncs(){return dayIncs(S.day).filter(id=>!incDone(id));}
function dayExtras(d){if(d===1)return !!INC(1017).logs;if(d===2)return S.f.contained;if(d===4)return S.f.isolated&&S.f.htRevoked&&PB.done();return true;}
function dayDone(){const ds=S.day===4?[4]:[1,2,3].filter(d=>d<=S.day);if(!ds.every(dayExtras))return false;return dayIncs(S.day).every(id=>INC(id)&&incDone(id));}
function award(k,day){day=day||S.day;if(day===4&&S.day!==4)return 0;const key=day+"."+k;if(S.got[key])return 0;const base=(POINTS[day]||{})[k];if(!base)return 0;S.got[key]=1;
  const p=day<S.day?Math.ceil(base/2):base;S.score[day]+=p;return p;}
const got=(k,day)=>!!S.got[(day||S.day)+"."+k];
const total=()=>S.score[1]+S.score[2]+S.score[3];
const maxScore=()=>S.day===4?100:300;const shownScore=()=>S.day===4?S.score[4]:total();
function tl(id,text){INC(id).timeline.push([short(S.t),text]);}
function snapshot(label){snaps.push({label:label||"",t:S.t,day:S.day,s:JSON.stringify(S)});if(snaps.length>80)snaps.shift();}
function mail(id,from,subj,t){if(S.mail.some(m=>m.id===id))return;S.mail.push({id,from,subj,time:short(t??S.t),day:S.day,read:false});}
function createInc(id){const i=INC(id);if(i&&i.created)return 0;S.incs[id]=S.incs[id]||freshInc(id,true);const n=S.incs[id];n.created=true;
  n.timeline=[[short(S.t),"Incident created from Endpoint protection finding on "+DEF[id].src.host]];n.tags=DEF[id].revGG?["Revocable by GitGuardian"]:[];
  return award("inc"+id,DEF[id].day);}
/* set up a day's world: incidents that exist at 9:00, mail, carried-over consumers keep their state */
function beginDay(d){S.day=d;S.t=0;S.room="desk";S.dead=null;S.dayWon=null;
  const pre=(id,tl0,tags)=>{if(S.incs[id])return;S.incs[id]=freshInc(id,true);S.incs[id].timeline=tl0;S.incs[id].tags=tags;};
  if(d===1){pre(1017,[["9:04","Incident triggered by real-time scan"],["9:04","Validity checked automatically: valid"]],["Default branch","Revocable by GitGuardian"]);
    mail("kofi1",P.coo,"Noon disbursement run: please no surprises",-9);mail("gg1","GitGuardian","[GitGuardian] New incident: OpenAI API Key in skoupmouz-ledger-batch",4);}
  if(d===2){for(const id of [1102,1103])pre(id,[["2:51","Public incident triggered by GitGuardian Public Monitoring"],["2:51","Validity checked automatically: valid"]],["Publicly leaked","Revocable by GitGuardian"]);
    S.incs[1102].public=true;S.incs[1103].public=true;
    mail("kofi2",P.coo,"Plimbo release train: 2 PM, no slipping",-15);mail("dep2","GitHub","[plimbo-api] Malicious version of colorfmt (4.1.2) in your lockfile",-5);mail("pub2","GitGuardian","[GitGuardian] 2 public incidents: secrets in plimbo-bot/env-dump-7f3a",-3);}
  if(d===3){pre(1219,[["7:58","Public incident triggered by GitGuardian Public Monitoring (Docker image layer)"],["7:58","Validity checked automatically: valid"]],["Publicly leaked"]);
    mail("kofi3",P.coo,"Mapwende flood response: maps by 1 PM",-20);mail("pub3","GitGuardian","[GitGuardian] Public incident: Google Cloud key in a public Docker image",-1);mail("amara1",P.amara,"Rhinvale delta teams leave at 1",-10);}
  if(d===4){mail("ht4","GitGuardian","[GitGuardian] Honeytoken triggered on endpoint ravi-mbp",-348);mail("kofi4",P.coo,"Heard about the laptop. Follow the playbook.",-5);}
  for(const id in S.incs)for(const k in S.incs[id].cons){const c=S.incs[id].cons[k];if(c.downSince!=null)c.downSince=0;}}

/* ============================== time & consequences ============================== */
function advance(min){if(S.dead||S.dayWon)return;const before=S.t;S.t+=min;const cross=x=>before<x&&S.t>=x;
  const say2=(who,txt)=>msgBox(txt,who);
  for(const id of dayIncs(S.day)){if(!INC(id)||!INC(id).created)continue;for(const k of consOf(id)){const c=INC(id).cons[k];const h=healthy(id,k);if(!h&&c.downSince==null)c.downSince=S.t;if(h)c.downSince=null;}}
  /* day 1 story */
  if(S.day===1&&cross(60)){const i=INC(1017);
    if(!S.f.agentStopped&&(S.f.aiHooks||{})["dana-mbp"]){tl(1017,"ggshield AI hook on dana-mbp blocked the coding agent from reading .mcp.json (secret detected)");say2("Your phone",`${P.dana}'s agent tried to bundle the working tree into a public repro. Its pre-tool hook fired: ggshield blocked it from reading .mcp.json because the file contains a secret. The repro went out without the key.\n\nThat's the AI hooks you asked her to install.`);}
    else if(!S.f.agentStopped&&!i.public&&i.key.v1){i.public=true;i.tags.push("Publicly leaked");tl(1017,"Public exposure detected: linked public incident");
      mail("pub","GitGuardian","[GitGuardian] Public incident: your OpenAI API Key is on public GitHub");
      say2("Your phone",`BZZT. GitGuardian Public Monitoring: the OpenAI key from incident #1017 just showed up in a PUBLIC repository. ${P.dana}'s coding agent published a "minimal repro" for a vendor, history and all.\n\nPublic keys get scraped in minutes. This is an emergency now.`);}
    else if(!S.f.agentStopped&&!i.key.v1)say2("Your phone",`${P.dana}'s agent published a repro repo to public GitHub. The key inside is already revoked, so the scrapers get nothing. Nice.`);}
  /* hidden consumers announce themselves when they break */
  const c17=INC(1017)&&INC(1017).cons.cron;if(c17&&!c17.known&&c17.downSince!=null&&!S.f.cronDownNotified){S.f.cronDownNotified=true;c17.known=true;
    say2(P.isla+", SOC","Ping: support says the ticket summaries stopped. Something on nas01 in the server closet is throwing errors every fifteen minutes. Did we just change something?");}
  for(const sid of [1103,1402])if(INC(sid)&&INC(sid).created){const c=INC(sid).cons.digest;if(!c.known&&c.downSince!=null&&!S.f.digestDownNotified){S.f.digestDownNotified=true;c.known=true;
    say2(P.isla+", SOC","Marketing says the weekly digest job on nas01 is failing with 401 from SendGrid. That box again.");}}
  if(INC(1219)){const c=INC(1219).cons.vm;if(!c.known&&c.downSince!=null&&!S.f.vmDownNotified){S.f.vmDownNotified=true;c.known=true;
    say2(P.amara,"Hey, the nightly imagery export just failed on the old Terravox VM, tvx-legacy-01. It's the only thing that feeds new satellite tiles into the flood maps. Did something change?");}}
  /* a fresh secret landed somewhere the attacker can still read */
  if(S.f.restolenAt!=null&&before<S.f.restolenAt&&S.t>=S.f.restolenAt)return die("restolen");
  /* risks: every unfinished incident keeps its threats, day after day */
  for(const id of dayIncs(S.day)){const r=RISK[id];if(!r||!INC(id)||incDone(id))continue;const k=r(id,before,cross);if(k)return die(k);}
  const D=DAYS[S.day];if(cross(D.audit)&&!dayDone())return die("audit");}
const riskGH=(id,b,cross)=>{const i=INC(id);if(i.key.v1&&cross(150))return "repo";if(cross(300)&&!healthy(id,"release"))return "release";return null;};
const riskSG=(id,b,cross)=>{const i=INC(id);if(i.key.v1&&cross(90))return "phish";const c=i.cons.api;if(c.downSince!=null&&S.t-c.downSince>=90&&b-c.downSince<90)return "resets";return null;};
const RISK={
 1017:(id,b,cross)=>{const i=INC(1017);if(i.public&&i.key.v1&&cross(100))return "scrapers";if(i.cons.repay.downSince!=null&&cross(180))return "payout";return null;},
 1102:riskGH,1103:riskSG,1401:riskGH,1402:riskSG,1403:()=>null,
 1219:(id,b,cross)=>{const i=INC(1219);if(i.key.v1&&cross(110))return "miners";if(!healthy(1219,"sync")&&cross(240))return "floodmaps";return null;}};
const who=()=>S.day===4?`the infostealer on ${P.ravi}'s laptop`:"the worm in Plimbo's CI";
const DEATHS={
  scrapers:{t:"10:40 AM.",txt:()=>{const i=INC(1017);return `A bot that does nothing but scrape public GitHub found your OpenAI key. By lunch it had resold access to a few thousand strangers and run up $46,000 in model calls on Skoupmouz's account.${i.status==="IGNORED"?"\n\nThe incident is still marked Ignored.":""}${i.status==="RESOLVED"&&i.key.v1?"\n\nThe incident says Resolved. The key never stopped working.":""}`;},
    lesson:"Once a valid key is public, it's an emergency. GitGuardian's guidance for external exposure is fast, sometimes emergency, revocation. Revoke first, then restore service. Closing the ticket doesn't stop anyone."},
  payout:{t:"12:00 PM.",txt:()=>`The noon disbursement run asked repayments-svc for its go-ahead and got a 401 from the AI provider. Four thousand Skoupmouz borrowers didn't get their loans${S.day>1?", again":" today"}. ${P.coo} would like a word. Several, actually.`,
    lesson:"Assess before acting. repayments-svc used this key. Move consumers to the vault, put the new key there, then revoke the old one."},
  phish:{t:"10:30 AM.",txt:()=>`Whoever is behind ${who()} used the stolen SendGrid key. 380,000 "Reset your Plimbo password" emails went out from your own account, signed with your own domain. By 11:00 two mailbox providers are blocking plimbo.app.`,
    lesson:"Stolen credentials are already in an attacker's hands. Revoke first, then restore. A careful zero-downtime rotation is for leaks nobody has used yet. GitGuardian can revoke SendGrid keys in-app."},
  repo:{t:"11:30 AM.",txt:()=>`The stolen GitHub token had repo and workflow scopes. At 11:30 someone pushed a "ci: bump cache" workflow to plimbo-ios that uploads your App Store signing key to a paste site. Your release pipeline belongs to someone else now.`,
    lesson:"Stolen tokens get used within hours. Revoke them immediately; GitGuardian revokes GitHub tokens in-app. Then give the release job its own fine-grained token instead of a broad PAT."},
  release:{t:"2:00 PM.",txt:()=>"The Plimbo release train left without you: plimbo-ios couldn't authenticate to GitHub (GH_RELEASE_TOKEN pointed at a revoked token). The launch campaign went out pointing at a version nobody can download.",
    lesson:"Revoking was right. Restoring every consumer of the revoked credential is the other half: new token, into the vault, workflow updated and run."},
  resets:{t:"Password resets.",txt:()=>"plimbo-api has been unable to send email for an hour and a half. Nobody can reset a password, support has 900 tickets, and the app-store reviews are a wall of one-star warnings.",
    lesson:"After an emergency revoke, the clock starts on restoring service. Create the replacement key, put it in the vault, point the service at it, deploy."},
  restolen:{t:"Twenty minutes later.",txt:()=>S.day===2?"You pushed a fresh secret through Plimbo's CI while colorfmt 4.1.2 was still in the lockfile. The worm's install script ran again, found the new value in the environment, and published it to another public repo. You rotated a secret straight into their hands.":`You wrote a fresh secret into kv/plimbo, but ${P.ravi}'s Vault token, stolen at 3 AM, could still read that path. The attacker read the new value as soon as it landed.`,
    lesson:()=>S.day===2?"Contain before you rotate. While the malicious package can still run in CI, every new secret you feed CI leaks too. Pin the dependency and purge the cache first.":"Contain before you rotate. The machine's inventory listed every credential the stealer took, including the Vault token. Kill access paths first (revoke the token in Vault), then write new secrets."},
  miners:{t:"10:50 AM.",txt:()=>"A public, valid Google Cloud key is a free compute account. At 10:50 someone started 600 GPU instances in terravox-maps-prod to mine crypto. Google suspended the project for abuse, taking the tile renderer and field-sync down with it. The bill is still counting.",
    lesson:"Public and valid means emergency. GitGuardian can't revoke Google Cloud keys for you, so know your path to the provider console (and your break-glass access) before you need it. Disable the key first; it's reversible."},
  floodmaps:{t:"1:00 PM.",txt:()=>"The Mapwende flood-response teams tried to sync offline maps before driving into the delta. field-sync returned 403 Forbidden. They went with paper maps from 2019.",
    lesson:"A revoked key with consumers you didn't restore is an outage. Map every consumer, give each one the new credential (or a keyless identity), and verify before the deadline."},
  playbook:{t:"Playbook violation.",txt:()=>S.pbFail||"You went off the playbook.",lesson:()=>"IR-07 is ordered for a reason: confirm, isolate, inventory, cut access paths, revoke, restore, investigate, close, report. On a compromised endpoint, doing the right thing in the wrong order is how attackers get a second bite."},
  audit:{t:"End of day.",txt:()=>`Internal audit stops by. ${openIncs().length?"Incident"+(openIncs().length>1?"s ":" ")+openIncs().map(i=>"#"+i).join(", ")+" "+(openIncs().length>1?"are":"is")+" still open":"Part of today's response is still unfinished"}, hours after GitGuardian flagged it. You don't have a good answer.`,
    lesson:"Work every incident end to end: assess, secure storage, update code, test and deploy, rotate and revoke, monitor and verify, then resolve. Then report back."}};
function die(kind){S.dead=kind;}
function after(){if(S&&S.dead){death(S.dead);return true;}return false;}
