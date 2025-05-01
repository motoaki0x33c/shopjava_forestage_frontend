<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="bg-white shadow-md">
    <div class="container mx-auto px-4 py-4">
      <div class="flex justify-between items-center">
        <!-- Logo -->
        <div class="text-2xl font-bold text-blue-600">
          <RouterLink to="/">JavaShop</RouterLink>
        </div>
        
        <!-- 導航選單 -->
        <nav class="flex space-x-6">
          <RouterLink 
            to="/" 
            class="text-gray-700 hover:text-blue-600 font-medium"
            active-class="text-blue-600 font-bold"
          >
            首頁
          </RouterLink>
          <RouterLink 
            to="/product" 
            class="text-gray-700 hover:text-blue-600 font-medium"
            active-class="text-blue-600 font-bold"
          >
            商品列表
          </RouterLink>
        </nav>
        
        <!-- 用戶選單 -->
        <div class="flex items-center space-x-4">
          <button class="text-gray-700 hover:text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button class="text-gray-700 hover:text-blue-600 relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
          </button>
          <button class="text-gray-700 hover:text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>

  <main>
    <RouterView />
  </main>

  <footer class="bg-gray-800 text-white py-8 mt-10">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- 關於我們 -->
        <div>
          <h3 class="text-xl font-semibold mb-4">關於 JavaShop</h3>
          <p class="text-gray-400">JavaShop 是一個提供高品質商品的購物平台，致力於為顧客提供最佳的購物體驗。</p>
        </div>
        
        <!-- 快速連結 -->
        <div>
          <h3 class="text-xl font-semibold mb-4">快速連結</h3>
          <ul class="space-y-2 text-gray-400">
            <li><RouterLink to="/" class="hover:text-white">首頁</RouterLink></li>
            <li><RouterLink to="/product" class="hover:text-white">商品列表</RouterLink></li>
            <li><a href="#" class="hover:text-white">關於我們</a></li>
            <li><a href="#" class="hover:text-white">聯絡我們</a></li>
          </ul>
        </div>
        
        <!-- 聯絡資訊 -->
        <div>
          <h3 class="text-xl font-semibold mb-4">聯絡我們</h3>
          <ul class="space-y-2 text-gray-400">
            <li>地址：台北市信義區信義路五段1號</li>
            <li>電話：(02) 1234-5678</li>
            <li>電子郵件：info@javashop.com</li>
          </ul>
        </div>
      </div>
      
      <div class="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400">
        <p>&copy; 2024 JavaShop. 版權所有。</p>
      </div>
    </div>
  </footer>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap');

body {
  font-family: 'Noto Sans TC', sans-serif;
  background-color: #f9fafb;
  color: #1f2937;
}
</style>
