<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    // GET /api/admin/orders
    public function index(Request $request)
    {
        $query = Order::with(['user', 'items.menuItem', 'delivery.worker']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('order_number', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', '%' . $request->search . '%'));
            });
        }

        $orders = $query->latest()->paginate(10);

        return response()->json($orders);
    }

    // PUT /api/admin/orders/{id}/status
    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,preparing,ready,out_for_delivery,delivered,cancelled',
        ]);

        $order->update(['status' => $request->status]);

        return response()->json($order->fresh(['user', 'items.menuItem', 'delivery']));
    }

    // GET /api/admin/dashboard
    public function dashboard()
    {
        $today = today();

        $totalCustomers  = User::where('role', 'customer')->count();
        $totalDelivery   = User::where('role', 'delivery')->count();
        $todayOrders     = Order::whereDate('created_at', $today)->count();
        $todayRevenue    = Order::whereDate('created_at', $today)
                            ->where('status', Order::STATUS_DELIVERED)
                            ->sum('total');
        $pendingOrders   = Order::where('status', Order::STATUS_PENDING)->count();
        $activeOrders    = Order::whereNotIn('status', [
                            Order::STATUS_DELIVERED,
                            Order::STATUS_CANCELLED
                           ])->count();
        $completedToday  = Order::whereDate('created_at', $today)
                            ->where('status', Order::STATUS_DELIVERED)
                            ->count();

        $recentOrders = Order::with(['user', 'items'])
                            ->latest()
                            ->take(5)
                            ->get()
                            ->map(fn($o) => [
                                'id'           => $o->id,
                                'order_number' => $o->order_number,
                                'status'       => $o->status,
                                'total'        => $o->total,
                                'created_at'   => $o->created_at,
                                'user'         => ['name' => $o->user?->name],
                                'items'        => $o->items->count(),
                            ]);

        $weeklyRevenue = Order::where('status', Order::STATUS_DELIVERED)
                            ->where('created_at', '>=', now()->subDays(7))
                            ->selectRaw('DATE(created_at) as date, SUM(total) as revenue')
                            ->groupBy('date')
                            ->orderBy('date')
                            ->get();

        return response()->json([
            'today_orders'     => $todayOrders,
            'today_revenue'    => $todayRevenue,
            'pending_orders'   => $pendingOrders,
            'active_orders'    => $activeOrders,
            'total_users'      => $totalCustomers,
            'total_deliveries' => $totalDelivery,
            'completed_today'  => $completedToday,
            'avg_prep_time'    => 18,
            'recent_orders'    => $recentOrders,
            'weekly_revenue'   => $weeklyRevenue,
        ]);
    }
}
