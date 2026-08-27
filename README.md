# The Merit Register V8.4 — Demand 200

# The Merit Register — V8.2 Original Style Export

Generated: 27 August 2026.

## Run locally

Open this folder in VS Code and use **Live Server** on `index.html`, or run:

```bash
python3 -m http.server 8000
```

then open `http://localhost:8000/`. Serving the folder over HTTP is recommended because the site shares candidate/profile state through browser localStorage.

## Main pages

- `index.html` — nationwide Directory / predictor
- `compare.html` — evidence-first 2–4 college comparison: Junior Culture / First 90 Days, counselling, clinical, academics, research, hostel and campus
- `assistant.html` — Choice List Assistant
- `culture.html` — Junior Culture / First 90 Days / timeline / artifacts
- `college.html?id=71` — dynamic college profile (change `id`)
- `preference.html` — saved preference list
- `movement.html` — strict R1-vs-R1 cutoff movement
- `status.html` — current data/research status
- `about.html` — methodology overview
- `inbox.html` — internal evidence-review workspace

## Export architecture

V8 uses shared runtime data layers for the canonical college master, counselling data, college intelligence, and Junior Culture/First 90 Days evidence. Page-specific JavaScript now contains mostly UI/runtime logic, preventing the same evidence block from drifting across Directory, Compare, College Profile, Culture, Assistant and Inbox. The export remains self-contained and does not require external application scripts or font services.

The underlying research/audit files are included under `audit/`, `research/`, `data/`, and `scripts/`.

## Important data rules

- 2026 MCC Round 1 is **provisional**.
- Year-on-year movement is **same round + same category + same quota family only**.
- Quota streams are not merged.
- Junior Culture evidence is descriptive and source-labelled; it is not a numerical ragging score.
- A missing research field means **not reconstructed**, not poor quality.

## Current deep-profile status

30 standardized V8 dossiers; all 30 are marked fresh-source refreshed in the synchronized research queue. Junior Culture covers 200 colleges, with 200 First-90-Days records and timing left blank when phase-specific evidence is insufficient.

## V8 shared data layer

- `js/shared-master-v8.js` — canonical 465-college master
- `js/shared-counselling-v8.js` — shared MCC/cutoff datasets
- `js/shared-intelligence-v8.js` — hostel, clinical, academics, research, campus and finance layers
- `js/shared-culture-v8.js` — 200 Junior Culture + 175 First 90 Days + timing-strict Freshers Timeline

The page bundles load these files before page-specific logic. This replaces multi-megabyte duplication across pages.

## V8.2 interaction update

The global **More** control now uses one shared keyboard/touch-safe dropdown behavior while retaining the original V7 visual language. Compare now places Junior Culture and First-90 evidence near the top and separates official, news and student/community sources instead of collapsing them into a safety score.

### V8.4 profile update
College profiles now surface a compact evidence-first Junior Culture summary near the top: the current conclusion, why it exists, confidence/recency, source mix, First-90/timeline coverage, official evidence, lived/reporting evidence, unresolved gaps, and direct sources. The full field-by-field Junior Culture section remains later in each profile.
