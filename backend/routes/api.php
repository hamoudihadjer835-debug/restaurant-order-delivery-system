<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Customer\MenuController;
use App\Http\Controllers\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Customer\ReviewController as CustomerReviewController;
use App\Http\Controllers\Delivery\OrderController as DeliveryOrderController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\MenuController as AdminMenuController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\NotificationController;

// ══════════════════════════════════════════
// PUBLIC
// ══════════════════════════════════════════
Route::prefix('auth')->group(function () {
    Route::post('register',       [AuthController::class, 'register']);
    Route::post('login',          [AuthController::class, 'login']);
    Route::get('google',          [AuthController::class, 'googleRedirect']);
    Route::get('google/callback', [AuthController::class, 'googleCallback']);
});

Route::get('menu/categories',        [MenuController::class, 'categories']);
Route::get('menu/items',             [MenuController::class, 'items']);
Route::get('menu/items/{menuItem}',  [MenuController::class, 'show']);

// Public reviews for landing page
Route::get('reviews/public',         [CustomerReviewController::class, 'public']);

// ══════════════════════════════════════════
// AUTHENTICATED
// ══════════════════════════════════════════
Route::middleware('auth:sanctum')->group(function () {

    Route::post('auth/logout',   [AuthController::class, 'logout']);
    Route::get('auth/me',        [AuthController::class, 'me']);
    Route::patch("auth/profile", [AuthController::class, "updateProfile"]);
    Route::post("auth/avatar",   [AuthController::class, "updateProfile"]);
    Route::get("auth/stats",     [AuthController::class, "stats"]);

    // Notifications (polling)
    Route::get('notifications',      [NotificationController::class, 'index']);
    Route::get('notifications/all',  [NotificationController::class, 'all']);

    // ── Customer ──────────────────────────
    Route::prefix('orders')->group(function () {
        Route::post('/',               [CustomerOrderController::class, 'store']);
        Route::get('/my',              [CustomerOrderController::class, 'myOrders']);
        Route::get('/{order}',         [CustomerOrderController::class, 'show']);
        Route::post('/{order}/cancel', [CustomerOrderController::class, 'cancel']);
        Route::post('/{order}/rate',   [CustomerOrderController::class, 'rate']);
    });
    Route::post('coupons/check', [CustomerOrderController::class, 'checkCoupon']);

    // ── Delivery ──────────────────────────
    Route::prefix('delivery')->middleware('isDelivery')->group(function () {
        Route::get('dashboard',                 [DeliveryOrderController::class, 'dashboard']);
        Route::get('orders/available',          [DeliveryOrderController::class, 'available']);
        Route::get('orders/my',                 [DeliveryOrderController::class, 'myOrders']);
        Route::post('orders/{order}/accept',    [DeliveryOrderController::class, 'accept']);
        Route::post('orders/{order}/picked',    [DeliveryOrderController::class, 'markPicked']);
        Route::post('orders/{order}/delivered', [DeliveryOrderController::class, 'markDelivered']);
        Route::patch('location',                [DeliveryOrderController::class, 'updateLocation']);
    });

    // ── Admin ─────────────────────────────
    Route::prefix('admin')->middleware('isAdmin')->group(function () {
        Route::get('dashboard',                        [AdminOrderController::class, 'dashboard']);
        Route::get('orders',                           [AdminOrderController::class, 'index']);
        Route::put('orders/{order}/status',            [AdminOrderController::class, 'updateStatus']);
        Route::get('users',                            [AdminUserController::class, 'index']);
        Route::post('users',                           [AdminUserController::class, 'store']);
        Route::put('users/{user}',                     [AdminUserController::class, 'update']);
        Route::delete('users/{user}',                  [AdminUserController::class, 'destroy']);
        Route::get('menu/categories',                  [AdminMenuController::class, 'categories']);
        Route::post('menu/categories',                 [AdminMenuController::class, 'storeCategory']);
        Route::put('menu/categories/{menuCategory}',   [AdminMenuController::class, 'updateCategory']);
        Route::delete('menu/categories/{menuCategory}',[AdminMenuController::class, 'destroyCategory']);
        Route::get('menu/items',                       [AdminMenuController::class, 'items']);
        Route::post('menu/items',                      [AdminMenuController::class, 'storeItem']);
        Route::put('menu/items/{menuItem}',            [AdminMenuController::class, 'updateItem']);
        Route::delete('menu/items/{menuItem}',         [AdminMenuController::class, 'destroyItem']);
        // Reviews
        Route::get('reviews',                          [AdminReviewController::class, 'index']);
        Route::get('reviews/stats',                    [AdminReviewController::class, 'stats']);
        Route::delete('reviews/{rating}',              [AdminReviewController::class, 'destroy']);
    });
});
