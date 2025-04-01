import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Dimensions,
  Animated,
  ImageBackground,
  SafeAreaView,
  ActivityIndicator,
  Share,
  Alert,
  Linking,
  Vibration
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import * as Contacts from 'expo-contacts';

type EmergencyScreenRouteProp = { 
    onback: (index: number) => void;
};

const EmergencyScreen = ({ route }: { route: EmergencyScreenRouteProp }) => {
  const [eta, setEta] = useState('8 min');
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [driverPosition, setDriverPosition] = useState({
    latitude: -23.550520,
    longitude: -46.633308
  });
  const [currentLocation, setCurrentLocation] = React.useState<{ latitude: number; longitude: number }| null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [isEmergencyActive, setIsEmergencyActive] = useState(true);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [distanceToDriver, setDistanceToDriver] = useState('1.2');
  const [licensePlate] = useState(() => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const randomLetters = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    const randomNumbers = Array.from({ length: 4 }, () => numbers[Math.floor(Math.random() * numbers.length)]).join('');
    return `${randomLetters}${randomNumbers}`;
  });

  // Carrega contatos de emergência
  const loadEmergencyContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });
        setEmergencyContacts(data.slice(0, 3)); // Pega os 3 primeiros contatos como exemplo
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    }
  };

  // Simula movimento do motorista
  const simulateDriverMovement = useCallback(() => {
    if (currentLocation) {
      const interval = setInterval(() => {
        setDriverPosition(prev => ({
          latitude: prev.latitude + (currentLocation.latitude - prev.latitude) * 0.1,
          longitude: prev.longitude + (currentLocation.longitude - prev.longitude) * 0.1
        }));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentLocation]);

  React.useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permissão de localização negada');
        Alert.alert(
          'Permissão Negada',
          'Não foi possível acessar sua localização. Por favor, habilite as permissões de localização nas configurações do dispositivo.',
          [
            { text: 'Cancelar' },
            { text: 'Abrir Configurações', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }
      setLocationPermissionGranted(true);
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Inicia monitoramento em tempo real
      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000 },
        (newLocation) => {
          setCurrentLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          });
        }
      );
    })();

    loadEmergencyContacts();
    simulateDriverMovement();
    
    // Vibração de alerta
    //const vibrationPattern = [500, 500, 500];
   // Vibration.vibrate(vibrationPattern, true);

    return () => {
      Vibration.cancel();
    };
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();

    const interval = setInterval(() => {
      setEta(prev => {
        const time = parseInt(prev) - 1;
        if (time <= 0) {
          clearInterval(interval);
          Alert.alert('Guincho Chegou!', 'O socorro está aguardando você.');
          return 'Chegou!';
        }
        return `${time} min`;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleVideoCall = () => {
    Alert.alert(
      'Iniciar Videochamada',
      'Escolha o tipo de chamada:',
      [
        { text: 'Chamada Normal', onPress: () => Linking.openURL(`tel:190`) },
        { text: 'Videochamada', onPress: () => Alert.alert('Conectando...', 'Iniciando chamada de vídeo com o socorrista') },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handleShareLocation = async () => {
    if (currentLocation) {
      try {
        const emergencyMessage = 
          `🚨 EMERGÊNCIA 🚨\n` +
          `Preciso de ajuda! Estou em uma situação de emergência.\n\n` +
          `📍 Minha localização atual:\n` +
          `https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}\n\n` +
          `🚗 Placa do guincho: ${licensePlate}\n` +
          `⏱ Tempo estimado de chegada: ${eta}\n` +
          `📞 Em caso de emergência, ligue: 190`;

        await Share.share({
          message: emergencyMessage,
          title: 'Emergência - Compartilhar Localização'
        });
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível compartilhar sua localização.');
      }
    } else {
      Alert.alert('Erro', 'Localização atual não disponível.');
    }
  };

  const handleFirstAid = () => {
    Alert.alert(
      'Instruções de Emergência',
      'Escolha o tipo de instrução:',
      [
        { 
          text: 'Primeiros Socorros', 
          onPress: () => Alert.alert(
            'Primeiros Socorros',
            '1. Mantenha a calma\n' +
            '2. Verifique se a área é segura\n' +
            '3. Verifique consciência da vítima\n' +
            '4. Chame ajuda profissional\n' +
            '5. Verifique respiração\n' +
            '6. Inicie RCP se necessário\n' +
            '7. Controle sangramentos\n' +
            '8. Mantenha a vítima aquecida'
          )
        },
        { 
          text: 'Pane no Veículo', 
          onPress: () => Alert.alert(
            'Em caso de pane',
            '1. Ligue o pisca-alerta\n' +
            '2. Pare em local seguro\n' +
            '3. Use o triângulo de sinalização\n' +
            '4. Mantenha-se fora do veículo\n' +
            '5. Aguarde o socorro em local seguro'
          )
        },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handleEmergencyCall = async () => {
    try {
      await Linking.openURL('tel:190');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível realizar a chamada de emergência');
    }
  };

  function onback(index: number): void {
    Alert.alert(
      "Sair do Modo Emergência",
      "Tem certeza de que deseja sair do modo emergência? Isso encerrará o atendimento.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sair", 
          style: 'destructive',
          onPress: () => {
            Vibration.cancel();
            setIsEmergencyActive(false);
            route.onback(index);
          } 
        }
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => onback(0)}
            style={styles.backButton}
          >
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modo Emergência Ativo</Text>
          <TouchableOpacity 
            onPress={handleEmergencyCall}
            style={styles.emergencyCallButton}
          >
            <Ionicons name="call" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Mapa */}
        {locationPermissionGranted ? (
          currentLocation ? (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              showsUserLocation
              showsMyLocationButton
              showsCompass
            >
              <Marker
                coordinate={currentLocation}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <Animated.View style={[styles.marker, { opacity: fadeAnim }]}>
                  <Ionicons name="alert-circle" size={32} color="#FF3B30" />
                </Animated.View>
              </Marker>

              <Marker
                coordinate={driverPosition}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.driverMarker}>
                  <Ionicons name="car-sport" size={28} color="#FFF" />
                </View>
              </Marker>

              {currentLocation && driverPosition && (
                <Polyline
                  coordinates={[currentLocation, driverPosition]}
                  strokeColor="#FF3B30"
                  strokeWidth={3}
                  lineDashPattern={[1]}
                />
              )}
            </MapView>
          ) : (
            <View style={styles.loadingMap}>
              <ActivityIndicator size="large" color="#FFF" />
              <Text style={styles.loadingText}>Obtendo sua localização...</Text>
            </View>
          )
        ) : (
          <View style={styles.loadingMap}>
            <Text style={styles.errorText}>
              Permissão de localização não concedida.
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => Linking.openSettings()}
            >
              <Text style={styles.retryText}>Abrir Configurações</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Painel de Controle Flutuante */}
        <Animated.View style={[styles.controlPanel, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={['rgba(0,0,0,0.9)', 'rgba(30,30,30,0.97)']}
            style={styles.gradient}
          >
            {/* Informações de Emergência */}
            <View style={styles.emergencyInfo}>
              <Text style={styles.etaText}>Tempo estimado</Text>
              <Text style={styles.etaTime}>{eta}</Text>
              
              <View style={styles.distanceContainer}>
                <Ionicons name="navigate" size={20} color="#FF3B30" />
                <Text style={styles.distanceText}>{distanceToDriver} km de distância</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.vehicleInfo}>
                <Ionicons name="car" size={24} color="#FF3B30" />
                <Text style={styles.vehicleText}>Guincho Pesado • {licensePlate}</Text>
              </View>
            </View>

            {/* Ações Rápidas */}
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleVideoCall}
              >
                <Ionicons name="videocam" size={28} color="#FFF" />
                <Text style={styles.buttonText}>Vídeo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleShareLocation}
              >
                <Ionicons name="share-social" size={28} color="#FFF" />
                <Text style={styles.buttonText}>Compartilhar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleFirstAid}
              >
                <Ionicons name="medkit" size={28} color="#FFF" />
                <Text style={styles.buttonText}>Primeiros Socorros</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  emergencyCallButton: {
    padding: 5,
  },
  map: {
    width: '100%',
    height: height * 0.6,
  },
  loadingMap: {
    height: height * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 10,
  },
  errorText: {
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    padding: 10,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
  },
  marker: {
    padding: 5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
  },
  driverMarker: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  controlPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  gradient: {
    padding: 25,
  },
  emergencyInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  etaText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 5,
  },
  etaTime: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 10,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  distanceText: {
    color: '#FFF',
    marginLeft: 8,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    width: '80%',
    marginVertical: 15,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleText: {
    color: '#FFF',
    marginLeft: 10,
    fontSize: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    padding: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 11,
    marginTop: 8,
  },
});

export default EmergencyScreen;