import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ActivityItem } from '../types';

interface ActivityDetailScreenProps {
  activity: ActivityItem;
  onBack: () => void;            // Função para voltar (ou fechar detalhes)
  styles: any;                   // Seus estilos globais (createStyles)
  colors: any;                   // Paleta de cores do tema
  scale: (size: number) => number; // Função de responsividade (opcional)
}

const ActivityDetailScreen: React.FC<ActivityDetailScreenProps> = ({
  activity,
  onBack,
  styles,
  colors,
  scale,
}) => {
  // Função para formatar a data
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).replace(/\./g, '');
  };

  // Traduz status para PT-BR
  const translateStatus = (status: string) => {
    const translations: Record<string, string> = {
      completed: 'Concluído',
      pending: 'Pendente',
      cancelled: 'Cancelado',
    };
    return translations[status] || status;
  };

  // Cores para o status
  const getStatusColor = (status: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      completed: { bg: '#E3FCEF', text: '#006644' },
      pending: { bg: '#FFF6E6', text: '#FF8B00' },
      cancelled: { bg: '#FFEBE6', text: '#BF2600' },
    };
    return map[status] || { bg: '#EAECF0', text: '#344054' };
  };

  const statusColors = getStatusColor(activity.status);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cabeçalho */}
      <View style={localStyles.header}>
        <TouchableOpacity onPress={onBack} style={localStyles.backButton}>
          <Ionicons name="chevron-back" size={scale(24)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[localStyles.headerTitle, { color: colors.text }]}>
          Detalhes da Atividade
        </Text>
      </View>

      {/* Hero / Destaque */}
      <View style={localStyles.heroContainer}>
        <View style={[localStyles.iconContainer, { backgroundColor: colors.card }]}>
          <Ionicons name={activity.icon as any} size={scale(48)} color={colors.text} />
        </View>
        <Text style={[localStyles.title, { color: colors.text }]}>
          {activity.title}
        </Text>
        <Text style={[localStyles.date, { color: colors.placeholder }]}>
          {formatDate(activity.date)}
        </Text>
      </View>

      {/* Conteúdo Principal */}
      <View style={localStyles.contentContainer}>
        {/* Status */}
        <View style={[localStyles.statusBadge, { backgroundColor: statusColors.bg }]}>
          <Text style={[localStyles.statusText, { color: statusColors.text }]}>
            {translateStatus(activity.status)}
          </Text>
        </View>

        {/* Descrição */}
        <Text style={[localStyles.sectionTitle, { color: colors.text }]}>
          Descrição
        </Text>
        <Text style={[localStyles.description, { color: colors.placeholder }]}>
          {activity.description}
        </Text>

        {/* Valor (se existir) */}
        {activity.price && (
          <View style={localStyles.priceContainer}>
            <Text style={[localStyles.priceLabel, { color: colors.text }]}>
              Valor:
            </Text>
            <Text style={[localStyles.priceValue, { color: colors.primary }]}>
              R$ {activity.price.toFixed(2)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  heroContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ActivityDetailScreen;
