import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Animated,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { TabType, SuggestionItem } from '../types/index'; 

// Defina a interface das props que este componente precisa receber
interface HomeTabContentProps {
  selectedTab: TabType;
  setSelectedTab: (tab: TabType) => void;
  styles: any;
  colors: any;
  scale: (size: number) => number; // Caso use a função scale de fora
  searchText: string;
  setSearchText: (text: string) => void;
  handleSearch: () => void;
  history: string[];
  renderItem: ({ item }: { item: string }) => JSX.Element;
  suggestions: SuggestionItem[];
  renderSuggestion: ({ item }: { item: SuggestionItem }) => JSX.Element;
  onSearchTextChange: (text: string) => Promise<void>;// Nova prop para buscar sugestões
  onSelectSuggestion: (item: SuggestionItem) => void; // Nova prop para seleção
  searchSuggestions: SuggestionItem[];
}

const HomeTabContent: React.FC<HomeTabContentProps> = ({
  selectedTab,
  setSelectedTab,
  styles,
  colors,
  scale,
  searchText,
  setSearchText,
  handleSearch,
  history,
  renderItem,
  suggestions,
  renderSuggestion,
  onSearchTextChange,
  onSelectSuggestion,
}) => {

  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [localSuggestions, setLocalSuggestions] = React.useState<SuggestionItem[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();


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
        subtitle: formatAddress(item.address),
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type
      }));
    } catch (error) {
      console.error('Erro detalhado:', error);
      return [];
    }
  };
  
  // Função auxiliar para formatar o subtítulo
  const formatAddress = (address: any) => {
    const parts = [
      address.road,
      address.neighbourhood,
      address.suburb,
      address.city,
      address.state
    ];
    return parts.filter(p => p).join(', ');
  };
  
    const fetchSuggestions = async (searchText: string) => {
      const osmResults = await fetchOSMSuggestions(searchText);
    
      return [...osmResults];
    };

    const handleTextChange = async (text: string) => {
      setSearchText(text);
      
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    
      if (text.length > 2) {
        setIsLoading(true);
        setShowSuggestions(true);
        
        searchTimeoutRef.current = setTimeout(async () => {
          try {
            const suggestions = await fetchSuggestions(text);
            onSearchTextChange(text);
            setLocalSuggestions(suggestions);
          } catch (error) {
            console.error('Erro na busca:', error);
          } finally {
            setIsLoading(false);
          }
        }, 300);
      } else {
        setShowSuggestions(false);
        setLocalSuggestions([]);
      }
    };

  const handleSelectSuggestion = (item: SuggestionItem) => {
    setSearchText(item.subtitle || item.title);
    onSelectSuggestion(item);
    setShowSuggestions(false);

    console.log('Selecionado:', item);
  };

  const renderSuggestionDropdown = ({ item }: { item: SuggestionItem }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelectSuggestion(item)}
    >
      <Ionicons name="location-sharp" size={20} color={colors.primary} />
      <View style={styles.suggestionTextContainer}>
        <Text style={[styles.suggestionTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        {item.subtitle && (
          <Text style={[styles.suggestionSubtitle, { color: colors.placeholder }]}>
            {item.subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
  

    const renderTabButton = (tab: string) => {
        const animatedScale = useRef(new Animated.Value(1)).current;

        const handlePressIn = () => {
            Animated.spring(animatedScale, {
            toValue: 0.95,
            useNativeDriver: true,
            }).start();
        };

        const handlePressOut = () => {
            Animated.spring(animatedScale, {
            toValue: 1,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
            }).start();
        };

        const isActive = selectedTab === tab;
      return (
        <TouchableWithoutFeedback
          key={tab}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => setSelectedTab(tab as TabType)}
        >
          <Animated.View
            style={[
              styles.tabButton,
              isActive && styles.activeTab,
              { transform: [{ scale: animatedScale }] }
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: colors.text },
                isActive && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </Animated.View>
        </TouchableWithoutFeedback>
      );
  };
    
  return (
    <FlatList
      data={[]}
      renderItem={() => null}
      // ---------------------------------------------
      // Header da lista (conteúdo principal da Home)
      ListHeaderComponent={
        <>
          {/* Seção de Tabs "Viagem" e "Serviços" */}
          <View style={styles.header}>
            {['Viagem', 'Serviços'].map(renderTabButton)}
          </View>

          {/* Campo de busca */}
          <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Para onde?"
              placeholderTextColor={colors.placeholder}
              value={searchText}
              onChangeText={handleTextChange}
              onSubmitEditing={handleSearch}
              onFocus={() => searchText.length > 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: colors.primary }]}
              onPress={handleSearch}
              accessibilityLabel="Pesquisar"
              accessibilityRole="button"
            >
              {isLoading ? (
                <ActivityIndicator color="white" size={scale(20)} />
              ) : (
                <Ionicons name="search" size={scale(20)} color="white" />
              )}
            </TouchableOpacity>
          </View>

          {/* Dropdown de sugestões */}
          {showSuggestions && (
            <View style={[
              styles.suggestionsDropdown, 
              { 
                backgroundColor: colors.card,
                top: scale(140), // Usando a função scale
                marginHorizontal: scale(20)
              }
            ]}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={{ color: colors.text, marginLeft: scale(10) }}>
                    Buscando...
                  </Text>
                </View>
              ) : localSuggestions.length > 0 ? (
                <FlatList
                  data={localSuggestions}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.suggestionItem,
                        { borderBottomColor: colors.border }
                      ]}
                      onPress={() => handleSelectSuggestion(item)}
                    >
                      <Ionicons 
                        name="location-sharp" 
                        size={scale(20)} 
                        color={colors.primary} 
                      />
                      <View style={styles.suggestionTextContainer}>
                        {item.subtitle && (
                          <Text 
                            style={[
                              styles.suggestionSubtitle, 
                              { color: colors.placeholder }
                            ]}
                          >
                            {item.subtitle}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  keyboardShouldPersistTaps="always"
                  nestedScrollEnabled
                />
              ) : (
                <Text style={[styles.noResults, { color: colors.placeholder }]}>
                  Nenhum resultado encontrado
                </Text>
              )}
            </View>
          )}

          {/* Histórico */}
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
      // ---------------------------------------------
      // Footer da lista (sugestões)
      ListFooterComponent={
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Sugestões
          </Text>
          <FlatList
            horizontal
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsList}
          />
        </>
      }
      // ---------------------------------------------
      contentContainerStyle={styles.contentContainer}
    />
  );
};

const suggestionStyles = StyleSheet.create({
  dropdown: {
    position: 'absolute',
    top: 55, // Ajuste conforme layout
    left: 15,
    right: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
    maxHeight: 200,
    zIndex: 1000,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  }
});

export default HomeTabContent;
