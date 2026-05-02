<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'name', 'description',
        'price', 'image', 'is_available', 'prep_time',
    ];

    protected $casts = [
        'price'        => 'float',
        'is_available' => 'boolean',
    ];

    // ── Relationships ────────────────────────────────────
    public function category()    { return $this->belongsTo(MenuCategory::class); }
    public function orderItems()  { return $this->hasMany(OrderItem::class); }

    // ── Accessors ────────────────────────────────────────
    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }
}
