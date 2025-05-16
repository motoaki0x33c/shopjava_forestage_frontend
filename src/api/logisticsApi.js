import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/log',
});

export default {
  // 綠界超商電子地圖路徑
  getCvsMapPath: (logId) => `${api.defaults.baseURL}/ecpay/selectCvsMap/${logId}`,
};