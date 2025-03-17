import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Dimensions, 
  TextInput, 
  FlatList, 
  Image, 
  Appearance,
  Platform, 
  ScrollView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

// Tipos e interfaces
type TabType = 'Viagem' | 'Serviços';
type PageType = 'Home' | 'Serviços' | 'Atividade' | 'Conta';

interface ServiceItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface SuggestionItem {
  id: string;
  src: string;
  title: string;
}

interface ActivityItem {
  id: string;
  date: Date;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'cancelled';
  price?: number;
  icon: string;
}

interface UserData {
  name: string;
  email: string;
  profileImage: string;
  vehicles: Vehicle[];
}

interface Vehicle {
  id: string;
  model: string;
  plate: string;
  color: string;
}


interface NavigationButtonProps {
  page: PageType;
  label: string;
  icon: string;
  activePage: PageType;
  theme: 'light' | 'dark';
  onPress: () => void;
}

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

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.navButton}
      accessibilityRole="button"
      accessibilityLabel={`Navegar para ${label}`}
    >
      <MaterialCommunityIcons 
        name={icon as any} 
        size={scale(24)} 
        color={isActive ? colors.primary : colors.text} 
      />
      <Text style={[
        styles.navText,
        { color: isActive ? colors.primary : colors.text },
        isActive && styles.activeNavText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// Componente principal
export default function App() {
  const { theme, colors, styles } = useTheme();
  const [selectedTab, setSelectedTab] = useState<TabType>('Viagem');
  const [searchText, setSearchText] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [activePage, setActivePage] = useState<PageType>('Home');

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
    },
    {
      id: '2',
      date: new Date(2024, 2, 16),
      title: 'Troca de Bateria',
      description: 'Honda Civic 2020 - Bateria 60Ah',
      status: 'pending',
      icon: 'battery-charging',
    },
    {
      id: '3',
      date: new Date(2024, 2, 17),
      title: 'SOS Combustível',
      description: 'Entrega de 5L de gasolina',
      status: 'cancelled',
      icon: 'water',
    },
  ];

  const [userData] = useState<UserData>({
    name: 'Maria Silva',
    email: 'maria.silva@example.com',
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
      <Ionicons name={item.icon} size={scale(20)} color={colors.text} />
      <Text style={[styles.optionText, {color: colors.text}]}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={scale(20)} color={colors.placeholder} />
    </TouchableOpacity>
  );

  const handleOptionSelect = (screen: string) => {
    // Lógica de navegação
    console.log('Navegar para:', screen);
  };

  const renderActivityItem = ({item}: {item: ActivityItem}) => (
    <TouchableOpacity 
      style={[styles.activityCard, {backgroundColor: colors.card}]}
      onPress={() => handleActivityPress(item)}
    >
      <View style={styles.activityHeader}>
        <Ionicons 
          name={item.icon} 
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

  const translateStatus = (status: string) => {
    const translations = {
      completed: 'Concluído',
      pending: 'Pendente',
      cancelled: 'Cancelado',
    };
    return translations[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: {bg: '#E3FCEF', text: '#006644'},
      pending: {bg: '#FFF6E6', text: '#FF8B00'},
      cancelled: {bg: '#FFEBE6', text: '#BF2600'},
    };
    return colors[status] || {bg: '#EAECF0', text: '#344054'};
  };

  const handleActivityPress = (activity: ActivityItem) => {
    // Navegar para detalhes da atividade
    console.log('Atividade selecionada:', activity);
  };

  const renderServiceItem = ({item}: {item: ServiceItem}) => (
    <TouchableOpacity 
      style={[styles.serviceCard, {backgroundColor: colors.card}]}
      onPress={() => handleServiceSelect(item)}
    >
      <View style={[styles.serviceIconContainer, {backgroundColor: item.color + '20'}]}>
        <Ionicons name={item.icon} size={scale(28)} color={item.color} />
      </View>
      <Text style={[styles.serviceTitle, {color: colors.text}]}>{item.title}</Text>
      <Text style={[styles.serviceDescription, {color: colors.placeholder}]}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );
  
  const handleServiceSelect = (service: ServiceItem) => {
    // Lógica para seleção de serviço
    console.log('Serviço selecionado:', service.title);
  };

  const suggestions: SuggestionItem[] = [
    { id: '1', src: 'https://example.com/tow-truck1.jpg', title: 'Guincho Rápido' },
    { id: '2', src: 'https://example.com/tow-truck2.jpg', title: 'Emergência 24h' },
    { id: '3', src: 'https://example.com/tow-truck3.jpg', title: 'Carga Pesada' },
    { id: '4', src: 'https://example.com/tow-truck4.jpg', title: 'Assistência Técnica' },
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
      <Image source={{ uri: item.src }} style={styles.suggestionImage} />
      <View style={styles.imageOverlay} />
      <Text style={styles.suggestionTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      {activePage === 'Home' ? (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                {['Viagem', 'Serviços'].map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setSelectedTab(tab as TabType)}
                    style={[
                      styles.tabButton,
                      selectedTab === tab && styles.activeTab,
                    ]}
                  >
                    <Text style={[
                      styles.tabText,
                      { color: colors.text },
                      selectedTab === tab && styles.activeTabText
                    ]}>
                      {tab}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Para onde?"
                  placeholderTextColor={colors.placeholder}
                  value={searchText}
                  onChangeText={setSearchText}
                  onSubmitEditing={handleSearch}
                />
                <TouchableOpacity 
                  style={[styles.searchButton, { backgroundColor: colors.primary }]}
                  onPress={handleSearch}
                >
                  <Ionicons name="search" size={scale(20)} color="white" />
                </TouchableOpacity>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Histórico
              </Text>
              <FlatList
                data={history}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false}
              />
            </>
          }
          ListFooterComponent={
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Sugestões
              </Text>
              <FlatList
                horizontal
                data={suggestions}
                renderItem={renderSuggestion}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionsList}
              />
            </>
          }
          contentContainerStyle={styles.contentContainer}
        />
      ) : activePage === 'Serviços' ?(
        <View style={styles.servicesContainer}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>
          Serviços Disponíveis
        </Text>
        
        <FlatList
          data={services}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.servicesList}
          showsVerticalScrollIndicator={false}
        />
      </View>
      ) : activePage === 'Atividade' ?(
        <FlatList
            data={activities}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.activityContainer}
            ListHeaderComponent={
              <Text style={[styles.sectionTitle, {color: colors.text}]}>
                Histórico de Atividades
              </Text>
            }
          />
      ) : activePage === 'Conta' ?(
        <ScrollView contentContainerStyle={styles.accountContainer}>
            {/* Header do Perfil */}
            <View style={styles.profileHeader}>
              <Image
                source={{uri: userData.profileImage}}
                style={styles.profileImage}
              />
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, {color: colors.text}]}>
                  {userData.name}
                </Text>
                <Text style={[styles.profileEmail, {color: colors.placeholder}]}>
                  {userData.email}
                </Text>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Ionicons name="pencil" size={scale(18)} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Seção de Veículos */}
            <Text style={[styles.sectionTitle, {color: colors.text}]}>
              Meus Veículos
            </Text>
            <FlatList
              data={userData.vehicles}
              renderItem={renderVehicleItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.vehicleList}
            />

            {/* Opções da Conta */}
            <Text style={[styles.sectionTitle, {color: colors.text}]}>
              Configurações
            </Text>
            <FlatList
              data={accountOptions}
              renderItem={renderAccountOption}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.optionsList}
            />
          </ScrollView>
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
    </View>
  );
}

// Função para criar estilos dinâmicos
const createStyles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
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
});
