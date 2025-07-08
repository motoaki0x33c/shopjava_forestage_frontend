import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_CART_BASE_URL + 'log',
});

export default {
  // 綠界超商電子地圖路徑
  getCvsMapPath: (logId) => `${api.defaults.baseURL}/ecpay/selectCvsMap/${logId}`,
};