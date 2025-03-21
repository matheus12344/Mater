import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '../context/ThemeContext';
import { LocationType } from '../types';

type Location = {
  latitude: number;
  longitude: number;
  address: string;
  type: string;
};
import { Ionicons } from '@expo/vector-icons';


import { RouteProp } from '@react-navigation/native';

type MapScreenRouteProp = RouteProp<{ params: { searchText?: string } }, 'params'>;

const MapScreen = ({ route }: { route: MapScreenRouteProp }) => {
  const { colors } = useTheme();
  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedLocation, setSearchedLocation] = useState<Location | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [locations, setLocations] = useState<LocationType[]>([
    {
      title: "Work",
      address: "1500 Market Street",
      latitude: 37.79027,
      longitude: -122.40042,
      type: "work"
    },
    {
      title: "1500 Michigan Street",
      address: "San Francisco",
      latitude: 37.78467,
      longitude: -122.40642,
      type: "home"
    }
  ]);

  useEffect(() => {
    if (route.params?.searchText) {
        handleSearch(route.params.searchText);
      }
    }, [route.params]);

    const handleSearch = async (query: string) => {
        try {
          const results = await Location.geocodeAsync(query);
          
          if (results.length > 0) {
            const { latitude, longitude } = results[0];
            const newLocation: Location = {
              address: query,
              latitude,
              longitude,
              type: 'searched'
            };
    
            setSearchedLocation(newLocation);
            setRegion({
              latitude,
              longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
            setSearchQuery(query);
          } else {
            Alert.alert('Local não encontrado', 'Não foi possível encontrar o endereço informado');
          }
        } catch (error) {
          Alert.alert('Erro', 'Ocorreu um erro ao buscar o local');
        }
      };

  const styles = createStyles('light'); // or 'dark' based on your theme

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        onMapReady={() => setMapReady(true)}
      >
        {/* Marcadores fixos */}
        {locations.map((loc, index) => (
          <Marker
            key={`fixed-${index}`}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.title}
            description={loc.address}
            pinColor={loc.type === 'work' ? colors.primary : '#4CAF50'}
          />
        ))}

        {/* Marcador da busca */}
        {searchedLocation && (
          <Marker
            coordinate={{
              latitude: searchedLocation.latitude,
              longitude: searchedLocation.longitude
            }}
            title="Local Pesquisado"
            description={searchQuery}
            pinColor="#FF6B6B"
          />
        )}
      </MapView>

      {/* Barra de pesquisa overlay */}
      <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Digite um endereço"
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => handleSearch(searchQuery)}
        />
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => handleSearch(searchQuery)}
        >
          <Ionicons name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const createStyles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: width,
    height: height,
  },
    searchBox: {
        position: 'absolute',
        top: 40,
        width: '90%',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 25,
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
    },
    searchButton: {
        marginLeft: 10,
        padding: 8,
        borderRadius: 25,
    },
});

export default MapScreen;