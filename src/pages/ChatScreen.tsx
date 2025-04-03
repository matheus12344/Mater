import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
  Animated,
  Pressable,
  Linking,
  AccessibilityInfo,
  useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { database } from '../services/firebase';
import { ref, onValue, push, set, off } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { scale } from 'react-native-size-matters';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'driver';
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'voice' | 'location';
  imageUrl?: string;
  voiceUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  reactions?: {
    [key: string]: string[];
  };
}

export default function ChatScreen({ navigation, route }: any) {
  const { theme, colors } = useTheme();
  const colorScheme = useColorScheme();
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isVoiceControlEnabled, setIsVoiceControlEnabled] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const driverName = route?.params?.driverName || 'Motorista';
  const driverPhoto = route?.params?.driverPhoto || 'https://via.placeholder.com/150';
  const chatId = `chat_${route.params.serviceId}`;
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const messagesRef = ref(database, `chats/${chatId}/messages`);
    
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesList = Object.values(data) as Message[];
        setMessages(messagesList.sort((a, b) => a.timestamp - b.timestamp));
      }
    });

    return () => {
      off(messagesRef);
    };
  }, [chatId]);

  useEffect(() => {
    // Initialize audio recording
    Audio.requestPermissionsAsync().catch(console.error);
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    }).catch(console.error);

    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    // Check for high contrast mode
    AccessibilityInfo.isReduceMotionEnabled().then(reduceMotion => {
      setIsHighContrast(reduceMotion);
    });

    // Listen for accessibility changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      reduceMotion => {
        setIsHighContrast(reduceMotion);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const startRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Erro', 'Não foi possível iniciar a gravação');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);
      setRecording(null);

      if (uri) {
        const response = await fetch(uri);
        const blob = await response.blob();
        
        const storage = getStorage();
        const voiceRef = storageRef(storage, `chats/${chatId}/voice/${Date.now()}.m4a`);
        
        try {
          await uploadBytes(voiceRef, blob);
          const downloadURL = await getDownloadURL(voiceRef);

          const message: Message = {
            id: Date.now().toString(),
            text: 'Mensagem de voz',
            sender: 'user',
            timestamp: Date.now(),
            status: 'sent',
            type: 'voice',
            voiceUrl: downloadURL
          };

          const messagesRef = ref(database, `chats/${chatId}/messages`);
          const newMessageRef = push(messagesRef);
          await set(newMessageRef, message);
        } catch (storageError) {
          console.error('Storage error:', storageError);
          Alert.alert('Erro', 'Não foi possível enviar a mensagem de voz');
        }
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
      Alert.alert('Erro', 'Não foi possível parar a gravação');
    }
  };

  const shareLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Ative a localização nas configurações');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      const message: Message = {
        id: Date.now().toString(),
        text: 'Minha localização',
        sender: 'user',
        timestamp: Date.now(),
        status: 'sent',
        type: 'location',
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: address[0]?.name || 'Localização atual'
        }
      };

      const messagesRef = ref(database, `chats/${chatId}/messages`);
      const newMessageRef = push(messagesRef);
      await set(newMessageRef, message);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Erro', 'Não foi possível obter sua localização');
    }
  };

  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleReaction = async (message: Message, emoji: string) => {
    const messagesRef = ref(database, `chats/${chatId}/messages/${message.id}/reactions`);
    const currentReactions = message.reactions || {};
    const users = currentReactions[emoji] || [];
    
    if (users.includes('user')) {
      // Remove reaction if user already reacted
      const updatedUsers = users.filter(user => user !== 'user');
      if (updatedUsers.length === 0) {
        const { [emoji]: _, ...rest } = currentReactions;
        await set(messagesRef, rest);
      } else {
        await set(messagesRef, { ...currentReactions, [emoji]: updatedUsers });
      }
    } else {
      // Add reaction
      await set(messagesRef, { ...currentReactions, [emoji]: [...users, 'user'] });
    }
  };

  const playVoiceMessage = async (voiceUrl: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: voiceUrl },
        { shouldPlay: true }
      );
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing voice message:', error);
    }
  };

  const openLocation = (location: { latitude: number; longitude: number; address?: string } | undefined) => {
    if (!location) return;
    const { latitude, longitude } = location;
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}`
    });
    Linking.openURL(url!);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUrl = result.assets[0].uri;
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        const storage = getStorage();
        const imageRef = storageRef(storage, `chats/${chatId}/images/${Date.now()}.jpg`);
        
        try {
          await uploadBytes(imageRef, blob);
          const downloadURL = await getDownloadURL(imageRef);

          const message: Message = {
            id: Date.now().toString(),
            text: 'Imagem',
            sender: 'user',
            timestamp: Date.now(),
            status: 'sent',
            type: 'image',
            imageUrl: downloadURL
          };

          const messagesRef = ref(database, `chats/${chatId}/messages`);
          const newMessageRef = push(messagesRef);
          await set(newMessageRef, message);
        } catch (storageError) {
          console.error('Storage error:', storageError);
          Alert.alert('Erro', 'Não foi possível enviar a imagem');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: 'user',
      timestamp: Date.now(),
      status: 'sent',
      type: 'text'
    };

    const messagesRef = ref(database, `chats/${chatId}/messages`);
    const newMessageRef = push(messagesRef);
    await set(newMessageRef, message);
    setNewMessage('');
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    const swipeableRef = useRef<Swipeable>(null);
    const messageOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, []);

    const renderReactions = () => {
      if (!item.reactions) return null;
      
      return (
        <View style={styles.reactionsContainer}>
          {Object.entries(item.reactions).map(([emoji, users]) => (
            <TouchableOpacity
              key={emoji}
              style={styles.reactionButton}
              onPress={() => handleReaction(item, emoji)}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
              <Text style={styles.reactionCount}>{users.length}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    };

    return (
      <Animated.View style={{ opacity: messageOpacity }}>
        <Swipeable
          ref={swipeableRef}
          renderRightActions={() => (
            <View style={styles.reactionActions}>
              {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.reactionAction}
                  onPress={() => {
                    handleReaction(item, emoji);
                    swipeableRef.current?.close();
                  }}
                >
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        >
          <View style={[
            styles.messageContainer,
            isUser ? styles.userMessage : styles.driverMessage
          ]}>
            {!isUser && (
              <Image
                source={{ uri: driverPhoto }}
                style={styles.driverAvatar}
              />
            )}
            <LinearGradient
              colors={isUser ? [colors.primary, colors.primaryDark] : [colors.card, colors.cardDark]}
              style={[
                styles.messageBubble,
                { backgroundColor: isUser ? colors.primary : colors.card }
              ]}
            >
              {item.type === 'image' && (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.messageImage}
                  resizeMode="cover"
                />
              )}
              {item.type === 'voice' && (
                <TouchableOpacity
                  style={styles.voiceMessage}
                  onPress={() => item.voiceUrl && playVoiceMessage(item.voiceUrl)}
                >
                  <Ionicons name="play" size={24} color={isUser ? '#FFFFFF' : colors.text} />
                  <View style={styles.voiceWaveform} />
                </TouchableOpacity>
              )}
              {item.type === 'location' && (
                <TouchableOpacity
                  style={styles.locationMessage}
                  onPress={() => openLocation(item.location)}
                >
                  <Ionicons name="location" size={24} color={isUser ? '#FFFFFF' : colors.text} />
                  <Text style={[styles.locationText, { color: isUser ? '#FFFFFF' : colors.text }]}>
                    {item.location?.address}
                  </Text>
                </TouchableOpacity>
              )}
              {item.type === 'text' && (
                <Text style={[
                  styles.messageText,
                  { color: isUser ? '#FFFFFF' : colors.text }
                ]}>
                  {item.text}
                </Text>
              )}
              <View style={styles.messageFooter}>
                <Text style={[
                  styles.messageTime,
                  { color: isUser ? 'rgba(255,255,255,0.7)' : colors.placeholder }
                ]}>
                  {new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {isUser && (
                  <Ionicons
                    name={item.status === 'read' ? 'checkmark-done' : 'checkmark'}
                    size={16}
                    color={item.status === 'read' ? '#4CAF50' : 'rgba(255,255,255,0.7)'}
                    style={styles.messageStatus}
                  />
                )}
              </View>
              {renderReactions()}
            </LinearGradient>
          </View>
        </Swipeable>
      </Animated.View>
    );
  };

  const getAccessibilityStyles = () => {
    return {
      text: {
        fontSize: fontSize,
        color: isHighContrast ? '#FFFFFF' : colors.text,
        backgroundColor: isHighContrast ? '#000000' : 'transparent',
      },
      container: {
        backgroundColor: isHighContrast ? '#000000' : colors.background,
      },
      button: {
        backgroundColor: isHighContrast ? '#FFFFFF' : colors.primary,
        borderWidth: isHighContrast ? 2 : 0,
        borderColor: isHighContrast ? '#FFFFFF' : 'transparent',
      }
    };
  };

  const accessibilityStyles = getAccessibilityStyles();

  const handleVoiceCommand = (command: string) => {
    if (!isVoiceControlEnabled) return;

    switch (command.toLowerCase()) {
      case 'enviar mensagem':
        sendMessage();
        break;
      case 'gravar áudio':
        startRecording();
        break;
      case 'parar gravação':
        stopRecording();
        break;
      case 'compartilhar localização':
        shareLocation();
        break;
      case 'aumentar fonte':
        setFontSize(prev => Math.min(prev + 2, 24));
        break;
      case 'diminuir fonte':
        setFontSize(prev => Math.max(prev - 2, 12));
        break;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, accessibilityStyles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <BlurView intensity={100} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Voltar"
          accessibilityHint="Retorna para a tela anterior"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={accessibilityStyles.text.color} />
        </TouchableOpacity>
        <Image
          source={{ uri: driverPhoto }}
          style={[styles.headerAvatar, { backgroundColor: 'gray'}]}
          accessibilityLabel={`Foto de perfil de ${driverName}`}
        />
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, accessibilityStyles.text]}>
            {driverName}
          </Text>
          <Text style={[styles.headerStatus, { color: accessibilityStyles.button.backgroundColor }]}>
            {isTyping ? 'Digitando...' : 'Online'}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.headerButton]}
          accessibilityLabel="Ligar"
          accessibilityHint="Inicia uma chamada de voz"
          accessibilityRole="button"
        >
          <Ionicons name="call" size={24} color={accessibilityStyles.text.color} />
        </TouchableOpacity>
      </BlurView>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
        accessibilityLabel="Lista de mensagens"
        accessibilityHint="Rolagem vertical para ver todas as mensagens"
      />

      <BlurView intensity={100} style={styles.inputContainer}>
        <TouchableOpacity 
          style={[styles.attachmentButton]}
          onPress={pickImage}
          accessibilityLabel="Anexar imagem"
          accessibilityHint="Selecione uma imagem para enviar"
          accessibilityRole="button"
        >
          <Ionicons name="attach" size={24} color={accessibilityStyles.text.color} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.locationButton]}
          onPress={shareLocation}
          accessibilityLabel="Compartilhar localização"
          accessibilityHint="Envia sua localização atual"
          accessibilityRole="button"
        >
          <Ionicons name="location" size={24} color={accessibilityStyles.text.color} />
        </TouchableOpacity>

        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: accessibilityStyles.container.backgroundColor,
              color: accessibilityStyles.text.color,
              borderColor: accessibilityStyles.text.color,
              fontSize: fontSize
            }
          ]}
          placeholder="Digite sua mensagem..."
          placeholderTextColor={accessibilityStyles.text.color}
          value={newMessage}
          onChangeText={(text) => {
            setNewMessage(text);
            handleTyping();
          }}
          multiline
          accessibilityLabel="Campo de mensagem"
          accessibilityHint="Digite sua mensagem aqui"
        />

        {newMessage.trim() ? (
          <TouchableOpacity
            style={[styles.sendButton, accessibilityStyles.button]}
            onPress={sendMessage}
            accessibilityLabel="Enviar mensagem"
            accessibilityHint="Envia a mensagem digitada"
            accessibilityRole="button"
          >
            <Ionicons name="send" size={24} color={accessibilityStyles.container.backgroundColor} />
          </TouchableOpacity>
        ) : (
          <Pressable
            style={[styles.voiceButton, accessibilityStyles.button]}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            accessibilityLabel={isRecording ? "Parar gravação" : "Gravar mensagem de voz"}
            accessibilityHint={isRecording ? "Solte para parar a gravação" : "Segure para gravar uma mensagem de voz"}
            accessibilityRole="button"
          >
            <Ionicons 
              name={isRecording ? "mic" : "mic-outline"} 
              size={24} 
              color={accessibilityStyles.container.backgroundColor} 
            />
          </Pressable>
        )}
      </BlurView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: scale(8),
    borderRadius: 20,
  },
  headerAvatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    marginRight: scale(12),
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: scale(16),
    fontWeight: '600',
  },
  headerStatus: {
    fontSize: scale(12),
  },
  headerButton: {
    padding: scale(8),
    borderRadius: 20,
  },
  messagesList: {
    padding: scale(16),
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: scale(16),
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  driverMessage: {
    alignSelf: 'flex-start',
  },
  driverAvatar: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    marginRight: scale(8),
  },
  messageBubble: {
    padding: scale(12),
    borderRadius: scale(16),
    borderTopLeftRadius: scale(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: scale(16),
    lineHeight: scale(24),
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(4),
  },
  messageTime: {
    fontSize: scale(12),
  },
  messageStatus: {
    marginLeft: scale(4),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(12),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  attachmentButton: {
    padding: scale(8),
    borderRadius: 20,
  },
  locationButton: {
    padding: scale(8),
    borderRadius: 20,
  },
  input: {
    flex: 1,
    minHeight: scale(40),
    maxHeight: scale(100),
    borderRadius: scale(20),
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    marginHorizontal: scale(8),
    borderWidth: 1,
  },
  sendButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  voiceWaveform: {
    width: 100,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    marginLeft: 8,
  },
  locationMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 4,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reactionEmoji: {
    fontSize: 16,
  },
  reactionCount: {
    fontSize: 12,
    marginLeft: 4,
  },
  reactionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  reactionAction: {
    padding: 8,
  },
}); 