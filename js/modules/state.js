const createState = () => ({
  theme: localStorage.getItem('insightlab-theme') || 'dark',
  charts: new Map(),
  data: null,
  summary: null,
  observers: {
    counter: null,
  },
});

export const appState = createState();

export const registerChart = (key, instance) => {
  const existing = appState.charts.get(key);
  if (Array.isArray(existing)) {
    existing.forEach((chart) => chart?.destroy?.());
  } else {
    existing?.destroy?.();
  }
  appState.charts.set(key, instance);
};

export const destroyAllCharts = () => {
  appState.charts.forEach((chart) => {
    if (Array.isArray(chart)) {
      chart.forEach((instance) => instance?.destroy?.());
    } else {
      chart?.destroy?.();
    }
  });
  appState.charts.clear();
};

export const setTheme = (theme) => {
  appState.theme = theme;
  localStorage.setItem('insightlab-theme', theme);
};

export const setData = (payload) => {
  appState.data = payload;
};

export const setSummary = (summary) => {
  appState.summary = summary;
};
