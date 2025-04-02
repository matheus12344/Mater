import { Alert } from 'react-native';

// Dados de teste do Stripe
const TEST_STRIPE_KEY = 'pk_test_51Hx...'; // Substitua pela sua chave de teste do Stripe
const TEST_AMOUNT = 1000; // R$ 10,00 em centavos

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export const paymentService = {
  // Simula processamento de cartão de crédito
  async processCreditCard(cardNumber: string, expiryDate: string, cvv: string): Promise<PaymentResult> {
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
        transactionId: `cc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
            paymentDetails?.cvv || '123'
          );
        
        case 'pix':
          return await this.processPix();
        
        case 'debit':
          return await this.processDebitCard(
            paymentDetails?.cardNumber || '4111111111111111',
            paymentDetails?.expiryDate || '12/25',
            paymentDetails?.cvv || '123'
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