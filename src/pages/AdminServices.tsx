import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ServiceItem } from '../types';

interface ServiceManagementProps {
  onServiceUpdate: (service: ServiceItem) => void;
}

const AdminServices: React.FC<ServiceManagementProps> = ({ onServiceUpdate }) => {
  const { theme, colors} = useTheme();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      // Aqui você implementará a lógica para buscar os serviços do backend
      // Por enquanto, usando dados mockados
      const mockServices: ServiceItem[] = [
        {
          id: '1',
          title: 'Manutenção Preventiva',
          description: 'Troca de óleo e filtros',
          icon: 'car',
          color: '#2196F3',
          price: 150.00,
          status: 'active',
          date: new Date(),
          userId: 'user1',
        },
        // Adicione mais serviços mockados aqui
      ];
      setServices(mockServices);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      Alert.alert('Erro', 'Não foi possível carregar os serviços');
    }
  };

  const handleServiceStatusChange = async (serviceId: string, newStatus: ServiceItem['status']) => {
    try {
      // Aqui você implementará a lógica para atualizar o status no backend
      const updatedServices = services.map(service =>
        service.id === serviceId ? { ...service, status: newStatus } : service
      );
      setServices(updatedServices);
      Alert.alert('Sucesso', 'Status do serviço atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status do serviço');
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || service.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const renderServiceItem = ({ item }: { item: ServiceItem }) => (
    <View style={[styles.serviceCard, { backgroundColor: colors.card }]}>
      <View style={styles.serviceHeader}>
        <Text style={[styles.serviceTitle, { color: colors.text }]}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{translateStatus(item.status)}</Text>
        </View>
      </View>
      
      <Text style={[styles.serviceDescription, { color: colors.placeholder }]}>
        {item.description}
      </Text>
      
      <View style={styles.serviceDetails}>
        <Text style={[styles.servicePrice, { color: colors.primary }]}>
          R$ {item.price?.toFixed(2) || '0.00'}
        </Text>
        <Text style={[styles.serviceDate, { color: colors.placeholder }]}>
          {item.date ? formatDate(item.date) : 'Data não definida'}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => handleServiceStatusChange(item.id, 'completed')}
        >
          <Text style={styles.actionButtonText}>Concluir</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primaryDark }]}
          onPress={() => handleServiceStatusChange(item.id, 'cancelled')}
        >
          <Text style={styles.actionButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getStatusColor = (status: ServiceItem['status']) => {
    switch (status) {
      case 'active':
        return '#2196F3';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const translateStatus = (status: ServiceItem['status']) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text }]}
          placeholder="Buscar serviços..."
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.filterContainer}>
          {(['all', 'active', 'completed', 'cancelled'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                {
                  backgroundColor: filterStatus === status ? colors.primary : colors.card,
                },
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: filterStatus === status ? '#FFFFFF' : colors.text,
                  },
                ]}
              >
                {status === 'all' ? 'Todos' : translateStatus(status)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredServices}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  serviceCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  serviceDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  serviceDate: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AdminServices; 