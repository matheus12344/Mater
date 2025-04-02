import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DriverVerification {
  id: string;
  name: string;
  photo: string;
  documentNumber: string;
  vehiclePlate: string;
  rating: number;
  verified: boolean;
}

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number;
}

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

class SecurityService {
  private static instance: SecurityService;
  private emergencyContacts: EmergencyContact[] = [];
  private locationHistory: LocationData[] = [];
  private isPanicModeActive: boolean = false;

  private constructor() {}

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // Verificação de identidade do motorista
  async verifyDriverIdentity(driverId: string): Promise<DriverVerification> {
    try {
      // Aqui você implementaria a lógica real de verificação
      // Por exemplo, consultando uma API de verificação de documentos
      const driverData: DriverVerification = {
        id: driverId,
        name: "Motorista Exemplo",
        photo: "url_da_foto",
        documentNumber: "123.456.789-00",
        vehiclePlate: "ABC1234",
        rating: 4.8,
        verified: true
      };

      await AsyncStorage.setItem(`driver_${driverId}`, JSON.stringify(driverData));
      return driverData;
    } catch (error) {
      console.error('Erro na verificação do motorista:', error);
      throw new Error('Falha na verificação do motorista');
    }
  }

  // Compartilhamento de localização em tempo real
  async startLocationSharing(): Promise<void> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permissão de localização negada');
      }

      // Inicia o monitoramento de localização
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp,
            accuracy: location.coords.accuracy ?? 0
          };

          this.locationHistory.push(locationData);
          // Limita o histórico a 100 posições
          if (this.locationHistory.length > 100) {
            this.locationHistory.shift();
          }

          // Aqui você implementaria a lógica para enviar a localização para o servidor
          this.sendLocationToServer(locationData);
        }
      );
    } catch (error) {
      console.error('Erro ao iniciar compartilhamento de localização:', error);
      throw error;
    }
  }

  // Botão de pânico
  async activatePanicMode(): Promise<void> {
    try {
      this.isPanicModeActive = true;
      
      // Obtém a localização atual
      const location = await Location.getCurrentPositionAsync({});
      
      // Envia alerta para autoridades
      await this.sendEmergencyAlert(location);
      
      // Notifica contatos de emergência
      await this.notifyEmergencyContacts(location);
      
      // Inicia gravação de áudio/vídeo
      await this.startEmergencyRecording();
      
      Alert.alert(
        'Modo de Emergência Ativado',
        'Autoridades e contatos de emergência foram notificados.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erro ao ativar modo de emergência:', error);
      throw error;
    }
  }

  // Histórico detalhado com fotos e avaliações
  async saveServiceHistory(serviceId: string, photos: string[], rating: number, comments: string): Promise<void> {
    try {
      const historyData = {
        serviceId,
        photos,
        rating,
        comments,
        timestamp: new Date().toISOString(),
        location: await Location.getCurrentPositionAsync({})
      };

      const existingHistory = await AsyncStorage.getItem('service_history');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      history.push(historyData);
      
      await AsyncStorage.setItem('service_history', JSON.stringify(history));
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
      throw error;
    }
  }

  // Métodos privados auxiliares
  private async sendLocationToServer(locationData: LocationData): Promise<void> {
    // Implementar lógica de envio para o servidor
    console.log('Enviando localização:', locationData);
  }

  private async sendEmergencyAlert(location: Location.LocationObject): Promise<void> {
    // Implementar lógica de envio de alerta para autoridades
    const emergencyMessage = `🚨 ALERTA DE EMERGÊNCIA 🚨\nLocalização: ${location.coords.latitude}, ${location.coords.longitude}`;
    console.log('Enviando alerta:', emergencyMessage);
  }

  private async notifyEmergencyContacts(location: Location.LocationObject): Promise<void> {
    // Implementar lógica de notificação para contatos de emergência
    for (const contact of this.emergencyContacts) {
      console.log(`Notificando contato: ${contact.name}`);
    }
  }

  private async startEmergencyRecording(): Promise<void> {
    // Implementar lógica de gravação de áudio/vídeo
    console.log('Iniciando gravação de emergência');
  }
}

export default SecurityService; 