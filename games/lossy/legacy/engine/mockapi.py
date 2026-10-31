#!/usr/bin/env python3
"""Local mock of the GitGuardian public API.

Authority order (per range spec): reference/api/*.md + reference/raw/openapi.json
first, reference/docs/*.md second.

- Every one of the documented operations is routed. Each response carries
  X-Range-Operation (operationId) and X-Range-Ref (its API reference anchor).
- Operations with sim meaning are stateful (X-Range-Simulated: stateful) and
  read/write the current markdown save.
- Everything else returns a body built from the documented response schema
  (X-Range-Simulated: schema-stub).

Run:  python3 mockapi.py [--port 8787]
Point clients at it:  GITGUARDIAN_API_URL=http://127.0.0.1:8787  (py-gitguardian
style clients). Any non-empty `Authorization: Token <x>` header is accepted.
"""
import argparse
import json
import os
import re
import sys
from flask import Flask, request, Response

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import REF_DIR  # noqa: E402
import gg_sim  # noqa: E402
import rangectl  # noqa: E402
import scenarios  # noqa: E402
from secrets_fmt import api_validity  # noqa: E402

SPEC = json.load(open(os.path.join(REF_DIR, "raw", "openapi.json")))
CATALOG = json.load(open(os.path.join(REF_DIR, "api_catalog.json")))
COMP = SPEC["components"]
ROUTES = []
for op in CATALOG:
    rx = "^" + re.sub(r"\{([^}]+)\}", r"(?P<\1>[^/]+)", op["path"]) + "/?$"
    ROUTES.append((op["method"], re.compile(rx), op))
# literal paths before templated ones (e.g. /honeytokens/endpoint-deployments before /honeytokens/{id})
ROUTES.sort(key=lambda x: x[2]["path"].count("{"))

app = Flask(__name__)
HANDLERS = {}


def handles(*ops):
    def deco(f):
        for o in ops:
            HANDLERS[o] = f
        return f
    return deco


# ----------------------------------------------------------------- schema filler
def _resolve(s):
    while isinstance(s, dict) and "$ref" in s:
        parts = s["$ref"].split("/")[2:]
        node = COMP
        for p in parts[1:] if parts[0] == "components" else parts:
            node = node[p]
        s = node
    return s


def fill(schema, data=None, depth=0):
    """Return a value shaped like `schema`, preferring fields from `data`."""
    s = _resolve(schema or {})
    if depth > 6:
        return data
    if "allOf" in s:
        subs = [_resolve(x) for x in s["allOf"]]
        if not any(x.get("type") == "object" or "properties" in x for x in subs):
            # allOf used to attach nullable/description to a scalar or enum
            return data if data is not None else _default(subs[0], depth)
        out = {}
        for sub in subs:
            v = fill(sub, data, depth + 1)
            if isinstance(v, dict):
                out.update(v)
        return out
    if "oneOf" in s or "anyOf" in s:
        opts = s.get("oneOf") or s.get("anyOf")
        return fill(opts[0], data, depth + 1)
    t = s.get("type")
    if t == "array" or "items" in s:
        if isinstance(data, list):
            return [fill(s.get("items", {}), d, depth + 1) for d in data]
        return []
    if t == "object" or "properties" in s:
        props = s.get("properties", {})
        data = data if isinstance(data, dict) else {}
        out = {}
        for k, sub in props.items():
            if k in data:
                out[k] = None if data[k] is None else fill(sub, data[k], depth + 1)
            else:
                out[k] = _default(_resolve(sub), depth)
        return out
    if data is not None:
        return data
    return _default(s, depth)


def _default(s, depth):
    if "example" in s:
        return s["example"]
    if s.get("nullable"):
        return None
    if "enum" in s:
        return s["enum"][0]
    t = s.get("type")
    if t in ("object",) or "properties" in s or "allOf" in s:
        return fill(s, {}, depth + 1) if depth < 3 else {}
    return {"string": "", "integer": 0, "number": 0, "boolean": False, "array": []}.get(t)


def response_schema(op, code=None):
    ops = SPEC["paths"][op["path"]][op["method"].lower()]
    codes = [code] if code else [c for c in ops["responses"] if c.startswith("2")]
    for c in codes:
        r = _resolve(ops["responses"].get(c, {}))
        for ct, body in (r.get("content") or {}).items():
            return c, body.get("schema", {})
    return (codes[0] if codes else "200"), None


def strip(x):
    if isinstance(x, dict):
        return {k: strip(v) for k, v in x.items() if not k.startswith("_")}
    if isinstance(x, list):
        return [strip(v) for v in x]
    return x


# ----------------------------------------------------------------- dispatch
@app.route("/", defaults={"path": ""}, methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
@app.route("/<path:path>", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
def dispatch(path):
    p = "/" + path.rstrip("/")
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Token ") or not auth[6:].strip():
        return _json({"detail": "Invalid API key."}, 401, None)
    for method, rx, op in ROUTES:
        if method == request.method:
            m = rx.match(p)
            if m:
                return _run(op, m.groupdict())
    return _json({"detail": "Not found."}, 404, None)


def _run(op, params):
    state, _ = rangectl.load()
    state["gg"]["api_calls"].append({"turn": state["meta"]["turn"], "op": op["operationId"],
                                     "method": op["method"], "path": request.path})
    h = HANDLERS.get(op["operationId"])
    if h:
        try:
            code, body, extra = h(state, op, params)
        except StopIteration:
            code, body, extra = 404, {"detail": "Not found."}, {}
        rangectl.persist(state, rebuild=False)
        _, sch = response_schema(op, str(code)) if 200 <= code < 300 else (None, None)
        if sch and isinstance(body, list):
            body = [fill(_resolve(sch).get("items", {}), strip(b)) for b in body] if _resolve(sch).get("type") == "array" else body
        elif sch and isinstance(body, dict) and code < 300:
            body = fill(sch, strip(body))
        return _json(strip(body), code, op, "stateful", extra)
    rangectl.persist(state, rebuild=False)
    code, sch = response_schema(op)
    body = fill(sch, {}) if sch else None
    return _json(body, int(code), op, "schema-stub")


def _json(body, code, op, mode=None, extra=None):
    r = Response(json.dumps(body, indent=1) if body is not None else "", status=code, mimetype="application/json")
    if op:
        r.headers["X-Range-Operation"] = op["operationId"]
        r.headers["X-Range-Ref"] = op["ref"]
        r.headers["X-Range-Simulated"] = mode
    for k, v in (extra or {}).items():
        r.headers[k] = v
    return r


def paginate(items):
    per = int(request.args.get("per_page", 20))
    page = int(request.args.get("page", request.args.get("cursor", 1)) or 1)
    chunk = items[(page - 1) * per: page * per]
    extra = {}
    if page * per < len(items):
        q = dict(request.args); q["cursor"] = page + 1
        extra["Link"] = f'<{request.base_url}?{"&".join(f"{k}={v}" for k, v in q.items())}>; rel="next"'
    return chunk, extra


def _body():
    return request.get_json(silent=True) or request.form.to_dict() or {}


# ----------------------------------------------------------------- incidents
def _incident(state, iid):
    return next(i for i in state["gg"]["incidents"] if str(i["id"]) == str(iid))


def _refresh(state, inc):
    s = next(x for x in state["secrets"] if x["id"] == inc["_secret"])
    inc["validity"] = api_validity(s)
    return inc


@handles("list-incidents", "list-sources-incidents", "list-team-incidents")
def h_list_incidents(state, op, p):
    items = [_refresh(state, i) for i in state["gg"]["incidents"]]
    a = request.args
    for f in ("status", "severity", "validity", "assignee_email"):
        if a.get(f):
            items = [i for i in items if str(i.get(f)).lower() == a[f].lower()]
    if a.get("tags"):
        items = [i for i in items if a["tags"] in i["tags"]]
    if "source_id" in p:
        occ = {o["incident_id"] for o in state["gg"]["occurrences"] if o.get("source") and str(o["source"]["id"]) == p["source_id"]}
        items = [i for i in items if i["id"] in occ]
    if "team_id" in p:
        team = next(t for t in state["gg"]["teams"] if str(t["id"]) == p["team_id"])
        secs = {x["id"] for x in state["secrets"] if x["line"] == team.get("_line")} if team.get("_line") else None
        items = [i for i in items if secs is None or i["_secret"] in secs]
    o = a.get("ordering", "-date")
    key = "risk_score" if "risk" in o else "date"
    items = sorted(items, key=lambda i: i.get(key) or 0, reverse=o.startswith("-"))
    chunk, extra = paginate(items)
    return 200, chunk, extra


@handles("retrieve-incidents")
def h_get_incident(state, op, p):
    inc = _refresh(state, _incident(state, p["incident_id"]))
    out = dict(inc)
    if request.args.get("with_occurrences", "20") != "0":
        out["occurrences"] = [o for o in state["gg"]["occurrences"] if o["incident_id"] == inc["id"]]
    return 200, out, {}


def _transition(state, inc, status, action, **kw):
    inc["status"] = status
    inc.update(kw)
    if state.get("scenario"):
        state["scenario"]["acted"] = True
    gg_sim.log(state, inc["id"], action, kw, member="operator@range.local")
    state["journal"].append({"turn": state["meta"]["turn"], "actor": "operator", "kind": "gg",
                             "text": f"incident #{inc['id']} -> {status} via API ({action})"})


@handles("assign-incident")
def h_assign(state, op, p):
    inc = _incident(state, p["incident_id"]); b = _body()
    email = b.get("email") or "operator@range.local"
    mem = next((m for m in state["gg"]["members"] if m["email"] == email), None)
    _transition(state, inc, "ASSIGNED", "incident_assigned", assignee_email=email, assignee_id=mem and mem["id"])
    return 200, inc, {}


@handles("unassign-incident")
def h_unassign(state, op, p):
    inc = _incident(state, p["incident_id"])
    _transition(state, inc, "TRIGGERED", "incident_unassigned", assignee_email=None, assignee_id=None)
    return 200, inc, {}


@handles("resolve-incident")
def h_resolve(state, op, p):
    inc = _incident(state, p["incident_id"]); b = _body()
    revoked = str(b.get("secret_revoked", "false")).lower() == "true"
    s = next(x for x in state["secrets"] if x["id"] == inc["_secret"])
    note = None
    if revoked and s["status"] == "live":
        note = ("Resolved as revoked, but the sim still shows this secret as live. GitGuardian records what you "
                "tell it; run `act rotate` (the real provider-side action) to actually stop the attacker.")
    _transition(state, inc, "RESOLVED", "incident_resolved", secret_revoked=revoked, resolved_at=gg_sim.ts(state))
    return 200, inc, ({"X-Range-Note": note} if note else {})


@handles("ignore-incident")
def h_ignore(state, op, p):
    inc = _incident(state, p["incident_id"]); b = _body()
    _transition(state, inc, "IGNORED", "incident_ignored", ignore_reason=b.get("ignore_reason", "false_positive"),
                ignored_at=gg_sim.ts(state))
    return 200, inc, {}


@handles("reopen-incident")
def h_reopen(state, op, p):
    inc = _incident(state, p["incident_id"])
    _transition(state, inc, "TRIGGERED", "incident_reopened", resolved_at=None, ignored_at=None, ignore_reason=None)
    return 200, inc, {}


@handles("update-secret-incident")
def h_update_inc(state, op, p):
    inc = _incident(state, p["incident_id"]); b = _body()
    for k in ("severity", "custom_tags"):
        if k in b:
            inc[k] = b[k]
    gg_sim.log(state, inc["id"], "incident_updated", b)
    return 200, inc, {}


@handles("check-presence-incident")
def h_presence(state, op, p):
    inc = _incident(state, p["incident_id"])
    s = next(x for x in state["secrets"] if x["id"] == inc["_secret"])
    present = any(l["type"] == "repo" for l in s["locations"])
    inc["secret_presence"] = "present" if present else "removed"
    return 200, inc, {}


@handles("list-incident-notes")
def h_notes(state, op, p):
    return 200, [n for n in state["gg"]["notes"] if str(n["incident_id"]) == p["incident_id"]], {}


@handles("create-incident-note")
def h_note_create(state, op, p):
    b = _body(); gg = state["gg"]
    n = {"id": gg_sim._next(gg, "note"), "incident_id": int(p["incident_id"]), "comment": b.get("comment", ""),
         "created_at": gg_sim.ts(state), "member_id": len(gg["members"]), "type": "comment"}
    gg["notes"].append(n)
    gg_sim.log(state, n["incident_id"], "incident_note_created", {"comment": n["comment"]})
    return 201, n, {}


@handles("list-incident-activity-logs")
def h_activity(state, op, p):
    return 200, [a for a in state["gg"]["activity"] if str(a["incident_id"]) == p["incident_id"]], {}


@handles("list-occs")
def h_occs(state, op, p):
    items = state["gg"]["occurrences"]
    if request.args.get("incident_id"):
        items = [o for o in items if str(o["incident_id"]) == request.args["incident_id"]]
    chunk, extra = paginate(items)
    return 200, chunk, extra


# ----------------------------------------------------------------- secrets / validity
def _secret_by_incident_or_id(state, sid):
    inc = next((i for i in state["gg"]["incidents"] if str(i["id"]) == sid or i["_secret"] == sid), None)
    return next(x for x in state["secrets"] if x["id"] == (inc["_secret"] if inc else sid)), inc


@handles("get-secret-validity", "get-secret-detail")
def h_validity(state, op, p):
    s, inc = _secret_by_incident_or_id(state, p["secret_id"])
    return 200, {"id": p["secret_id"], "validity": api_validity(s), "detector": inc["detector"] if inc else None,
                 "checked_at": gg_sim.ts(state)}, {}


@handles("check-secret-validity")
def h_check(state, op, p):
    s, inc = _secret_by_incident_or_id(state, p["secret_id"])
    if s["validity"] == "unknown" and s.get("has_checker"):
        s["validity"] = s.pop("_truth", "invalid")
    v = api_validity(s)
    if inc:
        inc["validity"] = v
        gg_sim.log(state, inc["id"], "validity_checked", {"validity": v})
    return 200, {"id": p["secret_id"], "validity": v, "checked_at": gg_sim.ts(state)}, {}


# ----------------------------------------------------------------- scan (ggshield's engine, simulated)
PATTERNS = [
    ("AWS Keys", r"AKIA[A-Z2-7]{16}"), ("GitHub Personal Access Token", r"ghp_[A-Za-z0-9]{36}"),
    ("GitHub Fine-Grained Personal Access Token", r"github_pat_[A-Za-z0-9_]{82}"),
    ("Slack Bot Token", r"xoxb-\d+-\d+-[A-Za-z0-9]+"), ("Stripe Keys", r"sk_live_[A-Za-z0-9]{24,}"),
    ("Google API Key", r"AIza[A-Za-z0-9_-]{35}"), ("OpenAI API Key", r"sk-proj-[A-Za-z0-9_-]{40,}"),
    ("Anthropic API Key", r"sk-ant-api03-[A-Za-z0-9_-]{90,}"), ("SendGrid Key", r"SG\.[\w-]{22}\.[\w-]{43}"),
    ("npm Token", r"npm_[A-Za-z0-9]{36}"), ("HashiCorp Vault Token", r"hvs\.[\w-]{90,}"),
    ("PostgreSQL Credentials", r"postgres(?:ql)?://[^\s:]+:[^\s@]+@[^\s/]+"),
    ("Mapbox Token", r"sk\.eyJ1[\w.-]{40,}"), ("Twilio Keys", r"AC[0-9a-f]{32}"),
    ("Private Key", r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
]


def scan_doc(state, doc):
    breaks = []
    for name, rx in PATTERNS:
        for m in re.finditer(rx, doc):
            val = m.group(0)
            known = next((s for s in state["secrets"] if any(val in str(v) for v in s["values"].values())), None)
            inc = next((i for i in state["gg"]["incidents"] if known and i["_secret"] == known["id"]), None)
            breaks.append({"type": known["detector"] if known else name, "policy": "Secrets detection",
                           "validity": api_validity(known) if known else "no_checker",
                           "known_secret": bool(inc), "incident_url": inc["gitguardian_url"] if inc else None,
                           "matches": [{"type": "apikey", "match": val[:4] + "…", "index_start": m.start(),
                                        "index_end": m.end()}]})
    return {"policy_break_count": len(breaks), "policies": ["Secrets detection", "File extensions", "Filenames"],
            "policy_breaks": breaks, "is_diff": False}


@handles("content_scan")
def h_scan(state, op, p):
    return 200, scan_doc(state, _body().get("document", "")), {}


@handles("multiple_scan")
def h_multiscan(state, op, p):
    docs = request.get_json(silent=True) or []
    return 200, [scan_doc(state, d.get("document", "")) for d in docs], {}


# ----------------------------------------------------------------- public monitoring
@handles("list-public-incidents")
def h_pub(state, op, p):
    for i in state["gg"]["public_incidents"]:
        i["validity"] = api_validity(next(x for x in state["secrets"] if x["id"] == i["_secret"]))
    chunk, extra = paginate(state["gg"]["public_incidents"])
    return 200, chunk, extra


@handles("retrieve-public-incidents")
def h_pub_get(state, op, p):
    return 200, next(i for i in state["gg"]["public_incidents"] if str(i["id"]) == p["incident_id"]), {}


@handles("resolve-public-incidents", "ignore-public-incidents", "reopen-public-incidents")
def h_pub_tr(state, op, p):
    i = next(i for i in state["gg"]["public_incidents"] if str(i["id"]) == p["incident_id"])
    i["status"] = {"resolve": "RESOLVED", "ignore": "IGNORED", "reopen": "TRIGGERED"}[op["operationId"].split("-")[0]]
    return 200, i, {}


@handles("list-public-secret-occurrences")
def h_pub_occ(state, op, p):
    return 200, [o for o in state["gg"]["public_occurrences"] if str(o["incident_id"]) == p["incident_id"]], {}


# ----------------------------------------------------------------- honeytokens
@handles("list-honeytoken")
def h_ht_list(state, op, p):
    chunk, extra = paginate(state["gg"]["honeytokens"])
    return 200, chunk, extra


@handles("retrieve-honeytoken")
def h_ht_get(state, op, p):
    return 200, next(h for h in state["gg"]["honeytokens"] if str(h["id"]) == p["honeytoken_id"]), {}


@handles("create-honeytoken", "create-honeytoken-with-context")
def h_ht_create(state, op, p):
    b = _body()
    where = b.get("name") or "api-created"
    rangectl_args = type("A", (), {"verb": "honeytoken", "target": where})
    # reuse the controller path so honeytokens are wired into scenarios the same way
    import io, contextlib
    rangectl.persist(state, rebuild=False)
    with contextlib.redirect_stdout(io.StringIO()):
        rangectl.cmd_act(rangectl_args)
    fresh, _ = rangectl.load()
    state.clear(); state.update(fresh)
    ht = state["gg"]["honeytokens"][-1]
    ht["description"] = b.get("description", ht["description"])
    return 201, ht, {}


@handles("revoke-honeytoken")
def h_ht_revoke(state, op, p):
    h = next(h for h in state["gg"]["honeytokens"] if str(h["id"]) == p["honeytoken_id"])
    h["status"] = "revoked"; h["revoked_at"] = gg_sim.ts(state)
    return 200, h, {}


@handles("list-honeytokens-events")
def h_ht_events(state, op, p):
    chunk, extra = paginate(state["gg"]["ht_events"])
    return 200, chunk, extra


# ----------------------------------------------------------------- NHI governance
@handles("list-nhi-identities")
def h_nhi(state, op, p):
    items = gg_sim.nhi_identities(state)
    if request.args.get("risk_criticality"):
        items = [i for i in items if i["risk_criticality"] == request.args["risk_criticality"]]
    chunk, extra = paginate(items)
    return 200, chunk, extra


@handles("retrieve-nhi-identity")
def h_nhi_get(state, op, p):
    return 200, next(i for i in gg_sim.nhi_identities(state) if i["id"] == p["identity_id"]), {}


@handles("list-nhi-identity-owners")
def h_nhi_owners(state, op, p):
    return 200, next(i for i in gg_sim.nhi_identities(state) if i["id"] == p["identity_id"])["owners"], {}


@handles("add-nhi-identity-owners", "replace-nhi-identity-owners")
def h_nhi_set_owner(state, op, p):
    ident = next(i for i in gg_sim.nhi_identities(state) if i["id"] == p["identity_id"])
    b = _body(); emails = b.get("emails") or [o.get("email") for o in b.get("owners", [])] or [b.get("email")]
    person = next((c for c in state["cast"] if c["email"] in emails and c["status"] == "active"), None)
    if person:
        next(x for x in state["secrets"] if x["id"] == ident["_secret"])["owner"] = person["id"]
        state["journal"].append({"turn": state["meta"]["turn"], "actor": "operator", "kind": "gg",
                                 "text": f"NHI {ident['name']} owner set to {person['name']}"})
    return 200, next(i for i in gg_sim.nhi_identities(state) if i["id"] == p["identity_id"]), {}


@handles("list-nhi-identity-locations")
def h_nhi_loc(state, op, p):
    ident = next(i for i in gg_sim.nhi_identities(state) if i["id"] == p["identity_id"])
    return 200, next(x for x in state["secrets"] if x["id"] == ident["_secret"])["locations"], {}


@handles("list-nhi-policies")
def h_nhi_pol(state, op, p):
    return 200, gg_sim.NHI_POLICIES, {}


@handles("list-nhi-sources")
def h_nhi_src(state, op, p):
    return 200, state["gg"]["nhi_sources"], {}


# ----------------------------------------------------------------- workspace objects
@handles("list-sources")
def h_sources(state, op, p):
    items = state["gg"]["sources"]
    if request.args.get("monitored"):
        items = [s for s in items if str(s["monitored"]).lower() == request.args["monitored"].lower()]
    chunk, extra = paginate(items)
    return 200, chunk, extra


@handles("retrieve-source")
def h_source(state, op, p):
    return 200, next(s for s in state["gg"]["sources"] if str(s["id"]) == p["source_id"]), {}


@handles("list-members")
def h_members(state, op, p):
    chunk, extra = paginate(state["gg"]["members"])
    return 200, chunk, extra


@handles("list-teams")
def h_teams(state, op, p):
    return 200, state["gg"]["teams"], {}


@handles("list-secret-detectors")
def h_detectors(state, op, p):
    return 200, [{"name": n.lower().replace(" ", "_"), "display_name": n, "nature": "specific"} for n, _ in PATTERNS], {}


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8787)
    a = ap.parse_args()
    print(f"Mock GitGuardian API on http://127.0.0.1:{a.port} ({len(ROUTES)} operations, {len(HANDLERS)} stateful)")
    app.run("127.0.0.1", a.port, debug=False)
