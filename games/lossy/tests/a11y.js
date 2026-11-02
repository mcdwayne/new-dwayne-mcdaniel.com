/* Accessibility check for the workstation (LR-09). Runs axe-core (WCAG 2.0/2.1/2.2 A and AA rules) in Chromium on
   every program window and tab, and drives the tabs with the keyboard only.
   Run: npm run a11y   (needs: npx playwright install chromium)
   Fails on any "serious" or "critical" violation inside the computer, or if keyboard tab navigation doesn't work. */
const { chromium } = require("playwright");
const path = require("path");
const AXE = require.resolve("axe-core/axe.min.js");
const PAGE = "file://" + path.join(__dirname, "..", "index.html");

(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1200, height: 860 } });
  const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message));
  await pg.goto(PAGE);
  await pg.waitForTimeout(500);
  await pg.click('[data-tt="new"]');await pg.click('[data-namego]');
  await pg.click("#msglayer .msg");
  // Thursday has every program in the week: move there with Tuesday and Wednesday marked won
  await pg.evaluate(() => { GAME.S.results[1] = "won"; GAME.nextDay(); });
  await pg.evaluate(() => { document.getElementById("msglayer").innerHTML = ""; GAME.S.results[2] = "won"; GAME.nextDay(); GAME.S.f.breakglass = true; });
  await pg.evaluate(() => { document.getElementById("msglayer").innerHTML = ""; });
  await pg.addScriptTag({ path: AXE });

  const screens = [
    ["Program Manager", () => GAME.openPC("progman")],
    ["Mail", () => GAME.openPC("mail")],
    ["GitGuardian incidents", () => GAME.openPC("gg")],
    ["GitGuardian incident #1219", () => { GAME.openPC("gg"); document.querySelector('[data-openinc="1219"]').click(); }],
    ["GitGuardian exploration map", () => { GAME.openPC("gg"); document.querySelector('[data-gg="list"]').click(); document.querySelector('[data-openinc="1219"]').click(); document.querySelector('[data-ggmap="1219"].xtoggle').click(); }],
    ["GitGuardian incident: remediation tab", () => { document.querySelector('.hdr [data-openinc="1219"]').click(); document.querySelector('[data-ggtab="rem"]').click(); }],
    ["GitGuardian incident: activity tab", () => { document.querySelector('[data-ggtab="act"]').click(); }],
    ["GitGuardian endpoints", () => { GAME.openPC("gg"); document.querySelector('[data-gg="endpoints"]').click(); }],
    ["GitGuardian Push to vault", () => { GAME.openPC("gg"); document.querySelector('[data-openinc="1219"]').click(); document.querySelector('[data-ggpush="1219"]').click(); }],
    ["GitGuardian inventory", () => { document.querySelector("[data-mclose]") && document.querySelector("[data-mclose]").click(); GAME.openPC("gg"); document.querySelector('[data-gg="inventory"]').click(); }],
    ["GitGuardian secrets managers", () => { GAME.openPC("gg"); document.querySelector('[data-gg="secmgr"]').click(); }],
    ["GitGuardian perimeter", () => { GAME.openPC("gg"); document.querySelector('[data-gg="perimeter"]').click(); }],
    ["Vault", () => GAME.openPC("vault")],
    ["Vault integrations", () => { GAME.openPC("vault"); document.querySelector('[data-vtab="integrations"]').click(); }],
    ["CI/CD", () => GAME.openPC("ci")],
    ["Slack", () => GAME.openPC("slack")],
    ["GitHub", () => GAME.openPC("github")],
    ["SendGrid", () => GAME.openPC("sendgrid")],
    ["Google Cloud keys", () => GAME.openPC("gcp")],
    ["Google Cloud usage", () => { GAME.openPC("gcp"); document.querySelector('[data-gcp="usage"]').click(); }],
    ["Notepad", () => GAME.openPC("notepad")],
  ];
  let bad = 0;
  for (const [name, fn] of screens) {
    await pg.evaluate(fn);
    await pg.waitForTimeout(120);
    const res = await pg.evaluate(async () => {
      const r = await axe.run(document.querySelector(".win.act") || document.getElementById("pcroot"), {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
      });
      return r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, help: v.help, eg: v.nodes[0] && v.nodes[0].target.join(" ") }));
    });
    const serious = res.filter((v) => v.impact === "serious" || v.impact === "critical");
    bad += serious.length;
    console.log(`${serious.length ? "✗" : "✓"} ${name}${res.length ? ": " + res.map((v) => `${v.id} (${v.impact}, ${v.n})`).join(", ") : ""}`);
    serious.forEach((v) => console.log(`    ${v.help}  e.g. ${v.eg}`));
  }

  // keyboard-only: focus the first GitHub tab, move with the arrow keys and End/Home
  await pg.evaluate(() => GAME.openPC("github"));
  await pg.focus('.win.act [role="tab"][aria-selected="true"]');
  const seq = [];
  for (const k of ["ArrowRight", "ArrowRight", "ArrowRight", "Home", "End"]) {
    await pg.keyboard.press(k);
    await pg.waitForTimeout(60);
    seq.push(await pg.evaluate(() => { const a = document.activeElement; return a && a.getAttribute("role") === "tab" && a.getAttribute("aria-selected") === "true" ? a.textContent : "LOST FOCUS"; }));
  }
  const want = ["Fine-grained tokens", "Audit log", "Tokens (classic)", "Tokens (classic)", "Audit log"];
  const kbOk = JSON.stringify(seq) === JSON.stringify(want);
  console.log(`${kbOk ? "✓" : "✗"} keyboard tabs: ${seq.join(" → ")}`);
  const roles = await pg.evaluate(() => { const tl = document.querySelector('.win.act [role="tablist"]'); const t = tl && tl.querySelector('[role="tab"][aria-selected="true"]'); const p = t && document.getElementById(t.getAttribute("aria-controls")); return { tablist: !!tl, label: tl && tl.getAttribute("aria-label"), panel: !!p && p.getAttribute("role"), labelledby: p && p.getAttribute("aria-labelledby") === t.id }; });
  console.log(`${roles.tablist && roles.panel === "tabpanel" && roles.labelledby ? "✓" : "✗"} tab roles: ${JSON.stringify(roles)}`);
  if (errs.length) console.log("page errors:", errs);
  await b.close();
  const ok = !bad && kbOk && roles.panel === "tabpanel" && !errs.length;
  console.log(ok ? "\nAccessibility check passed." : "\nAccessibility check FAILED.");
  process.exit(ok ? 0 : 1);
})();
