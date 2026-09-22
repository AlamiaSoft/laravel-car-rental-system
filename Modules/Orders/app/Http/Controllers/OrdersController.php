<?php

namespace Modules\Orders\Http\Controllers;

use App\Events\OrderCreated;
use App\Events\OrderStatusUpdated;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Modules\Crm\Models\Customer;
use Modules\Menu\Models\Category;
use Modules\Menu\Models\Product;
use Modules\Orders\Models\Order;
use Modules\Orders\Models\OrderItem;

class OrdersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $orders = Order::whereIn('status', ['Pending', 'Preparing', 'Ready'])
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('Orders/Kds', [
            'orders' => $orders,
            'tenantId' => tenant('id'),
        ]);
    }

    public function unifiedKds()
    {
        $orders = Order::with('items.product')
            ->whereIn('status', ['Pending', 'Preparing', 'Ready'])
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('Orders/UnifiedKds', [
            'orders' => $orders,
            'tenantId' => tenant('id'),
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Pending,Preparing,Ready,Delivered',
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        try {
            event(new OrderStatusUpdated($order, tenant('id')));
        } catch (\Exception $e) {
            Log::warning('Could not broadcast OrderStatusUpdated event. Reverb might be down: '.$e->getMessage());
        }

        return redirect()->back();
    }

    public function create()
    {
        $categories = Category::with(['products' => function ($q) {
            $q->where('is_active', true);
        }])->where('is_active', true)->get();

        return Inertia::render('Orders/Pos', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'table_number' => 'nullable|string',
            'customer_phone' => 'nullable|string',
            'customer_name' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'total_amount' => 'required|numeric',
        ]);

        $order = Order::create([
            'order_number' => 'ORD-'.strtoupper(uniqid()),
            'table_number' => $request->table_number,
            'customer_phone' => $request->customer_phone,
            'customer_name' => $request->customer_name ?? 'POS Customer',
            'total_amount' => $request->total_amount,
            'status' => 'Pending',
            'order_type' => 'POS',
        ]);

        foreach ($request->items as $item) {
            $product = Product::find($item['product_id']);
            if ($product) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                    'subtotal' => $product->price * $item['quantity'],
                ]);
            }
        }

        if ($request->customer_phone) {
            $customer = Customer::firstOrCreate(
                ['phone' => $request->customer_phone]
            );
            $customer->name = $request->customer_name ?? $customer->name;
            $customer->total_orders += 1;
            $customer->total_spent += $request->total_amount;
            $customer->last_order_date = now();
            $customer->save();
        }

        try {
            broadcast(new OrderCreated($order->load('items.product'), tenant('id')));
        } catch (\Exception $e) {
            Log::warning('Could not broadcast OrderCreated event. Reverb might be down: '.$e->getMessage());
        }

        return redirect()->route('orders.create')->with('success', 'Order placed successfully!');
    }

    public function history()
    {
        $orders = Order::where('status', 'Delivered')
            ->orderBy('updated_at', 'desc')
            ->paginate(15);

        return Inertia::render('Orders/History', [
            'orders' => $orders,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id) {}
}
