import React, { useState } from 'react';
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

export interface ServiceItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  vehicleId?: string; // Novo campo
  licensePlate?: string; // Novo campo
  location?: { // Novo campo
    latitude: number;
    longitude: number;
    address?: string;
  };
}

type ServiceDetailScreenProps = {
  service: ServiceItem;
  onBack: () => void;
  styles: any;
  colors: any;
  scale: (size: number) => number;
  userVehicles: Vehicle[]; // Add this line
};

const ServiceDetailScreen: React.FC<ServiceDetailScreenProps> = ({
  service,
  onBack,
  styles,
  colors,
  scale,
  userVehicles,
}) => {
  // Estado para controlar a visibilidade do modal
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [incidentLocation, setIncidentLocation] = useState<{ 
    coords: { latitude: number; longitude: number },
    address?: string 
  } | null>(null);
  const { addActivity } = useActivities();

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
          <Text style={[localStyles.modalTitle, { color: colors.text }]}>
            Detalhes da Solicitação
          </Text>

          {/* Seletor de Veículo */}
          <Text style={[localStyles.modalLabel, { color: colors.text }]}>Veículo:</Text>
          <View style={localStyles.vehicleSelector}>
            {userVehicles.map(vehicle => (
              <TouchableOpacity
                key={vehicle.id}
                style={[
                  localStyles.vehicleOption,
                  selectedVehicle?.id === vehicle.id && 
                    { backgroundColor: colors.primary + '20' }
                ]}
                onPress={() => setSelectedVehicle(vehicle)}
              >
                <Text style={{ color: colors.text }}>{vehicle.model}</Text>
                <Text style={{ color: colors.placeholder }}>{vehicle.plate}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Localização */}
          <Text style={[localStyles.modalLabel, { color: colors.text }]}>Localização:</Text>
          <TouchableOpacity 
            style={localStyles.locationButton}
            onPress={getCurrentLocation}
          >
            <Ionicons name="location" size={20} color={colors.primary} />
            <Text style={{ color: colors.primary, marginLeft: 8 }}>
              {incidentLocation?.address || 'Obter localização atual'}
            </Text>
          </TouchableOpacity>

          {/* Botões de Ação */}
          <View style={localStyles.modalButtonsContainer}>
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
            { backgroundColor: service.color + 'DD' }
          ]}
          onPress={handleSolicitar}
        >
          <Text style={[styles.detailActionButtonText, { color: '#fff' }]}>
            Solicitar
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
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 8,
  },
  vehicleSelector: {
    marginBottom: 16,
  },
  vehicleOption: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#00000010',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00000010',
  },
});

export default ServiceDetailScreen;
