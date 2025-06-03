import { useContext, useState } from "react";
import { MyDispatchContext, MyUserContext } from "../../configs/Contexts";
import { Text, View, StyleSheet, ScrollView, Image, TouchableOpacity, RefreshControl } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { useEffect } from "react";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  Button, 
  Avatar, 
  Divider, 
  Card, 
  Title, 
  Paragraph, 
  List, 
  IconButton, 
  Menu, 
  Appbar 
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Profile = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const nav = useNavigation();
    const [menuVisible, setMenuVisible] = useState(false);
    const [infoExpanded, setInfoExpanded] = useState(false);
    const [appointmentExpanded, setAppointmentExpanded] = useState(false);
    const [apoinment, setApoinment] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadApoinment();
        setRefreshing(false);
    };
   
    
    const loadApoinment = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
        //   const res = await Apis.get(endpoints['myApoinment'](user.id));
        const res = await authApis(token).get(endpoints['myApoinment'](user.id));
        // console.log("res:", res.data);
            const formatted = res.data.map(item => ({
                date: item.date,
                teacherName: item.teacher.first_name,
                time: item.time,
                note: item.note,
                studentName: item.student.first_name + " " + item.student.last_name
            }));

            // console.log("formatted:", formatted);
        
            setApoinment(formatted);
          
        } catch (err) {
          console.error('Lỗi khi tải user:', err);
          setError('Không thể tải user.');
        }
      }
     useEffect(() => {
        loadApoinment();
      }, [user.id]);

      console.log("user:", user);
      console.log("apoinment:", apoinment);
    const logout = () => {
        dispatch({
            "type": "logout"
        });
        nav.navigate('index');
    };

    const handleEditProfile = () => {
        nav.navigate('EditProfile');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => nav.goBack()} />
                <Appbar.Content title="Hồ sơ cá nhân" />
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                        <Appbar.Action icon="dots-vertical" onPress={() => setMenuVisible(true)} />
                    }
                >
                    <Menu.Item onPress={handleEditProfile} title="Chỉnh sửa hồ sơ" />
                    <Menu.Item onPress={() => nav.navigate('Settings')} title="Cài đặt" />
                    <Divider />
                    <Menu.Item onPress={logout} title="Đăng xuất" />
                </Menu>
            </Appbar.Header>

            <ScrollView 
                style={styles.scrollView} 
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            
            >
                <View style={styles.profileHeader}>
                    <View style={styles.coverImageContainer}>
                        <Image 
                            source={{ uri: user.coverImage || 'https://images.unsplash.com/photo-1553095066-5014bc7b7f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8d2FsbCUyMGJhY2tncm91bmR8ZW58MHx8MHx8&w=1000&q=80' }} 
                            style={styles.coverImage}
                        />
                    </View>
                    
                    <View style={styles.avatarContainer}>
                        <Avatar.Image 
                            size={100} 
                            source={{ uri: user.avatar || 'https://i.pravatar.cc/300' }} 
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.editAvatarButton} onPress={handleEditProfile}>
                            <Icon name="camera" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.profileInfo}>
                        <Text style={[MyStyles.subject, styles.profileName]}>Chào {user.first_name +" "+ user.last_name}!</Text>
                        <Button 
                            mode="outlined" 
                            onPress={handleEditProfile}
                            style={styles.editButton}
                            icon="account-edit"
                        >
                            Chỉnh sửa thông tin
                        </Button>
                    </View>
                </View>

                <Divider />

                <View style={styles.infoSection}>
                    <List.Item
                        title="Thông tin cá nhân"
                        left={props => <List.Icon {...props} icon="account-details" />}
                        right={props => <List.Icon {...props} icon={infoExpanded ? "chevron-up" : "chevron-down"} />}
                        onPress={() => setInfoExpanded(!infoExpanded)}
                    />
                    {infoExpanded && (
                        <Card style={styles.infoCard}>
                            <Card.Content>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Email:</Text>
                                    <Text style={styles.infoValue}>{user.email || 'Chưa cập nhật'}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Số điện thoại:</Text>
                                    <Text style={styles.infoValue}>{user.phone_number || 'Chưa cập nhật'}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Ngày tham gia:</Text>
                                    <Text style={styles.infoValue}>{user.joinDate || 'Chưa có thông tin'}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Vai trò:</Text>
                                    <Text style={styles.infoValue}>{user.role || 'Thành viên'}</Text>
                                </View>
                            </Card.Content>
                        </Card>
                    )}
                </View>

                <Divider />

                {/* Phần hiển thị hoạt động gần đây */}
                <View style={styles.section}>
                    <Title style={styles.sectionTitle}>Hoạt động gần đây</Title>
                    
                    {user.activities && user.activities.length > 0 ? (
                        user.activities.map((activity, index) => (
                            <Card key={index} style={styles.card}>
                                <Card.Content>
                                    <Title>{activity.title || 'Hoạt động'}</Title>
                                    <Paragraph>{activity.description || 'Không có mô tả'}</Paragraph>
                                    <Text style={styles.timeText}>{activity.time || 'Không xác định'}</Text>
                                </Card.Content>
                                <Card.Actions>
                                    <Button onPress={() => console.log('Xem chi tiết')}>Xem chi tiết</Button>
                                </Card.Actions>
                            </Card>
                        ))
                    ) : (
                        <Card style={styles.card}>
                            <Card.Content>
                                <Paragraph>Chưa có hoạt động nào gần đây</Paragraph>
                            </Card.Content>
                        </Card>
                    )}
                </View>

                <Divider />

                {/* Phần hiển thị danh sách lịch hẹn */}
                <List.Section>
                    <List.Item
                        title="Danh sách lịch hẹn"
                        description={`${apoinment.length} lịch hẹn`}
                        left={props => <List.Icon {...props} icon="calendar-clock" />}
                        right={props => <List.Icon {...props} icon={appointmentExpanded ? "chevron-up" : "chevron-down"} />}
                        onPress={() => setAppointmentExpanded(!appointmentExpanded)}
                    />
                    
                    {/* Hiển thị danh sách lịch hẹn */}
                    {appointmentExpanded && apoinment.length > 0 && (
                        <Card style={styles.appointmentCard}>
                            <Card.Content>
                                {apoinment.map((appointment, index) => (
                                    <View key={index} style={styles.appointmentItem}>
                                        <View style={styles.appointmentContent}>
                                            <Text style={styles.appointmentDate}>
                                                {formatDate(appointment.date)}
                                            </Text>
                                            <Text style={styles.appointmentTime}>
                                                Thời gian: {appointment.time || 'Chưa xác định'}
                                            </Text>
                                            <Text style={styles.appointmentUser}>
                                                {/* Học viên: {user.first_name} {user.last_name} */}
                                                Học viên: {appointment.studentName}
                                            </Text>
                                            <Text style={styles.appointmentTeacher}>
                                                Giáo viên: {appointment.teacherName}
                                            </Text>
                                            {appointment.note && (
                                                <Text style={styles.appointmentNote}>
                                                    Ghi chú: {appointment.note}
                                                </Text>
                                            )}
                                        </View>
                                        <Icon name="school" size={20} color="#6200ee" />
                                    </View>
                                ))}
                            </Card.Content>
                        </Card>
                    )}
                </List.Section>

                <View style={styles.logoutButtonContainer}>
                    <Button 
                        onPress={logout} 
                        mode="outlined" 
                        style={[MyStyles.m, styles.logoutButton]} 
                        icon="logout"
                    >
                        Đăng xuất
                    </Button>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2025 - Phiên bản 1.0.0</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
    },
    profileHeader: {
        position: 'relative',
        marginBottom: 70,
    },
    coverImageContainer: {
        height: 180,
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    avatarContainer: {
        position: 'absolute',
        alignSelf: 'center',
        bottom: -50,
    },
    avatar: {
        borderWidth: 4,
        borderColor: 'white',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#6200ee',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInfo: {
        paddingTop: 60,
        paddingBottom:60,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    profileName: {
        fontSize: 22,
        marginBottom: 5,
    },
    profileUsername: {
        fontSize: 16,
        color: '#777',
        marginBottom: 8,
    },
    profileBio: {
        alignItems: 'center',
        marginBottom: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginVertical: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 14,
        color: '#777',
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    editButton: {
        marginTop: 10,
        borderRadius: 20,
    },
    shareButton: {
        marginLeft: 8,
    },
    infoSection: {
        backgroundColor: 'white',
        paddingVertical: 8,
    },
    infoCard: {
        margin: 16,
        elevation: 1,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    infoLabel: {
        fontWeight: 'bold',
        color: '#555',
        flex: 1,
    },
    infoValue: {
        color: '#333',
        flex: 2,
        textAlign: 'right',
    },
    section: {
        paddingHorizontal: 16,
        paddingVertical: 24,
        backgroundColor: 'white',
    },
    sectionTitle: {
        marginBottom: 16,
    },
    card: {
        marginBottom: 16,
    },
    timeText: {
        fontSize: 12,
        color: '#777',
        marginTop: 8,
    },
    logoutButtonContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        alignItems: 'center',
    },
    logoutButton: {
        width: '70%',
    },
    footer: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    footerText: {
        color: '#777',
    },
    appointmentCard: {
        margin: 16,
        elevation: 2,
    },
    appointmentTitle: {
        fontSize: 16,
        marginBottom: 12,
        color: '#6200ee',
    },
    appointmentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    appointmentContent: {
        flex: 1,
    },
    appointmentDate: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    appointmentTime: {
        fontSize: 13,
        color: '#FF9800',
        marginTop: 2,
        fontWeight: '500',
    },
    appointmentUser: {
        fontSize: 13,
        color: '#2196F3',
        marginTop: 2,
    },
    appointmentTeacher: {
        fontSize: 13,
        color: '#777',
        marginTop: 2,
    },
    appointmentNote: {
        fontSize: 12,
        color: '#4CAF50',
        marginTop: 2,
        fontStyle: 'italic',
    },
    moreAppointments: {
        fontSize: 13,
        color: '#6200ee',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 8,
    },
});

export default Profile;