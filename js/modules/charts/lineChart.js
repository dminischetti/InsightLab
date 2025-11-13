import { registerChart } from '../state.js';
import { baseChartOptions, getChartColors } from './base.js';

export const renderLineChart = (data, theme) => {
  const canvas = document.getElementById('chart-line');
  if (!canvas || !data) return;
  if (typeof Chart === 'undefined') return;

  const palette = getChartColors(theme);
  const ctx = canvas.getContext('2d');
  const options = baseChartOptions(theme);
  options.plugins.legend.display = true;
  options.plugins.legend.position = 'bottom';
  options.scales.y.ticks.callback = (value) => `$${Number(value).toLocaleString()}`;

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.years,
      datasets: (data.boroughs ?? []).map((borough, index) => ({
        label: borough,
        data: data.series?.[borough] ?? [],
        borderColor: palette.boroughs[index % palette.boroughs.length],
        borderWidth: 2.4,
        tension: 0.32,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointHoverBorderWidth: 2,
      })),
    },
    options,
  });

  registerChart('line', chart);
};
