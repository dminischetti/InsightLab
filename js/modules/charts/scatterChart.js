import { registerChart } from '../state.js';
import { baseChartOptions, getChartColors, withAlpha } from './base.js';

export const renderScatter = (scatterData, theme, periodKey) => {
  const canvas = document.getElementById('chart-scatter');
  if (!canvas || !scatterData) return;
  if (typeof Chart === 'undefined') return;

  const palette = getChartColors(theme);
  const periodData = scatterData?.[periodKey] ?? [];
  const boroughs = [...new Set(periodData.map((point) => point.borough))];

  const ctx = canvas.getContext('2d');
  const options = baseChartOptions(theme);
  options.plugins.legend.display = true;
  options.plugins.legend.position = 'bottom';
  options.scales.x.title = { display: true, text: 'Median household income (USD/year)', color: palette.textMuted };
  options.scales.y.title = { display: true, text: 'Median rent (USD/month)', color: palette.textMuted };
  options.scales.x.ticks.callback = (value) => `$${(Number(value) / 1000).toFixed(0)}k`;
  options.scales.y.ticks.callback = (value) => `$${(Number(value) / 1000).toFixed(1)}k`;
  options.plugins.tooltip.callbacks = {
    title: (contexts) => contexts?.[0]?.raw?.label ?? '',
    label: (context) => [
      `Income: $${context.parsed.x.toLocaleString()}`,
      `Rent: $${context.parsed.y.toLocaleString()}`,
      `Transit index: ${Math.round(context.raw.r)}`,
    ],
  };

  const chart = new Chart(ctx, {
    type: 'bubble',
    data: {
      datasets: boroughs.map((borough, index) => ({
        label: borough,
        data: periodData.filter((point) => point.borough === borough),
        borderColor: palette.boroughs[index % palette.boroughs.length],
        backgroundColor: withAlpha(palette.boroughs[index % palette.boroughs.length], 0.5),
        borderWidth: 2,
        parsing: false,
      })),
    },
    options,
  });

  registerChart('scatter', chart);
};
