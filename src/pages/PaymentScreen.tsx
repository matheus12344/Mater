import React, { useState } from 'react';
import { 
  View, 
  Text, 
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
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';
import { tailwind } from '../styles/tailwind';
import { paymentService } from '../services/payment';

type PaymentScreenProps = {
  route: RouteProp<RootStackParamList, 'Payment'>;
  onBack: () => void;
};

const { width } = Dimensions.get('window');

const PaymentScreen: React.FC<PaymentScreenProps> = ({ route, onBack }) => {
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
      const result = await paymentService.processPayment(
        selectedMethod,
        amount * 100, // Converte para centavos
        {
          cardNumber: '4111111111111111', // Cartão de teste
          expiryDate: '12/25',
          cvv: '123'
        }
      );

      if (result.success) {
        Alert.alert(
          'Sucesso!',
          `Pagamento processado com sucesso!\nID da transação: ${result.transactionId}`,
          [{ text: 'OK', onPress: onBack }]
        );
      } else {
        throw new Error(result.error || 'Erro ao processar pagamento');
      }
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Pagamento não processado. Tente novamente.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const renderDetailItem = (label: string, value: string) => (
    <View style={tailwind('flex-row justify-between items-center mb-2')}>
      <Text style={tailwind('text-sm font-medium opacity-80')}>{label}</Text>
      <Text style={tailwind('text-sm font-semibold')}>{value}</Text>
    </View>
  );

  return (
    <ScrollView 
      style={tailwind('flex-1 bg-white px-5 pt-10')}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View 
        style={[
          tailwind('w-full max-w-[500px] mx-auto rounded-2xl p-6 shadow-lg mb-5'),
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={tailwind('flex-row justify-between items-center mb-4')}>
          <Text style={tailwind('text-2xl font-bold')}>Finalizar Pagamento</Text>
          <Ionicons name="lock-closed" size={24} color="#4CAF50" />
        </View>

        <View style={tailwind('h-[1px] bg-gray-200 my-2')} />

        {/* Resumo do Serviço */}
        <View style={tailwind('mb-6')}>
          <Text style={tailwind('text-lg font-semibold text-primary mb-3')}>Resumo do Serviço</Text>
          {renderDetailItem('Tipo de Serviço:', service)}
          {renderDetailItem('Valor Total:', `R$ ${amount.toFixed(2)}`)}
        </View>

        {/* Métodos de Pagamento */}
        <View style={tailwind('mb-6')}>
          <Text style={tailwind('text-lg font-semibold text-primary mb-3')}>Método de Pagamento</Text>
          
          {paymentMethods.map(method => (
            <TouchableOpacity
              key={method.id}
              style={tailwind(`flex-row items-center p-4 rounded-lg border mb-3 relative ${
                selectedMethod === method.id 
                  ? 'border-primary bg-black' 
                  : 'border-gray-200'
              }`)}
              onPress={() => setSelectedMethod(method.id)}
              disabled={isProcessing}
            >
              <Ionicons 
                name={method.icon as any} 
                size={24} 
                color={selectedMethod === method.id ? colors.primary : colors.text} 
              />
              <Text 
                style={tailwind(`ml-3 flex-1 text-base font-medium ${
                  selectedMethod === method.id ? 'text-primary' : 'text-gray-900'
                }`)}
              >
                {method.name}
              </Text>
              {selectedMethod === method.id && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={24} 
                  color={colors.primary} 
                  style={tailwind('absolute right-4')}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Detalhes Adicionais */}
        {serviceDetails && (
          <View style={tailwind('mb-6')}>
            <Text style={tailwind('text-lg font-semibold text-primary mb-3')}>Detalhes</Text>
            {Object.entries(serviceDetails).map(([key, value]) => (
              renderDetailItem(`${key}:`, String(value))
            ))}
          </View>
        )}

        {/* Botão de Pagamento */}
        <TouchableOpacity
          style={tailwind(`py-4 rounded-xl items-center justify-center shadow-lg mt-2 ${
            isProcessing ? 'bg-primary/50' : 'bg-black'
          }`)}
          onPress={handlePayment}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <>
              <Text style={tailwind('text-white text-lg font-semibold')}>
                Confirmar Pagamento
              </Text>
              <Text style={tailwind('text-white/80 text-sm mt-1')}>
                R$ {amount.toFixed(2)}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Segurança */}
        <View style={tailwind('flex-row items-center justify-center mt-6')}>
          <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
          <Text style={tailwind('text-xs text-gray-500 ml-1.5')}>
            Pagamento 100% seguro • Dados criptografados
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

export default PaymentScreen;