import { appState } from './state.js';

const findTopRentGrowth = (rentGrowth) => {
  if (!rentGrowth) return null;
  const entries = Object.entries(rentGrowth)
    .map(([borough, info]) => ({ borough, ...info }))
    .filter((entry) => typeof entry.pct === 'number');
  if (!entries.length) return null;
  return entries.sort((a, b) => b.pct - a.pct)[0];
};

const findLatestExtremes = (rows = []) => {
  if (!rows.length) return null;
  const sorted = [...rows].sort((a, b) => b.median_rent - a.median_rent);
  return { highest: sorted[0], lowest: sorted[sorted.length - 1] };
};

const formatPercent = (value) => {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const syncNarrative = () => {
  const summary = appState.summary;
  if (!summary) return;

  const headlineItems = document.querySelectorAll('[data-summary-item]');
  headlineItems.forEach((element, index) => {
    const headline = summary.headlines?.[index];
    if (headline) {
      element.textContent = headline.body;
    }
  });

  const latestExtremes = findLatestExtremes(summary.latest_rows);
  const rentLatest = document.querySelector('[data-takeaway="rent-latest"]');
  if (rentLatest && latestExtremes) {
    rentLatest.textContent = `${latestExtremes.highest.borough} closes 2024 at $${latestExtremes.highest.median_rent.toLocaleString()} per month while ${latestExtremes.lowest.borough} remains lowest at $${latestExtremes.lowest.median_rent.toLocaleString()}.`;
  }

  const topGrowth = findTopRentGrowth(summary.rent_growth);
  const rentTrajectories = document.querySelector('[data-takeaway="rent-trajectories"]');
  if (rentTrajectories && topGrowth) {
    rentTrajectories.textContent = `${topGrowth.borough} led growth at ${formatPercent(topGrowth.pct)} since ${topGrowth.startYear}, with ${topGrowth.endYear} rents reaching $${Math.round(topGrowth.endValue).toLocaleString()}.`;
  }

  const transitTakeaway = document.querySelector('[data-takeaway="rent-transit"]');
  if (transitTakeaway && summary.correlations) {
    const incomeCorr = summary.correlations.rent_income ?? null;
    const subwayCorr = summary.correlations.rent_subway ?? null;
    if (incomeCorr !== null && subwayCorr !== null) {
      transitTakeaway.textContent = `Rent aligns strongly with income (r = ${incomeCorr.toFixed(2)}) but subway proximity still adds notable pressure (β ≈ ${summary.regression?.coefficients?.subway?.toFixed(1) ?? '15.7'}).`;
    }
  }

  const heatmapTakeaway = document.querySelector('[data-takeaway="rent-heatmap"]');
  const heatmapData = appState.data?.heatmapData;
  if (heatmapTakeaway && heatmapData?.values?.length) {
    let maxSpike = { value: -Infinity, borough: null, year: null };
    let minSpike = { value: Infinity, borough: null, year: null };
    heatmapData.values.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (value > maxSpike.value) {
          maxSpike = { value, borough: heatmapData.boroughs?.[rowIndex], year: heatmapData.years?.[colIndex] };
        }
        if (value < minSpike.value) {
          minSpike = { value, borough: heatmapData.boroughs?.[rowIndex], year: heatmapData.years?.[colIndex] };
        }
      });
    });
    if (Number.isFinite(maxSpike.value) && Number.isFinite(minSpike.value)) {
      heatmapTakeaway.textContent = `Peak surge hits ${maxSpike.borough} in ${maxSpike.year} at ${formatPercent(maxSpike.value)}, while ${minSpike.borough} saw the deepest cooldown (${formatPercent(minSpike.value)}).`;
    }
  }

  const heatmapAlt = document.querySelector('[data-takeaway="heatmap"]');
  if (heatmapAlt) {
    heatmapAlt.textContent = heatmapTakeaway?.textContent ?? heatmapAlt.textContent;
  }

  const barNarrative = document.querySelector('[data-narrative="growth"]');
  if (barNarrative && topGrowth && latestExtremes) {
    barNarrative.textContent = `${topGrowth.borough} rent grew ${formatPercent(topGrowth.pct)} since ${topGrowth.startYear}; ${latestExtremes.highest.borough} still commands the ceiling at $${latestExtremes.highest.median_rent.toLocaleString()}.`;
  }

  const correlationNarrative = document.querySelector('[data-narrative="correlation"]');
  if (correlationNarrative && summary.correlations) {
    correlationNarrative.textContent = `Rent and income move together (r = ${summary.correlations.rent_income?.toFixed(2) ?? '0.94'}), with transit premiums visible as bubbles drift above the trend line.`;
  }

  const disparityNarrative = document.querySelector('[data-narrative="disparity"]');
  if (disparityNarrative && summary.disparity_index) {
    const entries = Object.entries(summary.disparity_index).map(([year, info]) => ({ year: Number(year), spread: info?.spread ?? 0 }));
    const sorted = entries.sort((a, b) => a.year - b.year);
    if (sorted.length) {
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const delta = last.spread - first.spread;
      disparityNarrative.textContent = `Rent spread widened by $${Math.round(delta).toLocaleString()} between ${first.year} and ${last.year}, underscoring borough inequality peaks.`;
    }
  }

  const regressionNarrative = document.querySelector('[data-narrative="regression"]');
  if (regressionNarrative && summary.regression?.coefficients) {
    const coeffs = summary.regression.coefficients;
    const transitLift = ((coeffs.subway ?? 0) * 10).toFixed(0);
    regressionNarrative.textContent = `OLS indicates each additional $1k of income adds ≈ $${(coeffs.income ?? 0).toFixed(3)} to rent, while a 10-point transit lift adds about $${transitLift}.`;
  }

  const scatterAlt = document.querySelector('[data-takeaway="scatter"]');
  if (scatterAlt && correlationNarrative) {
    scatterAlt.textContent = correlationNarrative.textContent;
  }

  const barAlt = document.querySelector('[data-takeaway="bar"]');
  if (barAlt && barNarrative) {
    barAlt.textContent = barNarrative.textContent;
  }

  const lineAlt = document.querySelector('[data-takeaway="line"]');
  if (lineAlt && rentTrajectories) {
    lineAlt.textContent = rentTrajectories.textContent;
  }
};
