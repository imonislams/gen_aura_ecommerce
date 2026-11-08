<?php

namespace App\Services\Analytics;

use App\Models\AnalyticsVisitor;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VisitorService
{
    public function resolve(Request $request, UserAgentParser $parser): AnalyticsVisitor
    {
        if ($request->attributes->has('analytics_visitor')) {
            return $request->attributes->get('analytics_visitor');
        }

        $cookieName = config('analytics.cookie.name');
        $uuid = $request->cookie($cookieName);
        $visitor = $uuid ? AnalyticsVisitor::where('uuid', $uuid)->first() : null;
        $path = $this->path($request);

        if (!$visitor) {
            $ua = $parser->parse($request->userAgent());
            $uuid = (string) Str::uuid();

            $visitor = AnalyticsVisitor::create([
                'uuid' => $uuid,
                'first_seen_at' => now(),
                'last_seen_at' => now(),
                'first_landing_path' => $path,
                'last_path' => $path,
                'referrer_domain' => $this->referrerDomain($request),
                'device_type' => $ua['device_type'],
                'browser' => $ua['browser'],
                'os' => $ua['os'],
                'country' => $request->header('CF-IPCountry') ?: null,
                'total_sessions' => 0,
                'total_page_views' => 0,
                'has_ordered' => false,
            ]);

            $request->attributes->set('analytics_new_visitor_uuid', $uuid);
        }

        $request->attributes->set('analytics_visitor', $visitor);

        return $visitor;
    }

    public function referrerDomain(Request $request): ?string
    {
        $referrer = $request->headers->get('referer');
        if (!$referrer) {
            return null;
        }

        $host = parse_url($referrer, PHP_URL_HOST);

        return $host ?: null;
    }

    private function path(Request $request): string
    {
        return '/' . ltrim($request->path(), '/');
    }
}
