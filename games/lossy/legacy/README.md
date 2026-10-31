# Legacy: the Python range

The first version of LossyInc Range, before it became a single-page game. The game in `index.html` doesn't use any of this.

- `engine/gen_company.py`, `scenarios.py`, `world.py`, `state.py`: generate a fictional company (business lines, headcount, people, Terraform-style infrastructure with machine-state flags) and stage secrets-leak scenarios turn by turn, with markdown saves.
- `engine/mockapi.py`: a local HTTP mock of the GitGuardian public API, shaped by the OpenAPI spec (`python3 mockapi.py`, port 8787).
- `engine/rangectl.py`: the command-line driver (`new-start`, `start`, `stop`, `next-turn`, `act …`).
- `engine/fetch_reference.py`, `build_api_ref.py`: download GitGuardian's OpenAPI spec and docs into `reference/` (about 16 MB; not committed).
- `engine/bridge.py`, `console.py`: an earlier browser UI.

`RUNBOOK.md` describes how that version was operated. It never runs `ggshield` or contacts a real GitGuardian workspace; ggshield output there is simulated text too.
