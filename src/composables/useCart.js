import { ref, computed } from 'vue';
import cartApi from '../api/cartApi';

// 創建共享狀態
const cart = ref({
  id: null,
  token: '',
  cartProducts: []
});
const loading = ref(false);
const error = ref(null);

// 計算總價
const totalPrice = computed(() => {
  return cart.value.cartProducts.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
});

// 計算商品總數
const cartCount = computed(() => {
  return cart.value.cartProducts.length;
});

// 從 localStorage 獲取 token
const getStoredToken = () => {
  return localStorage.getItem('cartToken') || '';
};

// 獲取購物車資料
const fetchCart = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const token = getStoredToken();
    
    // 如果沒有 token，初始化一個空購物車並返回
    if (!token) {
      cart.value = {
        id: null,
        token: '',
        cartProducts: []
      };
      return;
    }
    
    const response = await cartApi.getCart(token);
    
    cart.value = response.data;
    
    // 儲存 token 到 localStorage
    localStorage.setItem('cartToken', cart.value.token);
  } catch (err) {
    error.value = '無法載入購物車，請稍後再試';
    console.error('獲取購物車資料錯誤:', err);
  } finally {
    loading.value = false;
  }
};

// 更新商品數量
const updateProductQuantity = async (productId, quantity) => {
  try {
    const token = getStoredToken();
    if (!token) return;
    
    // 呼叫 API 更新購物車商品
    const response = await cartApi.updateProduct(token, productId, quantity);
    
    // 直接使用 API 回傳結果更新購物車資料
    cart.value = response.data;
    
    // 觸發 storage 事件通知其他組件
    updateStorageEvent();
  } catch (err) {
    console.error('更新商品數量錯誤:', err);
    // 發生錯誤時重新獲取購物車資料
    await fetchCart();
  }
};

// 移除商品
const removeProduct = async (productId) => {
  try {
    const token = getStoredToken();
    if (!token) return;
    
    // 呼叫 API 將數量設為 0 (相當於刪除商品)
    const response = await cartApi.updateProduct(token, productId, 0);
    
    // 直接使用 API 回傳結果更新購物車資料
    cart.value = response.data;
    
    // 觸發 storage 事件通知其他組件
    updateStorageEvent();
  } catch (err) {
    console.error('移除商品錯誤:', err);
    // 發生錯誤時重新獲取購物車資料
    await fetchCart();
  }
};

// 加入購物車
const addToCart = async (productId, quantity = 1) => {
  try {
    const token = getStoredToken();
    
    // 呼叫 API 加入商品到購物車
    const response = await cartApi.addProduct(token, productId, quantity);
    
    // 直接使用 API 回傳結果更新購物車資料
    cart.value = response.data;
    
    // 若處理成功，確保將返回的 token 保存
    if (cart.value.token) {
      localStorage.setItem('cartToken', cart.value.token);
    }
    
    // 觸發 storage 事件通知其他組件
    updateStorageEvent();
    
    return { success: true };
  } catch (err) {
    console.error('加入購物車失敗:', err);
    return { success: false, error: err };
  }
};

// 使用 localStorage 通知其他分頁更新購物車
const updateStorageEvent = () => {
  localStorage.setItem('cartUpdated', Date.now().toString());
};

// 設置監聽 storage 事件
const setupStorageListener = () => {
  const handleStorageChange = (event) => {
    if (event.key === 'cartToken' || event.key === 'cartUpdated') {
      fetchCart();
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  // 返回移除監聽器的函數
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

// 暴露需要的函數和狀態
export function useCart() {
  return {
    cart,
    loading,
    error,
    totalPrice,
    cartCount,
    fetchCart,
    updateProductQuantity,
    removeProduct,
    addToCart,
    setupStorageListener
  };
} 