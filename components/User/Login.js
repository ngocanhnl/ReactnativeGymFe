import { Image, ScrollView, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { Button, HelperText, TextInput } from "react-native-paper";
import { use, useContext, useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyDispatchContext } from "../../configs/Contexts";
import { auth, db  } from '../../firebase'; 
import { signInWithEmailAndPassword } from 'firebase/auth';


const Login = () => {
    const info = [{
        label: 'Tên đăng nhập',
        field: 'username',
        secureTextEntry: false,
        icon: "account"
    }, {
        label: 'Mật khẩu',
        field: 'password',
        secureTextEntry: true,
        icon: "eye"
    }];
    const [user, setUser] = useState({});
    const [msg, setMsg] = useState();
    const [loading, setLoading] = useState(false);
    const dispatch = useContext(MyDispatchContext);
    const nav = useNavigation();

    const setState = (value, field) => {
        setUser({...user, [field]: value});
    }

    const validate = () => {
        if (Object.values(user).length === 0) {
            setMsg("Vui lòng nhập thông tin!");
            return false;
        }

        for (let i of info)
            if (user[i.field] === '') {
                setMsg(`Vui lòng nhập ${i.label}`);
                return false;
            }
       
        setMsg("");
        return true;
    }

    const login = async () => {
        if (validate() === true) {
            try {
                setLoading(true);

                let res = await Apis.post(endpoints['login'], {
                    ...user,
                    client_id: "N3vOHYgGsAPbZ76MGAnple30Aj7tFeaSqeNNAnN5",
                    client_secret: "QDzrpDntJISoSUDMCnDccfViL4OEaWMkOFtrogawXbHWXBcnghFg5HaywGGk61eY0X2zmSSKu1VNOoq1iX4Vd3BQvVUYZ6oHwMmSNZiWrveBYOUDYUrvYbxc7LoEuYe8",
                    grant_type: "password"
                });
                await AsyncStorage.setItem('token', res.data.access_token);
                

                let u = await authApis(res.data.access_token).get(endpoints['current-user']);
                await AsyncStorage.setItem('user-detail', JSON.stringify(u.data));
                // console.info('userLogin',u.data);

                dispatch({
                    "type": "login",
                    "payload": u.data
                });
                signInWithEmailAndPassword(auth, u.data.username, u.data.password)
                .then((userCredential) => {
                    nav.navigate('index', {user_id:userCredential.user.uid});
                })
           


              
                // nav.navigate('index');
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Đăng nhập</Text>
                <Text style={styles.headerSubtitle}>Chào mừng bạn quay trở lại</Text>
            </View>

            <View style={styles.formContainer}>
                <HelperText type="error" visible={msg} style={styles.errorText}>{msg}</HelperText>

                {info.map(i => (
                    <TextInput
                        key={`Login${i.field}`}
                        value={user[i.field]}
                        onChangeText={t => setState(t, i.field)}
                        label={i.label}
                        style={styles.input}
                        secureTextEntry={i.secureTextEntry}
                        right={<TextInput.Icon icon={i.icon} />}
                        mode="outlined"
                    />
                ))}
                
                <Button
                    disabled={loading}
                    loading={loading}
                    onPress={login}
                    mode="contained"
                    style={styles.loginButton}
                    labelStyle={styles.loginButtonText}
                >
                    Đăng nhập
                </Button>

                <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 24,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
    },
    formContainer: {
        padding: 24,
    },
    errorText: {
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    loginButton: {
        marginTop: 8,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#007AFF',
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    forgotPassword: {
        marginTop: 16,
        alignItems: 'center',
    },
    forgotPasswordText: {
        color: '#007AFF',
        fontSize: 14,
    },
});

export default Login;