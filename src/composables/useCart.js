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
    if (quantity < 1) return;
    
    // 更新前端顯示（樂觀 UI 更新）
    const productIndex = cart.value.cartProducts.findIndex(item => item.product.id === productId);
    if (productIndex !== -1) {
      cart.value.cartProducts[productIndex].quantity = quantity;
    }
    
    // 實際 API 調用（後端尚未實作，目前僅模擬）
    await cartApi.updateQuantity(productId, quantity);
    
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
    // 樂觀 UI 更新
    cart.value.cartProducts = cart.value.cartProducts.filter(item => item.product.id !== productId);
    
    // 實際 API 調用（後端尚未實作，目前僅模擬）
    await cartApi.removeProduct(productId);
    
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
    for (let i = 0; i < quantity; i++) {
      await cartApi.addProduct(productId);
    }
    
    // 重新獲取購物車資料
    await fetchCart();
    
    // 觸發 storage 事件通知其他組件
    updateStorageEvent();
    
    return { success: true };
  } catch (err) {
    console.error('加入購物車失敗:', err);
    return { success: false, error: err };
  }
};

// 觸發 storage 事件以通知其他組件
const updateStorageEvent = () => {
  const token = getStoredToken();
  if (token) {
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'cartToken',
      newValue: token
    }));
  }
};

// 設置監聽 storage 事件
const setupStorageListener = () => {
  const handleStorageChange = (event) => {
    if (event.key === 'cartToken') {
      fetchCart();
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  // 返回移除監聽器的函數
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

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