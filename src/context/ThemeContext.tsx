import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { createStyles } from '../styles/theme';

interface ThemeContextType {
  theme: 'light' | 'dark';
  colors: {
    background: string;
    primary: string;
    primaryDark: string;
    text: string;
    card: string;
    cardDark: string;
    border: string;
    placeholder: string;
    success: string;
  };
  styles: ReturnType<typeof createStyles>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const colorSchemes = {
  light: {
    background: '#FFFFFF',
    primary: '#6200EE',
    primaryDark: '#3700B3',
    text: '#000000',
    card: '#F5F5F5',
    cardDark: '#E0E0E0',
    border: '#E0E0E0',
    placeholder: '#9E9E9E',
    success: '#4CAF50',
  },
  dark: {
    background: '#121212',
    primary: '#BB86FC',
    primaryDark: '#3700B3',
    text: '#FFFFFF',
    card: '#1E1E1E',
    cardDark: '#2D2D2D',
    border: '#2D2D2D',
    placeholder: '#757575',
    success: '#81C784',
  },
};

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark'>(colorScheme || 'light');
  const colors = colorSchemes[theme];
  const styles = createStyles(theme);

  useEffect(() => {
    setTheme(colorScheme || 'light');
  }, [colorScheme]);

  return (
    <ThemeContext.Provider value={{ theme, colors, styles }}>
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