<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh]">
    <h1 class="text-2xl font-bold mb-6">搜尋訂單</h1>
    <form @submit.prevent="onSearch" class="flex space-x-2">
      <input v-model="orderNo" type="text" placeholder="請輸入訂單編號" class="border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">查詢</button>
    </form>
    <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const orderNo = ref('');
const error = ref('');
const router = useRouter();

function onSearch() {
  if (!orderNo.value.trim()) {
    error.value = '請輸入訂單編號';
    return;
  }
  error.value = '';
  router.push(`/order/detail/${orderNo.value.trim()}`);
}
</script> 