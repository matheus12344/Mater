import React, { useState, useEffect } from 'react';
import { 
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActivityItem, Vehicle } from '../types';
import * as Location from 'expo-location';
import { useActivities } from '../context/ActivityContext';
import SmartFeaturesService from '../services/SmartFeaturesService';
import { scale } from 'react-native-size-matters';

export interface ServiceItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  vehicleId?: string;
  licensePlate?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  driverName?: string;
  driverPhoto?: string;
}

type ServiceDetailScreenProps = {
  service: ServiceItem;
  onChat: (event?: any, navigationParams?: { type: string; params: any }) => void;
  onBack: (event?: any, navigationParams?: { type: string; params: any }) => void;
  styles: any;
  colors: any;
  scale: (size: number) => number;
  userVehicles: Vehicle[];
};

interface Workshop {
  id: string;
  name: string;
  address: string;
  rating: number;
  distance: number;
  estimatedTime: number;
  services: string[];
}

const ServiceDetailScreen: React.FC<ServiceDetailScreenProps> = ({
  service,
  onChat,
  styles,
  colors,
  scale,
  userVehicles,
  onBack,
}) => {
  // Estado para controlar a visibilidade do modal
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [incidentLocation, setIncidentLocation] = useState<{ 
    coords: { latitude: number; longitude: number },
    address?: string 
  } | null>(null);
  const [pricePrediction, setPricePrediction] = useState<any>(null);
  const [nearbyWorkshops, setNearbyWorkshops] = useState<any[]>([]);
  const { addActivity } = useActivities();
  const smartFeaturesService = SmartFeaturesService.getInstance();

  useEffect(() => {
    if (incidentLocation) {
      loadSmartFeatures();
    }
  }, [incidentLocation]);

  const loadSmartFeatures = async () => {
    try {
      // Carrega previsão de preço
      const prediction = await smartFeaturesService.predictPrice(service.id, 10);
      setPricePrediction(prediction);

      // Carrega oficinas próximas
      const workshops = await smartFeaturesService.findNearbyWorkshops('carro');
      setNearbyWorkshops(workshops);
    } catch (error) {
      console.error('Erro ao carregar funcionalidades inteligentes:', error);
    }
  };

  // Quando o usuário toca no botão "Solicitar"
  const handleSolicitar = () => {
    setRequestModalVisible(true);
  };

  // Função para obter localização atual
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão de localização negada');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync(location.coords);
      
      setIncidentLocation({
        coords: location.coords,
        address: `${address?.street}, ${address?.city}`
      });
    } catch (error) {
      console.error('Erro ao obter localização:', error);
    }
  };

  // Modal aprimorado
  const renderRequestModal = (colors: any, service: ServiceItem) => (
    <Modal visible={requestModalVisible} animationType="slide" transparent>
      <View style={localStyles.modalOverlay}>
        <View style={[localStyles.modalContainer, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={localStyles.modalHeader}>
            <Text style={[localStyles.modalTitle, { color: colors.text }]}>
              Detalhes da Solicitação
            </Text>
            <TouchableOpacity 
              onPress={handleCancelSolicitar}
              style={localStyles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={localStyles.modalScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={localStyles.modalScrollContent}
          >
            {/* Seletor de Veículo */}
            <View style={localStyles.section}>
              <Text style={[localStyles.sectionTitle, { color: colors.text }]}>
                <Ionicons name="car" size={20} color={colors.primary} /> Veículo
              </Text>
              <View style={localStyles.vehicleSelector}>
                {userVehicles.map(vehicle => (
                  <TouchableOpacity
                    key={vehicle.id}
                    style={[
                      localStyles.vehicleOption,
                      selectedVehicle?.id === vehicle.id && 
                        { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                    ]}
                    onPress={() => setSelectedVehicle(vehicle)}
                  >
                    <Ionicons 
                      name="car-sport" 
                      size={24} 
                      color={selectedVehicle?.id === vehicle.id ? colors.primary : colors.text} 
                    />
                    <View style={localStyles.vehicleInfo}>
                      <Text style={[localStyles.vehicleModel, { color: colors.text }]}>
                        {vehicle.model}
                      </Text>
                      <Text style={[localStyles.vehiclePlate, { color: colors.placeholder }]}>
                        {vehicle.plate}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Localização */}
            <View style={localStyles.section}>
              <Text style={[localStyles.sectionTitle, { color: colors.text }]}>
                <Ionicons name="location" size={20} color={colors.primary} /> Localização
              </Text>
              <TouchableOpacity 
                style={[
                  localStyles.locationButton,
                  { borderColor: colors.border }
                ]}
                onPress={getCurrentLocation}
              >
                <Ionicons name="location" size={20} color={colors.primary} />
                <Text style={[localStyles.locationText, { color: colors.text }]}>
                  {incidentLocation?.address || 'Obter localização atual'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Previsão de Preço */}
            {pricePrediction && (
              <View style={localStyles.section}>
                <Text style={[localStyles.sectionTitle, { color: colors.text }]}>
                  <Ionicons name="cash" size={20} color={colors.primary} /> Previsão de Preço
                </Text>
                <View style={[localStyles.priceCard, { backgroundColor: colors.primary + '10' }]}>
                  <Text style={[localStyles.priceText, { color: colors.primary }]}>
                    R$ {pricePrediction.predictedPrice.toFixed(2)}
                  </Text>
                  <View style={localStyles.priceDetails}>
                    <View style={localStyles.priceDetailItem}>
                      <Ionicons name="navigate" size={16} color={colors.primary} />
                      <Text style={[localStyles.priceDetailText, { color: colors.text }]}>
                        {pricePrediction.distance} km
                      </Text>
                    </View>
                    <View style={localStyles.priceDetailItem}>
                      <Ionicons name="time" size={16} color={colors.primary} />
                      <Text style={[localStyles.priceDetailText, { color: colors.text }]}>
                        {pricePrediction.timeOfDay}
                      </Text>
                    </View>
                    <View style={localStyles.priceDetailItem}>
                      <Ionicons name="trending-up" size={16} color={colors.primary} />
                      <Text style={[localStyles.priceDetailText, { color: colors.text }]}>
                        {Math.round(pricePrediction.demand * 100)}% demanda
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Oficinas Próximas */}
            <View style={localStyles.section}>
              <Text style={[localStyles.sectionTitle, { color: colors.text }]}>
                <Ionicons name="business" size={20} color={colors.primary} /> Oficinas Próximas
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={localStyles.workshopsScroll}
              >
                {nearbyWorkshops.map((workshop: Workshop) => (
                  <TouchableOpacity 
                    key={workshop.id} 
                    style={[
                      localStyles.workshopCard, 
                      { backgroundColor: colors.card }
                    ]}
                    onPress={() => {
                      Alert.alert('Oficina Selecionada', `Você selecionou a oficina ${workshop.name}`);
                    }}
                  >
                    <View style={localStyles.workshopHeader}>
                      <Ionicons name="business" size={24} color={colors.primary} />
                      <Text style={[localStyles.workshopName, { color: colors.text }]}>
                        {workshop.name}
                      </Text>
                    </View>
                    <Text style={[localStyles.workshopAddress, { color: colors.placeholder }]}>
                      {workshop.address}
                    </Text>
                    <View style={localStyles.workshopDetails}>
                      <View style={localStyles.workshopDetailItem}>
                        <Ionicons name="navigate" size={16} color={colors.primary} />
                        <Text style={[localStyles.workshopDetailText, { color: colors.text }]}>
                          {workshop.distance} km
                        </Text>
                      </View>
                      <View style={localStyles.workshopDetailItem}>
                        <Ionicons name="star" size={16} color="#FFC107" />
                        <Text style={[localStyles.workshopDetailText, { color: colors.text }]}>
                          {workshop.rating}
                        </Text>
                      </View>
                      <View style={localStyles.workshopDetailItem}>
                        <Ionicons name="time" size={16} color={colors.primary} />
                        <Text style={[localStyles.workshopDetailText, { color: colors.text }]}>
                          {workshop.estimatedTime} min
                        </Text>
                      </View>
                    </View>
                    <View style={localStyles.workshopServices}>
                      {(workshop.services || []).slice(0, 3).map((service: string, index: number) => (
                        <View key={index} style={[localStyles.serviceTag, { backgroundColor: colors.primary + '10' }]}>
                          <Text style={[localStyles.serviceTagText, { color: colors.primary }]}>
                            {service}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          {/* Botões de Ação */}
          <View style={localStyles.modalFooter}>
            <TouchableOpacity
              style={[localStyles.modalButton, { backgroundColor: colors.border }]}
              onPress={handleCancelSolicitar}
            >
              <Text style={{ color: colors.text }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                localStyles.modalButton, 
                { 
                  backgroundColor: service.color,
                  opacity: selectedVehicle && incidentLocation ? 1 : 0.5
                }
              ]}
              onPress={handleConfirmSolicitar}
              disabled={!selectedVehicle || !incidentLocation}
            >
              <Text style={{ color: '#fff' }}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Confirma a solicitação
  const handleConfirmSolicitar = () => {
    if (!selectedVehicle || !incidentLocation) return;

    const newActivity: Omit<ActivityItem, 'id'> = {
      date: new Date(),
      serviceId: service.id,
      title: service.title,
      description: service.description,
      status: 'pending',
      vehicle: {
        model: selectedVehicle.model,
        plate: selectedVehicle.plate,
        color: selectedVehicle.color
      },
      location: {
        address: incidentLocation.address,
        coords: incidentLocation.coords
      },
      // price: service.price, // Se aplicável
      icon: service.icon // Add this line
    };

    addActivity(newActivity);

    const serviceRequest = {
      service: service.title,
      date: new Date().toISOString(),
      vehicle: {
        model: selectedVehicle.model,
        plate: selectedVehicle.plate,
        color: selectedVehicle.color
      },
      location: incidentLocation,
      status: 'pending'
    };

    console.log('Solicitação de Serviço:', JSON.stringify(serviceRequest, null, 2));
    
    // Exemplo de log formatado:
    console.groupCollapsed('🚨 Nova Solicitação de Serviço');
    console.log('⏰ Data/Hora:', new Date().toLocaleString());
    console.log('🚗 Veículo:', `${selectedVehicle.model} (${selectedVehicle.plate})`);
    console.log('📍 Local:', incidentLocation.address || 'Local não identificado');
    console.log('📌 Coordenadas:', incidentLocation.coords);
    console.log('🛠 Serviço:', service.title);
    console.groupEnd();

    setRequestModalVisible(false);
    Alert.alert(
      'Solicitação Confirmada',
      `Serviço: ${service.title}\nVeículo: ${selectedVehicle.plate}\nLocal: ${incidentLocation.address}`
    );
  };

  // Cancela a solicitação
  const handleCancelSolicitar = () => {
    setRequestModalVisible(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cabeçalho com botão de voltar e título */}
      <View style={styles.detailHeaderContainer}>
        <TouchableOpacity style={styles.detailBackButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={scale(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.detailHeaderTitle, { color: colors.text }]}>
          Detalhes do Serviço
        </Text>
      </View>

      {/* Área de destaque do serviço (Hero) */}
      <View style={[styles.detailHeroContainer, { backgroundColor: service.color }]}>
        <Ionicons 
          name={service.icon as any} 
          size={scale(60)} 
          color="#fff" 
          style={styles.detailHeroIcon} 
        />
        <Text style={[styles.detailHeroTitle, { color: '#fff' }]}>
          {service.title}
        </Text>
      </View>

      {/* Conteúdo principal */}
      <View style={styles.detailContentContainer}>
        {/* Descrição */}
        <Text style={[styles.detailSectionTitle, { color: colors.text }]}>
          Descrição
        </Text>
        <Text style={[styles.detailDescription, { color: colors.placeholder }]}>
          {service.description}
        </Text>

        {/* Benefícios (exemplo) */}
        <Text 
          style={[
            styles.detailSectionTitle, 
            { color: colors.text, marginTop: scale(20) }
          ]}
        >
          Benefícios
        </Text>
        <Text style={[styles.detailDescription, { color: colors.placeholder }]}>
          • Assistência 24h{"\n"}
          • Profissionais qualificados{"\n"}
          • Cobertura nacional
        </Text>

        {/* Botão de ação (Solicitar) */}
        <TouchableOpacity 
          style={[
            styles.detailActionButton, 
            { backgroundColor: service.color}
          ]}
          onPress={handleSolicitar}
        >
          <Text style={[styles.detailActionButtonText, { color: '#fff' }]}>
            Solicitar
          </Text>
        </TouchableOpacity>

        {/* Botão de Chat */}
        <TouchableOpacity 
          style={[
            styles.chatButton,
            { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              marginTop: scale(12)
            }
          ]}
          onPress={() => {
            onChat(0);
            // O componente pai deve lidar com a navegação para o chat
          }}
        >
          <Ionicons name="chatbubble-ellipses" size={scale(20)} color={colors.primary} />
          <Text style={[styles.chatButtonText, { color: colors.text }]}>
            Falar com o Motorista
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL de Confirmação de Solicitação */}
      {renderRequestModal(colors, service)}
    </ScrollView>
  );
};

// Estilos locais para o modal
const localStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  modalScroll: {
    flex: 1,
    maxHeight: '80%',
  },
  modalScrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vehicleSelector: {
    gap: 12,
  },
  vehicleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    gap: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleModel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  vehiclePlate: {
    fontSize: 14,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  locationText: {
    fontSize: 16,
    flex: 1,
  },
  priceCard: {
    padding: 16,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  priceDetails: {
    gap: 8,
  },
  priceDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceDetailText: {
    fontSize: 14,
  },
  workshopsScroll: {
    paddingRight: 16,
    gap: 12,
  },
  workshopCard: {
    width: 280,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  workshopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  workshopName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  workshopAddress: {
    fontSize: 14,
    marginBottom: 12,
  },
  workshopDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  workshopDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workshopDetailText: {
    fontSize: 14,
  },
  workshopServices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  serviceTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(12),
    borderRadius: scale(12),
    borderWidth: 1,
    gap: scale(8),
  },
  chatButtonText: {
    fontSize: scale(16),
    fontWeight: '500',
  },
});

export default ServiceDetailScreen;
