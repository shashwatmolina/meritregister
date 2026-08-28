# The Merit Register — V9.5 Concise by Default

V9.5 introduces progressive disclosure across the main student flows. Default views show decision-relevant summaries; detailed evidence, methodology, tables, and scoring internals remain available on demand.

# The Merit Register — V9.4 First-Time Friendly

V9.4 is a first-time-user simplification release. It keeps the V9.3 alias-aware search and the V9.2 visual identity, but collapses the first visit into three obvious tasks: **search a college, check what your rank can get, or compare your options**. The primary navigation is reduced to Home, Colleges, Compare, My List and More; planning/research tools remain available without competing for attention. Research and counselling logic are unchanged.

## V9.4 First-Time Friendly — 28 Aug 2026

- Rebuilt the homepage around one large college search and three plain-language starting actions.
- Moved rank checking into its own section instead of crowding the landing screen.
- Reduced primary navigation to Home · Colleges · Compare · My List · More.
- Grouped More into Planning, Research and About.
- Removed repeated workflow steppers from core pages; replaced them with one contextual next-step prompt.
- Simplified mobile quick navigation to Home · Search · My List.
- Preserved alias search across all 465 colleges.
- No changes to cutoffs, evidence conclusions, or ranking logic.

## V9.3 Alias Search — 28 Aug 2026

- Shared alias-aware college search across global search, Directory, Compare, Shortlist Builder, Junior Culture, Cutoff Trends, First-Year Timeline, Assistant and Evidence Inbox.
- Generated acronym aliases for all 465 canonical colleges.
- Curated common aliases for high-frequency short forms such as IGIMS, UCMS, VMMC, ABVIMS, MAMC, JIPMER, KGMU, PMCH, NMCH and CAPFIMS.
- Curated aliases rank above ambiguous automatically generated acronyms.
- Location-qualified aliases such as `GMC Patiala`, `AIIMS Jodhpur`, `VMMC Solapur` are generated where applicable.
- Global search now works from About and Data Status as well as the data-heavy pages.

## What changed
- Universal college search from every page (button or `/` keyboard shortcut).
- Plain-language navigation: Shortlist Builder, Final Choices, Data Quality, First-Year Timeline.
- Four-step counselling workflow on core product pages.
- Short page-level guidance explaining what each tool is for.
- Advanced research tools are clearly marked as advanced.
- Simplified filter labels and mobile navigation wording.
- No changes to research conclusions, cutoff data, or scoring logic.

# V9.2 Theme-Integrated UX — Visual integration & usability refinement (28 Aug 2026)

- Fixed Choice Filling crashes when browser storage is unavailable or blocked.
- Fixed stale preference-order state so removed/invalid colleges cannot survive invisibly in Choice Filling.
- Fixed Timeline Explorer deep-links such as `timeline.html?college=<id>` so college-ID links resolve correctly.
- Fixed misleading 2025→2026 movement text when the current best route is DU/IP/other conditional quota; movement is shown only for genuinely comparable AIQ/Open streams.
- Added regression coverage for corrupted storage, stale order normalization, timeline ID deep-links and route-comparison labeling.
- No counselling/research data changed in this release candidate.

# The Merit Register — V9 Beta

Generated: 28 August 2026.

V9 Beta freezes the major feature set and hardens the end-to-end counselling workflow: **Find → Compare → My List → Decision Mode → Choice Filling**. It adds repeatable candidate-scenario regression tests, structured local issue reporting, beta onboarding, release-metadata cleanup, and a production package that prioritizes current audits over historical build clutter. The research datasets are unchanged: 465 canonical colleges, 200 Junior Culture profiles, 200 First-90 records, 100 A–C supported timeline cells, and 498 unique evidence URLs.

## Beta rules

- Reachability annotates a choice; it never changes preference order automatically.
- Conditional quota streams appear only when the candidate explicitly enables the relevant eligibility.
- Missing cutoff/evidence data remains **Unknown** rather than being treated as ineligible, unsafe, or poor quality.
- “Report data issue” saves a structured report locally in the browser; nothing is transmitted automatically.
- Run `python3 scripts/beta-scenario-tests.py` before shipping any counselling-data update.

## V9 regression scenarios

The bundled suite currently passes **10/10** scenarios, including AIR 232 General with default AIQ/Open routes, Delhi DU/IP eligibility toggles, AIR 8000 OBC broad coverage, unknown-cutoff handling, and preservation of a 30-choice preference list. See `audit/v9-beta-scenario-results-2026-08-28.json`.

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
- `evidence.html` — evidence completeness explorer + research-gap queue
- `college.html?id=71` — dynamic college profile (change `id`)
- `preference.html` — saved preference list
- `movement.html` — strict R1-vs-R1 cutoff movement
- `status.html` — current data/research status
- `about.html` — methodology overview
- `inbox.html` — internal evidence-review workspace

## Export architecture

V8 uses shared runtime data layers for the canonical college master, counselling data, college intelligence, and Junior Culture/First 90 Days evidence. Page-specific JavaScript now contains mostly UI/runtime logic, preventing the same evidence block from drifting across Directory, Compare, College Profile, Culture, Assistant and Inbox. The export does not require external application scripts. Typography uses Google Fonts when available and falls back to the bundled CSS font stacks when offline.

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
- `js/shared-culture-v8.js` — 200 Junior Culture + 200 First 90 Days + timing-strict Freshers Timeline

The page bundles load these files before page-specific logic. This replaces multi-megabyte duplication across pages.

## V8.2 interaction update

The global **More** control now uses one shared keyboard/touch-safe dropdown behavior while retaining the original V7 visual language. Compare now places Junior Culture and First-90 evidence near the top and separates official, news and student/community sources instead of collapsing them into a safety score.

### V8.3 profile update
College profiles now surface a compact evidence-first Junior Culture summary near the top: the current conclusion, why it exists, confidence/recency, source mix, First-90/timeline coverage, official evidence, lived/reporting evidence, unresolved gaps, and direct sources. The full field-by-field Junior Culture section remains later in each profile.


## V8.5 Evidence Explorer

V8.5 added an evidence-completeness layer over the 200 researched Junior Culture profiles. `evidence.html` calculates source diversity, independent-source count, verification recency, First-90 coverage and timing-strict timeline coverage. It also generates a research-priority queue from evidence gaps.

The **coverage index (0–100)** is a measure of evidence breadth only. The **research-priority score** rises when a profile has no direct sources, lacks student/community evidence, is single-source or official-only, has thin First-90 coverage, or lacks phase-specific timeline evidence. Neither score is a safety/ragging score.

After the V8.14 residence-deepening pass: 0 researched profiles have no direct source attached, 24 have no student/community source, 4 are official-only, and 41 are single-source. 176/200 profiles now carry student/community evidence and 135/200 have at least two source classes. First-90 residence structure was deepened for Wayanad, Kasaragod, ESIC Andheri, GMC Nashik, Barmer, Bhilwara, Gauhati, Azamgarh, KCGMC Karnal, AIIMS Delhi, AIIMS Madurai and the new GMC Mumbai profile without forcing unsupported phase timing. Historical incidents, current lived reports, generic campus context, residence structure, and timing claims remain separate evidence layers. See `audit/v8-14-first90-residence-deepening-2026-08-27.json`.


## V8.16 phase-timing deepening II — 27 Aug 2026

The 200-profile research set remains unchanged. V8.16 adds defensible phase timing for Bhima Bhoi Balangir, HIMS Hassan, SSMC Rewa, Madurai Medical College and Coimbatore Medical College, while adding legacy first-year structure at BJMC Ahmedabad without presenting it as a current 2026 prevalence finding. The strict Freshers Timeline now has **79 college records**, **83 A–C publishable phase cells**, **4 D lead-only cells**, and **1,113 blank/explicit-GAP cells** across 1,200 possible profile-phase cells. **60 colleges** have at least one A–C supported phase. Explorer metrics: **180/200** profiles with student/community evidence, **137/200** with 2+ source classes, **20** without student/community evidence, **4** official-only, **39** single-source, and **149** with thin First-90 coverage. The combined Culture / First-90 / Timeline ledger contains **487 unique source URLs**. See `audit/v8-16-phase-timing-deepening-2026-08-27.json`.

## V8.15 phase-timing deepening — 27 Aug 2026

The 200-profile research set is unchanged. The strict Freshers Timeline now contains **75 college records** and **81 A–C publishable phase cells**, plus **4 D lead-only cells**; **1,115** of the 1,200 possible profile-phase cells remain blank or explicit evidence gaps. New phase-specific additions cover NAMO Silvassa first-day senior contact, JIPMER early intro-only context, Saharanpur immediate post-joining allegations, TNMC/Nair's official 2026–27 first-MBBS girls' hostel restriction, AIIMS Nagpur first-year-to-second-year room progression, and GMC Srinagar first-year hostel-allotment structure. The canonical combined Culture / First-90 / Timeline ledger now contains **476 unique source URLs**. **152** profiles still have fewer than two supported First-90 dimensions. See `audit/v8-15-phase-timing-deepening-2026-08-27.json`.


## V8.17 Timeline Gap Explorer

- Adds `timeline.html` / `js/timeline.js` / `css/timeline.css` as a dedicated phase-coverage explorer.
- Filters by missing/supported phase, state, current-vs-historical timing and research queue.
- Adds a compact six-phase coverage strip to every evidence-backed college profile.
- Normalizes legacy timeline keys (`joiningArrival`, `weeks2to4`, `laterFirstYear`) into the canonical six-phase schema. This recovered five A–C cells that were previously invisible to renderers/validators.
- Canonical timing state after normalization: 88 A–C cells, 4 D lead-only cells, 1,108 GAP cells; 62/200 colleges have at least one A–C phase.
- Timeline priority is an evidence-gap metric, never a safety/ragging score.


## V8.18 Phase Queue Deepening

V8.18 adds six defensible A–C phase cells from the phase-specific queue: BRD Gorakhpur (official fresher-party phase), GMC Barmer and BJMC Ahmedabad (reported fresher-party phase), RIMS Ranchi and GMC Haldwani (current first-year lived/context signals), and GMC Kasaragod (first-cohort structure: no older same-college MBBS batch during its first year). Canonical timeline state: **94 A–C cells, 4 D cells, 1,102 gaps; 68/200 colleges with at least one A–C phase; 493 unique evidence URLs**.

## V8.19 Sparse Phase Deepening III

The 200-profile research set remains unchanged. V8.19 adds phaseable evidence for AIIMS Rajkot, AIIMS Mangalagiri, Government Doon Medical College, Darbhanga Medical College and BPS Government Medical College for Women. The strict canonical timeline now contains **100 A–C publishable phase cells**, **4 D lead-only cells**, and **1,096 GAP cells** across 1,200 possible cells; **73/200 colleges** have at least one A–C supported phase. Phase coverage is now: Joining **31**, Weeks 1–4 **33**, Months 2–3 **6**, Freshers **8**, Rest of Year 1 **16**, Year 2 **6**. The combined Culture / First-90 / Timeline ledger contains **498 unique URLs**.

## V8.22 Choice-Filling Simulator
Adds `choice.html`: a counselling preference simulator that keeps desirability separate from reach, annotates My List with current 2026 R1 quota-aware reach, shows category-specific 2025 round references, supports manual ordering, list checks, and copy/export.

## V8.23 — Polish & Reliability (28 Aug 2026)
- Added a five-step Find → Compare → My List → Decision → Choice workflow strip on product pages.
- Added mobile quick navigation, larger touch targets, focus-visible states and a keyboard skip link.
- Directory now shows active-filter count and a one-click Clear filters action.
- My List / preference-order browser storage is normalized so removed shortlist items cannot linger invisibly in the saved order.
- Added browser-storage and failed-local-asset warnings rather than silently degrading.
- Added consistent shortlist feedback/toasts and a clearer three-step Choice Filling explanation.
- Fixed stale manifest/status/version metadata; research datasets and decision scoring are unchanged.