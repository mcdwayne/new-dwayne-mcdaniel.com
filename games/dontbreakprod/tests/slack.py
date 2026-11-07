"""Slack: nobody answers until you've met them in person; scripted messages arrive anyway; pitches stay in person."""
import pathlib
from playwright.sync_api import sync_playwright
H=(pathlib.Path(__file__).resolve().parent.parent/"index.html").as_uri();errs=[];ok=[]
check=lambda n,c:ok.append((n,bool(c)))
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={"width":1100,"height":800});pg.on("pageerror",lambda e:errs.append(str(e)));pg.goto(H);E=pg.evaluate
    E("window.DBP_SLACK_DELAY_MS=300")
    pg.click('[data-tt="new"]');pg.click("[data-go]");E("document.getElementById('msglayer').innerHTML=''")
    E("GAME.openPC('slack')");check("Slack on your laptop from day one","Slack" in pg.inner_text("#w31"))
    pg.locator('[data-act="slwho:otto"]').click();check("Otto's scripted DM arrives before meeting","shared a gitguardian incident" in pg.inner_text("#w31"))
    check("no suggestions before meeting",pg.locator('[data-act^="slsend:"]').count()==0)
    pg.fill("#slin","hi otto, it's the new security person");pg.press("#slin","Enter");pg.wait_for_timeout(1200)
    t=pg.inner_text("#w31");check("unmet: delivered, no reply","hasn't replied" in t and t.count("hi otto")==1)
    check("no reply message",E("GAME.S.slack.msgs.otto.filter(m=>!m.me).length")==1)
    E("document.getElementById('pclayer').innerHTML='';GAME.S.room='b1';GAME.talk('otto')");E("document.getElementById('msglayer').innerHTML=''")
    E("GAME.openPC('slack')");pg.locator('[data-act="slwho:otto"]').click()
    n=pg.locator('[data-act^="slsend:"]').count();check("after meeting: suggestions offered",n>0)
    labels=pg.locator('[data-act^="slsend:"]').all_inner_texts();check("laptop hand-off stays in person",not any("Make a new token" in l for l in labels))
    pg.locator('[data-act^="slsend:"]').first.click();pg.wait_for_timeout(1500)
    check("after meeting: reply arrives",E("GAME.S.slack.msgs.otto.filter(m=>!m.me).length")>=2)
    E("document.getElementById('pclayer').innerHTML='';GAME.restoreFromCode('DBP-PERF-L2')");E("document.getElementById('msglayer').innerHTML=''")
    E("GAME.openPC('slack','laptop')");pg.locator('[data-act="slwho:marisol"]').click()
    labels=pg.locator('[data-act^="slsend:"]').all_inner_texts();check("met via save code (Marisol)",len(labels)>0);check("no pitches on Slack",not any(l.startswith("▸") for l in labels))
    pg.locator('[data-act="slwho:juni"]').click();check("not yet met Juni on level 2","you haven't met" in pg.inner_text("#w31"))
    pg.locator('[data-act="slwho:ch:eng-payments"]').click();check("channel readable","Pay Later 2.0 ships Monday" in pg.inner_text("#w31"))
    E("document.getElementById('pclayer').innerHTML='';GAME.restoreFromCode('DBP-PERF-L3')");E("document.getElementById('msglayer').innerHTML='';GAME.openPC('slack','laptop')")
    pg.locator('[data-act="slwho:kenji"]').click();check("Kenji asleep: no options",pg.locator('[data-act^="slsend:"]').count()==0)
    E("document.getElementById('pclayer').innerHTML='';GAME.restoreFromCode('DBP-PERF-L6')");E("document.getElementById('msglayer').innerHTML='';GAME.openPC('slack','laptop')")
    pg.locator('[data-act="slwho:ch:payrail-rotation"]').click();check("war room channel in the change window","Change window open" in pg.inner_text("#w31"))
    b.close()
bad=[n for n,c in ok if not c];print(f"{len(ok)-len(bad)}/{len(ok)} checks passed");[print("FAIL",n) for n in bad];print("errors",errs)
