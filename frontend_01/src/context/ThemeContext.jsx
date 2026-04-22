import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

/**
 * ThemeProvider
 * - Persists theme choice in localStorage
 * - Applies 'dark' or 'light' class to <html>
 * - Temporarily disables CSS transitions during switch to prevent flicker
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('tf-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    // Respect OS preference on first visit
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;

    // Flash-free transition: disable animations briefly
    root.classList.add('no-transitions');
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    localStorage.setItem('tf-theme', theme);

    // Re-enable after next paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('no-transitions');
      });
    });
  }, [theme]);

  const toggleTheme = () =>
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
