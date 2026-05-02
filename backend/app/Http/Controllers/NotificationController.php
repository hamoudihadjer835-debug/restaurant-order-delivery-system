<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    // GET /api/notifications — polling
    public function index(Request $request)
    {
        $user  = $request->user();
        $since = $request->query('since');

        // Parse since safely
        try {
            $sinceTime = $since
                ? \Carbon\Carbon::parse($since)->subSeconds(5)
                : now()->subMinutes(1);
        } catch (\Exception $e) {
            $sinceTime = now()->subMinutes(1);
        }

        $notifications = [];

        // ── ADMIN ─────────────────────────────────────
        if ($user->role === 'admin') {
            $newOrders = Order::where('created_at', '>=', $sinceTime)
                ->with('user')
                ->latest()
                ->get();

            foreach ($newOrders as $order) {
                $notifications[] = [
                    'id'      => 'order-new-' . $order->id,
                    'type'    => 'new_order',
                    'title'   => '🛒 New Order Received',
                    'message' => ($order->user->name ?? 'Customer') . " placed order #{$order->order_number} — {$order->total} دج",
                    'link'    => '/admin/orders',
                    'time'    => $order->created_at,
                    'status'  => $order->status,
                ];
            }
        }

        // ── CUSTOMER ──────────────────────────────────
        if ($user->role === 'customer') {
            $updatedOrders = Order::where('user_id', $user->id)
                ->where('updated_at', '>=', $sinceTime)
                ->whereColumn('updated_at', '!=', 'created_at')
                ->get();

            $statusLabels = [
                'confirmed'        => '✅ Order Confirmed',
                'preparing'        => '🔥 Being Prepared',
                'ready'            => '📦 Ready for Pickup',
                'out_for_delivery' => '🚴 On the Way!',
                'delivered'        => '🎉 Delivered!',
                'cancelled'        => '❌ Order Cancelled',
            ];

            foreach ($updatedOrders as $order) {
                if (isset($statusLabels[$order->status])) {
                    $notifications[] = [
                        'id'      => 'status-' . $order->id . '-' . $order->status,
                        'type'    => 'order_status',
                        'title'   => $statusLabels[$order->status],
                        'message' => "Order #{$order->order_number} is now: {$order->status}",
                        'link'    => '/customer/orders',
                        'time'    => $order->updated_at,
                        'status'  => $order->status,
                    ];
                }
            }
        }

        // ── DELIVERY ──────────────────────────────────
        if ($user->role === 'delivery') {
            // Orders available for delivery (no delivery worker assigned yet)
            $availableOrders = Order::whereIn('status', ['confirmed', 'ready'])
                ->whereDoesntHave('delivery')
                ->where('updated_at', '>=', $sinceTime)
                ->get();

            foreach ($availableOrders as $order) {
                $notifications[] = [
                    'id'      => 'avail-' . $order->id,
                    'type'    => 'available_order',
                    'title'   => '📦 New Order Available',
                    'message' => "Order #{$order->order_number} — {$order->total} دج is ready for pickup",
                    'link'    => '/delivery/dashboard',
                    'time'    => $order->updated_at,
                    'status'  => $order->status,
                ];
            }

            // Also notify about orders assigned to this worker
            $myOrders = Order::whereHas('delivery', fn($q) => $q->where('worker_id', $user->id))
                ->where('updated_at', '>=', $sinceTime)
                ->get();

            foreach ($myOrders as $order) {
                $notifications[] = [
                    'id'      => 'my-order-' . $order->id . '-' . $order->status,
                    'type'    => 'order_status',
                    'title'   => '📋 Order Update',
                    'message' => "Order #{$order->order_number} status: {$order->status}",
                    'link'    => '/delivery/orders',
                    'time'    => $order->updated_at,
                    'status'  => $order->status,
                ];
            }
        }

        return response()->json([
            'notifications' => $notifications,
            'count'         => count($notifications),
            'timestamp'     => now()->toISOString(),
        ]);
    }

    // GET /api/notifications/all — full history
    public function all(Request $request)
    {
        $user = $request->user();
        $notifications = [];

        if ($user->role === 'admin') {
            $orders = Order::with('user')->latest()->take(20)->get();
            foreach ($orders as $order) {
                $notifications[] = [
                    'id'      => 'order-' . $order->id,
                    'type'    => 'order',
                    'title'   => 'Order #' . $order->order_number,
                    'message' => ($order->user->name ?? '?') . " — {$order->total} دج",
                    'link'    => '/admin/orders',
                    'time'    => $order->created_at,
                    'status'  => $order->status,
                ];
            }
        }

        if ($user->role === 'customer') {
            $orders = Order::where('user_id', $user->id)->latest()->take(20)->get();
            foreach ($orders as $order) {
                $notifications[] = [
                    'id'      => 'order-' . $order->id,
                    'type'    => 'order',
                    'title'   => 'Order #' . $order->order_number,
                    'message' => "Status: {$order->status} — {$order->total} دج",
                    'link'    => '/customer/orders',
                    'time'    => $order->updated_at,
                    'status'  => $order->status,
                ];
            }
        }

        if ($user->role === 'delivery') {
            // Show all orders this worker has or has delivered
            $orders = Order::whereHas('delivery', fn($q) => $q->where('worker_id', $user->id))
                ->orWhereIn('status', ['confirmed', 'ready'])
                ->whereDoesntHave('delivery')
                ->latest()
                ->take(20)
                ->get();

            foreach ($orders as $order) {
                $notifications[] = [
                    'id'      => 'order-' . $order->id,
                    'type'    => 'order',
                    'title'   => 'Order #' . $order->order_number,
                    'message' => "{$order->total} دج — {$order->status}",
                    'link'    => '/delivery/orders',
                    'time'    => $order->updated_at,
                    'status'  => $order->status,
                ];
            }
        }

        return response()->json($notifications);
    }
}
