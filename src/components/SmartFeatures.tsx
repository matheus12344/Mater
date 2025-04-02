import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SmartFeaturesService from '../services/SmartFeaturesService';

interface SmartFeatureProps {
  vehicleId: string;
}

const SmartFeatures: React.FC<SmartFeatureProps> = ({ vehicleId }) => {
  const [loading, setLoading] = useState(false);
  const [pricePrediction, setPricePrediction] = useState<any>(null);
  const [nearbyWorkshops, setNearbyWorkshops] = useState<any[]>([]);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<any>(null);
  const [insuranceQuote, setInsuranceQuote] = useState<any>(null);

  const smartFeaturesService = SmartFeaturesService.getInstance();

  useEffect(() => {
    loadSmartFeatures();
  }, [vehicleId]);

  const loadSmartFeatures = async () => {
    setLoading(true);
    try {
      // Carrega previsão de preço
      const prediction = await smartFeaturesService.predictPrice('guincho', 10);
      setPricePrediction(prediction);

      // Carrega oficinas próximas
      const workshops = await smartFeaturesService.findNearbyWorkshops('carro');
      setNearbyWorkshops(workshops);

      // Carrega agendamento de manutenção
      await smartFeaturesService.scheduleMaintenance(vehicleId, 'oil');
      const quote = await smartFeaturesService.getInsuranceQuote(vehicleId);
      setInsuranceQuote(quote);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as funcionalidades inteligentes');
    } finally {
      setLoading(false);
    }
  };

  const renderPricePrediction = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="cash-outline" size={24} color="#4CAF50" />
        <Text style={styles.cardTitle}>Previsão de Preço</Text>
      </View>
      {pricePrediction && (
        <View style={styles.cardContent}>
          <Text style={styles.priceText}>
            R$ {pricePrediction.predictedPrice.toFixed(2)}
          </Text>
          <Text style={styles.detailText}>
            Baseado em:
          </Text>
          <Text style={styles.detailText}>
            • Distância: {pricePrediction.distance} km
          </Text>
          <Text style={styles.detailText}>
            • Horário: {pricePrediction.timeOfDay}
          </Text>
          <Text style={styles.detailText}>
            • Demanda: {Math.round(pricePrediction.demand * 100)}%
          </Text>
        </View>
      )}
    </View>
  );

  const renderNearbyWorkshops = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="construct-outline" size={24} color="#2196F3" />
        <Text style={styles.cardTitle}>Oficinas Próximas</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {nearbyWorkshops.map(workshop => (
          <TouchableOpacity key={workshop.id} style={styles.workshopCard}>
            <Text style={styles.workshopName}>{workshop.name}</Text>
            <Text style={styles.workshopDistance}>{workshop.distance} km</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFC107" />
              <Text style={styles.ratingText}>{workshop.rating}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderMaintenanceSchedule = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="calendar-outline" size={24} color="#FF9800" />
        <Text style={styles.cardTitle}>Próxima Manutenção</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.maintenanceText}>
          Troca de Óleo
        </Text>
        <Text style={styles.dateText}>
          Próxima: 15/05/2024
        </Text>
      </View>
    </View>
  );

  const renderInsuranceQuote = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="shield-checkmark-outline" size={24} color="#9C27B0" />
        <Text style={styles.cardTitle}>Cotação de Seguro</Text>
      </View>
      {insuranceQuote && (
        <View style={styles.cardContent}>
          <Text style={styles.insuranceProvider}>
            {insuranceQuote.provider}
          </Text>
          <Text style={styles.insurancePrice}>
            R$ {insuranceQuote.price.toFixed(2)}
          </Text>
          <Text style={styles.insuranceValidity}>
            Validade: {insuranceQuote.validity}
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {renderPricePrediction()}
      {renderNearbyWorkshops()}
      {renderMaintenanceSchedule()}
      {renderInsuranceQuote()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  cardContent: {
    marginTop: 8,
  },
  priceText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  workshopCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 160,
  },
  workshopName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  workshopDistance: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  maintenanceText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  insuranceProvider: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  insurancePrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#9C27B0',
    marginBottom: 4,
  },
  insuranceValidity: {
    fontSize: 14,
    color: '#666',
  },
});

export default SmartFeatures; 