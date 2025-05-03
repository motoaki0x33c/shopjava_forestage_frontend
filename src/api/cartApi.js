import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/cart',
});

export default {
  getCart: (token) => api.post('/get', { token }),
  addProduct: (productId) => api.post('/addProduct', { productId }),
  removeProduct: (productId) => api.post('/removeProduct', { productId }),
  updateQuantity: (productId, quantity) => api.post('/updateQuantity', { productId, quantity }),
};