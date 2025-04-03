import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';

export const useFontSize = () => {
  const { fontSize, increaseFontSize, decreaseFontSize } = useAccessibility();

  const getScaledFontSize = useCallback((baseSize: number) => {
    const scaleFactor = fontSize / 16; // 16 is the default font size
    return baseSize * scaleFactor;
  }, [fontSize]);

  const showFontSizeInfo = useCallback(() => {
    Alert.alert(
      'Tamanho da Fonte',
      `Tamanho atual: ${fontSize}px\n\nUse os botões de volume para ajustar o tamanho.`,
      [{ text: 'OK' }]
    );
  }, [fontSize]);

  return {
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    getScaledFontSize,
    showFontSizeInfo,
  };
}; 