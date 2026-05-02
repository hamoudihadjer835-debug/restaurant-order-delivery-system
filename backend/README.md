# 🍕 Restaurant Backend — Laravel 11 + MySQL

## Setup Commands (run once)

```bash
# 1. Create Laravel project
composer create-project laravel/laravel backend
cd backend

# 2. Copy all files from this folder into the project

# 3. Install packages
composer require laravel/sanctum
composer require laravel/socialite
composer require pusher/pusher-php-server

# 4. Publish Sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# 5. Edit .env file (see below)

# 6. Run migrations + seed
php artisan migrate --seed

# 7. Link storage (for food images)
php artisan storage:link

# 8. Start server
php artisan serve
```

---

## .env Settings

```
APP_NAME="Restaurant App"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=restaurant_db
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:5173
FRONTEND_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your_id
PUSHER_APP_KEY=your_key
PUSHER_APP_SECRET=your_secret
PUSHER_APP_CLUSTER=mt1

FILESYSTEM_DISK=public
```

---

## Register Middleware in bootstrap/app.php

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'isAdmin'    => \App\Http\Middleware\IsAdmin::class,
        'isDelivery' => \App\Http\Middleware\IsDelivery::class,
    ]);
})
```

## Add Google Socialite in config/services.php

```php
'google' => [
    'client_id'     => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect'      => env('GOOGLE_REDIRECT_URI'),
],
```

---

## Test Accounts (after seeding)

| Role     | Email                      | Password  |
|----------|---------------------------|-----------|
| Admin    | admin@restaurant.com       | password  |
| Customer | customer@restaurant.com    | password  |
| Delivery | delivery@restaurant.com    | password  |

---

## API Base URL
`http://localhost:8000/api`

All protected routes need header:
`Authorization: Bearer {token}`
