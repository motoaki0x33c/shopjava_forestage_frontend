<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useCart } from '../composables/useCart';
import orderApi from '../api/orderApi';
import logisticsApi from '../api/logisticsApi';
import paymentApi from '../api/paymentApi';

// 防抖函數
const debounce = (fn, delay) => {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

// 使用共享的購物車邏輯
const { 
  cart, 
  loading, 
  error, 
  totalPrice, 
  fetchCart, 
  updateProductQuantity: originalUpdateProductQuantity, 
  removeProduct,
  setupStorageListener
} = useCart();

// 防抖更新數量的函數
const updateProductQuantity = debounce(async (productId, quantity) => {
  await originalUpdateProductQuantity(productId, quantity);
  if (selectedPayment.value && selectedLogistics.value) {
    debouncedComputeFinalPrice();
  }
}, 500);

// 金物流相關狀態
const paymentAndLogistics = ref({
  payments: [],
  logistics: []
});
const selectedPayment = ref(null);
const selectedLogistics = ref(null);
const finalPrice = ref(0);
const isComputing = ref(false);

// 物流相關狀態
const receiverName = ref('');
const receiverPhone = ref('');
const receiverEmail = ref('');
const receiverAddress = ref('');
const cvsInfo = ref(null);

// 保存表單資料到 localStorage
const saveFormData = () => {
  const formData = {
    receiverName: receiverName.value,
    receiverPhone: receiverPhone.value,
    receiverEmail: receiverEmail.value,
    receiverAddress: receiverAddress.value,
    selectedPaymentId: selectedPayment.value?.id,
    selectedLogisticsId: selectedLogistics.value?.id
  };
  localStorage.setItem('cartFormData', JSON.stringify(formData));
};

// 從 localStorage 恢復表單資料
const restoreFormData = () => {
  const savedData = localStorage.getItem('cartFormData');
  if (savedData) {
    const formData = JSON.parse(savedData);
    receiverName.value = formData.receiverName;
    receiverPhone.value = formData.receiverPhone;
    receiverEmail.value = formData.receiverEmail;
    receiverAddress.value = formData.receiverAddress;
    
    // 根據 ID 找到對應的金流和物流選項
    if (formData.selectedPaymentId) {
      selectedPayment.value = paymentAndLogistics.value.payments.find(
        p => p.id === formData.selectedPaymentId
      );
    }
    if (formData.selectedLogisticsId) {
      selectedLogistics.value = paymentAndLogistics.value.logistics.find(
        l => l.id === formData.selectedLogisticsId
      );
    }
  }
};

// 監聽表單資料變化
watch([receiverName, receiverPhone, receiverEmail, receiverAddress], () => {
  saveFormData();
});

// 監聽金物流選擇變化
watch([selectedPayment, selectedLogistics], () => {
  saveFormData();
  if (selectedPayment.value && selectedLogistics.value) {
    debouncedComputeFinalPrice();
  }
});

// 解析 URL 中的 cvsInfo 參數
const parseCvsInfo = () => {
  const urlParams = new URLSearchParams(window.location.search);
  let cvsInfoParam = urlParams.get('cvsInfo');
  if (cvsInfoParam) {
    try {
      // 先將 + 號替換為 %2B，避免被解碼為空格
      cvsInfoParam = cvsInfoParam.replace(' ', '+');
      const decodedInfo = decodeURIComponent(atob(cvsInfoParam).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      cvsInfo.value = JSON.parse(decodedInfo);
    } catch (err) {
      console.error('解析超商資訊失敗:', err);
    }
  }
};

// 顯示超商地圖
const showCvsMap = async () => {
  if (!selectedLogistics.value) return;
  
  try {
    // 在跳轉前保存表單資料
    saveFormData();
    
    window.location.href = logisticsApi.getCvsMapPath(selectedLogistics.value.id);
  } catch (err) {
    console.error('顯示超商地圖失敗:', err);
  }
};

// 獲取可用的金流和物流選項
const fetchPaymentAndLogistics = async () => {
  try {
    const { data } = await orderApi.getUsablePaymentAndLogistics();
    paymentAndLogistics.value = data;
  } catch (err) {
    console.error('獲取金物流選項失敗:', err);
  }
};

// 計算最終價格
const computeFinalPrice = async () => {
  if (!selectedPayment.value || !selectedLogistics.value || isComputing.value) return;
  
  try {
    isComputing.value = true;
    const { data: price } = await orderApi.computeCartPrice(
      cart.value.token,
      selectedPayment.value.id,
      selectedLogistics.value.id
    );
    finalPrice.value = price;
  } catch (err) {
    console.error('計算價格失敗:', err);
  } finally {
    isComputing.value = false;
  }
};

// 使用防抖包裝計算函數
const debouncedComputeFinalPrice = debounce(computeFinalPrice, 500);

// 監聽金物流選擇變化
const handlePaymentChange = () => {
  debouncedComputeFinalPrice();
};

const handleLogisticsChange = () => {
  debouncedComputeFinalPrice();
};

// 前往結帳
const proceedToCheckout = async () => {
  if (!selectedPayment.value || !selectedLogistics.value || !finalPrice.value) return;

  try {
    const orderData = {
      token: cart.value.token,
      paymentId: selectedPayment.value.id,
      logisticsId: selectedLogistics.value.id,
      customerName: receiverName.value,
      customerEmail: receiverEmail.value,
      customerPhone: receiverPhone.value,
      customerAddress: selectedLogistics.value.method === 'CVS' ? cvsInfo.value.cvsAddress : receiverAddress.value,
      cvsInfo: selectedLogistics.value.method === 'CVS' ? cvsInfo.value : null
    };

    const { data: orderNumber } = await orderApi.createOrder(orderData);
    const paymentPath = paymentApi.getToPaymentPath(orderNumber);
    $('body').html(paymentPath);
  } catch (err) {
    console.error('建立訂單失敗:', err);
  }
};

// 掛載時獲取購物車資料並設置監聽器
let removeListener;
onMounted(async () => {
  await fetchCart();
  await fetchPaymentAndLogistics();
  removeListener = setupStorageListener();
  parseCvsInfo();
  restoreFormData();
});

// 組件卸載時移除監聽器
onUnmounted(() => {
  if (removeListener) removeListener();
  localStorage.removeItem('cartFormData');
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">購物車</h1>
    
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">載入購物車...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      {{ error }}
    </div>
    
    <div v-else-if="cart?.cartProducts?.length === 0 ?? true" class="text-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <h2 class="text-2xl font-semibold mb-2">購物車是空的</h2>
      <p class="text-gray-600 mb-6">您的購物車中目前沒有任何商品</p>
      <router-link to="/product" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition">
        繼續購物
      </router-link>
    </div>
    
    <div v-else>
      <!-- 購物車商品列表 -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">商品</th>
              <th class="px-6 py-4 text-center text-sm font-medium text-gray-500">單價</th>
              <th class="px-6 py-4 text-center text-sm font-medium text-gray-500">數量</th>
              <th class="px-6 py-4 text-center text-sm font-medium text-gray-500">小計</th>
              <th class="px-6 py-4 text-center text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="item in cart.cartProducts" :key="item.id" class="hover:bg-gray-50">
              <!-- 商品資訊 -->
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <img :src="item.product.firstPhoto" alt="商品圖片" class="w-16 h-16 object-cover rounded mr-4">
                  <div>
                    <router-link :to="`/product/${item.product.route}`" class="text-sm font-medium text-gray-900 hover:text-blue-600">
                      {{ item.product.name }}
                    </router-link>
                    <p class="text-xs text-gray-500 mt-1">商品編號: {{ item.product.id }}</p>
                  </div>
                </div>
              </td>
              
              <!-- 單價 -->
              <td class="px-6 py-4 text-center text-sm text-gray-900">
                ${{ item.product.price }}
              </td>
              
              <!-- 數量 -->
              <td class="px-6 py-4">
                <div class="flex items-center justify-center">
                  <input 
                    type="number" 
                    v-model.number="item.quantity"
                    @change="updateProductQuantity(item.product.id, item.quantity)"
                    min="1"
                    class="w-20 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                </div>
              </td>
              
              <!-- 小計 -->
              <td class="px-6 py-4 text-center text-sm font-medium text-gray-900">
                ${{ item.product.price * item.quantity }}
              </td>
              
              <!-- 操作 -->
              <td class="px-6 py-4 text-center">
                <button 
                  @click="removeProduct(item.product.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 購物車結算 -->
      <div class="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <router-link to="/product" class="inline-flex items-center text-blue-600 hover:text-blue-800">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            繼續購物
          </router-link>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-md w-full md:w-96">
          <h2 class="text-lg font-semibold mb-4">訂單摘要</h2>
          
          <!-- 金流選擇 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">付款方式</label>
            <select 
              v-model="selectedPayment"
              @change="handlePaymentChange"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option :value="null">請選擇付款方式</option>
              <option 
                v-for="payment in paymentAndLogistics.payments" 
                :key="payment.id" 
                :value="payment"
              >
                {{ payment.name }}
              </option>
            </select>
          </div>
          
          <!-- 物流選擇 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">配送方式</label>
            <select 
              v-model="selectedLogistics"
              @change="handleLogisticsChange"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option :value="null">請選擇配送方式</option>
              <option 
                v-for="logistics in paymentAndLogistics.logistics" 
                :key="logistics.id" 
                :value="logistics"
              >
                {{ logistics.name }}
              </option>
            </select>
          </div>

          <!-- 收件人資訊 -->
          <div v-if="selectedLogistics" class="mb-6 space-y-4">
            <h3 class="text-lg font-semibold">收件人資訊</h3>
            
            <!-- 姓名 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">收件人姓名</label>
              <input 
                v-model="receiverName"
                type="text"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
            </div>
            
            <!-- 電話 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">聯絡電話</label>
              <input 
                v-model="receiverPhone"
                type="tel"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
            </div>
            
            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">電子郵件</label>
              <input 
                v-model="receiverEmail"
                type="email"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
            </div>
            
            <!-- 超商選擇或地址輸入 -->
            <div v-if="selectedLogistics.method === 'CVS'">
              <div v-if="cvsInfo" class="bg-gray-50 p-4 rounded-md">
                <p class="font-medium">已選擇超商：{{ cvsInfo.cvsName }}</p>
                <p class="text-sm text-gray-600">{{ cvsInfo.cvsAddress }}</p>
                <button 
                  @click="showCvsMap"
                  class="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  重新選擇超商
                </button>
              </div>
              <button 
                v-else
                @click="showCvsMap"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
              >
                選擇超商
              </button>
            </div>
            <div v-else>
              <label class="block text-sm font-medium text-gray-700 mb-1">收件地址</label>
              <input 
                v-model="receiverAddress"
                type="text"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
            </div>
          </div>
          
          <div class="space-y-3 mb-6">
            <div class="flex justify-between">
              <span class="text-gray-600">商品數量</span>
              <span>{{ cart.cartProducts.length }} 件</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">商品總金額</span>
              <span>${{ totalPrice }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">運費</span>
              <span>${{ selectedLogistics ? selectedLogistics.shippingCost : 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">手續費</span>
              <span>${{ selectedPayment ? selectedPayment.feeCost : 0 }}</span>
            </div>
          </div>
          
          <div class="border-t pt-4 mb-6">
            <div class="flex justify-between items-center font-bold">
              <span>訂單總金額</span>
              <span v-if="finalPrice" class="text-2xl text-blue-600">${{ finalPrice }}</span>
              <span v-else class="text-gray-400">請先選擇付款方式與配送方式</span>
            </div>
          </div>
          
          <button 
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium transition"
            :disabled="!selectedPayment || !selectedLogistics || !finalPrice"
            :class="{ 'opacity-50 cursor-not-allowed': !selectedPayment || !selectedLogistics || !finalPrice }"
            @click="proceedToCheckout"
          >
            前往結帳
          </button>
        </div>
      </div>
    </div>
  </div>
</template>