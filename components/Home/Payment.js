import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { PaymentService } from '../../service/paymentServiec';
import Apis, { authApis, endpoints } from "../../configs/Apis";

const PaymentScreen = ({ navigation, route }) => {
  const { amount, orderId } = route.params;
  const [loading, setLoading] = useState(false);
  const [order_id, SetOrderID] = useState()
  const courseId = route.params?.courseId;
  console.log("CourseHande", courseId)
  const handlePayment = async () => {
    
    try {
      setLoading(true);

      const order = await Apis.post(endpoints['order'], {
        course: courseId,
        user: 7
      },  {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log("Order", order.data)
      
      // Call API to create payment URL
      const response = await PaymentService.createPayment(amount,order.data.id);
      
      if (response && response.status === 'success') {
        // Navigate to WebView with payment URL
        navigation.navigate('VNPayWebView', {
          paymentUrl: response.payment_url,
          orderId: response.order_id || orderId
        });
      } else {
        Alert.alert('Lỗi', 'Không thể tạo đường dẫn thanh toán');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tạo thanh toán');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thanh toán đơn hàng</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Mã đơn hàng:</Text>
        <Text style={styles.value}>{orderId}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Số tiền:</Text>
        <Text style={styles.value}>{amount} VNĐ</Text>
      </View>
      
      <Button
        title="Thanh toán qua VNPay"
        onPress={handlePayment}
        disabled={loading}
      />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0000ff" />
          <Text style={styles.loadingText}>Đang tạo liên kết thanh toán...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 10,
  },
});

export default PaymentScreen;