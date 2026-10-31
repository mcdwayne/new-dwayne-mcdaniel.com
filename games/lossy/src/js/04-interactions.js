/* ============================== interactions ============================== */
function lookText(room,id){const d=S.day;return ({
 desk:{monitor:()=>anyTrig()?"Your trusty CRT. The GitGuardian dashboard has a red badge blinking.":"Your CRT, GitGuardian open in a tab that never closes.",
   phone:()=>"Your phone. "+(S.mail.some(m=>!m.read)?S.mail.filter(m=>!m.read).length+" unread email(s).":"No unread email."),
   drawer2:()=>S.f.sshNote?"The right drawer. Paper clips, a dead highlighter, and the outline of where Jae's sticky note was.":"The right drawer. Jae keeps \"spare keys\" in there. Hopefully not literal ones.",
   drawer:()=>d===4?(S.f.binder?"The drawer. Lanyards, a fortune cookie, and the empty spot where the IR-07 binder was.":"Your desk drawer. Somewhere in there: your badge, and the binder Jae made everyone sign for. IR-07."):S.f.drawer?"An empty drawer, except for a fortune cookie that says \"Rotate early, rotate often.\"":"Your desk drawer. You keep important things in there. Allegedly.",
   sticky:()=>`Two sticky notes in ${P.head}'s handwriting:\n"Runbook: ASSESS BEFORE ACTING."\n"Vault paths: kv/lending/openai · kv/plimbo/* · kv/mapwende/*"`,
   mug:()=>["Cold coffee from this morning. It has a film on it.","Fresh coffee. Optimism, in a mug.","Coffee number three. Your hands are steady. Mostly.","No coffee. The playbook says isolate first, caffeinate later."][d-1],
   window:()=>"The city keeps not caring about your incident queue. It's "+hhmm(S.t)+".",
   poster:()=>"A poster: SECRETS ARE NOT CONFIG. Someone has added in pen: \"tell that to the agent\".",
   plant:()=>"A fern. It has survived three reorgs and "+(d>=3?"three":"two")+" rebrands.",door:()=>"The door to the hallway.",
   keyboard:()=>"Your keyboard. The E key is shiny from overuse, which says something about how often you type 'rotate'.",
   papers:()=>"Last quarter's GitGuardian report. 17 open incidents, 24 repositories not monitored, and a line someone highlighted: \"most leaked secrets stay valid for days\"."},
 hall:{devdoor:()=>"The dev pit. "+["You can hear keyboards and an AI agent narrating its own commits.",`${P.ravi} is staring at a CI log like it owes him money.`,`${P.amara} from Mapwende is camped out at a desk with three phones.`,`${P.ravi} is in there, laptop open. Nobody has told him yet.`][d-1],
   srvdoor:()=>S.inv.includes("badge")?"The server closet. The badge reader light is green for you now.":"The server closet. The badge reader blinks red. You'll need your access badge.",
   coodoor:()=>`${P.coo}'s office.`,back:()=>"Back to your desk.",
   cooler:()=>["The water cooler. Gossip today: an AI agent is \"helping\" in the dev pit again.","The water cooler. Gossip: CI ran \"weird\" last night and nobody knows why.","The water cooler. Gossip: someone found a Terravox t-shirt in the supply room. Spooky.","The water cooler. Nobody's gossiping. Word got around about the laptop."][d-1]},
 dev:{npc:()=>({dana:`${P.dana}, Skoupmouz engineer. Hoodie, headphones, an AI coding agent humming along in auto-approve mode.`,ravi:d===4?`${P.ravi}, Plimbo mobile dev. His laptop is open, logged in to everything, and running something it shouldn't.`:`${P.ravi}, Plimbo mobile dev and unofficial owner of the CI pipeline.`,amara:`${P.amara}, Mapwende field operations lead. Three phones, all buzzing with flood updates.`})[npcKey()],
   laptop:()=>d===1&&hooksOn("dana-mbp")&&!S.f.agentStopped?"The agent's log: \"Blocked by ggshield: .mcp.json contains a secret (OpenAI API Key). Remove it and retry.\" It has stopped trying.":d===1?(S.f.agentStopped?"The agent is paused. Its last line reads: \"Understood. I will not publish anything.\"":"A terminal: the agent is preparing \"a minimal repro for the vendor\". It plans to create a public repo with the current working tree. Including .mcp.json. Including the key."):d===4?(S.f.isolated?"Gone to IT in an evidence bag.":"Ravi's MacBook. A VS Code extension called \"Prettier Plus Pro\" is installed. It has been very busy."):d===2?"A CI log: \"> colorfmt@4.1.2 postinstall: node ./setup.js\". That line wasn't there last week.":"Amara's laptop, showing a flood map of the Rhinvale delta.",
   screen2:()=>"Team chat. A pinned message: \"nas01 runs the support summarizer AND the marketing digest. Ask before touching it.\"",
   cans:()=>"Seven energy drinks. Three are empty. Two are breakfast.",duck:()=>"A rubber duck. You explain the incident to it. It doesn't revoke anything, but you feel better.",
   posters:()=>"A cork board of sticky notes: SHIP IT, LGTM, AI FTW, OOPS, NO TEST, MCP?.",
   sprint:()=>({1:"Sprint 42: \"Agent setup\" (done), \"Ship repro to vendor\" (in progress). The second one should worry you.",2:"Sprint 43: \"Bump deps\" (done, by a bot), \"Release 2 PM\".",3:"Sprint 44: \"Mapwende flood maps\". Someone wrote \"who owns Terravox GCP??\" in red.",4:"Someone has written IR-07 on the board and drawn a box around it."})[d],
   beanbag:()=>"A red beanbag shaped by a thousand stand-ups.",out:()=>"Back to the hallway."},
 closet:{nas:()=>{const lines=S.hosts.nas01.cron.split("\n").filter(l=>l&&!l.startsWith("#"));
     return `An old box on a cart: nas01. Its console shows a crontab:\n\n${lines.join("\n")}\n\nNo ggshield, no Endpoint Protection: GitGuardian isn't installed on this box, so nothing here has ever been scanned.`;},
   racks:()=>"Racks of servers blinking in patterns only Gary understood. Gary left in 2021.",sign:()=>"A label: \"nas01 DO NOT TURN OFF - GARY\". Gary is very far away now.",out:()=>"Back to the hallway."},
 coo:{kofi:()=>`${P.coo}, COO. Calm, in the way people are calm right before they aren't.`,
   whiteboard:()=>({1:`DISBURSEMENT RUN 12:00 NOON. 4,112 borrowers. Underneath, in smaller letters: "depends on repayments-svc".`,2:"PLIMBO RELEASE 2:00 PM. 380K users. \"password resets = plimbo-api\".",3:"FLOOD MAPS 1:00 PM. 12 field teams. \"maps = field-sync + tile-renderer\".",4:"IR-07. CONTAIN. NO SHORTCUTS. In Kofi's handwriting."})[d],
   window:()=>"A nice view. Nicer than yours.",plant:()=>"A much healthier fern than yours. Executive ferns get better light.",out:()=>"Back to the hallway."}})[room][id]();}
/* revealing a hidden consumer, from any source */
function reveal(id,k,how){const i=INC(id);if(i&&DEF[id].cons[k].host==="nas01")foundNas();if(!i||i.cons[k].known)return 0;i.cons[k].known=true;tl(id,`Consumer added manually: ${DEF[id].cons[k].name}${how?" ("+how+")":""}`);const a=(AW[id].found||{})[k];return a?award(a,DEF[id].day):0;}
function foundNas(){if(S.f.nasFound)return;S.f.nasFound=true;if(S.f.sshNote)setTimeout(()=>flash("nas01 is on your computer now: SSH from the osbar."),0);}
function canSsh(){return S.f.nasFound&&S.f.sshNote;}
function revealNas(how){foundNas();let p=0;if(INC(1017))p+=reveal(1017,"cron",how);for(const id of [1103,1402])if(INC(id)&&INC(id).created)p+=reveal(id,"digest",how);return p;}
function interact(v,id,item){const room=S.room;const spot=roomSpots(room).find(s=>s.id===id);if(!spot)return say("You don't see that here.");
  /* LR-10: Use and Talk are interchangeable. Use on a person talks to them; Talk on a thing uses it. */
  if(v==="use"&&spot.talk)v="talk";else if(v==="talk"&&!spot.talk&&id!=="duck"&&!spot.exit)v="use";
  if(v==="walk"||(spot.exit&&v!=="look")){if(spot.exit){if(spot.exit==="closet"&&!S.inv.includes("badge"))return say("BEEP. The badge reader blinks red. Your access badge is probably in your desk drawer.");return go(spot.exit);}if(v==="walk")return say("You can't walk there.");}
  if(v==="look"){if(room==="closet"&&id==="nas"){const p=revealNas("seen on nas01's console");return say(lookText(room,id)+(p?"\n\n(You add what you found to the exploration map as manual consumers.)":""),p);}
    const extra={sticky:"sticky",whiteboard:"whiteboard",duck:"duck"}[id];const p=extra&&S.day===1?award(extra):0;return say(lookText(room,id),p);}
  if(v==="talk"){if(id==="npc")return talkNPC();if(id==="kofi")return talkKofi();if(id==="duck")return say("You talk to the duck. The duck listens. Classic duck.");return say("It doesn't say much.");}
  if(v==="item"){if(item==="badge"&&room==="hall"&&id==="srvdoor")return go("closet");if(item==="sticky note"&&room==="desk"&&id==="monitor")return sshNas();if(item==="binder")return readBinder();return say(`Using the ${item} on that doesn't do anything.`);}
  if(room==="desk"){if(id==="monitor")return useComputer();if(id==="phone")return openPC("mail");
    if(id==="drawer"){if(!S.f.drawer){S.f.drawer=true;if(!S.inv.includes("badge"))S.inv.push("badge");advance(1);if(after())return;const p=S.day===1?award("drawer"):0;
        if(S.day===4){S.f.binder=true;S.inv.push("binder");const b=award("binder");return msgBox("You take your access badge and the red binder: IR-07, ENDPOINT COMPROMISE.\n\nYou open it.",null,()=>readBinder(b));}
        return say("You open the drawer and find your access badge under a pile of conference lanyards. You take the badge.",p);}
      if(S.day===4&&!S.f.binder){S.f.binder=true;S.inv.push("binder");const b=award("binder");return readBinder(b);}return say("The drawer is empty now.");}
    if(id==="drawer2"){if(S.f.sshNote)return say("Nothing else in there you need.");S.f.sshNote=true;S.inv.push("sticky note");advance(1);if(after())return;
      return say(`A sticky note in ${P.head}'s handwriting:\n\n"nas01 (closet box): ssh gary@nas01\nkey is on your workstation, ~/.ssh/nas01_gary\nplease don't touch the crontab without asking Dana"\n\nYou take it.${S.f.nasFound?" You can reach nas01 from your computer now.":" Once you know what nas01 is doing, you won't need to walk to the closet."}`);}
    if(id==="mug")return say("You take a sip. "+(S.day===1?"Regret. Pure regret.":"Better than yesterday's."));if(id==="plant")return say("You water the fern with cold coffee. It looks at you with disappointment.");}
  if(room==="dev"&&id==="laptop")return say(S.day===4?"You don't touch a compromised machine. You get it off the network. Talk to Ravi.":"You'd rather not touch someone else's machine. Talk to "+npcFirst()+".");
  if(room==="closet"&&id==="nas")return openTerm("nas01");
  if(room==="coo"&&id==="whiteboard")return say("You resist the urge to draw a smiley face on the whiteboard.");
  say(["You can't do that.","Nothing happens.","That's not going to help with the incident."][(id.length+frame)%3]);}
function readBinder(p){const L=ML();const w=document.createElement("div");w.className="msgwrap";w.id="padwrap";
  w.innerHTML=`<div class="pad" role="dialog" aria-modal="true" aria-label="IR-07 playbook"><h2>IR-07 · Endpoint Compromise</h2><div class="win">Do every step. In order. A step isn't done until GitGuardian, the vault or the provider says so.</div><ol>${PB_STEPS.map((st,i)=>`<li class="${st.done()?"ok":""}"><span>${st.done()?"✔":i===PB.first()?"▶":"·"}</span> <b>${i+1}. ${esc(st.t)}</b><ul><li>${esc(st.d)}</li></ul></li>`).join("")}</ol>${p?`<div style="margin-top:8px">[+${p} points]</div>`:""}<div class="btns"><button data-padclose>Close the binder</button></div></div>`;
  L.appendChild(w);try{w.querySelector("button").focus({preventScroll:true});}catch(e){}updateBar();}
/* the computer boots to Program Manager; after that it remembers which windows you left open */
function useComputer(){if(WM.wins.some(w=>w.app!=="progman")){renderPC();return;}openPC("progman");}
function sshNas(){if(!S.f.sshNote)return say("You don't have SSH details for nas01.");if(!S.f.nasFound)return say("The note says nas01. You don't know yet why you'd need it.");PL().innerHTML="";openTerm("nas01",{via:"pc"});}
function go(room){advance(3);if(after())return;S.room=room;if(room==="closet")foundNas();S.seen[room]=1;draw();
  if(room==="closet"&&!S.seen["closet"+S.day]){S.seen["closet"+S.day]=1;say("The server closet hums. In the corner, an old box on a cart has a green-screen console. Something on it runs on a schedule.");}}

/* ============================== dialogue ============================== */

/* LR-05: ask a developer to run ggshield machine setup. They always do. Afterwards AI agents on that machine can't read, send or commit secrets. */
const DEVHOST={dana:"dana-mbp",ravi:"ravi-mbp",amara:"amara-mbp"};
const AGENTS={"dana-mbp":["Claude Code","Cursor"],"ravi-mbp":["Cursor","Copilot CLI"],"ravi-loaner":["Cursor"],"amara-mbp":["Claude Code"],"sec-thinkpad":["Claude Code"],"isla-mbp":["VS Code"],"kofi-mbp":[]};
function devHost(k){return k==="ravi"&&S.day===4?(S.f.isolated?"ravi-loaner":"ravi-mbp"):DEVHOST[k];}
function hooksOn(h){return !!(S.f.aiHooks||{})[h]||h==="sec-thinkpad"||h==="isla-mbp"||(!!(S.f.mdm&&S.f.mdm.setup)&&MANAGED.includes(h));}
/* MDM: the fleet console unlocks once you've watched a developer run machine setup in person and nas01's crontab is clean */
const MANAGED=["dana-mbp","ravi-mbp","kofi-mbp","sec-thinkpad","isla-mbp","amara-mbp","ravi-loaner"];
/* "nas01 is fixed" = none of the incidents in play still has its key pasted into nas01's crontab */
function nasFixed(){const jobs=[];for(const id of dayIncs(S.day)){const i=INC(id);if(!i||!i.created&&S.day!==4)continue;for(const k of consOf(id))if(DEF[id].cons[k].kind==="cron")jobs.push(conOn(id,k));}return jobs.length>0&&jobs.every(on=>on!=="hard-v1"&&on!=="hard-v2");}
function mdmUnlocked(){return !!S.f.setupInPerson&&nasFixed();}
function aiHooksOption(k){const h=devHost(k);if(hooksOn(h))return null;
  return ["Can you run ggshield machine setup? I want AI hooks on your coding agents.",()=>{
    if(S.day===4&&h==="ravi-mbp"){PB.foul("had Ravi run ggshield machine setup on the compromised laptop","Nothing touches a compromised machine before it's isolated. Installing anything on it changes the evidence and keeps it online for the attacker. IR-07 step 2 comes first; hooks go on his clean loaner afterwards.");return {t:""};}
    S.f.aiHooks=S.f.aiHooks||{};S.f.aiHooks[h]=true;S.f.setupInPerson=true;const p=award("aihooks");
    const ag=AGENTS[h]||[];return {t:`"Sure." ${P[k].split(" ")[0]} runs it.\n\n  $ ggshield machine setup\n  AI hooks: installed for ${ag.join(", ")||"no AI agents found"}\n  Git hooks: pre-commit, pre-push installed\n  Honeytoken: already planted\n\n"Done. If ${ag[0]||"an agent"} tries to read a file or run a command with a secret in it, ggshield blocks it before it reaches the model."`,p};}];}
function talkNPC(){const k=npcKey();const intro={dana:`${P.dana} pulls one side of her headphones off. "Hey, ${first()}."`,ravi:S.day===4?`${P.ravi} looks up from his laptop. "Morning. Why do you look like that?"`:`${P.ravi} rubs his eyes. "Tell me this is about CI."`,amara:`${P.amara} puts two of the three phones face down.`}[k];
  dialog(npcName(),k,intro,{dana:danaOptions,ravi:S.day===4?raviUltOptions:raviOptions,amara:amaraOptions}[k]);}
function danaOptions(){const opts=[];const i=INC(1017);
  opts.push(["What happened?",()=>({t:`"The agent was setting up MCP tooling on skoupmouz-ledger-batch. It put the OpenAI key straight into .mcp.json and committed everything. GitGuardian pinged me too. Sorry."`})]);
  if(!S.f.agentStopped&&S.day===1)opts.push(["Is the agent doing anything else right now?",()=>{if(S.t>=60)return {t:`"It already published that repro repo. To public GitHub. With the history."`};
    S.f.agentStopped=true;const p=award("stopAgent");return {t:`She glances at the terminal and goes pale. "It's about to publish a public repro repo for the vendor. With the whole history." She kills it. "Okay. Paused. Nothing went out."`,p};}]);
  opts.push(["Who else uses this key?",()=>{const p=reveal(1017,"cron","from "+P.dana)+award("assess",1);
    return {t:`"repayments-svc and the ledger-batch pipeline. Oh, and the support ticket summarizer on nas01 in the server closet. It's a cron job. The key's pasted right into the crontab. Gary set it up. Gary also set up the marketing digest on there with the SendGrid key, same way."`,p};}]);
  if(i.shared&&!i.feedback)opts.push(["Did you get the incident I shared?",()=>{i.feedback=true;tl(1017,"Feedback submitted by "+P.dana+": key also used by the nas01 support summarizer cron");return {t:`"Yep, filled in the feedback form. I noted the nas01 cron so it's on the record."`};}]);
  {const o=aiHooksOption("dana");if(o)opts.push(o);}
  opts.push(["Never mind.",null]);return opts;}
function raviOptions(){const opts=[];
  opts.push(["What changed in CI yesterday?",()=>{const p=award("ravi");return {t:`"The dependency bot bumped colorfmt to 4.1.2 in plimbo-api and plimbo-ios. Auto-merged, because it's 'just a patch'. GitHub flagged that version as malicious this morning. It has a postinstall script that dumps the CI environment."`,p};}]);
  if(!S.f.contained)opts.push(["Pin colorfmt back and purge the CI caches. Now.",()=>{S.f.contained=true;const p=award("contain");advance(8);for(const id of [1102,1103])tl(id,"Contained: colorfmt pinned to 4.1.1, CI caches purged, 4.1.2 blocked at the registry proxy");
    return {t:`"On it." Ten minutes of furious typing. "4.1.1 pinned in both lockfiles, caches purged, and 4.1.2 is blocked at the registry proxy. CI is safe to run again."`,p};}]);
  opts.push(["Who else uses the SendGrid key?",()=>{const p=reveal(1103,"digest","from "+P.ravi);return {t:`"plimbo-api, for password resets. And Gary's old box, nas01, sends the marketing digest with it. The key's pasted into the crontab."`,p};}]);
  const sh=[1102,1103].find(id=>INC(id).shared&&!INC(id).feedback);if(sh)opts.push(["Did you see the incident I shared?",()=>{INC(sh).feedback=true;reveal(1103,"digest","developer feedback");tl(sh,"Feedback submitted by "+P.ravi+": SendGrid key also used by nas01 digest cron");return {t:`"Filled in the form. The SendGrid key is also on nas01, in the digest cron."`};}]);
  {const o=aiHooksOption("ravi");if(o)opts.push(o);}
  opts.push(["Never mind.",null]);return opts;}
function raviUltOptions(){const opts=[];
  if(!S.f.isolated)opts.push(["Unplug your laptop from the network and hand it to IT. Right now.",()=>{if(!PB.ok(2,"have Ravi isolate the laptop"))return {t:""};S.f.isolated=true;const p=award("isolate");advance(6);
    return {t:`He freezes, then pulls the network adapter and closes the lid. "IT's on their way with an evidence bag. I'll use a loaner." He looks ill. "What did it take?"`,p};}]);
  opts.push(["What was on that laptop?",()=>{if(INC(1402))reveal(1402,"digest","from "+P.ravi);return {t:`"The gh CLI token, my classic PAT. The release job uses it too, I pasted it into GH_RELEASE_TOKEN because the bot account was a pain. The SendGrid key in plimbo-api/.env. My Vault token from vault login. And yeah, the same SendGrid key is in the digest cron on nas01."`};}]);
  opts.push(["What did you install recently?",()=>({t:`"A VS Code extension, Prettier Plus Pro. It had 40,000 installs!" He pauses. "It asked for a lot of permissions for a formatter."`})]);
  {const o=aiHooksOption("ravi");if(o)opts.push(o);}
  opts.push(["Never mind.",null]);return opts;}
function amaraOptions(){const opts=[];
  opts.push(["What depends on the Terravox key?",()=>{const p=reveal(1219,"vm","from "+P.amara)+award("amara");return {t:`"The tile renderer and field-sync, those are the big two. And the nightly imagery export on the old Terravox VM, tvx-legacy-01. It feeds satellite tiles into the flood maps. Nobody has logged into that thing since the acquisition."`,p};}]);
  opts.push(["Who owned this key?",()=>({t:`"Bram Visser, Terravox's platform lead. He left in 2023. Nobody owns it now. If you need a name on it, put mine; Mapwende depends on it."`})]);
  opts.push(["What happens at 1 PM?",()=>({t:`"Twelve field teams sync offline maps through field-sync before they drive into the delta. No signal out there. If field-sync is down at one, they go with paper maps from 2019."`})]);
  {const o=aiHooksOption("amara");if(o)opts.push(o);}
  opts.push(["Never mind.",null]);return opts;}
function talkKofi(){dialog(P.coo,"kofi",`${P.coo} looks up from a spreadsheet.`,kofiOptions);}
function kofiOptions(){const opts=[];const d=S.day;
  if(dayDone()&&!S.dayWon)opts.push([d===4?"It's contained. Every step of IR-07.":"It's handled.",()=>{const p=award("kofi");S.dayWon=true;
    return {t:{1:`"You rotated it without taking repayments-svc down before the run? And the summarizer is fine? Good. That's the boring outcome I wanted." He actually smiles.`,2:`"The worm's out of CI, the stolen keys are dead, resets work and the release shipped? On a Wednesday?" He writes something down. It might be your name.`,3:`"Maps are flowing, the Terravox key is dead, and you found a VM nobody knew we were paying for." He shakes his head. "Acquisitions."`,4:`He reads your timeline line by line. "Confirmed, isolated, inventoried, cut, revoked, restored, investigated, closed. In order." He closes the binder. "That's how it's supposed to look."`}[d],p,end:true};}]);
  if(d===3&&!S.f.breakglass)opts.push(["I need break-glass admin on the Terravox Google Cloud project.",()=>{S.f.breakglass=true;const p=award("breakglass");advance(10);tl(1219,"Break-glass access granted to you on terravox-maps-prod (2 hours, approved by "+P.coo+")");
    return {t:`"Terravox? Nobody has admin there?" He sighs and signs the break-glass form. "Two hours, logged, and I'm telling the auditors myself." IT grants you Owner on terravox-maps-prod.`,p};}]);
  opts.push(["What's at stake today?",()=>({t:{1:`"At noon we pay out 4,112 loans. repayments-svc signs off on every disbursement. If it can't call the AI provider for its anomaly check, the run halts. So: fix it, but don't break it."`,2:`"Plimbo ships at 2 PM, and the marketing launch is already scheduled. If password resets break before then, the reviews will bury us. If the release job breaks, there's no release."`,3:`"Mapwende's field teams sync flood maps at 1 PM. It's the only thing they can't do without. Also, apparently we own a Google Cloud project nobody can log in to. Fix both."`,4:`"Read the binder. Do what it says. In the order it says. I've watched people improvise on a compromised laptop. It doesn't end well."`}[d]})]);
  opts.push(["Just checking in.",null]);return opts;}
