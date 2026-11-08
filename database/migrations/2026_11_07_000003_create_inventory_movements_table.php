<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_movements', function (Blueprint $t) {
            $t->id();
            $t->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $t->string('type', 40)->index();
            $t->integer('quantity_delta');
            $t->unsignedInteger('stock_before');
            $t->unsignedInteger('stock_after');
            $t->string('reference_type', 60)->nullable();
            $t->unsignedBigInteger('reference_id')->nullable()->index();
            $t->string('note', 255)->nullable();
            $t->unsignedBigInteger('admin_id')->nullable()->index();
            $t->timestamp('created_at')->nullable()->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
    }
};
