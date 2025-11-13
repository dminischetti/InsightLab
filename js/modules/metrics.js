import { appState } from './state.js';

const animateCounter = (element, target, duration = 1800) => {
  const start = 0;
  const increment = target / Math.max(1, duration / 16);
  let current = start;
  const timer = setInterval(() => {
    current += increment;
    if ((increment >= 0 && current >= target) || (increment < 0 && current <= target)) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = `+$${Math.round(current).toLocaleString()}`;
    element.dataset.counterAnimated = 'true';
  }, 16);
};

export const initMetricObservers = () => {
  const kpiKeys = ['rent-delta', 'wage-gap', 'volatility-hotspots'];
  kpiKeys.forEach((key) => {
    const element = document.querySelector(`[data-kpi="${key}"]`);
    if (element) element.textContent = '—';
  });

  const counter = document.querySelector('[data-counter-value]');
  if (counter) {
    counter.dataset.counterTarget = '0';
    counter.dataset.counterAnimated = 'false';
    if (appState.observers.counter) {
      appState.observers.counter.disconnect();
    }
    appState.observers.counter = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = Number(counter.dataset.counterTarget || '0');
            animateCounter(counter, target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    appState.observers.counter.observe(counter);
  }
};

const formatCurrency = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  const sign = value >= 0 ? '+' : '-';
  return `${sign}$${Math.abs(Math.round(value)).toLocaleString()}`;
};

const formatDifference = (value, suffix = '') => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}${suffix}`;
};

export const updateMetrics = () => {
  const summary = appState.summary;
  const rentData = appState.data?.rentData;

  const rentDeltaEl = document.querySelector('[data-kpi="rent-delta"]');
  if (rentDeltaEl && summary?.rent_growth) {
    const absoluteChanges = Object.values(summary.rent_growth).map((entry) => entry?.absolute ?? 0);
    const avgChange = absoluteChanges.length
      ? absoluteChanges.reduce((acc, value) => acc + value, 0) / absoluteChanges.length
      : null;
    rentDeltaEl.textContent = avgChange ? formatCurrency(avgChange) : '—';
  }

  const wageGapEl = document.querySelector('[data-kpi="wage-gap"]');
  if (wageGapEl && summary?.rent_growth && summary?.income_growth) {
    const rentPct = Object.values(summary.rent_growth).map((entry) => entry?.pct ?? 0);
    const incomePct = Object.values(summary.income_growth).map((entry) => entry?.pct ?? 0);
    const avgRentPct = rentPct.length ? rentPct.reduce((acc, value) => acc + value, 0) / rentPct.length : null;
    const avgIncomePct = incomePct.length ? incomePct.reduce((acc, value) => acc + value, 0) / incomePct.length : null;
    if (avgRentPct !== null && avgIncomePct !== null) {
      wageGapEl.textContent = formatDifference(avgRentPct - avgIncomePct, ' pts');
    }
  }

  const volatilityEl = document.querySelector('[data-kpi="volatility-hotspots"]');
  if (volatilityEl && appState.data?.heatmapData?.values) {
    const threshold = 6;
    const hotspots = appState.data.heatmapData.values.reduce(
      (total, row) => total + row.filter((value) => Math.abs(value) >= threshold).length,
      0
    );
    volatilityEl.textContent = hotspots ? hotspots.toString() : '—';
  }

  const counter = document.querySelector('[data-counter-value]');
  if (counter && summary?.disparity_index) {
    const years = Object.keys(summary.disparity_index).map((year) => Number(year)).sort((a, b) => a - b);
    if (years.length) {
      const firstSpread = summary.disparity_index[years[0]]?.spread ?? 0;
      const lastSpread = summary.disparity_index[years[years.length - 1]]?.spread ?? 0;
      const delta = lastSpread - firstSpread;
      counter.dataset.counterTarget = String(delta);
      if (counter.dataset.counterAnimated === 'true') {
        counter.textContent = `+$${Math.round(delta).toLocaleString()}`;
      }
    }
  }

  const contextStat = document.querySelector('[data-context-stat]');
  if (contextStat && summary?.disparity_index) {
    const years = Object.keys(summary.disparity_index).map((year) => Number(year));
    const span = years.length ? Math.max(...years) - Math.min(...years) + 1 : 0;
    if (span) {
      contextStat.textContent = `Analyzing ${span} years of borough-level data across ${rentData?.labels?.length ?? 5} NYC boroughs.`;
    }
  }
};
