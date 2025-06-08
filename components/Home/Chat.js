import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { TextInput, Button, Avatar, Card, Title, Text, ActivityIndicator, IconButton, Appbar, useTheme } from 'react-native-paper';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, push, serverTimestamp } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { addDoc, serverTimestamp as fsTimestamp } from 'firebase/firestore';
import { useContext } from "react";
import { MyDispatchContext, MyUserContext } from "../../configs/Contexts";
import { db, auth, app} from '../../firebase';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBHI91Pupwnx5Sck8M9E7Y1Uskn1ASe6Js",
  authDomain: "courseapp-9ea1e.firebaseapp.com",
  databaseURL: "https://courseapp-9ea1e-default-rtdb.firebaseio.com/",
  projectId: "courseapp-9ea1e",
  storageBucket: "courseapp-9ea1e.appspot.com",
  messagingSenderId: "1093403127439",
  appId: "1:1093403127439:web:09ac3a8d9a20a2f1d60afa",
  measurementId: "G-F6YVGLMCN3"
};

// Initialize Firebase
// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);
// const auth = getAuth(app);
// const db = getFirestore(app);


const MESSAGES_PER_PAGE = 10;

const GroupChatScreen = ({ route, navigation }) => {
  const user = useContext(MyUserContext);
  const groupId = route?.params?.groupId ?? 2;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const flatListRef = useRef();
  const theme = useTheme();
  
  const currentUser = auth.currentUser || {
    uid: user.id,
    displayName: user.first_name,
    photoURL: user.avatar
  };

  // Load initial messages (newest first)
  const loadInitialMessages = async () => {
    try {
      setLoading(true);
      const messagesRef = collection(db, 'groups', String(groupId), 'messages');
      const q = query(
        messagesRef,
        orderBy('timestamp', 'desc'),
        limit(MESSAGES_PER_PAGE)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setMessages([]);
        setHasMore(false);
      } else {
        const messageList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setMessages(messageList);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length === MESSAGES_PER_PAGE);
      }
    } catch (error) {
      console.error('Error loading initial messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load older messages when scrolling up
  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore || !lastVisible) return;
    
    try {
      setLoadingMore(true);
      const messagesRef = collection(db, 'groups', String(groupId), 'messages');
      const q = query(
        messagesRef,
        orderBy('timestamp', 'desc'),
        startAfter(lastVisible),
        limit(MESSAGES_PER_PAGE)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setHasMore(false);
      } else {
        const newMessages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setMessages(prevMessages => [...prevMessages, ...newMessages]);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length === MESSAGES_PER_PAGE);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Listen for new messages
  useEffect(() => {
    const messagesRef = collection(db, 'groups', String(groupId), 'messages');
    const q = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const newDoc = snapshot.docs[0];
        const newData = newDoc.data();
        
        if (newData.timestamp) {
          const newMsg = { id: newDoc.id, ...newData };
          
          setMessages(currentMessages => {
            if (!currentMessages.some(msg => msg.id === newMsg.id)) {
              return [newMsg, ...currentMessages];
            }
            return currentMessages;
          });
        }
      }
    });

    return () => unsubscribe();
  }, [groupId]);

  // Load initial messages on mount
  useEffect(() => {
    loadInitialMessages();
  }, [groupId]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;
  
    try {
      const messagesRef = collection(db, 'groups', String(groupId), 'messages');
      await addDoc(messagesRef, {
        text: newMessage,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userAvatar: currentUser.photoURL,
        timestamp: fsTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const isCurrentUser = item.userId === currentUser.uid;
    const getTimeFromTimestamp = (timestamp) => {
      if (!timestamp) return 'Đang gửi...';
    
      // Nếu là Firestore Timestamp
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    
      // Nếu là string
      if (typeof timestamp === 'string') {
        const [datePart, timePart] = timestamp.split(' at ');
        const parsedDate = new Date(`${datePart} ${timePart}`);
        return parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    
      return 'Không xác định';
    };
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        {!isCurrentUser && (
          <Avatar.Image 
            size={36} 
            source={item.userAvatar ? { uri: item.userAvatar } : "https://res.cloudinary.com/darr5at86/image/upload/v1745901506/wbrnsevb8n7sc6m4dyro.png"}
            style={styles.avatar}
          />
        )}
        <View style={[
          styles.messageBubble, 
          { backgroundColor: isCurrentUser ? theme.colors.primary : theme.colors.surfaceVariant }
        ]}>
          {!isCurrentUser && (
            <Text style={styles.userName}>{item.userName}</Text>
          )}
          <Text style={{ color: isCurrentUser ? 'white' : theme.colors.onSurfaceVariant }}>
            {item.text}
          </Text>
          <Text style={[styles.timestamp, { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : theme.colors.onSurfaceDisabled }]}>
            {getTimeFromTimestamp(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            inverted={true}
          />
        )}
  
        <View style={styles.inputWrapper}>
          <TextInput
            mode="outlined"
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Nhập tin nhắn..."
            style={styles.input}
            right={
              <TextInput.Icon
                icon="send"
                onPress={sendMessage}
                disabled={newMessage.trim() === ''}
              />
            }
            onSubmitEditing={sendMessage}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingFooter: {
    padding: 10,
    alignItems: 'center',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  currentUserMessage: {
    justifyContent: 'flex-end',
  },
  otherUserMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    elevation: 1,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 12,
  },
  timestamp: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputWrapper: {
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    backgroundColor: 'white',
  },
});

export default GroupChatScreen;

