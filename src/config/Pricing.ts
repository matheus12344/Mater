import { ServicePricing } from "src/types";

export const servicePricing: { [key: string]: ServicePricing } = {
    '1': { // Guincho 24h
      id: '1',
      baseRate: 300,
      perKm: 8.50,
      minimumKm: 5,
      description: 'Taxa mínima para os primeiros 5km',
      formula: 'Preço = R$300 + R$8,50/km adicional'
    },
    '2': { // Bateria
      id: '2',
      baseRate: 150,
      perKm: 5.00,
      minimumKm: 0,
      description: 'Taxa fixa + deslocamento',
      formula: 'Preço = R$150 + R$5,00/km'
    },
    '3': { // SOS Estrada
      id: '3',
      baseRate: 200,
      perKm: 10.00,
      minimumKm: 10,
      description: 'Atendimento emergencial 24h',
      formula: 'Preço = R$200 + R$10,00/km adicional'
    },
    '4': { // Chaveiro
      id: '4',
      baseRate: 120,
      perKm: 6.00,
      minimumKm: 0,
      description: 'Taxa técnica + deslocamento',
      formula: 'Preço = R$120 + R$6,00/km'
    },
    '5': { // Combustível
      id: '5',
      baseRate: 50,
      perKm: 4.50,
      minimumKm: 0,
      description: 'Custo do combustível + entrega',
      formula: 'Preço = R$50 + R$4,50/km + valor do combustível'
    },
    '6': { // Reparos Leves
      id: '6',
      baseRate: 180,
      perKm: 7.00,
      minimumKm: 5,
      description: 'Mão de obra básica + deslocamento',
      formula: 'Preço = R$180 + R$7,00/km adicional'
    }
  };