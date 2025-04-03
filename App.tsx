import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  Text, 
  TouchableOpacity, 
  View, 
  Dimensions, 
  Image, 
  Appearance,
  SafeAreaView,
  Animated,
  TouchableWithoutFeedback,
  Vibration,
  Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeTabContent from './src/components/HomeTabContent';
import AccountScreen from './src/pages/AccountScreen';
import ActivityScreen from './src/pages/ActivityScreen';
import { ActivityItem, NavigationButtonProps, PageType, ServiceItem, SuggestionItem, TabType, UserData, Vehicle, } from './src/types';
import ServicesScreen from './src/pages/ServicesScreen';
import ServiceDetailScreen from './src/pages/ServiceDetailScreen';
import ActivityDetailScreen from './src/pages/ActivityDetailScreen';
import { ActivityProvider } from './src/context/ActivityContext';
import SettingsScreen from './src/pages/SettingsScreen';
import { ThemeProvider } from './src/context/ThemeContext';
import { AccessibilityProvider } from './src/context/AccessibilityContext';
import PrivacyPolicyScreen from './src/pages/PrivacyScreen';
import MapScreen from './src/pages/MapScreen';
import 'react-native-gesture-handler';
import EmergencyScreen from 'src/pages/EmergencyScreen';
import PaymentScreen from 'src/pages/PaymentScreen';
import { createStyles, colorSchemes } from './src/styles/theme';
import { mockServices, mockActivities, mockUserData, mockAccountData, mockSuggestions } from './src/data/mockData';
import NavigationButton from 'src/components/NavigationButton';
import { servicePricing } from './src/config/Pricing';
import PointsScreen from './src/pages/PointsScreen';
import VehicleDetailScreen from './src/pages/VehicleDetailScreen';
import ChatScreen from './src/pages/ChatScreen';


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



// Componente principal
export default function App() {
  const { theme, colors, styles } = useTheme();
  const [selectedTab, setSelectedTab] = useState<TabType>('Viagem');
  const [searchText, setSearchText] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [activePage, setActivePage] = useState<PageType>('Home');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [mapSearchParams, setMapSearchParams] = useState<{
    searchText?: string;
    coordinates?: { latitude: number; longitude: number };
  }>({});
  const [searchSuggestions, setSearchSuggestions] = useState<SuggestionItem[]>([]);
  const [userData, setUserData] = useState<UserData>(mockUserData);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const services = mockServices;
  const activities = mockActivities;
  const accountOptions = mockAccountData;
  const suggestions = mockSuggestions

  // Carregar dados do usuário do AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData);
          setUserData(parsedData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do perfil');
      }
    };
    loadUserData();
  }, []);

  const fetchOSMSuggestions = async (searchText: string): Promise<SuggestionItem[]> => {
    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.append('format', 'json');
      url.searchParams.append('q', searchText);
      url.searchParams.append('addressdetails', '1');
      url.searchParams.append('countrycodes', 'br');
      url.searchParams.append('limit', '5');
      url.searchParams.append('email', 'matheushgevangelista@gmail.com'); // Adicione seu email
  
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'Mater/1.0 (matheushgevangelista@gmail.com)', // Obrigatório
          'Accept-Language': 'pt-BR,pt;q=0.9',
        },
      });
  
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Erro HTTP: ${response.status} - ${text}`);
      }
  
      const data = await response.json();
      
      return data.map((item: any) => ({
        id: item.place_id,
        title: item.display_name,
        subtitle: [
          item.address?.road,
          item.address?.suburb,
          item.address?.city,
          item.address?.state
        ].filter(Boolean).join(', '),
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type
      }));
    } catch (error) {
      console.error('Erro detalhado:', error);
      return [];
    }
  };

  const handleSelectSuggestion = async (item: SuggestionItem) => {
    setSearchText(item.subtitle || item.title);
    setMapSearchParams({
      searchText: item.subtitle || item.title,
      coordinates: {
        latitude: item.lat,
        longitude: item.lon
      }
    });
    setActivePage('Map');
  };

  // Função para voltar
  const handleActivityBack = () => {
    setActivePage('Atividade');
    setSelectedActivity(null);
  };

  const renderVehicleItem = ({item}: {item: Vehicle}) => (
    <TouchableOpacity 
      style={[styles.vehicleCard, {backgroundColor: colors.card}]}
      onPress={() => handleVehicleSelect(item)}
    >
      <View style={[styles.vehicleColor, {backgroundColor: item.color}]} />
      <View style={styles.vehicleInfo}>
        <Text style={[styles.vehicleModel, {color: colors.text}]}>{item.model}</Text>
        <Text style={[styles.vehiclePlate, {color: colors.placeholder}]}>{item.plate}</Text>
      </View>
      <Ionicons name="chevron-forward" size={scale(20)} color={colors.placeholder} />
    </TouchableOpacity>
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

  const handleSearchTextChange = async (text: string) => {
    const results = await fetchOSMSuggestions(text);
    setSearchSuggestions(results);
    console.log('Resultados de busca:', results);
  };
  
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
    const handleMap = () => {
      setActivePage('Map');
    };
    const handleEmergency = () => {
      setActivePage('Emergency')
    }
    const handleBackHome = () => {
      setActivePage('Home');
    };
    const handleChat = () => {
      setActivePage('Chat');
    };

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

      // Fetch suggestions to get coordinates for the search text
      const suggestions = await fetchOSMSuggestions(searchText);
      const selectedSuggestion = suggestions[0]; // Use the first suggestion as default

      if (selectedSuggestion) {
        setMapSearchParams({
          searchText: selectedSuggestion.subtitle || selectedSuggestion.title,
          coordinates: {
            latitude: selectedSuggestion.lat,
            longitude: selectedSuggestion.lon,
          },
        });
      }

      setSearchText('');
      setActivePage('Map');
    }
  };

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity style={[styles.locationContainer, { backgroundColor: colors.card }]} onPress={() => setActivePage('Map')}>
      <Ionicons name="time" size={scale(24)} color={colors.text} />
      <View style={styles.locationTextContainer}>
        <Text style={[styles.locationTitle, { color: colors.text }]}>{item}</Text>
        <Text style={[styles.locationAddress, { color: colors.placeholder }]}>
          {item}
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

  const handleDeleteHistoryItem = (index: number) => {
    const newHistory = history.filter((_, i) => i !== index);
    setHistory(newHistory);
    saveHistory(newHistory);
    Vibration.vibrate(50)
  };
  

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setActivePage('DetalhesVeículo');
  };

  const handleVehicleBack = () => {
    setActivePage('Conta');
  };

  const renderContent = () => {
    switch (activePage) {
      case 'Home':
  return (
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
              onSearchTextChange={handleSearchTextChange}
              onSelectSuggestion={handleSelectSuggestion}
              searchSuggestions={searchSuggestions}
              onDeleteHistoryItem={handleDeleteHistoryItem}
              onMap={handleMap}
              onEmergency={handleEmergency}
          />
        );
      case 'Serviços':
        return (
            <ServicesScreen
              services={services}
              handleServiceSelect={handleServiceSelect}
              styles={styles}
              colors={colors}
              scale={scale}
            />
        );
      case 'Atividade':
        return (
              <ActivityScreen
                activities={activities}
                renderActivityItem={renderActivityItem}
                styles={styles}
                colors={colors}
                handleActivityPress={handleActivityPress}
              />
        );
      case 'DetalhesAtividade':
        return (
          selectedActivity && (
              <ActivityDetailScreen
                activity={selectedActivity}
                onBack={handleActivityBack}
                styles={styles}
                colors={colors}
                scale={(size) => size}
              />
          )
        );
      case 'Conta':
        return (
            <AccountScreen
              userData={userData}
              setUserData={setUserData}
              styles={styles}
              colors={colors}
              scale={scale}
              accountOptions={accountOptions}
              renderVehicleItem={renderVehicleItem}
              renderAccountOption={renderAccountOption}
              onOptionSelect={handleOptionSelect}
              onVehicleSelect={handleVehicleSelect}
            />
        );
      case 'DetalhesServiço':
        return (
          selectedService && (
            <ServiceDetailScreen
              service={selectedService}
              onBack={handleBack}
              onChat={handleChat}
              styles={styles}
              colors={colors}
              scale={scale}
              userVehicles={userData.vehicles}
            />
          )
        );
      case 'Settings':
        return (
            <SettingsScreen 
              styles={styles} 
              colors={colors} 
              scale={scale} 
            />
        );
      case 'Privacy':
        return (
            <PrivacyPolicyScreen/>
        );
      case 'Map':
        return (
            <MapScreen 
              key="map" 
              route={{ params: { 
                searchText: mapSearchParams.searchText,
                coordinates: mapSearchParams.coordinates 
              } 
            }} 
              services={services}
              onSearchTextChange={handleSearchTextChange}
              onSelectSuggestion={(item) => console.log('Sugestão selecionada:', item)}
              onServiceSelect={handleServiceSelect}
            />
        );
      case 'Emergency':
        return (
            <EmergencyScreen route={{ onback: handleBackHome }} />
        );
      case 'Payments':
        return (
            <PaymentScreen 
              route={{ 
                key: 'PaymentScreenKey',
                name: 'Payment',
                params: { 
                service: selectedService?.title || 'Serviço',
                amount: servicePricing[selectedService?.id || '1']?.baseRate || 0,
                  serviceDetails: { 
                    pickup: { latitude: -23.561684, longitude: -46.655981 }, 
                    destination: { latitude: -23.562684, longitude: -46.656981 }, 
                    distance: 5.0, 
                    coordinates: [
                      { latitude: -23.561684, longitude: -46.655981 },
                      { latitude: -23.562684, longitude: -46.656981 }
                    ], 
                    vehicleType: 'Carro' 
                  } 
                } 
              }} 
            onBack={() => setActivePage('Home')}
          />
        );
      case 'Points':
        return <PointsScreen navigation={{ goBack: () => setActivePage('Conta') }} />;
      case 'DetalhesVeículo':
        return (
          selectedVehicle && (
            <VehicleDetailScreen
              vehicle={selectedVehicle}
              onBack={handleVehicleBack}
              styles={styles}
              colors={colors}
              scale={scale}
            />
          )
        );
      case 'Chat':
        return (
          <ChatScreen
            navigation={{ goBack: () => setActivePage('Home') }}
            route={{
              params: {
                driverName: 'João Silva',
                driverPhoto: 'https://via.placeholder.com/150'
              }
            }}
          />
        );
      default:
        return (
            <View style={styles.otherPages}>
              <Text style={{ color: colors.text }}>{activePage} Page</Text>
            </View>
        );
    }
  };

  return (
    <AccessibilityProvider>
      <ThemeProvider>
        <ActivityProvider>
          <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} backgroundColor={colors.background} />

            {renderContent()}

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
      </ThemeProvider>
    </AccessibilityProvider>
  );
}
