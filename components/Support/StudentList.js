import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { List, Searchbar, Avatar, Text, Surface, Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Apis, { authApis, endpoints } from '../../configs/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
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
    console.log(students);

    const filteredStudents = students.filter(student => 
        student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderStudentItem = ({ item }) => (
        <Surface style={styles.studentCard}>
            <List.Item
                title={`${item.first_name} ${item.last_name}`}
                description={item.email}
                left={props => (
                    <Avatar.Image
                        {...props}
                        size={50}
                        source={{ uri: item.avatar || 'https://i.pravatar.cc/300' }}
                        style={styles.avatar}
                    />
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
    avatar: {
        marginRight: 8,
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