# 🍕 Brayin Food — React Frontend

## Setup (one time)

```bash
cd restaurant-app
npm install
npm run dev
```
App runs at → http://localhost:5173

---

## Install commands

```bash
npm install react react-dom react-router-dom axios leaflet react-leaflet recharts remixicon
npm install -D tailwindcss postcss autoprefixer @vitejs/plugin-react vite
```

---

## Folder structure

```
src/
├── assets/              ← logo.png
├── components/
│   ├── Layout.jsx       ← sidebar + outlet wrapper
│   ├── Sidebar.jsx      ← navigation by role
│   ├── FoodCard.jsx     ← menu item card
│   ├── OrderCard.jsx    ← order with details
│   └── Modal.jsx        ← reusable modal
├── context/
│   ├── AuthContext.jsx  ← login/logout/user state
│   └── CartContext.jsx  ← cart items, totals
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── customer/
│   │   ├── Menu.jsx     ← browse + search + categories
│   │   ├── Cart.jsx     ← cart + address + coupon + place order
│   │   ├── MyOrders.jsx ← order history + rate
│   │   └── Profile.jsx  ← edit profile
│   ├── delivery/
│   │   ├── Dashboard.jsx ← stats + available orders + chart
│   │   ├── MyOrders.jsx  ← accept/picked/delivered
│   │   └── OrderMap.jsx  ← live GPS map (OpenStreetMap)
│   └── admin/
│       ├── Dashboard.jsx   ← stats + revenue chart
│       ├── OrderManager.jsx ← table + status update
│       ├── UserDirectory.jsx ← CRUD users
│       └── MenuEditor.jsx   ← CRUD menu items + categories
├── services/
│   └── api.js           ← all Axios calls
├── App.jsx              ← routes + role guards
└── main.jsx
```

---

## Food images
Put your food photos in:
```
public/images/food/
  pizza-napolitan.jpg
  american-burger.jpg
  pizza-sauna.jpg
  ...
```
Reference in DB as: `menu-items/filename.jpg`  
After `php artisan storage:link`, images are served from `/storage/`

---

## Colors (tailwind.config.js)
- Primary orange: `#C8622A`
- Background beige: `#F5F0E8`

---

## Backend must be running at
`http://localhost:8000`  
The Vite proxy forwards `/api` → `http://localhost:8000/api`
