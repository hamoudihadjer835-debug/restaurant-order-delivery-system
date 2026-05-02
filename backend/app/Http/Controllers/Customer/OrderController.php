<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\MenuItem;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // POST /api/orders
    public function store(Request $request)
    {
        $request->validate([
            'items'            => 'required|array|min:1',
            'items.*.id'       => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'delivery_address' => 'required|string',
            'delivery_lat'     => 'nullable|numeric',
            'delivery_lng'     => 'nullable|numeric',
            'payment_method'   => 'nullable|in:cash,online',
            'coupon_code'      => 'nullable|string',
            'notes'            => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $subtotal   = 0;
            $orderItems = [];

            foreach ($request->items as $item) {
                $menuItem = MenuItem::findOrFail($item['id']);
                if (!$menuItem->is_available) {
                    return response()->json(['message' => "{$menuItem->name} is not available."], 422);
                }
                $lineTotal    = $menuItem->price * $item['quantity'];
                $subtotal    += $lineTotal;
                $orderItems[] = [
                    'menu_item_id' => $menuItem->id,
                    'quantity'     => $item['quantity'],
                    'unit_price'   => $menuItem->price,
                    'subtotal'     => $lineTotal,
                ];
            }

            // Coupon
            $discount  = 0;
            $couponId  = null;
            if ($request->coupon_code) {
                $coupon = Coupon::where('code', $request->coupon_code)->first();
                if (!$coupon || !$coupon->isValid()) {
                    return response()->json(['message' => 'Invalid or expired coupon.'], 422);
                }
                $discount = round($subtotal * $coupon->discount_percent / 100, 2);
                $couponId = $coupon->id;
                $coupon->increment('used_count');
            }

            $deliveryFee = 200;
            $total       = $subtotal - $discount + $deliveryFee;

            $order = Order::create([
                'user_id'          => $request->user()->id,
                'coupon_id'        => $couponId,
                'status'           => Order::STATUS_PENDING,
                'payment_method'   => $request->payment_method ?? 'cash',
                'payment_status'   => 'pending',
                'subtotal'         => $subtotal,
                'discount'         => $discount,
                'delivery_fee'     => $deliveryFee,
                'total'            => $total,
                'delivery_address' => $request->delivery_address,
                'delivery_lat'     => $request->delivery_lat,
                'delivery_lng'     => $request->delivery_lng,
                'notes'            => $request->notes,
            ]);

            foreach ($orderItems as $item) {
                $order->items()->create($item);
            }

            DB::commit();

            return response()->json(
                $order->load('items.menuItem'),
                201
            );

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Order failed: ' . $e->getMessage()], 500);
        }
    }

    // GET /api/orders/my
    public function myOrders(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['items.menuItem', 'delivery', 'rating'])
            ->latest()
            ->get()
            ->map(fn($o) => $this->formatOrder($o));

        return response()->json($orders);
    }

    // GET /api/orders/{id}
    public function show(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        return response()->json(
            $this->formatOrder($order->load(['items.menuItem', 'delivery.worker', 'rating', 'coupon']))
        );
    }

    // POST /api/orders/{id}/cancel
    public function cancel(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        if (!in_array($order->status, [Order::STATUS_PENDING, Order::STATUS_CONFIRMED])) {
            return response()->json(['message' => 'Order cannot be cancelled at this stage.'], 422);
        }
        $order->update(['status' => Order::STATUS_CANCELLED]);
        return response()->json(['message' => 'Order cancelled.', 'order' => $order]);
    }

    // POST /api/coupons/check
    public function checkCoupon(Request $request)
    {
        $request->validate(['code' => 'required|string']);
        $coupon = Coupon::where('code', $request->code)->first();
        if (!$coupon || !$coupon->isValid()) {
            return response()->json(['valid' => false, 'message' => 'Invalid or expired coupon.'], 422);
        }
        return response()->json([
            'valid'            => true,
            'discount_percent' => $coupon->discount_percent,
            'code'             => $coupon->code,
        ]);
    }

    // POST /api/orders/{id}/rate
    public function rate(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        if ($order->status !== Order::STATUS_DELIVERED) {
            return response()->json(['message' => 'You can only rate delivered orders.'], 422);
        }
        if ($order->rating) {
            return response()->json(['message' => 'Already rated.'], 422);
        }
        $request->validate([
            'food_rating'     => 'required|integer|min:1|max:5',
            'delivery_rating' => 'required|integer|min:1|max:5',
            'comment'         => 'nullable|string|max:500',
        ]);
        $rating = $order->rating()->create([
            'user_id'         => $request->user()->id,
            'food_rating'     => $request->food_rating,
            'delivery_rating' => $request->delivery_rating,
            'comment'         => $request->comment,
        ]);
        return response()->json($rating, 201);
    }

    private function formatOrder(Order $order): array
    {
        return [
            'id'               => $order->id,
            'order_number'     => $order->order_number,
            'status'           => $order->status,
            'payment_method'   => $order->payment_method,
            'payment_status'   => $order->payment_status,
            'subtotal'         => $order->subtotal,
            'discount'         => $order->discount,
            'delivery_fee'     => $order->delivery_fee,
            'total'            => $order->total,
            'delivery_address' => $order->delivery_address,
            'delivery_lat'     => $order->delivery_lat,
            'delivery_lng'     => $order->delivery_lng,
            'notes'            => $order->notes,
            'created_at'       => $order->created_at,
            'items'            => $order->items->map(fn($i) => [
                'id'       => $i->id,
                'name'     => $i->menuItem->name ?? 'N/A',
                'image'    => $i->menuItem->image ? asset('storage/' . $i->menuItem->image) : null,
                'quantity' => $i->quantity,
                'price'    => $i->unit_price,
                'subtotal' => $i->subtotal,
            ]),
            'delivery' => $order->delivery ? [
                'worker_name'  => $order->delivery->worker->name ?? null,
                'current_lat'  => $order->delivery->current_lat,
                'current_lng'  => $order->delivery->current_lng,
                'picked_at'    => $order->delivery->picked_at,
                'delivered_at' => $order->delivery->delivered_at,
            ] : null,
            'rating' => $order->rating,
        ];
    }
}
