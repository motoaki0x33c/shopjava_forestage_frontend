<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCart } from '../composables/useCart';

const router = useRouter();
const { cartCount, fetchCart, setupStorageListener } = useCart();

// 前往購物車頁面
const goToCart = () => {
  router.push('/cart');
};

// 掛載時獲取購物車資料並設置監聽器
let removeListener;
onMounted(() => {
  fetchCart();
  removeListener = setupStorageListener();
});

// 組件卸載時移除監聽器
onUnmounted(() => {
  if (removeListener) removeListener();
});
</script>

<template>
  <button @click="goToCart" class="text-gray-700 hover:text-blue-600 relative">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
    <span v-if="cartCount > 0" class="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {{ cartCount > 99 ? '99+' : cartCount }}
    </span>
  </button>
</template> 