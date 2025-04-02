import React, { useState, useEffect } from 'react';
import { 
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as FileSystem from 'expo-file-system';
import SmartFeaturesService from '../services/SmartFeaturesService';
import * as Location from 'expo-location';

interface Vehicle {
  id: string;
  model: string;
  plate: string;
  color: string;
}

interface UserData {
  name: string;
  email: string;
  profileImage: string;
  vehicles: Vehicle[];
}

interface AccountOption {
  id: string;
  icon: string;
  title: string;
  screen: string;
}

// Configurações responsivas
const { width } = Dimensions.get('window');
const guidelineBaseWidth = 375;
const scale = (size: number) => (width / guidelineBaseWidth) * size;

interface AccountScreenProps {
  userData: any;
  setUserData: (data: any) => void;
  styles: any;
  colors: any;
  scale: (size: number) => number;
  accountOptions: {
    id: string;
    title: string;
    icon: string;
    screen: string;
  }[];
  renderVehicleItem: ({ item }: { item: Vehicle }) => React.ReactNode;
  renderAccountOption: ({ item }: { item: { id: string; title: string; icon: string; screen: string; } }) => React.ReactElement;
  onOptionSelect: (screen: string) => void;
  onVehicleSelect: (vehicle: Vehicle) => void;
}

const AccountScreen: React.FC<AccountScreenProps> = ({
  userData,
  setUserData,
  styles,
  colors,
  scale,
  accountOptions,
  renderVehicleItem,
  renderAccountOption,
  onOptionSelect,
  onVehicleSelect
}) => {

  // Modais de edição
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [addVehicleModalVisible, setAddVehicleModalVisible] = useState(false);

  // Estados temporários para edição de perfil
  const [tempName, setTempName] = useState(userData.name);
  const [tempEmail, setTempEmail] = useState(userData.email);
  const [tempProfileImage, setTempProfileImage] = useState(userData.profileImage);

  // Estados temporários para cadastro de veículo
  const [tempModel, setTempModel] = useState('');
  const [tempPlate, setTempPlate] = useState('');
  const [tempColor, setTempColor] = useState('#000');

  const [maintenanceSchedule, setMaintenanceSchedule] = useState<any>(null);
  const [insuranceQuote, setInsuranceQuote] = useState<any>(null);
  const smartFeaturesService = SmartFeaturesService.getInstance();

  // Função para salvar a imagem no cache
  const saveImageToCache = async (imageUri: string) => {
    try {
      const fileName = imageUri.split('/').pop();
      const newPath = `${FileSystem.cacheDirectory}profile_${fileName}`;
      
      const fileInfo = await FileSystem.getInfoAsync(newPath);
      if (!fileInfo.exists) {
        await FileSystem.copyAsync({
          from: imageUri,
          to: newPath
        });
      }
      return newPath;
    } catch (error) {
      console.error('Erro ao salvar imagem no cache:', error);
      return imageUri;
    }
  };

  // Carregar dados do usuário do AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData);
          setUserData(parsedData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do perfil');
      }
    };
    loadUserData();
  }, []);

  // Load vehicles from AsyncStorage
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const storedVehicles = await AsyncStorage.getItem('vehicles');
        if (storedVehicles) {
          setUserData({
            ...userData,
            vehicles: JSON.parse(storedVehicles),
          });
        }
      } catch (error) {
        console.error('Failed to load vehicles:', error);
      }
    };
    loadVehicles();
  }, []);

  // Carregar dados de manutenção e seguro
  useEffect(() => {
    const loadSmartFeatures = async () => {
      try {
        if (userData.vehicles.length > 0) {
          const vehicleId = userData.vehicles[0].id;
          await smartFeaturesService.scheduleMaintenance(vehicleId, 'oil');
          const quote = await smartFeaturesService.getInsuranceQuote(vehicleId);
          setInsuranceQuote(quote); //pegando o seguro do veiculo: setInsuranceQuote(false)
        } 
      } catch (error) {
        console.error('Erro ao carregar funcionalidades inteligentes:', error);
      }
    };
    loadSmartFeatures();
  }, [userData.vehicles]);

  // Função para salvar dados do usuário
  const saveUserData = async (data: UserData) => {
    try {
      // Salvar no AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(data));
      
      // Salvar também em um arquivo para backup
      const fileUri = `${FileSystem.documentDirectory}userProfile.txt`;
      const fileContent = `
        Name: ${data.name}
        Email: ${data.email}
        Profile Image: ${data.profileImage}
        Vehicles: ${JSON.stringify(data.vehicles, null, 2)}
      `;
      await FileSystem.writeAsStringAsync(fileUri, fileContent);

      // Atualizar o estado global
      setUserData(data);
    } catch (error) {
      console.error('Erro ao salvar dados do usuário:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações');
    }
  };

  // Save vehicles to AsyncStorage
  const saveVehicles = async (vehicles: Vehicle[]) => {
    try {
      await AsyncStorage.setItem('vehicles', JSON.stringify(vehicles));
    } catch (error) {
      console.error('Failed to save vehicles:', error);
    }
  };

  // Update vehicles and persist changes
  const updateVehicles = async (vehicles: Vehicle[]) => {
    try {
      // Atualizar o estado global
      const updatedUserData = {
        ...userData,
        vehicles,
      };
      setUserData(updatedUserData);
      
      // Salvar no AsyncStorage
      await saveVehicles(vehicles);
      await saveUserData(updatedUserData);
      
      Alert.alert('Sucesso', 'Veículos atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar veículos:', error);
      Alert.alert('Erro', 'Não foi possível atualizar os veículos');
    }
  };

  // Abrir modal de editar perfil
  const handleOpenEditProfile = () => {
    setTempName(userData.name);
    setTempEmail(userData.email);
    setTempProfileImage(userData.profileImage);
    setEditProfileModalVisible(true);
  };

  // Função para escolher imagem da galeria
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permissão necessária', 'É necessário acesso à galeria para alterar a foto');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!pickerResult.canceled) {
        const selectedImageUri = pickerResult.assets[0].uri;
        const cachedImageUri = await saveImageToCache(selectedImageUri);
        
        // Atualizar o estado temporário
        setTempProfileImage(cachedImageUri);
        
        // Atualizar os dados do usuário
        const updatedUserData = {
          ...userData,
          profileImage: cachedImageUri
        };
        await saveUserData(updatedUserData);
        Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  // Salvar edição do perfil
  const handleSaveProfile = async () => {
    if (!tempName.trim() || !tempEmail.includes('@')) {
      Alert.alert('Dados inválidos', 'Verifique nome e e-mail');
      return;
    }

    try {
      const updatedUserData = {
        ...userData,
        name: tempName,
        email: tempEmail,
        profileImage: tempProfileImage,
      };
      
      await saveUserData(updatedUserData);
      setEditProfileModalVisible(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações');
    }
  };

  // Abrir modal de adicionar veículo
  const handleOpenAddVehicle = () => {
    setTempModel('');
    setTempPlate('');
    setTempColor(`#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`); //toda vez que adicionarmos um carro novo, apareça uma cor aleatória
    setAddVehicleModalVisible(true);
  };

  // Salvar novo veículo
  const handleSaveVehicle = async () => {
    const plateRegex = /[A-Z]{3}[0-9][A-Z][0-9]{2}/i;
    if (!tempModel.trim() || !plateRegex.test(tempPlate)) {
      Alert.alert('Dados inválidos', 'Verifique modelo e placa');
      return;
    }

    try {
      const newVehicle: Vehicle = {
        id: Math.random().toString(36).substr(2, 9),
        model: tempModel,
        plate: tempPlate,
        color: tempColor,
      };
      
      const updatedVehicles = [...userData.vehicles, newVehicle];
      await updateVehicles(updatedVehicles);
      setAddVehicleModalVisible(false);
      
      // Limpar os campos temporários
      setTempModel('');
      setTempPlate('');
      setTempColor('#000');
    } catch (error) {
      console.error('Erro ao adicionar veículo:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o veículo');
    }
  };

  // Delete vehicle
  const handleDeleteVehicle = (id: string) => {
    const updatedVehicles = userData.vehicles.filter((vehicle: Vehicle) => vehicle.id !== id);
    updateVehicles(updatedVehicles);
  };

  // Render vehicle item with swipe-to-delete and navigation
  const renderVehicleItemWithSwipe = ({ item }: { item: Vehicle }) => (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity
          style={localStyles.deleteButton}
          onPress={() => handleDeleteVehicle(item.id)}
        >
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    >
      {renderVehicleItem({ item })}
    </Swipeable>
  );

  // Substituir o handleOptionSelect existente
  const handleOptionSelect = (screen: string) => {
    onOptionSelect(screen);
  };

  // Estilos locais que dependem de colors
  const localStyles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 16,
    },
    modalContainer: {
      borderRadius: 12,
      padding: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
    },
    modalInput: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 12,
    },
    modalButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalButton: {
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    deleteButton: {
      backgroundColor: 'red',
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      height: '90%',
      borderRadius: 10,
    },
    deleteButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    pointsButton: {
      marginHorizontal: scale(10),
      marginBottom: scale(25),
      borderRadius: scale(16),
      padding: scale(16),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
      width: '95%',
    },
    pointsButtonContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pointsButtonLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    pointsButtonTextContainer: {
      marginLeft: scale(12),
    },
    pointsButtonTitle: {
      color: '#FFFFFF',
      fontSize: scale(12),
      fontWeight: '600',
      marginBottom: scale(2),
    },
    pointsButtonSubtitle: {
      color: '#FFFFFF',
      fontSize: scale(11),
      opacity: 0.9,
    },
    pointsButtonRight: {
      alignItems: 'flex-end',
    },
    pointsButtonValue: {
      color: '#FFFFFF',
      fontSize: scale(20),
      fontWeight: 'bold',
      marginBottom: scale(2),
    },
    pointsButtonLabel: {
      color: '#FFFFFF',
      fontSize: scale(12),
      opacity: 0.9,
    },
    sectionContainer: {
      marginTop: 20,
      paddingHorizontal: 16,
    },
    maintenanceCard: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      marginTop: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    maintenanceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    maintenanceTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 8,
    },
    maintenanceDate: {
      fontSize: 14,
    },
    insuranceCard: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      marginTop: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    insuranceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    insuranceTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 8,
    },
    insurancePrice: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 4,
    },
    insuranceValidity: {
      fontSize: 14,
    },
    noInsuranceCard: {
      borderWidth: 1,
      borderColor: '#FF6B6B',
      backgroundColor: '#FFF5F5',
    },
    insuranceDescription: {
      fontSize: 14,
      marginBottom: 12,
    },
    insuranceFeatures: {
      marginBottom: 16,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    featureText: {
      marginLeft: 8,
      fontSize: 14,
    },
    insuranceCTA: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFF',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    insuranceCTAText: {
      fontSize: 16,
      fontWeight: '600',
      marginRight: 8,
    },
    workshopCard: {
      borderRadius: 12,
      padding: 16,
      marginTop: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    workshopHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    workshopName: {
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 8,
    },
    workshopAddress: {
      fontSize: 14,
      marginBottom: 8,
    },
    workshopInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    workshopRating: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    workshopRatingText: {
      marginLeft: 4,
      fontSize: 14,
      fontWeight: '600',
    },
    workshopDistance: {
      fontSize: 14,
    },
    workshopServices: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    serviceTag: {
      backgroundColor: 'rgba(0, 122, 255, 0.1)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    serviceTagText: {
      fontSize: 12,
      fontWeight: '500',
    },
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.accountContainer}>
        {/* Header do Perfil */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: userData.profileImage }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {userData.name}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.placeholder, fontSize: 12 }]}>
              {userData.email}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleOpenEditProfile}
          >
            <Ionicons name="pencil" size={scale(18)} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Botão de Pontos e Recompensas */}
        <TouchableOpacity 
          style={[localStyles.pointsButton, { backgroundColor: colors.primary }]}
          onPress={() => handleOptionSelect('Points')}
        >
          <View style={localStyles.pointsButtonContent}>
            <View style={localStyles.pointsButtonLeft}>
              <Ionicons name="star" size={scale(24)} color="#FFFFFF" />
              <View style={localStyles.pointsButtonTextContainer}>
                <Text style={localStyles.pointsButtonTitle}>Pontos e Recompensas</Text>
                <Text style={localStyles.pointsButtonSubtitle}>Ganhe pontos e benefícios</Text>
              </View>
            </View>
            <View style={localStyles.pointsButtonRight}>
              <Text style={localStyles.pointsButtonValue}>2.500</Text>
              <Text style={localStyles.pointsButtonLabel}>pontos</Text>
              <Ionicons name="chevron-forward" size={scale(20)} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Seção de Veículos */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Meus Veículos
          </Text>
          <TouchableOpacity 
            style={{ marginRight: scale(20) }} 
            onPress={handleOpenAddVehicle}
          >
            <Ionicons name="add-circle" size={scale(24)} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={userData.vehicles}
          renderItem={renderVehicleItemWithSwipe}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={[styles.vehicleList]}
        />

        {/* Seção de Manutenção */}
        {maintenanceSchedule && (
          <View style={localStyles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Próxima Manutenção
            </Text>
            <View style={localStyles.maintenanceCard}>
              <View style={localStyles.maintenanceHeader}>
                <Ionicons name="construct-outline" size={24} color="#FF9800" />
                <Text style={[localStyles.maintenanceTitle, { color: colors.text }]}>
                  Troca de Óleo
                </Text>
              </View>
              <Text style={[localStyles.maintenanceDate, { color: colors.placeholder }]}>
                Próxima: 15/05/2024
              </Text>
            </View>
          </View>
        )}

        {/* Seção de Seguro */}
        <View style={[localStyles.sectionContainer, {marginTop: -20, marginBottom: 10}]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Seguro do Veículo
          </Text>
          {insuranceQuote ? (
            <View style={localStyles.insuranceCard}>
              <View style={localStyles.insuranceHeader}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#9C27B0" />
                <Text style={[localStyles.insuranceTitle, { color: colors.text }]}>
                  {insuranceQuote.provider}
                </Text>
              </View>
              <Text style={[localStyles.insurancePrice, { color: colors.primary }]}>
                R$ {insuranceQuote.price.toFixed(2)}
              </Text>
              <Text style={[localStyles.insuranceValidity, { color: colors.placeholder }]}>
                Validade: {insuranceQuote.validity}
              </Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={[localStyles.insuranceCard, localStyles.noInsuranceCard]}
              onPress={() => handleOptionSelect('SeguroPro')}
            >
              <View style={localStyles.insuranceHeader}>
                <Ionicons name="shield-outline" size={24} color="#FF6B6B" />
                <Text style={[localStyles.insuranceTitle, { color: colors.text }]}>
                  SeguroPro
                </Text>
              </View>
              <Text style={[localStyles.insuranceDescription, { color: colors.placeholder }]}>
                Proteja seu veículo com o melhor seguro do mercado
              </Text>
              <View style={localStyles.insuranceFeatures}>
                <View style={localStyles.featureItem}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                  <Text style={[localStyles.featureText, { color: colors.text }]}>
                    Cobertura completa
                  </Text>
                </View>
                <View style={localStyles.featureItem}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                  <Text style={[localStyles.featureText, { color: colors.text }]}>
                    Assistência 24h
                  </Text>
                </View>
                <View style={localStyles.featureItem}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                  <Text style={[localStyles.featureText, { color: colors.text }]}>
                    Preços especiais
                  </Text>
                </View>
              </View>
              <View style={localStyles.insuranceCTA}>
                <Text style={[localStyles.insuranceCTAText, { color: colors.primary }]}>
                  Contratar Agora
                </Text>
                <Ionicons name="arrow-forward" size={20} color={colors.primary} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Opções da Conta */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Configurações
        </Text>
        <FlatList
          data={accountOptions}
          renderItem={renderAccountOption}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.optionsList}
        />

        {/* MODAL: Editar Perfil */}
        <Modal
          visible={editProfileModalVisible}
          animationType="slide"
          transparent
        >
          <View style={localStyles.modalOverlay}>
            <View style={[localStyles.modalContainer, { backgroundColor: colors.card }]}>
              <Text style={[localStyles.modalTitle, { color: colors.text }]}>
                Editar Perfil
              </Text>

              {/* Preview da imagem selecionada */}
              <View style={{ alignItems: 'center', marginBottom: 12 }}>
                <Image 
                  source={{ uri: tempProfileImage }}
                  style={{
                    width: scale(80),
                    height: scale(80),
                    borderRadius: scale(40),
                    marginBottom: scale(8),
                  }}
                />
                <TouchableOpacity
                  style={[localStyles.modalButton, { backgroundColor: colors.border }]}
                  onPress={handlePickImage}
                >
                  <Text style={{ color: colors.text }}>Alterar Foto</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[
                  localStyles.modalInput, 
                  { color: colors.text, borderColor: colors.border }
                ]}
                placeholder="Nome"
                placeholderTextColor={colors.placeholder}
                value={tempName}
                onChangeText={setTempName}
              />
              <TextInput
                style={[
                  localStyles.modalInput, 
                  { color: colors.text, borderColor: colors.border }
                ]}
                placeholder="E-mail"
                placeholderTextColor={colors.placeholder}
                value={tempEmail}
                onChangeText={setTempEmail}
                keyboardType="email-address"
              />

              <View style={localStyles.modalButtonsContainer}>
                <TouchableOpacity
                  style={[localStyles.modalButton, { backgroundColor: colors.border }]}
                  onPress={() => setEditProfileModalVisible(false)}
                >
                  <Text style={{ color: colors.text }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[localStyles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={handleSaveProfile}
                >
                  <Text style={{ color: '#fff' }}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL: Adicionar Veículo */}
        <Modal
          visible={addVehicleModalVisible}
          animationType="slide"
          transparent
        >
          <View style={localStyles.modalOverlay}>
            <View style={[localStyles.modalContainer, { backgroundColor: colors.card }]}>
              <Text style={[localStyles.modalTitle, { color: colors.text }]}>
                Adicionar Veículo
              </Text>

              <TextInput
                style={[localStyles.modalInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="Modelo (Ex: Honda Civic 2020)"
                placeholderTextColor={colors.placeholder}
                value={tempModel}
                onChangeText={setTempModel}
              />
              <TextInput
                style={[localStyles.modalInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="Placa (Ex: ABC1D23)"
                placeholderTextColor={colors.placeholder}
                value={tempPlate}
                onChangeText={setTempPlate}
              />
              <TextInput
                style={[localStyles.modalInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="Cor em Hex (Ex: #FF6B6B)"
                placeholderTextColor={colors.placeholder}
                value={tempColor}
                onChangeText={setTempColor}
              />

              <View style={localStyles.modalButtonsContainer}>
                <TouchableOpacity
                  style={[localStyles.modalButton, { backgroundColor: colors.border }]}
                  onPress={() => setAddVehicleModalVisible(false)}
                >
                  <Text style={{ color: colors.text }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[localStyles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={handleSaveVehicle}
                >
                  <Text style={{ color: '#fff' }}>Adicionar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </GestureHandlerRootView>
  );
};

// Estilos locais que não dependem de colors
const baseStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '90%',
    borderRadius: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pointsButton: {
    marginHorizontal: scale(10),
    marginBottom: scale(25),
    borderRadius: scale(16),
    padding: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    width: '95%',
  },
  pointsButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsButtonTextContainer: {
    marginLeft: scale(12),
  },
  pointsButtonTitle: {
    color: '#FFFFFF',
    fontSize: scale(12),
    fontWeight: '600',
    marginBottom: scale(2),
  },
  pointsButtonSubtitle: {
    color: '#FFFFFF',
    fontSize: scale(11),
    opacity: 0.9,
  },
  pointsButtonRight: {
    alignItems: 'flex-end',
  },
  pointsButtonValue: {
    color: '#FFFFFF',
    fontSize: scale(20),
    fontWeight: 'bold',
    marginBottom: scale(2),
  },
  pointsButtonLabel: {
    color: '#FFFFFF',
    fontSize: scale(12),
    opacity: 0.9,
  },
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  maintenanceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  maintenanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  maintenanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  maintenanceDate: {
    fontSize: 14,
  },
  insuranceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insuranceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insuranceTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  insurancePrice: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  insuranceValidity: {
    fontSize: 14,
  },
});

export default AccountScreen;
