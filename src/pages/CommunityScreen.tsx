import React, { useState, useEffect } from 'react';
import { 
  FlatList, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { CommunityPost } from '../types/index';
import { Ionicons } from '@expo/vector-icons';
import { scale } from 'react-native-size-matters';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

// Dados mockados para demonstração
const mockPosts: CommunityPost[] = [
  {
    id: '1',
    user: {
      name: 'João Silva',
      email: 'joao@example.com',
      profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
      vehicles: [],
      referralCode: 'ABC123'
    },
    content: 'Acabei de fazer uma viagem incrível com o Mater! O motorista foi super atencioso e o carro estava impecável. Recomendo muito!',
    likes: 24,
    comments: [
      { 
        id: '1', 
        user: { 
          name: 'Maria', 
          email: 'maria@example.com',
          profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
          vehicles: [],
          referralCode: 'DEF456'
        }, 
        content: 'Que ótimo! Vou experimentar também!',
        timestamp: new Date()
      },
      { 
        id: '2', 
        user: { 
          name: 'Pedro', 
          email: 'pedro@example.com',
          profileImage: 'https://randomuser.me/api/portraits/men/67.jpg',
          vehicles: [],
          referralCode: 'GHI789'
        }, 
        content: 'Qual serviço você usou?',
        timestamp: new Date()
      }
    ],
    routeSnapshot: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    timestamp: new Date(Date.now() - 3600000) // 1 hora atrás
  },
  {
    id: '2',
    user: {
      name: 'Ana Oliveira',
      email: 'ana@example.com',
      profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
      vehicles: [],
      referralCode: 'JKL012'
    },
    content: 'Serviço de guincho super rápido! Em menos de 20 minutos já estava com o carro na oficina. O atendente foi muito prestativo.',
    likes: 18,
    comments: [
      { 
        id: '3', 
        user: { 
          name: 'Carlos', 
          email: 'carlos@example.com',
          profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
          vehicles: [],
          referralCode: 'MNO345'
        }, 
        content: 'Que bom que deu tudo certo!',
        timestamp: new Date()
      }
    ],
    routeSnapshot: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    timestamp: new Date(Date.now() - 7200000) // 2 horas atrás
  },
  {
    id: '3',
    user: {
      name: 'Lucas Mendes',
      email: 'lucas@example.com',
      profileImage: 'https://randomuser.me/api/portraits/men/67.jpg',
      vehicles: [],
      referralCode: 'PQR678'
    },
    content: 'Acabei de usar o serviço de troca de pneu e foi excelente! O profissional chegou rápido e fez o serviço com muita qualidade.',
    likes: 32,
    comments: [
      { 
        id: '4', 
        user: { 
          name: 'Fernanda', 
          email: 'fernanda@example.com',
          profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
          vehicles: [],
          referralCode: 'STU901'
        }, 
        content: 'Quanto custou o serviço?',
        timestamp: new Date()
      },
      { 
        id: '5', 
        user: { 
          name: 'Lucas Mendes', 
          email: 'lucas@example.com',
          profileImage: 'https://randomuser.me/api/portraits/men/67.jpg',
          vehicles: [],
          referralCode: 'PQR678'
        }, 
        content: 'R$ 80,00. Bem acessível!',
        timestamp: new Date()
      }
    ],
    routeSnapshot: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    timestamp: new Date(Date.now() - 86400000) // 1 dia atrás
  }
];

// Dados de gamificação
const mockChallenges = [
  {
    id: '1',
    title: 'Primeira Viagem',
    description: 'Complete sua primeira viagem com o Mater',
    reward: 100,
    progress: 0,
    total: 1,
    completed: false,
    icon: 'car'
  },
  {
    id: '2',
    title: 'Compartilhe Experiências',
    description: 'Faça 3 posts na comunidade',
    reward: 150,
    progress: 1,
    total: 3,
    completed: false,
    icon: 'share-social'
  },
  {
    id: '3',
    title: 'Comentarista Ativo',
    description: 'Comente em 5 posts diferentes',
    reward: 200,
    progress: 2,
    total: 5,
    completed: false,
    icon: 'chatbubble'
  }
];

const mockAchievements = [
  {
    id: '1',
    title: 'Novato',
    description: 'Primeiro post na comunidade',
    icon: 'star',
    unlocked: true,
    date: new Date(Date.now() - 86400000 * 2)
  },
  {
    id: '2',
    title: 'Comentarista',
    description: '5 comentários em posts',
    icon: 'chatbubbles',
    unlocked: true,
    date: new Date(Date.now() - 86400000)
  },
  {
    id: '3',
    title: 'Influenciador',
    description: '10 posts com mais de 50 curtidas',
    icon: 'trophy',
    unlocked: false
  }
];

const mockLeaderboard = [
  {
    id: '1',
    name: 'João Silva',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    points: 1250,
    rank: 1
  },
  {
    id: '2',
    name: 'Ana Oliveira',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    points: 980,
    rank: 2
  },
  {
    id: '3',
    name: 'Lucas Mendes',
    profileImage: 'https://randomuser.me/api/portraits/men/67.jpg',
    points: 750,
    rank: 3
  },
  {
    id: '4',
    name: 'Maria Santos',
    profileImage: 'https://randomuser.me/api/portraits/women/68.jpg',
    points: 620,
    rank: 4
  },
  {
    id: '5',
    name: 'Pedro Costa',
    profileImage: 'https://randomuser.me/api/portraits/men/22.jpg',
    points: 450,
    rank: 5
  }
];

interface CommunityScreenProps {
  userData?: {
    name: string;
    email: string;
    profileImage?: string;
    vehicles: any[];
  };
}

const CommunityScreen: React.FC<CommunityScreenProps> = ({ userData }) => {
  const { colors, styles: themeStyles } = useTheme();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  // Estados para gamificação
  const [showGamification, setShowGamification] = useState(false);
  const [activeTab, setActiveTab] = useState<'challenges' | 'achievements' | 'leaderboard'>('challenges');
  const [userPoints, setUserPoints] = useState(320);
  const [userRank, setUserRank] = useState(8);
  const [challenges, setChallenges] = useState(mockChallenges);
  const [achievements, setAchievements] = useState(mockAchievements);
  const [leaderboard, setLeaderboard] = useState(mockLeaderboard);
  
  useEffect(() => {
    // Simulando carregamento de dados
    const timer = setTimeout(() => {
      setPosts(mockPosts);
      setIsLoading(false);
    }, 1000);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    return () => clearTimeout(timer);
  }, []);
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulando atualização de dados
    setTimeout(() => {
      setPosts([...mockPosts].sort(() => Math.random() - 0.5));
      setRefreshing(false);
    }, 1500);
  }, []);
  
  const handlePost = () => {
    if (!newPost.trim() && !selectedImage) return;
    
    setIsPosting(true);
    
    // Simulando envio de post
    setTimeout(() => {
      const newPostObj: CommunityPost = {
        id: Date.now().toString(),
        user: {
          name: 'Você',
          email: 'user@example.com',
          profileImage: userData?.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg',
          vehicles: [],
          referralCode: 'XYZ123'
        },
        content: newPost,
        likes: 0,
        comments: [],
        routeSnapshot: selectedImage || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        timestamp: new Date()
      };
      
      setPosts([newPostObj, ...posts]);
      setNewPost('');
      setSelectedImage(null);
      setIsPosting(false);
      
      // Atualizar desafios após criar um post
      updateChallengesAfterPost();
    }, 1000);
  };
  
  const updateChallengesAfterPost = () => {
    setChallenges(prevChallenges => 
      prevChallenges.map(challenge => {
        if (challenge.id === '2') {
          const newProgress = challenge.progress + 1;
          const completed = newProgress >= challenge.total;
          
          if (completed && !challenge.completed) {
            // Adicionar pontos quando completar o desafio
            setUserPoints(prev => prev + challenge.reward);
            
            // Mostrar notificação de conquista
            setTimeout(() => {
              alert(`Parabéns! Você completou o desafio "${challenge.title}" e ganhou ${challenge.reward} pontos!`);
            }, 500);
          }
          
          return {
            ...challenge,
            progress: newProgress,
            completed: completed
          };
        }
        return challenge;
      })
    );
  };
  
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Desculpe, precisamos de permissão para acessar suas fotos!');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };
  
  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 } 
        : post
    ));
  };
  
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'agora mesmo';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    return `${Math.floor(diffInSeconds / 86400)}d atrás`;
  };

  const renderPost = ({ item, index }: { item: CommunityPost; index: number }) => (
    <Animated.View 
      style={[
        styles.postCard, 
        { 
          backgroundColor: colors.card,
          opacity: fadeAnim,
          transform: [{ 
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })
          }]
        }
      ]}
    >
      <View style={styles.postHeader}>
        <Image source={{ uri: item.user.profileImage }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{item.user.name}</Text>
          <Text style={[styles.timestamp, { color: colors.placeholder }]}>
            {formatTimeAgo(item.timestamp)}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.postContent, { color: colors.text }]}>{item.content}</Text>
      
      {item.routeSnapshot && (
        <Image source={{ uri: item.routeSnapshot }} style={styles.routeImage} />
      )}
      
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
        >
          <Ionicons name="heart-outline" size={scale(20)} color={colors.text} />
          <Text style={[styles.actionText, { color: colors.text }]}>{item.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={scale(20)} color={colors.text} />
          <Text style={[styles.actionText, { color: colors.text }]}>{item.comments.length}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={scale(20)} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {item.comments.length > 0 && (
        <View style={[styles.commentsContainer, { borderTopColor: colors.border }]}>
          {item.comments.map(comment => (
            <View key={comment.id} style={styles.commentItem}>
              <Text style={[styles.commentUser, { color: colors.primary }]}>
                {comment.user.name}:
              </Text>
              <Text style={[styles.commentText, { color: colors.text }]}>
                {comment.content}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );

  const renderGamificationModal = () => (
    <Modal
      visible={showGamification}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowGamification(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Gamificação</Text>
            <TouchableOpacity onPress={() => setShowGamification(false)}>
              <Ionicons name="close" size={scale(24)} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.userStatsContainer}>
            <View style={[styles.userStatItem, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="star" size={scale(20)} color={colors.primary} />
              <Text style={[styles.userStatValue, { color: colors.text }]}>{userPoints}</Text>
              <Text style={[styles.userStatLabel, { color: colors.placeholder }]}>Pontos</Text>
            </View>
            <View style={[styles.userStatItem, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="trophy" size={scale(20)} color={colors.primary} />
              <Text style={[styles.userStatValue, { color: colors.text }]}>{userRank}º</Text>
              <Text style={[styles.userStatLabel, { color: colors.placeholder }]}>Ranking</Text>
            </View>
            <View style={[styles.userStatItem, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="ribbon" size={scale(20)} color={colors.primary} />
              <Text style={[styles.userStatValue, { color: colors.text }]}>
                {achievements.filter(a => a.unlocked).length}
              </Text>
              <Text style={[styles.userStatLabel, { color: colors.placeholder }]}>Conquistas</Text>
            </View>
          </View>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[
                styles.tabButton, 
                activeTab === 'challenges' && { borderBottomColor: colors.primary }
              ]}
              onPress={() => setActiveTab('challenges')}
            >
              <Text style={[
                styles.tabText, 
                { color: activeTab === 'challenges' ? colors.primary : colors.text }
              ]}>
                Desafios
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.tabButton, 
                activeTab === 'achievements' && { borderBottomColor: colors.primary }
              ]}
              onPress={() => setActiveTab('achievements')}
            >
              <Text style={[
                styles.tabText, 
                { color: activeTab === 'achievements' ? colors.primary : colors.text }
              ]}>
                Conquistas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.tabButton, 
                activeTab === 'leaderboard' && { borderBottomColor: colors.primary }
              ]}
              onPress={() => setActiveTab('leaderboard')}
            >
              <Text style={[
                styles.tabText, 
                { color: activeTab === 'leaderboard' ? colors.primary : colors.text }
              ]}>
                Ranking
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.tabContent}>
            {activeTab === 'challenges' && (
              <View>
                {challenges.map(challenge => (
                  <View key={challenge.id} style={[styles.challengeItem, { backgroundColor: colors.background }]}>
                    <View style={styles.challengeHeader}>
                      <View style={[styles.challengeIconContainer, { backgroundColor: colors.primary + '20' }]}>
                        <Ionicons name={challenge.icon as any} size={scale(20)} color={colors.primary} />
                      </View>
                      <View style={styles.challengeInfo}>
                        <Text style={[styles.challengeTitle, { color: colors.text }]}>{challenge.title}</Text>
                        <Text style={[styles.challengeDescription, { color: colors.placeholder }]}>
                          {challenge.description}
                        </Text>
                      </View>
                      <View style={[styles.rewardContainer, { backgroundColor: colors.primary + '20' }]}>
                        <Ionicons name="star" size={scale(16)} color={colors.primary} />
                        <Text style={[styles.rewardText, { color: colors.primary }]}>{challenge.reward}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.progressContainer}>
                      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { 
                              backgroundColor: colors.primary,
                              width: `${(challenge.progress / challenge.total) * 100}%`
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.progressText, { color: colors.placeholder }]}>
                        {challenge.progress}/{challenge.total}
                      </Text>
                    </View>
                    
                    {challenge.completed && (
                      <View style={[styles.completedBadge, { backgroundColor: colors.success + '20' }]}>
                        <Ionicons name="checkmark-circle" size={scale(16)} color={colors.success} />
                        <Text style={[styles.completedText, { color: colors.success }]}>Completo</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
            
            {activeTab === 'achievements' && (
              <View>
                {achievements.map(achievement => (
                  <View key={achievement.id} style={[styles.achievementItem, { backgroundColor: colors.background }]}>
                    <View style={[
                      styles.achievementIconContainer, 
                      { 
                        backgroundColor: achievement.unlocked 
                          ? colors.primary + '20' 
                          : colors.placeholder + '20' 
                      }
                    ]}>
                      <Ionicons 
                        name={achievement.icon as any} 
                        size={scale(24)} 
                        color={achievement.unlocked ? colors.primary : colors.placeholder} 
                      />
                    </View>
                    <View style={styles.achievementInfo}>
                      <Text style={[styles.achievementTitle, { color: colors.text }]}>{achievement.title}</Text>
                      <Text style={[styles.achievementDescription, { color: colors.placeholder }]}>
                        {achievement.description}
                      </Text>
                      {achievement.unlocked && achievement.date && (
                        <Text style={[styles.achievementDate, { color: colors.placeholder }]}>
                          Desbloqueado em {achievement.date.toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                    {achievement.unlocked ? (
                      <Ionicons name="checkmark-circle" size={scale(24)} color={colors.success} />
                    ) : (
                      <Ionicons name="lock-closed" size={scale(24)} color={colors.placeholder} />
                    )}
                  </View>
                ))}
              </View>
            )}
            
            {activeTab === 'leaderboard' && (
              <View>
                {leaderboard.map((user, index) => (
                  <View key={user.id} style={[styles.leaderboardItem, { backgroundColor: colors.background }]}>
                    <View style={styles.rankContainer}>
                      {index < 3 ? (
                        <View style={[
                          styles.rankBadge, 
                          { 
                            backgroundColor: 
                              index === 0 ? '#FFD700' : 
                              index === 1 ? '#C0C0C0' : 
                              '#CD7F32'
                          }
                        ]}>
                          <Text style={styles.rankNumber}>{index + 1}</Text>
                        </View>
                      ) : (
                        <Text style={[styles.rankNumber, { color: colors.placeholder }]}>{index + 1}</Text>
                      )}
                    </View>
                    <Image source={{ uri: user.profileImage }} style={styles.leaderboardAvatar} />
                    <Text style={[styles.leaderboardName, { color: colors.text }]}>{user.name}</Text>
                    <View style={[styles.pointsContainer, { backgroundColor: colors.primary + '20' }]}>
                      <Ionicons name="star" size={scale(16)} color={colors.primary} />
                      <Text style={[styles.pointsText, { color: colors.primary }]}>{user.points}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Carregando comunidade...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Animated.View 
        style={[
          styles.header, 
          { 
            backgroundColor: colors.card,
            opacity: fadeAnim,
            transform: [{ 
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0]
              })
            }]
          }
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Comunidade Mater
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.placeholder }]}>
          Compartilhe suas experiências
        </Text>

        {/* Gamificação */}
        
        <TouchableOpacity 
          style={[styles.gamificationButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowGamification(true)}
        >
          <Ionicons name="trophy" size={scale(18)} color="#fff" />
          <Text style={styles.gamificationButtonText}>Gamificação</Text>
        </TouchableOpacity>
      </Animated.View>
      
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={[styles.newPostContainer, { backgroundColor: colors.card }]}>
            <View style={styles.postInputContainer}>
              <Image 
                source={{ uri: userData?.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg' }} 
                style={styles.userAvatar} 
              />
              <TextInput
                style={[styles.postInput, { color: colors.text }]}
                placeholder="Compartilhe sua experiência..."
                placeholderTextColor={colors.placeholder}
                value={newPost}
                onChangeText={setNewPost}
                multiline
              />
            </View>
            
            {selectedImage && (
              <View style={styles.selectedImageContainer}>
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <Ionicons name="close-circle" size={scale(24)} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.postActionsContainer}>
              <TouchableOpacity 
                style={[styles.mediaButton, { backgroundColor: colors.primary + '20' }]}
                onPress={pickImage}
              >
                <Ionicons name="image" size={scale(20)} color={colors.primary} />
                <Text style={[styles.mediaButtonText, { color: colors.primary }]}>
                  Foto
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.postButton, 
                  { 
                    backgroundColor: colors.primary,
                    opacity: (newPost.trim() || selectedImage) ? 1 : 0.5
                  }
                ]}
                onPress={handlePost}
                disabled={!newPost.trim() && !selectedImage || isPosting}
              >
                {isPosting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="send" size={scale(18)} color="#fff" />
                    <Text style={styles.postButtonText}>Publicar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        }
      />
      
      {renderGamificationModal()}
    </KeyboardAvoidingView>
  );
};

export default CommunityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: scale(10),
    fontSize: scale(16),
  },
  header: {
    padding: scale(20),
    borderBottomLeftRadius: scale(20),
    borderBottomRightRadius: scale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: scale(24),
    fontWeight: 'bold',
    marginBottom: scale(5),
  },
  headerSubtitle: {
    fontSize: scale(14),
  },
  listContent: {
    paddingBottom: scale(30),
  },
  newPostContainer: {
    margin: scale(16),
    borderRadius: scale(16),
    padding: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  postInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    marginRight: scale(10),
  },
  postInput: {
    flex: 1,
    minHeight: scale(40),
    maxHeight: scale(100),
    fontSize: scale(16),
  },
  postActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: scale(10),
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(8),
    borderRadius: scale(8),
  },
  mediaButtonText: {
    marginLeft: scale(5),
    fontSize: scale(14),
    fontWeight: '500',
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(10),
    borderRadius: scale(8),
  },
  postButtonText: {
    color: '#fff',
    marginLeft: scale(5),
    fontSize: scale(14),
    fontWeight: '600',
  },
  selectedImageContainer: {
    marginTop: scale(10),
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: scale(200),
    borderRadius: scale(8),
  },
  removeImageButton: {
    position: 'absolute',
    top: scale(5),
    right: scale(5),
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: scale(12),
  },
  postCard: {
    marginHorizontal: scale(16),
    marginTop: scale(16),
    borderRadius: scale(16),
    padding: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(10),
  },
  avatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    marginRight: scale(10),
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: scale(16),
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: scale(12),
  },
  postContent: {
    fontSize: scale(16),
    lineHeight: scale(22),
    marginBottom: scale(10),
  },
  routeImage: {
    width: '100%',
    height: scale(200),
    borderRadius: scale(12),
    marginBottom: scale(10),
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scale(10),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(8),
  },
  actionText: {
    marginLeft: scale(5),
    fontSize: scale(14),
  },
  commentsContainer: {
    marginTop: scale(10),
    paddingTop: scale(10),
    borderTopWidth: 1,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: scale(5),
  },
  commentUser: {
    fontWeight: 'bold',
    marginRight: scale(5),
  },
  commentText: {
    flex: 1,
  },
  gamificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(8),
    borderRadius: scale(20),
    marginTop: scale(10),
    alignSelf: 'flex-start',
  },
  gamificationButtonText: {
    color: '#FFFFFF',
    fontSize: scale(14),
    fontWeight: '600',
    marginLeft: scale(5),
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    padding: scale(20),
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(20),
  },
  modalTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
  },
  userStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(20),
  },
  userStatItem: {
    flex: 1,
    alignItems: 'center',
    padding: scale(12),
    borderRadius: scale(12),
    marginHorizontal: scale(5),
  },
  userStatValue: {
    fontSize: scale(18),
    fontWeight: 'bold',
    marginTop: scale(5),
  },
  userStatLabel: {
    fontSize: scale(12),
    marginTop: scale(2),
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: scale(15),
  },
  tabButton: {
    flex: 1,
    paddingVertical: scale(10),
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: scale(14),
    fontWeight: '600',
  },
  tabContent: {
    maxHeight: scale(400),
  },
  challengeItem: {
    borderRadius: scale(12),
    padding: scale(15),
    marginBottom: scale(10),
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeIconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeInfo: {
    flex: 1,
    marginLeft: scale(10),
  },
  challengeTitle: {
    fontSize: scale(16),
    fontWeight: '600',
  },
  challengeDescription: {
    fontSize: scale(12),
    marginTop: scale(2),
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(6),
    borderRadius: scale(12),
  },
  rewardText: {
    fontSize: scale(14),
    fontWeight: '600',
    marginLeft: scale(4),
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(10),
  },
  progressBar: {
    flex: 1,
    height: scale(6),
    borderRadius: scale(3),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: scale(3),
  },
  progressText: {
    fontSize: scale(12),
    marginLeft: scale(8),
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(6),
    borderRadius: scale(12),
    marginTop: scale(10),
    alignSelf: 'flex-start',
  },
  completedText: {
    fontSize: scale(12),
    fontWeight: '600',
    marginLeft: scale(4),
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: scale(12),
    padding: scale(15),
    marginBottom: scale(10),
  },
  achievementIconContainer: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
    marginLeft: scale(15),
  },
  achievementTitle: {
    fontSize: scale(16),
    fontWeight: '600',
  },
  achievementDescription: {
    fontSize: scale(12),
    marginTop: scale(2),
  },
  achievementDate: {
    fontSize: scale(10),
    marginTop: scale(4),
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: scale(12),
    padding: scale(15),
    marginBottom: scale(10),
  },
  rankContainer: {
    width: scale(30),
    alignItems: 'center',
  },
  rankBadge: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: scale(14),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  leaderboardAvatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    marginLeft: scale(10),
  },
  leaderboardName: {
    flex: 1,
    fontSize: scale(16),
    fontWeight: '600',
    marginLeft: scale(10),
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(6),
    borderRadius: scale(12),
  },
  pointsText: {
    fontSize: scale(14),
    fontWeight: '600',
    marginLeft: scale(4),
  },
});
