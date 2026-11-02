# LossyInc Range roadmap

> Design history from the original build workspace. File paths below (web/adventure.html, world/console.html, engine/…) refer to that workspace; in this repo the game is built from `src/` into `index.html`, and the Python engine lives in `legacy/`.

## Current direction (2026-10-30, night): a week, plus ULTIMATE

Console version 7 (`web/adventure.html`, built from parts in the scratchpad and published to the same artifact). First-person Sierra-style adventure; computer screens mimic the real tools.

**Structure.** Four days: Tuesday to Thursday, then Friday is ULTIMATE (also playable on its own). Win (tell Kofi it's handled) or lose (a death), the next day starts at 9:00. Anything unfinished carries over: its incident stays open, its threats re-arm every day until it's fixed, and late fixes score half. Score is out of 400, with a week finale and rank. A blue "Next:" strip always names the next step; Tasks shows the day's checklist. Order is flexible on days 1-3 (the exploration map is optional if you ask the developer).

- **Tuesday, The Agent Committed It** (Skoupmouz, microlending): AI agent commits an OpenAI key; agent publishes a public repro at 10:00 unless stopped; noon disbursement; hidden nas01 cron.
- **Wednesday, The Worm in the Lockfile** (Plimbo, phone app): a poisoned npm package (colorfmt 4.1.2) dumps CI env to a public repo; GitHub PAT + SendGrid key stolen. Contain first (pin and purge), revoke immediately, then restore. Trap: running CI with a new secret before containment re-leaks it. Deadlines: phishing at 10:30, repo abuse at 11:30, release at 2 PM, password resets down 90 min.
- **Thursday, Ghost of the Acquisition** (Mapwende, NGO): GCP service account key in a public Terravox Docker image; no owner; not revocable in GitGuardian; break-glass from Kofi; disable (reversible) then delete; hidden consumer tvx-legacy-01 fixed by switching to its attached service account. Deadlines: miners at 10:50, flood maps at 1 PM.
- **ULTIMATE, Patient Zero** (Dwayne's spec): an Endpoint Protection honeytoken fires on Ravi's laptop; damage already done; the IR-07 binder in the desk drawer lists 10 steps. Any state-changing action out of order, resetting the honeytoken, or ignoring an incident is an instant loss that names the skipped step.

**Endpoint Protection** (from local docs endpoint-protection__*): Endpoints dashboard (coverage KPIs, fleet, add-endpoint install command), endpoint detail with Secrets and Create incident, Honeytokens with events, Reset vs Revoke. In-game hosts run a simulated ggshield: install script (per user, Linux servers Beta), machine report (skips root-only crontab spool), machine setup (plants honeytoken), machine redact. nas01 is "not installed", not "not found".

**Hosts** (nas01, tvx-legacy-01): typed shell plus chips, nano, editable bash history (history -c/-d/-w, nano ~/.bash_history; bash rewrites history from memory at logout), crontab whose lines drive consumer health, sudo on the VM.

**Fixes:** clicking Kofi works (smallest hotspot under the cursor wins; people take priority).

The bridge version (sections 4-5 below, `web/engine.js`, `web/ui.html`) is superseded but kept for reference.

Direction set by Dwayne, 2026-10-30: the range is a **training tool for using GitGuardian under specific conditions**. The bridge look and feel is a good start. Next it must model GitGuardian's real workflows exactly, and the mock infrastructure exists to produce **cascading failures, dependency problems and business risk** when remediation is done badly or incompletely.

## 1. Remediation must follow the real GitGuardian workflow

Grounded in `reference/docs/internal-monitoring__remediate__remediate-incidents.md`, `internal-monitoring__detect__incident-statuses.md` and the API reference (`get-remediation-workflow`, incident lifecycle operations).

- Incident lifecycle: Triggered → Assigned → Resolved / Ignored, with regression on reappearance.
- Remediation workflow panel on each incident, driven by `GET /v1/remediation-workflow` (default steps, or a custom workflow of up to 20 steps).
- Investigate before acting: occurrences, validity check, presence check, impacted perimeter, NHI context.
- Assess revocation impact first: the NHI exploration map lists the workloads consuming the credential.
- Revocation inside GitGuardian only for supported providers (GitHub, GitLab, OpenAI, SendGrid, Slack, Heroku), only when the secret is Valid, only with Full Access, and confirmed by typing `revoke`.
- Every other provider: rotation happens at the provider, by the person who owns it, and takes time.
- After revocation GitGuardian re-runs the validity checker. Valid → Invalid; the incident auto-resolves only if the playbook "auto-resolve when valid secret is revoked" is on; otherwise resolve manually with "secret revoked".
- Collaboration: grant access or public share to the developer, feedback form, @mentions, notes. All logged in the incident timeline.
- Playbooks as workspace settings: auto-share/grant to the leak author, auto-resolve on revoke, auto-ignore false positives, auto-ignore invalid.

## 2. Infrastructure must cascade

- Dependency graph: each credential has consumers (services, CI pipelines, mobile builds, batch jobs, partner integrations, other credentials stored in vaults).
- Rotating without updating consumers breaks them: outages spread through the graph over watches.
- Business impact per line: app store ratings and signups, broker API SLA credits, NGO field operations and donor trust, microlending disbursements and regulatory exposure.
- Orphaned and legacy systems (the GCP acquisition, EOL colo servers) resist change: no owner, no deploy path, hidden consumers.

## 3. Decisions (2026-10-30)

- **Workflow:** both. GitGuardian's default remediation workflow by default; a scenario can impose a custom workflow (up to 20 steps) as a training condition.
- **Rotation outside in-app revoke:** the player does it in a **mock provider console** (AWS IAM, GCP IAM, Stripe, Twilio, Datadog, Mapbox, Plaid, Vault, Rackspace, on-prem DB users), then updates the credential's consumers. Skipping consumer updates causes the cascade.
- **Business risk:** all four dimensions count: outages through the dependency graph; money and SLAs (revenue per hour, SLA credits, refunds, cloud bills); mission and trust (NGO field ops, donor trust, borrower harm, app ratings); regulatory (breach notification clocks, lending compliance, audit findings).
- **Audience:** **demo for prospects**. Favors a guided, story-led experience that shows GitGuardian's value under pressure: clear before/after moments, visible cost of doing it wrong, polish over breadth.

## 4. Built (2026-10-30, console version 4)

1. **Incident detail view**: header chips and tags (incl. "revocable by GitGuardian", "vaulted"), Overview with the remediation workflow panel (`GET /v1/remediation-workflow`), Occurrences, Timeline (activity log), Collaboration (share with developer → feedback next watch, notes). Secret panel with validity check, presence check, consumers. Actions: assign, in-app Revoke (supported providers, Valid only, type `revoke`), Resolve (with "secret revoked"), Ignore (reason), Reopen.
2. **Workflows**: GitGuardian default (the six documented steps: assess, secure storage, update code, test & deploy, rotate & revoke, monitor & verify) and a custom LossyInc emergency runbook that public exposures impose. Switchable in Settings.
3. **Playbooks**: auto-resolve on revoke (validity re-check after revocation and on each watch), auto-share to the leak author, auto-ignore invalid.
4. **NHI exploration map**: credential → consumers, colored by which version each reads; a dashed "unmapped sources" node when consumers live on systems nobody integrated.
5. **Provider consoles** (simulated, deliberately a different visual product): credential versions v1/v2, last-used evidence of attacker calls, push to vault (ggscout), create replacement, tested deploy (1 order) or hot-patch (free, may regress), deactivate v1 with an impact warning, access logs. GCP orphan and on-prem DBs block access until break-glass escalation.
6. **Cascade and business model**: cutting a credential breaks every consumer still on it, including hidden ones; outages cost revenue, SLA credits, trust and NGO field operations per watch; lending disbursement failures and PII database compromise open regulatory clocks with deadlines; missed clocks fine and hit trust. Business desk station and header strip.
7. **Guided demo**: fixed Lossy Inc scenario (AI agent leaks a valid OpenAI key into a monitored repo), 12-step coach that highlights the next click but lets mistakes play out; a hidden legacy consumer breaks on revoke to show why the map and developer feedback matter; debrief shows business cost and the revoke-first estimate.
8. **Debrief grading** now counts outages and missed clocks, not only attack damage.

## 5. Next candidates

- More scenario-specific custom workflows and instructor-set conditions.
- GitLab and Heroku credentials so every in-app revocable provider appears.
- Bulk actions, severity rules, and incident filtering that mirrors the dashboard more closely.
- Prospect-facing polish: shareable demo link, presenter notes, shorter demo variant.
