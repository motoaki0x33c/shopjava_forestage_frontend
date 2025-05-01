<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import productApi from '@/api/productApi';

const route = useRoute();
const product = ref(null);
const isLoading = ref(true);
const quantity = ref(1);
const relatedProducts = ref([]);

// 數量增減函數
const increaseQuantity = () => {
  quantity.value++;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

// 獲取商品資料的函數
const fetchProductData = async (routeParam) => {
  try {
    isLoading.value = true;
    
    // 獲取商品詳情
    const response = await productApi.getProduct(routeParam);
    product.value = response.data;
    
    if (product.value) {
      // 獲取相關商品（同類別）
      const productsResponse = await productApi.getProducts();
      relatedProducts.value = productsResponse.data
        .filter(p => p.category === product.value.category && p.id !== product.value.id)
        .slice(0, 3); // 最多顯示3個相關商品
    }
    
    isLoading.value = false;
  } catch (error) {
    console.error('獲取商品詳情失敗:', error);
    isLoading.value = false;
  }
};

// 監聽路由參數變化，當路由變化時重新獲取商品資料
watch(() => route.params.route, (newRoute) => {
  if (newRoute) {
    fetchProductData(newRoute);
  }
}, { immediate: true });

</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 載入中提示 -->
    <div v-if="isLoading" class="text-center py-10">
      <p class="text-xl">載入商品詳情中...</p>
    </div>
    
    <!-- 找不到商品提示 -->
    <div v-else-if="!product" class="text-center py-10">
      <p class="text-xl">找不到該商品</p>
      <RouterLink 
        to="/product" 
        class="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
      >
        返回商品列表
      </RouterLink>
    </div>
    
    <!-- 商品詳情 -->
    <div v-else>
      <!-- 導航麵包屑 -->
      <div class="flex items-center mb-6 text-sm">
        <RouterLink to="/" class="text-gray-600 hover:text-blue-600">首頁</RouterLink>
        <span class="mx-2">/</span>
        <RouterLink to="/product" class="text-gray-600 hover:text-blue-600">商品列表</RouterLink>
        <span class="mx-2">/</span>
        <span>{{ product.name }}</span>
      </div>
      
      <!-- 商品詳情卡片 -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-10">
        <div class="md:flex">
          <!-- 商品圖片 -->
          <div class="md:w-1/2">
            <img :src="product.firstPhoto" :alt="product.name" class="w-full h-80 md:h-96 object-cover">
          </div>
          
          <!-- 商品資訊 -->
          <div class="md:w-1/2 p-6">
            <h1 class="text-3xl font-bold mb-4">{{ product.name }}</h1>
            <p class="text-blue-600 mb-4">分類: {{ product.category }}</p>
            <p class="text-3xl font-bold text-red-600 mb-6">${{ product.price.toLocaleString() }}</p>
            
            <div class="mb-6">
              <label class="block text-gray-700 mb-2">數量:</label>
              <div class="flex items-center">
                <button 
                  @click="decreaseQuantity" 
                  class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-l"
                >
                  -
                </button>
                <input 
                  v-model="quantity" 
                  type="number" 
                  min="1" 
                  class="w-16 text-center border-t border-b border-gray-300 py-2"
                >
                <button 
                  @click="increaseQuantity" 
                  class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-r"
                >
                  +
                </button>
              </div>
            </div>
            
            <div class="flex space-x-4">
              <button 
                class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 flex-grow"
              >
                加入購物車
              </button>
              <button 
                class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 flex-grow"
              >
                立即購買
              </button>
            </div>
          </div>
        </div>
      </div>

      <h2 class="text-2xl font-semibold mb-6">商品介紹</h2>
      <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-10 justify-items-center">
        <div v-html="product.description"></div>
      </div>
      
      <!-- 相關商品 -->
      <div v-if="relatedProducts.length > 0" class="mb-10">
        <h2 class="text-2xl font-semibold mb-6">相關商品</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            v-for="item in relatedProducts" 
            :key="item.id" 
            class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300"
          >
            <img :src="item.firstPhoto" :alt="item.name" class="w-full h-48 object-cover">
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-2">{{ item.name }}</h3>
              <p class="font-bold text-xl mb-3">${{ item.price.toLocaleString() }}</p>
              <RouterLink 
                :to="`/product/${item.route}`" 
                class="block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                查看詳情
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 