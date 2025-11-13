import { appState, setTheme } from './state.js';

const DARK_THEME_COLOR = '#0b1221';
const LIGHT_THEME_COLOR = '#f5f7fb';

export const initTheme = (onChange) => {
  const toggle = document.querySelector('[data-theme-toggle]');
  const html = document.documentElement;
  const metaTheme = document.querySelector('meta[name="theme-color"]');

  const applyTheme = (theme) => {
    const normalized = theme === 'light' ? 'light' : 'dark';
    html.setAttribute('data-theme', normalized);
    setTheme(normalized);
    if (metaTheme) {
      metaTheme.content = normalized === 'dark' ? DARK_THEME_COLOR : LIGHT_THEME_COLOR;
    }
    onChange?.(normalized);
  };

  toggle?.addEventListener('click', () => {
    const nextTheme = appState.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  applyTheme(appState.theme);
};
