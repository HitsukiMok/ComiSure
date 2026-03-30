import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('comisure-theme');
      if (stored === 'dark' || stored === 'light') return stored;
      // Fall back to system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  // Keep html class in sync on initial mount and every change
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('comisure-theme', theme);
  }, [theme]);

  /**
   * Toggle the theme with a circular View Transition ripple
   * originating from the toggle button's position.
   * @param {MouseEvent} e – the click event from the button
   */
  const toggleTheme = (e) => {
    const x = e?.clientX ?? window.innerWidth / 2;
    const y = e?.clientY ?? window.innerHeight / 2;
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    // Prefer View Transitions API for the sleek circle reveal
    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    // Inject the click coordinates as CSS custom properties
    document.documentElement.style.setProperty('--tw-x', `${x}px`);
    document.documentElement.style.setProperty('--tw-y', `${y}px`);

    document.startViewTransition(() => {
      setTheme(nextTheme);
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
