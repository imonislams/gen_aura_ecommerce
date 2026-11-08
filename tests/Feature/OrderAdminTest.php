<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OrderAdminTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): self
    {
        $admin = Admin::create(['username' => 'admin', 'password' => 'admin']);

        return $this->withSession(['admin_id' => $admin->id]);
    }

    private function orderWithItem(int $qty = 2): array
    {
        $product = Product::create([
            'name' => 'Order Tee',
            'price' => 600,
            'old_price' => 0,
            'stock' => 5,
            'status' => 'active',
            'featured' => false,
        ]);

        $order = Order::create([
            'name' => 'Rahim',
            'phone' => '01711111111',
            'address' => 'Dhaka',
            'subtotal' => 1200,
            'ship' => 60,
            'total' => 1260,
            'status' => 'Pending',
        ]);

        $order->items()->create([
            'product_id' => $product->id,
            'name' => $product->name,
            'size' => 'M',
            'qty' => $qty,
            'price' => 600,
        ]);

        return [$order, $product];
    }

    public function test_admin_order_detail_and_timeline_render(): void
    {
        $this->admin();
        [$order] = $this->orderWithItem();

        $this->get("/admin/orders/{$order->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Orders/Show')
                ->where('order.order_number', $order->order_number)
                ->has('order.items', 1)
                ->has('order.history'));
    }

    public function test_invoice_downloads_as_pdf(): void
    {
        $this->admin();
        [$order] = $this->orderWithItem();

        $response = $this->get("/admin/orders/{$order->id}/invoice");

        $response->assertOk();
        $this->assertStringContainsString('application/pdf', $response->headers->get('content-type'));
        $this->assertStringContainsString('invoice-', $response->headers->get('content-disposition'));
    }

    public function test_status_update_records_history_and_cancel_restores_stock(): void
    {
        $this->admin();
        [$order, $product] = $this->orderWithItem();

        $this->patch("/admin/orders/{$order->id}", ['status' => 'Confirmed'])->assertRedirect();
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'status' => 'Confirmed']);
        $this->assertDatabaseHas('order_status_histories', ['order_id' => $order->id, 'status' => 'Confirmed']);

        $this->patch("/admin/orders/{$order->id}", ['status' => 'Cancelled'])->assertRedirect();
        $this->assertSame(7, $product->fresh()->stock);
        $this->assertDatabaseHas('order_status_histories', ['order_id' => $order->id, 'status' => 'Cancelled']);
    }

    public function test_orders_cannot_be_hard_deleted(): void
    {
        $this->admin();
        [$order] = $this->orderWithItem();

        $this->delete("/admin/orders/{$order->id}")->assertSessionHasErrors();
        $this->assertDatabaseHas('orders', ['id' => $order->id]);
    }
}
