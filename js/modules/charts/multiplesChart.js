import { registerChart } from '../state.js';
import { baseChartOptions, getChartColors, withAlpha } from './base.js';

export const renderMultiples = (data, theme) => {
  const container = document.querySelector('[data-chart-multiples]');
  if (!container || !data) return;
  if (typeof Chart === 'undefined') return;

  container.innerHTML = '';
  const palette = getChartColors(theme);

  const values = Object.values(data.series ?? {}).flat().filter((value) => typeof value === 'number');
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;

  const charts = (data.boroughs ?? []).map((borough, index) => {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `${borough} median rent trend from ${data.years?.[0] ?? 2010} to ${data.years?.slice(-1)[0] ?? 2024}`);
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const options = baseChartOptions(theme);
    options.plugins.legend.display = false;
    options.scales.x.ticks.maxTicksLimit = 5;
    options.scales.y.min = min * 0.95;
    options.scales.y.max = max * 1.05;
    options.scales.y.ticks.callback = (value) => `$${Number(value).toLocaleString()}`;
    options.plugins.tooltip.callbacks = {
      label: (context) => `$${context.parsed.y.toLocaleString()} (${context.label})`,
    };

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.years,
        datasets: [
          {
            label: borough,
            data: data.series?.[borough] ?? [],
            borderColor: palette.boroughs[index % palette.boroughs.length],
            backgroundColor: withAlpha(palette.boroughs[index % palette.boroughs.length], 0.16),
            borderWidth: 2.4,
            fill: true,
            tension: 0.32,
            pointRadius: 0,
          },
        ],
      },
      options,
    });
  });

  registerChart('multiples', charts);
};
