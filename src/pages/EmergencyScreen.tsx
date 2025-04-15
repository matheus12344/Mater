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
  Vibration,
  ScrollView,
  Modal
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SecurityService from '../services/SecurityService';
import SmartFeaturesService from '../services/SmartFeaturesService';
import AccidentDetectionService from '../services/AccidentDetectionService';

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
  const [driverVerification, setDriverVerification] = useState<any>(null);
  const [serviceHistory, setServiceHistory] = useState<any[]>([]);
  const [accidentHistory, setAccidentHistory] = useState<any[]>([]);
  const [showFirstAidGuide, setShowFirstAidGuide] = useState(false);
  const [showHospitalLocator, setShowHospitalLocator] = useState(false);
  const [nearbyHospitals, setNearbyHospitals] = useState<any[]>([]);
  const [isAccidentMonitoringActive, setIsAccidentMonitoringActive] = useState(false);

  const securityService = SecurityService.getInstance();
  const smartFeaturesService = SmartFeaturesService.getInstance();
  const accidentDetectionService = AccidentDetectionService.getInstance();

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
    loadAccidentHistory();
    startAccidentMonitoring();
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

  // Carrega histórico de acidentes
  const loadAccidentHistory = async () => {
    try {
      const history = await securityService.getAccidentHistory();
      setAccidentHistory(history);
    } catch (error) {
      console.error('Erro ao carregar histórico de acidentes:', error);
    }
  };

  // Inicia o monitoramento de acidentes
  const startAccidentMonitoring = async () => {
    try {
      await securityService.startAccidentMonitoring();
      setIsAccidentMonitoringActive(true);
    } catch (error) {
      console.error('Erro ao iniciar monitoramento de acidentes:', error);
    }
  };

  // Para o monitoramento de acidentes
  const stopAccidentMonitoring = () => {
    securityService.stopAccidentMonitoring();
    setIsAccidentMonitoringActive(false);
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
    setShowFirstAidGuide(true);
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

  // Busca hospitais próximos
  const findNearbyHospitals = async () => {
    try {
      if (!currentLocation) {
        Alert.alert('Erro', 'Localização atual não disponível');
        return;
      }

      // Em um ambiente real, faria uma chamada para uma API de hospitais
      // Aqui simulamos com dados estáticos
      const hospitals = [
        {
          id: '1',
          name: 'Hospital São Lucas',
          distance: '1.2 km',
          rating: 4.5,
          location: {
            latitude: currentLocation.latitude + 0.002,
            longitude: currentLocation.longitude + 0.002
          }
        },
        {
          id: '2',
          name: 'Clínica Emergencial',
          distance: '2.5 km',
          rating: 4.2,
          location: {
            latitude: currentLocation.latitude - 0.003,
            longitude: currentLocation.longitude + 0.001
          }
        },
        {
          id: '3',
          name: 'Centro Médico Central',
          distance: '3.8 km',
          rating: 4.7,
          location: {
            latitude: currentLocation.latitude + 0.001,
            longitude: currentLocation.longitude - 0.004
          }
        }
      ];

      setNearbyHospitals(hospitals);
      setShowHospitalLocator(true);
    } catch (error) {
      console.error('Erro ao buscar hospitais próximos:', error);
      Alert.alert('Erro', 'Não foi possível encontrar hospitais próximos');
    }
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

              {/* Marcadores de hospitais */}
              {showHospitalLocator && nearbyHospitals.map(hospital => (
                <Marker
                  key={hospital.id}
                  coordinate={hospital.location}
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <View style={styles.hospitalMarker}>
                    <Ionicons name="medkit" size={24} color="#FFF" />
                  </View>
                </Marker>
              ))}
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

              {/* Histórico de Acidentes */}
              {accidentHistory.length > 0 && (
                <View style={styles.accidentHistory}>
                  <Text style={styles.historyTitle}>Último Acidente Detectado</Text>
                  <View style={styles.historyItem}>
                    <Text style={styles.historyDate}>
                      {new Date(accidentHistory[0].timestamp).toLocaleDateString()}
                    </Text>
                    <Text style={styles.historySeverity}>
                      Severidade: {accidentHistory[0].severity}
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

              <TouchableOpacity
                style={[styles.actionButton, {width: '45%'}]}
                onPress={findNearbyHospitals}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="medkit" size={24} color="#FF3B30" />
                </View>
                <Text style={styles.buttonText}>Hospitais Próximos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, {width: '50%'}]}
                onPress={() => setIsAccidentMonitoringActive(!isAccidentMonitoringActive)}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons 
                    name={isAccidentMonitoringActive ? "shield-checkmark" : "shield-outline"} 
                    size={24} 
                    color="#FF3B30" 
                  />
                </View>
                <Text style={styles.buttonText}>
                  {isAccidentMonitoringActive ? "Monitoramento Ativo" : "Ativar Monitoramento"}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.ScrollView>

        {/* Modal de Guia de Primeiros Socorros */}
        <Modal
          visible={showFirstAidGuide}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowFirstAidGuide(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Guia de Primeiros Socorros</Text>
                <TouchableOpacity onPress={() => setShowFirstAidGuide(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalScroll}>
                <View style={styles.guideSection}>
                  <Text style={styles.guideTitle}>1. Avaliação Inicial</Text>
                  <Text style={styles.guideText}>
                    • Verifique se a área é segura para abordagem{'\n'}
                    • Verifique o nível de consciência da vítima{'\n'}
                    • Chame ajuda profissional imediatamente{'\n'}
                    • Verifique respiração e pulso
                  </Text>
                </View>
                
                <View style={styles.guideSection}>
                  <Text style={styles.guideTitle}>2. Suporte Básico de Vida</Text>
                  <Text style={styles.guideText}>
                    • Posicione a vítima em decúbito dorsal{'\n'}
                    • Abra as vias aéreas{'\n'}
                    • Inicie RCP se necessário (30 compressões : 2 ventilações){'\n'}
                    • Use DEA se disponível
                  </Text>
                </View>
                
                <View style={styles.guideSection}>
                  <Text style={styles.guideTitle}>3. Controle de Sangramento</Text>
                  <Text style={styles.guideText}>
                    • Aplique pressão direta sobre o ferimento{'\n'}
                    • Elevar o membro lesionado{'\n'}
                    • Aplicar curativo compressivo{'\n'}
                    • Manter a vítima aquecida
                  </Text>
                </View>
                
                <View style={styles.guideSection}>
                  <Text style={styles.guideTitle}>4. Imobilização</Text>
                  <Text style={styles.guideText}>
                    • Imobilize a coluna cervical se houver suspeita de trauma{'\n'}
                    • Imobilize fraturas expostas{'\n'}
                    • Evite movimentar a vítima desnecessariamente
                  </Text>
                </View>
                
                <View style={styles.guideSection}>
                  <Text style={styles.guideTitle}>5. Emergências Específicas</Text>
                  <Text style={styles.guideText}>
                    • Queimaduras: Resfrie com água corrente{'\n'}
                    • Convulsões: Proteja a cabeça e aguarde passar{'\n'}
                    • Intoxicação: Identifique a substância{'\n'}
                    • Parada cardíaca: Inicie RCP imediatamente
                  </Text>
                </View>
              </ScrollView>
              
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setShowFirstAidGuide(false)}
              >
                <Text style={styles.modalButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal de Localização de Hospitais */}
        <Modal
          visible={showHospitalLocator}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowHospitalLocator(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Hospitais Próximos</Text>
                <TouchableOpacity onPress={() => setShowHospitalLocator(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalScroll}>
                {nearbyHospitals.map(hospital => (
                  <TouchableOpacity 
                    key={hospital.id}
                    style={styles.hospitalItem}
                    onPress={() => {
                      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${hospital.location.latitude},${hospital.location.longitude}`);
                      setShowHospitalLocator(false);
                    }}
                  >
                    <View style={styles.hospitalInfo}>
                      <Text style={styles.hospitalName}>{hospital.name}</Text>
                      <View style={styles.hospitalDetails}>
                        <Ionicons name="navigate" size={16} color="#FF3B30" />
                        <Text style={styles.hospitalDistance}>{hospital.distance}</Text>
                        <Ionicons name="star" size={16} color="#FFC107" />
                        <Text style={styles.hospitalRating}>{hospital.rating}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#999" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setShowHospitalLocator(false)}
              >
                <Text style={styles.modalButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  hospitalMarker: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 4,
  },
  accidentHistory: {
    marginTop: 15,
    padding: 12,
    backgroundColor: 'rgba(255,59,48,0.1)',
    borderRadius: 8,
  },
  historySeverity: {
    color: '#FFF',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalScroll: {
    padding: 16,
  },
  guideSection: {
    marginBottom: 20,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hospitalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  hospitalDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hospitalDistance: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
    marginLeft: 4,
  },
  hospitalRating: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
});

export default EmergencyScreen;