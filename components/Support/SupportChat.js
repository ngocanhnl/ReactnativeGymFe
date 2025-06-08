import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, IconButton, Text, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Appbar } from 'react-native-paper';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useContext } from 'react';
import { MyUserContext } from '../../configs/Contexts';
import { db, auth, app} from '../../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from '../../configs/Apis';


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


const SupportChat = ({route}) => {
    
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const navigation = useNavigation();
    const user = useContext(MyUserContext);
    const scrollViewRef = useRef();
    const {userId} = route.params;
    
    console.log(userId);
    useEffect(() => {
        const q = query(collection(db, 'support-userId', String(userId), 'message'), orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(newMessages);
        });

        return () => unsubscribe();
    }, []);

    const sendMessage = async () => {
        if (message.trim() === '') return;

        try {
            const token = await AsyncStorage.getItem('token');
            if(user.role === 'hoc-vien'){
              
                await authApis(token).post(endpoints['user_message'],{
                    text: message,
                })
            }
            else{
                await authApis(token).post(endpoints['user_message'],{
                    text: message,
                    user_id: userId,
                })
            }
            await addDoc(collection(db, 'support-userId', String(userId), 'message'), {
                text: message,
                sender: user.id,
                senderName: `${user.first_name} ${user.last_name}`,
                timestamp: serverTimestamp(),
                isAdmin: false
            });
            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Hỗ trợ trực tuyến" />
            </Appbar.Header>

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={80}
            >
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
                >
                    {messages.map((msg, index) => (
                        <View
                            key={index}
                            style={[
                                styles.messageContainer,
                                msg.sender === user.id ? styles.sentMessage : styles.receivedMessage
                            ]}
                        >
                            <Surface 
                                style={[
                                    styles.messageBubble,
                                    msg.sender === user.id ? styles.sentBubble : styles.receivedBubble
                                ]}
                            >
                                {!msg.isAdmin && msg.sender !== user.id && (
                                    <Text style={styles.senderName}>{msg.senderName}</Text>
                                )}
                                <Text 
                                    style={[
                                        styles.messageText,
                                        msg.sender === user.id ? styles.sentMessageText : styles.receivedMessageText
                                    ]}
                                >
                                    {msg.text}
                                </Text>
                                <Text 
                                    style={[
                                        styles.messageTime,
                                        msg.sender === user.id ? styles.sentMessageTime : styles.receivedMessageTime
                                    ]}
                                >
                                    {formatTime(msg.timestamp)}
                                </Text>
                            </Surface>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Nhập tin nhắn..."
                        multiline
                    />
                    <IconButton
                        icon="send"
                        size={24}
                        onPress={sendMessage}
                        disabled={!message.trim()}
                        style={styles.sendButton}
                    />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    messagesContainer: {
        flex: 1,
        padding: 16,
    },
    messageContainer: {
        marginBottom: 8,
        maxWidth: '80%',
        paddingHorizontal: 8,
    },
    sentMessage: {
        alignSelf: 'flex-end',
    },
    receivedMessage: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        padding: 12,
        borderRadius: 20,
        elevation: 1,
        maxWidth: '100%',
    },
    sentBubble: {
        backgroundColor: '#0084ff',
        borderTopRightRadius: 4,
    },
    receivedBubble: {
        backgroundColor: '#f0f0f0',
        borderTopLeftRadius: 4,
    },
    senderName: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    sentMessageText: {
        color: 'white',
    },
    receivedMessageText: {
        color: '#333',
    },
    messageTime: {
        fontSize: 10,
        marginTop: 4,
    },
    sentMessageTime: {
        color: 'rgba(255, 255, 255, 0.7)',
        alignSelf: 'flex-end',
    },
    receivedMessageTime: {
        color: '#666',
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 8,
        backgroundColor: 'white',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    input: {
        flex: 1,
        marginRight: 8,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        maxHeight: 100,
    },
    sendButton: {
        margin: 0,
    },
});

export default SupportChat; 