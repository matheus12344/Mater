import React from 'react';
import { 
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';


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
  styles: any;            // estilos retornados por createStyles
  colors: any;            // objeto de cores do tema (light/dark)
  scale: (size: number) => number; 
  accountOptions: AccountOption[];
  renderVehicleItem: ({ item }: { item: Vehicle }) => JSX.Element;
  renderAccountOption: ({ item }: { item: AccountOption }) => JSX.Element;
}

const AccountScreen: React.FC<AccountScreenProps> = ({
  userData,
  styles,
  colors,
  scale,
  accountOptions,
  renderVehicleItem,
  renderAccountOption
}) => {
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
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="pencil" size={scale(18)} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Seção de Veículos */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Meus Veículos
      </Text>
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
    </ScrollView>
  );
};

export default AccountScreen;