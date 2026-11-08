<?php

namespace App\Services\Checkout;

use App\Models\DeliveryZone;
use App\Models\Order;
use App\Models\Product;
use App\Services\Inventory\StockService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use RuntimeException;

class CheckoutService
{
    public function __construct(private StockService $stock)
    {
    }
    public function lines(): array
    {
        $cart = session('cart', []);
        $products = Product::active()->whereIn('id', collect($cart)->pluck('id'))->get()->keyBy('id');

        $lines = [];
        foreach ($cart as $key => $item) {
            if ($product = $products->get($item['id'])) {
                $lines[] = [
                    'key' => $key,
                    'p' => $product,
                    'size' => $item['size'],
                    'qty' => (int) $item['qty'],
                ];
            }
        }

        return $lines;
    }

    public function totals(array $lines, ?int $ship = null): array
    {
        $subtotal = array_sum(array_map(fn ($line) => $line['p']->price * $line['qty'], $lines));
        $ship = $lines ? ($ship ?? 0) : 0;

        return ['subtotal' => $subtotal, 'ship' => $ship, 'total' => $subtotal + $ship];
    }

    public function placeOrder(array $customer, string $idempotencyKey): Order
    {
        $existing = Order::where('idempotency_key', $idempotencyKey)->first();
        if ($existing) {
            return $existing->load('items');
        }

        $lines = $this->lines();
        if (!$lines) {
            throw new RuntimeException('Your bag is empty.');
        }

        $zone = null;
        if (!empty($customer['delivery_zone_id'])) {
            $zone = DeliveryZone::active()->find($customer['delivery_zone_id']);
            if (!$zone) {
                throw new RuntimeException('Please select a valid delivery zone.');
            }
            $customer['delivery_area'] = $zone->name;
        }
        unset($customer['delivery_zone_id']);

        $totals = $this->totals($lines, $zone?->charge);

        try {
            $order = DB::transaction(function () use ($lines, $customer, $totals, $idempotencyKey) {
                $items = [];
                $subtotal = 0;
                $stockLines = [];

                foreach ($lines as $line) {
                    $product = Product::lockForUpdate()->find($line['p']->id);
                    if (!$product || $product->status !== 'active' || $product->stock < $line['qty']) {
                        throw new RuntimeException(($product->name ?? 'Product') . ': Out of stock');
                    }

                    $items[] = [
                        'product_id' => $product->id,
                        'name' => $product->name,
                        'size' => $line['size'],
                        'qty' => $line['qty'],
                        'price' => $product->price,
                    ];

                    $stockLines[] = ['product' => $product, 'qty' => $line['qty']];
                    $subtotal += $product->price * $line['qty'];
                }

                $order = Order::create($customer + [
                    'subtotal' => $subtotal,
                    'ship' => $totals['ship'],
                    'total' => $subtotal + $totals['ship'],
                    'status' => 'Pending',
                    'payment_method' => 'COD',
                    'idempotency_key' => $idempotencyKey,
                ]);

                $order->items()->createMany($items);

                foreach ($stockLines as $entry) {
                    $this->stock->apply($entry['product'], -$entry['qty'], 'order_sale', [
                        'reference_type' => 'order',
                        'reference_id' => $order->id,
                        'note' => 'Order sale',
                    ]);
                }

                return $order->load('items');
            });
        } catch (\Illuminate\Database\QueryException $e) {
            $existing = Order::where('idempotency_key', $idempotencyKey)->first();
            if ($existing) {
                return $existing->load('items');
            }

            throw $e;
        }

        $this->mail($order);

        return $order;
    }

    public function mail(Order $order): void
    {
        $to = config('shop.order_email');
        if (!$to) {
            return;
        }

        try {
            $rows = '';
            foreach ($order->items as $item) {
                $rows .= '<tr><td>' . e($item->name) . ($item->size ? ' (' . e($item->size) . ')' : '') . '</td><td>x' . $item->qty . '</td><td>৳' . ($item->price * $item->qty) . '</td></tr>';
            }

            $html = '<h2>New order #' . $order->order_number . '</h2>'
                . '<p><b>' . e($order->name) . '</b><br>Phone: ' . e($order->phone) . '<br>Address: ' . e($order->address) . '</p>'
                . '<table cellpadding="6">' . $rows . '</table>'
                . '<p>Delivery: ৳' . $order->ship . '<br><b>Total: ৳' . $order->total . '</b> (Cash on Delivery)</p>';

            Mail::html($html, fn ($message) => $message->to($to)->subject('New order ৳' . $order->total . ' from ' . $order->name));
        } catch (\Throwable $e) {
            report($e);
        }
    }
}
