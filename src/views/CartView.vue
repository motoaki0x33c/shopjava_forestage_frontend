<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useCart } from '../composables/useCart';
import orderApi from '../api/orderApi';

// 使用共享的購物車邏輯
const { 
  cart, 
  loading, 
  error, 
  totalPrice, 
  fetchCart, 
  updateProductQuantity, 
  removeProduct,
  setupStorageListener
} = useCart();

// 金物流相關狀態
const paymentAndLogistics = ref({
  payments: [],
  logistics: []
});
const selectedPayment = ref(null);
const selectedLogistics = ref(null);
const finalPrice = ref(0);

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
  if (!selectedPayment.value || !selectedLogistics.value) return;
  
  try {
    const { data: price } = await orderApi.computeCartPrice(
      cart.value.token,
      selectedPayment.value.id,
      selectedLogistics.value.id
    );
    finalPrice.value = price;
  } catch (err) {
    console.error('計算價格失敗:', err);
  }
};

// 監聽金物流選擇變化
const handlePaymentChange = () => {
  computeFinalPrice();
};

const handleLogisticsChange = () => {
  computeFinalPrice();
};

// 掛載時獲取購物車資料並設置監聽器
let removeListener;
onMounted(async () => {
  await fetchCart();
  await fetchPaymentAndLogistics();
  removeListener = setupStorageListener();
});

// 組件卸載時移除監聽器
onUnmounted(() => {
  if (removeListener) removeListener();
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
    
    <div v-else-if="cart.cartProducts.length === 0" class="text-center py-12">
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
                  <button 
                    @click="updateProductQuantity(item.product.id, item.quantity - 1)"
                    :disabled="item.quantity <= 1"
                    class="text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <span class="mx-2 w-8 text-center">{{ item.quantity }}</span>
                  <button 
                    @click="updateProductQuantity(item.product.id, item.quantity + 1)"
                    class="text-gray-500 hover:text-blue-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
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
              <option value="">請選擇付款方式</option>
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
              <option value="">請選擇配送方式</option>
              <option 
                v-for="logistics in paymentAndLogistics.logistics" 
                :key="logistics.id" 
                :value="logistics"
              >
                {{ logistics.name }}
              </option>
            </select>
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
              <span class="text-2xl text-blue-600">${{ finalPrice || totalPrice }}</span>
            </div>
          </div>
          
          <button 
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium transition"
            :disabled="!selectedPayment || !selectedLogistics"
            :class="{ 'opacity-50 cursor-not-allowed': !selectedPayment || !selectedLogistics }"
          >
            前往結帳
          </button>
        </div>
      </div>
    </div>
  </div>
</template>