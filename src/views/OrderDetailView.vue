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
      <div class="mb-6">
        <p class="text-lg font-semibold">訂單編號: {{ order.orderNumber }}</p>
        <p class="text-lg">訂單成立時間: {{ order.createdAt || '-' }}</p>
        <p class="text-lg">訂單狀態: {{ orderStatusText(order.orderStatus) }}</p>
      </div>
      <div class="mb-6">
        <p class="text-lg font-semibold">顧客資訊</p>
        <p class="text-lg">姓名: {{ order.customerName }}</p>
        <p class="text-lg">電話: {{ order.customerPhone }}</p>
        <p class="text-lg">信箱: {{ order.customerEmail }}</p>
        <p class="text-lg">地址: {{ order.customerAddress }}</p>
      </div>
      <div class="mb-6">
        <p class="text-lg font-semibold">付款資訊</p>
        <p class="text-lg">付款方式: {{ order.paymentMethod }}</p>
        <p class="text-lg">金流供應商: {{ order.paymentProvider }}</p>
        <p class="text-lg">付款狀態: {{ paymentStatusText(order.paymentStatus) }}</p>
        <p class="text-lg">付款時間: {{ order.paymentTime || '-' }}</p>
      </div>
      <div class="mb-6">
        <p class="text-lg font-semibold">物流資訊</p>
        <p class="text-lg">物流方式: {{ order.logisticsMethod }}</p>
        <p class="text-lg">物流供應商: {{ order.logisticsProvider }}</p>
        <p class="text-lg">物流狀態: {{ logisticsStatusText(order.logisticsStatus) }}</p>
        <p class="text-lg">物流追蹤碼: {{ order.logisticsTrackingNumber || '-' }}</p>
      </div>
      <div v-if="order.cvsInfo" class="mb-6">
        <p class="text-lg font-semibold">超商資訊</p>
        <p class="text-lg">店名: {{ order.cvsInfo.cvsName }}</p>
        <p class="text-lg">店號: {{ order.cvsInfo.cvsId }}</p>
        <p class="text-lg">地址: {{ order.cvsInfo.cvsAddress }}</p>
      </div>
      <div class="mb-6">
        <p class="text-lg font-semibold mb-2">商品明細</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="(product, idx) in order.orderProducts" :key="idx" class="flex items-center border rounded-lg p-4 bg-white shadow">
            <img :src="product.firstPhoto" alt="商品圖片" class="w-20 h-20 object-cover rounded mr-4" />
            <div class="flex-1">
              <p class="font-semibold">{{ product.name }}</p>
              <p>單價: ${{ product.price }}</p>
              <p>數量: {{ product.quantity }}</p>
              <p>小計: ${{ product.price * product.quantity }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="mb-6">
        <p class="text-lg">手續費: ${{ order.feeCost }}</p>
        <p class="text-lg">運費: ${{ order.shippingCost }}</p>
        <p class="text-lg font-bold">訂單總金額: ${{ order.totalPrice }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import orderApi from '../api/orderApi';

const route = useRoute();
const order = ref({});
const loading = ref(true);
const error = ref(null);

const orderStatusText = (status) => {
  switch (status) {
    case 0: return '未建立';
    case 1: return '已建立';
    case 2: return '處理中';
    case 3: return '已完成';
    case 10: return '已取消';
    default: return '-';
  }
};
const paymentStatusText = (status) => {
  switch (status) {
    case 0: return '未付款';
    case 1: return '已付款';
    case 10: return '已取消';
    case 11: return '已退款';
    default: return '-';
  }
};
const logisticsStatusText = (status) => {
  switch (status) {
    case 0: return '未出貨';
    case 1: return '已出貨';
    case 2: return '已送達';
    case 10: return '已取消';
    case 11: return '已退貨';
    default: return '-';
  }
};

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