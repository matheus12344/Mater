import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';


type RootStackParamList = {
  SeguroPro: undefined;
  SeguroProBenefits: undefined;
};

interface SeguroProProps {
  onBack: () => void;
}


const SeguroPro: React.FC<SeguroProProps> = ({ onBack }) => {

  const beneficios = [
    {
      titulo: 'Cobertura Total',
      descricao: 'Proteção completa para seu veículo em qualquer situação',
      icone: 'shield-checkmark' as const,
    },
    {
      titulo: 'Assistência 24h',
      descricao: 'Suporte disponível a qualquer momento',
      icone: 'time' as const,
    },
    {
      titulo: 'Carro Reserva',
      descricao: 'Veículo reserva em caso de sinistro',
      icone: 'car' as const,
    },
    {
      titulo: 'Cobertura Nacional',
      descricao: 'Proteção em todo o território brasileiro',
      icone: 'map' as const,
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
          <Text style={styles.headerTitle}>SeguroPro</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerMainText}>
            Proteção Premium para seu Veículo
          </Text>
          <Text style={styles.headerSubText}>
            Aproveite todos os benefícios exclusivos
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.priceCard}>
          <Text style={styles.price}>
            R$ 49,90
            <Text style={styles.pricePeriod}>/mês</Text>
          </Text>
          <Text style={styles.priceDescription}>
            Cancele quando quiser, sem multa
          </Text>
          
          <TouchableOpacity 
            style={styles.signButton}
            onPress={() => {/* Implementar lógica de assinatura */}}
          >
            <Text style={styles.signButtonText}>
              Assinar Agora
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>
            Benefícios Inclusos
          </Text>
          
          {beneficios.map((beneficio, index) => (
            <View 
              key={index}
              style={styles.benefitCard}
            >
              <View style={styles.benefitIcon}>
                <Ionicons name={beneficio.icone} size={24} color="#4F46E5" />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>{beneficio.titulo}</Text>
                <Text style={styles.benefitDescription}>{beneficio.descricao}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>
            Perguntas Frequentes
          </Text>
          
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>
              Como funciona o cancelamento?
            </Text>
            <Text style={styles.faqAnswer}>
              Você pode cancelar a qualquer momento, sem multa ou carência.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>
              Quando a cobertura começa?
            </Text>
            <Text style={styles.faqAnswer}>
              A cobertura começa imediatamente após a confirmação do pagamento.
            </Text>
          </View>
        </View>
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
  priceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  pricePeriod: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#6B7280',
  },
  priceDescription: {
    color: '#6B7280',
    marginTop: 8,
  },
  signButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  signButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
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
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  benefitIcon: {
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 9999,
  },
  benefitText: {
    marginLeft: 16,
    flex: 1,
  },
  benefitTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  benefitDescription: {
    color: '#6B7280',
  },
  faqSection: {
    marginTop: 32,
    marginBottom: 32,
  },
  faqCard: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  faqQuestion: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  faqAnswer: {
    color: '#6B7280',
    marginTop: 4,
  },
});

export default SeguroPro; 