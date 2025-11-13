import { registerChart } from '../state.js';
import { baseChartOptions, getChartColors, withAlpha } from './base.js';

export const renderBarChart = (data, theme) => {
  const canvas = document.getElementById('chart-bar');
  if (!canvas || !data) return;
  if (typeof Chart === 'undefined') return;

  const palette = getChartColors(theme);
  const ctx = canvas.getContext('2d');

  const options = baseChartOptions(theme);
  options.plugins.legend.display = false;
  options.scales.y.beginAtZero = true;
  options.scales.y.ticks.callback = (value) => `$${Number(value).toLocaleString()}`;
  options.plugins.tooltip.callbacks = {
    label: (context) => `$${context.parsed.y.toLocaleString()}/month`,
  };

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'Median rent (USD)',
          data: data.values,
          borderRadius: 14,
          borderSkipped: false,
          backgroundColor: palette.boroughs.map((color) => withAlpha(color, 0.82)),
          borderColor: palette.boroughs.map((color) => withAlpha(color, 0.9)),
          hoverBackgroundColor: palette.boroughs.map((color) => withAlpha(color, 0.95)),
          hoverBorderColor: palette.boroughs.map((color) => withAlpha(color, 1)),
          borderWidth: 1.5,
        },
      ],
    },
    options,
  });

  registerChart('bar', chart);
};
