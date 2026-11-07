"""Plays Don't Break Prod start to finish using only what a player can see and click. No typing at all.
No GAME.* shortcuts: rooms via the list under the picture, people by Use, items from the conversation,
programs from Program Manager. Prints the "Next:" goal each time it changes, so the hints can be read in order."""
import pathlib, sys
from playwright.sync_api import sync_playwright
HTML = pathlib.Path(__file__).resolve().parent.parent / "index.html"
errs, goals = [], []
with sync_playwright() as p:
    b = p.chromium.launch(); page = b.new_page(viewport={"width": 1100, "height": 800})
    page.on("pageerror", lambda e: errs.append(str(e))); page.on("console", lambda m: m.type == "error" and errs.append(m.text))
    page.add_init_script("window.DBP_SLACK_DELAY_MS=0")
    def goal():
        t = page.inner_text("#goal") if page.query_selector("#goal") else ""
        if t and (not goals or goals[-1] != t): goals.append(t)
    def dismiss(n=25):
        for _ in range(n):
            m = page.query_selector("#msglayer .msg:not(.death):not(.lvcard)")
            if not m: break
            btn = m.query_selector("button")
            (btn or m).click()
        goal()
    def here(i):
        dismiss(); page.locator('.ic[data-verb="hand"]').click()
        page.locator(f'#here button[data-here="{i}"]').click(); goal()
    def opt(text):
        dismiss()
        loc = page.locator("#msglayer .dlg .opts button", has_text=text)
        if loc.count() == 0: raise AssertionError(f"no option {text!r}: {page.locator('#msglayer .dlg .opts button').all_inner_texts()}  next={goals[-1] if goals else ''}")
        loc.first.click(); goal()
    def bye():
        if page.locator("#msglayer .dlg").count(): page.locator("#msglayer .dlg button.bye").first.click()
        dismiss()
    def cont():
        page.locator("#msglayer .dlg button", has_text="Continue").click(); dismiss()
        page.locator("[data-go]").click(); dismiss()
    def laptop(): dismiss(); page.locator("[data-laptop]").click()
    def icon(app):  # what a player does: if the program is already open, click its title bar; otherwise go to Program Manager and click its icon
        if page.locator(f'#w31 .win.act[data-win="{app}"]').count(): return
        if page.locator('#w31 .win.act').count() and page.locator('#w31 .win.act').get_attribute("data-win") != "progman":
            page.locator('#w31 .win.act .mbar [data-wrestore="progman"]').click()
        page.locator(f'#w31 [data-pc="{app}"]').first.click()
    win = icon
    def act(a): page.locator(f'#w31 [data-act="{a}"]').first.click(); dismiss()
    def inc(i):  # open an incident from the list (GitGuardian may still be on the page you left it on)
        if page.locator(f'#w31 [data-act="open:{i}"]').count()==0: act("gg:list")
        act(f"open:{i}")
    def chip(cmd): page.locator(f'[data-tchip="{cmd}"]').click()  # clicking a suggested command runs it
    def close(): page.locator("[data-pcclose]").click(); dismiss()
    def ride(n): here("lift"); here("btn" + n)
    page.goto(HTML.as_uri()); page.locator('[data-tt="new"]').click(); page.locator("[data-go]").click(); dismiss()
    # level 1
    here("desklaptop"); icon("mail"); act("mail:bounce"); act("mailgg:2871"); inc(3112); act("valid:3112"); close()
    here("door"); ride("B1"); here("otto"); opt("GitGuardian says it's valid"); opt("Make a new token"); bye()
    laptop(); icon("gg"); inc(3112); act("valid:3112"); close()
    ride("2"); here("marisol"); opt("I closed a real incident"); opt("47 GitGuardian alerts"); opt("Make me a Member"); cont()
    # level 2
    laptop(); icon("gg"); inc(2871); act("ggmap:2871"); act("gg:list"); act("ggteam:payments"); act("csv"); close()
    ride("3"); here("juni"); opt("What's wrong"); bye()
    here("junilaptop"); page.locator('[data-ed="help"]').click(); page.locator('[data-ed="save"]').click(); page.locator('[data-ed="exit"]').click(); dismiss()
    here("juni"); opt("About that PayRail"); bye()
    here("wendell"); opt("Show the payments-incidents.csv"); opt("Juni's team"); opt("The PayRail live key"); cont()
    # level 3
    ride("4"); here("ingrid"); opt("I need to rotate"); bye()
    here("kenji"); a = page.locator("#msglayer .dlg .opts button").all_inner_texts(); bye()
    ride("3"); here("fridge"); ride("4"); here("kenji"); opt("Give Kenji the cold brew"); bye()
    here("kterm"); chip("sudoedit /etc/ggscout/config.toml"); page.locator('[data-ed="help"]').click(); page.locator('[data-ed="save"]').click(); page.locator('[data-ed="exit"]').click(); dismiss()
    page.locator("[data-tclose]").click(); dismiss()
    laptop(); icon("gg"); inc(2871); act("ggmap:2871"); win("notepad")
    for k in ["new", "vault", "move", "quiet", "revoke", "verify"]: act("rb:" + k)
    close(); here("ingrid"); opt("GitGuardian's exploration map"); opt("Show the runbook"); opt("A suspended PayRail"); cont()
    # level 4
    ride("5"); here("harriet"); opt("I need a freeze"); bye(); here("desmond"); opt("What do you need"); bye()
    laptop(); icon("gg"); act("gg:list"); act("pci"); close()
    here("desmond"); opt("Give Desmond the PCI evidence"); bye()
    here("harriet"); opt("Show the PayRail contract"); opt("If PayRail suspends"); opt("Desmond's PCI"); cont()
    # level 5
    ride("6"); here("paloma"); opt("Show Paloma the freeze exception"); bye()
    here("victor"); opt("The PayRail live key is in a public"); bye()
    laptop(); icon("gg"); act("gg:honeytokens"); act("modal:htnew"); page.locator("#htform button[type=submit]").click(); dismiss(); act("htplant")
    for _ in range(12):
        if page.locator('#w31 [data-act="htwait"]').count() == 0: break
        act("htwait")
    close(); here("victor"); opt("I planted a fake"); opt("Show the freeze exception"); opt("Tell the board"); cont()
    # level 6
    laptop(); icon("payrail"); act("modal:prnew"); act("prcreate")
    win("vault"); act("vnew"); page.select_option("#venv", "default"); act("vsave")
    win("deploys"); act("restart:checkout")
    win("vault"); act("vnew"); page.select_option("#venv", "production"); act("vsave")
    win("deploys"); act("restart:checkout"); act("restart:payouts")
    win("batch"); chip("crontab -e"); page.locator('[data-ed="help"]').click(); page.locator('[data-ed="save"]').click(); page.locator('[data-ed="exit"]').click()
    page.locator("[data-tclose]").click(); dismiss()
    win("payrail"); act("prrev:v1"); act("prrevoke:v1"); win("gg"); page.wait_for_timeout(1200)
    end = page.inner_text("#msglayer")[:200].replace("\n", " ")
    score = page.inner_text("#bar") if page.query_selector("#bar") else ""
    b.close()
print("Kenji asleep, no coffee yet:", a)
print("GOALS:"); [print("  -", g) for g in goals]
print("END:", end); print("BAR:", score[:80]); print("errors:", errs)
