import { setTheme } from './state.js';

const DARK_THEME_COLOR = '#0b1221';

export const initTheme = (onChange) => {
  const html = document.documentElement;
  const metaTheme = document.querySelector('meta[name="theme-color"]');

  const applyDarkTheme = () => {
    html.setAttribute('data-theme', 'dark');
    setTheme('dark');
    if (metaTheme) {
      metaTheme.content = DARK_THEME_COLOR;
    }
    onChange?.('dark');
  };

  applyDarkTheme();
};
