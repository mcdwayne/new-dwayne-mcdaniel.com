# GitGuardian SaaS release notes vs the game

An audit of every GitGuardian SaaS release from November 2025 to October 2026 ([docs.gitguardian.com/releases/saas](https://docs.gitguardian.com/releases/saas)) against what Lossy Inc simulates. Checked 2026-10-31.

Each release gets one of these statuses:
- **In game:** already simulated before this audit.
- **Added:** built during this audit (backlog cards LR-13 to LR-17).
- **Backlog:** fits the story, not built yet (LR-18 onward).
- **Out of scope:** real, but the story never reaches it: admin setup, billing, or a source type Lossy doesn't have.

Push to Vault isn't a headline in the window. It shipped around December 2025: the GitGuardian blog post is dated 5 December 2025, and the secrets managers and ggscout docs describe it. It was the gap that started this audit.

| Date | Release | Status | In the game |
|---|---|---|---|
| ~Dec 2025 | **Push to Vault** (secrets managers via ggscout `sync-secrets`, `nhi:write-vault`, read/write mode) | Added (LR-13) | Incident › Secret › Secrets manager › **Push to vault**: pick lossy-vault, path and key are prefilled. ggscout writes it on the next minute's sync, and the incident is tagged Vaulted. It scores as "stored in Vault" and is faster than the Vault program. On ULTIMATE it's gated by IR-07 step 6. It's hidden once the leaked value is revoked. |
| 2026-10-29 | GitHub team sync; Bridge validity checks; custom webhook headers; unlink tickets and occurrence-content APIs; Endpoint Protection scope in `ggshield auth login` | Out of scope | Admin setup. |
| 2026-10-27 | Machine scan with less noise: 501 validity checks, editor-history dedup, `--background`, `ggshield machine dashboard` redaction | In game (partly) | nas01 and tvx machine scan, and bash history redaction. The dashboard and `--background` aren't simulated. |
| 2026-10-21 | Public Monitoring for Docker Hub images; agents analysis | Added (LR-16) | Thursday's #1219 occurrence now shows Docker Hub · terravox/tiler:2021-legacy, layer 7, and the publisher. |
| 2026-10-15 | ggscout validity and permissions checks on vaulted secrets; Free/Growth/Enterprise plans | Added (LR-14) | NHI Governance › **Inventory** has a Validity column per vaulted secret (old key turns Invalid after revoke). Plans: out of scope. |
| 2026-10-09 | Harbor registry scanning | Out of scope | Lossy has no Harbor. |
| 2026-10-07 | Environment classified per secret; check-run notes; GAR Workload Identity; presence check endpoint | Added (LR-16) | **Environment** on the incident and in Inventory. Presence check was already in the game. |
| 2026-09-30 | Push incidents to Wiz | Out of scope | No Wiz at Lossy. |
| 2026-09-28 | Coverage Hub: monitoring, scan and ownership coverage; unreachable badges; Teams column | Added (LR-17) | Perimeter is now a coverage hub with source status (Monitored, Unmonitored, Unreachable) and Teams. nas01, jenkins01 and the Terravox org show as blind spots. |
| 2026-09-25 | AI Hooks withhold secret-bearing tool output; Kiro and Junie in the inventory | In game + wording (LR-17) | AI hooks via machine setup and MDM. Endpoint text now covers tool output. |
| 2026-09-07 | AI agents and MCP inventory; `ggshield machine setup`; personal vs company subscriptions | Added (LR-17) | Endpoint page: **AI agents and MCP servers** with subscription. Hooks coverage was already in the game. |
| 2026-09-04 | ggscout classifies vaulted values by detector | Added (LR-14) | The Inventory Detector column, including an Unknown row. |
| 2026-08-27 | Public Monitoring agents verdict (Related, Uncertain, Unrelated), Analysis tab | Added (LR-16) | **Analysis** card on public incidents #1102, #1103 and #1219: Company-related: Related, with reasoning. |
| 2026-08-25 | AWS S3 bucket scanning | Out of scope | Lossy's AWS isn't in the story yet. |
| 2026-08-14 | Set your own validity by API (`secrets:write`) | Backlog (LR-19) | No API console in the game. |
| 2026-08-10 | Honeytoken protection for the endpoint fleet; Azure DevOps extension | In game | ULTIMATE is built on it. |
| 2026-07-28 | GitHub check runs dashboard | Backlog (LR-20) | |
| 2026-07-20 | @mentions in incident notes; source status filters; bulk perimeter actions | Added (LR-15) | A note with @Dana (or any first name) notifies them and lands on the timeline. |
| 2026-07-08 | Generic detectors on non-VCS sources with the False Positive Remover | Out of scope | No Confluence or Jira in the story. |
| 2026-06-30 | ServiceNow event groups; risk score in Slack and Teams notifications | Backlog (LR-18) | |
| 2026-06-19 | Smart Notifiers (filter alerts by severity, risk, validity) | Backlog (LR-18) | |
| 2026-05-21 | Open-source agent skills for ggshield | Backlog (LR-21) | |
| 2026-05-20 | Smarter search bar: secret value, commit author, file path, source | Added (LR-15) | Incidents has a search bar. Values are hashed in the browser, per the docs. |
| 2026-04-29 | Teams notifications | Out of scope | Lossy uses Slack. |
| 2026-04-27 | Jira and Confluence attachment scanning | Out of scope | |
| 2026-04-23 | Slack Marketplace app | Backlog (LR-18) | It would post the alerts in the in-game Slack. |
| 2026-04-20 | Gerrit | Out of scope | |
| 2026-04-16 | Admin and overprivileged NHIs (AWS, Entra, Okta) | Backlog (LR-23) | |
| 2026-04-13 | Team access per source type | Out of scope | |
| 2026-04-10 | Secret scanning for AI coding tools (`ggshield install -t <tool> -m global`) | In game | That's what AI hooks and machine setup do on Dana's laptop. |
| 2026-03-24 | Email verification (MFA) for sensitive actions | Out of scope | Login and settings only. |
| 2026-03-10 | Publicly leaked tag and public exposure detail | In game | Tag plus the three public exposure categories. |
| 2026-03-06 | Okta Integration Network | Out of scope | |
| 2026-03-05 | Red Hat Quay | Out of scope | |
| 2026-03-03 | JFrog Artifactory package registries | Out of scope | |
| 2026-02-11 | NHI ownership | In game | Thursday's Set owner on #1219, plus the Owner column in Inventory. |
| 2026-02-02 | Night Owl dark theme | Backlog (LR-22) | |
| 2026-01-22 | Unified identity governance for Entra and AWS IAM | Backlog (LR-23) | |
| 2026-01-08 | ML similar-incident grouping | Added (LR-16) | **Similar incidents** card on #1102 and #1103 (same dump) and #1401 to #1403 (same endpoint). |
| 2025-12-31 | NHI integrations: Datadog, Snowflake, Okta, Auth0 | Out of scope | |
| 2025-12-19 | Analytics overview | Out of scope | |
| 2025-12-17 | Risk score | In game | |
| 2025-12-17 | Secret Enricher | Added (LR-15) | The historical Generic High Entropy Secret now shows as Mapbox Secret Token, "enriched from Generic High Entropy Secret". |
| 2025-12-12 | NHI integrations: Airbyte, Anthropic, n8n, OpenAI, CyberArk, Slack | Out of scope | |
| 2025-11-17 | SCIM team provisioning | Out of scope | |
| 2025-11-07 | Playbooks for Public Monitoring | In game | Playbooks page. |

## Sources

- [SaaS release notes](https://docs.gitguardian.com/releases/saas)
- [Push-to-Vault blog post](https://blog.gitguardian.com/push-to-vault/)
- [Secrets managers integrations](https://docs.gitguardian.com/internal-monitoring/integrate-sources/secrets-managers-integrations/overview)
- [ggscout secret synchronization](https://docs.gitguardian.com/ggscout-docs/sync-secrets)
- [ggscout configuration](https://docs.gitguardian.com/ggscout-docs/configure-ggscout)
- [Remediate incidents](https://docs.gitguardian.com/internal-monitoring/remediate/remediate-incidents)
