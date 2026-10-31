# LossyInc Range backlog

Running kanban for the game. To update it, move a card's ID between columns on the board and change its Status in the card list. Keep at most 2 cards in progress.

Last updated: 2026-10-31

## Board

| Backlog | Ready | In progress | Review | Done |
|---|---|---|---|---|
|  |  |  |  | D-01 Three-day week with carry-over |
|  |  |  |  | D-02 ULTIMATE: Patient Zero |
|  |  |  |  | D-03 Endpoint Protection + editable bash history on hosts |
|  |  |  |  | D-04 Fixes: Kofi click, computer screen drift |
|  |  |  |  | D-05 Repo package, tests, facilitator guide |
|  |  |  |  | D-06 LR-03 nas01: find it once, then SSH |
|  |  |  |  | D-07 LR-05 Dev runs machine setup (AI hooks) |
|  |  |  |  | D-08 LR-04 Slack the developer |
|  |  |  |  | D-09 LR-01 Mobile vertical layout |
|  |  |  |  | D-10 LR-02 Follow docs and workflows more closely |
|  |  |  |  | D-11 LR-07 32-bit save codes |
|  |  |  |  | D-12 LR-06 Desktop app + website |
|  |  |  |  | D-13 LR-08 Workstation as a homemade Windows 3.1 |
|  |  |  |  | D-14 LR-09 Real tabs: clear, selectable, keyboard and screen-reader accessible |
|  |  |  |  | D-15 LR-10 Use and Talk interchangeable; default verb Use |
|  |  |  |  | D-16 LR-11 Random name suggestion for a new game |
|  |  |  |  | D-17 LR-12 Machine setup in person; MDM unlocks after setup + nas01 fixed |
| LR-18 Smart Notifiers + GitGuardian alerts in Slack |  |  |  | D-18 LR-13 Push to Vault from the incident |
| LR-19 Custom validity by API |  |  |  | D-19 LR-14 NHI inventory and Secrets managers (ggscout) |
| LR-20 GitHub check runs |  |  |  | D-20 LR-15 Incident search, Secret Enricher, @mentions |
| LR-21 ggshield agent skills |  |  |  | D-21 LR-16 Public incidents: agents analysis, Docker Hub, similar incidents, environment |
| LR-22 Night Owl dark theme |  |  |  | D-22 LR-17 Coverage hub; AI agents and MCP inventory |
| LR-23 Overprivileged NHIs (AWS, Entra, Okta) |  |  |  |  |

Ready means the card is clear enough to start. Backlog means it needs a decision or design first (see Open questions).

## Cards

| ID | Item | Status | Size | Depends on | Done when | Open questions |
|---|---|---|---|---|---|---|
| LR-01 | Make it work on mobile; rethink the vertical layout | Done | M | none | Every level is playable one-handed at 390×844 portrait: scene on top, verbs as a bottom bar, the Next: hint collapsible, computer apps stack in one column, terminal chips scroll sideways, no sideways page scroll | Landscape too, or portrait only? |
| LR-02 | Follow the docs and workflows more closely | Done | L | none (ongoing) | Every simulated GitGuardian screen and action is checked against the local docs and API reference, each with a source noted in FACILITATOR.md: incident fields, validity values, occurrences, remediation workflow, playbooks, Endpoint protection, honeytokens, feedback and sharing | Which screens matter most for demos? Start there |
| LR-03 | Simplify nas01: find it once, then get SSH access from a sticky note in the other desk drawer | Done | S | none | After nas01 is found (closet, or Dana tells you), the right-hand desk drawer has a sticky note with gary@nas01 SSH details; from then on nas01 opens as an app on your computer, with no more walking to the closet | Should the closet console still work, or go away once SSH exists? |
| LR-04 | Slack the developer, with replies that take a random 2 to 200 seconds | Done | M | none | A Slack-style app on the computer lists Dana, Ravi and Amara; each message gets a reply after a random 2 to 200 s delay, with a typing indicator and an unread badge; replies hold the same information as talking in person | Real seconds, or in-game time? (The game clock only moves when you act) |
| LR-05 | Ask the developer to run ggshield machine setup, putting AI hooks in place; they always agree; afterwards AI on that machine can't use secrets | Done | M | LR-04 (to ask by Slack as well as in person) | A dialogue and Slack option makes the dev run setup; their endpoint shows AI hooks: Covered in Endpoint protection; from then on, that machine's AI agent is blocked from reading or committing secrets (Tuesday: the agent can't re-leak the key; ULTIMATE: noted as a step-9 follow-up) | Award points, or make it a checklist item? |
| LR-06 | Package as a standalone cross-platform app that also runs as a website | Done | M | LR-01 helps | One index.html runs both as a website (GitHub Pages) and inside desktop builds for Windows, macOS and Linux produced by CI; fonts bundled so it works offline; saves persist in the app | Tauri (small) or Electron (familiar)? Signed builds needed? |
| LR-07 | Save system that condenses a game into a 32-bit string | Done | L | LR-03, LR-04, LR-05 (they add state) | Any game in progress produces a short code (32 bits, e.g. LOSSY-7F3A-91C2), and entering it on the title screen restores an equivalent game: day, time slot and milestones intact, with a checksum so typos are rejected. It condenses progress; it doesn't encode every possible state | What may be lost on restore (exact minute, chosen dialogue lines)? |
| LR-08 | Make the workstation look like a bad homemade version of Windows 3.1 instead of a tab bar | Done | M | none | The computer opens to a Program Manager-style desktop with program-group icons (Mail, GitGuardian, Vault, CI/CD, Slack, provider consoles, nas01 SSH); apps open in beveled windows with title bars, close boxes and a little janky charm (mismatched icons, a misspelled group name); the app contents stay faithful to the real tools; works on phones (windows go full-screen) | How janky is too janky for a prospect demo? Overlapping windows, or one window at a time? |
| LR-09 | Make tabs clearly tabs, selectable, keyboard navigable and accessible | Done | M | LR-08 (same chrome) | Every tab strip (app tabs, GitHub, SendGrid, Google Cloud, CI/CD, Vault, GitGuardian nav) uses the WAI-ARIA tabs pattern: role=tablist/tab/tabpanel, aria-selected, aria-controls, roving tabindex, Left/Right/Home/End to move, Enter/Space to select, visible focus ring and an obvious selected state; passes an axe-core check with no serious issues | WCAG 2.2 AA as the target? |
| LR-10 | Use and Talk both work as use or talk; the default verb when the view resets is Use | Done | S | none | Use on a person starts the conversation; Talk on a thing uses it; the verb resets to Use on a new game, a new day, a restore, and after closing the computer or a terminal | none |
| LR-11 | Random name suggestion for a new game | Done | S | none | New week and ULTIMATE ask for your name with a random suggestion and a reroll button; the name shows in the intro, Slack, incident assignee, Endpoints and the finale; Restart keeps it | none |
| LR-12 | Machine setup only in person; MDM options appear only after a developer runs setup in front of you and nas01 is fixed | Done | M | LR-05 | Slack no longer offers machine setup; a Device Management program appears in Program Manager once setup was done in person and no active incident's key is pasted in nas01's crontab; it deploys ggshield machine report and machine setup to every laptop (AI hooks fleet-wide); servers stay manual | none |
| LR-13 | GitGuardian Push to Vault from the incident | Done | M | none | The incident's Secret card offers Push to vault while the leaked value is valid and not vaulted; the form names the secrets manager (lossy-vault, read/write), path and key; ggscout sync-secrets writes it within a minute and the incident is tagged Vaulted; counts as storing the key | none |
| LR-14 | NHI Governance inventory and Secrets managers settings (ggscout) | Done | S | LR-13 | Inventory lists vaulted secrets with detector, environment, ggscout validity, owner and incident; flags leaked secrets not yet vaulted; Settings › Secrets managers shows the integration, mode, scopes and config | none |
| LR-15 | Incident search, Secret Enricher, @mentions in notes | Done | S | none | Search by value, author, file path or source; the historical generic secret shows its enriched type; @name in a note notifies that person | none |
| LR-16 | Public incidents: agents analysis, Docker Hub occurrence, similar incidents, environment | Done | S | none | #1102/#1103/#1219 show a Company-related verdict with reasoning; #1219 shows Docker Hub image, layer and publisher; related incidents link to each other; every incident shows its environment | none |
| LR-17 | Perimeter coverage hub; AI agents and MCP inventory | Done | S | none | Perimeter shows monitoring, scan and ownership coverage and the blind spots; endpoints list MCP servers and subscription | none |
| LR-18 | Smart Notifiers, and GitGuardian alerts in the Slack app | Backlog | M | none | A #sec-alerts channel in Slack gets GitGuardian alerts with risk score and severity; a Smart Notifier setting filters them | Should alerts arrive before or instead of email? |
| LR-19 | Custom validity by API | Backlog | S | none | A way to mark #1219's Terravox key valid or invalid yourself (e.g. after testing it from tvx), shown as Custom validity with a date | Needs an API console in game? |
| LR-20 | GitHub check runs | Backlog | M | none | Tuesday's agent commit appears as a failed check run on its pull request, with re-run and skip | Would this change Tuesday's story? |
| LR-21 | ggshield agent skills | Backlog | S | LR-05 | Dana's agent, with GitGuardian's skills installed, explains remediation in its own terminal | none |
| LR-22 | Night Owl dark theme in the GitGuardian window | Backlog | S | none | A theme toggle in the GitGuardian window | none |
| LR-23 | Flag admin and overprivileged NHIs | Backlog | M | none | Inventory flags the Terravox tiler service account as overprivileged | Which day? |

## Done

| ID | Item | Shipped |
|---|---|---|
| D-01 | Three-day week (Tuesday agent leak, Wednesday npm worm, Thursday acquired GCP key); win or lose advances, unfinished work carries over with its threats and half points | 2026-10-30 |
| D-02 | ULTIMATE: Patient Zero; honeytoken on a dev laptop, IR-07 binder, steps enforced in order | 2026-10-30 |
| D-03 | Endpoint Protection install, scan, honeytoken and redact on hosts; editable bash history; GitGuardian Endpoints and Honeytokens pages | 2026-10-30 |
| D-04 | Clicking Kofi works; computer screen no longer drifts down the page | 2026-10-30 |
| D-05 | Packaged as a repo: src/ + build.py → index.html, headless playthrough tests, facilitator guide, screenshots | 2026-10-30 |
| D-06 | LR-03: nas01 SSH from the right desk drawer's sticky note; opens as a computer app once nas01 is known | 2026-10-31 |
| D-07 | LR-05: Ask any developer to run ggshield machine setup; AI hooks block their agents from reading secrets (stops Tuesday's public repro); Endpoints shows AI agents coverage; on ULTIMATE only after isolation, on the loaner | 2026-10-31 |
| D-08 | LR-04: Slack app on the computer; DMs with the day's developers; same choices as talking in person; replies after a random 2-200 real seconds with typing indicator, unread badges and toasts; survives reloads | 2026-10-31 |
| D-09 | LR-01: Phone layout: compact status, 2-line tap-to-expand hint, tappable 'things here' list under the scene, bottom verb bar; computer goes full-screen with scrolling app menus (Vault and GitGuardian navigable on phones); terminal chips scroll; landscape splits scene and controls; message windows scroll | 2026-10-31 |
| D-10 | LR-02: Audited against the docs and API: six severity levels (editable), five validity states, risk score, public exposure, impacted perimeter, real feedback-form fields, documented share options, the five playbooks with their defaults; removed two invented tags; sources table in FACILITATOR.md | 2026-10-31 |
| D-11 | LR-07: 32-bit save codes (LR-XXXX-XXXX): level, time slot, earlier-day results, 17 milestones, 5-bit checksum; Menu shows the code, title screen restores it; round-trip checked after every test scenario | 2026-10-31 |
| D-12 | LR-06: Desktop app (Electron) for Windows, macOS and Linux built by CI on tags; fonts bundled so the single index.html works offline; GitHub Pages website workflow; Linux AppImage built and smoke-tested locally | 2026-10-31 |
| D-13 | LR-08: Workstation is a homemade Windows 3.1: Program Manager with janky program groups, pixel icons with badges, draggable windows that minimize to icons, maximize and close, Window menu, Notepad TODO.TXT, Clock, a disabled Solitaire; full-screen windows on phones | 2026-10-31 |
| D-14 | LR-09: Every tab strip follows the WAI-ARIA tabs pattern (tablist/tab/tabpanel, aria-selected, roving tabindex, arrow keys, Home/End), looks like real tabs with a visible focus ring; npm run a11y passes axe-core WCAG 2.2 AA with no serious issues | 2026-10-31 |
| D-15 | LR-10: Use on a person talks; Talk on a thing uses it; verb resets to Use on new game, new day, restore and after closing the computer or a terminal | 2026-10-31 |
| D-16 | LR-11: Name prompt with a random suggestion and reroll; name used across the game | 2026-10-31 |
| D-17 | LR-12: Machine setup only at the developer's desk; Device Management (MDM) unlocks after in-person setup and a clean nas01 crontab, and rolls ggshield machine report and machine setup out to every laptop | 2026-10-31 |
| D-18 | LR-13: Push to Vault on the incident: lossy-vault (HashiCorp Vault, read/write) via ggscout sync-secrets; tagged Vaulted; faster than the Vault program | 2026-10-31 |
| D-19 | LR-14: NHI Governance › Inventory (ggscout classification, environment, validity, owner) and Settings › Secrets managers | 2026-10-31 |
| D-20 | LR-15: Incident search bar (value, author, file path, source); Secret Enricher on a historical generic secret; @mentions in notes | 2026-10-31 |
| D-21 | LR-16: Agents analysis on public incidents; Docker Hub occurrence details; similar incidents; environment per secret | 2026-10-31 |
| D-22 | LR-17: Perimeter coverage hub with blind spots; AI agents and MCP servers per endpoint | 2026-10-31 |

Release-note audit (Nov 2025 to Oct 2026): see docs/RELEASE-COVERAGE.md.
