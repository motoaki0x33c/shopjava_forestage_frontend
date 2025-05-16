import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/pay',
});

export default {
  // 至第三方金流頁面路徑
  getToPaymentPath: (orderNumber) => `${api.defaults.baseURL}/toPaymentHtml/${orderNumber}`,
};