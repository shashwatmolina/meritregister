## V9.2 Theme-Integrated UX — 2026-08-28

- Reworked the V9.1 platform layer to use the native paper/stamp/mono visual system rather than a separate SaaS-like component style.
- Restyled universal search as a native navigation control and ledger panel.
- Replaced boxed workflow cards with a restrained editorial stepper.
- Reworked homepage onboarding into ledger columns and removed redundant floating navigation.
- Integrated advanced-tool labels, mobile quick navigation, and More-menu styling with the established theme.
- No counselling logic, scoring, cutoff data, or research evidence changed.

## V9.1 Platform UX candidate — 2026-08-28
- Added universal global college search across all pages.
- Simplified tool names and navigation language.
- Added four-step counselling workflow and contextual page guidance.
- Marked research-heavy pages as advanced.
- Added responsive platform shell without changing the established visual identity.
- Underlying V9.0 RC data and logic unchanged.

# V9.0 RC — Bug-fix & regression hardening (28 Aug 2026)

- Fixed blocked/private-storage crashes in Choice Filling and Timeline Explorer.
- Normalized Choice Filling against the live shortlist before rendering, removing stale/invalid saved IDs and appending newly shortlisted colleges deterministically.
- Fixed Timeline Explorer `?college=<id>` deep-links by resolving canonical IDs to college names and allowing ID search.
- Prevented route-mismatch movement claims: 2025→2026 movement is shown only for comparable AIQ/Open streams; conditional routes now state when historical movement is not loaded.
- Expanded regression tests around these reproduced failures.
- Research and cutoff datasets unchanged from V9 Beta.

# V9 Beta — Beta Hardening (28 Aug 2026)

- Froze major features on top of V8.23.
- Added structured, local-only **Report data issue** workflow on every page.
- Added a first-visit V9 Beta orientation note on the homepage.
- Added `scripts/beta-scenario-tests.py` with repeatable counselling regression scenarios.
- Added a clean beta production packaging policy: current audits are surfaced; old build-validation clutter is excluded from the release ZIP.
- Research/cutoff datasets are unchanged from V8.23.

# V8.20 — Decision Mode — 28 Aug 2026

- Added the personalized Decision Mode / Shortlist Builder.
- Added user-controlled dimension weights and presets.
- Added explicit evidence-coverage accounting so missing data never becomes a zero score.
- Kept counselling reach outside the fit calculation; 2026 R1 reach can filter/display results but does not reorder true preference.
- Junior Culture is used only as an explicit evidence gate and visible signal, never as a numeric safety score.
- Added an explicit browser-local action to apply the resulting order to My List.
- Linked Decision Mode from the site More menu, homepage tools, and My List.
- Research dataset unchanged from V8.19.

# V8.19 — Sparse Phase Deepening III (27 Aug 2026)

- Continued the phase-specific queue with emphasis on Months 2–3, Freshers/formal welcome, and late-first-year transitions.
- AIIMS Rajkot: official post-admission Freshers Day plus a separate current student report placing the senior-funded gala freshers event near the next batch and alleging rules persist until then.
- AIIMS Mangalagiri: official institute magazine documents senior-organized MBBS fresher celebrations.
- Government Doon Medical College: official late-Oct 2025 admission chronology + substantiated 12 Jan 2026 ragging finding supports a Months 2–3 cell.
- Darbhanga Medical College and BPS Sonepat: direct/verified MBBS reviews support recurring Freshers cells.
- Canonical timeline: **100 A–C cells, 4 D cells, 1,096 GAP cells; 73/200 colleges with at least one A–C phase**.
- Combined Culture / First-90 / Timeline ledger: **498 unique URLs**.

# V8.18 — Phase Queue Deepening (27 Aug 2026)

- Added six A–C timeline cells from the phase-specific research queue.
- BRD Gorakhpur: official fresher-party timing; GMC Barmer and BJMC Ahmedabad: recurring fresher-party evidence.
- RIMS Ranchi and GMC Haldwani: current first-year lived/context timing, explicitly lower-confidence.
- GMC Kasaragod: first-cohort structure showing no older same-college MBBS batch during its first year.
- Canonical timeline: 94 A–C, 4 D, 1,102 GAP; 68 colleges with at least one A–C phase.
- Combined evidence ledger: 493 unique URLs.

# V8.17 — Timeline Gap Explorer (27 Aug 2026)

- Added a dedicated phase-by-phase Timeline Gap Explorer.
- Added missing-phase, current/historical timing, zero-timing, strong-evidence/zero-timing and density filters.
- Added six-phase coverage strips to individual college evidence summaries.
- Added phase-specific research queues and audit artifacts.
- Fixed legacy timeline-schema drift: `joiningArrival` → `arrival`, `weeks2to4` → `weeks1_4`, `laterFirstYear` → `restFirstYear`.
- Canonical timeline after normalization: 88 A–C cells, 4 D cells, 1,108 GAP cells across 1,200 possible cells; 62 colleges have at least one A–C phase.
- No visual-system redesign; V7/V8 original styling preserved.

## V8.16 — 27 Aug 2026

- Phase-timing deepening II: actual runtime moves from V8.15's **79** A–C cells to **83**, with **4 D** cells and **1,113 gaps**.
- Timeline records **75 → 79**; colleges with at least one A–C supported phase **57 → 60**.
- Added phaseable evidence for Bhima Bhoi Balangir, HIMS Hassan, SSMC Rewa, Madurai Medical College and Coimbatore Medical College.
- Added legacy BJMC Ahmedabad first-year accommodation/intro context without treating it as current 2026 prevalence.
- Explorer metrics now **180/200** with student/community evidence, **137/200** with 2+ source classes, **20** with no student/community source, **4** official-only, **39** single-source and **149** thin First-90.
- Canonical combined source ledger: **487 unique URLs**.
- Corrected V8.15 documentation drift: its runtime had **79**, not 81, A–C cells.

# V8 changelog

## V8.15 — 27 Aug 2026

- Phase-timing deepening: Freshers Timeline records **69 → 75** and A–C supported cells **73 → 81**.
- Adds phase-specific evidence for NAMO Silvassa, JIPMER Puducherry, Saharanpur, TNMC/Nair, AIIMS Nagpur and GMC Srinagar.
- Adds current 2026–27 official TNMC first-MBBS girls' hostel restriction and current AIIMS Nagpur hostel progression to First-90 structure.
- Canonical combined Culture / First-90 / Timeline ledger: **476 unique URLs**.
- First-90 thin-coverage pool: **152/200** profiles with fewer than two supported dimensions.
- No new college profiles and no unsupported timing inference.

# The Merit Register — V8 change log

## V8.14 — 27 Aug 2026

- Continued First-90 reconstruction without expanding beyond 200 researched colleges or changing the V7 visual system.
- Student/community coverage increased to **176/200** profiles; profiles with 2+ source classes increased to **135/200**.
- Official-only profiles fell to **4** and single-source profiles to **41**.
- First-90 thin coverage fell to **154** profiles; **21** profiles now have 3+ supported First-90 dimensions.
- Added directly supported residence/early-course structure for Wayanad, Kasaragod, ESIC Andheri, GMC Nashik, Barmer, Bhilwara, Gauhati, Azamgarh, KCGMC Karnal, AIIMS Delhi, AIIMS Madurai and the new GMC Mumbai profile.
- Added current/direct lived evidence for MP Shah Jamnagar, NDMC/Hindu Rao and GMC Tiruppur; generic campus context remains distinct from ragging-prevalence evidence.
- Corrected the new GMC Mumbai identity so Grant/JJ evidence is not misattributed to the 2024 L.T. Marg/GT Hospital college.
- Canonical combined Culture / First-90 / Timeline ledger now contains **473 unique source URLs**.
- Canonical Freshers Timeline grading is **71 A–C**, **4 D**, **1,125 GAP/blank** cells across 1,200 possible phase cells.

# V8.10 — Targeted lived-evidence fill (27 Aug 2026)

- Continued the highest-priority official-only queue without expanding beyond 200 colleges.
- Official-only profiles reduced from **40 to 35**.
- Profiles with student/community evidence increased from **138 to 143**.
- Profiles with 2+ source classes increased from **95 to 100**.
- Single-source profiles reduced from **66 to 61**.
- Added current/lived evidence for GMC Bharatpur, GMC Kollam/Parippally, GMKMC Salem, SJMCH Puri and Stanley Medical College.
- Puri now has two explicit 2024 MBBS reports describing a ragging-free environment; Bharatpur and Stanley now combine current lived senior-junior context with older formal/historical records.
- Generic campus/hostel reviews remain labelled as lived context rather than automatically becoming ragging-prevalence evidence.
- Canonical culture/First-90/timeline ledger now contains **425 unique source URLs**.

# V8.9 — High-value lived-evidence fill (27 Aug 2026)

- Continued the official-only repair queue without expanding beyond 200 colleges.
- Official-only profiles reduced from **52 to 40**.
- Profiles with student/community evidence increased from **127 to 138**.
- Profiles with 2+ source classes increased from **83 to 95**.
- Single-source profiles reduced from **77 to 66**.
- Added meaningful college-specific lived or disciplinary evidence for BSA Rohini, AIIMS Nagpur, BPS Sonepat, Mandya, CIMS Bilaspur, GMC Nahan, Goa Medical College, Darbhanga Medical College, GMC Hamirpur, ESIC Bangalore, ESIC Ludhiana and GMC Chittorgarh.
- Generic current MBBS reviews are retained as lived campus context only unless they make a senior-junior/ragging-specific claim. Historical cases remain historical; rumor-level community claims remain labelled unverified.
- Canonical culture/First-90/timeline ledger now contains **418 unique source URLs**.
- First-90 and timeline support counts were not inflated: **71 A–C supported phase cells + 4 D lead-only cells** remain across 1,200 possible cells.
- No visual redesign.

# V8.8 — Official-only lived-evidence fill (27 Aug 2026)

- Targeted the V8.7 official-only queue rather than expanding beyond 200 colleges.
- Official-only profiles reduced from **63 to 52**.
- Profiles with student/community evidence increased from **116 to 127**.
- Profiles with 2+ source classes increased from **72 to 83**.
- Single-source profiles reduced from **85 to 77**.
- Added current/college-specific lived evidence for Sagore Dutta, Government Erode, GMC Baramati, ESIC Varanasi, GMC Kannur/Pariyaram, SKIMS Bemina, GMC Chamba, BIMS Belagavi, ABVIMS/RML, AIIMS Jodhpur and AIIMS Rishikesh.
- Added one new First-90 residence-mode dimension for Sagore Dutta and current first-weeks/residence-mode evidence for AIIMS Rishikesh. Unsupported timing remains blank.
- Re-ran the canonical timeline counter: **71 A–C supported cells + 4 D lead-only cells** across 1,200 possible cells. The earlier public 73-cell figure was stale; V8.8 synchronizes status to the runtime count.
- No visual redesign.

## V8.7 — zero-source fill (27 Aug 2026)
- Targeted the remaining 16 no-direct-source profiles from the V8.6 queue.
- Zero-direct-source profiles reduced from 16 to 0.
- Added current formal, historical complaint, and carefully labelled lived-context sources; context-only reviews are not treated as ragging prevalence evidence.
- Student/community-covered profiles now 116; 72 profiles have 2+ source classes.


## V8.6 — targeted evidence-fill pass (27 Aug 2026)

- Worked the V8.5 top research-gap queue before expanding beyond 200 colleges.
- Added direct evidence to CIMS Bilaspur, Hassan, Thrissur, Kasaragod, GMC Chhatrapati Sambhajinagar, Fakir Mohan Balasore, ESIC Ludhiana, GMC/ESI Coimbatore, GMC Thiruvallur, Madurai and GMC Haridwar.
- Added a November 2024 first-year ragging/disciplinary record for GMC Barmer and historical national complaint records for GMC Bharatpur.
- Zero-direct-source profiles reduced from 29 to 16. Student/community-covered profiles increased from 105 to 107.
- Formal safeguards, historical cases, PG allegations and MBBS lived evidence remain explicitly separated. No unsupported First-90 timing was added.

# The Merit Register — V8 Canonical / V8.4 Demand 200

Generated: 27 August 2026

## Product / architecture

- Canonicalized the site around four shared runtime data layers: master colleges, counselling, decision intelligence, and Junior Culture / First 90 Days.
- Removed duplicated multi-megabyte data declarations from page bundles; total JavaScript fell by about 71% versus the supplied V7 export.
- Added a shared visual override across all ten pages and removed external font dependencies.
- Replaced the homepage stylesheet with the cleaner standalone-index design while retaining the existing directory, predictor, compare tray and modal behavior.
- Added accessible labels to the main Directory filters and normalized main navigation labelling.

## Research / evidence

- V8 canonical stage expanded Junior Culture from 150 to 175 profiles and First 90 Days to 175 records.
- Kept the Freshers Timeline timing-strict: no phase timing was invented for the 25 new profiles.
- Corrected the timeline accounting bug that had treated explicit `GAP` cells as supported evidence.
- Canonical V8 timeline: 71 publishable A–C cells, 4 lead-only D cells, and 975 blank/explicit-GAP cells across 1,050 possible cells.
- Rebuilt the source ledger from the canonical runtime: 329 unique URLs (144 official, 38 news, 147 student/community).
- Repaired the Hamirpur formal-safeguard source link and directly linked SJMCH Puri's official anti-ragging activity notice index.
- Downgraded source-empty Bharatpur and Thiruvallur extension claims to explicit evidence gaps rather than retaining unsupported reassurance/formal-control language.
- Synchronized the 30-profile deep-research queue and progress JSON to the actual 30-entry refreshed research object.

## Validation

- 10/10 HTML pages present.
- No missing local asset/page references.
- No duplicate HTML IDs found.
- No external stylesheet or application-script dependencies remain.
- All 12 JavaScript files pass `node --check`.
- Shared runtime data evaluates to 465 colleges, 30 deep refresh profiles, 200 Junior Culture profiles, 200 First-90-Days profiles and 69 Freshers Timeline records.

See `audit/v8-canonical-validation-2026-08-26.json` for the machine-readable validation report.

## V8.1 visual rollback — 26 Aug 2026
- Removed the global `site-v8.css` redesign layer after visual review.
- Restored all ten page stylesheets byte-for-byte to the original V7 visual system.
- Restored the original Google Fonts links on the pages that used them.
- Retained the V8 shared data architecture, 200 Junior Culture profiles, evidence/status corrections, accessibility labels, and runtime/data deduplication.
- No intentional redesign remains in V8.1; visual continuity with V7 is the release rule.


## V8.2 — header polish + evidence-first Compare (26 Aug 2026)
- Kept the V7/original visual system.
- Normalized the `More` header control across all pages and added keyboard/touch-safe open/close behavior.
- Promoted Junior Culture + First 90 Days to the top of Compare.
- Added source-type separation (official / news / student-community), confidence, recency, First-90 coverage, evidence gaps and expandable source drawers.
- Added quick-jump navigation for culture, counselling, clinical, academics, research, hostel and campus sections.
- No ragging/safety score was added; missing evidence remains missing.

## V8.4 — Evidence-first college profiles · 27 Aug 2026

- Added a compact Junior Culture evidence summary near the top of every researched college profile.
- The summary answers “Why this assessment?” before exposing detailed fields.
- Separates official/institutional evidence from lived/student/news reporting.
- Shows confidence, last verification, source mix, First-90 coverage, timed-phase coverage, dated-incident count and explicit unknowns.
- Added an expandable source drawer without replacing the full Junior Culture section lower on the page.
- Preserved the original V7 visual system and the V8.2 navigation/Compare work.
- No ragging/safety score is introduced; absence of evidence is explicitly not interpreted as safety.


## V8.4 — Demand-ranked 200 + evidence filters (27 Aug 2026)
- Expanded Junior Culture and First 90 Days from 175 to 200 profiles using the next 25 unresolved colleges by 2026 General Round-1 demand.
- Added Directory filters for culture source type/strength, Freshers coverage and verification recency.
- Preserved the original V7 visual system.
- Added current documented Kakatiya 2026 disciplinary evidence, a reassuring Kanyakumari lived report, and multiple formal/historical anti-ragging records while keeping unsupported colleges explicitly unknown.


## V8.5 — Evidence Explorer + research-gap engine (27 Aug 2026)
- Added `evidence.html`, a dedicated explorer for evidence completeness across all 200 researched Junior Culture profiles.
- Added a 0–100 **evidence coverage index** based only on source diversity/count, verification recency, First-90 breadth and timing-strict timeline coverage.
- Added a separate **research-priority score** that rises for missing, one-sided, single-source, official-only, old or timing-thin evidence. It is explicitly not a safety score.
- Added gap presets: no direct source, no student/community source, official-only, single-source, no timeline, thin First-90, no 2026 source and conflicting/mixed evidence.
- Added Directory sorts for evidence coverage and research gaps, plus compact evidence micro-indicators on researched rows.
- Added a machine-readable gap-engine audit and a top-30 prioritized research queue CSV.
- Preserved the V7 visual system; no global redesign.


## V8.11 — 27 Aug 2026
- Deepened lived evidence for Palakkad, Faridkot, VIMSAR Burla, Theni, AIMS Mohali, Dharmapuri, KAP Trichy, GMC Alwar and Thoothukudi.
- Added one supported First-90 residence-separation dimension for KAP Trichy.
- Preserved historical/current evidence as separate time layers rather than overwriting either.


## V8.12 — 27 Aug 2026
- Continued high-value lived-evidence filling without expanding beyond 200 profiles.
- Official-only profiles: 29 → 22; student/community coverage: 149 → 156; 2+ source classes: 106 → 113; single-source: 53 → 50.
- Added direct MBBS/fresher evidence for GMCH Chandigarh, GMC Srinagar, GMC Manjeri, GMC Aurangabad/Sambhajinagar, NAMO Silvassa, SNMC Agra and AIIMS Jammu/Vijaypur.
- Added three strictly supported First-90 fields: GMC Srinagar residence allocation, NAMO first-day contact, SNMC Agra first-year boys' hostel allocation.
- Preserved historical/current separation and did not infer safety from generic positive reviews.

## V8.21 — User-friendly pass (28 Aug 2026)
- Simplified primary navigation and homepage entry points.
- Added mobile-friendly filter drawer, My List count, answer-first profile summary, friendlier Decision Mode onboarding, and consistent My List wording.
- Research datasets and evidence methodology unchanged from V8.20.

### V8.22 — Choice-Filling Simulator (2026-08-28)
- Added `choice.html` and `js/choice.js`.
- Current 2026 R1 reach is quota-aware and never used to reorder preferences.
- Added 2025 R1/R2/R3 historical reference selector, list checks, reorder controls, and copy/export.
- Added Choice Filling to primary navigation.

### V8.23 — Polish & Reliability (2026-08-28)
- Feature freeze: no new college/research/scoring feature introduced.
- Added product workflow strip and mobile quick navigation.
- Added active Directory filter count + Clear filters.
- Added shortlist/preference-order storage normalization and browser-storage failure warning.
- Added consistent My List feedback, skip-to-content, focus-visible/touch-target improvements and failed-asset warning.
- Added three-step Choice Filling guidance and clearer cross-links between shortlist/choice tools.
- Synchronized project manifest, Status and release metadata to V8.23.
