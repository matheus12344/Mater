import { Workshop } from '../types';

class WorkshopService {
  private static instance: WorkshopService;
  private workshops: Workshop[] = [];

  private constructor() {
    // Inicializar com algumas oficinas de exemplo
    this.workshops = [
      {
        id: '1',
        name: 'Oficina do João',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        phone: '(11) 99999-9999',
        rating: 4.8,
        distance: 2.5,
        services: ['Manutenção Geral', 'Troca de Óleo', 'Alinhamento'],
        coordinates: {
          latitude: -23.550520,
          longitude: -46.633308
        }
      },
      {
        id: '2',
        name: 'Auto Center Silva',
        address: 'Av. Paulista, 456',
        city: 'São Paulo',
        state: 'SP',
        phone: '(11) 98888-8888',
        rating: 4.6,
        distance: 3.2,
        services: ['Manutenção Geral', 'Troca de Óleo', 'Alinhamento', 'Pintura'],
        coordinates: {
          latitude: -23.561570,
          longitude: -46.655800
        }
      },
      {
        id: '3',
        name: 'Mecânica Express',
        address: 'Rua Augusta, 789',
        city: 'São Paulo',
        state: 'SP',
        phone: '(11) 97777-7777',
        rating: 4.9,
        distance: 1.8,
        services: ['Manutenção Geral', 'Troca de Óleo', 'Alinhamento', 'Diagnóstico'],
        coordinates: {
          latitude: -23.548940,
          longitude: -46.638820
        }
      }
    ];
  }

  public static getInstance(): WorkshopService {
    if (!WorkshopService.instance) {
      WorkshopService.instance = new WorkshopService();
    }
    return WorkshopService.instance;
  }

  // Calcular distância entre dois pontos usando a fórmula de Haversine
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  // Buscar as 3 oficinas mais próximas
  public async getNearbyWorkshops(
    userLatitude: number,
    userLongitude: number,
    limit: number = 3
  ): Promise<Workshop[]> {
    try {
      // Calcular distância para cada oficina
      const workshopsWithDistance = this.workshops.map(workshop => ({
        ...workshop,
        distance: this.calculateDistance(
          userLatitude,
          userLongitude,
          workshop.coordinates.latitude,
          workshop.coordinates.longitude
        )
      }));

      // Ordenar por distância e retornar as mais próximas
      return workshopsWithDistance
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);
    } catch (error) {
      console.error('Erro ao buscar oficinas próximas:', error);
      throw error;
    }
  }

  // Buscar todas as oficinas
  public async getAllWorkshops(): Promise<Workshop[]> {
    return this.workshops;
  }

  // Buscar oficina por ID
  public async getWorkshopById(id: string): Promise<Workshop | undefined> {
    return this.workshops.find(workshop => workshop.id === id);
  }
}

export default WorkshopService; 