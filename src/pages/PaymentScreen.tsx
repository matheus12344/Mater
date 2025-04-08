import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  Animated,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
  TextInput,
  Modal,
  Linking
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from 'src/types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';
import { paymentService } from '../services/payment';
import { PaymentScreenStyles as styles } from '../styles/PaymentScreenStyles';

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
  const [selectedInstallments, setSelectedInstallments] = useState<number>(1);
  const [selectedBenefit, setSelectedBenefit] = useState<string | null>(null);
  const [showInstallmentsModal, setShowInstallmentsModal] = useState(false);
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);
  const [showSharedPaymentModal, setShowSharedPaymentModal] = useState(false);
  const [installmentOptions, setInstallmentOptions] = useState<any[]>([]);
  const [benefitPrograms, setBenefitPrograms] = useState<any[]>([]);
  const [sharedParticipants, setSharedParticipants] = useState<any[]>([]);
  const [newParticipant, setNewParticipant] = useState({ name: '', email: '', amount: 0 });
  const [discountedAmount, setDiscountedAmount] = useState(amount);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const paymentMethods = [
    { id: 'credit', name: 'Cartão de Crédito', icon: 'card', supportsInstallments: true, supportsBenefits: true },
    { id: 'pix', name: 'PIX', icon: 'qr-code', supportsInstallments: false, supportsBenefits: true },
    { id: 'debit', name: 'Cartão de Débito', icon: 'card-outline', supportsInstallments: false, supportsBenefits: true },
    { id: 'shared', name: 'Pagamento Compartilhado', icon: 'people', supportsInstallments: false, supportsBenefits: false, supportsSharedPayment: true },
  ];

  useEffect(() => {
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

    // Carregar opções de parcelamento
    setInstallmentOptions(paymentService.calculateInstallments(amount));
    
    // Carregar programas de benefícios
    setBenefitPrograms(paymentService.getBenefitPrograms());
  }, []);

  // Atualizar valor com desconto quando um benefício é selecionado
  useEffect(() => {
    if (selectedBenefit) {
      const newAmount = paymentService.applyBenefitDiscount(amount, selectedBenefit);
      setDiscountedAmount(newAmount);
      // Recalcular parcelas com o novo valor
      setInstallmentOptions(paymentService.calculateInstallments(newAmount));
    } else {
      setDiscountedAmount(amount);
      setInstallmentOptions(paymentService.calculateInstallments(amount));
    }
  }, [selectedBenefit, amount]);

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Selecione um método', 'Escolha a forma de pagamento');
      return;
    }

    setIsProcessing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const paymentDetails: any = {
        cardNumber: '4111111111111111', // Cartão de teste
        expiryDate: '12/25',
        cvv: '123'
      };

      // Adicionar detalhes específicos com base no método selecionado
      if (selectedMethod === 'credit' && selectedInstallments > 1) {
        paymentDetails.installments = selectedInstallments;
      }

      if (selectedBenefit) {
        paymentDetails.benefitId = selectedBenefit;
      }

      if (selectedMethod === 'shared' && sharedParticipants.length > 0) {
        paymentDetails.participants = sharedParticipants;
      }

      const result = await paymentService.processPayment(
        selectedMethod,
        discountedAmount * 100, // Converte para centavos
        paymentDetails
      );

      if (result.success) {
        let message = `Pagamento processado com sucesso!\nID da transação: ${result.transactionId}`;
        
        if (result.installmentDetails) {
          message += `\n\nParcelas: ${result.installmentDetails.installments}x de R$ ${(result.installmentDetails.value / 100).toFixed(2)}`;
        }
        
        if (result.sharedPaymentLink) {
          message += `\n\nLink para pagamento compartilhado: ${result.sharedPaymentLink}`;
        }
        
        Alert.alert(
          'Sucesso!',
          message,
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
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  const renderInstallmentsModal = () => (
    <Modal
      visible={showInstallmentsModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowInstallmentsModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Parcelas</Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowInstallmentsModal(false)}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScrollView}>
            {installmentOptions.map((option) => (
              <TouchableOpacity
                key={option.installments}
                style={[
                  styles.installmentOption,
                  selectedInstallments === option.installments && styles.installmentOptionSelected
                ]}
                onPress={() => {
                  setSelectedInstallments(option.installments);
                  setShowInstallmentsModal(false);
                }}
              >
                <View style={styles.installmentHeader}>
                  <Text style={styles.installmentText}>
                    {option.installments === 1 ? 'À vista' : `${option.installments}x`}
                  </Text>
                  <Text style={styles.installmentValue}>
                    R$ {(option.value / 100).toFixed(2)}
                  </Text>
                </View>
                
                {option.installments > 1 && (
                  <View style={styles.installmentDetails}>
                    <Text style={styles.installmentDetailText}>
                      Total: R$ {(option.total / 100).toFixed(2)}
                    </Text>
                    <Text style={styles.installmentDetailText}>
                      Juros: {(option.interestRate * 100).toFixed(1)}%
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderBenefitsModal = () => (
    <Modal
      visible={showBenefitsModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowBenefitsModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Programas de Benefícios</Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowBenefitsModal(false)}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScrollView}>
            {benefitPrograms.map((benefit) => (
              <TouchableOpacity
                key={benefit.id}
                style={[
                  styles.benefitOption,
                  selectedBenefit === benefit.id && styles.benefitOptionSelected
                ]}
                onPress={() => {
                  setSelectedBenefit(selectedBenefit === benefit.id ? null : benefit.id);
                  setShowBenefitsModal(false);
                }}
              >
                <Ionicons 
                  name={benefit.icon as any} 
                  size={24} 
                  color={selectedBenefit === benefit.id ? '#000' : '#6B7280'} 
                  style={styles.benefitIcon}
                />
                <View style={styles.benefitInfo}>
                  <Text style={styles.benefitName}>
                    {benefit.name}
                  </Text>
                  <Text style={styles.benefitDiscount}>
                    Desconto: {(benefit.discount * 100).toFixed(0)}%
                  </Text>
                </View>
                {selectedBenefit === benefit.id && (
                  <Ionicons 
                    name="checkmark-circle" 
                    size={24} 
                    color="#000" 
                    style={styles.benefitCheck}
                  />
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.noBenefitOption}
              onPress={() => {
                setSelectedBenefit(null);
                setShowBenefitsModal(false);
              }}
            >
              <Text style={styles.noBenefitText}>
                Sem benefício
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderSharedPaymentModal = () => (
    <Modal
      visible={showSharedPaymentModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowSharedPaymentModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pagamento Compartilhado</Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowSharedPaymentModal(false)}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScrollView}>
            <View style={styles.sharedPaymentForm}>
              <Text style={styles.sharedPaymentFormTitle}>Adicionar Participante</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome"
                value={newParticipant.name}
                onChangeText={(text) => setNewParticipant({...newParticipant, name: text})}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={newParticipant.email}
                onChangeText={(text) => setNewParticipant({...newParticipant, email: text})}
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Valor (R$)"
                value={newParticipant.amount.toString()}
                onChangeText={(text) => setNewParticipant({...newParticipant, amount: parseFloat(text) || 0})}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  if (newParticipant.name && newParticipant.email && newParticipant.amount > 0) {
                    setSharedParticipants([
                      ...sharedParticipants,
                      {
                        id: Date.now().toString(),
                        name: newParticipant.name,
                        email: newParticipant.email,
                        amount: newParticipant.amount,
                        status: 'pending'
                      }
                    ]);
                    setNewParticipant({ name: '', email: '', amount: 0 });
                  }
                }}
              >
                <Text style={styles.addButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.participantsTitle}>Participantes</Text>
            
            {sharedParticipants.length === 0 ? (
              <Text style={styles.noParticipantsText}>
                Nenhum participante adicionado
              </Text>
            ) : (
              sharedParticipants.map((participant) => (
                <View key={participant.id} style={styles.participantItem}>
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>{participant.name}</Text>
                    <Text style={styles.participantEmail}>{participant.email}</Text>
                  </View>
                  <View>
                    <Text style={styles.participantAmount}>R$ {participant.amount.toFixed(2)}</Text>
                    <Text style={[
                      styles.participantStatus,
                      participant.status === 'paid' ? styles.statusPaid : 
                      participant.status === 'declined' ? styles.statusDeclined : styles.statusPending
                    ]}>
                      {participant.status === 'paid' ? 'Pago' : 
                       participant.status === 'declined' ? 'Recusado' : 'Pendente'}
                    </Text>
                  </View>
                </View>
              ))
            )}
            
            <TouchableOpacity
              style={styles.confirmModalButton}
              onPress={() => setShowSharedPaymentModal(false)}
            >
              <Text style={styles.confirmModalButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView 
      style={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View 
        style={[
          styles.card,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Finalizar Pagamento</Text>
          <Ionicons name="lock-closed" size={24} color="#4CAF50" />
        </View>

        <View style={styles.divider} />

        {/* Resumo do Serviço */}
        <View style={{ marginBottom: 24 }}>
          <Text style={styles.sectionTitle}>Resumo do Serviço</Text>
          {renderDetailItem('Tipo de Serviço:', service)}
          {renderDetailItem('Valor Total:', `R$ ${amount.toFixed(2)}`)}
          
          {selectedBenefit && (
            <>
              {renderDetailItem('Desconto:', `R$ ${(amount - discountedAmount).toFixed(2)}`)}
              {renderDetailItem('Valor Final:', `R$ ${discountedAmount.toFixed(2)}`)}
            </>
          )}
          
          {selectedMethod === 'credit' && selectedInstallments > 1 && (
            renderDetailItem('Parcelas:', `${selectedInstallments}x de R$ ${(discountedAmount / selectedInstallments).toFixed(2)}`)
          )}
        </View>

        {/* Métodos de Pagamento */}
        <View style={{ marginBottom: 24 }}>
          <Text style={styles.sectionTitle}>Método de Pagamento</Text>
          
          {paymentMethods.map(method => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodItem,
                selectedMethod === method.id && styles.paymentMethodItemSelected
              ]}
              onPress={() => setSelectedMethod(method.id)}
              disabled={isProcessing}
            >
              <Ionicons 
                name={method.icon as any} 
                size={24} 
                color={selectedMethod === method.id ? '#000' : '#6B7280'} 
                style={styles.paymentMethodIcon}
              />
              <Text 
                style={styles.paymentMethodText}
              >
                {method.name}
              </Text>
              {selectedMethod === method.id && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={24} 
                  color="#000" 
                  style={styles.paymentMethodCheck}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Opções de Pagamento Flexível */}
        {selectedMethod && (
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>Opções de Pagamento</Text>
            
            {/* Parcelamento */}
            {paymentMethods.find(m => m.id === selectedMethod)?.supportsInstallments && (
              <TouchableOpacity
                style={styles.paymentOptionItem}
                onPress={() => setShowInstallmentsModal(true)}
              >
                <Ionicons name="calendar" size={24} color="#6B7280" />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.paymentOptionText}>
                    Parcelamento
                  </Text>
                  <Text style={styles.paymentOptionSubtext}>
                    {selectedInstallments === 1 
                      ? 'À vista' 
                      : `${selectedInstallments}x de R$ ${(discountedAmount / selectedInstallments).toFixed(2)}`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" style={styles.paymentOptionArrow} />
              </TouchableOpacity>
            )}
            
            {/* Programas de Benefícios */}
            {paymentMethods.find(m => m.id === selectedMethod)?.supportsBenefits && (
              <TouchableOpacity
                style={styles.paymentOptionItem}
                onPress={() => setShowBenefitsModal(true)}
              >
                <Ionicons name="gift" size={24} color="#6B7280" />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.paymentOptionText}>
                    Programas de Benefícios
                  </Text>
                  <Text style={styles.paymentOptionSubtext}>
                    {selectedBenefit 
                      ? benefitPrograms.find(b => b.id === selectedBenefit)?.name 
                      : 'Selecione um programa de benefícios'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" style={styles.paymentOptionArrow} />
              </TouchableOpacity>
            )}
            
            {/* Pagamento Compartilhado */}
            {paymentMethods.find(m => m.id === selectedMethod)?.supportsSharedPayment && (
              <TouchableOpacity
                style={styles.paymentOptionItem}
                onPress={() => setShowSharedPaymentModal(true)}
              >
                <Ionicons name="people" size={24} color="#6B7280" />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.paymentOptionText}>
                    Pagamento Compartilhado
                  </Text>
                  <Text style={styles.paymentOptionSubtext}>
                    {sharedParticipants.length > 0 
                      ? `${sharedParticipants.length} participante(s)` 
                      : 'Adicione participantes'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" style={styles.paymentOptionArrow} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Detalhes Adicionais */}
        {serviceDetails && (
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>Detalhes</Text>
            {Object.entries(serviceDetails).map(([key, value]) => (
              renderDetailItem(`${key}:`, String(value))
            ))}
          </View>
        )}

        {/* Botão de Pagamento */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            isProcessing && styles.confirmButtonDisabled
          ]}
          onPress={handlePayment}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Text style={styles.confirmButtonText}>
                Confirmar Pagamento
              </Text>
              <Text style={styles.confirmButtonSubtext}>
                R$ {discountedAmount.toFixed(2)}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Segurança */}
        <View style={styles.securityInfo}>
          <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
          <Text style={styles.securityText}>
            Pagamento 100% seguro • Dados criptografados
          </Text>
        </View>
      </Animated.View>
      
      {/* Modais */}
      {renderInstallmentsModal()}
      {renderBenefitsModal()}
      {renderSharedPaymentModal()}
    </ScrollView>
  );
};

export default PaymentScreen;