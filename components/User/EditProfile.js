import React, { useState, useContext } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button, Avatar, Appbar } from 'react-native-paper';
import { MyUserContext, MyDispatchContext } from '../../configs/Contexts';
import { useNavigation } from '@react-navigation/native';
import Apis, { authApis, endpoints } from '../../configs/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const EditProfile = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || null,
    });

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                setFormData(prev => ({
                    ...prev,
                    avatar: result.assets[0].uri
                }));
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
        }
    };

    const handleUpdateProfile = async () => {
        if (!formData.first_name.trim() || !formData.last_name.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ họ và tên');
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                navigation.navigate('login');
                return;
            }

            // Tạo FormData để gửi ảnh
            const formDataToSend = new FormData();
            formDataToSend.append('first_name', formData.first_name);
            formDataToSend.append('last_name', formData.last_name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phone', formData.phone);

            if (formData.avatar && formData.avatar !== user.avatar) {
                const imageUri = formData.avatar;
                const filename = imageUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image';

                formDataToSend.append('avatar', {
                    uri: imageUri,
                    name: filename,
                    type
                });
            }

            const response = await authApis(token).patch(endpoints['update-profile'], formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data) {
                dispatch({
                    type: "update-user",
                    payload: response.data
                });
                Alert.alert('Thành công', 'Cập nhật thông tin thành công');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật thông tin. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Chỉnh sửa thông tin" />
            </Appbar.Header>

            <ScrollView style={styles.scrollView}>
                <View style={styles.avatarContainer}>
                    <Avatar.Image
                        size={120}
                        source={{ uri: formData.avatar || 'https://i.pravatar.cc/300' }}
                    />
                    <TouchableOpacity style={styles.changeAvatarButton} onPress={pickImage}>
                        <Button mode="contained" icon="camera">
                            Thay đổi ảnh
                        </Button>
                    </TouchableOpacity>
                </View>

                <View style={styles.formContainer}>
                    <TextInput
                        label="Họ"
                        value={formData.last_name}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, last_name: text }))}
                        style={styles.input}
                        mode="outlined"
                    />

                    <TextInput
                        label="Tên"
                        value={formData.first_name}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, first_name: text }))}
                        style={styles.input}
                        mode="outlined"
                    />

                    <TextInput
                        label="Email"
                        value={formData.email}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                        style={styles.input}
                        mode="outlined"
                        keyboardType="email-address"
                        
                    />

                    <TextInput
                        label="Số điện thoại"
                        value={formData.phone}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                        style={styles.input}
                        mode="outlined"
                        keyboardType="phone-pad"
                    />

                    <Button
                        mode="contained"
                        onPress={handleUpdateProfile}
                        loading={loading}
                        disabled={loading}
                        style={styles.updateButton}
                    >
                        Cập nhật thông tin
                    </Button>
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
    avatarContainer: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        marginBottom: 20,
    },
    changeAvatarButton: {
        marginTop: 10,
    },
    formContainer: {
        padding: 20,
    },
    input: {
        marginBottom: 15,
        backgroundColor: 'white',
    },
    updateButton: {
        marginTop: 20,
        paddingVertical: 8,
    },
});

export default EditProfile; 