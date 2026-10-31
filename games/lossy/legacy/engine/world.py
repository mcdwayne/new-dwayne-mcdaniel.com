"""Rebuild the on-disk world (git repos, Terraform, flag files, roster) from state.

Deterministic: the same save always produces the same repos and SHAs-ish
content, so `start` just calls build() after reading the markdown save.
"""
import csv
import os
import shutil
import subprocess
from common import WORLD_DIR, rng, person_name, slug
from gen_company import DEPTS
from secrets_fmt import render_env
import gg_sim

FLAG_LEGEND = """# Machine-state flags

Every resource carries six flags, in this order, as `range_flags` in its Terraform
tags/labels and as a `.flag` file under `flags/<provider>/`.

| Flag | Values | Meaning |
|---|---|---|
| PWR | UP, DOWN, ZOMBIE | ZOMBIE = running, nobody can say why or who pays for it |
| PATCH | CURRENT, BEHIND, EOL | OS/runtime patch level |
| NET | PRIVATE, INTERNAL, PUBLIC | Reachability |
| OWN | OWNED, SHARED, ORPHANED | ORPHANED = no current employee owns it |
| SEC | CLEAN, SUSPECT, COMPROMISED, CONTAINED | Compromise state; scenarios move this |
| MON | GG_MONITORED, UNMONITORED | Whether a GitGuardian source/integration covers it |

Nothing here is real infrastructure. Flags are the infrastructure.
"""


def _git(cwd, *args, env=None):
    subprocess.run(["git", *args], cwd=cwd, env=env, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def _commit(path, msg, name, email, date):
    env = dict(os.environ, GIT_AUTHOR_NAME=name, GIT_AUTHOR_EMAIL=email, GIT_COMMITTER_NAME=name,
               GIT_COMMITTER_EMAIL=email, GIT_AUTHOR_DATE=date, GIT_COMMITTER_DATE=date)
    _git(path, "add", "-A")
    _git(path, "commit", "-q", "--allow-empty", "-m", msg, env=env)


def _flagstr(f):
    return "·".join(f[k] for k in ("PWR", "PATCH", "NET", "OWN", "SEC", "MON"))


def _tf(state):
    root = state["meta"]["root"].lower()
    acq = slug(state["acquisition"]["name"])
    out = {"providers.tf": f'''terraform {{
  required_version = ">= 1.6"
  backend "s3" {{
    bucket = "{root}-tfstate"
    key    = "global/terraform.tfstate"
    region = "us-east-1"
  }}
  required_providers {{
    aws       = {{ source = "hashicorp/aws", version = "~> 5.60" }}
    google    = {{ source = "hashicorp/google", version = "~> 5.30" }}
    openstack = {{ source = "terraform-provider-openstack/openstack", version = "~> 1.54" }} # Rackspace
    null      = {{ source = "hashicorp/null" }}
  }}
}}

provider "aws" {{ region = "us-east-1" }}
provider "google" {{
  project = "{acq}-prod" # inherited from the acquisition; nobody has org admin
  region  = "us-central1"
}}
provider "openstack" {{ auth_url = "https://identity.api.rackspacecloud.com/v2.0/" }}
'''}
    by = {}
    for i in state["infra"]:
        if i["provider"] == "endpoint":
            continue
        by.setdefault(i["provider"], []).append(i)
    for prov, items in by.items():
        blocks = []
        for i in items:
            n = slug(i["name"]).replace("-", "_")
            fl = _flagstr(i["flags"])
            if prov == "aws":
                typ = {"ecs_service": "aws_ecs_service", "s3_bucket": "aws_s3_bucket", "iam_user": "aws_iam_user"}[i["kind"]]
                attr = {"aws_ecs_service": f'  name = "{i["name"]}"\n  cluster = "prod"\n  desired_count = 2',
                        "aws_s3_bucket": f'  bucket = "{i["name"]}"', "aws_iam_user": f'  name = "{i["name"]}"'}[typ]
                blocks.append(f'resource "{typ}" "{n}" {{\n{attr}\n  tags = {{ range_id = "{i["id"]}", range_flags = "{fl}", line = "{i["line"]}" }}\n}}\n')
            elif prov == "gcp":
                typ = "google_storage_bucket" if i["kind"] == "gcs_bucket" else "google_cloud_run_v2_service"
                attr = f'  name = "{i["name"]}"\n  location = "US"' if typ == "google_storage_bucket" else \
                    f'  name = "{i["name"]}"\n  location = "us-central1"\n  template {{ containers {{ image = "gcr.io/{acq}-prod/{i["name"]}:latest" }} }}'
                lab = fl.lower().replace("·", "_")
                blocks.append(f'resource "{typ}" "{n}" {{\n{attr}\n  labels = {{ range_id = "{i["id"].lower()}", range_flags = "{lab}" }}\n}}\n')
            elif prov == "rackspace":
                blocks.append(f'resource "openstack_compute_instance_v2" "{n}" {{\n  name = "{i["name"]}"\n  flavor_name = "general1-4"\n'
                              f'  image_name = "Ubuntu 18.04 LTS"\n  metadata = {{ range_id = "{i["id"]}", range_flags = "{fl}" }}\n}}\n')
            else:
                blocks.append(f'# on-prem: managed by hand, mirrored here for inventory only\nresource "null_resource" "{n}" {{\n'
                              f'  triggers = {{ host = "{i["name"]}.corp.internal", kind = "{i["kind"]}", range_id = "{i["id"]}", range_flags = "{fl}" }}\n}}\n')
        out[f"{prov}/main.tf"] = "\n".join(blocks)
    return out


def _scaffold(state, repo):
    ln = next((l for l in state["lines"] if l["code"] == repo["line"]), None)
    title = f"{repo['name']}"
    files = {"README.md": f"# {title}\n\nOwned by {ln['name'] if ln else repo['line']} at {state['meta']['names'][0]['name']}.\n"}
    if repo["name"] == "infra-terraform":
        files.update(_tf(state))
        files["FLAGS.md"] = FLAG_LEGEND
    elif repo["name"].endswith("-ios"):
        files["App/AppConfig.swift"] = 'import Foundation\n\nenum AppConfig {\n    static let apiBase = URL(string: "https://api.internal/v2")!\n}\n'
    elif repo["name"].endswith("-android"):
        files["app/build.gradle.kts"] = 'android {\n    namespace = "com.example.app"\n    compileSdk = 34\n}\n'
    elif repo["host"] == "gitlab-legacy":
        files["terraform/main.tf"] = f'# {state["acquisition"]["name"]} platform (pre-acquisition). Do not apply.\nmodule "tiles" {{ source = "./modules/tiles" }}\n'
        files[".gitlab-ci.yml"] = "deploy:\n  script:\n    - gcloud auth activate-service-account --key-file terraform/keys/deployer.json\n"
    elif repo["host"] == "bitbucket-server":
        files["batch/nightly_ledger.sh"] = "#!/bin/ksh\n# runs on ledger-batch01 via cron\n. /etc/ledger/env\npsql \"$DATABASE_URL\" -f close_day.sql\n"
    else:
        files["src/server.js"] = "const express = require('express');\nconst app = express();\napp.get('/health', (_, r) => r.send('ok'));\napp.listen(process.env.PORT || 8080);\n"
        files["package.json"] = '{\n  "name": "' + repo["name"] + '",\n  "version": "1.0.0",\n  "dependencies": {"express": "^4.19.2"}\n}\n'
        files[".github/workflows/ci.yml"] = ("name: ci\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n"
                                            "      - uses: actions/checkout@v4\n      - run: npm ci && npm test\n"
                                            "  secret-scan:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n"
                                            "      - uses: GitGuardian/ggshield-action@v1\n        env:\n"
                                            "          GITGUARDIAN_API_KEY: ${{ secrets.GITGUARDIAN_API_KEY }}\n") if repo["gg_monitored"] else \
            "name: ci\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci && npm test\n"
    return files


def _secret_text(sec, path):
    v = sec["values"]
    if path.endswith(".json"):
        if sec["kind"] == "gcp_sa":
            import json
            return json.dumps({"type": "service_account", "project_id": "legacy-prod", "private_key_id": v["private_key_id"],
                               "private_key": v["private_key"] + "\n", "client_email": sec["nhi"].split(":", 1)[1] + ".gserviceaccount.com"}, indent=2) + "\n"
        return "{\n" + ",\n".join(f'  "{k}": "{x}"' for k, x in v.items() if "\n" not in str(x)) + "\n}\n"
    if path.endswith((".yml", ".yaml")):
        return "\n".join(f"{k.lower()}: \"{x}\"" for k, x in v.items() if "\n" not in str(x)) + "\n"
    if path.endswith(".tfvars"):
        return "\n".join(f'{k.lower()} = "{x}"' for k, x in v.items() if "\n" not in str(x)) + "\n"
    if path.endswith(".sh"):
        return "#!/bin/bash\n" + "\n".join(f"export {k}='{x}'" for k, x in v.items() if "\n" not in str(x)) + "\n"
    if path.endswith(".md"):
        return "\n## Local setup\n\nQuick start (temporary, will rotate):\n\n```\n" + render_env(v) + "\n```\n"
    if "\n" in "".join(map(str, v.values())):
        return next(x for x in v.values() if "\n" in str(x)) + "\n"
    return render_env(v) + "\n"


def build(state, out=None):
    out = out or WORLD_DIR
    if os.path.exists(out):
        shutil.rmtree(out)
    os.makedirs(out)
    cast = {p["id"]: p for p in state["cast"]}
    r = rng(state["meta"]["seed"], "history")
    for repo in state["repos"]:
        path = os.path.join(out, "repos", repo["host"], repo["name"])
        os.makedirs(path)
        _git(path, "init", "-q", "-b", "main")
        files = _scaffold(state, repo)
        contrib = [cast[c] for c in repo["contributors"] if c in cast] or [{"name": "build-bot", "email": "ci@corp"}]
        a = contrib[0]
        for f, body in files.items():
            os.makedirs(os.path.dirname(os.path.join(path, f)) or path, exist_ok=True)
            open(os.path.join(path, f), "w").write(body)
        _commit(path, "initial import", a["name"], a["email"], f"2023-{r.randint(1, 12):02d}-{r.randint(1, 28):02d}T10:00:00Z")
        for sec in state["secrets"]:
            for loc in sec["locations"]:
                if loc.get("type") == "repo" and loc["repo"] == repo["name"] and loc["introduced_turn"] == 0:
                    fp = os.path.join(path, loc["path"])
                    os.makedirs(os.path.dirname(fp), exist_ok=True)
                    with open(fp, "a") as fh:
                        fh.write(_secret_text(sec, loc["path"]))
                    who = cast.get(sec.get("owner")) or r.choice(contrib)
                    _commit(path, r.choice(["wip", "fix config", "update settings", "temp creds for staging", "add fixture"]),
                            who["name"], who["email"], f"{r.choice([2024, 2025])}-{r.randint(1, 12):02d}-{r.randint(1, 28):02d}T{r.randint(8, 22):02d}:12:00Z")
        for c in state["commits"]:
            if c["repo"] == repo["name"]:
                fp = os.path.join(path, c["path"])
                os.makedirs(os.path.dirname(fp), exist_ok=True)
                open(fp, "w").write(c["content"])
                _commit(path, c["msg"], c["author"], c["email"], gg_sim.ts(state, c["turn"]))
    # flags
    for i in state["infra"]:
        d = os.path.join(out, "flags", i["provider"])
        os.makedirs(d, exist_ok=True)
        open(os.path.join(d, f"{i['id']}_{i['name']}.flag"), "w").write(
            f"id={i['id']}\nname={i['name']}\nkind={i['kind']}\nline={i['line']}\nflags={_flagstr(i['flags'])}\n"
            + "".join(f"{k}={v}\n" for k, v in i["flags"].items()) + f"secrets={','.join(i['secrets'])}\n")
    open(os.path.join(out, "FLAGS.md"), "w").write(FLAG_LEGEND)
    # roster (full headcount, deterministic)
    rr = rng(state["meta"]["seed"], "roster")
    with open(os.path.join(out, "roster.csv"), "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["id", "name", "title", "department", "status", "systems"])
        n = 0
        for dname, share, mn, titles, tech in DEPTS:
            named = [p for p in state["cast"] if p["dept"] == dname]
            for p in named:
                w.writerow([p["id"], p["name"], p["title"], dname, p["status"],
                            "; ".join(f"{k}:{v}" for k, v in p["access"].items())])
            for _ in range(max(0, state["departments"][dname] - len(named))):
                n += 1
                w.writerow([f"E{n:06d}", person_name(rr), rr.choice(titles), dname, "active", "idp:user (end user only)"])
    return out
