<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import productApi from '@/api/productApi';

const featuredProducts = ref([]);
const categories = ref([]);
const isLoading = ref(true);

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
          <img :src="product.firstPhoto" :alt="product.name" class="w-full h-48 object-cover">
          <div class="p-4">
            <h3 class="text-lg font-semibold mb-2">{{ product.name }}</h3>
            <p class="font-bold text-xl mb-3">${{ product.price.toLocaleString() }}</p>
            <RouterLink 
              :to="`/product/${product.route}`" 
              class="block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              商品詳情
            </RouterLink>
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
