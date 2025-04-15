import * as Location from 'expo-location';
import { Alert, Linking, Vibration } from 'react-native';
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
  private panicModeActive: boolean = false;
  private lastLocation: Location.LocationObject | null = null;

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

  // Ativa o modo de pânico
  public async activatePanicMode(): Promise<void> {
    try {
      this.panicModeActive = true;
      
      // Obtém a localização atual
      const location = await this.getCurrentLocation();
      if (location) {
        this.lastLocation = location;
        await this.sendEmergencyAlert(location);
      }
      
      // Notifica o usuário
      this.notifyUserOfPanicMode();
      
      console.log('Modo de pânico ativado');
    } catch (error) {
      console.error('Erro ao ativar modo de pânico:', error);
      this.panicModeActive = false;
    }
  }

  // Desativa o modo de pânico
  public deactivatePanicMode(): void {
    this.panicModeActive = false;
    console.log('Modo de pânico desativado');
  }

  // Obtém a localização atual
  private async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permissão de localização negada');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      return location;
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      return null;
    }
  }

  // Envia alerta de emergência
  private async sendEmergencyAlert(location: Location.LocationObject): Promise<void> {
    try {
      // Em um ambiente real, enviaria para um servidor
      // Aqui apenas simulamos o envio
      console.log('Enviando alerta de emergência:', location);
      
      // Salva o alerta no histórico
      await this.saveEmergencyAlert(location);
    } catch (error) {
      console.error('Erro ao enviar alerta de emergência:', error);
    }
  }

  // Salva o alerta de emergência no histórico
  private async saveEmergencyAlert(location: Location.LocationObject): Promise<void> {
    try {
      const alert = {
        timestamp: Date.now(),
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }
      };
      
      const existingAlerts = await AsyncStorage.getItem('emergency_alerts');
      const alerts = existingAlerts ? JSON.parse(existingAlerts) : [];
      
      alerts.push(alert);
      
      await AsyncStorage.setItem('emergency_alerts', JSON.stringify(alerts));
    } catch (error) {
      console.error('Erro ao salvar alerta de emergência:', error);
    }
  }

  // Notifica o usuário sobre o modo de pânico
  private notifyUserOfPanicMode(): void {
    // Vibra o dispositivo para alertar o usuário
    Vibration.vibrate([500, 500, 500], true);
    
    // Em um ambiente real, enviaria notificação push
    // Aqui apenas registramos no console
    console.log('Notificando usuário sobre modo de pânico');
  }

  // Obtém o histórico de alertas de emergência
  public async getEmergencyAlerts(): Promise<any[]> {
    try {
      const alerts = await AsyncStorage.getItem('emergency_alerts');
      return alerts ? JSON.parse(alerts) : [];
    } catch (error) {
      console.error('Erro ao obter histórico de alertas:', error);
      return [];
    }
  }

  // Verifica se o modo de pânico está ativo
  public isPanicModeActive(): boolean {
    return this.panicModeActive;
  }

  // Obtém a última localização conhecida
  public getLastLocation(): Location.LocationObject | null {
    return this.lastLocation;
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

  private async notifyEmergencyContacts(location: Location.LocationObject): Promise<void> {
    // Implementar lógica de notificação para contatos de emergência
    for (const contact of this.emergencyContacts) {
      console.log(`Notificando contato: ${contact.name}`);
    }
  }

  // Inicia o monitoramento de acidentes
  async startAccidentMonitoring(): Promise<void> {
    // Implementar lógica de monitoramento de acidentes
    console.log('Monitoramento de acidentes iniciado pelo SecurityService');
  }

  // Para o monitoramento de acidentes
  stopAccidentMonitoring(): void {
    console.log('Monitoramento de acidentes parado pelo SecurityService');
  }

  // Obtém o histórico de acidentes
  async getAccidentHistory(): Promise<any[]> {
    // Implementar lógica para obter histórico de acidentes
    console.log('Obtendo histórico de acidentes pelo SecurityService');
    return [];
  }

  // Contata serviços de emergência em caso de acidente
  async contactEmergencyServices(accidentData: any): Promise<void> {
    // Implementar lógica para contatar serviços de emergência
    console.log('Contatando serviços de emergência pelo SecurityService');
  }
}

export default SecurityService; 