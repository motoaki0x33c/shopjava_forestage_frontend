import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/order',
});

export default {
  // 獲取可用的金流和物流選項
  getUsablePaymentAndLogistics: () => api.post('/check/getUsablePaymentAndLogistics'),
  
  // 計算購物車總金額（含金物流費用）
  computeCartPrice: (token, paymentId, logisticsId) => 
    api.post('/check/computeCartPrice', { token, paymentId, logisticsId }),

  // 建立訂單
  createOrder: (orderData) => api.post('/create', orderData),

  // 獲取訂單資料
  getOrder: (orderNumber) => api.get(`/get/${orderNumber}`),
};