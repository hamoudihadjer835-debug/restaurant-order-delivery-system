<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rating;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    // GET /api/admin/reviews
    public function index(Request $request)
    {
        $query = Rating::with(['user', 'order.items.menuItem'])
            ->latest();

        if ($request->min_rating) {
            $query->where('food_rating', '>=', $request->min_rating);
        }

        $reviews = $query->paginate(10);

        return response()->json($reviews);
    }

    // GET /api/admin/reviews/stats
    public function stats()
    {
        $total   = Rating::count();
        $avgFood = Rating::avg('food_rating');
        $avgDel  = Rating::avg('delivery_rating');

        $distribution = [];
        for ($i = 1; $i <= 5; $i++) {
            $distribution[$i] = Rating::where('food_rating', $i)->count();
        }

        $recent = Rating::with(['user', 'order'])
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'total'            => $total,
            'avg_food'         => round($avgFood, 1),
            'avg_delivery'     => round($avgDel, 1),
            'distribution'     => $distribution,
            'recent'           => $recent,
        ]);
    }

    // DELETE /api/admin/reviews/{id}
    public function destroy(Rating $rating)
    {
        $rating->delete();
        return response()->json(['message' => 'Review deleted.']);
    }
}
