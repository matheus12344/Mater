import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { decode } from '@mapbox/polyline';
import { LinearGradient } from 'expo-linear-gradient';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Setting a timer']);

interface RouteParams {
  params?: {
    searchText?: string;
  };
}

const MapScreen = ({ route }: { route: RouteParams }) => {
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
  const calculateRoute = async (start: { latitude: number; longitude: number }, end: { latitude: number; longitude: number }) => {
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
        return [];
      }
  
      // Acessa diretamente as coordenadas do GeoJSON
      const coordinates = response.data.routes[0].geometry.coordinates;
      
      if (!coordinates.length) {
        console.error('Coordenadas vazias:', coordinates);
        return [];
      }
  
      // Converte [lon, lat] para {latitude, longitude}
      return coordinates.map(([lon, lat]: [number, number]) => ({
        latitude: lat,
        longitude: lon
      }));
  
    } catch (error) {
      console.error('Erro completo:', error);
      return [];
    }
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
      routeCoordinates: routeCoordinates.slice(0, 3)
    });
  }, [currentLocation, destination, routeCoordinates]);

  useEffect(() => {
    if (routeCoordinates.length === 0 && lastValidRoute.length > 0) {
      if (!hasRestored.current) {
        setRouteCoordinates(lastValidRoute);
        hasRestored.current = true;
      }
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
      
      if (route.length > 0) {
        setDestination(destinationCoords);
        setRouteCoordinates(route);
        
        // Atualiza a região do mapa
        mapRef.current?.fitToCoordinates(route, {
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
          <ActivityIndicator size="large" color={colors.primary} />
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
    color: '#333',
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
});

export default MapScreen;