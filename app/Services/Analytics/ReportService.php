<?php

namespace App\Services\Analytics;

use App\Models\AnalyticsEvent;
use App\Models\AnalyticsOrderLink;
use App\Models\AnalyticsSession;
use App\Models\AnalyticsVisitor;
use App\Models\Customer;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\Product;
use App\Support\Analytics\DateRange;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function __construct(private MetricsService $metrics)
    {
    }

    public function groups(): array
    {
        return [
            ['group' => 'Sales', 'items' => [
                ['key' => 'daily_sales', 'label' => 'Daily sales report'],
                ['key' => 'monthly_sales', 'label' => 'Monthly sales report'],
                ['key' => 'orders', 'label' => 'Order report'],
                ['key' => 'product_sales', 'label' => 'Product sales report'],
                ['key' => 'best_selling', 'label' => 'Best selling products'],
                ['key' => 'cancelled_orders', 'label' => 'Cancelled orders report'],
            ]],
            ['group' => 'Inventory', 'items' => [
                ['key' => 'current_stock', 'label' => 'Current stock report'],
                ['key' => 'low_stock', 'label' => 'Low stock report'],
                ['key' => 'out_of_stock', 'label' => 'Out of stock report'],
                ['key' => 'stock_movement', 'label' => 'Stock movement report'],
            ]],
            ['group' => 'Customers', 'items' => [
                ['key' => 'customer_orders', 'label' => 'Customer order report'],
                ['key' => 'customer_purchase', 'label' => 'Customer purchase summary'],
            ]],
            ['group' => 'Visitors', 'items' => [
                ['key' => 'daily_visitors', 'label' => 'Daily visitor report'],
                ['key' => 'monthly_visitors', 'label' => 'Monthly visitor report'],
                ['key' => 'new_vs_returning', 'label' => 'New vs returning visitor report'],
                ['key' => 'devices', 'label' => 'Device report'],
                ['key' => 'browsers', 'label' => 'Browser report'],
                ['key' => 'page_performance', 'label' => 'Page performance report'],
                ['key' => 'product_views', 'label' => 'Product view report'],
                ['key' => 'add_to_cart', 'label' => 'Add to cart report'],
                ['key' => 'checkout', 'label' => 'Checkout report'],
                ['key' => 'funnel', 'label' => 'Conversion funnel report'],
            ]],
        ];
    }

    public function build(string $key, DateRange $range): array
    {
        $data = match ($key) {
            'daily_sales' => $this->dailySales($range),
            'monthly_sales' => $this->monthlySales($range),
            'orders' => $this->ordersReport($range),
            'product_sales' => $this->productSales($range, false),
            'best_selling' => $this->productSales($range, true),
            'cancelled_orders' => $this->cancelledOrders($range),
            'current_stock' => $this->stockReport('all'),
            'low_stock' => $this->stockReport('low'),
            'out_of_stock' => $this->stockReport('out'),
            'stock_movement' => $this->stockMovements($range),
            'customer_orders' => $this->customerReport($range, false),
            'customer_purchase' => $this->customerReport($range, true),
            'daily_visitors' => $this->dailyVisitors($range),
            'monthly_visitors' => $this->monthlyVisitors($range),
            'new_vs_returning' => $this->newVsReturning($range),
            'devices' => $this->devices($range),
            'browsers' => $this->browsers($range),
            'page_performance' => $this->pagePerformance($range),
            'product_views' => $this->productViews($range),
            'add_to_cart' => $this->addToCart($range),
            'checkout' => $this->checkoutReport($range),
            'funnel' => $this->funnelReport($range),
            default => abort(404),
        };

        return $data + ['key' => $key, 'range' => $range->toArray()];
    }

    private function events(DateRange $range)
    {
        return AnalyticsEvent::whereBetween('occurred_at', [$range->startUtc(), $range->endUtc()]);
    }

    private function sessions(DateRange $range)
    {
        return AnalyticsSession::whereBetween('started_at', [$range->startUtc(), $range->endUtc()]);
    }

    private function tz(): string
    {
        return config('analytics.timezone', 'Asia/Dhaka');
    }

    private function dayKey($date): string
    {
        return $date->copy()->setTimezone($this->tz())->toDateString();
    }

    private function monthKey($date): string
    {
        return $date->copy()->setTimezone($this->tz())->format('Y-m');
    }

    private function productNames($ids)
    {
        return Product::withTrashed()->whereIn('id', collect($ids)->filter()->unique())->pluck('name', 'id');
    }

    private function dailySales(DateRange $range): array
    {
        $orders = Order::with('items')
            ->whereBetween('created_at', [$range->startUtc(), $range->endUtc()])
            ->where('status', '!=', 'Cancelled')
            ->get();

        $grouped = $orders->groupBy(fn ($order) => $this->dayKey($order->created_at));
        $rows = [];

        for ($day = $range->from; $day->lte($range->to); $day = $day->addDay()) {
            $key = $day->toDateString();
            $bucket = $grouped->get($key, collect());
            $rows[] = [$key, $bucket->count(), (int) $bucket->sum('total'), (int) $bucket->sum(fn ($order) => $order->items->sum('qty'))];
        }

        return ['title' => 'Daily sales report', 'headings' => ['Date', 'Orders', 'Revenue', 'Units'], 'rows' => $rows];
    }

    private function monthlySales(DateRange $range): array
    {
        $orders = Order::with('items')
            ->whereBetween('created_at', [$range->startUtc(), $range->endUtc()])
            ->where('status', '!=', 'Cancelled')
            ->get();

        $grouped = $orders->groupBy(fn ($order) => $this->monthKey($order->created_at));
        $rows = [];

        for ($month = $range->from->startOfMonth(); $month->lte($range->to); $month = $month->addMonth()) {
            $key = $month->format('Y-m');
            $bucket = $grouped->get($key, collect());
            $rows[] = [$month->format('M Y'), $bucket->count(), (int) $bucket->sum('total'), (int) $bucket->sum(fn ($order) => $order->items->sum('qty'))];
        }

        return ['title' => 'Monthly sales report', 'headings' => ['Month', 'Orders', 'Revenue', 'Units'], 'rows' => $rows];
    }

    private function ordersReport(DateRange $range): array
    {
        $orders = Order::with('items')
            ->whereBetween('created_at', [$range->startUtc(), $range->endUtc()])
            ->latest()
            ->limit(1000)
            ->get();

        $rows = $orders->map(fn ($order) => [
            $order->order_number ?: '#' . $order->id,
            $order->created_at?->copy()->setTimezone($this->tz())->format('d M Y, h:i A'),
            $order->name,
            $order->phone,
            $order->items->count(),
            (int) $order->total,
            $order->status,
            $order->payment_method,
        ])->all();

        return ['title' => 'Order report', 'headings' => ['Order', 'Date', 'Customer', 'Phone', 'Items', 'Total', 'Status', 'Payment'], 'rows' => $rows];
    }

    private function productSales(DateRange $range, bool $bestSelling): array
    {
        $rows = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereBetween('orders.created_at', [$range->startUtc(), $range->endUtc()])
            ->where('orders.status', '!=', 'Cancelled')
            ->select('order_items.name', DB::raw('sum(order_items.qty) as units'), DB::raw('sum(order_items.qty * order_items.price) as revenue'))
            ->groupBy('order_items.name')
            ->orderByDesc($bestSelling ? 'units' : 'revenue')
            ->get()
            ->map(fn ($row) => [$row->name, (int) $row->units, (int) $row->revenue])
            ->all();

        return [
            'title' => $bestSelling ? 'Best selling products' : 'Product sales report',
            'headings' => ['Product', 'Units', 'Revenue'],
            'rows' => $rows,
        ];
    }

    private function cancelledOrders(DateRange $range): array
    {
        $rows = Order::where('status', 'Cancelled')
            ->whereBetween('created_at', [$range->startUtc(), $range->endUtc()])
            ->latest()
            ->limit(1000)
            ->get()
            ->map(fn ($order) => [
                $order->order_number ?: '#' . $order->id,
                $order->created_at?->copy()->setTimezone($this->tz())->format('d M Y, h:i A'),
                $order->name,
                $order->phone,
                (int) $order->total,
            ])->all();

        return ['title' => 'Cancelled orders report', 'headings' => ['Order', 'Date', 'Customer', 'Phone', 'Total'], 'rows' => $rows];
    }

    private function stockReport(string $mode): array
    {
        $query = Product::withTrashed()->with('category')->orderBy('name');

        if ($mode === 'low') {
            $query->where('stock', '>', 0)->where('stock', '<=', 5);
        } elseif ($mode === 'out') {
            $query->where('stock', '<=', 0);
        }

        $rows = $query->get()->map(fn ($product) => [
            $product->name,
            $product->category?->name ?? ($product->cat ?: 'Uncategorised'),
            (int) $product->price,
            (int) $product->stock,
            $product->status,
        ])->all();

        $titles = ['all' => 'Current stock report', 'low' => 'Low stock report', 'out' => 'Out of stock report'];

        return ['title' => $titles[$mode], 'headings' => ['Product', 'Category', 'Price', 'Stock', 'Status'], 'rows' => $rows];
    }

    private function stockMovements(DateRange $range): array
    {
        $rows = InventoryMovement::with('product')
            ->whereBetween('created_at', [$range->startUtc(), $range->endUtc()])
            ->latest('created_at')
            ->limit(1000)
            ->get()
            ->map(fn ($movement) => [
                $movement->created_at?->copy()->setTimezone($this->tz())->format('d M Y, h:i A'),
                $movement->product?->name ?? 'Deleted product',
                $movement->type,
                (int) $movement->quantity_delta,
                (int) $movement->stock_before,
                (int) $movement->stock_after,
                $movement->note,
            ])->all();

        return ['title' => 'Stock movement report', 'headings' => ['Date', 'Product', 'Type', 'Change', 'Before', 'After', 'Note'], 'rows' => $rows];
    }

    private function customerReport(DateRange $range, bool $withAverage): array
    {
        $customers = Customer::whereBetween('last_order_at', [$range->startUtc(), $range->endUtc()])
            ->orderByDesc('last_order_at')
            ->limit(1000)
            ->get();

        $rows = $customers->map(function ($customer) use ($withAverage) {
            $row = [
                $customer->name,
                $customer->phone,
                (int) $customer->total_orders,
                (int) $customer->total_purchase,
                $customer->last_order_at?->copy()->setTimezone($this->tz())->format('d M Y'),
            ];
            if ($withAverage) {
                $row[] = $customer->total_orders > 0 ? (int) round($customer->total_purchase / $customer->total_orders) : 0;
            }
            return $row;
        })->all();

        return [
            'title' => $withAverage ? 'Customer purchase summary' : 'Customer order report',
            'headings' => $withAverage
                ? ['Customer', 'Phone', 'Orders', 'Total purchase', 'Last order', 'Average order value']
                : ['Customer', 'Phone', 'Orders', 'Total purchase', 'Last order'],
            'rows' => $rows,
        ];
    }

    private function dailyVisitors(DateRange $range): array
    {
        $days = [];
        for ($day = $range->from; $day->lte($range->to); $day = $day->addDay()) {
            $days[$day->toDateString()] = ['date' => $day->toDateString(), 'visitors' => [], 'sessions' => 0, 'page_views' => 0];
        }

        foreach ($this->events($range)->get(['visitor_id', 'event_type', 'occurred_at']) as $event) {
            $key = $this->dayKey($event->occurred_at);
            if (!isset($days[$key])) {
                continue;
            }
            if ($event->event_type === 'page_view') {
                $days[$key]['page_views']++;
            }
            if ($event->visitor_id) {
                $days[$key]['visitors'][$event->visitor_id] = true;
            }
        }

        foreach ($this->sessions($range)->get(['started_at']) as $session) {
            $key = $this->dayKey($session->started_at);
            if (isset($days[$key])) {
                $days[$key]['sessions']++;
            }
        }

        $newByDay = AnalyticsVisitor::whereBetween('first_seen_at', [$range->startUtc(), $range->endUtc()])
            ->get(['first_seen_at'])
            ->groupBy(fn ($visitor) => $this->dayKey($visitor->first_seen_at))
            ->map->count();

        $rows = [];
        foreach ($days as $day) {
            $new = (int) ($newByDay[$day['date']] ?? 0);
            $visitors = count($day['visitors']);
            $rows[] = [$day['date'], $visitors, $day['sessions'], $day['page_views'], $new, max(0, $visitors - $new)];
        }

        return ['title' => 'Daily visitor report', 'headings' => ['Date', 'Visitors', 'Sessions', 'Page views', 'New visitors', 'Returning visitors'], 'rows' => $rows];
    }

    private function monthlyVisitors(DateRange $range): array
    {
        $months = [];
        for ($month = $range->from->startOfMonth(); $month->lte($range->to); $month = $month->addMonth()) {
            $months[$month->format('Y-m')] = ['month' => $month->format('M Y'), 'visitors' => [], 'sessions' => 0, 'page_views' => 0];
        }

        foreach ($this->events($range)->get(['visitor_id', 'event_type', 'occurred_at']) as $event) {
            $key = $this->monthKey($event->occurred_at);
            if (!isset($months[$key])) {
                continue;
            }
            if ($event->event_type === 'page_view') {
                $months[$key]['page_views']++;
            }
            if ($event->visitor_id) {
                $months[$key]['visitors'][$event->visitor_id] = true;
            }
        }

        foreach ($this->sessions($range)->get(['started_at']) as $session) {
            $key = $this->monthKey($session->started_at);
            if (isset($months[$key])) {
                $months[$key]['sessions']++;
            }
        }

        $rows = [];
        foreach ($months as $month) {
            $rows[] = [$month['month'], count($month['visitors']), $month['sessions'], $month['page_views']];
        }

        return ['title' => 'Monthly visitor report', 'headings' => ['Month', 'Visitors', 'Sessions', 'Page views'], 'rows' => $rows];
    }

    private function newVsReturning(DateRange $range): array
    {
        $start = $range->startUtc();
        $end = $range->endUtc();

        $newVisitors = AnalyticsVisitor::whereBetween('first_seen_at', [$start, $end])->count();
        $returningVisitors = AnalyticsVisitor::where('first_seen_at', '<', $start)->whereBetween('last_seen_at', [$start, $end])->count();
        $newSessions = (clone $this->sessions($range))->whereHas('visitor', fn ($query) => $query->whereBetween('first_seen_at', [$start, $end]))->count();
        $returningSessions = (clone $this->sessions($range))->whereHas('visitor', fn ($query) => $query->where('first_seen_at', '<', $start))->count();

        return [
            'title' => 'New vs returning visitor report',
            'headings' => ['Type', 'Visitors', 'Sessions'],
            'rows' => [
                ['New', $newVisitors, $newSessions],
                ['Returning', $returningVisitors, $returningSessions],
            ],
        ];
    }

    private function devices(DateRange $range): array
    {
        $rows = (clone $this->sessions($range))
            ->select('device_type', DB::raw('count(*) as sessions'), DB::raw('count(distinct visitor_id) as visitors'))
            ->groupBy('device_type')
            ->orderByDesc('sessions')
            ->get()
            ->map(fn ($row) => [$row->device_type ?: 'Unknown', (int) $row->sessions, (int) $row->visitors])
            ->all();

        return ['title' => 'Device report', 'headings' => ['Device', 'Sessions', 'Visitors'], 'rows' => $rows];
    }

    private function browsers(DateRange $range): array
    {
        $rows = (clone $this->sessions($range))
            ->select('browser', DB::raw('count(*) as sessions'), DB::raw('count(distinct visitor_id) as visitors'))
            ->groupBy('browser')
            ->orderByDesc('sessions')
            ->get()
            ->map(fn ($row) => [$row->browser ?: 'Unknown', (int) $row->sessions, (int) $row->visitors])
            ->all();

        return ['title' => 'Browser report', 'headings' => ['Browser', 'Sessions', 'Visitors'], 'rows' => $rows];
    }

    private function pagePerformance(DateRange $range): array
    {
        $rows = $this->events($range)
            ->where('event_type', 'page_view')
            ->select('path', DB::raw('count(*) as views'), DB::raw('count(distinct visitor_id) as visitors'))
            ->groupBy('path')
            ->orderByDesc('views')
            ->get()
            ->map(fn ($row) => [$row->path ?: '/', (int) $row->views, (int) $row->visitors])
            ->all();

        return ['title' => 'Page performance report', 'headings' => ['Page', 'Views', 'Unique visitors'], 'rows' => $rows];
    }

    private function productViews(DateRange $range): array
    {
        $views = $this->events($range)
            ->where('event_type', 'page_view')->where('page_type', 'product')->whereNotNull('product_id')
            ->select('product_id', DB::raw('count(*) as views'), DB::raw('count(distinct visitor_id) as unique_viewers'))
            ->groupBy('product_id')->get();

        $adds = $this->events($range)
            ->where('event_type', 'add_to_cart')->whereNotNull('product_id')
            ->select('product_id', DB::raw('count(*) as total'))->groupBy('product_id')->pluck('total', 'product_id');

        $sales = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereBetween('orders.created_at', [$range->startUtc(), $range->endUtc()])
            ->where('orders.status', '!=', 'Cancelled')
            ->select('order_items.product_id', DB::raw('count(distinct order_items.order_id) as orders'), DB::raw('sum(order_items.qty * order_items.price) as revenue'))
            ->groupBy('order_items.product_id')->get()->keyBy('product_id');

        $names = $this->productNames($views->pluck('product_id'));

        $rows = $views->map(function ($view) use ($adds, $sales, $names) {
            $sale = $sales->get($view->product_id);

            return [
                $names[$view->product_id] ?? 'Deleted product',
                (int) $view->views,
                (int) $view->unique_viewers,
                (int) ($adds[$view->product_id] ?? 0),
                (int) ($sale->orders ?? 0),
                (int) ($sale->revenue ?? 0),
            ];
        })->all();

        return ['title' => 'Product view report', 'headings' => ['Product', 'Views', 'Unique viewers', 'Add to cart', 'Orders', 'Revenue'], 'rows' => $rows];
    }

    private function addToCart(DateRange $range): array
    {
        $adds = $this->events($range)
            ->where('event_type', 'add_to_cart')->whereNotNull('product_id')
            ->select('product_id', DB::raw('count(*) as total'), DB::raw('count(distinct visitor_id) as visitors'))
            ->groupBy('product_id')->get();

        $removals = $this->events($range)
            ->where('event_type', 'remove_from_cart')->whereNotNull('product_id')
            ->select('product_id', DB::raw('count(*) as total'))->groupBy('product_id')->pluck('total', 'product_id');

        $names = $this->productNames($adds->pluck('product_id'));

        $rows = $adds->map(fn ($add) => [
            $names[$add->product_id] ?? 'Deleted product',
            (int) $add->total,
            (int) $add->visitors,
            (int) ($removals[$add->product_id] ?? 0),
        ])->all();

        return ['title' => 'Add to cart report', 'headings' => ['Product', 'Add events', 'Unique adders', 'Removals'], 'rows' => $rows];
    }

    private function checkoutReport(DateRange $range): array
    {
        $days = [];
        for ($day = $range->from; $day->lte($range->to); $day = $day->addDay()) {
            $days[$day->toDateString()] = ['date' => $day->toDateString(), 'started' => 0, 'starters' => [], 'completed' => 0];
        }

        foreach ($this->events($range)->where('event_type', 'checkout_started')->get(['visitor_id', 'occurred_at']) as $event) {
            $key = $this->dayKey($event->occurred_at);
            if (isset($days[$key])) {
                $days[$key]['started']++;
                if ($event->visitor_id) {
                    $days[$key]['starters'][$event->visitor_id] = true;
                }
            }
        }

        foreach (AnalyticsOrderLink::whereBetween('created_at', [$range->startUtc(), $range->endUtc()])->get(['created_at']) as $link) {
            $key = $this->dayKey($link->created_at);
            if (isset($days[$key])) {
                $days[$key]['completed']++;
            }
        }

        $rows = [];
        foreach ($days as $day) {
            $started = $day['started'];
            $rate = $started > 0 ? round($day['completed'] / $started * 100, 1) : 0;
            $rows[] = [$day['date'], $started, count($day['starters']), $day['completed'], $rate . '%'];
        }

        return ['title' => 'Checkout report', 'headings' => ['Date', 'Checkout started', 'Unique starters', 'Completed', 'Completion rate'], 'rows' => $rows];
    }

    private function funnelReport(DateRange $range): array
    {
        $funnel = $this->metrics->funnel($range);

        $rows = collect($funnel['stages'])->map(fn ($stage) => [
            $stage['label'],
            $stage['count'],
            $stage['dropoff'],
            $stage['rate'] . '%',
            $stage['overall'] . '%',
        ])->all();

        return ['title' => 'Conversion funnel report', 'headings' => ['Stage', 'Visitors', 'Drop-off', 'Stage rate', 'Overall rate'], 'rows' => $rows];
    }
}
