import { supabase } from '../config/supabase';
import { Database } from '../types/supabase';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];
type Vehicle = Tables['vehicles']['Row'];
type Service = Tables['services']['Row'];

export const supabaseService = {
  // Usuários
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateUser(id: string, userData: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Veículos
  async createVehicle(vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('vehicles')
      .insert([vehicleData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getVehiclesByUserId(userId: string) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async updateVehicle(id: string, vehicleData: Partial<Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('vehicles')
      .update(vehicleData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Serviços
  async createService(serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('services')
      .insert([serviceData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getServicesByUserId(userId: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateServiceStatus(id: string, status: Service['status']) {
    const { data, error } = await supabase
      .from('services')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
}; 