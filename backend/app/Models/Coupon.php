<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = ['code', 'discount_percent', 'max_uses', 'used_count', 'expires_at', 'is_active'];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_active'  => 'boolean',
    ];

    public function orders() { return $this->hasMany(Order::class); }

    public function isValid(): bool
    {
        return $this->is_active
            && $this->used_count < $this->max_uses
            && ($this->expires_at === null || $this->expires_at->isFuture());
    }
}
