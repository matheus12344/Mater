import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceItem } from '../pages/ServicesScreen';

interface ServiceCardProps {
  service: ServiceItem;
  onPress: () => void;
  styles: any;
  colors: any;
  scale: (size: number) => number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onPress,
  styles,
  colors,
  scale,
}) => {
  return (
    <TouchableOpacity
      style={[styles.serviceCard, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <View style={[styles.serviceIconContainer, { backgroundColor: service.color + '20' }]}>
        <Ionicons name={service.icon as any} size={scale(28)} color={service.color} />
      </View>
      <Text style={[styles.serviceTitle, { color: colors.text }]}>
        {service.title}
      </Text>
      <Text style={[styles.serviceDescription, { color: colors.placeholder }]}>
        {service.description}
      </Text>
    </TouchableOpacity>
  );
};

export default ServiceCard;
