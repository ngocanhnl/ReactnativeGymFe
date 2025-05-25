import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Text, Surface, Button, Divider, useTheme } from 'react-native-paper';
import { PaymentService } from '../../service/paymentServiec';
import { useContext } from "react";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { MyDispatchContext, MyUserContext } from "../../configs/Contexts";

const PaymentScreen = ({ navigation, route }) => {
  const { amount, orderId, discount } = route.params;
  const [loading, setLoading] = useState(false);
  const [order_id, SetOrderID] = useState();
  const courseId = route.params?.courseId;
  const user = useContext(MyUserContext);
  const theme = useTheme();

  const originalAmount = amount;
  const discountedAmount = discount ? amount - (amount * discount / 100) : amount;

  const handlePayment = async () => {
    try {
      setLoading(true);

      const order = await Apis.post(endpoints['order'], {
        course: courseId,
        user: user.id,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const response = await PaymentService.createPayment(discountedAmount, order.data.id);
      
      if (response && response.status === 'success') {
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
      <Surface style={styles.card}>
        <Text style={styles.title}>Thanh toán đơn hàng</Text>
        <Divider style={styles.divider} />
        
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Mã đơn hàng</Text>
          <Text style={styles.value}>{orderId}</Text>
        </View>

        {discount && (
          <>
            <View style={styles.infoContainer}>
              <Text style={styles.label}>Giá gốc</Text>
              <Text style={[styles.value, styles.originalPrice]}>
                {originalAmount.toLocaleString('vi-VN')} VNĐ
              </Text>
            </View>
            
            <View style={styles.infoContainer}>
              <Text style={styles.label}>Giảm giá</Text>
              <Text style={[styles.value, styles.discount]}>
                -{discount}%
              </Text>
            </View>
          </>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Tổng thanh toán</Text>
          <Text style={[styles.value, styles.finalPrice]}>
            {discountedAmount.toLocaleString('vi-VN')} VNĐ
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={handlePayment}
          loading={loading}
          disabled={loading}
          style={styles.paymentButton}
          contentStyle={styles.paymentButtonContent}
        >
          Thanh toán qua VNPay
        </Button>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    padding: 20,
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  divider: {
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  discount: {
    color: '#e53935',
    fontWeight: 'bold',
  },
  finalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e53935',
  },
  paymentButton: {
    marginTop: 24,
    borderRadius: 8,
  },
  paymentButtonContent: {
    paddingVertical: 8,
  },
});

export default PaymentScreen;