<?php

namespace App\Http\Middleware;

use App\Services\Analytics\AnalyticsTracker;
use App\Services\Analytics\UserAgentParser;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;

class TrackVisitor
{
    public function __construct(
        private AnalyticsTracker $tracker,
        private UserAgentParser $parser,
    ) {
    }

    public function handle(Request $request, Closure $next)
    {
        if ($this->shouldTrack($request)) {
            try {
                $meta = $this->pageMeta($request);
                $this->tracker->pageView($request, $meta);

                if (!empty($meta['search_term'])) {
                    $this->tracker->event($request, 'product_search', [
                        'page_type' => 'shop',
                        'search_term' => $meta['search_term'],
                    ]);
                }
            } catch (\Throwable $e) {
                report($e);
            }
        }

        $response = $next($request);

        if ($uuid = $request->attributes->get('analytics_new_visitor_uuid')) {
            $response->headers->setCookie(Cookie::make(
                config('analytics.cookie.name'),
                $uuid,
                (int) config('analytics.cookie.minutes'),
                '/',
                null,
                $request->isSecure(),
                true,
                false,
                'lax'
            ));
        }

        return $response;
    }

    private function shouldTrack(Request $request): bool
    {
        if (!config('analytics.enabled', true)) {
            return false;
        }

        if (!$request->isMethod('GET')) {
            return false;
        }

        if ($request->is('admin') || $request->is('admin/*')) {
            return false;
        }

        if ($request->hasSession() && $request->session()->get('admin_id')) {
            return false;
        }

        if ($request->routeIs('lang') || $request->routeIs('order.success')) {
            return false;
        }

        if ($request->header('X-Inertia-Partial-Data') || $request->header('X-Inertia-Prefetch')) {
            return false;
        }

        if (strtolower((string) $request->header('Purpose')) === 'prefetch') {
            return false;
        }

        $ua = $this->parser->parse($request->userAgent());
        if ($ua['is_bot'] && config('analytics.exclude_bots', true)) {
            return false;
        }

        return true;
    }

    private function pageMeta(Request $request): array
    {
        $route = $request->route()?->getName();

        $map = [
            'home' => 'home',
            'shop' => 'shop',
            'product' => 'product',
            'cart' => 'cart',
            'checkout.show' => 'checkout',
            'reviews' => 'reviews',
            'contact' => 'contact',
        ];

        $meta = ['page_type' => $map[$route] ?? 'other'];

        if ($route === 'shop') {
            if ($request->filled('cat')) {
                $meta['page_type'] = 'category';
                $meta['category'] = (string) $request->input('cat');
            }
            if ($request->filled('q')) {
                $meta['search_term'] = (string) $request->input('q');
            }
        }

        if ($route === 'product' && $request->route('product')) {
            $product = $request->route('product');
            $meta['product_id'] = $product->id;
            $meta['category'] = $product->cat;
        }

        return $meta;
    }
}
