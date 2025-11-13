import { registerChart } from '../state.js';
import { baseChartOptions, getChartColors, withAlpha } from './base.js';

export const renderHeatmap = (data, theme) => {
  const canvas = document.getElementById('chart-heatmap');
  if (!canvas || !data) return;
  if (typeof Chart === 'undefined') return;

  const palette = getChartColors(theme);
  const ctx = canvas.getContext('2d');
  const years = data.years ?? [];
  const boroughs = data.boroughs ?? [];
  const values = data.values ?? [];

  const colorForValue = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value) || value === 0) {
      return withAlpha(palette.grid, 0.18);
    }
    const intensity = Math.min(Math.abs(value) / 8, 1);
    const lightness = 68 - intensity * 22;
    const chroma = 0.16 + intensity * 0.12;
    const hue = value > 0 ? 50 : 305;
    const alpha = 0.32 + intensity * 0.48;
    return `oklch(${lightness}% ${chroma} ${hue} / ${alpha})`;
  };

  const options = baseChartOptions(theme);
  options.plugins.legend.display = true;
  options.plugins.legend.position = 'top';
  options.plugins.legend.labels = {
    ...options.plugins.legend.labels,
    font: { size: 11 },
    boxWidth: 12,
  };
  options.plugins.tooltip = {
    ...options.plugins.tooltip,
    borderColor: withAlpha(palette.grid, 0.6),
    callbacks: {
      label: (context) => `${context.dataset.label}: ${context.parsed.y > 0 ? '+' : ''}${context.parsed.y.toFixed(1)}%`,
    },
  };
  options.scales.x = {
    ...options.scales.x,
    ticks: {
      ...options.scales.x.ticks,
      maxRotation: 45,
      minRotation: 45,
    },
    grid: { display: false },
    stacked: false,
  };
  options.scales.y = {
    ...options.scales.y,
    ticks: {
      ...options.scales.y.ticks,
      callback: (value) => `${value}%`,
    },
    grid: {
      color: withAlpha(palette.grid, 0.3),
      drawBorder: false,
    },
    stacked: false,
  };

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: years,
      datasets: boroughs.map((borough, index) => ({
        label: borough,
        data: values[index] ?? [],
        backgroundColor: (values[index] ?? []).map((v) => colorForValue(v)),
        borderColor: withAlpha(palette.surface, 0.6),
        borderWidth: 1,
      })),
    },
    options,
  });

  registerChart('heatmap', chart);
};
