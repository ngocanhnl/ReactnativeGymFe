import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { List, Searchbar, Avatar, Text, Surface, Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Apis, { authApis, endpoints } from '../../configs/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../firebase';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [unreadMessages, setUnreadMessages] = useState({});
    const [lastMessageTime, setLastMessageTime] = useState({});
    const navigation = useNavigation();

    const loadStudents = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await authApis(token).get(endpoints['get_students']);
            setStudents(res.data);
        } catch (error) {
            console.error('Error loading students:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
    }, []);

    // Listen for unread messages
    useEffect(() => {
        const unsubscribes = students.map(student => {
            const q = query(
                collection(db, 'support-userId', String(student.id), 'message'),
                orderBy('timestamp', 'desc'),
                where('isRead', '==', false)
            );

            // Listen for unread messages
            const unsubscribeUnread = onSnapshot(q, (snapshot) => {
                setUnreadMessages(prev => ({
                    ...prev,
                    [student.id]: !snapshot.empty
                }));
            });

            // Listen for last message time
            const qAll = query(
                collection(db, 'support-userId', String(student.id), 'message'),
                orderBy('timestamp', 'desc'),
            );
            const unsubscribeLastMsg = onSnapshot(qAll, (snapshot) => {
                if (!snapshot.empty) {
                    const latestMsg = snapshot.docs[0].data();
                    setLastMessageTime(prev => ({
                        ...prev,
                        [student.id]: latestMsg.timestamp ? latestMsg.timestamp.toMillis ? latestMsg.timestamp.toMillis() : latestMsg.timestamp.seconds * 1000 : 0
                    }));
                } else {
                    setLastMessageTime(prev => ({
                        ...prev,
                        [student.id]: 0
                    }));
                }
            });

            return () => {
                unsubscribeUnread();
                unsubscribeLastMsg();
            };
        });

        return () => {
            unsubscribes.forEach(unsubscribe => unsubscribe());
        };
    }, [students]);

    const filteredStudents = students
        .filter(student => 
            student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            // Học sinh có tin nhắn chưa đọc lên đầu
            const aUnread = unreadMessages[a.id] ? 1 : 0;
            const bUnread = unreadMessages[b.id] ? 1 : 0;
            if (bUnread !== aUnread) return bUnread - aUnread;
            // Nếu cùng trạng thái, sắp xếp theo thời gian nhắn tin gần nhất (mới nhất lên đầu)
            const aTime = lastMessageTime[a.id] || 0;
            const bTime = lastMessageTime[b.id] || 0;
            return bTime - aTime;
        });

    const renderStudentItem = ({ item }) => (
        console.log(item),
        <Surface style={styles.studentCard}>
            <List.Item
                title={`${item.first_name} ${item.last_name}`}
                description={item.email}
                left={props => (
                    <View style={styles.avatarContainer}>
                        <Avatar.Image
                            {...props}
                            size={50}
                            source={{ uri: item.avatar || 'https://i.pravatar.cc/300' }}
                            style={styles.avatar}
                        />
                        {unreadMessages[item.id] && (
                            <View style={styles.unreadDot} />
                        )}
                    </View>
                )}
                onPress={() => navigation.navigate('SupportChat', { userId: item.id })}
                style={styles.studentItem}
            />
        </Surface>
    );

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Danh sách học viên" />
            </Appbar.Header>

            <Searchbar
                placeholder="Tìm kiếm học viên..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
            />
            <FlatList
                data={filteredStudents}
                renderItem={renderStudentItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {loading ? 'Đang tải...' : 'Không tìm thấy học viên nào'}
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    searchBar: {
        margin: 16,
        elevation: 2,
    },
    listContainer: {
        padding: 16,
    },
    studentCard: {
        marginBottom: 12,
        borderRadius: 12,
        elevation: 2,
    },
    studentItem: {
        paddingVertical: 8,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 8,
    },
    avatar: {
        marginRight: 8,
    },
    unreadDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#ff0000',
        borderWidth: 2,
        borderColor: '#fff',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default StudentList; 