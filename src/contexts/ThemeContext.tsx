import React, { createContext, useContext, useState, useCallback } from 'react';
import { lightTheme } from '../theme';
import { Theme } from '../types';

interface ThemeContextData {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const darkTheme: Theme = {
    ...lightTheme,
    colors: {
      ...lightTheme.colors,
      background: '#000000',
      text: '#FFFFFF',
    },
  };

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: isDarkMode ? darkTheme : lightTheme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 