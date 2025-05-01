import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

export default {
  getProducts: () => api.get('/product'),
  getProduct: (route) => api.get(`/product/${route}`),

  // 獲取商品分類
  getCategories: () => {
    // 在實際環境中使用 API 調用
    // return api.get('/categories');
    
    // 模擬 API 響應
    // const categories = [...new Set(mockProducts.map(product => product.category))];
    // return Promise.resolve({ data: categories });
  },
  
  // 根據分類獲取商品
  getProductsByCategory: (category) => {
    // 在實際環境中使用 API 調用
    // return api.get(`/products/category/${category}`);
    
    // 模擬 API 響應
    // const filteredProducts = mockProducts.filter(product => product.category === category);
    // return Promise.resolve({ data: filteredProducts });
  }
};