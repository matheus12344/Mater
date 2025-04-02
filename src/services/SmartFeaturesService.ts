import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PricePrediction {
  basePrice: number;
  distance: number;
  timeOfDay: string;
  demand: number;
  predictedPrice: number;
}

interface Workshop {
  id: string;
  name: string;
  address: string;
  rating: number;
  distance: number;
  specialties: string[];
  availability: boolean;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

class SmartFeaturesService {
  private static instance: SmartFeaturesService;

  private constructor() {}

  public static getInstance(): SmartFeaturesService {
    if (!SmartFeaturesService.instance) {
      SmartFeaturesService.instance = new SmartFeaturesService();
    }
    return SmartFeaturesService.instance;
  }

  async predictPrice(serviceType: string, distance: number): Promise<PricePrediction> {
    const basePrice = distance * 2.5;
    const timeOfDay = this.getTimeOfDay();
    const demand = 0.7;
    const predictedPrice = basePrice * (timeOfDay === 'night' ? 1.2 : 1) * (demand > 0.8 ? 1.1 : 1);

    return {
      basePrice,
      distance,
      timeOfDay,
      demand,
      predictedPrice
    };
  }

  async findNearbyWorkshops(vehicleType: string): Promise<Workshop[]> {
    const location = await Location.getCurrentPositionAsync({});
    return [{
      id: '1',
      name: 'Oficina Central',
      address: 'Rua Principal, 123',
      rating: 4.8,
      distance: 2.5,
      specialties: ['Mecânica', 'Elétrica'],
      availability: true,
      coordinates: {
        latitude: location.coords.latitude + 0.01,
        longitude: location.coords.longitude + 0.01
      }
    }];
  }

  async scheduleMaintenance(vehicleId: string, serviceType: string): Promise<void> {
    const nextService = new Date();
    nextService.setMonth(nextService.getMonth() + 6);
    await AsyncStorage.setItem(`maintenance_${vehicleId}`, JSON.stringify({
      serviceType,
      nextService: nextService.toISOString()
    }));
  }

  async getInsuranceQuote(vehicleId: string): Promise<any> {
    return {
      provider: 'SeguroPro',
      coverage: 'Completa',
      price: 1500,
      validity: '12 meses'
    };
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'night';
  }
}

export default SmartFeaturesService; 