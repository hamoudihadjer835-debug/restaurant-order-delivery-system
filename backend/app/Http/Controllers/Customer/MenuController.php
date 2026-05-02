<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    // GET /api/menu/categories  — all active categories with their items
    public function categories()
    {
        $categories = MenuCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->with(['activeItems'])
            ->get()
            ->map(function ($cat) {
                return [
                    'id'    => $cat->id,
                    'name'  => $cat->name,
                    'image' => $cat->image ? asset('storage/' . $cat->image) : null,
                    'items' => $cat->activeItems->map(fn($i) => $this->formatItem($i)),
                ];
            });

        return response()->json($categories);
    }

    // GET /api/menu/items  — all items (with optional filter)
    public function items(Request $request)
    {
        $query = MenuItem::with('category')
            ->where('is_available', true);

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $items = $query->get()->map(fn($i) => $this->formatItem($i));

        return response()->json($items);
    }

    // GET /api/menu/items/{id}
    public function show(MenuItem $menuItem)
    {
        if (!$menuItem->is_available) {
            return response()->json(['message' => 'Item not available.'], 404);
        }

        return response()->json($this->formatItem($menuItem->load('category')));
    }

    private function formatItem(MenuItem $item): array
    {
        return [
            'id'           => $item->id,
            'name'         => $item->name,
            'description'  => $item->description,
            'price'        => $item->price,
            'image'        => $item->image ? asset('storage/' . $item->image) : null,
            'is_available' => $item->is_available,
            'prep_time'    => $item->prep_time,
            'category'     => $item->category ? [
                'id'   => $item->category->id,
                'name' => $item->category->name,
            ] : null,
        ];
    }
}
