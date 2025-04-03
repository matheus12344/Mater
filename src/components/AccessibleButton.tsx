import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';

interface AccessibleButtonProps {
  onPress: () => void;
  label: string;
  hint?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  onPress,
  label,
  hint,
  style,
  textStyle,
  icon,
  disabled = false,
}) => {
  const { getAccessibilityStyles } = useAccessibility();
  const accessibilityStyles = getAccessibilityStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        accessibilityStyles.button,
        style,
        disabled && styles.disabled,
      ]}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {icon && <>{icon}</>}
      <Text
        style={[
          styles.text,
          accessibilityStyles.text,
          textStyle,
          disabled && styles.disabledText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    textAlign: 'center',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
}); 