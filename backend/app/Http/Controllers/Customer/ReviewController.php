<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Rating;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    // GET /api/reviews/public — for landing page (no auth)
    public function public()
    {
        $reviews = Rating::with('user')
            ->where('food_rating', '>=', 4)
            ->whereNotNull('comment')
            ->where('comment', '!=', '')
            ->latest()
            ->take(6)
            ->get()
            ->map(fn($r) => [
                'id'              => $r->id,
                'user_name'       => $r->user->name ?? 'Anonymous',
                'food_rating'     => $r->food_rating,
                'delivery_rating' => $r->delivery_rating,
                'comment'         => $r->comment,
                'created_at'      => $r->created_at,
            ]);

        $avgRating = Rating::avg('food_rating');
        $total     = Rating::count();

        return response()->json([
            'reviews'    => $reviews,
            'avg_rating' => round($avgRating, 1),
            'total'      => $total,
        ]);
    }
}
