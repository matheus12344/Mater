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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as FileSystem from 'expo-file-system';

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

interface AccountScreenProps {
  userData: UserData;
  setUserData: (data: UserData) => void;  // Nova prop para atualizar dados
  styles: any;            
  colors: any;            
  scale: (size: number) => number; 
  accountOptions: AccountOption[];
  renderVehicleItem: ({ item }: { item: Vehicle }) => JSX.Element;
  renderAccountOption: ({ item }: { item: AccountOption }) => JSX.Element;
}

const AccountScreen: React.FC<AccountScreenProps> = ({
  userData,
  setUserData,
  styles,
  colors,
  scale,
  accountOptions,
  renderVehicleItem,
  renderAccountOption
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

  // Update user data and persist changes
  const updateUserData = (data: Partial<UserData>) => {
    const updatedUserData = { ...userData, ...data };
    setUserData(updatedUserData);
    saveUserData(updatedUserData);
  };

  // Update vehicles and persist changes
  const updateVehicles = async (vehicles: Vehicle[]) => {
    try {
      const updatedUserData = {
        ...userData,
        vehicles,
      };
      await saveUserData(updatedUserData);
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
  const handleSaveVehicle = () => {
    const plateRegex = /[A-Z]{3}[0-9][A-Z][0-9]{2}/i;
    if (!tempModel.trim() || !plateRegex.test(tempPlate)) {
      Alert.alert('Dados inválidos', 'Verifique modelo e placa');
      return;
    }
    if (tempModel.trim() && tempPlate.trim()) {
      const newVehicle: Vehicle = {
        id: Math.random().toString(36).substr(2, 9), // ou use alguma lib
        model: tempModel,
        plate: tempPlate,
        color: tempColor,
      };
      const updatedVehicles = [...userData.vehicles, newVehicle];
      updateVehicles(updatedVehicles);
    }
    setAddVehicleModalVisible(false);
  };

  // Delete vehicle
  const handleDeleteVehicle = (id: string) => {
    const updatedVehicles = userData.vehicles.filter(vehicle => vehicle.id !== id);
    updateVehicles(updatedVehicles);
  };

  // Render vehicle item with swipe-to-delete
  const renderVehicleItemWithSwipe = ({ item }: { item: Vehicle }) => (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity
          style={localStyles.deleteButton}
          onPress={() => handleDeleteVehicle(item.id)}
        >
          <Text style={localStyles.deleteButtonText}>Excluir</Text>
        </TouchableOpacity>
      )}
    >
      {renderVehicleItem({ item })}
    </Swipeable>
  );

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
            <Text style={[styles.profileEmail, { color: colors.placeholder }]}>
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
          contentContainerStyle={styles.vehicleList}
        />

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

// Estilos locais para os modais e swipe
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
    height: '100%',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AccountScreen;
