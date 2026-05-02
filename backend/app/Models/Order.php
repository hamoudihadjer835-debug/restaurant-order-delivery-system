<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number', 'user_id', 'coupon_id', 'status',
        'payment_method', 'payment_status',
        'subtotal', 'discount', 'delivery_fee', 'total',
        'delivery_address', 'delivery_lat', 'delivery_lng', 'notes',
    ];

    protected $casts = [
        'subtotal'     => 'float',
        'discount'     => 'float',
        'delivery_fee' => 'float',
        'total'        => 'float',
        'delivery_lat' => 'float',
        'delivery_lng' => 'float',
    ];

    // Status flow constants
    const STATUS_PENDING          = 'pending';
    const STATUS_CONFIRMED        = 'confirmed';
    const STATUS_PREPARING        = 'preparing';
    const STATUS_READY            = 'ready';
    const STATUS_OUT_FOR_DELIVERY = 'out_for_delivery';
    const STATUS_DELIVERED        = 'delivered';
    const STATUS_CANCELLED        = 'cancelled';

    // ── Boot ─────────────────────────────────────────────
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($order) {
            $order->order_number = 'ORD-' . strtoupper(substr(md5(uniqid()), 0, 8));
        });
    }

    // ── Relationships ────────────────────────────────────
    public function user()      { return $this->belongsTo(User::class); }
    public function coupon()    { return $this->belongsTo(Coupon::class); }
    public function items()     { return $this->hasMany(OrderItem::class); }
    public function delivery()  { return $this->hasOne(Delivery::class); }
    public function rating()    { return $this->hasOne(Rating::class); }

    // ── Scopes ───────────────────────────────────────────
    public function scopeByStatus($q, $status) { return $q->where('status', $status); }
    public function scopePending($q)           { return $q->where('status', self::STATUS_PENDING); }
    public function scopeActive($q)
    {
        return $q->whereNotIn('status', [self::STATUS_DELIVERED, self::STATUS_CANCELLED]);
    }
}
