import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';

export const useHighContrast = () => {
  const { isHighContrast, toggleHighContrast } = useAccessibility();

  const showHighContrastInfo = useCallback(() => {
    Alert.alert(
      'Modo de Alto Contraste',
      `Modo de alto contraste está ${isHighContrast ? 'ativado' : 'desativado'}.\n\nEste modo aumenta o contraste entre elementos para melhor visibilidade.`,
      [{ text: 'OK' }]
    );
  }, [isHighContrast]);

  const getContrastColor = useCallback((lightColor: string, darkColor: string) => {
    return isHighContrast ? '#FFFFFF' : lightColor;
  }, [isHighContrast]);

  const getContrastBackground = useCallback((lightColor: string, darkColor: string) => {
    return isHighContrast ? '#000000' : lightColor;
  }, [isHighContrast]);

  return {
    isHighContrast,
    toggleHighContrast,
    showHighContrastInfo,
    getContrastColor,
    getContrastBackground,
  };
}; 