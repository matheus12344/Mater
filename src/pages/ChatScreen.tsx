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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { database } from '../services/firebase';
import { ref, onValue, push, set, off } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { scale } from 'react-native-size-matters';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'driver';
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image';
  imageUrl?: string;
}

export default function ChatScreen({ navigation, route }: any) {
  const { theme, colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const driverName = route?.params?.driverName || 'Motorista';
  const driverPhoto = route?.params?.driverPhoto || 'https://via.placeholder.com/150';
  const chatId = `chat_${route.params.serviceId}`;

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

  const sendMessage = async () => {
    if (newMessage.trim()) {
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
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const storage = getStorage();
      const imageRef = storageRef(storage, `chats/${chatId}/${Date.now()}.jpg`);
      
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
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
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
        <View style={[
          styles.messageBubble,
          { backgroundColor: isUser ? colors.primary : colors.card }
        ]}>
          {item.type === 'image' ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          ) : (
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
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Image
          source={{ uri: driverPhoto }}
          style={[styles.headerAvatar, { backgroundColor: 'gray'}]}
        />
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: colors.text }]}>
            {driverName}
          </Text>
          <Text style={[styles.headerStatus, { color: colors.primary }]}>
            {isTyping ? 'Digitando...' : 'Online'}
          </Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="call" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={styles.attachmentButton}
          onPress={pickImage}
        >
          <Ionicons name="attach" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.border
            }
          ]}
          placeholder="Digite sua mensagem..."
          placeholderTextColor={colors.placeholder}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: newMessage.trim() ? colors.primary : colors.border }
          ]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons
            name="send"
            size={24}
            color={newMessage.trim() ? '#FFFFFF' : colors.placeholder}
          />
        </TouchableOpacity>
      </View>
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
  },
  backButton: {
    padding: scale(8),
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
  },
  messageText: {
    fontSize: scale(16),
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
  },
  attachmentButton: {
    padding: scale(8),
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
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
}); 