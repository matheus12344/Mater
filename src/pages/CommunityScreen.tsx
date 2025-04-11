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
  Platform
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

const CommunityScreen = () => {
  const { colors, styles: themeStyles } = useTheme();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
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
          profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
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
                source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
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
});
