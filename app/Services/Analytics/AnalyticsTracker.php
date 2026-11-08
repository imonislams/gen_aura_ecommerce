<?php

namespace App\Services\Analytics;

use App\Models\AnalyticsEvent;
use App\Models\AnalyticsOrderLink;
use App\Models\AnalyticsSession;
use App\Models\AnalyticsVisitor;
use App\Models\Order;
use Closure;
use Illuminate\Http\Request;

class AnalyticsTracker
{
    public function __construct(
        private VisitorService $visitors,
        private SessionService $sessions,
        private UserAgentParser $parser,
    ) {
    }

    public function context(Request $request): array
    {
        $visitor = $this->visitors->resolve($request, $this->parser);
        $session = $this->sessions->resolve($request, $visitor, $this->parser);

        $request->attributes->set('analytics_visitor_id', $visitor->id);
        $request->attributes->set('analytics_session_id', $session->id);
        $request->attributes->set('analytics_visitor_uuid', $visitor->uuid);

        if ($request->hasSession()) {
            $request->session()->put('analytics_session_id', $session->id);
        }

        return [$visitor, $session];
    }

    public function pageView(Request $request, array $meta = []): void
    {
        [$visitor, $session] = $this->context($request);
        $path = $this->path($request);

        $this->defer(function () use ($visitor, $session, $request, $meta, $path) {
            $this->record($visitor, $session, 'page_view', $meta + [
                'path' => $path,
                'url' => $request->fullUrl(),
            ]);

            $session->increment('page_views');
            $session->update(['last_activity_at' => now(), 'exit_path' => $path]);

            $visitor->increment('total_page_views');
            $visitor->update(['last_seen_at' => now(), 'last_path' => $path]);
        });
    }

    public function event(Request $request, string $type, array $meta = []): void
    {
        [$visitor, $session] = $this->context($request);
        $path = $this->path($request);

        $this->defer(function () use ($visitor, $session, $request, $type, $meta, $path) {
            $this->record($visitor, $session, $type, $meta + [
                'path' => $path,
                'url' => $request->fullUrl(),
            ]);

            if (in_array($type, ['add_to_cart', 'remove_from_cart', 'cart_qty_update'], true)) {
                $session->update(['has_cart_activity' => true, 'last_activity_at' => now()]);
            }

            if ($type === 'checkout_started') {
                $session->update(['has_checkout' => true, 'last_activity_at' => now()]);
            }
        });
    }

    public function orderCompleted(Request $request, Order $order): void
    {
        [$visitor, $session] = $this->context($request);

        $this->defer(function () use ($visitor, $session, $request, $order) {
            $link = AnalyticsOrderLink::firstOrCreate(
                ['order_id' => $order->id],
                ['visitor_id' => $visitor->id, 'session_id' => $session->id]
            );

            if (!$link->wasRecentlyCreated) {
                return;
            }

            $this->record($visitor, $session, 'order_completed', [
                'order_id' => $order->id,
                'path' => '/checkout',
                'url' => $request->fullUrl(),
                'metadata' => [
                    'total' => $order->total,
                    'units' => (int) $order->items()->sum('qty'),
                ],
            ]);

            $visitor->update(['has_ordered' => true]);
            $session->update(['converted' => true, 'has_checkout' => true, 'last_activity_at' => now()]);
        });
    }

    private function record(AnalyticsVisitor $visitor, AnalyticsSession $session, string $type, array $data): void
    {
        AnalyticsEvent::create([
            'visitor_id' => $visitor->id,
            'session_id' => $session->id,
            'event_type' => $type,
            'path' => $data['path'] ?? null,
            'url' => $data['url'] ?? null,
            'page_type' => $data['page_type'] ?? null,
            'product_id' => $data['product_id'] ?? null,
            'order_id' => $data['order_id'] ?? null,
            'category' => $data['category'] ?? null,
            'search_term' => $data['search_term'] ?? null,
            'metadata' => $data['metadata'] ?? null,
            'occurred_at' => now(),
            'created_at' => now(),
        ]);
    }

    private function defer(Closure $callback): void
    {
        if (!config('analytics.enabled', true)) {
            return;
        }

        app()->terminating(function () use ($callback) {
            try {
                $callback();
            } catch (\Throwable $e) {
                report($e);
            }
        });
    }

    private function path(Request $request): string
    {
        return '/' . ltrim($request->path(), '/');
    }
}
