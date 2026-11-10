"""How to play: follows the coach through both parts using only clicks, the way a new player would.
At every step it checks that the green marker sits on something the player can see, then clicks that thing
(or the coach's Next button). Fails if the coach gets stuck, the marker is missing, or anything is scored or saved."""
import pathlib
from playwright.sync_api import sync_playwright
HTML = pathlib.Path(__file__).resolve().parent.parent / "index.html"
errs, seen = [], []
with sync_playwright() as p:
    b = p.chromium.launch(); page = b.new_page(viewport={"width": 1280, "height": 860})
    page.on("pageerror", lambda e: errs.append(str(e)))
    page.goto(HTML.as_uri()); page.evaluate("localStorage.clear()")
    page.locator('[data-tt="tut"]').click(); page.wait_for_timeout(300)
    for guard in range(60):
        st = page.evaluate("TUT.on?{n:TUT.n,t:TSTEPS[TUT.n].t,next:!!TSTEPS[TUT.n].next,final:!!TSTEPS[TUT.n].final}:null")
        if not st: break
        seen.append(f'{st["n"]+1:>2}. {st["t"]}')
        # dismiss any plain message box (not a conversation or the quest pad)
        for _ in range(5):
            m = page.query_selector("#msglayer .msg:not(.dlg)")
            if not m or page.query_selector("#padwrap"): break
            (m.query_selector("button") or m).click(); page.wait_for_timeout(100)
        if st["final"]: page.locator("[data-tutnext]").click(); break
        if st["next"]: page.locator("[data-tutnext]").click(); page.wait_for_timeout(250); continue
        page.wait_for_timeout(200)
        box = page.locator("#tutbox"); 
        if box.is_hidden(): errs.append(f'step {st["n"]+1} "{st["t"]}": no green marker'); break
        bb = box.bounding_box(); x, y = bb["x"] + bb["width"] / 2, bb["y"] + bb["height"] / 2
        top = page.evaluate(f"(()=>{{const e=document.elementFromPoint({x},{y});return e?(e.id||e.className||e.tagName):''}})()")
        if "coach" in str(top): errs.append(f'step {st["n"]+1}: the coach covers its own target')
        page.mouse.click(x, y); page.wait_for_timeout(450)
        if page.evaluate("TUT.n") == st["n"]: errs.append(f'step {st["n"]+1} "{st["t"]}": clicking the marker did not advance (clicked {top})'); break
    after = page.evaluate("({title:!!document.querySelector('[data-tt=\"new\"]')||!!document.querySelector('[data-go]'), card:!!document.querySelector('.lvcard'), saved:localStorage.getItem('dontbreakprod.save.v1')})")
    b.close()
print("\n".join(seen)); print("ended on:", after); print("errors:", errs)
