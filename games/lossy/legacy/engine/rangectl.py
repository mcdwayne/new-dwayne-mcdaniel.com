#!/usr/bin/env python3
"""Range controller.

  rangectl.py new-start [--seed N] [--headcount N] [--root NAME]
  rangectl.py start [SAVE_ID]
  rangectl.py stop
  rangectl.py next-turn
  rangectl.py status
  rangectl.py act <verb> <target>     verbs: rotate revoke isolate monitor honeytoken check investigate assign resolve ignore reopen endpoint-protection offboard

ggshield is never executed by anything in this range. Its output only ever
appears as simulated transcripts.
"""
import argparse
import json
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import SAVES_DIR, WORLD_DIR, slug  # noqa: E402
import gen_company  # noqa: E402
import gg_sim  # noqa: E402
import scenarios  # noqa: E402
import state as st  # noqa: E402
import world  # noqa: E402

CURRENT = os.path.join(SAVES_DIR, "CURRENT.md")


def _set_current(sid):
    os.makedirs(SAVES_DIR, exist_ok=True)
    open(CURRENT, "w").write(f"# Current save\n\n`{sid}`\n")


def _current():
    if not os.path.exists(CURRENT):
        saves = st.list_saves()
        if not saves:
            sys.exit("No save found. Run `new start`.")
        return saves[0][0]
    return open(CURRENT).read().split("`")[1]


def load(sid=None):
    sid = sid or _current()
    return st.read_save(os.path.join(SAVES_DIR, sid)), sid


def persist(state, rebuild=True):
    folder = st.write_save(state)
    if rebuild:
        world.build(state)
        import console
        console.render(state)
    return folder


def cmd_new_start(a):
    seed = a.seed if a.seed is not None else random.SystemRandom().randint(1000, 999999)
    state = gen_company.make_company(seed, a.headcount, a.root)
    gg_sim.init(state)
    scenarios.begin(state)
    folder = persist(state)
    _set_current(st.save_id(state))
    m = state["meta"]
    print(json.dumps({"save": st.save_id(state), "folder": folder, "company": m["names"][-1]["name"],
                      "headcount": m["headcount"], "lines": [(l["code"], l["name"], l["description"]) for l in state["lines"]],
                      "acquisition": state["acquisition"]["name"], "cast": len(state["cast"]), "repos": len(state["repos"]),
                      "monitored_repos": sum(r["gg_monitored"] for r in state["repos"]), "infra": len(state["infra"]),
                      "baseline_secrets": len(state["secrets"]), "baseline_incidents": len(state["gg"]["incidents"]),
                      "scenario": state["scenario"]["title"], "turn": m["turn"]}, indent=1))


def cmd_start(a):
    state, sid = load(a.save)
    state["meta"]["status"] = "running"
    persist(state)
    _set_current(sid)
    sc = state["scenario"]
    print(json.dumps({"resumed": sid, "company": state["meta"]["names"][-1]["name"], "turn": state["meta"]["turn"],
                      "scenario": f"{sc['no']}: {sc['title']} ({sc['status']}, stage {sc['stage']})",
                      "last_events": [j["text"] for j in state["journal"][-5:]]}, indent=1))


def cmd_stop(a):
    state, sid = load()
    state["meta"]["status"] = "stopped"
    state["journal"].append({"turn": state["meta"]["turn"], "actor": "operator", "kind": "session", "text": "Range stopped and saved."})
    folder = persist(state, rebuild=False)
    print(json.dumps({"stopped": sid, "folder": folder, "turn": state["meta"]["turn"]}))


def cmd_next_turn(a):
    state, sid = load()
    if state["meta"]["status"] != "running":
        sys.exit("Range is stopped. Run `start` first.")
    events = scenarios.advance(state)
    persist(state)
    print(json.dumps({"turn": state["meta"]["turn"], "company": state["meta"]["names"][-1]["name"],
                      "scenario": f"{state['scenario']['no']}: {state['scenario']['title']}",
                      "status": state["scenario"]["status"], "events": events}, indent=1))


def cmd_status(a):
    state, sid = load()
    sc = state["scenario"]; gg = state["gg"]
    print(json.dumps({"save": sid, "status": state["meta"]["status"], "company": state["meta"]["names"][-1]["name"],
                      "turn": state["meta"]["turn"], "scenario": f"{sc['no']}: {sc['title']} ({sc['status']})",
                      "open_incidents": sum(i["status"] in ("TRIGGERED", "ASSIGNED") for i in gg["incidents"]),
                      "public_incidents": len(gg["public_incidents"]), "honeytoken_events": len(gg["ht_events"]),
                      "compromised": [i["name"] for i in state["infra"] if i["flags"]["SEC"] == "COMPROMISED"],
                      "contained": scenarios.contained(state)}, indent=1))


def cmd_act(a):
    state, sid = load()
    verb, tgt = a.verb, a.target
    import re as _re
    if _re.fullmatch(r"[sSrRpP]\d+|[lL][tT]-\d+", tgt):
        tgt = tgt.upper()
    log = lambda t: state["journal"].append({"turn": state["meta"]["turn"], "actor": "operator", "kind": "action", "text": t})
    out = {}
    if verb in ("rotate", "revoke"):
        s = next(x for x in state["secrets"] if x["id"] == tgt)
        s["status"] = "rotated" if verb == "rotate" else "revoked"
        for inc in state["gg"]["incidents"]:
            if inc["_secret"] == tgt:
                inc["secret_revoked"] = True; inc["validity"] = "invalid"
        for loc in s["locations"]:
            if loc["type"] == "repo":
                out.setdefault("still_in_history", []).append(f"{loc['repo']}:{loc['path']}")
        log(f"{verb} {tgt} ({s['detector']}). Owner {s.get('owner') or 'none'} notified.")
        out["result"] = f"{tgt} {s['status']}. Consumers using it will break until redeployed with the new value."
    elif verb == "isolate":
        r = next(i for i in state["infra"] if i["id"] == tgt or i["name"] == tgt)
        r["flags"]["SEC"] = "CONTAINED"; r["flags"]["NET"] = "PRIVATE"
        log(f"isolated {r['id']} {r['name']}"); out["result"] = f"{r['name']} flags now {world._flagstr(r['flags'])}"
    elif verb == "monitor":
        repo = next(x for x in state["repos"] if x["name"] == tgt)
        repo["gg_monitored"] = True
        state["gg"]["sources"][repo["source_id"] - 1].update({"monitored": True, "monitoring_status": "FINISHED"})
        new = []
        for s in state["secrets"]:
            for loc in s["locations"]:
                if loc.get("type") == "repo" and loc["repo"] == tgt:
                    new.append(gg_sim.occurrence(state, s, loc, historical=True)["id"])
        for i in state["infra"]:
            if tgt.startswith(slug(i["name"])[:8]):
                i["flags"]["MON"] = "GG_MONITORED"
        log(f"enabled GitGuardian monitoring on {tgt}; historical scan found {len(set(new))} incidents")
        out["result"] = f"historical scan of {tgt}: incidents {sorted(set(new))}"
    elif verb == "honeytoken":
        gg = state["gg"]
        r = random.Random(f"{state['meta']['seed']}-ht-{len(gg['honeytokens'])}")
        from secrets_fmt import make_secret
        sec = make_secret(r, "aws_key")
        sec.update({"id": f"S{len(state['secrets']) + 1:03d}", "line": "corp", "validity": "valid", "status": "live",
                    "owner": None, "origin": "honeytoken", "honeytoken": True, "nhi": "aws:honeytoken",
                    "locations": [{"type": "endpoint" if tgt.startswith("LT-") else "repo", "host": tgt, "repo": tgt,
                                   "path": "~/.aws/credentials" if tgt.startswith("LT-") else ".env.backup",
                                   "introduced_turn": state["meta"]["turn"]}]})
        state["secrets"].append(sec)
        ht = {"id": gg_sim._next(gg, "ht"), "name": f"ht-{tgt}", "description": f"decoy planted at {tgt}",
              "created_at": gg_sim.ts(state), "status": "active", "type": "AWS", "token": sec["values"],
              "open_events_count": 0, "tags": [], "triggered_at": None, "_secret": sec["id"]}
        ht["gitguardian_url"] = f"{gg_sim.DASH}/honeytokens/{ht['id']}"
        gg["honeytokens"].append(ht)
        sc = state["scenario"]
        if sc and sc.get("keys"):
            sc["keys"].append(sec["id"])  # attackers harvesting this location will try it
        log(f"deployed honeytoken {ht['id']} at {tgt}"); out["result"] = f"honeytoken {ht['id']} active at {tgt}"
    elif verb == "check":
        from secrets_fmt import api_validity
        s = next(x for x in state["secrets"] if x["id"] == tgt)
        if s["validity"] == "unknown" and s["has_checker"]:
            s["validity"] = s.pop("_truth", "invalid")
        v = api_validity(s)
        for inc in state["gg"]["incidents"]:
            if inc["_secret"] == tgt:
                inc["validity"] = v
        log(f"validity check on {tgt}: {v}"); out["result"] = v
    elif verb == "endpoint-protection":
        hosts = [i["name"] for i in state["infra"] if i["kind"] == "laptop"] if tgt == "all" else [tgt]
        ep = state["meta"].setdefault("endpoint_protection", [])
        ep.extend(h for h in hosts if h not in ep)
        for i in state["infra"]:
            if i["name"] in hosts:
                i["flags"]["MON"] = "GG_MONITORED"
        log(f"rolled out Developer Endpoint Protection to {len(hosts)} machine(s)")
        out["result"] = f"daily `ggshield machine report` job (simulated) active on {len(ep)} laptops"
    elif verb == "investigate":
        found = []
        person = next((x for x in state["cast"] if x["id"] == tgt or x["name"].lower() == tgt.lower()), None)
        hosts = {person["laptop"]} if person else {tgt}
        for s in state["secrets"]:
            if s.get("honeytoken"):
                continue
            for loc in s["locations"]:
                if loc.get("host") in hosts or (loc.get("type") in ("repo", "image") and loc.get("repo") == tgt):
                    found.append({"secret": s["id"], "detector": s["detector"], "where": f"{loc.get('host') or loc.get('repo')}:{loc.get('path')}",
                                  "status": s["status"]})
        rev = state["meta"].setdefault("revealed", [])
        rev.extend(f["secret"] for f in found if f["secret"] not in rev)
        log(f"investigated {tgt}: {len(found)} credential(s) found")
        out["result"] = f"forensics on {tgt}: {len(found)} credential(s) found" + ("" if found else " (nothing on record there)")
        out["found"] = found
    elif verb in ("assign", "resolve", "ignore", "unassign", "reopen"):
        inc = next(i for i in state["gg"]["incidents"] if str(i["id"]) == tgt.lstrip("#"))
        upd = {"assign": ("ASSIGNED", {"assignee_email": "operator@range.local"}),
               "unassign": ("TRIGGERED", {"assignee_email": None}),
               "resolve": ("RESOLVED", {"resolved_at": gg_sim.ts(state)}),
               "ignore": ("IGNORED", {"ignore_reason": "false_positive", "ignored_at": gg_sim.ts(state)}),
               "reopen": ("TRIGGERED", {"resolved_at": None, "ignored_at": None})}[verb]
        inc["status"] = upd[0]; inc.update(upd[1])
        gg_sim.log(state, inc["id"], f"incident_{verb}ed", member="operator@range.local")
        s = next(x for x in state["secrets"] if x["id"] == inc["_secret"])
        log(f"{verb} incident #{inc['id']}")
        out["result"] = f"incident #{inc['id']} now {inc['status']}"
        if verb == "resolve" and s["status"] == "live":
            out["note"] = f"GitGuardian marks it resolved, but {s['id']} is still live at the provider. Rotate it to stop an attacker."
    elif verb == "offboard":
        p = next(x for x in state["cast"] if x["id"] == tgt)
        p["status"] = "departed"; log(f"offboarded {p['name']}")
        out["result"] = f"{p['name']} departed; NHIs they owned are now ownerless."
    else:
        sys.exit(f"unknown verb {verb}")
    if state.get("scenario"):
        state["scenario"]["acted"] = True
    persist(state)
    out["contained"] = scenarios.contained(state)
    print(json.dumps(out, indent=1))


def cmd_meta(a):
    state, sid = load()
    state["meta"][a.key] = a.value
    persist(state, rebuild=False)
    print(json.dumps({a.key: a.value}))


def cmd_report(a):
    import report
    state, _ = load()
    rep = report.build(state)
    print(json.dumps(rep, indent=1) if a.json else report.as_text(rep))


VERBS = {"rotate", "revoke", "isolate", "monitor", "honeytoken", "check", "investigate", "assign", "resolve",
         "ignore", "unassign", "reopen", "endpoint-protection", "offboard"}


def run_command(text):
    """Execute one command line (from chat or the bridge's order queue)."""
    import io, contextlib, shlex
    parts = shlex.split(text.strip().lower().replace("deploy endpoint protection", "endpoint-protection all"))
    if not parts:
        return {"ok": False, "result": "empty order"}
    verb, args = parts[0], parts[1:]
    if verb in ("engage", "next", "next-turn"):
        fn, ns = cmd_next_turn, None
    elif verb in VERBS and args:
        fn, ns = cmd_act, argparse.Namespace(verb=verb, target=" ".join(args) if verb == "investigate" else args[0])
    else:
        return {"ok": False, "result": f"Unknown order: {text}"}
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            fn(ns)
        return {"ok": True, **json.loads(buf.getvalue())}
    except (StopIteration, KeyError):
        return {"ok": False, "result": f"No such target in {text!r}"}
    except SystemExit as e:
        return {"ok": False, "result": str(e)}


def cmd_orders(a):
    """Run queued bridge orders (JSON list of {id, cmd}) in order, engage last."""
    orders = json.load(open(a.file))
    orders.sort(key=lambda o: (o["cmd"].strip().lower() in ("engage", "next turn", "next-turn"), o.get("created", 0)))
    out = []
    for o in orders:
        res = run_command(o["cmd"].replace("next turn", "engage"))
        out.append({"id": o["id"], "cmd": o["cmd"], **res})
    print(json.dumps(out, indent=1))


def cmd_bridge(a):
    import bridge
    state, _ = load()
    print(json.dumps(bridge.write_docs(state)))


def main():
    p = argparse.ArgumentParser()
    sp = p.add_subparsers(dest="cmd", required=True)
    n = sp.add_parser("new-start"); n.add_argument("--seed", type=int); n.add_argument("--headcount", type=int); n.add_argument("--root")
    s = sp.add_parser("start"); s.add_argument("save", nargs="?")
    sp.add_parser("stop"); sp.add_parser("next-turn"); sp.add_parser("status")
    ac = sp.add_parser("act"); ac.add_argument("verb"); ac.add_argument("target")
    me = sp.add_parser("meta"); me.add_argument("key"); me.add_argument("value")
    rp = sp.add_parser("report"); rp.add_argument("--json", action="store_true")
    od = sp.add_parser("orders"); od.add_argument("file")
    sp.add_parser("bridge")
    dc = sp.add_parser("do"); dc.add_argument("text", nargs="+")
    a = p.parse_args()
    {"new-start": cmd_new_start, "start": cmd_start, "stop": cmd_stop, "next-turn": cmd_next_turn,
     "status": cmd_status, "act": cmd_act, "meta": cmd_meta,
     "report": cmd_report, "orders": cmd_orders, "bridge": cmd_bridge,
     "do": lambda a: print(json.dumps(run_command(" ".join(a.text)), indent=1))}[a.cmd](a)


if __name__ == "__main__":
    main()
