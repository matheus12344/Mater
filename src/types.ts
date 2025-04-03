export type PageType = 
  | 'Home' 
  | 'Serviços' 
  | 'Atividade' 
  | 'DetalhesAtividade' 
  | 'Conta' 
  | 'DetalhesServiço' 
  | 'Settings' 
  | 'Privacy' 
  | 'Map' 
  | 'Emergency' 
  | 'Payments'
  | 'Points'
  | 'Chat'
  | 'DetalhesVeículo';

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'cancelled';
  icon: string;
  price?: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  price?: number;
  distance?: number;
}

export interface SuggestionItem {
  id: number;
  title: string;
  src: string;
  name: string;
  image: string | any;
  placeId: string;
  subtitle?: string;
  lat: number;
  lon: number;
  color: string;
}

export interface UserData {
  name: string;
  email: string;
  vehicles: Vehicle[];
}

export interface Vehicle {
  id: string;
  model: string;
  plate: string;
  color: string;
}

export type TabType = 'Viagem' | 'Serviços' | 'Atividade' | 'Conta';

export interface NavigationButtonProps {
  page: string;
  label: string;
  icon: string;
  activePage: PageType;
  theme: 'light' | 'dark';
  onPress: () => void;
} 