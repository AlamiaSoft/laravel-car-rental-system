<?php

namespace Modules\Menu\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Modules\Menu\Models\Category;
use Modules\Menu\Models\Product;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = Category::latest()->get();

        return Inertia::render('Menu/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('menu::create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        // tenant_id is automatically assigned by stancl/tenancy global scope
        Category::create($validated);

        return redirect()->back()->with('success', 'Category created successfully.');
    }

    /**
     * Show the specified resource.
     */
    public function show($id)
    {
        return view('menu::show');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        return view('menu::edit');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $category->update($validated);

        return redirect()->back()->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();

        return redirect()->back()->with('success', 'Category deleted successfully.');
    }

    /**
     * Apply a predefined menu template.
     */
    public function applyTemplate(Request $request)
    {
        $validated = $request->validate([
            'categories' => 'required|array',
            'categories.*.name' => 'required|string',
            'categories.*.items' => 'nullable|array',
            'categories.*.items.*' => 'string',
        ]);

        foreach ($validated['categories'] as $categoryData) {
            $category = Category::create([
                'name' => $categoryData['name'],
                'is_active' => true,
            ]);

            if (! empty($categoryData['items'])) {
                foreach ($categoryData['items'] as $itemName) {
                    Product::create([
                        'category_id' => $category->id,
                        'name' => $itemName,
                        'price' => 100, // Default price
                        'is_active' => true,
                        'type' => 'simple',
                    ]);
                }
            }
        }

        return redirect()->back()->with('success', 'Template applied successfully.');
    }
}
