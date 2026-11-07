# Don't Break Prod

A Sierra-style point-and-click adventure about leveraging GitGuardian to get a leaked secret fixed: earning access, convincing people, and rotating a live key without taking production down. It's the easier sibling of [LossyInc Range](../lossy/): one long quest instead of a week, with the same look, verbs, Windows 3.1 computer and simulated GitGuardian.

Everything is simulated. The game is one HTML file. It contacts no real system and runs no real tool. Precarium Inc, PayRail, TicketHive and every person in the game are fictional.

## Play

Open `index.html` in a browser, or the landing page at `../dontbreakprod.html`. About 30 to 45 minutes. Progress saves in the browser, and the Menu gives you a save code.

## The quest

You start on day one as the only security person, with a badge for two floors and a Restricted GitGuardian account. Each level ends with a boss: someone who can give you more access, who cares about a number. You win them over with three pitches backed by GitGuardian evidence. Weak pitches only get a brush-off, so the first five levels can't be lost.

| Level | Floor | Boss (measured on) | What wins them over |
|---|---|---|---|
| 1 · Restricted | B1, 2 | Marisol Vance, IT Director (SOC 2 audit) | A help-desk token you check and get rotated; 47 alerts bouncing off a departed employee's mailbox |
| 2 · Can view | 3 | Wendell Park, Payments manager (deploy speed) | A Payments export; swapping a noisy scanner for ggshield; the public PayRail key |
| 3 · Change freeze | 4 | Ingrid Solberg, Head of SRE (uptime) | ggscout finding a consumer in no repo; a runbook with a rollback |
| 4 · Quarter close | 5 | Harriet Quill, CFO (clean close) | PCI DSS 8.6.2 evidence; a 72-hour rotation clause in the PayRail contract |
| 5 · The top floor | 6 | Victor Lamb, CTO (Monday launch) | A honeytoken in a public repo that fires in minutes |
| 6 · Don't Break Prod | anywhere | the rotation itself | New key, Vault, restarts, the cron fix, zero traffic, revoke, validity check |

Level 6 can break prod three ways, each based on a real incident: expiring the old key immediately, revoking while it still has live traffic, and revoking before the 2 AM batch job moves. Breaking prod sends you back to the start of the change window.

## Save codes

Menu › Save code gives a 32-bit code like `DBP-1A2B-3C4D`: the level (bits 0 to 2), the time since the level started in 6-minute steps (bits 3 to 8), up to 18 milestones for the current level (bits 9 to 26) and a 5-bit checksum (bits 27 to 31) that warns but never blocks. Same system as Lossy's `LR-` codes. Earlier levels are rebuilt as finished, and points are recalculated.

Perfect starts for facilitators: `DBP-PERF-L1` to `DBP-PERF-L6` start that level with every earlier level perfect. Any other text still loads some game.

## Build and test

```
python3 build.py                  # index.html, plus site/ with the landing page
python3 build.py --web-root ..    # rebuild here, and ../dontbreakprod.html and its screenshots
python3 tests/playthrough.py      # full run to 163/163, plus the three ways to break prod
python3 tests/savecodes.py        # save code round trips at every level
python3 tests/gitguardian.py      # every GitGuardian feature from the shared spec (34 checks)
```

Tests use Playwright for Python (`pip install playwright && playwright install chromium`).

## Layout

- `src/head.html` · the shared LossyInc Range stylesheet plus this game's additions
- `src/a11y.css`, `src/js/99-a11y.js` · accessibility rules shared with Lossy (WCAG 2.2 AA)
- `src/js/01-world.js` · people, levels, points, state
- `src/js/02-scenes.js` · pixel scenes and hotspots for every floor and the elevator
- `src/js/03-quest.js` · steps, room interactions, dialogue, bosses, the honeytoken timer, ways to break prod
- `src/js/04-apps.js` · the laptop: Windows 3.1 desktop, Mail, Chat, Notepad runbook, Vault, PayRail, Deploys, the config editor
- `src/js/04b-gitguardian.js` · GitGuardian, built to the same spec as Lossy's console: incidents, dialogs, exploration map, endpoints, honeytokens, perimeter, inventory, playbooks, secrets managers, notification emails. Adds workspace roles (Restricted, Can view, Can edit, Full access) for the quest
- `src/js/04c-terminals.js` · the batch-01 and ops-tools terminals, with Lossy's simulated ggshield commands
- `src/js/05-shell.js` · message windows, dialogs, verbs, parser, quest pad, saving, levels, title screen
- `src/js/06-savecode.js` · 32-bit save codes
- `src/landing.html`, `src/landing/` · landing page and its screenshots
- `fonts/` · the same SIL OFL fonts as Lossy, inlined at build time

## Accessibility

Built to WCAG 2.2 AA: 4.5:1 text contrast and 3:1 for text box and button edges, every room's objects listed as buttons as well as on the picture, keyboard access to every table row and window, a scene description for screen readers, 24-pixel minimum targets, and an Animation on/off switch in the Menu.
