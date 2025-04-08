import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vehicle } from '../types';

// Interfaces para os recursos de conveniência
export interface MaintenanceSchedule {
  id: string;
  vehicleId: string;
  serviceType: string;
  scheduledDate: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  workshopId?: string;
}

export interface MaintenanceHistory {
  id: string;
  vehicleId: string;
  serviceType: string;
  date: Date;
  workshop: string;
  cost: number;
  mileage: number;
  notes?: string;
  nextServiceDate?: Date;
}

export interface PriceComparison {
  id: string;
  serviceType: string;
  vehicleType: string;
  providers: {
    id: string;
    name: string;
    price: number;
    distance: number;
    rating: number;
  }[];
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  lastUpdated: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  type: 'workshop' | 'service' | 'vehicle';
  itemId: string;
  name: string;
  details: Record<string, any>;
  createdAt: Date;
}

class ConvenienceService {
  private static instance: ConvenienceService;
  private maintenanceSchedules: MaintenanceSchedule[] = [];
  private maintenanceHistory: MaintenanceHistory[] = [];
  private priceComparisons: PriceComparison[] = [];
  private favorites: Favorite[] = [];

  private constructor() {
    this.loadData();
  }

  public static getInstance(): ConvenienceService {
    if (!ConvenienceService.instance) {
      ConvenienceService.instance = new ConvenienceService();
    }
    return ConvenienceService.instance;
  }

  private async loadData() {
    try {
      // Carregar dados do AsyncStorage
      const schedulesData = await AsyncStorage.getItem('maintenance_schedules');
      const historyData = await AsyncStorage.getItem('maintenance_history');
      const comparisonsData = await AsyncStorage.getItem('price_comparisons');
      const favoritesData = await AsyncStorage.getItem('favorites');

      if (schedulesData) this.maintenanceSchedules = JSON.parse(schedulesData);
      if (historyData) this.maintenanceHistory = JSON.parse(historyData);
      if (comparisonsData) this.priceComparisons = JSON.parse(comparisonsData);
      if (favoritesData) this.favorites = JSON.parse(favoritesData);
    } catch (error) {
      console.error('Erro ao carregar dados de conveniência:', error);
    }
  }

  private async saveData() {
    try {
      // Salvar dados no AsyncStorage
      await AsyncStorage.setItem('maintenance_schedules', JSON.stringify(this.maintenanceSchedules));
      await AsyncStorage.setItem('maintenance_history', JSON.stringify(this.maintenanceHistory));
      await AsyncStorage.setItem('price_comparisons', JSON.stringify(this.priceComparisons));
      await AsyncStorage.setItem('favorites', JSON.stringify(this.favorites));
    } catch (error) {
      console.error('Erro ao salvar dados de conveniência:', error);
    }
  }

  // Métodos para agendamento de serviços preventivos
  async scheduleMaintenance(
    vehicleId: string,
    serviceType: string,
    scheduledDate: Date,
    notes?: string,
    workshopId?: string
  ): Promise<MaintenanceSchedule> {
    const newSchedule: MaintenanceSchedule = {
      id: Date.now().toString(),
      vehicleId,
      serviceType,
      scheduledDate,
      status: 'scheduled',
      notes,
      workshopId
    };

    this.maintenanceSchedules.push(newSchedule);
    await this.saveData();
    return newSchedule;
  }

  async getMaintenanceSchedules(vehicleId?: string): Promise<MaintenanceSchedule[]> {
    if (vehicleId) {
      return this.maintenanceSchedules.filter(schedule => schedule.vehicleId === vehicleId);
    }
    return this.maintenanceSchedules;
  }

  async updateMaintenanceSchedule(
    scheduleId: string,
    updates: Partial<MaintenanceSchedule>
  ): Promise<MaintenanceSchedule | null> {
    const index = this.maintenanceSchedules.findIndex(schedule => schedule.id === scheduleId);
    if (index === -1) return null;

    this.maintenanceSchedules[index] = {
      ...this.maintenanceSchedules[index],
      ...updates
    };

    await this.saveData();
    return this.maintenanceSchedules[index];
  }

  async cancelMaintenanceSchedule(scheduleId: string): Promise<boolean> {
    const index = this.maintenanceSchedules.findIndex(schedule => schedule.id === scheduleId);
    if (index === -1) return false;

    this.maintenanceSchedules[index].status = 'cancelled';
    await this.saveData();
    return true;
  }

  // Métodos para histórico de manutenções
  async addMaintenanceRecord(
    vehicleId: string,
    serviceType: string,
    workshop: string,
    cost: number,
    mileage: number,
    notes?: string,
    nextServiceDate?: Date
  ): Promise<MaintenanceHistory> {
    const newRecord: MaintenanceHistory = {
      id: Date.now().toString(),
      vehicleId,
      serviceType,
      date: new Date(),
      workshop,
      cost,
      mileage,
      notes,
      nextServiceDate
    };

    this.maintenanceHistory.push(newRecord);
    await this.saveData();
    return newRecord;
  }

  async getMaintenanceHistory(vehicleId?: string): Promise<MaintenanceHistory[]> {
    if (vehicleId) {
      return this.maintenanceHistory.filter(record => record.vehicleId === vehicleId);
    }
    return this.maintenanceHistory;
  }

  async getNextMaintenanceDate(vehicleId: string, serviceType: string): Promise<Date | null> {
    const records = this.maintenanceHistory
      .filter(record => record.vehicleId === vehicleId && record.serviceType === serviceType)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    if (records.length === 0) return null;
    
    // Se o último registro tem uma data de próximo serviço, retorna ela
    if (records[0].nextServiceDate) {
      return records[0].nextServiceDate;
    }
    
    // Caso contrário, calcula com base no tipo de serviço
    const lastDate = records[0].date;
    const nextDate = new Date(lastDate);
    
    // Diferentes intervalos para diferentes tipos de serviço
    switch (serviceType) {
      case 'Troca de Óleo':
        nextDate.setMonth(nextDate.getMonth() + 6);
        break;
      case 'Alinhamento':
        nextDate.setMonth(nextDate.getMonth() + 12);
        break;
      case 'Revisão Geral':
        nextDate.setMonth(nextDate.getMonth() + 12);
        break;
      default:
        nextDate.setMonth(nextDate.getMonth() + 6);
    }
    
    return nextDate;
  }

  // Métodos para comparativo de preços
  async addPriceComparison(
    serviceType: string,
    vehicleType: string,
    providers: {
      id: string;
      name: string;
      price: number;
      distance: number;
      rating: number;
    }[]
  ): Promise<PriceComparison> {
    const prices = providers.map(p => p.price);
    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);

    const newComparison: PriceComparison = {
      id: Date.now().toString(),
      serviceType,
      vehicleType,
      providers,
      averagePrice,
      lowestPrice,
      highestPrice,
      lastUpdated: new Date()
    };

    // Atualiza ou adiciona a comparação
    const index = this.priceComparisons.findIndex(
      c => c.serviceType === serviceType && c.vehicleType === vehicleType
    );

    if (index !== -1) {
      this.priceComparisons[index] = newComparison;
    } else {
      this.priceComparisons.push(newComparison);
    }

    await this.saveData();
    return newComparison;
  }

  async getPriceComparison(serviceType: string, vehicleType: string): Promise<PriceComparison | null> {
    return this.priceComparisons.find(
      c => c.serviceType === serviceType && c.vehicleType === vehicleType
    ) || null;
  }

  async getAllPriceComparisons(): Promise<PriceComparison[]> {
    return this.priceComparisons;
  }

  // Métodos para sistema de favoritos
  async addFavorite(
    userId: string,
    type: 'workshop' | 'service' | 'vehicle',
    itemId: string,
    name: string,
    details: Record<string, any>
  ): Promise<Favorite> {
    const newFavorite: Favorite = {
      id: Date.now().toString(),
      userId,
      type,
      itemId,
      name,
      details,
      createdAt: new Date()
    };

    this.favorites.push(newFavorite);
    await this.saveData();
    return newFavorite;
  }

  async removeFavorite(favoriteId: string): Promise<boolean> {
    const initialLength = this.favorites.length;
    this.favorites = this.favorites.filter(favorite => favorite.id !== favoriteId);
    
    if (this.favorites.length !== initialLength) {
      await this.saveData();
      return true;
    }
    
    return false;
  }

  async getFavorites(userId: string, type?: 'workshop' | 'service' | 'vehicle'): Promise<Favorite[]> {
    if (type) {
      return this.favorites.filter(favorite => favorite.userId === userId && favorite.type === type);
    }
    return this.favorites.filter(favorite => favorite.userId === userId);
  }

  async isFavorite(userId: string, itemId: string): Promise<boolean> {
    return this.favorites.some(favorite => favorite.userId === userId && favorite.itemId === itemId);
  }
}

export default ConvenienceService;