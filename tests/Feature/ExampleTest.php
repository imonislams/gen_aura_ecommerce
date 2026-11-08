<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_application_returns_a_successful_response(): void
    {
        Setting::put([
            'name' => 'GEN AURA',
            'cats' => 'T-Shirt',
        ]);

        Product::create([
            'name' => 'Test T-Shirt',
            'cat' => 'T-Shirt',
            'description' => 'Test product',
            'price' => 650,
            'old_price' => 850,
            'stock' => 10,
        ]);

        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
