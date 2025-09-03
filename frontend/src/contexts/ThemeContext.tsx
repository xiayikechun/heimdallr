import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { THEMES, STORAGE_KEYS } from '../utils/constants';

type Theme = typeof THEMES[keyof typeof THEMES];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as Theme;
    return savedTheme || THEMES.SYSTEM;
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      let actualTheme = theme;
      
      if (theme === THEMES.SYSTEM) {
        actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
          ? THEMES.DARK 
          : THEMES.LIGHT;
      }

      const isDarkTheme = actualTheme === THEMES.DARK;
      setIsDark(isDarkTheme);

      // 更新document class
      const root = document.documentElement;
      if (isDarkTheme) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    updateTheme();

    // 监听系统主题变化
    if (theme === THEMES.SYSTEM) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}