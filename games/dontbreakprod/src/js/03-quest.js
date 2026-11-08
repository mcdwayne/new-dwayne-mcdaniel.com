/* ============================== the quest: steps per level ==============================
   Each step: [text, done?]. The blue bar always shows the first one that isn't done. */
const STEPS={
 1:[["Read your mail on your laptop",()=>S.f.sawBounce],
    ["Open GitGuardian on your laptop and look at the incident Otto shared",()=>S.f.thOpened],
    ["Check whether that TicketHive token is still valid",()=>S.f.thValid],
    ["Take the elevator to B1 and talk to Otto at the help desk",()=>S.f.ottoRotated],
    ["Open GitGuardian on your laptop and check the token again (it should resolve once it's invalid)",()=>S.f.thResolved],
    ["BOSS: convince Marisol Vance (Floor 2) to give you real access",()=>S.f.won1]],
 2:[["Open GitGuardian on your laptop and find the critical PayRail incident",()=>S.f.pr],
    ["Open the PayRail incident's exploration map",()=>S.f.prMap],
    ["Filter the incidents by team: Payments, then export them",()=>S.f.csv],
    ["Floor 3: talk to Juni Castellano",()=>S.f.juniAsk],
    ["Fix the pre-commit config on Juni's laptop",()=>S.f.hook],
    ["BOSS: convince Wendell Park (Floor 3)",()=>S.f.won2]],
 3:[["Floor 4: talk to Ingrid Solberg",()=>S.f.ingridAsk],
    ["Wake Kenji up. Engineering's fridge on Floor 3 has cold brew",()=>S.f.kenjiAwake],
    ["Turn on the Vault source in ggscout's config.toml (Kenji's terminal)",()=>S.f.scout],
    ["Re-open the PayRail exploration map: who else uses the key?",()=>S.f.map3],
    ["Write the rotation runbook in Notepad on your laptop",()=>S.f.runbook],
    ["Print the runbook on the Floor 2 printer (Ingrid only reads paper)",()=>S.f.printed],
    ["BOSS: convince Ingrid Solberg (Floor 4)",()=>S.f.won3]],
 4:[["Floor 5: talk to Harriet Quill, the CFO",()=>S.f.harrietAsk],
    ["Talk to Desmond Achebe in Compliance",()=>S.f.desAsk],
    ["Export PCI DSS evidence from GitGuardian (Secret incidents)",()=>S.f.pci],
    ["Give Desmond his evidence",()=>S.f.desDone],
    ["BOSS: convince Harriet Quill (Floor 5)",()=>S.f.won4]],
 5:[["Floor 6: talk to Paloma Reyes",()=>S.f.palAsk],
    ["Talk to Victor Lamb, the CTO",()=>S.f.vicAsk],
    ["Create a honeytoken in GitGuardian",()=>S.f.htMade],
    ["Plant it in the public precarium-sdk-examples repo",()=>S.f.htPlanted],
    ["Wait for it to fire (refresh events in GitGuardian › Honeytokens)",()=>S.f.htFired],
    ["BOSS: convince Victor Lamb (Floor 6)",()=>S.f.won5]],
 6:[["PayRail: create a new secret key and keep the old one active",()=>S.pr.v2],
    ["Vault: store the new key as a new version, production",()=>vaultProd()==="v2"],
    ["Deploys: restart checkout-api and payouts-worker",()=>effKey("checkout")==="v2"&&effKey("payouts")==="v2"],
    ["batch-01 (SSH): crontab -e and take the pasted key out of recon-batch's job",()=>S.c.recon==="vault"],
    ["PayRail: confirm the old key has no traffic left",()=>S.f.quiet],
    ["PayRail: revoke the old key",()=>!S.pr.v1],
    ["GitGuardian: check validity on #2871 (the playbook resolves it)",()=>S.f.final]]};
function nextStep(){const st=STEPS[S.lv]||[];const n=st.find(s=>!s[1]());return n?{t:n[0],boss:/^BOSS/.test(n[0])}:{t:"Level complete",win:true};}
function stepCount(){const st=STEPS[S.lv]||[];return [st.filter(s=>s[1]()).length,st.length];}

/* ============================== looking and using ============================== */
const LOOK={
 closet:{desklaptop:()=>`Your laptop, a BrickBook 9000 from the B1 loaner cage, set up on a desk that used to hold paper towels. Duct tape holds the hinge on. It goes everywhere with you. ${S.mail.some(m=>!m.read)?"The mail icon is blinking.":"It hums."}`,
   sticky:"The sticky note says: \"GitGuardian login = your email. Ask Marisol for more. - M\"",
   shelves:"Paper towels, toner, and one box labeled HAL'S STUFF. Hal ran security before you. Hal's box contains a stress ball and a printout titled 'Q2 SECRETS - TODO'. The TODO list is blank.",
   bucket:"A mop bucket. It's been here longer than the security program.",
   chair:"An office chair. The backrest hangs off and one wheel has rolled under the desk. You'll be standing.",sign:"The sign says SUPPLY CHAIN SECURITY. It's a supply closet. You're security. Someone in IT thinks this is hilarious, and you're ashamed of how much you agree."},
 f2:{office:"Marisol's glass office. A whiteboard behind her reads: SOC 2 AUDIT FRIDAY. Under it, smaller: renew GitGuardian??",printer:"The printer has a sign: OUT OF ORDER SINCE THE REORG.",plant:"A plant. Healthy. Somebody here waters things."},
 lift:{panel:()=>`The badge reader shows the floors your badge opens: ${S.badge.join(", ")}. Everything else blinks red.`},
 b1:{cage:"A cage of loaner laptops. Most have stickers. One has duct tape holding the hinge on. It's labeled BRICKBOOK 9000.",number:"NOW SERVING: 47. You didn't take a number. Nobody does.",note:"A note in Otto's handwriting: \"TicketHive API token for the auto-close script - DO NOT LOSE\". It's from 2022."},
 f3:{sprint:"SPRINT 51: Pay Later 2.0 ships Monday. Someone added 'NO WEEKENDS?' in red. Someone else drew a sad face next to it.",
   fridge:()=>S.f.coffeeGiven||has("cold brew")?"Oat milk, three yogurts with names on them, and a sign: TAKE ONE COLD BREW, NOT FOUR.":"Oat milk, labeled yogurts, and a row of cold brew cans. A sign: ENGINEERING ONLY. TAKE ONE.",
   junilaptop:()=>S.f.hook?"Juni's laptop. The pre-commit hook passes in under a second now.":"Juni's laptop. A terminal shows: secretsniff....Failed. 'possible secret: TEST_FIXTURE_ID'. She has typed git commit --no-verify above it nine times."},
 f4:{screens:"Uptime 99.95% over 30 days. Error budget mostly spent. PayRail payment traffic in a steady wave: about 1,200 requests a minute.",
   freeze:"CHANGE FREEZE until after Q4 close. EXCEPTIONS NEED A FINANCE SIGNATURE. Then, smaller: \"no, Wendell, not even a config change\".",
   kterm:()=>S.f.scout?"ops-tools: ggscout is running with the Vault source enabled.":"Kenji's terminal on ops-tools. ggscout's config lives in /etc/ggscout/config.toml."},
 f5:{binders:"Five binders labeled PCI DSS v4.0. The one for Requirement 8 is suspiciously thin.",countdown:"Q4 CLOSE IN 3 DAYS 4 HRS. SAY NO TO SPEND."},
 f6:{demo:"A demo of Pay Later 2.0 loops on the screen: 'Pay in 4. Instantly.' The payment step uses PayRail.",window:"The city. Somewhere out there, a bot is reading every public commit on GitHub."}};
function lookAt(sp){const l=(LOOK[S.room]||{})[sp.id];if(l)return typeof l==="function"?l():l;if(sp.talk){const p=PPL[sp.talk];return `${p.name}, ${p.role}. Measured on: ${p.kpi}.`;}if(sp.exit)return `The ${sp.name}.`;return `It's the ${sp.name}.`;}
const USE={
 closet:{desklaptop:()=>openLaptop(),
   shelves:()=>say("You take nothing. Paper towels won't help you here."),bucket:()=>say("You consider mopping. You decide to fix secrets instead."),chair:()=>say("You sit. The chair objects. You stand.")},
 f2:{printer:()=>say("It prints a single page that says PC LOAD LETTER, then dies again.")},
 lift:{panel:()=>say(LOOK.lift.panel())},
 b1:{cage:()=>say("Locked. Your BrickBook came out of this cage. It was the only one that booted. Otto has the key, and Otto has opinions."),note:()=>say(LOOK.b1.note)},
 f3:{fridge:()=>{if(S.f.coffeeGiven||has("cold brew"))return say("One per person. You read the sign.");if(S.lv<3)return say("You don't need anything from the fridge yet. Probably.");S.f.fridgeOpen=true;give("cold brew");say("You take one cold brew. The sign says one. You respect the sign.\n\n[cold brew added to your items]");},
   junilaptop:()=>{if(!S.f.juniAsk)return say("Touching a developer's laptop without asking is how wars start. Talk to Juni first.");if(S.f.hook)return say("Already fixed. Juni has stopped typing --no-verify.");openEditor("precommit");}},
 f4:{kterm:()=>{if(!S.f.kenjiAwake)return say("The terminal is locked. Kenji is the one logged in, and Kenji is asleep.");openTerm("ops");},
   screens:()=>say(LOOK.f4.screens)},
 f5:{binders:()=>say(LOOK.f5.binders)},
 f6:{demo:()=>say(LOOK.f6.demo)}};
const ITEMUSE={
 "cold brew":{kenji:()=>{if(S.f.kenjiAwake)return say("He's awake. He's had two already.");const r=coffeeKenji();say(r.t,r.p,PPL.kenji.name);}}};
function coffeeKenji(){take("cold brew");S.f.kenjiAwake=true;S.f.coffeeGiven=true;markMet("kenji");const p=award("coffee");return {p,t:`Kenji opens one eye, then the can.\n\n"Third night on call. Thirty-one pages. Most of them are GitGuardian emails going to a shared inbox nobody reads." He waves at his terminal. "Ingrid says you want to know what uses the PayRail key. ggscout's on ops-tools, but whoever set it up left the Vault source switched off. Turn it on and GitGuardian will see what lives in Vault. I'm not touching it, I'm on call."`};}

/* ============================== moving around ============================== */
function go(room){if(room==="back")room=FLOOR_ROOM[S.liftFrom||"2"]||"f2";
  if(room==="lift")S.liftFrom=ROOMFLOOR[S.room]||"2";
  S.room=room;advance(1);verb="hand";heldItem=null;iconbar();draw();
  if(!S.seen[room]){S.seen[room]=1;const t=ENTER[room];if(t)say(typeof t==="function"?t():t);}}
const ENTER={
 f2:"Floor 2, IT & Security. Mostly IT. Marisol Vance's glass office is on the right. Your closet is on the left. The elevator is in the middle.",
 lift:"The elevator. Your badge lights up the floors it opens. The rest blink red.",
 b1:"B1, the help desk. Otto Brannigan is behind the counter, guarding a cage of loaner laptops like a dragon guards gold.",
 f3:"Floor 3, Engineering. Juni Castellano is typing --no-verify at a desk. Wendell Park is at a standing desk, standing aggressively.",
 f4:"Floor 4, Platform & SRE. Dashboards everywhere. A sign: CHANGE FREEZE. Ingrid Solberg is watching an uptime graph like it owes her money. Kenji is asleep on a beanbag.",
 f5:"Floor 5, Finance & Compliance. A countdown to quarter close. Harriet Quill is in a spreadsheet. Desmond Achebe is surrounded by binders.",
 f6:"Floor 6. Glass, city views, and Paloma Reyes at a desk that controls access to the CTO more strictly than any firewall."};
function ride(n){if(n==="1")return say("The lobby. A fern and a security guard. Nothing to do there today.");
  if(n===S.liftFrom)return say("You're already on this floor. The doors open, then close again, judging you.");
  if(!S.badge.includes(n)){const who={"3":"Marisol (IT runs the badges)","4":"someone in Engineering who works with SRE","5":"SRE's blessing","6":"Finance's signature"}[n]||"someone";
    return say(`BEEP. ACCESS DENIED.\n\nYour badge doesn't open floor ${n}. Access here is earned, one person at a time. You'll need ${who}.`);}
  advance(1);S.liftFrom=n;go(FLOOR_ROOM[n]);}

/* ============================== talking ============================== */
const meter=n=>`Convinced: ${"■".repeat(n)}${"□".repeat(Math.max(0,3-n))} (${n} of 3)`;
const pc=who=>Object.keys(S.pitch[who]||{}).length;
/* a pitch option: [label, needs, works?, reply, points key] */
function pitches(who,list){const c=S.pitch[who]||(S.pitch[who]={});
  return list.filter(x=>!c[x.k]&&(!x.need||x.need())).map(x=>[x.item?`▸ Show the ${x.item}: ${x.label}`:"▸ "+x.label,()=>{if(x.ok){c[x.k]=1;const p=award(x.pt);const n=pc(who);
    return {t:x.reply+"\n\n"+meter(n),p,win:n>=3?WIN[who]:null};}return {t:x.reply+"\n\n"+meter(pc(who))};},x.item?"pitch item":"pitch",x.item]);}
function talk(who){const p=PPL[who];if(who!=="kenji"||S.f.kenjiAwake)markMet(who);dialog(`${p.name} · ${p.role}`,who,INTRO[who](),()=>withItems(who,OPTS[who]()));}
/* every conversation also offers what you're carrying: the right person takes it, anyone else tells you who it's for.
   ITEMFOR lives in 03b-favors.js. Options are [label, fn, class, item name]. */
/* once you know who an item is for, only that person is offered it (no clutter); until then anyone will tell you */
function itemKnown(it){const f=FAVORS.find(x=>x.item===it);return !f||!!S.f["known_"+it]||!!S.f["fav_"+f.k]||!!(f.heard&&f.heard());}
function withItems(who,opts){if(opts.some(o=>o[0]&&/^\(Paloma/.test(o[0])))return opts;if(who==="kenji"&&!S.f.kenjiAwake)return opts;
  const shown=new Set(opts.map(o=>o[3]).filter(Boolean));const first=PPL[who].name.split(" ")[0];
  const extra=S.inv.filter(it=>it!=="laptop"&&ITEMFOR[it]&&ITEMFOR[it].live()&&!shown.has(it)).filter(it=>{const f=ITEMFOR[it],to=typeof f.to==="function"?f.to():f.to;return to===who||!itemKnown(it);}).map(it=>{const f=ITEMFOR[it],to=typeof f.to==="function"?f.to():f.to;
    if(to===who&&f.give)return [`Give ${first} the ${it}`,f.give,"item",it];
    return [`Show ${first} the ${it}`,()=>(S.f["known_"+it]=true,{t:to===who?`${first} looks at the ${it}. "Ask me properly, and bring the rest of your case." (It'll show up as something to say once you've talked a little more.)`:
      to?`${first} glances at the ${it}. "Not for me. That's for ${PPL[to].name}, ${PPL[to].role}."`:`${first} glances at the ${it}. "Not for me. ${f.hint}"`}),"item",it];});
  const fav=typeof favorOpts==="function"?favorOpts(who):[];
  const i=opts.findIndex(o=>o[1]===null);if(i<0)return opts.concat(extra,fav);return opts.slice(0,i).concat(extra,fav,opts.slice(i));}
const INTRO={
 otto:()=>S.f.ottoRotated?`"Token's rotated. I feel like a hacker. The good kind."`:`Otto looks up. "You're the new security person? Did you look at the GitGuardian thing I shared? I don't know what a token is."`,
 marisol:()=>S.f.won1?`"You've got your access. Don't make me regret it."`:`Marisol doesn't look up. "Welcome aboard. Busy week: SOC 2 auditors on Friday, and Harriet wants to know why we pay for GitGuardian. What do you need?"`,
 juni:()=>S.f.hook?`"Commits go through in under a second. I may cry."`:`Juni doesn't stop typing. "If you're here about the secret scanner, it blocks one commit in four. I bypass it. Everyone bypasses it."`,
 wendell:()=>S.f.won2?`"Ingrid's on 4. She'll say no. Everyone gets a no from Ingrid."`:`Wendell checks his watch. "You have two minutes. Pay Later 2.0 ships Monday and security is not on my roadmap."`,
 ingrid:()=>S.f.won3?`"Get Harriet's signature for the freeze exception. Then we'll talk change window."`:S.f.ingridAsk?`"Back already? What have you got?"`:`Ingrid keeps her eyes on the uptime graph. "No."\n\nYou haven't said anything yet.\n\n"Whatever it is, no. We're in a change freeze."`,
 kenji:()=>S.f.kenjiAwake?`"Still on call. Still awake. Thanks to you."`:`Kenji is asleep on a beanbag, phone on his chest. It buzzes. He doesn't move. He looks like he hasn't slept in days. Something caffeinated might help.`,
 desmond:()=>S.f.desDone?`"With this evidence I might sleep before the assessment."`:`Desmond is holding two binders and a third with his teeth. He puts them down. "Are you the security person? Please say yes."`,
 harriet:()=>S.f.won4?`"Signed. Don't make me unsign it."`:`Harriet holds up one finger and finishes a formula. "Three days to close. The freeze is mine. If you want an exception, show me money."`,
 paloma:()=>S.f.palAsk?`"He's free. Ish. Be quick."`:`Paloma smiles the smile of someone who has said no to vice presidents. "Do you have an appointment?"`,
 victor:()=>S.f.won5?`"Tonight. Don't break prod."`:S.f.vicAsk?`"Well? Has anyone tried to use it?"`:`Victor is rehearsing for the board. "Ah, security. Paloma says you have five minutes and a public key. Talk."`};
const bye=["Bye",null];
const OPTS={
otto:()=>{const o=[];
  if(!S.f.ottoRotated){
    if(S.f.thValid)o.push(["GitGuardian says it's valid. That token can read every support ticket.",()=>{S.f.ottoWorried=true;return {t:`Otto goes pale. "Every ticket? People send us their passwords in tickets. Like, a lot."\n\nYou tell him about the Internet Archive: in 2024 its Zendesk support tokens were left unrotated after being exposed, and an attacker used them to email the people who'd written in.\n\n"Okay. What do I do? I'm the TicketHive admin. I can click buttons."`};}]);
    else o.push(["I haven't checked it yet.",()=>({t:`"Can you? You're security. GitGuardian's on that BrickBook we gave you."`})]);
    if(S.f.ottoWorried)o.push(["Make a new token, put it in the auto-close script, then revoke the old one. In that order.",()=>{S.f.ottoRotated=true;grant("Otto at the help desk owes you one");const p=award("otto");
      mail("otto2",PPL.otto.name,"done!!","New TicketHive token is in the auto-close script and the old one is revoked. The script still works. I checked twice.\n\nThanks for not making it my fault.\n\n- Otto");
      return {t:`Otto clicks through TicketHive. New token. Paste into the script. Run it: OK. Revoke the old one.\n\n"Done. Script still works." He looks at your BrickBook, sighs, and re-tapes the hinge.\n\n"There. Now it'll survive the elevator. I owe you one."`,p};}]);
  } else o.push(["How do you like the BrickBook?",()=>({t:`"I don't. Nobody does. The hinge is load-bearing tape."`})]);
  o.push(["What's your day like?",()=>({t:`"I close tickets. My dashboard counts them. Forty-seven open right now. Being in a breach would be very bad for my number."`})]);
  o.push(bye);return o;},
marisol:()=>{if(S.f.won1)return [["What can I see now?",()=>({t:`"Every incident in the workspace, view only. If you need to change things, find someone who owns them."`})],bye];
  const o=pitches("marisol",[
   {k:"hack",label:"Hackers could steal everything. We need to lock it all down.",ok:false,reply:`"Everyone says that. My auditor wants evidence, not adjectives."`},
   {k:"mgr",label:"Make me a GitGuardian Manager so I can fix everything.",ok:false,reply:`"On your first morning? Nice try."`},
   {k:"th",label:"I closed a real incident this morning: the help desk's TicketHive token was valid. That's how the Internet Archive got its support tickets abused.",need:()=>S.f.thResolved,ok:true,pt:"m1",reply:`She looks up. "Otto's token? The one that reads every ticket?" A pause. "Okay. That's a story I can tell Harriet."`},
   {k:"bounce",label:"47 GitGuardian alerts bounced off Hal's disabled mailbox. Route them to me and your SOC 2 finding about an unoperated tool closes this week.",need:()=>S.f.sawBounce,ok:true,pt:"m2",reply:`"Forty-seven." She writes it on a sticky note. "The auditor flagged 'tool deployed, no owner'. If you're the owner, that finding goes away."`},
   {k:"ask",label:"Make me a Member with view access to all incidents. You stay Manager. I bring you the renewal story.",need:()=>pc("marisol")>=2,ok:true,pt:"m3",reply:`"View only, all incidents. Fine. I keep the keys."`}]);
  o.push(["What does the audit need?",()=>({t:`"Evidence that we detect and fix leaked secrets. Right now the evidence is a tool that emails a person who left in July."`})]);
  o.push(bye);return o;},
juni:()=>{const o=[];
  if(!S.f.juniAsk)o.push(["What's wrong with the scanner?",()=>{S.f.juniAsk=true;const p=award("juni");return {t:`"Secretsniff. Some open-source thing Teo installed. It flags test fixtures, UUIDs, a picture of a cat. I bypass it with --no-verify, so it catches nothing.\n\nTell you what: make it stop crying wolf and I'll tell you everything about that PayRail key. The pre-commit config is open on my laptop."`,p};}]);
  if(S.f.juniAsk&&!S.f.hook)o.push(["Can I edit your pre-commit config?",()=>({t:`"Please. It's .pre-commit-config.yaml, open on my laptop. Swap the secretsniff hook for something that doesn't lie."`})]);
  if(S.f.hook&&!S.f.juniTold)o.push(["About that PayRail key...",()=>{S.f.juniTold=true;return {t:`"checkout-api and payouts-worker use it. Both should read it from Vault, but checkout still has it hardcoded in a config file Teo wrote. That's the one that leaked: Teo pasted the config into a public gist to ask for help.\n\nIf anything else uses it, it's something Teo built and nobody's touched since. SRE might know."`};}]);
  o.push(["Who's Teo?",()=>({t:`"Teo Varga. Contractor. Built half of Payments in six months and left a year ago. His handover doc was a single sentence: 'it's all in the config'."`})]);
  o.push(bye);return o;},
wendell:()=>{if(S.f.won2)return [["Any advice for Ingrid?",()=>({t:`"Bring her a plan. She hates surprises more than she hates security."`})],bye];
  const o=pitches("wendell",[
   {k:"mandate",label:"Security is mandatory. If you won't help, I'll escalate to the CTO.",ok:false,reply:`"Go ahead. Victor's in Tahoe until four."`},
   {k:"best",label:"It's best practice to scan every commit.",ok:false,reply:`"Best practice is also eight hours of sleep. Next."`},
   {k:"csv",item:"payments-incidents.csv",label:"Payments has 63 open incidents, 19 still valid, median age 212 days. That's unplanned work waiting to land on your sprint.",need:()=>has("payments-incidents.csv"),ok:true,pt:"w1",reply:`He reads the export twice. "212 days." He doesn't like that number. "Fine. Go on."`},
   {k:"hook",label:"Juni's team was bypassing a scanner that blocked one commit in four. I swapped it for ggshield: no more false alarms, and it still caught a real AWS key. Your devs got faster.",need:()=>S.f.hook,ok:true,pt:"w2",reply:`"Juni said that?" He checks Slack. Juni has posted a GIF of someone crying with joy. "Huh."`},
   {k:"pr",label:"The PayRail live key is public and valid. If PayRail freezes our merchant account, Monday's launch has no payments.",need:()=>S.f.prMap,ok:true,pt:"w3",reply:`Wendell stops checking his watch. "A launch without payments is a demo." He thinks about the Director title for a moment.`}]);
  o.push(["What do you care about?",()=>({t:`"Shipping. Deploys per week. Pay Later 2.0 on Monday. Anything that slows that down is my enemy."`})]);
  o.push(bye);return o;},
ingrid:()=>{if(S.f.won3)return [["What's the change window?",()=>({t:`"Tonight, 11 PM to 1 AM, if Finance signs and Victor approves. Not a minute earlier."`})],bye];
  const o=[];
  if(!S.f.ingridAsk)o.push(["I need to rotate the PayRail key. It's public and valid.",()=>{S.f.ingridAsk=true;const p=award("ingrid");return {t:`"Last year someone rotated the mail relay password and forgot half the relays. An hour of no email. GitHub did the same thing in December 2023, three times in one week. And Cloudflare took down R2 for an hour in 2025 by deleting an old credential before the new one was live."\n\nShe finally looks at you. "So, no. Unless you bring me every single thing that uses that key, and a runbook with a rollback. Talk to Kenji about the inventory, if you can wake him."`,p};}]);
  if(S.f.ingridAsk)o.push(...pitches("ingrid",[
   {k:"yolo",label:"It's just a key. We swap it and we're done.",ok:false,reply:`"That's exactly what the last guy said. Out."`},
   {k:"map",label:"GitGuardian's exploration map shows three consumers, including recon-batch on batch-01, which isn't in any repo.",need:()=>S.f.map3,ok:true,pt:"i1",reply:`"batch-01. That box isn't even in our CMDB." She writes it down. "Okay. That's the one that would have bitten us."`},
   {k:"rb",item:"printed runbook",label:"Here's the runbook: new key first, consumers next, old key revoked only after it has zero traffic. Rollback is pointing Vault back at version 1.",need:()=>has("printed runbook"),ok:true,pt:"i2",reply:`She reads it. Twice. "You don't revoke until it's quiet. Good." She nods, very slightly.`},
   {k:"budget",label:"A suspended PayRail account is unplanned downtime that burns your error budget. A planned change in a window doesn't.",need:()=>S.f.prMap,ok:true,pt:"i3",reply:`"Planned changes don't count against the budget." She almost smiles. "You read the SLO doc."`}]));
  o.push(bye);return o;},
kenji:()=>{if(!S.f.kenjiAwake)return [...(has("cold brew")?[["Give Kenji the cold brew",()=>coffeeKenji(),"item","cold brew"]]:[]),["Wake him up",()=>({t:"You say his name. Nothing. You poke the beanbag. He mumbles 'it's DNS' and keeps sleeping. Something caffeinated might work. Engineering keeps cold brew in their fridge on Floor 3."})],bye];
  const o=[["What do you need?",()=>({t:`"Fewer pages. If GitGuardian alerts went to the team that owns the repo instead of a shared inbox, I'd sleep."`})]];
  if(!S.f.scout)o.push(["Where's the ggscout config?",()=>({t:`"/etc/ggscout/config.toml on ops-tools. My terminal's logged in, you can sudoedit it. Uncomment the vault-prod source. Don't touch the k8s bit, it works."`})]);
  if(S.f.scout&&!S.f.kenjiBatch)o.push(["Ever heard of recon-batch?",()=>{S.f.kenjiBatch=true;return {t:`"The nightly reconciliation job? Runs at 2 AM on batch-01. Teo's thing. If it breaks, Finance doesn't get their numbers and Harriet calls Ingrid, who calls me."`};}]);
  o.push(bye);return o;},
desmond:()=>{const o=[];
  if(!S.f.desAsk)o.push(["What do you need for the assessment?",()=>{S.f.desAsk=true;const p=award("des");return {t:`"The PCI assessor comes Monday. Requirement 8.6.2: passwords and secrets for system and application accounts aren't hardcoded in scripts, config files or source code. I need evidence that we look for them and fix them. I have... a binder with a cover page."\n\nHe looks at you hopefully. "GitGuardian can produce that, can't it?"`,p};}]);
  if(S.f.desAsk&&!S.f.desDone){if(has("PCI evidence"))o.push(["Give Desmond the PCI evidence: here's your 8.6.2 evidence, straight from GitGuardian.",()=>{take("PCI evidence");S.f.desDone=true;give("PayRail contract");const p=award("contract");
      return {t:`Desmond flips through it. "Detection history, who resolved what, when. This is real evidence." He hugs the printout.\n\n"Let me return the favor. Harriet doesn't care about breaches. Harriet cares about this." He hands you a page from the PayRail merchant agreement, section 14.2: if the merchant knows a credential is compromised and doesn't rotate it within 72 hours, PayRail can suspend processing, and fraud liability moves to the merchant.\n\n"We process about $410,000 an hour on a Friday night. Tell her that."\n\n[PayRail contract added to your items]`,p};},"item","PCI evidence"]);
    else o.push(["I'm on it.",()=>({t:`"GitGuardian, Secret incidents, the audit evidence export. Please. I'll be here. I live here now."`})]);}
  o.push(bye);return o;},
harriet:()=>{if(S.f.won4)return [["Thanks for signing.",()=>({t:`"Don't thank me. Don't break anything."`})],bye];
  const o=[];if(!S.f.harrietAsk)o.push(["I need a freeze exception for one change tonight.",()=>{S.f.harrietAsk=true;const p=award("harriet");return {t:`"No. The freeze is there so nothing breaks while we close the quarter. Also, while you're here: why do we pay for GitGuardian? I've seen no report from it. Ever."\n\nShe goes back to her spreadsheet. Talk money, or talk to Desmond. He seems to know what I care about.`,p};}]);
  if(S.f.harrietAsk)o.push(...pitches("harriet",[
   {k:"scare",label:"If we get hacked it'll be in the news.",ok:false,reply:`"Everything is in the news. What will it cost?"`},
   {k:"contract",item:"PayRail contract",label:"PayRail's contract: 72 hours after we know a key is compromised, fraud liability moves to us. GitGuardian first flagged this key 41 days ago.",need:()=>has("PayRail contract"),ok:true,pt:"h1",reply:`She stops typing. "Forty-one days. Against a seventy-two hour clause." She reads 14.2 herself. "Who knew?" You did, now.`},
   {k:"rev",label:"If PayRail suspends us, that's about $410,000 an hour in payments, during close. A two-hour window at 11 PM risks much less.",need:()=>S.pitch.harriet&&S.pitch.harriet.contract,ok:true,pt:"h2",reply:`She does the math faster than you did. "That's a material event." She doesn't say 'material event' lightly.`},
   {k:"pci",label:"Desmond's PCI evidence for Requirement 8.6.2 came straight out of GitGuardian. That's the report you never saw.",need:()=>S.f.desDone,ok:true,pt:"h3",reply:`"So that's what we pay for." She makes a note: RENEW. "Fine. The tool earns its keep."`}]));
  o.push(bye);return o;},
paloma:()=>{const o=[];if(!S.f.palAsk)o.push(["Show Paloma the freeze exception: I have Finance's signature and five minutes of good news.",()=>{S.f.palAsk=true;const p=award("paloma");return {t:`Paloma reads the signature. "Harriet signed something? On close week?" She stands. "Go. Five minutes. He's skeptical about everything except his own demos."`,p};},"item","freeze exception"]);
  else o.push(["Any tips?",()=>({t:`"He likes evidence he can show the board. He hates hypotheticals."`})]);o.push(bye);return o;},
victor:()=>{if(!S.f.palAsk)return [["(Paloma is watching you.)",()=>({t:`Paloma clears her throat. Loudly. You should talk to her first.`})],bye];
  if(S.f.won5)return [["Anything else?",()=>({t:`"Text me when it's done. Not before. Not during."`})],bye];
  const o=[];if(!S.f.vicAsk)o.push(["The PayRail live key is in a public gist. I want to rotate it tonight.",()=>{S.f.vicAsk=true;const p=award("victor");return {t:`"A gist from a contractor who left a year ago? Nobody reads those. I'm not risking Monday for a hypothetical."\n\nHe turns back to his slides. "Prove someone's looking, and we'll talk."\n\nGitGuardian has honeytokens: fake credentials that alert when anyone tries them.`,p};}]);
  if(S.f.vicAsk)o.push(...pitches("victor",[
   {k:"fear",label:"Trust me, attackers are everywhere.",ok:false,reply:`"I trust data. Bring some."`},
   {k:"ht",label:"I planted a fake AWS key in a public repo minutes ago. GitGuardian already caught someone trying it. The real PayRail key has been out there for 41 days.",need:()=>S.f.htFired,ok:true,pt:"v1p",reply:`You show him the honeytoken alert. Source IP, user agent, the API call they tried. Four minutes after the commit.\n\nVictor puts the clicker down. "Four minutes."`},
   {k:"plan",item:"freeze exception",label:"Finance signed the freeze exception. SRE has a runbook with a rollback. It's a planned change, not a gamble.",need:()=>has("freeze exception"),ok:true,pt:"v2p",reply:`"Harriet signed. Ingrid has a rollback." He looks at you differently. "You've been busy for a first day."`},
   {k:"board",label:"Tell the board we found it, fixed it without downtime, and can prove it. Toyota found theirs after five years on GitHub.",need:()=>pc("victor")>=2,ok:true,pt:"v3p",reply:`"'Found it, fixed it, no downtime.' I can sell that slide."`}]));
  o.push(bye);return o;}};

/* ============================== winning bosses ============================== */
const WIN={
 marisol:()=>{S.f.won1=true;S.gg="Member · Can view (all incidents)";S.badge.push("3");grant("GitGuardian: Member, Can view on all incidents");grant("GitGuardian alerts now route to you, not Hal");grant("Badge: Floor 3 (Engineering)");award("win1");
   levelUp(2,`Marisol changes your role in GitGuardian and reroutes the alerts. Then she taps your badge on her reader.\n\n"Member, view only, every incident. And Floor 3, because the critical one belongs to Payments. Go see what you've been missing."`);},
 wendell:()=>{S.f.won2=true;S.gg="Member · Can edit (Payments team)";S.badge.push("4");grant("GitGuardian: Can edit on Payments team incidents");grant("GitHub: GitGuardian checks on every Payments pull request");grant("#2871 assigned to you");grant("Badge: Floor 4 (SRE)");award("win2");
   levelUp(3,`Wendell sends three messages while you watch: one to Marisol ("give them Can edit on Payments"), one to his team ("GitGuardian checks on all our PRs, starting now"), one to you (#2871 is assigned to you).\n\n"Production belongs to Ingrid on Floor 4. She'll say no. Make her say yes."`);},
 ingrid:()=>{S.f.won3=true;S.badge.push("5");grant("Vault: write access to kv/payments (change window only)");grant("Deploys: restart rights for Payments (change window only)");grant("Badge: Floor 5 (Finance)");award("win3");
   levelUp(4,`Ingrid books a change window: tonight, 11 PM to 1 AM. Then she crosses it out.\n\n"Pending. The freeze is Finance's, not mine. Get Harriet's signature on Floor 5 and it's yours."`);},
 harriet:()=>{S.f.won4=true;give("freeze exception");S.badge.push("6");grant("Freeze exception: signed by the CFO");grant("Badge: Floor 6 (Executive)");award("win4");
   levelUp(5,`Harriet signs a freeze exception with a pen that costs more than your laptop.\n\n"One change, tonight, one key. Victor still has to approve production changes during a launch week. Floor 6. He's back from Tahoe."`);},
 victor:()=>{S.f.won5=true;S.gg="Member · Full access on #2871";grant("GitGuardian: Full access on #2871");grant("PayRail dashboard: admin");grant("Change window: 11 PM to 1 AM, approved");award("win5");
   levelUp(6,`Victor signs the change. "Do it tonight. Ingrid runs the bridge. Marisol gives you Full access on the incident. PayRail access comes from Wendell's team."\n\nHe pauses at the door. "And {name}? Don't break prod."`.replace("{name}",first()));}};
function levelUp(n,txt){msgBox(txt,null,()=>levelCard(n));}

/* ============================== honeytoken timer ============================== */
function htTick(){if(S&&S.ht&&S.ht.planted&&!S.ht.fired&&S.t>=S.ht.at){S.ht.fired=S.t;S.f.htFired=true;award("htFired");
  mail("ht","GitGuardian","[Honeytoken triggered] aws-docs-example in precarium-sdk-examples","Your honeytoken was used.\n\nSource IP: 185.220.101.47\nUser agent: aws-cli/2.15 Python/3.11 botocore\nAction: sts:GetCallerIdentity\nFirst use: 4 minutes after the commit was pushed\n\nNo real resources are behind a honeytoken. Whoever tried it was scanning public GitHub for credentials.");
  setTimeout(()=>flash("GitGuardian: your honeytoken just fired"),50);}}

/* ============================== the finale: things that can break prod ============================== */
const DEATHS={
 rollnow:["PROD IS DOWN","You chose 'expire the old key immediately'. checkout-api, payouts-worker and recon-batch were all still using it. Every payment attempt now fails with 401.\n\nThis is the most common rotation outage there is: revoking before the new credential is live everywhere. Create the new key first, keep the old one active, move every consumer, and only then revoke."],
 down:["PROD IS DOWN","You revoked the old key while PayRail still showed live traffic on it. checkout-api stopped taking payments mid-launch-week.\n\nIn March 2025 Cloudflare R2 went down for about an hour the same way: a new credential went to the wrong environment, and the old one was deleted before anyone confirmed the new one was in use. The traffic numbers were right there."],
 recon:["PROD IS DOWN · 2:00 AM","At 11:40 PM everything was green, so you went home. At 2:00 AM recon-batch woke up on batch-01, sent the old key to PayRail, and got a 401. No reconciliation, no finance numbers for quarter close, and Harriet's phone rang at 6 AM.\n\nBatch jobs don't show up in live traffic. GitGuardian's exploration map listed recon-batch as a consumer. GitHub broke sign-ins and email in December 2023 the same way: rotations that missed a consumer nobody was watching."]};
function die(k){S.dead=k;}
