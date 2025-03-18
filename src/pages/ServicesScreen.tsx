import React from 'react';
import { View, Text, FlatList } from 'react-native';
import ServiceCard from '../components/ServiceCard';

// Tipo do objeto de serviço
export interface ServiceItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface ServicesScreenProps {
  services: ServiceItem[];
  handleServiceSelect: (service: ServiceItem) => void;
  styles: any;
  colors: any;
  scale: (size: number) => number;
}

const ServicesScreen: React.FC<ServicesScreenProps> = ({
  services,
  handleServiceSelect,
  styles,
  colors,
  scale,
}) => {
  return (
    <View style={styles.servicesContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Serviços Disponíveis
      </Text>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.servicesList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ServiceCard
            service={item}
            onPress={() => handleServiceSelect(item)}
            styles={styles}
            colors={colors}
            scale={scale}
          />
        )}
      />
    </View>
  );
};

export default ServicesScreen;
