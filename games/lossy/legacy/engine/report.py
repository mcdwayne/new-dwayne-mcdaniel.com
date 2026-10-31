"""Bridge crew status report.

The crew only knows what instruments could see: GitGuardian (incidents,
public monitoring, honeytokens, endpoint findings, NHI), machine flags, the
world events of the turn, and anything the operator has investigated. It
never uses sim validity truth or secrets nobody has found yet.
"""
from secrets_fmt import api_validity
import gg_sim

ROLES = [  # key, station, preferred titles in order
    ("tactical", "Tactical", ["Head of Security", "CISO", "Security Engineer"]),
    ("ops", "Operations", ["Security Analyst (SOC)", "Security Engineer", "Application Security Engineer"]),
    ("sensors", "Sensors", ["Application Security Engineer", "Security Engineer", "GRC Analyst"]),
    ("engineering", "Engineering", ["Platform Engineering Manager", "Site Reliability Engineer", "DevOps Engineer", "Cloud Engineer"]),
    ("personnel", "Personnel", ["Identity Engineer", "GRC Analyst", "IT Manager", "Systems Administrator"]),
]


def crew(state):
    """Pick officers from the company's own staff (stable for a save)."""
    taken, out = set(), {}
    active = [p for p in state["cast"] if p["status"] == "active"]
    for key, station, titles in ROLES:
        pick = None
        for t in titles:
            pick = next((p for p in active if p["title"] == t and p["id"] not in taken), None)
            if pick:
                break
        pick = pick or next(p for p in active if p["technical"] and p["id"] not in taken)
        taken.add(pick["id"])
        out[key] = {"key": key, "station": station, "id": pick["id"], "name": pick["name"], "title": pick["title"]}
    return out


def visible_secret_ids(state):
    gg = state["gg"]
    ids = {i["_secret"] for i in gg["incidents"]} | {p["_secret"] for p in gg["public_incidents"]}
    ids |= {f["secret"] for f in gg["endpoint_findings"]} | set(state["meta"].get("revealed", []))
    return ids


def condition(state):
    t = state["meta"]["turn"]
    recent = [j for j in state["journal"] if j["turn"] >= t - 1 and j["actor"] == "sim"]
    if any(i["flags"]["SEC"] == "COMPROMISED" for i in state["infra"]) or \
            any(j["kind"] == "attack" and "it worked" in j["text"] for j in recent):
        return "RED"
    if any(i["flags"]["SEC"] == "SUSPECT" for i in state["infra"]) or \
            any(j["kind"] in ("attack", "intel") for j in recent) or \
            any(p["status"] == "TRIGGERED" for p in state["gg"]["public_incidents"]):
        return "YELLOW"
    return "GREEN"


def _secret(state, sid):
    return next(x for x in state["secrets"] if x["id"] == sid)


def build(state):
    gg, t = state["gg"], state["meta"]["turn"]
    c = crew(state)
    vis = visible_secret_ids(state)
    this_turn = [j for j in state["journal"] if j["turn"] == t and j["actor"] == "sim"]
    attacks = [j for j in this_turn if j["kind"] == "attack"]
    wins = [j for j in attacks if "it worked" in j["text"]]
    comp = [i for i in state["infra"] if i["flags"]["SEC"] == "COMPROMISED"]
    susp = [i for i in state["infra"] if i["flags"]["SEC"] == "SUSPECT"]
    open_inc = [i for i in gg["incidents"] if i["status"] in ("TRIGGERED", "ASSIGNED")]
    for i in open_inc:
        i["validity"] = api_validity(_secret(state, i["_secret"]))
    crit_valid = [i for i in open_inc if i["validity"] == "valid"]
    unchecked = [i for i in open_inc if i["validity"] in ("failed_to_check", "unknown")]
    unassigned = [i for i in crit_valid if not i.get("assignee_email")]
    new_inc = [i for i in gg["incidents"] if i["triggered_at"] == gg_sim.ts(state, t) and t > 0]
    pub_open = [p for p in gg["public_incidents"] if p["status"] == "TRIGGERED"]
    ht_open = [e for e in gg["ht_events"] if e["status"] == "open"]
    laptops = [i for i in state["infra"] if i["kind"] == "laptop"]
    ep = set(state["meta"].get("endpoint_protection", []))
    repos = state["repos"]; blind = [r for r in repos if not r["gg_monitored"]]
    nhi = gg_sim.nhi_identities(state)
    orphan_nhi = [n for n in nhi if not n["owners"]]
    servers = [i for i in state["infra"] if i["kind"] != "laptop"]
    flags = {k: sum(1 for i in servers if v in i["flags"].values()) for k, v in
             [("orphaned", "ORPHANED"), ("eol", "EOL"), ("zombie", "ZOMBIE"), ("public", "PUBLIC")]}
    cond = condition(state)

    def plural(n, w):
        if n == 1:
            return f"{n} {w}"
        return f"{n} {w[:-1] + 'ies' if w.endswith('y') and w[-2] not in 'aeiou' else w + 's'}"

    lines = {}
    # Tactical
    if wins:
        tac = f"Hostile activity confirmed. {plural(len(wins), 'stolen credential')} worked for the attacker this watch."
    elif attacks:
        tac = f"Attacker probing. {plural(len(attacks), 'attempt')} this watch, none confirmed successful."
    else:
        tac = "No confirmed hostile activity on our instruments this watch."
    if comp:
        tac += f" Compromised: {', '.join(i['id'] + ' ' + i['name'] for i in comp[:4])}."
    if state["scenario"] and state["scenario"].get("damage"):
        tac += f" Damage level {state['scenario']['damage']}."
    lines["tactical"] = tac
    # Ops
    ops = f"{plural(len(open_inc), 'open incident')}: {len(crit_valid)} confirmed valid, {len(unchecked)} unverified."
    if new_inc:
        ops += f" New this watch: {', '.join('#' + str(i['id']) for i in new_inc[:5])}."
    if unassigned:
        ops += f" {plural(len(unassigned), 'valid incident')} still unassigned."
    lines["ops"] = ops
    # Sensors
    sen = (f"Repo coverage {len(repos) - len(blind)} of {len(repos)}; {len(blind)} blind. "
           f"Endpoint scans on {len(ep)} of {len(laptops)} laptops.")
    if pub_open:
        sen += f" Public Monitoring has {plural(len(pub_open), 'open exposure')}: " + \
               "; ".join(f"#{p['id']} on {p['_where']}" for p in pub_open[:3]) + "."
    if ht_open:
        sen += f" {plural(len(ht_open), 'honeytoken trip')}, latest from {ht_open[-1]['ip_address']}."
    elif not gg["honeytokens"]:
        sen += " No honeytokens deployed."
    lines["sensors"] = sen
    # Engineering
    eng = (f"{len(servers)} servers and services plus {len(laptops)} laptops on the board. "
           f"{flags['orphaned']} orphaned, {flags['eol']} end-of-life, {flags['zombie']} zombie, {flags['public']} internet-facing.")
    if susp:
        eng += f" Suspect: {', '.join(i['name'] for i in susp[:4])}."
    lines["engineering"] = eng
    # Personnel
    per = f"{plural(len(nhi), 'machine identity')} tracked; {len(orphan_nhi)} with no living owner."
    gone = [p for p in state["cast"] if p["status"] != "active"]
    if gone:
        per += f" {plural(len(gone), 'departed staffer')} still listed on credentials."
    lines["personnel"] = per

    # ---- options (Sierra-style numbered choices, each a real command)
    opts, seen = [], set()

    def opt(text, cmd, why):
        if cmd not in seen and len(opts) < 7:
            seen.add(cmd); opts.append({"text": text, "cmd": cmd, "why": why})

    for j in wins:
        for sid in [w.strip("(),.") for w in j["text"].split() if w.startswith("S") and w[1:4].isdigit()]:
            s = _secret(state, sid)
            if s["status"] == "live":
                opt(f"Rotate {sid} ({s['detector']}), the attacker is using it", f"rotate {sid}", "stops the attacker at the provider")
    for i in comp:
        opt(f"Isolate {i['name']}", f"isolate {i['id']}", "contains the compromised system")
    for p in pub_open:
        s = _secret(state, p["_secret"])
        if s["status"] == "live":
            v = api_validity(s)
            if v in ("failed_to_check", "unknown"):
                opt(f"Check validity of {s['id']}, exposed on {p['_where']}", f"check {s['id']}", "tells you if it is live")
            else:
                opt(f"Rotate {s['id']} ({s['detector']}), publicly exposed and {v}", f"rotate {s['id']}", "public keys get scraped in minutes")
    for i in new_inc:
        s = _secret(state, i["_secret"])
        if s["status"] == "live" and i["validity"] in ("failed_to_check", "unknown"):
            opt(f"Check validity on incident #{i['id']}", f"check {s['id']}", "unverified keys can't be prioritized")
        elif s["status"] == "live" and i["validity"] == "valid":
            opt(f"Rotate {s['id']} from incident #{i['id']}", f"rotate {s['id']}", "valid and fresh")
    for i in susp:
        opt(f"Investigate {i['name']}", f"investigate {i['name']}", "find which credentials sat on it")
        if i["kind"] == "laptop" and not ep:
            opt("Roll out Developer Endpoint Protection to all laptops", "endpoint-protection all", "puts endpoints on the instruments")
        if i["kind"] == "laptop" and not any(h["name"] == f"ht-{i['name']}" for h in gg["honeytokens"]):
            opt(f"Plant a honeytoken on {i['name']}", f"honeytoken {i['name']}", "a tripwire for anyone using stolen files")
    for j in this_turn:
        if j["kind"] == "blindspot" and "ticket" in j["text"].lower():
            opt("Investigate the helpdesk ticket system", "investigate helpdesk", "the leak happened outside GitGuardian's view")
    for c_ in state["commits"]:
        if c_["turn"] == t:
            r = next(x for x in repos if x["name"] == c_["repo"])
            if not r["gg_monitored"]:
                opt(f"Monitor {r['name']} (new commits, no coverage)", f"monitor {r['name']}", "historical scan reveals what landed")
    for i in unassigned[:2]:
        opt(f"Assign incident #{i['id']} to yourself", f"assign {i['id']}", "ownership starts the clock")
    # standing work for a quieter watch
    for i in unchecked[:1]:
        opt(f"Check validity on incident #{i['id']} ({i['detector']['display_name']})", f"check {i['_secret']}",
            "unverified keys can't be prioritized")
    if blind and len(opts) < 5:
        b = sorted(blind, key=lambda r: (r["line"] == "corp", r["name"]))[0]
        opt(f"Monitor {b['name']} (one of {len(blind)} blind repos)", f"monitor {b['name']}", "historical scan finds what's already there")
    if not ep and len(opts) < 6:
        opt("Roll out Developer Endpoint Protection to all laptops", "endpoint-protection all", "puts laptops on the instruments")
    opts.append({"text": "Engage: let the next six hours play out", "cmd": "engage", "why": "advances the turn"})

    if cond == "RED":
        xo = "Condition red. Act on the top options before you engage."
    elif cond == "YELLOW":
        xo = "Condition yellow. Something is moving; verify before it escalates."
    else:
        xo = "Condition green. Quiet watch. Good time to close blind spots."
    sc = state.get("scenario") or {}
    return {"condition": cond, "turn": t, "crew": c, "lines": lines, "summary": xo, "options": opts,
            "company": state["meta"]["names"][-1]["name"], "scenario_status": sc.get("status"),
            "sim_time": gg_sim.ts(state)}


def as_text(rep):
    c = rep["crew"]
    out = [f"STATUS REPORT · {rep['company']} · turn {rep['turn']} ({rep['sim_time']}) · CONDITION {rep['condition']}", ""]
    for k in ("tactical", "ops", "sensors", "engineering", "personnel"):
        o = c[k]
        out.append(f"{o['station'].upper()} · {o['name']}, {o['title']}: {rep['lines'][k]}")
    out += ["", f"FIRST OFFICER: {rep['summary']}", ""]
    out += [f"{n}. {o['text']}  [{o['cmd']}]" for n, o in enumerate(rep["options"], 1)]
    return "\n".join(out)
