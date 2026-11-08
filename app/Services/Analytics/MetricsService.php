<?php

namespace App\Services\Analytics;

use App\Models\AnalyticsEvent;
use App\Models\AnalyticsOrderLink;
use App\Models\AnalyticsSession;
use App\Models\AnalyticsVisitor;
use App\Models\Order;
use App\Models\Product;
use App\Support\Analytics\DateRange;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class MetricsService
{
    public function overview(DateRange $range): array
    {
        return Cache::remember(
            'analytics.overview.' . $range->cacheKey(),
            (int) config('analytics.cache_ttl_seconds', 60),
            fn () => $this->buildOverview($range)
        );
    }

    private function buildOverview(DateRange $range): array
    {
        $start = $range->startUtc();
        $end = $range->endUtc();
        $tz = config('analytics.timezone', 'Asia/Dhaka');

        $events = AnalyticsEvent::whereBetween('occurred_at', [$start, $end]);
        $sessions = AnalyticsSession::whereBetween('started_at', [$start, $end]);

        $totalSessions = (clone $sessions)->count();
        $bounces = (clone $sessions)->where('page_views', '<=', 1)->count();
        $ordersQuery = Order::whereBetween('created_at', [$start, $end])->where('status', '!=', 'Cancelled');

        $kpis = [
            'total_visitors' => (clone $events)->distinct()->count('visitor_id'),
            'unique_visitors' => (clone $sessions)->distinct()->count('visitor_id'),
            'new_visitors' => AnalyticsVisitor::whereBetween('first_seen_at', [$start, $end])->count(),
            'returning_visitors' => AnalyticsVisitor::where('first_seen_at', '<', $start)->whereBetween('last_seen_at', [$start, $end])->count(),
            'total_sessions' => $totalSessions,
            'total_page_views' => (clone $events)->where('event_type', 'page_view')->count(),
            'avg_session_duration' => (int) round((float) (clone $sessions)->whereNotNull('duration_seconds')->avg('duration_seconds')),
            'bounce_rate' => $totalSessions > 0 ? round($bounces / $totalSessions * 100, 1) : 0,
            'product_views' => (clone $events)->where('event_type', 'page_view')->where('page_type', 'product')->count(),
            'add_to_cart' => (clone $events)->where('event_type', 'add_to_cart')->count(),
            'checkout_started' => (clone $events)->where('event_type', 'checkout_started')->count(),
            'completed_orders' => (clone $ordersQuery)->count(),
            'revenue' => (int) (clone $ordersQuery)->sum('total'),
        ];

        $chartEvents = (clone $events)->get(['visitor_id', 'event_type', 'occurred_at', 'page_type', 'path', 'product_id', 'session_id']);
        $daily = [];

        for ($day = $range->from; $day->lte($range->to); $day = $day->addDay()) {
            $daily[$day->toDateString()] = ['label' => $day->format('j/n'), 'visitors' => [], 'page_views' => 0];
        }

        foreach ($chartEvents as $event) {
            $key = $event->occurred_at->copy()->setTimezone($tz)->toDateString();
            if (!isset($daily[$key])) {
                continue;
            }
            if ($event->event_type === 'page_view') {
                $daily[$key]['page_views']++;
            }
            if ($event->visitor_id) {
                $daily[$key]['visitors'][$event->visitor_id] = true;
            }
        }

        $labels = [];
        $visitorsTrend = [];
        $pageViewsTrend = [];
        foreach ($daily as $data) {
            $labels[] = $data['label'];
            $visitorsTrend[] = count($data['visitors']);
            $pageViewsTrend[] = $data['page_views'];
        }

        $devices = (clone $sessions)->whereNotNull('device_type')
            ->select('device_type', DB::raw('count(*) as total'))
            ->groupBy('device_type')
            ->pluck('total', 'device_type');

        $browsers = (clone $sessions)->whereNotNull('browser')
            ->select('browser', DB::raw('count(*) as total'))
            ->groupBy('browser')
            ->orderByDesc('total')
            ->limit(8)
            ->pluck('total', 'browser');

        $pages = (clone $events)->where('event_type', 'page_view')
            ->select('path', DB::raw('count(*) as views'), DB::raw('count(distinct visitor_id) as visitors'))
            ->groupBy('path')
            ->orderByDesc('views')
            ->limit(10)
            ->get()
            ->map(fn ($row) => ['path' => $row->path ?: '/', 'views' => (int) $row->views, 'visitors' => (int) $row->visitors]);

        $productViews = (clone $events)->where('event_type', 'page_view')->where('page_type', 'product')->whereNotNull('product_id')
            ->select('product_id', DB::raw('count(*) as views'))
            ->groupBy('product_id')
            ->orderByDesc('views')
            ->limit(10)
            ->get();

        $products = Product::withTrashed()->whereIn('id', $productViews->pluck('product_id'))->get()->keyBy('id');
        $topProducts = $productViews->map(fn ($row) => [
            'id' => $row->product_id,
            'name' => $products->get($row->product_id)?->name ?? 'Deleted product',
            'views' => (int) $row->views,
        ]);

        $timeline = (clone $events)->with('visitor')->latest('occurred_at')->limit(15)->get()->map(fn ($event) => [
            'id' => $event->id,
            'uuid' => $event->visitor?->uuid,
            'short' => substr($event->visitor?->uuid ?? '', 0, 8),
            'event_type' => $event->event_type,
            'page_type' => $event->page_type,
            'path' => $event->path,
            'device' => $event->visitor?->device_type,
            'occurred_at' => $event->occurred_at?->toIso8601String(),
        ]);

        return [
            'range' => $range->toArray(),
            'kpis' => $kpis,
            'charts' => [
                'labels' => $labels,
                'visitors' => $visitorsTrend,
                'page_views' => $pageViewsTrend,
                'devices' => $devices->map(fn ($total, $type) => ['label' => ucfirst((string) $type), 'value' => (int) $total])->values(),
                'browsers' => $browsers->map(fn ($total, $name) => ['label' => $name, 'value' => (int) $total])->values(),
                'pages' => $pages,
                'products' => $topProducts,
            ],
            'timeline' => $timeline,
        ];
    }

    public function live(): array
    {
        return Cache::remember('analytics.live', 10, function () {
            $cutoff = now()->subMinutes((int) config('analytics.session_timeout_minutes', 30));

            $sessions = AnalyticsSession::whereNull('ended_at')
                ->where('last_activity_at', '>=', $cutoff)
                ->with('visitor')
                ->orderByDesc('last_activity_at')
                ->limit(50)
                ->get();

            $active = AnalyticsSession::whereNull('ended_at')->where('last_activity_at', '>=', $cutoff)->count();

            $pageCounts = AnalyticsEvent::where('occurred_at', '>=', $cutoff)
                ->where('event_type', 'page_view')
                ->select('page_type', DB::raw('count(distinct visitor_id) as total'))
                ->groupBy('page_type')
                ->pluck('total', 'page_type');

            $lastEvents = AnalyticsEvent::whereIn('session_id', $sessions->pluck('id'))
                ->orderByDesc('occurred_at')
                ->get()
                ->unique('session_id')
                ->keyBy('session_id');

            $rows = $sessions->map(fn ($session) => [
                'uuid' => $session->visitor?->uuid,
                'short' => substr($session->visitor?->uuid ?? '', 0, 8),
                'device' => $session->device_type,
                'browser' => $session->browser,
                'os' => $session->os,
                'current_page' => $session->exit_path,
                'activity' => $lastEvents->get($session->id)?->event_type,
                'started_at' => $session->started_at?->toIso8601String(),
                'last_activity' => $session->last_activity_at?->toIso8601String(),
            ]);

            return [
                'active' => $active,
                'pages' => [
                    'home' => (int) ($pageCounts['home'] ?? 0),
                    'shop' => (int) ($pageCounts['shop'] ?? 0),
                    'product' => (int) ($pageCounts['product'] ?? 0),
                    'cart' => (int) ($pageCounts['cart'] ?? 0),
                    'checkout' => (int) ($pageCounts['checkout'] ?? 0),
                ],
                'rows' => $rows,
                'refresh_seconds' => (int) config('analytics.live_refresh_seconds', 20),
            ];
        });
    }

    public function visitors(DateRange $range, array $filters, int $perPage = 30): LengthAwarePaginator
    {
        $start = $range->startUtc();
        $end = $range->endUtc();

        $query = AnalyticsVisitor::where('first_seen_at', '<=', $end)->where('last_seen_at', '>=', $start);

        if (!empty($filters['q'])) {
            $query->where('uuid', 'like', '%' . $filters['q'] . '%');
        }
        if (($filters['type'] ?? '') === 'new') {
            $query->whereBetween('first_seen_at', [$start, $end]);
        }
        if (($filters['type'] ?? '') === 'returning') {
            $query->where('first_seen_at', '<', $start);
        }
        if (!empty($filters['device'])) {
            $query->where('device_type', $filters['device']);
        }

        switch ($filters['has'] ?? '') {
            case 'product':
                $query->whereHas('events', fn ($event) => $event->whereBetween('occurred_at', [$start, $end])->where('event_type', 'page_view')->where('page_type', 'product'));
                break;
            case 'cart':
                $query->whereHas('events', fn ($event) => $event->whereBetween('occurred_at', [$start, $end])->whereIn('event_type', ['add_to_cart', 'cart_qty_update', 'remove_from_cart']));
                break;
            case 'checkout':
                $query->whereHas('events', fn ($event) => $event->whereBetween('occurred_at', [$start, $end])->where('event_type', 'checkout_started'));
                break;
            case 'ordered':
                $query->where('has_ordered', true);
                break;
            case 'no_orders':
                $query->where('has_ordered', false);
                break;
        }

        return $query->orderByDesc('last_seen_at')->paginate($perPage)->withQueryString();
    }

    public function visitorDetail(string $uuid): array
    {
        $visitor = AnalyticsVisitor::where('uuid', $uuid)->firstOrFail();
        $sessions = $visitor->sessions()->latest('started_at')->limit(30)->get();
        $events = $visitor->events()->latest('occurred_at')->limit(200)->get();
        $links = AnalyticsOrderLink::where('visitor_id', $visitor->id)->with('order')->latest()->get();

        return [
            'visitor' => [
                'uuid' => $visitor->uuid,
                'short' => substr($visitor->uuid, 0, 8),
                'first_seen_at' => $visitor->first_seen_at?->toIso8601String(),
                'last_seen_at' => $visitor->last_seen_at?->toIso8601String(),
                'device_type' => $visitor->device_type,
                'browser' => $visitor->browser,
                'os' => $visitor->os,
                'country' => $visitor->country,
                'referrer_domain' => $visitor->referrer_domain,
                'total_sessions' => $visitor->total_sessions,
                'total_page_views' => $visitor->total_page_views,
                'has_ordered' => $visitor->has_ordered,
                'last_path' => $visitor->last_path,
            ],
            'sessions' => $sessions->map(fn ($session) => [
                'id' => $session->id,
                'uuid' => $session->uuid,
                'started_at' => $session->started_at?->toIso8601String(),
                'last_activity_at' => $session->last_activity_at?->toIso8601String(),
                'duration_seconds' => (int) ($session->duration_seconds ?? 0),
                'entry_path' => $session->entry_path,
                'exit_path' => $session->exit_path,
                'page_views' => $session->page_views,
                'is_bounce' => $session->is_bounce,
                'has_checkout' => $session->has_checkout,
                'converted' => $session->converted,
            ])->values(),
            'events' => $events->map(fn ($event) => [
                'id' => $event->id,
                'event_type' => $event->event_type,
                'page_type' => $event->page_type,
                'path' => $event->path,
                'product_id' => $event->product_id,
                'order_id' => $event->order_id,
                'metadata' => $event->metadata,
                'occurred_at' => $event->occurred_at?->toIso8601String(),
            ])->values(),
            'orders' => $links->map(fn ($link) => [
                'order_id' => $link->order_id,
                'order_number' => $link->order?->order_number,
                'status' => $link->order?->status,
                'total' => (int) ($link->order?->total ?? 0),
                'created_at' => $link->order?->created_at?->toIso8601String(),
            ])->values(),
        ];
    }

    public function activity(DateRange $range, array $filters, int $perPage = 50): array
    {
        $start = $range->startUtc();
        $end = $range->endUtc();

        $query = AnalyticsEvent::with('visitor')->whereBetween('occurred_at', [$start, $end]);
        if (!empty($filters['event_type'])) {
            $query->where('event_type', $filters['event_type']);
        }

        $events = $query->latest('occurred_at')->paginate($perPage)->withQueryString();

        $pages = AnalyticsEvent::whereBetween('occurred_at', [$start, $end])
            ->where('event_type', 'page_view')
            ->select('path', DB::raw('count(*) as views'), DB::raw('count(distinct visitor_id) as visitors'))
            ->groupBy('path')
            ->orderByDesc('views')
            ->limit(20)
            ->get()
            ->map(fn ($row) => ['path' => $row->path ?: '/', 'views' => (int) $row->views, 'visitors' => (int) $row->visitors]);

        $searches = AnalyticsEvent::whereBetween('occurred_at', [$start, $end])
            ->where('event_type', 'product_search')
            ->whereNotNull('search_term')
            ->select('search_term', DB::raw('count(*) as total'))
            ->groupBy('search_term')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(fn ($row) => ['term' => $row->search_term, 'total' => (int) $row->total]);

        return [
            'range' => $range->toArray(),
            'events' => $events,
            'pages' => $pages,
            'searches' => $searches,
            'event_types' => ['page_view', 'product_search', 'add_to_cart', 'cart_qty_update', 'remove_from_cart', 'checkout_started', 'order_completed'],
        ];
    }

    public function products(DateRange $range, int $perPage = 30): LengthAwarePaginator
    {
        $start = $range->startUtc();
        $end = $range->endUtc();

        $views = AnalyticsEvent::whereBetween('occurred_at', [$start, $end])
            ->where('event_type', 'page_view')->where('page_type', 'product')->whereNotNull('product_id')
            ->select('product_id', DB::raw('count(*) as views'), DB::raw('count(distinct visitor_id) as unique_viewers'))
            ->groupBy('product_id')->get()->keyBy('product_id');

        $adds = AnalyticsEvent::whereBetween('occurred_at', [$start, $end])
            ->where('event_type', 'add_to_cart')->whereNotNull('product_id')
            ->select('product_id', DB::raw('count(*) as total'), DB::raw('count(distinct visitor_id) as visitors'))
            ->groupBy('product_id')->get()->keyBy('product_id');

        $removals = AnalyticsEvent::whereBetween('occurred_at', [$start, $end])
            ->where('event_type', 'remove_from_cart')->whereNotNull('product_id')
            ->select('product_id', DB::raw('count(*) as total'))
            ->groupBy('product_id')->pluck('total', 'product_id');

        $checkouts = DB::table('analytics_events as e')
            ->whereBetween('e.occurred_at', [$start, $end])
            ->where('e.event_type', 'add_to_cart')
            ->whereIn('e.session_id', function ($query) use ($start, $end) {
                $query->select('session_id')->from('analytics_events')
                    ->where('event_type', 'checkout_started')
                    ->whereBetween('occurred_at', [$start, $end]);
            })
            ->select('e.product_id', DB::raw('count(distinct e.session_id) as total'))
            ->groupBy('e.product_id')
            ->pluck('total', 'product_id');

        $sales = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereBetween('orders.created_at', [$start, $end])
            ->where('orders.status', '!=', 'Cancelled')
            ->select(
                'order_items.product_id',
                DB::raw('count(distinct order_items.order_id) as orders'),
                DB::raw('sum(order_items.qty) as units'),
                DB::raw('sum(order_items.qty * order_items.price) as revenue')
            )
            ->groupBy('order_items.product_id')
            ->get()
            ->keyBy('product_id');

        $products = Product::withTrashed()->get();

        $rows = $products->map(function ($product) use ($views, $adds, $removals, $checkouts, $sales) {
            $view = $views->get($product->id);
            $add = $adds->get($product->id);
            $sale = $sales->get($product->id);
            $uniqueViewers = (int) ($view->unique_viewers ?? 0);
            $orders = (int) ($sale->orders ?? 0);

            return [
                'id' => $product->id,
                'name' => $product->name,
                'image_url' => $product->image_url,
                'views' => (int) ($view->views ?? 0),
                'unique_viewers' => $uniqueViewers,
                'add_to_cart' => (int) ($add->total ?? 0),
                'unique_adders' => (int) ($add->visitors ?? 0),
                'removals' => (int) ($removals[$product->id] ?? 0),
                'checkout' => (int) ($checkouts[$product->id] ?? 0),
                'orders' => $orders,
                'units' => (int) ($sale->units ?? 0),
                'revenue' => (int) ($sale->revenue ?? 0),
                'conversion' => $uniqueViewers > 0 ? min(100, round($orders / $uniqueViewers * 100, 1)) : 0,
            ];
        })->sortByDesc('views')->values();

        $avgViews = $rows->avg('views') ?: 0;
        $rows = $rows->map(function ($row) use ($avgViews) {
            $row['high_views_low_purchase'] = $row['views'] >= $avgViews && $row['conversion'] < 2.5;
            return $row;
        });

        $page = Paginator::resolveCurrentPage();
        $items = $rows->forPage($page, $perPage)->values();

        return (new LengthAwarePaginator($items, $rows->count(), $perPage, $page, [
            'path' => Paginator::resolveCurrentPath(),
        ]))->withQueryString();
    }

    public function productDetail(int $productId, DateRange $range): array
    {
        $product = Product::withTrashed()->findOrFail($productId);
        $start = $range->startUtc();
        $end = $range->endUtc();

        $events = AnalyticsEvent::whereBetween('occurred_at', [$start, $end])->where('product_id', $product->id);

        $views = (clone $events)->where('event_type', 'page_view')->count();
        $uniqueViewers = (clone $events)->where('event_type', 'page_view')->distinct()->count('visitor_id');
        $adds = (clone $events)->where('event_type', 'add_to_cart')->count();
        $removals = (clone $events)->where('event_type', 'remove_from_cart')->count();

        $sale = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('order_items.product_id', $product->id)
            ->whereBetween('orders.created_at', [$start, $end])
            ->where('orders.status', '!=', 'Cancelled')
            ->selectRaw('count(distinct orders.id) as orders, sum(order_items.qty) as units, sum(order_items.qty * order_items.price) as revenue')
            ->first();

        $daily = [];
        for ($day = $range->from; $day->lte($range->to); $day = $day->addDay()) {
            $daily[$day->toDateString()] = ['label' => $day->format('j/n'), 'views' => 0];
        }
        $tz = config('analytics.timezone', 'Asia/Dhaka');
        foreach ((clone $events)->where('event_type', 'page_view')->get(['occurred_at']) as $event) {
            $key = $event->occurred_at->copy()->setTimezone($tz)->toDateString();
            if (isset($daily[$key])) {
                $daily[$key]['views']++;
            }
        }

        $timeline = (clone $events)->with('visitor')->latest('occurred_at')->limit(50)->get()->map(fn ($event) => [
            'id' => $event->id,
            'event_type' => $event->event_type,
            'short' => substr($event->visitor?->uuid ?? '', 0, 8),
            'device' => $event->visitor?->device_type,
            'occurred_at' => $event->occurred_at?->toIso8601String(),
            'metadata' => $event->metadata,
        ]);

        return [
            'range' => $range->toArray(),
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'image_url' => $product->image_url,
                'price' => $product->price,
                'stock' => $product->stock,
                'status' => $product->status,
            ],
            'metrics' => [
                'views' => $views,
                'unique_viewers' => $uniqueViewers,
                'add_to_cart' => $adds,
                'removals' => $removals,
                'orders' => (int) ($sale->orders ?? 0),
                'units' => (int) ($sale->units ?? 0),
                'revenue' => (int) ($sale->revenue ?? 0),
                'conversion' => $uniqueViewers > 0 ? min(100, round(((int) ($sale->orders ?? 0)) / $uniqueViewers * 100, 1)) : 0,
            ],
            'chart' => [
                'labels' => array_column($daily, 'label'),
                'views' => array_column($daily, 'views'),
            ],
            'timeline' => $timeline,
        ];
    }

    public function funnel(DateRange $range): array
    {
        $start = $range->startUtc();
        $end = $range->endUtc();
        $events = AnalyticsEvent::whereBetween('occurred_at', [$start, $end]);

        $stages = [
            ['key' => 'visitors', 'label' => 'Visitors', 'count' => (clone $events)->distinct()->count('visitor_id')],
            ['key' => 'product_viewers', 'label' => 'Product viewers', 'count' => (clone $events)->where('event_type', 'page_view')->where('page_type', 'product')->distinct()->count('visitor_id')],
            ['key' => 'add_to_cart', 'label' => 'Add to cart', 'count' => (clone $events)->where('event_type', 'add_to_cart')->distinct()->count('visitor_id')],
            ['key' => 'checkout', 'label' => 'Checkout started', 'count' => (clone $events)->where('event_type', 'checkout_started')->distinct()->count('visitor_id')],
            ['key' => 'buyers', 'label' => 'Completed buyers', 'count' => AnalyticsOrderLink::whereBetween('created_at', [$start, $end])->distinct()->count('visitor_id')],
        ];

        $previous = null;
        foreach ($stages as &$stage) {
            $stage['dropoff'] = $previous !== null ? max(0, $previous - $stage['count']) : 0;
            $stage['rate'] = $previous !== null && $previous > 0 ? round($stage['count'] / $previous * 100, 1) : 100;
            $stage['overall'] = $stages[0]['count'] > 0 ? round($stage['count'] / $stages[0]['count'] * 100, 1) : 0;
            $previous = $stage['count'];
        }

        return [
            'range' => $range->toArray(),
            'stages' => $stages,
            'overall_conversion' => $stages[0]['count'] > 0 ? round($stages[4]['count'] / $stages[0]['count'] * 100, 1) : 0,
        ];
    }

    public function cart(DateRange $range): array
    {
        $start = $range->startUtc();
        $end = $range->endUtc();
        $events = AnalyticsEvent::whereBetween('occurred_at', [$start, $end]);

        $adds = (clone $events)->where('event_type', 'add_to_cart');
        $addCount = (clone $adds)->count();
        $addVisitors = (clone $adds)->distinct()->count('visitor_id');
        $checkoutVisitors = (clone $events)->where('event_type', 'checkout_started')->distinct()->count('visitor_id');
        $cartItems = (clone $adds)->get(['metadata'])->sum(fn ($event) => (int) ($event->metadata['qty'] ?? 0));

        $cutoff = now()->subMinutes((int) config('analytics.abandonment_minutes', 60));
        $linked = AnalyticsOrderLink::whereNotNull('session_id')->pluck('session_id');

        $abandoned = AnalyticsSession::where('last_activity_at', '<', $cutoff)
            ->whereHas('events', fn ($query) => $query->where('event_type', 'add_to_cart')->whereBetween('occurred_at', [$start, $end]))
            ->when($linked->isNotEmpty(), fn ($query) => $query->whereNotIn('id', $linked))
            ->with(['visitor', 'events' => fn ($query) => $query->where('event_type', 'add_to_cart')->whereBetween('occurred_at', [$start, $end])])
            ->orderByDesc('last_activity_at')
            ->limit(50)
            ->get();

        $productNames = Product::withTrashed()
            ->whereIn('id', $abandoned->flatMap(fn ($session) => $session->events->pluck('product_id'))->filter()->unique())
            ->pluck('name', 'id');

        $abandonedRows = $abandoned->map(function ($session) use ($productNames) {
            $items = $session->events->map(fn ($event) => [
                'product' => $productNames[$event->product_id] ?? 'Product',
                'qty' => (int) ($event->metadata['qty'] ?? 0),
                'size' => $event->metadata['size'] ?? null,
                'price' => (int) ($event->metadata['price'] ?? 0),
            ]);
            $value = $items->sum(fn ($item) => $item['qty'] * $item['price']);

            return [
                'session_id' => $session->id,
                'short' => substr($session->visitor?->uuid ?? '', 0, 8),
                'uuid' => $session->visitor?->uuid,
                'items' => $items->values(),
                'value' => (int) $value,
                'last_activity_at' => $session->last_activity_at?->toIso8601String(),
                'abandoned_for' => $session->last_activity_at?->diffForHumans(now(), true),
            ];
        });

        return [
            'range' => $range->toArray(),
            'kpis' => [
                'add_to_cart_events' => $addCount,
                'unique_adders' => $addVisitors,
                'qty_updates' => (clone $events)->where('event_type', 'cart_qty_update')->count(),
                'removals' => (clone $events)->where('event_type', 'remove_from_cart')->count(),
                'cart_items' => (int) $cartItems,
                'left_without_checkout' => max(0, $addVisitors - $checkoutVisitors),
                'abandoned_carts' => $abandonedRows->count(),
            ],
            'abandoned' => $abandonedRows,
        ];
    }

    public function checkout(DateRange $range): array
    {
        $start = $range->startUtc();
        $end = $range->endUtc();
        $events = AnalyticsEvent::whereBetween('occurred_at', [$start, $end]);

        $started = (clone $events)->where('event_type', 'checkout_started')->count();
        $unique = (clone $events)->where('event_type', 'checkout_started')->distinct()->count('visitor_id');
        $completed = AnalyticsOrderLink::whereBetween('created_at', [$start, $end])->count();
        $buyers = AnalyticsOrderLink::whereBetween('created_at', [$start, $end])->distinct()->count('visitor_id');

        $cutoff = now()->subMinutes((int) config('analytics.abandonment_minutes', 60));
        $sessionIds = (clone $events)->where('event_type', 'checkout_started')->pluck('session_id');
        $linked = AnalyticsOrderLink::whereIn('session_id', $sessionIds)->pluck('session_id');
        $abandonedIds = $sessionIds->diff($linked);

        $abandoned = AnalyticsSession::whereIn('id', $abandonedIds)
            ->where('last_activity_at', '<', $cutoff)
            ->with('visitor')
            ->orderByDesc('last_activity_at')
            ->limit(50)
            ->get()
            ->map(fn ($session) => [
                'session_id' => $session->id,
                'short' => substr($session->visitor?->uuid ?? '', 0, 8),
                'uuid' => $session->visitor?->uuid,
                'last_path' => $session->exit_path,
                'last_activity_at' => $session->last_activity_at?->toIso8601String(),
                'abandoned_for' => $session->last_activity_at?->diffForHumans(now(), true),
            ]);

        return [
            'range' => $range->toArray(),
            'kpis' => [
                'started' => $started,
                'unique_starters' => $unique,
                'completed' => $completed,
                'buyers' => $buyers,
                'abandoned' => $abandoned->count(),
                'completion_rate' => $started > 0 ? round($completed / $started * 100, 1) : 0,
            ],
            'abandoned' => $abandoned,
        ];
    }

    public function reports(): array
    {
        return [
            ['group' => 'Sales', 'items' => ['Daily sales report', 'Monthly sales report', 'Order report', 'Product sales report', 'Best selling products', 'Cancelled orders report']],
            ['group' => 'Inventory', 'items' => ['Current stock report', 'Low stock report', 'Out of stock report', 'Stock movement report']],
            ['group' => 'Customers', 'items' => ['Customer order report', 'Customer purchase summary']],
            ['group' => 'Visitors', 'items' => ['Daily visitor report', 'Monthly visitor report', 'New vs returning visitor report', 'Device report', 'Browser report', 'Page performance report', 'Product view report', 'Add to cart report', 'Checkout report', 'Conversion funnel report']],
        ];
    }
}
