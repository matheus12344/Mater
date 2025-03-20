import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Dimensions, 
  FlatList, 
  Image, 
  Appearance,
  SafeAreaView,
  Animated,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import HomeTabContent from './src/components/HomeTabContent';
import AccountScreen from './src/pages/AccountScreen';
import ActivityScreen from './src/pages/ActivityScreen';
import { ActivityItem, NavigationButtonProps, PageType, ServiceItem, SuggestionItem, TabType, UserData, Vehicle, } from './src/types';
import ServicesScreen from './src/pages/ServicesScreen';
import ServiceDetailScreen from './src/pages/ServiceDetailScreen';
import ActivityDetailScreen from './src/pages/ActivityDetailScreen';
import { ActivityProvider } from './src/context/ActivityContext';
import { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import SettingsScreen from './src/pages/SettingsScreen';


// Configurações de tema
const colorSchemes = {
  light: {
    background: '#F9F9F9',
    primary: '#2A2AC9',
    text: '#1A1A1A',
    card: '#FFFFFF',
    border: '#E0E0E0',
    placeholder: '#A0A0A0',
  },
  dark: {
    background: '#121212',
    primary: '#5757F7',
    text: '#FFFFFF',
    card: '#1E1E1E',
    border: '#303030',
    placeholder: '#808080',
  },
};

// Configurações responsivas
const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 375;
const scale = (size: number) => (width / guidelineBaseWidth) * size;
const historyFilePath = `${FileSystem.documentDirectory}history.txt`;

// Hook personalizado para tema
const useTheme = () => {
  const [theme, setTheme] = useState(Appearance.getColorScheme() as 'light' | 'dark');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme as 'light' | 'dark');
    });
    return () => subscription.remove();
  }, []);

  return {
    theme,
    colors: colorSchemes[theme],
    styles: createStyles(theme),
  };
};

// Componente NavigationButton
const NavigationButton: React.FC<NavigationButtonProps> = ({ 
  page, 
  label, 
  icon, 
  activePage, 
  theme, 
  onPress 
}) => {
  const { colors, styles } = useTheme();
  const isActive = activePage === page;

  // Valor animado para translação horizontal (inicia em 0)
  const animatedTranslateX = useRef(new Animated.Value(0)).current;

   // Quando o botão é pressionado
   const handlePressIn = () => {
    Animated.spring(animatedTranslateX, {
      toValue: 10,     // encolhe um pouco
      useNativeDriver: true,
    }).start();
  };

  // Quando o botão é solto
  const handlePressOut = () => {
    Animated.spring(animatedTranslateX, {
      toValue: 1,        // volta ao tamanho normal
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.navButton,
          {
            transform: [{ translateX: animatedTranslateX  }],
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Navegar para ${label}`}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={scale(24)}
          color={isActive ? colors.primary : colors.text}
        />
        <Text
          style={[
            styles.navText,
            { color: isActive ? colors.primary : colors.text },
            isActive && styles.activeNavText
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

// Componente principal
export default function App() {
  const { theme, colors, styles } = useTheme();
  const [selectedTab, setSelectedTab] = useState<TabType>('Viagem');
  const [searchText, setSearchText] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [activePage, setActivePage] = useState<PageType>('Home');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null); // Aqui guardamos qual serviço foi selecionado
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);  // Armazena a atividade selecionada

  const services: ServiceItem[] = [
    {
      id: '1',
      icon: 'car-sport',
      title: 'Guincho 24h',
      description: 'Serviço de reboque emergencial para qualquer tipo de veículo',
      color: '#FF6B6B',
    },
    {
      id: '2',
      icon: 'battery-charging',
      title: 'Bateria',
      description: 'Recarga ou substituição de bateria veicular',
      color: '#4ECDC4',
    },
    {
      id: '3',
      icon: 'alert-circle',
      title: 'SOS Estrada',
      description: 'Assistência rápida para emergências em rodovias',
      color: '#FF9F43',
    },
    {
      id: '4',
      icon: 'key',
      title: 'Chaveiro',
      description: 'Abertura de veículos com chaves trancadas',
      color: '#6C5CE7',
    },
    {
      id: '5',
      icon: 'water',
      title: 'Combustível',
      description: 'Entrega emergencial de combustível no local',
      color: '#00B894',
    },
    {
      id: '6',
      icon: 'construct',
      title: 'Reparos Leves',
      description: 'Reparos emergenciais para seguir viagem',
      color: '#D63031',
    },
  ];

  const activities: ActivityItem[] = [
      {
        id: '1',
        date: new Date(2024, 2, 15),
        title: 'Guincho Particular',
        description: 'Remoção do local - Av. Paulista, 1000',
        status: 'completed',
        price: 250.0,
        icon: 'car-sport',
        serviceId: '1',
        vehicle: {
          model: 'Honda Civic 2020',
          plate: 'ABC1D23',
          color: '#FF6B6B',
        },
        location: { address: 'Av. Paulista, 1000', coords: { latitude: -23.561684, longitude: -46.655981 } },
      },
      {
        id: '2',
        date: new Date(2024, 2, 16),
        title: 'Troca de Bateria',
        description: 'Honda Civic 2020 - Bateria 60Ah',
        status: 'pending',
        icon: 'battery-charging',
        serviceId: '2',
        vehicle: {
          model: 'Honda Civic 2020',
          plate: 'ABC1D23',
          color: '#FF6B6B',
        },
        location: { address: 'Rua das Flores, 123', coords: { latitude: -23.561684, longitude: -46.655981 } },
      },
      {
        id: '3',
        date: new Date(2024, 2, 17),
        title: 'SOS Combustível',
        description: 'Entrega de 5L de gasolina',
        status: 'cancelled',
        icon: 'water',
        serviceId: '3',
        vehicle: {
          model: 'Fiat Toro 2022',
          plate: 'XYZ4E56',
          color: '#4ECDC4',
        },
        location: { address: 'Av. Brasil, 456', coords: { latitude: -23.561684, longitude: -46.655981 } },
      },
    ];

  const [userData, setUserData] = useState<UserData>({
    name: 'Matheus Henrique',
    email: 'matheushgevangelista@gmail.com',
    profileImage: 'https://example.com/profile.jpg',
    vehicles: [
      {
        id: '1',
        model: 'Honda Civic 2020',
        plate: 'ABC1D23',
        color: '#FF6B6B',
      },
      {
        id: '2',
        model: 'Fiat Toro 2022',
        plate: 'XYZ4E56',
        color: '#4ECDC4',
      },
    ],
  });

  const accountOptions = [
    { id: '1', icon: 'settings', title: 'Configurações', screen: 'Settings' },
    { id: '2', icon: 'shield-checkmark', title: 'Privacidade', screen: 'Privacy' },
    { id: '3', icon: 'card', title: 'Pagamentos', screen: 'Payments' },
    { id: '4', icon: 'help-circle', title: 'Ajuda', screen: 'Help' },
    { id: '5', icon: 'log-out', title: 'Sair', screen: 'Logout' },
  ];

  // Função para voltar
  const handleActivityBack = () => {
    setActivePage('Atividade');
    setSelectedActivity(null);
  };

  const renderVehicleItem = ({item}: {item: Vehicle}) => (
    <View style={[styles.vehicleCard, {backgroundColor: colors.card}]}>
      <View style={[styles.vehicleColor, {backgroundColor: item.color}]} />
      <View style={styles.vehicleInfo}>
        <Text style={[styles.vehicleModel, {color: colors.text}]}>{item.model}</Text>
        <Text style={[styles.vehiclePlate, {color: colors.placeholder}]}>{item.plate}</Text>
      </View>
      <Ionicons name="chevron-forward" size={scale(20)} color={colors.placeholder} />
    </View>
  );

  const renderAccountOption = ({item}: {item: typeof accountOptions[0]}) => (
    <TouchableOpacity 
      style={styles.optionItem}
      onPress={() => handleOptionSelect(item.screen)}
    >
      <Ionicons name={item.icon as any} size={scale(20)} color={colors.text} />
      <Text style={[styles.optionText, {color: colors.text}]}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={scale(20)} color={colors.placeholder} />
    </TouchableOpacity>
  );

  const handleOptionSelect = (screen: string) => {
    // Lógica de navegação
    setActivePage(screen as PageType);
    console.log('Navegar para:', screen);
  };

  const renderActivityItem = ({item}: {item: ActivityItem}) => (
    <TouchableOpacity 
      style={[styles.activityCard, {backgroundColor: colors.card}]}
      onPress={() => handleActivityPress(item)}
    >
      <View style={styles.activityHeader}>
        <Ionicons 
          name={item.icon as any} 
          size={scale(20)} 
          color={colors.text} 
          style={styles.activityIcon}
        />
        <Text style={[styles.activityDate, {color: colors.placeholder}]}>
          {formatDate(item.date)}
        </Text>
        <View style={[styles.statusBadge, {backgroundColor: getStatusColor(item.status).bg}]}>
          <Text style={[styles.statusText, {color: getStatusColor(item.status).text}]}>
            {translateStatus(item.status)}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.activityTitle, {color: colors.text}]}>{item.title}</Text>
      <Text style={[styles.activityDescription, {color: colors.placeholder}]}>
        {item.description}
      </Text>
      
      {item.price && (
        <View style={styles.priceContainer}>
          <Text style={[styles.priceLabel, {color: colors.text}]}>Valor:</Text>
          <Text style={[styles.priceValue, {color: colors.primary}]}>
            R$ {item.price.toFixed(2)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Funções auxiliares
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).replace(/\./g, '');
  };

  const translateStatus = (status: 'completed' | 'pending' | 'cancelled') => {
      const translations = {
        completed: 'Concluído',
        pending: 'Pendente',
        cancelled: 'Cancelado',
      };
      return translations[status] || status;
    };

  const getStatusColor = (status: 'completed' | 'pending' | 'cancelled') => {
      const colors = {
        completed: {bg: '#E3FCEF', text: '#006644'},
        pending: {bg: '#FFF6E6', text: '#FF8B00'},
        cancelled: {bg: '#FFEBE6', text: '#BF2600'},
      };
      return colors[status] || {bg: '#EAECF0', text: '#344054'};
    };

  const handleActivityPress = (activity: ActivityItem) => {
    setSelectedActivity(activity);
    setActivePage('DetalhesAtividade');
    // Navegar para detalhes da atividade
    console.log('Atividade selecionada:', activity);
  };

  const renderServiceItem = ({item}: {item: ServiceItem}) => (
    <TouchableOpacity 
      style={[styles.serviceCard, {backgroundColor: colors.card}]}
      onPress={() => handleServiceSelect(item)}
    >
      <View style={[styles.serviceIconContainer, {backgroundColor: item.color + '20'}]}>
        <Ionicons name={item.icon as any} size={scale(28)} color={item.color} />
      </View>
      <Text style={[styles.serviceTitle, {color: colors.text}]}>{item.title}</Text>
      <Text style={[styles.serviceDescription, {color: colors.placeholder}]}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );
  
  const handleServiceSelect = (service: ServiceItem) => {
    // Lógica para seleção de serviço
    setSelectedService(service);
    console.log('Serviço selecionado:', service.title);
    setActivePage('DetalhesServiço');
  };

    // Função para voltar da tela de detalhes
    const handleBack = () => {
      setActivePage('Serviços');
    };

  const suggestions: SuggestionItem[] = [
    { id: 1, name: 'Guincho Rápido', src: 'https://example.com/tow-truck1.jpg', title: 'Guincho Rápido', image: 'https://example.com/tow-truck1.jpg' },
    { id: 2, name: 'Emergência 24h', src: 'https://example.com/tow-truck2.jpg', title: 'Emergência 24h', image: 'https://example.com/tow-truck2.jpg' },
    { id: 3, name: 'Carga Pesada', src: 'https://example.com/tow-truck3.jpg', title: 'Carga Pesada', image: 'https://example.com/tow-truck3.jpg' },
    { id: 4, name: 'Assistência Técnica', src: 'https://example.com/tow-truck4.jpg', title: 'Assistência Técnica', image: 'https://example.com/tow-truck4.jpg' },
  ];

  // Carregar histórico
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const fileExists = await FileSystem.getInfoAsync(historyFilePath);
        if (fileExists.exists) {
          const contents = await FileSystem.readAsStringAsync(historyFilePath);
          setHistory(contents.split('\n').filter(Boolean));
        }
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      }
    };
    loadHistory();
  }, []);

  // Salvar histórico
  const saveHistory = async (items: string[]) => {
    try {
      await FileSystem.writeAsStringAsync(historyFilePath, items.join('\n'));
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  };

  const handleSearch = async () => {
    if (searchText.trim()) {
      const newHistory = [searchText, ...history].slice(0, 3);
      setHistory(newHistory);
      await saveHistory(newHistory);
      setSearchText('');
    }
  };

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity style={[styles.locationContainer, { backgroundColor: colors.card }]}>
      <Ionicons name="time" size={scale(24)} color={colors.text} />
      <View style={styles.locationTextContainer}>
        <Text style={[styles.locationTitle, { color: colors.text }]}>{item}</Text>
        <Text style={[styles.locationAddress, { color: colors.placeholder }]}>
          Endereço fictício
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSuggestion = ({ item }: { item: SuggestionItem }) => (
    <TouchableOpacity style={styles.suggestionContainer}>
      <Image source={{ uri: item.image }} style={styles.suggestionImage} />
      <View style={styles.imageOverlay} />
      <Text style={styles.suggestionTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <ActivityProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} backgroundColor= {colors.background} />

        {activePage === 'Home' ? (
          <HomeTabContent
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          styles={styles}
          colors={colors}
          scale={scale}
          searchText={searchText}
          setSearchText={setSearchText}
          handleSearch={handleSearch}
          history={history}
          renderItem={renderItem}
          suggestions={suggestions}
          renderSuggestion={renderSuggestion}
        />
        ) : activePage === 'Serviços' ?(
          <ServicesScreen
            services={services}
            handleServiceSelect={handleServiceSelect}
            styles={styles}
            colors={colors}
            scale={scale}
          />
        ) : activePage === 'Atividade' ?(
            <ActivityScreen
              activities={activities}
              renderActivityItem={renderActivityItem}
              styles={styles}
              colors={colors}
              handleActivityPress={handleActivityPress}
            />
        ) : activePage === 'DetalhesAtividade' && selectedActivity  ?(
            <ActivityDetailScreen
              activity={selectedActivity}
              onBack={handleActivityBack}
              styles={styles}
              colors={colors}
              scale={(size) => size}
            />
        ) : activePage === 'Conta' ?(
          <AccountScreen
            userData={userData}
            setUserData={setUserData}
            styles={styles}
            colors={colors}
            scale={scale}
            accountOptions={accountOptions}
            renderVehicleItem={renderVehicleItem}
            renderAccountOption={renderAccountOption}
          />
        ) : activePage === 'DetalhesServiço' && selectedService ?(
          <ServiceDetailScreen
            service={selectedService}
            onBack={handleBack}
            styles={styles}
            colors={colors}
            scale={scale}
            userVehicles={userData.vehicles}
          />
        ) : activePage === 'Settings' ?(
          <SettingsScreen 
            styles={styles} 
            colors={colors} 
            scale={scale} 
          />
        ) : (
          <View style={styles.otherPages}>
            <Text style={{ color: colors.text }}>{activePage} Page</Text>
          </View>
        )}

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <NavigationButton
            page="Home"
            label="Home"
            icon="home"
            activePage={activePage}
            theme={theme}
            onPress={() => setActivePage('Home')}
          />
          <NavigationButton
            page="Serviços"
            label="Serviços"
            icon="tools"
            activePage={activePage}
            theme={theme}
            onPress={() => setActivePage('Serviços')}
          />
          <NavigationButton
            page="Atividade"
            label="Atividade"
            icon="clipboard-list"
            activePage={activePage}
            theme={theme}
            onPress={() => setActivePage('Atividade')}
          />
          <NavigationButton
            page="Conta"
            label="Conta"
            icon="account"
            activePage={activePage}
            theme={theme}
            onPress={() => setActivePage('Conta')}
          />
        </View>
      </SafeAreaView>
    </ActivityProvider>
  );
}

// Função para criar estilos dinâmicos
const createStyles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 25,
  },
  contentContainer: {
    paddingBottom: scale(20),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: scale(20),
  },
  tabButton: {
    paddingHorizontal: scale(25),
    paddingVertical: scale(10),
    borderRadius: scale(20),
    marginHorizontal: scale(10),
  },
  activeTab: {
    backgroundColor: colorSchemes[theme].primary + '20',
  },
  tabText: {
    fontSize: scale(16),
    fontWeight: '500',
  },
  activeTabText: {
    color: colorSchemes[theme].primary,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: scale(20),
    borderRadius: scale(15),
    padding: scale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: scale(16),
    paddingVertical: 0,
  },
  searchButton: {
    padding: scale(10),
    borderRadius: scale(12),
    marginLeft: scale(10),
  },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    marginHorizontal: scale(20),
    marginVertical: scale(15),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(15),
    marginHorizontal: scale(20),
    marginVertical: scale(8),
    borderRadius: scale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  locationTextContainer: {
    marginLeft: scale(15),
  },
  locationTitle: {
    fontSize: scale(16),
    fontWeight: '500',
  },
  locationAddress: {
    fontSize: scale(14),
    marginTop: scale(4),
  },
  suggestionsList: {
    paddingHorizontal: scale(20),
  },
  suggestionContainer: {
    width: scale(240),
    height: scale(160),
    borderRadius: scale(20),
    marginRight: scale(15),
    overflow: 'hidden',
  },
  suggestionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  suggestionTitle: {
    position: 'absolute',
    bottom: scale(15),
    left: scale(15),
    color: 'white',
    fontSize: scale(16),
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: scale(10),
    borderTopWidth: 1,
  },
  navButton: {
    alignItems: 'center',
    padding: scale(8),
  },
  navText: {
    fontSize: scale(12),
    marginTop: scale(4),
  },
  activeNavText: {
    fontWeight: '600',
  },
  otherPages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  servicesContainer: {
    flex: 1,
    padding: scale(20),
  },
  serviceCard: {
    flex: 1,
    margin: scale(8),
    padding: scale(15),
    borderRadius: scale(15),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceIconContainer: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(10),
  },
  serviceTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    marginBottom: scale(5),
  },
  serviceDescription: {
    fontSize: scale(12),
    lineHeight: scale(16),
  },
  servicesList: {
    paddingBottom: scale(20),
  },
  activityContainer: {
    padding: scale(20),
  },
  activityCard: {
    padding: scale(16),
    borderRadius: scale(12),
    marginBottom: scale(12),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  // No seu arquivo de estilos
  emptyButton: {
    backgroundColor: colorSchemes[theme].primary,
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 30,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colorSchemes[theme].primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    transform: [{ scale: 1 }],
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginLeft: 10,
    textAlign: 'center',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(8),
  },
  activityIcon: {
    marginRight: scale(8),
  },
  activityDate: {
    fontSize: scale(12),
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(20),
  },
  statusText: {
    fontSize: scale(12),
    fontWeight: '500',
  },
  activityTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    marginBottom: scale(4),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  priceText: {
    fontSize: 14,
    color: '#2ecc71',
    fontWeight: '500',
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 32,
  },
  activityDescription: {
    fontSize: scale(14),
    lineHeight: scale(20),
    marginBottom: scale(8),
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(8),
  },
  priceLabel: {
    fontSize: scale(14),
    marginRight: scale(8),
  },
  priceValue: {
    fontSize: scale(16),
    fontWeight: '600',
  },
  accountContainer: {
    padding: scale(20),
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(25),
  },
  profileImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    marginRight: scale(15),
    backgroundColor: '#E0E0E0',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: scale(18),
    fontWeight: '600',
    marginBottom: scale(4),
  },
  profileEmail: {
    fontSize: scale(14),
  },
  editButton: {
    padding: scale(8),
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(15),
    borderRadius: scale(12),
    marginBottom: scale(10),
  },
  vehicleColor: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(8),
    marginRight: scale(15),
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleModel: {
    fontSize: scale(16),
    fontWeight: '500',
    marginBottom: scale(4),
  },
  vehiclePlate: {
    fontSize: scale(14),
    opacity: 0.8,
  },
  vehicleList: {
    marginBottom: scale(25),
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(15),
    paddingHorizontal: scale(10),
    borderRadius: scale(12),
    marginBottom: scale(8),
  },
  optionText: {
    flex: 1,
    fontSize: scale(16),
    marginLeft: scale(15),
  },
  optionsList: {
    marginBottom: scale(30),
  },
  detailHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: scale(10),
    paddingBottom: scale(10),
  },
  detailBackButton: {
    marginRight: scale(10),
    padding: scale(5),
  },
  detailHeaderTitle: {
    fontSize: scale(18),
    fontWeight: '600',
  },

  detailHeroContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(30),
    borderBottomLeftRadius: scale(20),
    borderBottomRightRadius: scale(20),
    marginBottom: scale(20),
    // Se quiser sombra no container hero:
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailHeroIcon: {
    marginBottom: scale(10),
  },
  detailHeroTitle: {
    fontSize: scale(22),
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: scale(20),
  },

  detailContentContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: scale(20),
  },
  detailSectionTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    marginBottom: scale(6),
  },
  detailDescription: {
    fontSize: scale(14),
    lineHeight: scale(20),
  },

  detailActionButton: {
    marginVertical: scale(20),
    paddingVertical: scale(14),
    borderRadius: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailActionButtonText: {
    fontSize: scale(16),
    fontWeight: '600',
  },
});
