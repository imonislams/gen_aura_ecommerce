<?php

namespace App\Http\Controllers;

use App\Models\DeliveryZone;
use App\Models\Product;
use App\Services\Analytics\AnalyticsTracker;
use App\Services\Checkout\CheckoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index(CheckoutService $checkout)
    {
        $lines = $checkout->lines();
        $defaultCharge = DeliveryZone::active()->ordered()->value('charge');
        $totals = $checkout->totals($lines, $defaultCharge !== null ? (int) $defaultCharge : null);

        return Inertia::render('Store/Cart', [
            'lines' => array_map(fn ($line) => [
                'key' => $line['key'],
                'product_id' => $line['p']->id,
                'name' => $line['p']->name,
                'size' => $line['size'],
                'qty' => $line['qty'],
                'price' => $line['p']->price,
                'line_total' => $line['p']->price * $line['qty'],
                'image_url' => $line['p']->image_url,
                'url' => route('product', $line['p']),
            ], $lines),
            'subtotal' => $totals['subtotal'],
            'ship' => $totals['ship'],
            'total' => $totals['total'],
        ]);
    }

    public function add(Request $r, Product $product)
    {
        if ($product->status !== 'active') return back()->withErrors('This product is not available');
        if ($product->stock <= 0) return back()->withErrors('Out of stock');

        $size = (string) $r->input('size', '');
        $qty = max(1, min(50, (int) $r->input('qty', 1)));
        $key = $product->id . '|' . $size;
        $cart = session('cart', []);
        $cart[$key] = ['id' => $product->id, 'size' => $size, 'qty' => min(50, ($cart[$key]['qty'] ?? 0) + $qty)];
        session(['cart' => $cart]);

        app(AnalyticsTracker::class)->event($r, 'add_to_cart', [
            'product_id' => $product->id,
            'category' => $product->cat,
            'metadata' => ['size' => $size, 'qty' => $cart[$key]['qty'], 'price' => $product->price],
        ]);

        return $r->input('go') === 'buy' ? redirect()->route('checkout.show') : back()->with('ok', 'Added to bag');
    }

    public function update(Request $r)
    {
        $cart = session('cart', []);
        $key = (string) $r->input('key');

        if (isset($cart[$key])) {
            $oldQty = (int) $cart[$key]['qty'];
            $qty = min(50, max(0, (int) $r->input('qty')));
            if ($qty === 0) unset($cart[$key]); else $cart[$key]['qty'] = $qty;
            session(['cart' => $cart]);

            app(AnalyticsTracker::class)->event($r, $qty === 0 ? 'remove_from_cart' : 'cart_qty_update', [
                'product_id' => $cart[$key]['id'] ?? null,
                'metadata' => ['size' => $cart[$key]['size'] ?? null, 'old_qty' => $oldQty, 'qty' => $qty],
            ]);
        }

        return back();
    }

    public function remove(Request $r)
    {
        $cart = session('cart', []);
        $key = (string) $r->input('key');
        $item = $cart[$key] ?? null;
        unset($cart[$key]);
        session(['cart' => $cart]);

        if ($item) {
            app(AnalyticsTracker::class)->event($r, 'remove_from_cart', [
                'product_id' => $item['id'],
                'metadata' => ['size' => $item['size'], 'qty' => $item['qty']],
            ]);
        }

        return back();
    }

    public function checkout(Request $r, CheckoutService $checkout)
    {
        $d = $r->validate([
            'name' => 'required|max:80',
            'phone' => ['required', 'max:20', fn ($a, $v, $f) => strlen(preg_replace('/\D/', '', $v)) < 10 ? $f('Please enter a valid phone number') : null],
            'address' => 'required|max:300',
        ]);

        try {
            $order = $checkout->placeOrder($d, (string) Str::uuid());
        } catch (\RuntimeException $e) {
            return back()->withErrors($e->getMessage());
        }

        app(AnalyticsTracker::class)->orderCompleted($r, $order);
        session()->forget('cart');

        return redirect(URL::temporarySignedRoute('order.success', now()->addDays(7), ['order' => $order->id]))
            ->with('done', true);
    }
}
