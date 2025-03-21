import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, StyleProp, ViewStyle, TextStyle } from 'react-native';

const PrivacyPolicyScreen: React.FC = () => {
  const handleContact = () => Alert.alert('Contato', 'Para dúvidas, envie um e-mail para: suporte@materapp.com');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Política de Privacidade</Text>
      <Text style={styles.sectionTitle}>1. Introdução</Text>
      <Text style={styles.text}>
        No Mater, respeitamos sua privacidade e estamos comprometidos em proteger suas informações pessoais. Esta
        política explica como coletamos, usamos e protegemos seus dados.
      </Text>
      <Text style={styles.sectionTitle}>2. Dados Coletados</Text>
      <Text style={styles.text}>
        Coletamos informações para fornecer e melhorar nossos serviços. Os tipos de dados incluem:
      </Text>
      <Text style={styles.listItem}>- Informações pessoais: Nome, e-mail, telefone;</Text>
      <Text style={styles.listItem}>- Localização: Para rastrear e conectar você ao prestador;</Text>
      <Text style={styles.listItem}>- Dados de uso: Histórico de solicitações e preferências.</Text>
      <Text style={styles.sectionTitle}>3. Uso das Informações</Text>
      <Text style={styles.text}>
        Usamos suas informações para:
      </Text>
      <Text style={styles.listItem}>- Oferecer nossos serviços com precisão e rapidez;</Text>
      <Text style={styles.listItem}>- Personalizar sua experiência no aplicativo;</Text>
      <Text style={styles.listItem}>- Enviar notificações sobre atualizações ou promoções.</Text>
      <Text style={styles.sectionTitle}>4. Compartilhamento de Dados</Text>
      <Text style={styles.text}>
        Compartilhamos suas informações apenas com prestadores de serviço para realizar seu atendimento e em casos
        exigidos por lei.
      </Text>
      <Text style={styles.sectionTitle}>5. Seus Direitos</Text>
      <Text style={styles.text}>
        Você tem o direito de:
      </Text>
      <Text style={styles.listItem}>- Acessar e revisar seus dados pessoais;</Text>
      <Text style={styles.listItem}>- Solicitar a exclusão de suas informações;</Text>
      <Text style={styles.listItem}>- Retirar o consentimento a qualquer momento.</Text>
      <Text style={styles.sectionTitle}>6. Fale Conosco</Text>
      <Text style={styles.text}>
        Para dúvidas ou solicitações, entre em contato conosco.
      </Text>
      <TouchableOpacity onPress={handleContact} style={{ marginTop: -20, marginBottom: 40, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 5 }}>
        <Text style={styles.contactLink}>Enviar e-mail para suporte@materapp.com</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#444',
  },
  text: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
    lineHeight: 24,
  },
  listItem: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10,
    marginTop: 5,
  },
  contactLink: {
    marginTop: 15,
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});

export default PrivacyPolicyScreen;
