import React, { useRef } from 'react';
import { Text, TouchableWithoutFeedback, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Ajuste o tipo PageType conforme sua estrutura, se estiver usando TypeScript.
interface NavigationButtonProps {
  page: string;
  label: string;
  icon: string;
  activePage: string;
  onPress: () => void;
  styles: any;
  colors: any;
  scale: (size: number) => number;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  page,
  label,
  icon,
  activePage,
  onPress,
  styles,
  colors,
  scale
}) => {
  const isActive = activePage === page;

  // Valor animado de escala (inicia em 1)
  const animatedScale = useRef(new Animated.Value(1)).current;

  // Quando o botão é pressionado
  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.95,     // encolhe um pouco
      useNativeDriver: true,
    }).start();
  };

  // Quando o botão é solto
  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,        // volta ao tamanho normal
      friction: 5,
      tension: 100,
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
            transform: [{ scale: animatedScale }],
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
