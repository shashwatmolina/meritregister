# The Merit Register — static VS Code project

This folder is a refactored version of the three-page prototype. It has **no build step** and can be served directly with VS Code Live Server or any static host.

## Entry pages

- `index.html` — nationwide directory + AIQ predictor
- `compare.html` — 2–4 college comparison
- `about.html` — methodology/about
- `status.html` — internal data-coverage dashboard (not linked in the public nav)

## Folder structure

```text
merit-register-vscode/
├── index.html
├── compare.html
├── about.html
├── status.html
├── css/
│   ├── styles.css        # shared directory/compare design system
│   ├── index.css
│   ├── compare.css
│   ├── about.css
│   └── status.css
├── js/
│   ├── common.js         # shared theme behavior
│   ├── directory.js
│   ├── compare.js
│   ├── about.js
│   └── status.js
└── data/
    ├── colleges.js       # canonical college master / IDs
    ├── aiq-cutoffs-2025.js
    ├── aiq-cutoffs-2026.js  # intentionally empty drop-in target
    ├── demand-trends.js
    ├── hostels.js
    ├── clinical.js
    ├── academics.js
    ├── research.js
    ├── campus.js
    ├── finances.js
    ├── deep-research.js
    ├── comparison-calibration.js
    ├── state-quota-legacy.js
    └── stats.js
```

## Updating 2026 MCC results

Put official 2026 round data into `data/aiq-cutoffs-2026.js` using the same college IDs and `category_rounds` shape used in `aiq-cutoffs-2025.js`.

The predictor already checks `AIQ_CUTOFFS_2026`; once the object contains records it automatically prefers 2026 data. A Round-1-only dataset is valid, so R2/R3 can be added later without changing the UI.

## College IDs

`data/colleges.js` is canonical. Every other dataset must reference the numeric `id` from that file. Do not match datasets by display-name strings.

## Data-quality rule

Keep unsupported values `null` / absent. Do not turn missing evidence into zero or a negative rating.

## Local development

Recommended: open this folder in VS Code and run **Live Server** on `index.html`.

The site also uses relative paths only, so all four pages can be moved together to a static host without path changes.
