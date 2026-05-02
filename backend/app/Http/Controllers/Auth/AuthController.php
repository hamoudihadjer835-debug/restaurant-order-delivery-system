<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use App\Models\Delivery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'phone'    => 'nullable|string|max:20',
            'role'     => 'nullable|in:customer,delivery',
        ]);

        /** @var User $user */
        $user  = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'phone'    => $data['phone'] ?? null,
            'role'     => $data['role'] ?? 'customer',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json(['user' => $user, 'token' => $token], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        /** @var User $user */
        $user = Auth::user();

        if (!$user->is_active) {
            Auth::logout();
            return response()->json(['message' => 'Account is deactivated.'], 403);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json(['user' => $user, 'token' => $token]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $data = $request->validate([
            'name'    => 'sometimes|required|string|max:255',
            'phone'   => 'sometimes|nullable|string|max:20',
            'address' => 'sometimes|nullable|string|max:500',
            'lat'     => 'sometimes|nullable|numeric',
            'lng'     => 'sometimes|nullable|numeric',
        ]);

        // Handle avatar upload
        if ($request->hasFile('avatar') && $request->file('avatar')->isValid()) {
            $file    = $request->file('avatar');
            $allowed = ['jpg','jpeg','png','webp','gif'];
            if (in_array(strtolower($file->getClientOriginalExtension()), $allowed)) {
                // Delete old avatar
                if ($user->avatar && !str_starts_with($user->avatar, 'http')) {
                    Storage::disk('public')->delete($user->avatar);
                }
                $data['avatar'] = $file->store('avatars', 'public');
            }
        }

        $user->update($data);
        return response()->json($user->fresh());
    }

    // GET /api/profile/stats — user statistics
    public function stats(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->role === 'customer') {
            $orders        = Order::where('user_id', $user->id);
            $totalOrders   = $orders->count();
            $totalSpent    = Order::where('user_id', $user->id)
                                ->where('status', 'delivered')->sum('total');
            $delivered     = Order::where('user_id', $user->id)
                                ->where('status', 'delivered')->count();
            $cancelled     = Order::where('user_id', $user->id)
                                ->where('status', 'cancelled')->count();

            // Favorite item
            $favoriteItem = \App\Models\OrderItem::whereHas('order', fn($q) => $q->where('user_id', $user->id))
                ->selectRaw('menu_item_id, SUM(quantity) as total_qty')
                ->groupBy('menu_item_id')
                ->orderByDesc('total_qty')
                ->with('menuItem')
                ->first();

            // My reviews
            $reviews = \App\Models\Rating::where('user_id', $user->id)
                ->with('order')
                ->latest()
                ->take(5)
                ->get();

            // Loyalty badge
            $badge = $totalOrders >= 20 ? 'VIP Customer' :
                    ($totalOrders >= 10 ? 'Regular' :
                    ($totalOrders >= 3  ? 'Loyal'   : 'New Customer'));

            return response()->json([
                'role'          => 'customer',
                'total_orders'  => $totalOrders,
                'total_spent'   => round($totalSpent, 2),
                'delivered'     => $delivered,
                'cancelled'     => $cancelled,
                'favorite_item' => $favoriteItem?->menuItem?->name,
                'badge'         => $badge,
                'reviews'       => $reviews,
                'member_since'  => $user->created_at,
            ]);
        }

        if ($user->role === 'delivery') {
            $deliveries     = Delivery::where('worker_id', $user->id);
            $total          = $deliveries->count();
            $completed      = $deliveries->whereNotNull('delivered_at')->count();
            $todayCount     = Delivery::where('worker_id', $user->id)
                                ->whereDate('delivered_at', today())->count();

            // Average rating from customers
            $avgRating = \App\Models\Rating::whereHas('order.delivery', fn($q) => $q->where('worker_id', $user->id))
                ->avg('delivery_rating');

            // Weekly deliveries
            $weekly = Delivery::where('worker_id', $user->id)
                ->whereNotNull('delivered_at')
                ->where('delivered_at', '>=', now()->subDays(7))
                ->selectRaw('DATE(delivered_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            // Recent reviews about this delivery worker
            $reviews = \App\Models\Rating::whereHas('order.delivery', fn($q) => $q->where('worker_id', $user->id))
                ->with(['user', 'order'])
                ->latest()
                ->take(5)
                ->get();

            return response()->json([
                'role'           => 'delivery',
                'total_deliveries' => $total,
                'completed'      => $completed,
                'today'          => $todayCount,
                'avg_rating'     => round($avgRating, 1) ?: 0,
                'weekly_stats'   => $weekly,
                'reviews'        => $reviews,
                'member_since'   => $user->created_at,
            ]);
        }

        if ($user->role === 'admin') {
            return response()->json([
                'role'          => 'admin',
                'total_orders'  => Order::count(),
                'total_revenue' => round(Order::where('status','delivered')->sum('total'), 2),
                'total_users'   => User::where('role','customer')->count(),
                'total_delivery'=> User::where('role','delivery')->count(),
                'pending_orders'=> Order::where('status','pending')->count(),
                'today_orders'  => Order::whereDate('created_at', today())->count(),
                'member_since'  => $user->created_at,
            ]);
        }

        return response()->json(['role' => $user->role]);
    }

    public function googleRedirect()
    {
        return response()->json(['message' => 'Google OAuth not configured.'], 501);
    }

    public function googleCallback()
    {
        return response()->json(['message' => 'Google OAuth not configured.'], 501);
    }
}
