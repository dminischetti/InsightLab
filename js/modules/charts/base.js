const COLOR_TOKENS = {
  dark: {
    primary: 'oklch(74% 0.23 220)',
    secondary: 'oklch(70% 0.21 300)',
    tertiary: 'oklch(68% 0.2 20)',
    text: 'oklch(92% 0.01 250)',
    textMuted: 'oklch(70% 0.015 250)',
    grid: 'oklch(36% 0.015 250 / 0.28)',
    surface: 'oklch(21% 0.016 250)',
    boroughs: [
      'oklch(74% 0.23 220)',
      'oklch(70% 0.21 300)',
      'oklch(72% 0.2 160)',
      'oklch(68% 0.21 40)',
      'oklch(69% 0.2 345)',
    ],
  },
  light: {
    primary: 'oklch(60% 0.16 220)',
    secondary: 'oklch(58% 0.16 300)',
    tertiary: 'oklch(62% 0.18 30)',
    text: 'oklch(24% 0.018 250)',
    textMuted: 'oklch(48% 0.015 250)',
    grid: 'oklch(84% 0.01 250 / 0.6)',
    surface: 'oklch(96% 0.01 250)',
    boroughs: [
      'oklch(60% 0.16 220)',
      'oklch(58% 0.16 300)',
      'oklch(62% 0.18 30)',
      'oklch(58% 0.16 160)',
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
    layout: { padding: 16 },
    interaction: { mode: 'index', intersect: false },
    hover: { mode: 'nearest', intersect: false },
    animation: {
      duration: 600,
      easing: 'easeOutQuad',
    },
    elements: {
      line: {
        borderJoinStyle: 'round',
        borderCapStyle: 'round',
      },
      point: {
        radius: 0,
        hoverRadius: 4,
        hoverBorderWidth: 2,
      },
    },
    plugins: {
      legend: {
        labels: {
          color: palette.textMuted,
          usePointStyle: true,
          pointStyle: 'line',
          boxWidth: 14,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: withAlpha(palette.surface, 0.95),
        titleColor: palette.text,
        bodyColor: palette.textMuted,
        borderColor: withAlpha(palette.grid, 0.6),
        borderWidth: 1,
        padding: 14,
        displayColors: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: palette.textMuted,
          font: { size: 11 },
          padding: 8,
        },
        grid: {
          color: withAlpha(palette.grid, 0.35),
          drawBorder: false,
          borderDash: [2, 10],
        },
      },
      y: {
        ticks: {
          color: palette.textMuted,
          font: { size: 11 },
          padding: 12,
        },
        grid: {
          color: withAlpha(palette.grid, 0.35),
          drawBorder: false,
          borderDash: [2, 10],
        },
      },
    },
  };
};
