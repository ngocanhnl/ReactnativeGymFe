import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from "@react-navigation/native";
const PaymentSuccessScreen = ({ navigation, route }) => {
  const { orderId, transactionId } = route.params;
  const nav = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>✅</Text>
      <Text style={styles.title}>Thanh toán thành công</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Mã đơn hàng:</Text>
        <Text style={styles.value}>{orderId}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Mã giao dịch:</Text>
        <Text style={styles.value}>{transactionId}</Text>
      </View>
      
      <Text style={styles.message}>
        Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đang được xử lý.
      </Text>
      
      <Button
        title="Trở về trang chủ"
        onPress={() => nav.navigate('home')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#28a745',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
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
  message: {
    textAlign: 'center',
    marginVertical: 30,
    fontSize: 16,
  },
});

export default PaymentSuccessScreen;