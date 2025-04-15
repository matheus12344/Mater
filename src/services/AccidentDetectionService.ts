import * as Location from 'expo-location';
import { Alert, Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AccelerationData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

interface AccidentData {
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: number;
  severity: 'low' | 'medium' | 'high';
  detected: boolean;
}

class AccidentDetectionService {
  private static instance: AccidentDetectionService;
  private accelerationHistory: AccelerationData[] = [];
  private isMonitoring: boolean = false;
  private lastAccidentCheck: number = 0;
  private accidentThreshold: number = 15; // Valor em m/s² para considerar um acidente

  private constructor() {}

  public static getInstance(): AccidentDetectionService {
    if (!AccidentDetectionService.instance) {
      AccidentDetectionService.instance = new AccidentDetectionService();
    }
    return AccidentDetectionService.instance;
  }

  // Inicia o monitoramento de acidentes
  public async startAccidentMonitoring(): Promise<void> {
    if (this.isMonitoring) return;
    
    try {
      // Verifica permissões de localização
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permissão de localização negada');
      }

      this.isMonitoring = true;
      
      // Inicia o monitoramento de aceleração
      this.startAccelerationMonitoring();
      
      // Inicia o monitoramento de localização
      this.startLocationMonitoring();
      
      console.log('Monitoramento de acidentes iniciado');
    } catch (error) {
      console.error('Erro ao iniciar monitoramento de acidentes:', error);
      this.isMonitoring = false;
    }
  }

  // Para o monitoramento de acidentes
  public stopAccidentMonitoring(): void {
    this.isMonitoring = false;
    console.log('Monitoramento de acidentes parado');
  }

  // Monitora a aceleração do dispositivo
  private startAccelerationMonitoring(): void {
    // Em um ambiente real, usaria o acelerômetro do dispositivo
    // Aqui simulamos com valores aleatórios para demonstração
    const interval = setInterval(() => {
      if (!this.isMonitoring) {
        clearInterval(interval);
        return;
      }

      // Simula dados de aceleração
      const acceleration: AccelerationData = {
        x: (Math.random() * 10) - 5,
        y: (Math.random() * 10) - 5,
        z: (Math.random() * 10) - 5,
        timestamp: Date.now()
      };

      this.accelerationHistory.push(acceleration);
      
      // Mantém apenas os últimos 50 registros
      if (this.accelerationHistory.length > 50) {
        this.accelerationHistory.shift();
      }

      // Verifica se houve um acidente
      this.checkForAccident(acceleration);
    }, 1000); // Verifica a cada segundo
  }

  // Monitora a localização do dispositivo
  private startLocationMonitoring(): void {
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10
      },
      (location) => {
        if (!this.isMonitoring) return;
        
        // Armazena a localização para uso em caso de acidente
        AsyncStorage.setItem('last_location', JSON.stringify({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: location.timestamp
        }));
      }
    );
  }

  // Verifica se houve um acidente com base nos dados de aceleração
  private checkForAccident(acceleration: AccelerationData): void {
    // Calcula a magnitude da aceleração
    const magnitude = Math.sqrt(
      acceleration.x * acceleration.x + 
      acceleration.y * acceleration.y + 
      acceleration.z * acceleration.z
    );

    // Verifica se a magnitude excede o limite e se já passou tempo suficiente desde a última verificação
    const now = Date.now();
    if (magnitude > this.accidentThreshold && (now - this.lastAccidentCheck) > 10000) {
      this.lastAccidentCheck = now;
      
      // Obtém a localização atual
      this.handlePotentialAccident();
    }
  }

  // Manipula um potencial acidente
  private async handlePotentialAccident(): Promise<void> {
    try {
      // Obtém a localização armazenada
      const locationData = await AsyncStorage.getItem('last_location');
      if (!locationData) {
        console.error('Localização não disponível para detecção de acidente');
        return;
      }

      const location = JSON.parse(locationData);
      
      // Cria dados do acidente
      const accidentData: AccidentData = {
        location: {
          latitude: location.latitude,
          longitude: location.longitude
        },
        timestamp: Date.now(),
        severity: this.calculateAccidentSeverity(),
        detected: true
      };

      // Salva os dados do acidente
      await this.saveAccidentData(accidentData);
      
      // Notifica o usuário
      this.notifyUserOfAccident(accidentData);
      
      console.log('Acidente detectado:', accidentData);
    } catch (error) {
      console.error('Erro ao processar acidente detectado:', error);
    }
  }

  // Calcula a severidade do acidente com base nos dados de aceleração
  private calculateAccidentSeverity(): 'low' | 'medium' | 'high' {
    // Em um ambiente real, usaria algoritmos mais sofisticados
    // Aqui usamos uma lógica simples para demonstração
    const recentAccelerations = this.accelerationHistory.slice(-5);
    const maxMagnitude = Math.max(...recentAccelerations.map(a => 
      Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z)
    ));

    if (maxMagnitude < this.accidentThreshold * 1.2) {
      return 'low';
    } else if (maxMagnitude < this.accidentThreshold * 1.5) {
      return 'medium';
    } else {
      return 'high';
    }
  }

  // Salva os dados do acidente
  private async saveAccidentData(accidentData: AccidentData): Promise<void> {
    try {
      const existingData = await AsyncStorage.getItem('accident_history');
      const accidentHistory = existingData ? JSON.parse(existingData) : [];
      
      accidentHistory.push(accidentData);
      
      await AsyncStorage.setItem('accident_history', JSON.stringify(accidentHistory));
    } catch (error) {
      console.error('Erro ao salvar dados do acidente:', error);
    }
  }

  // Notifica o usuário sobre o acidente detectado
  private notifyUserOfAccident(accidentData: AccidentData): void {
    // Vibra o dispositivo para alertar o usuário
    Vibration.vibrate([500, 500, 500], true);
    
    // Em um ambiente real, enviaria notificação push
    // Aqui apenas registramos no console
    console.log('Notificando usuário sobre acidente detectado');
  }

  // Obtém o histórico de acidentes
  public async getAccidentHistory(): Promise<AccidentData[]> {
    try {
      const history = await AsyncStorage.getItem('accident_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Erro ao obter histórico de acidentes:', error);
      return [];
    }
  }
}

export default AccidentDetectionService; 