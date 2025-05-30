import axios from 'axios';

const API_URL = 'https://bd67-2001-ee0-4f42-2f20-98d0-6fad-f8ad-5324.ngrok-free.app';

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