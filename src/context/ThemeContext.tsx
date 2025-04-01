import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { createStyles, colorSchemes } from '../styles/theme';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof colorSchemes.light;
  styles: ReturnType<typeof createStyles>;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  colors: colorSchemes.light,
  styles: createStyles('light'),
});

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [theme, setTheme] = useState(Appearance.getColorScheme() as 'light' | 'dark');
  const colors = colorSchemes[theme];
  const styles = createStyles(theme);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors, styles }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);