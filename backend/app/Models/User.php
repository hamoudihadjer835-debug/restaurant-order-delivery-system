<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;


class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role',
        'phone', 'google_id', 'avatar',
        'address', 'lat', 'lng', 'is_active',
    ];

    protected $hidden = ['password', 'remember_token', 'google_id'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'is_active'         => 'boolean',
        'lat'               => 'float',
        'lng'               => 'float',
    ];

    // ── Scopes ──────────────────────────────────────────
    public function scopeCustomers($q)  { return $q->where('role', 'customer'); }
    public function scopeDelivery($q)   { return $q->where('role', 'delivery'); }
    public function scopeAdmins($q)     { return $q->where('role', 'admin'); }

    // ── Relationships ────────────────────────────────────
    public function orders()     { return $this->hasMany(Order::class); }
    public function deliveries() { return $this->hasMany(Delivery::class, 'worker_id'); }
    public function ratings()    { return $this->hasMany(Rating::class); }

    // ── Helpers ──────────────────────────────────────────
    public function isAdmin()    { return $this->role === 'admin'; }
    public function isDelivery() { return $this->role === 'delivery'; }
    public function isCustomer() { return $this->role === 'customer'; }
}
