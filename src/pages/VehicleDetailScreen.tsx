import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Vehicle } from '../types';
import SmartFeaturesService from '../services/SmartFeaturesService';

interface VehicleDetailScreenProps {
  vehicle: Vehicle;
  onBack: () => void;
  styles: any;
  colors: any;
  scale: (size: number) => number;
}

const VehicleDetailScreen: React.FC<VehicleDetailScreenProps> = ({
  vehicle,
  onBack,
  styles,
  colors,
  scale,
}) => {
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<any>(null);
  const [insuranceQuote, setInsuranceQuote] = useState<any>(null);
  const [serviceHistory, setServiceHistory] = useState<any[]>([]);
  const smartFeaturesService = SmartFeaturesService.getInstance();

  useEffect(() => {
    loadVehicleData();
  }, [vehicle]);

  const loadVehicleData = async () => {
    try {
      // Carrega dados de manutenção
      const maintenance = await smartFeaturesService.scheduleMaintenance(vehicle.id, 'oil');
      setMaintenanceSchedule(maintenance);

      // Carrega cotação de seguro
      const quote = await smartFeaturesService.getInsuranceQuote(vehicle.id);
      setInsuranceQuote(quote);

      // Carrega histórico de serviços (exemplo)
      setServiceHistory([
        {
          id: '1',
          date: '2024-03-15',
          service: 'Troca de Óleo',
          status: 'completed',
          price: 150.00,
        },
        {
          id: '2',
          date: '2024-02-20',
          service: 'Alinhamento',
          status: 'completed',
          price: 80.00,
        },
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados do veículo:', error);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.detailHeaderContainer}>
        <TouchableOpacity style={styles.detailBackButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={scale(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.detailHeaderTitle, { color: colors.text }]}>
          Detalhes do Veículo
        </Text>
      </View>

      {/* Hero Section */}
      <View style={[localStyles.heroContainer, { backgroundColor: vehicle.color }]}>
        <Ionicons name="car-sport" size={scale(60)} color="#fff" />
        <Text style={[localStyles.heroTitle, { color: '#fff' }]}>
          {vehicle.model}
        </Text>
        <Text style={[localStyles.heroPlate, { color: '#fff' }]}>
          {vehicle.plate}
        </Text>
      </View>

      {/* Informações Principais */}
      <View style={localStyles.mainInfoContainer}>
        <View style={[localStyles.infoCard, { backgroundColor: colors.card }]}>
          <View style={localStyles.infoRow}>
            <Ionicons name="calendar" size={24} color={colors.primary} />
            <View style={localStyles.infoTextContainer}>
              <Text style={[localStyles.infoLabel, { color: colors.placeholder }]}>
                Ano/Modelo
              </Text>
              <Text style={[localStyles.infoValue, { color: colors.text }]}>
                2020
              </Text>
            </View>
          </View>
          <View style={localStyles.infoRow}>
            <Ionicons name="color-palette" size={24} color={colors.primary} />
            <View style={localStyles.infoTextContainer}>
              <Text style={[localStyles.infoLabel, { color: colors.placeholder }]}>
                Cor
              </Text>
              <Text style={[localStyles.infoValue, { color: colors.text }]}>
                {vehicle.color}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Próxima Manutenção */}
      {maintenanceSchedule && (
        <View style={localStyles.sectionContainer}>
          <Text style={[localStyles.sectionTitle, { color: colors.text }]}>
            Próxima Manutenção
          </Text>
          <View style={[localStyles.maintenanceCard, { backgroundColor: colors.card }]}>
            <View style={localStyles.maintenanceHeader}>
              <Ionicons name="construct-outline" size={24} color="#FF9800" />
              <Text style={[localStyles.maintenanceTitle, { color: colors.text }]}>
                {maintenanceSchedule.service}
              </Text>
            </View>
            <Text style={[localStyles.maintenanceDate, { color: colors.placeholder }]}>
              Próxima: {maintenanceSchedule.nextDate}
            </Text>
          </View>
        </View>
      )}

      {/* Seguro */}
      {insuranceQuote && (
        <View style={localStyles.sectionContainer}>
          <Text style={[localStyles.sectionTitle, { color: colors.text }]}>
            Seguro
          </Text>
          <View style={[localStyles.insuranceCard, { backgroundColor: colors.card }]}>
            <View style={localStyles.insuranceHeader}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#9C27B0" />
              <Text style={[localStyles.insuranceTitle, { color: colors.text }]}>
                {insuranceQuote.provider}
              </Text>
            </View>
            <Text style={[localStyles.insurancePrice, { color: colors.primary }]}>
              R$ {insuranceQuote.price.toFixed(2)}
            </Text>
            <Text style={[localStyles.insuranceValidity, { color: colors.placeholder }]}>
              Validade: {insuranceQuote.validity}
            </Text>
          </View>
        </View>
      )}

      {/* Histórico de Serviços */}
      <View style={localStyles.sectionContainer}>
        <Text style={[localStyles.sectionTitle, { color: colors.text }]}>
          Histórico de Serviços
        </Text>
        {serviceHistory.map(service => (
          <View 
            key={service.id} 
            style={[localStyles.serviceCard, { backgroundColor: colors.card }]}
          >
            <View style={localStyles.serviceHeader}>
              <Ionicons name="construct" size={24} color={colors.primary} />
              <Text style={[localStyles.serviceTitle, { color: colors.text }]}>
                {service.service}
              </Text>
            </View>
            <View style={localStyles.serviceDetails}>
              <Text style={[localStyles.serviceDate, { color: colors.placeholder }]}>
                {service.date}
              </Text>
              <Text style={[localStyles.servicePrice, { color: colors.primary }]}>
                R$ {service.price.toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const localStyles = StyleSheet.create({
  heroContainer: {
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  heroPlate: {
    fontSize: 18,
    opacity: 0.9,
    marginTop: 5,
  },
  mainInfoContainer: {
    padding: 16,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  sectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  maintenanceCard: {
    borderRadius: 16,
    padding: 16,
  },
  maintenanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  maintenanceTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  maintenanceDate: {
    fontSize: 14,
  },
  insuranceCard: {
    borderRadius: 16,
    padding: 16,
  },
  insuranceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insuranceTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  insurancePrice: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  insuranceValidity: {
    fontSize: 14,
  },
  serviceCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceDate: {
    fontSize: 14,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VehicleDetailScreen; 