// Tipos e interfaces
type TabType = 'Viagem' | 'Serviços';
type PageType = 'Home' | 'Serviços' | 'Atividade' | 'Conta' | 'DetalhesServiço' | 'DetalhesAtividade' | 'DetalhesVeículo';
interface SuggestionItem {
    id: number;
    name: string;
    description?: string;
}

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
    image: string;
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
  
  
  interface NavigationButtonProps {
    page: PageType;
    label: string;
    icon: string;
    activePage: PageType;
    theme: 'light' | 'dark';
    onPress: () => void;
  }
  

export type { TabType, PageType, SuggestionItem, ActivityItem, UserData, Vehicle, NavigationButtonProps, ServiceItem };