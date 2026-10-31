"""`new start`: generate a fictitious company as a pure function of the seed.

Output is a state dict. state.py turns it into markdown saves, world.py turns
it into git repos + flag files.
"""
from common import rng, gibberish, person_name, slug, HEADCOUNTS, SIM_EPOCH
from secrets_fmt import make_secret, roll_validity

# ---------------------------------------------------------------- org chart
DEPTS = [  # name, share of headcount, minimum, titles (weighted by order), technical?
    ("Engineering", .28, 4, ["Software Engineer", "Senior Software Engineer", "Mobile Engineer (iOS)",
                             "Mobile Engineer (Android)", "Backend Engineer", "Staff Engineer",
                             "Engineering Manager", "QA Engineer", "Director of Engineering"], True),
    ("Platform & SRE", .05, 1, ["Site Reliability Engineer", "DevOps Engineer", "Cloud Engineer",
                                "Platform Engineering Manager", "Database Administrator"], True),
    ("Data", .06, 1, ["Data Engineer", "Analytics Engineer", "Data Scientist", "GIS Data Engineer",
                      "Data Platform Lead"], True),
    ("IT", .03, 1, ["IT Support Specialist", "Systems Administrator", "IT Manager", "Identity Engineer"], True),
    ("Security", .02, 1, ["Security Engineer", "Application Security Engineer", "Security Analyst (SOC)",
                          "Head of Security", "GRC Analyst"], True),
    ("Product", .05, 1, ["Product Manager", "Senior Product Manager", "Technical Product Manager",
                         "Director of Product"], False),
    ("Design", .03, 0, ["Product Designer", "UX Researcher", "Design Lead"], False),
    ("Customer Support", .12, 2, ["Support Agent", "Support Engineer (Tier 2)", "Support Team Lead",
                                  "Customer Success Manager"], False),
    ("Sales & Partnerships", .08, 1, ["Account Executive", "Sales Development Rep", "Partnerships Manager",
                                      "Solutions Engineer", "VP Sales"], False),
    ("Marketing", .05, 1, ["Growth Marketer", "Content Marketer", "Lifecycle Marketing Manager",
                           "App Store Optimization Specialist"], False),
    ("Finance", .04, 1, ["Accountant", "FP&A Analyst", "Controller", "Payroll Specialist"], False),
    ("Credit & Risk", .04, 1, ["Credit Risk Analyst", "Underwriter", "Collections Specialist",
                               "Fraud Analyst", "Head of Credit"], False),
    ("Legal & Compliance", .02, 1, ["Corporate Counsel", "Compliance Officer", "Privacy Counsel",
                                    "KYC/AML Analyst"], False),
    ("People", .03, 1, ["HR Business Partner", "Recruiter", "People Operations Specialist"], False),
    ("Programs (NGO)", .03, 1, ["Program Manager", "Field Operations Coordinator",
                                "Grants Manager", "Monitoring & Evaluation Officer"], False),
    ("Operations & Facilities", .02, 0, ["Office Manager", "Facilities Technician", "Procurement Specialist"], False),
    ("Executive", .01, 3, ["CEO", "CTO", "CFO", "COO", "CISO", "General Counsel"], False),
]


def allocate(headcount):
    alloc = {d[0]: max(d[2], int(headcount * d[1])) for d in DEPTS}
    diff = headcount - sum(alloc.values())
    order = sorted(DEPTS, key=lambda d: -d[1])
    i = 0
    while diff != 0:
        name = order[i % len(order)][0]
        mins = {d[0]: d[2] for d in DEPTS}
        if diff > 0:
            alloc[name] += 1; diff -= 1
        elif alloc[name] > mins[name]:
            alloc[name] -= 1; diff += 1
        i += 1
    alloc["Executive"] = min(alloc["Executive"], 6)
    return alloc


# ---------------------------------------------------------------- business lines
LINE_TEMPLATES = [
    ("app", "Consumer phone app (iOS/Android)", ["aws_key", "twilio", "sendgrid", "datadog", "github_pat"]),
    ("app", "Consumer phone app (iOS/Android)", ["aws_key", "stripe_live", "openai", "slack_bot"]),
    ("app", "Consumer phone app (iOS/Android)", ["aws_key", "anthropic", "sendgrid", "npm"]),
    ("api", "Backend API data brokerage", ["rackspace", "postgres_uri", "aws_key", "github_fg", "datadog"]),
    ("ngo", "Non-profit using heavy geospatial data", ["gcp_sa", "mapbox", "google_api", "postgres_uri"]),
    ("lending", "Microlending site", ["plaid", "stripe_live", "postgres_uri", "ssh_key", "vault", "twilio"]),
]

LINE_STACK = {
    "app": {"clouds": ["aws"], "services": ["api-gateway", "auth-svc", "push-svc", "feed-svc", "media-svc"]},
    "api": {"clouds": ["rackspace", "aws", "onprem"], "services": ["broker-api", "ingest-etl", "partner-gw", "billing-meter"]},
    "ngo": {"clouds": ["gcp", "onprem"], "services": ["tile-server", "field-sync", "imagery-pipeline", "donor-portal"]},
    "lending": {"clouds": ["aws", "onprem"], "services": ["loan-origination", "kyc-svc", "ledger-batch", "repayments", "borrower-web"]},
}


def _laptop(r, used):
    while True:
        lt = f"LT-{r.randint(1000, 99999)}"
        if lt not in used:
            used.add(lt)
            return lt


def make_company(seed, headcount=None, root_name=None):
    r = rng(seed, "company")
    headcount = headcount or r.choice(HEADCOUNTS)
    scale = HEADCOUNTS.index(headcount)  # 0..7

    root = root_name or "Lossy"
    names = [{"name": f"{root} Inc", "since_scenario": 0, "reason": "founding name"}]

    lines = []
    used = set()
    for i, (kind, desc, kinds) in enumerate(LINE_TEMPLATES):
        nm = gibberish(r)
        while nm in used:
            nm = gibberish(r)
        used.add(nm)
        lines.append({"code": f"L{i+1}", "name": nm, "kind": kind, "description": desc,
                      "clouds": LINE_STACK[kind]["clouds"], "services": LINE_STACK[kind]["services"],
                      "secret_kinds": kinds})
    acq_name = gibberish(r, 2) + r.choice(["ly", "io", " Labs", "Map"])
    acquisition = {
        "name": acq_name, "acquired": f"{2026 - r.randint(3, 6)}",
        "brought": "the entire GCP organization, now carrying the NGO's geospatial workloads",
        "note": "Every engineer who built or ran it has left. No current employee holds GCP org admin.",
        "former_staff": [{"name": person_name(r), "title": t, "status": "departed"}
                         for t in ["Founder/CTO", "Lead GIS Engineer", "DevOps Contractor"]],
    }

    # ---- people
    alloc = allocate(headcount)
    cast, n, used_lt = [], 0, set()
    domain = f"{slug(root)}.example"
    cap_tech = [12, 20, 40, 70, 110, 180, 220, 260][scale]
    for dname, share, mn, titles, technical in DEPTS:
        cnt = alloc[dname]
        keep = cnt if (technical or dname == "Executive") else min(cnt, 2 + scale // 2)
        keep = min(keep, cap_tech if technical else keep)
        for j in range(keep):
            n += 1
            nm = person_name(r)
            title = titles[0] if j == 0 and dname != "Executive" else titles[min(len(titles) - 1, int(r.random() ** 1.6 * len(titles)))]
            if dname == "Executive":
                title = titles[j % len(titles)]
            line = r.choice(lines)["code"] if dname not in ("Executive", "IT", "Security", "People", "Finance") else "corp"
            if dname == "Programs (NGO)":
                line = "L5"
            if dname == "Credit & Risk":
                line = "L6"
            cast.append({"id": f"P{n:04d}", "name": nm, "title": title, "dept": dname, "line": line,
                         "email": f"{nm.lower().replace(' ', '.')}@{domain}", "status": "active",
                         "technical": technical, "laptop": _laptop(r, used_lt)})

    # ---- systems and access (nobody touches everything)
    systems = []
    for ln in lines:
        systems.append({"id": f"repo:{ln['code']}", "name": f"{ln['name']} source repos", "line": ln["code"]})
    systems += [
        {"id": "aws:prod", "name": "AWS prod accounts", "line": "shared"},
        {"id": "aws:dev", "name": "AWS dev/sandbox accounts", "line": "shared"},
        {"id": "rackspace", "name": "Rackspace managed hosting", "line": "L4"},
        {"id": "gcp", "name": f"GCP org (from {acq_name})", "line": "L5"},
        {"id": "onprem-db", "name": "On-prem databases", "line": "shared"},
        {"id": "legacy", "name": "Legacy servers (colo)", "line": "shared"},
        {"id": "ci-jenkins", "name": "Jenkins (legacy CI)", "line": "shared"},
        {"id": "ci-gha", "name": "GitHub Actions", "line": "shared"},
        {"id": "vault", "name": "HashiCorp Vault (partial rollout)", "line": "L6"},
        {"id": "k8s", "name": "EKS clusters", "line": "shared"},
        {"id": "idp", "name": "Identity provider (SSO)", "line": "corp"},
    ]
    sys_ids = [s["id"] for s in systems]
    for p in cast:
        acc = {}
        if p["technical"]:
            if p["line"] != "corp":
                acc[f"repo:{p['line']}"] = "write"
                ln = next(l for l in lines if l["code"] == p["line"])
                for c in ln["clouds"]:
                    key = {"aws": "aws:dev", "rackspace": "rackspace", "gcp": "gcp", "onprem": "onprem-db"}[c]
                    acc[key] = "read" if c == "gcp" else "write"
                acc["ci-gha"] = "write"
            d = p["dept"]
            if d == "Platform & SRE":
                for k in r.sample(["aws:prod", "aws:dev", "k8s", "ci-jenkins", "legacy", "onprem-db", "rackspace", "vault"], 4 + r.randint(0, 2)):
                    acc[k] = "admin"
            if d == "IT":
                acc["idp"] = "admin"; acc["legacy"] = r.choice(["write", "admin"])
            if d == "Security":
                acc["idp"] = "read"; acc["aws:prod"] = "read"; acc["ci-gha"] = "read"
            if d == "Data":
                acc["onprem-db"] = "write"
            if "Database Administrator" in p["title"]:
                acc["onprem-db"] = "admin"
        acc.setdefault("idp", "user")
        acc["gcp"] = "read" if acc.get("gcp") else acc.get("gcp", None) or None
        acc = {k: v for k, v in acc.items() if v}
        if len(acc) >= len(sys_ids) - 1:  # enforce: no one touches all systems
            acc.pop(r.choice([k for k in acc if k != "idp"]))
        p["access"] = acc

    # ---- infrastructure with flags
    infra, rid = [], 0

    def add(provider, kind, name, line, **flags):
        nonlocal rid
        rid += 1
        f = {"PWR": "UP", "PATCH": "CURRENT", "NET": "PRIVATE", "OWN": "OWNED", "SEC": "CLEAN", "MON": "UNMONITORED"}
        f.update(flags)
        infra.append({"id": f"R{rid:03d}", "provider": provider, "kind": kind, "name": name, "line": line,
                      "flags": f, "secrets": []})
        return infra[-1]

    reps = 1 + scale // 2
    for ln in lines:
        for svc in ln["services"]:
            c = ln["clouds"][0]
            kind = {"aws": "ecs_service", "gcp": "cloud_run_service", "rackspace": "rax_cloud_server", "onprem": "vm"}[c]
            for k in range(min(reps, 3)):
                add(c, kind, f"{slug(ln['name'])}-{svc}-{k+1}", ln["code"],
                    NET=r.choice(["PRIVATE", "INTERNAL", "INTERNAL", "PUBLIC"]),
                    PATCH=r.choice(["CURRENT", "CURRENT", "BEHIND"]),
                    OWN="ORPHANED" if c == "gcp" else r.choice(["OWNED", "OWNED", "SHARED"]))
    for db in ["ledger-pg01", "broker-warehouse01", "geo-postgis01", "hr-mssql01"][: 2 + min(2, scale)]:
        add("onprem", "database", db, "shared", PATCH=r.choice(["BEHIND", "EOL"]), NET="INTERNAL")
    for srv in ["jenkins01", "sftp-partner01", "ledger-batch01", "ldap01", "build-mac-mini02", "nas01"]:
        add("onprem", "legacy_server", srv, "shared", PATCH=r.choice(["BEHIND", "EOL", "EOL"]),
            PWR=r.choice(["UP", "UP", "ZOMBIE"]), NET=r.choice(["INTERNAL", "PUBLIC"]))
    for b in ["tiles-raw", "imagery-archive", "donor-exports", "tf-state-legacy"]:
        add("gcp", "gcs_bucket", f"{slug(acq_name)}-{b}", "L5", OWN="ORPHANED",
            NET=r.choice(["PRIVATE", "PUBLIC"]))
    add("aws", "s3_bucket", f"{slug(root)}-tfstate", "shared", OWN="SHARED")
    add("aws", "iam_user", "ci-deployer", "shared", OWN="SHARED")
    for p in cast:
        if p["technical"]:
            add("endpoint", "laptop", p["laptop"], p["line"], OWN="OWNED", NET="PUBLIC",
                PATCH=r.choice(["CURRENT", "CURRENT", "BEHIND"]))
            infra[-1]["owner"] = p["id"]

    # ---- repos
    repos = []
    for ln in lines:
        base = slug(ln["name"])
        rnames = [f"{base}-{s}" for s in ln["services"]][: 2 + scale // 2]
        if ln["kind"] == "app":
            rnames += [f"{base}-ios", f"{base}-android"]
        for nm in rnames:
            repos.append({"name": nm, "line": ln["code"], "host": "github", "visibility": "private"})
    repos += [
        {"name": "infra-terraform", "line": "shared", "host": "github", "visibility": "private"},
        {"name": "platform-ci-templates", "line": "shared", "host": "github", "visibility": "private"},
        {"name": f"{slug(acq_name)}-platform", "line": "L5", "host": "gitlab-legacy", "visibility": "private"},
        {"name": "ledger-batch-scripts", "line": "L6", "host": "bitbucket-server", "visibility": "private"},
        {"name": "dotfiles-shared", "line": "corp", "host": "github", "visibility": "private"},
    ]
    gg_monitored = set(r.sample([x["name"] for x in repos], max(1, int(len(repos) * r.choice([.4, .6, .8])))))
    for x in repos:
        x["gg_monitored"] = x["name"] in gg_monitored
        x["contributors"] = [p["id"] for p in cast if p["access"].get(f"repo:{x['line']}") == "write"][:8] \
            or [p["id"] for p in cast if p["dept"] == "Platform & SRE"][:3]

    # ---- baseline secrets (sprawl that exists before any scenario)
    secrets, sid = [], 0
    rs = rng(seed, "baseline-secrets")
    for ln in lines:
        lrepos = [x for x in repos if x["line"] == ln["code"]]
        for kind in ln["secret_kinds"]:
            for _ in range(1 + (scale >= 4)):
                sid += 1
                host = rs.choice([i["name"] for i in infra if i["kind"] == "database"])
                s = make_secret(rs, kind, host=f"{host}.corp.internal")
                repo = rs.choice(lrepos)
                path = rs.choice([".env", "config/settings.yml", "deploy/values.yaml", "scripts/sync.sh",
                                  "terraform/terraform.tfvars", "README.md", "tests/fixtures/creds.json"])
                owner = rs.choice(repo["contributors"]) if repo["contributors"] else None
                s.update({"id": f"S{sid:03d}", "line": ln["code"], "validity": roll_validity(rs),
                          "status": "live", "owner": owner,
                          "origin": "baseline", "locations": [{"type": "repo", "repo": repo["name"], "path": path,
                                                               "introduced_turn": 0}],
                          "nhi": f"{s['provider']}:{slug(ln['name'])}-{kind.replace('_', '-')}-{sid}"})
                secrets.append(s)
                target = [i for i in infra if i["line"] == ln["code"]]
                if target:
                    rs.choice(target)["secrets"].append(s["id"])
    # the acquisition's forgotten key
    sid += 1
    s = make_secret(rs, "gcp_sa")
    s.update({"id": f"S{sid:03d}", "line": "L5", "validity": "valid", "status": "live", "owner": None,
              "origin": "baseline", "nhi": f"gcp:{slug(acq_name)}-terraform@{slug(acq_name)}-prod.iam",
              "locations": [{"type": "repo", "repo": f"{slug(acq_name)}-platform", "path": "terraform/keys/deployer.json",
                             "introduced_turn": 0}]})
    secrets.append(s)

    state = {
        "meta": {"seed": seed, "created": SIM_EPOCH, "headcount": headcount, "turn": 0, "scenario_no": 1,
                 "status": "running", "names": names, "domain": domain, "root": root},
        "lines": lines, "acquisition": acquisition, "departments": alloc, "cast": cast, "systems": systems,
        "infra": infra, "repos": repos, "secrets": secrets,
        "gg": None, "scenario": None, "journal": [], "commits": [],
    }
    return state


def current_name(state):
    return state["meta"]["names"][-1]["name"]
