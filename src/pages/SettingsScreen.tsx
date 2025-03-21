import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  Switch,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext'; // Supondo um contexto de tema

interface SettingsScreenProps {
  styles: any;
  colors: any;
  scale: (size: number) => number;
}

interface PasswordValidation {
  (password: string): boolean;
}


const SettingsScreen: React.FC<SettingsScreenProps> = ({ styles, colors, scale }) => {
  const { theme, toggleTheme } = useTheme();
  const [changePassModal, setChangePassModal] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const isPasswordValid: PasswordValidation = (password) => {
    return password.length >= 6 && /\d/.test(password) && /[!@#$%^&*]/.test(password);
  };

  const handleChangePassword = useCallback(() => {
    if (!currentPass || !newPass || !confirmPass) {
      return Alert.alert('Erro', 'Preencha todos os campos.');
    }

    if (newPass !== confirmPass) {
      return Alert.alert('Erro', 'As senhas não coincidem.');
    }

    if (!isPasswordValid(newPass)) {
      return Alert.alert('Erro', 'A nova senha deve ter no mínimo 6 caracteres, um número e um caractere especial.');
    }

    Alert.alert('Sucesso', 'Senha alterada com sucesso!');
    setChangePassModal(false);
  }, [currentPass, newPass, confirmPass]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Você saiu da conta.');
  };

  const clearCache = () => {
    Alert.alert('Cache Limpo', 'O cache da aplicação foi limpo.');
  };

  const openPrivacyPolicy = () => {
    Alert.alert('Política de Privacidade', 'Redirecionando para a política de privacidade...');
  };

  const securitySettings = [
    {
      id: '1',
      icon: 'lock-closed',
      title: 'Alterar Senha',
      action: () => setChangePassModal(true)
    },
    {
      id: '2',
      icon: 'finger-print',
      title: 'Biometria',
      action: () => setBiometricEnabled(!biometricEnabled),
      rightComponent: () => (
        <Switch
          value={biometricEnabled}
          onValueChange={setBiometricEnabled}
          trackColor={{ true: colors.primary, false: colors.border }}
          accessibilityLabel="Ativar biometria"
        />
      )
    }
  ];

  const appearanceSettings = [
    {
      id: '1',
      icon: 'moon',
      title: 'Tema Escuro',
      action: toggleTheme,
      rightComponent: () => (
        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
          trackColor={{ true: colors.primary, false: colors.border }}
        />
      )
    }
  ];

  const notificationSettings = [
    {
      id: '1',
      icon: 'notifications',
      title: 'Notificações',
      action: () => setNotificationsEnabled(!notificationsEnabled),
      rightComponent: () => (
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ true: colors.primary, false: colors.border }}
          accessibilityLabel="Ativar notificações"
        />
      )
    }
  ];

  const settings = [
    {
      id: '4',
      icon: 'trash',
      title: 'Limpar Cache',
      action: clearCache,
    },
    {
      id: '5',
      icon: 'document-text',
      title: 'Política de Privacidade',
      action: openPrivacyPolicy,
    },
    {
      id: '6',
      icon: 'log-out',
      title: 'Sair',
      action: handleLogout,
    },
  ]

  

  const renderSettingItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={[style.settingItem, { backgroundColor: colors.card }]}
      onPress={item.action}
    >
      <View style={style.settingLeft}>
        <Ionicons name={item.icon} size={scale(20)} color={colors.text} />
        <Text style={[style.settingText, { color: colors.text }]}>
          {item.title}
        </Text>
      </View>
      {item.rightComponent && item.rightComponent()}
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={style.container}>
      {/* Seção de Segurança */}
      <Text style={[style.sectionTitle, { color: colors.text }]}>Segurança</Text>
      {securitySettings.map(renderSettingItem)}

      {/* Seção de Aparência */}
      <Text style={[style.sectionTitle, { color: colors.text, marginTop: scale(20) }]}>
        Aparência
      </Text>
      {appearanceSettings.map(renderSettingItem)}

      {/* Seção de Notificações */}
      <Text style={[style.sectionTitle, { color: colors.text, marginTop: scale(20) }]}>
        Notificações
      </Text>
      {notificationSettings.map(renderSettingItem)}

      {/* Seção de Configurações */}
      <Text style={[style.sectionTitle, { color: colors.text, marginTop: scale(20) }]}>
        Configurações
      </Text>
      {settings.map(renderSettingItem)}
      

      {/* Modal Alterar Senha */}
      <Modal visible={changePassModal} animationType="slide" transparent>
        <View style={style.modalOverlay}>
          <View style={[style.modalContainer, { backgroundColor: colors.card }]}>
            <Text style={[style.modalTitle, { color: colors.text }]}>
              Alterar Senha
            </Text>

            <TextInput
              style={[style.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Senha atual"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
              value={currentPass}
              onChangeText={setCurrentPass}
            />

            <TextInput
              style={[style.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Nova senha"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
              value={newPass}
              onChangeText={setNewPass}
            />

            <TextInput
              style={[style.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Confirmar nova senha"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
              value={confirmPass}
              onChangeText={setConfirmPass}
            />

            <View style={style.modalButtons}>
              <TouchableOpacity
                style={[style.button, { backgroundColor: colors.border }]}
                onPress={() => setChangePassModal(false)}
              >
                <Text style={{ color: colors.text }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[style.button, { backgroundColor: colors.primary }]}
                onPress={handleChangePassword}
              >
                <Text style={{ color: '#fff' }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const style = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
  },
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
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
});

export default SettingsScreen;