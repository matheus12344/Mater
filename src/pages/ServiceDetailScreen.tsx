import React, { useState } from 'react';
import { 
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Se você já definiu ServiceItem em outro lugar, importe de lá.
// Aqui está apenas como exemplo:
export interface ServiceItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface ServiceDetailScreenProps {
  service: ServiceItem;              
  onBack: () => void;                
  styles: any;                       
  colors: any;                       
  scale: (size: number) => number;   
}

const ServiceDetailScreen: React.FC<ServiceDetailScreenProps> = ({
  service,
  onBack,
  styles,
  colors,
  scale,
}) => {
  // Estado para controlar a visibilidade do modal
  const [requestModalVisible, setRequestModalVisible] = useState(false);

  // Quando o usuário toca no botão "Solicitar"
  const handleSolicitar = () => {
    setRequestModalVisible(true);
  };

  // Confirma a solicitação
  const handleConfirmSolicitar = () => {
    setRequestModalVisible(false);
    // Aqui você pode chamar uma API, navegar para outra tela, etc.
    console.log("Serviço solicitado:", service.title);
    Alert.alert('Solicitação enviada', 'Seu pedido foi enviado com sucesso!');
  };

  // Cancela a solicitação
  const handleCancelSolicitar = () => {
    setRequestModalVisible(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Cabeçalho com botão de voltar e título */}
      <View style={styles.detailHeaderContainer}>
        <TouchableOpacity style={styles.detailBackButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={scale(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.detailHeaderTitle, { color: colors.text }]}>
          Detalhes do Serviço
        </Text>
      </View>

      {/* Área de destaque do serviço (Hero) */}
      <View style={[styles.detailHeroContainer, { backgroundColor: service.color }]}>
        <Ionicons 
          name={service.icon as any} 
          size={scale(60)} 
          color="#fff" 
          style={styles.detailHeroIcon} 
        />
        <Text style={[styles.detailHeroTitle, { color: '#fff' }]}>
          {service.title}
        </Text>
      </View>

      {/* Conteúdo principal */}
      <View style={styles.detailContentContainer}>
        {/* Descrição */}
        <Text style={[styles.detailSectionTitle, { color: colors.text }]}>
          Descrição
        </Text>
        <Text style={[styles.detailDescription, { color: colors.placeholder }]}>
          {service.description}
        </Text>

        {/* Benefícios (exemplo) */}
        <Text 
          style={[
            styles.detailSectionTitle, 
            { color: colors.text, marginTop: scale(20) }
          ]}
        >
          Benefícios
        </Text>
        <Text style={[styles.detailDescription, { color: colors.placeholder }]}>
          • Assistência 24h{"\n"}
          • Profissionais qualificados{"\n"}
          • Cobertura nacional
        </Text>

        {/* Botão de ação (Solicitar) */}
        <TouchableOpacity 
          style={[
            styles.detailActionButton, 
            { backgroundColor: service.color + 'DD' }
          ]}
          onPress={handleSolicitar}
        >
          <Text style={[styles.detailActionButtonText, { color: '#fff' }]}>
            Solicitar
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL de Confirmação de Solicitação */}
      <Modal
        visible={requestModalVisible}
        animationType="slide"
        transparent
      >
        <View style={localStyles.modalOverlay}>
          <View style={[localStyles.modalContainer, { backgroundColor: colors.card }]}>
            <Text style={[localStyles.modalTitle, { color: colors.text }]}>
              Confirmar Solicitação
            </Text>
            <Text style={{ color: colors.placeholder, marginBottom: scale(12) }}>
              Você está prestes a solicitar o serviço {service.title}.
            </Text>

            <View style={localStyles.modalButtonsContainer}>
              <TouchableOpacity
                style={[localStyles.modalButton, { backgroundColor: colors.border }]}
                onPress={handleCancelSolicitar}
              >
                <Text style={{ color: colors.text }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[localStyles.modalButton, { backgroundColor: service.color }]}
                onPress={handleConfirmSolicitar}
              >
                <Text style={{ color: '#fff' }}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

// Estilos locais para o modal
const localStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});

export default ServiceDetailScreen;
