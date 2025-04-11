import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Share, 
  ScrollView, 
  Image, 
  Dimensions,
  Animated,
  Platform
} from 'react-native';
import { useTheme } from 'src/context/ThemeContext';
import { mockUserData } from 'src/data/mockData';
import { Ionicons } from '@expo/vector-icons';
import { scale } from 'react-native-size-matters';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ReferralScreen = () => {
  const { colors, styles: themeStyles } = useTheme();
  const [referralCode] = useState(mockUserData.referralCode);
  const [copied, setCopied] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({ 
        message: `Use meu código de convite: ${referralCode} e ganhe pontos extras!`,
        title: 'Convite para Mater'
      });
      setShareCount(prev => prev + 1);
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const handleCopyCode = () => {
    // Simulando cópia para a área de transferência
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={[colors.primary, colors.primary + '80']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="people" size={scale(40)} color="#fff" />
          <Text style={styles.headerTitle}>Programa de Indicação</Text>
          <Text style={styles.headerSubtitle}>
            Indique amigos e ganhe pontos exclusivos
          </Text>
        </LinearGradient>
      </Animated.View>

      <Animated.View 
        style={[
          styles.card, 
          { 
            backgroundColor: colors.card,
            opacity: fadeAnim,
            transform: [{ translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })}]
          }
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Seu Código de Indicação
        </Text>
        
        <TouchableOpacity 
          style={[styles.codeContainer, { backgroundColor: colors.background }]}
          onPress={handleCopyCode}
        >
          <Text style={[styles.codeText, { color: colors.primary }]}>
            {referralCode}
          </Text>
          <Ionicons 
            name={copied ? "checkmark-circle" : "copy-outline"} 
            size={scale(20)} 
            color={copied ? colors.primary : colors.placeholder} 
          />
        </TouchableOpacity>
        
        {copied && (
          <Text style={[styles.copiedText, { color: colors.primary }]}>
            Código copiado!
          </Text>
        )}
        
        <TouchableOpacity 
          style={[styles.shareButton, { backgroundColor: colors.primary }]}
          onPress={handleShare}
        >
          <Ionicons name="share-social" size={scale(20)} color="#fff" />
          <Text style={styles.buttonText}>Compartilhar Código</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View 
        style={[
          styles.benefitsCard, 
          { 
            backgroundColor: colors.card,
            opacity: fadeAnim,
            transform: [{ translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })}]
          }
        ]}
      >
        <Text style={[styles.benefitsTitle, { color: colors.text }]}>
          Benefícios
        </Text>
        
        <View style={styles.benefitItem}>
          <View style={[styles.benefitIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="gift" size={scale(24)} color={colors.primary} />
          </View>
          <View style={styles.benefitTextContainer}>
            <Text style={[styles.benefitItemTitle, { color: colors.text }]}>
              Pontos para Você
            </Text>
            <Text style={[styles.benefitItemDescription, { color: colors.placeholder }]}>
              Ganhe 100 pontos por cada amigo que usar seu código
            </Text>
          </View>
        </View>
        
        <View style={styles.benefitItem}>
          <View style={[styles.benefitIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="star" size={scale(24)} color={colors.primary} />
          </View>
          <View style={styles.benefitTextContainer}>
            <Text style={[styles.benefitItemTitle, { color: colors.text }]}>
              Benefícios para Seus Amigos
            </Text>
            <Text style={[styles.benefitItemDescription, { color: colors.placeholder }]}>
              Eles ganham 50 pontos ao usar seu código
            </Text>
          </View>
        </View>
        
        <View style={styles.benefitItem}>
          <View style={[styles.benefitIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="trophy" size={scale(24)} color={colors.primary} />
          </View>
          <View style={styles.benefitTextContainer}>
            <Text style={[styles.benefitItemTitle, { color: colors.text }]}>
              Níveis de Indicação
            </Text>
            <Text style={[styles.benefitItemDescription, { color: colors.placeholder }]}>
              Quanto mais amigos, mais pontos você ganha
            </Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View 
        style={[
          styles.statsCard, 
          { 
            backgroundColor: colors.card,
            opacity: fadeAnim,
            transform: [{ translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })}]
          }
        ]}
      >
        <Text style={[styles.statsTitle, { color: colors.text }]}>
          Suas Estatísticas
        </Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {shareCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.placeholder }]}>
              Compartilhamentos
            </Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {shareCount * 100}
            </Text>
            <Text style={[styles.statLabel, { color: colors.placeholder }]}>
              Pontos Ganhos
            </Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {shareCount * 50}
            </Text>
            <Text style={[styles.statLabel, { color: colors.placeholder }]}>
              Pontos para Amigos
            </Text>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

export default ReferralScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: scale(30),
  },
  header: {
    height: scale(200),
    width: '100%',
    marginBottom: scale(20),
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  headerTitle: {
    fontSize: scale(24),
    fontWeight: 'bold',
    color: '#fff',
    marginTop: scale(10),
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: scale(16),
    color: '#fff',
    marginTop: scale(5),
    textAlign: 'center',
    opacity: 0.9,
  },
  card: {
    marginHorizontal: scale(20),
    borderRadius: scale(16),
    padding: scale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    marginBottom: scale(15),
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scale(15),
    borderRadius: scale(12),
    marginBottom: scale(10),
  },
  codeText: {
    fontSize: scale(24),
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  copiedText: {
    fontSize: scale(14),
    textAlign: 'center',
    marginBottom: scale(10),
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(15),
    borderRadius: scale(12),
    marginTop: scale(10),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: scale(16),
    fontWeight: '600',
    marginLeft: scale(8),
  },
  benefitsCard: {
    marginHorizontal: scale(20),
    borderRadius: scale(16),
    padding: scale(20),
    marginTop: scale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  benefitsTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    marginBottom: scale(15),
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(15),
  },
  benefitIcon: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(15),
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitItemTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    marginBottom: scale(4),
  },
  benefitItemDescription: {
    fontSize: scale(14),
  },
  statsCard: {
    marginHorizontal: scale(20),
    borderRadius: scale(16),
    padding: scale(20),
    marginTop: scale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statsTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    marginBottom: scale(15),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: scale(24),
    fontWeight: 'bold',
    marginBottom: scale(5),
  },
  statLabel: {
    fontSize: scale(12),
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: scale(40),
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
});
