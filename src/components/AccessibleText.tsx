import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';

interface AccessibleTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  role?: 'header' | 'text' | 'summary';
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
}

export const AccessibleText: React.FC<AccessibleTextProps> = ({
  children,
  style,
  role = 'text',
  importantForAccessibility = 'auto',
}) => {
  const { getAccessibilityStyles } = useAccessibility();
  const accessibilityStyles = getAccessibilityStyles();

  const getAccessibilityRole = () => {
    switch (role) {
      case 'header':
        return 'header';
      case 'summary':
        return 'summary';
      default:
        return 'text';
    }
  };

  return (
    <Text
      style={[styles.text, accessibilityStyles.text, style]}
      accessibilityRole={getAccessibilityRole()}
      importantForAccessibility={importantForAccessibility}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
}); 