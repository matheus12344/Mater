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

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  target: 'all' | 'users' | 'admins';
  status: 'pending' | 'sent' | 'failed';
  createdAt: Date;
  scheduledFor?: Date;
}

const AdminNotifications = () => {
  const { theme, colors} = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'sent' | 'failed'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Aqui você implementará a lógica para buscar as notificações do backend
      // Por enquanto, usando dados mockados
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Manutenção Programada',
          message: 'O sistema passará por manutenção no dia 15/04/2024 das 02h às 04h.',
          type: 'info',
          target: 'all',
          status: 'pending',
          createdAt: new Date(),
          scheduledFor: new Date('2024-04-15T02:00:00'),
        },
        // Adicione mais notificações mockadas aqui
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      Alert.alert('Erro', 'Não foi possível carregar as notificações');
    }
  };

  const handleSendNotification = async (notification: Notification) => {
    try {
      // Aqui você implementará a lógica para enviar a notificação no backend
      const updatedNotifications = notifications.map(n =>
        n.id === notification.id ? { ...n, status: 'sent' as 'sent' } : n
      );
      setNotifications(updatedNotifications);
      Alert.alert('Sucesso', 'Notificação enviada com sucesso');
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      Alert.alert('Erro', 'Não foi possível enviar a notificação');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      // Aqui você implementará a lógica para deletar a notificação no backend
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      setNotifications(updatedNotifications);
      Alert.alert('Sucesso', 'Notificação excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
      Alert.alert('Erro', 'Não foi possível excluir a notificação');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesStatus = filterStatus === 'all' || notification.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return '#2196F3';
      case 'success':
        return '#4CAF50';
      case 'warning':
        return '#FFC107';
      case 'error':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getStatusColor = (status: Notification['status']) => {
    switch (status) {
      case 'pending':
        return '#FFC107';
      case 'sent':
        return '#4CAF50';
      case 'failed':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const translateStatus = (status: Notification['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'sent':
        return 'Enviada';
      case 'failed':
        return 'Falha';
      default:
        return status;
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <View style={[styles.notificationCard, { backgroundColor: colors.card }]}>
      <View style={styles.notificationHeader}>
        <View style={styles.notificationInfo}>
          <Text style={[styles.notificationTitle, { color: colors.text }]}>{item.title}</Text>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
            <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{translateStatus(item.status)}</Text>
        </View>
      </View>

      <Text style={[styles.notificationMessage, { color: colors.placeholder }]}>
        {item.message}
      </Text>

      <View style={styles.notificationDetails}>
        <Text style={[styles.detailText, { color: colors.placeholder }]}>
          Criada em: {item.createdAt.toLocaleDateString()}
        </Text>
        {item.scheduledFor && (
          <Text style={[styles.detailText, { color: colors.placeholder }]}>
            Agendada para: {item.scheduledFor.toLocaleDateString()}
          </Text>
        )}
      </View>

      <View style={styles.actionButtons}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => handleSendNotification(item)}
          >
            <Text style={styles.actionButtonText}>Enviar Agora</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: 'red'}]}
          onPress={() => handleDeleteNotification(item.id)}
        >
          <Text style={styles.actionButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text }]}
          placeholder="Buscar notificações..."
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.filterContainer}>
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Tipo:</Text>
            <View style={styles.filterButtons}>
              {(['all', 'info', 'success', 'warning', 'error'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor: filterType === type ? colors.primary : colors.card,
                    },
                  ]}
                  onPress={() => setFilterType(type)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      {
                        color: filterType === type ? 'white' : colors.text,
                      },
                    ]}
                  >
                    {type === 'all' ? 'Todos' : type.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Status:</Text>
            <View style={styles.filterButtons}>
              {(['all', 'pending', 'sent', 'failed'] as const).map((status) => (
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
                        color: filterStatus === status ? 'white' : colors.text,
                      },
                    ]}
                  >
                    {status === 'all' ? 'Todos' : translateStatus(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
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
    gap: 16,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  notificationCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
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
  notificationMessage: {
    fontSize: 14,
    marginBottom: 8,
  },
  notificationDetails: {
    marginBottom: 16,
  },
  detailText: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AdminNotifications; 