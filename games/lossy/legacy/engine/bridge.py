"""Bridge data for the live page (pushed to the artifact's db store).

Three documents, each well under the 256 KiB doc cap:
  bridge/state   report, scenario, GitGuardian view, journal, company facts
  bridge/flags   compact machine-state table
  bridge/people  compact named cast
No secret values and no hidden validity truth leave the engine.
"""
import json
import os
from common import WORLD_DIR
import gg_sim
import report
from secrets_fmt import api_validity

FLAG_ORDER = ("PWR", "PATCH", "NET", "OWN", "SEC", "MON")


def docs(state):
    gg = state["gg"]
    rep = report.build(state)
    vis = report.visible_secret_ids(state)
    sec = {s["id"]: s for s in state["secrets"]}
    sc = state["scenario"] or {}
    nhi = gg_sim.nhi_identities(state)
    st = {
        "v": 1, "turn": state["meta"]["turn"], "status": state["meta"]["status"],
        "names": state["meta"]["names"], "headcount": state["meta"]["headcount"], "seed": state["meta"]["seed"],
        "report": rep,
        "scenario": {k: sc.get(k) for k in ("no", "title", "status", "stage", "started_turn", "damage")},
        "history": state["meta"].get("history", []),
        "lines": [{k: l[k] for k in ("code", "name", "description", "clouds")} for l in state["lines"]],
        "acq": {k: state["acquisition"][k] for k in ("name", "acquired", "note")},
        "depts": state["departments"],
        "repos": [[r["name"], r["line"], r["host"], r["gg_monitored"]] for r in state["repos"]],
        "incidents": [[i["id"], i["status"], i["severity"], api_validity(sec[i["_secret"]]), i["incident_name"],
                       i["_secret"], i["occurrences_count"], bool(i.get("public_exposure")), i.get("assignee_email") or "",
                       ",".join(i["tags"])] for i in gg["incidents"]],
        "public": [[p["id"], p["status"], p["_where"], p["_secret"], p["date"]] for p in gg["public_incidents"]],
        "honeytokens": [[h["id"], h["name"], h["status"], h.get("open_events_count", 0)] for h in gg["honeytokens"]],
        "ht_events": [[e["id"], e["honeytoken_id"], e["ip_address"], e["action"], e["triggered_at"]] for e in gg["ht_events"][-20:]],
        "nhi": [[n["name"], n["risk_criticality"], n["owners"][0]["name"] if n["owners"] else "", ",".join(n["breached_policies"]),
                 n["validity"]] for n in nhi if n["risk_criticality"] in ("critical", "high") or not n["owners"]][:150],
        "known_secrets": [[sid, sec[sid]["detector"], sec[sid]["status"], api_validity(sec[sid]),
                           "; ".join(str(l.get("repo") or l.get("host") or l.get("url")) for l in sec[sid]["locations"])[:160]]
                          for sid in sorted(vis)],
        "endpoint_protection": len(state["meta"].get("endpoint_protection", [])),
        "laptops": sum(1 for i in state["infra"] if i["kind"] == "laptop"),
        "journal": [[j["turn"], j["actor"], j["kind"], j["text"]] for j in state["journal"][-80:]],
        "api_calls": len(gg["api_calls"]), "sim_time": gg_sim.ts(state),
    }
    flags = {"rows": [[i["id"], i["name"], i["provider"], i["kind"], i["line"],
                       "·".join(i["flags"][k] for k in FLAG_ORDER), ",".join(i["secrets"])] for i in state["infra"]]}
    people = {"rows": [[p["id"], p["name"], p["title"], p["dept"], p["line"], p["status"], p["laptop"],
                        " ".join(f"{k}:{v}" for k, v in p["access"].items())] for p in state["cast"]]}
    return {"bridge/state": st, "bridge/flags": flags, "bridge/people": people}


def write_docs(state):
    d = os.path.join(WORLD_DIR, "bridge")
    os.makedirs(d, exist_ok=True)
    out = {}
    for path, body in docs(state).items():
        fp = os.path.join(d, path.split("/")[1] + ".json")
        raw = json.dumps(body, separators=(",", ":"))
        if len(raw.encode()) > 250_000:
            raise ValueError(f"{path} is {len(raw)} bytes, over the db document cap")
        open(fp, "w").write(raw)
        out[path] = {"file": fp, "bytes": len(raw)}
    return out
