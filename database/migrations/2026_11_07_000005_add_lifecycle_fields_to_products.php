<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $t) {
            $t->string('slug')->nullable()->after('name');
            $t->string('sku')->nullable()->after('slug');
            $t->string('status', 20)->default('active')->after('stock')->index();
            $t->boolean('featured')->default(false)->after('status')->index();
            $t->foreignId('category_id')->nullable()->after('cat')->constrained('categories')->nullOnDelete();
            $t->softDeletes();
        });

        $settingsCats = (string) (DB::table('settings')->where('key', 'cats')->value('value') ?? '');
        $names = collect(explode(',', $settingsCats))
            ->merge(DB::table('products')->whereNotNull('cat')->distinct()->pluck('cat'))
            ->map(fn ($name) => trim((string) $name))
            ->filter()
            ->unique()
            ->values();

        $categoryIds = [];
        foreach ($names as $index => $name) {
            $slug = Str::slug($name) ?: 'category-' . ($index + 1);
            $existing = DB::table('categories')->where('slug', $slug)->first();

            if ($existing) {
                $categoryIds[$name] = $existing->id;
                continue;
            }

            $categoryIds[$name] = DB::table('categories')->insertGetId([
                'name' => $name,
                'slug' => $slug,
                'status' => 'active',
                'sort_order' => $index,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $usedSlugs = [];
        foreach (DB::table('products')->orderBy('id')->get() as $product) {
            $base = Str::slug((string) $product->name) ?: 'product-' . $product->id;
            $slug = $base;
            $suffix = 2;

            while (
                in_array($slug, $usedSlugs, true)
                || DB::table('products')->where('slug', $slug)->where('id', '!=', $product->id)->exists()
            ) {
                $slug = $base . '-' . $suffix++;
            }

            $usedSlugs[] = $slug;

            DB::table('products')->where('id', $product->id)->update([
                'slug' => $slug,
                'status' => $product->status ?: 'active',
                'featured' => 0,
                'category_id' => $categoryIds[trim((string) $product->cat)] ?? null,
            ]);
        }

        Schema::table('products', function (Blueprint $t) {
            $t->unique('slug');
            $t->unique('sku');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $t) {
            $t->dropUnique(['slug']);
            $t->dropUnique(['sku']);
            $t->dropForeign(['category_id']);
            $t->dropColumn(['slug', 'sku', 'status', 'featured', 'category_id', 'deleted_at']);
        });
    }
};
