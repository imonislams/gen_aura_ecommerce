<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analytics_visitors', function (Blueprint $t) {
            $t->id();
            $t->uuid('uuid')->unique();
            $t->timestamp('first_seen_at')->index();
            $t->timestamp('last_seen_at')->index();
            $t->string('first_landing_path', 512)->nullable();
            $t->string('last_path', 512)->nullable();
            $t->string('referrer_domain', 255)->nullable()->index();
            $t->string('device_type', 20)->nullable()->index();
            $t->string('browser', 40)->nullable()->index();
            $t->string('os', 40)->nullable()->index();
            $t->char('country', 2)->nullable()->index();
            $t->unsignedInteger('total_sessions')->default(0);
            $t->unsignedInteger('total_page_views')->default(0);
            $t->boolean('has_ordered')->default(false)->index();
            $t->timestamps();
        });

        Schema::create('analytics_sessions', function (Blueprint $t) {
            $t->id();
            $t->uuid('uuid')->unique();
            $t->foreignId('visitor_id')->constrained('analytics_visitors')->cascadeOnDelete();
            $t->timestamp('started_at')->index();
            $t->timestamp('last_activity_at')->index();
            $t->timestamp('ended_at')->nullable();
            $t->unsignedInteger('duration_seconds')->nullable();
            $t->string('entry_path', 512)->nullable();
            $t->string('exit_path', 512)->nullable();
            $t->unsignedInteger('page_views')->default(0);
            $t->string('device_type', 20)->nullable();
            $t->string('browser', 40)->nullable();
            $t->string('os', 40)->nullable();
            $t->char('country', 2)->nullable();
            $t->string('referrer_domain', 255)->nullable();
            $t->boolean('is_bounce')->default(false)->index();
            $t->boolean('has_cart_activity')->default(false)->index();
            $t->boolean('has_checkout')->default(false)->index();
            $t->boolean('converted')->default(false)->index();
            $t->timestamps();

            $t->index(['visitor_id', 'started_at']);
        });

        Schema::create('analytics_events', function (Blueprint $t) {
            $t->id();
            $t->foreignId('visitor_id')->constrained('analytics_visitors')->cascadeOnDelete();
            $t->foreignId('session_id')->constrained('analytics_sessions')->cascadeOnDelete();
            $t->string('event_type', 40)->index();
            $t->string('path', 512)->nullable()->index();
            $t->string('url', 2048)->nullable();
            $t->string('page_type', 30)->nullable()->index();
            $t->unsignedBigInteger('product_id')->nullable()->index();
            $t->unsignedBigInteger('order_id')->nullable()->index();
            $t->string('category', 100)->nullable()->index();
            $t->string('search_term', 200)->nullable();
            $t->json('metadata')->nullable();
            $t->timestamp('occurred_at')->index();
            $t->timestamp('created_at')->nullable();

            $t->index(['visitor_id', 'occurred_at']);
            $t->index(['session_id', 'occurred_at']);
            $t->index(['event_type', 'occurred_at']);
        });

        Schema::create('analytics_order_links', function (Blueprint $t) {
            $t->id();
            $t->foreignId('order_id')->unique()->constrained('orders')->cascadeOnDelete();
            $t->foreignId('visitor_id')->nullable()->constrained('analytics_visitors')->nullOnDelete();
            $t->foreignId('session_id')->nullable()->constrained('analytics_sessions')->nullOnDelete();
            $t->timestamps();
        });

        Schema::create('analytics_daily', function (Blueprint $t) {
            $t->date('date')->primary();
            $t->unsignedInteger('visitors')->default(0);
            $t->unsignedInteger('new_visitors')->default(0);
            $t->unsignedInteger('returning_visitors')->default(0);
            $t->unsignedInteger('sessions')->default(0);
            $t->unsignedInteger('page_views')->default(0);
            $t->unsignedInteger('product_views')->default(0);
            $t->unsignedInteger('add_to_cart')->default(0);
            $t->unsignedInteger('checkout_started')->default(0);
            $t->unsignedInteger('orders')->default(0);
            $t->unsignedInteger('revenue')->default(0);
            $t->unsignedInteger('units')->default(0);
            $t->unsignedInteger('bounces')->default(0);
            $t->timestamps();
        });

        Schema::create('analytics_product_daily', function (Blueprint $t) {
            $t->date('date');
            $t->unsignedBigInteger('product_id');
            $t->unsignedInteger('views')->default(0);
            $t->unsignedInteger('unique_viewers')->default(0);
            $t->unsignedInteger('add_to_cart')->default(0);
            $t->unsignedInteger('checkout')->default(0);
            $t->unsignedInteger('orders')->default(0);
            $t->unsignedInteger('units')->default(0);
            $t->unsignedInteger('revenue')->default(0);
            $t->primary(['date', 'product_id']);
            $t->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_product_daily');
        Schema::dropIfExists('analytics_daily');
        Schema::dropIfExists('analytics_order_links');
        Schema::dropIfExists('analytics_events');
        Schema::dropIfExists('analytics_sessions');
        Schema::dropIfExists('analytics_visitors');
    }
};
