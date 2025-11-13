import { registerChart } from '../state.js';
import { getChartColors } from './base.js';

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
      return 'oklch(50% 0.02 250 / 0.18)';
    }
    const intensity = Math.min(Math.abs(value) / 8, 1.4);
    if (value > 0) {
      return `oklch(${70 - intensity * 20}% ${0.16 + intensity * 0.08} 60 / ${0.35 + intensity * 0.35})`;
    }
    return `oklch(${70 - intensity * 20}% ${0.16 + intensity * 0.08} 260 / ${0.35 + intensity * 0.35})`;
  };

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: years,
      datasets: boroughs.map((borough, index) => ({
        label: borough,
        data: values[index] ?? [],
        backgroundColor: (values[index] ?? []).map((v) => colorForValue(v)),
        borderColor: palette.surface,
        borderWidth: 1,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: palette.textMuted,
            font: { size: 11 },
            boxWidth: 12,
            padding: 12,
          },
        },
        tooltip: {
          backgroundColor: palette.surface,
          titleColor: palette.text,
          bodyColor: palette.textMuted,
          borderColor: palette.grid,
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (context) => `${context.dataset.label}: ${context.parsed.y > 0 ? '+' : ''}${context.parsed.y.toFixed(1)}%`,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: palette.textMuted,
            maxRotation: 45,
            minRotation: 45,
          },
          grid: { display: false },
          stacked: false,
        },
        y: {
          ticks: {
            color: palette.textMuted,
            callback: (value) => `${value}%`,
          },
          grid: { color: palette.grid },
          stacked: false,
        },
      },
    },
  });

  registerChart('heatmap', chart);
};
