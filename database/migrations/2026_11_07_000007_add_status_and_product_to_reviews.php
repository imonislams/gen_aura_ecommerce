<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $t) {
            $t->string('status', 20)->default('pending')->after('stars')->index();
            $t->foreignId('product_id')->nullable()->after('status')->constrained('products')->nullOnDelete();
        });

        DB::table('reviews')->update(['status' => 'approved']);
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $t) {
            $t->dropForeign(['product_id']);
            $t->dropColumn(['status', 'product_id']);
        });
    }
};
