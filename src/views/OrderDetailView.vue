<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">訂單詳情</h1>
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">載入訂單資料...</p>
    </div>
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      {{ error }}
    </div>
    <div v-else>
      <p class="text-lg font-semibold">訂單編號: {{ order.id }}</p>
      <p class="text-lg">客戶姓名: {{ order.customerName }}</p>
      <p class="text-lg">客戶電話: {{ order.customerPhone }}</p>
      <p class="text-lg">客戶地址: {{ order.customerAddress }}</p>
      <p class="text-lg">付款方式: {{ order.paymentMethod }}</p>
      <p class="text-lg">物流方式: {{ order.logisticsMethod }}</p>
      <p class="text-lg">訂單總金額: ${{ order.totalPrice }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import orderApi from '../api/orderApi';

const route = useRoute();
const order = ref(null);
const loading = ref(true);
const error = ref(null);

const fetchOrderDetails = async () => {
  try {
    const { data } = await orderApi.getOrder(route.params.orderNumber);
    order.value = data;
  } catch (err) {
    error.value = '無法載入訂單資料';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchOrderDetails();
});
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style> 