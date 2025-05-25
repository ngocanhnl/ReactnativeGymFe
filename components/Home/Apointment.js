// import React, { useState } from 'react';
// import { View, StyleSheet } from 'react-native';
// import { TextInput, Button, Text } from 'react-native-paper';
// import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
// import Apis, { authApis, endpoints } from "../../configs/Apis";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// const Apointment = ({ route }) => {
//   const [date, setDate] = useState(undefined);
//   const [time, setTime] = useState(undefined);
//   const [notes, setNotes] = useState('');
//   const [token, setToken] = useState(null);
//   const [datePickerVisible, setDatePickerVisible] = useState(false);
//   const [timePickerVisible, setTimePickerVisible] = useState(false);

//     console.log(route.params?.teacher_id)

//   const handleConfirm = async() => {
//     if (date && time) {
//         const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
//     const formattedTime = `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`;
    
//         const data = {
//           date: formattedDate,
//           time: formattedTime,
//           notes: notes,
//           student: route.params?.student_id,
//           teacher: route.params?.teacher_id,
//         };
//         console.log(data)
    
//         try {
//             let t = await AsyncStorage.getItem("token");
//             setToken(t);
//             let res = await Apis.post(endpoints['apointment'],data
//             ,{
//                 headers: {
//                   'Content-Type': 'application/json',
//                   'Authorization': `Bearer ${t}` // Bỏ comment nếu cần xác thực
//                 }
//             });

    
          
//         } catch (error) {
//           console.error('Lỗi kết nối API:', error);
//         }
//       } else {
//         console.log('Vui lòng chọn ngày và giờ.');
//       }
    
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Đặt lịch học</Text>

//       <Button mode="outlined" onPress={() => setDatePickerVisible(true)} style={styles.input}>
//   {date 
//     ? `Ngày: ${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}` 
//     : 'Chọn ngày'}
// </Button>


//       <Button mode="outlined" onPress={() => setTimePickerVisible(true)} style={styles.input}>
//         {time ? `Giờ: ${time.hours}:${String(time.minutes).padStart(2, '0')}` : 'Chọn giờ'}
//       </Button>

//       <TextInput
//         label="Ghi chú"
//         value={notes}
//         onChangeText={({notes}) => setNotes(notes)}
//         mode="outlined"
//         multiline
//         numberOfLines={5}
//         style={styles.textarea}
//       />

//       <Button mode="contained" onPress={handleConfirm}>
//         Xác nhận
//       </Button>

//       <DatePickerModal
//         locale="vi"
//         mode="single"
//         visible={datePickerVisible}
//         onDismiss={() => setDatePickerVisible(false)}
//         date={date}
//         onConfirm={({ date }) => {
//           setDate(date);
//           setDatePickerVisible(false);
//         }}
//       />

//       <TimePickerModal
//         visible={timePickerVisible}
//         onDismiss={() => setTimePickerVisible(false)}
//         onConfirm={(params) => {
//           setTime({ hours: params.hours, minutes: params.minutes });
//           setTimePickerVisible(false);
//         }}
//         hours={14}
//         minutes={0}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     justifyContent: 'center',
//   },
//   input: {
//     marginBottom: 16,
//   },
//   textarea: {
//     marginBottom: 16,
//     height: 120,
//     textAlignVertical: 'top',
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 24,
//     textAlign: 'center',
//   },
// });

// export default Apointment;


import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Card, Divider, HelperText, IconButton } from 'react-native-paper';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import Apis, { endpoints } from "../../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const Apointment = ({ route }) => {
  const [date, setDate] = useState(undefined);
  const [time, setTime] = useState(undefined);
  const [notes, setNotes] = useState('');
  const [token, setToken] = useState(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
    const nav = useNavigation();

  // console.log(route.params?.teacher_id)

  // const handleConfirm = async () => {
  //   setSuccessMsg('');
  //   setErrorMsg('');
  //   if (date && time) {
  //     setLoading(true);
  //     const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  //     const formattedTime = `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`;

  //     const data = {
  //       date: formattedDate,
  //       time: formattedTime,
  //       notes: notes,
  //       student: route.params?.student_id,
  //       teacher: route.params?.teacher_id,
  //     };
  //     // console.log(data)

  //     try {
  //       let t = await AsyncStorage.getItem("token");
  //       setToken(t);
  //       let res = await Apis.post(endpoints['apointment'], data, {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': `Bearer ${t}`
  //         }
  //       });
  //       setSuccessMsg('Đặt lịch thành công!');
  //       setDate(undefined);
  //       setTime(undefined);
  //       setNotes('');
  //     } catch (error) {
  //       setErrorMsg('Lỗi kết nối API. Vui lòng thử lại.');
  //       // console.error('Lỗi kết nối API:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   } else {
  //     setErrorMsg('Vui lòng chọn ngày và giờ.');
  //   }
  // };
  const handleConfirm = async () => {
    setSuccessMsg('');
    setErrorMsg('');
    if (date && time) {
      setLoading(true);
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const formattedTime = `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`;

      const data = {
        date: formattedDate,
        time: formattedTime,
        notes: notes,
        student: route.params?.student_id,
        teacher: route.params?.teacher_id,
      };

      try {
        let t = await AsyncStorage.getItem("token");
        setToken(t);
        let res = await Apis.post(endpoints['apointment'], data, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${t}`
          }
        });
        setSuccessMsg('Đặt lịch thành công!');
        setDate(undefined);
        setTime(undefined);
        setNotes('');
        setTimeout(() => {
          setSuccessMsg('');
          // nav.navigate('lessons');
        }, 1500); // Hiển thị thông báo 1.5s rồi chuyển trang
      } catch (error) {
        setErrorMsg('Lỗi kết nối API. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    } else {
      setErrorMsg('Vui lòng chọn ngày và giờ.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f6f6f6' }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Card style={styles.card} elevation={4}>
          <Card.Title
            title="Đặt lịch học"
            left={(props) => <IconButton {...props} icon="calendar-clock" color="#1976d2" />}
            titleStyle={styles.title}
          />
          <Divider />
          <Card.Content>
            <Button
              mode="outlined"
              icon="calendar"
              onPress={() => setDatePickerVisible(true)}
              style={styles.input}
              labelStyle={{ color: '#1976d2' }}
              contentStyle={{ flexDirection: 'row-reverse' }}
            >
              {date
                ? `Ngày: ${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
                : 'Chọn ngày'}
            </Button>

            <Button
              mode="outlined"
              icon="clock-outline"
              onPress={() => setTimePickerVisible(true)}
              style={styles.input}
              labelStyle={{ color: '#1976d2' }}
              contentStyle={{ flexDirection: 'row-reverse' }}
            >
              {time ? `Giờ: ${time.hours}:${String(time.minutes).padStart(2, '0')}` : 'Chọn giờ'}
            </Button>

            <TextInput
              label="Ghi chú"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={5}
              style={styles.textarea}
              left={<TextInput.Icon icon="note-text-outline" />}
              placeholder="Nhập ghi chú cho buổi học (nếu có)"
              theme={{ colors: { primary: '#1976d2' } }}
            />

            <HelperText type="info" visible={true} style={{ marginBottom: 8 }}>
              Vui lòng chọn ngày, giờ và nhập ghi chú nếu cần.
            </HelperText>

            {errorMsg ? (
              <HelperText type="error" visible={true} style={{ marginBottom: 8 }}>
                {errorMsg}
              </HelperText>
            ) : null}
            {successMsg ? (
              <HelperText type="info" visible={true} style={{ color: 'green', marginBottom: 8 }}>
                {successMsg}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleConfirm}
              loading={loading}
              disabled={loading}
              style={styles.confirmBtn}
              icon="check"
              contentStyle={{ flexDirection: 'row-reverse' }}
            >
              Xác nhận
            </Button>
          </Card.Content>
        </Card>

        <DatePickerModal
          locale="vi"
          mode="single"
          visible={datePickerVisible}
          onDismiss={() => setDatePickerVisible(false)}
          date={date}
          onConfirm={({ date }) => {
            setDate(date);
            setDatePickerVisible(false);
          }}
        />

        <TimePickerModal
          visible={timePickerVisible}
          onDismiss={() => setTimePickerVisible(false)}
          onConfirm={(params) => {
            setTime({ hours: params.hours, minutes: params.minutes });
            setTimePickerVisible(false);
          }}
          hours={14}
          minutes={0}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f6f6f6',
  },
  card: {
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: '#fff',
  },
  input: {
    marginBottom: 16,
    borderColor: '#1976d2',
    borderRadius: 8,
  },
  textarea: {
    marginBottom: 16,
    height: 120,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmBtn: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#1976d2',
  },
});

export default Apointment;
