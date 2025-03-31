import React, { useEffect, useState } from 'react';
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
  Alert
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';


type EmergencyScreenRouteProp = { 
    onback: (index: number) => void;
};

const EmergencyScreen = ({ route }: { route: EmergencyScreenRouteProp }) => {
  const [eta, setEta] = useState('8 min');
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [driverPosition] = useState({
    latitude: -23.550520,
    longitude: -46.633308
  });
  const [currentLocation, setCurrentLocation] = React.useState<{ latitude: number; longitude: number }| null>(null);

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

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();

    const interval = setInterval(() => {
      setEta(prev => {
        const time = parseInt(prev) - 1;
        return time > 0 ? `${time} min` : 'Chegando agora';
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleVideoCall = () => {
    // Lógica para chamada de vídeo
    Alert.alert('Conectando...', 'Iniciando chamada de vídeo com o socorrista');
  };

  const handleShareLocation = async () => {
    // Compartilhar localização
    if (currentLocation) {
      await Share.share({
        message: `Minha localização de emergência: https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`,
      });
    }
  };

    function onback(index: number): void {
        Alert.alert(
            "Sair do Modo Emergência",
            "Tem certeza de que deseja sair do modo emergência?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Sair", onPress: () => route.onback(index) }
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
        </View>

        {/* Mapa */}
        {currentLocation ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            {currentLocation && (
              <Marker
                coordinate={currentLocation}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <Animated.View style={[styles.marker, { opacity: fadeAnim }]}>
                  <Ionicons name="alert-circle" size={32} color="#FF3B30" />
                </Animated.View>
              </Marker>
            )}

            <Marker
              coordinate={driverPosition}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.driverMarker}>
                <Ionicons name="car-sport" size={28} color="#FFF" />
              </View>
            </Marker>
          </MapView>
        ) : (
          <View style={styles.loadingMap}>
            <ActivityIndicator size="large" color="#FFF" />
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
                <Text style={styles.distanceText}>1.2 km de distância</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.vehicleInfo}>
                <Ionicons name="car" size={24} color="#FF3B30" />
                <Text style={styles.vehicleText}>Guincho Pesado • ABC1D23</Text>
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
                onPress={() => {/* Lógica SOS */}}
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
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  map: {
    width: '100%',
    height: height * 0.6,
  },
  loadingMap: {
    height: height * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
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