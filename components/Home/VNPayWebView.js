// import React, { useState } from 'react';
// import { ActivityIndicator, View, Text, StyleSheet, Alert } from 'react-native';
// import { WebView } from 'react-native-webview';
// import { useNavigation } from '@react-navigation/native';

// const VNPayWebView = ({ route }) => {
//   const { paymentUrl, orderId } = route.params;
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigation = useNavigation();


//   const handleShouldStartLoadWithRequest = (request) => {
//     if (request.url.includes('/payment/vnpay-return')) {
//       handleNavigationStateChange(request.url);
//       return false; // Chặn WebView load trang API
//     }
//     return true;
//   };


//   // Handle WebView navigation state change
//   const handleNavigationStateChange =  async(navState) => {
//     // Check if the URL contains your return URL
//     if (navState.url.includes('/payment/vnpay-return')) {
    
//       const returnUrl = navState.url; // URL thực tế từ WebView
//       const queryString = returnUrl.split('?')[1]; // lấy phần sau dấu ?
//       const apiUrl = `${endpoints['vnpay-return']}?${queryString}`;
//       try {
//         await Apis.get(apiUrl); // Không cần lưu res
//       } catch (err) {
//         console.warn('Lỗi khi gọi vnpay-return:', err); // In log nếu cần
//       }

//       // Extract URL parameters
//       const urlParams = navState.url.split('?')[1];
//       const searchParams = new URLSearchParams(urlParams);
//       const responseCode = searchParams.get('vnp_ResponseCode');
 
//       // Check payment result
//       if (responseCode === '00') {
//         // Payment successful
//         Alert.alert(
//           'Thanh toán thành công',
//           'Cảm ơn bạn đã thanh toán.',
//           [
//             { 
//               text: 'OK', 
//               onPress: () => navigation.navigate('PaymentSuccess', {
//                 orderId: orderId,
//                 transactionId: searchParams.get('vnp_TransactionNo')
//               }) 
//             }
//           ]
//         );
//       } else {
//         // Payment failed
//         Alert.alert(
//           'Thanh toán thất bại',
//           'Có lỗi xảy ra trong quá trình thanh toán.',
//           [
//             { 
//               text: 'OK', 
//               onPress: () => navigation.navigate('PaymentFailed', {
//                 orderId: orderId,
//                 errorCode: responseCode
//               }) 
//             }
//           ]
//         );
//       }
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {loading && (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#0000ff" />
//           <Text style={styles.loadingText}>Đang tải cổng thanh toán...</Text>
//         </View>
//       )}
      
//       {error && (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>Có lỗi xảy ra: {error}</Text>
//         </View>
//       )}
      
//       <WebView
//         source={{ uri: paymentUrl }}
//         style={styles.webView}
//         onLoadStart={() => setLoading(true)}
//         onLoadEnd={() => setLoading(false)}
//         onError={(e) => {
//           setError(e.nativeEvent.description);
//           setLoading(false);
//         }}
//         onNavigationStateChange={handleNavigationStateChange}
//         onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
//         javaScriptEnabled={true}
//         domStorageEnabled={true}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   webView: {
//     flex: 1,
//   },
//   loadingContainer: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.8)',
//     zIndex: 999,
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   errorText: {
//     color: 'red',
//     fontSize: 16,
//     textAlign: 'center',
//   },
// });

// export default VNPayWebView;

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import Apis, { authApis, endpoints } from "../../configs/Apis";
const VNPayWebView = ({ route }) => {
  const { paymentUrl, orderId } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();


  const addStudent = async ()=>{
    const token = await AsyncStorage.getItem('token');
    const courseId = await AsyncStorage.getItem('courseID');
    console.log('token', token)
    console.log('courseId', courseId)
    let u = await authApis(token).post(endpoints['add-student'](courseId));
    // console.info('Add Student',u.data);



  }


  const handleShouldStartLoadWithRequest = (request) => {
    if (request.url.includes('/payment/vnpay-return')) {
      const urlParams = request.url.split('?')[1];
      const apiUrl = `${endpoints['vnpay-return']}?${urlParams}`;
      console.log("123333")
      console.log("urlWBV", apiUrl)
      // Gọi API backend (không cần await)
      Apis.get(apiUrl).catch(err => {
        console.warn('Lỗi gọi API vnpay-return:', err);
      });

      // Xử lý điều hướng ngay, không chờ API
      const searchParams = new URLSearchParams(urlParams);
      const responseCode = searchParams.get('vnp_ResponseCode');

      if (responseCode === '00') {
        addStudent()

        Alert.alert(
          'Thanh toán thành công',
          'Cảm ơn bạn đã thanh toán.',
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.navigate('PaymentSuccess', {
                  orderId: orderId,
                  transactionId: searchParams.get('vnp_TransactionNo'),
                }),
            },
          ]
        );
      } else {
        Alert.alert(
          'Thanh toán thất bại',
          'Có lỗi xảy ra trong quá trình thanh toán.',
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.navigate('PaymentFailed', {
                  orderId: orderId,
                  errorCode: responseCode,
                }),
            },
          ]
        );
      }

      return false; // Chặn WebView load URL trả về
    }
    return true;
  };

  const handleNavigationStateChange = (navState) => {
    // Ở đây bạn có thể để trống hoặc dùng để cập nhật loading/error bình thường
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Đang tải cổng thanh toán...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Có lỗi xảy ra: {error}</Text>
        </View>
      )}

      <WebView
        source={{ uri: paymentUrl }}
        style={styles.webView}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={(e) => {
          setError(e.nativeEvent.description);
          setLoading(false);
        }}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default VNPayWebView;
