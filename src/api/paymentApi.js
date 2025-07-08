import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_CART_BASE_URL + 'pay',
});

export default {
  // 至第三方金流頁面路徑
  getToPaymentPath: (orderNumber) => `${api.defaults.baseURL}/toPaymentHtml/${orderNumber}`,
};