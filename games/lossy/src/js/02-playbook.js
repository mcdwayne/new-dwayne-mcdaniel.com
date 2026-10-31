/* ============================== ULTIMATE: playbook IR-07, enforced ============================== */
const PB_STEPS=[
 {t:"Confirm the alert",d:"Open the honeytoken event in GitGuardian (Honeytoken › Honeytokens). Never reset it: a reset tells GitGuardian it was a false alarm.",done:()=>got("ht",4)},
 {t:"Isolate the endpoint",d:`Before anything else touches it, have ${P.ravi} disconnect ravi-mbp and hand it to IT.`,done:()=>S.f.isolated},
 {t:"Inventory the machine",d:"Endpoint protection › Endpoints › ravi-mbp › Secrets. Create an incident for every valid finding.",done:()=>[1401,1402,1403].every(id=>INC(id)&&INC(id).created)},
 {t:"Cut access paths first",d:"Revoke whatever can read other secrets before anything else: the Vault token (Vault › Access › Tokens).",done:()=>!!INC(1403)&&!INC(1403).key.v1},
 {t:"Revoke the stolen credentials",d:"Revoke the GitHub token and the SendGrid key now. Don't create replacements first: the attacker already has these.",done:()=>!!INC(1401)&&!!INC(1402)&&!INC(1401).key.v1&&!INC(1402).key.v1},
 {t:"Issue replacements into the vault",d:"Create a new SendGrid key and a fine-grained GitHub token. Store both as new versions in Vault (kv/plimbo/…).",done:()=>vlast("kv/plimbo/sendgrid")==="v2"&&vlast("kv/plimbo/github")==="v2"},
 {t:"Restore every consumer",d:"Point plimbo-api, the plimbo-ios release job and anything else that used those keys at Vault. Deploy and run.",done:()=>!!INC(1401)&&!!INC(1402)&&allHealthy(1401)&&allHealthy(1402)},
 {t:"Investigate what was taken",d:"Review the GitHub audit log, the Vault audit log and SendGrid activity. Record what the attacker touched.",done:()=>got("audit",4)&&got("vaudit",4)&&got("logs",4)},
 {t:"Close out",d:"Resolve all three incidents (secret revoked), then revoke the triggered honeytoken.",done:()=>[1401,1402,1403].every(id=>INC(id)&&INC(id).status==="RESOLVED")&&S.f.htRevoked},
 {t:"Report",d:`Tell ${P.coo} it's contained.`,done:()=>!!S.dayWon}];
const PB={
  first(){return PB_STEPS.findIndex(s=>!s.done());},
  done(){return PB_STEPS.slice(0,9).every(s=>s.done());},
  /* call before a state-changing action that belongs to playbook step n (1-based). Returns false and kills the run on a violation. */
  ok(n,label){if(S.day!==4)return true;const f=PB.first();if(f===-1||n-1<=f)return true;
    const st=PB_STEPS[f];S.pbFail=`You tried to ${label}. That's step ${n} of IR-07, "${PB_STEPS[n-1].t}". Step ${f+1}, "${st.t}", wasn't finished:\n\n${st.d}`;die("playbook");return false;},
  foul(label,why){if(S.day!==4)return true;S.pbFail=`You ${label}. ${why}`;die("playbook");return false;}};
function playbookText(){return PB_STEPS.map((s,i)=>`${i+1}. ${s.t.toUpperCase()}\n   ${s.d}`).join("\n\n");}
