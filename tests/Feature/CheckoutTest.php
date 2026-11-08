<?php

namespace Tests\Feature;

use App\Models\DeliveryZone;
use App\Models\Order;
use App\Models\Product;
use App\Services\Checkout\CheckoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    private function product(int $stock = 5): Product
    {
        return Product::create([
            'name' => 'Checkout Tee',
            'cat' => 'T-Shirt',
            'price' => 600,
            'old_price' => 0,
            'stock' => $stock,
            'status' => 'active',
            'featured' => false,
        ]);
    }

    private function cartSession(Product $product, string $token = 'checkout-token'): array
    {
        return [
            'cart' => [$product->id . '|M' => ['id' => $product->id, 'size' => 'M', 'qty' => 2]],
            'checkout_token' => $token,
        ];
    }

    private function zone(int $charge = 60): DeliveryZone
    {
        return DeliveryZone::create([
            'name' => 'Inside Dhaka',
            'charge' => $charge,
            'is_active' => true,
            'sort' => 0,
        ]);
    }

    public function test_checkout_page_renders_with_totals(): void
    {
        $this->zone();
        $product = $this->product();

        $this->withSession($this->cartSession($product))
            ->get('/checkout')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Store/Checkout')
                ->where('subtotal', 1200)
                ->where('ship', 60)
                ->where('total', 1260)
                ->has('lines', 1));
    }

    public function test_delivery_is_free_when_no_active_zone_exists(): void
    {
        $product = $this->product();

        $this->withSession($this->cartSession($product))
            ->get('/checkout')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('subtotal', 1200)
                ->where('ship', 0)
                ->where('total', 1200));
    }

    public function test_checkout_creates_one_order_and_tracks_customer_and_history(): void
    {
        $zone = $this->zone();
        $product = $this->product();

        $this->withSession($this->cartSession($product))
            ->post('/checkout', [
                'name' => 'Rahim Uddin',
                'phone' => '01711111111',
                'address' => 'House 1, Dhaka',
                'delivery_area' => 'Inside Dhaka',
                'delivery_zone_id' => $zone->id,
                'note' => 'Call before delivery',
                'checkout_token' => 'checkout-token',
            ])
            ->assertRedirect();

        $order = Order::firstOrFail();
        $this->assertSame('GA-000001', $order->order_number);
        $this->assertSame('checkout-token', $order->idempotency_key);
        $this->assertSame(1260, $order->total);
        $this->assertNotNull($order->customer_id);
        $this->assertSame(3, $product->fresh()->stock);
        $this->assertDatabaseHas('order_status_histories', ['order_id' => $order->id, 'status' => 'Pending']);
        $this->assertDatabaseHas('customers', [
            'phone' => '01711111111',
            'total_orders' => 1,
            'total_purchase' => 1260,
        ]);

        $signed = URL::temporarySignedRoute('order.success', now()->addDay(), ['order' => $order->id]);
        $this->get($signed)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Store/OrderSuccess')
                ->where('order.order_number', $order->order_number));

        $this->get("/order/{$order->id}/success")->assertForbidden();
    }

    public function test_same_idempotency_key_does_not_create_a_second_order_or_reduce_stock_twice(): void
    {
        $this->zone();
        $product = $this->product();
        $this->withSession($this->cartSession($product, 'same-key'));

        $service = app(CheckoutService::class);
        $customer = [
            'name' => 'Rahim',
            'phone' => '01711111111',
            'address' => 'Dhaka',
            'delivery_area' => 'Inside Dhaka',
            'note' => null,
        ];

        $first = $service->placeOrder($customer, 'same-key');
        $second = $service->placeOrder($customer, 'same-key');

        $this->assertSame($first->id, $second->id);
        $this->assertSame(1, Order::count());
        $this->assertSame(3, $product->fresh()->stock);
    }

    public function test_checkout_rejects_invalid_phone(): void
    {
        $product = $this->product();

        $this->withSession($this->cartSession($product))
            ->post('/checkout', [
                'name' => 'Rahim',
                'phone' => '123',
                'address' => 'Dhaka',
                'checkout_token' => 'checkout-token',
            ])
            ->assertSessionHasErrors('phone');

        $this->assertSame(0, Order::count());
    }
}
