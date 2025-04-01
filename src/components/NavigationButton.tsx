import React, { useRef } from 'react';
import { Animated, Text, TouchableWithoutFeedback } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { scale } from 'react-native-size-matters';

// Ajuste o tipo PageType conforme sua estrutura, se estiver usando TypeScript.
interface NavigationButtonProps {
  page: string;
  label: string;
  icon: string;
  activePage: string;
  theme: 'light' | 'dark';
  onPress: () => void;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  page,
  label,
  icon,
  activePage,
  theme,
  onPress
}) => {
  const { colors, styles } = useTheme();
  const isActive = activePage === page;

  const animatedTranslateX = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.spring(animatedTranslateX, {
      toValue: -5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedTranslateX, {
      toValue: 0,
      friction: 7,
      tension: 70,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.navButton,
          {
            transform: [{ translateX: animatedTranslateX }],
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Navegar para ${label}`}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={scale(24)}
          color={isActive ? colors.primary : colors.text}
        />
        <Text
          style={[
            styles.navText,
            { color: isActive ? colors.primary : colors.text },
            isActive && styles.activeNavText
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default NavigationButton;
