import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/product',
});

export default {
  getProducts: () => api.get(''),
  getProduct: (route) => api.get(`/${route}`),
};