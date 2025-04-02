export interface User {
  id: string;
  email: string;
  name: string;
  profile_image: string;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  name: string;
  type: string;
  license_plate: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  user_id: string;
  vehicle_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  pickup_location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  delivery_location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      vehicles: {
        Row: Vehicle;
        Insert: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>>;
      };
      services: {
        Row: Service;
        Insert: Omit<Service, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Service, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
} 