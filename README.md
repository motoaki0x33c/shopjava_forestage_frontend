# ShopJava 電商前台-前端

這是一個使用 Vue 3 + Vite 開發的電商網站前台-前端練習用專案。

## 技術棧

- Vue 3
- Vite
- Vue Router
- Composition API
- JavaScript

## 專案結構

```
src/
├── api/          # API 相關配置和請求
├── assets/       # 靜態資源文件
├── components/   # 可重用組件
├── composables/  # 組合式函數
├── router/       # 路由配置
├── views/        # 頁面組件
├── App.vue       # 根組件
└── main.js       # 應用入口
```

### 安裝依賴

```sh
npm install
```

### 開發環境運行

```sh
npm run dev
```

### 生產環境構建

```sh
npm run build
```

## 功能進度

- [x] 專案基礎架構搭建
- [x] 路由系統配置
- [x] API 請求封裝
- [x] 購物車功能
  - [x] 新增商品到購物車
  - [x] 更新購物車商品數量
  - [x] 取得購物車內容
- [x] 商品展示
  - [x] 商品列表
  - [x] 商品詳情
- [x] 金物流功能
  - [x] 取得可用金流和物流選項
  - [x] 計算購物車總金額（含金物流費用）
  - [x] 超商電子地圖整合
- [ ] 用戶認證系統
- [ ] 訂單管理
- [ ] 用戶中心

## API 整合說明

### 購物車功能
- 使用 token 識別購物車
- 支援新增、更新商品數量
- 自動計算商品總金額

### 金物流功能
- 支援多種金流和物流選項
- 整合綠界超商電子地圖
- 自動計算含運費的訂單總金額
- 支援超商取貨資訊傳遞

## 開發規範

1. 使用 Composition API 進行開發
2. 遵循 Vue 3 最佳實踐
3. API 請求統一在 `api` 目錄下管理

## 相關文檔

- [Vue 3 文檔](https://v3.vuejs.org/)
- [Vite 配置參考](https://vitejs.dev/config/)
