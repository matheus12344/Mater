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
  | 'DetalhesVeículo'
  | 'Referral'
  | 'Community'
  | 'SeguroPro'
  | 'SeguroProBeneficio';

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'cancelled';
  icon: string;
  price?: number;
  serviceId?: string;
  vehicle?: {
    model: string;
    plate: string;
    color: string;
  };
  location?: {
    address?: string;
    coords: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  price?: number;
  distance?: number;
  status?: 'active' | 'completed' | 'cancelled';
  date?: Date;
  userId?: string;
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
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  lastLogin: Date;
  createdAt: Date;
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

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Services: undefined;
  ServiceDetails: { serviceId: string };
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminServices: undefined;
  AdminAnalytics: undefined;
  AdminNotifications: undefined;
  AdminSystemSettings: undefined;
  UserTabs: undefined;
  AdminTabs: undefined;
};

export interface ServiceManagementProps {
  onServiceUpdate: (serviceId: string, updatedData: any) => void;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  status: 'read' | 'unread';
  createdAt: string;
  userId?: string;
}

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: {
      fontSize: number;
      fontWeight: string;
    };
    h2: {
      fontSize: number;
      fontWeight: string;
    };
    body: {
      fontSize: number;
      fontWeight: string;
    };
    caption: {
      fontSize: number;
      fontWeight: string;
    };
  };
}