import axios from 'axios';

const API_URL = 'https://a999-2001-ee0-4f01-2ec0-206e-70d2-cbc9-2008.ngrok-free.app';

export const PaymentService = {
  createPayment: async (amount, bankCode = null) => {
    try {
      const response = await axios.post(`${API_URL}/order/create_payment_url/`, {
        amount,
        bank_code: bankCode
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