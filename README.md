<div align="center">

<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
<img src="https://img.shields.io/badge/Laravel-11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" />
<img src="https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
<img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />

#  Brayin Food — Restaurant Order & Delivery System

**A full-stack web application for managing restaurant orders and real-time delivery tracking.**  
Built as a university Web Development project — University of Guelma, Algeria 🇩🇿

[Live Demo](#) · [Frontend](#frontend-setup) · [Backend](#backend-setup) · [Screenshots](#screenshots)

</div>

---

##  Project Overview

**Brayin Food** is a complete restaurant management and delivery system designed to be production-ready and easily scalable. It is not just a menu display website — it is a **full system** that any restaurant or startup can rely on to manage orders and deliveries efficiently.

### What does this system offer?

| Role | Capabilities |
|------|-------------|
|  **Admin** | Full dashboard — manage users, orders, menu, reviews & analytics |
|  **Customer** | Browse menu, place orders, track delivery, rate & review |
|  **Delivery** | Accept orders, real-time GPS map navigation, performance stats |

---

##  Key Features

###  Authentication
- Email + Password login & registration
- Role-based access control (Admin / Customer / Delivery)
- Laravel Sanctum token authentication
- Google OAuth ready

###  Customer
- Browse menu with categories and search
- Add to cart with quantity management
- Apply discount coupons
- Place orders with delivery address
- Real-time order tracking with status updates
- Rate food & delivery after order completion
- Order history with full details

###  Admin Dashboard
- Live order management with status updates
- User directory (CRUD) — add/edit/delete users
- Menu editor — manage items, categories, images
- Reviews panel with rating distribution charts
- Weekly revenue & order analytics charts
- Real-time notifications for new orders

###  Delivery Worker
- View and accept available orders
- Interactive GPS map (OpenStreetMap / Leaflet)
- Mark orders as picked up / delivered
- Weekly delivery performance chart
- Customer rating display

###  Notifications
- Real-time polling system (15-second interval)
- Role-specific notifications:
  - Admin: new orders
  - Customer: order status changes
  - Delivery: available orders

###  Reviews & Ratings
- Star ratings for food quality and delivery
- Customer comments
- Public reviews displayed on landing page
- Admin review management

###  Landing Page
- Animated hero section with 3D food images
- Mouse parallax effects
- Menu showcase with auto-highlight
- Customer reviews section
- Google Maps integration
- Fully responsive (mobile + desktop)

---

##  Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18 | UI Framework |
| Vite | 5 | Build tool |
| Tailwind CSS | 3 | Styling |
| React Router | 6 | Navigation |
| Axios | 1.6 | HTTP Client |
| Recharts | 2.5 | Charts & Analytics |
| React Leaflet | 4.2 | Interactive Maps |
| Remixicon | 4.2 | Icons |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Laravel | 11 | PHP Framework |
| MySQL | 8 | Database |
| Laravel Sanctum | 4 | API Authentication |
| Laravel Socialite | 5 | Google OAuth |

---

##  Project Structure

```
restaurant-order-delivery-system/
├── frontend/                    # React + Vite application
│   ├── public/
│   │   └── images/
│   │       ├── food/            # Food item images
│   │       └── Landing page/    # Landing page images
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx      # Role-based navigation
│   │   │   ├── FoodCard.jsx     # Menu item card
│   │   │   ├── OrderCard.jsx    # Order display card
│   │   │   ├── Modal.jsx        # Reusable modal
│   │   │   ├── NotificationBell.jsx  # Live notifications
│   │   │   ├── AvatarUpload.jsx # Profile picture upload
│   │   │   └── Layout.jsx       # App layout wrapper
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Authentication state
│   │   │   └── CartContext.jsx  # Shopping cart state
│   │   ├── pages/
│   │   │   ├── Landing.jsx      # Public landing page
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── Register.jsx     # Register page
│   │   │   ├── customer/
│   │   │   │   ├── Menu.jsx     # Browse & search menu
│   │   │   │   ├── Cart.jsx     # Cart & checkout
│   │   │   │   ├── MyOrders.jsx # Order history
│   │   │   │   └── Profile.jsx  # Customer profile + stats
│   │   │   ├── delivery/
│   │   │   │   ├── Dashboard.jsx   # Delivery dashboard
│   │   │   │   ├── MyOrders.jsx    # Active & past deliveries
│   │   │   │   ├── OrderMap.jsx    # GPS navigation map
│   │   │   │   └── Profile.jsx     # Delivery profile + ratings
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx   # Admin overview
│   │   │       ├── OrderManager.jsx # Order management
│   │   │       ├── UserDirectory.jsx # User management
│   │   │       ├── MenuEditor.jsx  # Menu management
│   │   │       ├── Reviews.jsx     # Reviews management
│   │   │       └── Profile.jsx     # Admin profile
│   │   ├── services/
│   │   │   └── api.js           # All API calls (Axios)
│   │   ├── App.jsx              # Routes & guards
│   │   └── main.jsx             # Entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── backend/                     # Laravel 11 API
    ├── app/
    │   ├── Http/
    │   │   ├── Controllers/
    │   │   │   ├── Auth/        # AuthController
    │   │   │   ├── Admin/       # OrderController, UserController, MenuController, ReviewController
    │   │   │   ├── Customer/    # MenuController, OrderController, ReviewController
    │   │   │   ├── Delivery/    # OrderController
    │   │   │   └── NotificationController.php
    │   │   └── Middleware/
    │   │       ├── IsAdmin.php
    │   │       └── IsDelivery.php
    │   └── Models/
    │       ├── User.php
    │       ├── Order.php
    │       ├── OrderItem.php
    │       ├── MenuItem.php
    │       ├── MenuCategory.php
    │       ├── Delivery.php
    │       ├── Rating.php
    │       └── Coupon.php
    ├── database/
    │   ├── migrations/          # All table migrations
    │   └── seeders/             # DatabaseSeeder with test data
    └── routes/
        └── api.php              # All REST API endpoints
```

---

##  Database Schema

```
users               — id, name, email, password, role, phone, avatar, address, lat, lng
menu_categories     — id, name, image, is_active, sort_order
menu_items          — id, category_id, name, description, price, image, is_available, prep_time
coupons             — id, code, discount_percent, max_uses, used_count, expires_at
orders              — id, order_number, user_id, coupon_id, status, payment_method, total, delivery_address
order_items         — id, order_id, menu_item_id, quantity, unit_price, subtotal
deliveries          — id, order_id, worker_id, current_lat, current_lng, picked_at, delivered_at
ratings             — id, order_id, user_id, food_rating, delivery_rating, comment
personal_access_tokens — (Sanctum)
```

---

##  Local Setup

### Prerequisites
- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL (via XAMPP recommended)
- Git

---

###  Backend Setup

```bash
# 1. Go to backend folder
cd backend

# 2. Install PHP dependencies
composer install

# 3. Copy environment file
cp .env.example .env

# 4. Edit .env — set your database
# DB_DATABASE=restaurant_db
# DB_USERNAME=root
# DB_PASSWORD=

# 5. Generate app key
php artisan key:generate

# 6. Create database in phpMyAdmin
# → Open: http://localhost/phpmyadmin
# → New → Name: restaurant_db → Create

# 7. Run migrations and seed test data
php artisan migrate --seed

# 8. Link storage for file uploads
php artisan storage:link

# 9. Start the server
php artisan serve
# → Running on: http://localhost:8000
```

---

###  Frontend Setup

```bash
# 1. Go to frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# → Running on: http://localhost:5173
```

---

###  Open the Application

| URL | Description |
|-----|-------------|
| `http://localhost:5173/landing` |  Public landing page |
| `http://localhost:5173/login` |  Login page |
| `http://localhost:5173/register` |  Register page |
| `http://localhost:5173/customer/menu` |  Customer dashboard |
| `http://localhost:5173/delivery/dashboard` |  Delivery dashboard |
| `http://localhost:5173/admin/dashboard` |  Admin dashboard |

---

##  Test Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
|  Admin | admin@restaurant.com | password |
|  Customer | customer@restaurant.com | password |
|  Delivery | delivery@restaurant.com | password |

---

##  API Endpoints

### Public
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/menu/categories
GET    /api/menu/items
GET    /api/reviews/public
```

### Customer (authenticated)
```
POST   /api/orders              — Place new order
GET    /api/orders/my           — Order history
GET    /api/orders/{id}         — Order details
POST   /api/orders/{id}/cancel  — Cancel order
POST   /api/orders/{id}/rate    — Rate order
POST   /api/coupons/check       — Validate coupon
```

### Delivery (authenticated)
```
GET    /api/delivery/dashboard
GET    /api/delivery/orders/available
POST   /api/delivery/orders/{id}/accept
POST   /api/delivery/orders/{id}/delivered
PATCH  /api/delivery/location
```

### Admin (authenticated)
```
GET    /api/admin/dashboard
GET    /api/admin/orders
PUT    /api/admin/orders/{id}/status
GET    /api/admin/users
POST   /api/admin/users
GET    /api/admin/menu/items
POST   /api/admin/menu/items
GET    /api/admin/reviews
DELETE /api/admin/reviews/{id}
```

---

## 📱 Screenshots

> Landing Page, Customer Menu, Admin Dashboard, Delivery Map

*(Add screenshots here after running the project)*

---

##  Developer

**Hamoudi Hadjer**  
University of Guelma — Algeria  
Web Development Course — 2025/2026

---

##  License

This project is built for educational purposes as a university project.

---

<div align="center">
  Made with ❤️ using React + Laravel
</div>
