<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): self
    {
        $admin = Admin::create(['username' => 'admin', 'password' => 'admin']);

        return $this->withSession(['admin_id' => $admin->id]);
    }

    public function test_admin_can_create_update_soft_delete_and_restore_a_product(): void
    {
        $this->admin();

        $category = Category::create([
            'name' => 'Pant',
            'slug' => 'pant',
            'status' => 'active',
            'sort_order' => 0,
        ]);

        $this->post('/admin/products', [
            'name' => 'Test Pant',
            'slug' => '',
            'sku' => 'TP-1',
            'category_id' => $category->id,
            'price' => 1200,
            'old_price' => 1500,
            'stock' => 4,
            'status' => 'active',
            'featured' => 1,
        ])->assertRedirect('/admin/products');

        $product = Product::where('sku', 'TP-1')->firstOrFail();
        $this->assertSame('test-pant', $product->slug);
        $this->assertSame('Pant', $product->cat);
        $this->assertTrue($product->featured);

        $this->put("/admin/products/{$product->id}", [
            'name' => 'Test Pant Updated',
            'slug' => 'test-pant-updated',
            'sku' => 'TP-1',
            'category_id' => $category->id,
            'price' => 1300,
            'old_price' => 1500,
            'stock' => 3,
            'status' => 'inactive',
            'featured' => 0,
        ])->assertRedirect('/admin/products');

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Test Pant Updated',
            'status' => 'inactive',
            'featured' => 0,
        ]);

        $this->delete("/admin/products/{$product->id}")->assertRedirect();
        $this->assertSoftDeleted('products', ['id' => $product->id]);

        $this->patch("/admin/products/{$product->id}/restore")->assertRedirect();
        $this->assertDatabaseHas('products', ['id' => $product->id, 'deleted_at' => null]);
    }

    public function test_storefront_hides_inactive_and_deleted_products(): void
    {
        $active = Product::create([
            'name' => 'Visible Tee',
            'price' => 500,
            'old_price' => 0,
            'stock' => 5,
            'status' => 'active',
            'featured' => false,
        ]);

        $inactive = Product::create([
            'name' => 'Hidden Tee',
            'price' => 500,
            'old_price' => 0,
            'stock' => 5,
            'status' => 'inactive',
            'featured' => false,
        ]);

        $deleted = Product::create([
            'name' => 'Deleted Tee',
            'price' => 500,
            'old_price' => 0,
            'stock' => 5,
            'status' => 'active',
            'featured' => false,
        ]);
        $deleted->delete();

        $this->get('/shop')
            ->assertOk()
            ->assertSee($active->name)
            ->assertDontSee($inactive->name)
            ->assertDontSee($deleted->name);

        $this->get(route('product', $inactive))->assertNotFound();
        $this->get(route('product', $deleted))->assertNotFound();
    }
}
