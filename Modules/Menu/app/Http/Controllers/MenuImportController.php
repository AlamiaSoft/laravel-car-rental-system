<?php

namespace Modules\Menu\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Modules\Menu\Models\Category;
use Modules\Menu\Models\Deal;
use Modules\Menu\Models\Product;
use Modules\Menu\Services\Import\MenuImportPipeline;

class MenuImportController extends Controller
{
    public function show()
    {
        return Inertia::render('Menu/Import');
    }

    public function process(Request $request, MenuImportPipeline $pipeline)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xls,xlsx,pdf|max:10240',
        ]);

        try {
            $normalizedData = $pipeline->process($request->file('file'));

            return response()->json($normalizedData);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function confirm(Request $request)
    {
        $request->validate([
            'categories' => 'required|array',
            'deals' => 'nullable|array',
        ]);

        $tenantId = tenant('id');

        DB::beginTransaction();

        try {
            $importedProducts = 0;
            $importedDeals = 0;

            // Import Categories and Products
            foreach ($request->input('categories') as $catData) {
                // Find or create category
                $category = Category::firstOrCreate([
                    'tenant_id' => $tenantId,
                    'name' => $catData['name'],
                ], [
                    'is_active' => true,
                ]);

                foreach ($catData['items'] as $itemData) {
                    if (($itemData['duplicate_status'] ?? 'new') === 'skip') {
                        continue;
                    }

                    $productData = [
                        'name' => $itemData['name'],
                        'description' => $itemData['description'] ?? null,
                        'price' => $itemData['price'] ?? 0,
                        'is_active' => true,
                    ];

                    if (($itemData['duplicate_status'] ?? 'new') === 'update_existing') {
                        Product::updateOrCreate([
                            'tenant_id' => $tenantId,
                            'name' => $itemData['name'],
                            'category_id' => $category->id,
                        ], $productData);
                    } else {
                        // Create new
                        Product::create(array_merge([
                            'tenant_id' => $tenantId,
                            'category_id' => $category->id,
                        ], $productData));
                    }
                    $importedProducts++;
                }
            }

            // Import Deals
            if ($request->has('deals')) {
                foreach ($request->input('deals') as $dealData) {
                    if (($dealData['duplicate_status'] ?? 'new') === 'skip') {
                        continue;
                    }

                    $deal = Deal::updateOrCreate([
                        'tenant_id' => $tenantId,
                        'name' => $dealData['name'],
                    ], [
                        'description' => $dealData['description'] ?? null,
                        'price' => $dealData['price'] ?? 0,
                        'is_active' => true,
                    ]);
                    $importedDeals++;

                    // Note: Parsing deal_items_raw requires sophisticated logic to map to product_ids.
                    // For Phase 1, we save the Deal. DealItems can be linked via UI later or
                    // we can do simple fuzzy matching on product names if needed.
                }
            }

            DB::commit();

            return redirect()->route('menu.products.index')->with('success', "Successfully imported {$importedProducts} products and {$importedDeals} deals.");
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->with('error', 'Import failed: '.$e->getMessage());
        }
    }

    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="menu_import_template.csv"',
        ];

        $callback = function () {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Category', 'Item Name', 'Price', 'Description', 'Is Deal', 'Deal Items']);
            fputcsv($file, ['Pizza', 'Fajita Pizza Medium', '1490', 'Topped with chicken fajita, capsicum, and onions.', 'No', '']);
            fputcsv($file, ['Deals', 'Family Deal 1', '3500', '2 Large Pizzas and 1 Drink', 'Yes', 'Fajita Pizza Large, Pepsi 1.5L']);
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
