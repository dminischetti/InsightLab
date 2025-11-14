# InsightLab: NYC Housing Dynamics

[![Build & Deploy (Pages)](https://github.com/dminischetti/insightlab/actions/workflows/build-and-deploy.yml/badge.svg)](https://github.com/dminischetti/insightlab/actions/workflows/build-and-deploy.yml)
[![Weekly Refresh](https://github.com/dminischetti/insightlab/actions/workflows/nightly-refresh.yml/badge.svg)](https://github.com/dminischetti/insightlab/actions/workflows/nightly-refresh.yml)

**Tagline:** “How income, transport, and environment shape rent trends.”
**Elevator pitch:** A reproducible Python + DuckDB pipeline that rebuilds NYC’s housing analytics end-to-end - clean datasets, correlations, regressions, diagnostics, and interactive charts - all regenerated from a single source CSV.

---

## 🚀 Live site
The project deploys automatically via GitHub Actions.

**Live demo:**
`https://minischetti.org/insightlab/`

No manual setup required - every push to `main` rebuilds both the analytics pipeline and the static site.

---

## 🔁 Reproducible pipeline (Python + DuckDB)

A minimal toolchain regenerates **every derived asset**: JSON payloads, regression appendix, figures, CSV snapshots, and the final static site.

<details>
<summary><strong>Full pipeline commands</strong></summary>

| Command | Description |
| --- | --- |
| `python -m pip install -r requirements.txt` | Install the pinned analysis stack. |
| `make derive` | Generate `derived_summary.json`, `viz_payload.json`, and `appendix/ols_report.md`. |
| `make validate` | Run schema/range checks on `data/nyc_median_rent.csv`. |
| `make sql` | Run DuckDB SQL snapshots (`median_rent_yoy`, `disparity_by_year`, `latest_leaderboard`). |
| `make figures` | Generate regression diagnostics (`residuals`, `QQ`, `influence`, `corr_matrix`). |
| `make all` | Executes derive → validate → sql → figures. |
| `make site` | Bundles the static site with all generated artifacts. |
| `make clean` | Removes build outputs (`site/`, `duckdb_outputs/`, figures). |

All CI workflows use these same targets to keep local and remote builds identical.

</details>

---

## 📊 Data dictionary

| Field | Type | Description |
| --- | --- | --- |
| `year` | int | Year of observation (2010–2024). |
| `borough` | string | NYC borough. |
| `median_rent` | float | Monthly median asking rent (USD). |
| `median_income` | float | Annual median household income (USD). |
| `subway_access_score` | float | 0–100 transit access score. |
| `air_quality_index` | float | DOHMH air quality index (lower = cleaner). |

Metadata for narrative and tooltips lives in `data/nyc_borough_meta.json`.
Replication notes: `notebooks/methodology.md`.

---

## 🧪 Statistical methods & diagnostics

Generated during each pipeline run:

- `appendix/ols_report.md` - OLS coefficients, confidence intervals, VIF, BP test, R², and diagnostics
- Figures in `appendix/figures/`:
  - `residuals.png`
  - `qq.png`
  - `influence.png`
  - `corr_matrix.png`

All produced via `tools/figures.py` and automatically included in the static site.

---

## 🗂 SQL snapshots (DuckDB)

`tools/run_sql.py` and `sql/examples.sql` produce three auditable CSV slices:

- `median_rent_yoy.csv` - year-over-year rent deltas
- `disparity_by_year.csv` - annual max/min spread
- `latest_leaderboard.csv` - latest year leaderboard + drivers

Snapshots live in `data/duckdb_outputs/` and provide warehouse-friendly tables.

---

## 📦 Output artifacts (shipped with the site)

- `data/derived_summary.json` - correlations, regression diagnostics, disparity index, generated narrative.
- `data/viz_payload.json` - pre-aggregated chart series for fast interactive rendering.
- `data/duckdb_outputs/*.csv` - SQL snapshots for offline or BI use.
- `appendix/ols_report.md` & `appendix/figures/*.png` - linked directly from chart captions.

The front-end prefers JSON payloads but falls back to CSV if needed.

---

## 🖥 Quickstart (local)

1. `python -m pip install -r requirements.txt`
2. `make site`
3. Open `site/index.html` (or `site/study.html`) in a browser.

The embedded dataset mirrors pipeline outputs for offline usage.

---

## 🏗 Architecture

```
insightlab/
├── index.html # Landing page (scrollytelling)
├── study.html # Full case study narrative
├── data/
│ ├── nyc_median_rent.csv # Source dataset (replicated snapshot)
│ ├── nyc_borough_meta.json # Metadata for tooltips/narrative
│ ├── derived_summary.json # Pipeline-derived summary payload
│ └── viz_payload.json # Chart-ready preaggregated series
├── data/duckdb_outputs/ # DuckDB snapshot CSVs
├── tools/
│ ├── derive.py # Builds derived JSON & OLS appendix
│ ├── validate.py # Dataset integrity checks
│ ├── run_sql.py # DuckDB-powered tabular snapshots
│ └── figures.py # Diagnostic matplotlib/seaborn plots
├── sql/examples.sql # SQL logic used in both local + CI runs
├── appendix/
│ ├── ols_report.md # Regenerated OLS appendix
│ └── figures/ # Residual, QQ, influence, correlation visuals
├── js/ # Front-end orchestration & chart rendering
├── css/ # Styling + subtle animations
├── assets/ # Icons & visual accents
├── notebooks/methodology.md # Replication log & citations
├── Makefile # Pipeline entry points
└── requirements.txt # Pinned Python environment
```

---

## ⚙️ CI/CD

### **Build & Deploy**
Runs on every push to `main`, rebuilds the full pipeline, and publishes `/site` to GitHub Pages.

### **Weekly Refresh**
Runs weekly (Sunday 03:00 UTC) to re-run the pipeline against the latest CSV and redeploy.

Both workflows use `make all` and `make site` to ensure reproducibility.

---

## 📜 Dataset & licensing

- `nyc_median_rent.csv` is a replicated snapshot based on NYC Open Data (HPD) + ACS medians.
- `nyc_borough_meta.json` sources metadata from NYC Planning fact sheets.
- All code and generated output are MIT licensed.
- Upstream source data retains its original licensing terms.

---

## 💡 What this project demonstrates

- **Reproducibility:** Deterministic analytics with a transparent Python + DuckDB pipeline.
- **Engineering craft:** Clean modular JavaScript powering charts, filters, and interactions.
- **Automation:** CI/CD builds that regenerate everything - data → diagnostics → visuals → site.
- **Clarity:** Linked appendix, diagnostics, and narrative for credible, inspectable results.

---

## 🙏 Credits

- Data inspiration: NYC Open Data, U.S. Census ACS, MTA, DOHMH
- Icons: inline custom SVG
- Hero background: handcrafted CSS gradient (no binary assets)
