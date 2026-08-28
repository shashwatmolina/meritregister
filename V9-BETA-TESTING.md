# The Merit Register — V9 Beta Testing Guide

## Purpose

V9 Beta is feature-frozen. Beta testing is about **wrong data, confusing flows, quota mistakes, storage/order bugs, mobile friction, and unclear uncertainty**, not adding new headline tools.

## Critical user journeys

1. **New user:** Find a college → open profile → add to My List → compare → Decision Mode → Choice Filling → export.
2. **No saved data:** Compare / Decision / Choice Filling should explain what to do next rather than fail silently.
3. **AIR + category:** Save AIR/category once; the same profile should appear consistently across Directory, College, Decision and Choice Filling.
4. **Conditional quota:** DU/IP/ESIC/etc. should appear only when explicitly enabled. Unknown is not ineligible.
5. **Preference integrity:** An easier college must never jump above a more-preferred college just because its cutoff is safer.
6. **Large list:** 30+ choices should remain ordered, unique, movable, saveable and exportable.
7. **Evidence uncertainty:** Missing Junior Culture/First-90 evidence must never be presented as reassurance.

## Automated regression

Run:

```bash
python3 scripts/beta-scenario-tests.py
```

Expected: all scenarios pass and `audit/v9-beta-scenario-results-2026-08-28.json` is regenerated.

## Reporting a problem

Use **Report data issue** on any page. Reports are saved only in that browser. You can copy one structured report or export all saved reports as JSON. Nothing is sent automatically.

Useful reports include:

- exact wrong cutoff / fee / hostel / bond value;
- wrong quota or category route;
- stale evidence date;
- source that does not support the displayed claim;
- a page that becomes unusable on a small screen;
- shortlist/order disappearing or changing unexpectedly.

## Release blocker definition

Do not ship as stable if any of these occur:

- scenario regression failure;
- broken local link or missing JS/CSS;
- duplicate canonical college IDs;
- conditional quota leakage;
- preference order changes without explicit user action;
- a missing field rendered as a negative conclusion;
- a current-data claim without a traceable source/status label.
