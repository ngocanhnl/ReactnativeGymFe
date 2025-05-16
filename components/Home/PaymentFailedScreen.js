import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const PaymentFailedScreen = ({ navigation, route }) => {
  const { orderId, errorCode } = route.params;

  // Get error message based on VNPay error code
  const getErrorMessage = (code) => {
    const errorMessages = {
      '01': 'Giao dịch đã tồn tại',
      '02': 'Merchant không hợp lệ',
      '03': 'Dữ liệu gửi sang không đúng định dạng',
      '04': 'Khởi tạo GD không thành công do Website đang bị tạm khóa',
      '05': 'Giao dịch không thành công do: Quý khách nhập sai mật khẩu quá số lần quy định',
      '06': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định',
      '99': 'Các lỗi khác',
    };
    
    return errorMessages[code] || 'Giao dịch không thành công';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>❌</Text>
      <Text style={styles.title}>Thanh toán thất bại</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Mã đơn hàng:</Text>
        <Text style={styles.value}>{orderId}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Mã lỗi:</Text>
        <Text style={styles.value}>{errorCode}</Text>
      </View>
      
      <Text style={styles.errorMessage}>
        {getErrorMessage(errorCode)}
      </Text>
      
      <Button
        title="Thử lại"
        onPress={() => navigation.goBack()}
        color="#dc3545"
      />
      
      <View style={styles.spacer} />
      
      <Button
        title="Trở về trang chủ"
        onPress={() => navigation.navigate('Home')}
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
    color: '#dc3545',
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
  errorMessage: {
    textAlign: 'center',
    marginVertical: 30,
    fontSize: 16,
    color: '#dc3545',
  },
  spacer: {
    height: 20,
  },
});

export default PaymentFailedScreen;