<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $t) {
            $t->string('order_number', 40)->nullable()->after('id');
            $t->foreignId('customer_id')->nullable()->after('order_number')->constrained('customers')->nullOnDelete();
            $t->string('delivery_area', 80)->nullable()->after('address');
            $t->text('note')->nullable()->after('delivery_area');
            $t->string('payment_method', 20)->default('COD')->after('total')->index();
            $t->string('idempotency_key', 64)->nullable()->after('payment_method');
        });

        $prefix = DB::table('settings')->where('key', 'order_prefix')->value('value') ?: 'GA';
        $orders = DB::table('orders')->orderBy('id')->get();

        foreach ($orders as $order) {
            DB::table('orders')->where('id', $order->id)->update([
                'order_number' => sprintf('%s-%06d', $prefix, $order->id),
            ]);
        }

        $groups = $orders->groupBy(function ($order) {
            $digits = preg_replace('/\D/', '', (string) $order->phone);

            return $digits !== '' ? $digits : trim((string) $order->phone);
        });

        foreach ($groups as $phone => $rows) {
            $nonCancelled = $rows->where('status', '!=', 'Cancelled');
            $payload = [
                'name' => $rows->last()->name,
                'phone' => $phone,
                'total_orders' => $nonCancelled->count(),
                'total_purchase' => $nonCancelled->sum('total'),
                'last_order_at' => $rows->max('created_at'),
                'updated_at' => now(),
            ];

            $customerId = DB::table('customers')->where('phone', $phone)->value('id');

            if ($customerId) {
                DB::table('customers')->where('id', $customerId)->update($payload);
            } else {
                $payload['created_at'] = now();
                $customerId = DB::table('customers')->insertGetId($payload);
            }

            foreach ($rows as $row) {
                DB::table('orders')->where('id', $row->id)->update(['customer_id' => $customerId]);
            }
        }

        Schema::table('orders', function (Blueprint $t) {
            $t->unique('order_number');
            $t->unique('idempotency_key');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $t) {
            $t->dropUnique(['order_number']);
            $t->dropUnique(['idempotency_key']);
            $t->dropForeign(['customer_id']);
            $t->dropColumn(['order_number', 'customer_id', 'delivery_area', 'note', 'payment_method', 'idempotency_key']);
        });
    }
};
