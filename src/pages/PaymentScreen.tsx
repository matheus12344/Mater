import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Animated,
  ScrollView,
  Alert,
  Platform,
  Dimensions
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from 'src/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';

type PaymentScreenProps = {
  route: RouteProp<RootStackParamList, 'Payment'>;
};

const { width } = Dimensions.get('window');

const PaymentScreen: React.FC<PaymentScreenProps> = ({ route}) => {
  const { colors } = useTheme();
  const { service, amount, serviceDetails } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const paymentMethods = [
    { id: 'credit', name: 'Cartão de Crédito', icon: 'card' },
    { id: 'pix', name: 'PIX', icon: 'qr-code' },
    { id: 'debit', name: 'Cartão de Débito', icon: 'card-outline' },
  ];

  React.useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Selecione um método', 'Escolha a forma de pagamento');
      return;
    }

    setIsProcessing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      // Simulação de API de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Sucesso
      console.log("Pagamento realizado com sucesso!")
    } catch (error) {
      Alert.alert('Erro', 'Pagamento não processado. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderDetailItem = (label: string, value: string) => (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );

  return (
    <ScrollView 
      contentContainerStyle={[styles.container, { backgroundColor: '#fff' }]}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View 
        style={[
          styles.card, 
          { 
            backgroundColor: '#fff',
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: '#000' }]}>Finalizar Pagamento</Text>
          <Ionicons name="lock-closed" size={24} color="#4CAF50" />
        </View>

        <View style={styles.divider} />

        {/* Resumo do Serviço */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Resumo do Serviço</Text>
          {renderDetailItem('Tipo de Serviço:', service)}
          {renderDetailItem('Valor Total:', `R$ ${amount.toFixed(2)}`)}
        </View>

        {/* Métodos de Pagamento */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Método de Pagamento</Text>
          
          {paymentMethods.map(method => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodButton,
                selectedMethod === method.id && { 
                  borderColor: colors.primary,
                  backgroundColor: `#000`
                }
              ]}
              onPress={() => setSelectedMethod(method.id)}
              disabled={isProcessing}
            >
              <Ionicons 
                name={method.icon as any} 
                size={24} 
                color={selectedMethod === method.id ? colors.primary : colors.text} 
              />
              <Text style={[
                styles.methodText,
                { 
                  color: selectedMethod === method.id ? colors.primary : colors.text,
                  marginLeft: 10
                }
              ]}>
                {method.name}
              </Text>
              {selectedMethod === method.id && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={24} 
                  color={colors.primary} 
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Detalhes Adicionais */}
        {serviceDetails && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Detalhes</Text>
            {Object.entries(serviceDetails).map(([key, value]) => (
              renderDetailItem(`${key}:`, String(value))
            ))}
          </View>
        )}

        {/* Botão de Pagamento */}
        <TouchableOpacity
          style={[
            styles.button,
            { 
              backgroundColor: isProcessing ? `${colors.primary}80` : '#000',
              shadowColor: colors.primary
            }
          ]}
          onPress={handlePayment}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <>
              <Text style={styles.buttonText}>Confirmar Pagamento</Text>
              <Text style={styles.buttonSubtext}>R$ {amount.toFixed(2)}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Segurança */}
        <View style={styles.securityRow}>
          <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
          <Text style={[styles.securityText, { color: colors.placeholder }]}>
            Pagamento 100% seguro • Dados criptografados
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginBottom: 12,
    position: 'relative',
  },
  methodText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  checkIcon: {
    position: 'absolute',
    right: 16,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  securityText: {
    fontSize: 12,
    marginLeft: 6,
  },
});

export default PaymentScreen;