<?php
// ─────────────────────────────────────────
// Save each class in its own file:
// OrderItem.php / Delivery.php / Rating.php / Coupon.php
// ─────────────────────────────────────────

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// ══════════════════════════════════════════
// OrderItem.php
// ══════════════════════════════════════════
class OrderItem extends Model
{
    protected $fillable = ['order_id', 'menu_item_id', 'quantity', 'unit_price', 'subtotal'];

    protected $casts = ['unit_price' => 'float', 'subtotal' => 'float'];

    public function order()    { return $this->belongsTo(Order::class); }
    public function menuItem() { return $this->belongsTo(MenuItem::class); }
}
