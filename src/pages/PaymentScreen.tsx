import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from 'src/types';

type PaymentScreenProps = {
  route: RouteProp<RootStackParamList, 'Payment'>;
};

const PaymentScreen: React.FC<PaymentScreenProps> = ({ route }) => {
  const { service, amount, serviceDetails } = route.params;
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      alert('Pagamento realizado com sucesso!');
    }, 2000); // Simula um tempo de processamento
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Pagamento</Text>
        <Text style={styles.label}>Serviço:</Text>
        <Text style={styles.value}>{service}</Text>
        <Text style={styles.label}>Valor:</Text>
        <Text style={styles.value}>R$ {amount}</Text>
        <Text style={styles.label}>Detalhes:</Text>
        <Text style={styles.value}>{JSON.stringify(serviceDetails, null, 2)}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Confirmar Pagamento</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#777',
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;