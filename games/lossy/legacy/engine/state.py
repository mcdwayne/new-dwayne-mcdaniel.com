"""Markdown persistence.

A save is a folder of markdown files. Each file has a human-readable part
(tables, narrative) and exactly one fenced block tagged ```yaml state:<key>
that is the machine-readable source of truth for that slice of state.
`stop` writes them, `start` parses them back. World repos are rebuilt from the
save, so the save folder is all that needs to persist.
"""
import os
import re
import datetime
import yaml
from common import SAVES_DIR, slug

FILES = [  # file, state keys stored in it
    ("SAVE.md", ["meta"]),
    ("company.md", ["lines", "acquisition", "departments", "systems", "repos"]),
    ("people.md", ["cast"]),
    ("infra.md", ["infra"]),
    ("secrets.md", ["secrets"]),
    ("gitguardian.md", ["gg"]),
    ("scenario.md", ["scenario"]),
    ("journal.md", ["journal", "commits"]),
]
BLOCK = re.compile(r"```yaml state:(\w+)\n(.*?)\n```", re.S)


class _D(yaml.SafeDumper):
    pass


def _str(d, s):
    return d.represent_scalar("tag:yaml.org,2002:str", s, style="|" if "\n" in s else None)


_D.add_representer(str, _str)


def save_id(state):
    return f"{slug(state['meta']['root'])}-{state['meta']['seed']}"


def _block(key, val):
    return f"\n```yaml state:{key}\n" + yaml.dump(val, Dumper=_D, sort_keys=False, width=200, allow_unicode=True).rstrip() + "\n```\n"


def _table(rows, cols, cap=150):
    if not rows:
        return "_none_\n"
    out = ["| " + " | ".join(cols) + " |", "|" + "---|" * len(cols)]
    for r in rows[:cap]:
        out.append("| " + " | ".join(str(r.get(c, "")).replace("|", "/").replace("\n", " ") for c in cols) + " |")
    if len(rows) > cap:
        out.append(f"\n_{len(rows) - cap} more rows in the state block below._")
    return "\n".join(out) + "\n"


def human(state, fname):
    m = state["meta"]; sc = state.get("scenario") or {}
    name = m["names"][-1]["name"]
    if fname == "SAVE.md":
        return (f"# Range save: {name}\n\n"
                f"- Save id: `{save_id(state)}` · seed `{m['seed']}`\n- Status: **{m['status']}** · turn {m['turn']} · "
                f"scenario {m['scenario_no']} ({sc.get('title', '-')}, {sc.get('status', '-')})\n"
                f"- Headcount: {m['headcount']:,} · domain `{m['domain']}`\n- Last saved: {m.get('saved_at', '-')}\n\n"
                "## Name history\n\n" + _table(m["names"], ["name", "since_scenario", "reason"]) +
                "\n## Commands\n\n`new start` · `start` · `stop` · `next turn` · `status` · actions listed in RUNBOOK.md\n")
    if fname == "company.md":
        return (f"# {name}: business lines\n\n" + _table(state["lines"], ["code", "name", "description", "clouds"]) +
                f"\n## Acquisition: {state['acquisition']['name']} ({state['acquisition']['acquired']})\n\n"
                f"Brought {state['acquisition']['brought']}. {state['acquisition']['note']}\n\n## Departments\n\n" +
                _table([{"department": k, "headcount": v} for k, v in state["departments"].items()], ["department", "headcount"]) +
                "\n## Repositories\n\n" + _table(state["repos"], ["name", "line", "host", "visibility", "gg_monitored"]))
    if fname == "people.md":
        rows = [dict(p, access=", ".join(f"{k}:{v}" for k, v in p["access"].items())) for p in state["cast"]]
        return (f"# Named cast ({len(rows)} of {m['headcount']:,} employees)\n\nEveryone else is an end user only; "
                "the full roster is regenerated from the seed into world/roster.csv.\n\n" +
                _table(rows, ["id", "name", "title", "dept", "line", "status", "laptop", "access"]))
    if fname == "infra.md":
        rows = [dict(i, flags="·".join(i["flags"].values()), secrets=",".join(i["secrets"])) for i in state["infra"]]
        return ("# Infrastructure and machine-state flags\n\nFlag order: PWR·PATCH·NET·OWN·SEC·MON. See FLAGS.md.\n\n" +
                _table(rows, ["id", "provider", "kind", "name", "line", "flags", "secrets"]))
    if fname == "secrets.md":
        rows = [dict(x, where="; ".join(l.get("repo") or l.get("host") or l.get("url", "") for l in x["locations"]))
                for x in state["secrets"]]
        return ("# Secrets inventory (GM view: contains sim validity, including hidden truth for unknowns)\n\n" +
                _table(rows, ["id", "detector", "line", "validity", "status", "owner", "origin", "where"]))
    if fname == "gitguardian.md":
        gg = state["gg"]
        return ("# Mock GitGuardian workspace\n\n" +
                _table([{k: i[k] for k in ("id", "status", "severity", "validity", "incident_name", "occurrences_count")}
                        for i in gg["incidents"]], ["id", "status", "severity", "validity", "incident_name", "occurrences_count"]) +
                f"\nPublic incidents: {len(gg['public_incidents'])} · honeytokens: {len(gg['honeytokens'])} · "
                f"honeytoken events: {len(gg['ht_events'])} · API calls logged: {len(gg['api_calls'])}\n")
    if fname == "scenario.md":
        return (f"# Scenario {sc.get('no')}: {sc.get('title')}\n\nStatus {sc.get('status')} · stage {sc.get('stage')} · "
                f"leaked {', '.join(sorted(set(sc.get('leaked', [])))) or '-'} · compromised "
                f"{', '.join(sc.get('compromised', [])) or '-'}\n")
    if fname == "journal.md":
        return ("# Journal\n\n" + "\n".join(f"- **T{j['turn']}** [{j['kind']}] {j['text'].splitlines()[0]}"
                                           for j in state["journal"][-200:]) + "\n")
    return ""


def write_save(state, folder=None):
    folder = folder or os.path.join(SAVES_DIR, save_id(state))
    os.makedirs(folder, exist_ok=True)
    state["meta"]["saved_at"] = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    for fname, keys in FILES:
        body = human(state, fname) + "".join(_block(k, state.get(k)) for k in keys)
        with open(os.path.join(folder, fname), "w") as f:
            f.write(body)
    return folder


def read_save(folder):
    state = {}
    for fname, keys in FILES:
        txt = open(os.path.join(folder, fname)).read()
        for k, body in BLOCK.findall(txt):
            state[k] = yaml.safe_load(body)
    missing = {k for _, ks in FILES for k in ks} - set(state)
    if missing:
        raise ValueError(f"save {folder} missing blocks: {missing}")
    return state


def list_saves():
    if not os.path.isdir(SAVES_DIR):
        return []
    out = []
    for d in sorted(os.listdir(SAVES_DIR)):
        p = os.path.join(SAVES_DIR, d, "SAVE.md")
        if os.path.exists(p):
            meta = yaml.safe_load(BLOCK.search(open(p).read()).group(2))
            out.append((d, meta))
    return sorted(out, key=lambda x: x[1].get("saved_at", ""), reverse=True)
