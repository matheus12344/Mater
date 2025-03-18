import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Ajuste a importação do tipo ServiceItem conforme a sua estrutura.
// Se você já definiu ServiceItem em um "types.ts", importe de lá.
// Aqui vou colocar como exemplo direto:
export interface ServiceItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface ServiceDetailScreenProps {
  service: ServiceItem;              // Serviço selecionado
  onBack: () => void;                // Função para voltar ou fechar tela
  styles: any;                       // Objeto de estilos retornado por createStyles
  colors: any;                       // Objeto de cores do tema
  scale: (size: number) => number;   // Função de responsividade
}

const ServiceDetailScreen: React.FC<ServiceDetailScreenProps> = ({
  service,
  onBack,
  styles,
  colors,
  scale,
}) => {

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

        {/* Exemplo de outra seção: Benefícios */}
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

        {/* Botão de ação (Solicitar, Contratar, etc.) */}
        <TouchableOpacity 
          style={[
            styles.detailActionButton, 
            { backgroundColor: service.color + 'DD' }
          ]}
          onPress={() => {
            // Exemplo de ação: 
            // chamar API, iniciar solicitação, ou abrir outro modal
            console.log("Serviço solicitado:", service.title);
          }}
        >
          <Text style={[styles.detailActionButtonText, { color: '#fff' }]}>
            Solicitar
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ServiceDetailScreen;
