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
  ActivityIndicator,
  PanResponder,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';


import type { TabType, SuggestionItem } from '../types/index'; 

import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { scale } from 'react-native-size-matters';

// Defina a interface das props que este componente precisa receber
interface HomeTabContentProps {
  selectedTab: TabType;
  setSelectedTab: (tab: TabType) => void;
  styles: any;
  colors: any;
  scale: (size: number) => number; 
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
  onDeleteHistoryItem: (index: number) => void; // Nova prop para deletar histórico
  onMap: (index: number) => void; // Nova prop para deletar histórico
  onEmergency: (index: number) => void; // Nova prop para deletar histórico
  handleCommunity: (index: number) => void;
  

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
  onDeleteHistoryItem,
  onMap,
  onEmergency,
  handleCommunity
}) => {

  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [localSuggestions, setLocalSuggestions] = React.useState<SuggestionItem[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const [currentLocation, setCurrentLocation] = React.useState<{ latitude: number; longitude: number }| null>(null);
  const [searchTimestamps, setSearchTimestamps] = React.useState<{ [key: number]: Date }>({});

  React.useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permissão de localização negada');
        return;
      }
  
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const SwipeableHistoryItem = ({ 
    item, 
    index, 
    onDelete 
  }: { 
    item: string; 
    index: number;
    onDelete: (index: number) => void 
  }) => {
    const swipeX = useRef(new Animated.Value(0)).current;
    const swipeThreshold = scale(-80); // Largura do swipe para exclusão
    const itemWidth = scale(300); // Largura aproximada do item
  
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 2);
        },
        onPanResponderMove: Animated.event(
          [null, { dx: swipeX }],
          { useNativeDriver: false }
        ),
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < swipeThreshold) {
            Animated.timing(swipeX, {
              toValue: swipeThreshold,
              duration: 200,
              useNativeDriver: true
            }).start(() => onDelete(index));
          } else {
            Animated.spring(swipeX, {
              toValue: 0,
              useNativeDriver: true
            }).start();
          }
        }
      })
    ).current;
  
    return (
      <View style={styles.historyItemContainer}>
        {/* Background de Exclusão */}
        <View style={[styles.deleteContainer, { width: -swipeThreshold }]}>
          <Ionicons name="trash" size={scale(20)} color="white" />
        </View>
  
        {/* Item do Histórico com Gestos */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.historyItem,
            { 
              backgroundColor: colors.card,
              transform: [{ translateX: swipeX }] 
            }
          ]}
        >
          <Ionicons name="time" size={scale(20)} color={colors.text} />
          <View style={[styles.historyTextContainer]}>
            <View style={{flexDirection: 'row' }}>
              <Text style={[styles.historyTitle, { color: colors.text, fontWeight: 'bold' }]}>
                {item}
              </Text>
              <Text style={[styles.historySubtitle, { color: colors.text, marginLeft: scale(200), fontSize: scale(12), top: scale(2), position: 'absolute' }]}>
                {searchTimestamps[index] ? getTimeAgo(searchTimestamps[index]) : 'Agora'}
              </Text>
            </View>
            <Text style={[styles.historySubtitle, { color: 'gray', fontSize: scale(12) }]}>
              Rua de exemplo, 123, {/* apenas teste de endereço */}
              {item}
            </Text>
          </View>
        </Animated.View>
      </View>
    );
  };
  
  /**
   * Componente para exibição de itens de histórico com gesto de swipe
   * param {string} item - Texto do histórico
   * param {number} index - Índice do item na lista
   * param {function} onDelete - Função para deletar item
  */

  const renderHistoryItem = ({ item, index }: { item: string; index: number }) => (
    <SwipeableHistoryItem
      item={item}
      index={index}
      onDelete={onDeleteHistoryItem}
    />
  );

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

  const handlePanicButtonPress = () => {
    if (currentLocation) {
      console.log('Solicitação de guincho:');
      console.log(`Localização atual: Latitude ${currentLocation.latitude}, Longitude ${currentLocation.longitude}`);
      console.log('Mensagem: Solicitação de guincho enviada com sucesso.');
    } else {
      console.log('Erro: Localização atual não disponível.');
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / 60000);
    return `${diffInMinutes} min atrás`;
  };

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
    <View style={{flex: 1}}>
      {/* FlatList e outros componentes */}
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

            {/* Mapa */}
            <TouchableOpacity
              style={[MapStyles.mapContainer, { 
                height: scale(200), 
                backgroundColor: colors.card, 
                shadowRadius: 5, 
                shadowColor: colors.border, 
                shadowOpacity: 0.5, 
                shadowOffset: { width: 0, height: 2 }, 
                elevation: 5 
              }]} 
              onPress={() => onMap(0)}
              activeOpacity={1}
              onPressIn={() => console.log('Pressionado')}
            >
                  {currentLocation && (
                    <MapView
                      style={MapStyles.map}
                      initialRegion={{
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                      }}
                    >
                      <Marker
                        coordinate={currentLocation}
                        title="Você está aqui"
                        description="Sua localização atual"
                        pinColor={'#2A2AC9'}
                      />
                    </MapView>
                  )}
            </TouchableOpacity>

            {/* Histórico */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Histórico
            </Text>
            <FlatList
              data={history}
              renderItem={renderHistoryItem}
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
              nestedScrollEnabled
            />
          </>
        }
        // ---------------------------------------------
        contentContainerStyle={styles.contentContainer}
      />

      {/* Botão de pânico (Apenas o conceito por enquanto...) */}
      <TouchableOpacity 
        style={{
            height: 80, 
            width: 80,
            borderRadius: 40, 
            backgroundColor: '#ff6666', 
            position: 'absolute', 
            alignItems: 'center', 
            justifyContent: 'center',
            top: 530,
            left: 295,
            zIndex: 10,
          }}
        onPress={() => Alert.alert(
          'Detectamos um possível acidente!',
          'Você precisa de ajuda?',
          [
            {
              text: "Cancelar",
              onPress: () => console.log('Cancelando emergência!'),
              style: 'cancel'
            },
            { 
              text: "SOS", 
              onPress: () => {
                handlePanicButtonPress();
                onEmergency(0);
              } 
            }
          ],
          { cancelable: false }
        )}
        accessible
        accessibilityLabel="Botão de emergência"
        accessibilityRole="button"
        accessibilityHint="Clique para solicitar ajuda em caso de emergência"
        >
            <Ionicons name="alert-circle-outline" size={50} color="white" />
      </TouchableOpacity>

      {/* Botão da Comunidade */}
      <TouchableOpacity
        style={[styles.communityButton, { backgroundColor: colors.primary }]}
        onPress={() => handleCommunity(0)}
        accessibilityLabel="Acessar Comunidade"
        accessibilityRole="button"
      >
        <Ionicons name="people" size={scale(20)} color="white" />
      </TouchableOpacity>
  </View>
  );
};

const MapStyles = StyleSheet.create({
  mapContainer: {
    width: '90%',
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: 20,
  },
  map: {
    flex: 1,
  }
})

const styles = StyleSheet.create({
  communityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(12),
    borderRadius: scale(12),
    marginHorizontal: scale(16),
    marginTop: scale(10),
    marginBottom: scale(5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  communityButtonText: {
    color: '#FFFFFF',
    fontSize: scale(16),
    fontWeight: '600',
    marginLeft: scale(8),
  },
});

export default HomeTabContent;



