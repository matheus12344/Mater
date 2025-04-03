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
import AsyncStorage from '@react-native-async-storage/async-storage';
import SecurityService from '../services/SecurityService';
import SmartFeaturesService from '../services/SmartFeaturesService';

type EmergencyScreenRouteProp = { 
    onback: (index: number) => void;
};

type EmergencyScreenProps = {
  route: EmergencyScreenRouteProp;
};

const EmergencyScreen: React.FC<EmergencyScreenProps> = ({route}) => {
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
  const [driverVerification, setDriverVerification] = useState<any>(null);
  const [serviceHistory, setServiceHistory] = useState<any[]>([]);

  const securityService = SecurityService.getInstance();
  const smartFeaturesService = SmartFeaturesService.getInstance();

  // Carrega contatos de emergência
  const loadEmergencyContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });
        setEmergencyContacts(data.slice(0, 3));
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    }
  };

  // Inicia compartilhamento de localização
  const startLocationSharing = async () => {
    try {
      await securityService.startLocationSharing();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível iniciar o compartilhamento de localização');
    }
  };

  // Ativa modo de pânico
  const handlePanicMode = async () => {
    try {
      await securityService.activatePanicMode();
      Vibration.vibrate([500, 500, 500], true);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível ativar o modo de emergência');
    }
  };

  // Verifica identidade do motorista
  const verifyDriver = async () => {
    try {
      const driverData = await securityService.verifyDriverIdentity('driver123');
      Alert.alert(
        'Motorista Verificado',
        `Nome: ${driverData.name}\nPlaca: ${driverData.vehiclePlate}\nAvaliação: ${driverData.rating}`
      );
      setDriverVerification(driverData);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível verificar o motorista');
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

  // Carregar dados de segurança
  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      // Carregar histórico de serviços
      const history = await AsyncStorage.getItem('service_history');
      if (history) {
        setServiceHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Erro ao carregar dados de segurança:', error);
    }
  };

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

      // Inicia compartilhamento de localização
      await startLocationSharing();
    })();

    loadEmergencyContacts();
    simulateDriverMovement();
    verifyDriver();

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

  const renderMap = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.webMapPlaceholder}>
          <Text style={styles.webMapText}>Mapa não disponível na versão web</Text>
          <Text style={styles.webMapSubtext}>Por favor, use o aplicativo móvel para acessar o mapa</Text>
        </View>
      );
    }

    if (!locationPermissionGranted) {
      return (
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
      );
    }

    if (!currentLocation) {
      return (
        <View style={styles.loadingMap}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Obtendo sua localização...</Text>
        </View>
      );
    }

    return (
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
    );
  };

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
        {renderMap()}

        {/* Painel de Controle Flutuante */}
        <Animated.ScrollView style={[styles.controlPanel, { opacity: fadeAnim }]}>
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

              {/* Verificação do Motorista */}
              {driverVerification && (
                <View style={styles.driverVerification}>
                  <View style={styles.driverHeader}>
                    <Ionicons name="checkmark-circle" size={24} color="#FF3B30" />
                    <Text style={styles.driverText}>
                      Motorista Verificado
                    </Text>
                  </View>
                  <Text style={styles.driverDetails}>
                    {driverVerification.name} • {driverVerification.vehiclePlate}
                  </Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFC107" />
                    <Text style={styles.ratingText}>
                      {driverVerification.rating}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.divider} />

              {/* Histórico de Serviços */}
              {serviceHistory.length > 0 && (
                <View style={styles.serviceHistory}>
                  <Text style={styles.historyTitle}>Último Serviço</Text>
                  <View style={styles.historyItem}>
                    <Text style={styles.historyDate}>
                      {new Date(serviceHistory[0].timestamp).toLocaleDateString()}
                    </Text>
                    <Text style={styles.historyRating}>
                      Avaliação: {serviceHistory[0].rating}/5
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Ações Rápidas */}
            <View style={styles.actionGrid}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleVideoCall}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="videocam" size={24} color="#FFF" />
                </View>
                <Text style={styles.buttonText}>Vídeo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleShareLocation}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="share-social" size={24} color="#FFF" />
                </View>
                <Text style={[styles.buttonText, {fontSize: 11}]}>Compartilhar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleFirstAid}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="medkit" size={24} color="#FFF" />
                </View>
                <Text style={styles.buttonText}>Primeiros Socorros</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.panicButton]}
                onPress={handlePanicMode}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="warning" size={24} color="#FFF" />
                </View>
                <Text style={styles.buttonText}>Pânico</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, {width: '65%'}]}
                onPress={verifyDriver}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#FF3B30" />
                </View>
                <Text style={styles.buttonText}>Verificar Motorista</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.ScrollView>

    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  emergencyCallButton: {
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 20,
  },
  map: {
    flex: 1,
    width: '100%',
  },
  loadingMap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFF',
    fontSize: 16,
  },
  marker: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 4,
  },
  driverMarker: {
    backgroundColor: '#FF3B30',
    borderRadius: 20,
    padding: 4,
  },
  controlPanel: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    right: 0,
    borderRadius: 20,
    overflow: 'hidden',
    width: '95%',
    top: 400
  },
  gradient: {
    padding: 16,
  },
  emergencyInfo: {
    marginBottom: 16,
    alignItems: 'center'
  },
  etaText: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 4,
  },
  etaTime: {
    color: '#FFF',
    fontSize: 25,
    fontWeight: '700',
    marginBottom: 16,
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
    width: '95%',
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
  driverVerification: {
    marginTop: 15,
    padding: 12,
    backgroundColor: 'rgba(255,59,48,0.1)',
    borderRadius: 8,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  driverText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  driverDetails: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: 4,
  },
  serviceHistory: {
    marginTop: 15,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  historyTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    color: '#FFF',
    fontSize: 14,
  },
  historyRating: {
    color: '#FFF',
    fontSize: 14,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    width: '30%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  panicButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  webMapText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 10,
  },
  webMapSubtext: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
  },
});

export default EmergencyScreen;