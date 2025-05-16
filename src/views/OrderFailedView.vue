<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-red-600">訂單建立失敗</h1>
    <p class="text-lg text-gray-700">很抱歉，您的訂單建立失敗。請檢查您的付款資訊或稍後再試。</p>
    <router-link to="/cart" class="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition">
      返回購物車
    </router-link>
  </div>
</template>

<script setup>
// 此頁面不需要任何邏輯
</script>

<style scoped>
.container {
  max-width: 600px;
  text-align: center;
}
</style> 