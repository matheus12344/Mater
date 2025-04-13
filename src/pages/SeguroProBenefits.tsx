import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';


type RootStackParamList = {
  SeguroPro: undefined;
  SeguroProBenefits: undefined;
};

interface SeguroProBenefitsProps {
  onBack: () => void;
  onUpgrade: () => void;
}


const SeguroProBenefits: React.FC<SeguroProBenefitsProps> = ({ onBack, onUpgrade }) => {

  const beneficios = [
    {
      titulo: 'Proteção Básica',
      descricao: 'Cobertura essencial para seu veículo',
      icone: 'shield-outline' as const,
      disponivel: true,
    },
    {
      titulo: 'Assistência 12h',
      descricao: 'Suporte em horário comercial',
      icone: 'time-outline' as const,
      disponivel: true,
    },
    {
      titulo: 'Carro Reserva',
      descricao: 'Disponível por 3 dias ao ano',
      icone: 'car-outline' as const,
      disponivel: true,
    },
    {
      titulo: 'Cobertura Regional',
      descricao: 'Proteção em sua região',
      icone: 'map-outline' as const,
      disponivel: true,
    },
    {
      titulo: 'Proteção Total',
      descricao: 'Cobertura completa em qualquer situação',
      icone: 'shield-checkmark' as const,
      disponivel: false,
    },
    {
      titulo: 'Assistência 24h',
      descricao: 'Suporte disponível a qualquer momento',
      icone: 'time' as const,
      disponivel: false,
    },
    {
      titulo: 'Carro Reserva Ilimitado',
      descricao: 'Veículo reserva sem limite de dias',
      icone: 'car' as const,
      disponivel: false,
    },
    {
      titulo: 'Cobertura Nacional',
      descricao: 'Proteção em todo o território brasileiro',
      icone: 'map' as const,
      disponivel: false,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => onBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Benefícios</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerMainText}>
            Seus Benefícios Atuais
          </Text>
          <Text style={styles.headerSubText}>
            Compare com o plano SeguroPro
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.currentPlanCard}>
          <Text style={styles.currentPlanTitle}>
            Plano Atual
          </Text>
          <Text style={styles.currentPlanDescription}>
            Benefícios básicos incluídos
          </Text>
        </View>

        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>
            Benefícios Disponíveis
          </Text>
          
          {beneficios.map((beneficio, index) => (
            <View 
              key={index}
              style={[
                styles.benefitCard,
                { backgroundColor: beneficio.disponivel ? '#F3F4F6' : '#FEE2E2' }
              ]}
            >
              <View style={[
                styles.benefitIcon,
                { backgroundColor: beneficio.disponivel ? '#EEF2FF' : '#FEE2E2' }
              ]}>
                <Ionicons 
                  name={beneficio.icone} 
                  size={24} 
                  color={beneficio.disponivel ? '#4F46E5' : '#EF4444'} 
                />
              </View>
              <View style={styles.benefitText}>
                <Text style={[
                  styles.benefitTitle,
                  { color: beneficio.disponivel ? '#1F2937' : '#EF4444' }
                ]}>
                  {beneficio.titulo}
                </Text>
                <Text style={styles.benefitDescription}>
                  {beneficio.descricao}
                </Text>
              </View>
              {!beneficio.disponivel && (
                <Ionicons name="lock-closed" size={20} color="#EF4444" />
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.upgradeButton}
          onPress={() => onUpgrade()}
        >
          <Text style={styles.upgradeButtonText}>
            Upgrade para SeguroPro
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    height: 250,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 24,
    paddingTop: 48,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTextContainer: {
    marginTop: 32,
  },
  headerMainText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubText: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    fontSize: 16,
  },
  content: {
    padding: 24,
    marginTop: -32,
  },
  currentPlanCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  currentPlanTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  currentPlanDescription: {
    color: '#6B7280',
    marginTop: 8,
  },
  benefitsSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  benefitIcon: {
    padding: 12,
    borderRadius: 9999,
  },
  benefitText: {
    marginLeft: 16,
    flex: 1,
  },
  benefitTitle: {
    fontWeight: 'bold',
  },
  benefitDescription: {
    color: '#6B7280',
  },
  upgradeButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    marginTop: 32,
    marginBottom: 32,
  },
  upgradeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SeguroProBenefits; 