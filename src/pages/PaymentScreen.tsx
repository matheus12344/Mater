import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from 'src/types';

type PaymentScreenProps = {
  route: RouteProp<RootStackParamList, 'Payment'>;
};

const PaymentScreen: React.FC<PaymentScreenProps> = ({ route }) => {
  const { service, amount, serviceDetails } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pagamento</Text>
      <Text>Serviço: {service}</Text>
      <Text>Valor: {amount}</Text>
      {/* Adicione aqui os componentes de pagamento */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  }
});

export default PaymentScreen;