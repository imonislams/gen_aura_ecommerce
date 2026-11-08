<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('admins', function (Blueprint $t) {
            $t->id(); $t->string('username')->unique(); $t->string('password'); $t->timestamps();
        });
        Schema::create('products', function (Blueprint $t) {
            $t->id(); $t->string('name'); $t->string('cat')->nullable()->index(); $t->string('sub')->nullable();
            $t->string('sizes')->nullable(); $t->string('feat')->nullable(); $t->text('description')->nullable();
            $t->unsignedInteger('price'); $t->unsignedInteger('old_price')->default(0); $t->unsignedInteger('stock')->default(0);
            $t->string('image')->nullable(); $t->json('images')->nullable(); $t->timestamps();
        });
        Schema::create('orders', function (Blueprint $t) {
            $t->id(); $t->string('name'); $t->string('phone'); $t->text('address');
            $t->unsignedInteger('subtotal'); $t->unsignedInteger('ship')->default(0); $t->unsignedInteger('total');
            $t->string('status')->default('Pending')->index(); $t->timestamps();
        });
        Schema::create('order_items', function (Blueprint $t) {
            $t->id(); $t->foreignId('order_id')->constrained()->cascadeOnDelete(); $t->unsignedBigInteger('product_id')->nullable();
            $t->string('name'); $t->string('size')->nullable(); $t->unsignedInteger('qty'); $t->unsignedInteger('price');
        });
        Schema::create('reviews', function (Blueprint $t) {
            $t->id(); $t->string('name'); $t->text('text'); $t->unsignedTinyInteger('stars')->default(5); $t->timestamps();
        });
        Schema::create('settings', function (Blueprint $t) {
            $t->string('key')->primary(); $t->text('value')->nullable();
        });
    }
    public function down(): void
    {
        foreach (['settings', 'reviews', 'order_items', 'orders', 'products', 'admins'] as $x) Schema::dropIfExists($x);
    }
};
