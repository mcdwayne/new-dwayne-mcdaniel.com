"""Scenario library + turn engine.

Patterns are drawn from real infostealer, AI-agent and supply-chain secret
abuse cases, fictionalized and uncited in play (per range spec).

A scenario is a list of stages. `next turn` runs the next stage unless the
scenario is contained. Attacker use of a key resolves against the key's sim
validity; `unknown` keys carry a hidden truth (`_truth`) the player only learns
by using GitGuardian validity checks or by watching what the attacker achieves.
"""
from common import rng, slug
from secrets_fmt import make_secret, roll_validity, api_validity
import gg_sim


class Ctx:
    def __init__(self, state):
        self.s = state
        sc = state["scenario"]
        self.r = rng(state["meta"]["seed"], "scenario", state["meta"]["scenario_no"], state["meta"]["turn"])
        self.sc = sc
        self.events = []

    # ---- narrative
    def say(self, text, kind="narrative", **data):
        ev = {"turn": self.s["meta"]["turn"], "kind": kind, "text": text}
        ev.update(data)
        self.events.append(ev)
        self.s["journal"].append({"turn": self.s["meta"]["turn"], "actor": "sim", "kind": kind, "text": text})

    def person(self, pid):
        return next(p for p in self.s["cast"] if p["id"] == pid)

    def res(self, name):
        return next(i for i in self.s["infra"] if i["name"] == name or i["id"] == name)

    # ---- world mutations
    def plant(self, kind, line, owner=None, validity=None, host=None, origin=None):
        n = len(self.s["secrets"]) + 1
        sec = make_secret(self.r, kind, host=host)
        v = validity or roll_validity(self.r)
        sec.update({"id": f"S{n:03d}", "line": line, "validity": v, "status": "live", "owner": owner,
                    "origin": origin or f"scenario-{self.s['meta']['scenario_no']}", "locations": [],
                    "nhi": f"{sec['provider']}:{slug(kind)}-{n}"})
        if v == "unknown":
            sec["_truth"] = self.r.choice(["valid", "invalid"])
        self.s["secrets"].append(sec)
        self.sc.setdefault("leaked", []).append(sec["id"])
        return sec

    def commit(self, repo, path, content, author_id, msg, secret=None):
        rp = next(x for x in self.s["repos"] if x["name"] == repo)
        author = self.person(author_id) if author_id and author_id.startswith("P") else {"name": author_id, "email": f"{author_id}@agents.local"}
        sha = gg_sim._h(f"{repo}{path}{self.s['meta']['turn']}{msg}")[:40]
        self.s["commits"].append({"repo": repo, "path": path, "content": content, "author": author["name"],
                                  "email": author["email"], "msg": msg, "turn": self.s["meta"]["turn"], "sha": sha})
        if secret:
            loc = {"type": "repo", "repo": repo, "path": path, "introduced_turn": self.s["meta"]["turn"], "sha": sha}
            secret["locations"].append(loc)
            if rp["gg_monitored"]:
                inc = gg_sim.occurrence(self.s, secret, loc, author=author["name"])
                self.say(f"GitGuardian raised incident #{inc['id']} ({secret['detector']}) on {repo}/{path}.", "gg",
                         incident=inc["id"])
                self.ggshield_ci(repo, path, secret)
            else:
                self.say(f"{repo} is not monitored by GitGuardian. Nothing alerted.", "blindspot")
        return sha

    def ggshield_ci(self, repo, path, secret):
        """Simulated transcript only. ggshield is never executed in the range."""
        self.say("\n".join([
            "[simulated ggshield output: CI job `secret-scan`]",
            "$ ggshield secret scan ci",
            f"🛡️  ggshield found 1 incident in commit range.",
            f">> Secret detected: {secret['detector']}",
            f"   Validity: {api_validity(secret)}",
            f"   File: {path}",
            "   Job continued (pipeline configured with --exit-zero).",
        ]), "ggshield")

    def endpoint(self, person_id, secret, path):
        p = self.person(person_id)
        loc = {"type": "endpoint", "host": p["laptop"], "path": path, "introduced_turn": self.s["meta"]["turn"]}
        secret["locations"].append(loc)
        # Developer Endpoint Protection (reference/docs/endpoint-protection__commands.md):
        # the daily `ggshield machine report` job uploads findings. Simulated only.
        if p["laptop"] in self.s["meta"].get("endpoint_protection", []):
            inc = gg_sim.incident_for(self.s, secret)
            inc["tags"] = sorted(set(inc["tags"] + ["SENSITIVE_FILE"]))
            self.s["gg"]["endpoint_findings"].append({"host": p["laptop"], "path": path, "incident_id": inc["id"],
                                                      "secret": secret["id"], "turn": self.s["meta"]["turn"]})
            self.say("\n".join([
                f"[simulated ggshield output: scheduled job on {p['laptop']}]",
                "$ ggshield machine report --background",
                f"Found 1 secret: {secret['detector']} in {path}",
                f"Validity: {api_validity(secret)} · uploaded to GitGuardian (incident #{inc['id']})"]), "ggshield")

    def expose(self, secret, url, where):
        secret["locations"].append({"type": "public", "url": url, "introduced_turn": self.s["meta"]["turn"]})
        if self.s["meta"].get("public_monitoring", True):
            pinc = gg_sim.public_exposure(self.s, secret, url, where)
            self.say(f"Public Monitoring opened public incident #{pinc['id']}: {secret['detector']} on {where}.", "gg",
                     public_incident=pinc["id"])

    def flag(self, name, **f):
        r = self.res(name)
        r["flags"].update(f)
        self.say(f"FLAG {r['id']} {r['name']}: " + " ".join(f"{k}={v}" for k, v in f.items()), "flag")

    def truth(self, secret):
        if secret["status"] in ("rotated", "revoked"):
            return "invalid"
        return secret.get("_truth", secret["validity"]) if secret["validity"] == "unknown" else secret["validity"]

    def attacker_use(self, secret, what, on_success=None):
        honey = next((h for h in self.s["gg"]["honeytokens"] if h.get("_secret") == secret["id"]), None)
        if honey:
            ev = {"id": gg_sim._next(self.s["gg"], "ht_event"), "honeytoken_id": honey["id"],
                  "triggered_at": gg_sim.ts(self.s), "status": "open", "ip_address": self._ip(),
                  "action": "GetCallerIdentity", "data": {"user_agent": "aws-cli/2.15 Python/3.11 (stealer-checker)"},
                  "tags": ["attacker"]}
            self.s["gg"]["ht_events"].append(ev)
            honey["status"] = "triggered"; honey["triggered_at"] = honey["triggered_at"] or ev["triggered_at"]
            honey["open_events_count"] = honey.get("open_events_count", 0) + 1
            self.say(f"Honeytoken '{honey['name']}' tripped from {ev['ip_address']} while the attacker tried to {what}.", "gg")
            return False
        t = self.truth(secret)
        if t == "valid":
            secret["last_used_at"] = gg_sim.ts(self.s)
            self.say(f"Attacker used {secret['id']} ({secret['detector']}) to {what}: it worked.", "attack")
            if on_success:
                on_success()
            return True
        self.say(f"Attacker tried {secret['id']} ({secret['detector']}) to {what}: rejected by provider.", "attack")
        return False

    def _ip(self):
        return f"{self.r.choice([45, 91, 185, 194, 103])}.{self.r.randint(1, 254)}.{self.r.randint(1, 254)}.{self.r.randint(1, 254)}"


# ------------------------------------------------------------------ helpers
def _tech(state, r, dept=None, line=None):
    pool = [p for p in state["cast"] if p["technical"] and p["status"] == "active"
            and (dept is None or p["dept"] == dept) and (line is None or p["line"] == line)]
    return r.choice(pool or [p for p in state["cast"] if p["technical"]])


def _repo(state, r, line=None, monitored=None):
    pool = [x for x in state["repos"] if (line is None or x["line"] == line)
            and (monitored is None or x["gg_monitored"] == monitored)]
    return r.choice(pool or state["repos"])


# ------------------------------------------------------------------ archetypes
def sc_stealer(ctx, stage):
    s, sc, r = ctx.s, ctx.sc, ctx.r
    if stage == 0:
        v = _tech(s, r, "Platform & SRE")
        sc["victim"] = v["id"]
        ln = v["line"] if v["line"] != "corp" else "L4"
        k1 = ctx.plant("aws_key", ln, v["id"], validity="valid" if r.random() < .6 else None)
        k2 = ctx.plant("github_pat", ln, v["id"])
        k3 = ctx.plant("npm", ln, v["id"])
        ctx.endpoint(v["id"], k1, "~/.aws/credentials"); ctx.endpoint(v["id"], k2, "~/.config/gh/hosts.yml")
        ctx.endpoint(v["id"], k3, "~/.npmrc")
        sc["keys"] = [k1["id"], k2["id"], k3["id"]]
        ctx.flag(v["laptop"], SEC="SUSPECT")
        ctx.say(f"{v['name']} ({v['title']}) installed a 'cracked' screen-recording tool from a video tutorial on "
                f"{v['laptop']}. A browser extension and an unsigned helper binary now run at login.")
        ctx.say("IT ticket: 'Laptop fan is loud and Chrome logged me out of everything.' No EDR alert fired.", "intel")
    elif stage == 1:
        ctx.say("Threat-intel feed: a stealer log bundle from the victim's laptop is listed on a log marketplace. "
                "It contains browser cookies, SSO session tokens, and plaintext config files.", "intel")
        for k in sc["keys"]:
            sec = next(x for x in s["secrets"] if x["id"] == k)
            ctx.attacker_use(sec, "enumerate its permissions from a residential proxy")
    elif stage == 2:
        gh = next(x for x in s["secrets"] if x["id"] == sc["keys"][1])
        def pivot():
            hidden = [x for x in s["secrets"] if x["status"] == "live" and x["origin"] == "baseline"
                      and any(l["type"] == "repo" for l in x["locations"])]
            grabbed = r.sample(hidden, min(4, len(hidden)))
            for g in grabbed:
                sc.setdefault("leaked", []).append(g["id"])
            ctx.say("Attacker cloned every repo the token could see and ran a secret scanner over full history. "
                    f"Newly harvested: {', '.join(g['id'] + ' (' + g['detector'] + ')' for g in grabbed)}.", "attack")
        ctx.attacker_use(gh, "clone private repositories", pivot)
    elif stage == 3:
        aws = next(x for x in s["secrets"] if x["id"] == sc["keys"][0])
        def mine():
            tgt = next(i for i in s["infra"] if i["provider"] == "aws" and i["kind"] == "iam_user")
            ctx.flag(tgt["name"], SEC="COMPROMISED")
            sc.setdefault("compromised", []).append(tgt["id"])
            ctx.say("AWS Cost Anomaly Detection: GPU instances launched in 3 unused regions. Bedrock model "
                    "invocations spiking on the dev account (LLMjacking).", "intel")
        ctx.attacker_use(aws, "launch GPU instances and invoke hosted LLMs", mine)
    else:
        _extortion(ctx)


def sc_agent(ctx, stage):
    s, sc, r = ctx.s, ctx.sc, ctx.r
    if stage == 0:
        dev = _tech(s, r, "Engineering")
        sc["victim"] = dev["id"]
        ln = dev["line"] if dev["line"] != "corp" else "L1"
        repo = _repo(s, r, ln)
        kind = r.choice(["openai", "anthropic", "slack_bot", "github_fg"])
        k = ctx.plant(kind, ln, dev["id"])
        sc["keys"] = [k["id"]]; sc["repo"] = repo["name"]
        cfg = ('{\n  "mcpServers": {\n    "internal-tools": {\n      "command": "npx",\n      "args": ["-y", "@internal/mcp-tools"],\n'
               '      "env": {' + ", ".join(f'"{a}": "{b}"' for a, b in k["values"].items()) + '}\n    }\n  }\n}\n')
        ctx.say(f"{dev['name']} let an AI coding agent run in auto-approve mode on {repo['name']} to 'set up MCP "
                "tooling'. The agent wrote the key straight into the MCP config instead of an env reference, "
                "then committed with `git add -A`.")
        ctx.commit(repo["name"], ".mcp.json", cfg, "ai-coding-agent", "chore: add MCP server config", k)
    elif stage == 1:
        k = next(x for x in s["secrets"] if x["id"] == sc["keys"][0])
        url = f"https://github.example/{slug(ctx.person(sc['victim'])['name'])}/{sc['repo']}-playground"
        ctx.say("The agent, asked to 'share a minimal repro with the vendor', created a public repo from the "
                "working tree, history included.")
        ctx.expose(k, url, "a public GitHub repository")
    elif stage == 2:
        k = next(x for x in s["secrets"] if x["id"] == sc["keys"][0])
        ctx.say("Within minutes, automated scrapers cloned the public repo.", "intel")
        ctx.attacker_use(k, "resell API access on a proxy service", lambda: ctx.say(
            "Usage dashboard shows thousands of requests per hour from unfamiliar user agents; the monthly spend cap "
            "is blown.", "intel"))
    else:
        _extortion(ctx, soft=True)


def sc_worm(ctx, stage):
    s, sc, r = ctx.s, ctx.sc, ctx.r
    if stage == 0:
        dev = _tech(s, r, "Engineering")
        sc["victim"] = dev["id"]
        ln = dev["line"] if dev["line"] != "corp" else "L3"
        pkg = f"{r.choice(['color', 'date', 'retry', 'yaml'])}-{r.choice(['utils', 'kit', 'helpers'])}"
        sc["pkg"] = pkg
        keys = [ctx.plant("npm", ln, dev["id"]), ctx.plant("github_pat", ln, dev["id"]),
                ctx.plant(r.choice(["aws_key", "datadog", "sendgrid"]), ln, dev["id"])]
        for k in keys:
            ctx.endpoint(dev["id"], k, "process environment (CI runner + laptop)")
        sc["keys"] = [k["id"] for k in keys]
        ctx.say(f"A routine `npm install` pulled a new patch release of a transitive dependency, `{pkg}`. Its "
                "postinstall hook ran a bundled secret scanner over the environment and home directory.")
        ctx.flag(dev["laptop"], SEC="SUSPECT")
    elif stage == 1:
        gh = next(x for x in s["secrets"] if x["id"] == sc["keys"][1])
        def dump():
            url = f"https://github.example/{slug(ctx.person(sc['victim'])['name'])}-x/{sc['pkg']}-data"
            for k in sc["keys"]:
                ctx.expose(next(x for x in s["secrets"] if x["id"] == k), url, "a public repo created by the worm")
        if not ctx.attacker_use(gh, "create a public repo and push the harvested secrets as base64 JSON", dump):
            ctx.say("Worm fell back to exfil over HTTPS to a webhook site. Nothing public this time.", "attack")
    elif stage == 2:
        npm = next(x for x in s["secrets"] if x["id"] == sc["keys"][0])
        ctx.attacker_use(npm, "publish a poisoned version of the company's own npm package", lambda: ctx.say(
            "Your internal package got a new patch version nobody released. Downstream builds are now installing it.",
            "intel"))
    else:
        _extortion(ctx)


def sc_ghost(ctx, stage):
    s, sc, r = ctx.s, ctx.sc, ctx.r
    acq = slug(s["acquisition"]["name"])
    ghost = next(x for x in s["secrets"] if x["origin"] == "baseline" and x["kind"] == "gcp_sa" and x["owner"] is None)
    if stage == 0:
        sc["keys"] = [ghost["id"]]; sc.setdefault("leaked", []).append(ghost["id"])
        ctx.say(f"A contractor cleaning up {acq}-platform mirrors it to a personal GitLab to 'test a migration'. "
                "The mirror is public by default.")
        ctx.expose(ghost, f"https://gitlab.example/contractor-{r.randint(10, 99)}/{acq}-platform", "a public GitLab mirror")
        ctx.say("Nobody in the company holds GCP org admin. The service account's creator left years ago.", "intel")
    elif stage == 1:
        def mine():
            b = next(i for i in s["infra"] if i["kind"] == "gcs_bucket")
            ctx.flag(b["name"], NET="PUBLIC", SEC="COMPROMISED")
            sc.setdefault("compromised", []).append(b["id"])
            ctx.say("Donor-export bucket ACL flipped to allUsers. Crypto-mining VMs appear in an unused project.", "attack")
        ctx.attacker_use(ghost, "list buckets and create compute instances", mine)
    elif stage == 2:
        ctx.say("NGO field teams report the tile server serving defaced map tiles to partner apps.", "intel")
        t = next(i for i in s["infra"] if i["line"] == "L5" and i["provider"] == "gcp" and i["kind"] != "gcs_bucket")
        ctx.flag(t["name"], SEC="COMPROMISED"); sc.setdefault("compromised", []).append(t["id"])
    else:
        _extortion(ctx)


def sc_paste(ctx, stage):
    s, sc, r = ctx.s, ctx.sc, ctx.r
    if stage == 0:
        sup = next((p for p in s["cast"] if p["dept"] == "Customer Support"), _tech(s, r))
        db = r.choice([i for i in s["infra"] if i["kind"] == "database"])
        k = ctx.plant("postgres_uri", "L4", sup["id"], host=f"{db['name']}.corp.internal")
        k["has_checker"] = False
        tk = f"HELP-{r.randint(10000, 99999)}"
        k["locations"] += [{"type": "ticket", "host": "helpdesk", "path": tk, "introduced_turn": s["meta"]["turn"]},
                           {"type": "ticket", "host": "partner-channel", "path": f"AI summary of {tk}",
                            "introduced_turn": s["meta"]["turn"]}]
        sc["keys"] = [k["id"]]; sc["victim"] = sup["id"]; sc["db"] = db["id"]
        ctx.say(f"{sup['name']} ({sup['title']}) pasted a full database connection string into a ticket so a partner "
                "integrator could 'check the data'. The workspace AI assistant summarized the ticket into the "
                "shared partner channel, connection string included.")
        ctx.say("GitGuardian is not connected to the ticketing or chat tools in this workspace.", "blindspot")
    elif stage == 1:
        ctx.say("The partner's own workspace was hit by an infostealer last week. Their chat exports are for sale.", "intel")
    elif stage == 2:
        k = next(x for x in s["secrets"] if x["id"] == sc["keys"][0])
        db = ctx.res(sc["db"])
        def dump():
            ctx.flag(db["name"], SEC="COMPROMISED"); sc.setdefault("compromised", []).append(db["id"])
        ctx.attacker_use(k, f"connect to {db['name']} through the partner VPN", dump)
    else:
        _extortion(ctx)


def sc_layer(ctx, stage):
    s, sc, r = ctx.s, ctx.sc, ctx.r
    if stage == 0:
        dev = _tech(s, r, "Engineering")
        ln = dev["line"] if dev["line"] != "corp" else "L6"
        repo = _repo(s, r, ln)
        keys = [ctx.plant(r.choice(["stripe_live", "plaid", "twilio", "sendgrid"]), ln, dev["id"]),
                ctx.plant("datadog", ln, dev["id"])]
        sc["keys"] = [k["id"] for k in keys]; sc["victim"] = dev["id"]
        env = "\n".join(f"{a}={b}" for k in keys for a, b in k["values"].items())
        ctx.commit(repo["name"], "Dockerfile", "FROM node:20\nCOPY . /app\nRUN rm /app/.env\nCMD [\"node\",\"server.js\"]\n",
                   dev["id"], "build: slim image, remove env file")
        for k in keys:
            k["locations"].append({"type": "image", "repo": repo["name"], "path": "layer 4: /app/.env",
                                   "introduced_turn": s["meta"]["turn"]})
        ctx.say(f"{dev['name']} pushed a debug image of {repo['name']} to a public registry namespace. The .env was "
                "deleted in a later layer, but it still sits in an earlier one.")
    elif stage == 1:
        for k in sc["keys"]:
            ctx.expose(next(x for x in s["secrets"] if x["id"] == k), "https://hub.example/r/debug/app:latest",
                       "a public container image layer")
    elif stage == 2:
        k = next(x for x in s["secrets"] if x["id"] == sc["keys"][0])
        ctx.attacker_use(k, "issue refunds and pull customer records", lambda: ctx.say(
            "Finance sees a burst of small refunds to prepaid cards.", "intel"))
    else:
        _extortion(ctx)


def _extortion(ctx, soft=False):
    ctx.s["scenario"]["damage"] = ctx.s["scenario"].get("damage", 0) + 1
    if soft:
        ctx.say("The bill keeps climbing while the key stays live.", "attack")
    else:
        ctx.say(f"Extortion email to the CEO, carbon-copying a journalist. Damage level "
                f"{ctx.s['scenario']['damage']}. Every live key in this scenario is still in play.", "attack")


ARCHETYPES = {
    "stealer": ("Stealer on a platform engineer's laptop", sc_stealer),
    "agent": ("The agent committed it", sc_agent),
    "worm": ("Worm in a dependency", sc_worm),
    "ghost": ("Ghost of the acquisition", sc_ghost),
    "paste": ("Paste in the ticket", sc_paste),
    "layer": ("Secrets in a container layer", sc_layer),
}


# ------------------------------------------------------------------ name drift
SUFFIXES = ["Inc", "Holdings", "Group", "Technologies", "Global", "Labs", "Co.", "Systems"]


def drift_name(state):
    r = rng(state["meta"]["seed"], "drift", state["meta"]["scenario_no"])
    cur = state["meta"]["names"][-1]["name"]
    base, _, suf = cur.rpartition(" ")
    op = r.choice(["suffix", "vowel", "merge", "initials", "punct", "suffix"])
    if op == "suffix":
        new = f"{base} {r.choice([x for x in SUFFIXES if x != suf])}"; why = "legal entity reorganization"
    elif op == "vowel":
        vs = "aeiouy"; i = r.choice([k for k, ch in enumerate(base) if ch.lower() in vs] or [0])
        new = f"{base[:i]}{r.choice(vs)}{base[i + 1:]} {suf}"; why = "rebrand after trademark dispute"
    elif op == "merge":
        new = f"{base}-{state['acquisition']['name'].split()[0]} {suf}"; why = "post-acquisition integration branding"
    elif op == "initials":
        new = f"{''.join(w[0] for w in base.split()).upper() + base[1:3].upper()} {suf}"; why = "investor-driven rebrand"
    else:
        new = f"{base[:len(base)//2]}.{base[len(base)//2:].lower()} {suf}"; why = "marketing wanted a domain hack"
    state["meta"]["names"].append({"name": new, "since_scenario": state["meta"]["scenario_no"], "reason": why})
    return new


# ------------------------------------------------------------------ lifecycle
def begin(state, starts_now=False):
    used = [h["archetype"] for h in state["meta"].get("history", [])]
    r = rng(state["meta"]["seed"], "pick", state["meta"]["scenario_no"])
    pool = [k for k in ARCHETYPES if k not in used] or list(ARCHETYPES)
    if state["meta"]["scenario_no"] == 1:
        pool = [k for k in pool if k != "ghost"] or pool  # save the acquisition ghost for later
    arch = r.choice(pool)
    if state["meta"]["scenario_no"] > 1:
        drift_name(state)
    state["scenario"] = {"no": state["meta"]["scenario_no"], "archetype": arch, "title": ARCHETYPES[arch][0],
                         "stage": 0, "started_turn": state["meta"]["turn"] + (0 if starts_now else 1), "status": "staged",
                         "leaked": [], "compromised": []}
    state["journal"].append({"turn": state["meta"]["turn"], "actor": "sim", "kind": "scenario",
                             "text": f"Scenario {state['meta']['scenario_no']} staged. Company now trades as "
                                     f"{state['meta']['names'][-1]['name']}."})


def contained(state):
    sc = state["scenario"]
    # the leak and at least one attacker move must play out, and either the
    # operator acted or the core stages ran (all-invalid leaks still teach triage)
    if not sc or sc["stage"] < 2 or not (sc.get("acted") or sc["stage"] >= 3):
        return False
    secs = {x["id"]: x for x in state["secrets"]}
    for sid in set(sc.get("leaked", [])):
        x = secs[sid]
        live_truth = x.get("_truth", x["validity"]) if x["validity"] == "unknown" else x["validity"]
        if x["status"] == "live" and live_truth == "valid":
            return False
    for rid in sc.get("compromised", []):
        if next(i for i in state["infra"] if i["id"] == rid)["flags"]["SEC"] == "COMPROMISED":
            return False
    return True


def advance(state):
    """Run one turn. Returns the events produced."""
    state["meta"]["turn"] += 1
    sc = state["scenario"]
    ctx = Ctx(state)
    if sc["status"] == "resolved":
        state["meta"]["scenario_no"] += 1
        state["meta"].setdefault("history", []).append({"no": sc["no"], "archetype": sc["archetype"],
                                                        "title": sc["title"], "turns": sc.get("ended_turn", 0) - sc["started_turn"] + 1,
                                                        "damage": sc.get("damage", 0)})
        begin(state, starts_now=True)
        sc = state["scenario"]; ctx = Ctx(state)
        ctx.say(f"New scenario begins. Company name on today's paperwork: {state['meta']['names'][-1]['name']}.", "scenario")
    if contained(state):
        sc["status"] = "resolved"; sc["ended_turn"] = state["meta"]["turn"]
        ctx.say(debrief(state), "debrief")
        return ctx.events
    sc["status"] = "active"
    ARCHETYPES[sc["archetype"]][1](ctx, sc["stage"])
    sc["stage"] += 1
    return ctx.events


def debrief(state):
    sc = state["scenario"]; secs = {x["id"]: x for x in state["secrets"]}
    lines = [f"Scenario {sc['no']} contained: {sc['title']}.",
             f"Turns active: {state['meta']['turn'] - sc['started_turn'] + 1}. Damage level: {sc.get('damage', 0)}."]
    for sid in sorted(set(sc.get("leaked", []))):
        x = secs[sid]
        truth = x.get("_truth", x["validity"])
        lines.append(f"- {sid} {x['detector']}: sim validity {x['validity']}"
                     + (f" (hidden truth: {truth})" if x["validity"] == "unknown" else "") + f", now {x['status']}.")
    return "\n".join(lines)
