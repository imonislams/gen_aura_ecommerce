<?php

namespace App\Jobs;

use App\Models\AnalyticsEvent;
use App\Models\AnalyticsSession;
use App\Models\AnalyticsVisitor;
use App\Models\Order;
use Carbon\CarbonImmutable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class BuildDailySummary implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public ?string $date = null)
    {
    }

    public function handle(): void
    {
        $tz = config('analytics.timezone', 'Asia/Dhaka');
        $day = $this->date
            ? CarbonImmutable::parse($this->date, $tz)
            : CarbonImmutable::now($tz)->subDay();

        $date = $day->toDateString();
        $start = $day->startOfDay()->setTimezone('UTC');
        $end = $day->endOfDay()->setTimezone('UTC');

        $events = AnalyticsEvent::whereBetween('occurred_at', [$start, $end]);
        $sessions = AnalyticsSession::whereBetween('started_at', [$start, $end]);
        $orders = Order::whereBetween('created_at', [$start, $end])->where('status', '!=', 'Cancelled');

        $units = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereBetween('orders.created_at', [$start, $end])
            ->where('orders.status', '!=', 'Cancelled')
            ->sum('order_items.qty');

        DB::table('analytics_daily')->updateOrInsert(['date' => $date], [
            'visitors' => (clone $events)->distinct()->count('visitor_id'),
            'new_visitors' => AnalyticsVisitor::whereBetween('first_seen_at', [$start, $end])->count(),
            'returning_visitors' => AnalyticsVisitor::where('first_seen_at', '<', $start)->whereBetween('last_seen_at', [$start, $end])->count(),
            'sessions' => (clone $sessions)->count(),
            'page_views' => (clone $events)->where('event_type', 'page_view')->count(),
            'product_views' => (clone $events)->where('event_type', 'page_view')->where('page_type', 'product')->count(),
            'add_to_cart' => (clone $events)->where('event_type', 'add_to_cart')->count(),
            'checkout_started' => (clone $events)->where('event_type', 'checkout_started')->count(),
            'orders' => (clone $orders)->count(),
            'revenue' => (int) (clone $orders)->sum('total'),
            'units' => (int) $units,
            'bounces' => (clone $sessions)->where('page_views', '<=', 1)->count(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('analytics_product_daily')->where('date', $date)->delete();

        $views = (clone $events)
            ->where('event_type', 'page_view')->where('page_type', 'product')->whereNotNull('product_id')
            ->select('product_id', DB::raw('count(*) as views'), DB::raw('count(distinct visitor_id) as unique_viewers'))
            ->groupBy('product_id')->get();

        $adds = (clone $events)
            ->where('event_type', 'add_to_cart')->whereNotNull('product_id')
            ->select('product_id', DB::raw('count(*) as total'))->groupBy('product_id')->pluck('total', 'product_id');

        $checkouts = DB::table('analytics_events as e')
            ->whereBetween('e.occurred_at', [$start, $end])
            ->where('e.event_type', 'add_to_cart')
            ->whereIn('e.session_id', function ($query) use ($start, $end) {
                $query->select('session_id')->from('analytics_events')
                    ->where('event_type', 'checkout_started')
                    ->whereBetween('occurred_at', [$start, $end]);
            })
            ->select('e.product_id', DB::raw('count(distinct e.session_id) as total'))
            ->groupBy('e.product_id')->pluck('total', 'product_id');

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
            ->groupBy('order_items.product_id')->get()->keyBy('product_id');

        $ids = collect($views->pluck('product_id'))->merge($sales->keys())->filter()->unique();

        foreach ($ids as $id) {
            $view = $views->firstWhere('product_id', $id);
            $sale = $sales->get($id);

            DB::table('analytics_product_daily')->insert([
                'date' => $date,
                'product_id' => $id,
                'views' => (int) ($view->views ?? 0),
                'unique_viewers' => (int) ($view->unique_viewers ?? 0),
                'add_to_cart' => (int) ($adds[$id] ?? 0),
                'checkout' => (int) ($checkouts[$id] ?? 0),
                'orders' => (int) ($sale->orders ?? 0),
                'units' => (int) ($sale->units ?? 0),
                'revenue' => (int) ($sale->revenue ?? 0),
            ]);
        }
    }
}
