<?php

namespace App\Services\Inventory;

use App\Models\InventoryMovement;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class StockService
{
    public function apply(Product $product, int $delta, string $type, array $meta = []): InventoryMovement
    {
        $before = (int) $product->stock;
        $after = $before + $delta;

        if ($after < 0) {
            throw new RuntimeException(($product->name ?: 'Product') . ': not enough stock.');
        }

        $product->update(['stock' => $after]);

        return InventoryMovement::create([
            'product_id' => $product->id,
            'type' => $type,
            'quantity_delta' => $delta,
            'stock_before' => $before,
            'stock_after' => $after,
            'reference_type' => $meta['reference_type'] ?? null,
            'reference_id' => $meta['reference_id'] ?? null,
            'note' => $meta['note'] ?? null,
            'admin_id' => $meta['admin_id'] ?? null,
            'created_at' => now(),
        ]);
    }

    public function adjust(Product $product, int $delta, ?string $note, ?int $adminId): void
    {
        DB::transaction(function () use ($product, $delta, $note, $adminId) {
            $locked = Product::lockForUpdate()->findOrFail($product->id);

            $this->apply($locked, $delta, 'manual_adjustment', [
                'note' => $note,
                'admin_id' => $adminId,
            ]);
        });
    }
}
