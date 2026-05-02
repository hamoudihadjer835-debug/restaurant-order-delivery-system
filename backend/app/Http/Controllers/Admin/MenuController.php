<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MenuController extends Controller
{
    // GET /api/admin/menu/categories
    public function categories()
    {
        return response()->json(
            MenuCategory::withCount('items')->orderBy('sort_order')->get()
        );
    }

    // POST /api/admin/menu/categories
    public function storeCategory(Request $request)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:255',
            'sort_order' => 'nullable|integer',
        ]);

        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $data['image'] = $request->file('image')->store('categories', 'public');
        }

        return response()->json(MenuCategory::create($data), 201);
    }

    // PUT /api/admin/menu/categories/{id}
    public function updateCategory(Request $request, MenuCategory $menuCategory)
    {
        $data = $request->validate([
            'name'       => 'sometimes|string|max:255',
            'is_active'  => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer',
        ]);

        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $data['image'] = $request->file('image')->store('categories', 'public');
        }

        $menuCategory->update($data);
        return response()->json($menuCategory);
    }

    // DELETE /api/admin/menu/categories/{id}
    public function destroyCategory(MenuCategory $menuCategory)
    {
        $menuCategory->delete();
        return response()->json(['message' => 'Category deleted.']);
    }

    // GET /api/admin/menu/items
    public function items(Request $request)
    {
        $query = MenuItem::with('category');

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        return response()->json($query->latest()->paginate(12));
    }

    // POST /api/admin/menu/items
    public function storeItem(Request $request)
    {
        $data = $request->validate([
            'category_id'  => 'required|exists:menu_categories,id',
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string',
            'price'        => 'required|numeric|min:0',
            'is_available' => 'nullable|boolean',
            'prep_time'    => 'nullable|integer|min:1',
        ]);

        // Handle image separately — no validation rule so it won't reject
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $file = $request->file('image');
            $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
            if (in_array(strtolower($file->getClientOriginalExtension()), $allowed)) {
                $data['image'] = $file->store('menu-items', 'public');
            }
        }

        $data['is_available'] = $request->input('is_available', 1) ? true : false;

        $item = MenuItem::create($data);
        return response()->json($item->load('category'), 201);
    }

    // PUT /api/admin/menu/items/{id}
    public function updateItem(Request $request, MenuItem $menuItem)
    {
        $data = $request->validate([
            'category_id'  => 'sometimes|exists:menu_categories,id',
            'name'         => 'sometimes|string|max:255',
            'description'  => 'nullable|string',
            'price'        => 'sometimes|numeric|min:0',
            'is_available' => 'nullable|boolean',
            'prep_time'    => 'sometimes|integer|min:1',
        ]);

        // Handle image separately
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $file = $request->file('image');
            $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
            if (in_array(strtolower($file->getClientOriginalExtension()), $allowed)) {
                // Delete old image
                if ($menuItem->image) {
                    Storage::disk('public')->delete($menuItem->image);
                }
                $data['image'] = $file->store('menu-items', 'public');
            }
        }

        if (isset($data['is_available'])) {
            $data['is_available'] = $data['is_available'] ? true : false;
        } elseif ($request->has('is_available')) {
            $data['is_available'] = $request->input('is_available') ? true : false;
        }

        $menuItem->update($data);
        return response()->json($menuItem->load('category'));
    }

    // DELETE /api/admin/menu/items/{id}
    public function destroyItem(MenuItem $menuItem)
    {
        if ($menuItem->image) {
            Storage::disk('public')->delete($menuItem->image);
        }
        $menuItem->delete();
        return response()->json(['message' => 'Item deleted.']);
    }
}
