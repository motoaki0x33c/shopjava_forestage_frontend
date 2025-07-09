<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import productApi from '@/api/productApi';
import { useCart } from '@/composables/useCart';

const route = useRoute();
const products = ref([]);
const categories = ref([]);
const isLoading = ref(true);
const selectedCategory = ref('');
const searchQuery = ref('');
const addingToCart = ref({});
const { addToCart: addProductToCart } = useCart();

// 加入購物車功能
const addToCart = async (product) => {
  try {
    addingToCart.value[product.id] = true;
    const result = await addProductToCart(product.id, 1);
    if (result.success) {
      alert(`已成功將 ${product.name} 加入購物車`);
    } else {
      throw new Error('加入購物車失敗');
    }
  } catch (error) {
    console.error('加入購物車失敗:', error);
    alert('加入購物車失敗，請稍後再試');
  } finally {
    addingToCart.value[product.id] = false;
  }
};

onMounted(async () => {
  try {
    const [productsResponse] = await Promise.all([
      productApi.getProducts(),
    ]);
    products.value = productsResponse.data;
    // 自動整理分類
    categories.value = Array.from(new Set(products.value.map(p => p.category))).filter(Boolean);
    isLoading.value = false;
  } catch (error) {
    console.error('獲取數據失敗:', error);
    isLoading.value = false;
  }
});

// 監聽路由參數變化
watch(() => route.query.category, (newCategory) => {
  if (newCategory) {
    selectedCategory.value = newCategory;
  } else {
    selectedCategory.value = '';
  }
}, { immediate: true });

// 過濾後的商品列表
const filteredProducts = computed(() => {
  let result = [...products.value];
  
  // 依分類篩選
  if (selectedCategory.value) {
    result = result.filter(product => product.category === selectedCategory.value);
  }
  
  // 依搜索關鍵字篩選
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
  }
  
  return result;
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-center">商品列表</h1>
    
    <!-- 搜索和篩選區域 -->
    <div class="mb-8 bg-gray-100 p-6 rounded-lg">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- 搜索框 -->
        <div class="flex-grow">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="搜索商品..." 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        
        <!-- 分類篩選 -->
        <div class="md:w-1/3">
          <select 
            v-model="selectedCategory"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">所有分類</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- 載入中提示 -->
    <div v-if="isLoading" class="text-center py-10">
      <p class="text-xl">載入商品中...</p>
    </div>
    
    <!-- 無商品提示 -->
    <div v-else-if="filteredProducts.length === 0" class="text-center py-10">
      <p class="text-xl">沒有找到符合條件的商品</p>
      <button 
        @click="selectedCategory = ''; searchQuery = ''" 
        class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
      >
        清除篩選條件
      </button>
    </div>
    
    <!-- 商品列表 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="product in filteredProducts" 
        :key="product.id" 
        class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300"
      >
        <img :src="product.firstPhoto" :alt="product.name" class="w-full h-48 object-cover">
        <div class="p-4">
          <h2 class="text-lg font-semibold mb-2">{{ product.name }}</h2>
          <p class="font-bold text-xl mb-3">${{ product.price.toLocaleString() }}</p>
          <div class="flex justify-between">
            <RouterLink 
              :to="`/product/${product.route}`" 
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              查看詳情
            </RouterLink>
            <button 
              @click="addToCart(product)"
              :disabled="addingToCart[product.id]"
              class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="addingToCart[product.id]" class="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-1"></span>
              {{ addingToCart[product.id] ? '處理中' : '加入購物車' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 