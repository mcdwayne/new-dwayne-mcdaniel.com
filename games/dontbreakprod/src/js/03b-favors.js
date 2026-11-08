/* ============================== favors: fetch quests around the building ==============================
   In the spirit of old Sierra office adventures: everyone has a small problem, every problem has an object,
   and the object is somewhere silly. Ask people "Anything I can help with?" to hear about it; the Quest pad
   keeps a list. Favors are optional (points, and people warm up to you), except printing the runbook:
   Ingrid only reads paper. Items can be picked up before you know who they're for; showing one to the wrong
   person tells you who it belongs to. */
const FAVORS=[
 {k:"pen",who:"marisol",item:"silver pen",t:"Find Marisol's silver pen",done:()=>S.f.penBack,where:"She last had it when she tried to print the SOC 2 checklist.",
  ask:`"Actually, yes. My silver pen. I sign every audit document with it, and it's been gone since I tried to print the SOC 2 checklist. That printer eats everything."`},
 {k:"roll",who:"otto",item:"ticket roll",t:"Get Otto a roll of take-a-number tickets",done:()=>S.f.rollBack,where:"Spare rolls live in the Floor 2 supply closet. Your office.",
  ask:`"The take-a-number machine's been stuck on 47 for a month. It's out of paper. Spare rolls are in the supply closet on Floor 2." He pauses. "Which is... your office now. Sorry."`},
 {k:"cage",who:"otto",item:"cage key",t:"Open the loaner cage with Otto's key",done:()=>S.f.cage,heard:()=>S.f.rollBack,where:"The cage is on B1, behind Otto."},
 {k:"timer",who:"wendell",item:"tomato timer",t:"Find Wendell's tomato timer",done:()=>S.f.timerBack,where:"He suspects the kitchen. Engineering's fridge is on Floor 3.",
  ask:`"Someone stole my standup timer. Tomato-shaped. Fifteen minutes, then it rings and everyone stops talking. Without it, standup lasted fifty minutes today." He glares at the kitchen. "I have suspicions."`},
 {k:"duck",who:"juni",item:"rubber duck",t:"Find Juni's rubber duck",done:()=>S.f.duckBack,where:"She rinsed coffee out of it in a mop bucket. There's one in your closet.",
  ask:`"I lost my rubber duck. I explain my bugs to it. Without it I've been explaining them to Wendell, and he just says 'ship it'." She thinks. "Last time I saw it I was rinsing coffee out of it in a mop bucket. Don't ask whose."`},
 {k:"clips",who:"desmond",item:"binder clips",t:"Bring Desmond binder clips",done:()=>S.f.clipsBack,where:"IT hoards supplies in the loaner cage on B1. Otto has the key.",
  ask:`"Binder clips. My Requirement 8 binder keeps exploding, and Purchasing says clips need a PO. During the freeze." He holds it shut with his elbow. "IT hoards everything in that cage on B1."`},
 {k:"glasses",who:"harriet",item:"reading glasses",t:"Find Harriet's reading glasses",done:()=>S.f.glassesBack,where:"Red frames. Someone on this floor borrowed them for small print.",
  ask:`"I can't read fine print today. Someone walked off with my reading glasses. Red frames." She looks across the floor, at nobody in particular. Desmond is reading six-point font very comfortably.`},
 {k:"dongle",who:"paloma",item:"USB-C dongle",t:"Get Victor's demo screen working for Paloma",done:()=>S.f.dongleBack,where:"A USB-C to HDMI dongle. IT keeps spares in the loaner cage on B1.",
  ask:`"Victor's board demo screen won't take his laptop. It wants HDMI, his laptop is USB-C only, and IT says dongles need a ticket." She sighs. "A ticket with Otto. On B1. Where tickets go to die."`}];
const favHeard=f=>S.f["fav_"+f.k]||f.done()||(f.heard&&f.heard());
/* who each item is for. give() returns a reply for the conversation (or the Items verb). */
const ITEMFOR={
 "cold brew":{to:"kenji",live:()=>!S.f.kenjiAwake,give:()=>coffeeKenji()},
 "payments-incidents.csv":{to:"wendell",live:()=>!S.f.won2&&!(S.pitch.wendell||{}).csv},
 "runbook":{to:null,hint:"Ingrid only reads paper. Print it on the Floor 2 printer.",live:()=>!S.f.printed},
 "printed runbook":{to:"ingrid",live:()=>!S.f.won3&&!(S.pitch.ingrid||{}).rb},
 "PCI evidence":{to:"desmond",live:()=>!S.f.desDone},
 "PayRail contract":{to:"harriet",live:()=>!S.f.won4&&!(S.pitch.harriet||{}).contract},
 "freeze exception":{to:()=>S.f.palAsk?"victor":"paloma",live:()=>!S.f.won5&&!(S.pitch.victor||{}).plan},
 "silver pen":{to:"marisol",live:()=>!S.f.penBack,give:()=>{take("silver pen");S.f.penBack=true;const p=award("pen");
   return {p,t:`Marisol takes the pen and clicks it twice. "Where was it?" You tell her: inside the printer. "Of course it was."\n\nShe signs something with a flourish. "You find things. That's a good quality in a security person."`};}},
 "ticket roll":{to:"otto",live:()=>!S.f.rollBack,give:()=>{take("ticket roll");S.f.rollBack=true;give("cage key");const p=award("roll");draw();
   return {p,t:`"Tickets! Real ones!" Otto loads the roll. The counter clicks over to 48. Nobody is waiting. He doesn't care.\n\nHe tosses you a small key on a lanyard. "Loaner cage. Take anything useful. Not the BrickBooks, they bite."\n\n[cage key added to your items]`};}},
 "cage key":{to:null,hint:"That opens the loaner cage on B1.",live:()=>!S.f.cage},
 "tomato timer":{to:"wendell",live:()=>!S.f.timerBack,give:()=>{take("tomato timer");S.f.timerBack=true;const p=award("timer");
   return {p,t:`Wendell stares at the tomato. "In the fridge? That's a hate crime." He winds it to fifteen minutes and sets it on his desk. "Fine. You get fifteen minutes too."`};}},
 "rubber duck":{to:"juni",live:()=>!S.f.duckBack,give:()=>{take("rubber duck");S.f.duckBack=true;const p=award("duck");
   return {p,t:`Juni holds the duck up to the light. "Quackers." She sets it next to her keyboard. "Okay, duck. The scanner lies, the pager lies, Teo's config lies." She squeezes it. It wheezes. "Best debugger on the floor."`};}},
 "binder clips":{to:"desmond",live:()=>!S.f.clipsBack,give:()=>{take("binder clips");S.f.clipsBack=true;const p=award("clips");
   return {p,t:`Desmond clips the Requirement 8 binder shut. Then the next one. Then all five. He steps back. "Look at them. Audit-ready." He seems emotional about it.`};}},
 "reading glasses":{to:"harriet",live:()=>!S.f.glassesBack,give:()=>{take("reading glasses");S.f.glassesBack=true;const p=award("glasses");
   return {p,t:`Harriet puts them on and looks at you properly for the first time. "Better. Now I can see exactly how much this is costing me." She almost smiles. "Desmond?" You say nothing. She knows.`};}},
 "USB-C dongle":{to:"paloma",live:()=>!S.f.dongleBack,give:()=>{take("USB-C dongle");S.f.dongleBack=true;const p=award("dongle");draw();
   return {p,t:`Paloma plugs it in. The demo screen flickers: PAY LATER 2.0. She exhales for what looks like the first time today.\n\n"You're my favorite person on this floor." She writes your name into Victor's calendar. In pen.`};}}};
/* "Anything I can help with?" and, once you know, a reminder of where to look */
function favorOpts(who){const o=[];const first=PPL[who].name.split(" ")[0];
  for(const f of FAVORS){if(f.who!==who||!f.ask||f.done())continue;
    if(!S.f["fav_"+f.k])o.push(["Anything I can help with?",()=>{S.f["fav_"+f.k]=true;return {t:f.ask+"\n\n[Added to Favors in your Quest pad]"};}]);
    else if(!has(f.item))o.push([`Where might the ${f.item.replace(/^USB-C /,"")} be?`,()=>({t:`${first}: "${f.where}"`})]);}
  if(who==="desmond"&&S.f.fav_glasses&&!S.f.glassesGot&&!S.f.glassesBack)o.push(["Are those Harriet's red glasses on your head?",()=>{S.f.glassesGot=true;give("reading glasses");
    return {t:`Desmond touches his head. "Oh no. I borrowed them for the binder index. Six-point font." He hands them over. "Please give them back before she notices. She's noticed, hasn't she."\n\n[reading glasses added to your items]`};}]);
  return o;}
/* the places the items are, as Look and Use in each room */
Object.assign(LOOK.closet,{shelves:()=>"Paper towels, toner, and one box labeled HAL'S STUFF. Hal ran security before you."+(S.f.rollTaken?"":" Behind the towels, a box of take-a-number ticket rolls, for some reason."),
  bucket:()=>"A mop bucket. It's been here longer than the security program."+(S.f.duckTaken?"":" Something small and yellow bobs in the grey water.")});
Object.assign(USE.closet,{shelves:()=>{if(S.f.rollTaken)return say("Paper towels and toner. Nothing else you need.");S.f.rollTaken=true;give("ticket roll");
    say("Behind the paper towels: a box of take-a-number ticket rolls. Who takes a number in a supply closet? You take one roll anyway. Adventure instinct.\n\n[ticket roll added to your items]");},
  bucket:()=>{if(S.f.duckTaken)return say("You consider mopping. You decide to fix secrets instead.");S.f.duckTaken=true;give("rubber duck");
    say("You fish around in the mop bucket, against your better judgment. Your hand finds something rubbery: a yellow rubber duck, slightly grey now.\n\n[rubber duck added to your items]");}});
LOOK.f2.printer=()=>S.f.jam?(S.f.printed?"The printer. It printed your runbook and is very proud of itself.":"The printer. It works now. It seems suspicious of you."):"A sign on the printer: OUT OF ORDER SINCE THE REORG. Something silver glints inside, past the jammed paper.";
USE.f2.printer=()=>{if(!S.f.jam){S.f.jam=true;let t="You open the printer and pull out a crumpled SOC 2 checklist. Wedged in the rollers behind it: a silver pen.";
    if(!S.f.penBack){give("silver pen");t+="\n\n[silver pen added to your items]";}t+="\n\nThe printer wakes up, a little embarrassed.";draw();
    if(has("runbook")&&!S.f.printed)t+="\n\nUse it again to print your runbook.";return say(t);}
  if(has("runbook")&&!S.f.printed){S.f.printed=true;give("printed runbook");const p=award("print");draw();
    return say("The printer thinks about it, then prints your runbook. Six steps, one page, still warm.\n\n[printed runbook added to your items]",p);}
  say(S.f.printed?"It prints a test page. It's proud of itself.":"It works now. You don't have anything to print yet.");};
LOOK.b1.cage=()=>S.f.cage?"The loaner cage, open. Six dead BrickBooks and a lot of cables nobody will ever need.":"A cage of loaner laptops, cables and supplies. Locked. Otto has the key.";
LOOK.b1.number=()=>S.f.rollBack?"NOW SERVING: 48. Progress.":"NOW SERVING: 47. The machine is out of paper. Nobody takes a number. Nobody can.";
USE.b1.cage=()=>{if(S.f.cage)return say("You've taken everything useful. The BrickBooks watch you go.");
  if(!has("cage key"))return say("Locked. Your BrickBook came out of this cage. Otto has the key, and Otto has opinions.");
  take("cage key");S.f.cage=true;give("USB-C dongle");give("binder clips");const p=award("cage");draw();
  say("The cage creaks open. Behind six dead BrickBooks: a USB-C to HDMI dongle still in its bag, and a box of binder clips nobody has ever opened. You take both.\n\n[USB-C dongle and binder clips added to your items]",p);};
LOOK.f3.fridge=()=>(S.f.coffeeGiven||has("cold brew")?"Oat milk, three yogurts with names on them, and a sign: TAKE ONE COLD BREW, NOT FOUR.":"Oat milk, labeled yogurts, and a row of cold brew cans. A sign: ENGINEERING ONLY. TAKE ONE.")+(S.f.timerTaken?"":" Behind the oat milk, something red and round is ticking.");
/* one trip to the fridge takes whatever is useful in it: the timer, and (once Kenji needs it) a cold brew */
USE.f3.fridge=()=>{const got=[],lines=[];
  if(!S.f.timerTaken){S.f.timerTaken=true;give("tomato timer");got.push("tomato timer");lines.push("Behind the oat milk: a tomato-shaped kitchen timer, very cold, still ticking. Someone really didn't want standup to end on time. You take it.");}
  if(S.lv>=3&&!S.f.coffeeGiven&&!has("cold brew")){S.f.fridgeOpen=true;give("cold brew");got.push("cold brew");lines.push("You take one cold brew. The sign says one. You respect the sign.");}
  if(!got.length)return say(S.lv<3?"Oat milk and yogurts with names on them. Nothing you need right now.":"One cold brew per person. You read the sign.");
  say(lines.join("\n\n")+`\n\n[${got.join(" and ")} added to your items]`);};
LOOK.f6.demo=()=>S.f.dongleBack?"A demo of Pay Later 2.0 loops on the screen: 'Pay in 4. Instantly.' The payment step uses PayRail.":"The demo screen says NO SIGNAL. A USB-C cable dangles next to an HDMI port, as if they've never met.";
USE.f6.demo=()=>say(LOOK.f6.demo());
ITEMUSE["runbook"]={printer:()=>USE.f2.printer()};ITEMUSE["cage key"]={cage:()=>USE.b1.cage()};
ITEMUSE["USB-C dongle"]=Object.assign(ITEMUSE["USB-C dongle"]||{},{demo:()=>say("Paloma guards this screen. Give her the dongle and let her do it.")});
