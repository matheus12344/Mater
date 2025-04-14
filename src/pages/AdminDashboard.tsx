import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { ActivityItem, ServiceItem, UserData } from '../types';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalUsers: number;
  totalServices: number;
  totalRevenue: number;
  activeServices: number;
  completedServices: number;
  cancelledServices: number;
}

interface ServiceAnalytics {
  serviceType: string;
  count: number;
  revenue: number;
}

const AdminDashboard = () => {
  const { theme, colors} = useTheme();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalServices: 0,
    totalRevenue: 0,
    activeServices: 0,
    completedServices: 0,
    cancelledServices: 0,
  });
  const [serviceAnalytics, setServiceAnalytics] = useState<ServiceAnalytics[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');

  const fetchDashboardData = async () => {
    try {
      // Aqui você implementará a lógica para buscar os dados reais do seu backend
      // Por enquanto, usando dados mockados para demonstração
      const mockStats: DashboardStats = {
        totalUsers: 1500,
        totalServices: 3500,
        totalRevenue: 75000,
        activeServices: 45,
        completedServices: 3400,
        cancelledServices: 55,
      };

      const mockServiceAnalytics: ServiceAnalytics[] = [
        { serviceType: 'Manutenção', count: 1200, revenue: 36000 },
        { serviceType: 'Troca de Óleo', count: 800, revenue: 16000 },
        { serviceType: 'Alinhamento', count: 600, revenue: 12000 },
        { serviceType: 'Outros', count: 900, revenue: 11000 },
      ];

      setStats(mockStats);
      setServiceAnalytics(mockServiceAnalytics);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeRange]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const renderStatCard = (title: string, value: string | number, icon: string) => (
    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
      <Ionicons name={icon as any} size={24} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.placeholder }]}>{title}</Text>
    </View>
  );

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {(['day', 'week', 'month', 'year'] as const).map((range) => (
        <TouchableOpacity
          key={range}
          style={[
            styles.timeRangeButton,
            {
              backgroundColor: selectedTimeRange === range ? colors.primary : colors.card,
            },
          ]}
          onPress={() => setSelectedTimeRange(range)}
        >
          <Text
            style={[
              styles.timeRangeText,
              {
                color: selectedTimeRange === range ? 'white' : colors.text,
              },
            ]}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Painel Administrativo</Text>
        {renderTimeRangeSelector()}
      </View>

      <View style={styles.statsGrid}>
        {renderStatCard('Usuários Totais', stats.totalUsers, 'people')}
        {renderStatCard('Serviços Totais', stats.totalServices, 'construct')}
        {renderStatCard('Receita Total', `R$ ${stats.totalRevenue.toLocaleString()}`, 'cash')}
        {renderStatCard('Serviços Ativos', stats.activeServices, 'time')}
      </View>

      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>Receita por Tipo de Serviço</Text>
        <BarChart
          data={{
            labels: serviceAnalytics.map((item) => item.serviceType),
            datasets: [
              {
                data: serviceAnalytics.map((item) => item.revenue),
              },
            ],
          }}
          width={width - 32}
          height={220}
          yAxisLabel="R$ "
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => colors.primary,
            labelColor: (opacity = 1) => colors.text,
            style: {
              borderRadius: 16,
            },
          }}
          style={styles.chart}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>Distribuição de Serviços</Text>
        <PieChart
          data={[
            {
              name: 'Concluídos',
              population: stats.completedServices,
              color: '#4CAF50',
              legendFontColor: colors.text,
            },
            {
              name: 'Ativos',
              population: stats.activeServices,
              color: '#2196F3',
              legendFontColor: colors.text,
            },
            {
              name: 'Cancelados',
              population: stats.cancelledServices,
              color: '#F44336',
              legendFontColor: colors.text,
            },
          ]}
          width={width - 32}
          height={220}
          chartConfig={{
            color: (opacity = 1) => colors.text,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  chartContainer: {
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
});

export default AdminDashboard; 