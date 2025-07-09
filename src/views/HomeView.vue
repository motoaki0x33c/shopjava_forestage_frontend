<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import productApi from '@/api/productApi';
import { useCart } from '@/composables/useCart';

const featuredProducts = ref([]);
const categories = ref([]);
const isLoading = ref(true);
const router = useRouter();
const addingToCart = ref({});

// 使用共享的購物車邏輯
const { addToCart: addProductToCart } = useCart();

// 加入購物車功能
const addToCart = async (product) => {
  try {
    // 設置正在加入購物車的狀態
    addingToCart.value[product.id] = true;
    
    // 使用共享的購物車函數添加商品
    const result = await addProductToCart(product.id, 1);
    
    if (result.success) {
      // 顯示成功訊息
      alert(`已成功將 ${product.name} 加入購物車`);
    } else {
      throw new Error('加入購物車失敗');
    }
  } catch (error) {
    console.error('加入購物車失敗:', error);
    alert('加入購物車失敗，請稍後再試');
  } finally {
    // 重置狀態
    addingToCart.value[product.id] = false;
  }
};

// 前往商品詳情
const goToProductDetail = (productRoute) => {
  router.push(`/product/${productRoute}`);
};

onMounted(async () => {
  try {
    const [productsResponse] = await Promise.all([
      productApi.getProducts(),
    ]);
    
    featuredProducts.value = productsResponse.data.slice(0, 3); // 只顯示前3個商品
    isLoading.value = false;
  } catch (error) {
    console.error('獲取數據失敗:', error);
    isLoading.value = false;
  }
});
</script>

<template>
  <main>
    <!-- 輪播橫幅 -->
    <section class="bg-gray-800 text-white py-20 mb-10">
      <div class="container mx-auto text-center px-4">
        <h1 class="text-4xl font-bold mb-4">歡迎光臨 JavaShop</h1>
        <p class="text-xl mb-8">優質商品，物超所值</p>
        <RouterLink 
          to="/product" 
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
        >
          立即購物
        </RouterLink>
      </div>
    </section>

    <!-- 商品分類 -->
    <section class="container mx-auto mb-12 px-4">
      <h2 class="text-2xl font-semibold mb-6 text-center">商品分類</h2>
      <div v-if="isLoading" class="text-center">
        <p>載入中...</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          v-for="category in categories" 
          :key="category" 
          class="bg-gray-100 p-6 rounded-lg text-center hover:shadow-lg transition duration-300"
        >
          <h3 class="text-xl font-semibold mb-2">{{ category }}</h3>
          <RouterLink 
            :to="`/product?category=${category}`" 
            class="text-blue-600 hover:underline"
          >
            瀏覽商品
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- 熱門商品 -->
    <section class="container mx-auto mb-12 px-4">
      <h2 class="text-2xl font-semibold mb-6 text-center">熱門商品</h2>
      <div v-if="isLoading" class="text-center">
        <p>載入中...</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          v-for="product in featuredProducts" 
          :key="product.id" 
          class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300"
        >
          <img 
            :src="product.firstPhoto" 
            :alt="product.name" 
            class="w-full h-48 object-cover cursor-pointer"
            @click="goToProductDetail(product.route)"
          >
          <div class="p-4">
            <h3 
              class="text-lg font-semibold mb-2 cursor-pointer hover:text-blue-600"
              @click="goToProductDetail(product.route)"
            >
              {{ product.name }}
            </h3>
            <p class="font-bold text-xl mb-3">${{ product.price.toLocaleString() }}</p>
            <div class="flex space-x-2">
              <button 
                @click="addToCart(product)"
                :disabled="addingToCart[product.id]"
                class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-2 rounded transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <span v-if="addingToCart[product.id]" class="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-1"></span>
                {{ addingToCart[product.id] ? '處理中' : '加入購物車' }}
              </button>
              <RouterLink 
                :to="`/product/${product.route}`" 
                class="flex-1 block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded transition duration-300"
              >
                商品詳情
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
      <div class="text-center mt-8">
        <RouterLink
          to="/product"
          class="inline-block border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-2 px-6 rounded-lg transition duration-300"
        >
          查看所有商品
        </RouterLink>
      </div>
    </section>
  </main>
</template>
