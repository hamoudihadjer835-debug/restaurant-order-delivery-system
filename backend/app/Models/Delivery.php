<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    protected $fillable = [
        'order_id', 'worker_id',
        'current_lat', 'current_lng',
        'accepted_at', 'picked_at', 'delivered_at',
    ];

    protected $casts = [
        'current_lat'  => 'float',
        'current_lng'  => 'float',
        'accepted_at'  => 'datetime',
        'picked_at'    => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function order()  { return $this->belongsTo(Order::class); }
    public function worker() { return $this->belongsTo(User::class, 'worker_id'); }
}
