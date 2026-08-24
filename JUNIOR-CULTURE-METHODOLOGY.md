# Junior Experience & Senior Culture — Research Method

Updated: 21 August 2026

This layer tracks information that is both important to applicants and unusually easy to distort: ragging reports, senior-issued fresher rulebooks, informal “ground rules”, intro/PDP culture, dress or appearance expectations, access to common areas, senior–junior hierarchy, positive mentoring traditions, disciplinary incidents and the institution’s official response.

Coverage in this build: **all 30 deep-profile colleges plus IMS-BHU as a bonus profile (31 total).**

## Evidence classes

1. **Official institution / government source** — anti-ragging committee/squad orders, hostel rules, prospectuses, official notices and annual reports. These establish the institution’s stated rules or response framework. They do **not** establish that ragging is absent.
2. **Reported disciplinary case / established news source** — used when a traceable report describes a complaint, investigation or punishment. Wording preserves the distinction between allegation, committee finding and final action.
3. **Public student report** — Reddit/forum/student accounts. These are evidence that an experience or claim was publicly reported, not proof that every fresher experienced it and not an institutional finding.

## Rules for sensitive claims

- “No report found” is never converted to “no ragging”.
- A single anonymous account cannot establish campus-wide prevalence.
- Senior rulebooks are marked **reported / unverified** unless the document and provenance are independently established. A screenshot/image can support that a rule-like artifact was publicly circulated without proving authorship or universal enforcement.
- College-admin dress rules are kept separate from senior-imposed fresher rules.
- Reports from another institute with a similar name are rejected.
- Accused students are not named in the public dataset.
- Historical incidents are dated and are not automatically treated as the current culture.
- Conflicting evidence remains visible instead of being averaged into a fake consensus.
- This layer is deliberately excluded from the calibrated comparison score; readers see the evidence and uncertainty directly.

## Fields retained per college

- Current picture
- Rulebook status and summary
- Artifact status, artifact claims and provenance note
- Ground rules
- Intro culture
- Dress / appearance
- Movement / common-area restrictions
- Senior–junior dynamics
- Positive traditions / mentoring
- Dated incidents
- Official response
- Trend
- Unknowns / research gaps
- Confidence
- Last verified
- Source ledger

## Update policy

Because fresher culture can change batch-to-batch, profiles should be rechecked at least once each admission cycle and whenever a new first-year batch reports a rulebook, formal complaint, disciplinary action or meaningful change in policy.


## Public artifact ledger

The explorer contains a dedicated artifact ledger for public rulebook/rule-set material. The current build has three artifact signals: AIIMS Patna, PMCH Patna and AIIMS Bhopal. The ledger links to the public source instead of republishing an entire alleged senior document. This preserves provenance while avoiding the false implication that the document is an official college policy.

An artifact enters this ledger only when the research pass can point to a specific public post containing or explicitly describing the material. Its presence establishes **public circulation of a claim/artifact**, not authorship, authenticity, batch-wide enforcement, or institutional approval.

Audit outputs:

- `audit/junior-culture-v2-2026-08-21.json` — coverage/source summary
- `audit/junior-culture-artifact-ledger-2026-08-21.csv` — traceable artifact inventory
- `audit/junior-culture-research-gaps-v2-2026-08-21.csv` — college-by-college missing evidence

## First 90 Days layer

Added 21 August 2026. The Junior Culture layer now has a separate structured dataset for questions that applicants repeatedly ask but that cannot be inferred safely from an incident count:

- What happens in the first weeks?
- Is the experience different for hostellers and day scholars?
- Are there reported differences for boys and girls?
- What happens when students decline or avoid informal senior interaction?
- Does the hierarchy relax after freshers / later in first year?

Every one of the 31 researched colleges has a First-90-Days record. Unsupported fields remain explicitly **unknown** rather than being back-filled from reputation, state stereotypes or generic medical-college anecdotes.

### Extra evidence rules for First 90 Days

- A prospective student asking “is ragging bad here?” is **not** evidence of what happens there.
- A generic claim about an entire state is not used to populate a college-specific field.
- A second-hand account may be retained as a low-confidence signal, but is labelled as such.
- PG, nursing, dental or allied-health incidents do not establish MBBS fresher culture and are not silently transferred to MBBS fields.
- “Hostellers get more” is recorded only when a college-specific source actually makes that comparison.
- An “opt-out” field records what public accounts say happened after refusal/avoidance; it is not advice to comply with or confront seniors.
- Conflicting current accounts stay visible. MAMC and IMS-BHU are examples where current public sources point in different directions.
- Similar-name artifact leads are quarantined rather than forced onto a profile. The audit includes an ABVIMS/RML Delhi lead excluded because provenance could not be separated confidently from RMLIMS Lucknow.

Evidence levels:

- **Detailed** — source(s) address several First-90-Days fields with meaningful college-specific detail.
- **Partial** — useful current signal exists, but major fields remain missing or the source is second-hand/thin.
- **Official-only** — the institution describes first-month protections or separation, but current lived experience is under-documented.
- **Insufficient** — the research pass did not find enough college-specific evidence to fill the lived-experience fields.

Additional audit outputs:

- `audit/junior-culture-first-90-days-2026-08-21.json`
- `audit/junior-culture-first-90-days-2026-08-21.csv`
- `audit/junior-culture-ambiguous-artifact-leads-2026-08-21.csv`

## Freshers Experience Timeline (v4)

The timeline uses six fixed phases: **Joining/foundation period → Weeks 1–4 → Months 2–3 → Freshers/formal welcome → Rest of first year → Second year**.

A timeline cell is populated only when an existing reviewed source or structured First-90-Days field supports that timing. General statements such as “first year” are **not** silently converted into “Weeks 1–4” or “Months 2–3”. An empty phase is an evidence gap, not evidence that no hierarchy or ragging exists.

Phase evidence grades are deliberately about the **strength of the evidence for that phase**, not a safety score:

- **A** — strong phase-specific evidence such as official/verified material or comparably strong documentation. Official evidence may describe protection systems rather than lived prevalence.
- **B** — detailed current first-hand evidence or multiple/corroborating contemporary signals.
- **C** — isolated, second-hand, older, or partly timed evidence.
- **D** — lead only / provenance unresolved; do not publish as a college fact.
- **GAP** — no phase-specific evidence reconstructed.

## Evidence Inbox and review workflow

The research workflow is separate from the published Junior Culture dataset. New material first enters the Evidence Inbox with provenance fields: college, source type, batch/year, timeline phase, first-hand status, artifact status, claim/research question, evidence grade and reviewer note.

Normal review path: **Incoming → Corroborated → Published**.

Alternative outcomes are **Ambiguous** (quarantined because provenance or attribution is unresolved) and **Rejected**. Browser changes are stored in localStorage and must be exported to JSON for a durable research record. A browser status change does not by itself edit the published Junior Culture dataset.

The `audit/source-ledger.json` file de-duplicates the current Junior Culture and First-90-Days source URLs and records which college(s) and research layer(s) use each source.
