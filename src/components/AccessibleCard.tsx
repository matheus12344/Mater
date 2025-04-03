import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';

interface AccessibleCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  label?: string;
  hint?: string;
  disabled?: boolean;
}

export const AccessibleCard: React.FC<AccessibleCardProps> = ({
  children,
  onPress,
  style,
  label,
  hint,
  disabled = false,
}) => {
  const { getAccessibilityStyles } = useAccessibility();
  const accessibilityStyles = getAccessibilityStyles();

  const CardContent = (
    <View
      style={[
        styles.card,
        accessibilityStyles.container,
        style,
        disabled && styles.disabled,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed,
        ]}
        accessibilityLabel={label}
        accessibilityHint={hint}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        {CardContent}
      </Pressable>
    );
  }

  return CardContent;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pressable: {
    borderRadius: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
}); 