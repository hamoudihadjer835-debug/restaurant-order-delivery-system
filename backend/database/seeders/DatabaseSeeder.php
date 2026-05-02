<?php

namespace Database\Seeders;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\User;
use App\Models\Coupon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Users ─────────────────────────────────────────
        User::create([
            'name'     => 'Admin',
            'email'    => 'admin@restaurant.com',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);

        User::create([
            'name'     => 'Customer Test',
            'email'    => 'customer@restaurant.com',
            'password' => Hash::make('password'),
            'role'     => 'customer',
            'phone'    => '0555123456',
            'address'  => '123 Main Street',
        ]);

        User::create([
            'name'     => 'Delivery Worker',
            'email'    => 'delivery@restaurant.com',
            'password' => Hash::make('password'),
            'role'     => 'delivery',
            'phone'    => '0666789012',
        ]);

        // ── Menu Categories ───────────────────────────────
        $categories = [
            ['name' => 'Pizza',     'sort_order' => 1],
            ['name' => 'Burgers',   'sort_order' => 2],
            ['name' => 'Pasta',     'sort_order' => 3],
            ['name' => 'Salads',    'sort_order' => 4],
            ['name' => 'Drinks',    'sort_order' => 5],
            ['name' => 'Desserts',  'sort_order' => 6],
        ];

        foreach ($categories as $cat) {
            MenuCategory::create($cat);
        }

        // ── Menu Items ────────────────────────────────────
        $items = [
            // Pizza
            ['category_id' => 1, 'name' => 'Pizza Napoletana', 'description' => 'Classic tomato sauce with mozzarella', 'price' => 290, 'prep_time' => 20],
            ['category_id' => 1, 'name' => 'Pizza Sauna',      'description' => 'Special house pizza with pepperoni',    'price' => 350, 'prep_time' => 22],
            ['category_id' => 1, 'name' => 'Pizza Margherita', 'description' => 'Fresh basil and buffalo mozzarella',    'price' => 270, 'prep_time' => 18],
            // Burgers
            ['category_id' => 2, 'name' => 'American Burger',  'description' => 'Double beef patty with cheddar',        'price' => 490, 'prep_time' => 15],
            ['category_id' => 2, 'name' => 'Crispy Chicken',   'description' => 'Crispy fried chicken with coleslaw',    'price' => 420, 'prep_time' => 15],
            // Pasta
            ['category_id' => 3, 'name' => 'Spaghetti Bolognese', 'description' => 'Classic meat sauce pasta',           'price' => 320, 'prep_time' => 25],
            ['category_id' => 3, 'name' => 'Penne Arrabbiata',    'description' => 'Spicy tomato sauce',                 'price' => 280, 'prep_time' => 20],
            // Drinks
            ['category_id' => 5, 'name' => 'Fresh Orange Juice', 'description' => 'Freshly squeezed oranges',           'price' => 120, 'prep_time' => 5],
            ['category_id' => 5, 'name' => 'Coca Cola',          'description' => '330ml can',                          'price' => 80,  'prep_time' => 2],
        ];

        foreach ($items as $item) {
            MenuItem::create($item);
        }

        // ── Coupons ───────────────────────────────────────
        Coupon::create([
            'code'             => 'WELCOME10',
            'discount_percent' => 10,
            'max_uses'         => 100,
            'expires_at'       => now()->addMonths(3),
        ]);

        Coupon::create([
            'code'             => 'SUMMER20',
            'discount_percent' => 20,
            'max_uses'         => 50,
            'expires_at'       => now()->addMonth(),
        ]);
    }
}
