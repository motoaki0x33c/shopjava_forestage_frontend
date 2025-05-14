import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/log',
});

export default {
  // 取得綠界超商電子地圖
  showEcpaySelectCvsMap: (logId) => api.post(`/ecpay/selectCvsMap/${logId}`),
};