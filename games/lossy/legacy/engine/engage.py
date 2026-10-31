#!/usr/bin/env python3
"""Run the bridge's queued orders.

  engage.py <orders_dir> [--no-turn]

<orders_dir> is where ArtifactData `list` (collection "orders", out_dir=...) saved the
order documents. Pending orders run in the order they were given, `engage` last.
If no engage was queued, one is added unless --no-turn.
Writes world/bridge/order_updates.json: a list of {doc_id, data, version} to send
back as ArtifactData updates, then refreshes world/bridge/*.json.
"""
import glob
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rangectl  # noqa: E402
import bridge  # noqa: E402
from common import WORLD_DIR  # noqa: E402


def load_orders(d):
    out = []
    for fp in glob.glob(os.path.join(d, "**", "*.json"), recursive=True):
        doc = json.load(open(fp))
        body = doc.get("data", doc) if isinstance(doc.get("data"), dict) else doc
        out.append({"id": doc.get("id") or doc.get("doc_id") or os.path.splitext(os.path.basename(fp))[0],
                    "version": doc.get("version") or doc.get("_version"), **{k: v for k, v in body.items() if k not in ("id", "version")}})
    return [o for o in out if o.get("status") == "pending"]


def main():
    d = sys.argv[1]
    pending = load_orders(d) if os.path.isdir(d) else []
    if "--no-turn" not in sys.argv and not any(o["cmd"].strip().lower() in ("engage", "next turn") for o in pending):
        pending.append({"id": None, "cmd": "engage", "created": 9e15})
    pending.sort(key=lambda o: (o["cmd"].strip().lower() in ("engage", "next turn"), o.get("created", 0)))
    results, updates = [], []
    for o in pending:
        res = rangectl.run_command(o["cmd"])
        msg = res.get("result") or res.get("status") or ""
        if "found" in res:
            msg += ": " + ", ".join(f"{f['secret']} {f['detector']} at {f['where']}" for f in res["found"])[:400]
        if res.get("note"):
            msg += " " + res["note"]
        if o["cmd"].strip().lower() in ("engage", "next turn") and res.get("ok"):
            msg = f"Turn {res['turn']}: {len(res['events'])} event(s). Scenario {res['scenario']} is {res['status']}."
        results.append({"cmd": o["cmd"], "ok": res.get("ok"), "result": msg, "raw": res})
        if o["id"]:
            updates.append({"doc_id": o["id"], "version": o.get("version"),
                            "data": {"status": "done" if res.get("ok") else "failed", "result": msg[:500]}})
    state, _ = rangectl.load()
    files = bridge.write_docs(state)
    os.makedirs(os.path.join(WORLD_DIR, "bridge"), exist_ok=True)
    json.dump(updates, open(os.path.join(WORLD_DIR, "bridge", "order_updates.json"), "w"), indent=1)
    print(json.dumps({"ran": [{k: r[k] for k in ("cmd", "ok", "result")} for r in results],
                      "events": next((r["raw"].get("events", []) for r in results if r["raw"].get("events")), []),
                      "order_updates": len(updates), "bridge_files": files}, indent=1))


if __name__ == "__main__":
    main()
