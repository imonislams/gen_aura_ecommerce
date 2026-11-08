<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_status_histories', function (Blueprint $t) {
            $t->id();
            $t->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $t->string('status', 30)->index();
            $t->string('note', 255)->nullable();
            $t->unsignedBigInteger('admin_id')->nullable()->index();
            $t->timestamp('created_at')->nullable()->index();
        });

        foreach (DB::table('orders')->orderBy('id')->get() as $order) {
            DB::table('order_status_histories')->insert([
                'order_id' => $order->id,
                'status' => $order->status,
                'note' => 'Backfilled from existing order',
                'created_at' => $order->created_at,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('order_status_histories');
    }
};
