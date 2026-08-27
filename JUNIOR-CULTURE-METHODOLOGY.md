# Junior Experience & Senior Culture — Research Method

Updated: 27 August 2026

This layer tracks information that is both important to applicants and unusually easy to distort: ragging reports, senior-issued fresher rulebooks, informal “ground rules”, intro/PDP culture, dress or appearance expectations, access to common areas, senior–junior hierarchy, positive mentoring traditions, disciplinary incidents and the institution’s official response.

Coverage in this build: **200 structured Junior Culture profiles.** The evidence layer combines the national baseline, regional retrospectives and demand-ranked expansions through the 175→200 pass completed on 27 Aug 2026.

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

## Evidence-graded current-signal dashboard (v5)

Added 25 August 2026. Each researched college can now carry a compact **current evidence signal** alongside the narrative profile. It is deliberately not a numerical ragging score. The dashboard separates:

- overall signal label and evidence confidence
- evidence window / recency
- hostel or residence-mode evidence
- grooming / dress-control signal
- social-coercion or boycott signal
- physical-safety evidence
- administrative enforcement / complaint response
- the mix of source types supporting the signal

Signal tones are **Concern**, **Watch**, **Mixed/changing**, and **Insufficient current evidence**. These are research-status labels, not institutional guilt findings and not predictions that a particular student will be harmed.

### Complaint-register rule

The National Anti-Ragging public complaint register is used as a **formal complaint-history source**. A row establishes that a complaint was recorded with the listed date, status and classification. It does **not** by itself establish that the allegation was proved, that a death/suicide was caused by ragging, or that the complaint describes present-day campus prevalence. Fields such as “Serious” or “Victim Committed Suicide” are reproduced only as register metadata with an explicit causation caveat.

### Bihar + Uttar Pradesh retrospective pass — 25 Aug 2026

The first regional retrospective combines indexed Reddit/student material with official anti-ragging pages, institutional SOPs, NHRC/Parliament records and the national complaint register. Target colleges: **AIIMS Patna, BMIMS Pawapuri, ESIC Bihta, IGIMS Patna, NMCH Patna, PMCH Patna, RMLIMS Lucknow, GSVM Kanpur, IMS-BHU, KGMU and MLN Prayagraj.**

Key methodological result: the pass intentionally produces different outputs for different evidence situations. IGIMS has a repeated current ritual/coercion signal; RMLIMS has a detailed 2025 public rule-set signal plus a more reassuring 2026 student follow-up; GSVM and MLN have stronger historical/formal records than current firsthand evidence; ESIC Bihta remains insufficiently evidenced rather than being declared “safe”.

Audit output: `audit/junior-culture-bihar-up-retrospective-2026-08-25.json`.

## Update policy

Because fresher culture can change batch-to-batch, profiles should be rechecked at least once each admission cycle and whenever a new first-year batch reports a rulebook, formal complaint, disciplinary action or meaningful change in policy.


## Public artifact ledger

The explorer contains a dedicated artifact ledger for public rulebook/rule-set material. The current build has four artifact signals: AIIMS Patna, PMCH Patna, AIIMS Bhopal and RMLIMS Lucknow. The ledger links to the public source instead of republishing an entire alleged senior document. This preserves provenance while avoiding the false implication that the document is an official college policy.

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

Every one of the 150 researched colleges has a First-90-Days record. Unsupported fields remain explicitly **unknown** rather than being back-filled from reputation, state stereotypes or generic medical-college anecdotes.

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


## 26 Aug 2026 expansion
Junior Culture coverage now includes 52 researched colleges. The new pass adds Delhi, Rajasthan and selected AIIMS profiles. A profile may intentionally be labelled **current evidence insufficient** when official prevention material exists but current lived-experience evidence does not. Serious peer-harassment cases are kept distinct from senior-to-fresher ragging unless the evidence supports that classification.


## 26 Aug 2026 — AIIMS network continuation

Junior Culture coverage expanded from **52 to 60 researched profiles** with AIIMS Bibinagar, Deoghar, Rewari, Mangalagiri, Guwahati, Gorakhpur, Vijaypur/Jammu and Madurai.

Key method points:
- An **inaugural cohort** can support a structural conclusion (no older MBBS seniors) but not a long-term culture prediction.
- Institution statements such as “ragging-free campus” are treated as **formal-position/prevention evidence**, not proof of zero informal incidents.
- Rumor-level college attribution (for example, friend-of-friend grooming allegations) remains a **lead only** until corroborated.
- Strong formal anti-ragging infrastructure and weak lived-experience evidence are shown simultaneously rather than collapsed into a safety score.


## 26 Aug 2026 — West and South expansion

Coverage expanded from **60 to 70 researched profiles** with AFMC Pune, BJGMC Pune, BMCRI, LTMMC Sion, HBT Cooper, MMCRI Mysore, KIMS Hubballi, SABVMCRI Bengaluru, Kilpauk Medical College and Madurai Medical College.

Additional rules:
- Military/institutional discipline is not labeled ragging unless evidence indicates unauthorized senior coercion.
- PG/residency toxicity is not transferred onto MBBS Junior Culture.
- A single bare allegation can create a **watch/lead**, not a high-confidence college label.
- Current threads that ask about ragging but receive no substantive answer are recorded as evidence gaps, not reassuring evidence.


## 26 Aug 2026 — Andhra Pradesh expansion

Coverage expanded from **70 to 75 researched profiles** with Andhra Medical College, Rangaraya Medical College, Guntur Medical College, Kurnool Medical College and S V Medical College Tirupati. The Andhra Medical College profile preserves a detailed 2025 student allegation as non-adjudicated evidence; Kurnool/SVMC PG toxicity material is explicitly excluded from undergraduate inference.


## 26 Aug 2026 — demand-ranked 75→100 expansion

Coverage expanded from **75 to 100 researched Junior Culture profiles**. This pass added the next 25 unresolved colleges by 2026 General Round-1 demand, subject to source-quality controls:

Government Medical College Kozhikode; Medical College Thiruvananthapuram; Government Medical College Omandurar Chennai; JIPMER Karaikal; Gandhi Medical College Secunderabad; Medical College Kolkata; Government Medical College Srinagar; Government Medical College Kottayam; RUHS College of Medical Sciences Jaipur; Medical College Baroda; Government Medical College Thrissur; Coimbatore Medical College; Indira Gandhi Medical College Shimla; Chengalpattu Medical College; PGIMS Rohtak; Government Medical College Patiala; Government Medical College Surat; ESIC Medical College Faridabad; JNMC Aligarh; T D Medical College Alappuzha; ESIC Medical College Hyderabad; Mohan Kumaramangalam Medical College Salem; Thanjavur Medical College; Government Medical College Ernakulam; and GIMS Greater Noida.

Additional controls introduced/strengthened in this pass:

- **Cross-level quarantine:** PG/resident, nursing, dental or allied-health cases are never inherited by MBBS fresher profiles. Surat's current serious signal is retained as PG-level institutional context only; the prominent 2025 Kottayam nursing case is explicitly excluded from MBBS inference.
- **Formal safeguards ≠ low prevalence:** a current anti-ragging committee, affidavit, squad or orientation supports the `enforcement/protection` field, not a green safety conclusion.
- **Applicant questions ≠ incidents:** a thread asking whether a college has ragging can document an evidence gap, but cannot create a concern signal unless substantive college-specific testimony follows.
- **Rumor is graded as rumor:** PGIMS Rohtak and ESIC Faridabad retain low-confidence concern leads because the current/recent claims are anonymous or second-hand.
- **Current lived signals get more weight than old reputation:** IGMC Shimla receives a moderate current concern signal from a detailed Aug 2026 student account; ESIC Hyderabad and JNMC Aligarh receive reassuring current signals, still labelled anonymous/community evidence rather than verified prevalence.
- **No forced timeline:** every profile in the then-current milestone had a First-90-Days record. Phase timing is populated only when directly supported; the current V8 recount is given below.


## Demand-ranked expansion: 100 → 125 (26 Aug 2026)

Coverage expanded to **125 researched Junior Culture profiles** using the next 25 unresolved colleges by 2026 General Round-1 demand. The pass deliberately preserves four different outcomes: current lived concern/reassurance, recent or historical formal disciplinary evidence, current institutional safeguards, and explicit evidence gaps.

Notable contamination controls in this batch include: the new Government Medical College at L.T. Marg, Mumbai is kept distinct from Grant Medical College/JJ; ESIC Noida infrastructure protests are not treated as ragging; unrelated campus-security events are excluded; and old formal cases are not described as proof of 2026 prevalence.

At the 125-profile milestone, all 125 profiles had a First-90-Days record. No new phase timeline was created merely because an incident involved a first-year student; timing was populated only when the source established the relevant phase.

## Demand-ranked expansion: 125 → 150 (26 Aug 2026)

Coverage expanded to **150 researched Junior Culture profiles** using the next 25 unresolved colleges by 2026 General Round-1 demand. Identity matching was tightened again: IGGMC Nagpur is kept distinct from GMC Nagpur; Government Medical College Aurangabad is kept distinct from MGM Medical College; ESIC Coimbatore does not inherit evidence from ESIC Chennai; and PG/resident cases such as the 2026 Bhavnagar Orthopaedics matter remain quarantined from MBBS fresher inference.

Strong current formal-action signals in this pass include BRD Gorakhpur, Gauhati Medical College and NSCB Jabalpur. Haldwani and Pt JNM Raipur carry repeated student-culture concern signals with lower evidentiary certainty. Colleges without adequate current testimony remain explicitly `insufficient` rather than inheriting state or institutional reputation.

At the 150-profile milestone, all 150 profiles had a First-90-Days record. The timeline remained deliberately sparse. The V8 recount below supersedes the earlier aggregate because explicit `GAP` cells had previously been included in the supported-cell total.


## Demand-ranked expansion: 150 → 175 (26 Aug 2026)

Coverage expanded to **200 Junior Culture profiles** and **200 First-90-Days records** using the next 25 unresolved colleges by 2026 General Round-1 demand. The pass keeps formal safeguards, disciplinary history, anonymous student reports and genuine evidence gaps separate. Source-empty profiles are presented as **insufficient evidence** rather than receiving an inferred safety or concern label.

The canonical V8 Freshers Timeline contains **69 college records** across six possible phases per profile. Across all **1,050** profile-phase cells, the current grade counts are **A: 18, B: 28, C: 25, D: 4, explicit GAP: 8**; the remaining cells are blank because no phase-specific claim is supported. Therefore **71 A–C cells are publishable phase evidence**, **4 D cells are lead-only**, and **975 cells are blank or explicit GAP**.

The canonical source ledger currently contains **329 unique URLs**: **144 official**, **38 news**, and **147 student/community** sources. Source type is not a truth score: official pages often establish policy rather than lived prevalence, while student reports establish that an account was made rather than that it is universal.


## Demand-ranked expansion: 175 → 200 (27 Aug 2026)

The next 25 unresolved colleges were selected by 2026 General Round-1 demand rather than alphabetically. The pass added College of Medicine & Sagore Dutta Hospital through Kalyan Singh Government Medical College, Bulandshahr.

Evidence remained asymmetric by design. Kakatiya Medical College received a current concern signal because an April 2026 disciplinary case is directly reported; Kanyakumari Government Medical College received a limited reassuring signal from a first-person 2024 report plus current formal controls; several colleges received only formal-safeguard or historical-complaint context; and source-thin colleges remain explicitly insufficient. No new Freshers Timeline phase was populated unless a source actually supported phase timing.
