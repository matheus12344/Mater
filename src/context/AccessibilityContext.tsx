import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccessibilityInfo, useColorScheme } from 'react-native';

interface AccessibilityContextType {
  isHighContrast: boolean;
  fontSize: number;
  isVoiceControlEnabled: boolean;
  toggleHighContrast: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleVoiceControl: () => void;
  getAccessibilityStyles: () => {
    text: {
      fontSize: number;
      color: string;
      backgroundColor: string;
    };
    container: {
      backgroundColor: string;
    };
    button: {
      backgroundColor: string;
      borderWidth: number;
      borderColor: string;
    };
  };
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [isVoiceControlEnabled, setIsVoiceControlEnabled] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Check initial high contrast setting
    AccessibilityInfo.isReduceMotionEnabled().then(reduceMotion => {
      setIsHighContrast(reduceMotion);
    });

    // Listen for accessibility changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      reduceMotion => {
        setIsHighContrast(reduceMotion);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const toggleHighContrast = () => {
    setIsHighContrast(prev => !prev);
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };

  const toggleVoiceControl = () => {
    setIsVoiceControlEnabled(prev => !prev);
  };

  const getAccessibilityStyles = () => {
    const isDark = colorScheme === 'dark';
    return {
      text: {
        fontSize: fontSize,
        color: isHighContrast ? '#FFFFFF' : isDark ? '#FFFFFF' : '#000000',
        backgroundColor: isHighContrast ? '#000000' : 'transparent',
      },
      container: {
        backgroundColor: isHighContrast ? '#000000' : isDark ? '#121212' : '#FFFFFF',
      },
      button: {
        backgroundColor: isHighContrast ? '#FFFFFF' : isDark ? '#BB86FC' : '#6200EE',
        borderWidth: isHighContrast ? 2 : 0,
        borderColor: isHighContrast ? '#FFFFFF' : 'transparent',
      }
    };
  };

  return (
    <AccessibilityContext.Provider
      value={{
        isHighContrast,
        fontSize,
        isVoiceControlEnabled,
        toggleHighContrast,
        increaseFontSize,
        decreaseFontSize,
        toggleVoiceControl,
        getAccessibilityStyles,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}; 