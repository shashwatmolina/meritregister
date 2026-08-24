# The Merit Register — V7 VS Code Export

Generated: 22 August 2026.

## Run locally

Open this folder in VS Code and use **Live Server** on `index.html`, or run:

```bash
python3 -m http.server 8000
```

then open `http://localhost:8000/`. Serving the folder over HTTP is recommended because the site shares candidate/profile state through browser localStorage.

## Main pages

- `index.html` — nationwide Directory / predictor
- `compare.html` — deep comparison, V7 dossiers
- `assistant.html` — Choice List Assistant
- `culture.html` — Junior Culture / First 90 Days / timeline / artifacts
- `college.html?id=71` — dynamic college profile (change `id`)
- `preference.html` — saved preference list
- `movement.html` — strict R1-vs-R1 cutoff movement
- `status.html` — current data/research status
- `about.html` — methodology overview
- `inbox.html` — internal evidence-review workspace

## Export architecture

The latest working previews from the research build were converted into VS-Code-friendly HTML + page-specific CSS/JS bundles. Runtime datasets are embedded inside the page JS bundles so this export is self-contained and does not depend on the earlier chat workspace.

The underlying research/audit files are included under `audit/`, `research/`, `data/`, and `scripts/`.

## Important data rules

- 2026 MCC Round 1 is **provisional**.
- Year-on-year movement is **same round + same category + same quota family only**.
- Quota streams are not merged.
- Junior Culture evidence is descriptive and source-labelled; it is not a numerical ragging score.
- A missing research field means **not reconstructed**, not poor quality.

## Current deep-profile status

30 standardized V7 dossiers; 10 have completed the fresh-source refresh, and 20 are queued for the same pass.
