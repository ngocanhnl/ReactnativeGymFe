import axios from 'axios';

const API_URL = 'https://b0ed-2001-ee0-4f01-2ec0-8928-3f0b-6157-2f2d.ngrok-free.app';

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