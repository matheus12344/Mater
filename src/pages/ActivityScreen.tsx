import React from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { ActivityItem } from '../types'; 
import { Ionicons } from '@expo/vector-icons';
import { useActivities } from '../context/ActivityContext';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedButton = Animated.createAnimatedComponent(TouchableOpacity);

interface ActivityScreenProps {
  activities: ActivityItem[];
  renderActivityItem: ({ item }: { item: ActivityItem }) => JSX.Element;
  styles: any;
  colors: any;
}

const ActivityScreen: React.FC<ActivityScreenProps> = ({
  styles,
  colors
}) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const { activities } = useActivities();

  const renderActivityItem = ({ item }: { item: ActivityItem }) => (
    <TouchableOpacity style={[styles.activityCard, { backgroundColor: colors.card }]}>
      <View style={styles.activityHeader}>
        <Ionicons 
          name={item.status === 'completed' ? 'checkmark-circle' : 'time'} 
          color={getStatusColor(item.status).text} 
          size={20} 
        />
        <Text style={[styles.activityDate, {color: colors.placeholder}]}>
          {new Date(item.date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
        <View style={[styles.statusBadge, {backgroundColor: getStatusColor(item.status).bg || colors.defaultBg}]}>
          <Text style={[styles.statusText, {color: getStatusColor(item.status).text || colors.text}]}>
            {translateStatus(item.status)}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.activityTitle, {color: colors.text}]}>{item.title}</Text>
      <Text style={[styles.activityDescription, {color: colors.placeholder}]}>
        {item.description}
      </Text>
      
      <View style={styles.detailRow}>
        <Ionicons name="car" size={16} color="#666" />
        <Text style={styles.detailText}>
          {item.vehicle.model} ({item.vehicle.plate})
        </Text>
      </View>
      
      <View style={styles.detailRow}>
        <Ionicons name="location" size={16} color="#666" />
        <Text style={styles.detailText}>
          {item.location.address || 'Local não especificado'}
        </Text>
      </View>
      
      {item.price && (
        <View style={styles.priceContainer}>
          <Ionicons name="cash" size={16} color="#666" />
          <Text style={[styles.priceLabel, {color: colors.text}]}>Valor:</Text>
          <Text style={[styles.priceValue, {color: colors.primary}]}>
            R$ {item.price.toFixed(2)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
  // Dentro do componente:
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    onRefresh && await onRefresh();
    setRefreshing(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Lógica de atualização
    setRefreshing(false);
  };
  return (
    <FlatList
      data={activities}
      renderItem={renderActivityItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.activityContainer}
      ListHeaderComponent={
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Histórico de Atividades
          </Text>
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              style={[styles.filterButton, { backgroundColor: colors.background }]}
              accessibilityLabel="Ordenar atividades"
            >
              <Ionicons name="calendar" size={20} color={colors.text} />
              <Text style={{ color: colors.text }}>Ordenar por data</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, { backgroundColor: colors.background }]}
              accessibilityLabel="Filtrar atividades"
            >
              <Ionicons name="filter" size={20} color={colors.text} />
              <Text style={{ color: colors.text }}>Filtrar por status</Text>
            </TouchableOpacity>
          </View>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="list" size={48} color={colors.placeholder} />
          <Text style={[styles.emptyText, { color: colors.placeholder }]}>
            Nenhuma atividade registrada
          </Text>
          <AnimatedButton
            style={[styles.emptyButton, animatedStyle]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Ionicons name="add-circle" size={22} color="#FFF" />
            <Text style={styles.emptyButtonText}>Agendar primeiro serviço</Text>
          </AnimatedButton>
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      initialNumToRender={10}
      maxToRenderPerBatch={5}
      windowSize={10}
      showsVerticalScrollIndicator={false}
    />
  );
};

function getStatusColor(status: string): { bg: string, text: string } {
  switch (status) {
    case 'completed':
      return { bg: 'green', text: 'white' };
    case 'pending':
      return { bg: 'orange', text: 'black' };
    case 'canceled':
      return { bg: 'red', text: 'white' };
    default:
      return { bg: 'gray', text: 'black' };
  }
}

function translateStatus(status: string): string {
  switch (status) {
    case 'completed':
      return 'Concluído';
    case 'pending':
      return 'Pendente';
    case 'canceled':
      return 'Cancelado';
    default:
      return 'Desconhecido';
  }
}

export default ActivityScreen;

