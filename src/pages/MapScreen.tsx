import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert, Text, ScrollView } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { decode } from '@mapbox/polyline';
import { LinearGradient } from 'expo-linear-gradient';
import { LogBox } from 'react-native';
import { ServiceItem } from 'src/types';

type Coordinates = {
  latitude: number;
  longitude: number;
};
import { servicePricing } from 'src/config/Pricing';
LogBox.ignoreLogs(['Setting a timer']);

interface RouteParams {
  params?: {
    searchText?: string;
    coordinates?: { latitude: number; longitude: number };
  };
}

interface MapScreenProps {
  route: RouteParams;
  services: ServiceItem[];
}

const MapScreen: React.FC<MapScreenProps> = ({route, services}) => {
  const { colors, theme } = useTheme();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const hasRestored = useRef(false);
  const previousSearchText = useRef<string | null>(null);
  const [lastValidRoute, setLastValidRoute] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [routeInfo, setRouteInfo] = useState<{ coordinates: Coordinates[]; distance: number } | null>(null);

  useEffect(() => {
    if (!hasRestored.current && 
        routeCoordinates.length === 0 && 
        lastValidRoute.length > 0) {
      setRouteCoordinates(lastValidRoute);
      hasRestored.current = true;
    }
  }, [routeCoordinates, lastValidRoute]);

  // Obter localização do usuário
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Ative a localização nas configurações');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setCurrentLocation(newRegion);
      setRegion(newRegion);
    })();
  }, []);

  // Geocodificação usando Nominatim (OpenStreetMap)
  const geocodeAddress = async (address: string) => {
    try {
      const formattedAddress = encodeURIComponent(address.trim());
      const url = `https://nominatim.openstreetmap.org/search?q=${formattedAddress}&format=json&addressdetails=1&limit=1`;
      
      console.log('URL Geocoding:', url); // Debug
  
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'MyAwesomeApp/1.0 (contact@myapp.com)',
          'Accept-Language': 'pt-BR,pt;q=0.9',
        },
        timeout: 10000,
      });
  
      console.log('Resposta Geocoding:', response.data); // Debug
  
      if (!response.data?.length) {
        Alert.alert('😕 Endereço não encontrado', 'Verifique a ortografia ou tente um endereço mais completo');
        return null;
      }
  
      const bestMatch = response.data[0];
      return {
        latitude: Number(bestMatch.lat), // Use Number() ao invés de parseFloat()
        longitude: Number(bestMatch.lon)
      };
    } catch (error) {
      console.error('Erro completo:', error);
      Alert.alert('🌐 Erro de conexão', 'Verifique sua internet e tente novamente');
      return null;
    }
  };

  // Calcular rota usando OSRM
  const calculateRoute = async (start: { latitude: number; longitude: number }, end: { latitude: number; longitude: number }): Promise<{ coordinates: { latitude: number; longitude: number }[]; distance: number; duration: number } | null> => {
    try {
      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}`,
        {
          params: {
            overview: 'full',
            geometries: 'geojson',
            alternatives: 'false',
            steps: 'false'
          },
          timeout: 10000
        }
      );
  
      if (response.data?.code !== 'Ok' || !response.data?.routes?.[0]?.geometry) {
        console.error('Resposta inválida:', response.data);
        return null;
      }
  
      // Acessa diretamente as coordenadas do GeoJSON
      const coordinates = response.data.routes[0].geometry.coordinates;

      
      
      if (!coordinates.length) {
        console.error('Coordenadas vazias:', coordinates);
        return null;
      }
  
      // Converte [lon, lat] para {latitude, longitude}
      return {
        coordinates: response.data.routes[0].geometry.coordinates.map(([longitude, latitude]: [number, number]) => ({ latitude, longitude })),
        distance: response.data.routes[0].distance, // Distância em metros
        duration: response.data.routes[0].duration // Em segundos
      };
      
  
    } catch (error) {
      console.error('Erro completo:', error);
      return null
    }
  };

  // Exibição formatada
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return `${hours}h${minutes}m`;
  };

  

  // Função auxiliar de validação
  const isValidCoordinate = (coord: { latitude: number; longitude: number }) => {
    return (
      typeof coord.latitude === 'number' &&
      typeof coord.longitude === 'number' &&
      Math.abs(coord.latitude) <= 90 &&
      Math.abs(coord.longitude) <= 180
    );
  };

  // Adicione este useEffect para debug
  useEffect(() => {
    console.log('Estado atual:', {
      currentLocation,
      destination,
      routeCoordinates: routeCoordinates.slice(0, 3),
      services: services?.length // Verifica se services existe
    });
  }, [currentLocation, destination, routeCoordinates, services]);

  useEffect(() => {
      if (!hasRestored.current && 
        routeCoordinates.length === 0 && 
        lastValidRoute.length > 0 &&
        lastValidRoute.every(isValidCoordinate)) {
      setRouteCoordinates(lastValidRoute);
      hasRestored.current = true;
    }
  }, [routeCoordinates, lastValidRoute]);

  useEffect(() => {
    const currentSearchText = route.params?.searchText;
    
    if (currentSearchText && currentSearchText !== previousSearchText.current) {
      handleSearch(currentSearchText);
      previousSearchText.current = currentSearchText;
    }
  }, [route.params?.searchText]);

  // Handler de busca
  const handleSearch = async (query: string) => {
    if (!query || query === previousSearchText.current) return;
    
    setLoading(true);
    try {
      const destinationCoords = await geocodeAddress(query);
      
      if (!destinationCoords || !currentLocation) {
        setRouteCoordinates([]);
        setDestination(null);
        return;
      }
  
      const route = await calculateRoute(currentLocation, destinationCoords);

      if (route) {
        setRouteInfo({
          coordinates: route.coordinates,
          distance: route.distance
        });
      }

      if (route && route.coordinates.length > 0) {
        setDestination(destinationCoords);
        setRouteCoordinates(route.coordinates);
        setLastValidRoute(route.coordinates);

        setTimeout(() => {
          mapRef.current?.fitToCoordinates(route.coordinates, {
            edgePadding: { top: 100, right: 50, bottom: 150, left: 50 },
            animated: true,
          });
        }, 500);
        
        // Atualiza a região do mapa
        mapRef.current?.fitToCoordinates(route.coordinates, {
          edgePadding: { top: 100, right: 50, bottom: 150, left: 50 },
          animated: true,
        });
      } else {
        Alert.alert('Rota não encontrada', 'Não foi possível traçar o caminho');
      }
      
    } finally {
      setLoading(false);
    }
  };

  const calculateServicePrice = (serviceId: string, distance: number) => {
    const pricing = servicePricing[serviceId];
    if (!pricing) return 0;
  
    // Converta a distância de metros para quilômetros e subtraia os quilômetros mínimos
    const km = Math.max(distance / 1000 - pricing.minimumKm, 0);

    // Calcule o preço total com base na tarifa base e na distância acima dos quilômetros mínimos
    return pricing.baseRate + (km * pricing.perKm);
    
  };
  
  // Componente de visualização de preços
  const PriceEstimateCard = ({ service, distance }: { service: ServiceItem; distance: number }) => {
    const { colors } = useTheme();
    const pricing = servicePricing[service.id];
    const price = calculateServicePrice(service.id, distance);
  
    return (
      <TouchableOpacity style={[styles.priceCard, { backgroundColor: '#fff' }]} onPress={() => console.log('Selecionado:', service)}>
        <View style={styles.serviceHeader}>
          <Ionicons name={service.icon as any} size={24} color={service.color} />
          <Text style={[styles.serviceName, { color: colors.text }]}>{service.title}</Text>
          <Text style={[styles.servicePrice, { color: 'black' }]}>
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(price)}
          </Text>
        </View>
        
        <View style={styles.priceBreakdown}>
          <Text style={[styles.priceDetail, { color: colors.placeholder }]}>
            {pricing.formula}
          </Text>
          <Text style={[styles.priceDetail, { color: colors.placeholder }]}>
            Distância: {(distance / 1000).toFixed(1)}km
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        ref={mapRef}
        style={[styles.map, StyleSheet.absoluteFillObject]}
        region={region}
        showsUserLocation={false}
        showsMyLocationButton={false}
        onMapReady={() => console.log('Mapa pronto')}
      >
        {/* Marcador de localização atual */}
        {currentLocation && (
          <Marker coordinate={currentLocation}>
            <View style={[styles.markerCurrent, { backgroundColor: colors.primary }]}>
              <Ionicons name="navigate" size={20} color="blue" />
            </View>
          </Marker>
        )}

        {/* Marcador de destino */}
        {destination && isValidCoordinate(destination) && (
          <Marker coordinate={destination}>
            <View style={styles.markerDestination}>
              <Ionicons name="flag" size={24} color="white" />
            </View>
          </Marker>
        )}

        {/* Linha da rota */}
        {routeCoordinates.length > 0 && isValidCoordinate(routeCoordinates[0]) && (
          <Polyline
            zIndex={999} // Garante que a rota fique acima de outros elementos
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor={'#007AFF'}
            lineDashPattern={[0]}
          />
        )}
      </MapView>

      {/* Adicione coordenadas de debug */}
      {__DEV__ && destination && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            Destino: {destination.latitude.toFixed(6)}, {destination.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      {routeInfo && services && (
        <ScrollView style={styles.pricingContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.pricingTitle}>Opções de Serviço</Text>
          {services.map((service: ServiceItem) => (
            <PriceEstimateCard 
              key={service.id} 
              service={service} 
              distance={routeInfo.distance} 
            />
          ))}
          <View style={{width: 100, marginTop:50}}/>
        </ScrollView>
      )}

      {/* Overlay de busca */}
      <LinearGradient
        colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.6)']}
        style={styles.searchContainer}
      >
        <TextInput
          style={styles.searchInput}
          placeholder="Digite o destino..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => handleSearch(searchQuery)}
        />
        <TouchableOpacity 
          style={[styles.searchButton, { backgroundColor: colors.primary }]}
          onPress={() => handleSearch(searchQuery)}
        >
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
      </LinearGradient>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={"#333"} />
          <Text style={styles.loadingText}>Calculando rota...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f3f5',
  },
  map: {
    width,
    height: '100%',
  },
  searchContainer: {
    position: 'absolute',
    top: 20,
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    borderRadius: 30,
    padding: 5,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  markerCurrent: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerDestination: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff4757',
  },
  loadingOverlay: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: 'black',
  },
  debugContainer: {
    position: 'absolute',
    bottom: 100,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
  debugText: {
    color: 'white',
    fontSize: 12,
  },
  pricingContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    top: '50%'
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  priceCard: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF'
  },
  priceBreakdown: {
    marginTop: 8,
    borderTopWidth: 1,
    paddingTop: 8
  },
  priceDetail: {
    fontSize: 14,
    marginVertical: 2
  }
});

export default MapScreen;