import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface AdminSettings {
  notifications: {
    newUsers: boolean;
    newServices: boolean;
    serviceUpdates: boolean;
    systemAlerts: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    ipRestriction: boolean;
  };
  appearance: {
    darkMode: boolean;
    compactView: boolean;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
  };
}

const AdminSettings = () => {
  const { theme, colors} = useTheme();
  const [settings, setSettings] = useState<AdminSettings>({
    notifications: {
      newUsers: true,
      newServices: true,
      serviceUpdates: true,
      systemAlerts: true,
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 30,
      ipRestriction: false,
    },
    appearance: {
      darkMode: theme === 'dark',
      compactView: false,
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
    },
  });

  const handleSettingChange = (category: keyof AdminSettings, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // Aqui você implementará a lógica para salvar as configurações no backend
      Alert.alert('Sucesso', 'Configurações salvas com sucesso');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      Alert.alert('Erro', 'Não foi possível salvar as configurações');
    }
  };

  const renderSettingSection = (
    title: string,
    category: keyof AdminSettings,
    settings: Record<string, any>
  ) => (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {Object.entries(settings).map(([key, value]) => (
        <View key={key} style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            {translateSettingLabel(key)}
          </Text>
          {typeof value === 'boolean' ? (
            <Switch
              value={value}
              onValueChange={(newValue) => handleSettingChange(category, key, newValue)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={'white'}
            />
          ) : typeof value === 'number' ? (
            <TextInput
              style={[styles.numberInput, { color: colors.text, borderColor: colors.border }]}
              value={value.toString()}
              onChangeText={(text) => handleSettingChange(category, key, parseInt(text) || 0)}
              keyboardType="numeric"
            />
          ) : typeof value === 'string' && ['daily', 'weekly', 'monthly'].includes(value) ? (
            <View style={styles.frequencySelector}>
              {['daily', 'weekly', 'monthly'].map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.frequencyButton,
                    {
                      backgroundColor: value === freq ? colors.primary : colors.card,
                    },
                  ]}
                  onPress={() => handleSettingChange(category, key, freq)}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      {
                        color: value === freq ? 'white' : colors.text,
                      },
                    ]}
                  >
                    {translateFrequency(freq)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );

  const translateSettingLabel = (key: string) => {
    const translations: Record<string, string> = {
      newUsers: 'Novos Usuários',
      newServices: 'Novos Serviços',
      serviceUpdates: 'Atualizações de Serviço',
      systemAlerts: 'Alertas do Sistema',
      twoFactorAuth: 'Autenticação em Dois Fatores',
      sessionTimeout: 'Tempo de Sessão (minutos)',
      ipRestriction: 'Restrição de IP',
      darkMode: 'Modo Escuro',
      compactView: 'Visualização Compacta',
      autoBackup: 'Backup Automático',
      backupFrequency: 'Frequência do Backup',
    };
    return translations[key] || key;
  };

  const translateFrequency = (freq: string) => {
    const translations: Record<string, string> = {
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal',
    };
    return translations[freq] || freq;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Configurações</Text>
      </View>

      {renderSettingSection('Notificações', 'notifications', settings.notifications)}
      {renderSettingSection('Segurança', 'security', settings.security)}
      {renderSettingSection('Aparência', 'appearance', settings.appearance)}
      {renderSettingSection('Backup', 'backup', settings.backup)}

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={handleSaveSettings}
      >
        <Text style={styles.saveButtonText}>Salvar Configurações</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  settingLabel: {
    fontSize: 16,
  },
  numberInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  frequencySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  saveButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminSettings; 