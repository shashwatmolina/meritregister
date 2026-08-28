# The Merit Register — V9.0 RC testing guide

## Release-blocking flows

1. Add colleges to **My List** from Directory and a College profile.
2. Remove one college and confirm it disappears from **Choice Filling** as well as My List.
3. Open **Decision Mode**, change priorities, and apply a ranking only when explicitly requested.
4. In **Choice Filling**, enable a conditional Delhi route and verify route-specific reach does not get a fake AIQ 2025→2026 movement label.
5. Open a Timeline link from Evidence Explorer and confirm `timeline.html?college=<id>` shows the intended college.
6. Corrupt or block browser storage: pages must still render with empty/fallback state instead of crashing.
7. On an individual College profile, **Report data issue** should include that college's ID/name.

## Automated suites

- `python scripts/beta-scenario-tests.py` — 10 counselling/data scenarios.
- `node scripts/v9-rc-regression-tests.js` — 7 reproduced bug regressions.

## Known limitation

Automated Chromium screenshot capture remains unreliable in the current container because headless Chromium does not terminate cleanly. Static/runtime regression validation is clean, but final visual QA should still be done in a normal browser.
