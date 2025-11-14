/*
  InsightLab front-end bootstrap (2025 refresh)
  ------------------------------------------------
  Replaces the previous multi-module setup with a single lightweight module that:
    • Loads chart payloads and summary metrics
    • Renders four Chart.js views with a dark theme aligned to GitHub-style colors
    • Syncs narrative copy and key stats for both the main narrative page and study companion
    • Adds gentle reveal animations that respect prefers-reduced-motion
*/

if (typeof document !== 'undefined') {
  document.documentElement.classList.add('has-js');
}

const state = {
  charts: new Map(),
  data: null,
  summary: null,
  activePeriod: '2010-2013',
};

const SCATTER_PERIODS = [
  { key: '2010-2013', start: 2010, end: 2013 },
  { key: '2014-2016', start: 2014, end: 2016 },
  { key: '2017-2020', start: 2017, end: 2020 },
  { key: '2021-2024', start: 2021, end: 2024 },
];

const prefersReducedMotion =
  typeof window !== 'undefined' && 'matchMedia' in window
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

const palette = {
  primary: 'oklch(74% 0.23 220)',
  secondary: 'oklch(70% 0.21 300)',
  tertiary: 'oklch(68% 0.2 20)',
  surface: 'oklch(21% 0.016 250)',
  text: 'oklch(92% 0.01 250)',
  textMuted: 'oklch(70% 0.015 250)',
  grid: 'oklch(36% 0.015 250 / 0.3)',
  boroughs: [
    'oklch(74% 0.23 220)',
    'oklch(70% 0.21 300)',
    'oklch(72% 0.2 160)',
    'oklch(68% 0.21 40)',
    'oklch(69% 0.2 345)',
  ],
};

const withAlpha = (color, alpha) => {
  if (!color.startsWith('oklch')) return color;
  const [model, values] = color.split('(');
  const params = values.replace(')', '').split(' ');
  if (params.length < 3) return color;
  return `${model}(${params[0]} ${params[1]} ${params[2]} / ${alpha})`;
};

const fetchJson = async (path) => {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Unable to load ${path}`, error);
    return null;
  }
};

const loadData = async () => {
  const [payload, summary] = await Promise.all([
    fetchJson('./data/viz_payload.json'),
    fetchJson('./data/derived_summary.json'),
  ]);

  if (!payload) {
    return { rentData: null, scatterData: null, heatmapData: null, summary };
  }

  const boroughs = payload.boroughs ?? [];
  const years = payload.years ?? [];

  const rentSeries = {};
  boroughs.forEach((borough) => {
    rentSeries[borough] = payload.series?.[borough]?.median_rent ?? [];
  });

  const rentData = {
    labels: boroughs,
    values: boroughs.map((borough) => {
      if (summary?.rent_growth?.[borough]?.endValue) {
        return summary.rent_growth[borough].endValue;
      }
      const rents = rentSeries[borough];
      return rents?.length ? rents[rents.length - 1] : 0;
    }),
    years,
    boroughs,
    series: rentSeries,
  };

  const scatterBuckets = SCATTER_PERIODS.reduce((acc, period) => ({ ...acc, [period.key]: [] }), {});
  (payload.scatter ?? []).forEach((point) => {
    if (!point || typeof point.year !== 'number') return;
    const period = SCATTER_PERIODS.find((range) => point.year >= range.start && point.year <= range.end);
    if (!period) return;
    scatterBuckets[period.key].push({
      x: Number(point.x ?? 0),
      y: Number(point.y ?? 0),
      r: Number(point.r ?? 0),
      label: `${point.borough ?? 'Unknown'} ${point.year}`,
      borough: point.borough,
      year: point.year,
    });
  });

  const heatmapSource = payload.heatmap ?? {};
  const heatmapData = {
    years: heatmapSource.years ?? years,
    boroughs: heatmapSource.boroughs ?? boroughs,
    values: (heatmapSource.matrix ?? []).map((row = []) => row.map((value) => (typeof value === 'number' ? value : 0))),
  };

  return { rentData, scatterData: scatterBuckets, heatmapData, summary };
};

const registerChart = (key, instance) => {
  const existing = state.charts.get(key);
  if (existing?.destroy) existing.destroy();
  state.charts.set(key, instance);
};

const destroyCharts = () => {
  state.charts.forEach((chart) => chart?.destroy?.());
  state.charts.clear();
};

const toggleFallback = (key, shouldShow, message) => {
  const element = document.querySelector(`[data-chart-fallback="${key}"]`);
  if (!element) return;
  if (shouldShow) {
    if (message) element.textContent = message;
    element.hidden = false;
  } else {
    element.hidden = true;
  }
};

const baseChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: 16 },
  animation: prefersReducedMotion
    ? false
    : {
        duration: 600,
        easing: 'easeOutQuart',
      },
  plugins: {
    legend: {
      labels: {
        color: palette.textMuted,
        usePointStyle: true,
        pointStyle: 'rectRounded',
        boxWidth: 12,
      },
    },
    tooltip: {
      backgroundColor: withAlpha(palette.surface, 0.95),
      titleColor: palette.text,
      bodyColor: palette.textMuted,
      borderColor: withAlpha(palette.grid, 0.6),
      borderWidth: 1,
      padding: 12,
      displayColors: false,
    },
  },
  scales: {
    x: {
      ticks: {
        color: palette.textMuted,
        font: { size: 11 },
      },
      grid: {
        color: withAlpha(palette.grid, 0.25),
        drawBorder: false,
      },
    },
    y: {
      ticks: {
        color: palette.textMuted,
        font: { size: 11 },
      },
      grid: {
        color: withAlpha(palette.grid, 0.35),
        drawBorder: false,
      },
    },
  },
});

const renderBarChart = (rentData) => {
  const canvas = document.getElementById('chart-bar');
  if (!canvas) return;
  if (!rentData) {
    toggleFallback('bar', true, 'Data payload missing. Median rents remain in the written findings.');
    return;
  }
  if (typeof window.Chart === 'undefined') {
    toggleFallback('bar', true, 'Chart.js did not load. Median rents are still summarized below.');
    return;
  }
  toggleFallback('bar', false);

  const ctx = canvas.getContext('2d');
  const chart = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: rentData.labels,
      datasets: [
        {
          label: 'Median rent (USD)',
          data: rentData.values,
          borderRadius: 12,
          borderSkipped: false,
          backgroundColor: palette.boroughs.map((color) => withAlpha(color, 0.85)),
          borderColor: palette.boroughs.map((color) => withAlpha(color, 0.9)),
          hoverBackgroundColor: palette.boroughs.map((color) => withAlpha(color, 1)),
        },
      ],
    },
    options: {
      ...baseChartOptions(),
      plugins: {
        ...baseChartOptions().plugins,
        legend: { display: false },
        tooltip: {
          ...baseChartOptions().plugins.tooltip,
          callbacks: {
            label: (context) => `$${context.parsed.y.toLocaleString()} / month`,
          },
        },
      },
      scales: {
        ...baseChartOptions().scales,
        y: {
          ...baseChartOptions().scales.y,
          beginAtZero: true,
          ticks: {
            ...baseChartOptions().scales.y.ticks,
            callback: (value) => `$${Number(value).toLocaleString()}`,
          },
        },
      },
    },
  });

  registerChart('bar', chart);
};

const renderLineChart = (rentData) => {
  const canvas = document.getElementById('chart-line');
  if (!canvas) return;
  if (!rentData) {
    toggleFallback('line', true, 'Data payload missing. Trajectory highlights remain described below.');
    return;
  }
  if (typeof window.Chart === 'undefined') {
    toggleFallback('line', true, 'Chart.js did not load. Trajectory details remain in the written insights.');
    return;
  }
  toggleFallback('line', false);

  const ctx = canvas.getContext('2d');
  const options = baseChartOptions();
  options.plugins.legend.position = 'bottom';
  options.scales.y.ticks.callback = (value) => `$${Number(value).toLocaleString()}`;

  const chart = new window.Chart(ctx, {
    type: 'line',
    data: {
      labels: rentData.years,
      datasets: rentData.boroughs.map((borough, index) => ({
        label: borough,
        data: rentData.series?.[borough] ?? [],
        borderColor: palette.boroughs[index % palette.boroughs.length],
        borderWidth: 2.4,
        tension: 0.32,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 4,
      })),
    },
    options,
  });

  registerChart('line', chart);
};

const renderScatter = (scatterData, period) => {
  const canvas = document.getElementById('chart-scatter');
  if (!canvas) return;
  if (!scatterData) {
    toggleFallback('scatter', true, 'Data payload missing. Transit-weighted insights remain in the narrative.');
    return;
  }
  if (typeof window.Chart === 'undefined') {
    toggleFallback('scatter', true, 'Chart.js did not load. Use the narrative notes for transit insights.');
    return;
  }

  const activePeriod = period || state.activePeriod || SCATTER_PERIODS[0].key;
  const points = scatterData[activePeriod] ?? [];
  if (!points.length) {
    toggleFallback('scatter', true, 'No observations available for the selected window.');
    return;
  }
  toggleFallback('scatter', false);
  const ctx = canvas.getContext('2d');

  const chart = new window.Chart(ctx, {
    type: 'bubble',
    data: {
      datasets: [
        {
          label: `Income vs. rent · ${activePeriod}`,
          data: points.map((point) => ({
            x: point.x,
            y: point.y,
            r: Math.max(4, point.r * 0.9),
            label: point.label,
          })),
          backgroundColor: withAlpha(palette.primary, 0.45),
          borderColor: withAlpha(palette.primary, 0.9),
          borderWidth: 1.5,
        },
      ],
    },
    options: {
      ...baseChartOptions(),
      plugins: {
        ...baseChartOptions().plugins,
        legend: { display: false },
        tooltip: {
          ...baseChartOptions().plugins.tooltip,
          callbacks: {
            label: (context) => {
              const datum = points[context.dataIndex];
              return `${datum?.label ?? 'Observation'} - Income $${context.parsed.x.toLocaleString()}, Rent $${context.parsed.y.toLocaleString()}`;
            },
          },
        },
      },
      scales: {
        x: {
          ...baseChartOptions().scales.x,
          title: { display: true, text: 'Median household income (USD)', color: palette.textMuted },
          ticks: {
            ...baseChartOptions().scales.x.ticks,
            callback: (value) => `$${Number(value).toLocaleString()}`,
          },
        },
        y: {
          ...baseChartOptions().scales.y,
          title: { display: true, text: 'Median rent (USD)', color: palette.textMuted },
          ticks: {
            ...baseChartOptions().scales.y.ticks,
            callback: (value) => `$${Number(value).toLocaleString()}`,
          },
        },
      },
    },
  });

  registerChart('scatter', chart);
};

const renderHeatmap = (heatmapData) => {
  const canvas = document.getElementById('chart-heatmap');
  if (!canvas) return;
  if (!heatmapData) {
    toggleFallback('heatmap', true, 'Data payload missing. YoY rent change highlights remain summarised below.');
    return;
  }
  if (typeof window.Chart === 'undefined') {
    toggleFallback('heatmap', true, 'Chart.js did not load. Rent change spikes are still described in the insights.');
    return;
  }
  toggleFallback('heatmap', false);

  const ctx = canvas.getContext('2d');
  const colorForValue = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value) || value === 0) {
      return withAlpha(palette.grid, 0.15);
    }
    const intensity = Math.min(Math.abs(value) / 8, 1);
    const lightness = 68 - intensity * 22;
    const chroma = 0.16 + intensity * 0.12;
    const hue = value > 0 ? 50 : 305;
    const alpha = 0.32 + intensity * 0.48;
    return `oklch(${lightness}% ${chroma} ${hue} / ${alpha})`;
  };

  const options = baseChartOptions();
  options.plugins.legend.display = true;
  options.plugins.legend.position = 'top';
  options.plugins.tooltip.callbacks = {
    label: (context) => `${context.dataset.label}: ${context.parsed.y > 0 ? '+' : ''}${context.parsed.y.toFixed(1)}%`,
  };
  options.scales.y.ticks.callback = (value) => `${value}%`;
  options.scales.x.ticks.maxRotation = 45;
  options.scales.x.ticks.minRotation = 45;

  const chart = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: heatmapData.years,
      datasets: heatmapData.boroughs.map((borough, index) => ({
        label: borough,
        data: heatmapData.values[index] ?? [],
        backgroundColor: (heatmapData.values[index] ?? []).map((value) => colorForValue(value)),
        borderColor: withAlpha(palette.surface, 0.6),
        borderWidth: 1,
      })),
    },
    options,
  });

  registerChart('heatmap', chart);
};

const findTopRentGrowth = (rentGrowth) => {
  if (!rentGrowth) return null;
  return Object.entries(rentGrowth)
    .map(([borough, details]) => ({ borough, ...details }))
    .filter((entry) => typeof entry.pct === 'number')
    .sort((a, b) => b.pct - a.pct)[0];
};

const findLatestExtremes = (rows = []) => {
  if (!rows.length) return null;
  const sorted = [...rows].sort((a, b) => b.median_rent - a.median_rent);
  return { highest: sorted[0], lowest: sorted[sorted.length - 1] };
};

const updateStats = () => {
  const summary = state.summary;
  if (!summary) return;

  const latestYearEl = document.querySelector('[data-stat="latest-year"]');
  if (latestYearEl) latestYearEl.textContent = summary.latest_year ?? '-';

  const extremes = findLatestExtremes(summary.latest_rows ?? []);
  if (extremes) {
    const ceilingEl = document.querySelector('[data-stat="rent-ceiling"]');
    if (ceilingEl) {
      ceilingEl.textContent = `$${Math.round(extremes.highest.median_rent).toLocaleString()}`;
    }
    const spreadEl = document.querySelector('[data-stat="rent-spread"]');
    if (spreadEl) {
      const spread = (summary.disparity_index?.[String(summary.latest_year)]?.spread ?? 0) ||
        (extremes.highest.median_rent - extremes.lowest.median_rent);
      spreadEl.textContent = `+$${Math.round(spread).toLocaleString()}`;
    }
  }
};

const updateNarrative = () => {
  const summary = state.summary;
  const data = state.data;
  if (!summary || !data) return;

  const topGrowth = findTopRentGrowth(summary.rent_growth);
  const extremes = findLatestExtremes(summary.latest_rows ?? []);

  const summaryItems = document.querySelectorAll('[data-summary-item]');
  summaryItems.forEach((node, index) => {
    const headline = summary.headlines?.[index];
    if (headline?.body) node.textContent = headline.body;
  });

  const narratives = new Map();
  if (topGrowth && extremes) {
    narratives.set(
      'growth',
      `${topGrowth.borough} rent grew +${topGrowth.pct.toFixed(1)}% since ${topGrowth.startYear}, while ${extremes.highest.borough} closes ${summary.latest_year} at $${Math.round(extremes.highest.median_rent).toLocaleString()}.`
    );
    narratives.set(
      'line',
      `${topGrowth.borough} led growth at +${topGrowth.pct.toFixed(1)}%, with ${topGrowth.endYear} rents hitting $${Math.round(
        topGrowth.endValue
      ).toLocaleString()}.`
    );
  }

  const correlations = summary.correlations ?? {};
  if (typeof correlations.rent_income === 'number') {
    const beta = summary.regression?.coefficients?.subway ?? 0;
    narratives.set(
      'scatter',
      `Rent and income move together (r = ${correlations.rent_income.toFixed(2)}), and every 10-point subway lift adds about $${(
        beta * 10
      ).toFixed(0)} to rent.`
    );
    narratives.set('correlation', narratives.get('scatter'));
  }

  if (data.heatmapData?.values?.length) {
    let maxSpike = { value: -Infinity, borough: null, year: null };
    data.heatmapData.values.forEach((row, rowIndex) => {
      row.forEach((value, columnIndex) => {
        if (value > maxSpike.value) {
          maxSpike = {
            value,
            borough: data.heatmapData.boroughs?.[rowIndex],
            year: data.heatmapData.years?.[columnIndex],
          };
        }
      });
    });
    if (Number.isFinite(maxSpike.value)) {
      narratives.set(
        'heatmap',
        `${maxSpike.borough} peaks in ${maxSpike.year} at +${maxSpike.value.toFixed(1)}%, framing the surge alongside the pandemic rebound.`
      );
    }
  }

  narratives.forEach((value, key) => {
    document.querySelectorAll(`[data-narrative="${key}"]`).forEach((node) => {
      node.textContent = value;
    });
  });
};

const initTabs = () => {
  const tabs = document.querySelectorAll('[data-period-tab]');
  if (!tabs.length) return;
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((button) => {
        button.classList.remove('is-active');
        button.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      const period = tab.getAttribute('data-period-tab');
      if (period) {
        state.activePeriod = period;
        renderScatter(state.data?.scatterData, period);
      }
    });
  });
};

const initReveal = () => {
  const revealTargets = document.querySelectorAll('.js-reveal');
  if (!revealTargets.length) return;
  if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
    revealTargets.forEach((node) => node.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
  );
  revealTargets.forEach((node) => observer.observe(node));
};

const bootstrap = async () => {
  initReveal();
  initTabs();

  const payload = await loadData();
  state.data = payload;
  state.summary = payload.summary;

  try {
    renderBarChart(payload.rentData);
    renderLineChart(payload.rentData);
    renderScatter(payload.scatterData, state.activePeriod);
    renderHeatmap(payload.heatmapData);
  } catch (error) {
    console.error('Chart rendering failed', error);
    destroyCharts();
    ['bar', 'line', 'scatter', 'heatmap'].forEach((key) => toggleFallback(key, true));
  }

  updateStats();
  updateNarrative();
};

const init = () => {
  const page = document.body.dataset.page ?? 'index';
  if (page === 'index') {
    bootstrap();
  } else if (page === 'study') {
    loadData().then((payload) => {
      state.data = payload;
      state.summary = payload.summary;
      initTabs();
      updateNarrative();
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
