<?php

namespace App\Http\Controllers\Delivery;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // GET /api/delivery/orders  — available orders (pending/confirmed/ready)
    public function available(Request $request)
    {
        $orders = Order::whereIn('status', [Order::STATUS_CONFIRMED, Order::STATUS_READY])
            ->whereDoesntHave('delivery')
            ->with(['user', 'items.menuItem'])
            ->latest()
            ->get()
            ->map(fn($o) => $this->formatOrder($o));

        return response()->json($orders);
    }

    // GET /api/delivery/my-orders  — orders assigned to this worker
    public function myOrders(Request $request)
    {
        $orders = Order::whereHas('delivery', fn($q) => $q->where('worker_id', $request->user()->id))
            ->with(['user', 'items.menuItem', 'delivery'])
            ->latest()
            ->get()
            ->map(fn($o) => $this->formatOrder($o));

        return response()->json($orders);
    }

    // POST /api/delivery/orders/{id}/accept
    public function accept(Request $request, Order $order)
    {
        if ($order->delivery) {
            return response()->json(['message' => 'Order already taken.'], 422);
        }

        if (!in_array($order->status, [Order::STATUS_CONFIRMED, Order::STATUS_READY])) {
            return response()->json(['message' => 'Order not ready for pickup.'], 422);
        }

        DB::beginTransaction();
        try {
            Delivery::create([
                'order_id'    => $order->id,
                'worker_id'   => $request->user()->id,
                'accepted_at' => now(),
            ]);

            $order->update(['status' => Order::STATUS_OUT_FOR_DELIVERY]);

            DB::commit();
            return response()->json($order->fresh(['delivery', 'user', 'items.menuItem']));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    // POST /api/delivery/orders/{id}/picked
    public function markPicked(Request $request, Order $order)
    {
        $delivery = $order->delivery;

        if (!$delivery || $delivery->worker_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $delivery->update(['picked_at' => now()]);

        return response()->json(['message' => 'Marked as picked up.']);
    }

    // POST /api/delivery/orders/{id}/delivered
    public function markDelivered(Request $request, Order $order)
    {
        $delivery = $order->delivery;

        if (!$delivery || $delivery->worker_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        DB::beginTransaction();
        try {
            $delivery->update(['delivered_at' => now()]);
            $order->update(['status' => Order::STATUS_DELIVERED]);
            DB::commit();

            return response()->json(['message' => 'Order marked as delivered.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    // PATCH /api/delivery/location  — update GPS
    public function updateLocation(Request $request)
    {
        $request->validate([
            'lat'      => 'required|numeric',
            'lng'      => 'required|numeric',
            'order_id' => 'required|exists:orders,id',
        ]);

        $delivery = Delivery::where('order_id', $request->order_id)
            ->where('worker_id', $request->user()->id)
            ->first();

        if (!$delivery) {
            return response()->json(['message' => 'Delivery not found.'], 404);
        }

        $delivery->update([
            'current_lat' => $request->lat,
            'current_lng' => $request->lng,
        ]);

        return response()->json(['message' => 'Location updated.']);
    }

    // GET /api/delivery/dashboard
    public function dashboard(Request $request)
    {
        $workerId = $request->user()->id;

        $totalDeliveries = Delivery::where('worker_id', $workerId)
            ->whereNotNull('delivered_at')->count();

        $todayDeliveries = Delivery::where('worker_id', $workerId)
            ->whereNotNull('delivered_at')
            ->whereDate('delivered_at', today())
            ->count();

        $activeOrder = Order::whereHas('delivery', fn($q) => $q->where('worker_id', $workerId))
            ->where('status', Order::STATUS_OUT_FOR_DELIVERY)
            ->with(['user', 'items.menuItem', 'delivery'])
            ->first();

        $weeklyStats = Delivery::where('worker_id', $workerId)
            ->whereNotNull('delivered_at')
            ->where('delivered_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(delivered_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $recentOrders = Order::whereHas('delivery', fn($q) => $q->where('worker_id', $workerId))
            ->with(['items.menuItem'])
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($o) => $this->formatOrder($o));

        return response()->json([
            'total_deliveries' => $totalDeliveries,
            'today_deliveries' => $todayDeliveries,
            'active_order'     => $activeOrder ? $this->formatOrder($activeOrder) : null,
            'weekly_stats'     => $weeklyStats,
            'recent_orders'    => $recentOrders,
        ]);
    }

    private function formatOrder(Order $order): array
    {
        return [
            'id'               => $order->id,
            'order_number'     => $order->order_number,
            'status'           => $order->status,
            'total'            => $order->total,
            'delivery_address' => $order->delivery_address,
            'delivery_lat'     => $order->delivery_lat,
            'delivery_lng'     => $order->delivery_lng,
            'created_at'       => $order->created_at,
            'customer'         => $order->user ? [
                'name'  => $order->user->name,
                'phone' => $order->user->phone,
            ] : null,
            'items'    => $order->items->map(fn($i) => [
                'name'     => $i->menuItem->name ?? 'N/A',
                'quantity' => $i->quantity,
            ]),
            'delivery' => $order->delivery ? [
                'current_lat'  => $order->delivery->current_lat,
                'current_lng'  => $order->delivery->current_lng,
                'accepted_at'  => $order->delivery->accepted_at,
                'picked_at'    => $order->delivery->picked_at,
                'delivered_at' => $order->delivery->delivered_at,
            ] : null,
        ];
    }
}
