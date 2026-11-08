<?php
namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\ContactMessage;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\Setting;
use App\Support\Store\ProductPresenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function home()
    {
        $products = Product::active()->with('category')->latest()->take(8)->get();
        $reviews = Review::approved()->latest()->take(3)->get();
        $settings = Setting::all_();
        $heroProduct = $products->first();
        $heroImage = !empty($settings['hero_image'])
            ? asset('storage/' . $settings['hero_image'])
            : $heroProduct?->image_url;

        $featuredCategories = Category::active()->orderBy('sort_order')->take(4)->get(['id', 'name', 'slug']);
        $featuredProducts = Product::active()->with('category')->featured()->latest()->take(4)->get();

        $bestSellerIds = OrderItem::selectRaw('product_id, sum(qty) as sold')
            ->whereNotNull('product_id')
            ->whereHas('order', fn ($query) => $query->where('status', '!=', 'Cancelled'))
            ->groupBy('product_id')
            ->orderByDesc('sold')
            ->take(4)
            ->pluck('product_id');

        $bestSellers = Product::active()->with('category')->whereIn('id', $bestSellerIds)->get()
            ->sortBy(fn (Product $p) => $bestSellerIds->search($p->id))
            ->values();

        return Inertia::render('Store/Home', [
            'products' => $products->map(fn (Product $p) => ProductPresenter::card($p))->values(),
            'featuredCategories' => $featuredCategories->map(fn (Category $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
            ])->values(),
            'featuredProducts' => $featuredProducts->map(fn (Product $p) => ProductPresenter::card($p))->values(),
            'bestSellers' => $bestSellers->map(fn (Product $p) => ProductPresenter::card($p))->values(),
            'reviews' => $reviews->map(fn (Review $r) => [
                'id' => $r->id,
                'name' => $r->name,
                'text' => $r->text,
                'stars' => $r->stars,
            ])->values(),
            'heroImage' => $heroImage,
            'heroProduct' => $heroProduct ? [
                'name' => $heroProduct->name,
                'price' => $heroProduct->price,
            ] : null,
        ]);
    }

    public function shop(Request $r)
    {
        $q = Product::active()->with('category');
        if ($r->filled('cat')) $q->where('cat', $r->cat);
        if ($r->filled('q')) $q->where('name', 'like', '%' . $r->q . '%');
        if ($r->filled('min')) $q->where('price', '>=', (int) $r->min);
        if ($r->filled('max')) $q->where('price', '<=', (int) $r->max);
        if ($r->boolean('stock')) $q->where('stock', '>', 0);
        if ($r->sort === 'low') $q->orderBy('price');
        elseif ($r->sort === 'high') $q->orderByDesc('price');
        else $q->latest();

        return Inertia::render('Store/Shop', [
            'products' => $q->paginate(24)->withQueryString()->through(fn (Product $p) => ProductPresenter::card($p)),
            'filters' => [
                'cat' => $r->input('cat'),
                'q' => $r->input('q'),
                'min' => $r->input('min'),
                'max' => $r->input('max'),
                'sort' => $r->input('sort'),
                'stock' => $r->input('stock'),
            ],
            'categories' => Category::active()->orderBy('sort_order')->orderBy('name')->get(['id', 'name', 'slug']),
        ]);
    }

    public function product(Product $product)
    {
        abort_if($product->status !== 'active', 404);

        $product->load('category');

        $related = Product::active()->with('category')
            ->where('id', '!=', $product->id)
            ->when($product->category_id, fn ($query) => $query->where('category_id', $product->category_id))
            ->latest()
            ->take(4)
            ->get();

        if ($related->isEmpty()) {
            $related = Product::active()->with('category')
                ->where('id', '!=', $product->id)
                ->latest()
                ->take(4)
                ->get();
        }

        $reviews = Review::approved()->where('product_id', $product->id)->latest()->limit(12)->get();

        return Inertia::render('Store/Product', [
            'product' => ProductPresenter::detail($product),
            'related' => $related->map(fn (Product $p) => ProductPresenter::card($p))->values(),
            'reviews' => $reviews->map(fn (Review $review) => [
                'id' => $review->id,
                'name' => $review->name,
                'text' => $review->text,
                'stars' => $review->stars,
                'created_at' => $review->created_at?->toIso8601String(),
            ])->values(),
        ]);
    }

    public function reviews()
    {
        $all = Review::approved()->with('product')->latest()->get();

        return Inertia::render('Store/Reviews', [
            'reviews' => $all->map(fn (Review $review) => [
                'id' => $review->id,
                'name' => $review->name,
                'text' => $review->text,
                'stars' => $review->stars,
                'product' => $review->product?->name,
                'created_at' => $review->created_at?->toIso8601String(),
            ])->values(),
            'avg' => $all->count() ? round($all->avg('stars'), 2) : 0,
            'count' => $all->count(),
        ]);
    }

    public function storeReview(Request $r)
    {
        $d = $r->validate([
            'name' => 'nullable|max:60',
            'text' => 'required|max:500',
            'stars' => 'required|integer|between:1,5',
            'product_id' => 'nullable|integer|exists:products,id',
        ]);
        $d['name'] = $d['name'] ?: 'Customer';
        $d['status'] = 'pending';
        Review::create($d);
        return back()->with('ok', 'Thank you! Your review will appear after approval.');
    }

    public function contact() { return Inertia::render('Store/Contact'); }

    public function storeContact(Request $r)
    {
        if ($r->filled('website')) {
            return back()->with('ok', 'Thank you! We will contact you soon.');
        }

        $d = $r->validate([
            'name' => 'required|max:80',
            'phone' => ['required', 'max:20', fn ($a, $v, $f) => strlen(preg_replace('/\D/', '', $v)) < 10 ? $f('Please enter a valid phone number') : null],
            'email' => 'nullable|email|max:120',
            'subject' => 'nullable|max:150',
            'message' => 'required|max:2000',
        ]);

        ContactMessage::create($d);

        $to = config('shop.order_email') ?: (Setting::all_()['email'] ?? null);
        if ($to) {
            try {
                $html = '<h2>New contact message</h2>'
                    . '<p><b>' . e($d['name']) . '</b><br>Phone: ' . e($d['phone']) . '<br>Email: ' . e($d['email'] ?? '—') . '</p>'
                    . '<p><b>Subject:</b> ' . e($d['subject'] ?? '—') . '</p>'
                    . '<p>' . nl2br(e($d['message'])) . '</p>';
                Mail::html($html, fn ($message) => $message->to($to)->subject('Contact message from ' . $d['name']));
            } catch (\Throwable $e) {
                report($e);
            }
        }

        return back()->with('ok', 'Thank you! We will contact you soon.');
    }

    public function about() { return Inertia::render('Store/About'); }
}
