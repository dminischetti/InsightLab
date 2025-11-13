const COLOR_TOKENS = {
  dark: {
    primary: 'oklch(78% 0.18 210)',
    secondary: 'oklch(72% 0.18 280)',
    tertiary: 'oklch(68% 0.17 350)',
    text: 'oklch(92% 0.01 250)',
    textMuted: 'oklch(72% 0.015 250)',
    grid: 'oklch(34% 0.018 250 / 0.35)',
    surface: 'oklch(22% 0.018 250)',
    boroughs: [
      'oklch(78% 0.18 210)',
      'oklch(72% 0.18 280)',
      'oklch(76% 0.17 150)',
      'oklch(70% 0.18 60)',
      'oklch(70% 0.16 20)',
    ],
  },
  light: {
    primary: 'oklch(60% 0.16 210)',
    secondary: 'oklch(58% 0.16 280)',
    tertiary: 'oklch(62% 0.18 30)',
    text: 'oklch(24% 0.018 250)',
    textMuted: 'oklch(48% 0.015 250)',
    grid: 'oklch(88% 0.01 250 / 0.6)',
    surface: 'oklch(96% 0.01 250)',
    boroughs: [
      'oklch(60% 0.16 210)',
      'oklch(58% 0.16 280)',
      'oklch(62% 0.18 30)',
      'oklch(58% 0.16 150)',
      'oklch(56% 0.14 340)',
    ],
  },
};

export const getChartColors = (theme) => {
  return COLOR_TOKENS[theme === 'light' ? 'light' : 'dark'];
};

export const withAlpha = (color, alpha) => {
  if (!color.startsWith('oklch')) return color;
  const [model, values] = color.split('(');
  const params = values.replace(')', '').split(' ');
  if (params.length < 3) return color;
  return `${model}(${params[0]} ${params[1]} ${params[2]} / ${alpha})`;
};

export const baseChartOptions = (theme) => {
  const palette = getChartColors(theme);
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 12 },
    plugins: {
      legend: {
        labels: {
          color: palette.textMuted,
          usePointStyle: true,
          pointStyle: 'line',
        },
      },
      tooltip: {
        backgroundColor: withAlpha(palette.surface, 0.95),
        titleColor: palette.text,
        bodyColor: palette.textMuted,
        borderColor: palette.grid,
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
          color: withAlpha(palette.grid, 0.6),
        },
      },
      y: {
        ticks: {
          color: palette.textMuted,
          font: { size: 11 },
        },
        grid: {
          color: withAlpha(palette.grid, 0.6),
        },
      },
    },
  };
};
