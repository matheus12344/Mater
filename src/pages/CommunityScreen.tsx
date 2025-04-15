import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  ScrollView,
  SafeAreaView
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { CommunityPost } from '../types/index';
import { Ionicons } from '@expo/vector-icons';
import { scale } from 'react-native-size-matters';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Dados mockados para demonstração
const mockPosts: CommunityPost[] = [
  {
    id: '1',
    user: {
      id: '1',
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '(11) 99999-9999',
      role: 'user',
      status: 'active',
      lastLogin: new Date(),
      createdAt: new Date(),
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
          id: '2',
          name: 'Maria', 
          email: 'maria@example.com',
          phone: '(11) 98888-8888',
          role: 'user',
          status: 'active',
          lastLogin: new Date(),
          createdAt: new Date(),
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
          id: '3',
          name: 'Pedro', 
          email: 'pedro@example.com',
          phone: '(11) 97777-7777',
          role: 'user',
          status: 'active',
          lastLogin: new Date(),
          createdAt: new Date(),
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
      id: '4',
      name: 'Ana Oliveira',
      email: 'ana@example.com',
      phone: '(11) 96666-6666',
      role: 'user',
      status: 'active',
      lastLogin: new Date(),
      createdAt: new Date(),
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
          id: '5',
          name: 'Carlos', 
          email: 'carlos@example.com',
          phone: '(11) 95555-5555',
          role: 'user',
          status: 'active',
          lastLogin: new Date(),
          createdAt: new Date(),
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
      id: '6',
      name: 'Lucas Mendes',
      email: 'lucas@example.com',
      phone: '(11) 94444-4444',
      role: 'user',
      status: 'active',
      lastLogin: new Date(),
      createdAt: new Date(),
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
          id: '7',
          name: 'Fernanda', 
          email: 'fernanda@example.com',
          phone: '(11) 93333-3333',
          role: 'user',
          status: 'active',
          lastLogin: new Date(),
          createdAt: new Date(),
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
          id: '6',
          name: 'Lucas Mendes', 
          email: 'lucas@example.com',
          phone: '(11) 94444-4444',
          role: 'user',
          status: 'active',
          lastLogin: new Date(),
          createdAt: new Date(),
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
  const { colors } = useTheme();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [activeTab, setActiveTab] = useState<'challenges' | 'achievements' | 'leaderboard'>('challenges');
  
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animation for header
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [120, 70],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setPosts(mockPosts);
      setIsLoading(false);
      
      // Start fade-in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refreshing data
    setTimeout(() => {
      setPosts(mockPosts);
      setRefreshing(false);
    }, 1500);
  }, []);

  const handlePost = () => {
    if (!newPost.trim() && !selectedImage) return;
    
    setIsPosting(true);
    
    // Simulate posting
    setTimeout(() => {
      const newPostObj: CommunityPost = {
        id: Date.now().toString(),
        user: {
          id: 'current-user',
          name: userData?.name || 'Usuário',
          email: userData?.email || 'user@example.com',
          phone: '(11) 99999-9999',
          role: 'user',
          status: 'active',
          lastLogin: new Date(),
          createdAt: new Date(),
          profileImage: userData?.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg',
          vehicles: userData?.vehicles || [],
          referralCode: 'XYZ123'
        },
        content: newPost,
        likes: 0,
        comments: [],
        routeSnapshot: selectedImage || '',
        timestamp: new Date()
      };
      
      setPosts([newPostObj, ...posts]);
      setNewPost('');
      setSelectedImage(null);
      setIsPosting(false);
    }, 1000);
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
        styles.postContainer,
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
        <View style={styles.postInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{item.user.name}</Text>
          <Text style={[styles.timestamp, { color: colors.placeholder }]}>
            {formatTimeAgo(item.timestamp)}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.postContent, { color: colors.text }]}>{item.content}</Text>
      
      {item.routeSnapshot && (
        <View style={styles.routeContainer}>
          <Image source={{ uri: item.routeSnapshot }} style={styles.routeImage} />
        </View>
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
                {mockChallenges.map(challenge => (
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
                {mockAchievements.map(achievement => (
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
                {mockLeaderboard.map((user, index) => (
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View 
        style={[
          styles.header,
          { 
            height: headerHeight,
            paddingTop: insets.top,
            backgroundColor: colors.background,
          }
        ]}
      >
        <Animated.View style={[styles.headerContent, { opacity: headerOpacity }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Comunidade
          </Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Conecte-se com outros motoristas
          </Text>
        </Animated.View>

        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {['all', 'recent', 'popular', 'nearby'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text 
                  style={[
                    styles.filterText,
                  ]}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, {marginTop: scale(50)}]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.keyboardAvoidingView}
      >
        <BlurView 
          intensity={100} 
          style={[styles.inputContainer, { paddingBottom: insets.bottom }]}
        >
          <TouchableOpacity 
            style={[styles.imageButton, { backgroundColor: colors.primary + '20' }]}
            onPress={pickImage}
          >
            <Ionicons name="image-outline" size={scale(24)} color={colors.primary} />
          </TouchableOpacity>
          
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              { 
                backgroundColor: colors.card,
                color: colors.text,
              }
            ]}
            placeholder="Compartilhe sua experiência..."
            placeholderTextColor={colors.placeholder}
            value={newPost}
            onChangeText={setNewPost}
            multiline
          />
          
          <TouchableOpacity 
            style={[
              styles.postButton,
              { backgroundColor: colors.primary }
            ]}
            onPress={handlePost}
            disabled={isPosting}
          >
            {isPosting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={scale(20)} color="#FFFFFF" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.gamificationButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowGamification(true)}
          >
            <Ionicons name="trophy-outline" size={scale(20)} color="#FFFFFF" />
          </TouchableOpacity>
        </BlurView>
      </KeyboardAvoidingView>

      {renderGamificationModal()}
    </SafeAreaView>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    padding: scale(16),
  },
  title: {
    fontSize: scale(28),
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: scale(16),
    marginTop: scale(4),
  },
  filterContainer: {
    paddingHorizontal: scale(16),
    paddingBottom: scale(8),
  },
  filterScroll: {
    paddingRight: scale(16),
  },
  filterButton: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: scale(20),
    marginRight: scale(8),
  },
  filterText: {
    fontSize: scale(14),
    fontWeight: '500',
    color: 'white'
  },
  listContent: {
    paddingTop: scale(120),
    paddingBottom: scale(80),
  },
  postContainer: {
    marginHorizontal: scale(16),
    marginVertical: scale(8),
    borderRadius: scale(16),
    padding: scale(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  avatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    marginRight: scale(12),
  },
  postInfo: {
    flex: 1,
  },
  userName: {
    fontSize: scale(16),
    fontWeight: '600',
  },
  timestamp: {
    fontSize: scale(12),
    marginTop: scale(2),
  },
  postContent: {
    fontSize: scale(16),
    lineHeight: scale(24),
    marginBottom: scale(12),
  },
  routeContainer: {
    marginVertical: scale(12),
    borderRadius: scale(12),
    overflow: 'hidden',
  },
  routeImage: {
    width: '100%',
    height: scale(200),
    resizeMode: 'cover',
  },
  postActions: {
    flexDirection: 'row',
    marginTop: scale(12),
    paddingTop: scale(12),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: scale(24),
  },
  actionText: {
    marginLeft: scale(4),
    fontSize: scale(14),
  },
  keyboardAvoidingView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(16),
  },
  imageButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(8),
  },
  input: {
    flex: 1,
    borderRadius: scale(20),
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    marginRight: scale(8),
    fontSize: scale(16),
  },
  postButton: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: scale(14),
    fontWeight: '600',
  },
  gamificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(8),
    borderRadius: scale(20),
    marginLeft: scale(8),
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
  commentsContainer: {
    marginTop: scale(10),
  },
  commentItem: {
    padding: scale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  commentUser: {
    fontSize: scale(14),
    fontWeight: '600',
  },
  commentText: {
    fontSize: scale(14),
    marginTop: scale(2),
    color: '#666666',
  },
});
