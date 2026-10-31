#!/usr/bin/env python3
"""Rebuild reference/ from GitGuardian's public sources (run on a fresh workspace).

1. API reference: the OpenAPI spec embedded in https://api.gitguardian.com/docs (Redoc)
   -> reference/raw/openapi.json, reference/api/*.md, reference/api_catalog.json
2. Product docs: https://docs.gitguardian.com/llms-full.txt + llms.txt index
   -> reference/docs/*.md, reference/DOCS_INDEX.md
"""
import json, os, re, subprocess, sys, urllib.request
here = os.path.dirname(os.path.abspath(__file__))
REF = os.path.join(os.path.dirname(here), "reference")
RAW = os.path.join(REF, "raw"); os.makedirs(RAW, exist_ok=True)

def get(url, dest):
    with urllib.request.urlopen(url, timeout=60) as r, open(dest, "wb") as f:
        f.write(r.read())

get("https://api.gitguardian.com/docs", os.path.join(RAW, "apidocs.html"))
get("https://docs.gitguardian.com/llms-full.txt", os.path.join(RAW, "llms-full.txt"))
get("https://docs.gitguardian.com/llms.txt", os.path.join(RAW, "llms.txt"))
h = open(os.path.join(RAW, "apidocs.html"), encoding="utf-8").read()
obj, _ = json.JSONDecoder().raw_decode(h[h.index("{", h.find("__redoc_state")):])
json.dump(obj["spec"]["data"], open(os.path.join(RAW, "openapi.json"), "w"), indent=1)
subprocess.run([sys.executable, os.path.join(here, "build_api_ref.py"), REF], check=True)

idx = re.findall(r'^- \[(.+?)\]\((https://docs\.gitguardian\.com/(.+?)\.md)\): ?(.*)$', open(os.path.join(RAW, "llms.txt")).read(), re.M)
parts = open(os.path.join(RAW, "llms-full.txt")).read().split("\n---\n\n## ")
body = ["API Reference" + parts[0].split("## API Reference", 1)[1]] + parts[1:]
bytitle = {}
for t, u, p, d in idx:
    bytitle.setdefault(t, []).append((u, p, d))
os.makedirs(os.path.join(REF, "docs"), exist_ok=True); toc = []; used = set()
for pg in body:
    title = pg.split("\n", 1)[0].strip()
    c = [x for x in bytitle.get(title, []) if x[1] not in used]
    if c:
        u, p, d = c[0]; used.add(p)
    else:
        p = "unindexed/" + re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-"); u = "(not in llms.txt index)"; d = ""
    fn = "docs/" + p.replace("/", "__") + ".md"
    open(os.path.join(REF, fn), "w").write(f'---\nsource: {u}\ntitle: "{title}"\n---\n\n## ' + pg.strip() + "\n")
    toc.append(f"- [{title}]({fn}) — {u} — {d}")
open(os.path.join(REF, "DOCS_INDEX.md"), "w").write(
    "# GitGuardian docs (local copy)\n\nFrom https://docs.gitguardian.com/llms-full.txt. Secondary authority: the API reference wins on conflicts.\n\n" + "\n".join(sorted(toc)) + "\n")
print(f"reference rebuilt: {len(body)} doc pages")
