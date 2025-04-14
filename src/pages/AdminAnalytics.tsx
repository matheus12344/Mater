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

const { width } = Dimensions.get('window');

interface AnalyticsData {
  revenueByMonth: {
    month: string;
    value: number;
  }[];
  serviceTypes: {
    type: string;
    count: number;
    revenue: number;
  }[];
  userGrowth: {
    month: string;
    count: number;
  }[];
  serviceStatus: {
    status: string;
    count: number;
  }[];
}

const AdminAnalytics = () => {
  const { theme, colors} = useTheme();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenueByMonth: [],
    serviceTypes: [],
    userGrowth: [],
    serviceStatus: [],
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeRange]);

  const fetchAnalyticsData = async () => {
    try {
      // Aqui você implementará a lógica para buscar os dados do backend
      // Por enquanto, usando dados mockados
      const mockData: AnalyticsData = {
        revenueByMonth: [
          { month: 'Jan', value: 15000 },
          { month: 'Fev', value: 18000 },
          { month: 'Mar', value: 22000 },
          { month: 'Abr', value: 19000 },
          { month: 'Mai', value: 25000 },
          { month: 'Jun', value: 28000 },
        ],
        serviceTypes: [
          { type: 'Manutenção', count: 150, revenue: 45000 },
          { type: 'Troca de Óleo', count: 100, revenue: 20000 },
          { type: 'Alinhamento', count: 80, revenue: 16000 },
          { type: 'Outros', count: 120, revenue: 24000 },
        ],
        userGrowth: [
          { month: 'Jan', count: 100 },
          { month: 'Fev', count: 150 },
          { month: 'Mar', count: 200 },
          { month: 'Abr', count: 250 },
          { month: 'Mai', count: 300 },
          { month: 'Jun', count: 350 },
        ],
        serviceStatus: [
          { status: 'Concluídos', count: 300 },
          { status: 'Em Andamento', count: 50 },
          { status: 'Cancelados', count: 20 },
        ],
      };
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Erro ao carregar dados analíticos:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {(['week', 'month', 'year'] as const).map((range) => (
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
            {range === 'week' ? 'Semana' : range === 'month' ? 'Mês' : 'Ano'}
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
        <Text style={[styles.title, { color: colors.text }]}>Análise de Dados</Text>
        {renderTimeRangeSelector()}
      </View>

      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>Receita Mensal</Text>
        <LineChart
          data={{
            labels: analyticsData.revenueByMonth.map(item => item.month),
            datasets: [
              {
                data: analyticsData.revenueByMonth.map(item => item.value),
              },
            ],
          }}
          width={width - 32}
          height={220}
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
        <Text style={[styles.chartTitle, { color: colors.text }]}>Crescimento de Usuários</Text>
        <LineChart
          data={{
            labels: analyticsData.userGrowth.map(item => item.month),
            datasets: [
              {
                data: analyticsData.userGrowth.map(item => item.count),
              },
            ],
          }}
          width={width - 32}
          height={220}
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
        <Text style={[styles.chartTitle, { color: colors.text }]}>Receita por Tipo de Serviço</Text>
        <BarChart
          data={{
            labels: analyticsData.serviceTypes.map(item => item.type),
            datasets: [
              {
                data: analyticsData.serviceTypes.map(item => item.revenue),
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
        <Text style={[styles.chartTitle, { color: colors.text }]}>Status dos Serviços</Text>
        <PieChart
          data={analyticsData.serviceStatus.map(item => ({
            name: item.status,
            population: item.count,
            color: item.status === 'Concluídos' ? '#4CAF50' :
                   item.status === 'Em Andamento' ? '#2196F3' : '#F44336',
            legendFontColor: colors.text,
          }))}
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

export default AdminAnalytics; 