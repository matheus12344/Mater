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
  Platform 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

// Tipos e interfaces
type TabType = 'Viagem' | 'Serviços';
type PageType = 'Home' | 'Serviços' | 'Atividade' | 'Conta';

interface SuggestionItem {
  id: string;
  src: string;
  title: string;
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
});