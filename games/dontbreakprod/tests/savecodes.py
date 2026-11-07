import pathlib
from playwright.sync_api import sync_playwright
H=(pathlib.Path(__file__).resolve().parent.parent/"index.html").as_uri();errs=[]
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page();pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto(H);E=pg.evaluate
    # round trip at every level: play the reference run via playtest state? use perfect starts + milestones
    for lv in range(1,7):
        E(f"GAME.restoreFromCode('DBP-PERF-L{lv}')")
        ms=E(f"GAME.MILESTONES[{lv}].length");half=[i for i in range(ms) if i%2==0]
        for i in half:
            E(f"GAME.MILESTONES[{lv}][{i}][2]()")
        if lv==6: E("GAME.S.pr.v1=true")  # keep it alive
        code=E("GAME.encodeSave()");st=E("[GAME.S.lv,GAME.S.score,GAME.S.t]")
        r=E(f"GAME.restoreFromCode('{code}')");st2=E("[GAME.S.lv,GAME.S.score,GAME.S.t]");code2=E("GAME.encodeSave()")
        print(lv,code,st,"->",st2,code2==code,r["checksumOk"])
    # perfect L6, play the finale correctly through milestones, then a bad code and a garbage string
    E("GAME.restoreFromCode('DBP-PERF-L6')");print("perfect L6 score",E("GAME.S.score"),"of",E("163"))
    for s in ["hello world","DBP-1234-5678","dbp 0000 0000"]:
        r=E(f"GAME.restoreFromCode('{s}')");print(repr(s),"->",E("GAME.encodeSave()"),r["hashed"],r["checksumOk"],"lv",E("GAME.S.lv"),"dead",E("GAME.S.dead"))
    # UI path: title -> Enter a save code
    pg.goto(H);pg.click('[data-tt="code"]');pg.fill("#scin","DBP-PERF-L3");pg.click("#scform button[type=submit]");print("UI:",pg.inner_text("#msglayer")[:90].replace("\n"," "))
    pg.click("#msglayer .msg");pg.click("[data-menu]");pg.click('[data-mn="code"]');print("menu code:",pg.inner_text("#sccode"))
    b.close()
print("errors",errs)
