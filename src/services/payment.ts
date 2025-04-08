import { Alert } from 'react-native';

// Dados de teste do Stripe
const TEST_STRIPE_KEY = 'pk_test_51Hx...'; // Substitua pela sua chave de teste do Stripe
const TEST_AMOUNT = 1000; // R$ 10,00 em centavos

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  supportsInstallments?: boolean;
  supportsBenefits?: boolean;
  supportsSharedPayment?: boolean;
}

interface InstallmentOption {
  installments: number;
  value: number;
  total: number;
  interestRate: number;
}

interface BenefitProgram {
  id: string;
  name: string;
  discount: number;
  icon: string;
}

interface SharedPaymentParticipant {
  id: string;
  name: string;
  email: string;
  amount: number;
  status: 'pending' | 'paid' | 'declined';
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  installmentDetails?: InstallmentOption;
  sharedPaymentLink?: string;
}

// Programas de benefícios disponíveis
const benefitPrograms: BenefitProgram[] = [
  { id: 'vale', name: 'Vale Transporte', discount: 0.1, icon: 'bus' },
  { id: 'vale-refeicao', name: 'Vale Refeição', discount: 0.05, icon: 'restaurant' },
  { id: 'vale-alimentacao', name: 'Vale Alimentação', discount: 0.15, icon: 'fast-food' },
  { id: 'plano-saude', name: 'Plano de Saúde', discount: 0.08, icon: 'medkit' },
];

export const paymentService = {
  // Simula processamento de cartão de crédito
  async processCreditCard(cardNumber: string, expiryDate: string, cvv: string, installments?: number): Promise<PaymentResult> {
    try {
      // Simula delay de processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Validação básica dos dados do cartão
      if (cardNumber.length !== 16 || cvv.length !== 3) {
        throw new Error('Dados do cartão inválidos');
      }

      // Simula sucesso do pagamento
      return {
        success: true,
        transactionId: `cc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        installmentDetails: installments ? {
          installments,
          value: TEST_AMOUNT / installments,
          total: TEST_AMOUNT,
          interestRate: 0
        } : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao processar pagamento'
      };
    }
  },

  // Simula processamento de PIX
  async processPix(): Promise<PaymentResult> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        transactionId: `pix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao processar PIX'
      };
    }
  },

  // Simula processamento de cartão de débito
  async processDebitCard(cardNumber: string, expiryDate: string, cvv: string): Promise<PaymentResult> {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (cardNumber.length !== 16 || cvv.length !== 3) {
        throw new Error('Dados do cartão inválidos');
      }

      return {
        success: true,
        transactionId: `dc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao processar pagamento'
      };
    }
  },

  // Calcula opções de parcelamento
  calculateInstallments(amount: number): InstallmentOption[] {
    const options: InstallmentOption[] = [];
    
    // Opção à vista
    options.push({
      installments: 1,
      value: amount,
      total: amount,
      interestRate: 0
    });
    
    // Opções parceladas (2x a 12x)
    for (let i = 2; i <= 12; i++) {
      // Taxa de juros aumenta com o número de parcelas
      const interestRate = 0.01 * (i - 1); // 1% por parcela
      const total = amount * (1 + interestRate);
      const value = total / i;
      
      options.push({
        installments: i,
        value,
        total,
        interestRate
      });
    }
    
    return options;
  },

  // Obtém programas de benefícios disponíveis
  getBenefitPrograms(): BenefitProgram[] {
    return benefitPrograms;
  },

  // Aplica desconto de benefício
  applyBenefitDiscount(amount: number, benefitId: string): number {
    const benefit = benefitPrograms.find(b => b.id === benefitId);
    if (!benefit) return amount;
    
    return amount * (1 - benefit.discount);
  },

  // Cria um pagamento compartilhado
  async createSharedPayment(amount: number, participants: SharedPaymentParticipant[]): Promise<PaymentResult> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Gera um link único para o pagamento compartilhado
      const sharedPaymentLink = `https://mater.app/pay/${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        transactionId: `sp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sharedPaymentLink
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar pagamento compartilhado'
      };
    }
  },

  // Método genérico para processar pagamento
  async processPayment(
    method: string,
    amount: number,
    paymentDetails?: any
  ): Promise<PaymentResult> {
    try {
      switch (method) {
        case 'credit':
          return await this.processCreditCard(
            paymentDetails?.cardNumber || '4111111111111111',
            paymentDetails?.expiryDate || '12/25',
            paymentDetails?.cvv || '123',
            paymentDetails?.installments
          );
        
        case 'pix':
          return await this.processPix();
        
        case 'debit':
          return await this.processDebitCard(
            paymentDetails?.cardNumber || '4111111111111111',
            paymentDetails?.expiryDate || '12/25',
            paymentDetails?.cvv || '123'
          );
        
        case 'shared':
          return await this.createSharedPayment(
            amount,
            paymentDetails?.participants || []
          );
        
        default:
          throw new Error('Método de pagamento não suportado');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao processar pagamento'
      };
    }
  }
};