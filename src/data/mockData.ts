import { ServiceItem, ActivityItem, UserData, accountOptions, SuggestionItem, CommunityPost } from '../types/index';
import guinchoRapido from '../assets/guinchoRapido.png';
import emergency24h from '../assets/emergency24h.jpg';
import cargaPesada from '../assets/cargaPesada.jpg';
import trocaPneu from '../assets/trocaPneu.jpg';
import assistenciaTecnica from '../assets/assistenciaTecnica.png';


export const mockServices: ServiceItem[] = [
  {
    id: '1',
    icon: 'car-sport',
    title: 'Guincho 24h',
    description: 'Serviço de reboque emergencial para qualquer tipo de veículo',
    color: '#FF6B6B',
  },
  {
    id: '2',
    icon: 'battery-charging',
    title: 'Bateria',
    description: 'Recarga ou substituição de bateria veicular',
    color: '#4ECDC4',
  },
  {
    id: '3',
    icon: 'alert-circle',
    title: 'SOS Estrada',
    description: 'Assistência rápida para emergências em rodovias',
    color: '#FF9F43',
  },
  {
    id: '4',
    icon: 'key',
    title: 'Chaveiro',
    description: 'Abertura de veículos com chaves trancadas',
    color: '#6C5CE7',
  },
  {
    id: '5',
    icon: 'water',
    title: 'Combustível',
    description: 'Entrega emergencial de combustível no local',
    color: '#00B894',
  },
  {
    id: '6',
    icon: 'construct',
    title: 'Reparos Leves',
    description: 'Reparos emergenciais para seguir viagem',
    color: '#D63031',
  },
];

export const mockActivities: ActivityItem[] = [
  {
    id: '1',
    date: new Date(2024, 2, 15),
    title: 'Guincho Particular',
    description: 'Remoção do local - Av. Paulista, 1000',
    status: 'completed',
    price: 250.0,
    icon: 'car-sport',
    serviceId: '1',
    vehicle: {
      model: 'Honda Civic 2020',
      plate: 'ABC1D23',
      color: '#FF6B6B',
    },
    location: { address: 'Av. Paulista, 1000', coords: { latitude: -23.561684, longitude: -46.655981 } },
  },
  {
    id: '2',
    date: new Date(2024, 2, 16),
    title: 'Troca de Bateria',
    description: 'Honda Civic 2020 - Bateria 60Ah',
    status: 'pending',
    icon: 'battery-charging',
    serviceId: '2',
    vehicle: {
      model: 'Honda Civic 2020',
      plate: 'ABC1D23',
      color: '#FF6B6B',
    },
    location: { address: 'Rua das Flores, 123', coords: { latitude: -23.561684, longitude: -46.655981 } },
  },
  {
    id: '3',
    date: new Date(2024, 2, 17),
    title: 'SOS Combustível',
    description: 'Entrega de 5L de gasolina',
    status: 'cancelled',
    icon: 'water',
    serviceId: '3',
    vehicle: {
      model: 'Fiat Toro 2022',
      plate: 'XYZ4E56',
      color: '#4ECDC4',
    },
    location: { address: 'Av. Brasil, 456', coords: { latitude: -23.561684, longitude: -46.655981 } },
  },
];

export const mockUserData: UserData = {
  name: 'Matheus Henrique',
  email: 'matheushgevangelista@gmail.com',
  profileImage: 'https://example.com/profile.jpg',
  vehicles: [
    {
      id: '1',
      model: 'Honda Civic 2020',
      plate: 'ABC1D23',
      color: '#FF6B6B',
    },
    {
      id: '2',
      model: 'Fiat Toro 2022',
      plate: 'XYZ4E56',
      color: '#4ECDC4',
    },
  ],
  referralCode: '1234567890',
}; 

export const mockAccountData: accountOptions = [
  { id: '1', icon: 'settings', title: 'Configurações', screen: 'Settings' },
  { id: '2', icon: 'shield-checkmark', title: 'Privacidade', screen: 'Privacy' },
  { id: '3', icon: 'card', title: 'Pagamentos', screen: 'Payments' },
  { id: '4', icon: 'help-circle', title: 'Ajuda', screen: 'Help' },
  { id: '5', icon: 'log-out', title: 'Sair', screen: 'Logout' },
  { id: '6', icon: 'person', title: 'Indicar Amigos', screen: 'Referral'}
];

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: '1',
    user: mockUserData,
    content: 'Ótima rota pela marginal hoje!',
    likes: 42,
    comments: [],
    routeSnapshot: 'https://example.com/route-map.png',
    timestamp: new Date()
  }
];

export const mockSuggestions: SuggestionItem[] = [
  { id: 1, name: 'Guincho Rápido', src: guinchoRapido, title: 'Guincho Rápido', image: guinchoRapido, placeId: 'place1', lat: -23.561684, lon: -46.655981, color: '#FF6B6B' },
  { id: 2, name: 'Emergência 24h', src: emergency24h, title: 'Emergência 24h', image: emergency24h, placeId: 'place2', lat: -23.561684, lon: -46.655981, color: '#4ECDC4' },
  { id: 3, name: 'Carga Pesada', src: cargaPesada, title: 'Carga Pesada', image: cargaPesada, placeId: 'place3', lat: -23.561684, lon: -46.655981, color: '#FF9F43' },
  { id: 4, name: 'Assistência Técnica', src: assistenciaTecnica, title: 'Assistência Técnica', image: assistenciaTecnica, placeId: 'place4', lat: -23.561684, lon: -46.655981, color: '#6C5CE7' },
  { id: 5, name: 'Troca de Pneus', src: trocaPneu, title: 'Troca de Pneus', image: trocaPneu, placeId: 'place5', lat: -23.561684, lon: -46.655981, color: '#00B894' },
];