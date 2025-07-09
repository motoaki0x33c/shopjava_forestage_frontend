import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: import('../views/HomeView.vue'),
    },
    {
      path: '/home',
      name: 'home1',
      component: import('../views/HomeView.vue'),
    },
    {
      path: '/product',
      name: 'product',
      component: () => import('../views/ProductView.vue'),
    },
    {
      path: '/product/:route',
      name: 'productDetail',
      component: () => import('../views/ProductDetailView.vue'),
      props: true
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/CartView.vue')
    },
    {
      path: '/order/detail/:orderNumber',
      name: 'orderDetail',
      component: () => import('../views/OrderDetailView.vue'),
      props: true
    },
    {
      path: '/order/failed',
      name: 'orderFailed',
      component: () => import('../views/OrderFailedView.vue')
    },
    {
      path: '/order/search',
      name: 'orderSearch',
      component: () => import('../views/OrderSearchView.vue')
    },
  ],
})

export default router
