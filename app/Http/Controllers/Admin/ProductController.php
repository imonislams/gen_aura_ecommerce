<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\InventoryMovement;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $r)
    {
        $q = Product::with('category');

        if ($r->filled('q')) {
            $q->where(fn ($x) => $x->where('name', 'like', '%' . $r->q . '%')->orWhere('sku', 'like', '%' . $r->q . '%'));
        }
        if ($r->boolean('low')) {
            $q->where('stock', '<=', 3);
        }
        if ($r->filled('status')) {
            $q->where('status', $r->status);
        }
        if ($r->boolean('trashed')) {
            $q->onlyTrashed();
        }

        return Inertia::render('Admin/Products/Index', [
            'products' => $q->latest()->paginate(30)->withQueryString()->through(fn (Product $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'sku' => $p->sku,
                'category' => $p->category?->name ?? ($p->cat ?: 'Uncategorised'),
                'image_url' => $p->image_url,
                'price' => $p->price,
                'stock' => $p->stock,
                'status' => $p->status,
                'featured' => $p->featured,
                'trashed' => $p->trashed(),
                'deleted_at' => $p->deleted_at?->toIso8601String(),
            ]),
            'filters' => $r->only(['q', 'status', 'low', 'trashed']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Products/Form', [
            'product' => null,
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function edit(Product $product)
    {
        return Inertia::render('Admin/Products/Form', [
            'product' => $this->formProduct($product),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    private function formProduct(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'sku' => $product->sku,
            'category_id' => $product->category_id,
            'cat' => $product->cat,
            'sub' => $product->sub,
            'sizes' => $product->sizes,
            'feat' => $product->feat,
            'description' => $product->description,
            'price' => $product->price,
            'old_price' => $product->old_price,
            'stock' => $product->stock,
            'status' => $product->status,
            'featured' => (bool) $product->featured,
            'image_url' => $product->image_url,
            'images' => $product->images ?? [],
        ];
    }

    public function store(Request $r)
    {
        $product = Product::create($this->payload($r, new Product()));

        if ((int) $product->stock > 0) {
            InventoryMovement::create([
                'product_id' => $product->id,
                'type' => 'initial_stock',
                'quantity_delta' => (int) $product->stock,
                'stock_before' => 0,
                'stock_after' => (int) $product->stock,
                'note' => 'Product created',
                'admin_id' => session('admin_id'),
                'created_at' => now(),
            ]);
        }

        return redirect()->route('admin.products.index')->with('ok', 'Product added');
    }

    public function update(Request $r, Product $product)
    {
        $oldStock = (int) $product->stock;

        $product->update($this->payload($r, $product));

        if ((int) $product->stock !== $oldStock) {
            InventoryMovement::create([
                'product_id' => $product->id,
                'type' => 'manual_adjustment',
                'quantity_delta' => (int) $product->stock - $oldStock,
                'stock_before' => $oldStock,
                'stock_after' => (int) $product->stock,
                'note' => 'Admin product edit',
                'admin_id' => session('admin_id'),
                'created_at' => now(),
            ]);
        }

        return redirect()->route('admin.products.index')->with('ok', 'Product updated');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return back()->with('ok', 'Product deleted (it can be restored)');
    }

    public function restore(Product $product)
    {
        $product->restore();

        return back()->with('ok', 'Product restored');
    }

    private function payload(Request $r, Product $p): array
    {
        $d = $r->validate([
            'name' => 'required|max:120',
            'slug' => ['nullable', 'max:140', Rule::unique('products', 'slug')->ignore($p->id)],
            'sku' => ['nullable', 'max:60', Rule::unique('products', 'sku')->ignore($p->id)],
            'category_id' => ['nullable', 'exists:categories,id'],
            'cat' => 'nullable|max:40',
            'sub' => 'nullable|max:80',
            'sizes' => 'nullable|max:80',
            'feat' => 'nullable|max:200',
            'description' => 'nullable|max:2000',
            'price' => 'required|integer|min:0',
            'old_price' => 'nullable|integer|min:0',
            'stock' => 'required|integer|min:0',
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'featured' => 'nullable|boolean',
            'image' => 'nullable|image|max:4096',
            'images.*' => 'image|max:4096',
            'remove_images' => 'nullable|array',
            'remove_images.*' => 'string',
        ]);

        unset($d['image'], $d['images'], $d['remove_images']);

        $d['old_price'] = $d['old_price'] ?? 0;
        $d['featured'] = (bool) ($d['featured'] ?? false);
        $d['status'] = $d['status'] ?? 'active';

        if (array_key_exists('category_id', $d)) {
            if (!empty($d['category_id'])) {
                $category = Category::find($d['category_id']);
                $d['cat'] = $category?->name;
            } else {
                $d['cat'] = null;
            }
        }

        $d['slug'] = !empty($d['slug'] ?? null)
            ? (Str::slug($d['slug']) ?: $this->uniqueSlug($d['name'], $p->id))
            : $this->uniqueSlug($d['name'], $p->id);

        if (empty($d['sku'] ?? null)) {
            $d['sku'] = null;
        }

        $d['image'] = $p->image;
        if ($r->hasFile('image')) {
            if ($p->image) {
                Storage::disk('public')->delete($p->image);
            }
            $d['image'] = $r->file('image')->store('products', 'public');
        }

        $keep = array_values(array_diff($p->images ?? [], $r->input('remove_images', [])));
        foreach (array_diff($p->images ?? [], $keep) as $f) {
            Storage::disk('public')->delete($f);
        }
        foreach ($r->file('images', []) as $f) {
            $keep[] = $f->store('products', 'public');
        }
        $d['images'] = $keep;

        return $d;
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'product';
        $slug = $base;
        $counter = 2;

        while (
            Product::withTrashed()
                ->where('slug', $slug)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base . '-' . $counter++;
        }

        return $slug;
    }
}
