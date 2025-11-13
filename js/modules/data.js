export const SCATTER_PERIODS = [
  { key: '2010-2013', start: 2010, end: 2013 },
  { key: '2014-2016', start: 2014, end: 2016 },
  { key: '2017-2020', start: 2017, end: 2020 },
  { key: '2021-2024', start: 2021, end: 2024 },
];

const fetchJson = async (url) => {
  try {
    const response = await fetch(url);
    if (!response?.ok) return null;
    return response.json();
  } catch (error) {
    console.warn(`Unable to fetch ${url}`, error);
    return null;
  }
};

export const loadData = async () => {
  const [vizPayload, summary] = await Promise.all([
    fetchJson('./data/viz_payload.json'),
    fetchJson('./data/derived_summary.json'),
  ]);

  if (!vizPayload) {
    console.warn('Visualization payload missing. Charts will wait for data.');
    return { rentData: null, scatterData: {}, heatmapData: null, summary: summary ?? null };
  }

  const boroughs = vizPayload.boroughs ?? [];
  const years = vizPayload.years ?? [];

  const rentSeries = {};
  boroughs.forEach((borough) => {
    rentSeries[borough] = vizPayload.series?.[borough]?.median_rent ?? [];
  });

  const rentData = {
    labels: boroughs,
    values: boroughs.map((borough) => {
      if (summary?.rent_growth?.[borough]?.endValue) {
        return summary.rent_growth[borough].endValue;
      }
      const rents = rentSeries[borough];
      return rents?.length ? rents[rents.length - 1] : 0;
    }),
    years,
    boroughs,
    series: rentSeries,
  };

  const scatterPoints = vizPayload.scatter ?? [];
  const scatterData = {};
  SCATTER_PERIODS.forEach(({ key }) => {
    scatterData[key] = [];
  });

  scatterPoints.forEach((point) => {
    if (!point || typeof point.year !== 'number') return;
    const enriched = {
      x: Number(point.x ?? 0),
      y: Number(point.y ?? 0),
      r: Number(point.r ?? 0),
      label: `${point.borough ?? 'Unknown'} ${point.year}`,
      borough: point.borough,
      year: point.year,
    };
    const period = SCATTER_PERIODS.find((range) => point.year >= range.start && point.year <= range.end);
    if (period) {
      scatterData[period.key].push(enriched);
    }
  });

  const heatmapSource = vizPayload.heatmap ?? {};
  const heatmapData = {
    years: heatmapSource.years ?? years,
    boroughs: heatmapSource.boroughs ?? boroughs,
    values: (heatmapSource.matrix ?? []).map((row = []) => row.map((value) => (typeof value === 'number' ? value : 0))),
  };

  return { rentData, scatterData, heatmapData, summary: summary ?? null };
};
