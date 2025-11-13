import { appState } from './state.js';
import { renderScatter } from './charts/scatterChart.js';
import { SCATTER_PERIODS } from './data.js';

export const initChartTabs = () => {
  const tabs = document.querySelectorAll('[data-period-tab]');
  if (!tabs.length) return;

  if (!document.querySelector('[data-period-tab].is-active') && tabs[0]) {
    tabs[0].classList.add('is-active');
    tabs[0].setAttribute('aria-selected', 'true');
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((other) => {
        other.classList.remove('is-active');
        other.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      const period = tab.getAttribute('data-period-tab') || SCATTER_PERIODS[0].key;
      renderScatter(appState.data?.scatterData, appState.theme, period);
    });
  });
};
