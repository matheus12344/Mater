import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { UserData } from '../types';

const AdminUsers = () => {
  const { theme, colors} = useTheme();
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Aqui você implementará a lógica para buscar os usuários do backend
      // Por enquanto, usando dados mockados
      const mockUsers: UserData[] = [
        {
          id: '1',
          name: 'João Silva',
          email: 'joao@example.com',
          phone: '(11) 99999-9999',
          role: 'user',
          createdAt: new Date(),
          lastLogin: new Date(),
          status: 'active',
          vehicles: []
        },
        // Adicione mais usuários mockados aqui
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      Alert.alert('Erro', 'Não foi possível carregar os usuários');
    }
  };

  const handleUserStatusChange = async (userId: string, newStatus: 'active' | 'inactive') => {
    try {
      // Aqui você implementará a lógica para atualizar o status no backend
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      );
      setUsers(updatedUsers);
      Alert.alert('Sucesso', 'Status do usuário atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status do usuário');
    }
  };

  const handleUserRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      // Aqui você implementará a lógica para atualizar o papel no backend
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);
      Alert.alert('Sucesso', 'Papel do usuário atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar papel:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o papel do usuário');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const renderUserItem = ({ item }: { item: UserData }) => (
    <View style={[styles.userCard, { backgroundColor: colors.card }]}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.userEmail, { color: colors.placeholder }]}>{item.email}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{translateStatus(item.status)}</Text>
        </View>
      </View>

      <View style={styles.userDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="call-outline" size={16} color={colors.placeholder} />
          <Text style={[styles.detailText, { color: colors.text }]}>{item.phone}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={colors.placeholder} />
          <Text style={[styles.detailText, { color: colors.text }]}>
            Último login: {formatDate(item.lastLogin)}
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => handleUserRoleChange(item.id, item.role === 'admin' ? 'user' : 'admin')}
        >
          <Text style={styles.actionButtonText}>
            {item.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primaryDark }]}
          onPress={() => handleUserStatusChange(item.id, item.status === 'active' ? 'inactive' : 'active')}
        >
          <Text style={styles.actionButtonText}>
            {item.status === 'active' ? 'Desativar' : 'Ativar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getStatusColor = (status: 'active' | 'inactive') => {
    return status === 'active' ? '#4CAF50' : '#F44336';
  };

  const translateStatus = (status: 'active' | 'inactive') => {
    return status === 'active' ? 'Ativo' : 'Inativo';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text }]}
          placeholder="Buscar usuários..."
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.filterContainer}>
          {(['all', 'admin', 'user'] as const).map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.filterButton,
                {
                  backgroundColor: filterRole === role ? colors.primary : colors.card,
                },
              ]}
              onPress={() => setFilterRole(role)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: filterRole === role ? 'white' : colors.text,
                  },
                ]}
              >
                {role === 'all' ? 'Todos' : role === 'admin' ? 'Administradores' : 'Usuários'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
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
  userCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
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
  userDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
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

export default AdminUsers; 