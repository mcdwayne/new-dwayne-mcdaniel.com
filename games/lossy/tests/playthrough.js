/* Headless playthroughs of every level (Node + jsdom). Run: npm test  [or: node tests/playthrough.js week|trap|lose1|ult|ultorder|ultreset|ultearly]
   Each run prints one "===" line: day, sim minutes, per-day scores, death (if any), won, the Next: hint, and page errors.
   Expected: WEEK and "ULTIMATE: by the book" end won; TRAP dies "restolen"; the three ULTIMATE variants die "playbook". */
const {JSDOM}=require("jsdom");const fs=require("fs");
const path=require("path");
const html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
function boot(){return new JSDOM("<!doctype html><html><body>"+html+"</body></html>",{runScripts:"dangerously",pretendToBeVisual:true,url:"https://example.test/",
 beforeParse(w){w.LOSSY_SLACK_DELAY_MS=40;w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({},{get:(o,k)=>k==="imageSmoothingEnabled"?false:()=>{}});w.matchMedia=q=>({matches:/reduce/.test(q)});w.requestAnimationFrame=()=>0;w.HTMLElement.prototype.focus=function(){};
  w.HTMLCanvasElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width:320,height:170});}});}
const T=s=>(s||"").replace(/\s+/g," ").trim();
const RESULTS=[];
async function play(name,script,opts={}){const dom=boot(),w=dom.window,d=w.document,errs=[];w.addEventListener("error",e=>errs.push(e.message+" @"+(e.lineno||"")));
 const $=s=>d.querySelector(s);let step="";const log=[];const click=el=>{if(!el)throw new Error("missing element at step "+step);el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));};
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const drain=()=>{let n=0;while($("#msglayer .msg .hint")&&n++<30){const m=$("#msglayer .msg .hint").parentElement;log.push("  msg: "+T(m.textContent).slice(0,150));click(m);}const pw=$("#padwrap");if(pw&&!opts.keepPad){log.push("  pad: "+T(pw.textContent).slice(0,120));pw.remove();}};
 const cmd=c=>{step=c;$("#cmd").value=c;$("#parser").dispatchEvent(new w.Event("submit",{cancelable:true}));drain();};
 const pc=sel=>{step=sel;click($(sel));drain();};
 const sh=c=>{step="sh "+c;$("#tinp").value=c;$("#tform").dispatchEvent(new w.Event("submit",{cancelable:true,bubbles:true}));drain();};
 const last=n=>[...d.querySelectorAll("#tscr .ln")].slice(-n).map(x=>x.textContent).join(" | ");
 const say=(...a)=>log.push(a.join(" "));
 const opts2=()=>[...d.querySelectorAll(".dlg .opts button")];const pick=t=>{step="pick "+t;const b=opts2().find(x=>x.textContent.includes(t));if(!b)throw new Error("no option "+t+" in "+opts2().map(x=>x.textContent).join("/"));b.click();drain();const s=$(".dlg .say");if(s)say("  "+t.slice(0,30)+" -> "+s.textContent.slice(0,110));};
 const bye=()=>{const b=opts2().find(x=>/Never mind|Just checking/.test(x.textContent));if(b){b.click();drain();}};
 const revoke=id=>{pc(`[data-ggm="revoke:${id}"]`);$("#revtxt").value="revoke";pc(`[data-mrevoke="${id}"]`);};
 const G=()=>w.GAME;
 await wait(20);
 try{await script({w,d,$,click,cmd,pc,sh,last,drain,say,pick,bye,revoke,G,wait});}catch(e){log.push("ERR "+e.message);}
 const S=w.GAME.S;const dead=$("#msglayer .death");
 console.log(`=== ${name}: day ${S&&S.day} · t ${S&&S.t} · scores ${S&&JSON.stringify(S.score)} · dead ${S&&S.dead||"-"} · won ${S&&S.dayWon} · goal "${T($("#goalTxt")&&$("#goalTxt").textContent).slice(0,110)}" · errors ${JSON.stringify(errs)}`);
 if(dead)console.log("  DEATH:",T(dead.textContent).slice(0,300));
 let rt="";if(S&&w.GAME.encodeSave){const c1=w.GAME.encodeSave();const keep=JSON.stringify(S);w.GAME.restoreFromCode(c1);const c2=w.GAME.encodeSave();rt=c1===c2?"ok "+c1:"MISMATCH "+c1+" -> "+c2;w.GAME.S=JSON.parse(keep);if(c1!==c2)errs.push("save code round-trip "+rt);}
 console.log("  save code round-trip:",rt);
 if(process.env.VERBOSE)log.forEach(l=>console.log(l));RESULTS.push({name,won:!!(S&&S.dayWon),dead:S&&S.dead,errors:errs});w.close();return S;}
const which=process.argv[2]||"all";
async function day1(h){const {$,cmd,pc,sh,pick,bye,revoke,click,d}=h;click($('[data-tt="new"]'));click($('[data-namego]'));
  cmd("use monitor");pc('[data-pc="gg"]');pc('[data-openinc="1017"]');pc('[data-ggcheck="1017"]');pc('[data-pcclose]');cmd("use drawer");cmd("go hallway");cmd("go dev pit");cmd("talk dana");pick("anything else");pick("Who else");bye();
  cmd("go hallway");cmd("go server closet");cmd("use nas01");sh("crontab -e");pc('[data-nano="helper"]');pc('[data-nano="exit"]');pc('[data-nano="y"]');sh("exit");
  cmd("go hallway");cmd("go desk");cmd("use monitor");pc('[data-pc="gg"]');pc('[data-pc="vault"]');pc('[data-vcreate="1017"]');pc('[data-mvcreate="1017"]');
  pc('[data-pc="ci"]');for(const r of ["skoupmouz-repayments","skoupmouz-ledger-batch"]){pc(`[data-cirepo="${r}"]`);pc('[data-citab="secrets"]');pc('[data-ciedit]');pc('[data-mciedit]');pc('[data-citab="actions"]');pc('[data-cirun]');}
  pc('[data-pc="ai"]');pc('[data-pnew="1017"]');pc('[data-mpnew="1017"]');pc('[data-mclose]');pc('[data-pc="vault"]');pc('[data-vnew="1017"]');pc('[data-pc="gg"]');pc('[data-gg="list"]');pc('[data-openinc="1017"]');revoke(1017);pc('[data-pc="ai"]');pc('[data-ap="usage"]');pc('[data-plogs="1017"]');pc('[data-pcclose]');
  cmd("go hallway");cmd("go coo");cmd("talk kofi");pick("handled");click([...d.querySelectorAll(".dlg .opts button")].find(b=>b.textContent==="Continue"));}
const toNext=h=>{h.click(h.$('[data-death="nextday"]'));h.drain();};
async function day2(h){const {$,cmd,pc,sh,pick,bye,revoke,say,G,last}=h;
  cmd("use monitor");pc('[data-pc="gg"]');pc('[data-openinc="1102"]');revoke(1102);pc('[data-gg="list"]');pc('[data-openinc="1103"]');revoke(1103);say("  t after revokes",G().S.t,"goal:",$("#goalTxt").textContent);pc('[data-pcclose]');
  cmd("go hallway");cmd("go dev pit");cmd("talk ravi");pick("What changed");pick("Pin colorfmt");pick("Who else uses the SendGrid");bye();cmd("go hallway");cmd("go desk");cmd("use monitor");pc('[data-pc="gg"]');
  pc('[data-pc="github"]');pc('[data-gh="fine"]');pc('[data-pnew="1102"]');pc('[data-mpnew="1102"]');pc('[data-mclose]');pc('[data-gh="audit"]');pc('[data-plogs="1102"]');
  pc('[data-pc="sendgrid"]');pc('[data-pnew="1103"]');pc('[data-mpnew="1103"]');pc('[data-mclose]');pc('[data-sg="activity"]');pc('[data-plogs="1103"]');
  pc('[data-pc="vault"]');pc('[data-vsel="kv/plimbo/github"]');pc('[data-vcreate="1102"]');pc('[data-mvcreate="1102"]');pc('[data-vsel="kv/plimbo/sendgrid"]');pc('[data-vcreate="1103"]');pc('[data-mvcreate="1103"]');
  pc('[data-pc="ci"]');for(const r of ["plimbo-ios","plimbo-api"]){pc(`[data-cirepo="${r}"]`);pc('[data-citab="secrets"]');pc('[data-ciedit]');pc('[data-mciedit]');pc('[data-citab="actions"]');pc('[data-cirun]');}
  say("  goal before nas:",$("#goalTxt").textContent);pc('[data-pcclose]');
  cmd("go hallway");cmd("go server closet");cmd("use nas01");sh("crontab -e");pc('[data-nano="helper"]');pc('[data-nano="exit"]');pc('[data-nano="y"]');sh("/opt/digest.sh");say("  digest:",last(1));sh("exit");
  say("  goal:",$("#goalTxt").textContent);cmd("go hallway");cmd("go coo");cmd("talk kofi");pick("handled");h.click([...h.d.querySelectorAll(".dlg .opts button")].find(b=>b.textContent==="Continue"));say("  END:",T($("#msglayer .msg").textContent).slice(0,200));}
async function day3(h){const {$,cmd,pc,sh,pick,bye,say,G,last}=h;
  cmd("go hallway");cmd("go coo");cmd("talk kofi");pick("break-glass");bye();cmd("go hallway");cmd("go desk");cmd("use monitor");pc('[data-pc="gg"]');
  pc('[data-openinc="1219"]');pc('[data-ggcheck="1219"]');pc('[data-ggowner="1219"]');pc('[data-pc="gcp"]');pc('[data-gdisable]');say("  t after disable",G().S.t);
  pc('[data-gcp="usage"]');pc('[data-plogs="1219"]');pc('[data-gcp="keys"]');pc('[data-pnew="1219"]');pc('[data-mpnew="1219"]');pc('[data-mclose]');
  pc('[data-pc="vault"]');pc('[data-vcreate="1219"]');pc('[data-mvcreate="1219"]');
  pc('[data-pc="ci"]');for(const r of ["mapwende-tiler","mapwende-field-sync"]){pc(`[data-cirepo="${r}"]`);pc('[data-citab="secrets"]');pc('[data-ciedit]');pc('[data-mciedit]');pc('[data-citab="actions"]');pc('[data-cirun]');}
  pc('[data-pc="gcp"]');pc('[data-gcp="vms"]');pc('[data-gssh]');sh("cat /etc/tvx/export.env");sh("/opt/tvx/export.sh");say("  vm before:",last(1).slice(0,140));
  sh("sudo nano /etc/tvx/export.env");pc('[data-nano="helper"]');pc('[data-nano="write"]');pc('[data-nano="exit"]');sh("sudo rm /etc/tvx/sa-terravox-tiler.json");sh("/opt/tvx/export.sh");say("  vm after:",last(2).slice(0,160));sh("exit");
  pc('[data-gcp="keys"]');pc('[data-gdelete]');pc('[data-mgdelete]');say("  goal:",$("#goalTxt").textContent);pc('[data-pcclose]');
  cmd("go hallway");cmd("go coo");cmd("talk kofi");pick("handled");h.click([...h.d.querySelectorAll(".dlg .opts button")].find(b=>b.textContent==="Continue"));say("  END:",T($("#msglayer .msg").textContent).slice(0,160));
  const fin=$('[data-death="finale"]');if(fin){h.click(fin);say("  FINALE:",T($("#msglayer .msg").textContent).slice(0,400));}}
async function ult(h,variant){const {$,cmd,pc,sh,pick,bye,revoke,say,G,click,d}=h;if(variant!=="week"){click($('[data-tt="ult"]'));click($('[data-namego]'));}h.drain();
  cmd("use drawer");say("  goal:",$("#goalTxt").textContent);cmd("use monitor");pc('[data-pc="gg"]');
  if(variant==="reset"){pc('[data-gg="honeytokens"]');pc('[data-htreset]');return;}
  pc('[data-gg="honeytokens"]');pc('[data-pcclose]');
  if(variant==="early"){cmd("use monitor");pc('[data-pc="gg"]');pc('[data-gg="endpoints"]');pc('[data-ep="ravi-mbp"]');pc('[data-epinc="1401"]');return;}
  cmd("go hallway");cmd("go dev pit");cmd("talk ravi");pick("Unplug");pick("What was on");bye();cmd("go hallway");cmd("go desk");cmd("use monitor");pc('[data-pc="gg"]');
  pc('[data-gg="endpoints"]');pc('[data-ep="ravi-mbp"]');for(const id of [1401,1402,1403])pc(`[data-epinc="${id}"]`);
  if(variant==="order"){pc('[data-openinc="1401"]');revoke(1401);return;}
  pc('[data-pc="vault"]');pc('[data-vtab="tokens"]');pc('[data-vtrevoke="1403"]');pc('[data-mvtrevoke]');
  pc('[data-pc="gg"]');pc('[data-openinc="1401"]');revoke(1401);pc('[data-gg="list"]');pc('[data-openinc="1402"]');revoke(1402);
  pc('[data-pc="github"]');pc('[data-gh="fine"]');pc('[data-pnew="1401"]');pc('[data-mpnew="1401"]');pc('[data-mclose]');pc('[data-pc="sendgrid"]');pc('[data-pnew="1402"]');pc('[data-mpnew="1402"]');pc('[data-mclose]');
  pc('[data-pc="vault"]');pc('[data-vsel="kv/plimbo/github"]');pc('[data-vnew="1401"]');pc('[data-vsel="kv/plimbo/sendgrid"]');pc('[data-vnew="1402"]');
  pc('[data-pc="ci"]');pc('[data-cirepo="plimbo-ios"]');pc('[data-citab="secrets"]');pc('[data-ciedit]');pc('[data-mciedit]');pc('[data-citab="actions"]');pc('[data-cirun]');pc('[data-cirepo="plimbo-api"]');pc('[data-cirun]');
  pc('[data-pcclose]');cmd("go hallway");cmd("go server closet");cmd("use nas01");sh("crontab -e");pc('[data-nano="helper"]');pc('[data-nano="exit"]');if($('[data-nano="y"]'))pc('[data-nano="y"]');sh("exit");
  say("  goal:",$("#goalTxt").textContent);cmd("go hallway");cmd("go desk");cmd("use monitor");pc('[data-pc="gg"]');
  pc('[data-pc="github"]');pc('[data-gh="audit"]');pc('[data-plogs="1401"]');pc('[data-pc="sendgrid"]');pc('[data-sg="activity"]');pc('[data-plogs="1402"]');pc('[data-pc="vault"]');pc('[data-vtab="audit"]');pc('[data-vaudit]');
  pc('[data-pc="gg"]');pc('[data-gg="honeytokens"]');pc('[data-htrevoke]');say("  goal:",$("#goalTxt").textContent," statuses:",[1401,1402,1403].map(i=>G().S.incs[i].status).join(","));pc('[data-pcclose]');
  cmd("go hallway");cmd("go coo");cmd("talk kofi");pick("contained");click([...d.querySelectorAll(".dlg .opts button")].find(b=>b.textContent==="Continue"));say("  END:",T($("#msglayer .msg").textContent).slice(0,200));}
(async()=>{
 if(which==="all"||which==="week")await play("WEEK: DAY1→DAY2→DAY3",async h=>{await day1(h);toNext(h);await day2(h);toNext(h);await day3(h);});
 if(which==="all"||which==="week4")await play("FOUR-DAY WEEK: Thursday into Friday ULTIMATE, scored out of 400",async h=>{const {$,click,say,G,d}=h;await day1(h);toNext(h);await day2(h);toNext(h);await day3(h);
   const sc=($("#sccode")||{}).textContent||"";const scOk=/^LR-[0-9A-F]{4}-[0-9A-F]{4}$/.test(sc)&&G().decodeSave(sc).day===3&&/no back end/.test($("#msglayer").textContent);say("  end-of-Thursday save code:",sc,scOk);
   const btn=$('[data-death="nextday"]');say("  Thursday end button:",btn&&btn.textContent);toNext(h);const S=G().S;say("  Friday:",S.day,"week:",S.week,"incidents:",Object.keys(S.incs).filter(x=>+x>1400).join(","),"bar:",$("#stScore").textContent);
   await ult(h,"week");const S2=G().S;const fin=$('[data-death="finale"]');if(fin){click(fin);}const txt=($("#msglayer .msg")||{}).textContent||"";say("  finale:",txt.replace(/\s+/g," ").slice(0,260));
   const finCode=/LR-[0-9A-F]{4}-[0-9A-F]{4}/.test(txt);say("  finale has a save code:",finCode);const ok=scOk&&finCode&&S2.score[4]>=90&&/of 400/.test(txt)&&/Friday\/ULT/.test(txt);if(ok)S2.dayWon=true;else S2.dead="week4-failed";});
 if(which==="all"||which==="trap")await play("DAY 2 TRAP: rotate before containing",async h=>{await day1(h);toNext(h);const {cmd,pc,revoke}=h;cmd("use monitor");pc('[data-pc="gg"]');pc('[data-openinc="1103"]');revoke(1103);
   pc('[data-pc="sendgrid"]');pc('[data-pnew="1103"]');pc('[data-mpnew="1103"]');pc('[data-mclose]');pc('[data-pc="ci"]');pc('[data-cirepo="plimbo-api"]');pc('[data-citab="secrets"]');pc('[data-ciedit]');pc('[data-mciedit]');pc('[data-citab="actions"]');pc('[data-cirun]');pc('[data-pcclose]');for(let i=0;i<12;i++){if(h.G().S.dead)break;cmd(i%2?"go desk":"go hallway");}});
 if(which==="all"||which==="lose1")await play("LOSE DAY 1 (ignore) → DAY 2 carry-over",async h=>{const {$,click,cmd,pc,say,G}=h;click($('[data-tt="new"]'));click($('[data-namego]'));cmd("use monitor");pc('[data-pc="gg"]');pc('[data-openinc="1017"]');pc('[data-ggm="ignore:1017"]');pc('[data-mignore="1017"]');pc('[data-pcclose]');
   for(let i=0;i<60;i++){if(G().S.dead)break;cmd(i%2?"go desk":"go hallway");}click($('[data-death="next"]'));h.drain();say("  day",G().S.day,"goal:",$("#goalTxt").textContent);h.click($('[data-tasks].ic'));say("  checklist:",T($(".pad").textContent).slice(0,300));});
 if(which==="all"||which==="ssh")await play("NAS01 OVER SSH (LR-03)",async h=>{const {$,click,cmd,pc,sh,pick,bye,say,G,last}=h;click($('[data-tt="new"]'));click($('[data-namego]'));
   cmd("use right drawer");say("  note:",G().S.f.sshNote,"apps:",[...h.d.querySelectorAll('[data-pc]')].length);cmd("go hallway");cmd("go dev pit");cmd("talk dana");pick("Who else");bye();cmd("go hallway");cmd("go desk");
   cmd("use monitor");pc('[data-pc="gg"]');pc('[data-pc="ssh"]');sh("crontab -e");pc('[data-nano="helper"]');pc('[data-nano="exit"]');pc('[data-nano="y"]');say("  ssh crontab:",last(2));pc('[data-tclose]');
   const ok=!!$("#pcroot")&&G().S.hosts.nas01.cron.includes("vault kv get -field=OPENAI_API_KEY");say("  back on PC:",!!$("#pcroot"),"cron on vault:",ok);if(!ok)G().S.dead="ssh-failed";else G().S.dayWon=true;});
 if(which==="all"||which==="hooks")await play("AI HOOKS STOP THE PUBLIC REPRO (LR-05)",async h=>{const {$,click,cmd,pick,bye,say,G}=h;click($('[data-tt="new"]'));click($('[data-namego]'));
   cmd("go hallway");cmd("go dev pit");cmd("talk dana");pick("machine setup");bye();for(let i=0;i<24;i++)cmd(i%2?"go dev pit":"go hallway");
   const S=G().S;say("  t",S.t,"public:",S.incs[1017].public,"hooks:",JSON.stringify(S.f.aiHooks));if(S.incs[1017].public||S.t<60)S.dead="hooks-failed";else S.dayWon=true;});
 if(which==="all"||which==="ulthooks")await play("ULTIMATE: AI hooks on the compromised laptop",async h=>{const {$,click,cmd,pc,pick,say}=h;click($('[data-tt="ult"]'));click($('[data-namego]'));h.drain();cmd("use drawer");cmd("use monitor");pc('[data-pc="gg"]');pc('[data-gg="honeytokens"]');pc('[data-pcclose]');
   cmd("go hallway");cmd("go dev pit");cmd("talk ravi");pick("machine setup");});
 if(which==="all"||which==="slack")await play("SLACK THE DEVELOPER (LR-04)",async h=>{const {$,click,cmd,pc,say,G,wait,w,d}=h;click($('[data-tt="new"]'));click($('[data-namego]'));
   w.LOSSY_SLACK_DELAY_MS=null;const ds=[...Array(2000)].map(()=>w.GAME.slackDelay());say("  delay range s:",Math.min(...ds)/1000,"to",Math.max(...ds)/1000);const okRange=Math.min(...ds)>=2000&&Math.max(...ds)<=200000;w.LOSSY_SLACK_DELAY_MS=40;
   cmd("use monitor");pc('[data-pc="gg"]');pc('[data-pc="slack"]');const t0=G().S.t;const b=[...d.querySelectorAll("[data-slsend]")].find(x=>x.textContent.includes("Who else"));click(b);say("  sent; typing line:",($("#sltyping")||{}).textContent);
   await wait(700);h.drain();const S=G().S;say("  t before/after:",t0,S.t,"cron known:",S.incs[1017].cons.cron.known,"reply:",(S.slack.msgs.dana.slice(-1)[0]||{}).txt);
   const b2=[...d.querySelectorAll("[data-slsend]")].find(x=>x.textContent.includes("anything else"));click(b2);await wait(700);h.drain();say("  agent stopped via Slack:",S.f.agentStopped);
   if(okRange&&S.incs[1017].cons.cron.known&&S.f.agentStopped)S.dayWon=true;else S.dead="slack-failed";});
 if(which==="all"||which==="code")await play("SAVE CODES (LR-07)",async h=>{const {$,click,say,G,w}=h;click($('[data-tt="new"]'));click($('[data-namego]'));h.drain();
   const D=G().decodeSave;const g=G();const base="LR-E0FF-FF2E";if(!D(base).checksumOk)throw new Error("known-good code flagged");
   let flips=0,flagged=0;for(let i=3;i<12;i++){if(base[i]==="-")continue;for(const ch of "0123456789ABCDEF"){if(ch===base[i])continue;flips++;if(!D(base.slice(0,i)+ch+base.slice(i+1)).checksumOk)flagged++;}}
   const junk=["hello","LR-123-456","banana split","ZZZZ-ZZZZ","LR-12345678X"];let loaded=0;const kinds=[];
   for(const j of junk){const r=g.restoreFromCode(j);if(r&&g.S&&g.S.day>=1&&g.S.day<=4)loaded++;kinds.push(`${j}=>${["Tue","Wed","Thu","ULT"][g.S.day-1]} ${g.S.t}m${g.S.dead?" dead:"+g.S.dead:""}`);}
   say("  typos flagged:",flagged,"of",flips,"| junk loaded:",loaded,"of",junk.length,"|",kinds.join("; "));
   g.restoreFromCode(base);const ok=flagged/flips>0.9&&loaded===junk.length&&g.encodeSave()===base;g.S.dead=null;if(ok)g.S.dayWon=true;else g.S.dead="code-failed";});
 if(which==="all"||which==="verbs")await play("USE AND TALK INTERCHANGEABLE (LR-10)",async h=>{const {$,click,cmd,say,G,d}=h;click($('[data-tt="new"]'));click($('[data-namego]'));h.drain();
   const v0=$('.ic[aria-pressed="true"]').textContent.trim();cmd("go hallway");cmd("go dev pit");
   G().interact("use","npc");const talked=!!$(".dlg");const bb=[...d.querySelectorAll(".dlg .opts button")].find(x=>/Never mind/.test(x.textContent));if(bb)bb.click();h.drain();
   cmd("go hallway");cmd("go desk");G().interact("talk","monitor");const pc=!!$("#pcroot");if(pc)$("[data-pcclose]").click();const v1=$('.ic[aria-pressed="true"]').textContent.trim();
   G().interact("look","sticky");h.drain();const scoreA=G().S.score[1];const lookTxt=G().S.incs?1:0;G().interact("use","sticky");const useMsg=(d.querySelector("#msglayer .msg")||{}).textContent||"";h.drain();const stickyOk=/ASSESS BEFORE ACTING/.test(useMsg);say("  use sticky notes reads them:",stickyOk);
   const ex=d.getElementById("exitbtn");const exTxt=ex&&ex.textContent;click(ex);const r1=G().S.room;const exTxt2=d.getElementById("exitbtn").textContent;click(d.getElementById("exitbtn"));const r2=G().S.room;const exitOk=/Back to Hall/.test(exTxt)&&r1==="hall"&&/Security/.test(exTxt2)&&r2==="desk";say("  exit button:",exTxt,"->",r1,"|",exTxt2,"->",r2);
   say("  default verb:",v0,"| Use on Dana opened dialogue:",talked,"| Talk on monitor opened computer:",pc,"| verb after closing computer:",v1);
   if(stickyOk&&exitOk&&/Use/.test(v0)&&talked&&pc&&/Use/.test(v1))G().S.dayWon=true;else G().S.dead="verbs-failed";});
 if(which==="all"||which==="mdm")await play("NAME + IN-PERSON SETUP UNLOCKS MDM",async h=>{const {$,click,cmd,pc,sh,pick,bye,say,G,d}=h;
   click($('[data-tt="new"]'));const sug=$("#namein").value;click($("[data-namedice]"));const sug2=$("#namein").value;$("#namein").value="Robin Testcase";click($("[data-namego]"));h.drain();
   const named=G().S.player==="Robin Testcase";const slackHasSetup=G().slOptions("dana").some(o=>/machine setup/.test(o[0]));
   cmd("go hallway");cmd("go dev pit");cmd("talk dana");pick("machine setup");pick("Who else");bye();const before=G().mdmUnlocked();
   cmd("go hallway");cmd("go desk");cmd("use right drawer");cmd("use monitor");pc('[data-pc="ssh"]');sh("crontab -e");pc('[data-nano="helper"]');pc('[data-nano="exit"]');pc('[data-nano="y"]');pc('[data-tclose]');
   const after=G().mdmUnlocked();const icon=!!$('[data-pc="mdm"]');pc('[data-pc="mdm"]');pc('[data-mdmdeploy="setup"]');const fleet=G().hooksOn("ravi-mbp")&&G().hooksOn("kofi-mbp");
   say("  suggestions:",sug,"/",sug2,"| named:",named,"| setup offered in Slack:",slackHasSetup,"| MDM before nas fix:",before,"after:",after,"icon:",icon,"| fleet hooks:",fleet);
   if(sug&&named&&!slackHasSetup&&!before&&after&&icon&&fleet)G().S.dayWon=true;else G().S.dead="mdm-failed";});
 if(which==="all"||which==="push")await play("PUSH TO VAULT AND RELEASE-NOTE SCREENS (LR-13..17)",async h=>{const {$,click,cmd,pc,say,G,d}=h;click($('[data-tt="new"]'));click($('[data-namego]'));h.drain();
   cmd("use monitor");pc('[data-pc="gg"]');$("#ggq").value=".mcp.json";$("#ggsearchf").dispatchEvent(new h.w.Event("submit",{cancelable:true,bubbles:true}));const hits=d.querySelectorAll("[data-openinc]").length;
   pc('[data-ggclear]');pc('[data-openinc="1017"]');const t0=G().S.t;pc('[data-ggpush="1017"]');pc('[data-mpush="1017"]');const S=G().S;const dt=S.t-t0;
   const ok=(S.vault["kv/lending/openai"]||[])[0]==="v1"&&S.incs[1017].tags.includes("Vaulted")&&!$('[data-ggpush="1017"]');
   $("#ggnote").value="@dana can you confirm the cron?";pc('[data-ggnote="1017"]');const men=S.incs[1017].timeline.some(x=>/Mentioned Dana/.test(x[1]));
   pc('[data-gg="inventory"]');const inv=/kv\/lending\/openai/.test($(".win.act").textContent);pc('[data-gg="secmgr"]');const sm=/read\/write/.test($(".win.act").textContent);pc('[data-gg="perimeter"]');const cov=/Coverage hub/.test($(".win.act").textContent);
   say("  search hits:",hits,"| pushed:",ok,"in",dt,"min | mention:",men,"| inventory:",inv,"| secrets managers:",sm,"| coverage hub:",cov);
   if(hits===1&&ok&&dt<=2&&men&&inv&&sm&&cov)S.dayWon=true;else S.dead="push-failed";});
 if(which==="all"||which==="perfect")await play("PERFECT-START CODES",async h=>{const {$,click,say,G}=h;click($('[data-tt="new"]'));click($('[data-namego]'));h.drain();const g=G();const res=[];let ok=true;
   for(const [code,day,want] of [["LR-PERF-TUE",1,[0,0,0]],["lr perf wed",2,[100,0,0]],["LR-PERF-THU",3,[100,100,0]],["LR-PERF-FRI",4,[100,100,100]],["LR-PERF-ULT",4,[0,0,0]]]){g.restoreFromCode(code);const S=g.S;const sc=[S.score[1],S.score[2],S.score[3]];
     const good=S.day===day&&S.t===0&&!S.dead&&JSON.stringify(sc)===JSON.stringify(want)&&(code==="LR-PERF-FRI"?S.week&&S.results[3]==="won":day===4?!S.week:true)&&(day<2||day===4||S.results[1]==="won")&&(day<3||day===4||S.results[2]==="won");if(!good)ok=false;res.push(`${code}=>day ${S.day} ${JSON.stringify(sc)} ${good?"ok":"BAD"}`);}
   const plain=g.decodeSave("LR-0000-0000");say("  ",res.join("; "),"| normal code still decodes:",plain.day===1);if(ok&&plain.day===1)g.S.dayWon=true;else g.S.dead="perfect-failed";});
 if(which==="all"||which==="frame")await play("MONITOR FRAME INTACT ON EVERY GITGUARDIAN PAGE",async h=>{const {$,click,cmd,pc,say,G,d}=h;click($('[data-tt="new"]'));click($('[data-namego]'));h.drain();
   const bad=[];const chk=l=>{const off=$("[data-pcclose]");if(!off||!off.parentElement.classList.contains("bezel"))bad.push(l);};
   const visit=()=>{for(const p of ["list","publist","perimeter","endpoints","honeytokens","map","inventory","playbooks","workflow","secmgr"]){pc(`[data-gg="${p}"]`);chk(p);}};
   cmd("use monitor");pc('[data-pc="gg"]');pc('[data-wmax="gg"]');visit();pc('[data-gg="list"]');pc('[data-openinc="1017"]');chk("incident 1017");pc('[data-gg="endpoints"]');pc('[data-ep="dana-mbp"]');chk("endpoint");
   for(const day of [2,3,4]){const g=G();g.restoreFromCode(["","","LR-PERF-WED","LR-PERF-THU","LR-PERF-ULT"][day]);h.drain();g.openPC("gg");
     if(day===4){g.S.f.binder=true;g.S.f.isolated=true;for(const id of [1401,1402,1403]){g.S.incs[id].created=true;}}
     for(const id of g.dayIncs?[]:[]){}const ids={2:[1102,1103],3:[1219],4:[1401,1402,1403]}[day];for(const id of ids){g.openPC("gg");d.querySelector('[data-gg="list"]').click();const r=d.querySelector(`[data-openinc="${id}"]`);if(r){r.click();chk("incident "+id);}else bad.push("no row "+id);}}
   say("  broken frame on:",bad.join(", ")||"none");if(bad.length)G().S.dead="frame-broken";else G().S.dayWon=true;});
 if(which==="all"||which==="rotate")await play("VAULT ROTATION FOR SENDGRID AND GITHUB (LR-26)",async h=>{const {$,click,say,G,w,d,pc}=h;click($('[data-tt="new"]'));click($('[data-namego]'));h.drain();const g=G();g.restoreFromCode("LR-PERF-WED");h.drain();
   const S=g.S;const i=S.incs[1103];i.created=true;i.opened=true;g.openPC("vault");d.querySelector('[data-vsel="kv/plimbo/sendgrid"]')&&d.querySelector('[data-vsel="kv/plimbo/sendgrid"]').click();const before=!!$('[data-vrotate="1103"]');d.querySelector('[data-vtab="integrations"]').click();const intBefore=/Not set up/.test(d.querySelector('.win.act').textContent)&&!$('[data-vrotate="1103"]');
   i.key.v1=false;i.key.v2=true;i.v2made=true;S.vault["kv/plimbo/sendgrid"]=["v1","v2"];i.cons.api.on="vault";i.cons.api.pending=null;S.incs[1103].cons.digest.known=true;
   g.openPC("vault");d.querySelector('[data-vtab="integrations"]').click();const intAfter=!!$('[data-vrotate="1103"]');d.querySelector('[data-vsel="kv/plimbo/sendgrid"]').click();const shown=!!$('[data-vrotate="1103"]');const digestBefore=w.eval("conOn(1103,'digest')");
   pc('[data-vrotate="1103"]');const apiOk=w.eval("healthy(1103,'api')");const ver=S.vault["kv/plimbo/sendgrid"].length;const hardBroke=w.eval("conOn(1103,'digest')")==="hard-v1"||!w.eval("healthy(1103,'digest')");
   say("  button before manual rotation:",before,"| after:",shown,"| rotations:",i.rot,"versions:",ver,"| api on Vault healthy:",apiOk,"| digest:",digestBefore);
   say("  Integrations page: not set up before:",intBefore,"| Rotate now after:",intAfter);if(!before&&intBefore&&intAfter&&shown&&i.rot===1&&ver===3&&apiOk)S.dayWon=true;else S.dead="rotate-failed";});
 if(which==="all"||which==="tutorial")await play("TRAINING LEVEL (LR-24)",async h=>{const {$,click,cmd,pc,say,G,wait,d}=h;
   const hasBtn=!!$('[data-tt="tut"]');click($('[data-tt="tut"]'));await wait(50);const g=G();const n=()=>g.TUT.n;const tick=()=>wait(320);const log=[];
   click($("[data-tutnext]"));await tick();const labels=$("#tutlabels")?$("#tutlabels").querySelectorAll(".tl-tag").length:-1;const openAtStep=!$("#coach").classList.contains("min");click($("[data-tutmin]"));const minimized=$("#coach").classList.contains("min");click($("[data-tutnext]"));await tick();const reopened=!$("#coach").classList.contains("min");log.push(n());click($("[data-tutmin]"));await tick();const minAgain=$("#coach").classList.contains("min");cmd("use monitor");await tick();const reopenOnScreen=!$("#coach").classList.contains("min");say("  coach open:",openAtStep,"| minimized on request:",minimized,"| open again next step:",reopened,"| hidden then screen changed, open again:",minAgain&&reopenOnScreen);await tick();log.push(n());pc('[data-pc="gg"]');await tick();log.push(n());pc("[data-pcclose]");await tick();log.push(n());
   cmd("go hallway");await tick();log.push(n());const lockedRooms=["go dev pit","go server closet","go coo"].map(c=>{cmd(c);return G().S.room;});const locked=lockedRooms.every(r=>r==="hall");cmd("go desk");await tick();log.push(n());click($("[data-tutnext]"));await tick();cmd("use monitor");await tick();log.push(n());
   click($("[data-tutnext]"));await tick();pc('[data-openinc="1017"]');await tick();log.push(n());click($("[data-tutnext]"));click($("[data-tutnext]"));await tick();
   pc('[data-ggmap="1017"]');await tick();log.push(n());click($("[data-tutnext]"));pc('.hdr [data-openinc="1017"]');pc('[data-ggtab="occ"]');await tick();click($("[data-tutnext]"));pc('[data-ggtab="rem"]');await tick();click($("[data-tutnext]"));await tick();
   const S=g.S;const atEnd=n()===g.TUT.n&&$("#coach")&&/Training complete/.test($("#coach").textContent);const noScore=S.score[1]===0;const noDeath=!S.dead;let saved=null;try{saved=h.w.localStorage.getItem("lossy-adv7");}catch(e){}
   click($("[data-tutnext]"));await wait(50);const named=!!$("#namein");
   say("  room labels shown:",labels,"| other doors locked:",locked,"| button:",hasBtn,"| steps seen:",log.join(","),"| reached end:",!!atEnd,"| score 0:",noScore,"| no death:",noDeath,"| saved:",!!saved,"| Start Tuesday asks for a name:",named);
   if(openAtStep&&minimized&&reopened&&minAgain&&reopenOnScreen&&locked&&hasBtn&&atEnd&&noScore&&noDeath&&!saved&&named)S.dayWon=true;else S.dead="tutorial-failed";});
 if(which==="all"||which==="recheck")await play("VALIDITY AND PRESENCE RE-CHECK ON OPEN (LR-29)",async h=>{const {$,click,cmd,pc,pick,bye,say,G,d}=h;click($('[data-tt="new"]'));click($('[data-namego]'));h.drain();
   cmd("use monitor");pc('[data-pc="gg"]');pc('[data-openinc="1017"]');pc('[data-ggpresence="1017"]');const p1=G().S.incs[1017].presence.p;pc('[data-pcclose]');
   cmd("go hallway");cmd("go dev pit");cmd("talk dana");pick("take the key out");bye();cmd("go hallway");cmd("go desk");
   const tlHas=re=>G().S.incs[1017].timeline.some(x=>re.test(x[1]));cmd("use monitor");pc('[data-pc="gg"]');const p2=G().S.incs[1017].presence.p;const autoP=tlHas(/Presence re-checked automatically: no longer/);
   pc('[data-pc="ai"]');pc('[data-pnew="1017"]');pc('[data-mpnew="1017"]');pc('[data-mclose]');pc('[data-prevoke="1017:v1"]');pc('[data-mprevoke="1017:v1"]');h.drain();
   const before=tlHas(/Validity re-checked automatically: invalid/);pc('[data-pc="gg"]');pc('[data-gg="list"]');pc('[data-openinc="1017"]');const after=tlHas(/Validity re-checked[^:]*: invalid/);
   const shown=/Invalid/.test(d.querySelector('.win.act').textContent);pc('[data-ggrefresh="1017"]');
   say("  presence first:",p1,"| after Dana's fix, on reopen:",p2,"(timeline:",autoP+") | provider revoke seen only after reopening:",!before,"->",after,"| shows Invalid:",shown);
   if(p1===true&&p2===false&&autoP&&after&&shown)G().S.dayWon=true;else G().S.dead="recheck-failed";});
 if(which==="all"||which==="ult")await play("ULTIMATE: by the book",async h=>ult(h));
 if(which==="all"||which==="ultorder")await play("ULTIMATE: revoke before Vault token",async h=>ult(h,"order"));
 if(which==="all"||which==="ultreset")await play("ULTIMATE: reset the honeytoken",async h=>ult(h,"reset"));
 if(which==="all"||which==="ultearly")await play("ULTIMATE: inventory before isolating",async h=>ult(h,"early"));
 const want={"VALIDITY AND PRESENCE":["won"],"FOUR-DAY WEEK":["won"],"TRAINING LEVEL":["won"],"VAULT ROTATION":["won"],"MONITOR FRAME":["won"],"PERFECT-START":["won"],"PUSH TO VAULT":["won"],"NAME + IN-PERSON":["won"],"USE AND TALK":["won"],"SAVE CODES":["won"],"SLACK THE DEVELOPER":["won"],"NAS01 OVER SSH":["won"],"AI HOOKS STOP":["won"],"ULTIMATE: AI hooks":["playbook"],"WEEK":["won"],"DAY 2 TRAP":["restolen"],"ULTIMATE: by the book":["won"],"ULTIMATE: revoke":["playbook"],"ULTIMATE: reset":["playbook"],"ULTIMATE: inventory":["playbook"]};
 const bad=RESULTS.filter(r=>{const k=Object.keys(want).find(k=>r.name.startsWith(k));if(!k)return !!r.errors.length;const w=want[k][0];return r.errors.length||(w==="won"?!r.won:r.dead!==w);});
 console.log(bad.length?`\nFAILED: ${bad.map(r=>r.name).join(", ")}`:`\nAll ${RESULTS.length} playthroughs behaved as expected.`);process.exit(bad.length?1:0);})();
