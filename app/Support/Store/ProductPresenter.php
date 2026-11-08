<?php

namespace App\Support\Store;

use App\Models\Product;

class ProductPresenter
{
    public static function card(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'cat' => $product->cat,
            'category' => $product->category?->name,
            'description' => $product->description,
            'price' => $product->price,
            'old_price' => $product->old_price,
            'stock' => $product->stock,
            'off' => $product->off,
            'sizes' => $product->size_list,
            'image_url' => $product->image_url,
            'url' => route('product', $product),
        ];
    }

    public static function detail(Product $product): array
    {
        return self::card($product) + [
            'sub' => $product->sub,
            'features' => $product->feat_list,
            'gallery' => $product->gallery,
            'status' => $product->status,
        ];
    }
}
