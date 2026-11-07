#!/usr/bin/env python3
"""Build index.html, the playable single-file game, from src/. Same layout and flags as Lossy's build.py.

    python3 build.py                  # writes index.html and the website in site/
    python3 build.py out.html         # writes the game somewhere else
    python3 build.py --web-root ..    # this repo lives at <web root>/dontbreakprod: rebuild the game here,
                                      # and the landing page (dontbreakprod.html) and screenshots in the web root

No dependencies. The JS parts are concatenated in filename order into one script.
Shares its look, fonts and accessibility rules with LossyInc Range (../lossy).
"""
import base64, glob, os, sys, hashlib, shutil

here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, "src")
args = sys.argv[1:]
web_root = None
if "--web-root" in args:
    i = args.index("--web-root")
    web_root = os.path.abspath(args[i + 1])
    del args[i:i + 2]
out = args[0] if args else os.path.join(here, "index.html")

head = open(os.path.join(src, "head.html"), encoding="utf-8").read()
body = open(os.path.join(src, "body.html"), encoding="utf-8").read()
# Accessibility (WCAG 2.2 AA) rules shared by every game in this series; loaded last so they win.
_a11y = os.path.join(src, "a11y.css")
if os.path.exists(_a11y):
    head += "\n<style>\n" + open(_a11y, encoding="utf-8").read() + "\n</style>\n"
parts = sorted(glob.glob(os.path.join(src, "js", "*.js")))

# Fonts are inlined so the single file works offline (file://, any static host).
FONTS = [("Pixelify Sans", 400, "pixelify-sans-latin-400-normal"), ("Pixelify Sans", 600, "pixelify-sans-latin-600-normal"),
         ("VT323", 400, "vt323-latin-400-normal"),
         ("Inter", 400, "inter-latin-400-normal"), ("Inter", 500, "inter-latin-500-normal"),
         ("Inter", 600, "inter-latin-600-normal"), ("Inter", 700, "inter-latin-700-normal"),
         ("JetBrains Mono", 400, "jetbrains-mono-latin-400-normal"), ("JetBrains Mono", 600, "jetbrains-mono-latin-600-normal")]
faces = []
for fam, wt, f in FONTS:
    p = os.path.join(here, "fonts", f + ".woff2")
    data = base64.b64encode(open(p, "rb").read()).decode()
    faces.append(f'@font-face{{font-family:"{fam}";font-style:normal;font-weight:{wt};font-display:swap;src:url(data:font/woff2;base64,{data}) format("woff2")}}')
fontcss = "<style>/* bundled fonts, SIL OFL 1.1, see fonts/ */\n" + "\n".join(faces) + "\n</style>"
js = "\n".join(f"/* ---- {os.path.basename(p)} ---- */\n" + open(p, encoding="utf-8").read() for p in parts)

page = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
{fontcss}
{head}
</head>
<body>
{body}
<script>
{js}
</script>
</body>
</html>
"""
# Build ID: a hash of everything that goes into the game, so the same source always gives the same ID.
BUILD = hashlib.sha256(page.encode()).hexdigest()[:8]
page = page.replace("__BUILD__", BUILD)
open(out, "w", encoding="utf-8").write(page)
print(f"{os.path.relpath(out)}  {len(page)//1024} KB  ({len(parts)} script parts)  build {BUILD}")

# The website: a landing page at games/dontbreakprod.html that launches the game at games/dontbreakprod/index.html.
if not args:
    site = web_root or os.path.join(here, "site", "games")
    shots = os.path.join(site, "dontbreakprod", "shots")
    os.makedirs(shots, exist_ok=True)
    game = os.path.join(site, "dontbreakprod", "index.html")
    if os.path.abspath(game) != os.path.abspath(out):
        shutil.copyfile(out, game)
    for p in glob.glob(os.path.join(src, "landing", "*.png")):
        dst = os.path.join(shots, os.path.basename(p))
        if os.path.abspath(p) != os.path.abspath(dst):
            shutil.copyfile(p, dst)
    lhead, lbody = open(os.path.join(src, "landing.html"), encoding="utf-8").read().replace("__BUILD__", BUILD).split("<!--body-->", 1)
    landing = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
{lhead.strip()}
</head>
<body>
{lbody.strip()}
</body>
</html>
"""
    open(os.path.join(site, "dontbreakprod.html"), "w", encoding="utf-8").write(landing)
    print(f"{os.path.relpath(os.path.join(site, 'dontbreakprod.html'))}  landing page; the game is at {os.path.relpath(game)}")
