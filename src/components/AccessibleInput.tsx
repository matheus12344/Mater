import React from 'react';
import { TextInput, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';

interface AccessibleInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label: string;
  hint?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  disabled?: boolean;
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  hint,
  style,
  textStyle,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  disabled = false,
}) => {
  const { getAccessibilityStyles } = useAccessibility();
  const accessibilityStyles = getAccessibilityStyles();

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={accessibilityStyles.text.color}
      style={[
        styles.input,
        accessibilityStyles.text,
        style,
        textStyle,
        disabled && styles.disabled,
      ]}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityRole="text"
      accessibilityState={{ disabled }}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      multiline={multiline}
      editable={!disabled}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  disabled: {
    opacity: 0.5,
  },
}); 