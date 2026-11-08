<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewModerationTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): self
    {
        $admin = Admin::create(['username' => 'admin', 'password' => 'admin']);

        return $this->withSession(['admin_id' => $admin->id]);
    }

    public function test_new_reviews_start_pending_and_are_hidden_until_approved(): void
    {
        $this->admin();

        $this->post('/reviews', [
            'name' => 'Ayesha',
            'text' => 'Lovely fabric and fast delivery',
            'stars' => 5,
        ])->assertRedirect();

        $this->assertDatabaseHas('reviews', [
            'name' => 'Ayesha',
            'status' => 'pending',
        ]);

        $review = Review::where('name', 'Ayesha')->firstOrFail();

        $this->get('/reviews')->assertDontSee('Lovely fabric and fast delivery');

        $this->patch("/admin/reviews/{$review->id}/status", ['status' => 'approved'])
            ->assertRedirect();

        $this->get('/reviews')->assertSee('Lovely fabric and fast delivery');
    }

    public function test_admin_can_reject_a_review(): void
    {
        $this->admin();

        $review = Review::create([
            'name' => 'Spam',
            'text' => 'Buy followers',
            'stars' => 1,
            'status' => 'pending',
        ]);

        $this->patch("/admin/reviews/{$review->id}/status", ['status' => 'rejected'])
            ->assertRedirect();

        $this->assertDatabaseHas('reviews', ['id' => $review->id, 'status' => 'rejected']);
        $this->get('/reviews')->assertDontSee('Buy followers');
    }
}
