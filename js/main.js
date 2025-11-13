import { appState, setData, setSummary, destroyAllCharts } from './modules/state.js';
import { initTheme } from './modules/theme.js';
import { initViewportAnimations, initProgressBar } from './modules/viewport.js';
import { loadData, SCATTER_PERIODS } from './modules/data.js';
import { renderBarChart } from './modules/charts/barChart.js';
import { renderMultiples } from './modules/charts/multiplesChart.js';
import { renderScatter } from './modules/charts/scatterChart.js';
import { renderHeatmap } from './modules/charts/heatmapChart.js';
import { renderLineChart } from './modules/charts/lineChart.js';
import { initChartTabs } from './modules/chartTabs.js';
import { initMetricObservers, updateMetrics } from './modules/metrics.js';
import { syncNarrative } from './modules/copy.js';
import { initSmoothScroll, initKeyboardTabs } from './modules/interactions.js';

const getActivePeriod = () =>
  document.querySelector('[data-period-tab].is-active')?.getAttribute('data-period-tab') || SCATTER_PERIODS[0].key;

const renderAllCharts = () => {
  if (!appState.data) return;
  const { rentData, scatterData, heatmapData } = appState.data;

  destroyAllCharts();
  if (rentData) {
    renderBarChart(rentData, appState.theme);
    renderMultiples(rentData, appState.theme);
    renderLineChart(rentData, appState.theme);
  }
  if (scatterData) {
    renderScatter(scatterData, appState.theme, getActivePeriod());
  }
  if (heatmapData) {
    renderHeatmap(heatmapData, appState.theme);
  }
};

const refreshAfterTheme = (theme) => {
  appState.theme = theme;
  renderAllCharts();
};

const bootstrap = async () => {
  initTheme(refreshAfterTheme);
  initViewportAnimations();
  initProgressBar();
  initSmoothScroll();
  initKeyboardTabs();
  initMetricObservers();

  try {
    const { rentData, scatterData, heatmapData, summary } = await loadData();
    setData({ rentData, scatterData, heatmapData });
    setSummary(summary);

    renderAllCharts();
    updateMetrics();
    syncNarrative();
    initChartTabs();
  } catch (error) {
    console.error('Initialization error:', error);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

export { bootstrap as init, renderAllCharts };
