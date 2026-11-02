# Facilitator guide

How to run LossyInc Range as a demo or a training, with a clean path through every level, the traps, and where the simulated screens come from.

## Before you start

- Open `index.html` in a recent desktop browser. A projector at 1280×800 or larger reads best; phones work but the computer screens get cramped.
- A first run of Tuesday takes 15 to 25 minutes for someone new. Each later day takes about the same. ULTIMATE takes 20 to 30 minutes and usually more than one attempt.
- Time in the game only moves when the player acts. Talking, walking and clicking cost minutes; reading doesn't. Nobody loses because they paused to discuss something.
- If a player gets stuck, point them at the blue **Next:** bar, then at **Tasks**.

## Scoring

Each day is out of 100; the week, Tuesday to Friday, is out of 400. Points come from the remediation steps themselves, plus a few for curiosity (sticky notes, the whiteboard, the rubber duck). Work finished on a later day than its incident scores half. Friday is ULTIMATE, and only a by-the-book run wins it. ULTIMATE on its own (title screen) is scored out of 100.

Ranks for the week: Secrets Sage (360+), Remediation Hero (292+), Steady Responder (212+), Survivor (132+), Lucky Intern.

## Tuesday: The Agent Committed It

**Situation.** At 9:04 GitGuardian flags a valid OpenAI key that an AI coding agent committed to `skoupmouz-ledger-batch/.mcp.json` (incident #1017). The key has three consumers: `repayments-svc`, the `ledger-batch` pipeline, and a cron job on the old `nas01` box that no integration covers.

**Deadlines.**
- 10:00: the agent publishes a public repro repository with the key in it, unless someone stops it. If the key goes public, scrapers drain it at 10:40.
- 12:00: the loan disbursement run needs `repayments-svc` healthy.
- 12:30: audit, if the incident isn't finished.

**A clean path.**
1. Use the monitor, open incident #1017, check validity.
2. Desk drawer → badge. Walk to the dev pit and talk to Dana: ask whether the agent is doing anything else (stops the public repro), then who else uses the key (reveals the nas01 cron). The exploration map is an alternative way to see the first two consumers.
3. Vault → create the secret at `kv/lending/openai` with the current key.
4. CI/CD → for both repos, update the secret to the Vault reference, then run the deploy workflow.
5. Server closet → use nas01 → `crontab -e`, then **Insert Vault lookups**, then `^O` and `^X` (or the on-screen buttons).
6. AI provider → create a new key. Vault → create a new version with it.
7. GitGuardian → Revoke (type `revoke`). The auto-resolve playbook closes the incident.
8. AI provider → Usage → mark it reviewed.
9. Tell Kofi it's handled.

**Optional, worth showing.** On nas01, paste the install command from GitGuardian › Endpoint protection › Endpoints, then `ggshield machine report`. The scan finds the key in `~/.bash_history` and points out that the crontab lives in a root-only spool that a user-level scan can't read. `ggshield machine setup` plants a honeytoken. Clean the history with `history -c` before logging out, or bash writes the key back to `~/.bash_history` when you log out.

**Deaths and their lessons.** Revoking before moving consumers kills the noon run ("assess before acting"). Ignoring or resolving the incident without revoking lets scrapers in once the key is public ("closing the ticket doesn't stop anyone").

## Wednesday: The Worm in the Lockfile

**Situation.** A poisoned npm package, `colorfmt@4.1.2`, ran in Plimbo's CI overnight and published the CI environment to a public repository. Two incidents come from Public Monitoring: a GitHub classic PAT used by the iOS release job (#1102) and a SendGrid key used by `plimbo-api` and a digest cron on nas01 (#1103).

**Deadlines.**
- 10:30: phishing from your own SendGrid account, if that key is still valid.
- 11:30: a malicious workflow pushed with the stolen GitHub token, if it is still valid.
- `plimbo-api` down for 90 minutes straight: password-reset meltdown.
- 2:00 PM: the release workflow must work.
- 3:00 PM: audit.

**A clean path.**
1. Revoke both incidents immediately (they're stolen and public: revoke first, restore after).
2. Dev pit → Ravi: pin colorfmt back and purge the caches (or CI/CD › Dependencies). Ask who else uses the SendGrid key.
3. GitHub → generate a fine-grained token scoped to `plimbo-ios`. SendGrid → create a restricted Mail Send key. Review the GitHub audit log and SendGrid activity.
4. Vault → store both under `kv/plimbo/…`.
5. CI/CD → point `plimbo-ios` and `plimbo-api` at Vault and run their workflows.
6. nas01 → `crontab -e` → Insert Vault lookups → save.
7. Tell Kofi.

**The trap.** Running a CI workflow with a new credential before containing the worm re-leaks it, and the run dies 20 minutes later. That's the lesson of the day: contain before you rotate.

## Thursday: Ghost of the Acquisition

**Situation.** A Google Cloud service account key for `terravox-maps-prod` sits in a public Docker image from Terravox, a company Lossy acquired (#1219). There's no owner, nobody has admin on the project, and GitGuardian can't revoke Google Cloud keys. Consumers: the tile renderer, field-sync, and an old VM, `tvx-legacy-01`, that nobody remembers.

**Deadlines.**
- 10:50: crypto miners, if the key is still valid.
- 1:00 PM: flood-response teams need field-sync.
- 3:00 PM: audit.

**A clean path.**
1. COO's office → ask Kofi for break-glass access.
2. GitGuardian → open #1219, check validity, set Amara as owner.
3. Google Cloud → disable the key (reversible). Key usage reveals the VM; mark it reviewed.
4. Create a new JSON key and store it in Vault at `kv/mapwende/gcp-tiler`. Point both CI repos at it and deploy.
5. Google Cloud → VM instances → SSH: `sudo nano /etc/tvx/export.env`, then **Use attached service account**, then save. `sudo rm /etc/tvx/sa-terravox-tiler.json`. Run `/opt/tvx/export.sh` to verify.
6. Delete the old key once nothing breaks. Tell Kofi.

## ULTIMATE: Patient Zero

**Situation.** The decoy AWS key that Endpoint Protection planted on Ravi's laptop was used at 3:12 AM. By 3:40 the attacker had cloned private repos with his GitHub token and read `kv/plimbo/*` with his Vault token. The binder in the desk drawer, IR-07, has the order. Any state-changing action out of order ends the run and names the step that wasn't done. Reading, looking and checking logs are always allowed.

**The playbook, as the game enforces it.**
1. Confirm the alert: open the honeytoken event (GitGuardian › Honeytokens). Never reset it.
2. Isolate: Ravi disconnects the laptop and hands it to IT.
3. Inventory: Endpoint protection › Endpoints › ravi-mbp › Secrets → Create incident for the GitHub token, the SendGrid key and the Vault token.
4. Cut access paths first: revoke the Vault token (Vault › Access › Tokens).
5. Revoke the GitHub token and the SendGrid key.
6. Create replacements and write them as new versions in Vault.
7. Restore every consumer: the iOS release job, `plimbo-api` (already reads Vault), and the nas01 digest cron (ask Ravi what was on the laptop to find it).
8. Investigate: GitHub audit log, Vault audit log, SendGrid activity.
9. Close out: all three incidents resolved, then revoke the honeytoken.
10. Report to Kofi.

**Instant losses.** Resetting the honeytoken (it says "false alarm"), ignoring any of the incidents, or doing any step before the one it depends on. The phishing and repo-abuse deadlines from Wednesday also apply.

## Where the screens come from

The simulated GitGuardian follows the docs at docs.gitguardian.com and the API reference at api.gitguardian.com/docs. Checked item by item (file names are the pages in the docs):

| On screen | Source |
|---|---|
| Statuses Triggered, Assigned, Resolved, Ignored; reopen; regression | *internal-monitoring/detect/incident-statuses*; API `StatusEnum` |
| Validity Valid, Invalid, Failed to check, Cannot check, Unknown; re-check after revoke | *secrets-detection/customize-detection/validity-checks*; API `ValidityEnum` |
| Severity Critical, High, Medium, Low, Info, Unknown, set manually | *internal-monitoring/remediate/prioritize-incidents*; API `SeverityEnum` |
| Risk score (0 to 100) with feedback | *prioritize-incidents* |
| Tags: Default branch, Publicly leaked, From historical scan, Vaulted, Revocable by GitGuardian | *prioritize-incidents* "GitGuardian Tags"; API `TagEnum` |
| Public exposure: Source is publicly visible, Has linked public incident, Found outside perimeter | *internal-monitoring/remediate/investigate-incidents*; API `public_exposure` |
| Ignore reasons, word for word | *incident-statuses*; API `IgnoreReasonEnum` |
| Resolve records whether the secret was revoked | API `secret_revoked` (the dialog's question is our wording; the docs don't show it) |
| Revoke: supported providers, Valid only, Full access, type `revoke`, validity re-check, Secret Revocation setting | *internal-monitoring/remediate/remediate-incidents* |
| Sharing: Feedback collection (on), Resolve or ignore via link (off), link expiry | *platform/collaboration-and-sharing/incident-permissions-and-sharing*; API share body |
| Feedback fields "Is it an actual secret?" and "Additional remarks" | API `feedback` examples |
| Playbook names and defaults | *platform/automate-with-playbooks/available-playbooks* |
| Default remediation workflow and its API shape | `GET /v1/remediation-workflow` |
| Endpoint Protection: install script, `machine report`, `machine setup`, `machine redact`, Endpoints dashboard, coverage KPIs, AI agents column, Create incident from findings | the *endpoint-protection* section, including *ai-hooks*, *dashboard*, *remediate-findings*, *what-is-scanned* |
| Honeytokens: Active, Triggered, Reset vs Revoke, event fields | *honeytoken/respond*, *honeytoken/understand-events*, *endpoint-protection/honeytoken-protection* |

Simplified on purpose: occurrences show one row per location rather than per commit; the impacted-perimeter panel is a summary; incidents raised from Public Monitoring alerts are shown as internal incidents tagged Publicly leaked, which is how a leak of your own secret appears in internal monitoring.

Third-party consoles (Vault, GitHub, SendGrid, Google Cloud, CI/CD, the AI provider, Slack) follow each product's documented flows and wording, without logos or branding.

## Release-note coverage

Every GitGuardian SaaS release from November 2025 to October 2026 is mapped to the game in [RELEASE-COVERAGE.md](RELEASE-COVERAGE.md): what's simulated, what was added, what's on the backlog and what's out of scope. On Tuesday, **Push to vault** on the incident is the fastest way through step 2 (Secure storage): it stores the leaked value so consumers can move to Vault before you rotate.

## Perfect-start codes

To jump a room straight to a later day with a clean record, enter one of these on the title screen (Enter a save code): `LR-PERF-TUE`, `LR-PERF-WED`, `LR-PERF-THU`, `LR-PERF-ULT`. Each starts that level at 9:00 AM with every earlier day at a perfect 100.

## Training level

For a room where some people have never played a point-and-click adventure, or never used GitGuardian, start with **Training: how to play** on the title screen. It takes about five minutes and can't be lost. A green arrow and a pulsing green outline point at the thing to click. Every door except the player's office is locked, and Tasks shows the training checklist.

- **Part 1, controls:** use the monitor, open GitGuardian, turn away from the screen, walk to the hallway and back.
- **Part 2, the dashboard:** what a secret and an incident are, what the details panel means, risk score, validity, the exploration map (consumers, secrets managers, accessed resources), occurrences, and the order of the remediation steps.

The real-world numbers in Part 2 come from GitGuardian's State of Secrets Sprawl 2025: 23.8 million secrets leaked on public GitHub in 2024, and 70% of secrets leaked in 2022 were still valid. The Toyota example is the 2022 disclosure of an access key left in public code on GitHub for about five years, exposing roughly 296,000 customer records.

## Incident page layout and rotation

The incident page follows the product's layout, based on GitGuardian's interactive demo. It has Overview, Occurrences, Remediation and Activity tabs, and an Incident details panel on the right. The exploration map is the first card on Overview. Clicking it opens the full map: consumers on the left, the secret in the middle, and the resources it can reach on the right. Once the secret is in Vault, lossy-vault appears under it, with the path and version, and consumers that read from Vault connect through it. A secret that isn't vaulted shows no vault on the map.

For SendGrid and GitHub keys, once a player has made a new key by hand and stored it as the current version in Vault, Vault shows **Rotate now**. Rotation stores a fresh key and revokes the previous one. Consumers reading from Vault keep working, and hardcoded copies break and page the player. It isn't scored.
