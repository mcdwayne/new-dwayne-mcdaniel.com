# LossyInc Range runbook

Operating instructions for Claude in any chat in this Project. The user drives the range with plain chat commands; Claude runs the engine in the workspace and reports what happened.

## Hard rules

- Never run `ggshield` in any terminal. ggshield output exists only as simulated transcripts the engine writes into events.
- Never run anything against a real GitGuardian workspace. The mock API at `http://127.0.0.1:8787` is the only GitGuardian the range talks to.
- All credentials are format-correct fakes. Validity is a sim flag: `valid`, `invalid`, or `unknown` (unknown keys carry a hidden truth revealed by `check` or by attacker success).
- Authority for mock behavior: `reference/api/*.md` (from the OpenAPI spec at https://api.gitguardian.com/docs) first, `reference/docs/*.md` (docs.gitguardian.com) second. Cite the operationId or doc page when explaining a behavior.
- Scenario fiction is inspired by real infostealer, AI-agent and supply-chain secret abuse cases, never cited in play.

## Where things live

| What | Workspace (this chat only) | Project (persists across chats) |
|---|---|---|
| Engine code | `range/engine/*.py` | `range/engine/<file>.py` |
| This runbook | `range/RUNBOOK.md` | `range/RUNBOOK.md` |
| Current save (markdown) | `range/saves/<save-id>/*.md` | `range/save/*.md` |
| Reference library | `range/reference/` | not stored; rebuild with `fetch_reference.py` |
| Repos, flag files, roster, console | `range/world/` | not stored; rebuilt from the save |

The save is the source of truth. Each `.md` file has readable tables plus one ```` ```yaml state:<key> ```` block that the engine parses.

## Bootstrap a fresh workspace (start of any new chat)

1. `project_read` every `range/engine/*.py` and `range/RUNBOOK.md`, and write them to `/home/claude/range/engine/` and `/home/claude/range/`.
2. `python3 range/engine/fetch_reference.py` (pulls API reference + docs, ~10 MB raw).
3. If the user said `start`: `project_read` each `range/save/*.md`, write them to `range/saves/<save-id>/` (save id is in `SAVE.md`), then follow `start` below.

## Commands

| User says | Claude does |
|---|---|
| `new start` | `python3 engine/rangectl.py new-start` (optional `--headcount`, `--seed`, `--root`). Start the mock API. Republish `world/console.html` to the stored `console_url` with `capabilities: {db: {}, sample: {}}` (or publish a new artifact and store its URL with `rangectl.py meta console_url <url>`), then `rangectl.py bridge` and push `bridge/*`. Sync the save to the Project. Report: company, headcount, business lines, acquisition, monitored vs blind repos, scenario staged at turn 0. |
| `start` | Bootstrap if needed, then `rangectl.py start`. Start the mock API. Republish the console to the stored `console_url`. Report where it left off (turn, scenario, last events). |
| `stop` | `rangectl.py stop`. Stop the mock API. Sync the save to the Project. Confirm the turn it stopped on. |
| `next turn` | `rangectl.py next-turn`. Republish the console. Narrate the events in plain prose; show ggshield transcripts as code blocks; never reveal hidden truth or GM-only details. |
| `status` | `rangectl.py status`. |
| `rotate S012`, `revoke S012`, `check S012`, `isolate R041`, `monitor <repo>`, `honeytoken <laptop or repo>`, `endpoint-protection all`, `offboard P0007` | `rangectl.py act <verb> <target>`, then report the result. |
| Any GitGuardian action ("list critical incidents", "resolve 1003 as revoked", "who owns this NHI?") | Call the mock API with curl and `Authorization: Token range-operator`. Quote the `X-Range-Operation` / `X-Range-Ref` headers when useful. Resolving an incident does not rotate the key; say so if the response carries `X-Range-Note`. |

| `status report` (or `sitrep`) | `rangectl.py report`. Relay it as the bridge crew speaking, station by station, then the numbered options. Never add facts the report doesn't contain. |
| A number (`2`) after a status report | Run that option's command. |
| `investigate <laptop, person, helpdesk, repo>` | `rangectl.py act investigate <target>`: forensics that reveals credentials at that place. |
| `assign / resolve / ignore / reopen <incident#>` | `rangectl.py act <verb> <id>`. |

## The game (console artifact)

**Current version is the adventure** (`web/adventure.html`, self-contained). `python3 web/build.py` copies it to `world/console.html`; republish to the stored `console_url` without passing `capabilities` (keeps sample, db, downloads; the adventure uses db for its save at `adventure/save1`, with a localStorage fallback). The bridge description below is the superseded version 4.

### Superseded: bridge version

The console is a self-contained, click-to-play bridge simulator (original 1990s-TV look, not any show's interface). Everything runs in the page: `web/engine.js` (a JavaScript port of the engine) plus `web/ui.html`, assembled by `python3 web/build.py` into `world/console.html` with the Lossy Inc save embedded as the starting company (`web/base_lossy.json`, regenerated from `saves/` when missing).

- Title screen: Continue (autosave), New game with Lossy Inc, New random company (pick a size), Load (3 slots + autosave), Import markdown save.
- Five station consoles act on the world: Operations (GitGuardian incident queue), Sensors (public monitoring, repo coverage, endpoint protection, honeytokens), Tactical (threats, isolation), Engineering (machine-state flags), Personnel (NHI owners, known credentials, forensics).
- Orders per watch: 4 + Security headcount/5, max 7. Costs: push to vault 1, new credential 1, tested deploy 1 (hot-patch 0), break-glass escalation 2, purge history 1, isolate/investigate/monitor/honeytoken/notify 1, endpoint rollout 2; check, assess, logs, share, note, assign, resolve, ignore, revoke from GitGuardian, deactivate, settings are free.
- Remediation follows GitGuardian's workflow; see ROADMAP.md section 4 for the incident view, exploration map, provider consoles, cascade/business model, playbooks and the guided demo.
- End Watch advances six sim hours; events play as click-through message boxes; contained scenarios end with a graded debrief.
- Every order shows the GitGuardian API operation (with its reference link) or docs page it corresponds to.
- Saves are event-sourced: `{base, actions}` replayed deterministically. Stored in the artifact's db (`saves/slot1..3`, `saves/autosave`), with a browser fallback; Export writes a markdown save with a `json save` block that Import reads back.

To change the game: edit `web/engine.js` / `web/ui.html`, run `web/build.py`, republish `world/console.html` to the stored `console_url` keeping `capabilities: {sample: {}, db: {}, downloads: true}`.

The chat commands above still drive the Python engine and the HTTP mock API for API-level testing; they are independent of games played in the page.

Start the mock API with:
```
cd range/engine && (nohup python3 mockapi.py > /tmp/mock.log 2>&1 & echo $! > /tmp/mock.pid)
```
Stop it with `kill $(cat /tmp/mock.pid)`. Never use `pkill -f mockapi`; it matches the calling shell.

## Syncing to the Project

On `new start` and `stop` (and when the user asks), `project_write` each file in `range/saves/<save-id>/` to `range/save/<file>` using `local_path`. On `new start`, also write the engine files and this runbook. The Project keeps one current save; older saves remain only in the workspace that made them unless the user asks to keep an archive.

## How a scenario works

- `new start` stages scenario 1 at turn 0. The leak lands on the first `next turn`.
- Each turn is 6 sim hours. Stages escalate until contained: every leaked secret whose truth is valid is rotated or revoked, and every resource flagged `SEC=COMPROMISED` is isolated.
- Containment produces a debrief. The next `next turn` starts a new scenario and drifts the company name (suffix change, vowel shift, merger branding, initials, domain-hack punctuation). Old names stay in repos, configs and DNS.
- Archetypes: stealer on a laptop, AI agent commits a key, dependency worm, ghost of the acquisition (orphaned GCP), paste in a ticket, secret in a container layer.
