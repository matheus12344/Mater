import React, { useState } from 'react';
import { FlatList, View, TextInput, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { CommunityPost } from '../types/index';
import { Ionicons } from '@expo/vector-icons';


const CommunityScreen = () => {
  const { colors } = useTheme();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState('');

  const renderPost = ({ item }: { item: CommunityPost }) => (
    <View style={[styles.postCard, { backgroundColor: colors.card }]}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.user.profileImage }} style={styles.avatar} />
        <Text style={[styles.userName, { color: colors.text }]}>{item.user.name}</Text>
      </View>
      <Text style={[styles.postContent, { color: colors.text }]}>{item.content}</Text>
      {item.routeSnapshot && (
        <Image source={{ uri: item.routeSnapshot }} style={styles.routeImage} />
      )}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={20} color={colors.text} />
          <Text style={[styles.actionText, { color: colors.text }]}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
          <Text style={[styles.actionText, { color: colors.text }]}>{item.comments.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={[styles.newPostContainer, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.postInput, { color: colors.text }]}
              placeholder="Compartilhe sua experiência..."
              value={newPost}
              onChangeText={setNewPost}
            />
            <TouchableOpacity style={styles.postButton}>
              <Ionicons name="send" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

export default CommunityScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    postCard: {
        padding: 16,
        borderRadius: 10,
        marginHorizontal: 16,
        marginVertical: 8,
    }, 
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    }, 
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    postContent: {
        fontSize: 14,
    }, 
    routeImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginTop: 8,
    },
    postActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    actionButton: {
        flexDirection: 'row',   
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontSize: 12,
    }, 
    newPostContainer: {
        padding: 16,
        borderRadius: 10,
        marginHorizontal: 16,
        marginVertical: 8,
    }, 
    postInput: {
        flex: 1,
        padding: 10,
        borderRadius: 20,
        marginRight: 8,
    }, 
    postButton: {
        padding: 10,
        borderRadius: 20,
        marginLeft: 8,
    }, 
});
