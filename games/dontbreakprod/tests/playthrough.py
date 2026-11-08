"""Full playthrough of Don't Break Prod, plus the three ways to break prod."""
import sys, pathlib
from playwright.sync_api import sync_playwright
HTML = pathlib.Path(__file__).resolve().parent.parent / "index.html"
errs = []
CODES = []

def run(page, branch=None):
    E = lambda js: page.evaluate(js)
    def dismiss(n=20):
        for _ in range(n):
            m = page.query_selector("#msglayer .msg:not(.death):not(.lvcard)")
            if not m: break
            m.click()
    def opt(text):
        dismiss()
        b = page.locator("#msglayer .dlg .opts button", has_text=text)
        if b.count() == 0:
            have = page.locator("#msglayer .dlg .opts button").all_inner_texts()
            raise AssertionError(f"no option '{text}'. have: {have}  next={E('GAME.nextStep().t')}")
        b.first.click()
    def bye(): page.locator("#msglayer .dlg .opts button", has_text="Bye").first.click() if page.locator("#msglayer .dlg").count() else None
    def cont():
        page.locator("#msglayer .dlg button", has_text="Continue").click(); dismiss()
        card = page.inner_text("#msglayer .lvcard #sccode")  # every level screen shows the save code
        page.locator("[data-go]").click()
        assert card == E("GAME.encodeSave()"), (card, E("GAME.encodeSave()"))
        CODES.append(card); dismiss()
    def act(a):
        page.locator(f'[data-act="{a}"]').first.click()
        dismiss()
    def pc(app): E(f"GAME.openPC(\"{app}\")")
    def closepc(): page.locator("[data-pcclose]").click(); dismiss()
    def do(js): E(js); dismiss()
    def step(): return E("GAME.nextStep().t")
    page.goto(HTML.as_uri()); page.locator('[data-tt="new"]').click(); page.locator("[data-go]").click(); dismiss()
    # ---- level 1
    do('GAME.interact("use","desklaptop")'); pc("mail"); act("mail:bounce"); act("mailgg:2871"); assert "have access" in page.inner_text("#w31")
    act("gg:list"); act("open:3112"); act("valid:3112"); closepc()
    assert step().startswith("Take the elevator"), step()
    do('GAME.go("f2")'); do('GAME.go("lift")'); do('GAME.ride("5")'); assert E("GAME.S.room")=="lift"
    do('GAME.ride("B1")'); do('GAME.talk("otto")'); opt("GitGuardian says it's valid"); opt("Make a new token"); bye(); dismiss()
    do("GAME.openLaptop()"); pc("gg"); act("open:3112"); act("valid:3112"); assert E("GAME.S.f.thResolved"), "auto-resolve did not close #3112"; closepc()
    do('GAME.go("lift")'); do('GAME.ride("2")'); do('GAME.talk("marisol")')
    opt("Hackers"); opt("I closed a real incident"); opt("47 GitGuardian alerts"); opt("Make me a Member"); cont()
    assert E("GAME.S.lv")==2
    # ---- level 2
    do("GAME.openLaptop('gg')"); act("open:2871"); act("ggmap:2871"); act("gg:list"); page.fill("#ggq","payments"); page.locator("form.ggsearch button[type=submit]").click(); act("csv"); closepc()
    do('GAME.go("lift")'); do('GAME.ride("3")'); do('GAME.talk("juni")'); opt("What's wrong"); bye(); dismiss()
    do('GAME.interact("use","junilaptop")'); page.locator('[data-ed="save"]').click(); assert "secretsniff" in page.inner_text(".nmsg")
    page.locator('[data-ed="help"]').click(); page.locator('[data-ed="save"]').click(); page.locator('[data-ed="exit"]').click(); dismiss()
    do('GAME.talk("juni")'); opt("About that PayRail"); bye()
    do('GAME.talk("wendell")'); opt("Payments has 63"); opt("Juni's team"); opt("The PayRail live key"); cont()
    # ---- level 3
    do('GAME.go("lift")'); do('GAME.ride("4")'); do('GAME.talk("ingrid")'); opt("I need to rotate"); bye()
    do('GAME.go("lift")'); do('GAME.ride("3")'); do('GAME.interact("use","fridge")'); do('GAME.go("lift")'); do('GAME.ride("4")')
    do('GAME.interact("item","kenji","cold brew")'); do('GAME.interact("use","kterm")'); page.fill("#tinp","sudoedit /etc/ggscout/config.toml"); page.press("#tinp","Enter"); page.locator('[data-ed="help"]').click(); page.locator('[data-ed="save"]').click(); page.locator('[data-ed="exit"]').click(); dismiss()
    do("GAME.openLaptop('gg')"); act("open:2871"); act("ggmap:2871"); assert "recon-batch" in page.inner_text("#w31")
    pc("notepad"); act("rb:revoke"); dismiss()
    for k in ["new","vault","move","quiet","revoke","verify"]: act("rb:"+k)
    closepc(); do('GAME.go("lift")'); do('GAME.ride("2")'); do('GAME.interact("use","printer")'); do('GAME.interact("use","printer")'); do('GAME.go("lift")'); do('GAME.ride("4")')
    do('GAME.talk("ingrid")'); opt("GitGuardian's exploration map"); opt("Here's the runbook"); opt("A suspended PayRail"); cont()
    # ---- level 4
    do('GAME.go("lift")'); do('GAME.ride("5")'); do('GAME.talk("harriet")'); opt("I need a freeze"); bye()
    do('GAME.talk("desmond")'); opt("What do you need"); bye()
    do("GAME.openLaptop('gg')"); act("gg:list"); act("pci"); closepc()
    do('GAME.talk("desmond")'); opt("Here's your 8.6.2"); bye(); dismiss()
    do('GAME.talk("harriet")'); opt("PayRail's contract"); opt("If PayRail suspends"); opt("Desmond's PCI"); cont()
    # ---- level 5
    do('GAME.go("lift")'); do('GAME.ride("6")'); do('GAME.talk("paloma")'); opt("I have Finance"); bye()
    do('GAME.talk("victor")'); opt("The PayRail live key is in a public"); bye()
    do("GAME.openLaptop('gg')"); act("gg:honeytokens"); act("modal:htnew"); page.locator("#htform button[type=submit]").click(); dismiss()
    act("htplant")
    while not E("GAME.S.f.htFired"): act("htwait")
    assert E("GAME.S.f.htFired"), "honeytoken did not fire"
    closepc(); do('GAME.talk("victor")'); opt("I planted a fake"); opt("Finance signed"); opt("Tell the board"); cont()
    assert E("GAME.S.lv")==6
    # ---- level 6 (finale)
    do("GAME.openLaptop('payrail')"); act("modal:prnew")
    if branch == "rollnow":
        page.check("#prroll"); act("prcreate"); return page.inner_text("#msglayer")
    act("prcreate")
    pc("vault"); act("vnew"); page.select_option("#venv","default"); act("vsave")
    pc("deploys"); act("restart:checkout"); assert E('GAME.S.c.checkout')=="v1"
    if branch == "down":
        pc("payrail"); act("prrev:v1"); act("prrevoke:v1"); return page.inner_text("#msglayer")
    pc("vault"); act("vnew"); page.select_option("#venv","production"); act("vsave")
    pc("deploys"); act("restart:checkout"); act("restart:payouts")
    if branch == "recon":
        pc("payrail"); act("prrev:v1"); act("prrevoke:v1"); page.wait_for_timeout(500); dismiss(); return page.inner_text("#msglayer")
    pc("batch"); page.fill("#tinp","crontab -e"); page.press("#tinp","Enter"); page.locator('[data-ed="help"]').click(); page.locator('[data-ed="save"]').click(); page.locator('[data-ed="exit"]').click()
    page.locator("[data-tclose]").click(); dismiss()
    pc("payrail"); assert E("GAME.S.f.quiet")
    act("prrev:v1"); act("prrevoke:v1")
    pc("gg"); page.wait_for_timeout(1200)
    return f"score {E('GAME.S.score')} / ended {E('GAME.S.ended')}\n" + page.inner_text("#msglayer")[:300]

with sync_playwright() as p:
    b = p.chromium.launch()
    for branch in [None, "rollnow", "down", "recon"]:
        page = b.new_page(viewport={"width":1100,"height":800})
        page.on("console", lambda m: m.type=="error" and errs.append(m.text))
        page.on("pageerror", lambda e: errs.append(str(e)))
        out = run(page, branch)
        print(f"== {branch or 'full'}:", out.replace("\n"," ")[:260])
        if branch is None:
            pass
        page.close()
    b.close()
# every level-screen code loads that level
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.goto(HTML.as_uri())
    for n, c in enumerate(CODES[:5], start=2):
        r = pg.evaluate(f"GAME.restoreFromCode('{c}')"); lv = pg.evaluate("GAME.S.lv")
        print(f"level {n} screen code {c} -> level {lv}, checksum {'ok' if r['checksumOk'] else 'BAD'}")
        if lv != n or not r["checksumOk"]: errs.append(f"code {c} loaded level {lv}, expected {n}")
    b.close()
print("errors:", errs)
