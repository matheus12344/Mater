import React, { useState } from 'react';
import { 
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; 

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

  // Abrir modal de editar perfil
  const handleOpenEditProfile = () => {
    setTempName(userData.name);
    setTempEmail(userData.email);
    setTempProfileImage(userData.profileImage);
    setEditProfileModalVisible(true);
  };

  // Salvar edição do perfil
  const handleSaveProfile = () => {
    setUserData({
      ...userData,
      name: tempName,
      email: tempEmail,
      profileImage: tempProfileImage,
    });
    setEditProfileModalVisible(false);
  };

  // Abrir modal de adicionar veículo
  const handleOpenAddVehicle = () => {
    setTempModel('');
    setTempPlate('');
    setTempColor('#000');
    setAddVehicleModalVisible(true);
  };

  // Função para escolher imagem da galeria
  const handlePickImage = async () => {
    // Pede permissão para acessar a galeria
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      alert("Permissão de acesso à galeria é necessária para alterar a foto!");
      return;
    }

    // Abre a galeria
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],    // Ajuste a proporção se desejar
      quality: 0.8,
    });

    // Se o usuário não cancelar, salvamos a URI
    if (!pickerResult.canceled) {
      setTempProfileImage(pickerResult.assets[0].uri);
    }
  };

  // Salvar novo veículo
  const handleSaveVehicle = () => {
    if (tempModel.trim() && tempPlate.trim()) {
      const newVehicle: Vehicle = {
        id: Math.random().toString(36).substr(2, 9), // ou use alguma lib
        model: tempModel,
        plate: tempPlate,
        color: tempColor,
      };
      setUserData({
        ...userData,
        vehicles: [...userData.vehicles, newVehicle],
      });
    }
    setAddVehicleModalVisible(false);
  };

  return (
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
        renderItem={renderVehicleItem}
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
  );
};

// Estilos locais para os modais
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
});

export default AccountScreen;
