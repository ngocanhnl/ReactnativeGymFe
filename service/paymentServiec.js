import axios from 'axios';

const API_URL = 'https://f342-2001-ee0-4f42-2f20-34fb-694d-6a47-61da.ngrok-free.app';

export const PaymentService = {
  createPayment: async (amount,order_id, bankCode = null) => {
    console.log("Creat url")
    try {
      const response = await axios.post(`${API_URL}/order/create_payment_url/`, {
        amount,
        bank_code: bankCode,
        orderId: order_id
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },
  
  verifyPayment: async (paymentData) => {
    try {
      const response = await axios.post(`${API_URL}/payment/verify/`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }
};