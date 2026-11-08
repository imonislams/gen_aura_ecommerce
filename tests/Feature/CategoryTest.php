<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): self
    {
        $admin = Admin::create(['username' => 'admin', 'password' => 'admin']);

        return $this->withSession(['admin_id' => $admin->id]);
    }

    public function test_admin_can_view_create_update_and_delete_a_category(): void
    {
        $this->admin();

        $this->get('/admin/categories')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Categories/Index')
                ->has('categories'));

        $this->post('/admin/categories', [
            'name' => 'Hoodie',
            'status' => 'active',
            'sort_order' => 2,
        ])->assertRedirect();

        $this->assertDatabaseHas('categories', [
            'name' => 'Hoodie',
            'slug' => 'hoodie',
            'status' => 'active',
            'sort_order' => 2,
        ]);

        $category = Category::where('slug', 'hoodie')->firstOrFail();

        $this->put("/admin/categories/{$category->id}", [
            'name' => 'Hoodies',
            'slug' => 'hoodies',
            'status' => 'inactive',
            'sort_order' => 3,
        ])->assertRedirect();

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'Hoodies',
            'slug' => 'hoodies',
            'status' => 'inactive',
        ]);
    }

    public function test_deleting_a_category_keeps_its_products_and_uncategorises_them(): void
    {
        $this->admin();

        $category = Category::create([
            'name' => 'Shirt',
            'slug' => 'shirt',
            'status' => 'active',
            'sort_order' => 0,
        ]);

        $product = Product::create([
            'name' => 'Test Shirt',
            'cat' => 'Shirt',
            'category_id' => $category->id,
            'price' => 1000,
            'old_price' => 0,
            'stock' => 5,
            'status' => 'active',
            'featured' => false,
        ]);

        $this->delete("/admin/categories/{$category->id}")->assertRedirect();

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
        $this->assertDatabaseHas('products', ['id' => $product->id, 'category_id' => null]);
    }
}
