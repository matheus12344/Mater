import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAccessibility } from '../context/AccessibilityContext';

interface AccessibleIconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  style?: ViewStyle;
  label?: string;
  hint?: string;
  onPress?: () => void;
  disabled?: boolean;
}

export const AccessibleIcon: React.FC<AccessibleIconProps> = ({
  name,
  size = 24,
  color,
  style,
  label,
  hint,
  onPress,
  disabled = false,
}) => {
  const { getAccessibilityStyles } = useAccessibility();
  const accessibilityStyles = getAccessibilityStyles();

  const IconComponent = (
    <View
      style={[
        styles.container,
        style,
        disabled && styles.disabled,
      ]}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityRole={onPress ? 'button' : 'image'}
      accessibilityState={{ disabled }}
    >
      <Ionicons
        name={name}
        size={size}
        color={color || accessibilityStyles.text.color}
      />
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }: { pressed: boolean }) => [
          styles.pressable,
          pressed && styles.pressed,
        ]}
      >
        {IconComponent}
      </Pressable>
    );
  }

  return IconComponent;
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  pressable: {
    borderRadius: 20,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
}); 