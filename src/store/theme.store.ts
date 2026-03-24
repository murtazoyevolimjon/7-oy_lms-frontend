export const themeStore = {
  getTheme: () => localStorage.getItem('theme') || 'light',
  setTheme: (theme: 'light' | 'dark') => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  init: () => {
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  },
};