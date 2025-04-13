import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, Animated, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { createStyles } from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface Level {
  name: string;
  points: number;
  color: string;
  benefits: string[];
  icon: string;
}

const levels: Level[] = [
  {
    name: 'Bronze',
    points: 0,
    color: '#CD7F32',
    icon: 'medal',
    benefits: ['5% de desconto em serviços', 'Suporte prioritário']
  },
  {
    name: 'Prata',
    points: 1000,
    color: '#C0C0C0',
    icon: 'medal',
    benefits: ['10% de desconto em serviços', 'Suporte VIP', 'Serviços prioritários']
  },
  {
    name: 'Ouro',
    points: 5000,
    color: '#FFD700',
    icon: 'trophy',
    benefits: ['15% de desconto em serviços', 'Suporte VIP 24/7', 'Serviços prioritários', 'Bônus de pontos duplos']
  },
  {
    name: 'Platina',
    points: 10000,
    color: '#E5E4E2',
    icon: 'diamond',
    benefits: ['20% de desconto em serviços', 'Suporte VIP 24/7', 'Serviços prioritários', 'Bônus de pontos triplos', 'Benefícios exclusivos']
  }
];

const { width } = Dimensions.get('window');

export default function PointsScreen({ navigation }: any) {
  const { theme, colors} = useTheme();
  const customStyles = createStyles(theme);
  const [scrollY] = useState(new Animated.Value(0));
  const [activeTab, setActiveTab] = useState('beneficios');

  // Dados mockados do usuário (substituir por dados reais)
  const userPoints = 2500;
  let userLevel = levels.find(level => userPoints >= level.points) || levels[0];
  let nextLevel = levels.find(level => level.points > userPoints) || levels[levels.length - 1];
  const progress = ((userPoints - userLevel.points) / (nextLevel.points - userLevel.points)) * 100;

  if (userPoints >= 10000) {
    userLevel = levels.find(level => level.points > userPoints) || levels[levels.length - 1];
    nextLevel = levels.find(level => level.points > userPoints) || levels[levels.length - 1];
  }
  if (userPoints >= 5000) {
    userLevel = levels.find(level => level.points > userPoints) || levels[levels.length - 1];
    nextLevel = levels.find(level => level.points > userPoints) || levels[levels.length - 1];
  }
  if (userPoints >= 1000) {
    userLevel = levels.find(level => level.points > userPoints) || levels[levels.length - 1];
    nextLevel = levels.find(level => level.points > userPoints) || levels[levels.length - 1];
  }
  if (userPoints >= 0) {
    userLevel = levels.find(level => level.points > userPoints) || levels[levels.length - 1];
    nextLevel = levels.find(level => level.points > userPoints) || levels[levels.length - 1];
  }

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [250, 120],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [0, 0.7, 1],
    extrapolate: 'clamp',
  });

  const headerTitleTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  return (
    <View style={[customStyles.container, { backgroundColor: colors.background }]}>
      {/* Cabeçalho Animado */}
      <Animated.View style={[
        styles.header,
        {
          height: headerHeight,
          backgroundColor: colors.primary,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1,
        }
      ]}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark || colors.primary]}
          style={{ flex: 1, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Animated.Text 
              style={[
                styles.headerTitle, 
                { 
                  color: 'white',
                  opacity: headerTitleOpacity,
                  transform: [{ translateY: headerTitleTranslateY }]
                }
              ]}
            >
              Pontos e Recompensas
            </Animated.Text>
            <TouchableOpacity style={styles.infoButton}>
              <Ionicons name="information-circle-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <Animated.View style={[styles.headerTextContainer, { opacity: headerOpacity }]}>
            <Text style={styles.headerMainText}>
              Seus Pontos
            </Text>
            <Text style={styles.headerPointsValue}>
              {userPoints}
            </Text>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView 
        style={[customStyles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingTop: 250, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Status do Usuário */}
        <View style={[styles.card, { backgroundColor: colors.card, marginHorizontal: 16, marginTop: -10 }]}>
          <View style={styles.levelContainer}>
            <View style={[styles.levelBadge, { backgroundColor: userLevel.color }]}>
              <Ionicons name={userLevel.icon as any} size={24} color="white" />
              <Text style={styles.levelText}>{userLevel.name}</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={[styles.levelTitle, { color: colors.text }]}>Nível Atual</Text>
              <Text style={[styles.levelSubtitle, { color: colors.text }]}>
                {userPoints} / {nextLevel.points} pontos
              </Text>
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

        {/* Tabs de Navegação */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'beneficios' && styles.activeTab,
              { borderBottomColor: colors.primary }
            ]}
            onPress={() => setActiveTab('beneficios')}
          >
            <Text 
              style={[
                styles.tabText, 
                activeTab === 'beneficios' && styles.activeTabText,
                { color: activeTab === 'beneficios' ? colors.primary : colors.text }
              ]}
            >
              Benefícios
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'proximo' && styles.activeTab,
              { borderBottomColor: colors.primary }
            ]}
            onPress={() => setActiveTab('proximo')}
          >
            <Text 
              style={[
                styles.tabText, 
                activeTab === 'proximo' && styles.activeTabText,
                { color: activeTab === 'proximo' ? colors.primary : colors.text }
              ]}
            >
              Próximo Nível
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'comoGanhar' && styles.activeTab,
              { borderBottomColor: colors.primary }
            ]}
            onPress={() => setActiveTab('comoGanhar')}
          >
            <Text 
              style={[
                styles.tabText, 
                activeTab === 'comoGanhar' && styles.activeTabText,
                { color: activeTab === 'comoGanhar' ? colors.primary : colors.text }
              ]}
            >
              Como Ganhar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo das Tabs */}
        {activeTab === 'beneficios' && (
          <View style={[styles.card, { backgroundColor: colors.card, marginHorizontal: 16, marginTop: 16 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Benefícios do Nível {userLevel.name}
            </Text>
            {userLevel.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={[styles.benefitIcon, { backgroundColor: `${userLevel.color}20` }]}>
                  <Ionicons name="checkmark-circle" size={20} color={userLevel.color} />
                </View>
                <Text style={[styles.benefitText, { color: colors.text }]}>{benefit}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'proximo' && (
          <View style={[styles.card, { backgroundColor: colors.card, marginHorizontal: 16, marginTop: 16 }]}>
            <View style={styles.nextLevelHeader}>
              <View style={[styles.nextLevelBadge, { backgroundColor: `${nextLevel.color}20` }]}>
                <Ionicons name={nextLevel.icon as any} size={24} color={nextLevel.color} />
              </View>
              <View style={styles.nextLevelInfo}>
                <Text style={[styles.nextLevelTitle, { color: colors.text }]}>
                  Próximo Nível: {nextLevel.name}
                </Text>
                <Text style={[styles.nextLevelSubtitle, { color: colors.text }]}>
                  Faltam {nextLevel.points - userPoints} pontos
                </Text>
              </View>
            </View>
            
            <View style={styles.nextLevelBenefits}>
              {nextLevel.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <View style={[styles.benefitIcon, { backgroundColor: `${nextLevel.color}20` }]}>
                    <Ionicons name="star" size={20} color={nextLevel.color} />
                  </View>
                  <Text style={[styles.benefitText, { color: colors.text }]}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'comoGanhar' && (
          <View style={[styles.card, { backgroundColor: colors.card, marginHorizontal: 16, marginTop: 16 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Como Ganhar Pontos
            </Text>
            <View style={styles.pointsGuide}>
              <View style={styles.pointsGuideItem}>
                <View style={[styles.pointsGuideIcon, { backgroundColor: `${colors.primary}20` }]}>
                  <Ionicons name="car" size={24} color={colors.primary} />
                </View>
                <View style={styles.pointsGuideTextContainer}>
                  <Text style={[styles.pointsGuideTitle, { color: colors.text }]}>
                    Use o serviço de guincho
                  </Text>
                  <Text style={[styles.pointsGuideValue, { color: colors.primary }]}>
                    +100 pontos
                  </Text>
                </View>
              </View>
              
              <View style={styles.pointsGuideItem}>
                <View style={[styles.pointsGuideIcon, { backgroundColor: `${colors.primary}20` }]}>
                  <Ionicons name="star" size={24} color={colors.primary} />
                </View>
                <View style={styles.pointsGuideTextContainer}>
                  <Text style={[styles.pointsGuideTitle, { color: colors.text }]}>
                    Avalie os serviços
                  </Text>
                  <Text style={[styles.pointsGuideValue, { color: colors.primary }]}>
                    +50 pontos
                  </Text>
                </View>
              </View>
              
              <View style={styles.pointsGuideItem}>
                <View style={[styles.pointsGuideIcon, { backgroundColor: `${colors.primary}20` }]}>
                  <Ionicons name="people" size={24} color={colors.primary} />
                </View>
                <View style={styles.pointsGuideTextContainer}>
                  <Text style={[styles.pointsGuideTitle, { color: colors.text }]}>
                    Indique amigos
                  </Text>
                  <Text style={[styles.pointsGuideValue, { color: colors.primary }]}>
                    +200 pontos
                  </Text>
                </View>
              </View>
              
              <View style={styles.pointsGuideItem}>
                <View style={[styles.pointsGuideIcon, { backgroundColor: `${colors.primary}20` }]}>
                  <Ionicons name="calendar" size={24} color={colors.primary} />
                </View>
                <View style={styles.pointsGuideTextContainer}>
                  <Text style={[styles.pointsGuideTitle, { color: colors.text }]}>
                    Frequência mensal
                  </Text>
                  <Text style={[styles.pointsGuideValue, { color: colors.primary }]}>
                    +150 pontos
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Botão de Ajuda */}
        <TouchableOpacity 
          style={[styles.helpButton, { backgroundColor: colors.primary }]}
          onPress={() => console.log('Ajuda')}
        >
          <Ionicons name="help-circle-outline" size={24} color="white" />
          <Text style={styles.helpButtonText}>Precisa de ajuda?</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 250,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTextContainer: {
    marginTop: 32,
  },
  headerMainText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.8,
  },
  headerPointsValue: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 8,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 16,
  },
  levelText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitText: {
    flex: 1,
    fontSize: 16,
  },
  nextLevelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  nextLevelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  nextLevelInfo: {
    flex: 1,
  },
  nextLevelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextLevelSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  nextLevelBenefits: {
    marginTop: 8,
  },
  pointsGuide: {
    marginTop: 8,
  },
  pointsGuideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsGuideIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pointsGuideTextContainer: {
    flex: 1,
  },
  pointsGuideTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  pointsGuideValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  helpButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 