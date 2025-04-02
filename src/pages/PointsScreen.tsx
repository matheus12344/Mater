import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { createStyles } from '../styles/theme';

interface Level {
  name: string;
  points: number;
  color: string;
  benefits: string[];
}

const levels: Level[] = [
  {
    name: 'Bronze',
    points: 0,
    color: '#CD7F32',
    benefits: ['5% de desconto em serviços', 'Suporte prioritário']
  },
  {
    name: 'Prata',
    points: 1000,
    color: '#C0C0C0',
    benefits: ['10% de desconto em serviços', 'Suporte VIP', 'Serviços prioritários']
  },
  {
    name: 'Ouro',
    points: 5000,
    color: '#FFD700',
    benefits: ['15% de desconto em serviços', 'Suporte VIP 24/7', 'Serviços prioritários', 'Bônus de pontos duplos']
  },
  {
    name: 'Platina',
    points: 10000,
    color: '#E5E4E2',
    benefits: ['20% de desconto em serviços', 'Suporte VIP 24/7', 'Serviços prioritários', 'Bônus de pontos triplos', 'Benefícios exclusivos']
  }
];

export default function PointsScreen({ navigation }: any) {
  const { theme, colors, styles } = useTheme();
  const customStyles = createStyles(theme);

  // Dados mockados do usuário (substituir por dados reais)
  const userPoints = 2500;
  const userLevel = levels.find(level => userPoints >= level.points) || levels[0];
  const nextLevel = levels.find(level => level.points > userPoints) || levels[levels.length - 1];
  const progress = ((userPoints - userLevel.points) / (nextLevel.points - userLevel.points)) * 100;

  return (
    <ScrollView style={[customStyles.container, { backgroundColor: colors.background }]}>
      {/* Cabeçalho */}
      <View style={[customStyles.header]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={customStyles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[customStyles.headerTitle, { color: colors.text }]}>Pontos e Recompensas</Text>
      </View>

      {/* Status do Usuário */}
      <View style={[customStyles.card, { backgroundColor: colors.card }]}>
        <View style={styles.pointsContainer}>
          <Text style={[styles.pointsTitle, { color: colors.text }]}>Seus Pontos</Text>
          <Text style={[styles.pointsValue, { color: colors.primary }]}>{userPoints}</Text>
        </View>

        <View style={styles.levelContainer}>
          <Text style={[styles.levelTitle, { color: colors.text }]}>Nível Atual</Text>
          <View style={[styles.levelBadge, { backgroundColor: userLevel.color }]}>
            <Text style={styles.levelText}>{userLevel.name}</Text>
          </View>
        </View>

        {/* Barra de Progresso */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${progress}%`,
                  backgroundColor: colors.primary 
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: colors.text }]}>
            {Math.round(progress)}% para o próximo nível
          </Text>
        </View>
      </View>

      {/* Benefícios do Nível */}
      <View style={[customStyles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Benefícios do Nível {userLevel.name}</Text>
        {userLevel.benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <Text style={[styles.benefitText, { color: colors.text }]}>{benefit}</Text>
          </View>
        ))}
      </View>

      {/* Próximo Nível */}
      <View style={[customStyles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Próximo Nível: {nextLevel.name}</Text>
        <Text style={[styles.nextLevelText, { color: colors.text }]}>
          Faltam {nextLevel.points - userPoints} pontos para alcançar o nível {nextLevel.name}
        </Text>
        <View style={styles.nextLevelBenefits}>
          {nextLevel.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Ionicons name="star" size={20} color={colors.primary} />
              <Text style={[styles.benefitText, { color: colors.text }]}>{benefit}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Como Ganhar Pontos */}
      <View style={[customStyles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Como Ganhar Pontos</Text>
        <View style={styles.pointsGuide}>
          <View style={styles.pointsGuideItem}>
            <Ionicons name="car" size={24} color={colors.primary} />
            <Text style={[styles.pointsGuideText, { color: colors.text }]}>
              Use o serviço de guincho
            </Text>
          </View>
          <View style={styles.pointsGuideItem}>
            <Ionicons name="star" size={24} color={colors.primary} />
            <Text style={[styles.pointsGuideText, { color: colors.text }]}>
              Avalie os serviços
            </Text>
          </View>
          <View style={styles.pointsGuideItem}>
            <Ionicons name="people" size={24} color={colors.primary} />
            <Text style={[styles.pointsGuideText, { color: colors.text }]}>
              Indique amigos
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
} 