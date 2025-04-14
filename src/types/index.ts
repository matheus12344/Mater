// Tipos e interfaces
type TabType = 'Viagem' | 'Serviços' | 'Atividade' | 'Conta';
type PageType = 
  | 'Home' 
  | 'Serviços' 
  | 'Atividade' 
  | 'Conta' 
  | 'DetalhesServiço' 
  | 'DetalhesAtividade' 
  | 'Settings' 
  | 'Privacy' 
  | 'Map' 
  | 'Emergency' 
  | 'Payments' 
  | 'Points'
  | 'DetalhesVeículo'
  | 'Chat'
  | 'Community'
  | 'Referral';

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

interface CommunityPost {
  id: string;
  user: UserData;
  content: string;
  likes: number;
  comments: Comment[];  
  routeSnapshot: string;
  timestamp: Date;
}

interface Comment {
  id: string; 
  user: UserData;
  content: string;
  timestamp: Date;
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
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'admin' | 'user';
    status: 'active' | 'inactive';
    lastLogin: Date;
    createdAt: Date;
    profileImage: string;
    vehicles: Vehicle[];
    referralCode: string;
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

  type Coordinates = {
    latitude: number;
    longitude: number;
  };

  //Criando a interface para navegação
  type RootStackParamList = {
    Map: { route: string; services: any }; 
    Payment: {
      service: string;
      amount: number;
      serviceDetails: {
        pickup: Coordinates;
        destination: Coordinates;
        distance: number;
        coordinates: Coordinates[];
        vehicleType: string;
      };
    };
    Home: {
      selectedTab: string;
      setSelectedTab: (tab: string) => void;
      styles: any;
      colors: any;
      theme: Theme;
    };
    Services: {
      services: any[];
      handleServiceSelect: (service: any) => void;
      styles: any;
      colors: any;
      scale: number;
    };
    Profile: {
      userData: any;
      setUserData: (data: any) => void;
      styles: any;
      colors: any;
      theme: Theme;
    };
    AdminDashboard: undefined;
    AdminUsers: undefined;
    AdminServices: {
      onServiceUpdate: (service: any) => void;
    };
    AdminAnalytics: undefined;
    AdminNotifications: undefined;
    AdminSystemSettings: undefined;
    ServiceDetails: {
      service: any;
      onChat: () => void;
      onBack: () => void;
      styles: any;
      colors: any;
      theme: Theme;
    };
    Login: undefined;
    AdminTabs: undefined;
    UserTabs: undefined;
  };
  
  
  interface NavigationButtonProps {
    page: PageType;
    label: string;
    icon: string;
    activePage: PageType;
    theme: 'light' | 'dark';
    onPress: () => void;
  }
  

export type { 
  TabType, 
  PageType, 
  SuggestionItem, 
  ActivityItem, 
  UserData, 
  Vehicle, 
  NavigationButtonProps, 
  ServiceItem, 
  LocationType, 
  ServicePricing, 
  RootStackParamList,
  CommunityPost,
  Comment
};

export type accountOptions = {
  id: string;
  icon: string;
  title: string;
  screen: string;
}[];

export interface Workshop {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  rating: number;
  distance: number;
  services: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  status: 'read' | 'unread';
  createdAt: Date;
}

export interface AuthContextData {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  loading: boolean;
  isAuthenticated: boolean;
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
    fontFamily: string;
    fontSize: {
      small: number;
      medium: number;
      large: number;
    };
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isAdmin: boolean;
}