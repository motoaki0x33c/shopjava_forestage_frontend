import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_CART_BASE_URL + 'cart',
});

export default {
  // 根據 token 取得購物車資料
  getCart: (token) => api.post('/get', { token }),
  
  // 新增商品至購物車
  addProduct: (token, productId, quantity) => api.post('/addProduct', { token, productId, quantity }),
  
  // 更新購物車商品數量 (如數量為0則會刪除該商品)
  updateProduct: (token, productId, quantity) => api.put('/updateProduct', { token, productId, quantity }),
};