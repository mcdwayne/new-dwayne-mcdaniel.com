"""GitGuardian-side state, driven by sim events.

Records use the real field names from reference/raw/openapi.json schemas
(`incident`, `occurrence`, `publicSecretIncident`, `honeytoken`,
`honeyTokenEvent`, `nhiIdentity`, `nhiSource`, `source`, `member`, `team`).
mockapi.py fills any field not set here from the schema, so responses always
match the documented shape.
"""
import hashlib
from common import slug

DASH = "https://dashboard.gitguardian.com/workspace/1"
DETECTOR_FAMILY = {"aws": "Cloud", "gcp": "Cloud", "github": "Version Control", "slack": "Messaging",
                   "stripe": "Payment", "plaid": "Payment", "mapbox": "Maps", "google": "Cloud",
                   "openai": "AI", "anthropic": "AI", "onprem-db": "Database", "twilio": "Messaging",
                   "sendgrid": "Messaging", "datadog": "Monitoring", "vault": "Secrets Manager",
                   "rackspace": "Generic", "onprem": "Private Key", "npm": "Package Registry"}
SEV = {"valid": "critical", "unknown": "high", "invalid": "low"}


def _h(s):
    return hashlib.sha256(s.encode()).hexdigest()


def ts(state, turn=None):
    t = state["meta"]["turn"] if turn is None else turn
    # one sim turn = 6 hours, starting 2026-11-02 09:00 UTC
    hrs = 9 + 6 * t
    return f"2026-11-{2 + hrs // 24:02d}T{hrs % 24:02d}:{(t * 17) % 60:02d}:00Z"


def init(state):
    from secrets_fmt import api_validity  # noqa
    gg = {"next": {"incident": 1000, "occurrence": 5000, "note": 1, "public": 300, "public_occ": 900,
                   "ht": 1, "ht_event": 1, "activity": 1, "source": 1, "member": 1, "team": 1},
          "incidents": [], "occurrences": [], "notes": [], "activity": [], "public_incidents": [],
          "public_occurrences": [], "honeytokens": [], "ht_events": [], "sources": [], "members": [],
          "teams": [], "nhi_sources": [], "endpoint_findings": [], "api_calls": []}
    state["gg"] = gg
    for x in state["repos"]:
        sid = _next(gg, "source")
        x["source_id"] = sid
        gg["sources"].append({"id": sid, "url": f"https://{x['host']}.example/{state['meta']['root'].lower()}/{x['name']}",
                              "type": {"github": "github", "gitlab-legacy": "gitlab", "bitbucket-server": "bitbucket"}[x["host"]],
                              "full_name": f"{state['meta']['root'].lower()}/{x['name']}", "visibility": x["visibility"],
                              "monitored": x["gg_monitored"], "default_branch": "main",
                              "health": "safe", "open_incidents_count": 0, "closed_incidents_count": 0,
                              "monitoring_status": "FINISHED" if x["gg_monitored"] else "NOT_MONITORED"})
    for p in state["cast"]:
        if p["dept"] in ("Security", "Platform & SRE") or p["title"] in ("CTO", "CISO"):
            gg["members"].append({"id": _next(gg, "member"), "name": p["name"], "email": p["email"],
                                  "role": "manager" if p["dept"] == "Security" else "member",
                                  "access_level": "manager" if p["dept"] == "Security" else "member",
                                  "active": True, "created_at": "2025-06-01T00:00:00Z", "_person": p["id"]})
    gg["members"].append({"id": _next(gg, "member"), "name": "You (range operator)", "email": "operator@range.local",
                          "role": "owner", "access_level": "owner", "active": True, "created_at": ts(state, 0)})
    for ln in state["lines"]:
        gg["teams"].append({"id": _next(gg, "team"), "name": f"Team {ln['name']}", "description": ln["description"],
                            "is_global": False, "_line": ln["code"]})
    gg["teams"].append({"id": _next(gg, "team"), "name": "All-users", "description": "Global team", "is_global": True})
    for kind, ident in [("aws", "aws-prod"), ("aws", "aws-dev"), ("gcp", f"{slug(state['acquisition']['name'])}-org"),
                        ("vault", "vault-l6"), ("kubernetes", "eks-prod")]:
        gg["nhi_sources"].append({"id": f"src-{ident}", "type": kind, "display_name": ident, "identifier": ident,
                                  "status": "ok" if kind != "gcp" else "error", "owner": None,
                                  "is_monitored": kind != "gcp", "last_seen_at": ts(state, 0)})
    # historical scan of monitored repos at turn 0
    for s in state["secrets"]:
        for loc in s["locations"]:
            if loc["type"] == "repo":
                repo = next(x for x in state["repos"] if x["name"] == loc["repo"])
                if repo["gg_monitored"]:
                    occurrence(state, s, loc, historical=True)


def _next(gg, k):
    v = gg["next"][k]; gg["next"][k] += 1
    return v


def log(state, incident_id, action, data=None, member="system"):
    gg = state["gg"]
    gg["activity"].append({"id": _next(gg, "activity"), "incident_id": incident_id, "created_at": ts(state),
                           "action": action, "member": member, "data": data or {}})


def incident_for(state, s):
    from secrets_fmt import api_validity
    gg = state["gg"]
    for inc in gg["incidents"]:
        if inc["_secret"] == s["id"]:
            inc["validity"] = api_validity(s)
            return inc
    v = api_validity(s)
    inc = {"id": _next(gg, "incident"), "date": ts(state), "triggered_at": ts(state),
           "detector": {"name": slug(s["detector"]).replace("-", "_"), "display_name": s["detector"],
                        "nature": "specific", "family": DETECTOR_FAMILY.get(s["provider"], "Generic"),
                        "detector_group_name": slug(s["detector"]).replace("-", "_"),
                        "detector_group_display_name": s["detector"]},
           "secret_hash": _h(s["id"] + str(state["meta"]["seed"])), "hmsl_hash": _h("hmsl" + s["id"]),
           "regression": False, "status": "TRIGGERED", "assignee_id": None, "assignee_email": None,
           "occurrences_count": 0, "secret_presence": "present", "ignore_reason": None,
           "secret_revoked": False, "severity": SEV[s["validity"]] if v != "no_checker" else "high",
           "validity": v, "resolved_at": None, "tags": [], "custom_tags": [], "is_vaulted": False,
           "incident_name": f"{s['detector']} in {s['locations'][0].get('repo', 'endpoint')}",
           "risk_score": {"valid": 92, "unknown": 70, "invalid": 31}[s["validity"]],
           "public_exposure": False, "_secret": s["id"]}
    inc["gitguardian_url"] = f"{DASH}/incidents/{inc['id']}"
    gg["incidents"].append(inc)
    log(state, inc["id"], "incident_triggered")
    return inc


def occurrence(state, s, loc, historical=False, author=None):
    gg = state["gg"]
    inc = incident_for(state, s)
    repo = next((x for x in state["repos"] if x["name"] == loc.get("repo")), None)
    occ = {"id": _next(gg, "occurrence"), "incident_id": inc["id"], "kind": "historical" if historical else "realtime",
           "author_name": author or "unknown", "author_info": f"{(author or 'unknown').lower().replace(' ', '.')}@{state['meta']['domain']}",
           "date": ts(state), "filepath": loc.get("path"), "sha": loc.get("sha", _h(str(loc))[:40]),
           "url": f"{gg['sources'][repo['source_id'] - 1]['url']}/blob/main/{loc.get('path')}" if repo else None,
           "matches": [{"name": k, "match": "<redacted in range>"} for k in s["values"]],
           "tags": ["FROM_HISTORICAL_SCAN"] if historical else ["DEFAULT_BRANCH"],
           "source": gg["sources"][repo["source_id"] - 1] if repo else None, "incident_name": inc["incident_name"]}
    if historical and "FROM_HISTORICAL_SCAN" not in inc["tags"]:
        inc["tags"].append("FROM_HISTORICAL_SCAN")
    if loc.get("path", "").startswith("tests/"):
        inc["tags"].append("TEST_FILE")
    if any(x in (loc.get("path") or "") for x in (".env", "id_rsa", ".json")):
        inc["tags"].append("SENSITIVE_FILE")
    inc["tags"] = sorted(set(inc["tags"]))
    gg["occurrences"].append(occ)
    inc["occurrences_count"] += 1
    if inc["status"] == "RESOLVED":
        inc["status"] = "TRIGGERED"; inc["regression"] = True; inc["tags"] = sorted(set(inc["tags"] + ["REGRESSION"]))
        log(state, inc["id"], "incident_regression")
    if repo:
        src = gg["sources"][repo["source_id"] - 1]
        src["open_incidents_count"] = len({o["incident_id"] for o in gg["occurrences"]
                                           if o.get("source") and o["source"]["id"] == src["id"]})
        src["health"] = "at_risk"
    return inc


def public_exposure(state, s, url, where="public GitHub repository"):
    gg = state["gg"]
    pinc = {"id": _next(gg, "public"), "date": ts(state), "detector": {"display_name": s["detector"]},
            "status": "TRIGGERED", "validity": __import__("secrets_fmt").api_validity(s),
            "gitguardian_url": f"{DASH}/public-incidents/{gg['next']['public'] - 1}", "occurrences_count": 1,
            "_secret": s["id"], "_where": where}
    gg["public_incidents"].append(pinc)
    gg["public_occurrences"].append({"id": _next(gg, "public_occ"), "incident_id": pinc["id"], "url": url,
                                     "date": ts(state), "kind": "realtime"})
    for inc in gg["incidents"]:
        if inc["_secret"] == s["id"]:
            inc["public_exposure"] = True
            inc["tags"] = sorted(set(inc["tags"] + ["PUBLICLY_EXPOSED"]))
    return pinc


def nhi_identities(state):
    """Derived on read: one identity per secret, ownership from the cast."""
    from secrets_fmt import api_validity
    cast = {p["id"]: p for p in state["cast"]}
    out = []
    for s in state["secrets"]:
        if s.get("honeytoken"):
            continue
        owner = cast.get(s.get("owner"))
        owners = [] if not owner or owner["status"] != "active" else [{"id": owner["id"], "email": owner["email"],
                                                                       "name": owner["name"], "type": "user"}]
        envs = ["production"] if s["validity"] == "valid" else ["development"]
        out.append({"id": _h(s["nhi"])[:24], "name": s["nhi"], "hmsl_hash": _h("hmsl" + s["id"]),
                    "environments": envs, "detectors": [s["detector"]], "secret_providers": [s["provider"]],
                    "provider": s["provider"], "secrets_managers": ["vault"] if s["provider"] == "vault" else [],
                    "consumers": [loc.get("repo") or loc.get("host") for loc in s["locations"]],
                    "endpoints": [loc["host"] for loc in s["locations"] if loc["type"] == "endpoint"],
                    "breached_policies": _policies(s, owners), "owners": owners,
                    "risk_criticality": "critical" if s["validity"] == "valid" and not owners else
                    ("high" if s["validity"] != "invalid" else "low"),
                    "is_admin": s["kind"] in ("gcp_sa", "aws_key") and s["validity"] == "valid",
                    "validity": api_validity(s), "created_at": ts(state, 0), "last_used_at": s.get("last_used_at"),
                    "_secret": s["id"]})
    return out


def _policies(s, owners):
    p = []
    if not owners:
        p.append("no-owner")
    if len(s["locations"]) > 1:
        p.append("reused-secret")
    if any(loc["type"] == "public" for loc in s["locations"]):
        p.append("publicly-leaked")
    if s["provider"] != "vault" and any(loc["type"] == "repo" for loc in s["locations"]):
        p.append("not-vaulted")
    return p


NHI_POLICIES = [
    {"name": "no-owner", "display_name": "Identity has no active owner", "severity": "high"},
    {"name": "reused-secret", "display_name": "Secret reused across consumers", "severity": "medium"},
    {"name": "publicly-leaked", "display_name": "Secret publicly leaked", "severity": "critical"},
    {"name": "not-vaulted", "display_name": "Secret stored outside a secrets manager", "severity": "medium"},
]
