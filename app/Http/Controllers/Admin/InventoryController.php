<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Services\Inventory\StockService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use RuntimeException;

class InventoryController extends Controller
{
    public function index(Request $r)
    {
        $q = Product::with('category');

        if ($r->filled('q')) {
            $q->where('name', 'like', '%' . $r->q . '%');
        }
        if ($r->input('status') === 'low') {
            $q->where('stock', '>', 0)->where('stock', '<=', 5);
        } elseif ($r->input('status') === 'out') {
            $q->where('stock', '<=', 0);
        }

        $products = $q->orderBy('stock')->paginate(30)->withQueryString()->through(fn (Product $product) => [
            'id' => $product->id,
            'name' => $product->name,
            'image_url' => $product->image_url,
            'category' => $product->category?->name ?? ($product->cat ?: 'Uncategorised'),
            'price' => $product->price,
            'stock' => $product->stock,
            'status' => $product->status,
        ]);

        return Inertia::render('Admin/Inventory/Index', [
            'products' => $products,
            'stats' => [
                'products' => Product::count(),
                'low' => Product::where('stock', '>', 0)->where('stock', '<=', 5)->count(),
                'out' => Product::where('stock', '<=', 0)->count(),
                'units' => (int) Product::sum('stock'),
            ],
            'filters' => $r->only(['q', 'status']),
        ]);
    }

    public function movements(Request $r)
    {
        $q = InventoryMovement::with('product');

        if ($r->filled('product')) {
            $q->where('product_id', $r->product);
        }
        if ($r->filled('type')) {
            $q->where('type', $r->type);
        }

        $movements = $q->latest('created_at')->paginate(50)->withQueryString()->through(fn (InventoryMovement $movement) => [
            'id' => $movement->id,
            'product' => $movement->product?->name ?? 'Deleted product',
            'type' => $movement->type,
            'quantity_delta' => $movement->quantity_delta,
            'stock_before' => $movement->stock_before,
            'stock_after' => $movement->stock_after,
            'reference_type' => $movement->reference_type,
            'reference_id' => $movement->reference_id,
            'note' => $movement->note,
            'created_at' => $movement->created_at?->toIso8601String(),
        ]);

        return Inertia::render('Admin/Inventory/Movements', [
            'movements' => $movements,
            'filters' => $r->only(['product', 'type']),
            'types' => ['initial_stock', 'order_sale', 'cancellation_restore', 'reopen_deduction', 'manual_adjustment'],
            'products' => Product::withTrashed()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function adjust(Request $r, Product $product)
    {
        $d = $r->validate([
            'delta' => 'required|integer|not_in:0',
            'note' => 'nullable|max:255',
        ]);

        try {
            app(StockService::class)->adjust($product, (int) $d['delta'], $d['note'] ?? null, session('admin_id'));
        } catch (RuntimeException $e) {
            return back()->withErrors($e->getMessage());
        }

        return back()->with('ok', 'Stock adjusted');
    }
}
