// Tipos e interfaces
type TabType = 'Viagem' | 'Serviços';
type PageType = 'Home' | 'Serviços' | 'Atividade' | 'Conta' | 'DetalhesServiço' | 'DetalhesAtividade' | 'DetalhesVeículo' | 'Settings' | 'Privacy' | 'Map';
interface SuggestionItem {
    id: number;
    name: string;
    description?: string;
}
type LocationType = {
  title?: string;
  address: string;
  latitude: number;
  longitude: number;
  type?: 'work' | 'home' | 'favorite' | 'searched' | 'current';
};

interface ActivityItem {
  id: string;
  date: Date;
  serviceId: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'cancelled';
  vehicle: {
    model: string;
    plate: string;
    color: string;
  };
  location: {
    address?: string;
    coords: {
      latitude: number;
      longitude: number;
    };
  };
  price?: number;
}
  
  interface ServiceItem {
    id: string;
    icon: string;
    title: string;
    description: string;
    color: string;
  }
  
interface SuggestionItem {
    id: number;
    title: string;
    src: string;
    name: string;
    image: string | any;
    placeId: string;
    subtitle?: string;
    lat: number; // Added latitude property
    lon: number; // Added longitude property
    color: string // Added color property
}
  
  interface ActivityItem {
    id: string;
    date: Date;
    title: string;
    description: string;
    status: 'completed' | 'pending' | 'cancelled';
    price?: number;
    icon: string;
  }
  
  interface UserData {
    name: string;
    email: string;
    profileImage: string;
    vehicles: Vehicle[];
  }
  
  interface Vehicle {
    id: string;
    model: string;
    plate: string;
    color: string;
  }

  // Criando interface para o algoritmo de precificação
  type ServicePricing = {
    id: string;
    baseRate: number;
    perKm: number;
    minimumKm: number;
    description: string;
    formula: string;
  };
  
  
  interface NavigationButtonProps {
    page: PageType;
    label: string;
    icon: string;
    activePage: PageType;
    theme: 'light' | 'dark';
    onPress: () => void;
  }
  

export type { TabType, PageType, SuggestionItem, ActivityItem, UserData, Vehicle, NavigationButtonProps, ServiceItem, LocationType, ServicePricing };